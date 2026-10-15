// IndexedDB stores binary audio without base64 inflation or localStorage limits.
// A failed write never reports success. The UI retains the current Blob in
// memory and offers a download when storage is blocked/full (e.g. private mode).
let database;
export function openDatabase(){
 if(!database)database=new Promise((resolve,reject)=>{
  if(!globalThis.indexedDB)return reject(Error('التخزين المحلي غير متاح في هذا المتصفح.'));
  const request=indexedDB.open('taffaha-recordings',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('recordings',{keyPath:'id'});
  request.onsuccess=()=>{request.result.onversionchange=()=>{request.result.close();database=null;};resolve(request.result);};
  request.onerror=()=>reject(request.error);request.onblocked=()=>reject(Error('أغلق النوافذ الأخرى للتطبيق وحاول مجددًا.'));
 }).catch(e=>{database=null;throw e;});
 return database;
}
async function transaction(mode,operation){
 const db=await openDatabase();return new Promise((resolve,reject)=>{
  const tx=db.transaction('recordings',mode),request=operation(tx.objectStore('recordings'));let result;
  request.onsuccess=()=>{result=request.result;};tx.oncomplete=()=>resolve(result);
  tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('لم يكتمل حفظ التسجيل.'));
 });
}
// Persist plain binary bytes to avoid depending on browser-specific recorded
// Blob persistence behavior. Keep the actual MIME type and reconstruct the
// playback Blob on read. Legacy Blob
// records are still accepted so an update never discards existing attempts.
// Read one entry at a time and retain metadata only. Loading every saved WAV
// into RAM on startup can exhaust a phone's memory after many practice sessions.
export async function listRecordings(){
 const db=await openDatabase();return new Promise((resolve,reject)=>{
  const tx=db.transaction('recordings','readonly'),request=tx.objectStore('recordings').openCursor(),values=[];
  request.onsuccess=()=>{const cursor=request.result;if(!cursor)return;const {blob,bytes,...metadata}=cursor.value;values.push({...metadata,mime:metadata.mime||blob?.type});cursor.continue();};
  tx.oncomplete=()=>resolve(values);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
 });
}
export async function getRecording(id){
 const value=await transaction('readonly',s=>s.get(id));if(!value)return null;
 const {bytes,...metadata}=value;return bytes?{...metadata,blob:new Blob([bytes],{type:value.mime||'audio/wav'})}:value;
}
export const putRecording=async value=>{const {blob,...metadata}=value;const bytes=await blob.arrayBuffer();return transaction('readwrite',s=>s.put({...metadata,bytes,mime:blob.type}));};
export const deleteRecording=id=>transaction('readwrite',s=>s.delete(id));
// JSON preferences are non-sensitive; binary recordings always use IndexedDB.
export function readPreferences(){try{return JSON.parse(localStorage.getItem('taffaha-preferences'))||{};}catch{return{};}}
export function savePreferences(value){try{localStorage.setItem('taffaha-preferences',JSON.stringify(value));return true;}catch{return false;}}
export const recordingID=(word,syllable,kind)=>JSON.stringify([word,syllable,kind]);
