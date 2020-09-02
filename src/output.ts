/*
This file is part of uvcc -- USB Video Class (UVC) device configurator.
Copyright (C) 2018, 2019, 2020 Joel Purra <https://joelpurra.com/>

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

export default class Output {
	constructor(public enableVerboseOutput: boolean) {
		assert.strictEqual(arguments.length, 1);
		assert(typeof this.enableVerboseOutput === "boolean");
	}

	normal(...args: readonly unknown[]): void {
		return this.stdout(...args);
	}

	error(...args: readonly unknown[]): void {
		return this.stderr(...args);
	}

	verbose(...args: readonly unknown[]): void {
		if (!this.enableVerboseOutput) {
			return undefined;
		}

		return this.stderr(...args);
	}

	private stdout(...args: readonly unknown[]) {
		// eslint-disable-next-line no-console
		console.log(...args);
	}

	private stderr(...args: readonly unknown[]) {
		// eslint-disable-next-line no-console
		console.error(...args);
	}
}
