/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Warm neutral "paper" + near-black "ink", with a single muted clay
        // accent used sparingly. Deliberately restrained — no candy gradients.
        paper: '#faf8f5',
        ink: '#1c1a17',
        brand: {
          50: '#faf5f1',
          100: '#f2e5db',
          200: '#e5c9b6',
          300: '#d3a587',
          400: '#c1825e',
          500: '#a8623d',
          600: '#8d4f30',
          700: '#723f28',
          800: '#5c3422',
          900: '#4a2b1d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'ui-serif', 'serif'],
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgb(28 26 23 / 0.04), 0 1px 3px 0 rgb(28 26 23 / 0.05)',
      },
      letterSpacing: {
        widest: '0.2em',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out both',
      },
    },
  },
  plugins: [],
};
