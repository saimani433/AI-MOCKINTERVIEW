/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui'],
        body: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        ink: '#07111f',
        mint: '#2ee9a6',
        cyan: '#4cc9f0',
        coral: '#ff7a6b',
        amber: '#ffc857',
      },
      boxShadow: {
        glow: '0 24px 80px rgba(76, 201, 240, 0.26)',
        card: '0 18px 60px rgba(7, 17, 31, 0.12)',
      },
    },
  },
  plugins: [],
}
