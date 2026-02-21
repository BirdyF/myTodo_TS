// Learn more https://docs.expo.io/guides/customizing-metro
// EXPO_ROUTER_APP_ROOT must be set before getDefaultConfig is called
process.env.EXPO_ROUTER_APP_ROOT = 'app';

const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Inline requires defers module evaluation until first use.
// Heavy modules like Firebase are only loaded when actually called,
// not at app startup — significantly improves time-to-interactive.
// Allow Metro to bundle .wasm files (required by expo-sqlite on web)
config.resolver = {
  ...config.resolver,
  assetExts: [...config.resolver.assetExts, 'wasm'],
};

config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config;
