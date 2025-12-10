const fs = require('fs');
const path = require('path');

// Read CSS files and concatenate them
const toastifyPath = path.join(__dirname, 'node_modules', 'toastify-js', 'src', 'toastify.css');
const siteCssPath = path.join(__dirname, 'wwwroot', 'css', 'site.css');
const outputPath = path.join(__dirname, 'wwwroot', 'css', 'bundle-global.css');
const minifiedPath = path.join(__dirname, 'wwwroot', 'css', 'bundle-global.min.css');

const toastify = fs.readFileSync(toastifyPath, 'utf8');
const siteCss = fs.readFileSync(siteCssPath, 'utf8');

const bundle = toastify + '\n\n/* site.css */\n' + siteCss;

// Write bundled CSS (non-minified)
fs.writeFileSync(outputPath, bundle, 'utf8');
console.log('✓ Created bundle-global.css');

// Minify (simple minification - remove comments and extra whitespace)
const minified = bundle
    .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '')  // Remove comments
    .replace(/\s+/g, ' ')                                   // Collapse whitespace
    .replace(/\s*{\s*/g, '{')                              // Clean braces
    .replace(/;\s*/g, ';')                                  // Clean semicolons
    .replace(/\s*}\s*/g, '}')                              // Clean closing braces
    .replace(/\s*:\s*/g, ':')                              // Clean colons
    .replace(/\s*>\s*/g, '>')                              // Clean greater than
    .replace(/\s*,\s*/g, ',')                              // Clean commas
    .trim();

fs.writeFileSync(minifiedPath, minified, 'utf8');
console.log('✓ Created bundle-global.min.css');

