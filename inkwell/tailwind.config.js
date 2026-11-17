/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: '#faf7f2', 100: '#f4efe6', 200: '#ebe3d5', 300: '#ddd2bf' },
        ink: { DEFAULT: '#1c1917', 600: '#44403c', 500: '#57534e', 400: '#78716c', 300: '#a8a29e' },
        delta: { DEFAULT: '#006a4e', 50: '#e8f3ef', 100: '#cfe7de', 500: '#008862', 600: '#006a4e', 700: '#00553f', 800: '#073f30' },
        sun: { DEFAULT: '#e5383b', 50: '#fdeceb', 500: '#e5383b', 600: '#c62b2e' },
      },
      fontFamily: {
        serif: ['"Noto Serif"', '"Noto Serif Bengali"', 'Georgia', 'serif'],
        sans: ['"Noto Sans"', '"Noto Sans Bengali"', 'system-ui', 'sans-serif'],
        bnserif: ['"Noto Serif Bengali"', '"Noto Serif"', 'serif'],
      },
      boxShadow: {
        cover: '0 1px 2px rgba(28,25,23,.08), 0 8px 24px -8px rgba(28,25,23,.35)',
        card: '0 1px 2px rgba(28,25,23,.05), 0 4px 16px -6px rgba(28,25,23,.12)',
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        rise: { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'none' } },
      },
      animation: { rise: 'rise .25s ease-out both' },
    },
  },
  plugins: [],
};
