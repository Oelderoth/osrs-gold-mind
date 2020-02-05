// next.config.js
const withPlugins = require('next-compose-plugins');
const sass = require('@zeit/next-sass')
const fonts = require('next-fonts');

module.exports = withPlugins([
  [sass],
  [fonts, {enableSvg: true}]
])