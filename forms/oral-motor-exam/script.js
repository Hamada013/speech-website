document.addEventListener('DOMContentLoaded', function() {
    // Language toggle functionality
    const languageSwitch = document.getElementById('language-switch');
    const langEn = document.getElementById('lang-en');
    const langAr = document.getElementById('lang-ar');
    
    // Load translations
    let currentLanguage = 'en';
    let translations = {};
    
    // Load language file
    function loadLanguage(lang) {
        return fetch(`${lang}.json`)
            .then(response => response.json())
            .then(data => {
                translations[lang] = data;
                return data;
            })
            .catch(error => {
                console.error(`Error loading ${lang} translations:`, error);
                return {};
            });
    }
    
    // Initialize languages
    Promise.all([loadLanguage('en'), loadLanguage('ar')]).then(() => {
        updateUI();
        setupEventListeners();
    });
    
    // Toggle language
    languageSwitch.addEventListener('change', function() {
        currentLanguage = this.checked ? 'ar' : 'en';
        document.documentElement.lang = currentLanguage;
        document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
        updateUI();
    });
    
    // Update all UI elements with translations
    function updateUI() {
        const langData = translations[currentLanguage] || {};
        
        // Update form title
        document.getElementById('form-title').textContent = langData.formTitle || 'Orofacial Examination';
        
        // Update language toggle labels
        langEn.textContent = currentLanguage === 'en' ? 'English' : 'الإنجليزية';
        langAr.textContent = currentLanguage === 'ar' ? 'العربية' : 'Arabic';
        
        // Update all elements with data-key attributes
        document.querySelectorAll('[data-key]').forEach(element => {
            const key = element.getAttribute('data-key');
            if (langData[key]) {
                if (element.tagName === 'INPUT' && element.type !== 'radio' && element.type !== 'checkbox') {
                    element.placeholder = langData[key];
                } else {
                    element.textContent = langData[key];
                }
            }
        });
        
        // Update placeholders for text areas and inputs
        document.querySelectorAll('[data-placeholder-key]').forEach(element => {
            const key = element.getAttribute('data-placeholder-key');
            if (langData[key]) {
                element.placeholder = langData[key];
            }
        });
    }
    
    // Setup all event listeners for dynamic behavior
    function setupEventListeners() {
        // Show/hide "Other" text areas based on selection
        document.addEventListener('change', function(e) {
            if (e.target.name && e.target.value === 'other') {
                const otherGroup = e.target.closest('.form-group').nextElementSibling;
                if (otherGroup && otherGroup.classList.contains('other-group')) {
                    otherGroup.classList.add('visible');
                }
            }
            
            // Show missing teeth field when "teeth missing" is selected
            if (e.target.name === 'teeth' && e.target.value === 'teeth-missing') {
                document.querySelector('.missing-teeth-group').style.display = 'block';
            } else if (e.target.name === 'teeth') {
                document.querySelector('.missing-teeth-group').style.display = 'none';
            }
            
            // Show hygiene other field when "other" is checked
            if (e.target.name === 'hygiene' && e.target.value === 'other' && e.target.checked) {
                document.querySelector('.hygiene-other-group').style.display = 'block';
            } else if (e.target.name === 'hygiene' && e.target.value !== 'other') {
                document.querySelector('.hygiene-other-group').style.display = 'none';
            }
            
            // Show color specify field when abnormal color is selected
            if (e.target.name === 'tongue-color' && e.target.value === 'abnormal') {
                document.querySelector('.color-specify-group').style.display = 'block';
            } else if (e.target.name === 'tongue-color') {
                document.querySelector('.color-specify-group').style.display = 'none';
            }
            
            // Show description fields for various conditions
            const describeFields = {
                'growths': '.growths-describe-group',
                'fistula': '.fistula-describe-group',
                'clefting': '.clefting-describe-group'
            };
            
            for (const name in describeFields) {
                if (e.target.name === name && e.target.value === 'present') {
                    document.querySelector(describeFields[name]).style.display = 'block';
                } else if (e.target.name === name) {
                    document.querySelector(describeFields[name]).style.display = 'none';
                }
            }
        });
        
        // Download form data as text file
        document.getElementById('download-btn').addEventListener('click', function() {
            const formData = gatherFormData();
            const blob = new Blob([formData], { type: 'text/plain;charset=utf-8' });
            const patientName = document.getElementById('patient-name').value || 'unknown';
            const filename = `Orofacial_Exam_${patientName}.txt`;
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
    
    // Gather all form data for download
    function gatherFormData() {
        const langData = translations[currentLanguage] || {};
        let output = [];
        
        // Add header
        output.push(langData.formTitle || 'Orofacial Examination');
        output.push('='.repeat(50));
        output.push('');
        
        // Patient info
        output.push(langData.patientInfo || 'Patient Information');
        output.push('-'.repeat(50));
        addField(output, langData.name, 'patient-name');
        addField(output, langData.age, 'patient-age');
        addField(output, langData.date, 'exam-date');
        addField(output, langData.examiner, 'examiner-name');
        output.push('');
        
        // Face evaluation
        output.push(langData.faceEval || 'Evaluation of Face');
        output.push('-'.repeat(50));
        addRadioField(output, langData.symmetry, 'symmetry');
        addRadioField(output, langData.abnormalMovements, 'abnormal-movements');
        addToggleField(output, langData.mouthBreathing, 'mouth-breathing');
        addOtherField(output, langData.other, 'face');
        output.push('');
        
        // Jaw and Teeth evaluation
        output.push(langData.jawTeethEval || 'Evaluation of Jaw and Teeth');
        output.push('-'.repeat(50));
        output.push(langData.jawInstruction || 'Tell client to open and close mouth.');
        addRadioField(output, langData.rangeOfMotion, 'jaw-range');
        addRadioField(output, langData.symmetry, 'jaw-symmetry');
        addRadioField(output, langData.movement, 'jaw-movement');
        output.push(langData.temporomandibularJoint || 'TMJ Noises:');
        output.push(langData.tmjNote || 'Jaw popping, clicking, or grating sounds can be a sign of Temporomandibular Joint (TMJ) disorders');
        addRadioField(output, '', 'tmj-noises');
        addOtherField(output, langData.other, 'jaw-teeth');
        output.push('');
        
        // Dentition observation
        output.push(langData.dentition || 'Observe Dentition');
        output.push('-'.repeat(50));
        addRadioField(output, langData.teeth, 'teeth');
        const missingTeeth = document.getElementById('missing-teeth');
        if (missingTeeth && missingTeeth.value) {
            output.push(`${langData.specifyMissing || 'Specify which teeth are missing'}: ${missingTeeth.value}`);
        }
        addRadioField(output, langData.arrangement, 'arrangement');
        output.push(langData.hygiene || 'Hygiene:');
        addCheckboxField(output, 'hygiene');
        const hygieneOther = document.querySelector('.hygiene-other-group textarea');
        if (hygieneOther && hygieneOther.value) {
            output.push(`${langData.other || 'Other'}: ${hygieneOther.value}`);
        }
        addOtherField(output, langData.other, 'dentition');
        output.push('');
        
        // Lips evaluation
        output.push(langData.lipsEval || 'Evaluation of Lips');
        output.push('-'.repeat(50));
        output.push(langData.puckerInstruction || 'Tell client to pucker.');
        addRadioField(output, langData.rangeOfMotion, 'lips-range');
        addRadioField(output, langData.symmetry, 'lips-symmetry');
        addRadioField(output, langData.strength, 'lips-strength');
        addOtherField(output, langData.other, 'lips-pucker');
        
        // Smile evaluation
        output.push('');
        output.push('1. ' + (langData.smileEval || 'Tell client to smile.'));
        addRadioField(output, langData.rangeOfMotion, 'smile-range');
        addRadioField(output, langData.symmetry, 'smile-symmetry');
        addOtherField(output, langData.other, 'lips-smile');
        
        // Cheeks evaluation
        output.push('');
        output.push('2. ' + (langData.cheeksEval || 'Tell client to puff cheeks and hold air.'));
        addRadioField(output, langData.lipStrength, 'cheeks-strength');
        addRadioField(output, langData.nasalEmission, 'nasal-emission');
        addOtherField(output, langData.other, 'lips-cheeks');
        output.push('');
        
        // Tongue evaluation
        output.push(langData.tongueEval || 'Evaluation of Tongue');
        output.push('-'.repeat(50));
        
        // General tongue examination
        output.push('1. ' + (langData.tongueGeneral || 'General Tongue Examination'));
        addRadioField(output, langData.surfaceColor, 'tongue-color');
        const colorSpecify = document.getElementById('tongue-color-specify');
        if (colorSpecify && colorSpecify.value) {
            output.push(`${langData.specify || 'Specify'}: ${colorSpecify.value}`);
        }
        addRadioField(output, langData.tongueMovements, 'tongue-movements');
        addRadioField(output, langData.size, 'tongue-size');
        addRadioField(output, langData.frenum, 'tongue-frenum');
        addOtherField(output, langData.other, 'tongue-general');
        
        // Tongue protraction
        output.push('');
        output.push('2. ' + (langData.protrudeInstruction || 'Tell client to protrude the tongue.'));
        addRadioField(output, langData.excursion, 'tongue-excursion');
        addRadioField(output, langData.rangeOfMotion, 'tongue-range');
        addRadioField(output, langData.speed, 'tongue-speed');
        addRadioField(output, langData.strength, 'tongue-strength');
        addOtherField(output, langData.other, 'tongue-protrude');
        
        // Tongue retraction
        output.push('');
        output.push('3. ' + (langData.retractInstruction || 'Tell client to retract the tongue.'));
        addRadioField(output, langData.excursion, 'tongue-retract-excursion');
        addRadioField(output, langData.rangeOfMotion, 'tongue-retract-range');
        addRadioField(output, langData.speed, 'tongue-retract-speed');
        addOtherField(output, langData.other, 'tongue-retract');
        
        // Right movement
        output.push('');
        output.push('4. Tell client to move the tongue tip to the right.');
        addRadioField(output, langData.excursion, 'tongue-right-excursion');
        addRadioField(output, langData.rangeOfMotion, 'tongue-right-range');
        addRadioField(output, langData.strength, 'tongue-right-strength');
        addOtherField(output, langData.other, 'tongue-right');
        
        // Left movement
        output.push('');
        output.push('5. Tell client to move the tongue tip to the left.');
        addRadioField(output, langData.excursion, 'tongue-left-excursion');
        addRadioField(output, langData.rangeOfMotion, 'tongue-left-range');
        addRadioField(output, langData.strength, 'tongue-left-strength');
        addOtherField(output, langData.other, 'tongue-left');
        
        // Up movement
        output.push('');
        output.push('6. Tell client to move the tongue tip up.');
        addRadioField(output, langData.movement, 'tongue-up-movement');
        addRadioField(output, langData.rangeOfMotion, 'tongue-up-range');
        addOtherField(output, langData.other, 'tongue-up');
        
        // Down movement
        output.push('');
        output.push('7. Tell client to move the tongue tip down.');
        addRadioField(output, langData.movement, 'tongue-down-movement');
        addRadioField(output, langData.rangeOfMotion, 'tongue-down-range');
        addOtherField(output, langData.other, 'tongue-down');
        
        // Side-to-side movements
        output.push('');
        output.push('8. ' + (langData.sideToSideInstruction || 'Observe rapid side-to-side movements.'));
        addRadioField(output, langData.rate, 'tongue-rate');
        addRadioField(output, langData.rangeOfMotion, 'tongue-side-range');
        addOtherField(output, langData.other, 'tongue-side');
        output.push('');
        
        // Pharynx evaluation
        output.push(langData.pharynxEval || 'Evaluation of Pharynx');
        output.push('-'.repeat(50));
        addRadioField(output, langData.color, 'pharynx-color');
        addRadioField(output, langData.tonsils, 'tonsils');
        addOtherField(output, langData.other, 'pharynx');
        output.push('');
        
        // Palate evaluation
        output.push(langData.palateEval || 'Evaluation of Hard and Soft Palates');
        output.push('-'.repeat(50));
        addRadioField(output, langData.color, 'palate-color');
        addRadioField(output, langData.rugae, 'rugae');
        addRadioField(output, langData.archHeight, 'arch-height');
        addRadioField(output, langData.archWidth, 'arch-width');
        
        // Growths, fistula, clefting
        addRadioField(output, langData.growths, 'growths');
        const growthsDescribe = document.querySelector('.growths-describe-group textarea');
        if (growthsDescribe && growthsDescribe.value) {
            output.push(`${langData.describe || 'Describe'}: ${growthsDescribe.value}`);
        }
        
        addRadioField(output, langData.fistula, 'fistula');
        const fistulaDescribe = document.querySelector('.fistula-describe-group textarea');
        if (fistulaDescribe && fistulaDescribe.value) {
            output.push(`${langData.describe || 'Describe'}: ${fistulaDescribe.value}`);
        }
        
        addRadioField(output, langData.clefting, 'clefting');
        const cleftingDescribe = document.querySelector('.clefting-describe-group textarea');
        if (cleftingDescribe && cleftingDescribe.value) {
            output.push(`${langData.describe || 'Describe'}: ${cleftingDescribe.value}`);
        }
        
        addRadioField(output, langData.symmetryAtRest, 'palate-symmetry');
        addRadioField(output, langData.gagReflex, 'gag-reflex');
        addOtherField(output, langData.other, 'palate');
        
        // Phonation evaluation
        output.push('');
        output.push(langData.phonateInstruction || 'Tell client to phonate using /ɑ/.');
        addRadioField(output, langData.symmetryOfMovement, 'phonation-symmetry');
        addRadioField(output, langData.posteriorMovement, 'posterior-movement');
        addRadioField(output, langData.lateralMovement, 'lateral-movement');
        addRadioField(output, langData.uvula, 'uvula');
        addRadioField(output, langData.nasality, 'nasality');
        addOtherField(output, langData.other, 'phonation');
        output.push('');
        
        // Summary of findings
        output.push(langData.findingsSummary || 'Summary of Findings');
        output.push('-'.repeat(50));
        const summary = document.getElementById('summary');
        if (summary && summary.value) {
            output.push(summary.value);
        } else {
            output.push(langData.summaryNote || 'No summary provided.');
        }
        
        return output.join('\n');
    }
    
    // Helper function to add a text field to the output
    function addField(output, label, id) {
        const element = document.getElementById(id);
        if (element) {
            output.push(`${label || id}: ${element.value || 'N/A'}`);
        }
    }
    
    // Helper function to add a radio field to the output
    function addRadioField(output, label, name) {
        const selected = document.querySelector(`input[name="${name}"]:checked`);
        if (label) {
            output.push(`${label}: ${selected ? selected.value : 'N/A'}`);
        } else {
            output.push(`${selected ? selected.value : 'N/A'}`);
        }
    }
    
    // Helper function to add a checkbox field to the output
    function addCheckboxField(output, name) {
        const checked = Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
            .map(el => el.value)
            .join(', ');
        output.push(checked || 'N/A');
    }
    
    // Helper function to add a toggle field to the output
    function addToggleField(output, label, id) {
        const toggle = document.getElementById(id);
        output.push(`${label}: ${toggle && toggle.checked ? 'Yes' : 'No'}`);
    }
    
    // Helper function to add other text field to the output
    function addOtherField(output, label, prefix) {
        const otherText = document.querySelector(`.other-group.visible textarea[name="${prefix}-other"]`);
        if (otherText && otherText.value) {
            output.push(`${label || 'Other'}: ${otherText.value}`);
        }
    }
});