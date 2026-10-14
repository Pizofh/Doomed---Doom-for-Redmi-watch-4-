# R263/R264 — un lote de controles al C residente

Estado: preparado y probado en PC/emulador; **no autorizado, instalado ni
ejecutado en el reloj**. Base física R262: StateMatch obtuvo diez verdes,
snapshot inicial, EOF/cierre y registro key64 igual; retorno, corona, menú y
otras esferas normales. No volver a abrir pruebas consumidas.

## Paquete y evidencia

CtrlProbe, ID `365219965`, 23.788 bytes, perfil `r263`, preview de cinco barras
verdes. Archivo local `artifacts/control-r263/CtrlProbe-id-only.face`.
SHA256 `a2f0b5ed36b0eb524c23a97cee6ea83e87436d7260ec44dad8a4b5ccb67b1648`.
Lua SHA256 `2b9f4c8567c7970486aca4ecdd71ed2c9af2ba7d072ed5f2c6aa26944858e667`.
Solo Lua/PNG, sin ELF nuevo; 24 recursos leídos de vuelta y comparados byte a
byte. Compiler v4.23 revisado, PATH sin ADB; no transferencia desde el compiler.

169 escenarios del cliente/UI en Lua real del emulador, con registro, widgets
y nodo simulados: fallos en cada uno de los 13 comandos al abrir, configurar
buffer, escribir, flush, cerrar, leer, EOF y verificar ACK. Incluye estado
inicial no cero, errores previos/posteriores, trailer cambiante, reentrada y
MODE sin I/O. Un fallo del fixture inicial (impedía habilitar RUN antes de
probar la marca) se corrigió; reporte fallido preservado, no hubo carga de C
en ese intento. No se presenta como un fallo físico.

La misma Lua de producción también envió los 13 comandos al **C real del
S3 emulado**, adaptando únicamente la ruta a `/dev/rw4step230`; registro RW4 y
widgets siguen simulados. ELF R230 revisado, mismo `core-r229.h`, ABI S3 propia.
ACKs exactos, STOP final, cierre de 27 handles y retirada de ese módulo S3
confirmados. Módulos antes/después iguales y scratch tmpfs retirado.
**No demuestra la ABI write del RW4 ni autoriza descargar su módulo.**
Reporte: `artifacts/emulator/control-r263-verified/summary.json`.

Comandos reproducibles en PC, con emulador propio activo y destinos frescos:

```powershell
node tools/test-control-r263.mjs
node tools/package-control-r263.mjs
node tools/pc-rfcomm.mjs build
node tools/test-static-watchface-gates.mjs
node tools/pc-static-watchface.mjs prepare r263
```

Los dos primeros rechazan carpetas de reportes/paquetes existentes para
preservar evidencia; no borrar resultados para relanzarlos sin motivo.
Helper cerrado actual SHA256
`a37683c2de8f4324fbcc7f847a98c02c31e3f0516f7438d700250205cdf42513`.
Prepare/gates pasan sin sockets o comandos al reloj.

## Identificación y límites

Unidad M2315W1/FW2.2.86; Mi Fitness reportada v3.59.1i, teléfono HyperOS3/
Android16. Región, configuración FLAT/PROTECTED/KERNEL y recovery integral
siguen sin verificar. No cambiar versión, vínculo, archivos anteriores ni
reiniciar: `rw4step234` permanece residente desde R237; su ELF/marca originales
ya no son una dependencia utilizable. No recrearlos ni recargar C.

Backup limitado a fuente, paquete, hashes, catálogo y journal; no copia
integral/restauración del firmware. Selección y retorno de esferas han sido
probados; no equivalen a recuperar un fallo de kernel o filesystem.

## Operaciones concretas del único ensayo

Requiere nueva revisión del usuario y presencia junto al reloj, batería≥50%,
menús normales, sin OTA u otro cliente compitiendo.

1. Tras aprobación: habilitar únicamente r263/C# en un runner fijo de un solo
   intento, rebuild/hash/prepare y **un**
   `node tools/pc-static-watchface.mjs install r263`. Journal nuevo
   `tools/local/pc-rfcomm/native-control-r264.json`, ausente/sin lock.
   Autenticar, comprobar modelo/FW/catálogo y transferir usando el mecanismo
   stock. No seleccionar, borrar, reemplazar ni reintentar automáticamente.
2. Finally restaura gates, reconstruye cerrado y verifica cero sockets.
   Un GET independiente comprueba propia inactiva/removible y todos los
   IDs/flags/selección previos conservados. Socket/worker deben cerrar.
3. Usuario selecciona **CtrlProbe**. Diez filas grises y RUN C. Falta UI o
   FINAL rojo inicial: no pulsar; volver a la habitual y describir.
4. **RUN C una sola vez.** Crea/verifica su marca persistente de14bytes
   `RW4-CTRL-R263\n`, ruta
   `/data/app/watchface/market/365219965/lua/control-attempt-r263.txt`.
   No modifica marcas previas. Procfs rb/read67/EOF/cierre y clasificador R261;
   solo key64 válida permite continuar.
