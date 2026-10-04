# Retomar el proyecto

**Actual R62,2026-10-04:** [input consumido por worker C](native-worker-input-emulator.md) completado. UI28 produce máscaras mediante ring SPSC32/epochs; workers439/791 tradujeron22 key edges y produjeron frames.38 snapshots/cuatro imágenes completas pasan; HOLD TEST cancela con ratón down, overflow32 deja neutral y panel desde **y440** pausa. Regreso exige RESUME/contacto nuevo. STOP cooperativo NSH con FIRE mantenido en worker885 pasa, sin host-unload. Cierre968→Storage conserva código/copias hasta reentrada UI, que recoge todo. Final Storage365700764, UIProbe365799903 instalada modo **winput**, módulos/nodos/copias/ELF propios retirados; PIDs104/439/791/885/968 ausentes. No Doom, WAD ni hardware. Siguiente: licencia/procedencia y lectura de doom1.wad desde C.

Pins R62: C LF28175b7cc88b126ad99fe9f3a29e837787af108e6ee044cf6cee6fb142ee675a; ELF8436bytes SHA54facb91f2d27c3e1172bba174c3d2ac85a07343aa0ca2574f621a13e362f00c; entry0xf1d/79 ABS32/mismos10 imports/BSS179620. Lua090b7618d7bbca7150af4ba50aacb9443c19ce489ca48c927fda629af4c0fdb3; paquete20972 SHA3da72d93acea9b2e5171aecaef42560bfd1eb4f59bbc1548326f67230836ae8f. Snapshot128 añade12 words input; no cat/read-all. Uninit exige referencias0, requested/applied/queued0 y PID ausente. GC no LVGL/unload; helper host exige reentrada para limpiar. FLAT no sandbox; sin open/unload general, SMP, crash, límite180s o foco stock con dedo aún apoyado probados.

Artefactos R62: worker-input-test-1791131669210, worker-input-held-stop-1791131823074, worker-input-close-1791132028553, worker-input-reentry-1791132117672, worker-input-final-1791132187928. Umem usado+160928/maxused+96736, GImageCache usado+603664, causa no aislada/no leak claim. Primer runner1791131537341 esperaba panel desde y410 dentro de MOVE/PRESS_LOCK: el gesto se canceló y C siguió sano; menú/EXIT retiró worker104 sin reset. Helper corregido a y440, C/Lua intactos. Rescan volvió a Neat antes de C; no asumir Storage tras update. Un reset de instalación previo a C, ninguno para salir.

Repro: build-worker-input.mjs; package-ui-probe.mjs winput; UIProbe inactiva/módulos ausentes antes de install-ui-probe-emulator.mjs update. Confirmar boot/UI responsive y worker-input-emulator.mjs stage. Abrir UIProbe con preview/Ready revisados SIN START; test-worker-input-emulator.mjs. Desde launcher aún staged, test-worker-input-stop.mjs. Para módulo retenido, volver a UIProbe; después Storage y worker-input-emulator.mjs cleanup. No repetir ensayos pasados salvo cambio/fallo. Guards comprueban imagen/QEMU/ADB loopback y fuente/ELF remoto/ID/píxeles; no USB.

Lo siguiente es **histórico R61**, no el modo instalado actual:

Estado activo al **2026-10-04** (Bogotá). Resultado actual **R61: [frames desde worker C](native-worker-frame-emulator.md)**. Binario final:12 capturas de44800 píxeles, dos lectores simultáneos/tercero rechazado, dos START/EXIT y panel pausa/resume pasan. Workers107/277 en UI28 tras init NSH; otro worker374 termina al cambiar a Storage sin EXIT y reentrada recoge caches/módulo/copias en UI. Ensayo inicial también pasó con402/562/660; worker242 de un helper fallido alcanzó límite natural solo en ese primer candidato. Sin reboot para salir. **Final Storage365700764, UIProbe365799903 almacenada modo wframe; PIDs107/277/374 y módulo/nodos/copias/ELF propio ausentes. No Doom, WAD ni hardware.** Siguiente: controles mantenidos Lua→worker con liberación al pausar/cerrar.

R61 separa payload y Lua en experiments/native-worker-frame. Dos slots C FREE/WRITING/READY/READING; no sobrescribir mientras el lector posee bytes. Snapshot80 incluye produced/readers/blocked. Stream89612bytes con EOF por descriptor; Lua cierra antes de os.execute, copia a dos nombres tmpfs y llama cache-drop desde UI con owner comprobado en C. Finalizador no toca LVGL ni descarga; reentrada invalida caches en UI y recoge código retirado. Helper host rechaza unload de módulo R61 retenido. FLAT compartido, no sandbox; concurrencia arbitraria/SMP/crash no validados.

