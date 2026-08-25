/*
This file is part of uvcc -- USB Video Class (UVC) device configurator.
Copyright (C) 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026 Joel Purra <https://joelpurra.com/>

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

import type Camera from "uvc-control";

import type Output from "./output.js";

import assert from "node:assert";

import {
	type ReadonlyDeep,
} from "type-fest";
import {
	type ConstructorOptions,
	type UvcControl,
} from "uvc-control";

import toFormattedHex from "./utilities/to-formatted-hex.js";
import WrappedError from "./utilities/wrapped-error.js";

interface FunctionArguments {
	// eslint-disable-next-line @typescript-eslint/no-restricted-types
	address: number | null;
	// eslint-disable-next-line @typescript-eslint/no-restricted-types
	product: number | null;
	// eslint-disable-next-line @typescript-eslint/no-restricted-types
	vendor: number | null;
}

export default class CameraFactory {
	constructor(
		private readonly output: Output,
		private readonly UvcControl: UvcControl,
	) {
		assert.strictEqual(arguments.length, 2);
		assert.strictEqual(typeof this.UvcControl, "function");
	}

	private createWrappedError(error: ReadonlyDeep<Error>, functionArguments: ReadonlyDeep<FunctionArguments>, constructorOptions: ReadonlyDeep<ConstructorOptions>) {
		let errorMessage = null;

		// NOTE: relies on uvc-control internals.
		// NOTE: may rely on user locale.
		const canGuessThatUvcDeviceWasNotFound = typeof error.name === "string"
			&& error.name === "TypeError"
			&& typeof error.message === "string"
			&& (
				// NOTE: message formatting differs across versions; could use a regular expression instead.
				error.message === "Cannot read property 'interfaces' of undefined"
				|| error.message === "Cannot read properties of undefined (reading 'interfaces')"
			);

		errorMessage = canGuessThatUvcDeviceWasNotFound
			? `Could not find UVC device. Is a compatible camera connected? ${JSON.stringify(functionArguments)}`
			: `Could create uvc-control object: ${JSON.stringify(constructorOptions)}`;

		// eslint-disable-next-line @typescript-eslint/no-base-to-string
		errorMessage += ` (${JSON.stringify(String(error))})`;

		const wrappedError = new WrappedError(error, errorMessage);

		return wrappedError;
	}

	// eslint-disable-next-line @typescript-eslint/no-restricted-types
	async get(vendor: number | null, product: number | null, address: number | null): Promise<Camera> {
		assert.strictEqual(arguments.length, 3);
		assert.ok(vendor === null || (typeof vendor === "number" && vendor >= 0));
		assert.ok(product === null || (typeof product === "number" && product >= 0));
		assert.ok(address === null || (typeof address === "number" && address >= 0));

		const constructorOptions: ConstructorOptions = {
			deviceAddress: address ?? undefined,
			pid: product ?? undefined,
			vid: vendor ?? undefined,
		};

		try {
			const camera = new this.UvcControl(constructorOptions);

			// eslint-disable-next-line @typescript-eslint/no-restricted-types
			const checkCameraPropertyNonNullNonZero = (deviceValue: number, inputValue: number | null, propertyName: string) => {
				if (inputValue !== 0 && inputValue !== null && inputValue !== deviceValue) {
					this.output.warning(`Camera ${propertyName} mismatch.`, "Input", inputValue, `(${
						toFormattedHex(inputValue, 4)
					})`, "Actual", deviceValue, `(${
						toFormattedHex(deviceValue, 4)
					})`);
				}
			};

			checkCameraPropertyNonNullNonZero(camera.device.deviceDescriptor.idVendor, vendor, "vendor id");
			checkCameraPropertyNonNullNonZero(camera.device.deviceDescriptor.idProduct, product, "product id");
			checkCameraPropertyNonNullNonZero(camera.device.deviceAddress, address, "device address");

			return camera;
		} catch (error: unknown) {
			if (error instanceof Error) {
				// NOTE: basically a duplicate of both the arguments to this function and to the uvc-control constructor.
				const functionArguments: FunctionArguments = {
					address,
					product,
					vendor,
				};

				const wrappedError = this.createWrappedError(error, functionArguments, constructorOptions);

				throw wrappedError;
			}

			throw error;
		}
	}
}
