/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#F5F0E8',
          200: '#F0EBE1',
          300: '#E5DFD3',
        },
        forest: {
          700: '#2C3E2D',
          600: '#3D5240',
          500: '#5A6B5C',
          400: '#7A8B7C',
        },
        rust: {
          DEFAULT: '#C76B4A',
          light: '#D4896D',
          dark: '#A85636',
        },
        sage: {
          DEFAULT: '#8BA888',
          light: '#A8C4A5',
          dark: '#6E8B6B',
        },
        gold: {
          DEFAULT: '#D4A843',
          light: '#E0BE6A',
          dark: '#B08C30',
        },
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      fontSize: {
        'body': ['1rem', { lineHeight: '1.7' }],
      },
      maxWidth: {
        'article': '720px',
        'wide': '1200px',
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': '#2C3E2D',
            '--tw-prose-headings': '#2C3E2D',
            '--tw-prose-links': '#C76B4A',
            '--tw-prose-code': '#2C3E2D',
          },
        },
      },
    },
  },
  plugins: [],
};
