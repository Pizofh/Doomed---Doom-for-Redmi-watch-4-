# R323: primer fallo al liberar la imagen durante renovación

Usuario reportó FIRST24031607, LAST30031607, DIMS03200200, ERROR y posibilidad
de volver a su esfera/usar menús. No repetir START/reabrir ni segundo ciclo.
Sin nuevo comando físico tras el reporte.

- FIRST: etapa24, operación03(write control), errno16, comando07. El primer
  fallo observado es la escritura de liberación de imagen al renovar frames,
  después de detach; no apertura del control, constructor o get_img_size.
- DIMS320x200: se creó al menos un objeto Image y su consulta de dimensiones
  retornó320x200 antes del fallo. No prueba que sus píxeles fueran correctos
  o que se viera animación completa; usuario no describió esa imagen.
- LAST: etapa30, misma escritura07/errno16 durante limpieza, antes de JOIN.
  Según el flujo, se intentó STOP tras el primer fallo; luego finished1 y no
  joined al entrar en limpieza. No nuevo snapshot C exportado ni descarga
  confirmada. Asumir rw4png321 residente; conservar sus archivos.

El recorder distingue ahora operación fallida y conserva el primer contexto.
No demuestra un reader concreto ni la causa exacta de image_ref, cookie,
close/cache o guardas started/joined. La creación/tamaño de Image ya no son
la primera falla registrada en este ensayo. Próximo foco: retiro de referencias
de imagen/caché entre frames, no repetir comprobación de tamaño/CRC/carga.

## Espacio: dos paquetes anteriores que ya no usa este ensayo

Desde la esfera habitual, se aconseja borrar manualmente **DoomTrace365219956**
y **DoomRAM365219957**, inactivas, sin abrirlas primero. El reinicio previo y
la carga de la nueva variante comprobaron registro vacío; su viejo rw4png304
no es el módulo actual. DoomTrace dependía de DoomRAM; se retiran ambas.
DoomFault usa ELF en **DoomIO365219953**, no DoomRAM957. No borrar ni reabrir
DoomIO953, DoomFault952 ni DoomLauncher963/WAD. Borrar esas dos esferas antiguas
libera almacenamiento; no resuelve ni descarga el módulo actual.

La eliminación aún no está confirmada ni se ejecutó desde PC. No se asume
un catálogo reducido ni se hace inventario físico extra. Gates cerrados;
no nuevo envío, rmmod o reinicio autorizado. Solo documentación/commit local.
