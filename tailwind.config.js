/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Palette "security dashboard": grafite freddo + blu segnale.
        night: "#0A0D12",   // sfondo pagina
        panel: "#12161D",   // card / superfici
        panel2: "#1A2029",  // superfici sollevate / hover
        line: "#232A35",    // bordi hairline
        ink: "#E7EBF1",     // testo primario
        dim: "#8992A3",     // testo secondario
        signal: {
          DEFAULT: "#4C8DFF",
          600: "#3B74E0",
        },
        warn: "#E8A33D",    // bozze / avvisi
        danger: "#E5484D",  // eliminazione / errori
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: { "0%": { transform: "translateY(10px)", opacity: 0 }, "100%": { transform: "translateY(0)", opacity: 1 } },
      },
      animation: {
        fadeIn: "fadeIn 0.6s ease-out forwards",
        slideUp: "slideUp 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};
