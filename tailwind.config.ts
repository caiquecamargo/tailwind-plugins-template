import type { Config } from 'tailwindcss';
import plugin from './lib';

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        emphasis: 'rgb(var(--color-emphasis) / <alpha-value>)',
        background: 'rgb(var(--color-background) / <alpha-value>)',
        secondary: '#2A2A2C',
        tertiary: 'rgb(134 25 143)',
        quaternary: 'rgb(255, 255, 255)',
      },
    },
  },
  plugins: [plugin({ colors: ['primary', 'emphasis', 'background', 'secondary', 'tertiary', 'quaternary'] })],
} satisfies Config;
