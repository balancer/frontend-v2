const defaultTheme = require('tailwindcss/defaultTheme');
module.exports = {
  purge: {
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    options: {
      safelist: [
        /^shadow/,
        /^bg/,
        /^text/,
        /^border/,
        /^from/,
        /^to/,
        /^dark:/,
        /^hover:/,
        'dark',
        /^dark:/
      ]
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
        '"Tiempos Headline Medium"',
        'Times',
        '"Times New Roman"',
        'serif'
      ]
    },
    boxShadow: {
      sm: '0 2px 4px 0 rgba(0,0,0,0.05)',
      DEFAULT:
        '0px 4px 6px -1px rgba(0, 0, 0, 0.05), 0px 2px 4px -1px rgba(0, 0, 0, 0.05)',
      lg: '0 2px 4px 0 rgba(0,0,0,0.03), 0 10px 40px 0 rgba(0,0,0,0.05)',
      xl: '0 2px 4px 0 rgba(0,0,0,0.05), 0 0px 40px 0 rgba(0,0,0,0.1)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
      none: 'none'
    },
    borderColor: theme => ({
      ...theme('colors'),
      DEFAULT: theme('colors.gray.100', 'currentColor')
    }),
    screens: {
      xs: '440px',
      ...defaultTheme.screens
    },
    extend: {
      colors: {
        gray: {
          50: '#F8FAFC',
          100: '#EAF0F6',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          850: '#162031',
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
        pink: {
          50: '#ff4dff',
          100: '#ff43ff',
          200: '#ff39ff',
          300: '#ff2fff',
          400: '#fc25ff',
          500: '#f21bf6',
          600: '#e811ec',
          700: '#de07e2',
          800: '#d400d8',
          900: '#ca00ce'
        }
      }
    }
  },
  variants: {
    extend: {
      margin: ['first'],
      zIndex: ['hover'],
      borderWidth: ['dark', 'last']
    }
  },
  plugins: []
};
