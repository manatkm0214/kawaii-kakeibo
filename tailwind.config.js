/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          50: '#FFF0F5',
          100: '#FFE4ED',
          200: '#FFBDD4',
          300: '#FF9BB5',
          400: '#FF7096',
          500: '#FF4477',
        },
        mint: {
          50: '#F0FBF5',
          100: '#E0F7EC',
          200: '#B8EED5',
          300: '#A8E6CF',
          400: '#6DD5A8',
          500: '#3CB881',
        },
        lavender: {
          50: '#F5F0FC',
          100: '#EDE8FA',
          200: '#D8CCF0',
          300: '#C8B8E8',
          400: '#A890D8',
          500: '#8864C8',
        },
        sky: {
          50: '#F0F8FF',
          100: '#E0F2FF',
          200: '#BAE3FF',
          300: '#87CEEB',
          400: '#5BA3C9',
          500: '#2B7AA8',
        },
        lemon: {
          50: '#FFFEF0',
          100: '#FFFDE7',
          200: '#FFF9B0',
          300: '#FFF3B0',
          400: '#FFE566',
          500: '#FFD700',
        },
        peach: {
          50: '#FFF5F0',
          100: '#FFEEE5',
          200: '#FFDABD',
          300: '#FFAA80',
          400: '#FF8550',
          500: '#FF6020',
        },
        cream: '#FFF8E7',
      },
      fontFamily: {
        sans: ['"Hiragino Kaku Gothic ProN"', '"Hiragino Sans"', '"Noto Sans JP"', '"Yu Gothic"', 'Meiryo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
