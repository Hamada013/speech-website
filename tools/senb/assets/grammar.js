// SENB slot grammar and asset-path rules. Keep these mappings independent of the UI.
function getAdvancedImageFolder(folder, subCatId) {
    return ADV_IMAGE_FOLDER_MAP[folder]?.[Number(subCatId) - 1] || `6/${subCatId}`;
}

// File formats/folder spelling are independent of vocabulary and card IDs.
function getBasicImagePath(item) {
    if (item.customImgPath) return item.customImgPath.replace(/^(images\/.*)\.png$/i, '$1.webp');
    const folder = CATEGORIES.find(category => category.id === item.categoryId)?.path || 'images/01 subject/';
    return `${folder.replace('07 Pronoun/', '07 pronouns/')}${item.id}.webp`;
}


function getSlotColorConfig(index, totalSlots) {
    let colorHex = '#eab308';
    if (index === 0) colorHex = '#eab308';
    else if (index === 1) colorHex = '#f97316';
    else if (index === 2) colorHex = '#22c55e';
    else if (index === 3) colorHex = '#3b82f6';
    else if (index === 4) {
        colorHex = (totalSlots === 6) ? '#6b7280' : '#8b4513';
    } else if (index === 5) {
        colorHex = '#8b4513';
    }
    return colorHex;
}

// Helper Function: Looks backward in the specific row to find the noun's gender
function getContextGenderForSlot(rowNumber, slotIndex) {
    const slotsData = rowNumber === 1 ? state.row1Slots : state.row2Slots;

    // Scan slots from the current position backwards to index 0
    for (let i = slotIndex - 1; i >= 0; i--) {
        const s = slotsData[i];
        if (s) {
            // Check if this preceding item is a noun (Subject, Object, Place)
            if (['01 subject', '03 object', '04 place'].includes(s.categoryId)) {
                // Return its specific gender, fallback to genderCode, or default to male
                return s.gender || s.genderCode || 'male'; 
            }
        }
    }
    // If no noun found before this adjective/color, default to male
    return 'male'; 
}

// Find the nearest earlier noun or personal pronoun in this row, skipping gaps
// and modifiers. A preset's explicit conjugation is a fallback without context.
function getContextVerbSubject(item, rowNumber, slotIndex) {
    const codes = ['i', 'he', 'she', 'they', 'we', 'youfemale', 'youmale', 'youplural'];
    const slots = rowNumber === 1 ? state.row1Slots : state.row2Slots;
    for (let i = slotIndex - 1; i >= 0; i--) {
        const slot = slots[i];
        if (!slot) continue;
        if (slot.categoryId === '07 Pronoun' && codes.includes(slot.code)) return slot.code;
        if (['01 subject', '03 object', '04 place'].includes(slot.categoryId)) {
            if (codes.includes(slot.genderCode)) return slot.genderCode;
            if (slot.gender === 'female' || slot.gender === 'she') return 'she';
            if (slot.gender === 'male' || slot.gender === 'he') return 'he';
        }
    }
    return codes.includes(item.conjugation) ? item.conjugation : 'i';
}

function getDisplayedItemTitle(item, rowNumber, slotIndex) {
    if (!item) return '';

    // Bypass mapping if it's explicitly from the Advanced Sentence presets 
    if (item.isAdvancedOverride) return item.title;

    if (item.categoryId === '02 verbs') {
        const tense = item.verbTense || 'present';
        const subjectCode = getContextVerbSubject(item, rowNumber, slotIndex);

        if (VERB_CONJUGATIONS[item.id] && VERB_CONJUGATIONS[item.id][tense] && VERB_CONJUGATIONS[item.id][tense][subjectCode]) {
            return VERB_CONJUGATIONS[item.id][tense][subjectCode];
        }
    }

    // Apply grammatical mapping specifically for Adjectives and Colors
    if (item.categoryId === '05 adjectives' || item.categoryId === '10 colors') {
        const genderContext = getContextGenderForSlot(rowNumber, slotIndex);
        if (genderContext === 'female' && item.titleFemale) {
            return item.titleFemale;
        } else if (item.titleMale) {
            return item.titleMale;
        }
    }

    return item.title || item.titleMale || '';
}


