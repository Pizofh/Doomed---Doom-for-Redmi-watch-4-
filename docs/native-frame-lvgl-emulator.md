# Patrón C dentro de la página Lua/LVGL

El 2026-10-03 se mostró un patrón RGB565 generado por nuestro módulo C dentro de UIProbe, en el guest S3 exacto de MiWatchEmulator v1.0 a 390×450. Touch, panel, pausa/reanudación, dos ciclos START/EXIT y un cambio a Storage sin EXIT funcionaron. No se conectó M2315W1 ni se compiló DOOM. **Esta prueba del emulador no certifica ISA, APIs o permisos del RW4 físico.**

## Camino probado

```text
C genera cabecera LVGL + píxeles al leer /dev/rw4frame
    → Lua io.read(89612), valida formato y cierra lector
    → snapshot en /tmp/rw4-native-pattern-<sequence>.bin (tmpfs)
    → lvgl.Image en nuestra página, x35 y205, 320×140
    → renderer normal de LVGL
```

La imagen contiene ocho barras de color y un tablero blanco/negro. Se genera en C; no hay bitmap preempaquetado ni gameplay. Lua crea el widget desde su contexto de watchface. C no llama LVGL, abre el framebuffer global, mantiene punteros de Lua, crea threads/timers ni escribe flash. El nodo virtual es propio, no un periférico. Los datos copiados pertenecen a Lua/tmpfs y no apuntan a memoria del módulo descargable.

El stream de frames tiene EOF y admite lecturas parciales; **el nodo de estado `/dev/rw4bridge` sigue siendo un protocolo distinto**, con lectura exacta de 32 bytes y sin EOF. No usar `cat` o read-all sobre ese nodo de estado.

El frame usa cabecera de 12 bytes: magic0x19, color format0x12, flags0, ancho320, alto140, stride640, reservado0; seguido de 89.600 bytes RGB565 little-endian. Total: **89.612 bytes por snapshot**. La fase queda fijada al abrir el lector; el test CLI produjo dos fases distintas. La UI muestra solamente un snapshot al pulsar START; touch no lo actualiza en esta versión. No se ensayó animación ni se midieron FPS, latencia, coste de copia o memoria pico.

## Contrato y fuentes

