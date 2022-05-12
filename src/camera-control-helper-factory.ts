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

import assert from "node:assert";
import {
	ReadonlyDeep,
} from "type-fest";
import Camera, {
	UvcControl,
} from "uvc-control";

import CameraControlHelperClass from "./camera-control-helper.js";

export default class CameraControlHelperFactory {
	constructor(
		// eslint-disable-next-line @typescript-eslint/naming-convention
		private readonly UvcControl: ReadonlyDeep<UvcControl>,
		// eslint-disable-next-line @typescript-eslint/naming-convention
		private readonly CameraControlHelper: typeof CameraControlHelperClass,
	) {
		assert.strictEqual(arguments.length, 2);
		assert(typeof this.UvcControl === "function");
		assert(typeof this.CameraControlHelper === "function");
	}

	async get(camera: ReadonlyDeep<Camera>): Promise<CameraControlHelperClass> {
		assert.strictEqual(arguments.length, 1);
		assert(typeof camera === "object");

		const cameraControlHelper = new this.CameraControlHelper(this.UvcControl, camera);

		return cameraControlHelper;
	}
}
