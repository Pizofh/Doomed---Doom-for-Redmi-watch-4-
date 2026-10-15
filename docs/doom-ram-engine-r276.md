# R276: Doom real con imagen en RAM, hilo y libc privada

El 2026-10-15 el motor original cargó E1M1 en el emulador S3 usando el nuevo
puente candidato, una libc privada y un pthread real. Pasaron movimiento,
ambos giros, disparo, pausa/reanudación y dos ciclos START/EXIT. El segundo
inicio cargó una instancia nueva sin reinstalar el ejecutable ni el WAD.
**Solo PC: no se envió este port al M2315W1.**

## Qué se integró

Se recompilan los 80 archivos de doomgeneric fijados en
`doom/doomgeneric-source.lock.json`, revisión
`dcb7a8dbc7a16ce3dda29382ac9aae9d77d21284`. El único overlay del motor conserva
las salidas I_Quit/I_Error hacia el runtime; no cambia gameplay ni renderer.
Se usan adapter.c, transport.c, image-view.c, el runtime generado con jump
propio y libc-glue.c de la preparación RW4.

La build PC usa ARMv7-A Thumb soft-float y las bibliotecas v7-a/nofp fijadas.
No mezcla el motor S3 anterior hard-float con esta libc. El adaptador
`doom-s3-host.c` convierte fops32 a fops40 y usa los símbolos del guest completo
verificado. Los atributos pthread son de12bytes en el DWARF S3
(`artifacts/package-review/time/types-dwarf.txt`, estructura pthread_attr_s).
La hora se obtiene con clock_gettime(1), timespec16bytes, y se convierte a
las unidades de100us esperadas por el adaptador; no se adivina el tipo de clock_t.

Lua crea Image desde `/dev/rw4doomimage.bin`, sin leer/copiar el frame entero
ni escribir imágenes en el filesystem. Cada actualización elimina el widget,
invalida su caché desde el mismo contexto UI y libera la presentación anterior.
S3 usa explícitamente `RW4_IMAGE_S3_TEST`: header12/RGB565. RW4 sigue usando
su header4/cf4/32bpp candidato; este test no valida ese decoder físico.

## Resultado reproducible

Resultado privado: `artifacts/emulator/doom-ram-test-1792074005969/result.json`.
Snapshots, marcadores y capturas quedan en el mismo ensayo y en screenshots.
Las capturas inicial y posterior a controles se inspeccionaron visualmente.

| Comprobación | Resultado |
|---|---|
| Motor, WAD y mapa | Original doomgeneric, shareware1.9 verificado, GS_LEVEL/E1M1 |
| Avance | Cambian coordenadas x/y del jugador |
| Giro izquierdo/derecho | Cambia angle después de cada contacto |
| Disparo | Munición de50 a47 |
| Pausa | Gametic estable entre dos snapshots; controles y teclas neutrales |
| Reanudación | Gametic vuelve a avanzar |
| Dos salidas explícitas | STOP, finished, pthread_join, cleanup, rmmod |
| Reservas del runtime | 14 asignadas/14 liberadas en cada instancia; cleanup_error0 |
| Pico contabilizado | 6.583.985bytes, aproximadamente6,28MiB, en ambas instancias |
| Recursos nativos | Módulo y los tres nodos ausentes tras cada EXIT |
| Presentaciones UI | 114 y29, según marcadores; no representan FPS medidos |
| Reapertura | Segundo START desde el launcher, mismo ELF/WAD almacenados |

El pico corresponde solo a las reservas contabilizadas por nuestro runtime:
excluye código/BSS del módulo, stack del hilo, reservas del sistema y cachés LVGL.
No demuestra RAM libre ni capacidad suficiente en el reloj físico. El timer de
100ms es una configuración; no se presenta como medición de rendimiento.

ELF PC: 610.484bytes, SHA256
`4cc023ce788a69605c1265b874dc4926e27c11b1673b133f79c95939a330af2a`.
Sin imports pendientes. El reporte fija guest, librerías y fuentes. No es un
binario RW4; no debe transferirse al reloj.

## Fallo encontrado y corregido

El primer intento (`doom-ram-test-1792073804463`) cargó E1M1 y avanzó, pero
falló LeftMissing. Al cambiar el foco, el botón anterior podía emitir DEFOCUSED
y cancelar el control recién presionado. Ahora cada botón solo libera la
acción que todavía le pertenece. Se conservó el intento fallido y se salió
mediante EXIT: 14/14 reservas liberadas y módulo retirado, sin reset.

La revisión Lua no cambió los bytes del ELF; se reconstruyó y verificó su mismo
hash. Un intento posterior se detuvo antes de START por OwnFaceNotActive: la
navegación rápida no había completado las transiciones de Settings. Se restauró
Silent a OFF tras un toque accidental, se seleccionó UIProbe observando su
preview y se ejecutó el ensayo final. Para automatizar navegación, esperar
transiciones y verificar la pantalla; no encadenar taps inmediatos a ciegas.

## Reproducción

Con las dependencias revisadas locales y la VM propia arrancada:

```powershell
# Preparación existente, si faltan los inputs generados R271:
node tools/build-doom-rw4.mjs
node tools/build-doom-rw4.mjs runtime
# Nueva build e integración PC:
node tools/build-doom-ram-s3.mjs
node tools/package-ui-probe.mjs doomram
# Seleccionar otra esfera en la VM antes del refresh:
node tools/install-ui-probe-emulator.mjs refresh
node tools/doom-ram-s3-emulator.mjs stage
# Seleccionar UIProbe y comprobar DOOM RAM / PC ONLY / Ready:
node tools/doom-ram-s3-emulator.mjs test
node tools/doom-ram-s3-emulator.mjs cleanup
```

El helper usa únicamente ADB5039/emulator-5554 y las comprobaciones de ownership
del QEMU local; no enumera ni selecciona USB. stage verifica ELF y shareware
mediante readback y rechaza rutas temporales existentes. cleanup exige módulo
y nodos ausentes, verifica los archivos y retira solo esos dos temporales.
UIProbe queda instalada; su directorio Doom anterior permanece conservado.
Al cerrar este checkpoint, ambos temporales ya están retirados y el launcher
muestra Closed / resources retired. Se requiere stage para otro START.

Antes de instalar el launcher se reinició una vez la VM sin módulos, para
recuperar input tras reposo prolongado. No hubo resets durante los ciclos de
Doom ni para sustituir STOP/JOIN/unload.

## Qué falta

Actualización: [R277](doom-ram-close-r277.md) completó y probó la recogida al
reentrar tras cambiar de esfera, con GC STOP y retirada posterior desde UI.
El párrafo siguiente describe lo que quedaba pendiente al cerrar R276.

La salida explícita está probada; una salida inesperada de página/GC conserva
el módulo después de pedir STOP. Todavía falta completar y probar la recogida
al reentrar, manteniendo el retiro de caché exclusivamente en UI. También
falta cerrar los contratos RW4 del filesystem/caché/backend y revisar memoria,
ruta persistente del WAD y lifecycle antes de preparar el ensayo físico agrupado.
No se repetirán los probes físicos antiguos de registro o controles.

El último resultado físico sigue siendo R270: rw4step234 retirado y reloj normal.
No hay nueva autorización física, ni recovery integral/aislamiento demostrado.
