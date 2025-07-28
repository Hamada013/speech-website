// ---- Case History Form (Bilingual, Dynamic, TXT Export) ----

const resourceFiles = { en: "en.json", ar: "ar.json" };
let lang = "en";
let res = {};

// ---- UTILITY FUNCTIONS ----
function loadJson(file) { return fetch(file).then(r => r.json()); }
function makeElem(tag, attr = {}, children = []) {
  const el = document.createElement(tag);
  for (let key in attr) {
    if (key === "class") el.className = attr[key];
    else if (key === "for") el.htmlFor = attr[key];
    else if (key === "text") el.textContent = attr[key];
    else if (key === "html") el.innerHTML = attr[key];
    else if (key === "style") el.style.cssText = attr[key];
    else el.setAttribute(key, attr[key]);
  }
  (Array.isArray(children)) && children.forEach(ch => el.appendChild(ch));
  return el;
}
function getVal(id) { const el = document.getElementById(id); return el ? (el.value || "").trim() : ""; }
function getDynamicListValues(containerId, indices=[]) {
  let container = document.getElementById(containerId);
  if (!container) return [];
  let values = [];
  container.querySelectorAll(".row").forEach(row => {
    // indices: [0,1] for two-column, [] for one
    const cs = row.querySelectorAll("input,select,textarea");
    const value = indices.length ? indices.map(i => cs[i] ? cs[i].value : "").join(" / ") : (cs[0] ? cs[0].value : "");
    if(value.trim() !== "") values.push(value.trim());
  });
  return values;
}
function isPillSelected(id) {
  const el = document.getElementById(id);
  return el && el.classList.contains("selected");
}
function getSelectedPills(id) {
  return Array.from(document.querySelectorAll(`#${id} .pill.selected`)).map(p=>p.textContent).join(", ");
}

// ---- LANGUAGE/TRANSLATION ----
async function loadResources(language) {
  try { res = await loadJson(resourceFiles[language]); }
  catch { res = {}; }
  fillStaticText(); renderForm();
}
function fillStaticText() {
  document.title = res["form-title"] || "Child Case History";
  document.getElementById("form-title").textContent = res["form-title"] || "Child Case History";
  document.getElementById("label-en").textContent = res["lang-en"];
  document.getElementById("label-ar").textContent = res["lang-ar"];
  document.getElementById("export-pdf").textContent = res["export-pdf"] || "Download as Text";
  document.documentElement.lang = lang === "ar" ? "ar" : "en";
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}
const langToggle = document.getElementById("lang-toggle");
langToggle.addEventListener("change", () => {
  lang = langToggle.checked ? "ar" : "en";
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  loadResources(lang);
});

// ---- DYNAMIC LIST HELPER ----
function addDynamicRow(container, values, types, names) {
  const row = makeElem("div", {class:"row"});
  for(let i=0;i<types.length;i++) {
    const input = makeElem("input", {type: types[i], name:names[i]+"[]", value: values[i]||""});
    if(types[i]==="number") input.min = 0;
    row.appendChild(input);
  }
  const removeBtn = makeElem("button",{type:"button",class:"btn-remove",text:"−"});
  removeBtn.addEventListener("click",()=>container.removeChild(row));
  row.appendChild(removeBtn);container.appendChild(row);
}
function addServiceRow(container) {
  const row = makeElem("div", {class:"row"});
  const serviceSelect = makeElem("select", {name:"service-type[]", class:"dropdown"});
  ["","st","ot","pt","aba","psych","other-service"].forEach(key=>{
    serviceSelect.appendChild(makeElem("option", {value:key, text:res[key]||key}));
  });
  const otherInput = makeElem("input", {type:"text",name:"service-other[]",placeholder:res["other-service"],style:"display:none;"});
  serviceSelect.addEventListener("change",()=>{otherInput.style.display=serviceSelect.value==="other-service"?"":"none";if(serviceSelect.value!=="other-service")otherInput.value="";});
  const startDateInput = makeElem("input", {type:"date", name:"service-start[]"});
  const freqSelect = makeElem("select", {name:"service-frequency[]", class:"dropdown"});
  ["","weekly","biweekly","monthly","other-freq"].forEach(key=>{
    freqSelect.appendChild(makeElem("option",{value:key,text:res[key]||key}));
  });
  const freqOtherInput = makeElem("input", {type:"text", name:"freq-other[]", placeholder: res["other-freq"], style:"display:none;"});
  freqSelect.addEventListener("change",()=>{freqOtherInput.style.display=freqSelect.value==="other-freq"?"":"none";if(freqSelect.value!=="other-freq")freqOtherInput.value="";});
  const btnRemove = makeElem("button",{type:"button",class:"btn-remove",text:"−"});
  btnRemove.addEventListener("click",()=>container.removeChild(row));
  row.appendChild(serviceSelect);row.appendChild(otherInput);row.appendChild(startDateInput);row.appendChild(freqSelect);row.appendChild(freqOtherInput);row.appendChild(btnRemove);
  container.appendChild(row);
}

