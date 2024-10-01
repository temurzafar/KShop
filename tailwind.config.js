/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html"],
  future: {
    hoverOnlyWhenSupported: true
  },
  theme: {
    extend: {
      colors: {
        'primary': '#FF63B0',
        'primary-light': '#FFB7DA',
        'primary-light-more': '#FDD6E9',
        'secondary': '#9F8189',
        'tertiary': '#483A45',
      },
    },
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1025px',
      'xl': '1164px',
      '2xl': '1552px',
    },
  },
  plugins: [],
}

