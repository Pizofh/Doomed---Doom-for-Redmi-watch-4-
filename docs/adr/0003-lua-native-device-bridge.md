# ADR0003: dispositivo virtual para el puente Lua↔C del emulador

Estado: aceptado para experimentos del guest S3 exacto, 2026-10-03. No aprobado para RW4 físico.

Lua5.4 expone package.loadlib pero su implementación es un stub deshabilitado. os.execute desde watchface y el loader insmod/rmmod sí funcionan en esta build FLAT. La UI propia controla gestos centrales y recibe pause/resume, mientras el lector global de touch también observa otras pantallas.

Se eligió un módulo C que registra un nodo virtual propio y recibe mensajes mediante io. Lua entrega únicamente eventos de su página y consume respuestas de tamaño fijo. START carga C; EXIT cierra handles y lo descarga. No necesita importar C en Lua, abrir el touch global ni escribir un archivo de comandos en flash. Tampoco introduce un worker que requiera join/cancel durante descarga.

Consecuencias: ABI del driver y símbolos dependen del ELF exacto; no hay sandbox. El experimento prueba state/input y carga bajo demanda, sin engine/render. read(32) es obligatorio; el nodo no es un archivo con EOF. Dos ciclos y rechazo de descarga con handle abierto fueron verificados. Persistencia del ELF y cleanup cuando Lua se cierra sin EXIT permanecen pendientes.

Evidencia y comandos: [puente probado](../lua-native-bridge-emulator.md). No se concluye que esta arquitectura sea la mejor para el firmware RW4 desconocido.
