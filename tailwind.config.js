/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* Migración gradual → verde institucional Winbit */
        primary: '#5db09d',
        secondary: '#ffffff',
        accent: '#5db09d',
        'accent-dim': 'rgba(93, 176, 157, 0.15)',
        'accent-glow': 'rgba(93, 176, 157, 0.25)',
        winbit: {
          green: '#5db09d',
          white: '#ffffff',
          bg: '#0a0e12',
        },
        dark: {
          bg: '#0a0e12',
          card: 'rgba(14, 22, 26, 0.88)',
          section: 'rgba(14, 22, 26, 0.75)',
        },
        'text-primary': '#ffffff',
        'text-muted': 'rgba(255, 255, 255, 0.72)',
        'text-dim': 'rgba(255, 255, 255, 0.45)',
        'border-dark': 'rgba(255, 255, 255, 0.08)',
        'border-accent': 'rgba(93, 176, 157, 0.28)',
        success: '#5db09d',
        warning: '#c2aa72',
        error: '#c46b6b',
        info: '#5db09d',
      },
      fontFamily: {
        sans: ['Montserrat', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
