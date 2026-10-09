#!/usr/bin/env bash
# Tile a video at 4 fps into one image (film area only if 1920x1080 showcase layout).
# Usage: bash scripts/contact_sheet.sh <video.mp4> <sheet.jpg>
set -euo pipefail
W=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$1")
CROP=""; [ "$W" = "1920" ] && CROP="crop=1000:1000:880:40,"
ffmpeg -v error -y -i "$1" -vf "fps=4,${CROP}scale=200:-1,tile=10x6" -frames:v 1 "$2"; echo "sheet → $2"
