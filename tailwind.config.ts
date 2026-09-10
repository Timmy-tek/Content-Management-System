import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F7F5EF",
        foreground: "#1E1E1E",
        header: {
          dark: "#3C3935",
          border: "#2C2A27",
        },
        surface: {
          DEFAULT: "#F7F5EF",
          canvas: "#F5F5F3",
          card: "#FFFFFF",
          border: "#E8E6DF",
          muted: "#EFECE6",
        },
        accent: {
          yellow: "#E8EB2A",
          yellowHover: "#D6D922",
          dark: "#2B2B2B",
        },
        muted: {
          DEFAULT: "#7D7D7D",
          light: "#A3A199",
          dark: "#383632",
        },
      },
      borderRadius: {
        "3xl": "1.75rem", // 28px
        "2xl": "1.5rem",  // 24px
        "xl": "1.125rem", // 18px
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-space)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
