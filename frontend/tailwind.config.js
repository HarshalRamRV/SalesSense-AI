/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e88e5',
        dark: {
          DEFAULT: '#121212',
          secondary: '#1e1e1e',
          input: '#2c2c2c'
        }
      }
    },
  },
  plugins: [],
}