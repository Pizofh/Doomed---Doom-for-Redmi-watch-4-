# R378: Ultimate Doom comprimido, una instalación inactiva

**Preparado y probado localmente; falta aprobación física nueva.** No usar
autorizaciones R374/R375/R376 consumidas. Usuario pidió compresión antes de
borrar más esferas. Esta versión incluye el juego completo sin quitar datos.

## Paquete concreto

- DoomPacked, ID365220002, módulo rw4packed378; preview marco verde menta y
  tres barras horizontales. START abre título/menú originales de Ultimate Doom.
- `build/doom-audio-r378/package/DoomPacked-id-only.face`: **6165808B**.
- SHA256 `069e1a1dfdd676de6382565ba177cad411c07647929b8158dbe8d131cc9a490a`.
- ELF629904B, SHA256
  `1de7d78294e7885513344990e477a4d7530aa85f2955eba7e1210b10f724d746`.
- Main27715B, SHA256
  `933395b6dc77ae114b54c5276db4af4dcf1c2223dbf82e270e589ea615babda3`.
- IWAD lógico12408292B/4episodios/36mapas idéntico al original. En flash
  ocupa5482926B,190páginas comprimidas. No expandir el archivo entero.

El paquete baja de13.09 a6.17MB. Con el carrier instalado suma10992852B,
por debajo de la cuota conjunta15MiB antes de contar otras esferas. No mide
el resto de ocupación ni garantiza aceptación; si vuelve a rechazar se detiene.
No borrar más esferas, reemplazar versiones ni cambiar selección desde PC.
WAD/ELF/bancos propios; independiente de DoomLauncher y de las UIs anteriores.
Conservar todas las esferas y partidas que sigan allí. El IWAD y paquete son
privados/ignorados y no se publican.

## Lector y validación

Detalles y procedencia: [R377/R378](packed-wad-r378.md). Usa llamadas de archivo
nativas ya probadas, sin nuevas direcciones, hilos o escrituras C. Dos páginas
de caché y una entrada64KiB añaden203728B de secciones/código al ELF. Guard
MinFree7366211B (+212992) y MinLargest4194320B; no rebajar si rechaza. Mantiene
render, controles de un dedo, efectos, slots y límite cooperativo30min.

Validado antes de este plan:

- Comparación nativa de12408292B/2306entradas y lumps,600lecturas aleatorias,
  cursores independientes,8fallos de IO y límites EOF/seek/overflow/handles.
- Dos ciclos con motor/hilos reales: título/menú/E1M1/spawn, botones/pausa,
  guardar/cargar/reapertura/carga desde título y cierres/unload.
- Los36mapas arrancan, guardan/cargan y cierran; alloc==free, streams0,
  audioerror0. No son playthroughs. Save máximo74450B frente a192KiB.
- Lua exacta parseada, UI y13cabeceras válidas/alteradas;23casos de bancos/CRC
  y RAM guard. Audio prepare/close bloqueados: imagen retirada, game join,
  módulo retenido hasta liberar el servicio simulado y luego unload.
- Paquete65recursos byte a byte;6alteraciones rechazadas;3017partes cifradas
  por el C#real en IPC con receptor sintético, hash/tamaño/cierre confirmados.
  Transferencia sin carrier,5fallos y4modos de retry/resume rechazados.
- Regresión compartida de retry18casos y catálogo17casos pasa.

Gráficos/altavoz del emulador son modelados. Rendimiento y memoria reales del
RW4 y el primer efecto con R372 siguen sin prueba. No prometer igual fluidez
por una prueba S3. Temporales y WAD de prueba del S3 retirados; ningún R378
enviado al reloj. No repetir las pruebas locales sin una causa nueva.

## Transporte y aprobación solicitada

UNA instalación inactiva de6.17MB y DOS arranques manuales≤90s de juego,
batería≥50% y observación durante unos6–10min de envío. Mismo transporte
retail R374 acotado, ahora3017partes2048B y6223157B de stream en wire, pausas
100ms. Factory fija size/hash/ID. Journal HMAC nuevo `packed-r378.jsonl`,
sin tocar el journal Ultimate anterior. No retry/resume, tampoco con0partes.

Gates general y `PHYSICAL_PACKED_R378_REVIEWED` JS y C#Retail cerrados.
Tras aprobación abrir SOLO esos gates, rebuild y targetvacío→InvalidTarget
antes de leer privados/journal. Ejecutar `node tools/pc-doom-packed-r378.mjs
install` UNA vez. Modelo/FW deben ser M2315W1/2.2.86, catálogo conocido con
una activa, IDnuevo ausente. Registro propio inactivo, selección anterior y
esferas preservadas; cierre de socket y worker confirmados. No confundir
registro con contenido verificado. Cerrar gates/rebuild antes del juego.

## Ensayo manual si instala

1. Elegir DoomPacked (marco menta/tres barras), volumen audible. READY→START
   UNA vez; mantener CHECKING despierto con toques breves fuera de botones.
   La comprobación inicial no cuenta dentro de los90s de juego y puede tardar.
2. Confirmar título y cuatro episodios; NEWGAME→episodioI→dificultad.
   Probar primer disparo, USAR, movimiento, pausa/seguir y fluidez. GUARDAR
   hasta GUARDADO, SEGUIR y SALIR→CLOSED antes de90s de juego.
3. Solo si funciona: cambiar a esfera habitual, volver y START una vez.
   Desde título PAUSA→CARGAR→CARGADO→SEGUIR debe restaurar el guardado propio.
   MENU→NEWGAME→episodioIV, jugar brevemente y SALIR→CLOSED antes de90s.
4. Ante ERROR, corrupción, suspensión, silencio o cierre fallido: no repetir
   START/reabrir ni hacer el segundo ciclo. Anotar CERROR/GPUCODE/PHASE y
   AUDIOERR/PCMSFX con MODE si responde; volver desde Ajustes. Si queda Doom
   sobre menús, reiniciar desde Ajustes y dejar la esfera habitual.

Este nuevo lector C puede bloquear/corromper el sistema o requerir reinicio.
El límite cooperativo no interrumpe una llamada nativa atascada. Sigue sin
haber recuperación integral validada. La regla inicial del usuario exige
revisar este payload nuevo antes de escribirlo en el reloj.
