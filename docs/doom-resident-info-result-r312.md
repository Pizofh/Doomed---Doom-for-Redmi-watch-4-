# R312: hilo terminado, JOIN pendiente y módulo todavía residente

Las cuatro fotos muestran las páginas01 y02 repetidas de CInfo. Código00 y
punto verde: la captura acotada terminó con registro estable. Lectura visual:

| Campo | Valor |
|---|---:|
| REG OWN / LEASE |1 /1 |
| CAPTURE |0 |
| C OPEN / C READ / C CLOSE |1 /1 /1 |
| SEQUENCE |7 |
| STARTED / READY / FINISHED |1 /1 /1 |
| JOINED / ERROR |0 /0 |

El usuario confirmó después retorno normal a su esfera y menús normales.
El registro y lease corresponden al módulo propio; el nodo de control sigue
disponible y la consulta lo cerró con éxito. FINISHED=1 indica que el worker
llegó al final; JOINED=0 indica que la recolección del hilo sigue pendiente.
No se descargó el módulo. La página03 no fue aportada, pero sus estadísticas
de runtime solo se copian al snapshot cuando joined=1; no pedir reabrir para
obtener ceros que no serían mediciones válidas de limpieza.

## Acotación por código, no causa física demostrada

controller.tick ejecuta, en este orden, detach/command7, command5/JOIN y otra
lectura de estado; solo después valida balance/registro y llama rmmod.
La captura posterior aún con JOINED=0 sitúa el bloqueo antes de completar
JOIN. En transport.c, si pthread_join retorna error o un resultado inesperado,
error pasa a1; ERROR=0 no respalda esa rama de fallo en esta captura.
Pueden impedir avanzar la operación de detach/release, guard de propietario,
refs de frame/imagen, estado de image_slot o I/O open/write/close. No hay datos
para elegir uno. El test C existente reproduce que un lector de imagen abierto
o una lease de presentación impiden JOIN, pero eso no prueba que ocurriera aquí.
CAPTURE=0 significa que el archivo propio de shell no estaba presente al leer,
no constituye por sí solo prueba sobre comandos anteriores.

La siguiente corrección debe distinguir detach/release de JOIN y conservar
errno de I/O, detenerse tras el primer fallo y no reintentar automáticamente
la descarga. Mantener guards de owner/referencias/identidad/balance. No volver
a ejecutar motor, abrir pruebas antiguas, borrar957/963/lease, reiniciar ni
forzar rmmod como consecuencia de este reporte. No nuevo payload físico
autorizado o instalado; no comandos nuevos al reloj después de las fotos.

Resultado guardado en observations-r312.json. No repetición de suites ni
pruebas de hardware para registrar/interpretar estas fotos. Solo commit local.
