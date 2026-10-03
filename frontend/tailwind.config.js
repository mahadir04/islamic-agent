module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        green: {
          50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0',
          300: '#86efac', 400: '#4ade80', 500: '#22c55e',
          600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d',
        },
        emerald: {
          50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0',
          300: '#6ee7b7', 400: '#34d399', 500: '#10b981',
          600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b',
        },
      },
      animation: {
        'fade-in'   : 'fadeIn 0.4s ease-out both',
        'slide-up'  : 'slideUp 0.4s ease-out both',
        'slide-down': 'slideDown 0.3s ease-out both',
        'scale-in'  : 'scaleIn 0.25s ease-out both',
        'float'     : 'float 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow' : 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn    : { '0%': { opacity: '0', transform: 'translateY(8px)'  }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideUp   : { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideDown : { '0%': { opacity: '0', transform: 'translateY(-10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn   : { '0%': { opacity: '0', transform: 'scale(0.95)'   }, '100%': { opacity: '1', transform: 'scale(1)'    } },
        float     : { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
      },
      backdropBlur: { xs: '2px' },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic' : 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      transitionDelay: {
        '75'  : '75ms',
        '150' : '150ms',
        '225' : '225ms',
        '400' : '400ms',
        '500' : '500ms',
        '600' : '600ms',
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-emerald-500/10', 'bg-emerald-500/15', 'bg-emerald-500/20',
    'bg-emerald-500/8', 'border-emerald-500/15', 'border-emerald-500/20',
    'bg-blue-500/10', 'border-blue-500/15', 'bg-amber-500/10', 'border-amber-500/15',
    'text-emerald-400', 'text-emerald-300', 'text-emerald-700',
    'from-emerald-500/10', 'to-green-600/5', 'from-blue-500/10', 'to-cyan-600/5',
    'from-amber-500/10', 'to-orange-600/5',
    'delay-75', 'delay-150', 'delay-225', 'delay-300', 'delay-400', 'delay-500', 'delay-600',
  ],
}