function resolveAudioPath(item, rowNumber, slotIndex) {
    const categoryId = item.categoryId;

    if (categoryId === '02 verbs') {
        const tense = item.verbTense || 'present';
        const subjectCode = getContextVerbSubject(item, rowNumber, slotIndex);
        return `sounds/verbs/${tense}/${subjectCode}/${item.id}.m4a`;
    }

    if (categoryId === '07 Pronoun') {
        const mod = item.pronounModifier || 'standard';
        if (mod === 'possessive_female') return `sounds/for possessive female noun/${item.id}.m4a`;
        if (mod === 'possessive_male') return `sounds/for possessive male noun/${item.id}.m4a`;
        if (mod === 'possessive_verb') return `sounds/for possessive verbs/${item.id}.m4a`;
        return `sounds/pronoun/${item.id}.m4a`;
    }

    // Resolve Audio mapping for Adjectives using backward scan
    if (categoryId === '05 adjectives') {
        const folder = getContextGenderForSlot(rowNumber, slotIndex);
        return `sounds/adjectives/${folder}/${item.id}.m4a`;
    }

    // Resolve Audio mapping for Colors using backward scan
    if (categoryId === '10 colors') {
        const folder = getContextGenderForSlot(rowNumber, slotIndex);
        return `sounds/colors/${folder}/${item.id}.m4a`;
    }

    const folders = {
        '01 subject': 'sounds/subject/',
        '03 object': 'sounds/object/',
        '04 place': 'sounds/place/',
        '06 time': 'sounds/time/',
        '08 linking': 'sounds/linking/',
        '09 Prepositions': 'sounds/prepositions/',
        '11 numbers': 'sounds/numbers/',
        '12 questions': 'sounds/questions/'
    };

    return `${folders[categoryId] || 'sounds/subject/'}${item.id}.m4a`;
}


// Future slot speech is composed from "want" (15) and the present-tense verb.
// Both clips use the same subject context as the displayed conjugation.
function getSlotAudioSegments(item, rowNumber, slotIndex) {
    if (item.categoryId !== '02 verbs' || item.verbTense !== 'future') {
        return [{
            path: resolveAudioPath(item, rowNumber, slotIndex),
            text: getDisplayedItemTitle(item, rowNumber, slotIndex)
        }];
    }

    const presentItem = { ...item, verbTense: 'present', isAdvancedOverride: false };
    const futureTitle = getDisplayedItemTitle({ ...item, isAdvancedOverride: false }, rowNumber, slotIndex);
    return [
        {
            path: resolveAudioPath({ ...presentItem, id: 15 }, rowNumber, slotIndex),
            text: futureTitle.split(/\s+/)[0]
        },
        {
            path: resolveAudioPath(presentItem, rowNumber, slotIndex),
            text: getDisplayedItemTitle(presentItem, rowNumber, slotIndex)
        }
    ];
}

function getAdvancedItemData(folder, subCatId, itemNum) {
    const folderStr = String(folder);
    const subCatStr = String(subCatId);
    const itemNumNum = Number(itemNum);

    const imgFolder = getAdvancedImageFolder(folderStr, subCatStr);

    const imgPath = `images/advanced/${imgFolder}/${itemNumNum}.webp`;
    const soundPath = `sounds/advanced/${folderStr}/${subCatStr}/${itemNumNum}.m4a`;

    // --- LOOKUP WITH itemNum ---
    // Now it looks up: Folder -> Subgroup -> Specific Item Number (1 to 24)
    const sentenceEntry = ADVANCED_REFERENCE_DB?.[folderStr]?.[subCatStr]?.[itemNumNum];

    if (sentenceEntry) {
        return {
            folder: folderStr,
            subCatId: subCatStr,
            itemNum: itemNumNum,
            imgPath,
            soundPath,
            title: sentenceEntry.title,
            slots: sentenceEntry.slots
        };
    }

    // Fallback if that specific item number isn't written yet
    return {
        folder: folderStr,
        subCatId: subCatStr,
        itemNum: itemNumNum,
        imgPath,
        soundPath,
        title: `جملة غير مضافة بعد (مجموعة ${folderStr} - فرع ${subCatStr} - عنصر ${itemNumNum})`,
        slots: []
    };
}
