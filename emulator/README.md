# Archivos locales del emulador

Hay un ZIP v1.0 y una extracción revisada, ignorados por Git. Se obtuvo ADB en una segunda instancia por `emulator-5554` y se probó Lua CLI; render/touch del sample siguen sin validar. Ver [resultados](../docs/emulator-runtime.md) y [estado para mañana](../docs/HANDOFF.md).

Mantener ZIP, extracción y estado mutable del emulador fuera del contenido versionado, por ejemplo bajo `emulator/local/`. Antes de extraer o ejecutar revisar procedencia, inventario del archivo, rutas, hashes, firmas y launcher. Ver [docs/emulator.md](../docs/emulator.md).
