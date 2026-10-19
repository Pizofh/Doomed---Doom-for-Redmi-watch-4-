# Doomed - DOOM for Redmi Watch 4

Original DOOM running on the Redmi Watch 4 with stock firmware, a native C
engine and a Lua/LVGL watchface interface.

**Current 0.2 development status:** [DoomTune R387](docs/doom-tune-physical-plan-r387.md)
has been tested on the watch with Doom II, its original menu, controls,
pause, persistent save/load and clean exit. Background holds stay within the
game and face selection returns after exit. Sound effects are usable but still
occasionally choppy. This does not establish a full campaign playthrough or a
long Doom II session. DoomTune depends on the retained DoomII data carrier;
retail WADs are private inputs and are not included in this repository.

The 0.1.0 baseline and its build instructions below remain unchanged;
see [0.2 work](docs/next-version.md) for the newer incremental builds and limits.

## 0.1.0 baseline

**Physically tested:** [DoomReady R351/R352](docs/doom-ready-physical-plan-r351.md).
The user confirmed gameplay, larger controls, interaction, pause, save/load with
the original screen melt, persistence after switching to another face, and clean
CLOSED exit. The final short cycle reported zero engine/graphics errors and
phase2. DoomPads remains the previously tested fallback.
The final acceptance session lasted approximately 30 minutes according to the
user, including death, recovery from a save and CLOSED exit, with no failures
reported.

DoomReady includes faster checks, longer sessions and persistent save/load.
Local tests also cover a147-second session and save/load in all nine shareware
maps. The30-minute cap and a whole campaign playthrough have not been physically
validated. Touch input currently accepts one action at a time; hardware
multitouch support is unconfirmed.

[Playing guide (Spanish)](docs/playing.md) | [Current handoff](docs/HANDOFF.md)
[Getting started / installation status](docs/getting-started.md) |
[0.2 work](docs/next-version.md)

**First playable release:** [0.1.0 handoff (Spanish)](docs/first-playable-release.md).
Acceptance is complete. It preserves the tested package byte for byte; no new
face installation is needed.

New visitors: this is currently a source and documentation release. A fresh-clone
build and a second-owner installation have not been validated. Start with the
getting-started guide and `node tools/check-release-prerequisites.mjs`; it never
connects to a watch or reads connection credentials.

## Controls and presentation

- Proportional game image about 383 x 239 on a 390 x 450 display.
- Direction pad, FIRE and USAR; one active touch input at a time.
- PAUSA/SEGUIR and SALIR. Controls remain below the game, with its HUD visible.
- Direct in-memory presentation, two immutable buffers and UI-owned graphics.
  The engine thread never calls LVGL; no per-frame PNG or flash writes.

DoomReady adds GUARDAR/CARGAR while paused. A save uses two alternating local
banks, length/CRC checks and readback before reporting success. Save files belong
to the face; uninstalling it can remove them. Sound is not implemented.

## Compatibility and limits

The physical port is pinned to Redmi Watch 4 M2315W1, firmware 2.2.86.
The S3 emulator is a separate validation target and does not establish support
for other firmware or watches. Native modules share the OS address space.
DoomReady uses a cooperative 30-minute session cap; it cannot interrupt a blocked
OS call. Its RAM guard is checked at every start. Full device recovery has not
been validated.

Only the original shareware 1.9 WAD is supported here. The nine maps start and
save/load in the emulator; a complete campaign playthrough has not been tested.
The WAD is installed once in the retained DoomLauncher data carrier.

## Local build and validation

Build scripts use reviewed local Arm 14.3 tools, pinned doomgeneric sources,
WAD, compiler, firmware inspection input and cached baseline objects. This is
an incremental research build, not yet a one-command clean-machine SDK.
No download, device installation or activation occurs in these commands:

~~~powershell
node tools/build-doom-ready-r351.mjs rw4
node tools/build-doom-ready-r351.mjs s3-model
node tools/build-doom-ready-r351.mjs s3-ui
node tools/test-ready-launcher-r351.mjs
node tools/test-ready-store-r351.mjs
node tools/test-doom-ready-r351.mjs
node tools/test-ready-campaign-r351.mjs
# UI stage/test/cleanup requires the owned S3 UIProbe inactive/selected as directed.
# After successful UI cleanup:
node tools/package-doom-ready-r351.mjs
node tools/test-doom-ready-package-r351.mjs
node tools/pc-doom-ready-r351.mjs prepare
~~~

Reviewed output directories are protected against accidental overwrite. Emulator
helpers are restricted to their owned loopback instance. Physical install gates
remain closed until a specific reviewed trial is approved; no automatic retries.
Build details and trial evidence are in the linked R351 plan and local reports.

## Sources and private data

Original project source code defaults to **GPL-2.0-only**, except where a file
has an explicit different notice. Existing `GPL-2.0-or-later` notices and upstream
licenses remain in effect. See [LICENSE](LICENSE) and [licensing scope](LICENSING.md).

Upstream: doomgeneric revision dcb7a8dbc7a16ce3dda29382ac9aae9d77d21284;
its original GPL license is retained with the local source. Game data has its
own license. See [source review](docs/doom-build-audit.md) and
[WAD provenance](docs/native-wad-emulator.md).

Firmware, WADs, tool binaries, face packages, save files, raw Bluetooth logs,
device addresses and authentication keys are not included in this repository.
Private inputs stay in ignored local directories. No remote push is part of the
current workflow.
