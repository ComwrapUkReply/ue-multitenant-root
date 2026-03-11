#!/usr/bin/env bash
#
# One-time setup for front-end testing infrastructure.
# Installs Playwright, axe-core, and ensures gitignore entries exist.
#

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

echo "[frontend-testing] Installing dev dependencies..."
cd "$REPO_ROOT"
npm install --save-dev playwright axe-core

echo "[frontend-testing] Installing Playwright browsers (chromium only)..."
npx playwright install chromium

echo "[frontend-testing] Ensuring test output directories exist..."
mkdir -p test/tmp/screenshots
mkdir -p test/baselines

# Ensure gitignore entries
GITIGNORE="$REPO_ROOT/.gitignore"

add_gitignore_entry() {
  local entry="$1"
  if ! grep -qxF "$entry" "$GITIGNORE" 2>/dev/null; then
    echo "$entry" >> "$GITIGNORE"
    echo "[frontend-testing] Added '$entry' to .gitignore"
  fi
}

add_gitignore_entry "test/tmp/"
add_gitignore_entry "drafts/tmp/"

echo "[frontend-testing] Setup complete."
echo ""
echo "Usage:"
echo "  node .claude/skills/frontend-testing/scripts/test-block-full.js --block <name> --url <url>"
