# Architecture

A Lua watchface loads the native C game module. The port adapts doomgeneric to firmware timing, files, input, graphics and media services.

~~~mermaid
flowchart LR
    T[Touch] --> L[Lua / LVGL]
    L --> Q[Input and session transport]
    Q --> C[Native DOOM engine]
    W[Packed WAD] --> C
    C --> B[Immutable frame buffers]
    B --> L
    C --> A[Audio worker / media service]
~~~

The engine thread does not call LVGL. The UI owns presentation and reads immutable frame buffers. Direct presentation replaced per-frame PNG files. Packed game data stays in storage and is read on demand.

Pause releases keys and stops simulation. Exit removes UI references, requests cooperative stop and waits before unloading. CLOSED reports completion; arbitrary blocked OS calls remain a recovery limitation.

Saves alternate between two checked files. Upgrade migration from a specific predecessor face is separate from a first installation.

| Path | Purpose |
|---|---|
| doom/platform-rw4 | Runtime, bindings, graphics, audio, packed reader and launcher |
| tools | Source transforms, compilation, packaging and PC transport |
| experiments | Test fixtures and supporting native transport code |
| scripts | Environment/source setup |
| third_party | Dependency locks and provenance |

Builds still compose earlier revision helpers. Removing old-looking source files without tracing those dependencies would break the current build. Consolidating the build is future work.
