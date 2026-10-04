# Frames repetidos en la página Lua/LVGL

Resultado local del 2026-10-03 (Bogotá): 300 imágenes RGB565 generadas por C y presentadas sucesivamente en nuestra página del emulador. Pausa/reanudación, dos ciclos START/EXIT y un tercer cierre al seleccionar Storage sin EXIT funcionaron sin reboot para salir. **No se ejecutó Doom ni se tocó el reloj físico.**

El guest sigue siendo el S3 fijado, configurado a390×450: no demuestra compatibilidad M2315W1, memoria física ni rendimiento de Doom. Continúa el [snapshot estático](native-frame-lvgl-emulator.md).

## Flujo y recursos

```text
Timer Lua/LVGL, periodo solicitado 200 ms, máximo300 frames por START
  -> op6 al nodo propio /dev/rw4bridge, en contexto UI
  -> C invalida cache de una ruta fija y avanza la fase
  -> Lua lee /dev/rw4frame con EOF, valida 89.612 bytes
  -> sobrescribe el slot inactivo en tmpfs
  -> Image:set_src(slot) dentro de nuestra página
```

Hay dos nombres: `/tmp/rw4-loop-frame-0.bin` y `/tmp/rw4-loop-frame-1.bin`. Cada archivo completo ocupa 89.612 bytes: cabecera de 12 bytes y 320×140×2 píxeles RGB565. Suman 179.224 bytes, aproximadamente 175 KiB, **solo frames en tmpfs**; no incluye strings temporales, decoder, widgets o sistema. No se escriben frames en flash. El módulo genera el stream en el buffer de read sin reservar un framebuffer; BSS de 40 bytes no representa todo su coste en RAM.

Op6 valida slot 0/1, estado activo/no pausado y ausencia de lectores de frame. Invalida la ruta y avanza un contador distinto del contador touch. Op7 invalida ambos slots tras eliminar Image durante EXIT. Nunca se pasa NULL para vaciar la cache global. Cada descriptor mantiene cursor/fase independientes.

C importa ahora `lv_image_cache_drop` y `lv_image_header_cache_drop`, fijadas al ELF exacto. Op6/op7 se llaman **solo desde nuestra watchface en contexto UI**, por write síncrono: no desde CLI/NSH, worker ni uninitializer. El desensamblado de file_write confirma la llamada directa al driver; no se midió el ID de thread dentro de op6. El driver no obliga a terceros a respetar este contrato: FLAT continúa sin sandbox.

Se reutiliza un solo Timer de firmware por VM. Callback Lua sin punteros a código del módulo; pausa/EXIT detienen Timer antes del estado nativo. EXIT elimina Image, invalida slots, descarga C y borra nuestros archivos registrados. En cierre normal de VM, el guard marca closing antes de descargar: callbacks consultan is_running antes de pedir frames. El __gc compilado del Timer retira callback/referencia, pausa, libera data y llama lv_timer_delete. El finalizador propio **no llama LVGL**. No garantiza cleanup ante panic/crash/kill.

El límite300 pertenece al ensayo: pausa C y no reanuda al cerrar un panel. EXIT/nuevo START inicia otro ensayo. No es una limitación del motor ni un control definitivo del juego.

## Evidencia

El helper guardó18 observaciones, capturas y free/ls. Cada captura de página se contrastó contra 44.800 píxeles de una de las dos fases, con tolerancia de 2 niveles/canal ya documentada. Se capturaron **ambas fases**, sin editar imágenes. Las dos fases del stream del C actualizado también coinciden byte por byte en la regresión CLI; op6/cache no se invocan en CLI.

| Validación | Resultado |
|---|---|
| Primer START | 300 frames y parada automática; sin excepción de frames ni panic observado |
| Panel y toque en área vacía | Estado seq45/paused1 idéntico entre consultas; sin actualizaciones ni toque del panel |
| Reanudación | Actualizaciones vuelven al cerrar el panel |
| Archivos | Dos de 89.612 bytes en todas las muestras activas; ningún nombre nuevo |
| Límite300 | seq305/paused1 idéntico en consultas posteriores |
| EXIT/reentrada | Descarga refs0 y archivos retirados; nueva animación y segunda salida correctas |
| Tercer START → Storage sin EXIT | Lua cerrado, finalizer clean=true, módulo/ambos nodos ausentes, stock visible |
| Regresión C | Busy unload, lectores independientes/EOF, apertura en pausa rechazada, cierre normal/error controlado pasan |

Tasa aproximada 4,92 actualizaciones de fuente por segundo, calculada por incrementos de secuencia entre consultas con timestamps del host en un tramo sin otros eventos. **No son FPS visibles ni rendimiento de Doom.** Periodo solicitado 200 ms; consultas, capturas y GC forman parte de la carga del ensayo. Latencia, CPU y coste por copia no medidos.

