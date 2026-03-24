/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#65a7a5',
        secondary: '#ffffff',
        accent: '#65a7a5',
        'accent-dim': 'rgba(101, 167, 165, 0.15)',
        'accent-glow': 'rgba(101, 167, 165, 0.3)',
        dark: {
          bg: '#0B0F0E',
          card: 'rgba(20, 20, 20, 0.6)',
          section: 'rgba(20, 20, 20, 0.55)',
        },
        'text-primary': '#e8e8e8',
        'text-muted': '#888888',
        'text-dim': '#555555',
        'border-dark': 'rgba(255, 255, 255, 0.08)',
        'border-accent': 'rgba(101, 167, 165, 0.3)',
        success: '#8dc8bf',
        warning: '#c2aa72',
        error: '#c46b6b',
        info: '#65a7a5',
      },
      fontFamily: {
        sans: ['Montserrat', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
