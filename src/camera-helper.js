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

module.exports = class CameraHelper {
    constructor(output, camera, availableControls) {
        assert.strictEqual(arguments.length, 3);
        assert.strictEqual(typeof output, "object");
        assert.strictEqual(typeof camera, "object");
        assert(Array.isArray(availableControls));

        this._output = output;
        this._camera = camera;
        this._availableControls = availableControls;

        this._cameraGetValue = Promise.promisify(this._camera.get, {
            context: camera,
        });

        this._cameraSetValue = Promise.promisify(this._camera.set, {
            context: camera,
        });

        this._cameraGetRange = Promise.promisify(this._camera.range, {
            context: camera,
        });
    }

    async availableControls() {
        return this._availableControls.concat();
    }

    async getRange(name) {
        return this._cameraGetRange(name);
    }

    async getValue(name) {
        return this._cameraGetValue(name);
    }

    async setValue(name, value) {
        return this._cameraSetValue(name, value);
    }

    async getRanges() {
        return Promise.reduce(
            this._availableControls,
            (obj, name) => this.getRange(name)
                .then((range) => {
                    obj[name] = range;

                    return obj;
                })
                .catch((error) => {
                    this._output.verbose("Error getting range, ignoring.", name, error);

                    return obj;
                }),
            {}
        );
    }

    async getValues() {
        return Promise.reduce(
            this._availableControls,
            (obj, name) => this.getValue(name)
                .then((value) => {
                    obj[name] = value;

                    return obj;
                })
                .catch((error) => {
                    this._output.verbose("Error getting value, ignoring.", name, error);

                    return obj;
                }),
            {}
        );
    }

    async setValues(configuration) {
        const keys = Object.keys(configuration);

        return Promise.map(
            keys,
            (name) => {
                const value = configuration[name];

                return this.setValue(name, value)
                    .catch((error) => {
                        this._output.verbose("Error setting value, ignoring.", name, value, error);

                        return undefined;
                    });
            }
        );
    }
};
