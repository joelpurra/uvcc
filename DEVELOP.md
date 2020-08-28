# [`uvcc`](https://joelpurra.com/projects/uvcc/) development

Get the source code from the [`uvcc` repository](https://github.com/joelpurra/uvcc).

Follow [git-flow](https://danielkummer.github.io/git-flow-cheatsheet/) and use [git-flow-avh](https://github.com/petervanderdoes/gitflow-avh).

```shell
# Make sure git-flow is initialized.
git flow init -d

# Make sure tests pass.
npm run --silent test
```

## Todo

- Check [open issues and pull requests](https://github.com/joelpurra/uvcc/issues?q=is%3Aopen) and see what can be done.
- Add tests.
- Add output examples from additional camera models.
- Compare UVC controls/values with the output from [`v4l2-ctl`](https://www.mankier.com/1/v4l2-ctl).
  - `v4l2-ctl --list-devices`
  - `v4l2-ctl --list-ctrls`
  - See for example the article [Manual USB camera settings in Linux](http://kurokesu.com/main/2016/01/16/manual-usb-camera-settings-in-linux/).

## See also

- The lower-level UVC Node.js library [uvc-control](https://github.com/makenai/node-uvc-control) used by `uvcc`.
- The even lower level library [`libusb`](http://libusb.info/) ([Wikipedia](https://en.wikipedia.org/wiki/Libusb)) through the [npm package `usb`](https://www.npmjs.com/package/usb).
- The [`v4l-utils`](https://linuxtv.org/wiki/index.php/V4l-utils) for [video4linux](https://www.linuxtv.org) ([Wikipedia](https://en.wikipedia.org/wiki/Video4Linux)), which includes [`v4l2-ctl`](https://www.mankier.com/1/v4l2-ctl).

---

[`uvcc`](https://joelpurra.com/projects/uvcc/) Copyright &copy; 2018 [Joel Purra](https://joelpurra.com/). Released under [GNU General Public License version 3.0 (GPL-3.0)](https://www.gnu.org/licenses/gpl.html). [Your donations are appreciated!](https://joelpurra.com/donate/)
