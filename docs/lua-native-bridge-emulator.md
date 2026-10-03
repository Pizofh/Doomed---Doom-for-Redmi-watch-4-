# Puente Lua ↔ C y carga bajo demanda: emulador

2026-10-03. **Probado exclusivamente en el guest Watch S3 de MiWatchEmulator v1.0, configurado a 390×450. No demuestra compatibilidad M2315W1.** Sin DOOM/WAD, nuevo firmware, exploits ni hardware físico.

## Resultado

La watchface UIProbe carga nuestro módulo C con START, entrega eventos de su página mediante un dispositivo virtual y recibe respuestas de C. Abrir el panel stock cambia el estado nativo a pausado; cerrarlo lo reanuda. EXIT envía cierre, descarga C y elimina su nodo. Dos ciclos completos sin reboot, reinstalación ni intervención del PC entre START y EXIT.

| Prueba | Evidencia observada |
|---|---|
| START | `register=0`; `os.execute(insmod ...)` devuelve true/exit/0; respuesta C active=1 |
| Drags centrales | C devuelve 300,230; 90,230; 195,180; 195,300, contador1–4 |
| Borde inferior | Primero release195,40, después pausa nativa: seq7, paused=1, touches=5 |
| Tap50,45 vacío del panel | Snapshot C idéntico antes/después, incluido seq7; no evento propio |
| Cerrar panel | seq8, paused=0; se conserva contador5 |
| EXIT | active=0; `unregister=0 refs=0`; rmmod true/exit/0; lsmod y nodo ausentes |
| Reabrir | Nueva carga, contador nativo0; tap60,210 devuelve contador1 |
| Segunda salida | Otra descarga correcta y nodo ausente |
| Descriptor abierto, ensayo CLI separado | rmmod falla con busy; después de close, C sigue disponible y se descarga correctamente |
| Touch estando pausado, ensayo CLI | C recibe la petición pero conserva contador/coordenadas |

Se revisaron capturas, logs y snapshots leídos desde C. El panel cambia la UI delantera; no es una pantalla stock actuando silenciosamente debajo de nuestros controles centrales. El gesto que abre el panel todavía entrega un release antes de la pausa: reservar bordes en el futuro adaptador. Un tap del panel no es prueba exhaustiva de todos los overlays.

## Por qué no package.loadlib

La función existe, pero `lookforfunc`/`ll_loadlib` de este ELF implementan el fallback deshabilitado. CLI y watchface devuelven `nil`, `dynamic libraries not enabled; check your Lua installation`, `absent`, al consultar un archivo inexistente. Ninguna biblioteca externa se ejecutó con loadlib.

