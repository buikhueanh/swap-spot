/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#208AEF',
          dark: '#1565C0',
          light: '#E6F4FE',
        },
      },
    },
  },
  plugins: [],
};
