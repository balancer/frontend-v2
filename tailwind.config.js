module.exports = {
  purge: {
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    options: {
      safelist: [/^shadow/, /^bg/, /^text/, /^border/, /^from/, /^to/, 'dark']
    }
  },
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
        gray: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A'
        },
        primary: {
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
        'primary-dark': {
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
        },
        blue: {
          50: '#3232ff',
          100: '#2828ff',
          200: '#1e1eff',
          300: '#1414ff',
          400: '#0a0aff',
          500: '#0000ff',
          600: '#0000f5',
          700: '#0000eb',
          800: '#0000e1',
          900: '#0000d7'
        },
        pink: {
          50: '#ff32ff',
          100: '#ff28ff',
          200: '#ff1eff',
          300: '#ff14ff',
          400: '#ff0aff',
          500: '#ff00ff',
          600: '#f500f5',
          700: '#eb00eb',
          800: '#e100e1',
          900: '#d700d7'
        }
      }
    }
  },
  variants: {
    extend: {
      zIndex: ['hover'],
      borderWidth: ['dark', 'last']
    }
  },
  plugins: []
};
