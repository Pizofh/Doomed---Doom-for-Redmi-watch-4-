# R60: START/EXIT con worker C

Resultado del 2026-10-03: **dos START/EXIT pasan**, además de cierre sin EXIT y recogida automática al volver a la esfera. Solo MiWatchEmulator S3 configurado a 390×450; ninguna prueba del M2315W1, Doom o WAD.

## Diseño y evidencia del guest

`experiments/native-launcher/launcher.c` registra únicamente `/dev/rw4worker` y retorna del initializer sin crear hilos. El write START desde Lua/UI crea un pthread en el grupo del llamador y ejecuta `pthread_detach`. El worker cuenta cada espera relativa de50ms; no llama LVGL, drivers, filesystem ni código Lua. EXIT publica stop; el Timer Lua consulta estado cada200ms, sin sleep/join en UI.

El módulo no se descarga por observar solamente una bandera de finalización. Exige detach exitoso, reason publicado, ningún descriptor propio abierto y **ausencia del PID mediante nxsched_get_tcb**. El puntero devuelto nunca se dereferencia. Si el PID se reutiliza y aparece otra tarea, el módulo se conserva de forma preventiva. Esto es una dependencia interna del guest exacto, no una API portable a RW4 ni un sandbox.

Inspección del ELF guest SHA256 `849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa`: pthread_detach Thumb`0x6554bd`, nxsched_get_tcb Thumb`0x6028fd`, pthread_t/pid_t signed32; lookup guarda/restaura interrupciones al examinar la tabla de PIDs. El trampoline guest llama worker y después pthread_exit. release_tcb retira el PID; no se afirma que el lookup mida liberación completa del heap. Nuestro worker no instala destructores TLS ni callbacks de salida que apunten al módulo. No hay tryjoin/timedjoin en la tabla de símbolos inspeccionada; esto no demuestra ausencia en todos los firmwares.

