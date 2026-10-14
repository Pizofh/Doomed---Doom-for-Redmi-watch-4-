# R251/R252 — PreCheck: diagnóstico completo antes del acceso C

2026-10-14. Autorización del usuario: «ok go», al ensayo propuesto con observación
y batería≥50%. Instalación única completada; CHECK y retorno manual pendientes.
StateRead R250 se
detuvo en REG INFO y usuario confirmó retorno normal. No repetir/rearmar esa
prueba ni interpretar el fallo como ausencia de módulo o fallo de C.

## Paquete y pruebas realizadas

PreCheck, ID365219971,19128bytes, perfil r251; preview cuatro barras naranjas.
`artifacts/precheck-r251/PreCheck-id-only.face`, SHA256
`3f0bc2fcd0303df735a02fa203e1967b9f1bfff233dc7c8d5f3bc87192121c9e`.
Source SHA256
`0d1e5ede95dd0dc318ac4bbef031c030aef4f707bd5163f6032835333bee3c70`.
22recursos verificados byte a byte tras Compiler revisado sin ADB.

25casos Lua S3/tmpfs real, registro/widgets simulados, sin acceso a nodo C:
fallos diferenciados de apertura/lectura/EOF/cierre/formato/marca, todos los
códigos de formato, doble click/reentrada/rutas inválidas y hex de diagnóstico.
Módulos S3 sin cambios y temporales retirados. Reporte:
`artifacts/emulator/precheck-r251-verified/summary.json`.
Dos reportes anteriores fallidos se conservan: prueba de offset dependía de
capitalización del fixture; lectura vacía se clasificaba como error de lectura,
corregida para identificar formato vacío. Etiqueta con glifo no soportado se
cambió a LEN CODE antes del paquete. No fallo físico nuevo.

Se reutilizan normalizador, widgets/PNG, empaquetador y transferencia ya probados.
No se repite toda la batería de transferencia/protocolo/DOOM ni compilación C.
Cambio del instalador para evitar rebuilds de habilitación queda pendiente:
este paquete usa los gates existentes, que permanecen cerrados. No afirmar que
ya se eliminó esa recompilación.

## Operación física propuesta

Misma unidad M2315W1/FW2.2.86, usuario junto al reloj, batería≥50%, sin OTA u otro
cliente concurrente. Región/configuración de privilegios y recovery integral
siguen sin verificar. Backup limitado a fuentes/paquete/hash/catálogo/journal,
sin imagen recuperable de almacenamiento ni firmware.

1. Preparar perfil fijo con gates cerrados. Tras autorización, habilitar solo
   r251 y helper temporalmente, rebuild y verificar hash/prepare. Un único
   `node tools/pc-static-watchface.mjs install r251`, journal nuevo
   `tools/local/pc-rfcomm/precheck-r252.json` ausente/sinlock. Auth/modelo/FW/
   catálogo previo, INSTALL/upload/MASS; no SET/DELETE/reemplazo.
2. Finally restaurar gates y rebuild cerrado. Un GET de catálogo al terminar
   confirma propia inactiva y IDs/flags/selección anteriores conservados.
   Cerrar socket/worker. Rechazo/incertidumbre: parar sin retry/borrar para espacio.
3. Usuario selecciona PreCheck. PRECHECK, CHECK, once indicadores grises:
   MARK / REG OPEN / REG READ / REG EOF / REG CLOSE / REG SHAPE /
   OLD OPEN / OLD READ / OLD CLOSE / OLD MATCH / FINAL. LEN CODE inicialmente vacío.
   Rojo inicial/UI ausente: no pulsar. CHECK una vez.
4. Crea/cierra/verifica una marca propia de16bytes `RW4-PRECHECK251\n` en
   `/data/app/watchface/market/365219971/lua/precheck-attempt-r251.txt`.
   Persiste y bloquea reentrada, no rearmar.
5. Una apertura rb de `/proc/modules`, read67 y read1 para EOF, cierre explícito
   también tras errores. Clasificación exacta de la representación R248.
   Separa éxito de read, EOF, cierre y formato; no inventa DATA SIZE.
6. Si cierre de registro confirmado, comprueba independientemente la marca vieja
   `/data/app/watchface/market/365219977/lua/step-attempt-r234.txt` con rb/read15/close,
   sin cambiarla, incluso si registro no reconocido. Si cierre incierto, no continúa.
7. Muestra colores y ocho dígitos: longitud registro (4hex), longitud marca (2hex),
   código formato (2hex). No direcciones/metadata cruda guardadas o mostradas.
   Código00 formato observado;01tipo,02longitud,03NULfinales,04ASCII,05campos,
   06nombre,07ARG/exports,08textsize,09punteros,0Aoffset/alineación,FFsin lectura.
   El valor esperado de referencia es00420E00; FINAL verde no mide estado C.
8. Usuario informa colores/código, vuelve a habitual y confirma menú/scroll/
   pulsación larga. Ensayo único consumido, no reapertura/retirada automática.

No `/dev/rw4step234`, callbacks propios C, shell, load/unload, STEP/STOP, Timer,
hilo, GC con I/O, firmware o borrado. No nueva lectura de estado C en este lote.

## Riesgo y reversión

| Componente | Flash | Particiones/boot | Reboot revierte | Reversión/fallo |
|---|---|---|---|---|
| Instalación/catálogo/selección | Sí | Sin escritura dirigida | No | Volver a habitual; no borrado automático |
| Marca propia16bytes | Sí | Sin escritura dirigida | No | Persiste; no rearmar |
| Lectura registro/archivo antiguo | No escritura solicitada | Sin acceso dirigido | No aplica | Errores/bloqueo de procfs/FILE stock; intentar close |
| Lua/widgets/PNG | Instalación/marca anteriores | Sin acceso dirigido | RAM volátil; flash no | Bloqueo/OOM/decoder/bug stock; Ajustes→Esferas si responde |

Sin firmware modificado. Peor fallo razonable: bloqueo, reboot/panic o corrupción
RAM/FS, posible soft brick. No operación dirigida a boot que deba hard-brickear,
sin garantía integral ante bugs. No sandbox o timeout duro demostrados.
Recovery parcial conocido: cambio de esfera por Ajustes si UI responde;
recovery integral no validado. Ante fallo parar/revisar, no improvisar flash,
firmware de otro modelo, SWD/JTAG, exploits o reinicio automático.

## Instalación R252 realizada

Un install RegisteredInactive,10partes/stream19194bytes/TX19661bytes,
19frames enviados/16recibidos; propia registrada sin activación por cliente.
Aceptación final de transferencia no verificada como ACK independiente;
registro confirmado por catálogo. Cierre socket/worker/exit0 y ausencia de
error nativo confirmados. GET independiente: catálogo actual15→16, todos los
IDs/flags del preflight preservados, activa365210175, propia971inactiva/removible.
No eliminación, activación, reintento, shell, lectura proc o callbacks propios
desde PC. Journalprecheck-r252.json Registered10/sinlock. Runner privado
`artifacts/precheck-r252-authorized/run-install.mjs` consumido.

Finally restauró fuentes/gates y reconstruyó helper cerrado; testgates0sockets
exitoso. Hash autorizado50f7bdf3c70212793420381688393b022169ce3fc527014a4afe46b29f25978c.
Logs/hash cerrado/comparación privados en artifacts/precheck-r252-authorized.
No repetir instalación. Lectura manual CHECK una vez aún pendiente.
