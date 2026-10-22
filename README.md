# Doomed ? DOOM II on Redmi Watch 4

DOOM II on stock Redmi Watch 4 firmware, using a native C engine and a Lua/LVGL watchface interface.

**Tested device: Redmi Watch 4 M2315W1, firmware 2.2.86.** The game works independently of the PC after installation.

## Status

Original menus, movement, interaction, weapon switching, persistent save/load, pause and clean CLOSED exits work in the user-confirmed R397 baseline. Sound effects work but can stutter. Music and simultaneous touch inputs are absent. MENU/PAUSA overlays can be faint and difficult to tap.

R405 fixes advancing after completing a map. Its installation is confirmed; physical confirmation of that specific fix is pending. R406 adds a dark DOOM-themed launcher with a larger JUGAR button; installation is confirmed; its startup appearance and gameplay still await user confirmation. A full physical DOOM II campaign has not been validated.

## Start here

[Getting started](docs/getting-started.md) ? [Delivery preparation](docs/delivery.md) ? [Playing](docs/playing.md) ? [Architecture](docs/architecture.md) ? [Results and limits](docs/project-results.md)

This is a source release. R407 adds an offline preparation toolkit: users supply their own DOOM2.WAD and generate a self-contained first-install package without ARM tools, EasyFace or a previous Doom face. The toolkit does not install on the watch. Physical acceptance of R407, owner-specific connection setup, and installation by a second owner remain pending. A fresh-clone developer build is not yet validated. Commercial game data is supplied separately by its owner.

Create a compact public source snapshot:

~~~powershell
node tools/export-public-source.mjs
~~~

The exporter audits Git history and copies tracked source plus a short documentation set to build/public-source/. It writes SHA256 hashes and excludes the research diary, Git history, WADs, firmware, binaries, saves and credentials. It never connects to the watch.

The build still composes earlier revision helpers, so their source dependencies remain. [Storage and preservation](docs/local-storage.md) explains what to retain before deleting this development checkout.

## License

Original code defaults to GPL-2.0-only except where individual files state otherwise. Upstream notices remain intact. See [LICENSE](LICENSE), [LICENSING.md](LICENSING.md) and [dependencies](third_party/README.md).
