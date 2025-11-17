/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#6D28D9', // Violet 700
        'primary-focus': '#5B21B6', // Violet 800
        'primary-content': '#FFFFFF',
        'secondary': '#6B7280', // Gray 500 - for secondary text
        'accent': '#EC4899', // Pink 500
        'neutral': '#1F2937', // Gray 800 - for main text
        'base-100': '#FFFFFF', // White - for cards
        'base-200': '#F3F4F6', // Gray 100 - for main background
        'base-300': '#E5E7EB', // Gray 200 - for borders
        'info': '#38bdf8',
        'success': '#34d399',
        'warning': '#facc15',
        'error': '#f87171',
        'stat-green': '#10B981', 
        'stat-purple': '#8B5CF6',
        'stat-pink': '#F472B6'
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'serif': ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      }
    }
  },
  plugins: [],
}