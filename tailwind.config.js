/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0a2436",   // Bleu turquoise foncé
        secondary: "#0b2237", // Bleu nuit profond
        light: "#ebf1f3",     // Blanc légèrement teinté
        grayBlue: "#bdced3",  // Gris bleuté doux
        grayLight: "#d2dde1", // Gris bleuté clair
        greenLight: "#037082", // Gris bleuté clair
        checkgreen: "#26b1ab",
        checkred: "#b12626",
      },
    },
  },
  plugins: [],
};
