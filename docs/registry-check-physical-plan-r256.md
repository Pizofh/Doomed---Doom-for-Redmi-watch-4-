# R255/R256 — RegCheck, dos lecturas de metadata sin C

2026-10-14. Usuario autorizó «ok» al único ensayo propuesto con observación y
batería≥50%. Instalación/CHECK completos y retorno normal confirmado.
R254 snapshot/EOF/IDLE/cierre verdes,
REG LAST/FINAL rojos; retorno habitual/menú/scroll/pulsación larga «todo ok»
confirmado. No nueva operación física durante esta preparación.

## Paquete y alcance

RegCheck ID365219969,20168bytes, perfilr255, preview cuatro barras verde lima.
`artifacts/registry-check-r255/RegCheck-id-only.face`, SHA256
`cb0cd4325d698b976e998e22e762071852703221e2054dcf015286c5beb57487`.
Source SHA256
`eedac3f0cb5f3012ddc73229a7feac7e318c1818946f3d04121c0be1306f46b9`.
22recursos readback exactos tras Compiler revisado/noADB.19casos focalizados
Lua S3/tmpfs real, proc/widgets simulados, no nodo propio: fallos independientes
de apertura/read/EOF/close/formato para cada lectura, cambios de longitud/prefijo/
final, errno acotado, close incierto impide segunda apertura, marca/reentrada/
doble click/rutas. Inventario S3 igual/tmp retirado, reporte
`artifacts/emulator/registry-check-r255-verified/summary.json`.

No ELF/C residente, shell, nodo, load/unload, STEP/STOP, drivers, archivos viejos,
hilos o Timer. No parser relajado: reutiliza shape estricto R251 para mostrar
su motivo de rechazo y comparaciones exactas. Lecturas stock procfs no prueban
privilege model o recovery integral. No suite completa de protocolo repetida.

## Único ensayo propuesto

Unidad M2315W1/FW2.2.86, misma Mi Fitness3.59.1i/Android16/HyperOS3.0.302.0;
región/configuración FLAT/PROTECTED/KERNEL no verificadas. Usuario presente,
batería≥50%, reloj normal/sin OTA/otro cliente. Backup de fuente/paquete/hash/
catálogo/journal, no respaldo/recovery integral de firmware.

1. Preparar perfil con gates cerrados. Solo tras aprobación habilitar r255/C#,
   rebuild/hash/prepare. Un `node tools/pc-static-watchface.mjs install r255`;
   journal nuevo `tools/local/pc-rfcomm/registry-check-r256.json` ausente/sinlock.
   Auth/modelo/FW/catálogo/INSTALL/upload/MASS stock, sin SET/DELETE/reemplazo.
   Rechazo/incertidumbre: parar sin retry/borrar para espacio.
2. Finally restaurar gates/rebuild/test0sockets; GET independiente verifica
   propia inactiva y previos IDs/flags/selección conservados; socket/worker cerrado.
3. Usuario selecciona **RegCheck**, título REG CHECK, CHECK,15grises y LEN CODE
   vacío. Rojo inicial/faltaUI: no pulsar. CHECK una vez crea/cierra/verifica
   marca propia14bytes `RW4-REGCHK255\n` en
   `/data/app/watchface/market/365219969/lua/registry-check-attempt-r255.txt`.
   Persiste, no reentrada/rearmado.
4. Una apertura rb de `/proc/modules`, read67+read1EOF, close explícito también
   tras errores. Separa apertura/read/EOF/close/formato. Si close incierto, no
   hay segunda apertura. Si no hay handle, puede comprobar segunda apertura.
5. Segunda lectura de la misma ruta con las mismas operaciones, sin acceder
   a C entre ambas. Compara longitud, primeros63bytes y resto; no inventa
   DATA SIZE, inventario completo o ausencia de módulos.
