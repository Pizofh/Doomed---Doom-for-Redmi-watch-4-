# R377/R378: cuota de esferas y lectura comprimida

## Límite identificado como datos, sin ejecutar firmware

AP2.2.86 fijado SHA256
`2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db`.
`tools/review-rw4-storage-r377.mjs` reproduce ventana0x43c97c..0x43cd90 con
objdump fijado. Callbackprepare0x43ca08: cuenta market≥20 rechaza; suma tamaños
market existentes con tamaño entrante y rechaza≥15728640B(15MiB), estado3.
Comparación0x43cc0a..12, rama0x43ccb8. También consulta statfs; el umbral90MiB
en otra rama no es una medición de espacio libre realizada aquí.

R376 pasó el guard del catálogo10entradas y volvió a INSTALLstatus3 con0MASS.
Paquete13090600B+carrier instalado4827044B=17917644B: supera la cuota por
2189004B aun sin otras esferas. No es un límite de RAM ni de tamaño individual
demostrado para todo modelo/firmware. Informe privado: ultimate-storage-r377.

## Candidato comprimido R378 (todavía sin hardware)

Usuario pidió evaluar compresión antes de más eliminaciones. Archivo original
12408292B se mantiene lógicamente idéntico, SHA256
`6fdf361847b46228cfebd9f3af09cd844282ac75f3edbb61ca4cb27103ce2e7f`.
No quitar lumps, mapas, texturas, música o efectos del IWAD.

Contenedor5482926B, SHA256
`f177618dd0da2ba304b9d12049832607d39904ee0b36536a3d83037f6afec38c`:
190páginas≤64KiB, deflate raw independientes o página cruda si no reduce.
Cabecera40B e índice3040B, límites/longitud/CRC de cabecera, índice y cada
página. Header/index/size/identidad fijados también en C; verificación CRC
completa original antes de arrancar. No se expande todo en flash ni RAM.

Ocho cursores independientes comparten dos páginas LRU128KiB y entrada64KiB;
solo el worker del juego accede al lector. Mantiene fopen/read/seek/tell/eof
virtuales y las APIs nativas ya probadas; no agrega direcciones del firmware,
escrituras nativas ni otro hilo. Se conserva sufijo.wad porque W_AddFile lo
usa para decidir si interpreta directorio o recurso único.

Usa [tinf](https://github.com/jibsen/tinf), commit
57ffa1f1d5e3dde19011b2127bd26d01689b694b, licenciaZlib. Fetch fuente-only con
hashes en doom/platform-rw4/packed/tinf-r378.lock.json; tinflate.c/tinf.h/LICENSE
sin modificar bajo third_party ignorado, cabecera de licencia conservada.
La excepción -Wno-error=sign-compare solo afecta al archivo upstream; NDEBUG
elimina asserts internos y conserva sus controles explícitos de entrada/salida.

ID365220002/DoomPacked, módulo rw4packed378, WAD y bancos propios. Misma
identidad lógica de partidas Ultimate; sin importación automática de bancos.
ELF RW4629904B SHA256
`1de7d78294e7885513344990e477a4d7530aa85f2955eba7e1210b10f724d746`.
Secciones asignadas2259668B frente a2055940B: +203728B de código/datos/caché.
MinFree7366211B (+212992), minLargest4194320; no bajar si rechaza. Motorzona3MiB,
slot192KiB y cachéSFX672KiB intactos. Tinflate máximo stack estático1632B según
.su, dentro del hilo32768B existente; no representa stack total medido.

## Evidencia local ya completada

- Roundtrip de todas las páginas, bytes originales idénticos.
- C real: comparación12408292B y2306entradas/lumps,600lecturas aleatorias,
  cursores intercalados, EOF/seek/overflow/límite8handles y8fallos de IO.
- Dos ciclos de motor/hilos reales: título/menú/spawn/controles/pausa,
  guardar/cargar/reapertura/carga desde título, cierre y descarga; SFXerror0.
- 36mapas con lector comprimido: arranque/save/load/cierre y alloc==free;
  máximo save74450B, pico dinámico3467433B (excluye estáticos/UI/loader).
  No playthrough de campañas. Fixture espera mapa listo, no solo hilo iniciado.

Gráficos/audio modelados en S3. Rendimiento, RAM real del RW4 y primer sonido
físico del cambio R372 siguen pendientes. El lector no cambia el render,
controles, mezclador, salida ni límite cooperativo30min. No afirmar ausencia
de lag físico a partir del emulador.

UI/cabecera exactas (13casos), bancos (23) y heldaudio final pasaron.
Paquete privado6165808B, SHA256
`069e1a1dfdd676de6382565ba177cad411c07647929b8158dbe8d131cc9a490a`;
65recursos, seis alteraciones rechazadas y3017partes por IPC C# confirmadas.
Es autónomo incluso sin carrier; protege registro inactivo/selección, tiene
journal propio y rechaza todos los modos de retry. Gates cerrados y WAD de
prueba del S3 retirado. [Plan físico](doom-packed-physical-plan-r378.md) listo,
pendiente de autorización nueva. Ningún byte R378 enviado al reloj.
