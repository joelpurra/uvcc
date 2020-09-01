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
import Bluebird from "bluebird";
import Camera, {
	ControlName,
	ControlRange,
	ControlValue,
} from "uvc-control";

import CameraControlHelper from "./camera-control-helper";
import Output from "./output";

export type ControlValues = Record<string, ControlValue>;
export type ControlRanges = Record<string, ControlRange>;

export default class CameraHelper {
	constructor(private readonly output: Readonly<Output>, private readonly cameraControlHelper: Readonly<CameraControlHelper>, private readonly camera: Readonly<Camera>) {
		assert.strictEqual(arguments.length, 3);
		assert(typeof this.output === "object");
		assert(typeof this.cameraControlHelper === "object");
		assert(typeof this.camera === "object");
	}

	async getValue(controlName: ControlName): Promise<ControlValue> {
		const gettableControlNames = await this.cameraControlHelper.getGettableControlNames();

		if (!gettableControlNames.includes(controlName)) {
			throw new Error(`Could not find a gettable control named ${JSON.stringify(controlName)}.`);
		}

		const valueObject = await this.camera.get(controlName);
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

	async getRange(controlName: ControlName): Promise<Readonly<ControlRange>> {
		const rangedControlNames = await this.cameraControlHelper.getRangedControlNames();

		if (!rangedControlNames.includes(controlName)) {
			throw new Error(`Could not find a ranged control named ${JSON.stringify(controlName)}.`);
		}

		return this.camera.range(controlName);
	}

	async setValue(controlName: ControlName, value: ControlValue): Promise<void> {
		const settableControlNames = await this.cameraControlHelper.getSettableControlNames();

		if (!settableControlNames.includes(controlName)) {
			throw new Error(`Could not find a settable control named ${JSON.stringify(controlName)}.`);
		}

		await this.camera.set(controlName, value);

		return undefined;
	}

	async getControlNames(): Promise<readonly ControlName[]> {
		return this.cameraControlHelper.getControlNames();
	}

	async getRanges(): Promise<Readonly<ControlRanges>> {
		return Bluebird.reduce(
			this.cameraControlHelper.getRangedControlNames(),
			// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
			async (object, controlName) => {
				try {
					object[controlName] = await this.getRange(controlName);
				} catch (error) {
					// TODO: ignore only specific errors, such as usb.LIBUSB_TRANSFER_STALL?
					this.output.verbose("Error getting range, ignoring.", controlName, error);
				}

				return object;
			},
			{} as ControlRanges,
		);
	}

	async getValues(): Promise<Readonly<ControlValues>> {
		return Bluebird.reduce(
			this.cameraControlHelper.getControlNames(),
			// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
			async (object, controlName) => {
				try {
					object[controlName] = await this.getValue(controlName);
				} catch (error) {
					// TODO: ignore only specific errors, such as usb.LIBUSB_TRANSFER_STALL?
					this.output.verbose("Error getting value, ignoring.", controlName, error);
				}

				return object;
			},
			{} as ControlValues,
		);
	}

	async getSettableValues(): Promise<Readonly<ControlValues>> {
		return Bluebird.reduce(
			this.cameraControlHelper.getSettableControlNames(),
			// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
			async (object, controlName) => {
				try {
					object[controlName] = await this.getValue(controlName);
				} catch (error) {
					// TODO: ignore only specific errors, such as usb.LIBUSB_TRANSFER_STALL?
					this.output.verbose("Error getting settable value, ignoring.", controlName, error);
				}

				return object;
			},
			{} as ControlValues,
		);
	}

	async setValues(configuration: Readonly<ControlValues>): Promise<void> {
		const controlNames = Object.keys(configuration);
		const settableControlNames = await this.cameraControlHelper.getSettableControlNames();

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
					this.output.verbose("Error setting value, ignoring.", controlName, value, error);
				}
			},
		);
	}
}
