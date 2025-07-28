const normativeData = {
  "الـ (definiteness marker)": {mean: 2, std: 1},
  "ـة (feminine suffix)": {mean: 3, std: 1},
  "ـين (dual suffix)": {mean: 4, std: 1},
  "ـات (feminine sound plural)": {mean: 5, std: 1},
  "ـين (masculine sound plural)": {mean: 5, std: 1},
  "جمع تكسير (Broken plurals)": {mean: 6, std: 1},
  "أنا، إنتَ، هوّ (independent pronouns)": {mean: 2, std: 1},
  "ـي، ـه، ـنا (bound pronouns)": {mean: 3, std: 1},
  "أكلت، أكلنا، أكلوا (past tense suffixes)": {mean: 3, std: 1},
  "بكتب، بتكتبي، بكتبوا (present tense)": {mean: 3, std: 1},
  "رح + verb (future marker)": {mean: 4, std: 1},
  "لعبتِ، لعبوا (verb agreement markers)": {mean: 4, std: 1},
  "كتب، شرب (Pattern I - فعل)": {mean: 2, std: 1},
  "درّس، سمّع (Pattern II - فعّل)": {mean: 3, std: 1},
  "تذكّر، تعلّم (Pattern V - تفعّل)": {mean: 3, std: 1},
  "اشتغل، اجتمع (Pattern VIII - افتعل)": {mean: 4, std: 1},
  "كتب، مكتوب، كتّب (root abstraction)": {mean: 5, std: 1},
  "كاتب، ساكن (agentive noun - فاعل)": {mean: 5, std: 1},
  "مفتاح، مكنسة (instrumental - مِفْعَل)": {mean: 6, std: 1},
  "مكتب، ملعب (locative - مَفْعَل)": {mean: 6, std: 1},
  "كتيّب، وليد (diminutive - فُعَيِّل)": {mean: 6, std: 1},
  "ما، مو (negation forms)": {mean: 2, std: 1},
  "لَعبت؟، راح؟ (yes/no questions)": {mean: 3, std: 1},
  "شو؟ وين؟ ليش؟ (wh-questions)": {mean: 3, std: 1}
};

const exampleByFeature = {
  "الـ (definiteness marker)": 'قرأتُ <span class="highlight-blue">الكتاب</span> أمس.',
  "ـة (feminine suffix)": 'ذهبتْ <span class="highlight-blue">الطفلة</span> إلى المدرسة.',
  "ـين (dual suffix)": 'رأيتُ <span class="highlight-blue">الكتابين</span> على الطاولة.',
  "ـات (feminine sound plural)": 'حضرتُ إلى <span class="highlight-blue">المدارس</span> مبكرًا.',
  "ـين (masculine sound plural)": 'لعبَ <span class="highlight-blue">المهندسين</span> في الملعب.',
  "جمع تكسير (Broken plurals)": '<span class="highlight-blue">الرجال</span> يعملون في المصنع.',
  "أنا، إنتَ، هوّ (independent pronouns)": 'أنا سعيدٌ اليوم.',
  "ـي، ـه، ـنا (bound pronouns)": 'قرأتُ كتاب<span class="highlight-blue">ي</span> أمس.',
  "أكلت، أكلنا، أكلوا (past tense suffixes)": 'أكلنا الطعام معًا.',
  "بكتب، بتكتبي، بكتبوا (present tense)": 'هي <span class="highlight-blue">تكتب</span> الدرس بجد.',
  "رح + verb (future marker)": 'رح أزور صديقي غدًا.',
  "لعبتِ، لعبوا (verb agreement markers)": 'لعبتِ في الحديقة.',
  "كتب، شرب (Pattern I - فعل)": 'هو <span class="highlight-blue">كتب</span> رسالةً طويلة.',
  "درّس، سمّع (Pattern II - فعّل)": 'المعلم <span class="highlight-blue">درّس</span> الدرس بوضوح.',
  "تذكّر، تعلّم (Pattern V - تفعّل)": 'هي <span class="highlight-blue">تعلّمت</span> لغة جديدة.',
  "اشتغل، اجتمع (Pattern VIII - افتعل)": 'هم <span class="highlight-blue">اجتمعوا</span> في الاجتماع.',
  "كتب، مكتوب، كتّب (root abstraction)": 'الرسالة <span class="highlight-blue">مكتوبة</span> بخط جميل.',
  "كاتب، ساكن (agentive noun - فاعل)": 'هو <span class="highlight-blue">كاتب</span> مشهور.',
  "مفتاح، مكنسة (instrumental - مِفْعَل)": 'أمسكتُ بـ<span class="highlight-blue">المفتاح</span> بسرعة.',
  "مكتب، ملعب (locative - مَفْعَل)": 'ذهبتُ إلى <span class="highlight-blue">المكتب</span> البارحة.',
  "كتيّب، وليد (diminutive - فُعَيِّل)": 'اشتريتُ <span class="highlight-blue">كتيّبًا</span> جديدًا.',
  "ما، مو (negation forms)": 'ما ذهبتُ إلى السوق.',
  "لَعبت؟، راح؟ (yes/no questions)": 'هل لعبتَ؟',
  "شو؟ وين؟ ليش؟ (wh-questions)": 'ماذا تريد؟'
};

