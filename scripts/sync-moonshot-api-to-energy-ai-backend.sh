#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
DEFAULT_TARGET="/Users/ben/Documents/UNDP/SEH/dsc-energy-ai-backend"
TARGET_DIR="${ENERGY_AI_BACKEND_DIR:-$DEFAULT_TARGET}"
APPLY_CHANGES="false"

usage() {
  cat <<EOF
Sync the mirrored Moonshot backend files from this repo into dsc-energy-ai-backend.

Usage:
  $(basename "$0") [--apply] [--target /absolute/path/to/dsc-energy-ai-backend]

Options:
  --apply    Copy the files into the target repo.
  --target   Override the target repo path.
  --help     Show this help.

Environment override:
  ENERGY_AI_BACKEND_DIR=/absolute/path/to/dsc-energy-ai-backend
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --apply)
      APPLY_CHANGES="true"
      shift
      ;;
    --target)
      TARGET_DIR="$2"
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ ! -d "$TARGET_DIR" ]]; then
  echo "Target repo not found: $TARGET_DIR" >&2
  exit 1
fi

if [[ ! -d "$TARGET_DIR/src" || ! -d "$TARGET_DIR/tests" ]]; then
  echo "Target repo does not look like dsc-energy-ai-backend: $TARGET_DIR" >&2
  exit 1
fi

declare -a SOURCES=(
  "$REPO_ROOT/api/src/moonshot.py"
  "$REPO_ROOT/api/src/moonshot_models.py"
  "$REPO_ROOT/api/tests/test_moonshot.py"
)

declare -a TARGETS=(
  "$TARGET_DIR/src/moonshot.py"
  "$TARGET_DIR/src/moonshot_models.py"
  "$TARGET_DIR/tests/test_moonshot.py"
)

echo "Moonshot backend sync plan"
echo "Source repo: $REPO_ROOT"
echo "Target repo: $TARGET_DIR"
echo

for i in "${!SOURCES[@]}"; do
  src="${SOURCES[$i]}"
  dest="${TARGETS[$i]}"
  rel_dest="${dest#$TARGET_DIR/}"
  status="new"
  if [[ -f "$dest" ]]; then
    status="update"
  fi
  echo "- $status $rel_dest"
done

echo
echo "Still required inside dsc-energy-ai-backend after file sync:"
echo "1. Add to main.py:"
echo "   from src.moonshot import router as moonshot_router"
echo "2. Register the router after FastAPI app creation:"
echo "   app.include_router(moonshot_router)"
echo "3. Ensure Azure env vars are set:"
echo "   AZURE_OPENAI_KEY"
echo "   AZURE_OPENAI_ENDPOINT"
echo "   AZURE_OPENAI_API_VERSION"
echo "   AZURE_OPENAI_MOONSHOT_PARSE_DEPLOYMENT"
echo "   AZURE_OPENAI_MOONSHOT_SYNOPSIS_DEPLOYMENT"
echo

if [[ "$APPLY_CHANGES" != "true" ]]; then
  echo "Dry run only. Re-run with --apply to copy files."
  exit 0
fi

for i in "${!SOURCES[@]}"; do
  src="${SOURCES[$i]}"
  dest="${TARGETS[$i]}"
  cp "$src" "$dest"
done

echo "Moonshot backend files copied into $TARGET_DIR"
