/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**"],
  theme: {
    extend: {
      colors: {
        neon: {
          blue: '#00f3ff',
          purple: '#9d00ff',
          pink: '#ff00f3',
          green: '#00ff66',
          yellow: '#ffde00',
          red: '#ff3e3e',
        },
        digital: {
          dark: '#050530',
          medium: '#101045',
          light: '#1a1a60',
        },
      },
      boxShadow: {
        'neon-blue': '0 0 5px #00f3ff, 0 0 10px #00f3ff',
        'neon-purple': '0 0 5px #9d00ff, 0 0 10px #9d00ff',
        'neon-pink': '0 0 5px #ff00f3, 0 0 10px #ff00f3',
        'neon-green': '0 0 5px #00ff66, 0 0 10px #00ff66',
      },
      backgroundImage: {
        'digital-gradient': 'linear-gradient(to right, #050530, #101045)',
        'neon-gradient': 'linear-gradient(to right, #00f3ff, #9d00ff)',
      },
    },
  },
  plugins: [],
};
