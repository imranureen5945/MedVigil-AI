/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'teal-primary': '#0D9488',
        'blue-primary': '#1D4ED8',
        'med-navy': '#0A192F',
        'med-dark': '#061325',
        'med-blue': '#0F2D4A',
        'med-indigo': '#1E293B',
        'sea-green': '#0D9488',
        'sea-emerald': '#10B981',
        'sea-light': '#2DD4BF',
        'sea-teal': '#14B8A6',
        'safe': '#10B981',
        'moderate': '#F59E0B',
        'critical': '#EF4444',
        'bg-primary': '#F1F5F9',
        'bg-surface': '#F8FAFC',
        'bg-card': '#FFFFFF',
      },
      borderRadius: {
        'card': '20px',
        'btn': '14px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(15, 45, 74, 0.08)',
        'glass-hover': '0 12px 40px 0 rgba(13, 148, 136, 0.16)',
        'elevated': '0 10px 30px -5px rgba(10, 25, 47, 0.08)',
        'subtle': '0 2px 10px rgba(10, 25, 47, 0.04)',
        'glow-teal': '0 0 25px rgba(13, 148, 136, 0.25)',
        'glow-blue': '0 0 25px rgba(29, 78, 216, 0.25)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fadeIn': 'fadeIn 0.4s ease-in-out',
        'slideUp': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'scaleIn': 'scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 15px rgba(239, 68, 68, 0)' },
          '100%': { transform: 'scale(0.8)', boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
