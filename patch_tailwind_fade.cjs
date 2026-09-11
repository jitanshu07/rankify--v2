const fs = require('fs');
let config = fs.readFileSync('tailwind.config.js', 'utf8');

config = config.replace(
  /'pop-in': \{/,
  `'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pop-in': {`
);

config = config.replace(
  /'pop-in': 'pop-in 0\.25s ease-out forwards',/,
  `'pop-in': 'pop-in 0.25s ease-out forwards',
        'fade-in': 'fade-in 0.2s ease-out forwards',`
);

fs.writeFileSync('tailwind.config.js', config);
