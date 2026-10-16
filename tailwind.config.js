/*
 * Shiftswaper design tokens.
 *
 * `blue` and `gray` are remapped to the brand palette so that every existing
 * screen (dashboards, boards, auth) inherits the new identity without
 * rewriting thousands of utility classes. `primary` / `secondary` are kept as
 * aliases for the same reason.
 */
const ink = {
  50: '#F5F4F9',
  100: '#EBEAF2',
  200: '#D6D4E3',
  300: '#B2AFC8',
  400: '#8A86A6',
  500: '#67638A',
  600: '#4C4872',
  700: '#3A365F',
  800: '#2B2752',
  900: '#201C44',
  950: '#15122F',
  DEFAULT: '#201C44',
};

const brand = {
  50: '#EEF7FF',
  100: '#DCEEFF',
  200: '#BEE0FF',
  300: '#90CBFF',
  400: '#5BB0FF',
  500: '#2998FF',
  600: '#1580EA',
  700: '#1267C0',
  800: '#15559A',
  900: '#17487D',
  950: '#122D4F',
  DEFAULT: '#2998FF',
};

// Warm, paper-like neutrals on the light end that resolve into ink on the dark end.
const neutral = {
  50: '#FAF9F7',
  100: '#F3F1EE',
  200: '#E8E4DF',
  300: '#D8D3CC',
  400: '#A9A4B4',
  500: '#7D7991',
  600: '#5B5776',
  700: '#433F64',
  800: '#2F2B54',
  900: '#201C44',
  950: '#15122F',
};

const sand = {
  50: '#FBFAF9',
  100: '#F7F4F1',
  200: '#F2EEE9',
  300: '#E8E1D8',
  400: '#D9CFC3',
  DEFAULT: '#F2EEE9',
};

const tailwindConfig = {
  content: ['./public/index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink,
        brand,
        sand,
        canvas: '#FBFAF9',
        blue: brand,
        gray: neutral,
        primary: brand,
        secondary: neutral,
        lavender: { DEFAULT: '#EDEAFB', 100: '#F4F2FD', 200: '#EDEAFB', 300: '#DCD6F7', 500: '#7B6FD6', 700: '#4F44A8' },
        mint: { DEFAULT: '#E2F4EE', 100: '#EEF9F5', 200: '#E2F4EE', 300: '#C4E8DB', 500: '#2FA77F', 700: '#1C7255' },
        peach: { DEFAULT: '#FDEBDF', 100: '#FEF4ED', 200: '#FDEBDF', 300: '#F9D4BC', 500: '#E9824A', 700: '#A6522A' },
        butter: { DEFAULT: '#FCF3D7', 100: '#FEF9EA', 200: '#FCF3D7', 300: '#F7E3A6', 500: '#D9A514', 700: '#8F6B06' },
        rose: { DEFAULT: '#FCE7EA', 100: '#FEF2F4', 200: '#FCE7EA', 300: '#F7C8D0', 500: '#E0566E', 700: '#A3304A' },
      },
      fontFamily: {
        sans: ['"Rethink Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Aleo', 'Georgia', 'serif'],
        primary: ['"Rethink Sans"', 'system-ui', 'sans-serif'],
        heading: ['Aleo', 'Georgia', 'serif'],
      },
      maxWidth: {
        site: '1368px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '3rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(32, 28, 68, 0.04), 0 8px 24px -12px rgba(32, 28, 68, 0.12)',
        lift: '0 2px 4px rgba(32, 28, 68, 0.04), 0 24px 48px -20px rgba(32, 28, 68, 0.22)',
        float: '0 30px 80px -30px rgba(32, 28, 68, 0.35), 0 8px 20px -8px rgba(32, 28, 68, 0.12)',
        ring: '0 0 0 4px rgba(41, 152, 255, 0.18)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        progress: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.5s ease-out both',
        'scale-in': 'scale-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-down': 'slide-down 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
};

module.exports = tailwindConfig;
