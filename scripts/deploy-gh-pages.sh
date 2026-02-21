#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(pwd)"
REMOTE_URL="$(git remote get-url origin)"

echo "Building Expo web app..."
EXPO_BASE_URL=/myTodo_TS expo export --platform web

echo "Deploying dist/ to gh-pages branch..."
TMPDIR="$(mktemp -d)"
trap "rm -rf '$TMPDIR'" EXIT

cp -r dist/. "$TMPDIR/"
cd "$TMPDIR"
git init
git checkout -b gh-pages
git add -A
git commit -m "Deploy myTodo_TS web app - $(date '+%Y-%m-%d %H:%M')"
git push "$REMOTE_URL" gh-pages --force

echo ""
echo "Deployed to https://BirdyF.github.io/myTodo_TS/"
