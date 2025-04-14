/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Keep darkMode setting if needed by ThemeProvider logic
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    // Add path for material-tailwind if needed and compatible
    // Example: './node_modules/@material-tailwind/react/components/**/*.{js,ts,jsx,tsx}',
    // Example: './node_modules/@material-tailwind/react/theme/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Theme extensions are now primarily handled in CSS via @theme
      // Keep this minimal or empty unless needed for specific JS-based tooling
    },
  },
  plugins: [
    // Add plugins back here
    require('@tailwindcss/forms')({
      strategy: 'class', // Keep strategy if it was used before
    }),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
    require('daisyui'), // DaisyUI Plugin hinzufügen
  ],
  // DaisyUI Konfiguration hinzufügen
  daisyui: {
    themes: ["light", "dark"], // Gewünschte Themes aktivieren (oder andere wie "cupcake", "dracula")
    darkTheme: "dark", // Explizit das dunkle Theme festlegen
    base: true, // Grundstile anwenden
    styled: true, // DaisyUI Komponentenstile anwenden
    utils: true, // DaisyUI Utility-Klassen anwenden
    logs: true, // Logs anzeigen (hilfreich beim Debuggen)
  },
};
