/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#E51D2A',
          bright: '#EF2A39',
          deep: '#CA101C',
          soft: '#FB5767',
        },
        app: {
          bg: '#FFFFFF',
          surface: '#F3F4F6',
          chipBg: '#F5F5F5',
          line: '#E9E9EE',
          ink: '#141417',
          inkSoft: '#374957',
          muted: '#8E8E8E',
          faint: '#928989',
          chipText: '#6A6A6A',
          success: '#34A853',
          warning: '#FBBC05',
          danger: '#E51D2A',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        lobster: ['Lobster', 'cursive'],
      },
      boxShadow: {
        soft: '0 6px 18px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};
