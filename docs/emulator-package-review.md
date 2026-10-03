# Revisión local de MiWatchEmulator v1.0

Fecha: 2026-10-02. El usuario descargó el ZIP desde la release original. Esta revisión cubre el paquete del PC y la imagen del emulador; **ningún resultado caracteriza el firmware M2315W1**.

## Archivo y extracción

- Release: [m0tral/MiWatchEmulator v1.0](https://github.com/m0tral/MiWatchEmulator/releases/tag/v1.0).
- Archivo local: `emulator/MiWatchEmulator.zip`, 733139307 bytes.
- SHA256 local: `4c3fd80c31b0457ba6a179aa79baccd5acaec4aa9f40c170c463fbaca97f0dba`. GitHub no publicó digest: este hash identifica nuestra copia y no equivale a una firma del mantenedor.
- Zone.Identifier indica descarga desde `release-assets.githubusercontent.com`, asset del repositorio original. No guardar URLs temporales con tokens.
- ZIP: 14843 entradas; 2527722851 bytes sin comprimir; no se hallaron rutas absolutas/traversal. Se verificaron los destinos resueltos y se rechazaron enlaces simbólicos antes de extraer.
- Extracción selectiva: 510 archivos, 1878301689 bytes, bajo `emulator/local/reviewed-v1.0`. Se excluyeron drivers/instaladores, fastboot y herramientas de flash/formateo, presets ajenos y coredump.
- El ZIP y los binarios están ignorados por Git. No hay permiso de redistribución del bundle establecido.

## Procedencia de ejecutables host

Los **94 EXE/DLL extraídos bajo `emulator/` coinciden**, en tamaño y hash Git blob SHA-1, con [OpenVela prebuilts Windows en revisión 3776c05](https://github.com/open-vela/prebuilts_emulator_windows-x86_64/tree/3776c05d2c66f73f6bbe65528cd1a34fe34e1f18). La lista de metadata está fijada en `third_party/openvela-emulator-binaries.lock.json` y la comparación es reproducible:

```powershell
node tools/verify-emulator.mjs
node tools/inspect-native.mjs emulator/local/reviewed-v1.0/emulator/emulator.exe
node tools/inspect-native.mjs emulator/local/reviewed-v1.0/system-images/vela-release-4.0/nuttx
```

La coincidencia establece procedencia de estos binarios publicados por OpenVela. No es una compilación reproducible desde fuentes ni prueba ausencia de vulnerabilidades. El código fuente exacto de la variante Vela de 2024 no se identificó; la revisión actual de QEMU no se presenta como su fuente equivalente.

| Archivo | Arquitectura / firma | SHA256 local |
|---|---|---|
| emulator.exe | PE AMD64, sin Authenticode; coincide con OpenVela | d726de5b2d8ef05ce2bd00767c1e4ea0b8a1a7d9a15549dd9692d85e46709c3f |
| qemu-system-armel-headless.exe | PE AMD64, sin Authenticode; coincide con OpenVela | 28d16c487f113bf375939b4626136929b545d2282906ba485fcf019c06298079 |
| qemu-system-armel.exe | PE AMD64, sin Authenticode; coincide con OpenVela | 672b90315aebf05733ee210a392ead08b661c5240e6f1fd5ad000848ac2f022e |
| adb.exe | PE x86, Authenticode válido Google LLC | 0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7 |

Las DLL AdbWinApi/AdbWinUsbApi tienen firma Google válida; las DLL runtime Microsoft revisadas tienen firma Microsoft válida. `adb version` se ejecutó y reportó 1.0.41, paquete 35.0.2-12147458. `source.properties` identifica emulator 32.1.15, build 20240923.

## Perfil y launcher

El launcher comunitario copia un INI a `%HOMEDRIVE%%HOMEPATH%\.vela`, selecciona RW4, habilita semihosting y reenvía `127.0.0.1:2512` a `10.0.2.15:101`. También permite audio del host y un dispositivo de sonido. Se leyó como texto; **no se ejecutó el CMD original ni el instalador de drivers**.

Nuestro helper utiliza una copia separada del perfil para cambios del guest y arranque sin ventana/audio. Los argumentos exactos de cada intento quedan en `artifacts/emulator/host-process.json`. El semihosting es una capacidad del guest de interactuar con el host, no una garantía de sandbox. No cargar payloads arbitrarios.

El perfil fuente RW4 declara `armeabi-v7a`, CPU ARM, 4 cores y 512 MB RAM, pero conserva etiquetas RedmiWatch5. Solo se corrigieron las etiquetas de la copia de trabajo. El archivo generado `hardware-qemu.ini` incluido en el ZIP declara 2048 MB y rutas antiguas `D:\EmulatorWatchS3`; esos datos no son mediciones del guest actual. El skin RW4 declara 390×450, 16 bits y 60 Hz. **Ni 512/2048 MB ni Cortex-A7 son características del reloj físico.**

Los intentos iniciales con registros dentro del workspace terminaron con `Unknown VVD name [RedmiWatch4]` antes del boot. `-list-vvds`, sugerido por el error, no produjo una lista válida. Sin nombre AVD, el launcher siguió un flujo Android que exige `vendor.img`; se descartó ese camino, sin inventar imágenes ni cargar firmware de otro dispositivo.

El usuario copió manualmente el registro INI a `C:\Users\steve\.vela`. Esa ubicación está fuera de los permisos de escritura de la sesión. Un nuevo intento igualmente falló: `whoami` identifica la cuenta de ejecución `steve\codexsandboxoffline`, y `[Environment]::GetFolderPath('UserProfile')` devuelve `C:\Users\CodexSandboxOffline`, aunque la variable heredada USERPROFILE indica steve. El AOSP upstream obtiene este directorio mediante SHGetFolderPathW. La inferencia es que el registro Vela consultado por el launcher pertenece al perfil real de la cuenta de ejecución. No se redirigió ese perfil ni se escribieron archivos allí. Se solicita arrancar el helper revisado manualmente como el usuario normal, usando el registro ya creado.

## Imagen guest: inspección estática

`nuttx`: 249492852 bytes, SHA256 `849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa`. ELF32 little-endian, ET_EXEC, EM_ARM (40), entrada `0x6002e0`, flags `0x5000400`: indican EABI5/hard-float; no bastan como contrato de un módulo propio. Gran parte del archivo son secciones de depuración, no RAM necesaria para cargar el ELF.

Los símbolos definidos incluyen `lua_main`, `luaopen_os`, `os_execute`, `nsh_main`, `system`, `exec`, `execv`, `posix_spawn`, `insmod`, `cmd_insmod`, `rmmod`, `cmd_rmmod`, `cmd_lsmod`, `dlopen`, `dlclose` e `iwasm_main`. Su presencia no demuestra que todos estén expuestos a una watchface o que un módulo arbitrario enlace.

Los literales de macros de depuración incluyen:

```text
CONFIG_ARCH_CHIP_GOLDFISH_ARM 1
CONFIG_ARCH_CORTEXA7 1
CONFIG_BUILD_FLAT 1
CONFIG_ELF 1
CONFIG_MODULE 1
CONFIG_LIBC_DLFCN 1
CONFIG_LIBC_EXECFUNCS 1
CONFIG_INTERPRETERS_LUA 1
CONFIG_INTERPRETERS_WAMR 1
CONFIG_INTERPRETERS_WAMR_AOT 1
CONFIG_INTERPRETERS_WAMR_VERSION "WAMR-04-15-2021"
```

Esto sustenta soporte compilado de Lua/ELF/módulos/WAMR y modo FLAT en **esta imagen del emulador**. No es una ejecución probada de C/WASM ni `os.execute` desde el runtime de watchfaces. En FLAT hay memoria compartida: un módulo/task C no tiene aislamiento de procesos. Aún faltan exports, entrypoint, relocations, toolchain, lifecycle y recuperación antes de hello C.

## Artefactos privados

`artifacts/package-review/` conserva el manifiesto ZIP, firmas/hashes de binarios críticos, comparación de los 94 archivos y reportes de inspección estática. `artifacts/emulator/` conserva help y errores de arranque. Estos artefactos locales no incluyen resultados de un reloj conectado.
