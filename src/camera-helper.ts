/*
This file is part of uvcc -- USB Video Class (UVC) device configurator.
Copyright (C) 2018, 2019, 2020, 2021, 2022 Joel Purra <https://joelpurra.com/>

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

import Bluebird from "bluebird";
import assert from "node:assert";
import {
	ReadonlyDeep,
} from "type-fest";
import Camera, {
	ControlName,
	ControlRange,
	ControlValue,
	ControlValues,
} from "uvc-control";

import CameraControlHelper from "./camera-control-helper.js";
import Output from "./output.js";
import {
	UvccControls,
} from "./types/controls.js";
import isUvccControlValue from "./utilities/is-uvcc-control-value.js";

export type ControlsValues = Record<string, ControlValues>;
export type ControlRanges = Record<string, ControlRange>;

export default class CameraHelper {
	constructor(private readonly output: ReadonlyDeep<Output>, private readonly cameraControlHelper: ReadonlyDeep<CameraControlHelper>, private readonly camera: ReadonlyDeep<Camera>) {
		assert.strictEqual(arguments.length, 3);
		assert(typeof this.output === "object");
		assert(typeof this.cameraControlHelper === "object");
		assert(typeof this.camera === "object");
	}

	async getValues(controlName: ControlName): Promise<ReadonlyDeep<ControlValues>> {
		const gettableControlNames = await this.cameraControlHelper.getGettableControlNames();

		if (!gettableControlNames.includes(controlName)) {
			throw new Error(`Could not find a gettable control named ${JSON.stringify(controlName)}.`);
		}

		const valueObject = await this.camera.get(controlName);

		return valueObject;
	}

	async getRange(controlName: ControlName): Promise<ReadonlyDeep<ControlRange>> {
		const rangedControlNames = await this.cameraControlHelper.getRangedControlNames();

		if (!rangedControlNames.includes(controlName)) {
			throw new Error(`Could not find a ranged control named ${JSON.stringify(controlName)}.`);
		}

		const range = this.camera.range(controlName);

		return range;
	}

	async setValues(controlName: ControlName, values: readonly ControlValue[]): Promise<void> {
		const settableControlNames = await this.cameraControlHelper.getSettableControlNames();

		if (!settableControlNames.includes(controlName)) {
			throw new Error(`Could not find a settable control named ${JSON.stringify(controlName)}.`);
		}

		await this.camera.set(controlName, ...values);

		return undefined;
	}

	async getControlNames(): Promise<readonly ControlName[]> {
		return this.cameraControlHelper.getControlNames();
	}

	async getRanges(): Promise<ReadonlyDeep<ControlRanges>> {
		// TODO: replace with Object.fromEntries(...);
		return Bluebird.reduce(
			this.cameraControlHelper.getRangedControlNames(),
			// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
			async (object, controlName) => {
				try {
					object[controlName] = await this.getRange(controlName);
				} catch (error: unknown) {
					// TODO: ignore only specific errors, such as usb.LIBUSB_TRANSFER_STALL?
					this.output.verbose("Error getting range, ignoring.", controlName, error);
				}

				return object;
			},
			{} as ControlRanges,
		);
	}

	async getSettableControls(): Promise<ReadonlyDeep<ControlsValues>> {
		// TODO: replace with Object.fromEntries(...);
		return Bluebird.reduce(
			this.cameraControlHelper.getSettableControlNames(),
			// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
			async (object, controlName) => {
				try {
					object[controlName] = await this.getValues(controlName);
				} catch (error: unknown) {
					// TODO: ignore only specific errors, such as usb.LIBUSB_TRANSFER_STALL?
					this.output.verbose("Error getting settable value, ignoring.", controlName, error);
				}

				return object;
			},
			{} as ControlsValues,
		);
	}

	async setControls(configuration: ReadonlyDeep<UvccControls>): Promise<void> {
		const controlNames = Object.keys(configuration);
		const settableControlNames = await this.cameraControlHelper.getSettableControlNames();

		// NOTE: checking all control names before attempting to set any.
		const nonSettableNames = controlNames.filter((controlName) => !settableControlNames.includes(controlName));

		if (nonSettableNames.length > 0) {
			throw new Error(`Could not find a settable controls, aborting setting values: ${JSON.stringify(nonSettableNames)}`);
		}

		await Bluebird.map(
			controlNames,
			// eslint-disable-next-line unicorn/no-array-method-this-argument
			async (controlName) => {
				const controlValues = configuration[controlName];

				if (!isUvccControlValue(controlValues)) {
					throw new TypeError(`Expected number value for configuration ${controlName}, got ${typeof controlValues} ${JSON.stringify(controlValues)}.`);
				}

				// eslint-disable-next-line unicorn/prefer-spread
				const controlValuesArray = new Array<number>().concat(controlValues);

				try {
					await this.setValues(controlName, controlValuesArray);
				} catch (error: unknown) {
					// TODO: ignore only specific errors, such as usb.LIBUSB_TRANSFER_STALL?
					this.output.verbose("Error setting value, ignoring.", controlName, controlValues, error);
				}
			},
		);
	}
}
