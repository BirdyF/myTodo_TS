# myTodo_TS

A todo app built with React Native + Expo + TypeScript, replicating the Flutter `my_todo_app` with full offline-first support and Firebase cloud sync.

## Tech Stack

- **Framework**: [Expo](https://expo.dev) with [Expo Router](https://expo.github.io/router/) v6
- **Language**: TypeScript (strict)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Local Storage**: [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (offline-first)
- **Cloud Sync**: [Firebase Firestore](https://firebase.google.com/docs/firestore) + Google Sign-In
- **UI**: React Native + [@expo/vector-icons](https://icons.expo.fyi/)
- **Animations**: [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/)

## Features

- ✅ Create, edit, delete tasks
- ⭐ Mark tasks as important
- ☀️ My Day view
- 🏷️ Tags with custom colors
- ✔️ Complete / uncomplete tasks
- 📋 Completed tasks archive
- ☁️ Optional Google Sign-In + Firebase sync
- 📴 Fully offline-first (SQLite)
- 🍎 iOS + 🤖 Android + 🌐 Web

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

Copy `.env.example` to `.env` and fill in your Firebase project credentials:

```bash
cp .env.example .env
```

### 3. Run the app

```bash
# Start development server
npm start

# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Project Structure

```
app/               # Expo Router screens
  (drawer)/        # Drawer navigation group
    index.tsx      # All Tasks screen
    important.tsx  # Important tasks
    my-day.tsx     # My Day
    settings.tsx   # Settings
  task-detail.tsx  # Task detail modal
  manage-tags.tsx  # Tag management
  completed.tsx    # Completed tasks

src/
  constants/       # Colors and theme
  models/          # TypeScript interfaces (Task, Tag)
  services/        # Firebase, SQLite, sync
  store/           # Zustand state stores
  components/      # Reusable UI components
```
