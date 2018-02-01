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

const {
    fork,
} = require("child_process");

// NOTE: using external code to avoid directly depending on the "usb" package.
const usbDeviceListerPath = "./node_modules/uvc-control/list-devices.js";

module.exports = class UsbDeviceLister {
    constructor() {
        assert.strictEqual(arguments.length, 0);
    }

    async logToConsole() {
        // TODO: await process.
        // TODO: verify that the process dies.
        fork(usbDeviceListerPath);
    }
};
