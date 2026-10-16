# R300: el frame fijo también está corrupto

El usuario respondió «todo ok excepto la imagen» al ensayo autorizado de
DoomStill: sigue apareciendo solo una parte pequeña de Doom y basura debajo,
ahora contenida dentro del recuadro. El reporte global incluye referencia,
salida y retorno normales, sin descripción independiente de cada estado.
No se pidió repetir ni se enviaron comandos al reloj tras la respuesta.

La renovación rápida de Image no es necesaria para reproducir el fallo.
Esto no demuestra que todos los contratos de caché/lease sean correctos ni
que los píxeles originales estén bien. El frame completo del MVP sigue
pendiente; no hay una corrección física confirmada.

La siguiente prueba preparada en PC es [DoomPNG R301](doom-frame-png-physical-plan-r301.md):
leer el frame RGB565 con su checksum, convertir una sola captura a PNG y
presentarla mediante el decodificador PNG stock. Conserva ELF/WAD; no cambia
formatos del C ni bindings por conjetura. Permite distinguir la vía binaria
actual de la captura de píxeles y de la presentación PNG. No sirve todavía
como transporte para animación: escribe una sola imagen, no frames continuos.

Evidencia estructurada: experiments/doom-runtime-rw4/observations-r300.json.
