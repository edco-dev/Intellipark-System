module.exports = {
  content: [
    "./index.html",
    "./public/pages/dashboard/dashboard.html",
    "./public/pages/drivers-info.html",
    "./public/pages/vehicles-in.html",
    "./public/pages/history.html",
    "./public/pages/visitor.html",
    "./src/**/*.{js,jsx,ts,tsx,vue}",
  ],
  theme: {
    extend: {
      animation: {
      'fade-in': 'fadeIn 1s ease-in-out', // custom fade-in animation
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
