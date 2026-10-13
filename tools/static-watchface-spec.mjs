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
    artifact:'artifacts/lua-diagnostic-r180/LuaDiag-id-only.face',journal:'lua-diagnostic-r181.json'}),
  r184:Object.freeze({variant:'r184',contentKind:'lua-image',id:'365219993',size:9328,
    sha256:'150f285b7e63cc99519b32cde0b93fe35784cc5ba2d60a5d01746f1064483e49',
    sourceSha256:'df7e732b18955e47d252ea08fe0e9af7b4ed3a526b83ed8dd2ee4846b20c0078',
    sourceArtifact:'experiments/lua-image/main.lua',
    artifact:'artifacts/lua-image-r184/LuaImage-id-only.face',journal:'lua-image-r185.json'}),
  r188:Object.freeze({variant:'r188',contentKind:'lua-native-info',id:'365219994',size:12708,
    sha256:'e0fe5fb93311460eb784d44b449613ec0defc20841e061096811b4b42eea9c4d',
    sourceSha256:'764d532c6810a51999434c1f7847ec075e5d85c273792ab9b5777a91c7a2f4a7',
    sourceArtifact:'experiments/lua-native-info/main.lua',
    artifact:'artifacts/lua-native-info-r188/NativeInfo-id-only.face',journal:'lua-native-info-r189.json'}),
  r197:Object.freeze({variant:'r197',contentKind:'native-first-c',id:'365219996',size:22500,
    sha256:'bf3bfbd4147ed27527fc7659aac0098472252016725af6ef2750e86cd2f5cbf9',
    sourceSha256:'b431f91f31c36fe1fb58a48595a51ee6c5593f5c2d0924c37746988ed3ed7c85',
    sourceArtifact:'artifacts/first-c-r197/app/lua/main.lua',nativeCodeIncluded:true,
    artifact:'artifacts/first-c-r197/FirstC-id-only.face',journal:'first-c-r198.json'})
});
export function staticSpec(variant = 'r167') {
  if (typeof variant !== 'string' || !Object.hasOwn(specs,variant)) throw Error('StaticSpecRefused');
  return specs[variant];
}
export const staticTestIds = Object.freeze(Object.values(specs).map(spec => spec.id));
export const watchfaceVariants = Object.freeze(Object.keys(specs));
