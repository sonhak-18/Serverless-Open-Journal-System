/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        academic: {
          navy: '#0f284e',
          'navy-dark': '#0a1a33',
          'navy-light': '#183e6d',
          teal: '#16707a',
          'teal-light': '#1d8794',
          gold: '#c89b3c',
          'gold-dark': '#b0842b',
          crimson: '#881337',
          paper: '#f8fafc',
          ink: '#0f172a',
          'ink-muted': '#334155',
          'ink-subtle': '#64748b',
          border: '#e2e8f0',
          'border-strong': '#cbd5e1',
        },
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        serif: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