5. Snapshot inicial `/dev/rw4step234`: rb/setvbufno/read32/read1EOF/cierre.
   Exige magic/version correctos y seq/phase/held/steps/edges/status todos0.
   Rechazo previo al primer comando no cambia estado C por write.
6. En serie, **13 requests de24bytes** LE: magic0x52573449/version1/seq/op/
   máscara/reservado0. Cada escritura utiliza `r+b`, no creación/truncamiento;
   setvbufno/write/flush/cierre. Un handle rb separado lee32/EOF/cierra y
   verifica cada campo del ACK, incluido status0. Ningún handle simultáneo.

| Secuencia | Comando | held al confirmar | steps | edges |
|---|---|---|---|---|
| 1 | START | 0 | 0 | 0 |
| 2,3 | INPUT1, STEP | 1 | 1 | 1 |
| 4,5 | INPUT2, STEP | 2 | 2 | 2 |
| 6,7 | INPUT4, STEP | 4 | 3 | 3 |
| 8,9 | INPUT8, STEP | 8 | 4 | 4 |
| 10 | INPUT0, liberar | 0 | 4 | 5 |
| 11 | PAUSE | 0 | 4 | 5 |
| 12 | RESUME | 0 | 4 | 5 |
| 13 | STOP | 0 | 4 | 5 |

Las máscaras representan UP/LEFT/RIGHT/FIRE del protocolo; este ensayo las
envía automáticamente. No es una prueba de jugar o mantener el dedo en C:
HoldPad ya probó el touch, aquí aislamos write/ACK/STEP del puente.

7. Final esperado seq13/phase3 STOPPED/held0/steps4/edges5/status0; registro
   key64 posterior igual. Filas MARK, REG INFO, INIT, START, INPUT, STEP,
   PAUSE, RESUME, STOP, FINAL verdes. INPUT solo verde tras sus5ACKs; STEP
   tras sus4ACKs. C queda cargado; **STOP no descarga ni rearma START**.
8. Usuario vuelve a su esfera habitual y comprueba menú, desplazamiento y
   pulsación larga. Sin repetir/reabrir RUN, rearmar marca o retirar C.
   Si todos verdes, no hace falta MODE/foto/número adicional.

## Fallo, cierre y diagnóstico ya integrado

Primer error: detener lote, intentar cerrar únicamente el handle abierto
una vez y mostrar CTRL CODE. **No enviar otro comando ni STOP de recuperación
con estado desconocido.** Write/flush/ACK incierto puede haber aplicado la
request: el último ACK no certifica el estado actual. C no tiene hilo, Timer,
loop de juego o ejecución autónoma: RUN/PAUSE son estados de RAM del puente.
No hay timeout duro que pueda interrumpir una callback/sistema colgado.

CTRL CODE24hex muestra: seq4/phase2/held2/steps4/edges4 del último ACK;
attempt2/stage2/errno2/closeUncertain2. Stage1marca,2registro,3openread,
4buffer/read,5EOF,6closeread,7decode,8initial,9openwrite,10bufferwrite,
11write,12flush,13closewrite,14ACK,15registro final;0éxito.
Errno0 significa sin errno capturado, FF excepción/error no clasificable.
Antes del primer ACK, ceros son valores de presentación, no una lectura.
MODE alterna únicamente datos RAM si existe un frame. Diagnóstico aparece
automáticamente ante FINAL rojo, incluso sin frame; no requiere otro paquete.

## Riesgo y reversión

| Operación/componente | Escribe flash | Particiones/boot | Reboot revierte | Reversión/peor fallo |
|---|---|---|---|---|
| Instalación propia/catálogo/selección | Sí | Sin acceso dirigido | No | Volver a habitual; paquete no retirado automáticamente |
| Marca propia14bytes | Sí | Sin acceso dirigido | No | Bloquea repetición; no rearmar |
| Procfs/snapshot | No solicitado | Sin acceso dirigido | RAM, no garantía de corrupción persistente | Bloqueo/panic/cierre incierto |
|13write C + ACK | No solicitado por C | Sin acceso dirigido | Estado RAM sí, daño persistente no garantizado | ABI write errónea, corrupción o panic; callback potencialmente privilegiada |
| Lua/PNG/UI | Solo instalación/marca anteriores | Sin acceso dirigido | RAM sí, flash no | OOM/decoder/bloqueo; Ajustes→Esferas si responde |

Modelo de privilegios no resuelto: **C no es sandbox**. Peor fallo razonable
bloqueo, panic/reboot o corrupción RAM/FS; soft brick posible. No hay escritura
dirigida a bootloader que deba producir hard brick, pero recuperación integral
y ausencia de daño no están garantizadas. No flashear ni ejecutar recuperación
automática; parar/revisar si el reloj no responde. Retorno a habitual es la
recuperación parcial conocida cuando la UI sigue funcional. Firmware stock
sin modificar. Retirada posterior de C/driver requiere otro plan específico.
