# Dependencias

`dependencies.lock.json` registra SHAs consultados a través del conector GitHub el 2026-10-02. Los clones locales fallaron por restricción de red, por lo que esas consultas **no son checkouts locales**.

`setup.ps1 -FetchSources` crea checkouts separados, ignorados por Git, de esos SHAs. No usa submodules incompletos ni ejecuta scripts upstream. Conserva las licencias originales cuando obtenga las fuentes. No actualizar automáticamente a `master`.

| Repositorio | Revisión consultada | Uso | Licencia |
|---|---|---|---|
| m0tral/MiWatchEmulator | f637d22a07727e59ffe96aa919b1a9193d23db95 | Documentación del emulador | No identificada en el repositorio consultado; no redistribuir binarios |
| m0tral/EasyFace | f76a9fe1f559bc8b1d91cf2a1f5af1a630848098 | Documentación de empaquetado | No identificada; instalación MSI aparte, no ejecutada |
| m0tral/MiWatchLuaWatchfaces | 5af6e14ea92830a394c88dc04f76ceef697a6ded | Análisis TouchEvents/Diffusion | No identificada; no copiar assets stock ni scripts al repo público |
| ozkl/doomgeneric | dcb7a8dbc7a16ce3dda29382ac9aae9d77d21284 | Futuro port, no build en esta fase | LICENSE inspeccionada: GPL versión 2; no cubre WADs |

Una firma del commit README no autentica el archivo ZIP de una release. Un hash calculado localmente identifica un archivo pero, sin valor de referencia independiente, no demuestra su autenticidad o seguridad.

`openvela-emulator-binaries.lock.json` fija metadata de 94 EXE/DLL del repositorio oficial OpenVela. Todos coincidieron con la extracción local v1.0; no se incorporan sus bytes. Ver [revisión del paquete](../docs/emulator-package-review.md).
