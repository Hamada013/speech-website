const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium, webkit } = require(process.env.FLUENCY_PLAYWRIGHT || 'playwright');
const root = path.resolve(__dirname, '..');
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
  res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' })[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
const click = (page, name) => page.getByRole('button', { name, exact: true }).click();
async function home(page) {
  while (await page.locator('[data-screen]').getAttribute('data-screen') !== 'home') await click(page, 'Back');
}
async function slower(page) { await click(page, 'Fluency Shaping'); await click(page, 'Slower Rate'); }
async function easy(page) { await click(page, 'Fluency Shaping'); await click(page, 'Easy Onsets'); }
async function run(type, name) {
  const options = { headless: true };
  if (name === 'chromium') {
    if (fs.existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')) options.executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    options.args = ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'];
  }
  const browser = await type.launch(options);
  try {
    let context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    let page = await context.newPage(); page.setDefaultTimeout(8000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
    await click(page, 'Switch to English');
    await slower(page);
    await click(page, 'Numbers');
    for (let i = 0; i < 5; i++) await click(page, 'Faster');
    await page.clock.install({ time: new Date('2026-10-09T12:00:00Z') });
    await page.clock.pauseAt(new Date('2026-10-09T12:00:00Z'));
    await click(page, 'Auto advance');
    await click(page, 'Play');
    await page.clock.runFor(400);
    assert.equal(await page.locator('[data-playing]').getAttribute('data-playing'), 'false');
    await click(page, 'Reset');
    await page.clock.runFor(2000);
    assert.match(await page.locator('.ff-pagination').textContent(), /1 \/ 10/);
    await click(page, 'Play');
    await page.clock.runFor(400);
    await page.clock.runFor(1600);
    assert.match(await page.locator('.ff-pagination').textContent(), /2 \/ 10/);
    await home(page);
    await page.clock.runFor(5000);
    assert.equal(await page.locator('[data-screen]').getAttribute('data-screen'), 'home');
    assert.equal(await page.locator('[data-playing]').getAttribute('data-playing'), 'false');
    await slower(page); await click(page, 'Numbers');
    await click(page, 'Auto advance'); // turn off the remembered setting
    await click(page, 'More items'); await click(page, 'More items');
    for (let i = 0; i < 3; i++) await click(page, 'Next');
    assert.equal(await page.getByRole('button', { name: 'Next', exact: true }).isDisabled(), true);
    assert.match(await page.locator('.ff-pagination').textContent(), /4 \/ 4/);
    await click(page, 'Fewer items');
    assert.match(await page.locator('.ff-pagination').textContent(), /1 \/ 5/);
    await home(page); await easy(page); await click(page, 'Numbers');
    await click(page, 'Play'); await page.clock.runFor(600); await click(page, 'Pause');
    await page.clock.runFor(5000); await click(page, 'Play'); await page.clock.runFor(600);
    // Resuming after 600 ms must reach vocalization within another 600 ms.
    await page.clock.runFor(150);
    assert.match(await page.locator('.ff-status > p').first().textContent(), /Speak/);
    // Use a fresh context for native dialog animations and media events.
    await context.close();
    context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    page = await context.newPage(); page.setDefaultTimeout(8000);
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
    await click(page, 'Switch to English'); await easy(page);
    await click(page, 'Play');
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForFunction(() => document.querySelector('[data-playing]').getAttribute('data-playing') === 'false');
    await page.evaluate(() => { delete document.hidden; });
    await click(page, 'Information');
    assert.equal(await page.locator('main').evaluate(el => el.inert), true);
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.getByRole('dialog').evaluate(el => el.contains(document.activeElement)), true);
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('button', { name: 'Information', exact: true }).evaluate(el => el === document.activeElement), true);
    await click(page, 'Practice'); await click(page, 'A'); await page.getByRole('dialog').waitFor({ state: 'hidden' });
    assert.match(await page.locator('.ff-practice-card').textContent(), /apple/);
    await click(page, 'التبديل إلى العربية');
    await click(page, 'التدريب'); await click(page, 'أ'); await page.getByRole('dialog').waitFor({ state: 'hidden' });
    assert.match(await page.locator('.ff-practice-card').textContent(), /أرنب/);
    await click(page, 'Switch to English');
    // Mock only the microphone boundary; exercise the actual hook and controls.
    await page.evaluate(() => {
      window.mediaTest = { stopped: 0, revoked: 0, mode: 'success', mime: '', recorder: null };
      const revoke = URL.revokeObjectURL.bind(URL);
      URL.revokeObjectURL = url => { mediaTest.revoked++; revoke(url); };
      const stream = () => ({ getTracks: () => [{ stop() { mediaTest.stopped++; } }] });
      Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => {
        if (mediaTest.mode === 'denied') throw new DOMException('Denied', 'NotAllowedError');
        if (mediaTest.mode === 'pending') return new Promise(resolve => { mediaTest.resolve = () => resolve(stream()); });
        return stream();
      } } });
      window.MediaRecorder = class {
        static isTypeSupported(type) { return type === 'audio/mp4'; }
        constructor(stream, options) { if (mediaTest.mode === 'constructor') throw new Error('Encoder unavailable'); this.mimeType = options?.mimeType; mediaTest.mime = this.mimeType; this.state = 'inactive'; mediaTest.recorder = this; }
        start() { this.state = 'recording'; }
        stop() { this.state = 'inactive'; setTimeout(() => { this.ondataavailable?.({ data: new Blob(['audio'], { type: this.mimeType }) }); this.onstop?.(); }, 0); }
      };
    });
    await click(page, 'Record');
    await page.getByRole('button', { name: 'Stop', exact: true }).waitFor();
    assert.equal(await page.evaluate(() => mediaTest.mime), 'audio/mp4');
    await click(page, 'Stop');
    await page.locator('audio').waitFor();
    assert.ok(await page.evaluate(() => mediaTest.stopped) >= 1);
    await click(page, 'Clear');
    assert.equal(await page.locator('audio').count(), 0);
    assert.equal(await page.evaluate(() => mediaTest.revoked), 1);
    await page.evaluate(() => { mediaTest.mode = 'denied'; }); await click(page, 'Record');
    await page.getByRole('alert').first().waitFor();
    assert.match(await page.locator('.ff-recording-feedback').textContent(), /denied/);
    await page.evaluate(() => { mediaTest.mode = 'constructor'; });
    const stopped = await page.evaluate(() => mediaTest.stopped);
    await click(page, 'Record');
    assert.ok(await page.evaluate(() => mediaTest.stopped) > stopped);
    await page.evaluate(() => { mediaTest.mode = 'pending'; }); await click(page, 'Record');
    await home(page);
    const before = await page.evaluate(() => mediaTest.stopped);
    await page.evaluate(() => mediaTest.resolve());
    assert.ok(await page.evaluate(() => mediaTest.stopped) > before, 'Late microphone grant left a live track');
    assert.equal(await page.getByRole('button', { name: 'Stop', exact: true }).count(), 0);
    assert.deepEqual(errors, []);
    await context.close();
    if (name === 'chromium') {
      const audioContext = await browser.newContext({ permissions: ['microphone'], reducedMotion: 'reduce' });
      const audioPage = await audioContext.newPage();
      audioPage.setDefaultTimeout(8000);
      await audioPage.addInitScript(() => {
        const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
        navigator.mediaDevices.getUserMedia = async options => {
          const stream = await original(options);
          window.capturedTracks = stream.getTracks();
          return stream;
        };
      });
      await audioPage.goto(`http://127.0.0.1:${server.address().port}/index.html`);
      await click(audioPage, 'Switch to English'); await easy(audioPage);
      await click(audioPage, 'Record');
      await audioPage.getByRole('button', { name: 'Stop', exact: true }).waitFor();
      await audioPage.waitForTimeout(500);
      await click(audioPage, 'Stop');
      await audioPage.locator('audio').waitFor();
      await click(audioPage, 'Play Recording');
      await audioPage.waitForFunction(() => document.querySelector('audio')?.currentTime > 0);
      assert.equal(await audioPage.locator('audio').evaluate(audio => audio.error), null);
      assert.equal(await audioPage.evaluate(() => capturedTracks.every(track => track.readyState === 'ended')), true);
      await click(audioPage, 'Clear');
      assert.equal(await audioPage.locator('audio').count(), 0);
      await audioContext.close();
      console.log('PASS Chromium: native MediaRecorder encode, playback and track release with synthetic microphone input');
    }
    const fallback = await browser.newPage();
    await fallback.route('**/assets/app.js', route => route.abort());
    await fallback.goto(`http://127.0.0.1:${server.address().port}/index.html`);
    await fallback.getByRole('link', { name: /Reload/ }).waitFor();
    await fallback.close();
    console.log(`PASS ${name}: pause/resume, auto-advance cancellation, final page, focus trap, language reset, microphone formats/errors/races/cleanup, load fallback`);
  } finally { await browser.close(); }
}
server.listen(0, '127.0.0.1', async () => {
  try { await run(chromium, 'chromium'); if (!process.env.FLUENCY_SKIP_WEBKIT) await run(webkit, 'webkit'); }
  catch (error) { console.error(error); process.exitCode = 1; }
  finally { server.close(); }
});
