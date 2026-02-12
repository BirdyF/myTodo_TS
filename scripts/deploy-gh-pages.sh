#!/usr/bin/env bash
set -euo pipefail

PAGES_DIR="${GITHUB_PAGES_DIR:-../BirdyF.github.io}"

# Resolve to absolute path
PAGES_DIR="$(cd "$PAGES_DIR" 2>/dev/null && pwd)" || {
  echo "Error: GitHub Pages repo not found."
  echo "Set GITHUB_PAGES_DIR to the path of your BirdyF.github.io repo."
  echo "Example: GITHUB_PAGES_DIR=~/projects/BirdyF.github.io npm run deploy:github"
  exit 1
}

echo "Building Expo web app..."
EXPO_BASE_URL=/myTodo_TS expo export --platform web

echo "Deploying to $PAGES_DIR/myTodo_TS/ ..."
rm -rf "$PAGES_DIR/myTodo_TS"
cp -r dist/ "$PAGES_DIR/myTodo_TS"

echo "Committing and pushing to BirdyF.github.io ..."
cd "$PAGES_DIR"
git add myTodo_TS/
git commit -m "Deploy myTodo_TS web app - $(date '+%Y-%m-%d %H:%M')"
git push origin master

echo ""
echo "Deployed to https://BirdyF.github.io/myTodo_TS/"
