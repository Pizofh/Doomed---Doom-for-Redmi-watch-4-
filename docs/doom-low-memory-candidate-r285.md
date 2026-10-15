# R285: candidato RW4 de4MiB y presupuesto del cargador

**Construido y empaquetado en PC. No enviado ni ejecutado en hardware.**
Se reutilizó exactamente el adaptador C que pasó dos ciclos S3 en R284,
compilándolo para ARMv8-M Mainline/Thumb/soft-float y la ruta persistente RW4.
Los80 objetos originales del motor y la libc anterior se conservaron. Antes
del cambio, el enlace reprodujo byte por byte el ELF RW4 R282.

| Artefacto | Bytes | SHA256 |
|---|---:|---|
| ELF RW4 con `-mb 4` | 603760 | `980e13cc85813d463d229aec93b4b2000654b188b3c80a36bdcf30eaa3a3c8a5` |
| Paquete RW4, ID365219963 | 4827044 | `d0fc0d8257e9a384b42129f312de99570b49dade455511d0fc5fddd80fecf048` |

Se verificaron ELF32 ARM ET_REL, entrada Thumb, atributos v8-M.mainline, cero
imports pendientes y solo las tres relocaciones candidatas anteriores.
Eso valida el build, no su ejecución ni todas las APIs del firmware físico.
El módulo sigue siendo `rw4doom282`; el ID no se cambia ni se instala aquí.

El paquete contiene20recursos verificados, incluidos ELF/WAD/UI. Conserva
`allow_native=false`, START manual y las fuentes originales del launcher.
Los pins R278/R282 del transporte rechazan este archivo nuevo por diseño:
no se ampliaron gates ni se habilitó un instalador físico nuevo.
2362partes;4871948bytes de MASS más8192 reservados para control caben en el
worker de4900000bytes. Esto no prueba aceptación física de un paquete grande.

## Memoria residente y fases

| Sección | Bytes | Grupo del loader |
|---|---:|---|
| .text | 203880 | Código/solo lectura |
| .rodata | 130964 | Código/solo lectura |
| .data | 61172 | Escritura |
| .bss | 503088 | Escritura |

GNU size confirmó los cuatro tamaños independientemente del parser del build.
Suma cruda899104bytes. Incluyendo alineación entre secciones según el loader
inspeccionado:334844bytes de texto y564264de datos, total**899108bytes**.
No confundir tamaño del ELF en flash con memoria residente: BSS no ocupa esos
bytes en el archivo pero sí durante la ejecución.

Se revisaron2500bytes de código de la imagen local R193 fijada por SHA, sin
ejecutarla. Offsets de archivo y observaciones:

- `0x1e7890`: loader; discrimina SHF_ALLOC/SHF_WRITE, alinea por sección y
  redondea sus tamaños a4bytes. Llama dos veces a la función de reserva
  alineada, con grupos separados. No implica pools separados Umem/IMG?CACHE.
- `0x1e7a2c`: cabeceras de sección, reserva `e_shnum * e_shentsize`; este
  candidato necesita640bytes en esa tabla.
- `0x1e7840`: buffer de I/O inicial32bytes, ampliable; **no límite total32**.
- `0x1e7220`: binding con buffers de relocación de2048bytes y caché de símbolos
  con nodos de28bytes, además de otras reservas. No es una cota total2048.
- R194 ya trazó insmod → load → bind → initializer → limpieza del loader.
  Nuestro initializer registra nodos y retorna; el worker Doom se crea solo
  al START posterior. Las fases de carga y juego no se suman íntegramente.

Como referencia conceptual, [modlib_load.c de NuttX12.3 fijado](https://github.com/apache/nuttx/blob/8fdb56b5f2124de351a48125a252ba4264665e3d/libs/libc/modlib/modlib_load.c)
también agrupa secciones por sus flags y admite reservas separadas de texto y
datos. Su configuración no identifica la versión Xiaomi. Para los números se
usó el flujo observado en la imagen local, no una supuesta réplica upstream.
No se obtuvo una cota completa de heap transitorio, fragmentación, exports,
metadatos del módulo, buffers del filesystem o reservas de cada driver.

| Presupuesto orientativo de juego | Bytes |
|---|---:|
| Secciones residentes alineadas RW4 | 899108 |
| Pico runtime medido en S3 con zona4MiB | 4486833 |
| Stack solicitado del hilo | 32768 |
| Subtotal | **5418709** |
| Umem libre en snapshot físico R284 | 7005128 |
| Margen antes del overhead pendiente | **1586419** |

Reservar1MiB adicional **como supuesto de planificación**, no medido ni como
cota, dejaría537843bytes. No deducir de ello «cabe seguro». Un único snapshot
no garantiza bloque contiguo después de cargar; no se demostró el pool de malloc
ni se midió el pico físico de Doom, cargador, Lua y decoder juntos.

## Reproducción y siguiente paso

```powershell
node tools/build-doom-low-memory-rw4.mjs
node tools/package-doom-launcher.mjs rw4-low-memory
node tools/inspect-doom-loader-memory.mjs
```

Dependencias y resultados previos R282/R284 revisados deben existir. El builder
no sobrescribe reviews completos. Artefactos en `build/doom-low-memory-rw4-r285/`;
desensamblados propietarios en `artifacts/research/doom-loader-r285/`, ambos
ignorados. No firmware/WAD/ELF ni fotos privadas añadidos al repositorio.

Siguiente: integrar este paquete exacto con el instalador grande y un journal
privado que vincule destino/hash, serialice intentos y bloquee reenvíos ambiguos.
Después preparar una revisión física concreta; no asumir que esta preparación
autoriza cargar el motor, habilitar el launcher o saltar validaciones de ABI.
Solo commit local, sin push ni consultas de CI remota.
