export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0D1117',
        surface: '#141A22',
        'surface-raised': '#1B222C',
        border: '#232B36',
        text: '#E8EAED',
        muted: '#8B96A5',
        accent: '#D4A017',
        'accent-muted': '#4A3F1F',
        buy: '#16C784',
        sell: '#EA3943',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
