// Usage: ARTICULATION_PLAYWRIGHT=/path/to/playwright node scripts/capture-screenshots.cjs http://localhost:8080/forms/speech/articulation/
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.ARTICULATION_PLAYWRIGHT||'playwright');
(async()=>{
 const url=process.argv[2];if(!url)throw Error('Supply the running app URL');
 const browser=await chromium.launch({headless:true,...(fs.existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{})});
 try{
  const context=await browser.newContext({serviceWorkers:'block',reducedMotion:'reduce'}),page=await context.newPage();
  const output=path.resolve(__dirname,'../assets/screenshots');fs.mkdirSync(output,{recursive:true});
  for(const [name,width,height] of [['home-narrow',390,844],['home-wide',1280,800]]){
   await page.setViewportSize({width,height});await page.goto(url);await page.locator('#welcomeLaunch').waitFor({state:'hidden'});await page.waitForTimeout(150);if(await page.locator('#cloudDialog').evaluate(d=>d.open))await page.locator('#skipCloud').click();
   await page.evaluate(()=>document.activeElement?.blur());await page.screenshot({path:path.join(output,name+'.png')});
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