Pins R61 finales: ELF5740bytes SHAd6b2c68d6f74b536f8cac4086f38ca2636f9fd7e8011dbd83ebede88596f38fc; C normalizado LF37e8a66231d9b38d6aac2bc9b2b1ff6282a5fadbfd6f0b02ac771eaa97dd6fa0; BSS179312bytes. Paquete15640bytes SHA926116d3a58dad9fdfee1e6355e74c6e6985ce84cd0037215b0f13474adafa8a. Fuente/runtime/pins completos en el documento R61. Artefactos finales worker-frame-test-1791129002565, wframe-atomic-close-1791129131313, wframe-atomic-reentry-1791129189170 y wframe-atomic-final-1791129242309. Umem usado+180640 y maxused+953112 en dos muestras; no causa aislada, leak claim ni presupuesto físico. Metadatos sequence/cycle ahora atómicos: revisión corrigió carrera UI write/NSH read antes del ensayo final. Un reset adicional de guest limpio precedió ese ensayo por SCREEN_STATE_OFF, jamás para salir de C.

Fallos R61 preservados: ELF tmp desapareció tras staging cercano a reset (causa no aislada); parser Lua19/20 words falló antes de worker; resume asíncrono dio falso fallo; helper trató EAGAIN como error. Corregidos preflight remoto, parser20, polling de estado VM y retry acotado con handles cerrados. Update inicial ejercitó reparación del derivado añadida en R60. Nuevo refresh con backup/readback pasó sin reset, solo UIProbe inactiva y módulos ausentes. Stage **después de boot completo/UI responsive**, no del ack de reset. No repetir tests ya pasados salvo cambio o fallo pendiente.

Histórico R60: [START/EXIT con worker C](native-launcher-emulator.md). Sus pins/artefactos y limitaciones se mantienen como evidencia anterior; no describen el modo actualmente instalado.

Histórico R54: op6 invalida cache del slot0/1 y avanza fase; op7 invalida ambos después de borrar Image durante EXIT. Imports lv_image_cache_drop y lv_image_header_cache_drop ligados al guest exacto. **Op6/op7 solo desde nuestra watchface en contexto UI; nunca CLI/NSH, worker ni uninit.** file_write llama síncronamente al driver; no se midió thread ID. Un Timer Lua por VM, periodo200 ms, máximo300 frames por START, pausa/resume/EXIT; timer __gc compilado revisado. Slots /tmp/rw4-loop-frame-0.bin y -1.bin,89612bytes cada uno. Imagen x35y205 320×140; no punteros de módulo retenidos por LVGL ni framebuffer global. Guard marca closing antes de descargar; callbacks comprueban is_running. Finalizador propio no llama LVGL. Reproducción del checkpoint histórico requiere `package-ui-probe.mjs loop`, no bridge; `test-frame-loop-emulator.mjs` comienza desde launcher SIN START previo.

Evidencia: frame-loop-1791075123314,18 observaciones y ambas fases verificadas sobre44800píxeles/captura con tolerancia2. Panel state seq45 estable, límite300 seq305 estable. ~4,92 actualizaciones de fuente/s, NO FPS del motor. Lua post-GC72,405KiB desde frame50 hasta300 y reentrada; GImageCache usado1.900.024 constante tras panel. Umem usado muestreado estable con variación; maxused23.529.596→23.663.676 aumentó134080bytes sin causa aislada. No pico acotado ni fugas prolongadas descartadas. Regresión CLI stream/busy/pausa y cierre normal/error pasan con C nuevo.

Histórico R53: primer stream con lector único/estado global falló al probar otro lector y os.execute con handle abierto; se observó panic y reinicio guest. Artefactos retenidos, causa exacta del panic no aislada. Primer ajuste per-descriptor aún fallaba la expectativa del shell; versión final permite aperturas múltiples y guarda cursor/fase en file.f_priv. DWARF exacto: file32bytes, f_priv20; nunca dereferenciar cookie numérico. Fuente NuttX de dup reabre drivers, referencia para interpretar herencia al crear NSH. Candidatos fallidos fuera de pins. ABI/símbolos solo guest exacto, FLAT no sandbox.

