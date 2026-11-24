/* «ملف الطفل» for assessment forms: saves one finished assessment as a child file that the therapist opens on
 * the reports page (tools/accounts), where it shows beside the child's progress from the speech apps.
 * The file format is the one the apps use (speech-child-file, version 1); a form fills `assessments` only.
 *
 * Any form can use it:
 *   <script src="../child-file.js" defer></script>
 *   SpeechAssessmentFile.save({ form: 'child-case-history', title: 'دراسة حالة الطفل', date: '2026-11-24',
 *       child: { name, birth, gender }, examiner, sections: [{ title, items: [{ label, value }] }] });
 * Nothing is sent anywhere: the file is shared (phones, iPads) or downloaded. */
((root) => {
    'use strict';
    const DEVICE_KEY = 'speech-device-id-v1';
    function deviceId() {
        let id = null; try { id = localStorage.getItem(DEVICE_KEY); } catch {}
        if (!id) { id = 'd-' + (crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36)).replace(/-/g, '').slice(0, 16); try { localStorage.setItem(DEVICE_KEY, id); } catch {} }
        return id;
    }
    const clean = value => String(value ?? '').trim();
    /** The file for one assessment. Sections keep only answered questions unless the form passes empty values on purpose. */
    function build({ form, title, date, child = {}, examiner = '', sections = [] }) {
        if (!clean(child.name)) throw Error('Add the child’s name first.');
        const list = sections.map(section => ({ title: clean(section.title), items: (section.items || []).map(item => ({ label: clean(item.label), value: clean(item.value) })) }));
        const who = { name: clean(child.name), ...(child.birth ? { birth: child.birth } : {}), ...(child.gender ? { gender: child.gender } : {}) };
        return { format: 'speech-child-file', version: 1, exported: new Date().toISOString(), device: deviceId(), from: form,
            recorder: { role: 'therapist', name: clean(examiner).slice(0, 60) }, child: who, accounts: [],
            assessments: [{ form, title: clean(title), date: date || null, child: who, sections: list }] };
    }
    const fileName = file => `ملف-الطفل-${file.child.name.replace(/[^\p{L}\p{N}_-]/gu, '_').slice(0, 40)}-${file.assessments[0].form}-${file.exported.slice(0, 10)}.json`;
    /** Builds the file and shares it where the device can (WhatsApp, mail…), else downloads it. */
    async function save(details) {
        const file = build(details), name = fileName(file);
        const blob = new File([JSON.stringify(file)], name, { type: 'application/json' });
        if (navigator.canShare?.({ files: [blob] })) {
            try { await navigator.share({ files: [blob], title: `ملف الطفل · ${file.child.name}` }); return 'shared'; }
            catch (error) { if (error?.name === 'AbortError') return 'cancelled'; }
        }
        const url = URL.createObjectURL(blob), link = document.createElement('a');
        link.href = url; link.download = name; document.body.append(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        return 'saved';
    }
    root.SpeechAssessmentFile = { save, build, deviceId };
})(globalThis);
