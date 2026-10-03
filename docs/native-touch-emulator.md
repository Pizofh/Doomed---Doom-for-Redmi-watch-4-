# Touch desde C: observador independiente

Resultado del 2026-10-03: un módulo C propio leyó 36 muestras de `/dev/input0` mientras TouchEvents y el panel stock seguían respondiendo. Cerró su descriptor, retornó y se descargó mediante `rmmod`; después un tap volvió a actualizar TouchEvents. No hubo reboot entre carga y comprobación posterior. **Solo emulador Watch S3; ninguna prueba M2315W1.**

## Contrato antes de ejecutar

Imagen SHA256 `849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa`, build FLAT. Se desensamblaron `touch_open`, `touch_event`, `touch_event_notify`, `touch_read`, `touch_close`, `touch_ioctl`, `goldfish_events_register`, `goldfish_events_worker`, `touchscreen_read`, `read` y `__errno`.

- `touch_open` asigna estructura y circbuf por apertura, guarda el lector en `filep->f_priv` y lo agrega a la lista.
- `touch_event` notifica cada lector salvo que exista un grab exclusivo. Leer nuestro circbuf no drena el de LVGL.
- `touch_read` prueba bit 6 de flags antes de esperar: `O_NONBLOCK=64`; devuelve `-11` si está vacío. El wrapper `read` convierte errores a `-1` y guarda errno en TLS.
- `touch_close` elimina el lector y libera circbuf, semáforo, mutex y estructura. El programa cierra antes de retornar: no deja callbacks/tasks apuntando al módulo descargado.
- El worker y lector LVGL utilizan muestras de 32 bytes: npoints offset0, flags9, x10, y12 y timestamp en microsegundos offset24. El worker confirma escrituras de esas posiciones; no deducimos esta ABI solo desde un header moderno.

Como referencia primaria se consultaron [touchscreen_upper.c](https://github.com/open-vela/nuttx/blob/9e79ad292fd103d3b9ef737757081a3f7fbbf9a4/drivers/input/touchscreen_upper.c), [touchscreen.h](https://github.com/open-vela/nuttx/blob/9e79ad292fd103d3b9ef737757081a3f7fbbf9a4/include/nuttx/input/touchscreen.h) y [fcntl.h](https://github.com/open-vela/nuttx/blob/9e79ad292fd103d3b9ef737757081a3f7fbbf9a4/include/fcntl.h). El código actual usa spinlocks y tiene más ioctls; el guest usa mutexes y un contrato más antiguo. Coincide la semántica de colas individuales y el layout contrastado, **no se identifica esa revisión como fuente exacta del firmware**. No se invoca ningún ioctl, especialmente TSIOC_GRAB.

## Programa y prueba

`experiments/native-touch/observer.c` abre solo `/dev/input0` con `O_RDONLY|O_NONBLOCK=65`. Hace hasta 500 lecturas, cada una seguida de un `usleep(20000)` solicitado; imprime muestras válidas y cierra. No escribe framebuffer, no llama LVGL, no inyecta eventos ni modifica archivos/configuración. Los gestos sintéticos los envía el host mediante el gRPC ya revisado.

El runner valida procedencia/ownership del emulador, hashes de imagen y payload, ausencia de módulo/archivo temporal, copia pausada del data disk y readback del ELF. Carga únicamente `/tmp/rw4touch-observer.elf`, nombre `rw4touch`; descarga y elimina ese archivo después. Usa ADB loopback, servidor5039 y serial emulator-5554; excluye transporte físico. Un timeout del cliente no mata el código guest: si falla, detenerse a inspeccionar, no descargar código todavía activo.

Antes de la prueba, los logs mostraban UI OFF por inactividad. Se reseteó **solo el guest** para establecer baseline; TouchEvents respondió a un tap antes de cargar. No se alteró power management ni se necesitó otro reset para salir.

Evidencia local ignorada: `artifacts/emulator/native-touch-1791048828975/`, capturas homónimas en `artifacts/emulator/screenshots/`.

```text
RW4_TOUCH_EVENT: n=2 flags=11 pos_valid=1 raw=60,90 last=60,90
RW4_TOUCH_EVENT: n=13 flags=11 pos_valid=1 raw=145,225 last=145,225
RW4_TOUCH_EVENT: n=14 flags=14 pos_valid=1 raw=145,225 last=145,225
RW4_TOUCH: complete events=36 idle=464 close=0 result=0
```

Flags son hex: `11` = DOWN|POS_VALID, `14` = UP|POS_VALID. Este camino sintético repite DOWN en movimientos: no emite necesariamente TOUCH_MOVE. Hay también muestras UP al mover el puntero ya liberado. Un adaptador deberá conservar estado previo para distinguir primer press, movimiento sostenido y release; no basta con contar cada DOWN como una tecla nueva. Se leyeron coordenadas absolutas, distintas de `get_vect()` de Lua.

Capturas revisadas: durante el observer TouchEvents mostró release x:7,y:3; el panel stock abrió; tras cerrarlo y descargar C un tap mostró release x:0,y:0. Son salidas Lua/stock concurrentes, **no widgets creados desde C**. C muestra coordenadas en logs. El módulo apareció en lsmod y dejó de aparecer tras rmmod; descriptor close=0 y shell posterior intacta.

ELF: 1.840 bytes; SHA256 `57a649bfcac60d98ed1120197d69ca19a2c26a98ad2c59ffd820eb9b055b8d54`. Fuente normalizada LF: `531a6a4f12c719850e0130da5ad1906382384f9de44764b1de9cd01d6901e361`. Dos builds produjeron el mismo hash. Solo imports revisados, resueltos desde el ELF exacto; relocaciones R_ARM_ABS32 y entry Thumb1. Sigue siendo código FLAT con capacidad de afectar todo el sistema, no sandbox.

## Reproducción y límites

Con TouchEvents activo **y respondiendo**, ejecutar desde la raíz:

```powershell
node tools/build-touch.mjs
node tools/run-touch-emulator.mjs
```

El runner comprueba mensajes/coordenadas/cierre/descarga; las capturas deben revisarse para confirmar la respuesta stock. No arranca otra instancia ni resetea automáticamente. La copia del data disk no es snapshot RAM ni prueba de consistencia/restauración.

Los 500 sleeps solicitaron 10 segundos acumulados; el cliente insmod tardó aproximadamente 15,6 segundos en esta prueba. No es medición de frecuencia, deadline garantizado ni validación del reloj monotónico. No medimos pérdidas de eventos, latencia, memoria pico, fugas prolongadas o capacidad de la cola. Los macros del driver no prueban cuántas muestras efectivas caben.

Checkpoint posterior: [pantalla Lua propia, EXIT y pause/resume](lua-ui-emulator.md). Falta integrar C con ese contexto y lifecycle; timing monotónico y filesystem para WAD pendientes. DOOM y gate físico siguen pendientes.
