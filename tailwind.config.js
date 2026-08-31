/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#39836D',
        'primary-deep': '#39836D',
        'primary-soft': '#479785',
        cream: '#ECE4D5',
        secondary: '#ECE4D5',
        accent: '#479785',
        'accent-dim': 'rgba(57, 131, 109, 0.12)',
        'accent-glow': 'rgba(57, 131, 109, 0.2)',
        winbit: {
          green: '#39836D',
          deep: '#39836D',
          cream: '#ECE4D5',
          white: '#ECE4D5',
          bg: '#0D0F0E',
        },
        dark: {
          bg: '#0D0F0E',
          card: '#141716',
          section: '#121514',
        },
        'text-primary': '#ECE4D5',
        'text-secondary': '#A7AAA2',
        'text-muted': '#A7AAA2',
        'text-dim': '#A7AAA2',
        'border-dark': '#28312D',
        'border-accent': 'rgba(236, 228, 213, 0.32)',
        'border-cream': 'rgba(236, 228, 213, 0.32)',
        'border-cream-strong': 'rgba(236, 228, 213, 0.55)',
        success: '#479785',
        warning: '#E0B44B',
        error: '#C96C67',
        info: '#479785',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['IBM Plex Sans Condensed', 'IBM Plex Sans', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
};
