# R394 DoomLoad: medir la apertura completa en el reloj

R393 funciona según el usuario; confirma TOTAL00632284 pero no percibe mejora
de carga. La duración física sigue desconocida. El41% anterior era solamente
verify_wad+doomgeneric_Create emulados, excluyendo loader y otros intervalos.
No se considera resuelto el objetivo. Este trabajo prepara diagnóstico, NO otra
optimización. Falta autorización física nueva; los permisos R393 se consumieron.

## Paquete y dependencia

DoomLoad, marco y tres barras doradas, ID365220012/rw4load394;679716B,
SHA450cf2e0dc48d469bc69dcccecc49071c70ebfc1bcb0dc1c039665f659897307.
ELF632476B SHA8e8173df64bbfdad005af22a403cff0c006a43d12419cfc87512a35d23735b62.
Lua32087B SHA3d108de267f8532ffd25999470fb3b3ab78285d5a6825087ae53c5cd9d939b4c.
11 recursos (Lua, ELF y nueve etiquetas), sin WAD/migración/importador.
Requiere conservar DOOM II actual011 (WAD/assets). No cambia sus archivos de
juego ni partidas; guardar/cargar están deshabilitados en este diagnóstico.
La maquinaria existente usa lease/captura temporal de shell en011 y los retira
según su cierre normal. No borrar011 después; solo DoomLoad es prescindible.

C idéntico a R393 salvo marcas temporales alrededor de verificar/crear motor,
publicadas antes de READY mediante los campos de coordenadas del título.
No ABI ampliada ni nuevo binding. Runtime/lector/transporte/audio/menú fijados
por hashes contra R393; constructor contrasta adapter entero con transformación
de perfil esperada. No cambia velocidad, códec, PNG, controles ni guards RAM.
Residente1897940B (+72B frente R393), mínimos7036928/4194320 iguales.

## Intervalos y unidades

Lua mide con os.clock, cuya ruta del AP fijado hacia clock_ticks/división10000
fue inspeccionada en R271. No suponer semántica Lua estándar/tiempo CPU para
este port; la relación con ticks tiene evidencia estática, y la calibración
nativa física previa fue compatible con~10000Hz. No es un cronómetro externo
ni demostración de resolución/monotonicidad del hardware.

Se comprueba reloj presente/numérico/finito al empezar. Si falla después de
cargar C, se marca CLOCKERR y se permite el cierre: la instrumentación nunca
lanza una excepción de reloj que interrumpa la limpieza nativa. Rechaza saltos
hacia atrás o >300s entre muestras. Son límites de diagnóstico, no watchdog.

| Página | Campo | Intervalo |
| --- | --- | --- |
|1|CHECK MS|START aceptado hasta publicar LOADING; incluye CRC ELF y preparativos|
|1|ELF MS|antes/después de insmod síncrono; lectura/loader/relocaciones e init|
|1|TOTAL MS|START hasta primer acuse de presentación observado en Lua|
|2|VERIFY|verificación C del archivo comprimido completo|
|2|INIT MS|doomgeneric_Create, incluyendo preparación de recursos/sonidos|
|2|READY MS|comando de arranque hasta READY observado; incluye calibración3×200ms, VERIFY e INIT|
|3|FRAME MS|READY observado hasta primer acuse de presentación observado|
|3|CLOSE MS|solicitar parada automática hasta CLOSED observado|
|3|CLOCKERR|0 reloj/contadores coherentes,1 datos inválidos|

No sumar READY a VERIFY/INIT: los contiene. TOTAL incluye CHECK/ELF/READY/
FRAME más preparativos/intermedios. FRAME es acuse del camino gráfico existente,
NO medición óptica de cuándo el LCD muestra píxeles. CLOSE queda fuera de TOTAL.
En vez de pedir jugar, el timer solicita SALIR cooperativo tras el primer frame
confirmado; puede verse un instante el título. Cierre/imagen/audio siguen la
misma máquina de estados y cuarentena, sin forzar unload.

## Pruebas locales

15 casos de reloj puro (intervalos conocidos, callback repetido, reset,
clock ausente/error/NaN/infinito/negativo/salto atrás/salto grande/suma nativa
incoherente; cero válido).25 casos boot/cierre/fallos heredados sin importador,
UI de tres páginas y parada automática. Dos ciclos de Lua exacto con filesystem,
loader, motor y threads reales del S3 emulado; solo ELF pins cambian a modelo.
LVGL/audio/graphics modelados, no firmware RW4 ejecutado.

| Ciclo |CHECK|ELF|TOTAL|VERIFY|INIT|READY|FRAME|CLOSE|CLOCKERR|
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|1|4193|160|9096|88|3999|4696|43|53|0|
|2|16|168|4885|90|3955|4654|43|58|0|

La caché ELF solo existe en el mismo contexto Lua: el segundo START local
evita su CRC; salir a otra esfera y reconstruir Lua no preserva esa caché.
Esto NO demuestra que sea la espera principal percibida en el reloj.
Fuente y resultado: tools/test-load-meter-real-r394.mjs y
build/doom-load-meter-r394/real-test.json. Guest011/012 y módulos propios
quedaron retirados tras ambos CLOSED; no hardware ni modificación de partidas.
Paquete11recursos/tamper6/333partes IPC/dependencia011/modos retry bloqueados;
regresiones transporte23 y gates aprobados. Sin nuevas pruebas físicas aún.

## Protocolo pendiente de aprobación

UNA instalación inactiva, UN START manual de medición automática, batería≥50%,
reloj junto PC, Mi Fitness cerrado y observación. Conservar011. No WAD resend,
reinicio previo, migración, selección desde PC ni borrados. Gates únicamente
general/LOAD_METER/C#Large durante despacho; readiness target vacío antes de
privados, journal load-meter-r394 nuevo y finally gatesfalse/rebuild.
Rechazo/corte consume intento: no retry/resume automático.

Seleccionar DoomLoad/barras doradas → START UNA vez y mantener CHECKING/LOADING
despierto con toques breves fuera de botones. Permitir hasta~90s tras CHECKING.
Se detendrá solo en CLOSED; no jugar ni pulsar SALIR repetidamente. Tras CLOSED
anotar tres filas; MODE una vez → otras tres, MODE otra vez → últimas tres.
No segundo START. Si no llega al título o se interrumpe antes, ceros parciales
no son duraciones medidas válidas. Ante ERROR/no CLOSED, no repetir/reabrir;
MODE hasta GATE/CODE y anotar, volver a habitual. Imagen sobre menús → reinicio
normal desde Ajustes (no Restablecer), dejar habitual y no abrir Doom.

Se pide permiso por regla del usuario para cada payload físico nuevo:
instrumenta C/Lua y adelanta parada al título; puede bloquear/corromper sistema
o requerir reinicio, con recuperación integral aún sin validar. Después del
resultado, decidir qué optimizar usando estos tiempos y mantener el juego011.