6. Muestra15filas MARK/ONE OPEN/ONE READ/ONE EOF/ONE CLOSE/ONE SHAPE/
   TWO OPEN/TWO READ/TWO EOF/TWO CLOSE/TWO SHAPE/LEN SAME/HEAD SAME/TAIL SAME/FINAL.
   LEN CODE24hex en dos líneas12chars: longitudes4+4, códigos formato2+2,
   máscaras2+2, primera diferencia4, errno acotado2+2. Referencia estable:
   `004200420000000000000000`.
7. Usuario informa colores y código/foto, vuelve a habitual y comprueba menú/
   scroll/pulsación larga. No reapertura/repetición ni retirada del módulo.

Códigos formato00válido,01tipo,02longitud,03final3NUL,04ASCII,05campos,06nombre,
07ARG/exports,08textsize,09punteros,0Aoffset/alineación,FFsin lectura. Máscara
marca qué bytes64/65/66 no son cero con bits1/2/4,FFsi longitud distinta66.
Primera diferencia1based,0000igual,FFFFsin ambas lecturas. Errno00sin error
registrado,01..FEvalor retornado,FFdesconocido/noerrno. Sin logs/direcciones o
metadata cruda en pantalla/almacenamiento, resumen de comparación solo RAM.
Rojo identifica fallo, no autoriza cambios. Todo verde aquí no explica por sí
solo el rojo R254, ni autoriza unload o mayor tolerancia del parser.

## Riesgo y recuperación

| Componente | Flash | Particiones/boot | Reboot revierte | Reversión/fallo |
|---|---|---|---|---|
| Paquete/catálogo/selección | Sí | Sin escritura dirigida | No garantizado | Habitual, sin borrado automático |
| Marca propia14bytes | Sí | Sin escritura dirigida | No | Persiste, no rearmar |
| Dos lecturas procfs | No write solicitado | Sin acceso dirigido | No aplica | Fallo/bloqueo de procfs/FILE stock; close si responde |
| Lua/PNG/widgets | Instalación/marca anteriores | Sin acceso dirigido | RAM sí, flash no | OOM/decoder/UI bloqueada; Ajustes→Esferas si responde |

Peor fallo razonable: bloqueo/panic/reboot o corrupción RAM/FS, posible soft
brick. Sin acceso dirigido al boot que deba hard-brickear, sin garantía integral
ante bugs. No sandbox o timeout duro demostrado. Firmware stock sin modificar.
Recuperación parcial conocida: Ajustes→Esferas si responde; integral no validada.
Ante fallo parar/revisar, no firmware ajeno/flash/boot/exploits/SWD/JTAG o reboot
automático. No nuevo C leído ni descargado bajo este plan.

## Instalación R256 realizada

Un install RegisteredInactive,10partes/stream20234bytes/TX20701bytes,
19frames enviados/16recibidos. Propia registrada/inactiva, no selección por
cliente; aceptación final de transferencia sin ACK independiente verificado.
GET independiente16→17, todos los IDs/flags previos conservados, activa365210175,
propia365219969inactiva/removible. Journalregistry-check-r256.json Registered10,
sinlock. Socket/worker cerrados, exit0, sin error nativo. Sin SET/DELETE/retry/
lectura proc o C desde PC. Finally fuentes/gates originales restaurados,
helper cerrado reconstruido, testgates0sockets exitoso.
Helper autorizado SHA256
`7ac88b5a32a6bd70db879b62cc716470986f73e7b2a714271545f8bab1404493`.
Evidencia privada `artifacts/registry-check-r256-authorized/`, runner consumido.
No repetir instalación/CHECK: ensayo consumido.

## Observación física

Foto:15verdes, LEN CODE004200420000000000000000 en dos líneas12dígitos. Ambas
lecturas66bytes, formato00, bytes finales64..66cero, ninguna diferencia/errno;
apertura/read/EOF/close reconocidos dos veces. Sin acceso C entre lecturas.
Usuario confirma retorno/menu/cambio normal «ok». Rojo posterior a C de R254
no reproducido; causa desconocida, no permiso de unload. [Siguiente R258](state-trace-physical-plan-r258.md)
con detalle del post-registro en el mismo contexto de read C.
