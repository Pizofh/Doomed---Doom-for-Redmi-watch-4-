# Investigación inicial

Resultado posterior **R68:** [foco stock y STOP mantenido](doom-focus-emulator.md). Doom se congela en panel, espera RESUME y retira worker/módulo con FIRE down; mismo binario/Lua R67, sin compilación nueva. Nueve muestras/siete capturas, worker104/13alloc-free/streams0, sin reboot para salir. Un reset de baseline por screen OFF antes de C. Sin pérdida de foco con acción mantenida ni cierre sin EXIT del motor probado. Siguiente: cambio de watchface mientras corre Doom/recolección al reentrar. Gate físico cerrado.

Checkpoint actual: **R67**, [Doom en UI/control real del emulador](doom-ui-emulator.md). Resultados Rxx debajo son cronología; no extrapolar a hardware ni interpretar pendientes antiguos como estado actual.

Fecha: 2026-10-02. Fuentes técnicas primarias primero; código inspeccionado remotamente mediante GitHub. Las revisiones se fijan en [dependencies.lock.json](../third_party/dependencies.lock.json). Ninguna afirmación documental implica que se probó el reloj del usuario.

## Método

Separar modelo/familia, región, firmware, emulador y upstream. Cada resultado debe declarar origen, revisión, procedimiento, salida y límite. Una capacidad compilable de NuttX no demuestra que Xiaomi la haya habilitado. Una función Lua estándar no demuestra que el runtime del reloj la exponga. Una prueba con pantalla RW4 en un sistema S3 no demuestra ABI RW4.

## Dispositivo y hardware

El modelo M2315W1 procede de la identificación física comunicada por el usuario. No se verificaron región, firmware ni unidad. Xiaomi documenta AMOLED 1.97 pulgadas, 390×450, hasta 60 Hz, corona, GNSS, sensores, altavoz y llamadas mediante micrófono. [R01], [R02], [R03].

Xiaomi declara **32 MB RAM y 256 MB ROM** [R04]. Esto confirma una especificación comercial del RW4, no 32 MB de heap libre. No especifica aquí SRAM frente a PSRAM, reservas del sistema, capacidad libre ni tipo exacto de flash.

El teardown original de 52audio [R05] identifica BES2700iBP, SPI NAND Dosilicon DS35M2GB-IB, controlador táctil con marcaje 8918BC, GNSS SYN47752B1, sensor HX3690Q y amplificador FS1818. Su unidad incluye NFC: no extrapolar su población de componentes a la unidad global M2315W1 sin evidencia adicional. No publica un memory map utilizable ni SDK de la build Xiaomi.

El brief datasheet del fabricante BES [R06] especifica doble STAR-MC1 para CPU, STAR-MC1 en sensor hub, 2.2 MB SRAM compartida y Flash/PSRAM en encapsulado, además de GPU 2.5D y controlador de pantalla. No determina el reparto físico de los 32 MB anunciados por Xiaomi ni nuestra ABI, linker script, relocations, flags FPU o símbolos exportados. Tampoco confirma el modelo exacto del controlador AMOLED del reloj. No seleccionar toolchain ARM a partir del nombre del SoC únicamente.

## Lua y empaquetado

MiWatchLuaWatchfaces incluye ejemplos específicos RW4 y atribuye NuttX/LVGL a esa familia [R07]. `TouchEvents.fprj` declara `DeviceType=365` y una superficie 390×450 con entrada Lua `app_lua%2Fmain.lua` [R08]. El código usa `require("lvgl")`, módulos locales `root`/`image`, `SCRIPT_PATH`, labels, imágenes y callbacks de eventos. Se inspeccionaron sus tres Lua completos de forma remota [R09].

`PRESSED` lee `get_point()`. `PRESSING` y `RELEASED` leen `get_vect()`; no confundir desplazamiento con coordenadas absolutas. El ejemplo también lee dirección de gesto. Contiene una variable `/data/tmp.log` sin apertura/escritura: eso **no prueba permisos de filesystem**. No contiene `os.execute()` ni mecanismo de cierre del launcher. Hay un identificador `EVENT_BUBLE` en el código; no corregirlo como si conociéramos el binding sin probarlo. Versión Lua, timers, permisos, sensores y unload están pendientes.

