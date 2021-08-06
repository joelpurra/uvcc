#!/usr/bin/env node
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

import engineCheck from "engine-check";
import {
	dirname,
	join,
} from "node:path";
import process from "node:process";
import {
	fileURLToPath,
} from "node:url";
import UVCControl from "uvc-control";

import CameraControlHelper from "./camera-control-helper.js";
import CameraControlHelperFactory from "./camera-control-helper-factory.js";
import CameraFactory from "./camera-factory.js";
import CameraHelper from "./camera-helper.js";
import CameraHelperFactory from "./camera-helper-factory.js";
import CommandHandlers from "./command-handlers.js";
import ControlsCommand from "./command-handlers/controls.js";
import DevicesCommand from "./command-handlers/devices.js";
import ExportCommand from "./command-handlers/export.js";
import GetCommand from "./command-handlers/get.js";
import ImportCommand from "./command-handlers/import.js";
import RangeCommand from "./command-handlers/range.js";
import RangesCommand from "./command-handlers/ranges.js";
import SetCommand from "./command-handlers/set.js";
import CommandManager from "./command-manager.js";
import Output from "./output.js";
import runtimeConfigurator from "./runtime-configurator.js";
import {
	Commands,
} from "./types/command.js";
import UvcDeviceLister from "./uvc-device-lister.js";

// TODO: load package.json at compile time, use process.cwd() for resolving other paths.
const __dirname = dirname(fileURLToPath(import.meta.url));

const mainAsync = async () => {
	try {
		// NOTE: ignoring unhandled rejections and exceptions, as there is (practically) nothing to gracefully shut down.
		const runtimeConfig = await runtimeConfigurator();
		const output = new Output(runtimeConfig.verbose);

		process.on("unhandledRejection", (...args: readonly unknown[]) => {
			output.error(...args);

			process.exitCode = 1;
		});
		process.on("uncaughtException", (...args: readonly unknown[]) => {
			output.error(...args);

			process.exitCode = 1;
		});

		const cameraFactory = new CameraFactory(output, UVCControl);
		const cameraControlHelperFactory = new CameraControlHelperFactory(UVCControl, CameraControlHelper);
		const cameraHelperFactory = new CameraHelperFactory(output, cameraControlHelperFactory, CameraHelper);
		const uvcDeviceLister = new UvcDeviceLister(UVCControl);
		const commands: Commands = {
			controls: new ControlsCommand(),
			devices: new DevicesCommand(uvcDeviceLister),
			"export": new ExportCommand(),
			get: new GetCommand(),
			"import": new ImportCommand(),
			range: new RangeCommand(),
			ranges: new RangesCommand(),
			set: new SetCommand(),
		};
		const commandHandlers = new CommandHandlers(output, commands);
		const commandManager = new CommandManager(output, cameraFactory, cameraHelperFactory, commandHandlers);

		await commandManager.execute(runtimeConfig);
	} catch (error: unknown) {
		// NOTE: root error handler for asynchronous errors.
		// eslint-disable-next-line no-console
		console.error(error);

		process.exitCode = 1;
	}
};

const main = () => {
	try {
		engineCheck({
			searchRoot: join(__dirname, ".."),
		});

		void mainAsync();
	} catch (error: unknown) {
		// NOTE: root error handler for synchronous errors.
		// eslint-disable-next-line no-console
		console.error(error);

		process.exitCode = 1;
	}
};

main();
