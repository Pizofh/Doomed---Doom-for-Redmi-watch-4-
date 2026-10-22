# Getting started

The tested target is Redmi Watch 4 M2315W1 / firmware 2.2.86. Other firmware and models are unverified. Native modules share the OS address space; complete device recovery has not been validated.

## Players

The [offline preparer](delivery.md) can create a first-install package from a compatible user-owned DOOM2.WAD. Its standalone preparation was tested in an isolated folder; it does not send anything to a watch. There is no validated first-install wizard yet. Historical install scripts pin individual trial packages and depend on the owner's private connection setup. They are not a general installation tutorial.

R405 imports game data and saves from R397 on first START. Installing it on an empty watch does not install DOOM II. Keep your working face until an upgrade has loaded your save and exited successfully. See [playing](playing.md).

## Developers

The local environment uses Windows, Node.js 22, Arm GNU 14.3, EasyFace 4.23, pinned doomgeneric sources and firmware-specific bindings. Tools, firmware and game data are obtained separately.

R407 delivery preparation commands, for the prepared development environment:

~~~powershell
node tools/build-doom-audio-r362.mjs rw4 --doom2-delivery-r407
node tools/package-doom-delivery-r407.mjs
node tools/stage-delivery-r407.mjs
node tools/test-delivery-r407.mjs
~~~

These require earlier build outputs. They are not a fresh-clone build recipe. Existing outputs are protected against overwrite. The old prerequisite checker inventories R351 and does not establish current release readiness.

Offline CI checks protocol handling, worker supervision, launcher contracts and publication hygiene. It does not build a complete watch package or test hardware.

Use node tools/export-public-source.mjs to prepare the compact public source snapshot. No watch connection is required.
