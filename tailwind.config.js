module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class', // false or 'media' or 'class'
  theme: {
    fontFamily: {
      body: [
        'Inter-Variable',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Helvetica',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"'
      ],
      display: [
        'Utopia-Std-Display',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Helvetica',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"'
      ]
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: {
            50: '#53555e',
            100: '#494b54',
            200: '#3f414a',
            300: '#353740',
            400: '#2b2d36',
            500: '#21232c',
            600: '#171922',
            700: '#0d0f18',
            800: '#03050e',
            900: '#000004'
          },
          dark: {
            50: '#6a7cff',
            100: '#6072ff',
            200: '#5668ff',
            300: '#4c5eff',
            400: '#4254ff',
            500: '#384aff',
            600: '#2e40f5',
            700: '#2436eb',
            800: '#1a2ce1',
            900: '#1022d7'
          }
        }
      }
    }
  },
  variants: {
    extend: {
      zIndex: ['hover']
    }
  },
  plugins: []
};
