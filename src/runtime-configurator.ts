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

import chalk from "chalk";
import {
	findUpSync,
} from "find-up";
import assert from "node:assert";
import fs from "node:fs";
import {
	dirname,
	join,
} from "node:path";
import process from "node:process";
import {
	fileURLToPath,
} from "node:url";
import {
	readPackageUp,
} from "read-pkg-up";
import {
	JsonValue,
	ReadonlyDeep,
} from "type-fest";
import yargs, {
	Argv,
} from "yargs";

// TODO: load package.json at compile time, use process.cwd() for resolving other paths.
const __dirname = dirname(fileURLToPath(import.meta.url));

const getJsonSync = (fileRelativePath: string): JsonValue => {
	const resolvedPath = join(__dirname, fileRelativePath);

	try {
		// eslint-disable-next-line no-sync
		const json = JSON.parse(fs.readFileSync(resolvedPath).toString()) as JsonValue;

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

const getYargsArgv = async (): Promise<ReadonlyDeep<Argv["argv"]>> => {
	const packageJsonResult = await readPackageUp({
		cwd: __dirname,
	});

	assert(typeof packageJsonResult !== "undefined");

	const {
		bin,
		description,
		homepage,
		version,
	} = packageJsonResult.packageJson;

	assert(typeof bin === "object");
	assert(typeof description === "string");
	assert(typeof homepage === "string");
	assert(!version.startsWith("v"));

	const appBinaryName = Object.keys(bin)[0];

	assert(typeof appBinaryName === "string");

	const epilogue = chalk.dim`uvcc Copyright © 2018, 2019, 2020, 2021, 2022 Joel Purra <https://joelpurra.com/>\n\nThis program comes with ABSOLUTELY NO WARRANTY. This is free software, and you are welcome to redistribute it under certain conditions. See GPL-3.0 license for details.\n\nSee also: ${homepage}`;

	let fromImplicitConfigFile = null;

	const hasConfigFlag = process.argv.includes("--config");

	if (hasConfigFlag) {
		fromImplicitConfigFile = {};
	} else {
		const nearestConfigPath = findUpSync([
			`.${appBinaryName}rc`,
			`.${appBinaryName}rc.json`,
		]);
		const configFromNearestConfigPath = nearestConfigPath ? getJsonSync(nearestConfigPath) : {};

		fromImplicitConfigFile = configFromNearestConfigPath;

		assert(typeof fromImplicitConfigFile === "object");
		assert(fromImplicitConfigFile !== null);
	}

	const parserRoot: Argv = yargs(process.argv.slice(2));

	/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
	const parser = parserRoot
		.strict()
		.wrap(parserRoot.terminalWidth())
		.config(fromImplicitConfigFile)
		.config("config", "Load command arguments from a JSON file.", (argumentConfigPath) => {
			const fromExplicitConfigFile = argumentConfigPath ? getJsonSync(argumentConfigPath) : {};

			assert(typeof fromExplicitConfigFile === "object");
			assert(fromExplicitConfigFile !== null);

			return fromExplicitConfigFile;
		})
		.env(appBinaryName.toUpperCase())
		.version(`v${version}`)
		.usage(`${chalk.bold("$0")}: ${description}`)
		.command("get <control>", "Get current control value.", (yargsToApplyTo) => {
			yargsToApplyTo
				.positional("control", {
					demandOption: true,
					describe: "Name of the control.",
					type: "string",
				});
		})
		.command("set <control> <value1> [value2]", "Set control value(s).", (yargsToApplyTo) => {
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
		.command("range <control>", "Get possible range (min and max) for a control.", (yargsToApplyTo) => {
			yargsToApplyTo
				.positional("control", {
					demandOption: true,
					describe: "Name of the control.",
					type: "string",
				});
		})
		.command("ranges", "Get all ranges (min and max).")
		.command("devices", "List connected UVC devices.")
		.command("controls", "List all supported controls for the camera.")
		.command("export", "Output configuration in JSON format, on stdout.")
		.command("import", "Input configuration in JSON format, from stdin.")
		.option("vendor", {
			"default": 0,
			describe: "Camera vendor id (vId).",
			type: "number",
		})
		.option("product", {
			"default": 0,
			describe: "Camera product id (pId).",
			type: "number",
		})
		.option("address", {
			"default": 0,
			describe: "Camera device address.",
			type: "number",
		})
		.option("verbose", {
			"default": false,
			describe: "Enable verbose output.",
			type: "boolean",
		})
		.demandCommand(1, 1, chalk.red("Please provide a single command."), chalk.red("Please provide a single command."))
		.group(
			[
				"vendor",
				"product",
				"address",
			],
			chalk.bold("Device selection for multi-camera setups.") + "\n  " + chalk.dim("Numbers in hex (0x000) or decimal (0000) format."))
		.help()
		.example("", "")
		.example(chalk.bold("Basic usage:"), "")
		.example("$0 controls", "Available controls for the camera.")
		.example("$0 set auto_white_balance_temperature 0", "Turn off automatic color correction.")
		.example("$0 set saturation 64", "Low color saturation (near grayscale).")
		.example("$0 ranges", "List possible control ranges.")
		.example("$0 set absolute_zoom 200", "Zoom in.")
		.example("", "")
		.example(chalk.bold("Automate config:"), "")
		.example(chalk.dim("- Not all controls can be imported."), "")
		.example(chalk.dim("- Control order matters."), "")
		.example("$0 export > my-uvcc-export.json", "Save to file.")
		.example("cat my-uvcc-export.json | $0 import", "Load from file.")
		.example("", "")
		.example(chalk.bold("Target a specific device:"), "")
		.example(chalk.dim("- Only useful for multi-camera setups."), "")
		.example(chalk.dim("- For same-model cameras, also specify address."), "")
		.example(chalk.dim("- Alt. use system USB settings to find devices."), "")
		.example("$0 devices", "List available cameras.")
		.example("sudo $0 devices", "Avoid LIBUSB_ERROR_ACCESS.")
		.example("$0 --vendor 0x46d --product 0x82d export", "")
		.epilogue(epilogue);
	/* eslint-enable @typescript-eslint/prefer-readonly-parameter-types */

	return parser.parseAsync();
};

const mapArgv = async (argv: ReadonlyDeep<Argv["argv"]>): Promise<RuntimeConfiguration> => {
	// NOTE HACK: workaround yargs not being consistent with yargs.cmd versus yargs._ for defined/non-defined commands.
	const cmd = "cmd" in argv && typeof argv["cmd"] === "string"
		? argv["cmd"]
		: (
			"_" in argv && typeof argv._[0] === "string"
				? argv._[0]
				: null
		);

	const {
		address,
		control,
		product,
		value1,
		value2,
		vendor,
		verbose,
	} = argv as Record<string, unknown>;

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

export default async function runtimeConfigurator(): Promise<RuntimeConfiguration> {
	const rawArgv = await getYargsArgv();
	const argv = await mapArgv(rawArgv);

	return argv;
}
