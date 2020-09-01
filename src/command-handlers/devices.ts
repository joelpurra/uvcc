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

import assert from "assert";

import {
	Command,
	CommandHandlerArgumentNames,
} from "../types/command";
import UvcDeviceLister from "../uvc-device-lister";

export default class DevicesCommand implements Command {
	constructor(private readonly uvcDeviceLister: UvcDeviceLister) {
		assert.strictEqual(arguments.length, 1);
		assert(typeof this.uvcDeviceLister === "object");
	}

	async getArguments(): Promise<CommandHandlerArgumentNames[]> {
		return [];
	}

	async execute(): Promise<unknown> {
		assert.strictEqual(arguments.length, 0);

		const devices = await this.uvcDeviceLister.get();

		return devices;
	}
}
