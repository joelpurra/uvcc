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

const streamToPromise = require("stream-to-promise");

module.exports = class CommandHandlers {
    constructor(output, uvcDeviceLister) {
        assert.strictEqual(arguments.length, 2);
        assert.strictEqual(typeof output, "object");
        assert.strictEqual(typeof uvcDeviceLister, "object");

        this._output = output;
        this._uvcDeviceLister = uvcDeviceLister;
    }

    async getArguments() {
        return [
            "cameraHelper",
            "name",
        ];
    }

    async get(cameraHelper, name) {
        assert.strictEqual(arguments.length, 2);

        const value = await cameraHelper.getValue(name);
        const json = JSON.stringify(value, null, 2);

        this._output.normal(json);
    }

    async rangeArguments() {
        return [
            "cameraHelper",
            "name",
        ];
    }

    async range(cameraHelper, name) {
        assert.strictEqual(arguments.length, 2);

        const range = await cameraHelper.getRange(name);
        const json = JSON.stringify(range, null, 2);

        this._output.normal(json);
    }

    async rangesArguments() {
        return [
            "cameraHelper",
        ];
    }

    async ranges(cameraHelper) {
        assert.strictEqual(arguments.length, 1);

        const ranges = await cameraHelper.getRanges();
        const json = JSON.stringify(ranges, null, 2);

        this._output.normal(json);
    }

    async setArguments() {
        return [
            "cameraHelper",
            "name",
            "value",
        ];
    }

    async set(cameraHelper, name, value) {
        assert.strictEqual(arguments.length, 3);

        return cameraHelper.setValue(name, value);
    }

    async exportArguments() {
        return [
            "cameraHelper",
        ];
    }

    async export(cameraHelper) {
        assert.strictEqual(arguments.length, 1);

        // NOTE: exporting un-settable values breaks imports because of strict settable value checks.
        // TODO: export also un-settable values with --all flag?
        const values = await cameraHelper.getSettableValues();
        const json = JSON.stringify(values, null, 2);

        this._output.normal(json);
    }

    async importArguments() {
        return [
            "cameraHelper",
        ];
    }

    async import(cameraHelper) {
        assert.strictEqual(arguments.length, 1);

        const values = await streamToPromise(process.stdin)
            .then((buffer) => JSON.parse(buffer.toString()));

        await cameraHelper.setValues(values);
    }

    async controlsArguments() {
        return [
            "cameraHelper",
        ];
    }

    async controls(cameraHelper) {
        assert.strictEqual(arguments.length, 1);

        const controlNames = await cameraHelper.getControlNames();
        const json = JSON.stringify(controlNames, null, 2);

        this._output.normal(json);
    }

    async devicesArguments() {
        return [];
    }

    async devices() {
        assert.strictEqual(arguments.length, 0);

        const devices = await this._uvcDeviceLister.get();
        const json = JSON.stringify(devices, null, 2);

        this._output.normal(json);
    }
};
