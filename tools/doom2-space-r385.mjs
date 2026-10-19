// SPDX-License-Identifier: GPL-2.0-only
// Called only after the journal's package/identity/HMAC/hash-chain validation.
export function reviewedDoom2SpaceHistory(h){
 if(!Array.isArray(h)||h.length!==3||h.map(r=>r.status).join(',')!=='Created,InstallIntent,Uncertain')return false;
 if(h.some(r=>r.attempt!==1||r.id!=='365220006'||r.size!==7221744||r.sha256!=='483dcce2620f99839f930881c5024f1b0c67885e27a36cd1b1a26e5d6864f5a1'||r.upload!==null))return false;
 const b=h[1].before;
 return h[0].before===null&&Array.isArray(b)&&b.length===10&&JSON.stringify(h[2].before)===JSON.stringify(b)&&
  b.every(r=>typeof r.id==='string'&&/^\d{9}$/.test(r.id)&&r.canDelete===true&&typeof r.active==='boolean')&&new Set(b.map(r=>r.id)).size===10&&
  b.filter(r=>r.active).length===1&&b.some(r=>r.id==='365210175'&&r.active)&&b.some(r=>r.id==='365220002'&&!r.active)&&!b.some(r=>r.id==='365220006');
}
export function reviewedDoom2Removals(before,after){
 if(!Array.isArray(before)||before.length!==10||!Array.isArray(after)||after.length!==9||
  before.some(r=>!r)||after.some(r=>!r)||new Set(before.map(r=>r.id)).size!==10||new Set(after.map(r=>r.id)).size!==9)return false;
 // Replace Doom I only. Every personal face and its current flags must survive.
 return before.some(r=>r.id==='365220002'&&r.canDelete===true&&r.active===false)&&!after.some(r=>r.id==='365220002')&&
  before.filter(r=>r.id!=='365220002').every(b=>after.some(r=>r.id===b.id&&r.active===b.active&&r.canDelete===b.canDelete))&&
  after.filter(r=>r.active===true).length===1&&after.some(r=>r.id==='365210175'&&r.active===true);
}
