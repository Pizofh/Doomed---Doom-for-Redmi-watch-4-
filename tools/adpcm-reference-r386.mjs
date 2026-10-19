// SPDX-License-Identifier: GPL-2.0-only
// IMA/DVI reference arithmetic cross-checked against CPython 3.12 audioop.c:
// https://github.com/python/cpython/blob/v3.12.0/Modules/audioop.c
export const steps=[7,8,9,10,11,12,13,14,16,17,19,21,23,25,28,31,34,37,41,45,50,55,60,66,73,80,88,97,107,118,130,143,157,173,190,209,230,253,279,307,337,371,408,449,494,544,598,658,724,796,876,963,1060,1166,1282,1411,1552,1707,1878,2066,2272,2499,2749,3024,3327,3660,4026,4428,4871,5358,5894,6484,7132,7845,8630,9493,10442,11487,12635,13899,15289,16818,18500,20350,22385,24623,27086,29794,32767];
const changes=[-1,-1,-1,-1,2,4,6,8];
export function advance(code,state){let difference=steps[state.index]>>3;for(let bit=0;bit<3;bit++)if(code&(1<<bit))difference+=steps[state.index]>>(2-bit);
 state.value=Math.max(-32768,Math.min(32767,state.value+(code&8?-difference:difference)));state.index=Math.max(0,Math.min(88,state.index+changes[code&7]));return state.value;}
export function encode(raw,stride=2){const values=Array.from({length:Math.ceil(raw.length/stride)},(_,i)=>{const at=i*stride;return((stride===2?Math.floor((raw[at]+raw[Math.min(at+1,raw.length-1)]+1)/2):raw[at])-128)*256;});
 function code(target,state){let difference=target-state.value,n=difference<0?8:0;difference=Math.abs(difference);let step=steps[state.index];for(const bit of [4,2,1]){if(difference>=step){n|=bit;difference-=step;}step>>=1;}advance(n,state);return n;}
 let chosen=0,best=Infinity;for(let index=0;index<=88;index+=8){const state={value:values[0],index};let score=0;for(const target of values.slice(1,64)){code(target,state);score+=(Math.abs(target-state.value)>>>8)**2;}if(score<best){best=score;chosen=index;}}
 const result=Buffer.alloc(4+Math.floor(values.length/2));result.writeInt16LE(values[0]);result[2]=chosen;const state={value:values[0],index:chosen};
 for(let i=1;i<values.length;i++){const n=code(values[i],state);if(i%2)result[4+Math.floor((i-1)/2)]=n<<4;else result[4+Math.floor((i-1)/2)]|=n;}
 return{bytes:result,values};}
export function decode(bytes,count){const state={value:bytes.readInt16LE(0),index:bytes[2]},out=[state.value];for(let i=1;i<count;i++){const b=bytes[4+Math.floor((i-1)/2)],code=i%2?b>>4:b&15;out.push(advance(code,state));}return out;}