// === 1. GENERAL INFORMATION SECTION ===
function buildGeneralSection() {
  const sec = makeElem("section");
  sec.appendChild(makeElem("div", {class:"section-head", text: res["general-section"]}));
  const content = makeElem("div", {class:"section-content"});
  sec.appendChild(content);
  const row = makeElem("div", {class:"row-flex"});
  const left = makeElem("div", {class:"col2"});
  const right = makeElem("div", {class:"col2"});

  left.appendChild(makeElem("label", {for:"today-date", text: res["today-date"]}));
  const todayInput = makeElem("input", {type:"date", id:"today-date", name:"today-date"});
  left.appendChild(todayInput);
  left.appendChild(makeElem("div", {class:"note", text: res["today-date-note"]}));
  left.appendChild(makeElem("label", {for:"child-name", text: res["child-name"]}));
  left.appendChild(makeElem("input", {type:"text", id:"child-name", name:"child-name"}));
  left.appendChild(makeElem("label", {for:"dob", text: res["dob"]}));
  const dobInput = makeElem("input", {type:"date", id:"dob", name:"dob"});
  left.appendChild(dobInput);
  left.appendChild(makeElem("div", {class:"note", text: res["dob-note"]}));
  left.appendChild(makeElem("label", {for: "chron-age", text: res["chronological-age"]}));
  const chronAgeDisplay = makeElem("div", {id: "chron-age", class: "readonly-box"});
  left.appendChild(chronAgeDisplay);
  left.appendChild(makeElem("div", { class: "note", text: res["chronological-age-note"] }));
  left.appendChild(makeElem("label", {for: "school", text: res["school"]}));
  left.appendChild(makeElem("input", {type: "text", id: "school", name: "school"}));
  left.appendChild(makeElem("label", {for: "grade", text: res["grade"]}));
  const gradeSelect = makeElem("select", {id: "grade", name: "grade", class: "dropdown"});
  gradeSelect.appendChild(makeElem("option", {value:"", text:"--"}));
  for(let i=1;i<=12;i++) gradeSelect.appendChild(makeElem("option",{value:i,text:i}));
  left.appendChild(gradeSelect);
  left.appendChild(makeElem("label", {for: "address", text: res["address"]}));
  left.appendChild(makeElem("input", {type: "text", id: "address", name: "address"}));

  [
    ["mother-name","text"],["mother-occ","text"],["mother-email","email"],["mother-phone","tel"],
    ["father-name","text"],["father-occ","text"],["father-email","email"],["father-phone","tel"],
    ["specialist","text"],["specialist-address","text"],["specialist-email","email"],["specialist-phone","tel"]
  ].forEach(([id,type])=>{
    right.appendChild(makeElem("label", {for:id, text: res[id]}));
    right.appendChild(makeElem("input", {type:type, id:id, name:id}));
  });

  row.appendChild(left); row.appendChild(right);
  content.appendChild(row);

  function updateChronAge() {
    const dobVal = dobInput.value, todayVal = todayInput.value || new Date().toISOString().slice(0,10);
    let ageText = "";
    if (dobVal && todayVal) {
      const dob = new Date(dobVal), today = new Date(todayVal);
      if (dob <= today) {
        let y = today.getFullYear() - dob.getFullYear(),
            m = today.getMonth() - dob.getMonth(),
            d = today.getDate() - dob.getDate();
        if (d < 0) m--;
        if (m < 0) { y--; m += 12; }
        ageText = (y>0? y + " " + res["unit-years"] + " ":"") + (m>0? m+" "+res["unit-months"]:"");
      }
    }
    chronAgeDisplay.textContent = ageText||"—";
  }
  todayInput.addEventListener("change", updateChronAge); dobInput.addEventListener("change", updateChronAge);
  if(!todayInput.value) todayInput.value = new Date().toISOString().slice(0,10); updateChronAge();

  // Siblings/living with
  content.appendChild(makeElem("label",{text:res["live-with"]}));
  content.appendChild(makeElem("div",{class:"note",text:res["live-with-note"]}));
  const liveBox = makeElem("div",{id:"withwhom-list",class:"dynamic-list"});
  content.appendChild(liveBox);
  addDynamicRow(liveBox,["",""],["text","number"],["name","age"]);
  const addLiveBtn = makeElem("button",{type:"button",class:"btn",text:res["add"]});
  addLiveBtn.onclick=()=>addDynamicRow(liveBox,["",""],["text","number"],["name","age"]);
  content.appendChild(addLiveBtn);

  // Languages
  content.appendChild(makeElem("label", {text: res["languages"]}));
  const homeLangSelect = makeElem("select", {id:"lang-home",name:"lang-home",class:"dropdown"});
  const schoolLangSelect = makeElem("select", {id:"lang-school", name:"lang-school",class:"dropdown"});
  ["Arabic","English","Others"].forEach(l=>{
    homeLangSelect.appendChild(makeElem("option",{text:l,value:l}));
    schoolLangSelect.appendChild(makeElem("option",{text:l,value:l}));
  });
  const homeOtherInput = makeElem("input",{type:"text",id:"lang-home-other",name:"lang-home-other",placeholder:res["others"],style:"display:none;"});
  const schoolOtherInput = makeElem("input",{type:"text",id:"lang-school-other",name:"lang-school-other",placeholder:res["others"],style:"display:none;"});
  homeLangSelect.onchange=()=>{homeOtherInput.style.display=homeLangSelect.value==="Others"? "" : "none";if(homeLangSelect.value!=="Others")homeOtherInput.value="";};
  schoolLangSelect.onchange=()=>{schoolOtherInput.style.display=schoolLangSelect.value==="Others"? "" : "none";if(schoolLangSelect.value!=="Others")schoolOtherInput.value="";};
  content.appendChild(makeElem("div",{style:"display:flex;gap:1rem;flex-wrap:wrap;"},[
    makeElem("div",{style:"flex:1 1 45%;"},[makeElem("label",{for:"lang-home",text:res["at-home"]}),homeLangSelect,homeOtherInput]),
    makeElem("div",{style:"flex:1 1 45%;"},[makeElem("label",{for:"lang-school",text:res["at-school"]}),schoolLangSelect,schoolOtherInput])
  ]));

  // With whom ("pills")
  content.appendChild(makeElem("label",{text:res["with-whom"]}));
  const spendWithBox = makeElem("div",{class:"pills-box",id:"spendwith-pills"});
  const spendOptions = ["mom","dad","siblings","grandparents","other-family","other"];
  spendOptions.forEach(key=>{
    const pill=makeElem("button",{type:"button",class:"pill","data-value":key,text:res[key]});
    pill.onclick=()=>{
      pill.classList.toggle("selected");
      if(key==="other") {
        spendWithOtherInput.style.display=pill.classList.contains("selected")?"":"none";
        if(!pill.classList.contains("selected")) spendWithOtherInput.value="";
      }
    };
    spendWithBox.appendChild(pill);
  });
  const spendWithOtherInput = makeElem("input",{type:"text",id:"spendwith-other",placeholder:res["others"],style:"display:none; margin-left:9px;"});
  content.appendChild(spendWithBox);
  content.appendChild(spendWithOtherInput);

  // Activities/toys (dynamic)
  content.appendChild(makeElem("label",{text:res["activities"]}));
  const activityList=makeElem("div",{class:"dynamic-list",id:"activities-list"});addDynamicRow(activityList,[""],["text"],["activity"]);
  content.appendChild(activityList);
  const addActivityBtn=makeElem("button",{type:"button",class:"btn",text:res["add"]});addActivityBtn.onclick=()=>addDynamicRow(activityList,[""],["text"],["activity"]);
  content.appendChild(addActivityBtn);
  content.appendChild(makeElem("label",{text:res["toys"]}));
  const toyList=makeElem("div",{class:"dynamic-list",id:"toys-list"});addDynamicRow(toyList,[""],["text"],["toy"]);
  content.appendChild(toyList);
  const addToyBtn=makeElem("button",{type:"button",class:"btn",text:res["add"]});addToyBtn.onclick=()=>addDynamicRow(toyList,[""],["text"],["toy"]);
  content.appendChild(addToyBtn);

  return sec;
}

