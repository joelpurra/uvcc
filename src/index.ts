#!/usr/bin/env node
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

import engineCheck = require("engine-check");

import runtimeConfigurator = require("./runtime-configurator");

// https://github.com/makenai/node-uvc-control
import UVCControl = require("uvc-control");

import CameraControlHelper = require("./camera-control-helper");
import CameraControlHelperFactory = require("./camera-control-helper-factory");
import CameraFactory = require("./camera-factory");
import CameraHelper = require("./camera-helper");
import CameraHelperFactory = require("./camera-helper-factory");
import CommandHandlers = require("./command-handlers");
import CommandManager = require("./command-manager");
import Output = require("./output");
import UvcDeviceLister = require("./uvc-device-lister");

const mainAsync = async () => {
	try {
		// NOTE: ignoring unhandled rejections and exceptions, as there is (practically) nothing to gracefully shut down.
		const runtimeConfig = runtimeConfigurator();
		const output = new Output(runtimeConfig.verbose);

		process.on("unhandledRejection", (...args) => output.error(...args));
		process.on("uncaughtException", (...args) => output.error(...args));

		const cameraFactory = new CameraFactory(UVCControl);
		const cameraControlHelperFactory = new CameraControlHelperFactory(UVCControl, CameraControlHelper);
		const cameraHelperFactory = new CameraHelperFactory(output, cameraControlHelperFactory, CameraHelper);
		const uvcDeviceLister = new UvcDeviceLister(UVCControl);
		const commandHandlers = new CommandHandlers(output, uvcDeviceLister);
		const commandManager = new CommandManager(output, cameraFactory, cameraHelperFactory, commandHandlers);

		await commandManager.execute(runtimeConfig);
	} catch (error) {
		// NOTE: root error handler for asynchronous errors.
		// eslint-disable-next-line no-console
		console.error(error);

		process.exitCode = 1;
	}
};

const main = () => {
	try {
		engineCheck();

		void mainAsync();
	} catch (error) {
		// NOTE: root error handler for synchronous errors.
		// eslint-disable-next-line no-console
		console.error(error);

		process.exitCode = 1;
	}
};

main();