EasyFace documenta empaquetado y transferencia automática al emulador; su README remite a MSI en Drive, redistributable Microsoft, ejecución como administrador y Mi Fitness mod de Telegram [R10]. Solo se documentó ese camino: no se instaló nada. La release v4.23 tiene digest publicado para el ZIP del compiler [R11]; no autentica el MSI externo ni demuestra seguridad del editor.

## Emulador

La release v1.0 contiene presets S3/RW4/RW5 [R12]; ZIP 733,139,307 bytes, asset ID 229620973, sin digest en metadata. El repositorio no contiene el código completo de esos binarios. La firma del commit documental no cubre el ZIP. EasyFace describe el origen Watch S3 [R10]. La continuación local confirmó boot, ADB, rutas y `/dev/fb0`; `uname -a` identifica Xiaomi Watch S3 [R33]. Lua CLI 5.4 expone tipos function para `os.execute`/`package.loadlib`, sin invocación. TouchEvents original falla al crear su fuente; una variante sin esa línea termina sin excepción, pero no aparece en pantalla. No extrapolar CLI a watchface ni S3 a RW4.

## QuickApps

Xiaomi documenta apps JS con `.ux`, manifest, APIs `@system.*` y empaquetado `.rpk` [R14], [R15]. El runtime no es Node.js; importar `fs` de Node no es un camino [R16]. File APIs permiten buffers y acceso por offset/longitud [R17]. Los URIs privados incluyen `internal://files`, cache, mass y tmp, con distintas garantías [R18]. Hay salida de app mediante `$app.exit()` y consulta de capacidades mediante `$canIUse` [R19]. Todo esto es API general Vela, no validación RW4.

La página oficial de depuración física identifica **solo Watch S4** y acceso para partners con versión/OTA específica [R20]. No seguir ese flujo en RW4. La tabla de adaptación consultada no incluye RW4 [R21]; ausencia en esa tabla no demuestra incompatibilidad absoluta. La FAQ describe instalar RPK con una versión de Mi Fitness provista por Xiaomi [R22]. No encontramos una API pública que permita a un RPK arbitrario cargar ELF, módulos C o WASM en RW4. La mención de WebAssembly en una herramienta web para certificados [R23] no es evidencia de WASM dentro del reloj.

## DOOM y NuttX

MiWatchNativeApps [R35], fijado en a392529b9e369d046b9c15858d990f358fdf6c29, incluye hello C y launcher Lua para Watch S3 y Band 10 Pro. El launcher invoca os.execute; el header S3 2.6.0 contiene direcciones absolutas específicas del firmware. Su README afirma ausencia de hardcoded code addresses, pero el header sí las contiene. Su etiqueta «userspace module» no demuestra aislamiento; nuestro emulador es FLAT. Descargar el módulo de RAM al reboot no implica borrar el archivo ELF almacenado. Ningún código/binario del proyecto fue ejecutado ni copiado al guest. No aporta evidencia específica suficiente para M2315W1.

doomgeneric conserva el motor de DOOM y expone una interfaz pequeña [R24]. El header real incluye `DG_SetWindowTitle`, `doomgeneric_Create`, `doomgeneric_Tick` y `DG_ScreenBuffer`. Sus defaults son **640×400** y `uint32_t`, con alternativa `CMAP256`; 320×200 es una futura elección de build, no el default actual [R25]. LICENSE es GPL versión 2 [R26]; derechos de WAD separados. No se descargó WAD ni se compiló motor.

NuttX documenta FLAT/PROTECTED/KERNEL [R27] y distingue módulos kernel de shared libraries [R28]. NSH puede incluir `insmod`, `rmmod` y `lsmod` condicionado por configuración [R29]. Son mecanismos upstream, no evidencia de firmware M2315W1. El uso de RAM no establece aislamiento ni rollback de escrituras.

## Fuentes consultadas

Las páginas web son referencias móviles consultadas en esta fecha. Los links a código usan SHA. No se archivan firmware, imágenes del teardown ni datos del juego.

