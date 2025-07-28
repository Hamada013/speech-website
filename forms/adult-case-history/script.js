document.addEventListener('DOMContentLoaded', function() {
    let currentLang = 'en';
    let translations = {};
    
    // Load translations
    Promise.all([
        fetch('en.json').then(res => res.json()),
        fetch('ar.json').then(res => res.json())
    ]).then(([en, ar]) => {
        translations.en = en;
        translations.ar = ar;
        buildForm();
        setupLanguageToggle();
        setupExportButton();
    }).catch(error => {
        console.error("Error loading language files:", error);
    });

    function buildForm() {
        const formContainer = document.getElementById('form-container');
        formContainer.innerHTML = '';
        
        const formData = translations[currentLang];
        
        // Build each section
        for (const [sectionKey, sectionData] of Object.entries(formData.sections)) {
            const sectionElement = document.createElement('div');
            sectionElement.className = 'form-section';
            
            // Section header
            const sectionHead = document.createElement('div');
            sectionHead.className = 'section-head';
            sectionHead.textContent = sectionData.title;
            sectionElement.appendChild(sectionHead);
            
            const sectionBody = document.createElement('div');
            sectionBody.className = 'section-body';
            
            const formGrid = document.createElement('div');
            formGrid.className = 'form-grid';
            
            // Build fields for this section
            for (const [fieldKey, fieldData] of Object.entries(sectionData.fields)) {
                if (fieldKey === 'physician') {
                    // Physician sub-fields
                    formGrid.appendChild(createPhysicianField(sectionKey, fieldKey, fieldData));
                } 
                else if (fieldKey === 'maritalStatus') {
                    // Marital status checkboxes
                    formGrid.appendChild(createCheckboxField(
                        sectionKey, fieldKey, fieldData.label, fieldData.options
                    ));
                }
                else if (fieldKey === 'children') {
                    // Dynamic children list
                    formGrid.appendChild(createDynamicListField(
                        sectionKey, fieldKey, fieldData.label, fieldData.addButton, true
                    ));
                }
                else if (typeof fieldData === 'object' && fieldData.yesPlaceholder !== undefined) {
                    // Yes/No with conditional field
                    formGrid.appendChild(createYesNoField(
                        sectionKey, fieldKey, fieldData.label, fieldData.yesPlaceholder
                    ));
                }
                else if (fieldKey === 'conditions') {
                    // Medical conditions with "other" option
                    formGrid.appendChild(createCheckboxField(
                        sectionKey, fieldKey, fieldData.label, fieldData.options, 
                        fieldData.otherPlaceholder
                    ));
                }
                else if (fieldKey === 'medications') {
                    // Medications with radio options
                    formGrid.appendChild(createMedicationsField(
                        sectionKey, fieldKey, fieldData
                    ));
                }
                else if (typeof fieldData === 'object' && fieldData.placeholder !== undefined) {
                    // Textarea with placeholder
                    formGrid.appendChild(createTextareaField(
                        sectionKey, fieldKey, fieldData.label, fieldData.placeholder
                    ));
                }
                else {
                    // Regular input field
                    formGrid.appendChild(createInputField(
                        sectionKey, fieldKey, typeof fieldData === 'object' ? fieldData.label : fieldData
                    ));
                }
            }
            
            sectionBody.appendChild(formGrid);
            sectionElement.appendChild(sectionBody);
            formContainer.appendChild(sectionElement);
        }
        
        // Update UI elements
        document.getElementById('form-title').textContent = formData.formTitle;
        document.getElementById('export-btn').textContent = formData.exportButton;
        document.getElementById('lang-en').textContent = formData.language.english;
        document.getElementById('lang-ar').textContent = formData.language.arabic;
        
        // Set RTL if Arabic
        document.body.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    }

    // Field creation helper functions
    function createInputField(sectionKey, fieldKey, labelText, type = 'text') {
        const group = document.createElement('div');
        group.className = 'form-group';
        
        const label = document.createElement('label');
        label.htmlFor = `${sectionKey}-${fieldKey}`;
        label.textContent = labelText;
        group.appendChild(label);
        
        const input = document.createElement('input');
        input.type = type;
        input.id = `${sectionKey}-${fieldKey}`;
        input.name = `${sectionKey}-${fieldKey}`;
        group.appendChild(input);
        
        return group;
    }

    function createTextareaField(sectionKey, fieldKey, labelText, placeholder) {
        const group = document.createElement('div');
        group.className = 'form-group';
        
        const label = document.createElement('label');
        label.htmlFor = `${sectionKey}-${fieldKey}`;
        label.textContent = labelText;
        group.appendChild(label);
        
        const textarea = document.createElement('textarea');
        textarea.id = `${sectionKey}-${fieldKey}`;
        textarea.name = `${sectionKey}-${fieldKey}`;
        textarea.rows = 4;
        textarea.placeholder = placeholder;
        group.appendChild(textarea);
        
        return group;
    }

    function createCheckboxField(sectionKey, fieldKey, labelText, options, otherPlaceholder = null) {
        const group = document.createElement('div');
        group.className = 'form-group';
        
        const label = document.createElement('label');
        label.textContent = labelText;
        group.appendChild(label);
        
        const checkboxContainer = document.createElement('div');
        checkboxContainer.className = 'checkbox-group';
        
        options.forEach(option => {
            const checkboxDiv = document.createElement('div');
            checkboxDiv.className = 'checkbox-option';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `${sectionKey}-${fieldKey}-${option.toLowerCase().replace(/\s+/g, '-')}`;
            checkbox.name = `${sectionKey}-${fieldKey}`;
            checkbox.value = option;
            
            if (option === 'Other' || option === 'أخرى') {
                checkbox.addEventListener('change', function() {
                    const otherField = document.getElementById(`${sectionKey}-${fieldKey}-other-text`);
                    if (this.checked) {
                        otherField.parentElement.classList.add('visible');
                    } else {
                        otherField.parentElement.classList.remove('visible');
                        otherField.value = '';
                    }
                });
            }
            
            const checkboxLabel = document.createElement('label');
            checkboxLabel.htmlFor = checkbox.id;
            checkboxLabel.textContent = option;
            
            checkboxDiv.appendChild(checkbox);
            checkboxDiv.appendChild(checkboxLabel);
            checkboxContainer.appendChild(checkboxDiv);
        });
        
        if (otherPlaceholder) {
            const otherFieldGroup = document.createElement('div');
            otherFieldGroup.className = 'conditional-field';
            otherFieldGroup.id = `${sectionKey}-${fieldKey}-other-group`;
            
            const otherInput = document.createElement('input');
            otherInput.type = 'text';
            otherInput.id = `${sectionKey}-${fieldKey}-other-text`;
            otherInput.placeholder = otherPlaceholder;
            otherFieldGroup.appendChild(otherInput);
            
            checkboxContainer.appendChild(otherFieldGroup);
        }
        
        group.appendChild(checkboxContainer);
        return group;
    }

    function createYesNoField(sectionKey, fieldKey, labelText, yesPlaceholder) {
        const group = document.createElement('div');
        group.className = 'form-group';
        
        const label = document.createElement('label');
        label.textContent = labelText;
        group.appendChild(label);
        
        const yesNoGroup = document.createElement('div');
        yesNoGroup.className = 'yes-no-group';
        
        // Yes button
        const yesDiv = document.createElement('div');
        yesDiv.className = 'yes-no-btn';
        
        const yesInput = document.createElement('input');
        yesInput.type = 'radio';
        yesInput.id = `${sectionKey}-${fieldKey}-yes`;
        yesInput.name = `${sectionKey}-${fieldKey}`;
        yesInput.value = 'yes';
        
        const yesLabel = document.createElement('label');
        yesLabel.htmlFor = yesInput.id;
        yesLabel.textContent = currentLang === 'en' ? 'Yes' : 'نعم';
        
        yesDiv.appendChild(yesInput);
        yesDiv.appendChild(yesLabel);
        yesNoGroup.appendChild(yesDiv);
        
        // No button
        const noDiv = document.createElement('div');
        noDiv.className = 'yes-no-btn';
        
        const noInput = document.createElement('input');
        noInput.type = 'radio';
        noInput.id = `${sectionKey}-${fieldKey}-no`;
        noInput.name = `${sectionKey}-${fieldKey}`;
        noInput.value = 'no';
        noInput.checked = true;
        
        const noLabel = document.createElement('label');
        noLabel.htmlFor = noInput.id;
        noLabel.textContent = currentLang === 'en' ? 'No' : 'لا';
        
        noDiv.appendChild(noInput);
        noDiv.appendChild(noLabel);
        yesNoGroup.appendChild(noDiv);
        
        group.appendChild(yesNoGroup);
        
        // Conditional textarea
        const conditionalField = document.createElement('div');
        conditionalField.className = 'conditional-field';
        conditionalField.id = `${sectionKey}-${fieldKey}-conditional`;
        
        const textarea = document.createElement('textarea');
        textarea.rows = 3;
        textarea.placeholder = yesPlaceholder;
        conditionalField.appendChild(textarea);
        
        group.appendChild(conditionalField);
        
        // Toggle visibility based on selection
        yesInput.addEventListener('change', function() {
            if (this.checked) {
                conditionalField.classList.add('visible');
            }
        });
        
        noInput.addEventListener('change', function() {
            if (this.checked) {
                conditionalField.classList.remove('visible');
                textarea.value = '';
            }
        });
        
        return group;
    }

    function createDynamicListField(sectionKey, fieldKey, labelText, addButtonText, withGenderAge = false) {
        const group = document.createElement('div');
        group.className = 'form-group';
        
        const label = document.createElement('label');
        label.textContent = labelText;
        group.appendChild(label);
        
        const listContainer = document.createElement('div');
        listContainer.className = 'dynamic-list';
        listContainer.id = `${sectionKey}-${fieldKey}-list`;
        
        // Add initial item
        addDynamicListItem(sectionKey, fieldKey, listContainer, withGenderAge);
        
        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.className = 'add-item-btn';
        addButton.innerHTML = `<span>${addButtonText}</span>`;
        addButton.addEventListener('click', () => {
            addDynamicListItem(sectionKey, fieldKey, listContainer, withGenderAge);
        });
        
        group.appendChild(listContainer);
        group.appendChild(addButton);
        return group;
    }

    function addDynamicListItem(sectionKey, fieldKey, container, withGenderAge = false) {
        const item = document.createElement('div');
        item.className = 'dynamic-item';
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = currentLang === 'en' ? 'Name' : 'الاسم';
        
        if (withGenderAge) {
            const genderInput = document.createElement('input');
            genderInput.type = 'text';
            genderInput.placeholder = currentLang === 'en' ? 'Gender' : 'الجنس';
            genderInput.style.flex = '0.5';
            
            const ageInput = document.createElement('input');
            ageInput.type = 'text';
            ageInput.placeholder = currentLang === 'en' ? 'Age' : 'العمر';
            ageInput.style.flex = '0.5';
            
            item.appendChild(nameInput);
            item.appendChild(genderInput);
            item.appendChild(ageInput);
        } else {
            nameInput.style.flex = '1';
            item.appendChild(nameInput);
        }
        
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'btn-icon';
        removeBtn.innerHTML = '&times;';
        removeBtn.addEventListener('click', () => {
            item.remove();
        });
        
        item.appendChild(removeBtn);
        container.appendChild(item);
    }

    function createPhysicianField(sectionKey, fieldKey, fieldData) {
        const group = document.createElement('div');
        group.className = 'form-group';
        
        const label = document.createElement('label');
        label.textContent = 'Physician';
        group.appendChild(label);
        
        for (const [subFieldKey, subFieldLabel] of Object.entries(fieldData)) {
            const subGroup = document.createElement('div');
            subGroup.className = 'form-group';
            subGroup.style.marginLeft = '20px';
            
            const subLabel = document.createElement('label');
            subLabel.htmlFor = `${sectionKey}-${fieldKey}-${subFieldKey}`;
            subLabel.textContent = subFieldLabel;
            subGroup.appendChild(subLabel);
            
            const input = document.createElement('input');
            input.type = subFieldKey === 'phone' ? 'tel' : 'text';
            input.id = `${sectionKey}-${fieldKey}-${subFieldKey}`;
            input.name = `${sectionKey}-${fieldKey}-${subFieldKey}`;
            subGroup.appendChild(input);
            
            group.appendChild(subGroup);
        }
        
        return group;
    }

    function createMedicationsField(sectionKey, fieldKey, fieldData) {
        const group = document.createElement('div');
        group.className = 'form-group';
        
        // Main label
        const label = document.createElement('label');
        label.textContent = fieldData.label;
        group.appendChild(label);
        
        // Radio options
        const radioContainer = document.createElement('div');
        radioContainer.className = 'radio-group';
        
        fieldData.options.forEach((option, index) => {
            const radioDiv = document.createElement('div');
            radioDiv.className = 'radio-option';
            
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.id = `${sectionKey}-${fieldKey}-${index}`;
            radio.name = `${sectionKey}-${fieldKey}`;
            radio.value = option;
            
            if (index === 0) radio.checked = true;
            
            radio.addEventListener('change', function() {
                const medsField = document.getElementById(`${sectionKey}-${fieldKey}-list`);
                if (this.value === fieldData.options[0]) {
                    medsField.style.display = 'block';
                } else {
                    medsField.style.display = 'none';
                    medsField.querySelector('input').value = '';
                }
            });
            
            const radioLabel = document.createElement('label');
            radioLabel.htmlFor = radio.id;
            radioLabel.textContent = option;
            
            radioDiv.appendChild(radio);
            radioDiv.appendChild(radioLabel);
            radioContainer.appendChild(radioDiv);
        });
        
        group.appendChild(radioContainer);
        
        // Medications input field
        const medsInputGroup = document.createElement('div');
        medsInputGroup.className = 'form-group';
        medsInputGroup.id = `${sectionKey}-${fieldKey}-list`;
        
        const medsInput = document.createElement('input');
        medsInput.type = 'text';
        medsInput.placeholder = fieldData.placeholder;
        medsInputGroup.appendChild(medsInput);
        
        group.appendChild(medsInputGroup);
        
        // Reactions field
        const reactionsGroup = document.createElement('div');
        reactionsGroup.className = 'form-group';
        
        const reactionsLabel = document.createElement('label');
        reactionsLabel.textContent = fieldData.reactions.label;
        reactionsGroup.appendChild(reactionsLabel);
        
        const reactionsYesNoGroup = document.createElement('div');
        reactionsYesNoGroup.className = 'yes-no-group';
        
        // Yes button
        const reactionsYesDiv = document.createElement('div');
        reactionsYesDiv.className = 'yes-no-btn';
        
        const reactionsYesInput = document.createElement('input');
        reactionsYesInput.type = 'radio';
        reactionsYesInput.id = `${sectionKey}-${fieldKey}-reactions-yes`;
        reactionsYesInput.name = `${sectionKey}-${fieldKey}-reactions`;
        reactionsYesInput.value = 'yes';
        
        const reactionsYesLabel = document.createElement('label');
        reactionsYesLabel.htmlFor = reactionsYesInput.id;
        reactionsYesLabel.textContent = currentLang === 'en' ? 'Yes' : 'نعم';
        
        reactionsYesDiv.appendChild(reactionsYesInput);
        reactionsYesDiv.appendChild(reactionsYesLabel);
        reactionsYesNoGroup.appendChild(reactionsYesDiv);
        
        // No button
        const reactionsNoDiv = document.createElement('div');
        reactionsNoDiv.className = 'yes-no-btn';
        
        const reactionsNoInput = document.createElement('input');
        reactionsNoInput.type = 'radio';
        reactionsNoInput.id = `${sectionKey}-${fieldKey}-reactions-no`;
        reactionsNoInput.name = `${sectionKey}-${fieldKey}-reactions`;
        reactionsNoInput.value = 'no';
        reactionsNoInput.checked = true;
        
        const reactionsNoLabel = document.createElement('label');
        reactionsNoLabel.htmlFor = reactionsNoInput.id;
        reactionsNoLabel.textContent = currentLang === 'en' ? 'No' : 'لا';
        
        reactionsNoDiv.appendChild(reactionsNoInput);
        reactionsNoDiv.appendChild(reactionsNoLabel);
        reactionsYesNoGroup.appendChild(reactionsNoDiv);
        
        reactionsGroup.appendChild(reactionsYesNoGroup);
        
        // Conditional textarea
        const reactionsConditional = document.createElement('div');
        reactionsConditional.className = 'conditional-field';
        reactionsConditional.id = `${sectionKey}-${fieldKey}-reactions-conditional`;
        
        const reactionsTextarea = document.createElement('textarea');
        reactionsTextarea.rows = 3;
        reactionsTextarea.placeholder = fieldData.reactions.yesPlaceholder;
        reactionsConditional.appendChild(reactionsTextarea);
        
        reactionsGroup.appendChild(reactionsConditional);
        
        // Toggle visibility based on selection
        reactionsYesInput.addEventListener('change', function() {
            if (this.checked) {
                reactionsConditional.classList.add('visible');
            }
        });
        
        reactionsNoInput.addEventListener('change', function() {
            if (this.checked) {
                reactionsConditional.classList.remove('visible');
                reactionsTextarea.value = '';
            }
        });
        
        group.appendChild(reactionsGroup);
        return group;
    }

    function setupLanguageToggle() {
        const languageSwitch = document.getElementById('language-switch');
        const langEn = document.getElementById('lang-en');
        const langAr = document.getElementById('lang-ar');
        
        languageSwitch.addEventListener('change', function() {
            currentLang = this.checked ? 'ar' : 'en';
            buildForm();
            
            if (currentLang === 'ar') {
                langEn.classList.remove('active');
                langAr.classList.add('active');
            } else {
                langAr.classList.remove('active');
                langEn.classList.add('active');
            }
        });
    }

    function setupExportButton() {
        document.getElementById('export-btn').addEventListener('click', exportToText);
    }

    function exportToText() {
        const formData = translations[currentLang];
        let outputText = `${formData.formTitle}\n\n`;
        
        // Get patient name for filename
        const patientName = document.getElementById('generalInfo-name').value || 'case';
        
        // Helper functions
        const getValue = (id) => document.getElementById(id)?.value || '-';
        const getTextareaValue = (selector) => document.querySelector(selector)?.value || '-';
        const getCheckedValues = (name) => {
            const checked = Array.from(document.querySelectorAll(`input[name="${name}"]:checked`));
            return checked.length > 0 ? checked.map(el => el.value).join(', ') : '-';
        };
        
        // Process each section
        for (const [sectionKey, sectionData] of Object.entries(formData.sections)) {
            outputText += `=== ${sectionData.title} ===\n`;
            
            for (const [fieldKey, fieldData] of Object.entries(sectionData.fields)) {
                const label = typeof fieldData === 'object' ? fieldData.label || fieldData : fieldData;
                
                if (fieldKey === 'physician') {
                    outputText += `Physician:\n`;
                    for (const [subFieldKey, subFieldLabel] of Object.entries(fieldData)) {
                        const value = getValue(`${sectionKey}-${fieldKey}-${subFieldKey}`);
                        outputText += `  ${subFieldLabel}: ${value}\n`;
                    }
                }
                else if (fieldKey === 'maritalStatus') {
                    outputText += `${label}: ${getCheckedValues(`${sectionKey}-${fieldKey}`)}\n`;
                }
                else if (fieldKey === 'children') {
                    const children = Array.from(document.querySelectorAll(`#${sectionKey}-${fieldKey}-list .dynamic-item`));
                    if (children.length > 0) {
                        outputText += `${label}:\n`;
                        children.forEach((child, i) => {
                            const inputs = child.querySelectorAll('input');
                            const name = inputs[0].value || '?';
                            const gender = inputs[1]?.value || '?';
                            const age = inputs[2]?.value || '?';
                            outputText += `  ${i+1}. ${name} (${gender}/${age})\n`;
                        });
                    } else {
                        outputText += `${label}: -\n`;
                    }
                }
                else if (typeof fieldData === 'object' && fieldData.yesPlaceholder !== undefined) {
                    const yesSelected = document.getElementById(`${sectionKey}-${fieldKey}-yes`)?.checked || false;
                    outputText += `${label}: ${yesSelected ? (currentLang === 'en' ? 'Yes' : 'نعم') : (currentLang === 'en' ? 'No' : 'لا')}\n`;
                    if (yesSelected) {
                        const details = getTextareaValue(`#${sectionKey}-${fieldKey}-conditional textarea`);
                        outputText += `  Details: ${details}\n`;
                    }
                }
                else if (fieldKey === 'conditions') {
                    const selected = getCheckedValues(`${sectionKey}-${fieldKey}`);
                    outputText += `${label}: ${selected}\n`;
                    if (selected.includes('Other') || selected.includes('أخرى')) {
                        const otherDetails = getValue(`${sectionKey}-${fieldKey}-other-text`);
                        outputText += `  Other details: ${otherDetails}\n`;
                    }
                }
                else if (fieldKey === 'medications') {
                    const selectedOption = document.querySelector(`input[name="${sectionKey}-${fieldKey}"]:checked`)?.value || '-';
                    outputText += `${label}: ${selectedOption}\n`;
                    
                    if (selectedOption === fieldData.options[0]) {
                        const meds = document.querySelector(`#${sectionKey}-${fieldKey}-list input`)?.value || '-';
                        outputText += `  Medications: ${meds}\n`;
                        
                        const reactionsYes = document.getElementById(`${sectionKey}-${fieldKey}-reactions-yes`)?.checked || false;
                        outputText += `  ${fieldData.reactions.label}: ${reactionsYes ? (currentLang === 'en' ? 'Yes' : 'نعم') : (currentLang === 'en' ? 'No' : 'لا')}\n`;
                        
                        if (reactionsYes) {
                            const details = getTextareaValue(`#${sectionKey}-${fieldKey}-reactions-conditional textarea`);
                            outputText += `    Reaction details: ${details}\n`;
                        }
                    }
                }
                else if (typeof fieldData === 'object' && fieldData.placeholder !== undefined) {
                    outputText += `${label}: ${getValue(`${sectionKey}-${fieldKey}`)}\n`;
                }
                else {
                    outputText += `${label}: ${getValue(`${sectionKey}-${fieldKey}`)}\n`;
                }
            }
            outputText += '\n';
        }
        
        // Create and download the file
        const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${patientName}_${formData.formTitle.replace(/ /g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
});