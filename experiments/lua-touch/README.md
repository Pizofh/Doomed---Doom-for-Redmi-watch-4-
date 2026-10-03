# Lua touch — prueba CLI, UI pendiente

El [TouchEvents upstream RW4](https://github.com/m0tral/MiWatchLuaWatchfaces/tree/5af6e14ea92830a394c88dc04f76ceef697a6ded/RedmiWatch4/TouchEvents) está descargado: seis archivos verificados por hash Git blob, en third_party ignorado. No se redistribuyen sus assets/código sin licencia identificada.

`tools/try-touch-events.mjs` subió los tres Lua y cat.png a TMPFS del emulador S3. El original falla en `lvgl.Font("misansw regular",32)`. Una copia sin esa línea termina sin excepción reportada. El screenshot posterior muestra la pantalla stock de almacenamiento, sin TouchEvents. **No se instaló una watchface ni se validaron render, touch o salida de una UI propia.**

Resultados en `artifacts/emulator/lua-touch/`, ignorado; fuente intacta y variante privada en `emulator/local/touch-default-font/`. El guest `/tmp` es volátil; las copias/logs del PC permanecen. Sigue pendiente activar el ejemplo en el lifecycle correcto de watchface/app. Ver [reanudación](../../docs/HANDOFF.md).

Nuestro experimento posterior debe mostrar X/Y usando `get_point`, registrar tipo de evento/delta por separado, mantener logs acotados y salir mediante lifecycle documentado. No incluir shell, I/O persistente, timers o una API de cierre inventados. Criterio de aceptación: pulsaciones/arrastre/gesto visibles y salida/reentrada al entorno del emulador sin reboot obligatorio.

Ver [procedimiento y bloqueos](../../docs/emulator.md).
