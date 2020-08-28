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

const assert = require('assert');

module.exports = class Output {
	constructor(verbose) {
		assert.strictEqual(arguments.length, 1);
		assert.strictEqual(typeof verbose, 'boolean');

		this._verbose = verbose;
	}

	_stdout(...args) {
		/* eslint-disable no-console */
		console.log(...args);
		/* eslint-enable no-console */
	}

	_stderr(...args) {
		/* eslint-disable no-console */
		console.error(...args);
		/* eslint-enable no-console */
	}

	normal(...args) {
		return this._stdout(...args);
	}

	error(...args) {
		return this._stderr(...args);
	}

	verbose(...args) {
		if (!this._verbose) {
			return undefined;
		}

		return this._stderr(...args);
	}
};
