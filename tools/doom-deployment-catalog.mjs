// Selection may legitimately change between separately reviewed attempts.
// Preserve the CURRENT selection; never restore an earlier user's choice.
function canonical(rows){
 if(!Array.isArray(rows)||rows.filter(r=>r?.active===true).length!==1)return null;
 const ids=new Set(),entries=[];
 for(const r of rows){
  if(!r||!/^\d{9}$/.test(r.id)||ids.has(r.id)||typeof r.active!=='boolean'||typeof r.canDelete!=='boolean')return null;
  ids.add(r.id);entries.push([r.id,r.canDelete]);
 }
 entries.sort((a,b)=>a[0].localeCompare(b[0]));return{entries,active:rows.find(r=>r.active).id};
}
export function compareDoomCatalogs(previous,current){
 const a=canonical(previous),b=canonical(current);
 return {sameMembership:!!a&&!!b&&JSON.stringify(a.entries)===JSON.stringify(b.entries),sameSelection:!!a&&!!b&&a.active===b.active};
}
// R289: the user confirmed exactly two manual deletions after the baseline.
// Accept only those removals, with every surviving flag unchanged; no additions.
export function reviewedTwoRemovals(previous,current){
 if(!canonical(previous)||!canonical(current)||previous.length-current.length!==2)return false;
 if(current.some(r=>!previous.some(p=>p.id===r.id&&p.canDelete===r.canDelete)))return false;
 return previous.filter(p=>!current.some(r=>r.id===p.id)).every(p=>p.canDelete);
}
