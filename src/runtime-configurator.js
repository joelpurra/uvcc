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

const fs = require("fs");

const findUp = require("find-up");
const yargs = require("yargs");

const packageJson = require("../package.json");

const getJSON = (path) => {
    try {
        /* eslint-disable no-sync */
        const json = JSON.parse(fs.readFileSync(path));
        /* eslint-enable no-sync */

        return json;
    } catch (error) {
        throw new Error(`Could not read JSON file '${path}': ${error}`);
    }
};

const demandVendorProductOptions = (yargsToApplyTo) => {
    return yargsToApplyTo.demandOption(
        [
            "vendor",
            "product",
        ],
        "Please provide both vendor and product arguments for your webcam."
    );
};

module.exports = () => {
    // NOTE: defaults taken from node-uvc-control.
    // https://github.com/makenai/node-uvc-control/blob/0b90c78e99ee889cb84e477ab67207c8a9474e6f/index.js#L7-L8
    const UVC_INPUT_TERMINAL_ID = 0x01;
    const UVC_PROCESSING_UNIT_ID = 0x03;

    const applicationBinaryName = Object.keys(packageJson.bin)[0];
    const additionalNotes = "Numbers may be supplied in hexadecimal (0x000) or decimal (0000) format.";
    const applicationDescription = packageJson.description + "\n\n" + additionalNotes;
    const homepage = packageJson.homepage;

    const epilogue = `uvcc Copyright © 2018 Joel Purra <https://joelpurra.com/>\n\nThis program comes with ABSOLUTELY NO WARRANTY. This is free software, and you are welcome to redistribute it under certain conditions. See GPL-3.0 license for details.\n\nSee also: ${homepage}`;

    let fromImplicitConfigFile = null;

    const hasConfigFlag = process.argv.includes("--config");

    if (!hasConfigFlag) {
        const nearestConfigPath = findUp.sync([
            `.${applicationBinaryName}rc`,
            `.${applicationBinaryName}rc.json`,
        ]);
        const configFromNearestConfigPath = nearestConfigPath ? getJSON(nearestConfigPath) : {};

        fromImplicitConfigFile = configFromNearestConfigPath;
    } else {
        fromImplicitConfigFile = {};
    }

    yargs
        .strict()
        .config(fromImplicitConfigFile)
        .config("config", "Load command arguments from a JSON file.", (argumentConfigPath) => {
            const fromExplicitConfigFile = argumentConfigPath ? getJSON(argumentConfigPath) : {};

            return fromExplicitConfigFile;
        })
        .env(applicationBinaryName.toUpperCase())
        .usage(applicationDescription)
        .command("get <name>", "Get current control value from the webcam.", (yargsToApplyTo) => {
            demandVendorProductOptions(yargsToApplyTo)
                .positional("name", {
                    type: "string",
                    demandOption: true,
                    describe: "Name of the control.",
                });
        })
        .command("set <name> <value>", "Set control value on the webcam.", (yargsToApplyTo) => {
            demandVendorProductOptions(yargsToApplyTo)
                .positional("name", {
                    type: "string",
                    demandOption: true,
                    describe: "Name of the control.",
                })
                .positional("value", {
                    type: "string",
                    demandOption: true,
                    describe: "Value to set.",
                });
        })
        .command("range <name>", "Get possible range (min and max) for a control from the webcam.", (yargsToApplyTo) => {
            demandVendorProductOptions(yargsToApplyTo)
                .positional("name", {
                    type: "string",
                    demandOption: true,
                    describe: "Name of the control.",
                });
        })
        .command("ranges", "Get all ranges (min and max) for all available controls from the webcam.", (yargsToApplyTo) => demandVendorProductOptions(yargsToApplyTo))
        .command("devices", "List connected USB devices with vendor id (vId) and product id (pId).")
        .command("controls", "List all supported controls.", (yargsToApplyTo) => demandVendorProductOptions(yargsToApplyTo))
        .command("export", "Output configuration in JSON format, on stdout.", (yargsToApplyTo) => demandVendorProductOptions(yargsToApplyTo))
        .command("import", "Input configuration in JSON format, from stdin.", (yargsToApplyTo) => demandVendorProductOptions(yargsToApplyTo))
        .option("vendor", {
            type: "number",
            describe: "Webcam vendor id.",
        })
        .option("product", {
            type: "number",
            describe: "Webcam product id.",
        })
        .group(
            [
                "vendor",
                "product",
            ],
            "Webcam selection:"
        )
        .option("input-terminal", {
            type: "number",
            describe: "The webcam's input terminal id.",
            default: UVC_INPUT_TERMINAL_ID
        })
        .option("processing-unit", {
            type: "number",
            describe: "The webcam's processing unit id.",
            default: UVC_PROCESSING_UNIT_ID
        })
        .group(
            [
                "input-terminal",
                "processing-unit",
            ],
            "Advanced:"
        )
        .option("verbose", {
            type: "boolean",
            default: false,
            describe: "Enable verbose output.",
        })
        .demandCommand(1, 1, "Please provide a single command.", "Please provide a single command.")
        .help()
        .example("$0 --vendor 0x46d --product 0x82d get whiteBalanceTemperature")
        .epilogue(epilogue);

    const argv = yargs.argv;

    // NOTE HACK: workaround yargs not being consistend with yargs.cmd versus yargs._ for defined/non-defined commands.
    if (typeof argv.cmd !== "string") {
        argv.cmd = argv._.shift();
    }

    return argv;
};
