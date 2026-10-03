# Retomar el proyecto

Estado activo al 2026-10-03. Resultado actual: [patrón RGB565 generado por C dentro de nuestra página Lua/LVGL](native-frame-lvgl-emulator.md). Solo snapshot por START; no Doom ni hardware físico.

Última sesión: C añade /dev/rw4frame virtual, stream con EOF y cursor/fase por descriptor. Lua lee89612bytes, valida cabecera12 + 320×140 RGB565, copia a /tmp/rw4-native-pattern-<seq>.bin y crea Image en page x35y205. C no llama LVGL ni framebuffer global; no hay punteros compartidos C→widget. Dos fases CLI exactas por readback; lectores independientes, busy unload y rechazo de apertura en pausa probados. UI14gestos, dos START/EXIT y tercer START→Storage sin EXIT pasan con patrón visible. Fuente/captura revisadas: 44800píxeles, tolerancia2niveles/canal en captura; bytes fuente exactos. La UI no actualiza el snapshot al tocar. No FPS/latencia/memoria pico medidos.

Incidente de esta sesión: primer stream con lector único/estado global falló al probar otro lector y os.execute con handle abierto; se observó panic y reinicio guest. Artefactos retenidos, causa exacta del panic no aislada. Primer ajuste per-descriptor aún fallaba la expectativa del shell; versión final permite aperturas múltiples y guarda cursor/fase en file.f_priv. DWARF exacto: file32bytes, f_priv20; nunca dereferenciar cookie numérico. Fuente NuttX de dup reabre drivers, referencia para interpretar herencia al crear NSH. Código final verificado, candidatos anteriores fuera de pins. ABI/símbolos solo guest exacto, FLAT no sandbox.

Final: Storage365700764 seleccionada, Lua cerrado, módulo/ambos nodos y temporales propios ausentes. UIProbe365799903 queda almacenada con imagen y finalizador. Reproducir exige preparar ELF después de reset/cleanup. C3580bytes SHA69b1b6a607aec62e6a7def95dcf9e53933cc0f3dbd7bb7b7732863a661eea88e. Watchface19024bytes SHA8a47c395a0fafb62364d3b2a0dfce74e0b5a83b89b3043da434e1fb34446903f. Evidencia native-frame-1791066494323, native-frame-1791067206109, native-frame-ui, ui-probe-exercise-1791066790197. CLI normal/error regresión pasan con C nuevo. Capturas/logs ignorados. Esperar device después del reset de install; guard rechazó una consulta transitoria offline. Revisar cada pantalla en Settings.

**Siguiente meta única:** actualización repetida de frames en LVGL con recursos acotados, pausa y salida. Investigar invalidación/cache o superficie en memoria del guest antes de convertir snapshots en un bucle. Un archivo/nombre nuevo por frame no es una solución aceptada para Doom. Sin Doom ni hardware físico en ese checkpoint.

Lifecycle conservado: guard __gc global, handles close, pausa/resume, EXIT y cierre al cambiar watchface. C/nodos retirados y snapshots propios eliminados. /dev/rw4bridge sigue siendo protocolo32bytes SIN EOF; nunca cat/read-all. Crashes/panic/kill forzado no garantizan finalizador. Persistencia C, input mantenido, timers monotónicos y WAD pendientes.

- Nunca se conectó el reloj físico M2315W1. Gate físico cerrado; sin flash, exploits, mods APK ni DOOM/WAD. Hello C propio validado únicamente en el emulador.
- Guest Xiaomi Watch S3 / NuttX 0.0.0, revisión 9aec7d0ff1; pantalla configurada 390×450. No emulación exacta RW4/BES.
- ADB shell funciona por emulator-5554, servidor dedicado 5039. NAT 2512 está offline. Helpers comprueban puertos loopback/PID/ruta de QEMU y excluyen USB.
- Launcher actual fue iniciado por el usuario (PID inicial 27964). QEMU sobrevivió a resets por gRPC, incluido el baseline display; comprobar ownership vigente antes de actuar. La terminal del usuario se mantiene abierta.
- TouchEvents original empaquetado sin modificar sus seis fuentes/assets; compiler EasyFace original v4.23 revisado por hash y metadata/IL. Se ejecutó sin su ADB: transferencia automática omitida.
- Instalación propia 365799901 en /data/app/watchface/market. Backup de data image pausado y caché previo, readback SHA256 idéntico. Sin sobrescribir stock.
- En TouchEvents original: render, touch RELEASED, navegación stock, cierre Lua al seleccionar Storage y reentrada tras reset sin reinstalar demostrados. Ese ejemplo no tiene botón de salida propio. UIProbe posterior sí valida coordenadas absolutas y EXIT; gestos exhaustivos y fugas aún pendientes.
- Última watchface activa: Storage365700764. TouchEvents365799901 y UIProbe365799903 siguen almacenados. GoBack por teclado no fue un exit validado; swipe horizontal desde borde izquierdo sí volvió de Sound a Settings.
- Probe anterior de padres LVGL cerró QEMU con Bad ram pointer. Retirado, logs archivados; no repetir. No llama load_scr/exec-direcciones para explorar.
- Repositorio Git guarda documentación y herramientas propias. ZIPs, firmware, compiler, assets y logs permanecen ignorados. No publicar esos archivos.

