# TouchEvents: paquete, render, touch y reentrada

2026-10-03. **Validado en MiWatchEmulator v1.0 / guest Xiaomi Watch S3, no en M2315W1.** Pantalla configurada a 390×450. Sin DOOM, WAD ni payload C propio.

## Revisión del compiler

ZIP descargado por el usuario desde [EasyFace v4.23 original](https://github.com/m0tral/EasyFace/releases/tag/v4.23). Tamaño 15934243 bytes; SHA256 coincide con el digest publicado: `5b62773369c10c3402f369e8aa579f13393af359d0214c0d979464e5cc776cef`.

Seis entradas, 22963999 bytes expandidos. Se extrajeron únicamente Compiler.exe, DeviceInfo.db y EasyFace_en.exe a tools/local/easyface-v4.23-review. No se extrajo ni ejecutó su adb.exe/AdbWin*.dll; no se ejecutó el editor, MSI o APK.

- Compiler.exe: PE x86, ensamblado .NET Compiler 4.23.0.0, sin firma Authenticode. SHA256 `bfb8c3b6666b79de165884d832c69d46e5bbfa581c65c1e188cddfc4b9d6723a`.
- DeviceInfo.db: SHA256 `7fde4b233d75e36985f709e84ea4c164c494b02d109bcdb5f50f0ab76e6c3f76`.
- EasyFace_en.exe: PE x86/MFC, sin firma; solo inspección estática.

tools/inspect-managed.mjs leyó metadata y desensambló IL de 203 métodos usando ReflectionOnlyLoad de .NET Framework. Leyó también las dos dependencias embebidas como metadata, sin invocar métodos o atributos del compiler. No se descargó ni ejecutó un decompiler. Es inspección del compiler, no reverse engineering del firmware completo.

Hallazgos relevantes:

- MainBody exige cinco argumentos: `-b <fprj> <output-directory> <filename.face> <integer-id>`. El ID se parsea pero se descarta en este método; no confiar en él para el header final.
- MainBody busca adb.exe **junto al compiler**; si no existe, omite AdbBridge. Esa rama se confirmó después en stdout.
- AdbBridge usa comandos ADB sin serial explícito; puede borrar una instalación anterior, eliminar watchface_list.json y reiniciar. No se ejecutó ese bridge.
- SetWatchfaceId modifica el byte 5 a 10 y escribe nueve dígitos ASCII desde offset 40. Nuestro helper reproduce esos cambios solo sobre su propia copia del paquete; el .face original permanece intacto.

El checksum verifica identidad con la release, no ausencia de vulnerabilidades. No se auditó exhaustivamente el compiler ni todas sus dependencias. La ejecución posterior fue acotada al empaquetado local, sin ADB junto al ejecutable, sin admin y con salida/TEMP/TMP en el workspace. Eso no constituye un sandbox del ejecutable host.

## Empaquetado e instalación

Se verificaron los seis blobs originales de TouchEvents, revisión `5af6e14ea92830a394c88dc04f76ceef697a6ded`. El build original conservó Lua, fuente e imágenes sin cambios. Compiler anunció RedmiWatch4 / No Errors y «adb util is missing, skipping to upload into emulator».

.face: 52444 bytes, SHA256 `d5f16ec9a0d625dc63016e6aea8ae1a6839cf457988249c300f37ee5a444a8a9`. Las entradas app almacenan nombres como lua/main.lua; no el nombre escapado del widget XML. No se distribuye el paquete en Git.

Antes de escribir en el guest se comprobó que el nuevo ID 365799901 no existía. El helper pausó QEMU, copió su data image mutable de 134217728 bytes y comparó hashes; luego confirmó RUNNING. Es una copia del disco pausado, sin snapshot RAM ni comprobación completa de FAT. El paquete original del emulador también permanece intacto.

Se respaldó watchface_list.json y se instaló **solo** /data/app/watchface/market/365799901/resource.bin. Readback idéntico por SHA256. Se eliminó exclusivamente la caché watchface_list.json para provocar su regeneración; sin rm recursivo, sobrescritura de watchface stock o acceso a particiones crudas. Se reinició el guest por EmulatorController RESET; QEMU y ADB continuaron disponibles. La lista regenerada identifica TouchEvents.

## Resultados observados

| Prueba | Resultado | Evidencia local ignorada |
|---|---|---|
| Abrir desde selector stock | Gato y texto «touch events», 390×450 | screenshots/touch-original-launched.png, 19241 bytes |
| Fuente original | Funciona en lifecycle watchface; falló en CLI previo | Screenshot y miwear_lua_run del launcher; no causa interna determinada |
| Tap (60,90) | Label cambia a «release x:0, y:0» | screenshots/touch-tap-release.png |
| Arrastre (90,200)→(145,225) | Label cambia a «release x:7, y:3» | screenshots/touch-drag-release.png |
| Navegación stock | Notificaciones, control center y Ajustes accesibles | screenshots/touch-system-panel.png / touch-stock-settings.png |
| Cambiar a Storage | UI stock y log «close lua now», luego script Storage | screenshots/stock-face-reselected.png; host log 15:39:53 |
| Reset del guest | Storage activo; dos market watchfaces conservadas | screenshots/stock-after-persistence-reset.png |
| Reabrir sin reinstalar | TouchEvents renderiza y responde al tap otra vez | screenshots/touch-persistent-reopen-verified.png / touch-persistent-input-verified.png; log 15:43:33 |

PRESSED usa get_point; PRESSING y RELEASED usan get_vect. Los números release no son coordenadas absolutas. No se capturó todavía un frame con las coordenadas de PRESSED, ni se validó exhaustivamente GESTURE. Los inputs son MouseEvent del emulador, no dedos reales ni API de corona física. No hay métricas FPS/latencia/fugas.

Cambiar de watchface cierra el runtime Lua anterior según el log. Abrir un panel stock solo lo pausa; no equivale a descargarlo. El ejemplo no tiene botón propio de salida. No presentar esta ruta como UX final de DOOM.

## Reproducir

Con el emulador activo y ownership verificado, desde la raíz del repo:

```powershell
node tools/inspect-managed.mjs tools/local/easyface-v4.23-review/Compiler.exe
node tools/package-touch-events.mjs original
node tools/install-touch-emulator.mjs original
```

Build/install rechazan directorios o registros existentes para evitar sobrescribir experimentos. En este workspace **ya se hicieron**; no repetirlos sin revisar los resultados. La descarga/extracción del ZIP se verificó con PowerShell inline; no hay setup automático del compiler ni cambio de ExecutionPolicy.

La selección se hizo por UI stock y capturas sucesivas, sin APIs privadas ni direcciones absolutas. Si una watchface Lua no abre el selector con pulsación larga, usar Ajustes:

```powershell
# Desde home: panel → Ajustes → Watch faces → selector.
node tools/emulator-ui.mjs swipe 195 410 195 40
node tools/emulator-ui.mjs tap 365 300
node tools/emulator-ui.mjs tap 190 170
node tools/emulator-ui.mjs tap 195 400
```

Inspeccionar una captura antes de asumir la selección actual. Con Storage centrado, swipe (360,225)→(20,225) muestra TouchEvents y tap (235,225) lo selecciona. Para volver, desde TouchEvents centrado, swipe (90,225)→(375,225) muestra Storage. Iniciar ese gesto en el borde izquierdo puede activar Back en lugar de cambiar la selección. GoBack por teclado no tuvo efecto visible en home; no es un exit validado.

tools/emulator-ui.mjs permite snapshot de data y reset **del emulador**; tools/emulator-screenshot.mjs captura la pantalla por separado. No usar reset para sustituir una salida funcional. Para restaurar una copia de data, cerrar primero la instancia identificada y comprobar que no exista QEMU usando esa imagen; no copiar sobre un disco activo. No se automatizó ni se probó una restauración porque no fue necesaria.

## Límite y siguiente checkpoint

Persistencia del paquete y reentrada tras reset están demostradas en este guest. No sabemos el heap disponible, loader/ABI, privilegios o instalación de nuestra unidad RW4. Próxima meta: fijar el contrato ELF/exports/init/uninit/toolchain del emulador para un hello C mínimo. No se compiló ni cargó un módulo nativo.
