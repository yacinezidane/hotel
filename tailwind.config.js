/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'sans-serif'],
      },
      colors: {
        // Instagram
        'insta-primary': '#E1306C',
        'insta-gradient-start': '#833AB4',
        'insta-gradient-end': '#FCAF45',
        
        // Zellige 1
        'zellige-primary': '#006269',
        'zellige-secondary': '#Cca43b',
        'zellige-bg': '#FDFBF7',

        // Zellige 2
        'zellige-jersey-green': '#024d38',
        'zellige-jersey-mint': '#c6e3d8',
        'zellige-jersey-bg': '#f5fcf9',

        // Modern Ornate Theme
        'ornate-primary': '#4a148c', // Deep Purple
        'ornate-secondary': '#ffd700', // Gold
        'ornate-accent': '#00e5ff', // Cyan
        'ornate-bg': '#f3e5f5', // Light Purple/White
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'flip-in': 'flipIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        'progress': 'progress 1s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        flipIn: {
          '0%': { transform: 'perspective(1000px) rotateY(90deg)', opacity: '0' },
          '100%': { transform: 'perspective(1000px) rotateY(0)', opacity: '1' },
        },
        progress: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
}
