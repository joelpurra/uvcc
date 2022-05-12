# [`uvcc`](https://joelpurra.com/projects/uvcc/) output examples

A small sample of `uvcc` camera control output. See individual subdirectories for specific cameras. Note that [cameras with the same "marketing name" may have several USB hardware implementations with different vendor/product ids](https://github.com/joelpurra/uvcc/issues/21), so there may be more than one subdirectory.

## How to add or update the output from your camera

- Open the terminal.
- Create and/or enter the correct camera product marketing name subdirectory.
  - The "marketing name" is the product name (usually including a short codename) you would see on the box when you buy a camera.
  - Use [kebab-case](https://en.wikipedia.org/wiki/Kebab_case) naming, with vendor name and product code/name.
  - Do not use the full "marketing name", such as "Logitech HD Pro Webcam C920".
  - Correct examples:
    - [`logitech-c920`](./logitech-c920/) from `Logitech HD Pro Webcam C920` (`name` in `uvcc devices`).
    - [`logitech-c922`](./logitech-c922/) from the vendor name and `C922 Pro Stream Webcam` (`name` in `uvcc devices`).
    - [`microsoft-1425`](./microsoft-1425/) from the vendor name and the model number `1425` found on the label on the camera cable as well as the box the camera was delivered in.
- Create and/or enter the correct vendor/product id subdirectory.
  - This is due to [cameras with the same "marketing name" having different USB product ids](https://github.com/joelpurra/uvcc/issues/21), and this possibly having different hardware properties.
  - Use the format `<vendor id>-<product id>` with decimal number formatting.
  - You can find the USB `vendor` and `product` ids in the output of `uvcc devices`.
  - Correct examples:
    - [`logitech-c920/1133-2093`](./logitech-c920/1133-2093/)
    - [`logitech-c922/1133-2140`](./logitech-c920/1133-2140/)
    - [`microsoft-1425/1118-1906`](./microsoft-1425/1118-1906/)
    - [`microsoft-1425/1118-2065`](./microsoft-1425/1118-2065/)
- Reset the camera to default values.
  - Unplug all cameras.
  - Reconnect only the camera you want to test.
  - This done to get "fresh" (hopefully default) values for `uvcc export`.
- Run [`../../update-example.sh`](./update-example.sh)
- Verify that the `*.json` files were created/updated.
- Commit your changes and [submit a pull request](https://github.com/joelpurra/uvcc/compare).

## Is it not working?

Not all cameras are [UVC-compatible](https://en.wikipedia.org/wiki/List_of_USB_video_class_devices). If you can confirm that your camera model supports UVC, perhaps `uvcc` needs some fixes to support it.

- [Report the issue](https://github.com/joelpurra/uvcc/issues?q=is%3Aopen) with as much detail as you can.
- [Fix the source code](../DEVELOP.md) directly, since it is much easier debugging with access to the camera itself.

---

[`uvcc`](https://joelpurra.com/projects/uvcc/) Copyright &copy; 2018, 2019, 2020, 2021, 2022 [Joel Purra](https://joelpurra.com/). Released under [GNU General Public License version 3.0 (GPL-3.0)](https://www.gnu.org/licenses/gpl.html). [Your donations are appreciated!](https://joelpurra.com/donate/)
