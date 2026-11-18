/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#eaf4f5', 100: '#d4eaec', 500: '#14b2b6', 600: '#0a949a', 700: '#087980', 900: '#0e1b1f' },
        gold: { 400: '#2fd0d4', 500: '#14b2b6', 600: '#0a949a' },
        amber: { 50: '#eaf4f5', 100: '#d4eaec', 200: '#b8dfe1', 300: '#8fd2d5', 400: '#2fd0d4', 500: '#14b2b6', 600: '#0a949a', 700: '#087980', 800: '#075f65', 900: '#0e1b1f' },
        slate: { 50: '#f8fcfc', 100: '#eaf4f5', 200: '#cfe2e4', 300: '#a9c5c8', 400: '#718b90', 500: '#476066', 600: '#345156', 700: '#1c3136', 800: '#12252a', 900: '#0e1b1f', 950: '#091215' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

