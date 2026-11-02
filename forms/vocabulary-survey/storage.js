// Clinical records stay in IndexedDB. Nothing is sent to a server.
let connection;
function database() {
    if (!connection) connection = new Promise((resolve, reject) => {
        const request = indexedDB.open('slp-vocabulary-assessment-v1', 1);
        request.onupgradeneeded = () => {
            request.result.createObjectStore('sessions', { keyPath: 'id' });
            request.result.createObjectStore('settings');
        };
        request.onsuccess = () => { request.result.onversionchange = () => { request.result.close(); connection = null; }; resolve(request.result); };
        request.onerror = () => { connection = null; reject(request.error); };
        request.onblocked = () => { connection = null; reject(new Error('Close other assessment tabs and retry.')); };
    });
    return connection;
}
async function transaction(store, mode, operation) {
    const db = await database();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, mode);
        const request = operation(tx.objectStore(store));
        let result;
        request.onsuccess = () => { result = request.result; };
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error || request.error);
        tx.onabort = () => reject(tx.error || new Error('Storage operation aborted'));
    });
}
export const saveSession = session => transaction('sessions', 'readwrite', store => store.put(structuredClone(session)));
export const getSessions = () => transaction('sessions', 'readonly', store => store.getAll());
export const saveSetting = (key, value) => transaction('settings', 'readwrite', store => store.put(value, key));
export const getSetting = key => transaction('settings', 'readonly', store => store.get(key));

export const profileKey = id => String(id).trim().toLocaleLowerCase('en-US');
export function saveProfile(profile) {
    const childId = String(profile.childId || '').trim();
    if (!childId || childId.length > 100) throw new Error('أدخل رمزاً صالحاً للطفل.');
    return saveSetting(`child:${profileKey(childId)}`, { kind: 'child-profile', ...profile, childId, updatedAt: new Date().toISOString() });
}
export async function getProfiles() {
    const settings = await transaction('settings', 'readonly', store => store.getAll());
    return settings.filter(value => value?.kind === 'child-profile').sort((a,b) => (a.childName || a.childId).localeCompare(b.childName || b.childId, 'ar'));
}
