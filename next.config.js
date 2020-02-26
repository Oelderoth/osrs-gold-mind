// next.config.js
const path = require('path');
const withPlugins = require('next-compose-plugins');
const sass = require('@zeit/next-sass')
const fonts = require('next-fonts');

const nextConfig = {
  webpack(config) {
    config.resolve.modules.push(path.resolve('./'))
    return config;
  },
}

module.exports = withPlugins([
  [sass],
  [fonts, {enableSvg: true}]
], nextConfig);