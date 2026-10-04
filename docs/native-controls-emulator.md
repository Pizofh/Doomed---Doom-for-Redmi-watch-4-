# Controles mantenidos Lua → C

Checkpoint R55, 2026-10-03 (Bogotá). **Confirmado solo en el emulador S3**: el prototipo recibe avanzar, girar y disparar mientras se mantiene el contacto; entrega pulsaciones/liberaciones a una cola C acotada. No contiene Doom, simulación de gameplay ni lectura del driver táctil global. No demuestra compatibilidad con M2315W1 ni comodidad en la muñeca.

## Contrato y revisión

Se conserva el módulo FLAT del guest exacto y sus cinco imports: register_driver, unregister_driver, printf y las dos funciones de cache LVGL ya revisadas. ELF5212 bytes, BSS328 bytes, relocaciones ABS32, entry Thumb1597. Fuente, imports y desensamblado revisados antes de fijar los nuevos hashes. C no introduce worker, timer, acceso a framebuffer ni escritura de flash. **FLAT sigue sin aislamiento de memoria.** Op6/op7 continúan reservados al caller UI, nunca CLI.

| Artefacto | SHA256 |
|---|---|
| C fuente normalizada LF | `40a18e07975dd0c57b898e37a08c1ae9eddfc6cdbdddfbf97a6412a3de208078` |
| bridge.elf | `ec7b6d5d1eab951a27423607a82ef8801778c9ccc6dfd515a2c50a4891e0a844` |
| Control Lua + modo loop + main de controles | `068f7a8253e32bbc197d7545a11d6fc6d441bcfe4aca79bc3a627af1da293e6a` |
| Watchface antes de editar ID,24364 bytes | `224900da6086fe578d8dafd42b83feda768bbe24c11226d51d36b7e8d1e11597` |

`experiments/lua-controls/main.lua` es un prototipo separado; el main de la prueba anterior de animación permanece disponible. Imagen de patrón320×140 en x35,y50. Movimiento x20,y255,210×170; disparo x245,y255,125×100; menú x245,y365,125×60. Centro neutro de movimiento y diagonales; un dedo. No corona, multitouch, retroceso, USAR ni disparo automático. Moverse y disparar simultáneamente desde la UI aún no está resuelto.

