/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0b0b0c',
        gold: '#d4af37',
        sapphire: '#287bff',
      },
    },
  },
  plugins: [],
};
