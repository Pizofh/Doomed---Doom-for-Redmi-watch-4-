# Doomed - DOOM II on Redmi Watch 4

[![Offline CI](https://github.com/Pizofh/Doomed---Doom-for-Redmi-watch-4-/actions/workflows/pc-rfcomm-offline.yml/badge.svg)](https://github.com/Pizofh/Doomed---Doom-for-Redmi-watch-4-/actions/workflows/pc-rfcomm-offline.yml)

A native DOOM II port for **Redmi Watch 4 M2315W1 / stock firmware 2.2.86**, with a C engine and Lua/LVGL watchface interface. Once installed, the game runs independently of the PC.

**Availability: source code and developer tooling. The public installer is not enabled yet.**

## What works

Original menus, movement, interaction, weapon switching, pause, persistent save/load and clean CLOSED exits have been confirmed by the owner in the DOOM II line. Direct memory presentation avoids per-frame PNG files. Sound effects work but can stutter; music is absent. One touch action is supported at a time.

| Version | Change | Validation |
|---|---|---|
| R397 | Menus, saves, weapons and normal exits | User-confirmed gameplay baseline |
| R405 | Advance after completing a map | Installed; map-end confirmation pending |
| R406 | Dark DOOM-themed start screen and larger JUGAR button | Installed; visual/gameplay confirmation pending |
| R407 | Independent first-install package and setup assistant | Offline preparation and simulated transport pass; hardware acceptance pending |

A full physical DOOM II campaign and installation by a second owner are not validated. Other firmware and watch models are unsupported by the current delivery flow.

## Delivery flow

The candidate toolkit has three entry points:

1. **Preparar.cmd** verifies the user's own compatible DOOM2.WAD and builds a self-contained package locally.
2. **Configurar.cmd** stores the owner's connection details locally, with hidden key entry or a compatible local-log import.
3. **Instalar.cmd** will check authentication, model, firmware, battery and catalog before sending. It is currently disabled pending hardware acceptance.

The consumer toolkit does not require ARM tools, EasyFace or an older Doom face. Obtaining a valid authentication key is still owner-specific; a universal key-acquisition flow has not been validated. Game data and private credentials are never included in the public source.

[Delivery guide, Spanish](docs/delivery.md) | [Getting started](docs/getting-started.md) | [Playing](docs/playing.md)

## Development and verification

Requires Node.js 22 for the public offline checks. No WAD, credentials or watch are needed:

~~~powershell
node --test tools/test-delivery-preparer.mjs tools/test-delivery-configuration.mjs
node tools/test-doom-large-upload.mjs --synthetic
node tools/test-doom-upload-pc-session.mjs
~~~

CI also checks Lua launcher contracts, native Windows worker simulation, physical gates and publication hygiene. It does not build the complete game from a clean checkout or replace physical acceptance.

[Architecture](docs/architecture.md) | [Results and limits](docs/project-results.md) | [Changelog](CHANGELOG.md)

The game build still composes earlier revision helpers and local generated baselines. A clean-machine developer build remains work in progress. Do not delete those dependencies just because their filenames refer to older revisions.

A curated source snapshot can be generated with `node tools/export-public-source.mjs`. [Storage and preservation](docs/local-storage.md) covers private backups before removing the development checkout.

## License and private inputs

Original code defaults to **GPL-2.0-only**, except where a file states otherwise. Upstream notices remain intact. See [LICENSE](LICENSE), [LICENSING.md](LICENSING.md) and [dependencies](third_party/README.md).

WADs, generated game packages, firmware, external tool binaries, saves, device credentials and raw logs are excluded from Git. The existing transport has no automatic deletion, activation or retry after an uncertain transfer.
