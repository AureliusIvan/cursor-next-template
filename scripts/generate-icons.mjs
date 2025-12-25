#!/usr/bin/env node
/**
 * Simple script to generate PWA icons
 * This creates simple colored square icons as placeholders
 * Replace with actual app icons for production
 */

import { join } from "path";
import sharp from "sharp";

// Simple SVG template for icons
const createSVGIcon = (size, color = "#000000") => {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${color}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.3}" fill="white" text-anchor="middle" dominant-baseline="middle" font-weight="bold">N</text>
</svg>`;
};

const sizes = [192, 512];
const outputDir = join(process.cwd(), "public", "icons");

// Create PNG icons from SVG
for (const size of sizes) {
  const svgContent = createSVGIcon(size);
  const pngPath = join(outputDir, `icon-${size}x${size}.png`);

  await sharp(Buffer.from(svgContent)).resize(size, size).png().toFile(pngPath);

  console.log(`Created ${pngPath}`);
}

console.log("\nPWA icons generated successfully!");
