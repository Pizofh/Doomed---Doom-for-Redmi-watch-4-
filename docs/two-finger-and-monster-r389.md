# R389: segundo contacto e icono de monstruo

El usuario solicita caminar y disparar con dos dedos mantenidos, sin autofire,
toggles ni movimiento retenido, y sustituir el marine por un monstruo. Trabajo
local autorizado; R388 sigue instalado y aceptado. Sin nuevo payload físico.

## Resultado de la inspección adicional

R353/R371 ya encontraron tres productores de muestras con npoints=1. R389
revisa una alternativa concreta: habilitar más contactos mediante una operación
normal del dispositivo. El upper ioctl en0x1c2dc0 llama lower+8; los init de las
tres familias instalan ese callback en state+92, con lower situado en state+84.

| Familia candidata | Literal del callback | Handler |
| --- | --- | --- |
| Zinitix |0x1dbcb8|0x1da7e8|
| Chipone |0x1de464|0x1dbe18|
| Hynitron |0x1ded00|0x1de4ac|

Los primeros84bytes de los tres handlers son idénticos. Aceptan0x901..0x906,
tabla de saltos05090e131803: escribir/leer un halfword en+2 del objeto de
configuración, escribir/leer un word en+4, devolver cero y no-op. No recorren
contactos, no cambian npoints ni habilitan un reporte multipunto. Los nombres
exactos de esos campos no se deducen solo de sus offsets. El upper tampoco
añade aquí otro comando de habilitación antes de delegar.

Por tanto, no encontramos un interruptor de multitáctil en esa interfaz.
Cambiar solo la UI o abrir otro lector seguiría recibiendo la muestra de un
punto ya construida. No significa que el panel físico sea incapaz ni excluye
otros caminos/llamadas indirectas; el driver activo aún no está identificado.
Los init contienen selección/detección de controladores, así que la presencia
de una familia en la imagen no prueba cuál equipa este reloj.

Reproducción: node tools/review-rw4-touch-ops-r389.mjs. AP y objdump fijados por
SHA; firmware, ventanas y clústeres de punteros quedan ignorados en artifacts.
No llama ioctl, lee el reloj ni modifica firmware. Informe
artifacts/research/rw4-touch-ops-r389/review.json. La exploración de clústeres
solo produce candidatos; la conclusión usa init/upper/callback concretos.

## Siguiente paso necesario para dos dedos reales

Diagnóstico separado que identifique el lower activo y observe muestras
durante dos dedos y sus liberaciones. Antes de construirlo: fijar ABI RW4
open/read/close/errno/nonblock y comprobar colas independientes/cierre. La
prueba anterior de un lector separado era SOLO emulador S3; sus direcciones
no deben trasladarse al RW4. No hay bindings revisados de esos descriptores
en el lock actual y no se prepara un ELF físico con direcciones supuestas.

Si el driver activo descarta el segundo punto, habrá que investigar su protocolo
crudo y una adaptación del driver. Leer I2C por separado puede competir con el
lector stock o consumir registros; no se trata como una observación inocua.
No parchear firmware ni instalar otro Doom alegando soporte de dos dedos sin
demostrar contactos/identidad/UP independientes. No hay implementación física
de multitáctil ni nueva prueba autorizada/preparada en este checkpoint.

## Icono candidato terminado

tools/doom-monster-icon-r389.mjs crea arte original de un monstruo rojo de un
ojo verde, cuernos y dientes, inspirado en un cacodemonio. Preview390×450 en
build/doom-monster-r389/preview.png revisado visualmente. No modifica la receta
R388 ni el reloj; se incorporará al siguiente paquete cuando haya un cambio
funcional preparado. No sprites/WAD/píxeles comerciales copiados.

La mejora de apertura sigue pendiente de perfilado; no se ha medido ni cambiado
en R389. El reloj puede seguir en uso normal mientras continúa el trabajo local.
