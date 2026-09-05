/** @type {import('tailwindcss').Config} */
module.exports = {
  // Se incluyen utils/ y constants/ porque tambien contienen literales de clase
  // que Tailwind debe ver para no purgarlas en produccion.
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './utils/**/*.{ts,tsx}',
    './constants/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // Opacidades intermedias que la app usa en bordes y superficies de vidrio
      // y que Tailwind no trae por defecto.
      opacity: {
        8: '0.08',
        12: '0.12',
        15: '0.15',
      },
      borderColor: {
        'white/8': 'rgba(255,255,255,0.08)',
        'white/12': 'rgba(255,255,255,0.12)',
        'white/15': 'rgba(255,255,255,0.15)',
      },
    },
  },
  plugins: [],
};
