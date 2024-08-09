/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "../",
    "./src/**/*.{html,js}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins']
      }
    },
  },
  plugins: [
    require('flowbite/plugin')
  ]
}

