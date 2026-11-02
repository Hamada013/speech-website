// Export the supplied artwork unchanged, with safe padding for maskable icons.
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.SURVEY_PLAYWRIGHT || 'playwright');
const root = path.resolve(__dirname, '..');
(async () => {
    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    try {
        const page = await browser.newPage();
        const source = `data:image/jpeg;base64,${fs.readFileSync(path.join(root, 'assets/logo-source.jpg')).toString('base64')}`;
        const exports = [
            ['logo.png', 1024, 1], ['icon-192.png', 192, 1], ['icon-512.png', 512, 1],
            ['apple-touch-icon.png', 180, 1], ['maskable-192.png', 192, .56], ['maskable-512.png', 512, .56],
            ['favicon-16.png', 16, 1], ['favicon-32.png', 32, 1], ['favicon-48.png', 48, 1]
        ];
        for (const [filename, size, scale] of exports) {
            const encoded = await page.evaluate(async ({ source, size, scale }) => {
                const image = new Image(); image.src = source; await image.decode();
                const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
                const context = canvas.getContext('2d');
                context.fillStyle = '#f4f9fa'; context.fillRect(0, 0, size, size);
                context.imageSmoothingEnabled = true; context.imageSmoothingQuality = 'high';
                const side = size * scale;
                context.drawImage(image, (size - side) / 2, (size - side) / 2, side, side);
                return canvas.toDataURL('image/png').split(',')[1];
            }, { source, size, scale });
            fs.writeFileSync(path.join(root, 'icons', filename), Buffer.from(encoded, 'base64'));
        }
        // ICO directory with PNG frames for browser/bookmark compatibility.
        const sizes = [16, 32, 48], header = Buffer.alloc(6 + sizes.length * 16);
        header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
        let offset = header.length;
        const frames = sizes.map((size, i) => {
            const frame = fs.readFileSync(path.join(root, 'icons', `favicon-${size}.png`)), entry = 6 + i * 16;
            header[entry] = header[entry + 1] = size;
            header.writeUInt16LE(1, entry + 4); header.writeUInt16LE(32, entry + 6);
            header.writeUInt32LE(frame.length, entry + 8); header.writeUInt32LE(offset, entry + 12);
            offset += frame.length; return frame;
        });
        fs.writeFileSync(path.join(root, 'icons/favicon.ico'), Buffer.concat([header, ...frames]));
        fs.rmSync(path.join(root, 'icons/mark.svg'), { force: true });
        console.log('Exported app logo, 192/512 icons, safe maskable icons, Apple touch icon and 16/32/48 favicons.');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