Como referencia relacionada, [pthread_detach en NuttX12.3](https://github.com/apache/nuttx/blob/nuttx-12.3.0/sched/pthread/pthread_detach.c) requiere el mismo grupo que el hilo. [nxsched_get_tcb](https://github.com/apache/nuttx/blob/nuttx-12.3.0/sched/sched/sched_gettcb.c) advierte que el puntero puede quedar inestable tras salir de su sección crítica; por eso no lo usamos como estructura. [release_tcb](https://github.com/apache/nuttx/blob/nuttx-12.3.0/sched/sched/sched_releasetcb.c) muestra la retirada del PID y liberación posterior de recursos. **No son fuentes identificadas como la revisión9aec7d0ff1 del guest**: se contrastan con sus wrappers compilados.

## Pruebas reproducibles y resultado

Artefacto principal: `artifacts/emulator/native-launcher-1791086511822/result.json`, `passed=true`. Inicializers NSH148/247 ya ausentes; START se ejecuta en UI28 y crea workers149/248 en grupo28, tras el retorno del initializer.

| Prueba | Resultado observado |
|---|---|
| START1 | Worker149, contador9→35, detach0/error0; módulo registrado |
| Panel stock | Mismo worker149 vivo; pausado, pasos52→52 en dos muestras; resume correcto |
| rmmod durante worker vivo | Rechazado por loader con estado de error; módulo y worker conservados |
| EXIT1 | reason1/stop,61 pasos; uninit0, live0, refs0; PID/nodo/módulo ausentes |
| START2/EXIT2 | Worker248,9→36 pasos,42 finales; uninit0 y limpieza confirmada |
| Cambio a Storage sin EXIT | Worker312 termina con85 pasos; finalizador solicita stop y conserva módulo |
| Volver a UIProbe | Su Timer recoge el módulo retenido; Ready: exited, sin rmmod desde el host |

`ps` muestra workers como pthread, prioridad100, stack utilizable4072 y used592 en las muestras; no es pico de memoria ni presupuesto del motor. exitObservedMs1899/1915 incluye gesto, ADB, ps y captura; **no mide latencia del botón ni tiempo nativo de parada**. La UI actualiza su estado y permite START otra vez. No se midió jitter del Timer.

Cierre: `launcher-close-1791086602592` documenta stop1/reason1/live0 y módulo retenido tras cerrar Lua. Reentrada: `launcher-reentry-1791086646164` confirma descarga automática con marcadores propios. Final: `launcher-final-1791086773782`, Storage365700764, PIDs149/248/312 ausentes, ningún módulo/nodo worker; `launcher-cleanup-1791086692340` retira el ELF propio de tmpfs. Ningún reboot para salir o recoger workers. Hubo un reset previo para instalar la nueva esfera, antes de ejecutar C.

## Fallo de instalación corregido

Primer paquete compiló pero Lua no cargó: main.lua tenía5064 bytes nuevos seguidos de una cola anterior, total16765. loadfile del fuente propio separado compila; loadfile del derivado informa error en línea105, donde empieza la cola. Evidencia `launcher-unpack-1791085887059` y `launcher-cache-fix-1791086017958`. No se ejecutó C en esos intentos.

Se respaldó data, cerró la esfera fallida seleccionando Storage, eliminó **solo su main.lua derivado** y repuso el fuente propio cuyo SHA coincidía con el paquete. Readback exacto en `launcher-cache-source-1791086181161`; seleccionar de nuevo el mismo ID no recrea la VM, por lo que se pasó por Storage antes de regresar. Este procedimiento manual corrigió la sesión sin reboot. El instalador ahora respalda/reemplaza ese derivado si existe, verifica readback y rechaza reset mientras hay módulos propios cargados. La rama nueva del instalador completo todavía no se ejecutó: su secuencia de reparación equivale a los pasos manuales probados, pero no se anuncia como reinstalación ya validada.

El primer runner rechazó colores exactos antes de START por cuantización RGB565; su guard ahora admite tolerancia6 por canal. No cambió el payload C ni Lua por ese ajuste.

## Reproducción

Desde la raíz del repo, con dependencias locales ya revisadas:

```powershell
node tools/inspect-launcher.mjs
node tools/build-launcher.mjs
node tools/package-ui-probe.mjs worker
# Seleccionar Storage y confirmar ausencia de módulos propios antes del update.
node tools/install-ui-probe-emulator.mjs update
node tools/launcher-emulator.mjs stage
# Seleccionar UIProbe mediante UI stock, revisar la pantalla Ready, SIN START.
node tools/test-launcher-emulator.mjs
node tools/launcher-emulator.mjs state
# Tras dejar Storage y confirmar el ciclo de vida terminado:
node tools/launcher-emulator.mjs cleanup
```

Los helpers fijan hash del guest/payload/ADB, PID/puertos/ruta del QEMU y servidor dedicado5039, serial emulator-5554, sin USB. El runner exige ID365799903 y main.lua exacto. Snapshot64bytes SIN EOF: nunca cat/read-all `/dev/rw4worker`. Comandos12bytes magic`0x34574c52`, secuencia creciente, op1START/2STOP/3PAUSE/4RESUME. Snapshots son palabras atómicas individuales, no una transacción coherente de todos los campos; hay un solo escritor Lua/UI de lifecycle y lectores de inspección limitados.

Payload ELF3788bytes, entry`0x43d`, data0/BSS56,32 relocations ABS32, ocho imports permitidos. SHA256 ELF`72a7f070468f6d2670de52079e57fd144feb0e6667583ffd2f23e0023f4edba9`, fuente C normalizadoLF`11e15ce8edc14fa0bf6b7073ea741df19097e03fd169f4bf5beb8498bc1e90a9`. Lua SHA`f0d96c5435b5a538becfc4b718c9ad024fa82adbfca9c112d5209b8e82f6936b`. Paquete12660bytes SHA`499d2d58570724f7a70c1af6ac61c4367bd00d92d88a3d5ad63bed70e2d86f6c`. Binarios/logs/capturas ignorados, sin redistribuir firmware.

## Límites y siguiente meta

No es Doom: el worker solo cuenta. No se probaron frame/input concurrentes, fallo de create/detach, agotamiento de memoria, crash/kill, worker natural al límite de1200 esperas, estrés de múltiples escritores o apertura/descarga arbitraria concurrente. El límite de iteraciones no es un watchdog duro. create/detach y shell usan locks/operaciones síncronas del sistema; ausencia de join/sleep en UI no garantiza latencia acotada de cada syscall. El cierre de Lua conserva el módulo mientras la tarea termina; si falla el contrato, requiere inspección, no descarga forzada.

Solo la watchface Lua está en `/data`. C está temporalmente en `/tmp` y se retiró al terminar: **persistencia nativa todavía pendiente**. GrupoUI28 no implica sandbox: guest FLAT comparte memoria y privilegios. Nunca trasladar direcciones/imports ni lookup a M2315W1 sin ABI/modelo de privilegios/recuperación específicos y aprobación del gate físico.

Siguiente checkpoint único: **mostrar en el launcher LVGL un frame RGB565 producido por el worker C**, con intercambio de buffers y cierre seguros. Input concurrente y WAD legal precederán la integración del motor.
