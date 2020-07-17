# [USB Video Class (UVC) device configurator](https://joelpurra.com/projects/uvcc/) (`uvcc`)

Configure [USB Video Class](https://en.wikipedia.org/wiki/USB_video_device_class) (UVC) compliant devices from the command line.

[UVC-compliant devices](https://en.wikipedia.org/wiki/List_of_USB_video_class_devices) include webcams, digital camcorders, transcoders, analog video converters and still-image cameras.



## Features

Use `uvcc` to **fine-tune camera configuration**, such as brightness, contrast, saturation, gain, white balance temperature, zoom. **Export/import of JSON** makes it easy to reliably and repeatedly configure one or more cameras for various situations.

- Get configuration directly from the camera.
- Set configuration values directly on the camera.
- List available USB devices, including cameras.
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
- Tested using Node.js v8.9.4 on macOS 10.13 High Sierra.



## Usage

By default, the one of the detected UVC device will be used, usually the first. If more than one camera is present, or if swapping to a different camera, this might be problematic. Optionally target a specific device by vendor id and product id. See [configuration](#configuration) documentation.

```shell
# List detected UVC devices. By default one of them is used.
uvcc devices

# Export current configuration.
uvcc export

# Set exposure to manual.
uvcc set autoExposureMode 1

# Turn off automatic white balance.
uvcc set autoWhiteBalance 0

# Set the white balance temperature to 2000.
# NOTE: the white_balance_temperature range for Logitech C920 is 2000-6500.
uvcc set white_balance_temperature 2000

# Set the contrast to 192.
# NOTE: the contrast range for Logitech C920 is 0-255, default value 128.
uvcc set contrast 192

# Export configuration to a JSON file.
uvcc export > "uvcc-export.json"

# Load configuration from a JSON file.
cat "uvcc-export.json" | uvcc import
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
  uvcc devices             List connected USB devices with vendor id (vId) and
                           product id (pId).
  uvcc controls            List all supported controls.
  uvcc export              Output configuration in JSON format, on stdout.
  uvcc import              Input configuration in JSON format, from stdin.

Camera selection:
  --vendor   Camera vendor id in hex (0x000) or decimal (0000) format.  [number]
  --product  Camera product id in hex (0x000) or decimal (0000) format. [number]

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

### Exported configuration

```shell
# Logitech (0x46d) C920 HD Pro Webcam (0x82d).
uvcc --vendor 0x46d --product 0x82d export
```

```json
{
  "absoluteExposureTime": 333,
  "absoluteFocus": 0,
  "absolutePanTilt": 0,
  "absoluteZoom": 120,
  "autoExposureMode": 1,
  "autoExposurePriority": 0,
  "autoFocus": 1,
  "autoWhiteBalance": 0,
  "backlightCompensation": 0,
  "brightness": 128,
  "contrast": 128,
  "gain": 49,
  "saturation": 128,
  "sharpness": 128,
  "whiteBalanceTemperature": 2500
}
```


### Available control ranges

```shell
# Logitech (0x46d) C920 HD Pro Webcam (0x82d).
uvcc --vendor 0x46d --product 0x82d ranges
```

```json
{
  "absoluteExposureTime": [
    3,
    2047
  ],
  "absoluteFocus": [
    0,
    250
  ],
  "absolutePanTilt": [
    -154614527725568,
    154618822692000
  ],
  "absoluteZoom": [
    100,
    500
  ],
  "autoFocus": [
    0,
    1
  ],
  "backlightCompensation": [
    0,
    1
  ],
  "brightness": [
    0,
    255
  ],
  "contrast": [
    0,
    255
  ],
  "gain": [
    0,
    255
  ],
  "saturation": [
    0,
    255
  ],
  "sharpness": [
    0,
    255
  ],
  "whiteBalanceTemperature": [
    2000,
    6500
  ]
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
- Make available camera controls dynamic for the actual camera targeted/used, as there might be more/fewer/other controls on different cameras. Currently controls target [Logitech C920 HD Pro Webcam](https://www.logitech.com/en-us/product/hd-pro-webcam-c920), as per comments in [uvc-control](https://github.com/makenai/node-uvc-control), although most should also apply to other UVC cameras.



## See also

- [USB Video Class](https://en.wikipedia.org/wiki/USB_video_device_class) on Wikipedia.
- [List of USB video class devices
](https://en.wikipedia.org/wiki/List_of_USB_video_class_devices) on Wikipedia.
- The lower-level UVC Node.js library [uvc-control](https://github.com/makenai/node-uvc-control) used by `uvcc`.
- The even lower level library [`libusb`](http://libusb.info/) ([Wikipedia](https://en.wikipedia.org/wiki/Libusb)) through the [npm package `usb`](https://www.npmjs.com/package/usb).
- The [`v4l-utils`](https://linuxtv.org/wiki/index.php/V4l-utils) for [video4linux](https://www.linuxtv.org) ([Wikipedia](https://en.wikipedia.org/wiki/Video4Linux)), which includes [`v4l2-ctl`](https://www.mankier.com/1/v4l2-ctl).



## Acknowledgements

- [Pawel Szymczykowski](http://twitter.com/makenai) for [uvc-control](https://github.com/makenai/node-uvc-control) for node.js. Without his code I would never have gotten close to automating — or perhaps even being *able* to — changing camera controls on macOS.



---

[`uvcc`](https://joelpurra.com/projects/uvcc/) Copyright &copy; 2018 [Joel Purra](https://joelpurra.com/). Released under [GNU General Public License version 3.0 (GPL-3.0)](https://www.gnu.org/licenses/gpl.html). [Your donations are appreciated!](https://joelpurra.com/donate/)
