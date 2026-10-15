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
