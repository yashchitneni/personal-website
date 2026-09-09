import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      gridTemplateColumns: {
        '31': 'repeat(31, minmax(0, 1fr))',
        '7': 'repeat(7, minmax(0, 1fr))',
        '14': 'repeat(14, minmax(0, 1fr))',
      },
      aspectRatio: {
        'polaroid': '0.8',
      },
      maxWidth: {
        '7xl': '80rem',
      },
    },
  },
  plugins: [],
};
export default config;
