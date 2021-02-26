module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontSize: {
      xs: '.625rem',
      sm: '.75rem',
      base: '.875rem',
      lg: '1rem',
      xl: '1.2rem'
    },
    extend: {}
  },
  variants: {
    extend: {
      zIndex: ['hover']
    }
  },
  plugins: []
};
