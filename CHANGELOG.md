# [`uvcc`](https://joelpurra.com/projects/uvcc/) changelog

See full list of commits for details.

## v5.0.0

- a2bab40 Target Node.js v12, v14, v16, v17
  - Fixes [#18](https://github.com/joelpurra/uvcc/issues/18).
- ebea941 Upgrade package-lock.json
  - Includes an upgrade to [`node-usb` v1.8.0](https://github.com/node-usb/node-usb/releases/tag/v1.8.0) via [the forked `node-uvc-control` v2](https://github.com/joelpurra/node-uvc-control/commit/42d1c526719f064a5bd4edfeab457a81687f69aa), which breaks [#16](https://github.com/joelpurra/uvcc/issues/16) (delay at program exit) again.
  - The alternative is that `uvcc` doesn't work at all on the [current Node.js v17](https://github.com/nodejs/Release).
  - See also [node-usb/node-usb#418](https://github.com/node-usb/node-usb/issues/418).
- Other dependencies also upgraded.

## v4.0.1

- ccf5e05 Fix `--version` flag

## v4.0.0

- 77757f0 Switch to ESM
  - Modernizes code to use [Node.js ECMAScript modules](https://nodejs.org/api/esm.html).
  - Targets [current stable Node.js versions](https://github.com/nodejs/Release) (basically v12, v14, v16) which have ESM support.

## v3.0.1

- 08eb9fe Run npm update
  - Includes fix in [joelpurra/node-uvc-control@8c5f5f4](https://github.com/joelpurra/node-uvc-control/commit/8c5f5f41389bb6a8b4b243115ab92892d633cb55) for [#16](https://github.com/joelpurra/uvcc/issues/16), pin `node-usb` to v1.6.5 due to long delay due when using v1.7.0.
- b0ad267 Add npm run debug

## v3.0.0

- e8d7dec Target node.js v12+
- efde45e Update example output from Logitech C920
- bed8ac3 Upgrade forked uvc-control v2
  - Swallows errors when discovering/listing USB/UVC devices.
    - Avoids some problems with `LIBUSB_ERROR_IO` when using `uvcc devices`. The issue seems to be dependent on the internal (software) state (perhaps the traversal order) of USB drivers/devices (and perhaps on _which_ other USB devices are used) connected to the system. Using `sudo` does not prevent `LIBUSB_ERROR_IO`.
    - The change means that `uvcc devices` can be used without `sudo` (by swallowing `LIBUSB_ERROR_ACCESS` thrown when opening some USB devices) even when the user has insufficient privileges, although inaccessible UVC devices will not be listed.
- e5d9f49 Warn for camera mismatch
  - Fixes part of [#10](https://github.com/joelpurra/uvcc/issues/10) by warning for unexpected camera results.
- 526b9f4 Upgrade forked uvc-control v2
  - Fixes part of [#10](https://github.com/joelpurra/uvcc/issues/10) by allowing filtering by only product id, or only by device address.
- 7a9dd89 Add some styling to command help
- 4691cbf Update usage examples
  - Fixes [#14](https://github.com/joelpurra/uvcc/issues/14) by improving examples.

## v2.0.4

- 9f3073e Upgrade forked uvc-control v2
  - Fixes [#8](https://github.com/joelpurra/uvcc/issues/8), setting `absolute_focus`.

## v2.0.3

- d34da77 Upgrade forked uvc-control v2
  - Fixes [#6](https://github.com/joelpurra/uvcc/issues/6), setting `absolute_exposure_time`.

## v2.0.2

- 8c24f19 Add compatible cameras and help wanted notes

## v2.0.1

- ff28515 Fix broken anchor tag in README.md

## v2.0.0

### ⚠ Breaking changes

- Camera controls changed name in the upstream `uvc-control` v2, so old exports won't import without edits.
  - Most changes are from camel-case `someCameraControl` to snake-case `some_camera_control`, for example `autoExposureMode` to `auto_exposure_mode`.
  - Other controls changed name a bit more, such as `autoWhiteBalance` to `auto_white_balance_temperature`.
  - See `uvcc controls` for your camera.

### Features

- Uses forked `uvc-control` v2, as breaking bug fixes were not reviewed (not commented, accepted, nor rejected) in time for this release ([uvc-control#64](https://github.com/makenai/node-uvc-control/pull/64)).
  - If the equivalent changes are made, `uvcc` can go back to using the upstream.
  - Below feature changes are a mix of changes in `uvc-control` and `uvcc`.
- Should support additional cameras and camera controls by `uvc-control` dynamically mapping camera controls.
  - Both `uvc-control` and `uvcc` were developed testing (only?) against Logitech C920 cameras.
  - Several users tested previews/manual patches using other cameras ([#4](https://github.com/joelpurra/uvcc/issues/4)).
  - Further changes have only been confirmed using Logitech C920.
- If a UVC camera is available, it will be autodetected by `uvc-control` using `node-usb`.
  - Most users will not need to run `uvcc devices` to find and configure their camera.
  - Uses the "first" camera, which may depend on the system, drivers, and in which port the cameras are plugged in.
  - If necessary, the vendor/product can still be configured as before.
- If multiple cameras with the same vendor/product are available, it is possible to distinguish between them using `--address`.
  - Can also be configured using environment variables or configuration files.
  - See output from `uvcc devices`.
- Should work on Linux, by changing how `uvc-control` targets the USB device ([uvc-control#58](https://github.com/makenai/node-uvc-control/issues/58)).
  - Might need to use `sudo uvcc devices` to access and filter the full list of USB devices.
  - Might need to set up userspace `/dev` (`udev`) rules or equivalent to further get/set camera control values.

### Other changes

- d6b4700 Add example output from Logitech C920
- 80848a6 Make device address configurable
- 97a34d0 Make vendor/product ids optional
- 7b334fa Fix devices command
- b6c191f Target uvc-control v2

## v1.0.2

- 51e824c Add `find-up`

## v1.0.1

- a4eb66f Use file-relative path to file in the `uvc-control` package

## v1.0.0

- 047980e Initial public release
- Thanks you [Pawel Szymczykowski](http://twitter.com/makenai) for [uvc-control](https://github.com/makenai/node-uvc-control) for node.js. Without his code I would never have gotten close to automating — or perhaps even being _able_ to — changing camera controls on macOS.

---

[`uvcc`](https://joelpurra.com/projects/uvcc/) Copyright &copy; 2018, 2019, 2020, 2021 [Joel Purra](https://joelpurra.com/). Released under [GNU General Public License version 3.0 (GPL-3.0)](https://www.gnu.org/licenses/gpl.html). [Your donations are appreciated!](https://joelpurra.com/donate/)
