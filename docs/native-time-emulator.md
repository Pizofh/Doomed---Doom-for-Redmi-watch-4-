# Reloj monotónico y espera en C

R56, 2026-10-03 (Bogotá). **Confirmado solo en el emulador S3 exacto:** CLOCK_MONOTONIC funciona desde C y una espera relativa suspende la tarea de consola mientras el panel stock responde. Se completaron257 lecturas no decrecientes y19 esperas, sin Doom ni hardware físico. Esta prueba no valida dormir en el hilo de UI ni define todavía el scheduling del motor.

## ABI y evidencia estática

Guest SHA256 `849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa`, FLAT Cortex-A7/EABI5/hard-float. No usar estas direcciones o tipos en M2315W1. El módulo sigue compartiendo memoria y privilegios del sistema; no es un proceso sandbox.

`inspect-time.mjs` revisa símbolos, desensambla funciones de tiempo y conserva tipos DWARF acotados. El guest define CLOCK_MONOTONIC1 y CLOCK_REALTIME0. `clock_gettime(1)` salta a clock_systime_timespec, que lee up_timer_gettick; el caso0 suma g_basetime. Así se identifica el mecanismo compilado independiente de la hora de calendario. No se cambió la hora del sistema para probarlo.

DWARF: time_t→int64_t→entero signed de8 bytes; long signed de4; timespec ocupa16, tv_sec offset0 y tv_nsec offset8. El módulo usa su propia declaración verificada, con padding explícito; no toma time.h de newlib/Windows como ABI del guest. Debug macros: CONFIG_SYSTEM_TIME64=1, CONFIG_USEC_PER_TICK=100 y SCHED_TICKLESS=1. Estos datos no garantizan que una espera de100µs o1ms despierte con esa precisión.

