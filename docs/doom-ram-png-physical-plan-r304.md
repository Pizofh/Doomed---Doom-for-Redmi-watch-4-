# R304: DoomRAM, animación por PNG virtual en RAM

**Preparado solo en PC; sin autorización ni instalación física nueva.**
Meta: imagen completa en movimiento, controles y salida/reinicio, agrupados
en una instalación y dos ciclos manuales condicionados al éxito del primero.
La captura PNG física R303 fue correcta; no se repite ese diagnóstico.

## Cambio y artefacto revisable

| Elemento | Valor |
|---|---|
| Dispositivo | Redmi Watch4 M2315W1, firmware2.2.86 |
| Nuevo paquete | DoomRAM, ID365219957,634.212bytes,20recursos |
| SHA256 paquete | `98d0c6c54a16e4c1575e170d6add896df742d26cbff445a6d4a38bfa31338326` |
| SHA256 Lua | `1c0396d3973d2c7629351a8f5af5b561ac4b349310239d56882cf599dd6deff7` |
| ELF nuevo |604.992bytes,SHA256 `6a5d43df8a3c9753c6b943ca5fd25a9835edd7cd97b4f93a33aa199d8926704e` |
| Módulo |rw4png304 |
| Archivo |build/doom-ram-png-r304/package/DoomRAM-id-only.face |
| Journal privado nuevo |tools/local/pc-rfcomm/doom-deployment/ram-png-r304.jsonl |

Incluye C y launcher propios. **No incluye otro WAD**: usa el ya instalado en
`/data/app/watchface/market/365219963/lua/doom1.wad`. Hay que conservar
DoomLauncher365219963. El módulo previo no se reemplaza: el nuevo ELF queda
en la carpeta de DoomRAM. No activa ni borra esferas desde PC.

Usuario confirmó borrar DoomStill/DoomRun/DoomPlay/MemInfo tras R303. El último
catálogo era15: se esperan11, sin nueva lectura física ni supuesto de igualdad
con ese histórico. Se conserva el catálogo/selección actual de la instalación.
Si falta el carrier, hay otro módulo, rechazo de cupo o corte: parar.

La variante conserva el motor, adaptador4MiB, WAD, hilos, controles y21bindings
de firmware. Cambian el serializer de imagen y una adaptación mínima del
transport. Se reprodujo exactamente el ELF físico anterior antes de enlazar.
Fuentes antiguas y sus objetos no se sobrescriben.

Nuevo nodo `/dev/rw4doomimage.png`, además de control/raw existentes. Una PNG
virtual192.278bytes se sirve mediante read/seek desde el mismo slot RGB565
inmutable. C calcula CRC/Adler al adquirir cada frame, con tabla de1KB, y
serializa por fragmentos. No asigna un segundo PNG ni escribe frames a flash.
El decoder stock sí puede asignar buffers de memoria propios.

Lua reutiliza los controles y retiro de Image/cache/lease ya implementados;
renueva cada100ms nominales, sin promesa de10FPS físicos. EXIT conserva
STOP/JOIN/balance/identidad/rmmod/registro/nodos y retorno al selector.
Las comprobaciones de nodos bloquean tanto `.bin` viejo como `.png` nuevo.

CRC completo al primer START de cada instancia Lua, seguido de RAM y
cabeceras/tamaños. Un segundo START **en esa misma instancia**, tras CLOSED,
omite el CRC completo pero repite cabeceras/tamaños/RAM/carga/identidad.
Salir y reabrir la esfera obliga a verificar otra vez. No hay marca durable
que autorice saltarse el CRC. Una modificación de contenido con mismo tamaño
en esa instancia no se detectaría con las comprobaciones breves.

## Operación propuesta tras aprobación

Usuario observando, reloj normal con batería≥50%; mantener vínculo PC actual,
sin otro cliente/OTA. No alternar vínculos, reiniciar ni repetir healthchecks
por rutina. Autorización concreta: **una instalación y dos ciclos manuales**,
el segundo solo si el primero se ve bien y termina CLOSED.