// --- 2. PRENATAL & BIRTH SECTION ---
function buildPrenatalSection() {
  const sec = makeElem("section");
  sec.appendChild(makeElem("div", {class:"section-head", text: res["prenatal-section"]}));
  const content = makeElem("div", {class:"section-content"});
  sec.appendChild(content);

  content.appendChild(makeElem("label", {text: res["pregnancy-health"]}));
  const healthRow = makeElem("div", {class:"pills-box"});
  const normalPill = makeElem("button", {type:"button", class:"pill", id:"preg-normal-pill", text: res["preg-normal"]});
  normalPill.onclick = ()=>{
    normalPill.classList.toggle("selected");
    if(normalPill.classList.contains("selected")){
      healthPills.forEach(p=>p.classList.remove("selected"));
      ["illnesses","accidents","medications"].forEach(type=>{
        document.getElementById("preg-"+type+"-txt").style.display="none";
        document.getElementById("preg-"+type+"-txt").value="";
      });
    }
  };
  healthRow.appendChild(normalPill);
  const healthTypes = ["illnesses", "accidents", "medications"];
  const healthPills = healthTypes.map(type=>{
    const pill = makeElem("button", {type:"button", class:"pill", id:"preg-"+type+"-pill", text: res[type]});
    pill.onclick = ()=>{
      pill.classList.toggle("selected");
      if(pill.classList.contains("selected")) normalPill.classList.remove("selected");
      document.getElementById("preg-"+type+"-txt").style.display = pill.classList.contains("selected")?"":"none";
      if(!pill.classList.contains("selected")) document.getElementById("preg-"+type+"-txt").value="";
    };
    healthRow.appendChild(pill);
    return pill;
  });
  content.appendChild(healthRow);
  healthTypes.forEach(type=>{
    const txt = makeElem("input", {type:"text", id:"preg-"+type+"-txt", placeholder: res["details"], style:"display:none; margin-top:5px;"});
    content.appendChild(txt);
  });
  content.appendChild(makeElem("label", {text: res["length-pregnancy"]}));
  const lengthDiv = makeElem("div", {style:"display:flex; gap:15px; flex-wrap:wrap;"});
  const lengthSelect = makeElem("select", {id:"pregnancy-term", name:"pregnancy-term", class:"dropdown"});
  lengthSelect.appendChild(makeElem("option", {value:"", text:"--"}));
  ["full-term", "premature", "overdue"].forEach(key => {
    lengthSelect.appendChild(makeElem("option", {value:key, text: res[key]}));
  });
  const weeksInput = makeElem("input", {type:"number", id:"preg-weeks", name:"preg-weeks", min:20, max:44, placeholder: res["weeks"], style:"width:80px;"});
  lengthDiv.appendChild(lengthSelect);
  lengthDiv.appendChild(weeksInput);
  content.appendChild(lengthDiv);
  content.appendChild(makeElem("label", {text: res["birth-condition"]}));
  const condRow = makeElem("div", {class:"pills-box"});
  const condTypes = [
    {key:"birth-normal", text:res["preg-normal"]},
    {key:"birth-minor", text:res["minor-complications"]},
    {key:"birth-serious", text:res["serious-complications"]}
  ];
  condTypes.forEach(({key, text})=>{
    const pill = makeElem("button", {type:"button", class:"pill", id:key, text});
    pill.onclick = ()=>{
      condRow.querySelectorAll(".pill").forEach(p=>p!==pill && p.classList.remove("selected"));
      pill.classList.toggle("selected");
      birthDetailsInput.style.display = (key!=="birth-normal" && pill.classList.contains("selected"))? "" : "none";
      if(!birthDetailsInput.style.display) birthDetailsInput.value="";
    };
    condRow.appendChild(pill);
  });
  content.appendChild(condRow);
  const birthDetailsInput = makeElem("input", {type:"text", id:"birth-condition-details", placeholder: res["details"], style:"display:none; margin-top:6px;"});
  content.appendChild(birthDetailsInput);
  content.appendChild(makeElem("label", {text: res["birth-weight"]}));
  const bwDiv = makeElem("div", {style:"display:flex; gap:10px; align-items:center; flex-wrap:wrap;"});
  const birthWeightInput = makeElem("input", {type:"number", id:"birth-weight", name:"birth-weight", min:0, step:0.01});
  const weightUnitSelect = makeElem("select", {id:"birth-weight-unit", name:"birth-weight-unit", class:"dropdown", style:"flex:0 0 90px;"});
  weightUnitSelect.appendChild(makeElem("option", {value:"kg", text: res["kg"]}));
  weightUnitSelect.appendChild(makeElem("option", {value:"lbs", text: res["lbs"]}));
  bwDiv.appendChild(birthWeightInput);
  bwDiv.appendChild(weightUnitSelect);
  content.appendChild(bwDiv);
  content.appendChild(makeElem("label", {text: res["unusual-condition"]}));
  const unusualRow = makeElem("div", {class:"pills-box"});
  const noUnusualPill = makeElem("button", {type:"button", class:"pill selected", id:"no-unusual-pill", text: res["no-unusual"] });
  unusualRow.appendChild(noUnusualPill);
  const unusualTextPill = makeElem("button", {type:"button", class:"pill", id:"unusual-pill", text: res["other"] });
  unusualRow.appendChild(unusualTextPill);
  const unusualTextInput = makeElem("input", {type:"text", id:"unusual-text", placeholder: res["details"], style:"display:none; margin-top:6px;"});
  noUnusualPill.onclick = ()=>{
    noUnusualPill.classList.add("selected"); unusualTextPill.classList.remove("selected");
    unusualTextInput.style.display="none"; unusualTextInput.value="";
  };
  unusualTextPill.onclick = ()=>{
    noUnusualPill.classList.remove("selected"); unusualTextPill.classList.add("selected");
    unusualTextInput.style.display="";
  };
  content.appendChild(unusualRow);
  content.appendChild(unusualTextInput);

  return sec;
}

