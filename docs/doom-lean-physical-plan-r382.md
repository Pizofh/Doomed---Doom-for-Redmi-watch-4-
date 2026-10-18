# R382: liberar la interfaz de diagnóstico antes de CHECKING

Aprobado e instalado inactivo el 2026-10-18; ensayo manual pendiente. R381 confirma GATE21/CODE201:
UMEMfree7361008 < mínimo7366211, diferencia5203B. MAX4776864 supera4194320.
READ/TOTAL629904 indican checksum ELF correcto. Este camino rechaza antes
de cargar C. Usuario regresó y menús normales. No repetir R381 ni bajar guard.

## Cambio concreto

DoomLeanID365220004, preview MARCO AZUL y SEIS BARRAS. Paquete42312B,
SHA25649e2e10535cbca4466248b10bf77d96c64a679774cb2b21486489ea083bb7901.
`build/doom-lean-r382/package/DoomLean-id-only.face`. Lua29266B,
SHA2568400604e8ecdc05bb94f7011f7556514499d037422419d4f25d79428ddecae72.
Siete recursos, no ELF/WAD: reutiliza365220002 con módulo rw4packed378,
CRC/sha/config existentes, gráficos/bancos/lease del mismo launcher.
Conservar DoomPacked y todas las esferas/partidas; no borrar/SET/reinstalar.

Antes se creaban36widgets en READY:6de interfaz y30de diagnóstico ocultos
(panel,3labels,24dígitos y botónMODE/label). Ahora solo6 al arrancar. Los30
se crean al llegar a ERROR/CLOSED. En cada CHECKING, incluso tras CLOSED en
el mismo contexto, se eliminan panel/hijos yMODE antes del checksum/GC/RAM.
Se recrean ante error para no perder GATE/FREE/MAX y CODE/READ/TOTAL.
Se conservan minfree7366211/minlargest4194320, recolección antes de RAM,
checksum, engine/render/audio/caché de dos páginas, controles y slots.
No nuevas funciones C, direcciones firmware ni cambio del IWAD.

La reducción de objetos está demostrada en las pruebas; no se midió cuántos
bytes exactos libera en RW4. No prometer que baste físicamente. No rebajar
el umbral si sigue rechazando: medir el nuevo FREE/MAX y decidir offline.
No modificar el lector de compresión: esta revisión no necesita cambiar C.

## Validación

16casos de factory/safe exactos en Lua S3 con archivos/OS/native simulados,
incluidos rechazos de CRC/RAM/cabecera/carga y dos ciclos normales. UI exacta
con widgets/backend simulados:6widgets antes de inicio, los30 diferidos se
crean al cerrar y vuelven a desaparecer al siguiente CHECKING; ERROR los
recrea y CODE muestra00000201. Menú/controles permanecen funcionales.
Esto no mide RAM del hardware ni reejecuta la campaña C sin cambios.

Paquete:7recursos exactos,6tamper rechazados,21partes por C#IPC real con
receptor sintético, dependencia365220002 obligatoria antes de INSTALL,
colisión/rechazo/hash/corte. Journal propio lean-r382.jsonl y6modos retry/
resume bloqueados. CLIprepare/gatecerrado y regresiónR381 pasan; shared23
escenarios pasan. Temporales del S3 retirados, sin radio/escritura al reloj.

## Alcance solicitado y ejecución

UNA instalación inactiva42KB y UN ensayo≤60s de juego. Batería≥50%, reloj
junto al PC/MiFitness cerrado y observación. Sin reinicio previo ni reenviar
ELF/WAD; conserva todo y la selecciónactual. Nuevo gate
PHYSICAL_LEAN_R382_REVIEWED=false. Tras aprobación abrir SOLO general+LeanJS
y C#Large (Retail/Boot y demás cerrados), rebuild y emptytarget→InvalidTarget
con assertLargeNativeDispatchReady antes de privados/journal/radio.
`node tools/pc-doom-boot-r381.mjs install --lean-r382` UNA vez. Catálogo con
365220002 y nuevo365220004 ausente. Tras cualquier resultado cerrar gates y
rebuild inmediatamente. No retries/resume/autoselección ni borrados.

Manual: DoomLean (azul/seisbarras), siREADY→STARTuna vez. Mantener CHECKING
despierto con toques breves fuera de botones. SiERROR (incluso inicial),
anotar GATE/FREE/MAX y MODE→CODE/READ/TOTAL; no repetir/reabrir, volver desde
Ajustes. Si arranca: NEWGAME→I, controles/primer disparo/sonido/pausa y
SALIR≤60s→CLOSED. Un solo arranque. Si queda imagen encima de menús,
reiniciar desde Ajustes y dejar esfera habitual. No pedir comprobaciones
repetidas de menús si usuario no indica fallo.

La autorización R381 se consumió; nueva UI exige aprobación por la regla
inicial del usuario. No añade C, pero cambia vida de objetos LVGL y podría
cargar el mismo motor completo aún no validado físicamente. Riesgo de
bloqueo/corrupción/reinicio; salida cooperativa no corta llamadas bloqueadas.
Recuperación integral sigue sin validar.

## Instalación R382

Una instalación autorizada: modelo/FW esperados, catálogo12/IDnuevo ausente,
INSTALL0, ACKMD5/status0/offset0/chunk2048.21partes/29frames/43033B TX.
RegisteredInactive/registeredVerifiedtrue, contentVerifiedfalse y
selectedByClientfalse. Selección/esferas preservadas; cierre/workerexit0 y
nativeErrorfalse. Gatesgeneral/LeanJS/LargeC# cerrados y worker reconstruido
inmediatamente; Retail/Boot y demás siguieron cerrados. No borrados/SET/
reinicio ni reenvío de C/WAD. UN ensayo manual ya aprobado pendiente.

### Ensayo R382 reportado

No inició. GATE60/FREE7370096/MAX4776864/CODE999/READ629904/TOTAL629904;
contadores anteriores0 salvoPHASE1 yAUDIOEND1. RAM supera mínimo por3885B,
y mejora9088B frenteR381. Checksum/headers/insmod/primerstate/command1
pasaron. No afirmar que C se descargó o que nunca ejecutó el motor: llegó a
command1, pero no hay CLOSED ni snapshot completo que pruebe join/unload.
El código999 no identifica causa. El límite heredado de200callbacks40ms
(~8s nominales) puede cortar arranque comprimido; es una hipótesis, no prueba.
R383 separa espera inicial/cierre y añade snapshots/códigos, sin C/WAD nuevos.
Usuario aclaró después que el error fue CASI INMEDIATO tras CHECKING: reduce
la plausibilidad del timeout, no la confirma. R383 se centra también en
distinguir lectura/identidad/control y salida C inmediata. No atribuir causa
exacta sin el nuevo diagnóstico.
