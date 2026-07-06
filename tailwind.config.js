/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dbe7fe",
          300: "#a9c4fb",
          400: "#5b8def",
          500: "#3b6fe0",
          600: "#2c58c4",
          700: "#24469b",
        },
        ok: {
          50: "#ecfdf3",
          500: "#12b76a",
          700: "#087443",
        },
        warn: {
          50: "#fffaeb",
          500: "#f79009",
          700: "#b54708",
        },
        danger: {
          50: "#fef3f2",
          500: "#f04438",
          700: "#b42318",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};