async function loadArabicStrings() {
  try {
    const resp = await fetch('ar.json');
    if (!resp.ok) throw new Error('تعذر تحميل الترجمات');
    return await resp.json();
  } catch (e) {
    console.error(e);
    return {};
  }
}

function calculateAgeYears(birthDateStr, assessmentDateStr) {
  if (!birthDateStr || !assessmentDateStr) return null;
  const birth = new Date(birthDateStr);
  const assess = new Date(assessmentDateStr);
  if (isNaN(birth) || isNaN(assess)) return null;
  let age = assess.getFullYear() - birth.getFullYear();
  const m = assess.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && assess.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : null;
}

function setupAgeCalculator() {
  const dob = document.getElementById('dateOfBirth');
  const assess = document.getElementById('assessmentDate');
  const ageInput = document.getElementById('ageyears');

  function update() {
    const age = calculateAgeYears(dob.value, assess.value);
    ageInput.value = age !== null ? age : '';
  }

  dob.addEventListener('change', update);
  assess.addEventListener('change', update);
}

function createFeatureCard(featureKey) {
  const card = document.createElement('div');
  card.className = 'feature-card';

  const arNameEl = document.createElement('div');
  arNameEl.className = 'feature-name-ar';
  const arName = featureKey.split('(')[0].trim();
  arNameEl.textContent = arName;
  card.appendChild(arNameEl);

  const enNameEl = document.createElement('div');
  enNameEl.className = 'feature-name-en';
  const enName = featureKey.match(/\((.+)\)/);
  enNameEl.textContent = enName ? enName[1].trim() : '';
  card.appendChild(enNameEl);

  const normData = normativeData[featureKey];
  const normAge = normData ? `${normData.mean} ± ${normData.std}` : '-';
  const normEl = document.createElement('div');
  normEl.className = 'feature-norm-age';
  normEl.textContent = normAge;
  card.appendChild(normEl);

  const exampleHTML = exampleByFeature[featureKey] || '';
  const exampleEl = document.createElement('div');
  exampleEl.className = 'feature-example';
  exampleEl.innerHTML = exampleHTML;
  card.appendChild(exampleEl);

  const presenceRow = document.createElement('div');
  presenceRow.className = 'presence-row';

  const yesBtn = document.createElement('button');
  yesBtn.type = 'button';
  yesBtn.className = 'presence-btn yes';
  yesBtn.textContent = 'نعم';

  const noBtn = document.createElement('button');
  noBtn.type = 'button';
  noBtn.className = 'presence-btn no';
  noBtn.textContent = 'لا';

  const presenceInput = document.createElement('input');
  presenceInput.type = 'hidden';
  presenceInput.name = `presence-${featureKey}`;
  presenceInput.value = '';

  function selectPresence(choice) {
    if (choice === 'yes') {
      presenceInput.value = 'yes';
      yesBtn.classList.add('selected');
      noBtn.classList.remove('selected');
    } else if (choice === 'no') {
      presenceInput.value = 'no';
      noBtn.classList.add('selected');
      yesBtn.classList.remove('selected');
    } else {
      presenceInput.value = '';
      yesBtn.classList.remove('selected');
      noBtn.classList.remove('selected');
    }
  }

  yesBtn.addEventListener('click', () => selectPresence('yes'));
  noBtn.addEventListener('click', () => selectPresence('no'));

  presenceRow.appendChild(yesBtn);
  presenceRow.appendChild(noBtn);
  presenceRow.appendChild(presenceInput);
  card.appendChild(presenceRow);

  return card;
}

