/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bloomberg: {
          dark: '#0d1117',
          darker: '#010409',
          panel: '#161b22',
          border: '#30363d',
          text: '#c9d1d9',
          textMuted: '#8b949e',
          accent: '#1f6feb',
          accentHover: '#2f81f6',
          success: '#238636',
          warning: '#d29922',
          danger: '#da3633',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

