// Optional maintenance: fix PNG data accidentally named .webp, without losing pixels.
// Requires sharp; set ARTICULATION_SHARP to its installed module path if needed.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const sharp = require(process.env.ARTICULATION_SHARP || 'sharp');
const images = path.resolve(__dirname, '../assets/images');
(async () => {
  const backup = fs.mkdtempSync(path.join(os.tmpdir(), 'articulation-original-pictures-'));
  let before = 0, after = 0, changed = 0;
  for (let number = 1; number <= 69; number++) {
    const name = `${number}.webp`, file = path.join(images, name);
    const source = fs.readFileSync(file); before += source.length;
    if (source.toString('ascii', 0, 4) === 'RIFF' && source.toString('ascii', 8, 12) === 'WEBP') { after += source.length; continue; }
    if (!source.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw new Error('Unknown image format: ' + name);
    fs.writeFileSync(path.join(backup, name), source);
    const output = await sharp(source).webp({ lossless: true, effort: 6 }).toBuffer();
    const originalPixels = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const convertedPixels = await sharp(output).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    assert.deepEqual(convertedPixels.info, originalPixels.info);
    assert.ok(convertedPixels.data.equals(originalPixels.data), 'Lossless pixel check: ' + name);
    fs.writeFileSync(file, output); after += output.length; changed++;
  }
  console.log(`Converted ${changed} images with identical RGBA pixels: ${(before/1024/1024).toFixed(1)} → ${(after/1024/1024).toFixed(1)} MiB. Originals: ${backup}`);
})().catch(error => { console.error(error); process.exitCode = 1; });
