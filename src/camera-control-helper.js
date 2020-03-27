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
const filterObj = require("filter-obj");
const mapObj = require("map-obj");
const sortKeys = require("sort-keys");

module.exports = class CameraControlHelper {
    constructor(UVCControl, camera) {
        assert.strictEqual(arguments.length, 2);
        assert.strictEqual(typeof UVCControl, "function");
        assert.strictEqual(typeof camera, "object");

        this._UVCControl = UVCControl;
        this._camera = camera;

        this._cachedMappedSupportedControls = null;
    }

    _isGettableControl(control) {
        // NOTE: relies on uvc-control internals.
        return control.requests.includes(this._UVCControl.REQUEST.GET_CUR);
    }

    _isRangedControl(control) {
        // NOTE: relies on uvc-control internals.
        return control.requests.includes(this._UVCControl.REQUEST.GET_MIN) && control.requests.includes(this._UVCControl.REQUEST.GET_MAX);
    }

    _isSettableControl(control) {
        // NOTE: relies on uvc-control internals.
        return control.requests.includes(this._UVCControl.REQUEST.SET_CUR)
            // TODO: treat optionally settable controls separately?
            || (
                Array.isArray(control.optional_requests)
                && control.optional_requests.includes(this._UVCControl.REQUEST.SET_CUR)
            );
    }

    async _mapSupportedControls() {
        const controls = this._camera.supportedControls
            .map((controlKey) => {
                const control = this._UVCControl.controls[controlKey];

                if (!control) {
                    throw new Error("Could not find control: " + controlKey);
                }

                return control;
            })
            .reduce(
                (obj, control) => {
                    if (obj[control.name]) {
                        throw new Error("Control was already found: " + control.name);
                    }

                    obj[control.name] = control;

                    return obj;
                },
                {}
            );
        const mappedControls = mapObj(controls, (key, control) => {
            try {
                const uvccControl = [
                    key,
                    {
                        // NOTE: minimal uvcc-specific mapping.
                        isGettable: this._isGettableControl(control),
                        isRanged: this._isRangedControl(control),
                        isSettable: this._isSettableControl(control),
                    },
                ];

                return uvccControl;
            }
            catch (error) {
                const wrappedError = new Error("Could not map control: " + key + " (" + error + ")");
                wrappedError.innerError = error;

                throw wrappedError;
            } });
        const sortedControls = sortKeys(mappedControls);

        return sortedControls;
    }

    async _getSupportedControls() {
        if (this._cachedMappedSupportedControls === null) {
            this._cachedMappedSupportedControls = await this._mapSupportedControls();
        }

        return this._cachedMappedSupportedControls;
    }

    async _getGettableControls() {
        const controls = await this._getSupportedControls();

        return filterObj(controls, (_key, control) => control.isGettable);
    }

    async _getRangedControls() {
        const controls = await this._getSupportedControls();

        return filterObj(controls, (_key, control) => control.isRanged);
    }

    async _getSettableControls() {
        const controls = await this._getSupportedControls();

        return filterObj(controls, (_key, control) => control.isSettable);
    }

    async getControlNames() {
        const controls = await this._getSupportedControls();

        return Object.keys(controls);
    }

    async getGettableControlNames() {
        const gettableControls = await this._getGettableControls();

        return Object.keys(gettableControls);
    }

    async getRangedControlNames() {
        const rangedControls = await this._getRangedControls();

        return Object.keys(rangedControls);
    }

    async getSettableControlNames() {
        const settableControls = await this._getSettableControls();

        return Object.keys(settableControls);
    }
};