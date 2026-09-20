import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#080706',
        ink: '#0D0C09',
        gold: {
          200: '#F2C14E',
          400: '#D89B22',
          500: '#FFD66B',
        },
        ivory: '#FFF8E7',
        champagne: '#BEB6A3',
      },
      boxShadow: {
        glow: '0 0 35px rgba(242, 193, 78, 0.18)',
      },
      borderRadius: {
        xl: '1.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
