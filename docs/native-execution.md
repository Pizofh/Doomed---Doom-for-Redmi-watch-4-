# Ejecución y privilegios

**Actual R197/R198:** [FirstC preparado con activación manual](first-c-adapter-r197.md).
Archivos/marca/parser y secuencia verificados con executor simulado; no C propio
ejecutado en RW4. El [primer ensayo físico](first-c-physical-plan-r198.md) propone
un inicializador de dos instrucciones, registro observado y retirada confirmada.
No APIs, procesos, Doom o aislamiento demostrados. Privilegios reales siguen
desconocidos: tratar módulo como potencialmente privilegiado. Gates cerrados,
revisión expresa del usuario pendiente; no aplicar ELF ARMv8-M al emulador S3.

**R194:** [ruta insmod y contrato parcial inspeccionados en imagen RW4](rw4-loader-r194.md).
Se comprueban ELF32 ARM LE ET_REL, int init(modinfo*) y callback opcional de
retirada. Llamada directa al initializer sin nueva tarea/transición visible en
ese tramo; FLAT/PROTECTED/KERNEL y privilegio de NSH no establecidos. Candidato
sin imports compilado solo en PC, no ejecutado. No llamar sandbox al loader ni
aplicar ABI/direcciones S3. Primer ensayo C físico requiere su revisión concreta.

**R191:** [Lua→shell NuttX confirmado en2.2.86](native-info-physical-result-r190.md),
con lectura de captura y eliminación devuelta comoexitosa. help anuncia
insmod/rmmod/lsmod; iwasm ausente deese listado. package.loadlib solo expuesto,
no invocado. Retorno normal confirmado porusuario. [Contrato nativoRW4](rw4-native-contract.md)
pendiente: ninguna cargaC/ELF o conclusión de aislamiento por este ensayo.

**R190:** [NativeInfo registrada en el RW4 tras revisión](native-info-physical-result-r190.md),
sin activación por PC. Gates cerrados; consultas de shell/io/loader anunciado
siguen pendientes de observación manual. Nada de C/ELF/insmod físico ejecutado.

**R188/R189:** [NativeInfo preparado](native-route-r188.md) consulta comandos sin
ejecutar loaders. Pasó S3; [nuevo ensayo físico aún cerrado](native-info-physical-plan-r189.md).
Función expuesta no equivale a implementación; listadoinsmod no prueba ABI o
privilegios seguros. C/ELF sigue condicionado a contrato específico2.2.86.

**R187, 2026-10-12:** [Lua/LVGL Image con PNG propio funciona en M2315W1/2.2.86](lua-image-physical-result-r186.md),
según imagen y retorno normal confirmados por el usuario. No es ejecución C
propia: runtime/bindings nativos stock presentan el recurso estático. Shell,
loader, ABI, modelo de privilegios y C/ELF/Doom físico siguen sin probar.
No cargar payloads/direcciones del emulador por este resultado.

**R184/R185, 2026-10-12:** Lua propia y LVGL Object ya demostrados físicamente
enR182. [ImagePNG](lua-image-r184.md) ahora validada soloS3 y preparada para
ensayo físico bajo[plan cerrado](lua-image-physical-plan-r185.md). No shell,
loader, C/ELF, ABI o privilegios probados en nuestra unidad. Datos históricos
de la tabla inferior describen el emulador, no compatibilidadM2315W1.

**R74, 2026-10-04:** [Viabilidad stock RW4](rw4-stock-feasibility.md) aporta indicio de primera mano Lua/shell, sin version/ABI/loader probado. NativeApps solo targets S3/MB10Pro. Gadgetbridge es candidato para transferir watchfaces, no demostracion de ejecucion C. R73 Doom persistente confirmado exclusivamente en S3 emulado.

**Historial R68:** [Panel stock y STOP con FIRE down](doom-focus-emulator.md) pasan con el ELF R67 sin recompilar. NSH solo solicita STOP al driver propio; Lua/UI descarga tras worker retirado, sin kill ni unload host. No implica privilegios aislados, recovery física ni compatibilidad RW4. Cierre sin EXIT/reentrada con motor original queda como siguiente gate.

**Historial R67:** [DOOM original integrado en UI del emulador](doom-ui-emulator.md), controles, pausa y dos salidas limpias. Lua→os.execute→insmod carga ELF propio ligado a45imports de la imagen S3 exacta; worker detached ejecuta Doom, UI presenta por LVGL y hace unload después de retiro/PID ausente. No root/exploit ni userspace aislado: FLAT compartido. Persistencia nativa, crash recovery y compatibilidad RW4 siguen pendientes. La tabla describe caminos con resultados históricos; motor/WAD/display/input del port ya están demostrados en S3, nunca en M2315W1.

