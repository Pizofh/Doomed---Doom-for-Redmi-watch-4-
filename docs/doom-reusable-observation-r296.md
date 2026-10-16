# R296: lote reportado OK; detalle visual pendiente

**Corrección R297:** fotos del usuario confirman corrupción fuera de la franja
útil; no era HUD normal. [Investigación](doom-render-corruption-r297.md).
La valoración siguiente es histórica, anterior a recibir esas fotos.

En respuesta al checklist de los dos ciclos autorizados, selector y retorno,
el usuario respondió «todo ok» y añadió que ve rayones/colores debajo de la
imagen de Doom, aproximadamente en mitad de la pantalla. Es una confirmación
global favorable del lote, sin estados de salida desglosados por ciclo. No
se recibieron fotografías ni se midieron FPS/RAM/latencia nuevos.

No se realizaron más comandos sobre el reloj, ni reinicios/reinstalaciones
o cargas adicionales. No hace falta repetir el lote para registrar el reporte.
Gates PC siguen cerrados.

## Ubicación esperada

La imagen del juego ocupa x35–354/y35–234. Dentro de sus últimas filas puede
aparecer el HUD original de Doom (munición, salud, cara y armadura). Debajo,
la UI coloca una etiqueta de estado PNG en x20/y249,180×20, y un indicador en
x350/y249. Las zonas restantes deberían mostrar el fondo/controles previstos,
no píxeles arbitrarios. Sin localizar lo observado no se puede clasificar
como HUD normal o defecto de presentación.

El framebuffer interno sigue siendo RGB565, pero el serializador físico
RW4 expone al decodificador una imagen LVGL de320×200 con cabecera4bytes y
pixeles BGRA de4bytes; el adaptador S3 usa otro formato. Se inspeccionaron
los límites del serializador/read/seek y la geometría de la UI. No se halló
una causa demostrada para el reporte y no se cambió código por conjetura.
La prueba S3 no descarta diferencias del decodificador/caché RW4.

Siguiente paso: si el usuario ya dispone de una foto, ubicar el área y
distinguir HUD, etiqueta de estado o artefacto. No solicitar un nuevo arranque
solo para obtenerla ni introducir otro payload antes de aclararlo.

Evidencia estructurada sin datos identificativos:
[observations-r296.json](../experiments/doom-runtime-rw4/observations-r296.json).
