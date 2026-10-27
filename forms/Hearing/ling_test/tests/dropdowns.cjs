const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const playwright=require('../../../../tools/VSS/voc/node_modules/playwright'),root=path.resolve(__dirname,'..'),engine=process.env.APP_ENGINE||'chromium';
(async()=>{
 const server=http.createServer((req,res)=>{const relative=new URL(req.url,'http://localhost').pathname,file=path.resolve(root,'.'+(relative==='/'?'/index.html':relative));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(err,body)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'})[path.extname(file)]||'application/octet-stream');res.end(body);});});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
 try{
  browser=await playwright[engine].launch(engine==='chromium'?{headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{headless:true});
  const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1280,height:900}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/`);await page.locator('#child-name').fill('Dropdown fixture');await page.locator('#name-form button').click();await page.getByRole('button',{name:'التعريف والتدريب',exact:true}).click();
  const ear=page.getByRole('combobox',{name:'الأذن / وسيلة السمع',exact:true}),size=page.getByRole('combobox',{name:'عدد بطاقات البداية',exact:true});assert.equal(await page.locator('select:visible').count(),0);
  await ear.click();await page.getByRole('option',{name:'اليسرى',exact:true}).click();assert.equal(await page.locator('#ear').inputValue(),'اليسرى');assert.equal(await ear.getAttribute('aria-expanded'),'false');
  await size.focus();await page.keyboard.press('ArrowDown');await page.keyboard.press('End');await page.keyboard.press('Enter');assert.equal(await page.locator('#size').inputValue(),'6');
  await ear.click();await page.keyboard.press('Escape');assert.equal(await ear.getAttribute('aria-expanded'),'false');assert.equal(await page.locator('#modal').isVisible(),true);
  await size.click();await page.locator('#modal').click({position:{x:8,y:8}});assert.equal(await size.getAttribute('aria-expanded'),'false');
  await size.click();await page.keyboard.press('Tab');assert.equal(await size.getAttribute('aria-expanded'),'false');
  for(const viewport of [{width:390,height:844},{width:320,height:568},{width:844,height:390}]){
   await page.setViewportSize(viewport);await size.scrollIntoViewIfNeeded();await size.click();
   const list=page.locator('#'+await size.getAttribute('aria-controls'));assert(await list.evaluate(n=>{const r=n.getBoundingClientRect(),d=n.closest('dialog').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=Math.max(0,d.top)&&r.bottom<=Math.min(innerHeight,d.bottom);}),'Options fit the dialog and viewport');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));if(viewport.width===390)await page.screenshot({path:`/private/tmp/ling-dropdowns-${engine}.png`});await page.keyboard.press('Escape');
  }
  await page.setViewportSize({width:390,height:844});await page.locator('#setup-form button[type=submit]').click();
  const saved=await page.evaluate(()=>{const d=JSON.parse(localStorage.getItem('ling-professional-children-v1'));return d.children[0].sessions[0];});assert.equal(saved.context.ear,'اليسرى');assert.equal(saved.size,6);assert.deepEqual(errors,[]);await context.close();console.log(engine+': styled choices, labels, keyboard, dismissal, responsive menus and submitted values passed');
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
