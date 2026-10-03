# ADR0003: dispositivo virtual para el puente Lua↔C del emulador

Estado: aceptado para experimentos del guest S3 exacto, 2026-10-03. No aprobado para RW4 físico.

Lua5.4 expone package.loadlib pero su implementación es un stub deshabilitado. os.execute desde watchface y el loader insmod/rmmod sí funcionan en esta build FLAT. La UI propia controla gestos centrales y recibe pause/resume, mientras el lector global de touch también observa otras pantallas.

Se eligió un módulo C que registra un nodo virtual propio y recibe mensajes mediante io. Lua entrega únicamente eventos de su página y consume respuestas de tamaño fijo. START carga C; EXIT cierra handles y lo descarga. No necesita importar C en Lua, abrir el touch global ni escribir un archivo de comandos en flash. Tampoco introduce un worker que requiera join/cancel durante descarga.

Consecuencias: ABI del driver y símbolos dependen del ELF exacto; no hay sandbox. El experimento prueba state/input y carga bajo demanda, sin engine/render. read(32) es obligatorio; el nodo no es un archivo con EOF. Dos ciclos y rechazo de descarga con handle abierto fueron verificados. Una tabla con finalizador mantenida globalmente y handles con atributo close permiten [limpieza al cambiar de watchface sin EXIT](../lua-native-close-emulator.md), probada en dos ciclos. Persistencia del ELF y recuperación ante crash permanecen pendientes; workers futuros necesitarán teardown explícito antes de descargar C.

Evidencia y comandos: [puente probado](../lua-native-bridge-emulator.md). No se concluye que esta arquitectura sea la mejor para el firmware RW4 desconocido.

Extensión R53: [stream de snapshot RGB565](../native-frame-lvgl-emulator.md) en /dev/rw4frame, con cursor por descriptor y EOF, copiado a tmpfs y renderizado por Lua/LVGL en contexto UI. Un archivo por START funciona en la prueba; no se acepta generar archivos/cache ilimitados como backend de frames para DOOM. Actualización repetida y coste siguen pendientes.
