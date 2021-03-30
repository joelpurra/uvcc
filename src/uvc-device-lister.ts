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
	UvcControl,
} from "uvc-control";

export interface MappedUvcDevice {
	readonly name: string;
	readonly vendor: number;
	readonly product: number;
	readonly address: number;
}

export default class UvcDeviceLister {
	constructor(private readonly UVCControl: Readonly<UvcControl>) {
		assert.strictEqual(arguments.length, 1);
		assert(typeof this.UVCControl === "function");
	}

	async get(): Promise<readonly MappedUvcDevice[]> {
		const devices = await this.UVCControl.discover();
		const output = devices.map((device) =>
			({
				// NOTE: outputting in human-readable "logical" non-alphabetical order.
				name: device.name,
				vendor: device.deviceDescriptor.idVendor,
				// eslint-disable-next-line sort-keys
				product: device.deviceDescriptor.idProduct,
				// eslint-disable-next-line sort-keys
				address: device.deviceAddress,
			}));

		return output;
	}
}
