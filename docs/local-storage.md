# Local storage and preservation

Inventory on 2026-10-20, before cleanup:

| Directory | Size |
|---|---:|
| emulator | 13.35 GiB |
| tools, including private toolchains | 3.97 GiB |
| build | 1.65 GiB |
| artifacts | 1.59 GiB |
| .git | 0.065 GiB |

Most storage is ignored local material. A public source snapshot is not a complete recovery backup: builds still require generated baselines, local toolchains, firmware inspection inputs and private game data.

Before deleting this checkout:

1. Generate and retain build/public-source/ with node tools/export-public-source.mjs.
2. Keep a separate private backup of the working environment if continued development matters, including ignored inputs and current packages.
3. Preserve device credentials and saves privately. Neither belongs in GitHub.
4. Verify the backups can be opened before removing the original.

The exporter performs no deletion. It refuses to overwrite an existing snapshot. Repository organization does not require the watch.

The verified LeDisk backup from 2026-10-20 predates the R406/R407 development outputs. Refresh and verify the private backup before deleting C:; a Git push preserves tracked source, not those newer ignored build artifacts.
