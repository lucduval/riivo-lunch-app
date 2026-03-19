/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: '#F4EFE4',
        carbon: '#1A1917',
        mustard: '#C8962A',
        smoke: '#E8E3D9',
        scarlet: '#B83232',
      },
      fontFamily: {
        baskerville: ['"Libre Baskerville"', 'serif'],
        sans: ['"Source Sans 3"', 'sans-serif'],
        mono: ['"Roboto Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
