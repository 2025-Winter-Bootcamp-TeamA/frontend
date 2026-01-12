import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        wave: {
          '0%': { transform: 'translateX(-90px)' },
          '100%' : { transform: 'translateX(85px)' },
        }
      },
      animation: {
        'wave-slow': 'wave 20s linear infinite',
        'wave-mid': 'wave 15s linear infinite',
        'wave-fast': 'wave 10s linear infinite',
      },
      colors: {
        // 브랜드 컬러
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // 시맨틱 컬러
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'ui-sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
