# Tarea C separada: creación, parada y join

R59, 2026-10-03 (Bogotá). **Confirmado solo en el guest S3 exacto:** un initializer NSH creó tres pthreads propios. Dos terminaron por señal cooperativa y uno por límite de trabajo. Se recogieron con pthread_join antes de descargar el módulo. El panel stock respondió mientras el primer worker seguía activo. No Doom, WAD ni hardware físico.

Esto no valida todavía START/EXIT de un worker desde el launcher. El propietario NSH permanece vivo hasta recoger sus hilos y retornar; no se dejó un worker ejecutándose después de retornar el initializer. Tampoco se llamó join ni sleep desde UI.

## ABI inspeccionada

Guest SHA256 `849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa`, FLAT Cortex-A7/EABI5/hard-float. No usar sus direcciones/ABI en M2315W1. Un pthread comparte memoria y recursos del sistema: no crea un sandbox ni frontera de privilegios.

DWARF: pthread_t→pid_t→int signed32. Punteros de32 bits; función de entrada void*→void*. El wrapper pthread_create pasa un trampoline de firmware a nx_pthread_create. El trampoline compilado pthread_startup llama nuestra función y después pthread_exit con el valor retornado: el worker puede retornar normalmente. No invoca directamente el startup interno, que espera que el trampoline no retorne.

Se usa attr=NULL, sin inventar un layout de pthread_attr_t ni alterar prioridades. La build declara CONFIG_PTHREAD_STACK_DEFAULT4096, PTHREAD_CREATE_JOINABLE0 y CONFIG_SMP_NCPUS1. El runtime posterior confirma un worker pthread joinable distinto de su propietario, grupo compartido y prioridad100. No se configura otro scheduler o core.