Final R54: Storage365700764, Lua cerrado, módulo/ambos nodos y temporales propios ausentes; /tmp solo temporary.db. UIProbe365799903 permanece instalada en modo loop. Preparar ELF después de reset/cleanup. C3992bytes SHA f345f4c2e2ec7a6811dad0f66e077dc65b397271aa8291da4b1fdd2f1851a0b6; source LF e04c6d1ad8fa4e680113f71e4fb0a8c4246884dc98e7a4026e09ebb313406a27. Watchface21928bytes SHA f1b26fc16722eed1c9aa8b2c3bbab7a97559c7710a177ea5c65e5de7f9ab84d1. Cierre normal sin EXIT en frame-loop-close; regressiones native-frame-1791074808268 y lua-bridge-close-{normal-1791074813034,error-1791074817541}. Commit implementación71836d9. Capturas/logs ignorados. Revisar cada pantalla en Settings; no navegación ciega.

**Checkpoint anterior R55:** UIProbe365799903 instalada en modo controls, no loop. C5212bytes SHA ec7b6d5d1eab951a27423607a82ef8801778c9ccc6dfd515a2c50a4891e0a844; source LF40a18e07975dd0c57b898e37a08c1ae9eddfc6cdbdddfbf97a6412a3de208078. Watchface24364bytes SHA224900da6086fe578d8dafd42b83feda768bbe24c11226d51d36b7e8d1e11597. Paquete/control/contrato en native-controls-emulator.md. Un control anterior cancelaba FIRE al perder foco: corregido con contact==kind; intento fallido ui-keys-1791079130203, final ui-keys-1791079378297 pasa26 snapshots. HOLD TEST pausa con contacto mantenido, no prueba foco stock mantenido. Panel seq183 estable y regreso pausado; RESUME seq193 neutral. Dos EXIT y tercer START→Storage sin EXIT limpian; final Storage, C/nodos/temporales propios ausentes. Artefactos controls-system-panel-close. Cola CLI, stream y cierre normal/error con FIRE mantenido pasan. Commit implementación adbf567.

**Checkpoint anterior R56:** módulo separado experiments/native-time/time-probe.c; bridge R55 intacto. ABI exacto timespec16,tv_sec int64,tv_nsec int32 offset8; clock_gettime1 usa contador, no hora calendario. Imports clock_gettime0x606b65,clock_nanosleep0x656609,nxsched_gettid0x606999,printf0xfa2d25. Time ELF2228bytes SHA4cceedf220a4df9133b89fc8f29db45a6cf9d22fe54efe31b30d1810b934012d,source LF1380bc88db44387cd5517a7ae7c5fca5429b7182810fdb4a36ed1e6eeab95bcd. inspect-time/build-time/run-time-emulator.mjs. Final native-time-1791081427770 pasa257 lecturas/19 waits; ps identifica mismo PID sh -c insmod Waiting Signal antes y después de captura panel; píxeles Storage idénticos al terminar. C/ELF retirados sin reboot para salir. Ensayos fallidos de helpers/screen OFF documentados; reset único del guest limpio para baseline. Helper ahora preflight valida UI activa, no se fía de captura congelada. Normal+AOD pueden tener in_use1; exigir type1 Storage. UIProbe almacenada sigue modo controls. Esperas1ms finales5,3–15ms; no prometer precisión1ms ni dormir desde UI. Sin prueba de interrupciones ni mutación de hora.

**Checkpoint anterior R57:** experiments/native-fs/fs-probe.c, ELF3680 bytes SHA872950b90470b8b6a3f6d56087dcf4bfcfc11cfbdccbc15750030bdd8175a3fa; source LFfde5747ed5edb6c944d9d26df0c539588c5495a8954108168ba8c7a49071337c. ABI off_t signed64/size_t32/O_RDONLY1,35 ABS32 y6 imports contrastados. inspect-fs/build-fs/run-fs-emulator.mjs. Primer runtime native-fs-1791082444827 pasa2049 chunks,41 ventanas y4 errores, SET/CUR/END, seek2^32+7 sin leer allí, posiciones independientes/reopen. Fixture SHA a2db28e8d2e36e24f7b2d04e31bfbce38659094951bafed5834f80cfbebaa65f intacto; module rw4fs y dos tmp propios retirados sin reboot. No UI activa ensayada en R57, no /data/persistencia/WAD/stdio. Umem used+224/maxused+1014848 en dos muestras, causa no aislada/no leak claim. UIProbe almacenada controls/Storage previamente activo. Ver native-fs-emulator.md.

