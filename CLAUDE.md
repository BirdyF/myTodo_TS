# CLAUDE.md

## Project Overview
A Todo app built with React Native / Expo (TypeScript), using Expo Router for navigation, Zustand for state management, and Firebase + expo-sqlite for storage.

## Tech Stack
- **Framework**: React Native + Expo (~54)
- **Language**: TypeScript (~5.9)
- **Navigation**: Expo Router (~6)
- **State**: Zustand (~5)
- **Storage**: expo-sqlite + Firebase
- **UI**: @expo/vector-icons, expo-haptics

## Project Structure
```
app/          # Expo Router screens/routes
src/
  components/ # Reusable UI components
  constants/  # App-wide constants
  models/     # TypeScript types/interfaces
  services/   # Firebase and data services
  store/      # Zustand stores
assets/       # Images, fonts
scripts/      # Deploy scripts
```

## Common Commands
```bash
npm start               # Start Expo dev server
npm run ios             # Run on iOS simulator
npm run android         # Run on Android emulator
npm run web             # Run in browser
npm run build:web       # Build for web (expo export)
npm run deploy:github   # Deploy to GitHub Pages
```

## Deployment
- Hosted on GitHub Pages via `scripts/deploy-gh-pages.sh`
- Branch: `claude/github-account-access-HN5de`
- Main branch: `claude/github-account-access-HN5de`
