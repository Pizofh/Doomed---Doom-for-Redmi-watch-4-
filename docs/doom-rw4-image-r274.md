# R274: imagen virtual en RAM y VFS real del emulador

Se implementó una vista de imagen binaria de un frame C, legible por partes y
con seek. No hay escritura de imágenes en flash ni punteros de píxeles exportados
a Lua. **Todavía no se probó su renderizado con LVGL ni se operó sobre el reloj.**

## Formato identificado en el candidato RW4

La misma imagen AP fijada en R273 contiene código con otra correspondencia de
direcciones. Dos cruces independientes permiten inspeccionar estas funciones:

| Función | Offset en AP | Destino Thumb del veneer |
|---|---|---|
| lv_img_set_src | 0x4c75c | 0x1c03dfd9, veneer 0x5b4220 |
| lv_img_decoder_get_info | 0x24fc0 | 0x1c01683d, veneer 0x5b3af8 |

En estos cruces, dirección de código = offset + `0x1bff187c` + bit Thumb.
No se afirma un memory map completo. R273 descartó correctamente usar la dirección
ROM como offset directo, pero no había identificado esta segunda correspondencia.

La lectura de campos del decoder muestra cabecera de **4 bytes**, cf en bits
0..4, ancho en 10..20 y alto en 21..31. Para 320×200/cf4: `0x19050004`.
La tabla de profundidad en offset `0xc9340`, referenciada desde `0x21be8`, da
**32 bits por píxel para cf4**, no RGB565. El formato del S3 anterior tiene otra
cabecera: no se ha supuesto equivalencia entre ambos.

La vista convierte los slots RGB565 existentes a B,G,R,255 durante cada read.
Total lógico: 256004 bytes; no reserva otro frame de ese tamaño. La pérdida de
precisión proviene del slot RGB565 existente, no de un renderer reimplementado.
[Codec](../doom/platform-rw4/device/image-view.c) y
[contrato](../doom/platform-rw4/device/image-view.h).

El [decoder LVGL 8.3.11](https://raw.githubusercontent.com/lvgl/lvgl/v8.3.11/src/draw/lv_img_decoder.c)
aporta contexto para `.bin`, lectura de cabecera y lectura por líneas. Sus
[tipos de color](https://raw.githubusercontent.com/lvgl/lvgl/v8.3.11/src/misc/lv_color.h)
aportan contexto para el orden de canales. La revisión upstream no se identifica
como la exacta de Xiaomi; las dimensiones/profundidad se contrastaron con el AP.

## Puente y ciclo de vida

Nuevo nodo candidato `/dev/rw4doomimage.bin`; los nodos raw/control conservan su
protocolo. Abrir la imagen mantiene una referencia que bloquea descarga y JOIN.
Leer solo la cabecera no consume un slot. La primera lectura de píxeles adquiere
un slot inmutable; nuevas publicaciones no lo sobrescriben. Cerrar lo libera.
Un decoder puede mantener el handle abierto por caché: cerrar/invalidate esa
caché desde la UI sigue pendiente de integración. No se libera por timeout.

Seek es de 64 bits, admite SET/CUR/END dentro del tamaño y rechaza desbordamientos.
En el AP, el dispatcher `0x495620` toma seek de fops+16, pasa whence en stack y
después lee f_pos64 de file+8. Por eso la callback debe actualizar ese campo.
La ruta de open `0x495a4c` inicializa posición+8, inode+16 y privado+20 antes
de llamar al driver; `0x495b1c` usa un file temporal y transfiere esos campos a
la asignación del descriptor. Son evidencias estáticas de esta imagen RW4.

El adaptador ahora usa únicamente **posición+8 y cookie de driver+20** del file.
No interpreta FILE/reent/TCB. Esto amplía deliberadamente el contrato de R272,
que no tocaba campos de file; no se presenta como ABI pública/estable.
Las tres regiones de contrato se fijaron con SHA256/FNV32 de 64 bytes, además
de las 20 APIs existentes. Todo se comprueba antes de registrar nodos.

El [open de NuttX upstream](https://raw.githubusercontent.com/apache/nuttx/master/fs/vfs/fs_open.c)
es contexto, no sustituto del AP inspeccionado ni prueba física.

## Pruebas y fallo corregido

```powershell
node tools/test-rw4-image-view-r274.mjs
node tools/test-doom-rw4-transport.mjs
node tools/test-doom-rw4-transport.mjs image-vfs
node tools/build-doom-rw4-device.mjs
node tools/build-doom-rw4-bindings.mjs
```

- Codec C en S3: 1060 comprobaciones, mayormente fragmentos de un frame completo;
  256004 bytes/FNV `1c083d2f`, colores conocidos, lecturas desalineadas, EOF y
  seeks extremos. No llama al decoder S3 con cabecera RW4.
- Puente con kernel/worker simulados: 1114 comprobaciones; rechazo de firmware,
  rollback si falla el tercer registro, retención de frame, cookies, seek,
  JOIN/descarga bloqueados y cierre. No son 1114 escenarios independientes.
- **VFS/stdio reales S3:** 25 comprobaciones con las callbacks reales del
  candidato, adaptando solo la tabla fops32 a fops40 del S3. Lectura con y sin
  buffering, tell, seeks, EOF, frame rojo retenido mientras llega azul, cierre y
  retirada de los tres nodos. Worker sin iniciar y LVGL sin probar.

El primer fixture VFS falló en la lectura: comparaba la dirección del file
contra la de open. El descriptor temporal/copiado invalidaba esa suposición.
Se cambió a cookie por descriptor; S3 DWARF y la ruta open del AP respaldan el
campo+20. La primera VM retuvo una referencia que no podía retirar normalmente;
se preservó evidencia y se reseteó **solo esa VM propia**, sin hardware.

Una segunda ejecución llegó a la comprobación seek/EOF, donde el fixture omitía
el clearerr que hace nuestro rw4_fseek. Se alineó con el runtime; el módulo se
pudo retirar y se verificó el hash del ELF antes de borrarlo. No se atribuye
todo el segundo fallo únicamente a un flag concreto sin traza adicional.
La ejecución final pasó; módulos, nodos y ELFs temporales retirados. No hubo
descarga nueva de herramientas, cambios de firmware ni pruebas físicas.

Resultado final C: 603364 bytes, secciones asignables 898936, cero imports.
SHA256 `a7ce84bf35ee6a0051c2690fbdb8e77cbf8d181c5fa89a3cbeefcb64bb3b8d90`.
Sigue marcado `loadableModule=false` y `physicalDeploymentAuthorized=false`.
No se aumentó la reserva de píxeles; los buffers internos del decoder aún no
se han medido. No se extrapolan FPS, RAM libre ni privilegios físicos.

Inspección reproducible con `review-rw4-image-r274.mjs`,
`review-rw4-image-code-r274.mjs` (normal/follow/contracts) y
`review-rw4-image-contract-r274.mjs`. Ya ejecutadas: salidas inmutables bajo
`artifacts/research/image*r274*`; no repetir sobre los mismos directorios.

**Siguiente:** conectar el widget Lua, cerrar su caché desde el contexto UI y
probar presentación/cambio de frames/salida en PC. Después faltan WAD/marca y
worker real del port, antes del ensayo físico agrupado. R270 sigue siendo el
último paso físico completado, con el puente antiguo retirado y reloj normal.
