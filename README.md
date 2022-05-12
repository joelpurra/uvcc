<p align="center">
  <a href="https://files.joelpurra.com/projects/uvcc/demo/2020-09-02/uvcc-demo.2020-09-02.mp4"><img src="https://files.joelpurra.com/projects/uvcc/demo/2020-09-02/uvcc-demo.2020-09-02.gif" alt="uvcc demo video showing rubber ducks and a candle with varying camera settings" width="480" height="270" border="0" /></a>
</p>
<h1 align="center">
  <a href="https://joelpurra.com/projects/uvcc/">uvcc</a>
</h1>
<p align="center">
  <a href="https://en.wikipedia.org/wiki/USB_video_device_class">USB Video Class</a> (UVC) device configurator
</p>

## Overview

- Fine-tune camera controls on the fly, such as brightness, contrast, saturation, gain, white balance/color temperature, zoom.
- Export/import of settings makes it easy to reliably configure one or more cameras for various situations.
- Command line interface (CLI) with JSON input/output for automation and repeatability.

## Compatible cameras

- [Logitech C920 HD Pro Webcam](https://www.logitech.com/en-us/product/hd-pro-webcam-c920) ([1133:2093](./examples/logitech-c920/1133-2093/))
- [Microsoft LifeCam Studio](https://www.microsoft.com/en-WW/accessories/products/webcams/lifecam-studio) Model 1425 ([1118:1906](./examples/microsoft-1425/1118-1906/))
- Hopefully other [UVC-compatible webcams and digital camcorders](https://en.wikipedia.org/wiki/List_of_USB_video_class_devices).

### Do you have another UVC-compatible camera?

- Add it to the [`./examples/`](./examples/).
- Is it not working?
  - [Report an issue.](https://github.com/joelpurra/uvcc/issues?q=is%3Aopen)
  - [Help fix the source code!](./DEVELOP.md)

## Installation

Requires [Node.js](https://nodejs.org/) (`node` and `npm` commands). Published on npm as [`uvcc`](https://www.npmjs.com/package/uvcc).

```shell
npm install --global uvcc
```

Or use [`npx`](https://www.npmjs.com/package/npx) to execute with `npx uvcc`.

On Linux, you may need to [change device access permissions](./USAGE.md#linux).

## Features

- List available UVC cameras and camera controls.
- Get/set individual camera controls.
- Export/import full JSON control snapshots using `stdout`/`stdin`.
- Per-user/per-directory/custom configuration files to handle multiple cameras.

## Short usage example

First start a program which shows a camera preview, such as Photo Booth on macOS or Cheese on Linux.

```shell
# Display commands and options.
uvcc --help

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

## See also

- Further help and configuration in [USAGE.md](./USAGE.md).
- The [./examples/](./examples/) directory for some sample output.
- The [CHANGELOG.md](./CHANGELOG.md), in particular for breaking changes.
- Read [DEVELOP.md](./DEVELOP.md) to submit a patch or add your camera output to the examples.
- [USB Video Class](https://en.wikipedia.org/wiki/USB_video_device_class) and [list of USB video class devices](https://en.wikipedia.org/wiki/List_of_USB_video_class_devices) on Wikipedia.

---

[`uvcc`](https://joelpurra.com/projects/uvcc/) Copyright &copy; 2018, 2019, 2020, 2021 [Joel Purra](https://joelpurra.com/). Released under [GNU General Public License version 3.0 (GPL-3.0)](https://www.gnu.org/licenses/gpl.html). [Your donations are appreciated!](https://joelpurra.com/donate/)
