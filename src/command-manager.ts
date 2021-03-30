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

import assert from "assert";
import Camera from "uvc-control";

import CameraFactory from "./camera-factory";
import CameraHelperFactory from "./camera-helper-factory";
import CommandHandlers from "./command-handlers";
import Output from "./output";
import {
	RuntimeConfiguration,
} from "./runtime-configurator";
import {
	CommandHandlerArgumentCameraHelper,
	CommandHandlerArgumentTypes,
	CommandHandlerLookup,
} from "./types/command";

export default class CommandManager {
	constructor(private readonly output: Output, private readonly cameraFactory: CameraFactory, private readonly cameraHelperFactory: CameraHelperFactory, private readonly commandHandlers: CommandHandlers) {
		assert.strictEqual(arguments.length, 4);
		assert(typeof this.output === "object");
		assert(typeof this.cameraFactory === "object");
		assert(typeof this.cameraHelperFactory === "object");
		assert(typeof this.commandHandlers === "object");
	}

	async execute(runtimeConfig: Readonly<RuntimeConfiguration>): Promise<void> {
		this.output.verbose("Parsed arguments:", JSON.stringify(runtimeConfig, null, 2));

		const commandName = runtimeConfig.cmd;
		const commandHandlerExists = await this.commandHandlers.has(commandName);

		if (!commandHandlerExists) {
			this.output.error("Unknown command:", commandName);
			return;
		}

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

			assert(typeof vendor === "number");
			assert(typeof product === "number");
			assert(typeof address === "number");

			camera = await this.cameraFactory.get(vendor, product, address);
		}

		try {
			// NOTE HACK: don't mix "injection" with other arguments.
			const argumentValues: CommandHandlerArgumentTypes[] = commandArguments
				.filter((commandArgument) => commandArgument !== CommandHandlerArgumentCameraHelper)
				.map((commandArgument) => (runtimeConfig as CommandHandlerLookup)[commandArgument]);

			// TODO: smarter solution.
			if (commandArguments.includes(CommandHandlerArgumentCameraHelper)) {
				assert(camera !== null);

				const cameraHelper = await this.cameraHelperFactory.get(camera);

				argumentValues.unshift(cameraHelper);
			}

			const output = await this.commandHandlers.execute(commandName, ...argumentValues);

			// NOTE: could separate of types of commands -- those with output, and those without.
			if (typeof output !== "undefined") {
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
