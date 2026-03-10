/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0984e3",
        "primary-hover": "#0773c5",
        danger: "#d63031",
        surface: "#f5f6fa",
        ink: "#2d3436",
        muted: "#636e72",
      },
    },
  },
  plugins: [],
};

