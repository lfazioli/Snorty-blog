/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
       fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
    slideIn: { "0%": { transform: "translateY(20px)", opacity: 0 }, "100%": { transform: "translateY(0)", opacity: 1 } },
    slideInLeft: { "0%": { transform: "translateX(-100px)", opacity: 0 }, "100%": { transform: "translateX(0)", opacity: 1 } },
    slideInRight: { "0%": { transform: "translateX(100px)", opacity: 0 }, "100%": { transform: "translateX(0)", opacity: 1 } },
    slideInUp: { "0%": { transform: "translateY(50px)", opacity: 0 }, "100%": { transform: "translateY(0)", opacity: 1 } },
    spinSlow: { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } },
      },
      animation: {
        fadeIn: "fadeIn 0.8s ease-out forwards",
    slideIn: "slideIn 0.8s ease-out forwards",
    slideInLeft: "slideInLeft 0.8s ease-out forwards",
    slideInRight: "slideInRight 0.8s ease-out forwards",
    slideInUp: "slideInUp 0.8s ease-out forwards",
    spinSlow: "spinSlow 10s linear infinite",
      },
    },
  },
  plugins: [],
};
