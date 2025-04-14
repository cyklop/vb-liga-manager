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
    // Plugins are now primarily handled in CSS via @import
    // Keep this empty unless needed for specific JS-based plugins
  ],
};
