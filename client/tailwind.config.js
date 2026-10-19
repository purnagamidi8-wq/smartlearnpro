/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#12172B',
        indigo: {
          DEFAULT: '#4338CA',
          50: '#EEF0FD',
          100: '#E0E4FB',
          600: '#4338CA',
          700: '#362DA0',
        },
        cyan: {
          DEFAULT: '#06B6D4',
          50: '#ECFEFF',
        },
        surface: '#F7F8FB',
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
