// Fixed reviewed watchface artifacts. Legacy "static" names describe the
// original image experiment, not the content of the separately pinned Lua one.
const specs = Object.freeze({
  r167:Object.freeze({variant:'r167',contentKind:'static-image',id:'365799910',size:25224,
    sha256:'7df88688c61e63b1aaab208ddf2b3976bf912fbaa08c01bf6f0d0e986ad9e93a',
    artifact:'artifacts/static-watchface-r167/RW4Probe-id-only.face',journal:'static-watchface-r169.json'}),
  r173:Object.freeze({variant:'r173',contentKind:'static-image',id:'365219990',size:25224,
    sha256:'90069d708bea26770e85464c087dfce51ae3640e565ab33ad44f78526d5f35e5',
    artifact:'artifacts/static-watchface-r173/RW4Probe-id-alternative.face',journal:'static-watchface-r173.json'}),
  r177:Object.freeze({variant:'r177',contentKind:'lua-minimal',id:'365219991',size:19796,
    sha256:'a40c85607a8c208823f2dd6064ebca3c907a850e9a392c0b3eb0d718d3c9490a',
    sourceSha256:'e871590b80c50f2981ea8a8a796e3b0ca2f84977e7aa9a4e9fa32be7a608749d',
    sourceArtifact:'experiments/lua-minimal/main.lua',
    artifact:'artifacts/lua-minimal-r177/LuaProbe-id-only.face',journal:'lua-minimal-r178.json'}),
  r180:Object.freeze({variant:'r180',contentKind:'lua-diagnostic',id:'365219992',size:10524,
    sha256:'140b2a05618f617e70a7f5f28029beefed64251c43af0086cfaacfe0a681c8f1',
    sourceSha256:'7dece1ba7dac11e500157cf5569b92dc0999c3ea1e95c4b1d07e61b7b60115bd',
    sourceArtifact:'experiments/lua-diagnostic/main.lua',
    artifact:'artifacts/lua-diagnostic-r180/LuaDiag-id-only.face',journal:'lua-diagnostic-r181.json'})
});
export function staticSpec(variant = 'r167') {
  if (typeof variant !== 'string' || !Object.hasOwn(specs,variant)) throw Error('StaticSpecRefused');
  return specs[variant];
}
export const staticTestIds = Object.freeze(Object.values(specs).map(spec => spec.id));
export const watchfaceVariants = Object.freeze(Object.keys(specs));
