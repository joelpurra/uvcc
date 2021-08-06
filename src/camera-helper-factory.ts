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

import assert from "node:assert";
import {
	ReadonlyDeep,
} from "type-fest";
import Camera from "uvc-control";

import CameraControlHelperFactory from "./camera-control-helper-factory.js";
import CameraHelperClass from "./camera-helper.js";
import Output from "./output.js";

export default class CameraHelperFactory {
	constructor(private readonly output: ReadonlyDeep<Output>, private readonly cameraControlHelperFactory: ReadonlyDeep<CameraControlHelperFactory>, private readonly CameraHelper: typeof CameraHelperClass) {
		assert.strictEqual(arguments.length, 3);
		assert(typeof this.output === "object");
		assert(typeof this.cameraControlHelperFactory === "object");
		assert(typeof this.CameraHelper === "function");
	}

	async get(camera: ReadonlyDeep<Camera>): Promise<CameraHelperClass> {
		assert.strictEqual(arguments.length, 1);
		assert(typeof camera === "object");

		const cameraControlHelper = await this.cameraControlHelperFactory.get(camera);
		const cameraHelper = new this.CameraHelper(this.output, cameraControlHelper, camera);

		return cameraHelper;
	}
}
