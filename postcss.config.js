const autoprefixer = require('autoprefixer');
const tailwind = require('tailwindcss');

const tailwindConfig = require('./tailwind.config.js');

module.exports = {
  parser: require('postcss-comment'),
  plugins: [tailwind(tailwindConfig), autoprefixer],
};
