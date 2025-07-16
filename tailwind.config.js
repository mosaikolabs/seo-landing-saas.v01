/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
    "./public/**/*.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#D4AF37',    // Oro joyero
        secondary: '#0F4C81', // Azul confianza
        accent: '#C53030',    // Rojo urgencia
        dark: '#1a1a1a',      // Fondo oscuro
        light: '#f8f9fa'      // Fondo claro
      },
      fontFamily: {
        display: ['Evolventa', 'Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      },
      animation: {
        'ticker': 'ticker 20s linear infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      }
    },
  },
  plugins: [],
}

