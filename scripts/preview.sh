#!/usr/bin/env bash
# Fast QA: build, render only some frames, tile them into one image.
# Usage: bash scripts/preview.sh <project_dir> "6,20,44,90" [sheet.png]
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; PROJ="$1"; FR="$2"; SHEET="${3:-$PROJ/preview_sheet.png}"
python3 "$HERE/build.py" "$PROJ"; rm -rf "$PROJ/preview"; node "$HERE/render.js" "$PROJ" --frames "$FR" --out "$PROJ/preview"
N=$(ls "$PROJ/preview" | wc -l); COLS=$(( N < 4 ? N : 4 )); ROWS=$(( (N + COLS - 1) / COLS ))
ffmpeg -v error -y -pattern_type glob -i "$PROJ/preview/f*.png" -vf "scale=640:-1,tile=${COLS}x${ROWS}" "$SHEET"
echo "sheet → $SHEET"
