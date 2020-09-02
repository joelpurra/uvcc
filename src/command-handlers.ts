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

import Output from "./output";
import {
	CommandHandlerArgumentNames,
	CommandName, Commands,
} from "./types/command";

export default class CommandHandlers {
	constructor(private readonly output: Output, private readonly commands: Readonly<Commands>) {
		assert.strictEqual(arguments.length, 2);
		assert(typeof this.output === "object");
		assert(typeof this.commands === "object");
	}

	async has(commandName: CommandName): Promise<boolean> {
		assert.strictEqual(arguments.length, 1);
		assert(typeof commandName === "string");

		const command = this.commands[commandName];

		return Boolean(command);
	}

	async execute(commandName: CommandName, ...args: readonly unknown[]): Promise<unknown> {
		assert(typeof commandName === "string");
		assert(Array.isArray(args));

		const command = this.commands[commandName];

		assert(typeof command === "object");

		const output = await command.execute(...args);

		return output;
	}

	async getArguments(commandName: CommandName): Promise<CommandHandlerArgumentNames[]> {
		assert.strictEqual(arguments.length, 1);
		assert(typeof commandName === "string");

		const command = this.commands[commandName];

		assert(typeof command === "object");

		return command.getArguments();
	}
}
