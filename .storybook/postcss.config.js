module.exports = {
  plugins: [
    require('tailwindcss')('../tailwind.config.js'),
    require('postcss-nesting'),
    require('autoprefixer'),
  ],
};
