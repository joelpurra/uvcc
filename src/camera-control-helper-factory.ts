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
import {
	ReadonlyDeep,
} from "type-fest";
import Camera, {
	UvcControl,
} from "uvc-control";

import CameraControlHelperClass from "./camera-control-helper";

export default class CameraControlHelperFactory {
	constructor(private readonly UVCControl: ReadonlyDeep<UvcControl>, private readonly CameraControlHelper: typeof CameraControlHelperClass) {
		assert.strictEqual(arguments.length, 2);
		assert(typeof this.UVCControl === "function");
		assert(typeof this.CameraControlHelper === "function");
	}

	async get(camera: ReadonlyDeep<Camera>): Promise<CameraControlHelperClass> {
		assert.strictEqual(arguments.length, 1);
		assert(typeof camera === "object");

		const cameraControlHelper = new this.CameraControlHelper(this.UVCControl, camera);

		return cameraControlHelper;
	}
}
