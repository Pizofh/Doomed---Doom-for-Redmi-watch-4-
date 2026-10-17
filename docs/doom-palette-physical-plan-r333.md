# R333: DoomPalette, PNG más pequeño sin bajar resolución

Preparado en PC/emulador; pendiente de autorización física.

## Resultado y cambio

R332 instaló DoomFast R331 inactivo (RegisteredInactive/316partes, cierre y
salida confirmados; contentVerified=false). Usuario confirma botones, salida
CLOSED y funcionamiento normal; mejora parcial, pero aún muy lento. CLOSED
comprueba JOIN/cleanup/retirada, por lo que el nuevo ensayo no requiere reboot.
No se reabre ni adopta un módulo anterior; registro inesperado bloquea START.

El renderer fijado doomgeneric/i_video.c obtiene los colores de un framebuffer
indexado mediante cmap_to_fb. La variante detecta hasta256colores RGB565 del
lease existente y emite PNG indexado8bits/PLTE, **320x200 sin remuestreo**.
PLTE reproduce la misma expansión RGB565->RGB24 usada por DoomFast. Ninguna
aproximación de colores: >256colores devuelve -75 antes de crear Image; un
prepare fallido libera únicamente el slot que acaba de reservar, sin lectores.

El PNG pasa de192278 a65048bytes (~66,2% menos). Usa un bloque DEFLATE almacenado
de64200bytes, filtros0, paleta256entradas, Adler y CRC. Mapa hash acotado512
entradas, sin buffer indexado/PNG completo, heap o flash por frame. RAM estática
medida BSS504168->506992, delta2824B; min_free aumenta4096 a6471381 y el wrapper
lo exige. Min_largest4194320/zona4MiB se conservan. Originales permanecen intactos.

Mismo motor, renderer, controles, resolución, Timer100ms, protocolo128-v2 y
comandos1..9. Transporte R329 solo cambia header del codec y comprueba el
retorno de prepare antes de publicar el lease; fallos no consumen secuencia.
Mantiene la imagen anterior mientras espera, guards de referencias/owner,
STOP/JOIN/retirada y límites cooperativos. No bindings, imports, firmware,
audio, saves o duración nuevos. Primer uso de PNG color_type3 en este RW4.

## Validación y límites

-4255 comprobaciones C en S3: referencia Node independiente, PNG completo,
  rangos pseudoaleatorios y límites, paletas1/2/256colores, rechazo257,
  invalidación de prepared, EOF/null/seek. La expansión de los64000índices se
  compara con RGB565->RGB24, sin pérdida respecto a DoomFast. Golden65048B
  SHA4b9c67b7b0990cb6364b28b6cb2d9dc2257f1f94f54f308dfe2fec5ebdd85afb.
-145checks C/VFS/stdio con lease/lectores reales y codec nuevo; S3 LVGL
  get_info y decoder_open/close del nodo indexado con otro lector propio
  abierto pasan. Píxeles decodificados por S3 no inspeccionados. Worker/hilos
  simulados; módulos/nodos/tmp propios retirados sin reinicio para salir.
-61casos Lua:59previos +2 de RAM nueva, incluyendo rechazo justo bajo el
  umbral antes de cargar C y rechazo del umbral anterior. UI/IO/nativo simulados.
-46recursos, pins, siete escenarios simulados de upload, carrier ausente,
  tampering y gates/journals comprobados. Regresión R331 pasa; prepare317partes.
-Build ARMv8-M Thumb soft ABI reproduce ELF baseR285; mismo bindings.o
  SHA523ce18e38ea031ff706145b0cb41c6e63ba4d5b4f7cdf592a2c515bd2d90081.

Benchmark S3,3rondas prepare+lectura completa por chunks257: DoomFast25300us
(21800+3500), indexado23400us (14500+8900). No hay una gran mejora de CPU del
encoder; la hipótesis es reducir tráfico/decodificación. **No son FPS ni una
medición del decoder RW4.** Compatibilidad/rendimiento físico siguen pendientes.
El test inicial de paquete esperaba316partes; el tamaño nuevo requiere317,
corregido en PC sin envío físico. Si no mejora claramente, medir el pipeline
físico antes de seguir cambiando el encoder.

## Paquete fijo y ensayo agrupado

| Pin | Valor |
|---|---|
| Nombre / ID / preview | DoomPalette / 365219947 / cinco barras moradas |
| Archivo | build/doom-palette-r333/package/DoomPalette-id-only.face |
| Bytes / recursos / partes | 645952 / 46 / 317; pausa100ms entre partes |
| SHA256 paquete | ebb889227feafa8fd7cf1fa820d2170723847dfc49c5642911b9673f3a19c26f |
| Lua21743B SHA256 | 2ae089250b1ca8d75e0dfafb9d57c0332887403cd3ad984b598c04ff9d044a93 |
| ELF606272B SHA256 | 2accf39509b79f32eef7050a8be501c1d6372116ecd3df0f34311aa25839b9c2 |
| Codec SHA256 | ba5e107c5846cae1bf13689f5f985008348aef053ac4bd610159791257c00e16 |
| Header SHA256 | b94bc25e6fb9bb421b8c98c321a15088b94994b532f240f19dd2ffb315362e35 |
| Transporte SHA256 | 9667b91ca37ad2bf36922ca7226fe1f8d2621c14d9d63ff1192280c31dc667d5 |
| Módulo / base | rw4png333 / /data/app/watchface/market/365219947/lua/ |
| Journal privado nuevo | tools/local/pc-rfcomm/doom-deployment/palette-r333.jsonl |

WAD compartido963 no incluido. Conservar DoomLauncher963 y DoomFast948. Sin
inventario extra, cantidad fija de esferas o borrado automático.

1. Usuario observando, batería>=50%. Una instalación inactiva del paquete fijo,
   sin reinicio previo, retry/resume, activación o borrado desde PC. Ante
   rechazo/cupo/corte/carrier ausente: detenerse y conservar el registro.
2. Seleccionar DoomPalette; solo READY: START una vez y CHECKING despierto con
   toques breves. Observar imagen completa/colores, fluidez, controles mantenidos
   UP/LEFT/RIGHT/FIRE. EXIT antes de unos20s.
3. Solo con primer CLOSED e imagen/controles correctos, un segundo ciclo breve
   en la misma instancia y EXIT, sin reinstalar. Informar fluidez comparada
   con DoomFast. No repetir más ciclos para medir.
4. Si ERROR inicial/UI ausente, no START. Ante error/basura/suspensión, omitir
   ciclo2, guardar FIRST/LAST/DIMS y cuatro páginas MODE cached sin repetir
   START/EXIT. Volver a la esfera habitual; no forzar descarga/reboot/borrado.

C nuevo y un formato PNG nuevo para este reloj pueden bloquear, provocar
panic/OOM o corrupción; no hay recuperación integral validada. Límites~30s UI
y120s worker cooperativos, sin watchdog duro. No cambio de firmware.

CLI pc-doom-palette-r333.mjs prepare offline pasa,317partes/652001wire.
Install cerrado por DEPLOYMENT+PALETTE_R333=false y C#Large=false. Tras aprobar,
abrir solo esos tres, un install, finally restaurar bytes/rebuild/test cerrado.
Todos los demás gates/static/resume/retry cerrados y journals previos intactos.
