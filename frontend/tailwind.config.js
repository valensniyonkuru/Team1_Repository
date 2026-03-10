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
        "ping-bg": "#fdfdfd",
        "ping-dark": "#08283b",
        "ping-heading": "#041620",
        "ping-body": "#395362",
        "ping-body-primary": "#08283b",
        "ping-placeholder": "#5a6f7c",
        "ping-input-bg": "#ececeb",
        "ping-input-border": "#b2bcc2",
        "ping-stroke": "#e6eaeb",
        "ping-orange": "#b54000",
        "ping-error-bg": "#fde8e8",
        "ping-error-border": "#c81e1e",
        "ping-error-text": "#c81e1e",
        "ping-badge-bg": "#b2bcc2",
        "ping-badge-stroke": "#395362",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

