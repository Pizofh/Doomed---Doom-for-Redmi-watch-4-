# R331: DoomFast, reducir el coste del PNG

Preparado y validado en PC/emulador; pendiente de aprobación física.

## Resultado y cambio técnico

R330 instaló DoomHold R329 inactivo, RegisteredInactive/316partes, cierre y
salida del worker confirmados, contentVerified=false. El usuario confirmó
controles operativos y salida CLOSED; persiste mucha lentitud. No se necesita
reinicio antes del ensayo nuevo: CLOSED exige JOIN/cleanup/retirada y ausencia
de nodos en el launcher. El nuevo launcher rechaza un registro inesperado.

png-view-fast-r331.c conserva exactamente el contrato y PNG RGB24 de320x200,
192278bytes. Un cursor secuencial RGB565 evita división/modulo por cada byte,
evita releer el pixel para cada canal y combina Adler e IDAT CRC en una pasada.
Lecturas arbitrarias inicializan el cursor una vez por tramo DEFLATE, con
manejo explícito de filtros, canales y los tres límites de bloques almacenados.

Mismo PNG/header/seek/errores/EOF y puntero prepared, sin buffers de imagen,
heap, framebuffer directo, flash de frames, firmware, comandos o bindings
nuevos. Transporte R329 idéntico SHA779014f73bb6cc85b8e4ee339f2697164ad54eb7029d4c01c772f4c4ed6746f7.
Mismos motor/zona4MiB/WAD/CRC/RAM/control128-v2, reserva8/consulta9, retención
de Image, controles y cierre. Solo cambian codec C y la identidad/ELF del
launcher; fuentes físicas anteriores intactas. No audio, saves o límite ampliado.

## Validación y medición

- 5708 comprobaciones ARM C: PNG completo y200rangos pseudoaleatorios más
  límites de headers/filas/bloques/Adler/CRC/IEND contra referencia Node
  independiente; EOF, null, preparación y seek. El PNG coincide byte por byte,
  SHA3c04ea845c40d267462e7432b6be9291b48ce2530424423d186dc208366b87ab.
- Benchmark del mismo fixture S3/Cortex-A7, clock_gettime monotónico del guest
  fijado (ABI timespec16), ambos codecs calentados, tres rondas prepare+read
  con chunks257. Tiempo agregado, microsegundos:

| Operación | Anterior | Optimizado |
|---|---:|---:|
| Preparar | 113800 | 20800 |
| Leer | 39600 | 3400 |
| Total | 153400 | 24200 |

  ~6,3x para esas operaciones en emulador; **no mide FPS ni velocidad RW4**.
  No incluye motor, decoder propietario, widgets, GC o copia de pantalla.
  No prometer ese factor en el reloj. Coste de checks del fixture incluido.
- 142 checks del transporte R329 con codec nuevo y VFS/stdio reales: fullread
  frente a golden, lectores/reapertura, READY/lease, secuencia/owner y retirada.
  Worker/hilos simulados; sin decoder RW4 o juego real. Módulos/nodos/tmp retirados.
-59casos Lua/UI previos con nuevo launcher compuesto pasan; IO/widgets/nativo
  simulados.46recursos exactos, siete escenarios de upload y regresión R329
  pasan; pins, journals, ausencia de carrier y gates cerrados comprobados.
-Build ARMv8-M Thumb soft ABI reproduce el ELF base R285; mismo bindings.o
  SHA523ce18e38ea031ff706145b0cb41c6e63ba4d5b4f7cdf592a2c515bd2d90081,
  sin imports nuevos. Primer fixture de benchmark tenía un memset sin enlazar
  por inicialización de timestamp; se eliminó esa inicialización innecesaria
  antes de cargar código en guest. No hubo ensayo físico durante la preparación.

Repro: test-rw4-png-fast-r331.mjs; test-rw4-image-fast-r331.mjs;
build-doom-image-fast-r331.mjs; test-doom-fast-ui-r331.mjs;
package-doom-fast-r331.mjs; test-doom-fast-package-r331.mjs. Builders no
sobrescriben salidas revisadas. Evidencia/binarios en artifacts/build ignorados.

## Paquete y autorización propuesta

| Elemento | Pin |
|---|---|
| Nombre / ID / preview | DoomFast / 365219948 / cinco barras verdes |
| Archivo | build/doom-fast-r331/package/DoomFast-id-only.face |
| Bytes / recursos / partes | 645588 / 46 / 316; pausa100ms entre partes |
| SHA256 paquete | 7dbecda4486d1f9314dffcceacf2c82abc726d6260ac1f5c056f97e329af38fd |
| Lua21743B SHA256 | 3a3af095ab159dd42f40fe5cc1ca3d9a4fab6891a050b8babf275a7316620fdc |
| ELF605908B SHA256 | 7e16929469dfa183b151a4f7e53a61b52dcfe80f1fc7b86e00655495e563b077 |
| Codec SHA256 | 009dd32024e076294d4b9fab97e2f0407049bdd88792e592e147c7dfa11e87e7 |
| Módulo / base | rw4png331 / /data/app/watchface/market/365219948/lua/ |
| Journal nuevo | tools/local/pc-rfcomm/doom-deployment/fast-r331.jsonl |

WAD compartido963 no incluido; conservar DoomLauncher963 y DoomHold949.
Sin inventario adicional ni cantidad fija de esferas. Propuesta agrupada:

1. Usuario observando y batería>=50%. Un envío inactivo del archivo fijo,
   sin reboot previo, selección/borrado automáticos, retry o resume. Ante
   rechazo/cupo/corte, detenerse. No reenviar ni adoptar módulos previos.
2. Seleccionar DoomFast; solo READY: START una vez y mantener CHECKING despierto
   con toques breves. Comparar fluidez, imagen completa/estable y controles
   mantenidos UP/LEFT/RIGHT/FIRE; EXIT antes de unos20s.
3. Solo con primer CLOSED e imagen/controles correctos, otro START en la misma
   instancia y prueba breve/EXIT, sin reinstalar. Si el rendimiento sigue bajo
   pero no hay ERROR, anotarlo; no repetir más ciclos para medir.
4. Si ERROR inicial/UI ausente, no START. Ante ERROR durante el ensayo, omitir
   ciclo2 y guardar FIRST/LAST/DIMS y cuatro páginas MODE cached; no repetir
   START/EXIT. Volver a la esfera habitual. Sin forzar descarga, borrar C,
   reiniciar o hacer otro ensayo para recuperar esta prueba.

Es C modificado que procesará las imágenes por primera vez en el reloj. Puede
bloquear, provocar panic/OOM o corrupción; recuperación integral de firmware
sin validar. Límite UI~30s/worker120s cooperativo, no watchdog duro.

CLI pc-doom-fast-r331.mjs prepare offline pasa. Install cerrado por DEPLOYMENT
y FAST_R331=false, C#Large=false. Solo tras aprobar, abrir esos tres controles,
un install, finally restaurar bytes/rebuild/test cerrado. Todos los demás
gates/static/resume/retry cerrados y journals anteriores conservados.
