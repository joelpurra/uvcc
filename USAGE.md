# [`uvcc`](https://joelpurra.com/projects/uvcc/) usage

By default, the first detected UVC camera will be used. See [configuration](#configuration) to target a specific camera. Note that [many cameras are not UVC-compatible](https://en.wikipedia.org/wiki/List_of_USB_video_class_devices).

```shell
uvcc --help
```

```text
USB Video Class (UVC) device configurator for the command line (CLI). Used for
webcams, camcorders, etcetera.

Commands:
  uvcc get <control>          Get current control value from the camera.
  uvcc set <control> <value>  Set control value on the camera.
  uvcc range <control>        Get possible range (min and max) for a control
                              from the camera.
  uvcc ranges                 Get all ranges (min and max) for all available
                              controls from the camera.
  uvcc devices                List connected UVC devices with name, vendor id
                              (vId), product id (pId), and device address.
  uvcc controls               List all supported controls.
  uvcc export                 Output configuration in JSON format, on stdout.
  uvcc import                 Input configuration in JSON format, from stdin.

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

---

[`uvcc`](https://joelpurra.com/projects/uvcc/) Copyright &copy; 2018 [Joel Purra](https://joelpurra.com/). Released under [GNU General Public License version 3.0 (GPL-3.0)](https://www.gnu.org/licenses/gpl.html). [Your donations are appreciated!](https://joelpurra.com/donate/)
