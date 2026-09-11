const fs = require('fs');

let config = fs.readFileSync('tailwind.config.js', 'utf8');

if (!config.includes('keyframes: {')) {
  config = config.replace(
    /extend: \{/,
    `extend: {
      keyframes: {
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'pop-in': 'pop-in 0.25s ease-out forwards',
      },`
  );
  fs.writeFileSync('tailwind.config.js', config);
}
