#!/usr/bin/env node

/**
 * Generate PWA icons for Dash-Boardie
 * Creates icons in all required sizes with the brand color (#3BC9DB)
 */

const fs = require('fs')
const path = require('path')

// Icon sizes required for PWA
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512, 1024]

// Create icons directory
const iconsDir = path.join(__dirname, '../public/icons')
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

// Simple SVG icon template with cyan gradient and "DB" initials
function createSVGIcon(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3BC9DB;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#38D9A9;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#grad)"/>
  <rect x="${size * 0.1}" y="${size * 0.1}" width="${size * 0.8}" height="${size * 0.8}" rx="${size * 0.15}" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="${size * 0.02}"/>
  <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="${size * 0.4}" fill="white">DB</text>
</svg>`
}

// Generate SVG icons
SIZES.forEach(size => {
  const svg = createSVGIcon(size)
  const filename = path.join(iconsDir, `icon-${size}x${size}.png`)

  // For now, save as SVG - user can convert to PNG
  // In a real setup, you'd use sharp or canvas to convert to PNG
  const svgFile = path.join(iconsDir, `icon-${size}x${size}.svg`)
  fs.writeFileSync(svgFile, svg)
  console.log(`Created: icon-${size}x${size}.svg`)
})

// Also create a favicon.ico placeholder
const faviconSvg = createSVGIcon(32)
fs.writeFileSync(path.join(__dirname, '../public/favicon.svg'), faviconSvg)
console.log('Created: favicon.svg')

console.log('\nNote: SVG icons created. For full PWA support, convert these to PNG.')
console.log('You can use online tools like https://cloudconvert.com/svg-to-png')
console.log('Or install sharp: npm install sharp --save-dev')
