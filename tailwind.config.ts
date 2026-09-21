import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        void: '#010100',
        obsidian: '#070604',
        panel: '#14110C',
        gold: {
          star: '#FFF1B8',
          bright: '#FFD56A',
          primary: '#E8B020',
          deep: '#C49218',
          bronze: '#8A6910',
        },
        pearl: '#F6F0E4',
        champagne: '#C4B59A',
      },
      boxShadow: {
        glow: '0 0 40px rgba(232, 176, 32, 0.22)',
        'glow-strong': '0 0 55px rgba(255, 213, 106, 0.32)',
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'Arial', 'Helvetica', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