[Lua loadlib.c](https://www.lua.org/source/5.4/loadlib.c.html) documenta el fallback y su diferencia con LUA_USE_DLOPEN. La página corresponde a Lua5.4.9; no identifica el patchlevel del guest. La prueba decisiva es el código y respuesta de nuestro guest. Sus funciones C dlopen/dlclose/dlsym existen y delegan en insmod/rmmod/modsym: **Lua loadlib deshabilitado no significa loader NuttX inexistente**.

Desde watchface, la primera invocación de os.execute fue `uname -a`, de solo lectura; devolvió true/exit/0 e identificó Watch S3. Después se probaron únicamente insmod/rmmod con nuestros nombres fijos. Esto sigue sin probar os.execute en RW4 físico.

## Contrato y arquitectura

`experiments/lua-native-bridge/bridge.c` registra **su propio** `/dev/rw4bridge` en el pseudofilesystem de RAM. No es un periférico ni usa otro driver. `register_driver`/`unregister_driver`, el teardown rmmod y la estructura file_operations se contrastaron en el ELF exacto. DWARF: tamaño40, open0, close4, read8, write12; las otras seis entradas son NULL. [fs.h NuttX12.3 fijado](https://github.com/apache/nuttx/blob/8fdb56b5f2124de351a48125a252ba4264665e3d/include/nuttx/fs/fs.h) y [modlib.h](https://github.com/apache/nuttx/blob/8fdb56b5f2124de351a48125a252ba4264665e3d/include/nuttx/lib/modlib.h) son referencias primarias, no la revisión identificada del guest.

Lua envía24bytes little-endian: magic, secuencia, operación, x, y, versión. Operaciones: ENTER, PAUSE, RESUME, EXIT, TOUCH. C responde32bytes con magic, secuencia, active, paused, contador, x, y, operación. Cada transacción abre/cierra sus descriptores; solo se hace **read(32)**, nunca read-all/cat del nodo, cuyo protocolo entrega snapshots sin EOF. En este MVP solo se envía RELEASED: todavía no hay controles mantenidos para movimiento/disparo.

C mantiene estado en32bytes de BSS, valida el mensaje y ejecuta callbacks síncronos breves. No crea threads, timers, widgets ni guarda punteros a Lua. La bandera paused rechaza touch; **no hay engine cuya suspensión se haya probado**. El uninitializer rechaza descriptores abiertos y retira el nodo antes de liberar código. Este contrato se probó con un único cliente Lua controlado: no garantiza seguridad ante aperturas concurrentes arbitrarias.

FLAT comparte memoria con el sistema. Un dispositivo virtual, RAM-only y ausencia de workers no convierten C en sandbox. El módulo usa símbolos enlazados al hash exacto del guest; nunca utilizar esas direcciones en firmware físico u otra imagen.

## Reproducción

Con el emulador propio arrancado y Storage seleccionada, desde la raíz del repo:

```powershell
node tools/inspect-bridge-abi.mjs
node tools/build-lua-bridge.mjs
node tools/stage-lua-bridge.mjs test
node tools/stage-lua-bridge.mjs cleanup
node tools/package-ui-probe.mjs bridge
node tools/install-ui-probe-emulator.mjs update
# Esperar boot. El reset elimina /tmp; preparar C DESPUÉS del reset:
node tools/stage-lua-bridge.mjs stage
```

Verificar capturas por pantalla al seleccionar Ajustes → Watch faces → Watch faces → UIProbe. Pulsar START, después:

```powershell
node tools/lua-bridge-state.mjs
node tools/exercise-ui-probe.mjs bridge
# Termina en launcher, C descargado. Seleccionar Storage y comprobar cierre Lua.
node tools/stage-lua-bridge.mjs cleanup
```

No automatizar la navegación de Settings mediante coordenadas sin revisar cada pantalla. El selector no avanzó con todos los swipes sintéticos; no se atribuyó una causa precisa. El ejercicio sí exige marcadores de página/launcher, estado C por paso, pausa, panel sin eventos y descarga/reentrada; las capturas aún requieren revisión.

## Identidad, artefactos y límites

- Guest SHA256: `849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa`.
- C: 2.552bytes; SHA256 `2fbebe482949a5e04d30879369bbba92b7597be1d2efc594565479dcbd41f741`; source LF `b7a51e153c22ae9772a348363f5ab067ca719b2b6900973c27bc0f4866d84aaf`.
- Watchface con prefijo Lua: 15.648bytes, SHA256 `ad73c67a42e8820ddcf921d3747b6b4124c97d6479b97b1077f5a355795c5527`; fuente concatenada `159c4abe8233aad3af4c98c31e861f1fcc2d0cb7f0909011e514cfdddc4e4a09`.
- Artefactos ignorados: `ui-probe-exercise-1791061092218/` con gestures.json, review.json, native-excerpts.txt y capturas; CLI inicial `lua-bridge-test-1791060390146/`, busy `lua-bridge-test-1791061474934/`; review/build bajo build/lua-native-bridge y artifacts/package-review.

Final: Storage365700764 activa, Lua cerrado, módulo/nodo y archivo temporal ausentes. No reset para salir. La watchface queda almacenada en el emulador; el ELF en /tmp **no es persistente**, se retiró al terminar. La reapertura probada entre ciclos no requirió PC, pero requiere preparar otra vez el ELF después de reset/cleanup. No hay persistencia nativa demostrada.

Cierra correctamente mediante EXIT. En esta prueba inicial no se validó cambio directo de watchface ni errores de lanzamiento/transacción. La [continuación de lifecycle](lua-native-close-emulator.md) validó posteriormente dos cambios de watchface sin EXIT y un error CLI controlado. Crashes y terminación forzada siguen sin garantía. No se midieron fugas prolongadas, coste por llamada, FPS, memoria pico ni timing. Tampoco se verificaron archivos WAD, WASM, QuickApp→C ni ejecución RW4.

**Checkpoint posterior completado:** [limpieza de C al cerrar la watchface sin pulsar EXIT](lua-native-close-emulator.md). Siguiente: patrón C dentro de nuestra página LVGL, conservando el lifecycle probado.
