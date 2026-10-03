# Evidencia de ejecución del emulador

MiWatchEmulator v1.0, paquete y hashes en [la revisión](emulator-package-review.md). Resultados obtenidos durante la sesión iniciada el 2026-10-02. Este guest es S3; no demuestra compatibilidad M2315W1.

## Boot y transporte

Primer boot UTC 2026-10-03 02:49:17: launcher PID 23900, QEMU 21268, pantalla 390×450, NuttX 0.0.0 9aec7d0ff1 Dec 5 2024 07:11:08 arm miwear, NSH, adbd y telnetd. Terminó por petición del proceso padre, sin panic observado. No se determinó quién solicitó el cierre.

La segunda instancia QEMU PID 14408 permitió ADB por **emulator-5554**, servidor dedicado 5039. El NAT 127.0.0.1:2512 quedó offline. Antes de shell/upload/captura, los helpers cotejan puertos loopback 5554/5555/2512/8554, propietario y ruta del QEMU revisado. Filtro USB y mDNS deshabilitado; no se seleccionó hardware físico.

El servidor requiere -L tcp:localhost:5039; usar 127.0.0.1 en -L provocó «cannot start server on remote host». Los clientes sí usan -H 127.0.0.1 -P 5039.

QEMU usa Cortex-A15, máquina virt y -m 2048; config fuente decía 512 MB. El ELF contiene macros Goldfish Cortex-A7/FLAT. Estas cifras no son heap NuttX ni CPU/RAM del RW4. Sistema de solo lectura y copia mutable de data bajo emulator/local/run-state.

## Inventario de lectura

16 consultas capturadas: help, uname, version, ps, free, mount, df, ls /, ls /dev, ls /data, ls /proc, ls /bin, ls /data/app, ls /data/app/watchface, env, getprop. version devuelve command not found pese a status 0; no confundir llamada completada con éxito semántico.

Consulta posterior:

```text
uname -a
NuttX Xiaomi Watch S3 0.0.0 9aec7d0ff1 Dec 5 2024 07:11:08 arm miwear
```

getprop: Emulator-Vela/DEV, build.id 202412050648 y boot completo. release 12.0.0 es una propiedad del guest, no una versión Android/HyperOS del RW4.

| Lectura | Resultado |
|---|---|
| free: Umem | total 129704956, used 17998136, free 111706820 bytes (~106.5 MiB libres) |
| free: GImageCache | total 10485756, used 1071144, free 9414612 bytes; no sumar pools |
| df /data | bloques 4096, total 32256, usados 3551, libres 28705: 126 MiB/~112.1 MiB libres |
| mount | /data FAT, /tmp TMPFS, /proc, /bin BINFS y recursos/sistema ROMFS |
| /dev | fb0, input0, kbd0, utouch, goldfish_pipe, virtblk0/1, console |
| watchfaces market | Solo 365700764 antes y después de las pruebas |
| help | insmod/rmmod/lsmod/exec; builtins lua/iwasm/qjs/aiotjsc y demos |
| lsmod | Header sin módulos |
| help -v insmod | insmod <file-path> <module-name>; loader no invocado |
| help -v exec | exec <hex-address>; no launcher ELF por filename; no invocado |

help -v lua/iwasm no describe los builtins; su error no prueba ausencia. Lua CLI sí funciona. CONFIG_BUILD_FLAT no establece userspace aislado. Exports/ABI/entrypoints de módulos propios siguen pendientes.

## Lua y TouchEvents

CLI Lua 5.4: os.execute y package.loadlib tienen tipo function, sin invocación. package.preload.lvgl es nil, pero require('lvgl') funciona. No extrapolar estas consultas a una watchface o al RW4.

Seis archivos upstream verificados por hash. tools/try-touch-events.mjs subió los tres Lua y cat.png a /tmp/rw4-doom-touch-20261003. Wrapper con package.path/SCRIPT_PATH; original intacto. Falla en main.lua:43, lvgl.Font("misansw regular",32): **cannot create font**. Causa pendiente.

Copia separada omitiendo únicamente esa línea: /tmp/rw4-doom-touch-default-font-20261003. Termina sin excepción reportada. No se generó resource.bin, instaló watchface, modificó lista/caché ni reinició el guest.

tools/emulator-screenshot.mjs obtuvo por gRPC un PNG **390×450, 10323 bytes** siguiendo el protocolo [R34](research.md#fuentes-consultadas). La captura muestra almacenamiento stock, **no TouchEvents**. No se envió touch. ps posterior no tiene tarea Lua persistente; market no cambió. Umem libre posterior 111628164 bytes: no es medición de fuga ni de DOOM.

Logs ignorados: artifacts/emulator/adb/, artifacts/emulator/lua-touch/, artifacts/emulator/screenshots/after-lua-default-font.png. Fuentes/copias del PC conservadas; /tmp es volátil.

## Reproducibilidad pendiente

collect fue actualizado para esperar el puente 5555 y emulator-5554. Esa recaptura automática actualizada no se volvió a probar desde un boot nuevo; conexión, inventario y captura se validaron por separado. No reiniciar para ocultar errores ni repetir inventarios sin necesidad. Ver [HANDOFF](HANDOFF.md).

## Continuación 2026-10-03: introspección de API

ADB seguía online. `node tools/emulator-adb.mjs lua-api` enumera tablas/metatablas existentes con límite de 120 claves por tabla; no crea widgets ni invoca UI. Artefacto: artifacts/emulator/adb/lua-api-module-entries.json.

El módulo expone Timer, disp.get_default/get_next/get_scr_act/get_scr_prev/load_scr y _root userdata. Las clases también se resuelven por metatabla; pairs no basta para descartar Object/Label. Logs anuncian apertura de activity, screen, navigator, miwear, dataman, topic y vibrator; no se invocaron sus APIs. Los nombres no demuestran firmas, threading, permisos ni lifecycle.

TouchEvents crea objetos y termina con entry(); no llama explícitamente a disp.load_scr ni mantiene un event loop propio. Es una inferencia que CLI y watchface inicializan/activan/liberan la UI de forma distinta. Falta demostrar el mecanismo correcto; no llamar load_scr con argumentos supuestos ni mantener Lua mediante un bucle infinito. No se repitió el sample ni se enviaron eventos.
