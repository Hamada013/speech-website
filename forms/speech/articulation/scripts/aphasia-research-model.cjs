const model=require('../../../aphasia/langiuage-cognitive/assets/model.js');
function validateAphasia(payload){
 if(payload?.version!==1||!Array.isArray(payload.catalog)||!payload.catalog.length||payload.catalog.length>500)throw Error('Invalid catalog');
 const ids=new Set();for(const item of payload.catalog){if(!/^item-\w+-\d+$/.test(item.id)||ids.has(item.id)||typeof item.label!=='string'||item.label.length>5000||!Number.isInteger(item.section)||typeof item.group!=='string'||typeof item.observation!=='boolean')throw Error('Invalid item');ids.add(item.id);}
 const store=model.validate({...model.empty(),cases:[payload.case]});
 for(const a of store.cases[0].assessments)for(const id of Object.keys(a.state.responses))if(!ids.has(id))throw Error('Unknown item');
 return {version:1,case:store.cases[0],catalog:payload.catalog};
}
module.exports={validateAphasia};
