const fs = require('fs');
const path = require('path');

console.log('Setting up Tailwind CSS...');

// Create Tailwind config if it doesn't exist
const tailwindConfigPath = path.join(__dirname, 'tailwind.config.js');
if (!fs.existsSync(tailwindConfigPath)) {
  console.log('Creating tailwind.config.js...');
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}`;
  
  fs.writeFileSync(tailwindConfigPath, tailwindConfig);
  console.log('✓ tailwind.config.js created');
}

// Create src directory if it doesn't exist
const srcDir = path.join(__dirname, 'src');
if (!fs.existsSync(srcDir)) {
  fs.mkdirSync(srcDir, { recursive: true });
  console.log('✓ src directory created');
}

// Create components directory if it doesn't exist
const componentsDir = path.join(srcDir, 'components');
if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
  console.log('✓ components directory created');
}

// Create contexts directory if it doesn't exist
const contextsDir = path.join(srcDir, 'contexts');
if (!fs.existsSync(contextsDir)) {
  fs.mkdirSync(contextsDir, { recursive: true });
  console.log('✓ contexts directory created');
}

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('✓ public directory created');
}

console.log('✓ Tailwind CSS setup complete!');
console.log('✓ Project structure created');
console.log('');
console.log('Next steps:');
console.log('1. Run: npm start');
console.log('2. Open http://192.168.29.242:3000');
console.log('3. Make sure Flask backend is running on port 5000');
