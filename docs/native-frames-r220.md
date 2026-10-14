# R218–R220 — cuatro imágenes C, animación Lua y salida en un paquete

2026-10-13. Trabajo exclusivo de PC/S3; NativeLog R217 sigue siendo la última
ejecución física. Esta prueba prepara una pieza de display, no Doom ni un renderer
alternativo del juego. El objetivo es generar cuatro imágenes propias en C,
retirar ese módulo, animarlas con LVGL stock y detener/limpiar desde la UI.

## Diseño y límites

NativeFrames ID365219980 requiere exactamente
`/data/app/watchface/market/365219980/lua/` tras normalizar separadores internos.
RUN C manual de un intento: ELF completo coincide byte a byte con el candidato
embebido en base64, inventario previo reconocido sin módulos anteriores, marca
`frames-attempt-r218.txt` de15bytes `RW4-FRAMES-R218\n`, carga síncrona propia.
La marca permanece; no rearmar/repetir ni recargar C al abrir la esfera.

C usa únicamente fopen/fclose/fread/fwrite/fflush, las cinco direcciones/fingerprints
probadas por NativeLog para2.2.86. Lee la marca y pide creación exclusiva wbx de
cuatro archivos `frame0-r218.png`…`frame3-r218.png`; no fallback ni sobrescritura.
Son RGB8/96×64,18.564bytes cada uno,74.256bytes totales. PNG con CRC32, zlib/Adler32
y DEFLATE sin compresión; colores rotan y una barra blanca cambia de posición.
Encoder propio limitado a ese patrón; no gameplay, renderer o mapas Doom.

Lua verifica tamaño y checksum Adler de archivo completo, observa el registro,
retira solo rw4framesr218 y confirma ausencia ANTES de crear imágenes/Timer.
También bloquea rw4minr197/rw4minr202/rw4logr211 en todos los inventarios reconocidos.
La comprobación Adler es integridad instrumental, no autenticación criptográfica.

Cuatro objetos Image con rutas distintas e inmutables, alternados con HIDDEN.
Sin invalidación nativa de caché ni sobrescribir una imagen utilizada. Timer400ms,
24callbacks máximos (9,6s nominales, no tiempo real garantizado). EXIT o pageOnPause
detienen animación, eliminan objetos propios antes de intentar retirar archivos;
EXIT verde exige parada/detach/limpieza confirmados. Cambio de esfera sigue siendo
del sistema, sin SET o cambios de navegación de ancestros.

No tareas nativas, callbacks retenidos, loop C continuo, framebuffer directo,
LVGL desde C o sonido. **Cuatro frames precalculados no prueban streaming/FPS de
Doom.** El timeout visual solo funciona después de que C/shell retornan; no corta
deadlocks/faults nativos. GC solo bloquea callbacks; no llama widgets/FS en orden
de teardown desconocido. Si VM cierra antes de cleanup, pueden quedar archivos
propios; no se borran a ciegas al reabrir y la marca bloquea nuevas ejecuciones.

## C y validaciones

`frames-r218.c` compartida; builds SEPARADOS RW4 ARMv8-M/soft y S3 Cortex-A7/hard,
bindings y raíz distintos. RW4 ELF2780bytes, entry1, texto1497/alineado8,
18relocations ABS32 internos, cero imports por nombre/estado writable/tareas.
GCC informa400bytes de stack propio; no incluye callees/loader/Lua ni mide heap.
SHA ELF `80b75ebe516a80a931ac30e93a4d30cc76eb137e8bc7d57195091a680ad5f636`.

Se ejecutó SOLO el ELF S3 en tmpfs propio del emulador. C creó los cuatro PNG;
oracle independiente Node verificó igualdad byte a byte, todos los píxeles,
CRC de cada chunk y descompresión zlib. Registro retirado, inventario restaurado
y fixture eliminada. No ejecutar el ELF RW4 en S3 ni inferir compatibilidad1:1.

24casos de Lua de producción en Lua5.4 S3 con I/O real de fixture y shell/widgets/
Timer simulados: inicio manual/un intento, archivos dañados/ausentes/preexistentes,
módulos previos, inventario incierto, rechazo de init, retiro fallido, timeout visual,
EXIT anticipado, pause stock, Timer/decoder fallidos y limpieza fallida. Se exige
detachment antes de unlink; una salida con limpieza fallida no se pinta verde.
Fixtures retiradas/inventario real idéntico. No C RW4 ejecutado en esos casos.

