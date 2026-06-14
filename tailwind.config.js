/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        pixel: {
          bg: "#0D0B1F",
          surface: "#1A1635",
          card: "#2D1B4E",
          border: "#4A3A6B",
          neon: {
            pink: "#FF6B9D",
            cyan: "#64FFDA",
            yellow: "#FFE66D",
            orange: "#FF8C42",
            purple: "#C77DFF",
          },
          text: {
            primary: "#F5F3FF",
            secondary: "#A78BFA",
            muted: "#7C6A9E",
          },
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        vt: ['"VT323"', 'monospace'],
        zpix: ['"Zpix"', '"Press Start 2P"', 'monospace'],
      },
      boxShadow: {
        'neon-pink': '0 0 20px rgba(255, 107, 157, 0.5), 0 0 40px rgba(255, 107, 157, 0.3)',
        'neon-cyan': '0 0 20px rgba(100, 255, 218, 0.5), 0 0 40px rgba(100, 255, 218, 0.3)',
        'neon-yellow': '0 0 20px rgba(255, 230, 109, 0.5), 0 0 40px rgba(255, 230, 109, 0.3)',
        'pixel-border': '4px 4px 0 0 #0D0B1F',
        'pixel-border-hover': '6px 6px 0 0 #0D0B1F',
      },
      animation: {
        'scanline': 'scanline 8s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'pixel-bounce': 'pixelBounce 0.3s ease-in-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'pixel-shake': 'pixelShake 0.3s ease-in-out',
        'scan': 'scan 3s ease-in-out infinite',
      },
      keyframes: {
        scanline: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 100%' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        pixelBounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px currentColor' },
          '50%': { boxShadow: '0 0 30px currentColor, 0 0 50px currentColor' },
        },
        pixelShake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-2px)' },
          '75%': { transform: 'translateX(2px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [],
};