Se contrastaron las funciones compiladas `luavgl_toimgsrc`, `luavgl_img_set_src` y `lv_bin_decoder_info` del guest. Esta última lee 12 bytes y compara magic0x19. La ruta absoluta en tmpfs fue aceptada y `get_img_size()` devolvió 320×140 en UI. Fuentes primarias relacionadas: [LuaVGL img.c](https://github.com/XuNeo/luavgl/blob/62868a05b0b3e79b91f49ce9c3661750ffe55d02/src/widgets/img.c), [util.c](https://github.com/XuNeo/luavgl/blob/62868a05b0b3e79b91f49ce9c3661750ffe55d02/src/util.c), [LVGL9 header](https://github.com/lvgl/lvgl/blob/v9.0.0/src/draw/lv_image_buf.h), [color formats](https://github.com/lvgl/lvgl/blob/v9.0.0/src/misc/lv_color.h) y [bin decoder](https://github.com/lvgl/lvgl/blob/v9.0.0/src/libs/bin_decoder/lv_bin_decoder.c). No se identificaron como revisiones exactas del guest.

DWARF del ELF exacto: `struct file` ocupa32 bytes, `f_priv` está en offset20; `file_operations` ocupa40 bytes. El driver usa ese campo privado para cursor/fase por descriptor, sin dereferenciar el cookie como puntero. Sus únicas imports siguen siendo register_driver, unregister_driver y printf, enlazadas al guest fijado. FLAT comparte memoria: **no es un sandbox**.

## Fallo encontrado y corrección

La primera implementación limitaba el stream a un lector y mantenía contador/cursor globales. El test de segundo lector y descarga con handle abierto falló; se observó un reinicio del guest y un mensaje `PANIC: unprotected error in call to Lua API`. Los artefactos se conservaron. Una corrección inicial por descriptor eliminó ese incidente en la repetición, pero la expectativa de resultado del shell seguía fallando. No se aisló la causa exacta del panic.

La implementación final permite múltiples aperturas, marca por descriptor si adquirió referencia y mantiene cursor/fase independientes. Esto evita que un cierre sin referencia válida disminuya el contador de otro lector. El [código NuttX de duplicación](https://github.com/apache/nuttx/blob/8fdb56b5f2124de351a48125a252ba4264665e3d/fs/vfs/fs_dup2.c) reabre drivers al duplicar descriptores; es una referencia para interpretar el problema al crear NSH mediante os.execute, no una traza completa de esa llamada en nuestro guest.

Con el código final, dos lectores funcionan, `rmmod` devuelve el error16 anunciado por NSH mientras hay un handle abierto, y tras cerrar los lectores ambos nodos se retiran con refs0. La apertura durante pausa se rechaza sin alterar referencias existentes. No se garantiza concurrencia arbitraria entre threads/cores. Los binarios de los intentos fallidos no quedaron autorizados en los pins finales.

## Verificación y ciclo de vida

| Prueba | Resultado |
|---|---|
| CLI, dos fases y lectura con EOF | 89.612 bytes por fase; todos los bytes coinciden con el patrón esperado en PC |
| Dos lectores, lectura parcial, descarga con lector abierto | Rechazo de descarga; cierre y descarga posterior correctos |
| Apertura en pausa | Rechazada; resume y salida correctos |
| CLI cierre normal y error controlado | Finalizador y retirada de ambos nodos con refs0 |
| UI, 14 gestos | Touch sobre imagen llega a nuestra página; pausa/panel/reanudación conservan patrón |
| UI, dos ciclos START/EXIT | Recarga y snapshot nuevos; cierre retira módulos, nodos y archivos propios |
| UI, tercer START y selección de Storage sin EXIT | Finalizador descargó C y retiró el snapshot; reloj emulado operativo sin reset para salir |

El helper verifica los 44.800 píxeles de la zona de imagen en las capturas de página. La primera captura tuvo diferencias de hasta2 niveles por canal en1.225 píxeles, concentradas en bordes; su origen no se determinó. Se admite esa tolerancia en la captura, mientras los bytes fuente se verifican **exactamente** por readback. No se modifican capturas para hacerlas pasar.

EXIT/finalizador descargan C y eliminan únicamente los snapshots propios registrados en esa VM. Sus nombres distintos evitan reutilizar una entrada de cache durante la reentrada probada. La imagen vive en una página oculta tras EXIT y su teardown final pertenece a la watchface. No se verificó que LVGL libere inmediatamente toda su cache; tampoco se midieron fugas prolongadas. **Generar archivos/nombres por cada frame no es un backend de DOOM aceptado:** el siguiente checkpoint necesita recursos acotados y una estrategia de actualización/cache.

Final: Storage365700764 activa, Lua cerrada, módulo y ambos nodos ausentes, snapshots y ELF propio retirados. `/tmp` no conserva los archivos después de reset. La watchface sí queda almacenada en el emulador; persistencia del ejecutable sigue pendiente.

## Reproducción e identidades

```powershell
node tools/build-lua-bridge.mjs
node tools/stage-lua-bridge.mjs test
node tools/test-native-frame.mjs
node tools/test-lua-bridge-close.mjs normal
node tools/test-lua-bridge-close.mjs error
node tools/stage-lua-bridge.mjs cleanup
node tools/package-ui-probe.mjs bridge
node tools/install-ui-probe-emulator.mjs update
# Esperar a que node tools/emulator-adb.mjs connect vuelva a indicar device.
node tools/stage-lua-bridge.mjs stage
# Seleccionar UIProbe en la UI, pulsar START y revisar el patrón.
node tools/exercise-ui-probe.mjs bridge
# Probar otro START y cambiar a Storage sin EXIT; comprobar estado.
node tools/lua-bridge-state.mjs
node tools/stage-lua-bridge.mjs cleanup
```

Actualizar exige UIProbe inactiva. La instalación resetea solo el guest; staging va después del boot. La primera consulta tras ese reset estuvo offline y se repitió tras confirmar `device`. El helper de frames usa rutas y transportes fijos, verifica payload y readback del script antes de ejecutarlo. Ante fallo conserva evidencia y exige inspeccionar el estado antes de eliminar archivos. Revisar cada pantalla durante navegación; no activar controles stock a ciegas.

- Guest SHA256: `849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa`.
- C final: 3.580 bytes, SHA256 `69b1b6a607aec62e6a7def95dcf9e53933cc0f3dbd7bb7b7732863a661eea88e`; source LF `09f1137b8ab32e7653d32f40c955d8ba6b0a5cd8c2483734967ce778166ba3e7`.
- Watchface: 19.024 bytes, SHA256 `8a47c395a0fafb62364d3b2a0dfce74e0b5a83b89b3043da434e1fb34446903f`; source `25a6476f584ac9d6172c281ed694d183e67157afbb1354203b84a4e23f5c1048`.
- Frames fase0/fase1 SHA256: `6449a14aa35ae39e18ba3d9ee2e2ea776ce04ffae2b71107c019752ed647f251` / `6a6540af2ebbcee5291396ad7e9f7aecd27cfe73cccb48f36ed7282a99d51989`.
- Artefactos ignorados: `native-frame-1791066494323` y repetición con comparación de cursores `native-frame-1791067206109`, `native-frame-ui`, `ui-probe-exercise-1791066790197`; cierres CLI `lua-bridge-close-normal-1791066535898`, `lua-bridge-close-error-1791066539770`. Fallos retenidos `native-frame-1791066175708`, `native-frame-1791066345137`. Capturas `frame-*` y del ejercicio; ABI/inspección bajo `artifacts/package-review/`.

**Siguiente checkpoint:** actualizar frames repetidamente en LVGL con recursos acotados, pausando las actualizaciones al abrir el panel y deteniéndolas antes de salir. Sin DOOM ni hardware físico todavía.
