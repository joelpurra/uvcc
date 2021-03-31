# [`uvcc`](https://joelpurra.com/projects/uvcc/) output examples

See individual subdirectories for specific cameras.

## How to add or update the output from your camera

- Unplug the USB cable and reconnect your camera.
  - This done to get "fresh" (hopefully default) values for `uvcc export`.
- Open the terminal.
- Create and/or enter the correct camera subdirectory.
  - Use [kebab-case](https://en.wikipedia.org/wiki/Kebab_case) naming, with vendor and product code/name.
  - Do not use the full "marketing name", such as "Logitech HD Pro Webcam C920".
  - Correct example: `logitech-c920`.
- Run [`../update-example.sh`](./update-example.sh)
  - For Linux systems, entering the password in `sudo` might be required.
- Verify that the `*.json` files were updated.
- Commit your changes and [submit a pull request](https://github.com/joelpurra/uvcc/compare).

## Is it not working?

Not all cameras are [UVC-compatible](https://en.wikipedia.org/wiki/List_of_USB_video_class_devices). If you can confirm that your camera model supports UVC, perhaps `uvcc` needs some fixes to support it.

- [Report the issue](https://github.com/joelpurra/uvcc/issues?q=is%3Aopen) with as much detail as you can.
- [Fix the source code](../DEVELOP.md) directly, since it is much easier debugging with access to the camera itself.

---

[`uvcc`](https://joelpurra.com/projects/uvcc/) Copyright &copy; 2018, 2019, 2020, 2021 [Joel Purra](https://joelpurra.com/). Released under [GNU General Public License version 3.0 (GPL-3.0)](https://www.gnu.org/licenses/gpl.html). [Your donations are appreciated!](https://joelpurra.com/donate/)
