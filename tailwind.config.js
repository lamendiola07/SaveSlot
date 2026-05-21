/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
        shantell: ['Shantell Sans', 'sans-serif'],
        amethysta: ['Amethysta', 'serif'],
        'young-serif': ['Young Serif', 'serif'],
        aclonica: ['Aclonica', 'sans-serif'],
        taviraj: ['Taviraj', 'serif'],
        inria: ['Inria Serif', 'serif'],
        flow: ['Inter', 'sans-serif'],
      },
      colors: {
        brown: {
          dark: '#45413e',
          medium: '#564242',
        },
      },
    },
  },
  plugins: [],
}
