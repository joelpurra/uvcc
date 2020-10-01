# [`uvcc`](https://joelpurra.com/projects/uvcc/) changelog

See full list of commits for details.

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

[`uvcc`](https://joelpurra.com/projects/uvcc/) Copyright &copy; 2018, 2019, 2020 [Joel Purra](https://joelpurra.com/). Released under [GNU General Public License version 3.0 (GPL-3.0)](https://www.gnu.org/licenses/gpl.html). [Your donations are appreciated!](https://joelpurra.com/donate/)
