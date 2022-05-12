#!/usr/bin/env bash

set -o errexit
set -o noclobber
set -o nounset
set -o pipefail

function changeOverlayTextAsync() {
	# NOTE: don't wait for zmqsend, even if it usually is quick.
	echo "drawtext reinit 'text=${@}" | zmqsend &
}

declare -r SCRIPT_BASE="${BASH_SOURCE%/*}"
declare SCRIPT_BASE_ABSOLUTE
SCRIPT_BASE_ABSOLUTE="$(realpath "$SCRIPT_BASE")"

# NOTE: using the local repository version of uvcc, with any local (even uncommitted) changes.
declare UVCC_INDEX
UVCC_INDEX="$(realpath "${SCRIPT_BASE_ABSOLUTE}/../../../dist/index.js")"

declare -r UVCC="node -- ${UVCC_INDEX}"

set -x

# NOTE: requires
#  - ffmpeg compiled with --enable-libzmq
#  - zmqsend from the ffmpeg repository
# http://www.ffmpeg-archive.org/how-to-build-tools-zmqsend-td4686430.html
# https://raspberrypi.stackexchange.com/questions/93786/ffmpeg-doesnt-have-tools-zmqsend
coproc 'RECORDER' {
	ffmpeg \
		-hide_banner \
		-loglevel 'error' \
		-f 'v4l2' \
		-framerate '24' \
		-video_size '1280x720' \
		-input_format 'h264' \
		-i /dev/video0 \
		-ss '2' \
		-an \
		-sn \
		-vf "
			zmq='',
			scale=sws_flags=spline+accurate_rnd:out_range=tv,
			drawbox='y=(ih/5):color=black@0.3:width=iw:height=(ih/6):t=fill',
			drawtext='fontsize=(h/8):fontcolor=black:x=((w-tw)/2):y=(h/5)+(h/36):text=auto.json'
		" \
		-c:v 'libx264' \
		-colorspace 'bt709' \
		-color_trc 'bt709' \
		-color_primaries 'bt709' \
		-color_range 'tv' \
		-pix_fmt 'yuv420p' \
		-f 'mp4' \
		-y \
		'output/uvcc-demo.mp4'
	}

# NOTE: setting -ss '2' to skip the first two seconds of video, to let the camera autoadjust to current lighting conditions.
sleep 2

changeOverlayTextAsync 'auto.json'
cat 'auto.json' | $UVCC import

sleep 5

changeOverlayTextAsync 'warm.json'
cat 'warm.json' | $UVCC import

sleep 3

changeOverlayTextAsync 'cold.json'
cat 'cold.json' | $UVCC import

sleep 3

changeOverlayTextAsync 'zoom in, pan/tilt'
$UVCC set absolute_zoom 500

sleep 1

# TODO: could be smoother by adding more steps.
$UVCC set absolute_pan_tilt -18000 -18000
$UVCC set absolute_pan_tilt -36000 -36000
sleep 0.6
$UVCC set absolute_pan_tilt -18000 -36000
$UVCC set absolute_pan_tilt 0 -36000
$UVCC set absolute_pan_tilt 18000 -36000
$UVCC set absolute_pan_tilt 36000 -36000
sleep 0.6
$UVCC set absolute_pan_tilt 18000 -36000
$UVCC set absolute_pan_tilt 0 -36000

sleep 1

changeOverlayTextAsync 'crazy.json'
cat 'crazy.json' | $UVCC import

sleep 4

# TODO: generate the json for these steps and import, instead of individual step commands.
changeOverlayTextAsync 'stepwise color changes'
$UVCC set brightness 200
$UVCC set saturation 200
$UVCC set sharpness 200
$UVCC set gain 200

sleep 0.5

$UVCC set brightness 150
$UVCC set saturation 150
$UVCC set sharpness 150
$UVCC set gain 150

sleep 0.5

$UVCC set brightness 100
$UVCC set saturation 100
$UVCC set sharpness 100
$UVCC set gain 100

sleep 0.5

$UVCC set brightness 50
$UVCC set saturation 50
$UVCC set sharpness 50
# $UVCC set gain 50

sleep 0.5

# $UVCC set brightness 0
$UVCC set saturation 0
$UVCC set sharpness 0
# $UVCC set gain 0

sleep 2

# NOTE: hardcoded range because dynamically the current absolute_zoom value to get a
# starting point isn't really reliable, as it depends on camera image output size.
for absolute_zoom in {150..100};
do
	$UVCC set absolute_zoom "$absolute_zoom"
done

# NOTE: the video is made to loop, so going back to auto.json at the end.
changeOverlayTextAsync 'auto.json'
cat 'auto.json' | $UVCC import

sleep 3

# NOTE: emulate ffmpeg "q" (quit) keyboard key press.
echo -n 'q' >& "${RECORDER[1]}"

# NOTE: wait for ffmpeg to finish writing the video.
wait "${RECORDER_PID}"

# https://engineering.giphy.com/how-to-make-gifs-with-ffmpeg/
# https://superuser.com/questions/556029/how-do-i-convert-a-video-to-gif-using-ffmpeg-with-reasonable-quality
# ffmpeg -hide_banner -loglevel 'error' -i 'output/uvcc-demo.mp4' -filter_complex "[0:v] fps=4,scale=480:-2:flags=lanczos,split [a][b];[a] palettegen=stats_mode=diff [p];[b][p] paletteuse" -vsync '0' -loop '0' -y 'output/uvcc-demo.gif'

# https://gif.ski/
find ./output -iname 'demo-*.png' -delete
ffmpeg -hide_banner -loglevel 'error' -i 'output/uvcc-demo.mp4' -vf "fps='4'" 'output/demo-%04d.png'
find ./output -iname 'demo-*.png' -print0 | xargs -0 gifski --fps '4' --width '480' --quality '25' --output 'output/uvcc-demo.gif'
