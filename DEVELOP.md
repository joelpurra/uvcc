# [`uvcc`](https://joelpurra.com/projects/uvcc/) development

Get the source code from the [`uvcc` repository](https://github.com/joelpurra/uvcc).

Follow [git-flow](https://danielkummer.github.io/git-flow-cheatsheet/) and use [git-flow-avh](https://github.com/petervanderdoes/gitflow-avh).

```shell
# Make sure git-flow is initialized.
git flow init -d

# Fetch dependencies.
npm install

# Get a fresh local build.
npm run --silent rebuild

# Make sure tests pass.
npm run --silent test

# Try some commands on your local build.
node ./dist/index.js

node ./dist/index.js controls

node ./dist/index.js ranges

node ./dist/index.js export

node ./dist/index.js get absolute_zoom

node ./dist/index.js set absolute_zoom 120

# Start debugging.
# Use the Node.js inspector built-in to Chromium-based browsers.
npm run --silent debug:run:break

# Use -- to separate the npm command from uvcc arguments.
npm run --silent debug:run:break -- export
```

## Todo

- Check [open issues and pull requests](https://github.com/joelpurra/uvcc/issues?q=is%3Aopen) and see what can be done.
- Add tests.
- Add output examples from additional camera models.
  - Perhaps create and record a demo video/gif for that model.
- Add workarounds for cameras with known issues.
  - Some cameras are known to have issues in other implementations.
  - Avoid camera- or system-specific workarounds, try to be generic in their detection and prevention.
  - See [Linux UVC device drivers](https://www.ideasonboard.org/uvc/)'s supported devices list for examples.
- Compare UVC controls/values with the output from [`v4l2-ctl`](https://www.mankier.com/1/v4l2-ctl).
  - `v4l2-ctl --list-devices`
  - `v4l2-ctl --list-ctrls`
  - See for example the article [Manual USB camera settings in Linux](http://kurokesu.com/main/2016/01/16/manual-usb-camera-settings-in-linux/).

## See also

- The lower-level UVC Node.js library [uvc-control](https://github.com/makenai/node-uvc-control) used by `uvcc`.
- The even lower level library [`libusb`](http://libusb.info/) ([Wikipedia](https://en.wikipedia.org/wiki/Libusb)) through the [npm package `usb`](https://www.npmjs.com/package/usb).
- The [`v4l-utils`](https://linuxtv.org/wiki/index.php/V4l-utils) for [video4linux](https://www.linuxtv.org) ([Wikipedia](https://en.wikipedia.org/wiki/Video4Linux)), which includes [`v4l2-ctl`](https://www.mankier.com/1/v4l2-ctl).

---

[`uvcc`](https://joelpurra.com/projects/uvcc/) Copyright &copy; 2018, 2019, 2020, 2021, 2022 [Joel Purra](https://joelpurra.com/). Released under [GNU General Public License version 3.0 (GPL-3.0)](https://www.gnu.org/licenses/gpl.html). [Your donations are appreciated!](https://joelpurra.com/donate/)
