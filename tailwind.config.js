/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        logotype: ["Pacifico", "cursive"],
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-in-out",
        fadeInUp: "fadeInUp 0.5s ease-in-out",
        twinkle: "twinkle 2s infinite ease-in-out",
        sway: "sway 5s infinite ease-in-out alternate",
        boingIn: "boingIn 0.5s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        twinkle: {
          "0%, 100%": { opacity: 0.5, transform: "scale(0.9)" },
          "50%": { opacity: 1, transform: "scale(1)" },
        },
        sway: {
          "0%": { transform: "rotate(-2deg) translateX(-1px)" },
          "100%": { transform: "rotate(2deg) translateX(1px)" },
        },
        boingIn: {
          "0%": { opacity: "0", transform: "scale(0.5)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
          "70%": { transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
