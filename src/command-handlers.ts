/*
This file is part of uvcc -- USB Video Class (UVC) device configurator.
Copyright (C) 2018 Joel Purra <https://joelpurra.com/>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

import assert from "assert";
import streamToPromise from "stream-to-promise";
import {
	ControlName,
	ControlValue,
} from "uvc-control";
import CameraHelper from "./camera-helper";
import Output from "./output";
import {
	CommandHandlerArgumentCameraHelper,
	CommandHandlerArgumentNames,
} from "./runtime-configurator";
import UvcDeviceLister from "./uvc-device-lister";

export default class CommandHandlers {
	// NOTE: the command manager does dynamic command handler mapping.
	// eslint-disable-next-line @typescript-eslint/ban-types
	[x: string]: Function | unknown;

	constructor(private readonly output: Output, private readonly uvcDeviceLister: UvcDeviceLister) {
		assert.strictEqual(arguments.length, 2);
		assert(typeof this.output === "object");
		assert(typeof this.uvcDeviceLister === "object");
	}

	async getArguments(): Promise<CommandHandlerArgumentNames[]> {
		return [
			CommandHandlerArgumentCameraHelper,
			"control",
		];
	}

	async get(cameraHelper: Readonly<CameraHelper>, controlName: ControlName): Promise<void> {
		assert.strictEqual(arguments.length, 2);

		const value = await cameraHelper.getValue(controlName);
		const json = JSON.stringify(value, null, 2);

		this.output.normal(json);
	}

	async rangeArguments(): Promise<CommandHandlerArgumentNames[]> {
		return [
			CommandHandlerArgumentCameraHelper,
			"control",
		];
	}

	async range(cameraHelper: Readonly<CameraHelper>, controlName: ControlName): Promise<void> {
		assert.strictEqual(arguments.length, 2);

		const range = await cameraHelper.getRange(controlName);
		const json = JSON.stringify(range, null, 2);

		this.output.normal(json);
	}

	async rangesArguments(): Promise<CommandHandlerArgumentNames[]> {
		return [
			CommandHandlerArgumentCameraHelper,
		];
	}

	async ranges(cameraHelper: Readonly<CameraHelper>): Promise<void> {
		assert.strictEqual(arguments.length, 1);

		const ranges = await cameraHelper.getRanges();
		const json = JSON.stringify(ranges, null, 2);

		this.output.normal(json);
	}

	async setArguments(): Promise<CommandHandlerArgumentNames[]> {
		return [
			CommandHandlerArgumentCameraHelper,
			"control",
			"value",
		];
	}

	async set(cameraHelper: Readonly<CameraHelper>, controlName: ControlName, value: ControlValue): Promise<void> {
		assert.strictEqual(arguments.length, 3);

		return cameraHelper.setValue(controlName, value);
	}

	async exportArguments(): Promise<CommandHandlerArgumentNames[]> {
		return [
			CommandHandlerArgumentCameraHelper,
		];
	}

	async export(cameraHelper: Readonly<CameraHelper>): Promise<void> {
		assert.strictEqual(arguments.length, 1);

		// NOTE: exporting un-settable values breaks imports because of strict settable value checks.
		// TODO: export also un-settable values with --all flag?
		const values = await cameraHelper.getSettableValues();
		const json = JSON.stringify(values, null, 2);

		this.output.normal(json);
	}

	async importArguments(): Promise<CommandHandlerArgumentNames[]> {
		return [
			CommandHandlerArgumentCameraHelper,
		];
	}

	async import(cameraHelper: Readonly<CameraHelper>): Promise<void> {
		assert.strictEqual(arguments.length, 1);

		const values = await streamToPromise(process.stdin)
			.then((buffer) => JSON.parse(buffer.toString()));

		await cameraHelper.setValues(values);
	}

	async controlsArguments(): Promise<CommandHandlerArgumentNames[]> {
		return [
			CommandHandlerArgumentCameraHelper,
		];
	}

	async controls(cameraHelper: Readonly<CameraHelper>): Promise<void> {
		assert.strictEqual(arguments.length, 1);

		const controlNames = await cameraHelper.getControlNames();
		const json = JSON.stringify(controlNames, null, 2);

		this.output.normal(json);
	}

	async devicesArguments(): Promise<CommandHandlerArgumentNames[]> {
		return [];
	}

	async devices(): Promise<void> {
		assert.strictEqual(arguments.length, 0);

		const devices = await this.uvcDeviceLister.get();
		const json = JSON.stringify(devices, null, 2);

		this.output.normal(json);
	}
}