function renderFeaturesCards() {
  const featuresSection = document.getElementById('features-list');
  featuresSection.innerHTML = '';
  Object.keys(normativeData).forEach(key => {
    const card = createFeatureCard(key);
    featuresSection.appendChild(card);
  });
}

function setupRedFlagsToggle() {
  const chk = document.getElementById('hasRedFlags');
  const details = document.getElementById('redFlags-details-container');
  chk.addEventListener('change', () => {
    details.style.display = chk.checked ? 'block' : 'none';
  });
  details.style.display = chk.checked ? 'block' : 'none';
}

function getFormData() {
  const childInfo = {
    fullName: document.getElementById('fullName').value.trim(),
    dateOfBirth: document.getElementById('dateOfBirth').value,
    ageyears: document.getElementById('ageyears').value ? Number(document.getElementById('ageyears').value) : null,
  };
  const examInfo = {
    assessmentDate: document.getElementById('assessmentDate').value,
    examinerName: document.getElementById('examinerName').value.trim(),
  };
  const features = Object.keys(normativeData).map(featureKey => {
    const presenceInput = document.querySelector(`input[name="presence-${featureKey}"]`);
    let presence = presenceInput ? presenceInput.value : null;
    return {
      featureName: featureKey,
      acquisitionAgeNorm: normativeData[featureKey].mean,
      acquisitionAgeStd: normativeData[featureKey].std,
      presence,
      example: exampleByFeature[featureKey] ? exampleByFeature[featureKey].replace(/<[^>]+>/g, '') : ''
    };
  });

  const hasRedFlags = document.getElementById('hasRedFlags').checked;
  const redFlags = document.getElementById('redFlags').value.trim();
  const reportSummary = document.getElementById('reportSummary').value.trim();

  return { childInfo, examInfo, features, hasRedFlags, redFlags, reportSummary };
}

function exportFormDataToTXT(formTitle, formData) {
  let primaryField = formData.childInfo?.fullName || 'بيانات';

  let lines = [];
  lines.push(formTitle);
  lines.push('======================\n');

  lines.push('- معلومات الطفل:');
  if (formData.childInfo) {
    lines.push(`  اسم الطفل: ${formData.childInfo.fullName || ''}`);
    lines.push(`  تاريخ الميلاد: ${formData.childInfo.dateOfBirth || ''}`);
    lines.push(`  العمر (سنة): ${formData.childInfo.ageyears != null ? formData.childInfo.ageyears : ''}`);
  }
  lines.push('');

  lines.push('- تفاصيل التقييم:');
  if (formData.examInfo) {
    lines.push(`  تاريخ التقييم: ${formData.examInfo.assessmentDate || ''}`);
    lines.push(`  اسم الفاحص: ${formData.examInfo.examinerName || ''}`);
  }
  lines.push('');

  // تجميع السمات حسب الوجود
  const presentFeatures = formData.features.filter(f => f.presence === 'yes').map(f => f.featureName);
  const absentFeatures = formData.features.filter(f => f.presence === 'no').map(f => f.featureName);
  const undeterminedFeatures = formData.features.filter(f => !['yes','no'].includes(f.presence)).map(f => f.featureName);

  lines.push('- السمات الموجودة:');
  if (presentFeatures.length) {
    presentFeatures.forEach((feat, i) => lines.push(`  ${i + 1}. ${feat}`));
  } else {
    lines.push('  لا توجد سمات محددة كموجودة.');
  }
  lines.push('');

  lines.push('- السمات غير الموجودة:');
  if (absentFeatures.length) {
    absentFeatures.forEach((feat, i) => lines.push(`  ${i + 1}. ${feat}`));
  } else {
    lines.push('  لا توجد سمات محددة كمفقودة.');
  }
  lines.push('');

  if (undeterminedFeatures.length) {
    lines.push('- السمات غير محددة وجودها:');
    undeterminedFeatures.forEach((feat, i) => lines.push(`  ${i + 1}. ${feat}`));
    lines.push('');
  }

  lines.push('- مؤشرات الخطر:');
  lines.push(`  توجد مؤشرات خطر؟: ${formData.hasRedFlags ? 'نعم' : 'لا'}`);
  if (formData.hasRedFlags && formData.redFlags) {
    lines.push(`  التفاصيل:\n${formData.redFlags}`);
  }
  lines.push('');

  lines.push('- ملخص التقرير:');
  lines.push(formData.reportSummary || '');
  lines.push('');

  lines.push('ملاحظة: الأرقام المدرجة للعمر المرجعي والانحراف المعياري تقريبة وتحتاج لتأكيد من الأبحاث العلمية.');

  const content = lines.join('\n');

  function sanitizeFileName(name) {
    return name.replace(/[\\/:"*?<>|]+/g, "_").replace(/\s+/g, "_");
  }

  const filename = sanitizeFileName(formTitle) + "_" + sanitizeFileName(primaryField) + ".txt";

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });

  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blob, filename);
  } else {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 150);
  }
}

