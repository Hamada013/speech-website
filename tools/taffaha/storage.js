// Store only app preferences; no child answers or audio are collected.
export function readPreferences(){try{return JSON.parse(localStorage.getItem('taffaha-preferences'))||{};}catch{return{};}}
export function savePreferences(value){
 try{localStorage.setItem('taffaha-preferences',JSON.stringify({lastWord:value.lastWord,pace:value.pace,testLevel:value.testLevel,testKind:value.testKind,practiceRhythm:value.practiceRhythm}));return true;}
 catch{return false;}
}