Interfaz real S3 validada con FramesUI365219981: fábrica UI idéntica y PNG
generados por C S3, pero backend de inicio/retirada/limpieza simulado y SIN ELF/shell.
Seis screenshots verifican todos los píxeles de fases1/2/3; fase0 aparece en el
log de callbacks, no fue capturada. Los cuatro PNG completos se verificaron en
PC tras C real. Timer/cambios de fase/EXIT manual reales; imágenes desaparecen,
cinco indicadores verdes, Lua cierra y vuelve a esfera stock Spectrum362130009.
No confundir esta interfaz con prueba de direcciones RW4 o unlink de la UI física.
Autoparada/pageOnPause/errores de cleanup también pasaron en los24casos simulados.

El catálogo nuevo quedó después de entradas AOD y no se alcanzó desde el selector.
Se movió solo nuestra entrada antes de Neat, sin autoactivarla, y se seleccionó
por GUI; funcionó. No se atribuye el problema exclusivamente al tamaño del paquete:
la fixture inicial89KB también se redujo a14KB más cuatro PNG copiados por ADB.
Se movió temporalmente UiOnly propio fuera de market durante el diagnóstico;
se restauró el directorio/paquete exacto SHAecb3f0... y su fila original. Orden
relativo de las30entradas anteriores restaurado, fixture propia antes de AOD,
31IDs finales; normal activa Spectrum, original Storage no activa. No se afirma
restauración de selección previa ni validación del registro vivo de UiOnly.
Una activación experimental por JSON se rechazó en PC y no se envió; el comando
posterior de reset del guest sí ocurrió, sin hardware. No usar este camino al reloj.

Reportes/capturas privados: artifacts/emulator/frames-c-r218/summary.json,
frames-lua-r219/summary.json y frames-ui-r220/validation.json. Inventario final
de módulos igual al inicial vacío; ninguna ejecución del ELF RW4 en S3.

Primer harness tuvo un error de declaración Lua; se corrigió y pasó. Reporte
fallido conservado. Primer paquete35320bytes excedió presupuesto; se quitaron
solo comentarios completos/indentación/líneas vacías y se embebió el ELF en base64
con comparación binaria exacta. Se redujo preview. Variante intermedia32028bytes
falló el caso de fragmentos512 por límite TX; NO se amplió el límite. Final29704bytes
pasa32casos de sesión/protocolo/journal,12de transferencia y gates cerrados.

## Paquete fijo y reproducción

Paquete privado `artifacts/frames-r220-rw4/NativeFrames-id-only.face`,29.704bytes,
SHA256 `94b65fb94b7b299496ca672348f1a5281fe123e5ee7991044f59e90e1705481e`.
Lua18.035bytes SHA256 `7b554c6d6e0012e1425efbfc0123ea56fb6cfac9c55508e35b46bbc19e8b31e1`.
Cinco registros serializados leídos y comparados completos. Compiler revisado
sin ADB disponible. Perfilr220 cerrado; journal nuevo native-frames-r221.json.
Helper cerrado SHA95abb76e35633ea30cffd2fda57f7d354a92c15d91e1f749e5963ffb1321f7bf.

```powershell
# Construcción inicial: rechaza outputs existentes. Dependencias revisadas locales.
node tools/build-rw4-frames-r218.mjs rw4
node tools/build-rw4-frames-r218.mjs s3
node tools/test-frame-c-emulator-r218.mjs
node tools/test-frames-lua-r219.mjs
node tools/package-frames-r220.mjs emulator
node tools/install-frames-ui-r220.mjs
# Navegación del guest, RUN C simulado y EXIT; capturas/readbacks propios.
node tools/check-frames-ui-r220.mjs
node tools/package-frames-r220.mjs rw4
# Verificación offline del paquete final ya construido:
node tools/pc-static-watchface.mjs prepare r220
node tools/test-static-watchface-transfer.mjs r220
node tools/test-static-watchface-session.mjs r220
node tools/test-static-watchface-gates.mjs
```

Fuentes, scripts y documentación en Git; firmware/ELF/paquetes privados ignorados.
No descargas, herramientas nuevas, Bluetooth real, firmware o APK nuevos.
[Plan físico R221](native-frames-physical-plan-r221.md) exige revisión concreta
antes de un único envío. NativeFrames aún NO enviada ni ejecutada en M2315W1.
