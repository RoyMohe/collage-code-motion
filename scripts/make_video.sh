#!/usr/bin/env bash
# One-shot: build → render all frames → soundtrack → MP4 → contact sheet.
# Usage: bash scripts/make_video.sh <project_dir> [out.mp4]
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; PROJ="${1:-.}"; OUT="${2:-$PROJ/out.mp4}"
python3 "$HERE/build.py" "$PROJ"
rm -rf "$PROJ/frames"; node "$HERE/render.js" "$PROJ"
python3 "$HERE/audio.py" "$PROJ"
ffmpeg -v error -y -framerate "$(python3 -c "import json;print(json.load(open('$PROJ/timeline.json'))['fps'])")" -i "$PROJ/frames/f%04d.png" -i "$PROJ/audio.wav" \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT"
bash "$HERE/contact_sheet.sh" "$OUT" "${OUT%.mp4}_sheet.jpg"
echo "done → $OUT"
