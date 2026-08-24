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

import type Camera from "uvc-control";

import type CameraFactory from "./camera-factory.js";
import type CameraHelperFactory from "./camera-helper-factory.js";
import type CommandHandlers from "./command-handlers.js";
import type Output from "./output.js";

import assert from "node:assert";

import {
	type ReadonlyDeep,
} from "type-fest";

import {
	type RuntimeConfiguration,
} from "./runtime-configurator.js";
import {
	CommandHandlerArgumentCameraHelper,
	type CommandHandlerArgumentTypes,
	type CommandHandlerLookup,
} from "./types/command.js";

export default class CommandManager {
	constructor(
		private readonly output: Output,
		private readonly cameraFactory: CameraFactory,
		private readonly cameraHelperFactory: CameraHelperFactory,
		private readonly commandHandlers: CommandHandlers,
	) {
		assert.strictEqual(arguments.length, 4);
		assert.strictEqual(typeof this.output, "object");
		assert.strictEqual(typeof this.cameraFactory, "object");
		assert.strictEqual(typeof this.cameraHelperFactory, "object");
		assert.strictEqual(typeof this.commandHandlers, "object");
	}

	async execute(runtimeConfig: ReadonlyDeep<RuntimeConfiguration>): Promise<void> {
		this.output.verbose("Parsed arguments:", JSON.stringify(runtimeConfig, null, 2));

		const commandName = runtimeConfig.cmd;
		const hasCommandHandler = await this.commandHandlers.has(commandName);

		if (!hasCommandHandler) {
			this.output.error("Unknown command:", commandName);
			return;
		}

		// eslint-disable-next-line @typescript-eslint/no-restricted-types
		let camera: Camera | null = null;

		const closeCamera = async () => {
			if (camera) {
				await camera.close();
			}
		};

		const commandArguments = await this.commandHandlers.getArguments(commandName);

		// TODO: smarter solution.
		if (commandArguments.includes(CommandHandlerArgumentCameraHelper)) {
			const {
				vendor,
				product,
				address,
			} = runtimeConfig;

			assert.strictEqual(typeof vendor, "number");
			assert.strictEqual(typeof product, "number");
			assert.strictEqual(typeof address, "number");

			camera = await this.cameraFactory.get(vendor, product, address);
		}

		try {
			// NOTE HACK: don't mix "injection" with other arguments.
			const argumentValues: CommandHandlerArgumentTypes[] = commandArguments
				.filter((commandArgument) => commandArgument !== CommandHandlerArgumentCameraHelper)
				.map((commandArgument) => (runtimeConfig as CommandHandlerLookup)[commandArgument]);

			// TODO: smarter solution.
			if (commandArguments.includes(CommandHandlerArgumentCameraHelper)) {
				// eslint-disable-next-line node-test/prefer-equality-assertion
				assert.ok(camera !== null);

				const cameraHelper = await this.cameraHelperFactory.get(camera);

				argumentValues.unshift(cameraHelper);
			}

			const output = await this.commandHandlers.execute(commandName, ...argumentValues);

			// NOTE: could separate of types of commands -- those with output, and those without.
			if (output !== undefined) {
				const json = JSON.stringify(output, null, 2);

				this.output.normal(json);
			}

			await closeCamera();
		} catch (error: unknown) {
			try {
				await closeCamera();
			} catch {
				// NOTE: if there were previous errors, ignore errors when closing the camera connection.
			}

			throw error;
		}
	}
}
