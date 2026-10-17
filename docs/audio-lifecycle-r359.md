# R359: elegir transporte gestionado, sin abrir audio físico

Continúa la inspección estática del mismo AP fijado en R358. No cambia el motor,
la esfera instalada ni el mezclador C ya probado. No se añade otro payload.

## Hallazgos que cambian la implementación

**PAUSE/RESUME del lower driver BES no prueban una pausa efectiva.** En los
offsets 0x1f8648 y 0x1f862c las funciones solo escriben diagnóstico y retornan
cero. No detienen DMA ni devuelven buffers en esas funciones. La tabla de
operaciones seleccionada y la ruta final deben verificarse antes de aplicar esa
conclusión a un nodo concreto. No presentar éxito de un ioctl como evidencia de
silencio o de devolución de memoria.

El reproductor `nxplayer` sí mantiene un contador de buffers prestados al driver.
Al detenerse, sigue recibiendo devoluciones antes de liberar sus buffers y
desregistrar la cola. La limpieza alrededor de 0x2184f8–0x21856c usa FREEBUFFER,
UNREGISTERMQ, RELEASE y close. El mensaje de finalización no sustituye a la
devolución de todos los buffers. El mensaje de parada alrededor de 0x218760
envía STOP y vuelve al bucle receptor, sin liberar inmediatamente el almacenamiento.

## Ruta preferida: media player con streaming

Se identificaron en RW4 wrappers de open, close, prepare, write_data, get_socket,
close_socket, start y stop. La secuencia observada se parece a la implementación
pública de [OpenVela media_graph.c](https://github.com/open-vela/frameworks_multimedia_media/blob/dev/client/media_graph.c).
Es una correspondencia de arquitectura y código; no demuestra identidad de
versión ni autoriza copiar firmas/layouts actuales sin contraste.

La API pública documenta archivo y modo buffer, con transporte por socket y
opciones de formato en [media_player.h](https://github.com/open-vela/frameworks_multimedia_media/blob/dev/include/media_player.h).
Eso permite investigar una ruta que copie PCM al transporte del sistema, sin
prestar buffers propios del módulo directamente al DMA.

En este RW4 concreto:

- `write_data`, offset 0x4e0378, retiene temporalmente el handle mediante su
  contador en +16 y usa el descriptor de +20. Envía con flags cero.
- Solo acepta como éxito un envío completo. Ante retorno parcial no negativo
  fuerza ECONNRESET (104), cierra el descriptor y lo pone a cero. Ante un error
  negativo también cierra; no copiar la recuperación de EINTR de upstream actual.
- `get_socket`, 0x4e0420, retorna el descriptor o un error negativo. No es una
  concesión de propiedad: el módulo no debe cerrar por su cuenta ese descriptor
  y después pedir al handle que vuelva a cerrarlo.
- `prepare`, 0x4e0194, puede crear un listener en modo buffer y esperar una
  conexión. El envío y los comandos de control también pueden esperar. No hay
  todavía prueba de timeout físico acotado para ninguna de esas rutas.
- `close`, 0x4e00b0, tiene errores tanto en la orden al servicio como en la
  desconexión del proxy. Solo tras ellas reduce su referencia y libera cuando
  corresponde. Un error de close no permite asumir que ya no existe un handle.

## Decisión concreta

Priorizar el transporte gestionado para la próxima integración, manteniendo
open/prepare/write/stop/close en el worker de audio, separado del timer Lua y
del render. Los efectos no se escribirán a flash por evento. El mezclador C
permanecerá dueño de sus muestras y del bloque de salida durante el envío.

Un fallo de audio debe deshabilitar el sonido conservando el juego. Tras un
envío parcial no se reenvía el resto a ese handle. No se repite un close con
resultado ambiguo ni se descarga el módulo mientras pueda quedar un worker o
callback activo. El corte de un juego/sesión no garantiza interrumpir un syscall
bloqueado: resolver los tiempos de espera antes de preparar el ensayo físico.

También falta identificar escenario/ruta y el contrato real de foco. El wrapper
de telefonía llamado `audio_focus_request` hallado en R358 no es por su nombre
una API genérica para Doom. No se usarán escenarios de llamada ni se cambiará
el volumen global para forzar la salida.

## Material listo y siguiente paso

`doom/platform-rw4/audio/managed-candidates-r359.json` conserva ocho offsets y
sus huellas SHA256 de 64 bytes, sin bytes de firmware ni direcciones enlazables.
Tiene `callable:false` y `physicalDeploymentAuthorized:false`: no es un binding
aprobado. Lo genera `tools/review-audio-managed-candidates-r359.mjs`, que verifica
la imagen y rechaza sobrescribir el archivo.

`tools/review-rw4-audio-lifecycle-r359.mjs` genera cinco ventanas anotadas solo en
`artifacts/research/audio-r359/`, ignoradas. Se inspeccionaron los caminos
anteriores; no se ejecutó firmware ni driver. No se repitieron las pruebas del
mezclador sin cambios. Sin conexión al reloj, instalación o reinicio.

Siguiente paso acotado: revisar el proxy de media y sus esperas, y la elección
de stream/focus en el firmware; después implementar el transporte C contra un
doble de prueba con fallos de apertura, escritura parcial, pausa y cierre.
Solo después se podrá preparar un ensayo físico concreto combinado. No se pide
otra prueba manual al usuario en este checkpoint.
