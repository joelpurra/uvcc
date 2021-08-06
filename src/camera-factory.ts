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
import Camera, {
	ConstructorOptions,
	UvcControl,
} from "uvc-control";

import Output from "./output.js";
import toFormattedHex from "./utilities/to-formatted-hex.js";
import WrappedError from "./utilities/wrapped-error.js";

interface GetFunctionArguments {
	address: number | null;
	product: number | null;
	vendor: number | null;
}

export default class CameraFactory {
	constructor(private readonly output: Output, private readonly UVCControl: UvcControl) {
		assert.strictEqual(arguments.length, 2);
		assert(typeof this.UVCControl === "function");
	}

	async get(vendor: number | null, product: number | null, address: number | null): Promise<Camera> {
		assert.strictEqual(arguments.length, 3);
		assert(vendor === null || (typeof vendor === "number" && vendor >= 0));
		assert(product === null || (typeof product === "number" && product >= 0));
		assert(address === null || (typeof address === "number" && address >= 0));

		const constructorOptions: ConstructorOptions = {
			// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
			deviceAddress: address || undefined,
			// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
			pid: product || undefined,
			// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
			vid: vendor || undefined,
		};

		try {
			const camera = new this.UVCControl(constructorOptions);

			if (vendor && vendor !== camera.device.deviceDescriptor.idVendor) {
				this.output.warning("Camera vendor id mismatch.", "Input", vendor, `(${toFormattedHex(vendor, 4)})`, "Actual", camera.device.deviceDescriptor.idVendor, `(${toFormattedHex(camera.device.deviceDescriptor.idVendor, 4)})`);
			}

			if (product && product !== camera.device.deviceDescriptor.idProduct) {
				this.output.warning("Camera product id mismatch.", "Input", product, `(${toFormattedHex(product, 4)})`, "Actual", camera.device.deviceDescriptor.idProduct, `(${toFormattedHex(camera.device.deviceDescriptor.idProduct, 4)})`);
			}

			if (address && address !== camera.device.deviceAddress) {
				this.output.warning("Camera device address mismatch.", "Input", address, `(${toFormattedHex(address, 1)})`, "Actual", camera.device.deviceAddress, `(${toFormattedHex(camera.device.deviceAddress, 1)})`);
			}

			return camera;
		} catch (error: unknown) {
			if (error instanceof Error) {
			// NOTE: basically a duplicate of both the arguments to this function and to the uvc-control constructor.
				const getFunctionArguments: GetFunctionArguments = {
					address,
					product,
					vendor,
				};

				const wrappedError = this.createWrappedError(error, getFunctionArguments, constructorOptions);

				throw wrappedError;
			}

			throw error;
		}
	}

	private createWrappedError(error: ReadonlyDeep<Error>, getFunctionArguments: ReadonlyDeep<GetFunctionArguments>, constructorOptions: ReadonlyDeep<ConstructorOptions>) {
		let errorMessage = null;

		// NOTE: relies on uvc-control internals.
		// NOTE: may rely on user locale.
		const guessThatUVCDeviceWasNotFound = typeof error.name === "string"
			&& error.name === "TypeError"
			&& typeof error.message === "string"
			&& error.message === "Cannot read property 'interfaces' of undefined";

		errorMessage = guessThatUVCDeviceWasNotFound ? `Could not find UVC device. Is a compatible camera connected? ${JSON.stringify(getFunctionArguments)}` : `Could create uvc-control object: ${JSON.stringify(constructorOptions)}`;

		errorMessage += ` (${JSON.stringify(String(error))})`;

		const wrappedError = new WrappedError(error, errorMessage);

		return wrappedError;
	}
}
