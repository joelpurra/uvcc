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
const arrayNonUniq = require("array-non-uniq");
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
		|| (
			// TODO: treat optionally settable controls separately?
			Array.isArray(control.optional_requests)
			&& control.optional_requests.includes(this._UVCControl.REQUEST.SET_CUR)
		);
	}

	async _mapSupportedControls() {
		const supportedControls = this._camera.supportedControls
			.map((supportedControlName) => this._UVCControl.controls[supportedControlName]);

		const missingControls = supportedControls.filter((control) => !control);

		if (missingControls.length !== 0) {
			throw new Error("Controls were not found: " + missingControls);
		}

		const nonUniqueControls = arrayNonUniq(supportedControls);

		if (nonUniqueControls.length !== 0) {
			throw new Error("Controls were already found: " + nonUniqueControls);
		}

		const mappedControls = supportedControls.map((control) => {
			try {
				const uvccControl = [
					control.name,
					{
						// NOTE: minimal uvcc-specific mapping.
						isGettable: this._isGettableControl(control),
						isRanged: this._isRangedControl(control),
						isSettable: this._isSettableControl(control),
					},
				];

				return uvccControl;
			} catch (error) {
				const wrappedError = new Error("Could not map control: " + control.name + " (" + error + ")");
				wrappedError.innerError = error;

				throw wrappedError;
			}
		});

		const controlsObject = {};

		for (const mappedControl of mappedControls) {
			controlsObject[mappedControl[0]] = mappedControl[1];
		}

		const sortedControls = sortKeys(controlsObject);

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
