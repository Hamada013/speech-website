const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium, webkit } = require(process.env.VOC_PLAYWRIGHT || 'playwright');
const root = path.resolve(__dirname, '..');
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.webp':'image/webp', '.png':'image/png', '.svg':'image/svg+xml', '.m4a':'audio/mp4', '.woff2':'font/woff2' };
let port;
const server = http.createServer(async (request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    if (!pathname.startsWith('/tools/voc/')) { response.writeHead(404).end(); return; }
    const relative = pathname.slice('/tools/voc/'.length) || 'index.html';
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
    try { const body = await fs.promises.readFile(file); response.writeHead(200, { 'Content-Type':mime[path.extname(file)] || 'text/plain', 'Cache-Control':'no-store', 'Content-Length':body.length }); response.end(body); }
    catch { response.writeHead(404).end(); }
});
async function offline(context, name, value) {
    if (name === 'chromium') await context.setOffline(value);
    if (value && server.listening) await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });
    if (!value && !server.listening) await new Promise(resolve => server.listen(port, '127.0.0.1', resolve));
}
const snapshot = (page, mode) => page.evaluate(mode => JSON.parse(localStorage.getItem(`hamada-game-${mode}-draft`)), mode);
const last = (page, mode) => page.evaluate(mode => JSON.parse(localStorage.getItem(`hamada-game-${mode}-last`)), mode);
async function ready(page, mode) {
    for (let i = 0; i < 120; i++) {
        const enabled = mode === 'rapid' ? await page.locator('#show-grading').isEnabled() || await page.locator('[data-grade]').first().isEnabled()
            : await page.locator('#game-board > button:not(:disabled)').count() > 0;
        if (enabled) return;
        if (mode === 'test' && await page.locator('#play-word').isEnabled()) await page.locator('#play-word').click();
        await page.waitForTimeout(100);
    }
    throw new Error(`${mode}: ${await page.locator('#game-feedback').textContent()}`);
}
async function start(page, mode, origin) {
    await page.goto(`${origin}/tools/voc/${mode}.html`);
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await page.locator('#start-game:not(:disabled)').waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.equal(await page.locator('select').count(),0,'Games use direct choice cards instead of dropdowns');
    await page.locator('#toggle-categories').click();
    const name=await page.evaluate(()=>VOC_GAME_DATA.categories[1].name);
    await page.locator('#category-search').fill(name);
    await page.locator('#category-grid [data-category="2"]').click();
    assert.equal(await page.locator('#category-panel').isHidden(),true);
    assert.equal(await page.locator('.selection-card').first().getAttribute('data-key').then(key=>key.startsWith('2_')),true);
    await page.reload(); await page.locator('#start-game:not(:disabled)').waitFor();
    assert.equal(await page.locator('#category-rail [data-category="2"]').getAttribute('aria-pressed'),'true','Category persists across reload');
    await page.locator('#category-rail [data-category="1"]').click();
    await page.locator('#toggle-categories').click(); await page.locator('#category-search').fill('zzzz');
    assert.equal(await page.locator('#category-empty').isVisible(),true);
    await page.locator('#category-search').fill('');
    await page.keyboard.press('Escape'); assert.equal(await page.locator('#category-panel').isHidden(),true);
    if(mode==='matching') await page.screenshot({path:`/private/tmp/voc-games-${process.env.VOC_GAME_ENGINE || 'all'}-new-settings.png`,fullPage:true});
}
async function recordAudioEnds(page) {
    await page.evaluate(()=>{
        window.completedWords=[];
        document.getElementById('game-audio').addEventListener('ended',()=>{
            const audio=document.getElementById('game-audio');
            window.completedWords.push({ time:audio.currentTime, duration:audio.duration, sourceKey:document.querySelector('#active-match > button')?.dataset.key });
        });
    });
}
async function expectFullMatchingAudio(page,key) {
    await page.waitForFunction(key=>window.completedWords.some(word=>word.sourceKey===key),key);
    const completed=await page.evaluate(key=>window.completedWords.find(word=>word.sourceKey===key),key);
    assert.ok(Number.isFinite(completed.duration) && completed.time >= completed.duration-.05,'Matched word reaches its real end before its card is replaced');
    await page.waitForFunction(()=>!document.getElementById('next-round').hidden || !document.getElementById('results-view').hidden || document.querySelector('#game-board > button:not(:disabled)'));
}
async function run(name, engine, origin) {
    // Installed Chrome supplies AAC/M4A decoding on macOS; Playwright's
    // bundled headless shell does not include that proprietary codec.
    const browser = await engine.launch({ headless:true, ...(name === 'chromium' ? { channel:'chrome' } : {}) });
    const context = await browser.newContext({ viewport:{width:390,height:844}, hasTouch:true });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
        await page.goto(`${origin}/tools/voc/games.html`);
        await page.waitForFunction(() => !!navigator.serviceWorker.controller);
        assert.equal(await page.locator('.hub-card').count(), 4);
        await page.screenshot({path:`/private/tmp/voc-games-${name}-hub.png`,fullPage:true});

        await start(page, 'matching', origin);
        await page.locator('input[name="game-level"][value="2"]').check(); await page.locator('input[name="game-length"][value="6"]').check();
        await page.locator('#start-game').click(); await ready(page, 'matching');
        await page.screenshot({path:`/private/tmp/voc-games-${name}-matching-phone.png`,fullPage:true});
        let s = await snapshot(page, 'matching');
        const wrong = s.boards[0].find(key => key !== s.order[0]);
        await page.locator(`#game-board > button[data-key="${wrong}"]`).tap();
        assert.equal((await snapshot(page, 'matching')).mistakes, 1);
        const source = await page.locator('#active-match > button').boundingBox();
        const zone = await page.locator(`#game-board > button[data-key="${s.order[0]}"]`).boundingBox();
        await page.mouse.move(source.x+source.width/2,source.y+source.height/2); await page.mouse.down();
        await page.mouse.move(zone.x+zone.width/2,zone.y+zone.height/2,{steps:10}); await page.mouse.up();
        await page.waitForFunction(() => JSON.parse(localStorage.getItem('hamada-game-matching-draft')).position === 1);
        await page.locator('#pause-game').click(); await page.waitForTimeout(800);
        assert.equal(await page.locator('#pause-view').isVisible(), true, 'Old match transition cannot undo pause');
        await page.reload(); await page.locator('#resume-saved').click(); await ready(page, 'matching');
        s = await snapshot(page, 'matching'); assert.equal(s.position, 1);
        await recordAudioEnds(page);
        for (let count=1; count<6; count++) {
            if (await page.locator('#next-round').isVisible()) await page.locator('#next-round').click();
            await ready(page, 'matching'); s = await snapshot(page, 'matching');
            const button = page.locator(`#game-board > button[data-key="${s.order[s.position]}"]`);
            await button.focus(); await page.keyboard.press('Enter');
            assert.equal(await page.locator('#play-word').isDisabled(),true,'Replay cannot interrupt the matched word');
            await expectFullMatchingAudio(page,s.order[s.position]);
        }
        await page.locator('#results-view').waitFor({state:'visible'});
        assert.equal((await last(page,'matching')).percentage,83);
        assert.equal(await page.locator('#review-missed').isVisible(),true);
        await page.locator('#review-missed').click(); await ready(page,'matching');
        assert.equal((await snapshot(page,'matching')).review,true);
        await page.locator('#finish-game').click(); await page.waitForTimeout(750);
        assert.equal(await page.locator('#results-view').isVisible(),true);
        assert.equal((await last(page,'matching')).percentage,null);
        console.log(`${name}: visual selectors, matching tap/drag/keyboard, full word playback, pause/reload and one-word review passed`);

        await start(page,'memory',origin); await page.setViewportSize({width:320,height:740});
        await page.locator('input[name="game-level"][value="2"]').check(); await page.locator('#start-game').click(); await ready(page,'memory');
        s = await snapshot(page,'memory'); const second = s.deck.findIndex(card=>card.key!==s.deck[0].key);
        assert.equal(await page.locator('#game-board > button').count(),4);
        assert.equal(await page.locator('#game-board > button').first().getAttribute('aria-label'),'بطاقة مخفية 1');
        await page.locator('#game-board > button').nth(0).tap(); await page.locator('#game-board > button').nth(second).tap();
        await page.evaluate(() => { const buttons=[...document.querySelectorAll('#game-board > button')]; buttons.find(button=>!button.classList.contains('flipped')).click(); });
        assert.equal((await snapshot(page,'memory')).open.length,2);
        await page.locator('#pause-game').click(); await page.waitForTimeout(1000); await page.reload();
        await page.locator('#resume-saved').click();
        await page.waitForFunction(() => JSON.parse(localStorage.getItem('hamada-game-memory-draft')).open.length===0);
        assert.deepEqual((await snapshot(page,'memory')).deck,s.deck,'Memory board survives pause/reload');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),true);
        await page.screenshot({path:`/private/tmp/voc-games-${name}-memory-phone.png`,fullPage:true});
        for (const key of s.order) {
            const positions=s.deck.map((card,i)=>card.key===key?i:-1).filter(i=>i>=0);
            await page.locator('#game-board > button').nth(positions[0]).click(); await page.locator('#game-board > button').nth(positions[1]).click();
        }
        await page.locator('#results-view').waitFor({state:'visible'});
        assert.equal((await last(page,'memory')).moves,3); assert.equal((await last(page,'memory')).percentage,67);
        // A large selected bank still creates just one bounded memory board.
        await page.locator('#return-setup').click(); await page.locator('#select-everything').click();
        assert.ok(await page.locator('.selection-card').count() <= 24);
        await page.locator('input[name="game-level"][value="6"]').check(); await page.locator('#start-game').click(); await ready(page,'memory');
        assert.equal(await page.locator('#game-board > button').count(),12);
        assert.equal(await page.evaluate(() => [...document.querySelectorAll('#game-board > button')].every(button => { const rect=button.getBoundingClientRect(); return rect.left>=0 && rect.right<=innerWidth && rect.width>=44; })),true);
        s=await snapshot(page,'memory');
        const pair=s.deck.map((card,i)=>card.key===s.deck[0].key?i:-1).filter(i=>i>=0);
        await page.locator('#game-board > button').nth(pair[0]).click(); await page.locator('#game-board > button').nth(pair[1]).click();
        await page.screenshot({path:`/private/tmp/voc-games-${name}-memory-large-phone.png`,fullPage:true});
        await page.setViewportSize({width:1024,height:768});
        await page.screenshot({path:`/private/tmp/voc-games-${name}-memory-tablet.png`,fullPage:true});
        await page.locator('#finish-game').click(); await page.locator('#return-setup').click();
        await page.locator('#clear-everything').click();
        for(let i=0;i<6;i++) await page.locator('.selection-card').nth(i).click();
        await page.locator('input[name="game-level"][value="2"]').check();
        console.log(`${name}: memory mismatch lock, restored board, mobile grid and pair scoring passed`);

        await page.setViewportSize({width:390,height:844}); await start(page,'rapid',origin);
        await page.locator('#clear-everything').click();
        for (let i=0;i<3;i++) await page.locator('.selection-card').nth(i).click();
        await page.locator('#sound-hint').uncheck(); await page.locator('input[name="game-duration"][value="2"]').check();
        await page.locator('#start-game').click(); await ready(page,'rapid');
        await page.screenshot({path:`/private/tmp/voc-games-${name}-rapid-phone.png`,fullPage:true});
        assert.equal(await page.locator('[data-grade]').first().isDisabled(),true);
        await page.locator('#pause-game').click(); await page.waitForTimeout(2200);
        assert.equal((await snapshot(page,'rapid')).position,0);
        await page.locator('#continue-game').click(); await ready(page,'rapid');
        await page.locator('#show-grading').click();
        await page.evaluate(() => { const b=document.querySelector('[data-grade="notMastered"]'); b.click(); b.click(); });
        await page.waitForFunction(() => JSON.parse(localStorage.getItem('hamada-game-rapid-draft')).position===1);
        for (const grade of ['learning','mastered']) {
            await page.waitForTimeout(350); await ready(page,'rapid');
            if (await page.locator('#show-grading').isVisible()) await page.locator('#show-grading').click();
            await page.locator(`[data-grade="${grade}"]`).click();
        }
        await page.locator('#results-view').waitFor({state:'visible'});
        assert.equal((await last(page,'rapid')).percentage,33); assert.equal((await last(page,'rapid')).learning,1);
        await page.waitForTimeout(700); assert.equal(await page.locator('#results-view').isVisible(),true,'No endless retry loop');
        console.log(`${name}: rapid adjustable dwell, pause-safe timer, double-tap guard and finite grading passed`);

        await start(page,'test',origin);
        await page.evaluate(() => {
            const play=HTMLMediaElement.prototype.play; let deny=true;
            HTMLMediaElement.prototype.play=function(){ if(deny){deny=false;return Promise.reject(new DOMException('Gesture required','NotAllowedError'));} return play.call(this); };
        });
        await page.locator('#start-game').click();
        await page.waitForFunction(() => document.getElementById('game-feedback').textContent.startsWith('اضغط'));
        assert.equal(await page.locator('#game-board > button:not(:disabled)').count(),0,'Listen before answering');
        await page.locator('#play-word').click(); await ready(page,'test');
        await page.screenshot({path:`/private/tmp/voc-games-${name}-listening-phone.png`,fullPage:true});
        s=await snapshot(page,'test'); const choices=await page.locator('#game-board > button').evaluateAll(buttons=>buttons.map(button=>button.dataset.key));
        assert.equal(choices.length,4); assert.equal(await page.locator('#game-board > button > span').count(),0,'No written-answer cue');
        await page.locator(`#game-board > button[data-key="${choices.find(key=>key!==s.order[0])}"]`).tap();
        assert.deepEqual(await page.locator('#game-board > button').evaluateAll(buttons=>buttons.map(button=>button.dataset.key)),choices);
        for(let count=0;count<6;count++){
            await ready(page,'test'); s=await snapshot(page,'test');
            await page.locator(`#game-board > button[data-key="${s.order[s.position]}"]`).click(); await page.waitForTimeout(700);
        }
        await page.locator('#results-view').waitFor({state:'visible'}); assert.equal((await last(page,'test')).percentage,83);
        console.log(`${name}: listening game, autoplay retry, answer gating, stable retries and first-choice scoring passed`);

        // Cache only the small test pool, stop the actual origin, and exercise
        // every game offline without relying on the HTTP browser cache.
        await page.evaluate(async()=>{
            for(const item of VOC_GAME_DATA.categories[0].items.slice(0,6)) for(const url of [item.image,item.audio]) {
                const response=await fetch(url); if(!response.ok)throw new Error(url);
            }
        });
        await offline(context,name,true);
        for(const game of ['matching','memory','rapid','test']){
            await page.goto(`${origin}/tools/voc/${game}.html`);
            if(game==='rapid') await page.locator('input[name="game-duration"][value="0"]').check();
            await page.locator('#start-game').click(); await ready(page,game);
            assert.equal(await page.locator('#reload-media').isHidden(),true);
            if(game==='matching') {
                await recordAudioEnds(page); const draft=await snapshot(page,game), key=draft.order[0];
                await page.locator(`#game-board > button[data-key="${key}"]`).click();
                await expectFullMatchingAudio(page,key);
            }
            await page.locator('#pause-game').click(); await page.locator('#finish-paused').click();
            assert.equal(await page.locator('#results-view').isVisible(),true);
        }
        await offline(context,name,false); assert.equal(errors.length,0,errors.join('\n'));
        console.log(`${name}: all four games work offline with cached images/audio; no JavaScript errors`);
    } catch(error) {
        console.error(name,await page.locator('#game-feedback').textContent().catch(()=>''));
        console.error(await page.evaluate(async () => ({ registrations: (await navigator.serviceWorker.getRegistrations()).map(registration => ({ active: registration.active?.state, installing: registration.installing?.state, waiting: registration.waiting?.state })), caches: await caches.keys() })).catch(()=>({})), errors);
        await page.screenshot({path:`/private/tmp/voc-games-${name}-failure.png`,fullPage:true}).catch(()=>{}); throw error;
    } finally {
        await offline(context,name,false);
        await context.close();
        await browser.close();
    }
}
(async()=>{
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve)); port=server.address().port;
    try { const origin=`http://127.0.0.1:${port}`;
        if(process.env.VOC_GAME_ENGINE!=='webkit') await run('chromium',chromium,origin);
        if(process.env.VOC_GAME_ENGINE!=='chromium') await run('webkit',webkit,origin);
    } finally { server.close(); server.closeAllConnections(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