Referencia adicional del 2026-10-03: [MiWatchNativeApps](https://github.com/m0tral/MiWatchNativeApps/tree/a392529b9e369d046b9c15858d990f358fdf6c29), para S3/Band 10 Pro. Su header S3 usa direcciones absolutas del firmware; no ejecutar esos módulos en el emulador Cortex-A ni en M2315W1. «Userspace module» en documentación ajena no prueba separación de memoria. Fijar contrato/exports/init/uninit de nuestro guest antes de hello C. Ver R35 en research.md.

Se ejecutaron [hello C](hello-native-emulator.md) y un [puente Lua↔C propio](lua-native-bridge-emulator.md), únicamente en el emulador. os.execute desde watchface ejecutó uname e insmod/rmmod con nuestro módulo. No se ejecutó WASM, iwasm ni exploits. No hay una razón demostrada para root/jailbreak. Referencias y estados: [research.md](research.md), [matriz](evidence-matrix.md), [runtime observado](emulator-runtime.md).

[UIProbe Lua](lua-ui-emulator.md) crea widgets en contexto de watchface; controla scroll central y recibe pageOnPause/Resume. El puente posterior usa io y un dispositivo virtual propio: C recibe estados/eventos y EXIT lo descarga. package.loadlib tiene un stub deshabilitado, confirmado estática y dinámicamente. El lector global de /dev/input0 no alimenta este puente. Input/UI routing no introduce separación de memoria en FLAT.

La [inspección estática del ELF guest](emulator-package-review.md) identifica Goldfish Cortex-A7, ELF32 ARM/EABI5/hard-float, `CONFIG_BUILD_FLAT`, loaders ELF/módulos y soporte Lua/WAMR. Son capacidades compiladas de la imagen del emulador, no prueba de ejecución de código propio ni evidencia M2315W1. Los ejecutables Windows del launcher sí se ejecutaron tras revisar su procedencia; distinguirlos de payloads guest.

| Camino | Evidencia actual | Bloqueo | Experimento posterior en PC |
|---|---|---|---|
| QuickApp / JS / RPK | API oficial Vela; debug físico documentado S4 | Soporte RW4 y bridge C/WASM no demostrados | App JS mínima, consulta de capacidades; no la llamar C |
| Lua / watchface | Launcher, frames y controles consumidos por worker R62; cleanup probado | WAD, engine, crash, persistencia C y RW4 pendientes | Procedencia/licencia y lectura WAD desde C |
| Lua → shell | os.execute(uname/insmod/rmmod) desde watchface devuelve true/exit/0 | RW4 físico sin probar | No ampliar a comandos arbitrarios |
| Lua loadlib | Stub deshabilitado, respuesta nil/absent | No permite importar biblioteca C en este guest | Puente io→dispositivo virtual ya probado |
| ELF / exec | `CONFIG_ELF`, `CONFIG_LIBC_EXECFUNCS`, `execv`/`posix_spawn` en emulador | Exports, contrato loader/entrypoint y lifecycle pendientes | Inventario read-only, luego hello C si hay contrato válido |
| Módulo / `insmod` | Hello, display, touch, puente, tiempo, FS/stdio, launcher y worker display/input probados | Sin sandbox; WAD, engine y RW4 sin probar | Validar WAD legítimo antes del motor |
| Touch C / driver | [Observador nativo validado](native-touch-emulator.md), colas por lector; stock concurrente | Scheduling engine y compatibilidad RW4 pendientes | UI con controles mantenidos ya probada vía Lua→C |
| WASM / `iwasm` | `iwasm_main` y macros WAMR en emulador | Imports, memoria/UI/lifecycle y RW4 desconocidos | Identificar comando/runtime sin ejecutar payload |
| App nativa precompilada/builtin | Concepto upstream | Builtin no significa carga de app arbitraria stock | Identificar registro/launcher y build requerida |

El [patrón framebuffer desde C](native-display-emulator.md) mostró RGB565 y devolvió píxeles, input y panel stock en el emulador activo. No usó LVGL desde NSH: la build tiene LV_USE_OS=0 y contexto UI pendiente. La superficie sigue compartida; esto no constituye un backend interactivo ni un launcher.

Un componente de UI implementado internamente en C no da a una QuickApp permiso para ejecutar un binario arbitrario. La existencia de una toolchain Linux ARM no basta: NuttX necesita contrato de libc, relocations, arquitectura y símbolos compatible. No usar un ELF Linux en el emulador como ensayo de compatibilidad.

El inventario confirma los comandos de módulos y `/bin/iwasm`; `lsmod` no muestra módulos cargados. `help -v insmod` indica `insmod <file-path> <module-name>`. **El comando NSH `exec` acepta una dirección hexadecimal**, no un filename ELF. No confundirlo con las funciones C exec/execv ni utilizarlo como exploración. `help -v` no describe builtins Lua/iwasm aunque sí aparecen y Lua se ejecutó.

CLI Lua5.4 expone os.execute/package.loadlib como funciones; se comprobó posteriormente el shell desde watchface y el stub loadlib en ambos contextos. Ninguno establece disponibilidad física RW4. La prueba CLI histórica TouchEvents falló al crear su fuente; empaquetado y abierto mediante launcher watchface sí demostró render, touch, cierre y reentrada: [resultados](touch-events-emulator.md).

## Modelo de memoria

NuttX [documenta modos de memoria](https://nuttx.apache.org/docs/latest/implementation/memory_configurations.html) diferentes:

| Modo | Modelo general upstream | Consecuencia para nuestro port |
|---|---|---|
| FLAT | Dirección compartida entre OS y aplicaciones | Un task C puede dañar el sistema; salida no garantiza aislamiento |
| PROTECTED | Separación de kernel/userspace con MPU según arquitectura | Hay frontera de privilegios; verificar regiones y syscalls concretas |
| KERNEL | Entornos de direcciones con MMU y separación por proceso | Más separación; el loader y los permisos aún requieren revisión |

El nombre Vela no determina el modo. Buscar evidencia de `CONFIG_BUILD_FLAT`, `CONFIG_BUILD_PROTECTED`, `CONFIG_BUILD_KERNEL`, `CONFIG_MODULE`, `CONFIG_LIBC_EXECFUNCS`, loader ELF y símbolos de exportación en la **build relevante**. Examinar UID/GID/credenciales únicamente si esa build los implementa. No inferir privilegios Unix por una salida que parece `ls -l`.

NuttX distingue [módulos kernel y shared libraries](https://nuttx.apache.org/docs/latest/implementation/kernel_modules_vs_shared_libraries.html). `insmod` es una ruta potencialmente privilegiada, no sinónimo de un proceso aislado. `rmmod` requiere teardown correcto: callbacks, timers, objetos LVGL, tareas y referencias vivas pueden impedir una descarga segura. En FLAT ni siquiera un task ordinario establece un sandbox.

## Contrato mínimo antes de hello C

TouchEvents demostró una entrada Lua persistente en el emulador [resultado](touch-events-emulator.md). El hello inicial se cargó desde NSH/ADB; UIProbe posterior carga y descarga C desde Lua. Su ELF se preparó en /tmp y no persiste después de reset. QuickApp→C continúa sin probar.

Registrar encabezado ELF esperado (clase/endian/machine, tipo ET_REL/ET_EXEC/ET_DYN), ISA y flags, EABI/FPU, toolchain y versión, linker/relocations, entrypoint, libc y símbolos/imports. Identificar quién ejecuta init/exit, contexto/task, stack/heap, privilegios y recuperación del emulador. El contrato mínimo del hello ET_REL quedó contrastado; stack/heap completos, tareas y ownership de UI aún no se caracterizaron para DOOM.

Hello C completado: una línea y devolución, sin recursos propios, drivers, hooks ni display. La [investigación del loader](native-loader-emulator.md) contrastó init/unload y relocations con el guest. El import puts no funcionó; el enlace al símbolo del ELF exacto sí. No extrapolar ese mecanismo a M2315W1.

## Salida antes del hardware

R57: [POSIX read/seek con fixture propio](native-fs-emulator.md) pasó en tmpfs:1MiB+37 bytes,41 posiciones, EOF, cuatro errores y reapertura. ABI off_t64/O_RDONLY1 contrastada; C solo lee, cierra y retorna antes de unload. Prueba POSIX separada del checkpoint stdio posterior; storage persistente sigue sin probar.

R58: [lectura stdio, longitud y buffers](native-stdio-emulator.md) pasan en fixture propio, sin WAD. FILE opaco; fseek/ftell usan long32. EOF queda marcado tras seek, relectura funciona y clearerr limpia. No dormir/llamar TryRunTics desde Timer UI: el upstream puede esperar. Validar lifecycle de tarea separada antes de engine; ABI de creación/parada y sincronización aún no demostradas. Gate físico independiente cerrado.

R59: [pthread_create/stop cooperativo/join](native-task-emulator.md) probados desde NSH en tres ciclos. UI stock responde con worker vivo; después hilos/módulo desaparecen sin reboot. Pending_join impide uninit por contrato, probado con llamada directa, no rmmod concurrente en ese experimento. R60: [START/EXIT del launcher](native-launcher-emulator.md) crea worker detached desde UI28 después del retorno de init; stop/poll y PID ausente preceden unload. Se rechaza rmmod mientras el worker vive, y reentrada recoge el módulo retenido por cierre Lua. No join en UI, fallos de create/detach, crash/kill, Doom/WAD ni RW4 probados. Siguiente: intercambio seguro de frames worker→UI.

[Frames repetidos en nuestra página](native-frame-loop-emulator.md): dos slots y un Timer de firmware que invoca Lua. Op6/op7 llaman cache LVGL **solo desde contexto UI**, nunca NSH/CLI/worker/uninit. Timer no conserva callbacks del módulo; se detiene antes de pausa/EXIT y GC normal retira Timer. Guard bloquea llamadas tras cierre. Pausa/descarga comprobadas en ensayo300frames; sin garantía ante crash ni de memoria prolongada. Umem maxused subió sin causa aislada.

Probar abrir/cerrar repetidamente y medir liberación de RAM, input y display. Tener salida UI y un mecanismo externo documentado de terminar la instancia en emulador. No ejecutar `kill` ni escribir watchdog/config para descubrir su comportamiento. Un timeout del host solo termina el cliente ADB; no asegura la terminación de un programa dentro del guest. Un reboot no sustituye el requisito de devolver el control al reloj sin reiniciarlo.
## R61: worker y presentación separados, solo emulador

[Prueba de frames](native-worker-frame-emulator.md): worker detached de la UI genera RGB565; stream con dos slots y ownership release/acquire entrega copias completas. Lua/UI presenta mediante archivos propios y LVGL, con cache-drop restringido al owner UI. Dos EXIT y cierre/reentrada limpian sin reboot; el finalizador no toca LVGL y conserva módulo hasta reentrada. Uninit requiere cero referencias y worker retirado/PID ausente. La existencia de insmod y símbolos internos en este guest FLAT no demuestra userspace aislado, soporte ELF genérico ni compatibilidad M2315W1. Concurrencia arbitraria de open/unload y crash siguen sin validar.

R63 posterior a la tabla: [WAD legítimo leído desde C](native-wad-emulator.md) ya validado en NSH del guest exacto. Motor, allocator, lectura en worker, persistencia y RW4 siguen pendientes. Próximo checkpoint: auditoría libc/memoria/salida y preparación del build doomgeneric sin sonido.

R64: [build compileaudit del motor](doom-build-audit.md) completado. Todavía50imports sinresolver y ninguna ABI libc completa aprobada. Siguiente shim/allocator/streams/salida; no cargar el objeto parcial.

R65: [shim de recursos/salida](doom-runtime-emulator.md) pasa ocho runs dentro de worker139, con join y unload sin reboot. Setjmp/longjmp estándar del guest inspeccionados, no builtins ni jmp_buf Newlib. Stop probado desde el propio worker; externo pendiente. Malloc/free y vsnprintf probados, FILE opaco con lectura de ruta única. Motor recompila con shim/overlay de I_Quit/I_Error; objeto no cargable con39imports pendientes, incluyendo6DG. FLAT sin sandbox y M2315W1 sin ABI demostrada. Siguiente bindings/adaptadores para primer frame real, sin repetir pruebas anteriores.

R66: [motor ejecutado y E1M1 capturado](doom-first-frame-emulator.md).41imports enlazados al guest exacto, COMMON asignados y4THM_CALL autorrecursivos admitidos tras revisar up_relocate tipo10. Worker210 con stack32KiB/attr opaco12bytes produce frame320x200; quit local limpia13reservas/2streams, join/unload/tmp cleanup sin reboot. No UI/input del motor ni hardware. Memcpy/memset/strcmp ARM conservan bit de estado; no imponer Thumb a toda libc. Siguiente presentación UI y controles R62.

## R73: carga desde almacenamiento persistente (solo emulador)

El mismo ELF R67 se carga con insmod desde /data/app/watchface/market/365799903/doom/doom.elf; no recompilacion/cambio ABI/privilegios. WAD persistente se prepara en tmp para el runtime de lectura existente. Reset entre dos sesiones con SHA256 iguales y sin pushes confirma persistencia del archivo, no residencia continua ni sandbox. [Resultado y limites](doom-persistence-emulator.md). Mecanismo userspace ELF/QuickApp/WASM y compatibilidad nativa M2315W1 no quedan demostrados por esta prueba.
