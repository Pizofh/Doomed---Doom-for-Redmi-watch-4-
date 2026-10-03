# Archivos locales del emulador

Hay un ZIP v1.0 descargado manualmente y una extracción selectiva revisada, ambos ignorados por Git. `session-status.json` distingue preparación, launcher host y ejecución del guest. El guest aún no arrancó.

Mantener ZIP, extracción y estado mutable del emulador fuera del contenido versionado, por ejemplo bajo `emulator/local/`. Antes de extraer o ejecutar revisar procedencia, inventario del archivo, rutas, hashes, firmas y launcher. Ver [docs/emulator.md](../docs/emulator.md).
