/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.ejs", "./views/*.ejs"],
  theme: { extend: {} },
  plugins: [require("daisyui")],
  daisyui: { themes: ["light", "dark"] }
};