1. Habilitar temporalmente PHYSICAL_DEPLOYMENT_REVIEWED y
   PHYSICAL_RAM_PNG_REVIEWED; solo LargePhysicalReviewed en el helper.
   Static/resume/control-retry quedan cerrados. Reconstruir y preparar.
2. UNA ejecución de `node tools/pc-doom-ram-png.mjs install`:311partes2048,
  640.147bytes MASS más control, pausas100ms. Unos40–60s estimados, no medidos.
   Journal exclusivo nuevo; `transfer.jsonl` anterior se conserva y comparten
   watch.lock para impedir concurrencia. Sin retry ni resume automáticos.
   Finally restaurar gates, reconstruir y probar cierre. Si registra inactiva,
   una consulta independiente de catálogo; no seleccionar desde PC.
3. Usuario selecciona **DoomRAM**, preview de CINCO barras NARANJAS. Si aparece
   READY/UI correcta, START una vez; mantener despierta durante CHECKING con
   toques breves en zona vacía. Sin UI/ERROR/suspensión: no repetir/reabrir.
4. Al aparecer PLAYING, observar si Doom se ve completo **y se mueve**. Probar
   brevemente UP, LEFT/RIGHT y FIRE, PAUSE/RESUME y EXIT antes de~30s. Si hay
   basura, lentitud bloqueante o fallo, EXIT si responde, volver a habitual y
   describir; no segundo ciclo. Registrar CLOSED y retorno de START.
5. Solo si todo fue correcto y CLOSED: **sin salir de DoomRAM**, START otra
   vez. Debe omitir el CHECKING largo; probar brevemente y EXIT. Luego probar
   selector, volver a habitual y confirmar menús/corona. No tercer ciclo.

No incluye sonido, savegames, cambios de firmware o retirada de pruebas.
Límites30s por ciclo y120s nativo son cooperativos, no watchdog duro.

## Riesgos, vuelta y límites

Primera carga física de este ELF y primera animación por este nodo PNG. Puede
fallar el decoder/seek/cache/allocación o el cálculo de metadatos y bloquear,
causar panic, OOM o corrupción. El C sigue sin aislamiento demostrado. La
instalación escribe~634KB de flash; jugar no escribe frames a flash, aunque
el launcher conserva sus auxiliares propios de lease/captura. No cambia
bootloader, particiones, firmware o bindings. Reboot no garantiza revertir
corrupción; no hay recovery integral de firmware validado. Riesgos comunes
en [R291](doom-first-run-physical-plan-r291.md).

No forzar rmmod, tareas o retirada de archivos ante error. Si responde,
volver desde Ajustes. Guardar el estado y revisar antes de cualquier otra
acción física. La retirada eventual de DoomRAM no toca el carrier compartido;
se decidirá separadamente con salida/descarga confirmadas.

## Verificación suficiente, sin CI remota

- C ARM real en S3:811checks; PNG completa comparada por FNV con referencia
  independiente válida, límites/seeks/fragmentos y fronteras de bloques.
- Transport nuevo con VFS/stdio real S3:30checks; buffering/seek/EOF/cookies,
  frame rojo retenido mientras llega azul, cierre/retirada y nodos ausentes.
  Worker simulado; no se probó decoder S3 ni RW4 en esas pruebas.
- Lua:22base+7nuevos; animación/controles/pausa/EXIT, dos ciclos, CRC abreviado
  solo en misma instancia, nueva instancia verifica, errores y cabeceras.
  Native/widgets simulados en esos casos.
-20recursos exactos y pins; siete escenarios de protocolo simulado incluyendo
  rechazo/corte/clave/ausencia de carrier y preservación de catálogo/journal.
  Gates viejos/nuevos y entrada nativa cerrados; prepare sin radio pasó.

Resultados locales: artifacts/doom-ram-png-r304/{codec-tests,vfs-tests,
ui-tests,package-tests}.json. No FPS/memoria/decoder RW4 medidos todavía.
Reproducir: test-rw4-png-view.mjs, build-doom-ram-png.mjs (inmutable),
test-rw4-png-transport.mjs, test-doom-ram-png-ui.mjs,
package-doom-ram-png.mjs (inmutable), test-doom-ram-png-package.mjs.
