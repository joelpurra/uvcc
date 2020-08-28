# [USB Video Class (UVC) device configurator](https://joelpurra.com/projects/uvcc/) (`uvcc`)

Configure [USB Video Class](https://en.wikipedia.org/wiki/USB_video_device_class) (UVC) compliant devices from the command line.

[UVC-compliant devices](https://en.wikipedia.org/wiki/List_of_USB_video_class_devices) include webcams, digital camcorders, transcoders, analog video converters and still-image cameras.

## Features

Use `uvcc` to **fine-tune camera configuration**, such as brightness, contrast, saturation, gain, white balance/color temperature, zoom. **Export/import of JSON** makes it easy to reliably and repeatedly configure one or more cameras for various situations.

- Get configuration directly from the camera.
- Set configuration values directly on the camera.
- List available UVC cameras.
- List available camera controls.
- Export configuration to JSON.
- Import configuration from JSON.
- Per-user or per-directory configuration files.
- See details of [available controls](https://github.com/makenai/node-uvc-control#currently-supported-controls) from the upstream project [uvc-control](https://github.com/makenai/node-uvc-control#currently-supported-controls).

## Installation

Requires [Node.js](https://nodejs.org/) (`node` and `npm` commands). Published on npm as [`uvcc`](https://www.npmjs.com/package/uvcc).

```shell
npm install --global uvcc
```

- Optionally omit the `--global` flag and use `./node_modules/.bin/uvcc` from the install directory.
- Uses [`libusb`](http://libusb.info/) through the [npm package `usb`](https://www.npmjs.com/package/usb).

## Usage

By default, one of the detected UVC devices will be used, usually the first. See [configuration](#configuration) to target a specific camera.

```shell
# Export current configuration. You can save it to a file, modify, and import later.
uvcc export

# Turn off automatic white balance to manually set the white balance.
uvcc set auto_white_balance_temperature 0

# Set the white balance temperature to 2000.
# NOTE: the white_balance_temperature range for Logitech C920 is 2000-6500.
uvcc set white_balance_temperature 2000

# Set the contrast to 192.
# NOTE: the contrast range for Logitech C920 is 0-255, default value 128.
uvcc set contrast 192
```

### Help

```shell
uvcc --help
```

```text
USB Video Class (UVC) device configurator. Used for webcams, camcorders,
etcetera.

Commands:
  uvcc get <name>          Get current control value from the camera.
  uvcc set <name> <value>  Set control value on the camera.
  uvcc range <name>        Get possible range (min and max) for a control from
                           the camera.
  uvcc ranges              Get all ranges (min and max) for all available
                           controls from the camera.
  uvcc devices             List connected UVC devices with name, vendor id
                           (vId), product id (pId), and device address.
  uvcc controls            List all supported controls.
  uvcc export              Output configuration in JSON format, on stdout.
  uvcc import              Input configuration in JSON format, from stdin.

Camera selection:
  --vendor   Camera vendor id in hex (0x000) or decimal (0000) format.
                                                           [number] [default: 0]
  --product  Camera product id in hex (0x000) or decimal (0000) format.
                                                           [number] [default: 0]
  --address  Camera device address in decimal (00) format. Only used for
             multi-camera setups.                          [number] [default: 0]

Options:
  --version  Show version number                                       [boolean]
  --config   Load command arguments from a JSON file.
  --verbose  Enable verbose output.                   [boolean] [default: false]
  --help     Show help                                                 [boolean]

Examples:
  uvcc --vendor 0x46d --product 0x82d get white_balance_temperature

uvcc Copyright © 2018 Joel Purra <https://joelpurra.com/>

This program comes with ABSOLUTELY NO WARRANTY. This is free software, and you
are welcome to redistribute it under certain conditions. See GPL-3.0 license for
details.

See also: https://joelpurra.com/projects/uvcc/
```

## Configuration

The command line arguments can optionally be provided using environment variables, implicit per-user/per-directory configuration files, or explicitly loaded from JSON files.

### Command line

```shell
# Find your UVC device, note the vendor id (vId) and product id (pId).
# The ids can be in hexadecimal (0x000) or decimal (0000) format.
# Example:
# - The vendor is Logitech (hexadecimal 0x46d, or decimal 1133).
# - The product is C920 HD Pro Webcam (hexadecimal 0x82d, or decimal 2093).
# NOTE: listing USB devices might require root (sudo) on some systems.
uvcc devices

# Use the vendor id and product id to export current configuration.
uvcc --vendor 0x46d --product 0x82d export
```

### Environment variables

Set `UVCC_<argument name>`.

```shell
UVCC_VERBOSE=true uvcc controls
```

### Configuration file format

Configuration files for `uvcc` are in JSON format. If you configure the same camera each time, it is convenient to put `vendor` and `product` in the configuration file.

```json
{
  "vendor": 1133,
  "product": 2093
}
```

### Implicit configuration file

You can put any command line arguments as properties in a JSON file called either `.uvccrc` or `.uvccrc.json`. The file is loaded from the same directory as `uvcc` is executed in, or the nearest parent directory where it can be found. A convenient location might be your `$HOME` directory.

### Explicit configuration file

Instead of passing command line arguments one by one, an explicit configuration file can be used. Explicitly defining a configuration file will prevent loading of the implicit configuration files.

```shell
uvcc --config <my-uvcc-config.json>
```

## Examples

See additional output examples in [./examples/](./examples/).

### Exported configuration

- Save the exported JSON data to a file as a snapshot of the current camera settings using `uvcc export > my-export.json`.
- The export format is made to be imported again using `cat my-export.json | uvcc import`.
- Note that some values are read-only, and are thus not exported.
- Note that the order of the imported values matters, as for example automatic white balance needs to be turned off before setting a custom white balance.

```shell
# Logitech (0x46d) C920 HD Pro Webcam (0x82d).
uvcc export
```

```json
{
  "absolute_pan_tilt": 0,
  "absolute_zoom": 100,
  "auto_exposure_mode": 8,
  "auto_exposure_priority": 1,
  "auto_focus": 1,
  "auto_white_balance_temperature": 1,
  "backlight_compensation": 0,
  "brightness": 128,
  "contrast": 128,
  "gain": 28,
  "power_line_frequency": 2,
  "saturation": 128,
  "sharpness": 128,
  "white_balance_temperature": 4675
}
```

## Development

Get the source code from the [`uvcc` repository](https://github.com/joelpurra/uvcc).

Follow [git-flow](https://danielkummer.github.io/git-flow-cheatsheet/) and use [git-flow-avh](https://github.com/petervanderdoes/gitflow-avh).

```shell
# Make sure git-flow is initialized.
git flow init -d

npm run --silent test
```

## Todo

- Add tests.
- Compare list of UVC controls with the output from [`v4l2-ctl`](https://www.mankier.com/1/v4l2-ctl).
  - `v4l2-ctl --list-devices`
  - `v4l2-ctl --list-ctrls`
  - See for example the article [Manual USB camera settings in Linux
    ](http://kurokesu.com/main/2016/01/16/manual-usb-camera-settings-in-linux/).

## See also

- [USB Video Class](https://en.wikipedia.org/wiki/USB_video_device_class) on Wikipedia.
- [List of USB video class devices
  ](https://en.wikipedia.org/wiki/List_of_USB_video_class_devices) on Wikipedia.
- The lower-level UVC Node.js library [uvc-control](https://github.com/makenai/node-uvc-control) used by `uvcc`.
- The even lower level library [`libusb`](http://libusb.info/) ([Wikipedia](https://en.wikipedia.org/wiki/Libusb)) through the [npm package `usb`](https://www.npmjs.com/package/usb).
- The [`v4l-utils`](https://linuxtv.org/wiki/index.php/V4l-utils) for [video4linux](https://www.linuxtv.org) ([Wikipedia](https://en.wikipedia.org/wiki/Video4Linux)), which includes [`v4l2-ctl`](https://www.mankier.com/1/v4l2-ctl).

## Acknowledgements

- [Pawel Szymczykowski](http://twitter.com/makenai) for [uvc-control](https://github.com/makenai/node-uvc-control) for node.js. Without his code I would never have gotten close to automating — or perhaps even being _able_ to — changing camera controls on macOS.

---

[`uvcc`](https://joelpurra.com/projects/uvcc/) Copyright &copy; 2018 [Joel Purra](https://joelpurra.com/). Released under [GNU General Public License version 3.0 (GPL-3.0)](https://www.gnu.org/licenses/gpl.html). [Your donations are appreciated!](https://joelpurra.com/donate/)
