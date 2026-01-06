// Ce script copie public/runtime-config.json dans dist/ après le build
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../public/runtime-config.json');
const dest = path.join(__dirname, '../dist/runtime-config.json');

if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest);
  console.log('✅ runtime-config.json copié dans dist/');
} else {
  console.log('⚠️ Aucun runtime-config.json à copier');
}
