/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Segoe UI", "Tahoma", "Geneva", "Verdana", "sans-serif"],
        heading: ["Poppins", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
