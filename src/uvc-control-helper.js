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

module.exports = class UVCControlHelper {
    constructor(UVCControl, uvcControlConstants) {
        assert.strictEqual(arguments.length, 2);
        assert.strictEqual(typeof UVCControl, "function");
        assert.strictEqual(typeof uvcControlConstants, "object");

        this._UVCControl = UVCControl;
        this._uvcControlConstants = uvcControlConstants;
    }

    _isGettableControl(control) {
        // NOTE: relies on uvc-control internals.
        return control.requests.includes(this._uvcControlConstants.REQUEST.GET_CUR);
    }

    _isRangedControl(control) {
        // NOTE: relies on uvc-control internals.
        return control.requests.includes(this._uvcControlConstants.REQUEST.GET_MIN) && control.requests.includes(this._uvcControlConstants.REQUEST.GET_MAX);
    }

    _isSettableControl(control) {
        // NOTE: relies on uvc-control internals.
        return control.requests.includes(this._uvcControlConstants.REQUEST.SET_CUR)
            // TODO: treat optionally settable controls separately?
            || (
                Array.isArray(control.optional_requests)
                && control.optional_requests.includes(this._uvcControlConstants.REQUEST.SET_CUR)
            );
    }

    async _getControls() {
        const controls = this._UVCControl.controls;
        const mappedControls = mapObj(controls, (key, control) => [
            key,
            {
                // NOTE: minimal uvcc-specific mapping.
                isGettable: this._isGettableControl(control),
                isRanged: this._isRangedControl(control),
                isSettable: this._isSettableControl(control),
            },
        ]);
        const sortedControls = sortKeys(mappedControls);

        return sortedControls;
    }

    async _getGettableControls() {
        const controls = await this._getControls();

        return filterObj(controls, (_key, control) => control.isGettable);
    }

    async _getRangedControls() {
        const controls = await this._getControls();

        return filterObj(controls, (_key, control) => control.isRanged);
    }

    async _getSettableControls() {
        const controls = await this._getControls();

        return filterObj(controls, (_key, control) => control.isSettable);
    }

    async getControlNames() {
        const controls = await this._getControls();

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
