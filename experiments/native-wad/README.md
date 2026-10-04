# Inspección WAD desde C

Initializer finito read-only del guest S3 exacto, sin Doom engine. Lee el WAD shareware verificado desde un nombre propio tmpfs, valida directory bounds y checksums, cierra y retorna. Sin callbacks o tareas retenidas. FLAT no sandbox; nunca cargar sobre M2315W1.

[Procedencia, pins, resultados y reproducción R63](../../docs/native-wad-emulator.md). WAD/archivo comprimido/artifacts permanecen ignorados; los tests host generan bytes propios.
