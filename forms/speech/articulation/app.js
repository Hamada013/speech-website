document.addEventListener("DOMContentLoaded", () => {

  // ====== Data ======
  const cardsData = [
    { id: 1, title: "b", ipa: "/b/", frontImg: "images/b.png", backImg: "images/bb.png" },
    { id: 2, title: "t", ipa: "/t/", frontImg: "images/t.png", backImg: "images/tt.png" },
    { id: 3, title: "θ", ipa: "/θ/", frontImg: "images/th.png", backImg: "images/thh.png" },
    { id: 4, title: "ʒ", ipa: "/ʒ/", frontImg: "images/j.png", backImg: "images/jj.png" },
    { id: 5, title: "ħ", ipa: "/ħ/", frontImg: "images/hh.png", backImg: "images/hhh.png" },
    { id: 6, title: "x", ipa: "/x/", frontImg: "images/x.png", backImg: "images/xx.png" },
    { id: 7, title: "d", ipa: "/d/", frontImg: "images/d.png", backImg: "images/dd.png" },
    { id: 8, title: "ð", ipa: "/ð/", frontImg: "images/eth.png", backImg: "images/ethh.png" },
    { id: 9, title: "r", ipa: "/r/", frontImg: "images/r.png", backImg: "images/rr.png" },
    { id: 10, title: "z", ipa: "/z/", frontImg: "images/z.png", backImg: "images/zz.png" },
    { id: 11, title: "s", ipa: "/s/", frontImg: "images/s.png", backImg: "images/ss.png" },
    { id: 12, title: "ʃ", ipa: "/ʃ/", frontImg: "images/sh.png", backImg: "images/shh.png" },
    { id: 13, title: "sˤ", ipa: "/sˤ/", frontImg: "images/sad.png", backImg: "images/sadd.png" },
    { id: 14, title: "dˤ", ipa: "/dˤ/", frontImg: "images/dad.png", backImg: "images/dadd.png" },
    { id: 15, title: "tˤ", ipa: "/tˤ/", frontImg: "images/tah.png", backImg: "images/tahh.png" },
    { id: 16, title: "ðˤ", ipa: "/ðˤ/", frontImg: "images/za.png", backImg: "images/zaz.png" },
    { id: 17, title: "ʕ", ipa: "/ʕ/", frontImg: "images/ain.png", backImg: "images/ainn.png" },
    { id: 18, title: "ɣ", ipa: "/ɣ/", frontImg: "images/gh.png", backImg: "images/ghh.png" },
    { id: 19, title: "f", ipa: "/f/", frontImg: "images/f.png", backImg: "images/ff.png" },
    { id: 20, title: "q", ipa: "/q/", frontImg: "images/q.png", backImg: "images/qq.png" },
    { id: 21, title: "k", ipa: "/k/", frontImg: "images/k.png", backImg: "images/kk.png" },
    { id: 22, title: "l", ipa: "/l/", frontImg: "images/l.png", backImg: "images/ll.png" },
    { id: 23, title: "m", ipa: "/m/", frontImg: "images/m.png", backImg: "images/mm.png" },
    { id: 24, title: "n", ipa: "/n/", frontImg: "images/n.png", backImg: "images/nn.png" },
    { id: 25, title: "h", ipa: "/h/", frontImg: "images/h.png", backImg: "images/hh2.png" },
    { id: 26, title: "w", ipa: "/w/", frontImg: "images/w.png", backImg: "images/ww.png" },
    { id: 27, title: "j", ipa: "/j/", frontImg: "images/y.png", backImg: "images/yy.png" },
    { id: 28, title: "ʔ", ipa: "/ʔ/", frontImg: "images/hamza.png", backImg: "images/hamza2.png" },
    { id: 29, title: "a", ipa: "/a/", frontImg: "images/a.png", backImg: "images/aa2.png" },
    { id: 30, title: "i", ipa: "/i/", frontImg: "images/i.png", backImg: "images/ii2.png" },
    { id: 31, title: "u", ipa: "/u/", frontImg: "images/u.png", backImg: "images/uu2.png" },
    { id: 32, title: "aː", ipa: "/aː/", frontImg: "images/aa.png", backImg: "images/aaa.png" },
    { id: 33, title: "iː", ipa: "/iː/", frontImg: "images/ii.png", backImg: "images/iii.png" },
    { id: 34, title: "uː", ipa: "/uː/", frontImg: "images/uu.png", backImg: "images/uuu.png" },
    { id: 35, title: "aj", ipa: "/aj/", frontImg: "images/ay.png", backImg: "images/ayy.png" },
    { id: 36, title: "aw", ipa: "/aw/", frontImg: "images/aw.png", backImg: "images/aww.png" }
  ];

  let currentIndex = 0;
  let selectedPosition = null;
  let selectedAction = null;
  const resultsData = {};

  // ====== DOM Elements ======
  const cardContainer = document.querySelector("#card-1 .image-box");
  const cardTitleEl = document.getElementById("card1-heading");
  const leftArrow = document.querySelector("#card-1 .arrow-btn.left");
  const rightArrow = document.querySelector("#card-1 .arrow-btn.right");
  const addBtn = document.querySelector("#card-1 .add-btn");
  const modal = document.getElementById("image-modal");
  const modalClose = modal?.querySelector(".close-modal");
  const resultsSummary = document.getElementById("results-summary");
  const downloadBtn = document.getElementById("downloadReportBtn");
  const sendBtn = document.getElementById("sendBtn"); // New button for sending results
  const personalForm = document.getElementById("personal-info-form");
  const fmlButtons = modal ? Array.from(modal.querySelectorAll(".fml-btn")) : [];
  const actionButtons = modal ? Array.from(modal.querySelectorAll(".top-grid .grid-btn")) : [];
  const ipaButtons = modal ? Array.from(modal.querySelectorAll(".ipa-btn")) : [];
  const noteBtn = modal?.querySelector(".note-btn");
  const modalBody = modal?.querySelector(".modal-body");

  // ====== Phonological process detection ======
const phonoMap = {
  stopping: [
    // Dental
    ["/θ/", "/t/"], ["/θ/", "/tˤ/"], ["/ð/", "/d/"], ["/ð/", "/dˤ/"],
    // Alveolar
    ["/s/", "/t/"], ["/s/", "/tˤ/"], ["/z/", "/d/"], ["/z/", "/dˤ/"],
    // Palato-Alveolar
    ["/ʃ/", "/t/"], ["/ʃ/", "/tˤ/"], ["/ʒ/", "/d/"], ["/ʒ/", "/dˤ/"],
    // Labiodental -> Bilabial (common)
    ["/f/", "/p/"], ["/f/", "/b/"], ["/v/", "/b/"], ["/v/", "/p/"],
    // Velar
    ["/x/", "/k/"], ["/ɣ/", "/g/"], ["/ɣ/", "/q/"],
    // Pharyngeal/Glottal
    ["/ħ/", "/ʔ/"], ["/h/", "/ʔ/"],
    // Emphatic
    ["/sˤ/", "/tˤ/"], ["/ðˤ/", "/dˤ/"]
  ],

  // 2. DENASALIZATION: Nasal -> Stop (same place)
  denasalization: [
    // Bilabial
    ["/m/", "/b/"], ["/m/", "/p/"],
    // Alveolar
    ["/n/", "/d/"], ["/n/", "/t/"],
    // Velar
    ["/ŋ/", "/g/"], ["/ŋ/", "/k/"]
  ],

  // 3. LIQUID STOPPING: Liquid -> Stop
  liquid_stopping: [
    ["/r/", "/b/"], ["/r/", "/t/"], ["/r/", "/tˤ/"], ["/r/", "/d/"], 
    ["/r/", "/dˤ/"], ["/r/", "/k/"], ["/r/", "/q/"], ["/r/", "/ʔ/"],
    ["/l/", "/b/"], ["/l/", "/t/"], ["/l/", "/tˤ/"], ["/l/", "/d/"], 
    ["/l/", "/dˤ/"], ["/l/", "/k/"], ["/l/", "/q/"], ["/l/", "/ʔ/"]
  ],

  // 4. VOWEL CONSONANTIZATION: Vowel -> Consonant (Atypical)
  vowel_consonantization_Atypical: [
    // Short Vowels
    ["/a/", "/b/"], ["/a/", "/t/"], ["/a/", "/tˤ/"], ["/a/", "/d/"], 
    ["/a/", "/dˤ/"], ["/a/", "/k/"], ["/a/", "/q/"], ["/a/", "/ʔ/"],
    ["/i/", "/b/"], ["/i/", "/t/"], ["/i/", "/tˤ/"], ["/i/", "/d/"], 
    ["/i/", "/dˤ/"], ["/i/", "/k/"], ["/i/", "/q/"], ["/i/", "/ʔ/"],
    ["/u/", "/b/"], ["/u/", "/t/"], ["/u/", "/tˤ/"], ["/u/", "/d/"], 
    ["/u/", "/dˤ/"], ["/u/", "/k/"], ["/u/", "/q/"], ["/u/", "/ʔ/"],
    // Long Vowels
    ["/aː/", "/b/"], ["/aː/", "/t/"], ["/aː/", "/tˤ/"], ["/aː/", "/d/"], 
    ["/aː/", "/dˤ/"], ["/aː/", "/k/"], ["/aː/", "/q/"], ["/aː/", "/ʔ/"],
    ["/iː/", "/b/"], ["/iː/", "/t/"], ["/iː/", "/tˤ/"], ["/iː/", "/d/"], 
    ["/iː/", "/dˤ/"], ["/iː/", "/k/"], ["/iː/", "/q/"], ["/iː/", "/ʔ/"],
    ["/uː/", "/b/"], ["/uː/", "/t/"], ["/uː/", "/tˤ/"], ["/uː/", "/d/"], 
    ["/uː/", "/dˤ/"], ["/uː/", "/k/"], ["/uː/", "/q/"], ["/uː/", "/ʔ/"]
  ],

// 5. GLOTTAL REPLACEMENT: Any non-glottal sound -> Glottal Stop
glottal_Stop: [
    // Plosives (Stops)
    ["/p/", "/ʔ/"], ["/b/", "/ʔ/"], ["/t/", "/ʔ/"], ["/d/", "/ʔ/"], ["/tˤ/", "/ʔ/"], ["/dˤ/", "/ʔ/"], ["/k/", "/ʔ/"], ["/g/", "/ʔ/"], ["/q/", "/ʔ/"],
    // Fricatives
    ["/f/", "/ʔ/"], ["/v/", "/ʔ/"], ["/θ/", "/ʔ/"], ["/ð/", "/ʔ/"], ["/s/", "/ʔ/"], ["/z/", "/ʔ/"], ["/sˤ/", "/ʔ/"], ["/ðˤ/", "/ʔ/"], ["/ʃ/", "/ʔ/"], ["/ʒ/", "/ʔ/"], ["/x/", "/ʔ/"], ["/ɣ/", "/ʔ/"], ["/ħ/", "/ʔ/"], ["/ʕ/", "/ʔ/"],
    // Nasals
    ["/m/", "/ʔ/"], ["/n/", "/ʔ/"], ["/ŋ/", "/ʔ/"],
    // Liquids
    ["/l/", "/ʔ/"], ["/r/", "/ʔ/"], ["/ɾ/", "/ʔ/"],
    // Glides
    ["/w/", "/ʔ/"], ["/j/", "/ʔ/"],
    // Vowels (This is highly atypical and severe)
    ["/a/", "/ʔ/"], ["/aː/", "/ʔ/"], ["/i/", "/ʔ/"], ["/iː/", "/ʔ/"], ["/u/", "/ʔ/"], ["/uː/", "/ʔ/"], ["/aj/", "/ʔ/"], ["/aw/", "/ʔ/"], ["/ə/", "/ʔ/"]
    // Note: /h/ and /ʔ/ are already glottal. /h/ -> /ʔ/ is a minor place change, not classic glottal replacement.
],

fronting: [
  // 1. VELAR STOP CONSONANTS -> ALVEOLAR STOPS (Most Common)
  // /k/ (voiceless velar stop) -> /t/ (voiceless alveolar stop)
  ["/k/", "/t/"],
  // /g/ (voiced velar stop) -> /d/ (voiced alveolar stop)
  ["/g/", "/d/"],

  // 2. UVULAR STOP CONSONANTS -> ALVEOLAR/UVULAR STOPS
  // /q/ (voiceless uvular stop) -> /t/ or emphatic /tˤ/
  ["/q/", "/t/"], ["/q/", "/tˤ/"],

  // 3. VELAR FRICATIVES -> ALVEOLAR/DENTAL FRICATIVES
  // /x/ (voiceless velar fricative) -> /s/ or /θ/
  ["/x/", "/s/"], ["/x/", "/θ/"],
  // /ɣ/ (voiced velar fricative) -> /z/ or /ð/
  ["/ɣ/", "/z/"], ["/ɣ/", "/ð/"],

  // 4. VELAR NASAL -> ALVEOLAR NASAL
  // /ŋ/ (velar nasal) -> /n/ (alveolar nasal)
  ["/ŋ/", "/n/"],

  // 5. (Less Common) VELAR -> LABIAL (A context-specific type of fronting)
  // In some contexts, a velar might front all the way to a labial
  ["/k/", "/p/"], ["/g/", "/b/"]
],

backing: [
  // 1. ALVEOLAR STOPS -> VELAR/UVULAR STOPS (Most Common)
  // /t/ (voiceless alveolar stop) -> /k/ (voiceless velar stop) or /q/ (uvular)
  ["/t/", "/k/"], ["/t/", "/q/"],
  // /d/ (voiced alveolar stop) -> /g/ (voiced velar stop)
  ["/d/", "/g/"],

  // 2. ALVEOLAR FRICATIVES -> VELAR/UVULAR FRICATIVES
  // /s/ (voiceless alveolar fricative) -> /x/ (voiceless velar fricative)
  ["/s/", "/x/"],
  // /z/ (voiced alveolar fricative) -> /ɣ/ (voiced velar fricative)
  ["/z/", "/ɣ/"],

  // 3. DENTAL FRICATIVES -> VELAR/UVULAR FRICATIVES
  // /θ/ (voiceless dental fricative) -> /x/
  ["/θ/", "/x/"],
  // /ð/ (voiced dental fricative) -> /ɣ/
  ["/ð/", "/ɣ/"],

  // 4. POST-ALVEOLAR FRICATIVES -> VELAR/UVULAR FRICATIVES
  // /ʃ/ (voiceless post-alveolar fricative) -> /x/
  ["/ʃ/", "/x/"],
  // /ʒ/ (voiced post-alveolar fricative) -> /ɣ/
  ["/ʒ/", "/ɣ/"],

  // 5. LABIAL STOPS -> VELAR STOPS (Less Common)
  // /p/ (voiceless labial stop) -> /k/
  ["/p/", "/k/"],
  // /b/ (voiced labial stop) -> /g/
  ["/b/", "/g/"],

  // 6. LABIODENTAL FRICATIVE -> VELAR FRICATIVE
  // /f/ (voiceless labiodental fricative) -> /x/
  ["/f/", "/x/"]
],
// 1. GLIDING: Liquid -> Glide
gliding: [
    ["/r/", "/w/"], ["/r/", "/j/"],
    ["/ɾ/", "/w/"], ["/ɾ/", "/j/"],
    ["/l/", "/w/"], ["/l/", "/j/"]
],

// 2. LIQUID SUBSTITUTION: Liquid -> Liquid
liquid_substitution: [
    ["/r/", "/l/"], ["/l/", "/r/"],
    ["/ɾ/", "/l/"], ["/ɾ/", "/r/"],
    ["/r/", "/ɾ/"], ["/l/", "/ɾ/"]
],

// 3. (Optional) LIQUIDIZATION: Glide -> Liquid
// This is not a standard developmental process.
liquidization: [ 
    ["/j/", "/l/"], ["/w/", "/r/"],
    ["/j/", "/r/"], ["/w/", "/l/"]
],

// 1. VOWEL SUBSTITUTION (Core changes between pure vowels)
vowel_substitution: [
    // Shortening/Laxing
    ["/aː/", "/a/"], ["/iː/", "/i/"], ["/uː/", "/u/"],
    // Neutralization to Schwa
    ["/a/", "/ə/"], ["/i/", "/ə/"], ["/u/", "/ə/"],
    ["/aː/", "/ə/"], ["/iː/", "/ə/"], ["/uː/", "/ə/"],
    // Common Place/Height Errors
    ["/i/", "/u/"], ["/u/", "/i/"],
    ["/a/", "/i/"], ["/a/", "/u/"],
    ["/i/", "/a/"], ["/u/", "/a/"]
],

// 2. MONOPHTHONGIZATION: Diphthong -> Pure Vowel
monophthongization: [
    ["/aj/", "/a/"], ["/aw/", "/a/"],
    ["/aj/", "/e/"], ["/aw/", "/o/"],
    ["/aj/", "/i/"], ["/aw/", "/u/"]
],

// 3. DIPHTHONGIZATION: Pure Vowel -> Diphthong
diphthongization: [
    ["/a/", "/aj/"], ["/a/", "/aw/"],
    ["/e/", "/ej/"], ["/o/", "/ow/"],
    ["/i/", "/ij/"], ["/u/", "/uw/"]
],

// 4. DIPHTHONG SUBSTITUTION: Diphthong -> Diphthong
diphthong_substitution: [
    ["/aj/", "/aw/"], ["/aw/", "/aj/"]
],

deaffrication: [
    // Voiceless Palato-Alveolar Affricate /tʃ/ ("ch") -> Fricative /ʃ/ ("sh") OR Stop /t/ ("t")
    ["/tʃ/", "/ʃ/"], ["/tʃ/", "/t/"],
    // Voiced Palato-Alveolar Affricate /dʒ/ ("j") -> Fricative /ʒ/ ("zh") OR Stop /d/ ("d")
    ["/dʒ/", "/ʒ/"], ["/dʒ/", "/d/"]
],
affrication: [
    // Voiceless Alveolar Stop /t/ -> Voiceless Affricate /tʃ/
    ["/t/", "/tʃ/"],
    // Voiced Alveolar Stop /d/ -> Voiced Affricate /dʒ/
    ["/d/", "/dʒ/"],
    
    // Voiceless Post-Alveolar Fricative /ʃ/ -> Voiceless Affricate /tʃ/
    ["/ʃ/", "/tʃ/"],
    // Voiced Post-Alveolar Fricative /ʒ/ -> Voiced Affricate /dʒ/
    ["/ʒ/", "/dʒ/"],
    
    // (Less Common) Other front sounds might affricate
    ["/s/", "/tʃ/"], ["/z/", "/dʒ/"] // e.g., "sun" -> "chun"
]

};
 

function detectPhonoProcess(orig, target, action) {
  if (action !== "S" || !orig || !target) return "";

  const clean = s => s.replace(/\//g, "").trim();
  const o = clean(orig);
  const t = clean(target);

  const processes = [
    { name: "Stopping", map: phonoMap.stopping },
    { name: "Denasalization", map: phonoMap.denasalization },
    { name: "Liquid Stopping", map: phonoMap.liquid_stopping },
    { name: "Vowel Consonantization", map: phonoMap.vowel_consonantization_Atypical },
    { name: "Glottal Replacement", map: phonoMap.glottal_Stop },
    { name: "Fronting", map: phonoMap.fronting },
    { name: "Backing", map: phonoMap.backing },
    { name: "Gliding", map: phonoMap.gliding },
    { name: "Liquid Substitution", map: phonoMap.liquid_substitution },
    { name: "Liquidization", map: phonoMap.liquidization },
    { name: "Vowel Substitution", map: phonoMap.vowel_substitution },
    { name: "Monophthongization", map: phonoMap.monophthongization },
    { name: "Diphthongization", map: phonoMap.diphthongization },
    { name: "Diphthong Substitution", map: phonoMap.diphthong_substitution },
    { name: "Deaffrication", map: phonoMap.deaffrication },
    { name: "Affrication", map: phonoMap.affrication }
  ];

  for (const { name, map } of processes) {
    for (const [from, to] of map) {
      if (clean(from) === o && clean(to) === t) {
        return name; // just the label
      }
    }
  }

  return ""; // no process match
}

  // ====== Utilities ======
  function escapeHtml(str){ return str ? String(str).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]) : ""; }
  function ensureCardResult(title){
    if(!resultsData[title]) resultsData[title]={
      First:{symbol:"",action:"",ipa:"",note:""},
      Middle:{symbol:"",action:"",ipa:"",note:""},
      Final:{symbol:"",action:"",ipa:"",note:""}
    };
  }

  function buildSymbol(cardLetter, action, ipa, note, position) {
    let sym = "";
    if (!action) return sym;
    switch(action) {
      case "S":
        sym = ipa ? `${cardLetter} → ${ipa}` : `${cardLetter} →`;
        if (!note && ipa) {
          const orig = cardsData.find(c => c.title === cardLetter)?.ipa || "";
          const processLabel = detectPhonoProcess(orig, ipa, action);
          if (processLabel) note = processLabel;
        }
        break;
      case "O": sym="×"; break;
      case "D": sym=ipa?`~${ipa}`:"~"; break;
      case "A": sym=ipa?`+${ipa}`:"+";
        if(!note && ipa===cardLetter+cardLetter) note="Reduplication";
        break;
    }
    if(note?.trim()) sym += ` (${note.trim()})`;
    return sym;
  }

  // ====== Render Flip Card ======
  function renderFlippingCard() {
    const data = cardsData[currentIndex];
    if (!cardContainer) return;

    cardContainer.innerHTML = `
      <div class="card flip-card">
        <div class="card-inner">
          <div class="card-front">
            <div class="flip-img-wrapper">
              <img src="${data.frontImg}" alt="${data.title}">
            </div>
          </div>
          <div class="card-back">
            <div class="flip-img-wrapper">
              <img src="${data.backImg}" alt="${data.title} back">
            </div>
          </div>
        </div>
      </div>
    `;

    const cardEl = cardContainer.querySelector(".card");
    cardEl.addEventListener("click", () => cardEl.classList.toggle("flipped"));
  }

  // ====== Update Card UI ======
  function updateCardUI(){ 
    const c=cardsData[currentIndex]; 
    if(!c) return; 
    if(cardTitleEl) cardTitleEl.textContent=c.title; 
    renderFlippingCard(); 
    selectedPosition=null; 
    selectedAction=null; 
    updateModalHighlights(); 
    renderResults(); 
  }

 // ====== Render Results ======
function renderResults(){
  let html=""; 

  if(personalForm){ 
    const name = personalForm.patientName.value || ""; 
    const dob = personalForm.patientDob.value || ""; 
    const gender = personalForm.querySelector('input[name="gender"]:checked')?.value || ""; 
    const age = personalForm.chronAge.value || ""; 
    const id = personalForm.patientId.value || ""; 
    const clinician = personalForm.clinicianName.value || ""; 

    if(name || dob || gender || age || id || clinician){
      html += `<p><strong>Personal info:</strong></p>
               <p>Name: ${escapeHtml(name)}</p>
               <p>DOB: ${escapeHtml(dob)}</p>
               <p>Gender: ${escapeHtml(gender)}</p>
               <p>Chronological Age: ${escapeHtml(age)}</p>
               <p>ID: ${escapeHtml(id)}</p>
               <p>Clinician: ${escapeHtml(clinician)}</p>
               <hr/>`;
    } 
  }

  cardsData.forEach(card=>{
    ensureCardResult(card.title); 
    const r = resultsData[card.title];
    html += `<p><strong>Sound ${escapeHtml(card.title)}:</strong></p>`;
    ["First","Middle","Final"].forEach(pos=>{
      let sym = r[pos].symbol;
      if(!sym) sym = buildSymbol(card.title,r[pos].action,r[pos].ipa,r[pos].note,pos);
      html += `<p>${pos}: ${escapeHtml(sym)}</p>`;
    });
  });

  if(resultsSummary) resultsSummary.innerHTML = html || `<p class="muted">No results yet.</p>`;

  const hasAny = Object.keys(resultsData).some(t=>{
    const v = resultsData[t];
    return v.First.symbol || v.Middle.symbol || v.Final.symbol;
  }) || (personalForm && ["patientName","patientDob","chronAge","patientId","clinicianName"].some(id=>personalForm[id]?.value || (id === "chronAge" && personalForm.chronAge.value)));

  if(downloadBtn) downloadBtn.disabled = !hasAny;
}

  // ====== Update Modal Highlights & FML Disabling Logic ======
  function updateModalHighlights(){
    fmlButtons.forEach(b=>b.classList.remove("selected","has-value","disabled"));
    actionButtons.forEach(b=>b.classList.remove("selected"));
    ipaButtons.forEach(b=>b.classList.remove("selected","used"));

    const curTitle = cardsData[currentIndex].title;
    ensureCardResult(curTitle);
    const curRes = resultsData[curTitle];

    if(curRes.First.symbol) fmlButtons.forEach(b=>{if(b.textContent.trim()==="F")b.classList.add("has-value");});
    if(curRes.Middle.symbol) fmlButtons.forEach(b=>{if(b.textContent.trim()==="M")b.classList.add("has-value");});
    if(curRes.Final.symbol) fmlButtons.forEach(b=>{if(b.textContent.trim()==="L")b.classList.add("has-value");});

    if(selectedPosition){ 
      const map={First:"F",Middle:"M",Final:"L"}; 
      fmlButtons.forEach(b=>{if(b.textContent.trim()===map[selectedPosition])b.classList.add("selected");}); 
    }
    if(selectedAction) actionButtons.forEach(b=>{if(b.textContent.trim()===selectedAction)b.classList.add("selected");});

    ipaButtons.forEach(b=>{ 
      const used=[curRes.First.ipa,curRes.Middle.ipa,curRes.Final.ipa].includes(b.textContent.trim()); 
      if(used)b.classList.add("used"); 
    });

    const vowelTitles = ["a","i","u","aː","iː","uː"];
    const diphthongTitles = ["aj","aw"];

    if(vowelTitles.includes(curTitle)){
      fmlButtons.forEach(b=>{ if(b.textContent.trim()==="F"){ b.classList.add("disabled"); b.disabled=true; } else b.disabled=false; });
    } else if(diphthongTitles.includes(curTitle)){
      fmlButtons.forEach(b=>{ if(["F","L"].includes(b.textContent.trim())){ b.classList.add("disabled"); b.disabled=true; } else b.disabled=false; });
    } else fmlButtons.forEach(b=>{ b.disabled=false; b.classList.remove("disabled"); });
  }

  // ====== Add or Update Result ======
  function addOrUpdateResult(position,action,ipa="",note=""){ 
    if(!position) return; 
    const card=cardsData[currentIndex]; 
    ensureCardResult(card.title); 
    resultsData[card.title][position]={symbol:buildSymbol(card.title,action,ipa,note,position),action,ipa,note}; 
    updateModalHighlights(); 
    renderResults(); 
  }

  // ====== Modal Alerts & Note Panel ======
  function showModalAlert(msg,timeout=2000){ 
    if(!modalBody) return; 
    const existing=modal.querySelector(".modal-alert"); 
    if(existing) existing.remove(); 
    const div=document.createElement("div"); 
    div.className="modal-alert"; 
    div.textContent=msg; 
    modalBody.prepend(div); 
    setTimeout(()=>div.remove(),timeout); 
  }

  function openNotePanel(){
    if(!modalBody||!selectedPosition) return showModalAlert("اختر الموضع أولا: F / M / L");
    const existing=modal.querySelector(".note-panel"); if(existing) existing.remove();
    const panel=document.createElement("div"); panel.className="note-panel modal-content";
    panel.innerHTML=`
      <div style="display:flex;gap:0.5rem;align-items:center">
        <label style="min-width:80px;font-weight:600;color:#006666">Action:</label>
        <select class="note-action-select">
          <option value="">-- اختر الفعل --</option>
          <option value="S">S (Substitution)</option>
          <option value="O">O (Omission)</option>
          <option value="D">D (Distortion)</option>
          <option value="A">A (Addition)</option>
        </select>
      </div>
      <textarea class="note-text" placeholder="أدخل الملاحظة هنا..." style="width:100%;min-height:80px;margin-top:0.5rem;padding:0.5rem;border-radius:8px;border:1px solid #dfe7ef;"></textarea>
      <div class="note-validate" style="display:none;color:#b42d00;margin-top:0.4rem"></div>
      <div style="display:flex;gap:0.5rem;justify-content:flex-end;margin-top:0.5rem">
        <button type="button" class="btn-cancel" style="background:#f0f3f6;padding:0.45rem 0.65rem;border-radius:8px;border:1px solid rgba(0,0,0,0.04);cursor:pointer">إلغاء</button>
        <button type="button" class="btn-save" style="background:#006666;color:#fff;padding:0.5rem 0.75rem;border-radius:8px;border:none;cursor:pointer">حفظ</button>
      </div>`;
    modalBody.prepend(panel);
    const selectEl=panel.querySelector(".note-action-select");
    if(selectedAction) selectEl.value=selectedAction;
    const saveBtn=panel.querySelector(".btn-save");
    const cancelBtn=panel.querySelector(".btn-cancel");
    const noteTextEl=panel.querySelector(".note-text");
    const validateEl=panel.querySelector(".note-validate");
    cancelBtn.addEventListener("click",()=>panel.remove());
    saveBtn.addEventListener("click",()=>{
      const note=noteTextEl.value.trim(); 
      const action=selectEl.value||selectedAction; 
      if(!selectedPosition) return showInlineValidate(validateEl,"اختر الموضع أولاً."); 
      if(!action) return showInlineValidate(validateEl,"اختر الفعل (S/O/D/A) أولاً."); 
      addOrUpdateResult(selectedPosition,action,"",note); 
      panel.remove(); 
    });
    setTimeout(()=>noteTextEl.focus(),80);
  }

  function showInlineValidate(el,msg){ el.textContent=msg; el.style.display="block"; setTimeout(()=>el.style.display="none",2000); }

  // ====== Bind Modal Buttons ======
  function bindModalButtons(){
    fmlButtons.forEach(b=>b.addEventListener("click",()=>{
      if(b.disabled) return;
      fmlButtons.forEach(x=>x.classList.remove("selected")); 
      b.classList.add("selected"); 
      const map={F:"First",M:"Middle",L:"Final"}; 
      selectedPosition=map[b.textContent.trim()]; 
    }));

    actionButtons.forEach(b=>b.addEventListener("click",()=>{
      actionButtons.forEach(x=>x.classList.remove("selected")); 
      b.classList.add("selected"); 
      selectedAction=b.textContent.trim(); 
      if(selectedPosition) addOrUpdateResult(selectedPosition,selectedAction); 
    }));

    ipaButtons.forEach(b=>b.addEventListener("click",()=>{
      if(!selectedPosition) return showModalAlert("اختر الموضع أولا"); 
      addOrUpdateResult(selectedPosition,selectedAction,b.textContent.trim()); 
    }));

    if(noteBtn) noteBtn.addEventListener("click",openNotePanel);
    if(addBtn) addBtn.addEventListener("click",()=>{ if(modal) modal.style.display="flex"; window.scrollTo({top:0}); });
    if(modalClose) modalClose.addEventListener("click",()=>modal.style.display="none");
    window.addEventListener("click", e=>{if(e.target===modal) modal.style.display="none";});
    if(downloadBtn) downloadBtn.addEventListener("click",()=>downloadReport());
  }

  function downloadReport(){ 
    let text=resultsSummary.innerText; 
    const blob=new Blob([text],{type:"text/plain"}); 
    const url=URL.createObjectURL(blob); 
    const a=document.createElement("a"); 
    a.href=url; a.download="report.txt"; a.click(); 
    URL.revokeObjectURL(url); 
  }
  // ====== Send to Google Sheets ======
  if (sendBtn) sendBtn.addEventListener("click", async () => {
    const payload = {
      timestamp: new Date().toISOString(),
      personalInfo: {
        name: personalForm.patientName.value || "",
        dob: personalForm.patientDob.value || "",
        gender: personalForm.querySelector('input[name="gender"]:checked')?.value || "",
        age: personalForm.chronAge.value || "",
        id: personalForm.patientId.value || "",
        clinician: personalForm.clinicianName.value || ""
      },
      results: resultsData
    };
    try {
      const resp = await fetch(SHEET_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (resp.ok) alert("Data sent successfully!");
      else alert("Failed to send data.");
    } catch (err) { alert("Error: " + err.message); }
  });


  // ====== Navigation Arrows ======
  if(leftArrow) leftArrow.addEventListener("click",()=>{currentIndex=(currentIndex-1+cardsData.length)%cardsData.length; updateCardUI();});
  if(rightArrow) rightArrow.addEventListener("click",()=>{currentIndex=(currentIndex+1)%cardsData.length; updateCardUI();});

  // ====== Initialize ======
  bindModalButtons();
  updateCardUI();
  renderResults();

});


// Info modal
document.getElementById("infoBtn").addEventListener("click", ()=> {
  document.getElementById("infoModal").style.display = "block";
});
document.getElementById("closeInfo").addEventListener("click", ()=> {
  document.getElementById("infoModal").style.display = "none";
});

// Summary modal
document.getElementById("summaryBtn").addEventListener("click", ()=> {
  document.getElementById("summaryModal").style.display = "block";
});
document.getElementById("closeSummary").addEventListener("click", ()=> {
  document.getElementById("summaryModal").style.display = "none";
});

// Close modal on outside click
window.addEventListener("click", (e)=> {
  if(e.target.classList.contains("modal")) {
    e.target.style.display = "none";
  }
});
