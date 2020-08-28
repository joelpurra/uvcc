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

const fs = require('fs');

const findUp = require('find-up');
const yargs = require('yargs');

const packageJson = require('../package.json');

const getJSON = path => {
	try {
		const json = JSON.parse(fs.readFileSync(path));

		return json;
	} catch (error) {
		throw new Error(`Could not read JSON file '${path}': ${error}`);
	}
};

module.exports = () => {
	const appBinaryName = Object.keys(packageJson.bin)[0];
	const appDescription = packageJson.description;
	const {homepage} = packageJson;

	const epilogue = `uvcc Copyright © 2018 Joel Purra <https://joelpurra.com/>\n\nThis program comes with ABSOLUTELY NO WARRANTY. This is free software, and you are welcome to redistribute it under certain conditions. See GPL-3.0 license for details.\n\nSee also: ${homepage}`;

	let fromImplicitConfigFile = null;

	const hasConfigFlag = process.argv.includes('--config');

	if (hasConfigFlag) {
		fromImplicitConfigFile = {};
	} else {
		const nearestConfigPath = findUp.sync([
			`.${appBinaryName}rc`,
			`.${appBinaryName}rc.json`
		]);
		const configFromNearestConfigPath = nearestConfigPath ? getJSON(nearestConfigPath) : {};

		fromImplicitConfigFile = configFromNearestConfigPath;
	}

	yargs
		.strict()
		.config(fromImplicitConfigFile)
		.config('config', 'Load command arguments from a JSON file.', argumentConfigPath => {
			const fromExplicitConfigFile = argumentConfigPath ? getJSON(argumentConfigPath) : {};

			return fromExplicitConfigFile;
		})
		.env(appBinaryName.toUpperCase())
		.usage(appDescription)
		.command('get <name>', 'Get current control value from the camera.', yargsToApplyTo => {
			yargsToApplyTo
				.positional('name', {
					type: 'string',
					demandOption: true,
					describe: 'Name of the control.'
				});
		})
		.command('set <name> <value>', 'Set control value on the camera.', yargsToApplyTo => {
			yargsToApplyTo
				.positional('name', {
					type: 'string',
					demandOption: true,
					describe: 'Name of the control.'
				})
				.positional('value', {
					type: 'string',
					demandOption: true,
					describe: 'Value to set.'
				});
		})
		.command('range <name>', 'Get possible range (min and max) for a control from the camera.', yargsToApplyTo => {
			yargsToApplyTo
				.positional('name', {
					type: 'string',
					demandOption: true,
					describe: 'Name of the control.'
				});
		})
		.command('ranges', 'Get all ranges (min and max) for all available controls from the camera.')
		.command('devices', 'List connected UVC devices with name, vendor id (vId), product id (pId), and device address.')
		.command('controls', 'List all supported controls.')
		.command('export', 'Output configuration in JSON format, on stdout.')
		.command('import', 'Input configuration in JSON format, from stdin.')
		.option('vendor', {
			type: 'number',
			default: 0,
			describe: 'Camera vendor id in hex (0x000) or decimal (0000) format.'
		})
		.option('product', {
			type: 'number',
			default: 0,
			describe: 'Camera product id in hex (0x000) or decimal (0000) format.'
		})
		.option('address', {
			type: 'number',
			default: 0,
			describe: 'Camera device address in decimal (00) format. Only used for multi-camera setups.'
		})
		.option('verbose', {
			type: 'boolean',
			default: false,
			describe: 'Enable verbose output.'
		})
		.demandCommand(1, 1, 'Please provide a single command.', 'Please provide a single command.')
		.group(
			[
				'vendor',
				'product',
				'address'
			],
			'Camera selection:'
		)
		.help()
		.example('$0 --vendor 0x46d --product 0x82d get white_balance_temperature')
		.epilogue(epilogue);

	const {argv} = yargs;

	// NOTE HACK: workaround yargs not being consistend with yargs.cmd versus yargs._ for defined/non-defined commands.
	if (typeof argv.cmd !== 'string') {
		argv.cmd = argv._.shift();
	}

	return argv;
};