// --- 3. MEDICAL HISTORY SECTION ---
function buildMedicalSection() {
  const sec = makeElem("section");
  sec.appendChild(makeElem("div",{class:"section-head",text:res["medical-section"]}));
  const content = makeElem("div",{class:"section-content"});
  sec.appendChild(content);

  // Congenital disorder
  content.appendChild(makeElem("label",{text:res["congenital-disorder"]}));
  const congRow=makeElem("div",{class:"pills-box"});
  const noConPill=makeElem("button",{type:"button",class:"pill selected",id:"no-congenital-pill",text:res["no-congenital"]});
  const yesConPill=makeElem("button",{type:"button",class:"pill",id:"yes-congenital-pill",text:res["other"]});
  const congText=makeElem("input",{type:"text",id:"congenital-text",placeholder:res["details"],style:"display:none;"});
  noConPill.onclick=()=>{noConPill.classList.add("selected");yesConPill.classList.remove("selected");congText.style.display="none";congText.value="";};
  yesConPill.onclick=()=>{noConPill.classList.remove("selected");yesConPill.classList.add("selected");congText.style.display="";};
  congRow.appendChild(noConPill);congRow.appendChild(yesConPill);
  content.appendChild(congRow);content.appendChild(congText);

  // Psychiatric disorder
  content.appendChild(makeElem("label",{text:res["psychiatric-disorder"]}));
  const psychRow=makeElem("div",{class:"pills-box"});
  const noPsychPill=makeElem("button",{type:"button",class:"pill selected",id:"no-psychiatric-pill",text:res["no-psychiatric"]});
  const yesPsychPill=makeElem("button",{type:"button",class:"pill",id:"yes-psychiatric-pill",text:res["other"]});
  const psychSelect=makeElem("select",{id:"psychiatric-select",style:"display:none;"});
  ["","autism","adhd","anxiety","depression","other"].forEach(opt=>psychSelect.appendChild(makeElem("option",{value:opt,text:res[opt]||opt})));
  const psychOtherTxt=makeElem("input",{type:"text",id:"psychiatric-other-text",placeholder:res["details"],style:"display:none;"});
  noPsychPill.onclick=()=>{noPsychPill.classList.add("selected");yesPsychPill.classList.remove("selected");psychSelect.style.display="none";psychOtherTxt.style.display="none";psychOtherTxt.value="";psychSelect.value="";};
  yesPsychPill.onclick=()=>{noPsychPill.classList.remove("selected");yesPsychPill.classList.add("selected");psychSelect.style.display="";};
  psychSelect.onchange=()=>{psychOtherTxt.style.display=psychSelect.value==="other"? "": "none";if(psychSelect.value!=="other")psychOtherTxt.value="";};
  psychRow.appendChild(noPsychPill);psychRow.appendChild(yesPsychPill);
  content.appendChild(psychRow);content.appendChild(psychSelect);content.appendChild(psychOtherTxt);

  // Chronic
  content.appendChild(makeElem("label",{text:res["conditions"]}));
  const chronicRow=makeElem("div",{class:"pills-box"});
  const noChronicPill=makeElem("button",{type:"button",class:"pill selected",id:"no-chronic-pill",text:res["no-chronic"]});
  const yesChronicPill=makeElem("button",{type:"button",class:"pill",id:"yes-chronic-pill",text:res["other"]});
  const chronicList=makeElem("div",{class:"dynamic-list",id:"chronic-list",style:"display:none"});
  addDynamicRow(chronicList,[""],["text"],["chronic-condition"]);
  const addChronicBtn=makeElem("button",{type:"button",class:"btn",text:res["add"],style:"display:none;"});
  addChronicBtn.onclick=()=>addDynamicRow(chronicList,[""],["text"],["chronic-condition"]);
  noChronicPill.onclick=()=>{noChronicPill.classList.add("selected");yesChronicPill.classList.remove("selected");chronicList.style.display="none";addChronicBtn.style.display="none";chronicList.innerHTML="";};
  yesChronicPill.onclick=()=>{noChronicPill.classList.remove("selected");yesChronicPill.classList.add("selected");chronicList.style.display="";addChronicBtn.style.display="";if(!chronicList.hasChildNodes())addDynamicRow(chronicList,[""],["text"],["chronic-condition"]);};
  chronicRow.appendChild(noChronicPill);chronicRow.appendChild(yesChronicPill);
  content.appendChild(chronicRow);content.appendChild(chronicList);content.appendChild(addChronicBtn);

  // Medical events
  content.appendChild(makeElem("label",{text:res["medical-events"]}));
  const noMEPill=makeElem("button",{type:"button",class:"pill selected",id:"no-medical-events-pill",text:res["no-medical-events"]});
  const yesMEPill=makeElem("button",{type:"button",class:"pill",id:"yes-medical-events-pill",text:res["other"]});
  const meList=makeElem("div",{class:"dynamic-list",id:"medical-events-list",style:"display:none"});
  addDynamicRow(meList,["",""],["text","text"],["medical-event-desc","medical-event-date"]);
  const addMEBtn=makeElem("button",{type:"button",class:"btn",text:res["add"],style:"display:none;"});
  addMEBtn.onclick=()=>addDynamicRow(meList,["",""],["text","text"],["medical-event-desc","medical-event-date"]);
  noMEPill.onclick=()=>{noMEPill.classList.add("selected");yesMEPill.classList.remove("selected");meList.style.display="none";addMEBtn.style.display="none";meList.innerHTML="";};
  yesMEPill.onclick=()=>{noMEPill.classList.remove("selected");yesMEPill.classList.add("selected");meList.style.display="";addMEBtn.style.display="";if(!meList.hasChildNodes())addDynamicRow(meList,["",""],["text","text"],["medical-event-desc","medical-event-date"]);};
  content.appendChild(makeElem("div",{class:"pills-box"},[noMEPill,yesMEPill]));content.appendChild(meList);content.appendChild(addMEBtn);

  // Medications
  content.appendChild(makeElem("label",{text:res["medications-title"]}));
  const noMedPill=makeElem("button",{type:"button",class:"pill selected",id:"no-medications-pill",text:res["no-medications"]});
  const yesMedPill=makeElem("button",{type:"button",class:"pill",id:"yes-medications-pill",text:res["other"]});
  const medList=makeElem("div",{class:"dynamic-list",id:"medications-list",style:"display:none"});
  addDynamicRow(medList,[""],["text"],["medication"]);
  const addMedBtn=makeElem("button",{type:"button",class:"btn",text:res["add"],style:"display:none;"});
  addMedBtn.onclick=()=>addDynamicRow(medList,[""],["text"],["medication"]);
  noMedPill.onclick=()=>{noMedPill.classList.add("selected");yesMedPill.classList.remove("selected");medList.style.display="none";addMedBtn.style.display="none";medList.innerHTML="";};
  yesMedPill.onclick=()=>{noMedPill.classList.remove("selected");yesMedPill.classList.add("selected");medList.style.display="";addMedBtn.style.display="";if(!medList.hasChildNodes())addDynamicRow(medList,[""],["text"],["medication"]);};
  content.appendChild(makeElem("div",{class:"pills-box"},[noMedPill,yesMedPill]));content.appendChild(medList);content.appendChild(addMedBtn);

  // Dietary
  content.appendChild(makeElem("label",{text:res["dietary-concerns"]}));
  const noDietPill=makeElem("button",{type:"button",class:"pill selected",id:"no-dietary-pill",text:res["no-dietary"]});
  const yesDietPill=makeElem("button",{type:"button",class:"pill",id:"yes-dietary-pill",text:res["other"]});
  const dietaryTxt=makeElem("input",{type:"text",id:"dietary-text",placeholder:res["details"],style:"display:none;"});
  noDietPill.onclick=()=>{noDietPill.classList.add("selected");yesDietPill.classList.remove("selected");dietaryTxt.style.display="none";dietaryTxt.value="";};
  yesDietPill.onclick=()=>{noDietPill.classList.remove("selected");yesDietPill.classList.add("selected");dietaryTxt.style.display="";};
  content.appendChild(makeElem("div",{class:"pills-box"},[noDietPill,yesDietPill]));content.appendChild(dietaryTxt);
  return sec;
}