**Checkpoint anterior R58:** experiments/native-stdio/stdio-probe.c; FILE opaco, long32 para fseek/ftell, size_t32, buffer128. ELF4668 bytes SHAe78421f6950558a66c51bd4d05aafc4e78c7915bc5762780c71ed7afc504606b, source LFb873aa0cdb429aa0ca867a42236141599b81b53cb9a07a930c9577d33736b62e; entry0x605,51 ABS32,10 imports permitidos. inspect-stdio/build-stdio/run-stdio-emulator.mjs. Primer runtime native-stdio-1791083260165 pasa; EOF1 tras fseek0 aunque reread13 funciona, clearerr poneEOF0/error0/position13. Longitud1048613 restaura posición13 buffered y lee19;41 ventanas, size4 retorna9 elementos de37bytes, size3 retorna13, erroresENOENT/EINVAL, streams790/5 y3reopen. Fixture mismo SHA R57 intacto; rw4stdio y tmp propios retirados sin reboot. No UI activa, WAD ni /data en este ensayo. Umem used+224/maxused+1720, nused/nfree iguales, causa no aislada/no leak claim. Fuentes doomgeneric d_main/d_loop muestran TryRunTics con I_Sleep: no llamarlo desde Timer UI. Ver native-stdio-emulator.md.

**Checkpoint anterior R59:** experiments/native-task/task-probe.c, signed32 pthread_t, attrNULL, trampoline guest permite retornar worker, timespec16 y module_info16. Atomics32 release/acquire con DMB, BSS36. ELF3288 bytes SHA0a6065fbb3588716ce2093285db69cb2b794d84fab34b8c977ad8bca0639a6f3; source LFb69f308bb56cabd4fba03d4634dc1f5b605d3dacfd57c74b44fc9a3d822d5fb6. inspect-task/build-task/run-task-emulator.mjs. Final native-task-1791084264858 pasa: owner54, workers55/75/82, pasos38/3/6, stop/natural/stop, join61/124/47ms, cookies34570001/12/21. Busy uninit -16 probado con llamada directa, no rmmod concurrente. Ps pthread55 Waiting Signal antes/después panel, stack4072 used592 dos muestras; no pico ni budget Doom. Final PIDs ausentes/unload/tmp retirados, Storage pixels iguales, sin reboot para salir. Preflight1791084176550 screen OFF antes de push/C; un reset de guest limpio con backup, registrotask-baseline-reset.json. Helper pthread minúscula corregido antes de payload. No worker post-init, UI create/join, fallo join, kill, WAD o RW4 probados.

**Siguiente meta única:** mostrar en LVGL un frame RGB565 producido por el worker C, con buffers/cleanup seguros. Input concurrente y WAD legal pendientes; gate físico cerrado.

Implementación R56 guardada en commit3d2660a; build/run/ABI y documentación en native-time-emulator.md. Reproducción final del runner mueve la copia tmpfs después del preflight activo; cambio de orden sin cambio al ELF probado.

Implementación R57 guardada en commit0f62e6e. Reproducción con inspect-fs/build-fs/run-fs-emulator.mjs; source/ELF fijados y probados, salida passed=true. No repetir runtime salvo cambios/fallos pendientes. Stdio completado después en R58.

Implementación R58 guardada en commitbe75f7c. Reproducción con inspect-stdio/build-stdio/run-stdio-emulator.mjs, resultado passed=true con seekClearsEof=false documentado. Lifecycle desde NSH completado después en R59; launcher pendiente. No repetir pruebas aprobadas sin cambios/fallos que lo justifiquen.

Implementación R59 guardada en commitf52ac98. Reproducción inspect-task/build-task/run-task-emulator.mjs; runtime pasa tres ciclos y panel activo. Después se reforzó el assertion de retorno de píxeles, respaldado por el resultado restoredPixels=true existente, sin repetir C. Source/ELF probados intactos. Siguiente START/EXIT con worker desde launcher, no Doom/WAD ni hardware.

Lifecycle conservado: guard __gc global, handles close, pausa/resume, EXIT y cierre al cambiar watchface. C/nodos retirados y archivos propios eliminados. /dev/rw4bridge: read32 o64 snapshot SIN EOF; read8 consume una tecla y devuelve0 si cola vacía. Nunca cat/read-all; no competir con consumidor UI. Crashes/panic/kill forzado no garantizan finalizador. Reloj monotónico C probado por separado; todavía no implementa DG_GetTicksMs/DG_SleepMs ni scheduling del motor. Persistencia C y WAD pendientes. Ergonomía y foco stock mantenido no demostrados.

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

## R60: reproducir

