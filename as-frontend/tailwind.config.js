/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FFB433",      // customize these once you send palette
        secondary: "#80CBC4",
        dark: "#1f2937",
      },
    },
  },
  plugins: [],
};
