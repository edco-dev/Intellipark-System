module.exports = {
  content: [
    "/index.html",
    "/public/pages/dashboard/dashboard.html",
    "/public/pages/drivers-info.html",
    "/public/pages/vehicles-in.html",
    "/public/pages/history.html",
    "/public/pages/registration/register.html",
    "/public/pages/registration/visitor.html",
    "/src/css/dashboard.css",
    "/src/css/drivers-info.css",
    "/src/css/vehicles-in.css",
    "/src/css/history.css",
    "/src/css/register.css",
    "/src/css/visitor.css",
    "/src/css/animation.css",
    "/src/js/index.js",
    "/src/js/dashboard.js",
    "/src/js/drivers-info.js",
    "/src/js/vehicles-in.js",
    "/src/js/history.js",
    "/src/js/register.js",
    "/src/js/visitor.js",
    "/src/**/*.{js,jsx,ts,tsx,vue}",
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