| Memoria | Medida y límite |
|---|---|
| Lua tras GC completo cada 25 frames | 72,362 KiB a frame 25; 72,405 KiB desde 50 hasta 300 y en reentrada |
| GImageCache usado tras abrir el panel | 1.900.024 bytes, constante en muestras posteriores de la primera animación |
| Umem usado, running-0 a running-5 | 19.445.144–19.537.192 bytes |
| Umem maxused, primera muestra a límite300 | 23.529.596→23.663.676; aumento de 134.080 bytes, **causa no aislada** |
| GImageCache usado después de EXIT | 1.720.728 bytes en ambas salidas |

Sin crecimiento sostenido del uso actual muestreado ni de Lua tras GC durante el intervalo. El contador maxused aumentó: **no demuestra pico acotado ni ausencia de fugas a largo plazo**. No atribuirlo al port, helper o sistema sin más evidencia. GImageCache es un heap del guest, no un contador exclusivo de nuestros frames. Estas cifras no estiman RAM libre del RW4.

## Reproducción

```powershell
node tools/build-lua-bridge.mjs
node tools/stage-lua-bridge.mjs test
node tools/test-native-frame.mjs
node tools/test-lua-bridge-close.mjs normal
node tools/test-lua-bridge-close.mjs error
node tools/package-ui-probe.mjs loop
# UIProbe debe estar inactiva. Update respalda y verifica nuestro recurso.
node tools/install-ui-probe-emulator.mjs update
# Esperar device después de reset; no abrir otra instancia.
node tools/emulator-adb.mjs connect
node tools/stage-lua-bridge.mjs stage
# Seleccionar UIProbe y dejar en el launcher, SIN pulsar START.
node tools/test-frame-loop-emulator.mjs
# Termina en el launcher sin C cargado.
# Tercer START → panel → Settings → Watch faces → Storage, revisar cada pantalla.
node tools/lua-bridge-state.mjs
node tools/stage-lua-bridge.mjs cleanup
```

Transport fijo loopback con ownership/hashes revisados, sin USB ni destinos arbitrarios. Ante fallo conservar estado/evidencia; no reintentar sobre módulo o archivo desconocido. `inspect-frame-loop.mjs` solo inspecciona estáticamente. Readelf necesitó -W para no abreviar imports largos: el rechazo inicial fue durante build, antes de cargar C.

- Guest SHA256: `849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa`.
- C: 3.992 bytes SHA256 `f345f4c2e2ec7a6811dad0f66e077dc65b397271aa8291da4b1fdd2f1851a0b6`; source LF `e04c6d1ad8fa4e680113f71e4fb0a8c4246884dc98e7a4026e09ebb313406a27`.
- Watchface: 21.928 bytes SHA256 `f1b26fc16722eed1c9aa8b2c3bbab7a97559c7710a177ea5c65e5de7f9ab84d1`; source concatenado `ede8f126a672ee367f788c83752410caabfe2c1a26a57bd636979c03de0364c5`.
- Implementación commit71836d9. Evidencia ignorada `artifacts/emulator/frame-loop-1791075123314`, `frame-loop-close`, `native-frame-1791074808268`, `lua-bridge-test-1791074801974`, `lua-bridge-close-normal-1791074813034`, `lua-bridge-close-error-1791074817541`; capturas frame-loop-* y loop-*. Inspección en artifacts/package-review/frame-loop/.

Final: Storage365700764, Lua cerrado, C/ambos nodos ausentes. Tras retirar ELF, /tmp solo contiene temporary.db del sistema. UIProbe365799903 sigue instalada en modo loop. Frames y ELF no sobreviven a reset: persistencia nativa pendiente.

Fuentes primarias relacionadas: [LuaVGL timer.c fijado](https://github.com/XuNeo/luavgl/blob/62868a05b0b3e79b91f49ce9c3661750ffe55d02/src/timer.c), [obj.c](https://github.com/XuNeo/luavgl/blob/62868a05b0b3e79b91f49ce9c3661750ffe55d02/src/obj.c), [LVGL9 image cache](https://github.com/lvgl/lvgl/blob/v9.0.0/src/misc/cache/lv_image_cache.c), [header cache v9.2](https://github.com/lvgl/lvgl/blob/v9.2.0/src/misc/cache/lv_image_header_cache.c). No se identificaron como revisiones exactas del guest; Timer/delete/cache/file_write contrastados mediante ELF compilado y pruebas propias.

Siguiente checkpoint: input mantenido y cancelación al pausar/salir, en una pantalla de controles de prueba. Pendientes tiempo monotónico, WAD, persistencia y memoria prolongada. **No compilar Doom todavía ni abrir el gate físico.**
