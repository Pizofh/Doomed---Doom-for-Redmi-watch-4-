// Two fixed reviewed PC artifacts; not an arbitrary-file/ID mechanism.
const specs = Object.freeze({
  r167:Object.freeze({variant:'r167',id:'365799910',size:25224,
    sha256:'7df88688c61e63b1aaab208ddf2b3976bf912fbaa08c01bf6f0d0e986ad9e93a',
    artifact:'artifacts/static-watchface-r167/RW4Probe-id-only.face',journal:'static-watchface-r169.json'}),
  r173:Object.freeze({variant:'r173',id:'365219990',size:25224,
    sha256:'90069d708bea26770e85464c087dfce51ae3640e565ab33ad44f78526d5f35e5',
    artifact:'artifacts/static-watchface-r173/RW4Probe-id-alternative.face',journal:'static-watchface-r173.json'})
});
export function staticSpec(variant = 'r167') {
  if (typeof variant !== 'string' || !Object.hasOwn(specs,variant)) throw Error('StaticSpecRefused');
  return specs[variant];
}
export const staticTestIds = Object.freeze(Object.values(specs).map(spec => spec.id));