function renderReferencesModal(formData) {
  const modal = document.getElementById('refs-modal');
  const container = modal.querySelector('.refs-table-container');
  const listEl = document.getElementById('refs-list-content');

  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr>
        <th>الصفة الصرفية</th>
        <th>العمر المرجعي (سنة)</th>
        <th>الانحراف المعياري (±)</th>
        <th>مثال في جملة</th>
      </tr>
    </thead>
    <tbody>
      ${formData.features.map(f => `
        <tr>
          <td>${f.featureName}</td>
          <td style="text-align:center;">${f.acquisitionAgeNorm}</td>
          <td style="text-align:center;">${f.acquisitionAgeStd}</td>
          <td>${f.example}</td>
        </tr>`).join('')}
    </tbody>
  `;

  container.innerHTML = '';
  container.appendChild(table);

  const references = [
    "معجم اللغة العربية المعاصرة - مجمع اللغة العربية.",
    "دراسة التحليل الصرفي الحديث - جامعة القاهرة.",
    "البحوث الصرفية الحديثة في اللغة العربية - مجلة اللغة العربية.",
    "السمات الصرفية للغة العربية - دراسات مجمع اللغة.",
    "معايير التقييم في اللغة العربية - منشورات أكاديمية."
  ];

  listEl.innerHTML = references.map(ref => `<li>${ref}</li>`).join('');

  modal.style.display = 'flex';
}

function setupReferencesModal() {
  const modal = document.getElementById('refs-modal');
  const closeBtn = document.getElementById('close-refs-btn');
  closeBtn.addEventListener('click', () => modal.style.display = 'none');
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.style.display = 'none';
  });

  document.getElementById('show-refs-btn').addEventListener('click', () => {
    const data = getFormData();
    renderReferencesModal(data);
  });
}

async function init() {
  const strings = await loadArabicStrings();

  document.getElementById('form-title').textContent = strings['form-title'] || 'نموذج تقييم السمات الصرفية في اللغة العربية';
  document.getElementById('childInfo-header').textContent = strings['child-info-title'] || 'معلومات الطفل';
  document.getElementById('examInfo-header').textContent = strings['exam-info-title'] || 'تفاصيل التقييم';
  document.getElementById('features-header').textContent = strings['features-title'] || 'السمات الصرفية';
  document.getElementById('redFlags-header').textContent = strings['redFlags-title'] || 'مؤشرات الخطر';
  document.getElementById('reportSummary-header').textContent = strings['reportSummary-title'] || 'ملخص التقرير';
  document.getElementById('export-btn').textContent = strings['export-text'] || 'تصدير البيانات';
  document.getElementById('show-refs-btn').textContent = strings['refs-text'] || 'المراجع';

  setupAgeCalculator();
  setupRedFlagsToggle();
  setupReferencesModal();

  renderFeaturesCards();

  document.getElementById('export-btn').addEventListener('click', () => {
    if (!document.getElementById('main-form').checkValidity()) {
      alert('يرجى تعبئة الحقول المطلوبة بشكل صحيح.');
      return;
    }
    const formData = getFormData();
    exportFormDataToTXT(document.getElementById('form-title').textContent, formData);
  });
}

document.addEventListener('DOMContentLoaded', init);
