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

const assert = require("assert");
const Promise = require("bluebird");

module.exports = class CommandManager {
    constructor(output, cameraFactory, cameraHelperFactory, commandHandlers) {
        assert.strictEqual(arguments.length, 4);
        assert.strictEqual(typeof output, "object");
        assert.strictEqual(typeof cameraFactory, "object");
        assert.strictEqual(typeof cameraHelperFactory, "object");
        assert.strictEqual(typeof commandHandlers, "object");

        this._output = output;
        this._cameraFactory = cameraFactory;
        this._cameraHelperFactory = cameraHelperFactory;
        this._commandHandlers = commandHandlers;

        this._injectCameraHelperArgumentName = "cameraHelper";
    }

    async _commandHandlerExists(name) {
        return (typeof this._commandHandlers[name] === "function");
    }

    async _getCommandArguments(name) {
        return this._commandHandlers[`${name}Arguments`]();
    }

    async _getCommandHandler(name) {
        return this._commandHandlers[name].bind(this._commandHandlers);
    }

    async execute(runtimeConfig) {
        this._output.verbose("Parsed arguments:", JSON.stringify(runtimeConfig, null, 2));

        const commandName = runtimeConfig.cmd;

        const commandHandlerExists = await this._commandHandlerExists(commandName);

        if (!commandHandlerExists) {
            this._output.error("Unknown command:", commandName);
            return;
        }

        const commandArguments = await this._getCommandArguments(commandName);
        const commandHandler = await this._getCommandHandler(commandName);

        const argumentValues = commandArguments.reduce(
            (args, arg) => {
                // NOTE HACK: don't mix "injection" with other arguments.
                if (arg === this._injectCameraHelperArgumentName) {
                    return args;
                }

                return args.concat(runtimeConfig[arg]);
            },
            []
        );

        // TODO: create function to get/close camera, create camera helper.
        let camera = null;

        const closeCamera = async() => {
            if (camera) {
                // TODO: avoid hard-coded delay.
                await Promise.delay(1000);

                await camera.close();
            }
        };

        // TODO: smarter solution.
        if (commandArguments.includes(this._injectCameraHelperArgumentName)) {
            camera = await this._cameraFactory.get(runtimeConfig.vendor, runtimeConfig.product, runtimeConfig.address);
        }

        try {
            // TODO: smarter solution.
            if (commandArguments.includes(this._injectCameraHelperArgumentName)) {
                const cameraHelper = await this._cameraHelperFactory.get(camera);

                argumentValues.unshift(cameraHelper);
            }

            await commandHandler(...argumentValues);

            await closeCamera();
        } catch (error) {
            try {
                await closeCamera();
            } catch (ignoredError) {
                // NOTE: ignore errors when closing the camera connection.
            }

            throw error;
        }
    }
};
