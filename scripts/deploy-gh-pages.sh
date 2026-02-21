#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(pwd)"
REMOTE_URL="$(git remote get-url origin)"

BUILD_NUMBER=$(git rev-list --count HEAD)
GIT_HASH=$(git rev-parse --short HEAD)
APP_VERSION=$(node -p "require('./app.json').expo.version")

echo "Building Expo web app (build #$BUILD_NUMBER, $GIT_HASH)..."
EXPO_PUBLIC_BUILD_NUMBER=$BUILD_NUMBER \
EXPO_PUBLIC_GIT_HASH=$GIT_HASH \
EXPO_BASE_URL=/myTodo_TS expo export --platform web

echo "Deploying dist/ to gh-pages branch..."
TMPDIR="$(mktemp -d)"
trap "rm -rf '$TMPDIR'" EXIT

cp -r dist/. "$TMPDIR/"
cd "$TMPDIR"
git init
git checkout -b gh-pages
git add -A
git commit -m "Deploy myTodo_TS v${APP_VERSION} (build #${BUILD_NUMBER}, ${GIT_HASH}) - $(date '+%Y-%m-%d %H:%M')"
git push "$REMOTE_URL" gh-pages --force

echo ""
echo "Deployed to https://BirdyF.github.io/myTodo_TS/"
