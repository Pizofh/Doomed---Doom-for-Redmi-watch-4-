# R297: fotografías confirman corrupción del frame

El usuario aportó dos fotografías, una con la franja reconocible marcada en
rojo. Solo esa franja superior contiene imagen útil de Doom; el resto del
área de juego presenta patrones/colores corruptos. Las etiquetas y botones
de la UI permanecen legibles. **No es el HUD normal.** No se copian las fotos
al repositorio porque incluyen entorno del usuario.

Se corrige la valoración anterior: el motor nativo se ejecuta y responde a
controles, pero NO se ha demostrado render completo correcto ni jugabilidad
visual del MVP. Los reportes de EXIT/menús/retorno se conservan como evidencia
separada. No se midieron FPS, contenido completo del frame ni RAM nueva.

## Investigación PC de esta sesión

Se inspeccionaron el ELF/objetos fijados y las fuentes de dimensiones y
formato; las definiciones del engine y adaptador son320×200. El formato RW4
actual es cabecera4bytes/cf4 más BGRA32, derivado del AP candidato inspeccionado;
S3 usa cabecera12bytes/RGB565. Los slots internos son RGB565 inmutables con
lease durante la presentación. No se cambió formato o ABI por conjetura.

Se revisaron las ventanas ya disponibles del AP candidato: decoder-open,
read-line, port filesystem, read/seek y selección/retirada de caché. Las
pruebas previas de serializer/VFS no cubrían el decodificador/dibujo físico
RW4 completo. No se encontró una causa demostrada ni se ejecutó firmware.
No afirmar que el defecto sea stride, BGRA, f_pos o caché sin un experimento
que permita distinguirlos.

Hipótesis aún abiertas: interpretación/lecturas del archivo binario, backend
de dibujo y duración de sus buffers/leases al renovar imágenes. El controller
actual elimina/recrea Image e invalida la fuente aproximadamente cada100ms;
el próximo experimento mantiene una sola Image y una sola generación.

[DoomStill R298](doom-snapshot-physical-plan-r298.md) se preparó para separar
renovación de presentación estática. [Resultado posterior R300](doom-frozen-result-r300.md):
el frame fijo también sale corrupto; la renovación no es necesaria para el
fallo. No se ha demostrado aún la causa exacta.
