const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.VBMAPP_PLAYWRIGHT||'playwright');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage(),root=path.resolve(__dirname,'..'),svg=fs.readFileSync(path.join(root,'icons/mark.svg'),'utf8');
 await page.setContent('<html><body></body></html>');
 for(const [name,size,scale] of [['icon-192',192,.85],['icon-512',512,.85],['maskable-512',512,.65],['apple-touch-icon',180,.85]]){
  const png=await page.evaluate(async({svg,size,scale})=>{const image=new Image();image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await image.decode();const c=document.createElement('canvas');c.width=c.height=size;const ctx=c.getContext('2d');ctx.fillStyle='#246b86';ctx.fillRect(0,0,size,size);const inset=size*scale;ctx.drawImage(image,(size-inset)/2,(size-inset)/2,inset,inset);return c.toDataURL('image/png').split(',')[1];},{svg,size,scale});
  fs.writeFileSync(path.join(root,`icons/${name}.png`),Buffer.from(png,'base64'));
 }
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
