import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#e8b04b",
          100: "#d4a043",
          500: "#e8b04b",
          600: "#e8b04b",
          700: "#d4a043"
        }
      }
    }
  },
  plugins: []
};

export default config;
