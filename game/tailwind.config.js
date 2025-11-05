/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Network layer colors
        layer2: '#3B82F6', // Blue for MAC/Layer 2
        layer3: '#10B981', // Green for IP/Layer 3
        layer4: '#F59E0B', // Orange for Ports/Layer 4
        vlan1: '#8B5CF6', // Purple for VLAN
        vlan2: '#EAB308', // Yellow for VLAN alt
      },
      animation: {
        'packet-move': 'packet-move 0.8s ease-in-out',
        'fade-in': 'fade-in 0.3s ease-in',
      },
      keyframes: {
        'packet-move': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '50%': { transform: 'translateY(-10px)', opacity: '0.8' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