## Próxima meta

Garantizar limpieza de C cuando se cierre la watchface sin pulsar EXIT. Después quedarán render C en la página propia, input mantenido, timers monotónicos, FS/WAD y DOOM. No compilar todavía DOOM ni tocar hardware físico.

## Experimentos anteriores

UIProbe original, solo Lua: experiments/lua-ui/main.lua, launcher START/página/EXIT. Desactivar eventos/gestos no bastó (commit5ed95ec reproduce widgets stock); también se desactivó SCROLL_CHAIN_HOR/VER en objetos propios durante juego. Drags centrales4direcciones y hold no mueven home. Borde inferior aún abre panel; pageOnPause/pageOnResume confirmados con callbacks propios. Tap50,45 en panel no llegó a página. Dos EXIT/reentrada, luego Storage y Lua cerrado, sin reboot para salir. Lua5.4 y type(package.loadlib)=function dentro de watchface; en esa prueba loadlib NO invocado. No native worker/timers/canvas C. El puente posterior está descrito arriba.

Build final12168bytes SHA4a61184a1e46aeac951d5b74ad5c62f46120142cb58263acbfca79482fe43fc5; instalado3988c7741e4560bda4eadea22942596ea39999cc2fb7efa0780447860915400e. Logs ui-probe-exercise-1791058256861. tools/package-ui-probe.mjs y install-ui-probe-emulator.mjs; update verifica ID propio inactivo/recurso anterior, copia y readback antes de reset. tools/exercise-ui-probe.mjs exige página propia y marcadores PNG, pero capturas/logs requieren revisión.

Incidente PC: navegación automática tras reset activó Silent sin cargar UIProbe; restaurado OFF con captura y log set mute mode0. No repetir navegación multi-page sin capturas por paso; no asumir estado/tiempo de transición. Recursos/backup en artifacts/emulator/watchface-365799903 y emulator/local/backups. Los bordes globales requieren pausa del futuro C, no prometer exclusividad total.

Touch C: experiments/native-touch/observer.c abrió /dev/input0 read-only/nonblocking sin ioctl/grab; 36 muestras absolutas, tap60,90 y drag145,225. TouchEvents y panel stock respondieron durante la lectura; close=0, rmmod y tap posterior sin reboot. Logs artifacts/emulator/native-touch-1791048828975. Reset previo únicamente para baseline (UI estaba OFF). C imprime logs, no crea widgets. Flags DOWN repetidos en drag sintético: conservar estado. Build/run en tools/build-touch.mjs y run-touch-emulator.mjs; SHA ELF57a649bfcac60d98ed1120197d69ca19a2c26a98ad2c59ffd820eb9b055b8d54.

Display: consultas /dev/fb0 desde C confirman 390×450 RGB565, stride780, virtual390×900, memoria702000. Patrón temporal respalda ambos buffers en RAM, usa FBIOPAN_DISPLAY, restaura/free/close y luego rmmod. Capturas idénticas antes/después; en prueba activa touch cambia label y panel stock abre sin reboot. Al terminar esa prueba quedó TouchEvents; tras la sesión UIProbe quedó Storage.

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
node tools/build-lua-bridge.mjs
node tools/package-ui-probe.mjs bridge
# Si ya existe UIProbe: seleccionar primero Storage antes de actualizar.
node tools/install-ui-probe-emulator.mjs update
# Después de boot/reset, preparar el payload temporal:
node tools/stage-lua-bridge.mjs stage
# Pruebas de cierre por consola, estando UIProbe inactiva:
node tools/test-lua-bridge-close.mjs normal
node tools/test-lua-bridge-close.mjs error
node tools/test-native-frame.mjs
# Seleccionar UIProbe y START antes de ejercer gestos:
node tools/exercise-ui-probe.mjs bridge
node tools/lua-bridge-state.mjs
# Tras EXIT y selección de Storage:
node tools/stage-lua-bridge.mjs cleanup
```

Si el emulador está cerrado, el usuario normal puede arrancarlo con tools/emulator-host.mjs start desde su PowerShell y dejarla abierta. No abrir una segunda instancia sobre el mismo disco. Antes de descartar un marker antiguo, comprobar PID/QEMU y salida registrada.

Build/install TouchEvents ya realizados: no repetir scripts que rechazan directorios existentes. Restaurar data exige cerrar y verificar que QEMU dejó de usar la imagen; no se necesitó ni se probó restauración. Backups bajo emulator/local/backups/, logs/capturas bajo artifacts/emulator/.

La terminal restringida no accede a GitHub para descargas; el usuario descargó ambos ZIP originales. Browser/conector GitHub permiten investigación. ExecutionPolicy bloquea .ps1; se usaron herramientas Node/PowerShell inline sin cambiarla.

En futuras pausas, guardar únicamente una nota breve con el siguiente paso. No iniciar verificaciones ni ampliar documentación por motivo de pausa.
