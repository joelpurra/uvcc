/*
This file is part of uvcc -- USB Video Class (UVC) device configurator.
Copyright (C) 2018, 2019, 2020, 2021 Joel Purra <https://joelpurra.com/>

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
import Bluebird from "bluebird";
import streamToPromise from "stream-to-promise";

import CameraHelper from "../camera-helper";
import {
	Command,
	CommandHandlerArgumentCameraHelper,
	CommandHandlerArgumentNames,
} from "../types/command";
import isUvccControls from "../utilities/is-uvcc-controls";

export default class ImportCommand implements Command {
	constructor() {
		assert.strictEqual(arguments.length, 0);
	}

	async getArguments(): Promise<CommandHandlerArgumentNames[]> {
		return [
			CommandHandlerArgumentCameraHelper,
		];
	}

	async execute(...args: readonly unknown[]): Promise<void> {
		assert.strictEqual(arguments.length, 1);

		const cameraHelper = args[0] as Readonly<CameraHelper>;

		const stdinTimeout = 1000;

		const controlValues = await Bluebird.try(async () => {
			const buffer = await streamToPromise(process.stdin);
			const json = JSON.parse(buffer.toString()) as unknown;

			assert(typeof json === "object");
			assert(json !== null);

			return json;
		})
			.timeout(stdinTimeout, `Could not read uvcc configuration from stdin within the ${stdinTimeout} millisecond timeout. Was any data piped in?`)
			.tapCatch((error) => {
				process.stdin.destroy(error);
			});

		assert(isUvccControls(controlValues));

		return cameraHelper.setControls(controlValues);
	}
}
