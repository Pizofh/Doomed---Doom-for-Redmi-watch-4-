# R309: DoomTrace abre con ERROR30; RAM aún sin medir

El usuario informa rojo/ERROR30 al abrir DoomTrace y ceros en FREE/MAX.
No informa haber pulsado START. CLOSED adicional y retorno al menú siguen
pendientes de aclaración; se solicitaron sin reabrir la prueba.
No se envió ningún comando nuevo al reloj después del reporte.

En el código instalado, recover comprueba registro/lease/estado del residente
y el siguiente tick entra en checkpoint30 solo después de leer finished==1.
Esta ruta agrupa detach/JOIN si falta, balance/cleanup, identidad del registro,
rmmod, registro vacío, nodos ausentes y retirada de lease. El código no permite
saber cuál de esas operaciones lanzó la excepción, ni demostrar descarga.
La ausencia de START y este checkpoint sitúan el problema en la recuperación
del residente anterior, antes de una nueva ejecución del motor.

FREE/MAX se inicializan con ceros y view.ram solo los actualiza dentro del
preflight de START. Los ceros observados no miden RAM disponible y no prueban OOM.
No atribuir el fallo al PNG, al decoder o a falta de memoria.

La instrumentación R307 es demasiado amplia en esta ruta: su caso recuperado
simulado solo cubre el éxito. Antes de otro intento físico conviene separar
las operaciones de cierre y obtener estado C/cleanup con una lectura acotada,
sin repetir carga, JOIN ni rmmod a ciegas. No reducir guards de identidad,
balance o cierre para permitir START. No reabrir DoomTrace/DoomRAM, borrar957/963,
reiniciar o forzar descarga. No hay nuevo payload físico aprobado por este reporte.
