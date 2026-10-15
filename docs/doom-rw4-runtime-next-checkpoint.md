# Siguiente checkpoint: runtime de DOOM real en RW4

R270 cierra el ensayo del puente: carga de C, lectura, controles, STOP y retirada
del módulo con su nodo fueron probados en M2315W1/FW2.2.86. El usuario confirmó
diez verdes en ExitC y uso normal de menús/esferas. No implica DOOM físico ni
seguridad universal de cualquier módulo C.

La meta única siguiente es preparar en PC el runtime mínimo que permita
inicializar doomgeneric y leer el WAD en RW4, con recursos contabilizados y salida.
Se reutilizará el motor real ya ejecutado en S3; gameplay y renderer siguen en C.
Lua conserva la UI y los controles. No se enviará otro payload bajo este documento.

Trabajo agrupado, sin repetir las pruebas físicas de registro o controles:

1. Inventariar los imports y contratos usados por el port S3 y contrastarlos con
   la imagen candidata RW4: memoria/libc, reloj, lectura/seek del WAD y ejecución
   fuera del callback de UI. Direcciones, ABI y estructuras S3 no son transferibles.
2. Preparar adaptador y build ARM adecuados a RW4. Contabilizar código/BSS,
   zona de Doom, buffers, stack y reservas; no asumir32MB libres. Mantener el WAD
   fuera de RAM cuando el filesystem lo permita y conservarlo fuera de Git.
3. Validar en PC/emulador los casos de fallo, liberación y salida. El emulador S3
   valida lógica portable; no ejecuta ni demuestra ABI de un ELF para RW4.
4. El usuario aceptó agrupar el camino en dos checkpoints: preparación completa
   en PC y, si los contratos lo permiten, un ensayo físico corto de E1M1 con
   controles/salida/diagnóstico integrados. Preparar su hash y plan para revisión;
   no intercalar por defecto probes físicos separados para cada dependencia.
   Si una incertidumbre concreta impide ese ensayo, documentarla con evidencia,
   sin rearmar pruebas antiguas ni sustituir revisión por intentos a ciegas.

R271 completó la [compilación motor/runtime y prueba de salida](doom-rw4-build-r271.md).
Es un objeto intermedio, aún sin bindings, DG o worker; no está listo para el reloj.

R272 añade [libc privada y adaptador/worker/frames compilados](doom-rw4-device-r272.md).
Pruebas acotadas pasan en S3. Siguen pendientes bindings físicos, worker real y
entrega de imagen LVGL; no hay nueva instalación física autorizada.

La residencia temporal en RAM y la persistencia de los archivos siguen separadas.
Salir debe cerrar lectores, detener ejecución, liberar reservas y retirar solo
el módulo propio; abrir de nuevo debe cargar una instancia limpia desde archivos
persistentes. Los anti-repeat de los probes no son el diseño del launcher final.

Referencias locales: [runtime S3](doom-runtime-emulator.md),
[auditoría del motor](doom-build-audit.md),
[retirada física](native-exit-resume-physical-plan-r270.md).
Privilegios/aislamiento y recovery integral siguen pendientes; RAM-only no es sandbox.
