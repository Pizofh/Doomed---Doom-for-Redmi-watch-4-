# Retomar el proyecto

Estado activo al 2026-10-03. Resultado actual: [touch desde C y UI stock concurrente validados en emulador](native-touch-emulator.md).

- Nunca se conectó el reloj físico M2315W1. Gate físico cerrado; sin flash, exploits, mods APK ni DOOM/WAD. Hello C propio validado únicamente en el emulador.
- Guest Xiaomi Watch S3 / NuttX 0.0.0, revisión 9aec7d0ff1; pantalla configurada 390×450. No emulación exacta RW4/BES.
- ADB shell funciona por emulator-5554, servidor dedicado 5039. NAT 2512 está offline. Helpers comprueban puertos loopback/PID/ruta de QEMU y excluyen USB.
- Launcher actual fue iniciado por el usuario (PID inicial 27964). QEMU sobrevivió a resets por gRPC, incluido el baseline display; comprobar ownership vigente antes de actuar. La terminal del usuario se mantiene abierta.
- TouchEvents original empaquetado sin modificar sus seis fuentes/assets; compiler EasyFace original v4.23 revisado por hash y metadata/IL. Se ejecutó sin su ADB: transferencia automática omitida.
- Instalación propia 365799901 en /data/app/watchface/market. Backup de data image pausado y caché previo, readback SHA256 idéntico. Sin sobrescribir stock.
- Render, touch RELEASED, navegación stock, cierre Lua al seleccionar Storage y reentrada tras reset sin reinstalar demostrados. Coordenadas absolutas PRESSED, gestos exhaustivos, botón de salida propio y fugas aún pendientes.
- Última watchface activa: TouchEvents 365799901. Cambiar a Storage mediante Ajustes → Watch faces → selector; procedimiento documentado. GoBack por teclado no fue un exit validado.
- Probe anterior de padres LVGL cerró QEMU con Bad ram pointer. Retirado, logs archivados; no repetir. No llama load_scr/exec-direcciones para explorar.
- Repositorio Git guarda documentación y herramientas propias. ZIPs, firmware, compiler, assets y logs permanecen ignorados. No publicar esos archivos.

## Próxima meta

Crear una pantalla interactiva propia que se cierre limpiamente en el contexto correcto de UI. Hello C, patrón framebuffer y lector touch independiente validados en el emulador; FLAT no es sandbox. No compilar DOOM todavía: UI ownership, timing monotónico y FS para WAD pendientes.

Touch C: experiments/native-touch/observer.c abrió /dev/input0 read-only/nonblocking sin ioctl/grab; 36 muestras absolutas, tap60,90 y drag145,225. TouchEvents y panel stock respondieron durante la lectura; close=0, rmmod y tap posterior sin reboot. Logs artifacts/emulator/native-touch-1791048828975. Reset previo únicamente para baseline (UI estaba OFF). C imprime logs, no crea widgets. Flags DOWN repetidos en drag sintético: conservar estado. Build/run en tools/build-touch.mjs y run-touch-emulator.mjs; SHA ELF57a649bfcac60d98ed1120197d69ca19a2c26a98ad2c59ffd820eb9b055b8d54.

Display: consultas /dev/fb0 desde C confirman 390×450 RGB565, stride780, virtual390×900, memoria702000. Patrón temporal respalda ambos buffers en RAM, usa FBIOPAN_DISPLAY, restaura/free/close y luego rmmod. Capturas idénticas antes/después; en prueba activa touch cambia label y panel stock abre sin reboot. Última UI: TouchEvents tras cerrar el panel.

Primer intento de input fue inconcluso: el guest estaba OFF desde 15:48:36 por inactividad, antes del patrón. Se reseteó solo el guest para baseline; el segundo patrón devolvió input sin otro reset. Key Power no despertó y no quedó como comando soportado. LVGL9/extension, CONFIG_LV_USE_OS=0, libuv: no llamar widgets desde NSH sin resolver contexto. No afirmar exclusividad del framebuffer ni FPS/RAM pico.

Avance: [hello C](hello-native-emulator.md). Arm 14.3 ZIP/checksum revisados, extracción local; build reproducible en este PC mediante tools/build-hello.mjs. Guest compilado con GCC 11.3.1, Cortex-A7/Thumb/hard-float. Import puts falla con error 2; enlace al símbolo del ELF exacto funciona. tools/run-hello-emulator.mjs bound carga desde /tmp, observa mensaje/lsmod, rmmod y elimina archivo. Dos ciclos, shell y captura TouchEvents posteriores correctos. Sin persistencia nativa, medición de RAM pico ni compatibilidad física demostradas.

Nunca usar direcciones de otros firmwares S3/Band10Pro de MiWatchNativeApps. El hello deriva puts del ELF guest identificado por SHA256 y conserva su bit Thumb; build/carga rechazan otra imagen. OpenVela actual difiere del guest; NuttX 12.3 es referencia histórica. Display con callbacks/LVGL necesitará uninitializer real antes de descarga.

## Comandos útiles

Desde C:\Users\steve\Documents\Devs\Doomed\redmi-watch4-doom:

```powershell
node tools/emulator-adb.mjs connect
node tools/emulator-screenshot.mjs current
node tools/build-hello.mjs
node tools/run-hello-emulator.mjs bound
node tools/build-display.mjs pattern
node tools/run-display-emulator.mjs pattern
node tools/build-touch.mjs
node tools/run-touch-emulator.mjs
```

Si el emulador está cerrado, el usuario normal puede arrancarlo con tools/emulator-host.mjs start desde su PowerShell y dejarla abierta. No abrir una segunda instancia sobre el mismo disco. Antes de descartar un marker antiguo, comprobar PID/QEMU y salida registrada.

Build/install TouchEvents ya realizados: no repetir scripts que rechazan directorios existentes. Restaurar data exige cerrar y verificar que QEMU dejó de usar la imagen; no se necesitó ni se probó restauración. Backups bajo emulator/local/backups/, logs/capturas bajo artifacts/emulator/.

La terminal restringida no accede a GitHub para descargas; el usuario descargó ambos ZIP originales. Browser/conector GitHub permiten investigación. ExecutionPolicy bloquea .ps1; se usaron herramientas Node/PowerShell inline sin cambiarla.

En futuras pausas, guardar únicamente una nota breve con el siguiente paso. No iniciar verificaciones ni ampliar documentación por motivo de pausa.