// --- 4. DEVELOPMENTAL HISTORY SECTION ---
function buildDevelopmentSection() {
  const sec = makeElem("section");
  sec.appendChild(makeElem("div", {class:"section-head", text: res["development-section"]}));
  const content = makeElem("div", {class:"section-content"});
  sec.appendChild(content);
  content.appendChild(makeElem("div", {class:"note"}, res["milestone-note"]));
  const milestones = [
    ["sit", "4–7"], ["crawl", "6–10"], ["stand", "9–12"], ["walk", "9–15"],
    ["babble", "4–6"], ["first-word", "10–15"], ["label-objects", "12–15"], ["combine-words", "18–24"],
    ["self-feed", "10–14"], ["self-dress", "24–36"], ["use-toilet", "18–24"], ["ask-questions", "24–36"]
  ];
  const container = makeElem("div", {class:"row-flex"});
  milestones.forEach(([key, range]) => {
    const col = makeElem("div", {class:"col2"});
    col.appendChild(makeElem("label", {for:"milestone-" + key, text: res[key]}));
    col.appendChild(makeElem("input", {type:"number", id:"milestone-"+key, name:"milestone-"+key, min:0, placeholder:range}));
    container.appendChild(col);
  });
  content.appendChild(container);
  content.appendChild(makeElem("label", {for: "receptive-vocab", text: res["receptive-vocab"]}));
  content.appendChild(makeElem("input", {type:"number", id:"receptive-vocab", name:"receptive-vocab", min:0, placeholder: res["word-example"]}));
  content.appendChild(makeElem("div", {class:"table-ref", html: `
    <div><strong>${res["ref-table"]}</strong></div>
    <table>
      <thead><tr><th>${res["age-months"]}</th><th>${res["expected-words"]}</th></tr></thead>
      <tbody>
        <tr><td>12</td><td>50–100</td></tr>
        <tr><td>18</td><td>100–200</td></tr>
        <tr><td>24</td><td>200–400</td></tr>
        <tr><td>36</td><td>400–800</td></tr>
        <tr><td>48</td><td>800–1500</td></tr>
        <tr><td>60</td><td>1500–2000</td></tr>
      </tbody>
    </table>
  `}));
  content.appendChild(makeElem("label", {for:"sample-utterance", text: res["sample-utterance"]}));
  content.appendChild(makeElem("textarea", {id:"sample-utterance", name:"sample-utterance", placeholder: res["sample-placeholder"]}));
  return sec;
}