Checkpoint histórico. Para el modo actualmente almacenado usar R61:

```powershell
node tools/build-worker-frame.mjs
node tools/package-ui-probe.mjs wframe
# Storage activa y módulos propios ausentes antes de actualizar.
node tools/install-ui-probe-emulator.mjs update
# Esperar boot completo y comprobar UI responsive antes de stage.
node tools/worker-frame-emulator.mjs stage
# Abrir UIProbe y revisar Ready, SIN START previo.
node tools/test-worker-frame-emulator.mjs
# Tras cleanup de UI y seleccionar Storage:
node tools/worker-frame-emulator.mjs cleanup
```

`refresh` exige derivado propio existente y evita reset; ver condiciones R61. No hacer cleanup host si queda módulo: volver a UIProbe y dejar que su Timer retire caches/código primero.

Ver native-launcher-emulator.md. inspect-launcher.mjs, build-launcher.mjs, package-ui-probe.mjs worker; actualizar solo con Storage y módulos propios ausentes. stage después del reset; test-launcher-emulator.mjs empieza en Ready sin START. launcher-emulator.mjs state|cleanup rechaza tareas vivas.

Artefactos finales: native-launcher-1791086511822; launcher-close-1791086602592; launcher-reentry-1791086646164; launcher-final-1791086773782. ELF3788 SHA72a7f070468f6d2670de52079e57fd144feb0e6667583ffd2f23e0023f4edba9; source LF11e15ce8edc14fa0bf6b7073ea741df19097e03fd169f4bf5beb8498bc1e90a9. Watchface12660 SHA499d2d58570724f7a70c1af6ac61c4367bd00d92d88a3d5ad63bed70e2d86f6c. Cambio corto de Lua dejó cola antigua: backup del derivado, remove/push propio y readback exacto corrigieron sesión. Installer actualizado pero su nueva rama completa sigue sin runtime de reinstalación; la reparación manual equivalente sí pasó. No repetir START/EXIT salvo cambio/fallo pendiente.

## Próxima meta

R62 completó consumo de controles mantenidos en worker C y su cancelación cooperativa. Siguiente: verificar procedencia/licencia del WAD shareware y comprobar su lectura desde C, antes del motor real. No incluir WAD ni compilar Doom todavía; hardware fuera de alcance.

Preferencia del usuario registrada en [controls.md](controls.md): controles cómodos, táctiles inicialmente, sin asignar avanzar a pulsar la corona. Ahora consumidos por worker en R62, ergonomía pendiente; un dedo, zonas grandes, diagonal para avanzar+girar, menú con salida visible. Combatir mientras se mueve sigue siendo una limitación. No foco stock con dedo aún apoyado demostrado; HOLD TEST y STOP son pruebas distintas.

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
node tools/package-ui-probe.mjs loop
# Si ya existe UIProbe: seleccionar primero Storage antes de actualizar.
node tools/install-ui-probe-emulator.mjs update
# Después de boot/reset, preparar el payload temporal:
node tools/stage-lua-bridge.mjs stage
# Pruebas de cierre por consola, estando UIProbe inactiva:
node tools/test-lua-bridge-close.mjs normal
node tools/test-lua-bridge-close.mjs error
node tools/test-native-frame.mjs
# Seleccionar UIProbe y dejar en launcher, SIN START previo:
node tools/test-frame-loop-emulator.mjs
node tools/lua-bridge-state.mjs
# Tras el ensayo, probar otro START→Storage sin EXIT; después:
node tools/stage-lua-bridge.mjs cleanup
```

Si el emulador está cerrado, el usuario normal puede arrancarlo con tools/emulator-host.mjs start desde su PowerShell y dejarla abierta. No abrir una segunda instancia sobre el mismo disco. Antes de descartar un marker antiguo, comprobar PID/QEMU y salida registrada.

Build/install TouchEvents ya realizados: no repetir scripts que rechazan directorios existentes. Restaurar data exige cerrar y verificar que QEMU dejó de usar la imagen; no se necesitó ni se probó restauración. Backups bajo emulator/local/backups/, logs/capturas bajo artifacts/emulator/.

La terminal restringida no accede a GitHub para descargas; el usuario descargó ambos ZIP originales. Browser/conector GitHub permiten investigación. ExecutionPolicy bloquea .ps1; se usaron herramientas Node/PowerShell inline sin cambiarla.

En futuras pausas, guardar únicamente una nota breve con el siguiente paso. No iniciar verificaciones ni ampliar documentación por motivo de pausa.
