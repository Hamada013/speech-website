const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium, webkit } = require(process.env.FLUENCY_PLAYWRIGHT || 'playwright');
const root = path.resolve(__dirname, '..');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const server = http.createServer((req, res) => {
  let relative;
  try { relative = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400); res.end(); return; }
  const file = path.resolve(root, '.' + (relative.endsWith('/') ? relative + 'index.html' : relative));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
const routes = [
  ['Fluency Shaping', 'Slower Rate', 'slower-rate-practice'],
  ['Fluency Shaping', 'Easy Onsets', 'easy-onset-practice'],
  ['Fluency Shaping', 'Light Contacts', 'light-contact-practice'],
  ['Stuttering Modification', 'Cancellations', 'cancellation-practice'],
  ['Stuttering Modification', 'Pull-outs', 'pull-out-practice'],
  ['Stuttering Modification', 'Preparatory Sets', 'prep-set-practice'],
  ['Breathing Techniques', 'Diaphragmatic Breathing (Belly Breathing)', 'breathing-practice']
];
async function click(page, name) { await page.getByRole('button', { name, exact: true }).click(); }
async function go(page, route) {
  await click(page, route[0]); await click(page, route[1]);
  await page.locator(`[data-screen="${route[2]}"]`).waitFor();
  await page.locator('.ff-practice-card').waitFor();
}
async function home(page) {
  while (await page.locator('[data-screen]').getAttribute('data-screen') !== 'home') await click(page, (await page.locator('html').getAttribute('lang')) === 'ar' ? 'رجوع' : 'Back');
}
async function layout(page, label) {
  await page.waitForTimeout(250);
  const issues = await page.evaluate(() => {
    const vw = innerWidth;
    const buttons = [...document.querySelectorAll('button')].filter(el => el.getClientRects().length && !el.closest('[inert]'));
    return {
      width: document.documentElement.scrollWidth, vw,
      small: buttons.map(el => ({ name: el.getAttribute('aria-label') || el.title || el.textContent, r: el.getBoundingClientRect() })).filter(({r}) => r.width < 43 || r.height < 43).map(({name,r}) => [name, r.width, r.height]),
      outside: buttons.filter(el => { const r = el.getBoundingClientRect(); return r.left < -1 || r.right > vw + 1; }).map(el => el.title || el.textContent),
      unnamed: buttons.filter(el => !el.textContent.trim() && !el.title && !el.getAttribute('aria-label')).map(el => el.outerHTML.slice(0, 140))
    };
  });
  assert.ok(issues.width <= issues.vw + 1, `${label}: horizontal overflow ${JSON.stringify(issues)}`);
  assert.deepEqual(issues.small, [], `${label}: small controls`);
  assert.deepEqual(issues.outside, [], `${label}: clipped controls`);
  assert.deepEqual(issues.unnamed, [], `${label}: unnamed controls`);
}
async function run(type, name) {
  const options = { headless: true };
  if (name === 'chromium' && fs.existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')) options.executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const browser = await type.launch(options);
  try {
    for (const width of (process.env.FLUENCY_SMOKE ? [390] : [320, 390, 844, 768, 1366])) {
      const context = await browser.newContext({ viewport: { width, height: width === 844 ? 390 : 844 }, hasTouch: width < 1000, reducedMotion: 'reduce' });
      await context.route('https://**', route => route.abort());
      const page = await context.newPage();
      page.setDefaultTimeout(8000);
      const errors = [];
      page.on('pageerror', err => { errors.push(err.message); console.error('Page error:', err.message); });
      await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
      await page.locator('[data-screen="home"]').waitFor();
      await layout(page, `${name} ${width} Arabic home`);
      await click(page, 'Switch to English');
      assert.equal(await page.locator('html').getAttribute('dir'), 'ltr');
      await click(page, 'Information');
      await page.getByRole('dialog').waitFor();
      await layout(page, `${name} ${width} About`);
      assert.equal(await page.locator('main').evaluate(el => el.inert), true);
      await page.keyboard.press('Escape');
      assert.equal(await page.getByRole('dialog').count(), 0);
      for (const route of routes) {
        await go(page, route);
        await layout(page, `${name} ${width} ${route[2]}`);
        assert.match(await page.locator('h1').textContent(), route[2] === 'breathing-practice' ? /Diaphragmatic/ : new RegExp(route[1]));
        await click(page, 'Play');
        await page.waitForTimeout(180);
        assert.equal(await page.locator('[data-playing]').getAttribute('data-playing'), 'true');
        await click(page, 'Pause');
        await click(page, 'Information');
        await page.getByRole('dialog').waitFor();
        await layout(page, `${name} ${width} strategy dialog`);
        await page.keyboard.press('Escape');
        await click(page, 'Reset');
        if (route[2] !== 'breathing-practice') {
          const allCategories = await page.locator('.ff-categories button').allTextContents();
          const categories = width === 390 ? allCategories : allCategories.filter(name => ['Words', 'Sentences', 'Stories'].includes(name));
          for (const category of categories) {
            await page.locator('.ff-categories').getByRole('button', { name: category, exact: true }).click();
            if (category === 'Practice') {
              await page.getByRole('dialog').waitFor();
              await layout(page, `${name} ${width} letters`);
              await click(page, 'A');
              assert.ok(await page.locator('.ff-practice-card').textContent().then(text => text.includes('apple')));
            }
            await layout(page, `${name} ${width} ${route[2]} ${category}`);
            await click(page, 'Next'); await click(page, 'Previous');
          }
        }
        if (width === 390) await page.screenshot({ path: `/private/tmp/fluency-${name}-${route[2]}.png`, fullPage: true });
        await click(page, 'التبديل إلى العربية');
        await layout(page, `${name} ${width} Arabic ${route[2]}`);
        if (width === 390) await page.screenshot({ path: `/private/tmp/fluency-${name}-${route[2]}-ar.png`, fullPage: true });
        await click(page, 'Switch to English');
        await home(page);
        console.log(`Checked ${name} ${width} ${route[2]}`);
      }
      assert.deepEqual(errors, [], `${name} console errors`);
      await page.reload();
      await page.locator('[data-screen="home"]').waitFor();
      assert.equal(await page.locator('html').getAttribute('lang'), 'en');
      console.log(`PASS ${name} ${width}: all strategies, categories, dialogs, Arabic/English and touch layout`);
      await context.close();
    }
  } finally { await browser.close(); }
}
server.listen(0, '127.0.0.1', async () => {
  try {
    await run(chromium, 'chromium');
    if (!process.env.FLUENCY_SKIP_WEBKIT) await run(webkit, 'webkit');
  } catch (error) { console.error(error); process.exitCode = 1; }
  finally { server.close(); }
});
