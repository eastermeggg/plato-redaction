import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Crimson Text", "Georgia", "serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      colors: {
        brand: {
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#EA681E",
          600: "#C2571A",
        },
        accent: {
          purple: "#8B5CF6",
          green: "#16A34A",
        },
        plato: {
          dk: "#292524",
          dk6: "#78716C",
          dk4: "#A8A29E",
          bd: "#E7E5E3",
          bg: "#F8F7F5",
        },
      },
    },
  },
  plugins: [],
};
export default config;
