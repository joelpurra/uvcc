#!/usr/bin/env bash

set -o errexit
set -o noclobber
set -o nounset
set -o pipefail

declare -r SCRIPT_BASE="${BASH_SOURCE%/*}"
declare SCRIPT_BASE_ABSOLUTE
SCRIPT_BASE_ABSOLUTE="$(realpath "$SCRIPT_BASE")"

declare UVCC_INDEX
UVCC_INDEX="$(realpath "${SCRIPT_BASE_ABSOLUTE}/../dist/index.js")"

declare -r UVCC="node -- ${UVCC_INDEX}"

rm -f 'controls.json'
$UVCC controls > 'controls.json'

rm -f 'devices.json'
$UVCC devices > 'devices.json'

rm -f 'export.json'
$UVCC export > 'export.json'

rm -f 'ranges.json'
$UVCC ranges > 'ranges.json'

rm -f 'metadata.json'
jq \
	--null-input \
	--arg uvcc "$($UVCC --version)" \
	--arg node "$(node --version)" \
	--arg npm "$(npm --version)" \
	--arg uname "$(uname -a)" \
	--sort-keys \
	'{
		uvcc: $uvcc,
		node: $node,
		npm: $npm,
		uname: $uname,
	}' > 'metadata.json'
