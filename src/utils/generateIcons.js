// Icon Generator for PWA
// This script generates placeholder icons for the PWA

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconDir = path.join(__dirname, '../../public/icons');

// Ensure icons directory exists
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

// Generate SVG icon template
function generateSVGIcon(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1B4F8A;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#C9922A;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad)"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">G</text>
</svg>`;
}

// Generate icons for each size
sizes.forEach(size => {
  const svgContent = generateSVGIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`Generated ${filename}`);
});

// Generate additional icons
const additionalIcons = [
  { name: 'shortcut-dashboard.svg', content: generateShortcutIcon('📊', 96) },
  { name: 'shortcut-members.svg', content: generateShortcutIcon('👥', 96) },
  { name: 'shortcut-attendance.svg', content: generateShortcutIcon('📖', 96) },
  { name: 'shortcut-reports.svg', content: generateShortcutIcon('📄', 96) },
  { name: 'badge-72x72.svg', content: generateBadgeIcon(72) }
];

function generateShortcutIcon(emoji, size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="#1B4F8A"/>
  <text x="50%" y="50%" font-size="${size * 0.5}" text-anchor="middle" dominant-baseline="central">${emoji}</text>
</svg>`;
}

function generateBadgeIcon(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="#C9922A"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">!</text>
</svg>`;
}

additionalIcons.forEach(icon => {
  const filepath = path.join(iconDir, icon.name);
  fs.writeFileSync(filepath, icon.content);
  console.log(`Generated ${icon.name}`);
});

console.log('All PWA icons generated successfully!');