// --- 5. SPEECH-LANGUAGE SECTION ---
function buildSpeechSection() {
  const sec = makeElem("section");
  sec.appendChild(makeElem("div", {class:"section-head", text: res["speech-section"]}));
  const content = makeElem("div", {class:"section-content"});
  sec.appendChild(content);

  content.appendChild(makeElem("label", {for:"describe-concern", text: res["describe-concern"]}));
  content.appendChild(makeElem("textarea", {id:"describe-concern", name:"describe-concern"}));
  content.appendChild(makeElem("label", {for:"first-noticed", text: res["first-noticed"]}));
  content.appendChild(makeElem("input", {type:"text", id:"first-noticed", name:"first-noticed"}));
  content.appendChild(makeElem("label", {for:"progression", text: res["progression"]}));
  content.appendChild(makeElem("textarea", {id:"progression", name:"progression"}));

  // Communication modes: pills
  content.appendChild(makeElem("label", {text: res["communication-modes"]}));
  const commBox = makeElem("div", {class:"pills-box", id:"comm-pills"});
  ["gestures", "single-words", "phrases-sentences"].forEach(key => {
    const pill = makeElem("button",{type:"button",class:"pill",id:"comm-"+key+"-pill",text:res[key]});
    pill.onclick=()=>pill.classList.toggle("selected");
    commBox.appendChild(pill);
  });
  content.appendChild(commBox);
  content.appendChild(makeElem("input", {type:"text", id:"comm-other", name:"comm-other", placeholder: res["other-modes"]}));

  // Social interaction
  content.appendChild(makeElem("label", {text: res["interaction"]}));
  content.appendChild(makeElem("input", {type:"text", id:"interact", name:"interact"}));
  const interactBox = makeElem("div", {class:"pills-box", id:"interact-pills"});
  ["shy", "aggressive", "reserved", "friendly", "other-interaction"].forEach(key => {
    const pill = makeElem("button",{type:"button",class:"pill",id:"int-"+key+"-pill",text:res[key]});
    pill.onclick=()=>{
      pill.classList.toggle("selected");
      if(key==="other-interaction" && !pill.classList.contains("selected")) document.getElementById("other-interaction-txt").style.display="none";
      if(key==="other-interaction" && pill.classList.contains("selected"))  document.getElementById("other-interaction-txt").style.display="";
    };
    interactBox.appendChild(pill);
  });
  content.appendChild(interactBox);
  content.appendChild(makeElem("input", {type:"text", id:"other-interaction-txt", name:"other-interaction-txt", placeholder: res["other"], style:"display:none;"}));

  // Additional services (pills)
  content.appendChild(makeElem("label", {text: res["previous-services"]}));
  const noServPill=makeElem("button",{type:"button",class:"pill selected",id:"no-services-pill",text:res["no-services"]});
  const yesServPill=makeElem("button",{type:"button",class:"pill",id:"yes-services-pill",text:res["other"]});
  const servicesList=makeElem("div",{class:"dynamic-list",id:"services-list",style:"display:none;"});
  addServiceRow(servicesList);
  const addServiceBtn=makeElem("button",{type:"button",class:"btn",text:res["add"],style:"display:none;"});
  addServiceBtn.onclick=()=>addServiceRow(servicesList);
  noServPill.onclick=()=>{noServPill.classList.add("selected");yesServPill.classList.remove("selected");servicesList.style.display="none";addServiceBtn.style.display="none";servicesList.innerHTML="";};
  yesServPill.onclick=()=>{noServPill.classList.remove("selected");yesServPill.classList.add("selected");servicesList.style.display="";addServiceBtn.style.display="";if(!servicesList.hasChildNodes())addServiceRow(servicesList);};
  content.appendChild(makeElem("div",{class:"pills-box"},[noServPill,yesServPill]));content.appendChild(servicesList);content.appendChild(addServiceBtn);

  // IFSP/IEP -- radio
  content.appendChild(makeElem("label", {text: res["ifsp-iep-reports"]}));
  const ifspDiv = makeElem("div", {});
  const ifspYes = makeElem("input", {type:"radio", id:"ifsp-yes", name:"ifsp", value:"yes"});
  const ifspNo = makeElem("input", {type:"radio", id:"ifsp-no", name:"ifsp", value:"no", checked:true});
  const labelNo = makeElem("label", {for:"ifsp-no", text: res["no"]});
  const labelYes = makeElem("label", {for:"ifsp-yes", text: res["yes"]});
  ifspDiv.appendChild(ifspNo);ifspDiv.appendChild(labelNo);ifspDiv.appendChild(ifspYes);ifspDiv.appendChild(labelYes);
  content.appendChild(ifspDiv);

  // Family history
  content.appendChild(makeElem("label", {text: res["family-history"]}));
  const famDiv = makeElem("div", {});
  const famYesRadio = makeElem("input", {type:"radio", id:"family-yes", name:"family-history", value:"yes"});
  const famNoRadio = makeElem("input", {type:"radio", id:"family-no", name:"family-history", value:"no", checked:true});
  const labelFamNo = makeElem("label", {for:"family-no", text: res["no"]});
  const labelFamYes = makeElem("label", {for:"family-yes", text: res["yes"]});
  famDiv.appendChild(famNoRadio);famDiv.appendChild(labelFamNo);famDiv.appendChild(famYesRadio);famDiv.appendChild(labelFamYes);
  content.appendChild(famDiv);
  const famTextArea = makeElem("textarea", {id:"family-text", name:"family-text", placeholder: res["family-placeholder"], style:"display:none; margin-top:6px;"});
  content.appendChild(famTextArea);
  function toggleFamText() {
    famTextArea.style.display = famYesRadio.checked ? "" : "none";
    if(!famYesRadio.checked) famTextArea.value = "";
  }
  famYesRadio.addEventListener("change", toggleFamText);
  famNoRadio.addEventListener("change", toggleFamText);
  toggleFamText();

  // Additional notes textarea
  content.appendChild(makeElem("label", {for:"additional-notes", text: res["add-notes"] }));
  content.appendChild(makeElem("textarea", {id:"additional-notes", name:"additional-notes", placeholder: res["notes-placeholder"] }));

  return sec;
}

