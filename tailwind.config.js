// tailwind.config.js
const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/components/(date-input|date-picker|button|ripple|spinner|calendar|popover).js"
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [nextui()]
}