La fuente primaria relacionada [OpenVela time.h fijado](https://github.com/open-vela/nuttx/blob/9e79ad292fd103d3b9ef737757081a3f7fbbf9a4/include/time.h) documenta clocks/prototipos y [clock_gettime.c](https://github.com/open-vela/nuttx/blob/9e79ad292fd103d3b9ef737757081a3f7fbbf9a4/sched/clock/clock_gettime.c) su semántica. No se identificó esa revisión como fuente exacta del guest: el archivo moderno separa nxclock_gettime, mientras este ELF contiene la lógica directamente en clock_gettime. Las conclusiones sobre layout y branches se apoyan en el binario inspeccionado.

| Import ligado al guest | Dirección Thumb | Contrato utilizado |
|---|---|---|
| clock_gettime | 0x606b65 | ID1, puntero válido timespec16, devuelve0 |
| clock_nanosleep | 0x656609 | ID1, flags0, petición relativa normalizada, devuelve error positivo o0 |
| nxsched_gettid | 0x606999 | Identificar la tarea que ejecuta el initializer |
| printf | 0xfa2d25 | Logs de enteros, sin punteros o datos privados |

El branch relativo de clock_nanosleep llama nxsig_nanosleep; se inspeccionó su espera con nxsig_timedwait y retorno. No se usa TIMER_ABSTIME, señales enviadas, cambio de hora, RTC, driver directo ni hooks. La inicialización ejecuta un número fijo de lecturas/esperas y retorna, sin workers o referencias a código retenidas. Data/BSS0 bytes. No writes de filesystem desde C.

## Mediciones

Ensayo final `artifacts/emulator/native-time-1791081427770/result.json`:

| Petición | Mediciones del ensayo final |
|---|---|
| Lecturas consecutivas | 257, sin retroceso;3 cambios observados, se permiten valores iguales |
| Espera0ms,3 veces | 0,1–0,5ms |
| Espera1ms,3 veces | 5,3–15,0ms |
| Espera10ms,3 veces | 14,9–15,9ms |
| Espera50ms,3 veces | 61,5–63,0ms |
| Espera100ms,3 veces | 108,4–109,9ms |
| Espera250ms,3 veces | 264,6–265,3ms |
| Espera4000ms,1 vez | 4006,7ms |

Todas devolvieron0. La conversión a uint32 milisegundos coincidió con los deltas medidos dentro de la cuantización de1ms. El módulo incluye una comprobación aritmética de wrap uint32 (4294967295→4, delta5); el compilador la resuelve en compilación. No se ejecutó durante49 días ni se ensayó un rollover real de uptime.

Hay variación entre ensayos: en intentos anteriores1ms tardó hasta17,3ms. No se aisló causa Windows/QEMU/scheduler ni se optimizó el host. No afirmar precisión de1ms, FPS del motor ni garantías de tiempo real. Un futuro motor debe usar elapsed time; no sumar el tiempo solicitado como si fuera el real.

Las peticiones son de0..4000ms,18 pequeñas y una larga (5233ms solicitados en total). El timeout host20s limita al cliente ADB, **no al código guest**. Los checks después del retorno aceptan100µs de tolerancia inferior y hasta2s de retraso por espera; son criterios de prueba, no watchdog ni cota dura del scheduler. C no reintenta una espera interrumpida: cualquier rc distinto de0 falla visiblemente. Interrupciones/errores no se provocaron en este ensayo.

## UI, salida e intentos anteriores

El runner exige la watchface normal Storage365700764; el AOD type2 también puede figurar in_use1 y se excluye al identificar la watchface type1. Comprueba antes del payload que un gesto abre el panel stock y que regresa a la misma imagen. Una captura congelada por screen OFF no basta.

Durante la espera larga, ps identifica la tarea del initializer como `sh -c insmod`, Waiting Signal. La tarea miwear sigue separada. Se capturó el panel abierto y otro ps **después de la captura** confirmó que el mismo PID seguía esperando: no se depende solo del flag del cliente, cuyos callbacks pueden retrasarse mientras captura con spawnSync. Evidencia en `ps-during-wait.json`, `ps-after-panel-capture.json`, `ui-during-wait.json` y screenshot panel-during-wait. No se pulsaron toggles del panel. Se cerró el panel y los píxeles de Storage fueron idénticos antes/después.

Se confirmó retorno antes de rmmod. El módulo y `/tmp/rw4-time-probe.elf` quedaron ausentes sin reboot para salir. No se instalaron assets ni cambió la watchface de controles almacenada.

Intentos conservados:

- `native-time-1791081104112`: preflight rechazó dos in_use1 (normal+AOD); no C ejecutado.
- `native-time-1791081148756`: C pasó; helper esperaba nombre nsh y encontró sh -c insmod; prueba visual no iniciada. Descarga y archivo retirado.
- `native-time-1791081226313`: C pasó; panel no abrió. Log confirmó ON→OFF previo por300s de inactividad, con captura congelada. Descarga/cleanup completos; se hizo un reset del guest limpio solo para baseline activo.
- `native-time-1791081359409`: panel respondió y cleanup pasó con pantalla activa. La prueba final siguiente añade ps posterior a captura para resolver posible retraso de callbacks del host.
- `native-time-1791081427770`: contrato final completo pasa, sin reset para cleanup.

## Reproducción y siguiente gate

```powershell
node tools/inspect-time.mjs
node tools/build-time.mjs
node tools/run-time-emulator.mjs
```

Solo el emulador ya iniciado por el usuario, servidor5039/serial emulator-5554. El helper comprueba propiedad del QEMU, hashes de herramientas/guest/source/binario y readback antes de insmod; realiza backup del data image pausado. No hay target USB, firmware alternativo ni comando libre. Si la pantalla está OFF, el preflight se detiene antes de ejecutar C; inspeccionar y recuperar un baseline del emulador con los módulos descargados.

| Artefacto | SHA256 |
|---|---|
| time-probe.c normalizado LF | `1380bc88db44387cd5517a7ae7c5fca5429b7182810fdb4a36ed1e6eeab95bcd` |
| time.elf,2228bytes,entry309,12 ABS32 | `4cceedf220a4df9133b89fc8f29db45a6cf9d22fe54efe31b30d1810b934012d` |

CLOCK_MONOTONIC es candidato para DG_GetTicksMs; clock_nanosleep puede esperar desde una tarea adecuada. **No usar esa espera en el callback LVGL probado**: bloquearía ese caller. El bridge anterior no se modificó, no llama estas APIs y sigue sin contener motor. La futura integración necesita una decisión explícita sobre ticks/scheduling/display/input, medir su coste y conservar salida.

Siguiente meta única: acceso aleatorio a un archivo propio desde C (open/read/seek/close y errores), primero con un fixture sin assets. Después podrá verificarse WAD shareware y su procedencia/licencia. Doom sigue sin compilar; memoria prolongada, crash/recovery, persistencia y compatibilidad física permanecen pendientes. Gate físico cerrado.
