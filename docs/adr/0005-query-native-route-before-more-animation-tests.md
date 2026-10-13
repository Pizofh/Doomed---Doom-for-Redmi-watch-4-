# ADR 0005 — consultar la ruta nativa antes de más ensayos de animación

Estado: aceptado para preparación PC; inventario físico sujeto a revisiónR189.
Fecha:2026-10-12.

El usuario observa animaciones stock y pide avanzar hacia C. Lua y una imagen
propia ya funcionan físicamente; otro ensayo aislado de cambio de colores no
resuelve el loader. Las animaciones stock tampoco prueban nuestro refresh.

Preparar NativeInfo, un inventario único de funciones y comandos mediante
consultas fijas help/uname, sin ejecutar ningún loader. La salida se presenta
con una leyendaPNG propia; no se depende de labels/fuentes aún sin resolver.
Documentar la escritura/eliminación de la captura y la falta de timeout duro
del shell. Ver [R188](../native-route-r188.md) y[planR189](../native-info-physical-plan-r189.md).

No declarar equivalente tipofunction/listado de comando y ejecución C. Un
helloC físico requiere contrato y privilegios de2.2.86 por separado. El ELF
S3 del emulador no es un candidato para el RW4. El refresco se validará con
la integración de frames reales cuando exista una ruta nativa compatible.

No nueva instalación/activación física automática por esta decisión.
