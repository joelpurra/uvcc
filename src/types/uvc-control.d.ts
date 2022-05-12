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

declare module "uvc-control" {
	// TODO: move type declarations to uvc-control.
	import UvcControlModule from "uvc-control";
	import {
		ReadonlyDeep,
	} from "type-fest";

	import {
		usb,
	} from "usb";

	/* eslint-disable @typescript-eslint/member-ordering */
	export default class Camera {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		public static readonly REQUEST: ReadonlyDeep<RequestTypes>;
		public static readonly controls: ReadonlyDeep<CameraControls>;

		public readonly supportedControls: readonly ControlName[];
		public readonly device: usb.Device;

		constructor(options: ConstructorOptions);

		public static discover(): Promise<readonly UvcDevice[]>;

		get(name: ControlName): Promise<ReadonlyDeep<ControlValues>>;
		range(name: ControlName): Promise<ReadonlyDeep<ControlRange>>;
		set(name: ControlName, ...values: readonly ControlValue[]): Promise<readonly number[]>;
		close(): Promise<void>;
	}
	/* eslint-enable @typescript-eslint/member-ordering */

	export type UvcControl = typeof Camera;

	export interface UvcDevice {
		readonly name: string;
		readonly deviceDescriptor: {
			readonly idVendor: number;
			readonly idProduct: number;
		};
		readonly deviceAddress: number;
	}

	export type RequestType = number;

	export interface RequestTypes {
		readonly "GET_CUR": RequestType;
		readonly "GET_MAX": RequestType;
		readonly "GET_MIN": RequestType;
		readonly "SET_CUR": RequestType;
	}

	export interface ConstructorOptions {
		readonly deviceAddress?: number;
		readonly pid?: number;
		readonly vid?: number;
	}

	export interface CameraControl {
		readonly name: ControlName;
		readonly requests: readonly RequestType[];
		readonly optional_requests: readonly RequestType[];
	}

	export type CameraControls = Record<string, CameraControl>;

	export type ControlName = string;
	export type ControlValue = number;
	export type ControlValues = Record<string, ControlValue>;
	export interface ControlRange {
		readonly max: number;
		readonly min: number;
	}
}
