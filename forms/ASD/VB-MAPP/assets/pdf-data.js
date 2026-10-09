/* Follow-up payload: one standard JSON attachment inside a downloaded PDF.
 * Only selected report sections are exported, including their prior snapshots.
 * This is data, not PDF JavaScript. The importer never executes PDF actions.
 */
(function (root) {
  'use strict';
  const M = root.VBModel, filename = 'vb-mapp-assessment.json';
  function selectedRecord(state, scope, data) {
    const copy = M.snapshot(state), ids = new Set();
    copy.legacy = null;
    copy.reportScope = { ...scope };
    for (const type of Object.keys(M.allowed)) {
      if (scope[type]) M.records(data, type).forEach(item => ids.add(item.id));
      else copy.scores[type] = {};
    }
    for (const key of ['comments', 'customCriteria', 'scoreReviews', 'goals'])
      copy[key] = Object.fromEntries(Object.entries(copy[key]).filter(([id]) => ids.has(id)));
    if (!scope.milestones) copy.goals = {};
    return copy;
  }
  function pack(state, data) {
    const s = M.normalize(state), assessment = selectedRecord(s, s.reportScope, data);
    assessment.history = s.history.map(record => selectedRecord(record, s.reportScope, data));
    assessment.baselineId = s.baselineId;
    return { format:'VB-MAPP-REPORT', schema:1, assessment };
  }
  function attach(pdf, state, data) {
    const bytes = new TextEncoder().encode(JSON.stringify(pack(state, data)));
    if (bytes.length > 8 * 1024 * 1024) throw Error('Assessment history is too large for a PDF. Export editable JSON.');
    let binary = '';
    for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    let fileSpec;
    pdf.internal.events.subscribe('postPutResources', function () {
      const stream = this.internal.newObject();
      this.internal.putStream({ data:binary, objectId:stream,
        additionalKeyValues:[{ key:'Type', value:'/EmbeddedFile' }, { key:'Subtype', value:'/application#2Fjson' }] });
      this.internal.out('endobj');
      fileSpec = this.internal.newObject();
      this.internal.out(`<< /Type /Filespec /F (${filename}) /UF (${filename}) /Desc (Editable VB-MAPP assessment and selected-section history) /EF << /F ${stream} 0 R >> >>`);
      this.internal.out('endobj');
    });
    pdf.internal.events.subscribe('putCatalog', function () {
      this.internal.out(`/Names << /EmbeddedFiles << /Names [(${filename}) ${fileSpec} 0 R] >> >>`);
    });
  }
  root.VBPDFData = { pack, attach, filename };
})(window);
