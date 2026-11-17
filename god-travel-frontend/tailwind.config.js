/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs marque God Travel / United Express
        primary: {
          50:  '#e8f8f8',
          100: '#d0f0f0',
          500: '#14b2b6',
          600: '#109398',
          700: '#116f74',
          800: '#164c50',
          900: '#11191e',
          950: '#0a1216',
        },
        gold: {
          400: '#75d8d9',
          500: '#14b2b6',
          600: '#10888c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

