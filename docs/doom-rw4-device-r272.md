# R272: libc propia y puente del motor enlazados en PC

No se operó sobre el reloj. Se sigue preparando el ensayo agrupado de E1M1,
no nuevos probes físicos. DOOM físico continúa pendiente.

## Dependencias y biblioteca C

Se enlaza una instancia privada de newlib/libm soft-float, de la toolchain Arm
14.3 ya revisada. [Hashes fijados](../doom/platform-rw4/device/newlib.lock.json).
Strings, scanf, atof, fabs y formatos ya no dependen de la ABI flotante ni de
reent/FILE privados del firmware. Solo el worker del motor usa esta libc.
Los streams del WAD siguen pasando como punteros opacos al firmware mediante
wrappers separados rw4_host_*; nunca FILE de newlib.

[_malloc_r y familia](../doom/platform-rw4/device/libc-glue.c) pasan por el
allocator contabilizado del runtime. La consola nueva solo guarda un tail propio
de256bytes; no abre drivers ni imprime por el shell. _sbrk falla, no reserva
memoria por fuera del presupuesto. No se usan syscalls de escritorio para FS,
procesos o señales; el motor conserva sus escrituras denegadas.

**Una instancia por ejecución:** al limpiar el runtime se liberan sus reservas,
incluidas las de libc. Pueden quedar punteros internos de newlib a buffers ya
liberados; no se vuelve a llamar esa libc después de cleanup. Se requiere join
y unload antes de iniciar otra instancia limpia. La UI podrá leer estadísticas
después del join, sin volver al printf privado. Esta regla se refleja en el puente.

Prueba S3 con las mismas fuentes y multilib v7-a/nofp: dos módulos independientes,
uno para salida normal y otro para OOM intencional. Cada uno completó18 checks:
scanf decimal/hex/octal, atoi/atof/fabs, strings, formatos con double, logger,
calloc/realloc, lectura/seek/EOF del stream opaco, denegación de writes y cierre.
Ambos: seis reservas/seis liberaciones, cero bloques/streams propios finales,
pico contabilizado1248bytes, fixture7bytes intacto. No es la memoria de Doom.
ELFs y fixture temporales retirados; no reloj ni nueva dependencia descargada.

## Fallos encontrados y correcciones

La ruta de multilib S3 era v7-a/nofp, no v7/nofp: guard corrigió la selección
antes de cargar. Newlib S3 aporta memcpy optimizado en ARM state, mientras
esta ruta del loader Thumb solo admite destino FUNC Thumb en THM_CALL.
Se observaron llamadas a memcpy de valor par y rechazo insmod22. Se incorporó
un memcpy byte a byte propio, compilado Thumb, y el mismo fixture pasó después.
No se habilitó una relocación desconocida para saltarse el rechazo.

Los tipos MOVW/MOVT47/48 emitidos por la biblioteca S3 se contrastaron con el
handler0x65c83a del guest fijado antes de admitirlos. RW4 usa su multilib distinto;
el candidato final R272 solo contiene ABS32/THM_CALL/THM_JUMP24, aún sin aprobar
para hardware. Se fijaron VMA0 para cada sección ET_REL del linker; no se
atribuye solo a esa corrección el rechazo observado. Logs y candidatos fallidos
se conservaron; se verificaron hashes antes de retirar sus temporales propios.

## Adaptador y ejecución

[adapter.c](../doom/platform-rw4/device/adapter.c) implementa las seis DG usando
el motor original, E1M1 y controles UP/LEFT/RIGHT/FIRE. No cambia gameplay.
El reloj candidato devuelve ticks64; la conversión /10 asume10000ticks/s,
inferidos estáticamente en R271, todavía sin validación física de temporización.
El run tiene cota cooperativa120s; no es un watchdog que interrumpa un bloqueo.

[transport.c](../doom/platform-rw4/device/transport.c) contiene:

- Dos nodos propios: control y frames. Fops32 y file opaco; un lector por nodo,
  cursores propios y EOF. No copia el f_priv/layout del S3.
- START crea un worker con stack solicitado32768bytes. INPUT publica cambios
  mantenidos en una cola SPSC; PAUSE/RESUME y STOP liberan controles.
- JOIN solo después de finished y sin lector de frames; su éxito confirma
  retiro del worker. No basta una bandera de completion para autorizar unload.
- Gate común que bloquea unload con handles abiertos y nuevas aperturas cuando
  inicia la retirada. Unregister parcial/error retiene código; no retry automático.
- Dos buffers RAM RGB565LE320×200. Header propio32bytes, generación/tic/FNV.
  No escribe frames a flash ni llama LVGL desde el worker.

Prueba del C de este puente en S3 con kernel/worker simulados: secuencias,
controles, pausa, frames, lecturas por fragmentos/EOF, exclusividad, bloqueo de
unload, STOP/JOIN y retirada pasan. Los1037 checks incluyen1000 lecturas de
fragmentos de un mismo frame: **no son1037 escenarios independientes**.
No valida pthread real, scheduling concurrente, fops físico ni Doom integrado.
Módulo/ELF propios de esa prueba retirados.

## Resultado de enlace

Motor + runtime + libc + adaptador + puente, objeto de600012bytes,
SHA256 `2629256b9de4357da1c984a9f2c6371e9fa346770e37cbaa5badc5e0f8e9b1cb`.
Estático897436bytes; con zona6MiB, DG256000 y stack32768:
subtotal7477660bytes antes de loader/heap overhead/otros recursos.
No demuestra RAM disponible ni viabilidad física. No contiene copia del WAD.

Ya no hay imports DG ni dependencias libc sin resolver. Quedan20 imports
rw4_host_* exclusivamente de memoria, stdio opaco, tiempo, tareas y registro.
No son veinte mecanismos nuevos: incluyen los wrappers previamente probados,
otros inferidos y servicios de worker todavía pendientes de contrastar.

**Aún no instalable.** Faltan bindings revisados/fingerprints de arranque,
owner/marker del paquete, ruta y packaging persistente del WAD, validación del
worker real y entrega de imágenes al LVGL RW4. El frame es un protocolo propio,
no un descriptor LVGL v8/v9 ni un PNG: no enviarlo directamente a Image:set_src.
Los constructores de C no convierten formatos ni direcciones de S3 en prueba RW4.

```powershell
node tools/build-doom-rw4-libc.mjs
node tools/build-doom-rw4-device.mjs
# Validaciones específicas en el emulador owned; no USB:
node tools/test-doom-rw4-libc.mjs
node tools/test-doom-rw4-transport.mjs
```

Estos builds reutilizan el motor R271 sin recompilar80archivos. La prueba
privada-libc recarga un módulo limpio por caso, sin rearmar nada en el reloj.
Continuar con los20bindings y la presentación LVGL, luego integrar E1M1 en
el emulador con las nuevas fuentes antes del plan físico agrupado.
