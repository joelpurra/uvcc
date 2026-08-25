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

import type Output from "./output.js";

import assert from "node:assert";

import {
	type ReadonlyDeep,
} from "type-fest";

import {
	type CommandHandlerArgumentNames,
	type CommandName,
	type Commands,
} from "./types/command.js";

export default class CommandHandlers {
	constructor(private readonly output: Output, private readonly commands: ReadonlyDeep<Commands>) {
		assert.strictEqual(arguments.length, 2);
		assert.strictEqual(typeof this.output, "object");
		assert.strictEqual(typeof this.commands, "object");
	}

	async has(commandName: CommandName): Promise<boolean> {
		assert.strictEqual(arguments.length, 1);
		assert.strictEqual(typeof commandName, "string");

		const command = this.commands[commandName];

		return Boolean(command);
	}

	async execute(commandName: CommandName, ...args: readonly unknown[]): Promise<unknown> {
		assert.strictEqual(typeof commandName, "string");
		assert.ok(Array.isArray(args));

		const command = this.commands[commandName];

		// eslint-disable-next-line node-test/prefer-equality-assertion
		assert.ok(typeof command === "object");

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const output = await command.execute(...args);

		return output;
	}

	async getArguments(commandName: CommandName): Promise<CommandHandlerArgumentNames[]> {
		assert.strictEqual(arguments.length, 1);
		assert.strictEqual(typeof commandName, "string");

		const command = this.commands[commandName];

		// eslint-disable-next-line node-test/prefer-equality-assertion
		assert.ok(typeof command === "object");

		return command.getArguments();
	}
}
