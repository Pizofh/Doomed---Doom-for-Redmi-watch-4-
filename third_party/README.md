# Dependencies

External source and tools are obtained separately and keep their original licenses.

| Dependency | Reference |
|---|---|
| doomgeneric | dcb7a8dbc7a16ce3dda29382ac9aae9d77d21284; verified against doom/doomgeneric-source.lock.json |
| Arm GNU 14.3 | Native compilation; identities checked by local build scripts |
| EasyFace 4.23 | Watchface packaging; binary excluded |
| tinf | Packed reader; lock and license in doom/platform-rw4/packed/ |
| Emulator | Separate validation target; does not establish RW4 compatibility |

The dependency lock also lists repositories consulted during early research. scripts/setup.ps1 -FetchSources fetches those pinned sources, not the entire current development environment.

WADs, derived game assets, firmware, emulator/tool binaries and private inputs are excluded from public source distribution.
