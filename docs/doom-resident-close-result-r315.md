# R315: rechazo16 al liberar imagen; JOIN y retirada no ejecutados

Las fotos de CExit muestran etapa12 roja e IO ERR16. Registro/lease1, captura
de control abierta/leída/cerrada1, secuencia7, STARTED/READY/FINISHED1,
JOINED/ERROR0. Usuario confirma retorno normal, menús y corona.

La etapa12 identifica f:write del command7, no open del control o JOIN.
Al recibir rechazo, CExit intentó cerrar el handle y terminó sin nuevo
snapshot ni command5/JOIN ni rmmod. Los campos de control visibles son la
última captura previa: C CLOSE1 no confirma por sí solo el cierre del handle
posterior de escritura. No se reporta retirada del módulo ni ACK del command7.
Los ceros de reason/exitcode/alloc/freed/cleanup son indefinidos antes de JOIN.

En el C instalado, command7 devuelve-16 si no started/o joined, o si
rw4_game_image_release encuentra image_ref distinto de0. Con la captura previa
STARTED1/JOINED0, una referencia de imagen retenida es el candidato directo.
El rechazo de owner sería-1 y la validación de packet/secuencia-22. No se
observó el momento interno de rechazo: no afirmar por esto qué decoder/handle
sigue vivo, si faltó close o fue rechazado por cookie, ni corrupción o fuga
real de RAM. La inspección estática de caché previa no prueba todos los caminos
de decoder/errores físicos. No quitar la protección de lectores ni forzar rmmod.

No nuevo comando físico ni repetición de ensayos después del reporte.
La próxima corrección debe abordar el lifecycle de imagen/cierre conservando
identidad, owner y referencias; no otro intento idéntico de command7.

## Espacio de esferas

El usuario pidió liberar un par. Se indicó borrar manualmente **CInfo955 y
CExit954**, inactivas y con ensayo terminado: no tienen timers/GC que emitan
comandos nativos; CExit terminó antes de ejecutar shell/capturas. Los journals
y resultados permanecen en PC. Borrar esas UI no retira el módulo residente.
Conservar **DoomRAM957 (ELF)** y **DoomLauncher963 (WAD)** y no abrir otras pruebas.
La eliminación aún no está confirmada: no asumir nuevo conteo14 desde16,
no actualizar journals ni borrar desde PC. No cambio de vínculo/reinicio.
