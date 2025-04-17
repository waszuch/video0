/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        microgamma: ["var(--font-microgamma)"],
        archivo: ["var(--font-archivo)"],
      },
      animation: {
        'scroll-up': 'scrollUp 25s linear infinite',
        'scroll-down': 'scrollDown 20s linear infinite',
        'scroll-up-fast': 'scrollUp 15s linear infinite',
      },
      keyframes: {
        scrollUp: {
          '0%': { transform: 'translateY(0%)' },
          '100%': { transform: 'translateY(-100%)' },
        },
        scrollDown: {
          '0%': { transform: 'translateY(0%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [],
}; 