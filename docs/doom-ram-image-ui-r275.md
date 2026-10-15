# R275: presentación desde RAM y retirada de caché en la UI

El 2026-10-15 se mostraron dos patrones generados en C mediante el nodo virtual,
sin escribir archivos de frames. Dos ciclos START → NEXT → EXIT completaron
presentación y retirada. **Es una prueba del S3 exacto en PC, con worker simulado
y adaptador explícito de formato. No ejecuta Doom ni prueba el reloj físico.**

## Resultado y corrección

Lua construye Image con `/dev/rw4doomimage.bin`; LVGL usa read/seek del puente.
Cada NEXT elimina el widget, escribe op7 desde el owner y crea el siguiente.
Op7 invalida la caché de esa ruta y solo libera la presentación si no quedan
lectores. EXIT hace detach/drop → STOP → finished → JOIN → rmmod.
No se hace LVGL desde worker, uninit, finalizador Lua o shell de las herramientas.
La identidad del task que hizo START se comprueba; **no es por sí sola una
verificación independiente de que ese task sea el thread LVGL**. Es un contrato
del launcher, que en esta prueba llama desde eventos de la UI.

El primer test visual encontró los 64000 píxeles distintos: mostraba el segundo
frame donde se esperaba el primero. La consulta de dimensiones/prefetch abrió,
leyó píxeles anticipadamente y cerró el stream antes del dibujo. Liberar el slot
en cada close era incorrecto. Se preservaron evidencia y captura; EXIT desde la
misma UI retiró el candidato anterior. No se reinició para salir del C.

Ahora la **reserva de una presentación sobrevive al cierre y reapertura del
archivo**. Todos los opens del decoder ven la misma generación. Solo el retiro
explícito posterior a detach/drop la libera. JOIN y uninit rechazan también una
presentación fijada aunque ya no haya un descriptor abierto. GC solo solicita
STOP y conserva recursos; salida inesperada/recolección al reentrar y worker
real siguen pendientes de integración, no se declaran resueltos por este test.

En S3 se compilan las mismas fuentes con `RW4_IMAGE_S3_TEST`: header12 y RGB565.
La compilación RW4 conserva header4/cf4/32bpp. No se entregaron bytes de header
RW4 al decoder S3 ni se ejecutó un ELF ARMv8-M en el Cortex-A7 emulado.

## Evidencia

| Prueba | Resultado |
|---|---|
| UI/LVGL/VFS reales S3 | Dos ciclos, cuatro frames, 256000 píxeles comparados, tolerancia máxima7 por canal |
| NEXT | Cambia colores/barra, sin consumir un frame durante get_img_size |
| EXIT/reentrada normal | En ambos ciclos desaparecen módulo y los tres nodos; segundo START carga instancia nueva |
| Puente con kernel/worker simulados | 1124 comprobaciones; incluye reapertura de la misma presentación y op7 rechazado antes de START, desde otro owner y con lector abierto |
| VFS/stdio reales S3, sin LVGL | 27 comprobaciones; read/seek/EOF y release explícito, nodos/módulo retirados |
| Codec RW4 sobre CPU S3 | 1060 comprobaciones, frame lógico256004B, FNV1c083d2f; sin llamar decoder S3 |

La mayoría de las comprobaciones numéricas son lecturas parciales del mismo
frame; no son miles de escenarios. La fixture UI publica dos patrones y ejecuta
el worker de forma sincrónica: no prueba scheduling, FPS ni el motor de Doom.
La captura y los marcadores se conservan en
`artifacts/emulator/ram-image-test-1792072718495/`. Las imágenes
`screenshots/ram-image-test-1792072718495-cycle-0-{first,next}.png` se inspeccionaron
visualmente y el helper verifica todos sus píxeles de la zona320×200.

## Construcción y reproducción

```powershell
node tools/build-image-ui-r275.mjs
node tools/package-ui-probe.mjs ramimage
# Con UIProbe inactiva, la misma VM propia y su instalación previa verificable:
node tools/install-ui-probe-emulator.mjs refresh
node tools/image-ui-emulator-r275.mjs stage
# Elegir UIProbe desde el selector stock; comprobar RAM IMAGE / PC ONLY / Ready.
node tools/image-ui-emulator-r275.mjs test
node tools/image-ui-emulator-r275.mjs cleanup
```

El refresh preserva backup de data y recurso anterior; no borra el directorio
persistente de Doom. No activa la esfera automáticamente. El launcher anterior
estaba ausente al empezar; su registro/logs quedaron en `resume-r275`. El primer
arranque aislado no encontró `.vela`; el arranque autorizado fuera del sandbox
funcionó. Se reinició una vez la VM sin módulos para recuperar pantalla responsive
antes de stage. Ese reinicio no se usó para terminar la prueba nativa.

La fixture C final mide11336B, SHA256
`bf67c59aeff5a46c173f9ffc19228887baa4376944917a31c611ab958916fe8c`.
El ELF temporal se retiró después del test. La watchface UIProbe de prueba
permanece instalada en PC; para otro START es necesario hacer stage del fixture.

## Candidato RW4 y límite pendiente

Se añade binding candidato de img_cache_invalidate_src: offset AP `0x24638`,
alias `0x1bff187c`, destino Thumb `0x1c015eb5`. El dispatcher llama al gestor
configurado; el LRU inspeccionado compara nombres de archivo y cierra decoder.
Ahora hay21APIs y3regiones de contrato fijadas. Esta llamada no se ensayó físicamente.
El adaptador S3 usa sus funciones distintas image_cache_drop/header_cache_drop.
La política exacta de header-cache, filesystem port y render backend RW4 aún
necesita revisión: no añadir por nombre una función no inspeccionada. En concreto,
`0x25204` es una ruta de assert en la ventana vista, no un binding aprobado.

El candidato completo RW4 vuelve a enlazar sin imports:603692B/static899056,
SHA256 `45d3044d0139db84f4f8c7f74f67f1c196b76a7843a416e5520ca5a593c459d7`.
Permanece no instalable/no autorizado para hardware. No se publicó firmware,
binarios propietarios ni WAD; no se descargaron dependencias nuevas.

Siguiente checkpoint: conectar el motor real y WAD a este nuevo backend con
worker real en PC, incluyendo controles y salida. Resolver presentación/retirada
RW4 y RAM disponible antes de proponer el ensayo físico agrupado. R270 sigue
siendo el último paso físico completado; no se rearman marcas ni pruebas antiguas.
