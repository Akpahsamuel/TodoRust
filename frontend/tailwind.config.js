/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        accent: '#E2FF00',
        warm: '#FF7F3E',
        app: {
          bg: '#000000',
          surface: '#111111',
          'surface-2': '#1a1a1a',
          'surface-3': '#222222',
        },
      },
      borderRadius: {
        'card': '28px',
        '2xl': '20px',
      },
      boxShadow: {
        'accent': '0 4px 24px rgba(226,255,0,0.25)',
        'accent-lg': '0 8px 40px rgba(226,255,0,0.35)',
        'warm': '0 4px 20px rgba(255,127,62,0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out both',
        'slide-up': 'slideUp 0.3s ease-out both',
        'scale-in': 'scaleIn 0.2s ease-out both',
        'shimmer': 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
}
