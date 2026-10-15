# Siguiente checkpoint: runtime de DOOM real en RW4

Actualización R279: [extracción persistente S3 y upload grande simulado](doom-large-transfer-r279.md)
pasan. Falta integrar el modelo al perfil RFCOMM autenticado y preparar el
launcher final con rutaWAD/preflight. CI sintética configurada, sin ejecución
remota comprobada. No hay ensayo físico nuevo autorizado.

Actualización R278: [filesystem/caché identificados y assets empaquetados offline](doom-rw4-deployment-r278.md).
La siguiente meta concreta es el instalador/launcher completo en PC: extracción
y rutaWAD, transporte grande acotado y preflight de memoria antes del gate físico.
El carrier de4,8MB no se instala con el transporte actual de probes64partes/32KiB.

Actualización R277: [cambiar de esfera y recoger al volver](doom-ram-close-r277.md)
ya pasa con el backend nuevo. La salida normal y el cierre de página quedan
cubiertos en S3. Sigue pendiente el contraste específico RW4 antes del ensayo
físico agrupado: filesystem/caché/backend, presupuesto de memoria y rutaWAD.

Actualización R276: la [integración PC del motor y el backend RAM nuevo](doom-ram-engine-r276.md)
ya pasa E1M1, controles, pausa y dos salidas con JOIN/unload. Se completó esa
parte de la preparación. Quedan recogida tras salida inesperada/reentrada y
contratos específicos RW4 de filesystem/caché/memoria/rutaWAD, antes del plan
físico agrupado. Este documento no autoriza enviar el ELF PC al reloj.

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
