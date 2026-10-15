// VOC owns word IDs, labels and whole-word audio. Its supplied artwork has a
// few differently numbered food pictures, reviewed visually below. Never shift
// the word/audio IDs to make an image fit: existing saved syllables use these IDs.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),voc=path.resolve(root,'../voc');
const source=fs.readFileSync(path.join(voc,'index.html'),'utf8');
const start=source.indexOf('const RAW_CATEGORIES ='),end=source.indexOf('const app =',start);
if(start<0||end<0)throw Error('VOC label definitions not found');
const categories=vm.runInNewContext(source.slice(start,end)+';JSON.parse(JSON.stringify(CATEGORIES))',{}, {timeout:1000});
const groups=[
 [6,[['تفاحة',['تُفْ','فا','حة']],['موزة',['مو','زة']],['ليمون',['لي','مون']],['بطيخ',['بَطْ','طيخ']],['كيوي',['كي','وي']],['عنب',['عِ','نَب']],['اناناس',['أَ','نا','ناس']],['مانجا',['مانْ','جا']]]],
 [5,[['بطاطا',['بَ','طا','طا']],['حليب',['حَ','ليب']],['بيتزا',['بيتْ','زا']],['بوظة',['بو','ظة']],['معكرونة',['مَعْ','كَ','رو','نة']],['شوربة',['شورْ','بة']]]],
 [7,[['بندورة',['بَنْ','دو','رة']],['خيار',['خِ','يار']],['جزر',['جَ','زَر']],['ذرة',['ذُرْ','رة']],['كوسا',['كو','سا']],['بصل',['بَ','صَل']]]],
 [5,[['خبز',['خُبْز']],['ماء',['ماء']]]],
 [6,[['توت',['توت']]]],
 [7,[['بطاطا حلوة',['بَ','طا','طا','حِلْ','وة']]]],
 [8,[['عصير برتقال',['عَ','صير','بُرْ','تُ','قال']]]]
];
// These references were checked against the actual art, not only filenames.
// The title and recording keep their VOC mapping; only the image is corrected.
const imageOverrides={
 '5-21':'images/5/29.webp', // حليب: source 21 depicts juices.
 '5-23':'images/5/27.webp', // بيتزا: source 23 depicts ice lollies.
 '5-25':'images/5/23.webp', // بوظة: source 25 depicts shawarma.
 '5-33':'images/5/35.webp', // معكرونة: source 33 depicts salt.
 '5-32':'images/5/34.webp'  // شوربة: source 32 depicts salad.
};
const words=groups.flatMap(([categoryID,list])=>list.map(([label,syllables])=>{
 const category=categories.find(c=>c.id===categoryID),item=category?.items.find(x=>x.name===label);
 if(!item)throw Error('VOC label missing: '+label);
 if(!syllables.length||syllables.length>5)throw Error('Unsupported syllable count: '+label);
 const imagePath=imageOverrides[`${categoryID}-${item.id}`]||item.image;
 for(const file of [imagePath,item.audio])if(!fs.existsSync(path.join(voc,file)))throw Error('Missing source media: '+file);
 const revision=crypto.createHash('sha256').update(fs.readFileSync(path.join(voc,imagePath))).digest('hex');
 return {id:`voc-${categoryID}-${item.id}`,label,syllableCount:syllables.length,sourceCategory:category.name,syllables,
  image:{library:'voc',path:imagePath,revision},audio:{library:'voc',path:item.audio}};
}));
fs.writeFileSync(path.join(root,'assets/words.json'),JSON.stringify({words},null,2)+'\n');
console.log(`Built ${words.length} VOC cards in syllable groups 1–5; ${Object.keys(imageOverrides).length} reviewed artwork corrections.`);
