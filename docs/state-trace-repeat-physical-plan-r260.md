# R259/R260 — repetir StateTrace mostrando primero el diagnóstico

2026-10-14. Usuario salió de StateTrace R258 sin MODE; foto confirma mismas
primeras8filasverdes y REG LAST/FINALrojos, frame válido/inicial. No REG CODE
disponible: se conservaba solo RAM del script. No se puede recuperar al reabrir:
marca persistente impide reentrada, y callbacks/vistas anteriores se destruyen.

Usuario autoriza repetición: «si quieres vuelve a hacer la instalacion o
reinicialo o algo y lo vuelvo a inentar». Implementación dentro de ese alcance:
copia nueva inactiva, misma única lectura C, diagnóstico como vista inicial
cuando REG LAST falla. No reinicio, recarga/unload, borrado o rearmado anterior.
Presencia/batería≥50% son las condiciones del ensayo R258 recién autorizado;
no inventar otra medición de batería. La selección manual queda en manos del usuario.

## Artefacto y pruebas

StateTrace2 ID365219967,24052bytes, perfilr259, preview cuatro barras moradas.
`artifacts/state-trace-r259/StateTrace2-id-only.face`, SHA256
`64e3ba292a2230b051c0d88dbbd4df5457278bae9aceca6bf980f8e352ac1eef`.
Source SHA256
`00a72b041a95b488929cd5f61375e247edb2f278f5a5cc87dd1139aabb782b40`.
Solo cambia ID/ruta/marca y elección inicial de la vista; backend nativo/procfs,
flags/formato/máscaras/diferencia/errno, read32/EOF/close y gates sin cambios.
48casos reutilizados pasan S3/tmpfs real, nodo/registro/UI simulados; incluye
post-tail rojo→REG CODE visible sin MODE, MODE vuelve a frame sin I/O, doble click/
reentrada/fallos. Inventario S3 igual/tmp retirado.24recursos readback/noADB.
Reporte `artifacts/emulator/state-trace-r259-final/summary.json`.

## Operación concreta

M2315W1/FW2.2.86, misma configuración R258; región/privilegios exactos/recovery
integral desconocidos. Backup limitado fuentes/paquete/hash/catálogo/journal.

1. Prepare cerrado, habilitación fija r259/C# y rebuild/hash/prepare.
   UN `node tools/pc-static-watchface.mjs install r259`, journal nuevo
   `tools/local/pc-rfcomm/state-trace-r260.json` ausente/sinlock. Auth/modelo/FW/
   catálogo/transferencia stock, sin SET/DELETE/reemplazo/retry/borrar para espacio.
2. Finally restaurar gates/rebuild/test0sockets. GET independiente confirma
   inactiva y selección/IDs/flags anteriores preservados; socket/worker cerrado.
3. Usuario selecciona StateTrace2, diez grises; READ C UNA vez. Rojo inicial/
   faltaUI: no pulsar. Marca propia15bytes `RW4-STATE-R259\n` en
   `/data/app/watchface/market/365219967/lua/state-trace-attempt-r259.txt` persiste.
4. Mismo procfs preflight rb/read67/EOF/close; si reconoce/cierra, una apertura
   rb `/dev/rw4step234`, setvbufno/read32/EOF/close explícito; cambia refs/cursor
   RAM, no writes al nodo. Post-procfs/read/EOF/close y comparación estricta,
   sin retirar módulo. No C nuevo, comandos, shell, hilo o Timer.
5. Si REG LAST rojo con diagnóstico, REG CODE24dígitos aparece directamente.
   Si todo pasa, FRAME HEX64dígitos. Foto de la vista inicial, sin necesidad de
   MODE para obtener el motivo; MODE opcional solo alterna datos RAM, no I/O.
   Volver a habitual y comprobar menú/scroll/pulsación larga. No repetir/reabrir.

## Riesgo y retorno

Los riesgos y formato de código son los [del plan R258](state-trace-physical-plan-r258.md).
Paquete/catálogo/selección y marca propia escriben flash; no particiones/boot,
firmware modificado o drivers físicos. Reboot no deshace archivos ni garantiza
reversión de corrupción persistente. Callbacks potentially privilegiados, sin
sandbox; peor fallo razonable bloqueo/panic/reboot/corrupción RAM/FS, posible
soft brick. Sin operación dirigida al boot que deba hard-brickear, sin garantía
integral. ABI/read/close observados no garantizan todos los handles/unload.
Recuperación parcial Ajustes→Esferas si responde; recovery integral no validado.
Parar ante rechazo/fallo/incertidumbre; no flash/boot/firmware ajeno/exploits/
SWD/JTAG/reboot automático. No recuperar datos borrando marcas o repetir init C.

## Instalación R260 realizada

Un install RegisteredInactive,12partes/stream24126bytes/TX24623bytes,
21TX/16RX. Registro confirmado, no selección automática; ACK final independiente
de aceptación de transferencia no verificado. GET15→16, IDs/flags anteriores
preservados, activa365219968 conservada, propia365219967inactiva/removible.
Journalstate-trace-r260.json Registered12/sinlock. Socket/worker cerrados/exit0,
sin error nativo. Sin SET/DELETE/retry/reboot/moduleloadunload/proc/CdesdePC.
Finally fuentes/gates restaurados, helper cerrado reconstruido, gates0sockets
exitosos. Helper autorizado
`05c354fa1dc8b78c47c39c4664b47a09bef981b63e6865159bbbcf3399afc494`.
Evidencia privada `artifacts/state-trace2-r260-authorized/`, runner consumido.
READ C completado; foto y «menu y esferas ok» recibidos. Ensayo consumido.

## Diagnóstico R260

Foto REG CODE `004200420F03000600410000`: longitudes66/66, flags0F (apertura,
read,EOF,close exitosos), formato03 (final3NUL rechazado), máscaras00/06,
primera diferencia65, errno00. Los primeros64bytes son idénticos, incluyendo
NUL64;65/66pasaron de cero a no cero. FRAME/IDLE/close C verdes, menús/esferas
normales. Esto identifica el rechazo de nuestra comparación de bytes posteriores
al terminador; no cambio de los campos visibles del módulo. No certificar toda
RAM o ausencia de otros fallos. [Corrección/plan R262](state-match-physical-plan-r262.md).
