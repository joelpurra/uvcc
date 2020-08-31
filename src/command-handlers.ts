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

import assert = require("assert");

import streamToPromise = require("stream-to-promise");

export default class CommandHandlers {
	constructor(output, uvcDeviceLister) {
		assert.strictEqual(arguments.length, 2);
		assert.strictEqual(typeof output, "object");
		assert.strictEqual(typeof uvcDeviceLister, "object");

		this._output = output;
		this._uvcDeviceLister = uvcDeviceLister;

		// NOTE HACK: magic string hack so the command manager can inject camera helper to command handlers which need it.
		this._injectCameraHelperArgumentName = "cameraHelper";
	}

	async getArguments() {
		return [
			this._injectCameraHelperArgumentName,
			"control",
		];
	}

	async get(cameraHelper, controlName) {
		assert.strictEqual(arguments.length, 2);

		const value = await cameraHelper.getValue(controlName);
		const json = JSON.stringify(value, null, 2);

		this._output.normal(json);
	}

	async rangeArguments() {
		return [
			this._injectCameraHelperArgumentName,
			"control",
		];
	}

	async range(cameraHelper, controlName) {
		assert.strictEqual(arguments.length, 2);

		const range = await cameraHelper.getRange(controlName);
		const json = JSON.stringify(range, null, 2);

		this._output.normal(json);
	}

	async rangesArguments() {
		return [
			this._injectCameraHelperArgumentName,
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
			this._injectCameraHelperArgumentName,
			"control",
			"value",
		];
	}

	async set(cameraHelper, controlName, value) {
		assert.strictEqual(arguments.length, 3);

		return cameraHelper.setValue(controlName, value);
	}

	async exportArguments() {
		return [
			this._injectCameraHelperArgumentName,
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
			this._injectCameraHelperArgumentName,
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
			this._injectCameraHelperArgumentName,
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
}
