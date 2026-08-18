/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          DEFAULT: '#4F46E5',
        },
        accent: {
          DEFAULT: '#FACC15',
          dark: '#EAB308',
          light: '#FEF9C3',
        },
        ink: '#0F172A',
        muted: '#64748B',
        line: '#E2E8F0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
        lift: '0 4px 8px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.10)',
        glow: '0 0 0 4px rgba(79,70,229,0.20)',
        glowAccent: '0 0 0 4px rgba(250,204,21,0.25)',
        glowEmerald: '0 0 0 4px rgba(16,185,129,0.20)',
        card: '0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)',
        cardHover: '0 4px 12px rgba(0,0,0,0.06), 0 16px 40px rgba(0,0,0,0.10)',
        navbar: '0 1px 3px rgba(0,0,0,0.05)',
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite linear',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #312E81 0%, #4338CA 40%, #4F46E5 70%, #6366F1 100%)',
        'hero-mesh': 'radial-gradient(at 20% 80%, rgba(16,185,129,0.15) 0%, transparent 50%), radial-gradient(at 80% 20%, rgba(99,102,241,0.20) 0%, transparent 50%), radial-gradient(at 50% 50%, rgba(250,204,21,0.08) 0%, transparent 50%)',
        'card-gradient': 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(248,250,252,0.5) 100%)',
        'auth-gradient': 'linear-gradient(135deg, #312E81 0%, #4F46E5 50%, #6366F1 100%)',
        'stat-gradient': 'linear-gradient(135deg, #EEF2FF 0%, #ECFDF5 100%)',
      },
    },
  },
  plugins: [],
};
