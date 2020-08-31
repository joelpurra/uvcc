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

import assert = require("assert");
import Bluebird = require("bluebird");

export default class CameraHelper {
	constructor(output, cameraControlHelper, camera) {
		assert.strictEqual(arguments.length, 3);
		assert.strictEqual(typeof output, "object");
		assert.strictEqual(typeof cameraControlHelper, "object");
		assert.strictEqual(typeof camera, "object");

		this._output = output;
		this._cameraControlHelper = cameraControlHelper;
		this._camera = camera;
	}

	async getValue(controlName) {
		const gettableControlNames = await this._cameraControlHelper.getGettableControlNames();

		if (!gettableControlNames.includes(controlName)) {
			throw new Error(`Could not find a gettable control named ${JSON.stringify(controlName)}.`);
		}

		const valueObject = await this._camera.get(controlName);
		const values = Object.values(valueObject);
		let value;

		if (values.length === 1) {
			value = values[0];
		} else {
			// NOTE: presumably the same order has to be used when setting values later.
			value = values;
		}

		return value;
	}

	async getRange(controlName) {
		const rangedControlNames = await this._cameraControlHelper.getRangedControlNames();

		if (!rangedControlNames.includes(controlName)) {
			throw new Error(`Could not find a ranged control named ${JSON.stringify(controlName)}.`);
		}

		return this._camera.range(controlName);
	}

	async setValue(controlName, value) {
		const settableControlNames = await this._cameraControlHelper.getSettableControlNames();

		if (!settableControlNames.includes(controlName)) {
			throw new Error(`Could not find a settable control named ${JSON.stringify(controlName)}.`);
		}

		return this._camera.set(controlName, value);
	}

	async getControlNames() {
		return this._cameraControlHelper.getControlNames();
	}

	async getRanges() {
		return Bluebird.reduce(
			this._cameraControlHelper.getRangedControlNames(),
			async (object, controlName) => {
				try {
					object[controlName] = await this.getRange(controlName);
				} catch (error) {
					// TODO: ignore only specific errors, such as usb.LIBUSB_TRANSFER_STALL?
					this._output.verbose("Error getting range, ignoring.", controlName, error);
				}

				return object;
			},
			{},
		);
	}

	async getValues() {
		return Bluebird.reduce(
			this._cameraControlHelper.getControlNames(),
			async (object, controlName) => {
				try {
					object[controlName] = await this.getValue(controlName);
				} catch (error) {
					// TODO: ignore only specific errors, such as usb.LIBUSB_TRANSFER_STALL?
					this._output.verbose("Error getting value, ignoring.", controlName, error);
				}

				return object;
			},
			{},
		);
	}

	async getSettableValues() {
		return Bluebird.reduce(
			this._cameraControlHelper.getSettableControlNames(),
			async (object, controlName) => {
				try {
					object[controlName] = await this.getValue(controlName);
				} catch (error) {
					// TODO: ignore only specific errors, such as usb.LIBUSB_TRANSFER_STALL?
					this._output.verbose("Error getting settable value, ignoring.", controlName, error);
				}

				return object;
			},
			{},
		);
	}

	async setValues(configuration) {
		const controlNames = Object.keys(configuration);
		const settableControlNames = await this._cameraControlHelper.getSettableControlNames();

		// NOTE: checking all control names before attempting to set any.
		const nonSettableNames = controlNames.filter((controlName) => !settableControlNames.includes(controlName));

		if (nonSettableNames.length !== 0) {
			throw new Error(`Could not find a settable controls, aborting setting values: ${JSON.stringify(nonSettableNames)}`);
		}

		await Bluebird.map(
			// eslint-disable-next-line unicorn/no-fn-reference-in-iterator
			controlNames,
			async (controlName) => {
				const value = configuration[controlName];

				try {
					await this.setValue(controlName, value);
				} catch (error) {
					// TODO: ignore only specific errors, such as usb.LIBUSB_TRANSFER_STALL?
					this._output.verbose("Error setting value, ignoring.", controlName, value, error);
				}
			},
		);
	}
}
