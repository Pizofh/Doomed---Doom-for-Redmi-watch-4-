# R353: simultaneous touch feasibility

Follow-up R371 inspected all direct Thumb BL candidates to the stock report
function across the pinned AP. Three reviewed callers all construct npoints=1;
this strengthens the stock-path limitation without identifying the physical
panel or excluding every indirect call. See the [R371/R372 decision and evidence](touch-path-and-audio-startup-r371-r372.md).
No physical touch diagnostic or change to the accepted game was made.

The user wants two or three independently held buttons, with release stopping
each action. Toggle fire, autofire, and latched movement are explicitly rejected.
DoomReady remains unchanged with one active touch button.

## Findings

The native engine already accepts combinations of forward, turn, fire, backward,
and use (excluding opposite directions). The current Lua controller accepts one
button at a time. Extending that controller alone would not establish multitouch:
it needs independent contact positions, identities, and release events first.

The upstream [LVGL 8.3 pointer interface](https://raw.githubusercontent.com/lvgl/lvgl/release/v8.3/src/hal/lv_hal_indev.h)
has one point and pressed/released state per input device. This describes the
reference interface, not proof of the watch's exact build or panel capabilities.

Static inspection of the pinned RW4 AP candidate found Hynitron, Zinitix, and
Chipone driver families. Their presence does not identify the controller fitted
to this particular watch. In the Chipone report adapter at file offset 0x1dcc00,
the emitted sample has a point count of one and point ID zero; its caller reads
one coordinate/event record. Although the low-level record includes an ID, the
reviewed adapter does not preserve it in the outgoing point ID. Thus its log
mentioning an ID is not evidence that the application receives multiple fingers.

The touch upper half at 0x1c2fec computes sample length as
32 + 24 * (npoints - 1). That generic ability to transport a larger sample does
not mean the lower driver actually produces one. Likewise, the Chipone routine
that queries a maximum-point register does not reveal its runtime value offline.

These are static interpretations of one pinned firmware candidate, not a live
trace or a universal claim that every RW4 panel is physically single-touch.
There is no verified path delivering two or three independent contacts to Doom.
Enabling combined engine masks now could leave keys stuck or manufacture
combinations unrelated to held fingers; it would not meet the user's request.

## Decision and remaining boundary

Keep DoomReady's tested input and rendering unchanged. Genuine multitouch is
blocked on identifying the active lower driver and showing that its normal
input stream preserves simultaneous contacts and releases. If it collapses them
as the reviewed adapter does, this requires lower-driver work, beyond a button
layout change. Do not promise support or start successive gameplay payloads on
the basis of generic touchscreen specifications.

The previous independent raw reader was validated only on the Watch S3 emulator
([notes](native-touch-emulator.md)); neither its ABI nor reader independence has
been validated on physical RW4. A physical diagnostic would first need a concrete
reviewed design and the user's new-payload approval. No such trial is authorized
or performed in R353. No firmware patch, ioctl, module, BLE operation, package
installation, or change to the installed game was performed.

## Reproduction

`node tools/review-rw4-touch-r353.mjs` verifies the existing private AP and
objdump hashes and writes selected disassembly windows to ignored
`artifacts/research/rw4-touch-r353/`. It refuses changed inputs or overwriting an
existing review. The AP SHA256 is
`2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db`.
Raw firmware and disassembly remain private ignored artifacts; this note and
the inspection helper contain no connection credentials or firmware bytes.
