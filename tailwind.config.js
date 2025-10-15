/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#6739B7", // your brand color
      },
      fontFamily: {
        'plus-jakarta': ['PlusJakartaSans_400Regular', 'PlusJakartaSans_500Medium', 'PlusJakartaSans_600SemiBold', 'PlusJakartaSans_700Bold'],
        'poppins': ['Poppins_400Regular', 'Poppins_500Medium', 'Poppins_600SemiBold', 'Poppins_700Bold'],
      },
    },
  },
  plugins: [],
};