Fuentes relacionadas fijadas: [pthread.h OpenVela](https://github.com/open-vela/nuttx/blob/9e79ad292fd103d3b9ef737757081a3f7fbbf9a4/include/pthread.h), [creación](https://github.com/open-vela/nuttx/blob/9e79ad292fd103d3b9ef737757081a3f7fbbf9a4/sched/pthread/pthread_create.c) y [join](https://github.com/open-vela/nuttx/blob/9e79ad292fd103d3b9ef737757081a3f7fbbf9a4/sched/pthread/pthread_join.c). No se identificó esa revisión como fuente exacta del guest. Join moderno gestiona información de join de otra forma; se contrastaron llamadas, retorno y espera con el código compilado exacto.

| Import | Dirección Thumb | Uso |
|---|---|---|
| pthread_create | 0x65ef71 | Handle signed32, attrNULL, función/arg propios |
| pthread_join | 0x6553e5 | Handle válido de nuestro hilo, captura cookie de retorno |
| nxsched_gettid | 0x606999 | IDs de propietario y worker |
| clock_gettime | 0x606b65 | MONOTONIC1, timespec16/sec64 ya contrastados |
| clock_nanosleep | 0x656609 | Espera relativa solo desde NSH/worker |
| printf | 0xfa2d25 | Marcadores desde propietario NSH |

## Ownership y parada

`experiments/native-task/task-probe.c` usa seis atomic_uint de32 bits y argumentos inmutables hasta join. Se exige ATOMIC_INT_LOCK_FREE2; el código generado usa loads/stores alineados y DMB, sin helpers atómicos importados. La señal stop y ready usan release/acquire; el resultado se lee después de join. La prueba no es un stress test de sincronización ni valida todavía cola de input o frames concurrentes.

El worker únicamente cuenta pasos y espera. No toca UI/LVGL, archivos, drivers o configuración. Ciclo0: máximo80 esperas de100ms, con ventana del propietario de4s; ciclo1: tres esperas de50ms y terminación natural; ciclo2: máximo40 esperas de50ms, parada después de250ms. Los bucles son finitos; el número de llamadas no garantiza una duración máxima si una syscall/scheduler se cuelga. No watchdog duro ni pthread_cancel/kill.

El contrato module_info16 conserva un uninitializer. Pending_join se marca antes de crear; con ese flag devuelve -EBUSY16. Se comprobó mediante llamada directa del propietario en los tres ciclos, **no intentando rmmod concurrente mientras se ejecuta init**. Tras join exitoso se limpia el flag. Si join falla, el initializer retorna0 para conservar el módulo y su uninitializer ocupado, imprime join_failed_retained y omite done; el runner no descarga. Esa rama se revisó, no se inyectó fallo de join. No afirmar recuperación automática.

Un error de creación no deja un worker propio; errores controlados posteriores primero solicitan stop y hacen join. El timeout ADB termina el cliente, no el código del guest: ausencia de done exige inspección. No descargar un módulo con un worker o referencia viva.

## Resultado y evidencia

ELF ET_REL3288 bytes, entry0x115,25 R_ARM_ABS32, seis imports; .bss36 bytes, .data0. Fuente normalizada LF SHA256 `b69f308bb56cabd4fba03d4634dc1f5b605d3dacfd57c74b44fc9a3d822d5fb6`; ELF `0a6065fbb3588716ce2093285db69cb2b794d84fab34b8c977ad8bca0639a6f3`. ABI, entry/callbacks, atomics y código generado se revisaron antes de fijar pins y cargar.

Artefactos ignorados: `artifacts/emulator/native-task-1791084264858`; propietario NSH54.

| Ciclo | Worker | Pasos | Terminación | Join observado | Cookie |
|---|---|---|---|---|---|
| 0 | 55 | 38 | Stop cooperativo | 61ms,rc0 | 34570001 |
| 1 | 75 | 3 | Límite natural | 124ms,rc0 | 34570012 |
| 2 | 82 | 6 | Stop cooperativo tras restart | 47ms,rc0 | 34570021 |

Los tiempos son desde el comienzo de join hasta su retorno, en este ensayo. El join natural incluye esperar trabajo todavía pendiente; no es una medición de overhead ni una garantía de latencia futura.

UI: durante la ventana4s se abrió el panel y se capturó. Ps antes y después de la captura muestra worker55, grupo54, tipo pthread, Waiting Signal. Propietario54 también esperaba y miwear28 estaba Ready. Se valida que el mismo worker aún existía después de abrir/capturar el panel; el flag del cliente por sí solo podría quedar atrasado durante spawnSync. Se cerró el panel y se volvió a Storage sin activar botones/configuración.

Las dos muestras ps del worker muestran STACK4072/USED592. No son RAM pico total, cobertura completa de stack ni presupuesto para Doom. No se midió CPU del motor o rendimiento.

Los tres join verifican cookies, razones y conteos. Done cycles3/pending_join0 precede rmmod; uninit imprime pending_join0. Ps final no contiene55/75/82, lsmod no contiene rw4task, el ELF propio se retiró. Storage365700764 continúa activa y sus píxeles antes/después coinciden. **Salida/cleanup sin reboot.**

## Incidencias previas al payload

Primer preflight `native-task-1791084176550` no reconoció panel: guest estaba SCREEN_STATE_OFF por inactividad según log02:42:19. Se detuvo antes del push/insmod; no se ejecutó C. Se verificó ausencia de módulos propios/ELF, se respaldó data y se reseteó una vez el guest limpio para baseline, sin cambiar watchface/caché. Registro `artifacts/emulator/task-baseline-reset.json`. No es un reboot para terminar el worker.

Durante esa revisión se corrigió el helper para reconocer tipo pthread en minúscula en ps antes del ensayo C. No hubo payload nativo fallido cargado. El preflight de UI activa sigue siendo obligatorio; una imagen congelada no prueba que touch responda.

## Reproducción y siguiente checkpoint

Emulador revisado ya activo, Storage normal seleccionada, pantalla activa y ningún otro módulo propio cargado:

```powershell
node tools/inspect-task.mjs
node tools/build-task.mjs
node tools/run-task-emulator.mjs
```

El runner fija source/ELF/guest/ADB, verifica QEMU/puertos loopback, excluye USB, respalda data, exige preflight antes del push y verifica readback. Solo copia/retira `/tmp/rw4-task-probe.elf`. No resetea automáticamente ante pantalla OFF. Herramientas cambiadas cierran el gate de carga. PowerShell target TaskProbe; Node evita cambiar ExecutionPolicy.

**Siguiente meta única:** conectar START y EXIT del launcher a un worker C de prueba sin bloquear UI. Deben contrastarse ownership al retornar init, señal de parada, recogida fuera de UI y descarga con referencias pendientes. Usar un payload de contador, sin simular gameplay. UI, input y frames requieren sincronización separada; nunca llamar LVGL desde ese worker. Después vendrán WAD legal y motor real, recursos prolongados y persistencia; gate físico cerrado.
