# R71: presentación cada50ms

El 2026-10-04 se redujo Timer Lua200→50ms en el emulador S3. La entrega de imágenes subió3,58× y los cambios visibles observados durante giros2,67–2,78× frente a R70. Motor C/ELF R67 intactos; no nuevas compilaciones C, herramientas ni descargas. M2315W1 permanece sin conectar.

Resultado `artifacts/emulator/doom-perf-1791153000333/result.json`, passed=true; comparación en `comparison.json` del mismo directorio. Se conservan secuencia reposo/derecha/izquierda, duraciones, RPC/PNG/hash, espera40ms de muestreo y preflight. Se añade comprobación de pausa al terminar la medición, antes de EXIT; no modifica la ventana comparada.

| Medida | R70, Timer200ms | R71, Timer50ms |
|---|---:|---:|
| Frames perfilados |33|119|
| Intervalo medio entre entregas |205,30ms|57,31ms|
| Entregas de fuente/s |4,87|**17,45**|
| Pipeline medio hasta set_src/get_img_size |1,48ms|1,57ms|
| Pipeline P95/máximo |1,70/2,90ms|2,00/2,40ms|
| Callback Timer medio/máximo |1,89/3,80ms|1,95/3,30ms|
| Cambios visibles/s, giro derecha |5,08|**13,55**|
| Cambios visibles/s, giro izquierda |4,57|**12,67**|
| Tics de juego/s, ventana corta |35,00|34,93|

119frames y141callbacks registrados sin truncar buffers.75capturas:16reposo/29derecha/30izquierda; cambios8/27/25, ventanas1152/1992/1973ms. Máximo intervalo de muestreo80ms: puede saltarse imágenes presentadas cada57ms. Los cambios visibles son **cotas inferiores**, no FPS exacto;17,45 es entrega de fuente, no finalización de flush. No afirmar20FPS ni extrapolar a RW4.

Motor: ventana6327ms/221tics/110frames producidos/442callbacks DG. Ritmo de simulación conservado en este ensayo. Cada frame sigue320×200RGB565, dos slots y dos copias tmpfs; no cambiaron resolución, gameplay, renderer, prioridad, memoria nativa o input.

Cuatroedges de input: handler0,20–0,80ms; Timer confirma entrega27,90–54,20ms (media40,18), frente a29,70–151,30ms (media75,60) anterior. Solo cuatro muestras por configuración, distintas fases respecto al Timer: no estimación estadística de latencia real. Host observa tecla/ángulo procesados antes de51,37/48,80ms en giros; incluye RPC/ADB/polling, no touch-a-fotón.

## Cambios y validación

`main.lua`: constantes frame_period50/trace_limit256, reporte de periodo/límite y buffers acotados ampliados desde128 para el mayor ritmo. La instrumentación tiene costo y permanece activada. `measure-doom-emulator.mjs`: acepta perfil explícito50/200, exige reporte completo sin truncar y añade menú/neutralidad/congelación400ms/EXIT. No cambia el muestreo comparable ni fuerza unload/kill.

Pausa: tic/posición/ángulo/munición/drawn/produced congelados, epoch confirmado y teclas neutrales. EXIT: worker88 ausente antes de unload,13alloc/free, streams0, cleanup0, pico tracked6582961bytes. Launcher Ready: exited, sin reboot para salir. No repetir suites anteriores por este cambio de intervalo; no prueba crash, horas de estabilidad o ergonomía.

Lua SHA256 `8e347b1b0a0ea4706e50761ca3a58739fe985660585afbd6b1b8f008f54990aa`; paquete21608bytes/SHA `ced173992bf6b787abde199c8af2399f8e19b6d05d89b34e0298fad42be2f963`. ELF446144bytes/SHA `e115971e75ec32f33e2ee63a3c2af9799b8d207f73c3779db3bb31b53cef9639` conservado. Guards/revisión C siguen vigentes. Sintaxis Node, build Lua/readback y diff comprobados.

Refresh respaldado sin reset. Baseline screen OFF requirió backup/reset **antes de stage/C**, `doom-fast-baseline-1791152867635`. Primer guard de captura aún no encontró ADB listo; connect posterior y panel responsive permitieron continuar, sin segundo reset ni ejecución del motor durante ese fallo de arranque.

Reproducción: mismos comandos de [R70](doom-performance-emulator.md#reproducción-y-estado), con fuente R71 actual y UIProbe inactiva para refresh. Artefacto stage `doom-ui-stage-1791152986066`; cleanup `doom-ui-cleanup-1791153170789` verificó WAD intacto y retiró tmp; final read-only `doom-fast-final-1791153209832`, passed=true. Storage365700764 activa; UIProbe365799903 perfil R71 almacenada; worker/módulo/nodos/copias/ELF/WAD tmp ausentes.

Siguiente checkpoint único: una sesión acotada de90s a50ms, observando heap/cache/archivos a lo largo del tiempo y salida limpia, dentro del límite cooperativo120s existente. No ampliar límites nativos ni repetir la batería. Persistencia de Doom y gate físico siguen pendientes; FLAT sin sandbox.
