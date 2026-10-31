/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: '#0a0a0c',
        accent: '#ffd700',
        danger: '#ff4757',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'glow-gradient': 'radial-gradient(circle at 50% -20%, #1a1a2e 0%, transparent 60%)',
      }
    },
  },
  plugins: [],
}
