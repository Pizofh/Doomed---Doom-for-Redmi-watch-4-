# R257/R258 — StateTrace, frame y diagnóstico posterior

2026-10-14. Preparada en PC, NO autorizada/enviada. R254 snapshot/EOF/IDLE/close C
verdes y post-registro rojo; R256 dos registros66bytes idénticos,15verdes y
retorno «ok». Causa del rojo R254 desconocida; no relajar parser o retirar C.

StateTrace ID365219968,23996bytes, perfilr257, preview cuatro barras moradas.
`artifacts/state-trace-r257/StateTrace-id-only.face`, SHA256
`6f19fd203b8613fad9d9496e14115e0a0841522ac9e78fcc69cebc9d8349a9bf`.
Source SHA256
`97423a164996f46a0a5a5d2fe4a958216f542c5dad0280121230fa10a93b9e76`.
Compiler revisado/noADB,24recursos readback exactos.48casos reutilizados + caso
tail posterior y MODE sin I/O pasan: Lua S3/tmpfs reales, nodo/registro/widgets
simulados; módulos iguales/temporales retirados. Reporte
`artifacts/emulator/state-trace-r257-final/summary.json`. Sin nueva operación física.

## Operación única revisable

Misma unidad M2315W1/FW2.2.86, Mi Fitness3.59.1i/Android16/HyperOS3.0.302.0;
región/build/privilegios completos desconocidos. Usuario presente/batería≥50%,
reloj normal/sin OTA/otro cliente. Backup limitado a fuentes/hash/paquete/
catálogo/journal; no respaldo integral de firmware recuperable.

1. Prepare cerrado; tras aprobación habilitar solo r257/C#, rebuild/hash/prepare.
   Un `node tools/pc-static-watchface.mjs install r257`, journal nuevo
   `tools/local/pc-rfcomm/state-trace-r258.json` ausente/sinlock. Auth/modelo/FW/
   catálogo/transferencia stock. No SET/DELETE/reemplazo/retry/borrado para espacio.
2. Finally restaurar gates/rebuild/test0sockets; GET independiente verifica propia
   inactiva y previos IDs/flags/selección preservados; socket/worker cerrado.
3. Seleccionar StateTrace, C STATE/10grises/READ C/MODE. Rojo inicial/faltaUI:
   no pulsar. READ C UNA vez crea/cierra/verifica marca propia15bytes
   `RW4-STATE-R257\n` en
   `/data/app/watchface/market/365219968/lua/state-trace-attempt-r257.txt`.
   Persiste para bloquear reentrada/doble click; no marca/archivo antiguo abierto.
4. Procfs preflight rb/read67/read1EOF/close, clasificador R248. Fallo o cierre
   incierto impide C. Sin fallback/reload. Una apertura `/dev/rw4step234` rb,
   setvbufno/read32/read1EOF/close explícito también tras errores; misma secuencia
   de callbacks open/read/close observada R254, modifica refs/cursor RAM solamente.
   No STEP/START/STOP, write al nodo, nuevo C/ELF/API, shell, hilo o Timer.
5. Tras lectura/EOF/cierre confirmados, post-procfs rb/read67/read1EOF/close;
   registra cada etapa/formato e igualdad estricta. No unload incluso todo verde.
6. Mismas filas MARK/REG INFO/OPEN C/READ C/EOF C/FRAME/IDLE/CLOSE C/REG LAST/FINAL.
   FRAME HEX64dígitos muestra frame recibido. MODE UNA vez muestra REG CODE24dígitos
   del post-registro, solo RAM/sin I/O. Reportar ambas vistas; volver a habitual,
   confirmar menú/scroll/pulsación larga. No reabrir/repetir/rearmar/reset/unload.

REG CODE: prelen4/postlen4/flags2/formato2/preMask2/postMask2/firstDiff4/errno2/00.
Flags01open/02read/04EOF/08close/10shape;1Ftodos. Formato00OK,01tipo/02longitud/
03finalNUL/04ASCII/05campos/06nombre/07ARGexports/08textsize/09punteros/0Aoffset/
FFsin lectura. Mask bits1/2/4 para bytes64/65/66no cero,FFsi longitud no66.
Diff1based/0000igual/FFFFsin lectura; errno00sin error registrado,01..FEretornado,
FFdesconocido. Referencia estable004200421F00000000000000. No metadata cruda,
direcciones o logs en pantalla/almacenamiento. No inventa DATA SIZE o refs globales.

## Riesgo y retorno

| Componente | Flash | Particiones/boot | Reboot revierte | Fallo/reversión |
|---|---|---|---|---|
| Paquete/catálogo/selección | Sí | Sin acceso dirigido | No garantizado | Habitual; sin borrado automático |
| Marca propia15bytes | Sí | Sin acceso dirigido | No | Persiste, no rearmar |
| Procfs pre/post | No write solicitado | Sin acceso dirigido | No aplica | Error/bloqueo stock; close si responde |
| C open/read/close | No write persistente solicitado | Sin acceso dirigido | RAM sí; corrupción persistente no garantizada | ABI/refs/cursor/fault/panic; sin timeout duro |
| UI/PNG/MODE | Instalación/marca anteriores | Sin acceso dirigido | RAM sí, flash no | OOM/decoder/bloqueo; Ajustes→Esferas si responde |

C potencialmente privilegiado, no sandbox/proceso aislado; RAM-only no asegura
reversibilidad persistente. Peor fallo razonable bloqueo/reboot/panic/corrupción
RAM/FS, posible soft brick. Sin acceso dirigido a boot que deba hard-brickear,
sin garantía ante errores privilegiados. Kernel fault puede impedir close;
fclose exitoso no prueba todos los handles o retirada segura. Firmware stock
sin modificar. Recovery parcial Ajustes→Esferas si responde; integral no validada.
Ante fallo parar/revisar, no firmware ajeno/flash/boot/exploits/SWD/JTAG/reboot
automático. [Base anterior R254](state-read-physical-plan-r254.md); ese ensayo consumido.
