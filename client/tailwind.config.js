/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Deep space background
        void:    '#04060F',
        abyss:   '#060818',
        deep:    '#080C1A',
        chamber: '#0A0E1F',
        // Glass surfaces
        glass: {
          '1': 'rgba(255,255,255,0.02)',
          '2': 'rgba(255,255,255,0.04)',
          '3': 'rgba(255,255,255,0.07)',
          '4': 'rgba(255,255,255,0.10)',
        },
        // Neon accents
        neon: {
          purple:  '#8B5CF6',
          violet:  '#A855F7',
          blue:    '#3B82F6',
          cyan:    '#06B6D4',
          teal:    '#14B8A6',
          magenta: '#D946EF',
          pink:    '#EC4899',
        },
        // Status
        glow: {
          green:  '#10B981',
          red:    '#EF4444',
          yellow: '#F59E0B',
          orange: '#F97316',
        },
        // Legacy (keep existing pages working)
        canvas: '#0C0C0C',
        surface: { DEFAULT: '#141414', raised: '#1C1C1C', overlay: '#242424', border: '#2E2E2E' },
        ink: { DEFAULT: '#E8E8E8', secondary: '#A0A0A0', muted: '#606060', inverse: '#0C0C0C' },
        accent: { DEFAULT: '#0F766E', light: '#14B8A6', dim: '#0D5D57', subtle: '#0F766E1A' },
        easy: '#22C55E', medium: '#F59E0B', hard: '#EF4444',
        line: '#1F1F1F', 'line-strong': '#2A2A2A',
      },
      backgroundImage: {
        'neon-purple-glow': 'radial-gradient(ellipse at center, rgba(139,92,246,0.15) 0%, transparent 70%)',
        'neon-cyan-glow':   'radial-gradient(ellipse at center, rgba(6,182,212,0.15) 0%, transparent 70%)',
        'neon-grid': 'linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px)',
      },
      boxShadow: {
        'neon-purple': '0 0 20px rgba(139,92,246,0.4), 0 0 40px rgba(139,92,246,0.2)',
        'neon-cyan':   '0 0 20px rgba(6,182,212,0.4), 0 0 40px rgba(6,182,212,0.2)',
        'neon-sm':     '0 0 8px rgba(139,92,246,0.3)',
        'glass':       '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
        'glass-lg':    '0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.07)',
      },
      animation: {
        'float':        'float 6s ease-in-out infinite',
        'float-slow':   'float 10s ease-in-out infinite',
        'float-fast':   'float 4s ease-in-out infinite',
        'pulse-neon':   'pulseNeon 2s ease-in-out infinite',
        'spin-slow':    'spin 20s linear infinite',
        'spin-reverse': 'spinReverse 15s linear infinite',
        'orbit':        'orbit 8s linear infinite',
        'glow-pulse':   'glowPulse 3s ease-in-out infinite',
        'scan-line':    'scanLine 2s linear infinite',
        'waveform':     'waveform 1.5s ease-in-out infinite',
        'fade-up':      'fadeUp 0.4s ease-out',
        'scale-in':     'scaleIn 0.3s ease-out',
        'energy-flow':  'energyFlow 3s linear infinite',
        'breathe':      'breathe 4s ease-in-out infinite',
      },
      keyframes: {
        float:        { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-12px)' } },
        pulseNeon:    { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
        spinReverse:  { from: { transform: 'rotate(360deg)' }, to: { transform: 'rotate(0deg)' } },
        orbit:        { from: { transform: 'rotate(0deg) translateX(60px) rotate(0deg)' }, to: { transform: 'rotate(360deg) translateX(60px) rotate(-360deg)' } },
        glowPulse:    { '0%,100%': { boxShadow: '0 0 20px rgba(139,92,246,0.3)' }, '50%': { boxShadow: '0 0 40px rgba(139,92,246,0.7), 0 0 80px rgba(139,92,246,0.3)' } },
        scanLine:     { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100vh)' } },
        waveform:     { '0%,100%': { transform: 'scaleY(0.3)' }, '50%': { transform: 'scaleY(1)' } },
        fadeUp:       { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:      { from: { opacity: '0', transform: 'scale(0.9)' }, to: { opacity: '1', transform: 'scale(1)' } },
        energyFlow:   { '0%': { strokeDashoffset: '1000' }, '100%': { strokeDashoffset: '0' } },
        breathe:      { '0%,100%': { transform: 'scale(1)', opacity: '0.8' }, '50%': { transform: 'scale(1.05)', opacity: '1' } },
      },
      borderRadius: { sm: '4px', DEFAULT: '6px', md: '8px', lg: '12px', xl: '16px', '2xl': '24px' },
      maxWidth: { content: '720px', wide: '1040px', page: '1280px' },
    },
  },
  plugins: [],
};
