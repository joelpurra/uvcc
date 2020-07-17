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

module.exports = class CameraFactory {
    constructor(UVCControl) {
        assert.strictEqual(arguments.length, 1);
        assert.strictEqual(typeof UVCControl, "function");

        this._UVCControl = UVCControl;
    }

    async get(vendor, product) {
        // TODO: support dynamic UVC camera lookup by either vendor id/product id/serial number/device address?
        assert.strictEqual(arguments.length, 2);
        assert(vendor === null || (typeof vendor === "number" && vendor >= 0));
        assert(product === null || (typeof product === "number" && product >= 0));

        const constructorOptions = {
            vid: vendor || undefined,
            pid: product || undefined,
            // TODO: support deviceAddress
            deviceAddress: undefined,
        };
        const camera = new this._UVCControl(constructorOptions);

        return camera;
    }
};
