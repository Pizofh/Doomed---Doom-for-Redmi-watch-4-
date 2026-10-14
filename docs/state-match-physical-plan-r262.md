# R261/R262 — comparar el registro definido, no bytes tras su terminador

2026-10-14. PC listo, NO autorizado/enviado. R260 demuestra registro66bytes antes/
después, primeros64iguales y NUL64; únicamente65/66cambiaron. Apertura/read/EOF/
close C y post-procfs pasaron; parser exigía tresNUL y rechazó esos dos bytes.
Usuario «menu y esferas ok». No repetir/rearmar R260.

## Evidencia y corrección

Imagen candidata R240: formateador recibe64, luego su retorno se pasa como
longitud a copia procfs. Foto R24863ASCII+NUL64+dosbytes; R260 primera diferencia65
y máscara06 explican exactamente el rechazo. La causa del traslado de66bytes
es una inferencia fuerte con estática/fotos; identidad binaria del firmware
completo, límites de asignación y origen de esos dos bytes no demostrados.
No afirmar corrupción, stack/heap concreto o vulnerabilidad explotable.
El [snprintf upstream NuttX](https://raw.githubusercontent.com/apache/nuttx/master/libs/libc/stdio/lib_snprintf.c)
usa memoria con tamaño y retorna el resultado del formateador; es contexto
upstream, no prueba de build RW4 exacta. No modificar firmware ni ampliar lecturas.

Nuevo clasificador exige igual longitud66/NUL64/ASCII63/nueve campos, nombre
rw4step234, ARG/exports0, text972, punteros/alineaciones y offsets+1/+0x141.
Devuelve key64 y compara esa cadena completa antes/después. Bytes65/66 solo
diagnóstico, no identidad. Terminador/campos cambiados siguen rechazados.
metadataComplete/inventoryComplete/dataSizeKnown siguenfalse; no readyToUnload.
No inventa DATA SIZE ni ignora cambios del registro definido.

StateMatch ID365219966,24276bytes, perfilr261, preview cuatro barras azules.
`artifacts/state-match-r261/StateMatch-id-only.face`, SHA256
`710562ea9139bcc346332318545b64b569317248144ff172c7592431fe19395c`.
Source SHA256
`15b6fd25b3114fc5d9a49100dc87bb3f1388de7ae26d2c6ed1b54fefa8be832b`.
Classifier SHAa6a3ebbe1d2466a361cde2cad71c1116d7f39ca85c0bf20f3becbc3e11611e0f.
51casos S3/tmpfs real, nodo/registro/UI simulados, incluyendo256variantes de
trailer, rechazo de NUL64/campos modificados, tail antes/después, read/EOF/
close/capturas/mode/reentrada; módulos iguales/tmp retirado. Reporte
`artifacts/emulator/state-match-r261-verified/summary.json`. Primer intento de
generación falló en sintaxis Lua antes de ejecutar backend; corregido y log
preservado.24recursos readback con Compiler revisado/noADB.

## Único ensayo físico propuesto

M2315W1/FW2.2.86, misma configuración R260; región/build/privilegios exactos
desconocidos. Usuario junto al reloj/batería≥50%, normal/sin OTA/otro cliente.
Backup limitado fuente/paquete/hash/catálogo/journal, sin recuperación integral.

1. Prepare cerrado; tras aprobación habilitar solo r261/C#, rebuild/hash/prepare.
   UN `node tools/pc-static-watchface.mjs install r261`, journal nuevo
   `tools/local/pc-rfcomm/state-match-r262.json` ausente/sinlock; auth/modelo/FW/
   catálogo/transferencia stock. No SET/DELETE/reemplazo/retry/borrar para espacio.
2. Finally gates/rebuild/test0sockets; GET confirma propia inactiva y previos IDs/
   flags/selección conservados, socket/worker cerrado.
3. Seleccionar StateMatch, diez grises. Rojo inicial/faltaUI: no READ C.
   READ C una vez crea/verifica marca propia15bytes `RW4-STATE-R261\n` en
   `/data/app/watchface/market/365219966/lua/state-match-attempt-r261.txt`.
   Persiste para bloquear reentrada. No archivos antiguos abiertos/modificados.
4. Mismo procfs rb/read67/EOF/close preflight; solo registro reconocido/cerrado
   permite apertura rb `/dev/rw4step234`, setvbufno/read32/read1EOF/close explícito
   también tras errores. Mismos callbacks ya observados, cambios RAM refs/cursor,
   no write/STEP/STOP/newC/API/load/unload/shell/Timer/hilo.
5. Post-procfs/read/EOF/close, clasificador nuevo y key64 igual. FRAME HEX si pasa;
   REG CODE automático si falla. Foto, vuelta habitual y comprobar menú/scroll/
   pulsación larga. MODE opcional alterna datos RAM, sin I/O. No reabrir/repetir.

REG CODE mantiene formato R260; bit10 ahora registro canónico reconocido,
código03todavía informa finales no tresNUL, no invalida key64 si solo65/66cambian.
Si todo verde no autoriza retirada ni certifica refs globales/inventario completo.

## Riesgo y recuperación

| Componente | Flash | Particiones/boot | Reboot revierte | Reversión/fallo |
|---|---|---|---|---|
| Paquete/catálogo/selección | Sí | Sin acceso dirigido | No garantizado | Habitual; sin borrado automático |
| Marca propia15bytes | Sí | Sin acceso dirigido | No | Persiste, no rearmar |
| Procfs pre/post | No write solicitado | Sin acceso dirigido | No aplica | Error/bloqueo stock; close si responde |
| C read/close | No write persistente solicitado | Sin acceso dirigido | RAM sí; corrupción persistente no garantizada | ABI/refs/cursor/fault/panic; sin timeout duro |
| Lua/PNG/UI | Instalación/marca anteriores | Sin acceso dirigido | RAM sí, flash no | OOM/decoder/bloqueo; Ajustes→Esferas si responde |

C potencialmente privilegiado, no sandbox. Peor fallo razonable bloqueo/panic/
reboot/corrupción RAM/FS, posible soft brick. Sin operación dirigida al boot que
deba hard-brickear, sin garantía integral. Firmware stock sin modificar. Kernel
fault puede impedir close. Recovery parcial Ajustes→Esferas si responde;
integral no validada. Parar ante fallo; no flash/boot/firmware ajeno/exploits/
SWD/JTAG/reboot automático. [Base R260](state-trace-repeat-physical-plan-r260.md).
