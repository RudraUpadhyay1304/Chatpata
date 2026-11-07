/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-surface": "#181c20",
        "on-surface-variant": "#434654",
        "primary": "#004bc5",
        "primary-container": "#2764e8",
        "background": "#f8faff",
        "surface-container": "#eceef3",
        "surface-container-low": "#f1f4f9",
        "surface-container-lowest": "#ffffff",
        "outline-variant": "#e2e6ed",
        "outline": "#737686",
        "secondary-fixed": "#d8e2ff",
        "on-secondary-fixed": "#001a42",
      },
      fontFamily: {
        "headline": ["Manrope", "sans-serif"],
        "body": ["Inter", "sans-serif"],
      },
      boxShadow: {
        "custom": "0 1px 3px 0 rgba(23, 45, 85, 0.05), 0 4px 16px -2px rgba(23, 45, 85, 0.05)",
        "level1": "0 2px 6px -1px rgba(23, 45, 85, 0.04), 0 4px 20px -2px rgba(23, 45, 85, 0.06)",
        "level2": "0 8px 24px -4px rgba(23, 45, 85, 0.08), 0 4px 12px -2px rgba(23, 45, 85, 0.04)",
        "level3": "0 20px 32px -8px rgba(23, 45, 85, 0.12), 0 8px 16px -4px rgba(23, 45, 85, 0.06)",
      }
    },
  },
  plugins: [],
}

