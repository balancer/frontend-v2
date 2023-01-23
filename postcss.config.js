const autoprefixer = require('autoprefixer');
const tailwind = require('tailwindcss');

const tailwindConfig = require('./tailwind.config.js');

module.exports = {
  plugins: [tailwind(tailwindConfig), autoprefixer],
};