La fuente primaria [doomkeys.h de doomgeneric fijada](https://github.com/ozkl/doomgeneric/blob/dcb7a8dbc7a16ce3dda29382ac9aae9d77d21284/doomgeneric/doomkeys.h) define los códigos usados: UP173, LEFT172, RIGHT174, FIRE163. Adoptar esos códigos no constituye integración del motor.

Op8 entrega una máscara:1 avanzar,2 izquierda,4 derecha,8 disparo. Rechaza izquierda+derecha, valores fuera de rango y acciones positivas estando pausado/inactivo. El cambio emite primero liberaciones, después pulsaciones; repetir la misma máscara no crea nuevas teclas. Cola fija de32 eventos de8 bytes. Un overflow descarta órdenes antiguas, pausa, deja held=0 y encola cuatro liberaciones. Pausa/EXIT hacen la misma cancelación; RESUME no recupera teclas anteriores. Un consumidor único Lua imprime las teclas y mantiene un estado diagnóstico, sin engine.

`/dev/rw4bridge` admite lecturas exactas:32 bytes conserva el snapshot anterior;64 devuelve estado y contadores, sin consumir;8 extrae una tecla o devuelve EOF si la cola está vacía. **Nunca cat/read-all.** La cola no es una API concurrente general. Los dos primeros son snapshots sin EOF. `rmmod` rechaza descarga con un descriptor abierto o una tecla mantenida; cleanup cancela antes de descargar.

Lua usa PRESS_LOCK y eventos de release/lost/cancel/defocus de su control. Salir del rectángulo libera la acción y llama `indev:wait_release()` para exigir otro contacto. Esa API pertenece al input compartido del firmware; no es un grab exclusivo ni sandbox. Fuente relacionada [LuaVGL indev.c](https://github.com/XuNeo/luavgl/blob/62868a05b0b3e79b91f49ce9c3661750ffe55d02/src/indev.c) y constants.c; se contrastó con la función compilada del guest (wrapper0xd26b38, lv_indev_wait_release0x6faf50). No se afirma identidad de revisión entre fuente relacionada y guest.

## Resultados reproducibles

| Ensayo | Resultado | Evidencia local ignorada |
|---|---|---|
| Cola C por CLI, sin op6/op7 | Deduplicación, orden de direcciones, pausa, máscara inválida, overflow y rechazo de unload con held pasan | lua-bridge-close-keys-1791078861578 |
| Regresión de frames | Dos fases exactas89612 bytes, EOF, lectores, pausa y busy pasan | native-frame-1791078865953 |
| Cierre Lua con FIRE mantenido | GC conserva módulo; return normal y error controlado cancelan/descargan | lua-bridge-close-normal-1791078870603; error-1791078875025 |
| Primera UI | Falló FIRE mantenido; conservada como intento fallido | ui-keys-1791079130203 |
| UI corregida | 26 snapshots: avance mantenido sin repetir edges, diagonales, giro parado, FIRE, neutral, salida de zona, menú, cancelación con dedo apoyado, dos EXIT y reentrada | ui-keys-1791079378297 |
| Panel stock / tercer START→Storage sin EXIT | Pausado seq183 idéntico tras tap neutro y regreso; RESUME explícito seq193,held0; cierre Lua retira C/nodos/frames | controls-system-panel-close |

El fallo inicial era el callback de un control que liberaba el contacto de otro: al enfocar FIRE, el DEFOCUSED de MOVE cancelaba el disparo nuevo. Se restringió el callback a `contact==kind`; la prueba completa posterior pasó. No hubo panic/reset por ese fallo. Se hicieron dos resets para actualizar la watchface inactiva con backup; ninguno se utilizó para salir del ensayo funcional.

En la prueba mantenida, el estado C y el consumidor Lua coincidieron; el contador de muestreos de frame avanzó mientras held permanecía activo y changes no aumentó. Esto demuestra estado mantenido, **no movimiento ni velocidad/FPS de Doom**.

HOLD TEST es instrumentación del emulador: tras15 ticks con tecla activa utiliza la misma función de pausa mientras el ratón continúa pulsado. Se verificó held0 y cuatro releases, sin reactivación al soltar o reanudar. **No prueba pérdida real de foco stock mientras un dedo permanece apoyado.** El gesto que abrió el panel stock atravesó los controles y dejó held0 antes del callback; la pausa stock posterior sí se verificó, por separado.

## Reproducción en este PC

Solo con el emulador ya iniciado por el usuario y el transporte dedicado:127.0.0.1:5039,serial emulator-5554. No ejecutar sobre USB.

```powershell
node tools/build-lua-bridge.mjs
node tools/stage-lua-bridge.mjs test
node tools/test-native-keys.mjs
node tools/test-native-frame.mjs
node tools/test-lua-bridge-close.mjs normal
node tools/test-lua-bridge-close.mjs error
node tools/package-ui-probe.mjs controls
```

Actualizar requiere UIProbe365799903 inactiva, recurso anterior verificado y backup: `node tools/install-ui-probe-emulator.mjs update`. Resetea únicamente el guest para rescaneo y borra tmpfs; preparar después con `node tools/stage-lua-bridge.mjs stage`. Seleccionar UIProbe desde Settings, revisando cada pantalla como en HANDOFF; no pulsar START todavía. `node tools/test-ui-keys.mjs` exige launcher propio inactivo y C revisado, inyecta contactos con release en finally, guarda snapshots/capturas y termina después de dos EXIT. `node tools/key-state.mjs` consulta64 bytes sin retirar teclas del consumidor.

Prueba stock adicional desde launcher: START195,285; swipe195,410→195,40; revisar panel y consultar key-state; tap neutro50,45 y otra consulta; swipe195,40→195,410; revisar menú PAUSED y consultar; RESUME195,195 y otra consulta. Para cierre sin EXIT, abrir panel→Settings→Watch faces→selector, seleccionar Storage tras revisar su preview. Verificar `lua-bridge-state.mjs`, `/tmp` y finalizer log antes de `stage-lua-bridge.mjs cleanup`. Un tap arbitrario en el panel podría cambiar ajustes; solo se ensayó el punto neutro citado.

Estado final: Storage365700764; UIProbe instalada en modo controls; C y ambos nodos ausentes; `/tmp` solo temporary.db, ELF y dos slots propios retirados. Doom y hardware siguen sin tocar.

Siguiente checkpoint: **demostrar tiempo monotónico y espera acotada para C en el guest exacto**. WAD/FS, integración del motor, memoria prolongada, recuperación ante crash y compatibilidad/recuperación física siguen pendientes. La animación anterior tuvo un aumento de maxused sin causa aislada; este ensayo de controles no resuelve ese límite.
