// Rasterize the code-native SVG. No external images or fonts are needed.
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.FLUENCY_PLAYWRIGHT || 'playwright');
(async () => {
  const dir = path.resolve(__dirname, '../assets/icons');
  const source = fs.readFileSync(path.join(dir, 'icon.svg'), 'utf8');
  const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const browser = await chromium.launch({ headless: true, ...(fs.existsSync(chrome) ? { executablePath: chrome } : {}) });
  try {
    const page = await browser.newPage();
    for (const [filename, size, maskable] of [['icon-192.png', 192, false], ['icon-512.png', 512, false], ['apple-touch-icon.png', 180, true], ['icon-maskable-512.png', 512, true]]) {
      const svg = maskable ? source.replace('rx="112"', 'rx="0"') : source;
      const data = await page.evaluate(async ({ svg, size }) => {
        const image = new Image();
        image.src = 'data:image/svg+xml;base64,' + btoa(svg);
        await image.decode();
        const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
        canvas.getContext('2d').drawImage(image, 0, 0, size, size);
        return canvas.toDataURL('image/png').split(',')[1];
      }, { svg, size });
      fs.writeFileSync(path.join(dir, filename), Buffer.from(data, 'base64'));
    }
    console.log('Generated 192px, 512px, maskable and Apple touch icons.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
