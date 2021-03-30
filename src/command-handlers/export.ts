/*
This file is part of uvcc -- USB Video Class (UVC) device configurator.
Copyright (C) 2018, 2019, 2020 Joel Purra <https://joelpurra.com/>

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
import mapObj from "map-obj";

import CameraHelper from "../camera-helper";
import {
	Command,
	CommandHandlerArgumentCameraHelper,
	CommandHandlerArgumentNames,
} from "../types/command";
import {
	UvccControls,
} from "../types/controls";
import flattenControlValues from "../utilities/flatten-control-values";

export default class ExportCommand implements Command {
	constructor() {
		assert.strictEqual(arguments.length, 0);
	}

	async getArguments(): Promise<CommandHandlerArgumentNames[]> {
		return [
			CommandHandlerArgumentCameraHelper,
		];
	}

	async execute(...args: readonly unknown[]): Promise<Readonly<UvccControls>> {
		assert.strictEqual(arguments.length, 1);

		const cameraHelper = args[0] as Readonly<CameraHelper>;

		// NOTE: exporting un-settable values breaks imports because of strict settable value checks.
		// TODO: export also un-settable values with --all flag?
		const settableControls = await cameraHelper.getSettableControls();
		const values = mapObj(
			settableControls,
			(
				settableControlName,
				// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
				settableControlValue,
			) => [
				settableControlName,
				flattenControlValues(settableControlValue),
			],
		);

		return values;
	}
}
