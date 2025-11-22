/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    screens: {
      'xsm': '560px',
      'sm': '640px',
      'md': '768px',
      'mob': '850px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {},
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}