// === DOWNLOAD TEXT FUNCTION ===
document.getElementById("export-pdf").onclick = function () {
  const bigLabel = k => res[k] || k;
  let isAr = (lang === "ar");
  let lines = [];

  // === General Info
  lines.push("=== " + bigLabel("general-section") + " ===");
  lines.push(bigLabel("today-date") + ": " + getVal("today-date"));
  lines.push(bigLabel("child-name") + ": " + getVal("child-name"));
  lines.push(bigLabel("dob") + ": " + getVal("dob"));
  lines.push(bigLabel("chronological-age") + ": " + (document.getElementById("chron-age") ? document.getElementById("chron-age").textContent : ""));
  lines.push(bigLabel("school") + ": " + getVal("school"));
  lines.push(bigLabel("grade") + ": " + getVal("grade"));
  lines.push(bigLabel("address") + ": " + getVal("address"));
  lines.push(bigLabel("mother-name") + ": " + getVal("mother-name"));
  lines.push(bigLabel("mother-occ") + ": " + getVal("mother-occ"));
  lines.push(bigLabel("mother-email") + ": " + getVal("mother-email"));
  lines.push(bigLabel("mother-phone") + ": " + getVal("mother-phone"));
  lines.push(bigLabel("father-name") + ": " + getVal("father-name"));
  lines.push(bigLabel("father-occ") + ": " + getVal("father-occ"));
  lines.push(bigLabel("father-email") + ": " + getVal("father-email"));
  lines.push(bigLabel("father-phone") + ": " + getVal("father-phone"));
  lines.push(bigLabel("specialist") + ": " + getVal("specialist"));
  lines.push(bigLabel("specialist-address") + ": " + getVal("specialist-address"));
  lines.push(bigLabel("specialist-email") + ": " + getVal("specialist-email"));
  lines.push(bigLabel("specialist-phone") + ": " + getVal("specialist-phone"));
  lines.push(bigLabel("live-with") + ": " + getDynamicListValues("withwhom-list",[0,1]).join(", "));
  lines.push(bigLabel("languages") + ": " + ((getVal("lang-home")==="Others"?getVal("lang-home-other"):getVal("lang-home")) + " / " + (getVal("lang-school")==="Others"?getVal("lang-school-other"):getVal("lang-school"))));
  lines.push(bigLabel("with-whom") + ": " + getSelectedPills("spendwith-pills") + (getVal("spendwith-other") ? ", " + getVal("spendwith-other") : ""));
  lines.push(bigLabel("activities") + ": " + getDynamicListValues("activities-list").join(", "));
  lines.push(bigLabel("toys") + ": " + getDynamicListValues("toys-list").join(", "));

  // === Prenatal & Birth
  lines.push("\n=== " + bigLabel("prenatal-section") + " ===");
  // Mother's health (pills/fields)
  {
    let out = [];
    if(isPillSelected("preg-normal-pill")) out.push(bigLabel("preg-normal"));
    ["illnesses","accidents","medications"].forEach(t=>{
      if(isPillSelected("preg-"+t+"-pill") && getVal("preg-"+t+"-txt"))
        out.push(bigLabel(t)+": "+getVal("preg-"+t+"-txt"));
    });
    lines.push(bigLabel("pregnancy-health")+": "+(out.join(" / ")||"—"));
  }
  lines.push(bigLabel("length-pregnancy")+": " +
    ((res[getVal("pregnancy-term")]||getVal("pregnancy-term")||"")+(getVal("preg-weeks")?", "+getVal("preg-weeks")+" "+res["weeks"]:""))
  );
  {
    let arr=[];
    ["birth-normal","birth-minor","birth-serious"].forEach(k=>{
      if(isPillSelected(k)) arr.push(res[k]=="Normal"?res["preg-normal"]:res[k]);
    });
    if(getVal("birth-condition-details")) arr.push(getVal("birth-condition-details"));
    lines.push(bigLabel("birth-condition")+": "+(arr.join(" / ")||"—"));
  }
  lines.push(bigLabel("birth-weight")+": "+((getVal("birth-weight")?getVal("birth-weight")+" "+getVal("birth-weight-unit"):"")));
  lines.push(bigLabel("unusual-condition")+": "+(isPillSelected("no-unusual-pill")?res["no-unusual"]:getVal("unusual-text")));

  // === Medical
  lines.push("\n=== " + bigLabel("medical-section") + " ===");
  lines.push(bigLabel("congenital-disorder")+": "+(isPillSelected("no-congenital-pill") ? res["no-congenital"] : getVal("congenital-text")));
  lines.push(bigLabel("psychiatric-disorder")+": "+(isPillSelected("no-psychiatric-pill")?res["no-psychiatric"]:
    (getVal("psychiatric-select")==="other"?getVal("psychiatric-other-text"):(res[getVal("psychiatric-select")]||getVal("psychiatric-select")))));
  lines.push(bigLabel("conditions")+": "+(isPillSelected("no-chronic-pill")?res["no-chronic"]:getDynamicListValues("chronic-list").join(", ")));
  lines.push(bigLabel("medical-events")+": "+(isPillSelected("no-medical-events-pill")?res["no-medical-events"]:getDynamicListValues("medical-events-list",[0,1]).join(", ")));
  lines.push(bigLabel("medications-title")+": "+(isPillSelected("no-medications-pill")?res["no-medications"]:getDynamicListValues("medications-list").join(", ")));
  lines.push(bigLabel("dietary-concerns")+": "+(isPillSelected("no-dietary-pill")?res["no-dietary"]:getVal("dietary-text")));

  // === Developmental
  lines.push("\n=== " + bigLabel("development-section") + " ===");
  [
      "sit", "crawl", "stand", "walk", "babble", "first-word", "label-objects", "combine-words",
      "self-feed", "self-dress", "use-toilet", "ask-questions"
    ].forEach(k=>lines.push(bigLabel(k)+": "+getVal("milestone-"+k)));
  lines.push(bigLabel("receptive-vocab")+": "+getVal("receptive-vocab"));
  lines.push(bigLabel("sample-utterance")+": "+getVal("sample-utterance"));

  // === Speech-Language
  lines.push("\n=== " + bigLabel("speech-section") + " ===");
  lines.push(bigLabel("describe-concern")+": "+getVal("describe-concern"));
  lines.push(bigLabel("first-noticed")+": "+getVal("first-noticed"));
  lines.push(bigLabel("progression")+": "+getVal("progression"));
  lines.push(bigLabel("communication-modes")+": "+getSelectedPills("comm-pills")+(getVal("comm-other")?", "+getVal("comm-other"):""));
  lines.push(bigLabel("interaction")+": "+getVal("interact")+" "+getSelectedPills("interact-pills")+(getVal("other-interaction-txt")?", "+getVal("other-interaction-txt"):""));
  lines.push(bigLabel("previous-services")+": "+(isPillSelected("no-services-pill")?res["no-services"]:getDynamicListValues("services-list",[0,1,2,3,4]).join("; ")));
  lines.push(bigLabel("ifsp-iep-reports")+": "+((document.getElementById("ifsp-yes") && document.getElementById("ifsp-yes").checked)?res["yes"]:res["no"]));
  lines.push(bigLabel("family-history")+": "+((document.getElementById("family-yes")&&document.getElementById("family-yes").checked)?getVal("family-text"):res["no"]));
  lines.push(bigLabel("add-notes")+": "+getVal("additional-notes"));

  lines.push("\n" + (res["addendum"] || "") + " " + new Date().toLocaleDateString(isAr?"ar":"en"));

  let textOut = lines.join("\n");

  // Save as .txt — UTF-8
  let blob = new Blob([textOut], {type: "text/plain;charset=utf-8"});
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = url;
  let childName = getVal("child-name") || '';
  a.download = (res["form-title"] || "Case_History") + (childName ? ("_" + childName) : "") + ".txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// == FORM RENDERER ==
function renderForm() {
  const form = document.getElementById("case-form");
  form.innerHTML = "";
  form.appendChild(buildGeneralSection());
  form.appendChild(buildPrenatalSection());
  form.appendChild(buildMedicalSection());
  form.appendChild(buildDevelopmentSection());
  form.appendChild(buildSpeechSection());
}
window.onload = function () { loadResources(lang); };
