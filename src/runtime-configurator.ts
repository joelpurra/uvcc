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
import fs from "fs";
import {
	join,
} from "path";
import findUp from "find-up";
import yargs, {
	Argv,
} from "yargs";

const getJsonSync = (fileRelativePath: string) => {
	const resolvedPath = join(__dirname, fileRelativePath);

	try {
		// eslint-disable-next-line no-sync
		const json = JSON.parse(fs.readFileSync(resolvedPath).toString());

		return json;
	} catch (error: unknown) {
		throw new Error(`Could not read JSON file ${JSON.stringify(resolvedPath)}: ${JSON.stringify(String(error))}`);
	}
};

export type RuntimeConfiguration = {
	address: number;
	cmd: string;
	control?: string;
	product: number;
	values: readonly number[];
	vendor: number;
	verbose: boolean;
};
export type RuntimeConfigurationKeys = keyof RuntimeConfiguration;
export type RuntimeConfigurationTypes = readonly number[] | number | string | boolean | undefined;

const getYargsArgv = (): Readonly<Argv["argv"]> => {
	const packageJson = getJsonSync("../package.json");
	const appBinaryName = Object.keys(packageJson.bin)[0];
	const appDescription = packageJson.description;
	const {
		homepage,
	} = packageJson;

	assert(typeof appBinaryName === "string");
	assert(typeof homepage === "string");

	const epilogue = `uvcc Copyright © 2018, 2019, 2020 Joel Purra <https://joelpurra.com/>\n\nThis program comes with ABSOLUTELY NO WARRANTY. This is free software, and you are welcome to redistribute it under certain conditions. See GPL-3.0 license for details.\n\nSee also: ${homepage}`;

	let fromImplicitConfigFile = null;

	const hasConfigFlag = process.argv.includes("--config");

	if (hasConfigFlag) {
		fromImplicitConfigFile = {};
	} else {
		const nearestConfigPath = findUp.sync([
			`.${appBinaryName}rc`,
			`.${appBinaryName}rc.json`,
		]);
		const configFromNearestConfigPath = nearestConfigPath ? getJsonSync(nearestConfigPath) : {};

		fromImplicitConfigFile = configFromNearestConfigPath;
	}

	/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
	yargs
		.strict()
		.config(fromImplicitConfigFile)
		.config("config", "Load command arguments from a JSON file.", (argumentConfigPath) => {
			const fromExplicitConfigFile = argumentConfigPath ? getJsonSync(argumentConfigPath) : {};

			return fromExplicitConfigFile;
		})
		.env(appBinaryName.toUpperCase())
		.usage(appDescription)
		.command("get <control>", "Get current control value from the camera.", (yargsToApplyTo) => {
			yargsToApplyTo
				.positional("control", {
					demandOption: true,
					describe: "Name of the control.",
					type: "string",
				});
		})
		.command("set <control> <value1> [value2]", "Set control value(s) on the camera.", (yargsToApplyTo) => {
			yargsToApplyTo
				.positional("control", {
					demandOption: true,
					describe: "Name of the control.",
					type: "string",
				})
				.positional("value1", {
					demandOption: true,
					describe: "Value to set.",
					type: "number",
				})
				.positional("value2", {
					demandOption: false,
					describe: "Second value to set, if supported by the control.",
					type: "number",
				});
		})
		.command("range <control>", "Get possible range (min and max) for a control from the camera.", (yargsToApplyTo) => {
			yargsToApplyTo
				.positional("control", {
					demandOption: true,
					describe: "Name of the control.",
					type: "string",
				});
		})
		.command("ranges", "Get all ranges (min and max) for all available controls from the camera.")
		.command("devices", "List connected UVC devices with name, vendor id (vId), product id (pId), and device address.")
		.command("controls", "List all supported controls.")
		.command("export", "Output configuration in JSON format, on stdout.")
		.command("import", "Input configuration in JSON format, from stdin.")
		.option("vendor", {
			"default": 0,
			describe: "Camera vendor id in hex (0x000) or decimal (0000) format.",
			type: "number",
		})
		.option("product", {
			"default": 0,
			describe: "Camera product id in hex (0x000) or decimal (0000) format.",
			type: "number",
		})
		.option("address", {
			"default": 0,
			describe: "Camera device address in decimal (00) format. Only used for multi-camera setups.",
			type: "number",
		})
		.option("verbose", {
			"default": false,
			describe: "Enable verbose output.",
			type: "boolean",
		})
		.demandCommand(1, 1, "Please provide a single command.", "Please provide a single command.")
		.group(
			[
				"vendor",
				"product",
				"address",
			],
			"Camera selection:")
		.help()
		.example("$0", "--vendor 0x46d --product 0x82d get white_balance_temperature")
		.epilogue(epilogue);
	/* eslint-enable @typescript-eslint/prefer-readonly-parameter-types */

	return yargs.argv;
};

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const mapArgv = (argv: Readonly<Argv["argv"]>): RuntimeConfiguration => {
	// NOTE HACK: workaround yargs not being consistent with yargs.cmd versus yargs._ for defined/non-defined commands.
	const cmd = typeof argv.cmd === "string" ? argv.cmd : (typeof argv._[0] === "string" ? argv._.shift() : null);
	const {
		address,
		control,
		product,
		value1,
		value2,
		vendor,
		verbose,
	} = argv;

	assert(typeof address === "number");
	assert(typeof cmd === "string");
	assert(typeof product === "number");
	assert(typeof vendor === "number");
	assert(typeof verbose === "boolean");

	// NOTE: accept one value if the first is a number, two if both are numbers.
	let values: readonly number[] = [];

	if (typeof value1 === "number") {
		values = typeof value2 === "number" ? [
			value1,
			value2,
		] : [
			value1,
		];
	}

	const mappedArgv: RuntimeConfiguration = {
		address,
		cmd,
		control: typeof control === "string" ? control : undefined,
		product,
		values,
		vendor,
		verbose,
	};

	return mappedArgv;
};

export default function runtimeConfigurator(): RuntimeConfiguration {
	const rawArgv = getYargsArgv();
	const argv = mapArgv(rawArgv);

	return argv;
}
