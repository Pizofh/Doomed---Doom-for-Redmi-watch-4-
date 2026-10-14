# R248 — módulo StepC observado; registro truncado reconstruido

2026-10-14. Usuario aportó dos fotos de ProcView, TEXT y HEX; ambas muestran
MARK/OPEN/READ/CLOSE verdes y LEN HEX0042 (**66bytes**). Después confirmó esfera
habitual/menús/desplazamiento/pulsación larga: «si, todo nice».
Ensayo R247 consumido. Sin otra operación física, recarga o retirada C.

## Qué se observa

Transcripción manual de HEAD HEX64bytes y TAIL HEX16bytes, comparada con las
fotos. Sus14bytes de solapamiento coinciden; juntos cubren los66bytes completos,
sin huecos. Reconstrucción privada `artifacts/proc-photo-r248/` (no publicar
direcciones de memoria/extracto real). El script verifica longitud, overlap y
hash del ELF aprobado; no lee hardware, firmware o claves.

| Campo | Observado / comparación |
|---|---|
| Nombre | rw4step234, el módulo de StepC |
| INIT | Base TEXT +1, entrada Thumb esperada |
| UNINIT | Base TEXT +0x141, offset del callback del ELF aprobado |
| ARG / NEXPORTS |0/0, coherente con init propio |
| TEXT SIZE |972bytes, coincide con la compilación R234 |
| DATA | Puntero no nulo; valor real mantenido privado |
| DATA SIZE | **Ausente**, no sustituirlo por36de la compilación |
| Final |63bytes ASCII hasta la coma previa a DATA SIZE, seguidos de3bytes00; sin LF |

El módulo propio está **registrado/residente** según este registro; la posición
de entrada/uninit y tamaño coinciden con el ELF que StepDiag ya comprobó en
almacenamiento. Esto da evidencia fuerte de que la inicialización llegó a
instalar su metadata. Por el orden del C aprobado, es una inferencia fuerte
que pasó las comprobaciones y `register_driver` retornó éxito antes de guardar
uninit. No se ha abierto ni leído el nodo para probar callbacks o su estado.
No afirmar que el juego/bridge de input completo funcionó o que puede retirarse.

## Por qué fallaban las comprobaciones

La representación observada contiene NUL, no un CSV/tabla completamente válido.
El parser anterior la rechazaba deliberadamente. El lector R240 rechazaría ASCII
antes de END LINE por esos NUL; esto explica por qué no convertimos la fila
ASCII informada en R244 en un verde confirmado. El reporte manual de END LINE
rojo/resto gris queda conservado como discrepancia, ahora con bytes disponibles.

La imagen candidata R240 tiene el formato de nueve campos y un límite64 en el
formateador. Con los tamaños y representaciones visibles, la fila completa
esperada necesita66bytes incluido LF; el prefijo63+NUL del búfer64 encaja con
el corte observado. Es una explicación fuerte apoyada por foto y análisis
estático; no hemos ejecutado el printf stock aislado ni obtenido una copia
binaria exacta del firmware físico. No parchear firmware, ignorar bytes o
inventar el campo faltante para hacer verde un parser genérico.

En `client-rw4-r235.lua`, después de cargar se exige inventario reconocido
antes de snapshot/START. Un fallo ahí devuelve RegistryUncertainAfterLoad y
retiene el módulo, precisamente para evitar descargar algo no identificado.
El registro actual respalda esta explicación del EXIT rojo de StepC: la
comprobación posterior a carga no pudo reconocer su salida. No existe un log
runtime de R237 que certifique por separado la rama exacta ejecutada.

## Cambio preparado en PC

`proc-own-record-r248.lua` clasifica únicamente esta representación de66bytes:
63ASCII+3NUL, nombre fijo, campos observados, punteros u32, alineación y offsets
de entrada/uninit del candidato. Direcciones se derivan del registro, no se
fijan las direcciones de las fotos. Devuelve OwnClippedRecord/ownObserved=true,
pero metadataComplete=false/inventoryComplete=false/dataSizeKnown=false.
**No es un parser genérico ni una autorización de unload.** No archivos,
shell, driver, módulo o llamadas C; no integrado en payload físico anterior.

24casos pasan en Lua real S3 con la reconstrucción privada y fixtures sintéticas:
registro observado y bases alternativas, offsets/tamaños/exports/argumentos
incorrectos, puntero inválido/desalineado, overflow, sufijo alterado, otro nombre,
filas adicionales o completas rechazadas. No completa DATA SIZE ni devuelve
readyToUnload. Inventario S3 igual antes/después y tmpfs retirado.
Source SHA19d01972e4da124c634569c71c36f75d8034ce7f550865428449abb5111403b5.

```powershell
node tools/reconstruct-proc-snapshot-r248.mjs
node tools/test-proc-own-record-r248.mjs
```

Requieren transcripción privada y rechazan resultados existentes. Evidencia de
tests `artifacts/emulator/proc-own-r248/summary.json`; sin Bluetooth/USB/RW4 nuevo.

## Siguiente checkpoint

Leer el snapshot32bytes del **mismo módulo ya residente**, sin recargar ELF,
para comprobar estado y cerrar el handle. Es otra operación nativa: open/read/
close invocan callbacks C aún no probados físicamente. Preparar adaptación,
pruebas y plan antes de revisión/autorización; no ejecutar ahora.
Solo después de identidad/estado/cierre demostrados considerar retirada
controlada. No rmmod a ciegas, reabrir StepC/ProcView, borrar marcas o reiniciar.
Privilegios exactos/recovery integral siguen sin validar; RAM no es sandbox.
