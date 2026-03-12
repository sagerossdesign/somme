#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: foundation/scripts/new-site.sh <project-name> <preset-file>"
  echo "Example: foundation/scripts/new-site.sh acme-service foundation/presets/service-business.json"
  exit 1
fi

PROJECT_NAME="$1"
PRESET_FILE="$2"
ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
TARGET_DIR="$ROOT_DIR/sites/$PROJECT_NAME"

if [[ -d "$TARGET_DIR" ]]; then
  echo "Error: target already exists: $TARGET_DIR"
  exit 1
fi

if [[ ! -f "$ROOT_DIR/$PRESET_FILE" ]]; then
  echo "Error: preset not found: $ROOT_DIR/$PRESET_FILE"
  exit 1
fi

mkdir -p "$TARGET_DIR"
cp -R "$ROOT_DIR/foundation/starter/." "$TARGET_DIR/"
cp "$ROOT_DIR/$PRESET_FILE" "$TARGET_DIR/site.preset.json"
mkdir -p "$TARGET_DIR/assets/images" "$TARGET_DIR/assets/fonts"

echo "Created: $TARGET_DIR"
echo "Next: update site.config.js, add brand fonts in styles.css, and wire assets in assets/"
