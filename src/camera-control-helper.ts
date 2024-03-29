/*
This file is part of uvcc -- USB Video Class (UVC) device configurator.
Copyright (C) 2018, 2019, 2020, 2021, 2022 Joel Purra <https://joelpurra.com/>

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

import arrayNonUniq from "array-non-uniq";
import filterObject from "filter-obj";
import assert from "node:assert";
import sortKeys from "sort-keys";
import {
	ReadonlyDeep,
} from "type-fest";
import Camera,
{
	CameraControl,
	UvcControl,
} from "uvc-control";

import WrappedError from "./utilities/wrapped-error.js";

interface ControlFlags {
	readonly isGettable: boolean;
	readonly isRanged: boolean;
	readonly isSettable: boolean;
}

type ControlsFlags = Record<string, ControlFlags>;

export default class CameraControlHelper {
	private cachedMappedSupportedControls: ReadonlyDeep<ControlsFlags> | null = null;

	constructor(
		// eslint-disable-next-line @typescript-eslint/naming-convention
		private readonly UvcControl: ReadonlyDeep<UvcControl>,
		private readonly camera: ReadonlyDeep<Camera>,
	) {
		assert.strictEqual(arguments.length, 2);
		assert(typeof this.UvcControl === "function");
		assert(typeof this.camera === "object");
	}

	async getControlNames(): Promise<readonly string[]> {
		const controls = await this.getSupportedControls();

		return Object.keys(controls);
	}

	async getGettableControlNames(): Promise<readonly string[]> {
		const gettableControls = await this.getGettableControls();

		return Object.keys(gettableControls);
	}

	async getRangedControlNames(): Promise<readonly string[]> {
		const rangedControls = await this.getRangedControls();

		return Object.keys(rangedControls);
	}

	async getSettableControlNames(): Promise<readonly string[]> {
		const settableControls = await this.getSettableControls();

		return Object.keys(settableControls);
	}

	private isGettableControl(control: ReadonlyDeep<CameraControl>) {
		// NOTE: relies on uvc-control internals.
		return control.requests.includes(this.UvcControl.REQUEST.GET_CUR);
	}

	private isRangedControl(control: ReadonlyDeep<CameraControl>) {
		// NOTE: relies on uvc-control internals.
		return control.requests.includes(this.UvcControl.REQUEST.GET_MIN)
			&& control.requests.includes(this.UvcControl.REQUEST.GET_MAX);
	}

	private isSettableControl(control: ReadonlyDeep<CameraControl>) {
		// NOTE: relies on uvc-control internals.
		return control.requests.includes(this.UvcControl.REQUEST.SET_CUR)
			|| (
				// TODO: treat optionally settable controls separately?
				Array.isArray(control.optional_requests)
				&& control.optional_requests.includes(this.UvcControl.REQUEST.SET_CUR)
			);
	}

	private async mapSupportedControls() {
		const supportedControls = this.camera.supportedControls
			.map((supportedControlName) => this.UvcControl.controls[supportedControlName])
			// TODO: proper ducktyping function.
			.filter((t): t is CameraControl => Boolean(t));

		const missingControls = supportedControls.filter((control) => !control);

		if (missingControls.length > 0) {
			throw new Error(`Controls were not found: ${JSON.stringify(missingControls)}`);
		}

		const nonUniqueControls = arrayNonUniq(supportedControls);

		if (nonUniqueControls.length > 0) {
			throw new Error(`Controls were already found: ${JSON.stringify(nonUniqueControls)}`);
		}

		const mappedControls = supportedControls.map((control) => {
			try {
				const uvccControl: [string, ControlFlags] = [
					control.name,
					{
						// NOTE: minimal uvcc-specific mapping.
						isGettable: this.isGettableControl(control),
						isRanged: this.isRangedControl(control),
						isSettable: this.isSettableControl(control),
					},
				];

				return uvccControl;
			} catch (error: unknown) {
				if (error instanceof Error) {
					const wrappedError = new WrappedError(error, `Could not map control: ${JSON.stringify(control.name)}`);

					throw wrappedError;
				}

				throw error;
			}
		});

		const controlsObject: ControlsFlags = {};

		for (const mappedControl of mappedControls) {
			controlsObject[mappedControl[0]] = mappedControl[1];
		}

		const sortedControls = sortKeys(controlsObject);

		return sortedControls;
	}

	private async getSupportedControls() {
		if (this.cachedMappedSupportedControls === null) {
			this.cachedMappedSupportedControls = await this.mapSupportedControls();
		}

		return this.cachedMappedSupportedControls;
	}

	private async getGettableControls() {
		const controls = await this.getSupportedControls();

		return filterObject(controls, (_key, control) => control.isGettable);
	}

	private async getRangedControls() {
		const controls = await this.getSupportedControls();

		return filterObject(controls, (_key, control) => control.isRanged);
	}

	private async getSettableControls() {
		const controls = await this.getSupportedControls();

		return filterObject(controls, (_key, control) => control.isSettable);
	}
}
