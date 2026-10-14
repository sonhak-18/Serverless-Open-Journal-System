/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        academic: {
          navy: '#122033',
          'navy-dark': '#0b1420',
          'navy-light': '#1c314e',
          crimson: '#7a1723',
          'crimson-light': '#982230',
          'crimson-subtle': '#fdf2f2',
          paper: '#fcfbf9',
          'paper-muted': '#f4f3ef',
          ink: '#1e293b',
          'ink-muted': '#475569',
          'ink-subtle': '#64748b',
          border: '#e2e8f0',
          'border-strong': '#cbd5e1',
        },
      },
      fontFamily: {
        serif: ['Charter', 'Bitstream Charter', 'Sitka Text', 'Cambria', 'Georgia', 'serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
