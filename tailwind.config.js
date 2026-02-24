/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./api/**/*.ts",
        "./stores/**/*.{js,ts,tsx}",
        "./utils/**/*.{js,ts,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}
