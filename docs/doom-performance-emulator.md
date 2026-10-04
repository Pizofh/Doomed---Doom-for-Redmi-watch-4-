# R70: medir presentación y controles antes de optimizar

El 2026-10-04 se midió el port original E1M1 en el emulador S3 con el mismo C/ELF R67 y Timer Lua de200ms. La UI instrumentada presentó33 imágenes;75 capturas rápidas comprobaron cambios visibles durante reposo y giros. EXIT retiró worker88 y recursos propios sin reboot ni unload host. No se tocó M2315W1.

Resultado `artifacts/emulator/doom-perf-1791152085442/result.json`, passed=true. La medición identifica un límite concreto: el intervalo de presentación domina el costo de copiar y asignar una imagen a LVGL. Probar50ms es la siguiente optimización razonable; **no se ha aplicado ni demostrado20FPS**.

## Medidas

33 frames; duraciones en milisegundos. Percentiles: elemento ordenado `floor((n-1)*p)`, sin interpolación.

| Etapa UI | Media | P95 | Máximo |
|---|---:|---:|---:|
| Abrir/leer128028bytes/cerrar stream |0,90|1,20|1,80|
| Metadata/header y copia Lua de payload |0,08|0,10|0,10|
| Validación del slot propio y comando cache |0,15|0,20|0,30|
| Abrir/escribir/cerrar copia tmpfs128012bytes |0,11|0,10|0,20|
| set_src o crear Image, flags y get_img_size |0,24|0,30|0,60|
| Pipeline completo hasta retornar de esas llamadas |**1,48**|**1,70**|**2,90**|

Intervalo entre inicios de33 entregas:32 muestras, media205,30ms/P95213,70/máximo215,20;4,87 entregas/s. Callback completo Timer:39 muestras, media1,89ms/P952,50/máximo3,80. Entregar fuente a LVGL **no es confirmar finalización del render/flush**. No se midió por separado el costo posterior del renderer LVGL ni scanout.

En ventana del motor6343ms:222tics (~35,0/s),31frames producidos,444callbacks DG. Tics, callbacks, producción, entrega de fuente y cambios visibles son contadores distintos. No llamar70callbacks/s «70FPS».

Capturas read-only del área320×200, RGB normalizado y SHA256 por imagen:

| Ventana | Capturas | Cambios consecutivos | Duración entre extremos | Cambios/s observados |
|---|---:|---:|---:|---:|
| Reposo |16|3|1140ms|2,63|
| Giro derecha |28|10|1970ms|5,08|
| Giro izquierda |31|9|1971ms|4,57|

Máximo intervalo de muestreo82ms; loop espera40ms además del RPC, PNG y hash. La imagen estática puede repetirse, y se pueden perder cambios entre capturas: son **cotas inferiores de cambios visibles**, no FPS exacto del display. Ventanas cortas y diferentes extremos explican que una tasa de cambios supere ligeramente la tasa media de entregas. El muestreo también consume recursos del PC.

Cuatro edges de input (giro/release): handler UI0,30–0,60ms; confirmación posterior observada por Timer29,70–151,30ms. Esta última incluye la espera al próximo callback; no es latencia exacta del motor. El host observó tecla entregada y ángulo cambiado antes de46,91ms y116,14ms en dos giros; incluye RPC, polling, ADB y scheduling. No se midió touch-a-fotón con cámara ni ergonomía física.

## Instrumentación y reloj

Solo cambió `experiments/doom-ui/main.lua`: reloj alrededor de etapas, buffers limitados128frames/128callbacks/64edges, salida de trazas después de unload. No impresión por frame durante juego; los buffers siguen teniendo costo/allocations y estos resultados pertenecen a la build instrumentada. El handler registra después de escritura exitosa y el Timer confirma requested/applied/delivered_keys coincidentes con changes posterior. Una transición rápida que sustituya otra pendiente podría quedar sin muestra; este ensayo mantuvo cada giro unos2s.

En este **guest exacto**, os_clock0x794738 llama clock0x654ae0, luego clock_systime_ticks0x605a94/up_timer_gettick0x609664 y divide por10000. Disassembly guardado en `doom-perf-clock-review-1791151751886`; el incremento entre dos llamadas separadas por400ms fue0,4495s, incluyendo ADB. Aquí `os.clock()` refleja tiempo transcurrido del guest, **no asumir esta semántica en Lua estándar/RW4**. Se expresa en unidades100µs por redondeo; eso no demuestra resolución física del temporizador. Reiniciar el guest cambia la base: no comparar marcas entre boots.

`tools/measure-doom-emulator.mjs` guarda trazas/snapshots/capturas y calcula estadísticas. `emulator-screenshot.mjs` exporta captura del RPC loopback fijo para evitar arrancar Node/ADB por cada muestra; CLI conserva guard. El sampler verifica ownership una vez al entrar, acepta únicamente controles de giro propios, limita capturas160 y envía release en finally/con temporizador de respaldo. No llama LVGL desde CLI, no descarga módulos ni mata hilos.

## Reproducción y estado

```powershell
# Guest responsive, Storage activa, módulos/archivos propios ausentes.
node tools/package-ui-probe.mjs doom
node tools/install-ui-probe-emulator.mjs refresh
node tools/doom-ui-emulator.mjs stage
# Seleccionar UIProbe por Ajustes, revisar Ready, sin START previo.
node tools/measure-doom-emulator.mjs
# Volver a Storage mediante selector inspeccionado.
node tools/doom-ui-emulator.mjs cleanup
```

Lua SHA256 `34e6a38154f130e537f1b02150a5cb8078448a3ff9960d39467cdaddfa256f6c`; paquete21472bytes/SHA `f5b00512904ce4d4a4eba5f7d7618230b1f4d16844e4438a6e5755520c8f3e31`. ELF446144bytes/SHA `e115971e75ec32f33e2ee63a3c2af9799b8d207f73c3779db3bb31b53cef9639` intacto. Refresh respaldado/readback, sin reset de instalación. No nuevas herramientas, builds C ni descargas. Source/payload/WAD/ADB/guest pasan guards; sintaxis Node y diff comprobados.

Baseline estaba screen OFF: backup/reset antes de stage/C (`doom-perf-baseline-1791151868826`). Ningún reboot para salir.13alloc/free, streams0, cleanup0, pico6582961bytes del allocator propio. Limpieza `doom-ui-cleanup-1791152232386`, WAD intacto; final read-only `doom-perf-final-1791152271086`, passed=true: Storage365700764 activa, UIProbe365799903 instrumentada almacenada, worker88/módulo/nodos/copias/ELF/WAD tmp ausentes.

No prueba de memoria prolongada, crash recovery, persistencia nativa o compatibilidad física. FLAT sigue sin sandbox. Siguiente checkpoint único: cambiar Timer200→50ms, repetir únicamente esta medición comparable y conservar pausa/EXIT limpio en el ensayo.
