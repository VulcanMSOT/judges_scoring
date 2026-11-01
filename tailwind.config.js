/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        pumpkin: {
          DEFAULT: '#ff7a1a',
          hover: '#e5680d',
          glow: 'rgba(255, 122, 26, 0.25)',
        },
      },
    },
  },
  plugins: [],
};
