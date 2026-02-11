// Learn more https://docs.expo.io/guides/customizing-metro
// EXPO_ROUTER_APP_ROOT must be set before getDefaultConfig is called
process.env.EXPO_ROUTER_APP_ROOT = 'app';

const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = config;
