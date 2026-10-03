# Lua touch — preparado, no ejecutado

Primero reproducir el [TouchEvents upstream RW4](https://github.com/m0tral/MiWatchLuaWatchfaces/tree/5af6e14ea92830a394c88dc04f76ceef697a6ded/RedmiWatch4/TouchEvents). Sus seis archivos están descargados localmente en una carpeta third_party ignorada y verificados por hash Git blob. No hay un paquete compilado ni resultados de ejecución local. No se incorporan sus assets/código al repositorio público sin licencia identificada.

Nuestro experimento posterior debe mostrar X/Y usando `get_point`, registrar tipo de evento/delta por separado, mantener logs acotados y salir mediante lifecycle documentado. No incluir shell, I/O persistente, timers o una API de cierre inventados. Criterio de aceptación: pulsaciones/arrastre/gesto visibles y salida/reentrada al entorno del emulador sin reboot obligatorio.

Ver [procedimiento y bloqueos](../../docs/emulator.md).