- **R01:** [Xiaomi especificaciones globales](https://www.mi.com/global/product/redmi-watch-4/specs/).
- **R02:** [Xiaomi resolución y pantalla](https://www.mi.co.id/id/support/faq/details/KA-325678/).
- **R03:** [Xiaomi producto, corona y llamadas](https://www.mi.com/tw/product/redmi-watch-4/).
- **R04:** [Xiaomi RAM/ROM RW4](https://www.mi.com/global/support/faq/details/KA-533710/).
- **R05:** [52audio, teardown original RW4](https://www.52audio.com/archives/191060.html).
- **R06:** [Bestechnic, BES2700iBP Brief Datasheet](https://www.bestechnic.com/en/Uploads/keditor/file/20241011/20241011133740_73924.pdf), páginas 2–3.
- **R07:** [MiWatchLuaWatchfaces README](https://github.com/m0tral/MiWatchLuaWatchfaces/blob/5af6e14ea92830a394c88dc04f76ceef697a6ded/README.md).
- **R08:** [TouchEvents proyecto](https://github.com/m0tral/MiWatchLuaWatchfaces/blob/5af6e14ea92830a394c88dc04f76ceef697a6ded/RedmiWatch4/TouchEvents/TouchEvents.fprj).
- **R09:** [TouchEvents Lua](https://github.com/m0tral/MiWatchLuaWatchfaces/tree/5af6e14ea92830a394c88dc04f76ceef697a6ded/RedmiWatch4/TouchEvents/app/lua).
- **R10:** [EasyFace README](https://github.com/m0tral/EasyFace/blob/f76a9fe1f559bc8b1d91cf2a1f5af1a630848098/README.md).
- **R11:** [EasyFace v4.23](https://github.com/m0tral/EasyFace/releases/tag/v4.23).
- **R12:** [MiWatchEmulator v1.0](https://github.com/m0tral/MiWatchEmulator/releases/tag/v1.0).
- **R13:** [MiWatchEmulator README](https://github.com/m0tral/MiWatchEmulator/blob/f637d22a07727e59ffe96aa919b1a9193d23db95/README.md).
- **R14:** [Xiaomi Vela JS overview](https://iot.mi.com/vela/quickapp/en/guide/).
- **R15:** [Xiaomi RPK packaging](https://iot.mi.com/vela/quickapp/en/tools/release/start.html).
- **R16:** [Xiaomi JS script runtime](https://iot.mi.com/vela/quickapp/en/guide/framework/script/).
- **R17:** [Xiaomi file API](https://iot.mi.com/vela/quickapp/en/features/data/file.html).
- **R18:** [Xiaomi project structure y URIs](https://iot.mi.com/vela/quickapp/en/guide/framework/project-structure.html).
- **R19:** [Xiaomi global methods](https://iot.mi.com/vela/quickapp/en/guide/framework/script/global-data-method.html).
- **R20:** [Xiaomi real-device debugging](https://iot.mi.com/vela/quickapp/en/tools/devicedebug/start.html).
- **R21:** [Xiaomi multi-screen table](https://iot.mi.com/vela/quickapp/en/guide/multi-screens/).
- **R22:** [Xiaomi FAQ de instalación RPK](https://iot.mi.com/vela/quickapp/en/guide/other/faq.html).
- **R23:** [Xiaomi interconnect y herramienta web de certificados](https://iot.mi.com/vela/quickapp/en/features/network/interconnect.html).
- **R24:** [doomgeneric README](https://github.com/ozkl/doomgeneric/blob/dcb7a8dbc7a16ce3dda29382ac9aae9d77d21284/README.md).
- **R25:** [doomgeneric header](https://github.com/ozkl/doomgeneric/blob/dcb7a8dbc7a16ce3dda29382ac9aae9d77d21284/doomgeneric/doomgeneric.h).
- **R26:** [doomgeneric LICENSE](https://github.com/ozkl/doomgeneric/blob/dcb7a8dbc7a16ce3dda29382ac9aae9d77d21284/LICENSE).
- **R27:** [NuttX memory configurations](https://nuttx.apache.org/docs/latest/implementation/memory_configurations.html).
- **R28:** [NuttX kernel modules vs shared libraries](https://nuttx.apache.org/docs/latest/implementation/kernel_modules_vs_shared_libraries.html).
- **R29:** [NuttX NSH commands](https://nuttx.apache.org/docs/latest/applications/nsh/commands.html).
- **R30:** [OpenVela prebuilts Windows, revisión equivalente a los ejecutables del bundle](https://github.com/open-vela/prebuilts_emulator_windows-x86_64/tree/3776c05d2c66f73f6bbe65528cd1a34fe34e1f18); metadata Git contrastada localmente para 94 EXE/DLL.
- **R31:** [Revisión local del paquete e imagen guest](emulator-package-review.md); inspección estática, separada de pruebas runtime.
- **R32:** [AOSP System.cpp emu-32-dev](https://github.com/aosp-mirror/platform_external_qemu/blob/emu-32-dev/android/android-emu-base/android/base/system/System.cpp); upstream usa SHGetFolderPathW en Windows. No es fuente exacta de la variante Vela.
- **R33:** [Observaciones locales de boot, ADB, inventario y Lua](emulator-runtime.md); primera instancia cerrada desde padre, segunda con shell y pruebas CLI sin validación touch.
- **R34:** [AOSP protocolo EmulatorController fijado](https://github.com/aosp-mirror/platform_external_qemu/blob/3784ee8181ab600b8a1d009a5e03cf9afe78865a/android/android-grpc/emulator_controller.proto); utilizado para captura gRPC de pantalla, sin envío de input.
- **R35:** [MiWatchNativeApps fijado](https://github.com/m0tral/MiWatchNativeApps/tree/a392529b9e369d046b9c15858d990f358fdf6c29): README, WatchS3/watchs3_hello.c, WatchS3/wf_native_hello/app/lua/main.lua y platform/watchs3/fw_2.6.0/miwear_system.h. Fuente comunitaria original inspeccionada remotamente el 2026-10-03, sin ejecución.
- **R36:** [Lifecycle Lua, fallo QEMU, recuperación y ROMFS local](lua-lifecycle.md). Inspección estática y pruebas del emulador S3; ninguna prueba física.
- **R37:** [LuaVGL upstream fijado](https://github.com/XuNeo/luavgl/tree/62868a05b0b3e79b91f49ce9c3661750ffe55d02): luavgl.c, obj.c, disp.c, timer.c y simulator/main.c. Fuente relacionada; no identificada como revisión exacta del guest.
- **R38:** [FangAiden, documentación comunitaria fijada](https://github.com/FangAiden/Vela_Application_Documentation/tree/db51cbdf3307cdfb8ed131dab4ba8b061c336a83). Describe otro emulador 466×466 y observaciones propias; no Xiaomi oficial ni prueba RW4. No se ejecutó su código.
- **R39:** [Formato ROMFS, documentación del kernel](https://docs.kernel.org/filesystems/romfs.html), utilizado para un lector propio read-only. No se distribuyen los scripts extraídos de la imagen propietaria.
- **R40:** [Compiler EasyFace revisado y TouchEvents empaquetado: resultados locales](touch-events-emulator.md). Checksum de R11, inspección IL sin ejecución, empaquetado PC sin ADB automático; instalación, render, touch, cierre Lua y persistencia/reentrada validados solo en el emulador S3.
- **R41:** [Inspección estática del loader y allsyms del guest](native-loader-emulator.md), con inspector propio; no carga de payload.
- **R42:** [Apache NuttX 12.3.0 fijado](https://github.com/apache/nuttx/tree/8fdb56b5f2124de351a48125a252ba4264665e3d): mod_insmod.c, mod_rmmod.c, modlib.h, modlib_symtab.c y modlib_verify.c. Referencia histórica, no versión identificada del guest.
- **R43:** [OpenVela NuttX actual fijado](https://github.com/open-vela/nuttx/tree/9e79ad292fd103d3b9ef737757081a3f7fbbf9a4): insmod usa libelf_insert; difiere de las funciones modlib del guest. Revisión 9aec7d0ff1 no encontrada públicamente.
- **R44:** [Raspberry Pi pico-vscode, URLs de toolchains fijadas](https://github.com/raspberrypi/pico-vscode/blob/81e0cd88cf920b3a8c2a3619dd7c0572062fba09/data/0.18.0/supportedToolchains.ini): enlace Arm Keil 14.3.rel1 Windows x64 / arm-none-eabi. ZIP y checksum solicitados al usuario; contenido sin verificar ni ejecutar.
- **R45:** [Hello C en emulador: revisión Arm 14.3, loader desensamblado, build y dos ciclos carga/descarga](hello-native-emulator.md). ZIP coincide con checksum Arm; import puts falla y enlace al símbolo del ELF guest exacto funciona. Sin payload físico ni DOOM.
- **R46:** [Display desde C: inquiry, RGB565, patrón, restauración, touch/UI posterior y screen OFF](native-display-emulator.md). Inspección del guest y pruebas locales; buffer compartido con stock, sin compatibilidad RW4 ni ownership exclusivo demostrado.
- **R47:** [Apache NuttX fb.h fijado](https://github.com/apache/nuttx/blob/8fdb56b5f2124de351a48125a252ba4264665e3d/include/nuttx/video/fb.h) y [fcntl.h](https://github.com/apache/nuttx/blob/8fdb56b5f2124de351a48125a252ba4264665e3d/include/fcntl.h): estructuras, FB_FMT_RGB16_565, ioctl y flags NuttX. Referencia histórica contrastada con tamaños/campos/callers del guest; no versión exacta identificada.
- **R48:** [Touch desde C en el emulador](native-touch-emulator.md): driver desensamblado, lector independiente nonblocking, 36 muestras y respuesta stock concurrente; close/rmmod y UI posterior sin reboot. No C widgets ni prueba RW4.
- **R50:** [Pantalla Lua propia, scroll y lifecycle en emulador](lua-ui-emulator.md): fallo inicial reproducido, SCROLL_CHAIN, drags centrales, EXIT/reentrada, borde stock, pageOnPause/Resume y cierre Lua. [LVGL9 scroll](https://github.com/lvgl/lvgl/blob/v9.0.0/src/indev/lv_indev_scroll.c) es referencia primaria; dispatch de callbacks contrastado en ELF exacto. No prueba física ni puente C ejecutado.
- **R49:** OpenVela NuttX @9e79ad292fd103d3b9ef737757081a3f7fbbf9a4: [touchscreen_upper.c](https://github.com/open-vela/nuttx/blob/9e79ad292fd103d3b9ef737757081a3f7fbbf9a4/drivers/input/touchscreen_upper.c), [touchscreen.h](https://github.com/open-vela/nuttx/blob/9e79ad292fd103d3b9ef737757081a3f7fbbf9a4/include/nuttx/input/touchscreen.h) y [fcntl.h](https://github.com/open-vela/nuttx/blob/9e79ad292fd103d3b9ef737757081a3f7fbbf9a4/include/fcntl.h). Fuente primaria de referencia; mutexes/ioctls del guest difieren. ABI/colas contrastados contra imagen, sin afirmar revisión exacta.
- **R51:** [Puente Lua↔C, shell desde watchface y loadlib deshabilitado](lua-native-bridge-emulator.md): DWARF/ELF exacto, dispositivo virtual propio, snapshots, dos ciclos START/EXIT y rechazo de descarga con descriptor abierto. [Lua loadlib.c](https://www.lua.org/source/5.4/loadlib.c.html), [NuttX fs.h fijado](https://github.com/apache/nuttx/blob/8fdb56b5f2124de351a48125a252ba4264665e3d/include/nuttx/fs/fs.h) y [lib_dlopen.c](https://github.com/apache/nuttx/blob/8fdb56b5f2124de351a48125a252ba4264665e3d/libs/libc/dlfcn/lib_dlopen.c) son referencias, no versiones exactas identificadas. Solo emulador; sin Doom ni persistencia nativa.
- **R52:** [Descarga al cerrar watchface sin EXIT](lua-native-close-emulator.md): dos ciclos UI, regresión EXIT, cierre CLI normal y error controlado con descriptor abierto. Inspección estática de la llamada Xiaomi a lua_close en el mismo ELF. [Finalizadores Lua 5.4](https://www.lua.org/manual/5.4/manual.html#2.5.3) y [variables close](https://www.lua.org/manual/5.4/manual.html#3.3.8) sustentan el mecanismo; las pruebas locales sustentan su funcionamiento en este guest. No implica cleanup ante crash ni prueba RW4.
- **R53:** [Snapshot C dentro de página LVGL](native-frame-lvgl-emulator.md): formato RGB565, decoder compilado, file.f_priv DWARF, readback exacto de dos fases, lectores y descarga, 14 gestos y cierre UI. Fuentes relacionadas fijadas de LuaVGL, LVGL9 y NuttX enlazadas en ese documento. Fallo inicial y panic observados, revisión final corregida y probada; no causa exacta del panic aislada, animación, FPS, memoria pico ni RW4 demostrados.
- **R54:** [300 frames C con dos slots y Timer Lua](native-frame-loop-emulator.md): Timer/cache/file_write/delete compilados inspeccionados; ambas fases capturadas, pausa, EXIT/reentrada y cierre normal sin EXIT. Lua post-GC estable en ensayo corto; contador maxused aumentó sin causa aislada. Fuentes LuaVGL/LVGL relacionadas enlazadas en el documento; no Doom, reloj monotónico ni compatibilidad RW4 demostrados.

- **R55:** [Controles mantenidos Lua→C](native-controls-emulator.md): cola32, edges sin repetición, cancelación/overflow,26 snapshots UI, panel stock/regreso pausado y cierre al cambiar watchface. Fallo DEFOCUSED cruzado corregido; regresión de stream y cierre normal/error con FIRE pasan. LuaVGL indev/constants y doomgeneric doomkeys fijados enlazados en ese documento; wrapper compilado wait_release contrastado. No motor, ergonomía ni foco stock con contacto mantenido probados.

- **R56:** [Reloj monotónico y espera C](native-time-emulator.md): timespec16/sec64/nsec32 y branches del guest contrastados con fuente OpenVela relacionada fijada. 257 lecturas sin retroceso,19 esperas, PID NSH esperando antes/después de captura del panel y cleanup. Jitter de espera medido, sin precisión1ms garantizada. Helper corregido por AOD/nombre de task; screen OFF detectado, reset del guest limpio para baseline; preflight ahora prueba UI activa antes del payload. No espera en UI, engine, interrupciones ni mutación de hora ensayados.

- **R57:** [POSIX read/seek desde C](native-fs-emulator.md): off_t64/size_t32/O_RDONLY1 en guest contrastados,1MiB+37 bytes propios,41 posiciones, EOF, cuatro errores, posición alta sin lectura, descriptores independientes y reapertura. Fixture intacto y cleanup sin reboot. Referencias OpenVela y lector stdio doomgeneric fijados enlazadas en el documento. No stdio, WAD, persistencia, UI durante este probe ni RW4 probado.

- **R58:** [Stdio desde C](native-stdio-emulator.md): FILE opaco, fseek/ftell long32, buffer128 e imports compilados inspeccionados. Fixture propio leído completo,41 ventanas, longitud/restauración buffered, dos errores y tres reaperturas pasan; clearerr limpia EOF retenido después de seek. Fixture intacto y cleanup sin reboot. Fuentes fijadas OpenVela stdio.h, doomgeneric w_file_stdc/m_misc/d_main/d_loop distinguen lectura y espera potencial de TryRunTics. Sin WAD, engine, worker propio, storage persistente o RW4 probado.

- **R59:** [Lifecycle worker C](native-task-emulator.md): pthread_t signed32, trampoline compiled, defaults de stack, atomics32 y seis imports contrastados. Tres create/join, dos stop cooperativos y un límite natural; UI stock activa con mismo worker antes/después de captura. Hilos desaparecen y unload sin reboot. Primer preflight rechazó screen OFF antes de C; reset único de guest limpio para baseline. No worker después de retornar init, START/EXIT UI, join en UI, fallos de create/join, stress concurrente, WAD o RW4 probados.

- **R60:** [Launcher/worker detached](native-launcher-emulator.md): init NSH retorna sin worker; START desde UI28 crea pthread en grupo28. Dos EXIT, pausa/resume stock y rmmod ocupado rechazado; cierre de Lua solicita stop y conserva módulo, reentrada lo recoge sin reboot/comando host. Lookup interno de PID contrastado con wrapper del guest y NuttX12.3 relacionado; no dereferenciar TCB ni descargar por una bandera. Fallo inicial de derivado Lua con cola vieja respaldado y corregido mediante archivo propio/readback; guard de captura ajustado a RGB565 antes de START. No frame/input concurrentes, crash/kill, fallos create/detach, WAD/Doom ni RW4.
- **R61:** [Frames desde worker C](native-worker-frame-emulator.md): fuente propia y guest exacto combinan pthread/detach/PID R60 con Timer/cache/streams R53–R54. Ownership atómico de dos slots, dos lectores exclusivos con EOF,12 capturas completas y pausa/EXIT/cierre/reentrada probados. Natural limit observado en un helper fallido; parser20 words, staging y confirmación VM corregidos. Update del derivado y refresh respaldado sin reset pasan. No nuevas APIs físicas ni firmware RW4 reverse-engineered; sin Doom/WAD, input consumido por worker, stress/SMP o memoria prolongada.
- **R62:** [Worker consume input mantenido](native-worker-input-emulator.md): protocolo propio SPSC32 release/acquire con epochs, ACK neutral y cancelación sin sobrescribir registros.38 snapshots/22 key edges con gettid real, cuatro frames completos, saturación, panel, dos EXIT, STOP con FIRE pulsado y cierre/reentrada pasan. Primer gesto de panel comenzó dentro de MOVE/PRESS_LOCK y se canceló; helper corregido al margen y440, fuente C/Lua intacta. Reutiliza ABI/símbolos y fuentes primarias relacionadas R55/R61; sin nuevas APIs del firmware físico, Doom/WAD, ergonomía, foco stock aún pulsado, SMP o crash validados.

## R63,2026-10-04: WAD shareware

[Procedencia/licencia y lectura C](native-wad-emulator.md) pasan. Debian PSNC tar contiene solo doom1.wad,4196020bytes; identity hashes Debian coinciden. C verifica directory1264,16recursos/E1M1 y8196chunks; readback intacto. Runtime native-wad-1791133863026; unload/cleanup sin reboot. Host27casos negativos con datos propios pasan. Enlace Debian principal devolvió404 al usuario; reemplazo mirror funciona. Sin motor ni hardware. Siguiente auditoría libc/allocator/salida antes de engine build.

## R64,2026-10-04: compileaudit del motor

[Build real80C e inventario](doom-build-audit.md), fuentes originales181Gitblobs verificados/licencia preservada. Partial link425928bytes/50imports; no guest execution. No se repitieron R58/R62/R63 ni hubo resets. Newlibheaders noABIvalidada; zone6MiB, framebuffer256000 y static525351 antespadding/extras. Salida/allocations/streams/writes requieren shim. Primer inspectorENOBUFS traslink corregido; resultado final y read-onlyinspect pasan. Siguiente contrato runtime pequeño/shim, hardwarecerrado.

## R65,2026-10-04: runtime de recursos y salida

[Contrato y resultado](doom-runtime-emulator.md): ocho ciclos C pasan en worker139, con FILE/allocations limpios y join/unload sin reset. Inspeccionados malloc/free/vsnprintf/setjmp/longjmp del guest exacto. Build80C+shim compila,39imports pendientes; overlay solo I_Quit/I_Error, upstream intacto. No engine ejecutado ni hardware. Pruebas anteriores no repetidas; siguiente bindings/DG y primer frame real acotado.

## R66,2026-10-04: Doom original ejecuta E1M1

[Primer frame y evidencia](doom-first-frame-emulator.md): primera ejecución guest pasa, worker210 produce320x200/145colores/FNV07aece36. Imagen visualmente corresponde a E1M1 con arma/HUD.13alloc/free y2streams limpios, WAD intacto, join/unload/temporales sin reboot.1263ms incluye init/wipe;43callbacks no FPS.41bindings revisados,4THM_CALL locales admitidos por loader; fallos de guards y ENOBUFS ocurrieron solo en PC. Sin presentación UI/input conectado/juego continuo/RW4. Siguiente integración UI/controles, sin repetir pruebas aprobadas.

## R67,2026-10-04: Doom en UI y controles

[Resultados y reproducción](doom-ui-emulator.md): E1M1 visible en página Lua/LVGL320×200, input produce movimiento/giro/disparo originales, munición50→47.24 snapshots y ocho capturas; imagen completa comparada con copia RGB565,167 colores. Pausa congela motor/reanuda sin catch-up, dos STOP/unload/reload restauran posición/ammo50; workers104/408 retirados con13alloc/free y streams0 sin reboot. Core R66 reutilizado sin recompilar80C ni repetir pruebas anteriores. Fuente/transporte propios basados R62,45imports guest exacto,FLAT sin sandbox. Timer200ms limita presentación a≈5 imágenes/s; motor≈35tics/s, callbacks no FPS. Un reset de baseline por screen OFF antes de C, ninguno para salir. Final Storage/UIProbe doom almacenada, ELF/WAD/tmp retirados. Panel durante motor/held-input stop y estabilidad prolongada pendientes. No nuevas descargas/instalaciones host ni hardware. Siguiente checkpoint único: foco stock y salida con FIRE mantenido con el motor real.
