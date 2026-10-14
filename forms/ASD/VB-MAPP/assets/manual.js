/* Manual-backed milestones overlay. Persistent IDs and original source data
 * remain unchanged; saved results are never silently reassigned to new criteria. */
(function () {
  'use strict';
  const D = window.VB_DATA, manual = window.VB_MANUAL;
  // Keep legacy scores when the underlying task and thresholds are unchanged.
  // A corrected/previously gated task cannot inherit its old result. Where only
  // a half-point rule changed, retain demonstrated full credit, not old gaps.
  const fullOnly = new Set(['l1-4','e1-1','e1-2','e1-3','e1-4','e1-5','e2-7','e2-8','e2-9','l3-12']);
  const nonzeroOnly = new Set(['lr2-8','iv2-8','iv2-9','iv2-10','vp1-4','t3-12','t3-13','l3-13']);
  const changedFull = new Set(['e2-6','e2-10']);
  function complete(item) {
    const entry = manual.items[item.id];
    if (!entry) throw new Error('Missing manual guidance: ' + item.id);
    const text = entry.text || item.text;
    const legacyScores = item.requiresCriteria || item.missing || changedFull.has(item.id) ? []
      : fullOnly.has(item.id) ? [1] : nonzeroOnly.has(item.id) ? [.5, 1] : [0, .5, 1];
    return { ...item, ...entry, text, objective: text, missing: false, requiresCriteria: false,
      manualRevision: manual.revision, legacyScores, guide: { text, objective: text, application: entry.application, scoring: entry.scoring } };
  }
  D.milestones = D.milestones.map(complete);
  D.additionalMilestones = D.additionalMilestones.map(complete);
  D.manualRevision = manual.revision;
  for (const item of D.milestones) {
    const stimulus = window.VB_STIMULI[item.id];
    if (stimulus) { stimulus.task = item.text; stimulus.instruction = item.application; }
  }
})();
