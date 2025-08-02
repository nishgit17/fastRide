// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// If you're adding custom asset types, ensure 'png' is still included:
// config.resolver.assetExts.push('png'); // Usually not needed as 'png' is default

module.exports = config;