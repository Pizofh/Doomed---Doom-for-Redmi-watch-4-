# R301: DoomPNG, captura directa a PNG; pendiente de autorización

**Actualización R302:** usuario autorizó el plan; instalación inactiva
confirmada, [ensayo manual pendiente](doom-frame-png-install-r302.md).
No repetir envío ni pedir aprobación nueva para el mismo ensayo autorizado.
Lo siguiente conserva el plan aprobado.

Meta única: observar un frame completo por una ruta diferente de
`/dev/rw4doomimage.bin`. No es una corrección confirmada ni una solución de
streaming. Solo hubo trabajo en PC después de la respuesta R300.

## Paquete fijo

| Elemento | Valor |
|---|---|
| Dispositivo | M2315W1, firmware 2.2.86 |
| Launcher nuevo | DoomPNG, ID365219958, 31.704 bytes, 15 recursos |
| SHA256 paquete | `ae84530371510fd13e4e4803959c3fc954704ad3405fa6e4b285a0e9888d566c` |
| SHA256 Lua | `fd17dab3c793f73d81c34b36f8546ac3eeb1aafc6c09f8a4d9dfe5e5f81b2181` |
| Artefacto | artifacts/doom-frame-png-r301/package/DoomPNG-id-only.face |
| Journal nuevo | tools/local/pc-rfcomm/doom-frame-png-r301.json |
| ELF/WAD | Los mismos del carrier365219963, sin reenviarlos ni modificarlos |

No reemplaza, elimina ni activa esferas. Conserva la selección actual. El
último catálogo tenía14; puede alcanzar15. Rechazo por cupo/espacio: parar
sin borrar ni reintentar automáticamente. Instalación:16 partes,32.034 bytes
MASS previstos más512 de control dentro del límite32.768.

## Cambio concreto

START manual de un uso mantiene las verificaciones completas de CRC/RAM,
cabeceras y tamaños de R291. Carga el mismo rw4doom282, espera un frame y
envía PAUSE como DoomStill. Sin movimiento, disparo ni RESUME.

Lua abre **por primera vez en esta prueba física** `/dev/rw4doomframe` con
buffering desactivado: cabecera32bytes y128.000bytes RGB565. Mantiene su lease
hasta EOF/cierre, comprueba dimensiones/formato/generación y FNV1a del frame.
Son callbacks C existentes, pero esta lectura completa no está validada en
el reloj por las pruebas anteriores de la imagen `.bin`.

Convierte cuatro filas por callback UI de100ms, sin guardar un frame RGB
completo en Lua. Escribe **una sola PNG de195.651bytes** en
`/data/app/watchface/market/365219958/lua/frame.png`. Usa RGB24, CRC de cada
chunk, zlib con bloques sin comprimir y Adler32. La Image solo se crea tras
checksum/EOF/flush/cierres correctos. Nunca pasa el nodo `.bin` a LVGL.
La captura tarda50callbacks (~5s adicionales después de CHECKING).

PNG propia e inmutable retenida después de EXIT, también si queda parcial;
no borrarla mientras pueda existir una caché del decoder. Máximo196.000bytes,
sin escrituras continuas, ni reabrir/reintentar START. Una marca propia de14B
evita repetir. La retirada eventual del paquete/PNG requiere decidirla por
separado cuando el reloj esté normal; este ensayo no incluye eliminación.

EXIT/pageOnPause cierran primero los handles de captura; después se conserva
STOP/JOIN/balance/identidad/rmmod/registro/nodos del launcher ya probado. La
PNG no depende del módulo después de cerrarse el archivo. CLOSED restaura
la referencia. Si falla la captura: ERROR, intento de STOP, sin rmmod ciego.
GC intenta cerrar archivos y solicitar STOP; no usa LVGL ni descarga C.

## Un ensayo observado, después de aprobación

Usuario junto al reloj, funcionando normalmente, batería≥50%; vínculo PC
actual sin otro cliente/OTA. No se requiere alternar vínculos por rutina.

1. Abrir solo gates de Static/r301, reconstruir helper y preparar.
   UNA ejecución de `node tools/pc-static-watchface.mjs install r301`.
   Ante rechazo/corte: parar, sin reenvío ni reanudación automática.
   Finally restaurar gates, reconstruir y comprobar bloqueo. Si registra,
   una consulta independiente de catálogo; no activarla desde PC.
2. Seleccionar **DoomPNG**, preview de TRES barras CIAN. La cuadrícula debe
   verse completa. Si falta UI o la referencia sale corrupta, no START.
3. START UNA vez. Mantener despierta durante CHECKING mediante toques breves
   en zona vacía. Tras los CRC y ~5s de conversión debe indicar PAUSED:
   observar si el frame completo de Doom se ve bien o continúa la franja.
   Sin controles. Si ERROR/suspensión/pantalla vacía, no repetir/reabrir.
4. EXIT una vez antes de~30s desde el arranque nativo. Observar CLOSED y
   referencia. Volver a la esfera habitual; comprobar menús/corona.

No iniciar pruebas anteriores, reiniciar o improvisar recuperación ante un
fallo. Si responde, salir por Ajustes. Registrar el resultado del lote sin
pedir comprobaciones redundantes ya contestadas por el usuario.

## Riesgos y límites

Mantiene los riesgos de [R291](doom-first-run-physical-plan-r291.md) y
[R298](doom-snapshot-physical-plan-r298.md): C sin aislamiento demostrado,
bloqueo/panic/corrupción, sin recovery integral validado. Añade apertura/
lectura/cierre del nodo raw durante50ticks, ~196KB de escritura en flash y
memoria del PNG/decoder. Puede agotar memoria/espacio o bloquear callbacks.
No cambia firmware, bootloader, particiones ni bindings. Reiniciar no garantiza
revertir escrituras o corrupción. Timer30s y límite nativo120s son cooperativos,
no watchdog duro. El frame completo aún no está validado físicamente.

## Evidencia suficiente en PC

- Lua real en el emulador S3:22casos del encoder, incluyendo truncado,
  cabecera/checksum/EOF erróneos, fallos de escritura/flush/cierre/cancelación.
  PC decodifica la PNG y compara los64.000píxeles,202CRC y Adler32.
- UI/lifecycle:22casos base +20first-run +7nuevos; raw cerrado antes de
  STOP/JOIN/crear Image, una sola Image, salida/pause/GC, fallos sin descarga
  ciega. Módulo, archivos y widgets simulados en esos casos.
- Paquete exacto/readback, pins, corrupción rechazada, presupuesto y gate
  cerrado pasan. `prepare r301`: OfflinePrepared, sin radio.

No reproduce el RW4, no prueba el frame nativo físico ni el decoder RW4.
Resultados posibles: PNG limpia favorece fallo en la ruta `.bin`; checksum
fallido favorece problema de lectura/integridad; PNG válida pero corrupta
no distingue por sí sola fuente original frente al decoder PNG dinámico.

Fuentes: frame-png.lua, png-main.lua, doom-frame-png-source.mjs.
Reproducir: test-doom-frame-png.mjs, test-doom-frame-png-ui.mjs,
package-doom-frame-png.mjs (sin sobrescribir salida),
test-doom-frame-png-package.mjs. Helper cerrado actualSHA256
`42836543bc947052bc19fb283af78a575ea71949437cf33dd306519c64b586dd`.
