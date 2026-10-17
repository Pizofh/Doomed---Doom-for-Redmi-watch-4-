# R343: DoomDirect, una imagen persistente desde memoria

R344: usuario autorizó una instalación y un ensayo. Paquete registrado inactivo;
ensayo manual pendiente. Sesión cerrada, worker exit0, gates restaurados y
helper cerrado verificado. No reenvío ni segundo ciclo. El registro está
confirmado; no se releyó el contenido instalado.
Conservar DoomDemand945 y el carrier DoomLauncher963. No hubo Bluetooth ni
lecturas de MAC/credenciales durante esta preparación.

## Cambio y evidencia

El productor Doom entrega sus píxeles32bit a uno de dos buffers de256000B.
Una sola Image C cambia de descriptor; ya no codifica/lee PNG ni crea una
Image por cuadro. El productor conserva el control de demanda R337: sin
slot libre siguen tics y entradas, se evita renderizar otro cuadro.

Todo LVGL ocurre en el propietario UI. Callbacks de nuestra Image comprueban
finish al acabar MAIN/POST y fijan el primer error. No sustituyen callbacks
stock. STOP pide salida; el comando JOIN ejecuta pthread_join real y solo
entonces retira callback/Image/cache. Un fallo bloquea reutilización y unload.
Init y uninit no llaman LVGL; no GC gráfico ni rmmod forzado.

RW4: descriptor12B/cf4/320x200, dos buffers512000B; la Image se sitúa35,35.
Los setters x/y se contrastaron por la tabla Lua19a68c/19a698 y propiedades
7/8 en18a7c/18ab4, con huellas runtime adicionales. No se traslada el layout
LVGL9 del emulador. La identidad del backend vivo aún requiere el ensayo.

Validación local:

- Núcleo R342:20 escenarios de buffers/ownership/errores, incluidos errores
  que una espera posterior oculta. No pruebas adicionales redundantes de ese núcleo.
- Dos ciclos con Doom y pthreads reales, gráficos modelados: movimiento,
  giro/disparo, pausa/resume, slots llenos sin detener tics, STOP/JOIN/cierre/
  unload. Se rechazan por ciclo seis comandos inválidos o fuera de fase.
- **UI S3 real, dos ciclos**:102/101 presentaciones,204/202 eventos de dibujo,
  309/306 fences. Capturas pausadas320x200 con159 colores RGB565: hash FNV
  calculado sobre todos los64000 píxeles coincide con la fuente nativa en
  ambas. No PNG por cuadro. Pico del motor4486833B y14alloc/14free por ciclo.
  ~6,24/~6,22s desde READY a fin del worker, incluyendo pausas y cierre;
  no se interpreta ese cociente como FPS activos ni rendimiento del RW4.
- Ocho casos del controlador Lua y sintaxis del main final: comandos directos,
  cero Images Lua por cuadro, dos ciclos, fallo C, cleanup incompleto, rechazo
  de unload, módulo ajeno y GC sin descarga. Archivos/shell/LVGL simulados allí.
- Siete escenarios de transferencia simulada, paquete/resources/pins/tampering,
  ausencia de carrier, journals anteriores preservados y gate cerrado antes
  de datos privados. Las siete pruebas del paquete anterior R337 siguen pasando.

La VM se reinició antes del ensayo UI, sin módulo propio cargado, por UI sin
respuesta. Los dos ciclos terminaron sin reset. Al finalizar: Storage activo,
source previo de UIProbe903 restaurado por hash/readback, módulo/nodo y
temporales propios retirados. Los recursos de juegos/firmware siguen ignorados.

## Memoria y launcher

ELF nuevo ARMv8-M/Thumb/soft, cero imports,4MiB de zona de juego. Secciones
residentes con margen de alineación:1157094B, **251758B más** que DoomDemand.
Es un cálculo de secciones, no medida completa del heap/driver gráfico RW4.
Guard UMEM previo al load:FREE>=6723139 y LARGEST>=4194320; conserva el margen
anterior sumando el incremento estático. El driver, stack y LVGL pueden
tener necesidades no cubiertas por la comparación. Si el guard falla, no carga C.

Launcher físico basado en los guards previos: CRC de ELF/WAD, tamaño/header,
registro y lease propios, selección manual y C solo tras START. WAD compartido
963 sin duplicar. CHECKING inicial permanece; cache verificada dentro de esa
instancia para futuras partidas, aunque este permiso propone solo un ciclo.
Timer50ms; salida pedida a600ticks (~30s), cooperativa. No es un límite duro.

Tras CLOSED: TIME MS/TICS/IMAGES. MODE muestra C ERROR/GPU CODE/PHASE desde
la captura guardada, sin IO. La tabla solo aparece al cerrar o fallar; controles
ocultos después del cierre para permitir selector como en la versión anterior.

## Paquete fijo

| Pin | Valor |
|---|---|
| Nombre /ID /preview |DoomDirect /365219944 /seis barras cian|
| Archivo |build/doom-direct-r343/package/DoomDirect-id-only.face|
| Bytes /recursos /partes |640508 /37 /314|
| SHA256 paquete |a0ddd3fce496c88cebb6d3ceea6fef18e8aa54fd65734b5ecf01357baf013bd6|
| Lua17931B SHA256 |b06d1927366f0e23afa8e4d5b777a447de7babed4c095eef1206544001191ddb|
| ELF606564B SHA256 |cb7d0c4c0322c9b1c9c827fb67511705262caf988beb04075c66f9c887a16de3|
| Módulo |rw4direct343|
| Journal nuevo privado |tools/local/pc-rfcomm/doom-deployment/direct-r343.jsonl|

## Un ensayo propuesto

1. Usuario observando, batería>=50%. Un envío inactivo; preservar selección
   y todas las esferas. Sin reboot previo requerido, activación automática,
   borrado, reenvío, resume o comandos Doom desde PC.
2. Seleccionar DoomDirect; solo READY, START una vez. Mantener CHECKING
   despierto con toques breves en zona vacía. Si se ve correctamente Doom,
   probar controles/PAUSE/RESUME y EXIT antes de20s. Evaluar fluidez frente
   a DoomDemand. No segundo ciclo en este permiso.
3. Si termina CLOSED, recoger TIME MS/TICS/IMAGES y volver a la habitual.
   Ante ERROR, imagen corrupta, suspensión o UI ausente, no repetir ni reabrir;
   recoger códigos cached si están disponibles y volver desde Ajustes si responde.
   Asumir menús/corona normales salvo aviso del usuario.

Hay funciones gráficas, listeners y sincronización GPU nuevos en hardware.
Pueden bloquear la UI, provocar panic o corrupción. El hook observa nuestras
esperas, no todos los errores internos previos del renderer. No hay recuperación
integral validada; ninguna garantía de interrumpir una callback colgada.

DEPLOYMENT/DIRECT_R343 y C#Large siguen cerrados. Prepare offline pasó:
314partes/646500wire, sin journal ni radio. Runner preparado y parseado,
Ejecutado tras aprobación: artifacts/doom-direct-physical-r344/install-once.ps1.
Abrió esos tres gates para una invocación y restauró bytes exactos y helper
cerrado en finally. Los gates antiguos,
static/retry/resume quedan cerrados. Solo commits locales, sin push/CI remoto.
