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

const runtimeConfigurator = require("./src/runtime-configurator");

// https://github.com/makenai/node-uvc-control
const UVCControl = require("uvc-control");

const Output = require("./src/output");
const CameraFactory = require("./src/camera-factory");
const CameraHelper = require("./src/camera-helper");
const CameraHelperFactory = require("./src/camera-helper-factory");
const UsbDeviceLister = require("./src/usb-device-lister");
const CommandHandlers = require("./src/command-handlers");
const CommandManager = require("./src/command-manager");

const main = async() => {
    try {
        // NOTE: ignoring unhandled rejections and exceptions, as there is (practically) nothing to gracefully shut down.
        const runtimeConfig = runtimeConfigurator();
        const output = new Output(runtimeConfig.verbose);

        process.on("unhandledRejection", (...args) => output.verbose(...args));
        process.on("unhandledException", (...args) => output.verbose(...args));

        const cameraFactory = new CameraFactory(UVCControl);
        const cameraHelperFactory = new CameraHelperFactory(output, CameraHelper, UVCControl);
        const usbDeviceLister = new UsbDeviceLister();
        const commandHandlers = new CommandHandlers(output, usbDeviceLister);
        const commandManager = new CommandManager(output, cameraFactory, cameraHelperFactory, commandHandlers);

        await commandManager.execute(runtimeConfig);
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */

        throw error;
    }
};

main();
