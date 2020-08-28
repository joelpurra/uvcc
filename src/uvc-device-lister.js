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

const assert = require("assert");

module.exports = class UvcDeviceLister {
	constructor(UVCControl) {
		assert.strictEqual(arguments.length, 1);
		assert.strictEqual(typeof UVCControl, "function");

		this._UVCControl = UVCControl;
	}

	async get() {
		const devices = await this._UVCControl.discover();
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
};
