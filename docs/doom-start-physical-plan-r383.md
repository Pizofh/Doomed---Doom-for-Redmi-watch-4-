# R383: diagnosticar el fallo inmediato de arranque y separar esperas

Instalado inactivo tras autorización explícita del usuario el 2026-10-18.
Una sola ejecución: RegisteredInactive/registeredVerifiedtrue; modelo/FW
esperados, catálogo13/ownIDausente, INSTALL0/ACKMD5/status0/offset0.
24partes/32frames/47978BTX. Sin SET/borrados ni reenvío ELF/WAD.
closeConfirmed y workerExitConfirmedtrue, exit0/nativeErrorfalse.
Gatesgeneral/StartJS/C#Large cerrados y ejecutable recompilado al terminar.
contentVerifiedfalse: pendiente UN ensayo manual ya autorizado, con reinicio
normal antes de abrir. Sin segundo arranque ni otro envío autorizado.

R382 superó RAM:7370096≥7366211 y
MAX4776864≥4194320. GATE60/CODE999, PHASE1/AUDIOEND1 y demás métricas0.
Llegó a command1; no juego/CLOSED. No hay confirmación de join/unload.
Usuario aclaró sin repetir prueba que el error fue CASI INMEDIATO tras
CHECKING. Eso hace menos probable el timeout de8s; no presentarlo como causa
ni como corrección confirmada. Falta identificar el fallo exacto posterior
a command1. Esta revisión añade diagnóstico de ese camino inmediato.

Código revisado: antes de ready la UI usa el mismo contador200 que al cerrar,
40ms porcallback≈8s nominales. El C primero calibra, verifica12408292bytes
del IWAD a través de descompresión y luego ejecuta doomgeneric_Create antes
de rw4_game_ready. Puede superar esa espera; NO se confirmó timeout físico.
No atribuir CODE999 al timeout como hecho ni suponer WAD corrupto.

## Paquete

DoomStartID365220005, MARCO ÁMBAR y TRES BARRAS VERTICALES.47200B,
SHA2564f81e1a07f9ab9044236adbb2adf8c647ec32341c569662070c57a63f50e257a.
`build/doom-start-r383/package/DoomStart-id-only.face`. Lua29947B,
SHA2562eb6b5d652c5e44b7079b7c46f26722b6166df4177ac23f401eb5eea0a49202b.
13recursos, soloLua/labels/preview. Reusa365220002: MISMO ELF/WAD/módulo,
config/guard7366211/4194320 y panel diferido30widgets de R382. No borrados,
reemplazos/SET ni reenvío de C/WAD; slots/lease y gráficos del mismo base.

Espera inicial2250callbacks (~90s nominales) mientras started/!ready;
cierre sigue200callbacks (~8s), audioquietquarantine50 (~2s). No ampliar el
cierre ni forzar join/rmmod. Al observar ready reinicia wait_ticks para no
arrastrar la espera inicial hacia el cierre. Límite del juego30min intacto.
Timers cooperativos: no garantizan esos tiempos si el hilo UI se bloquea.

CODE701startup_timeout,702stop_timeout,703cleanup,704controlidentity,
705snapshotread,706commandwrite,707unload,708registrychange,602fileclose,
además de códigosR381. Otros errores de string conservan solo90000000+
líneaLua (acotada), nunca textoOS/rutas/mensajes crudos. Error no string999.
MODE páginas7/8 muestran START/READY/FINISH y JOIN/REASON/EXIT del snapshot
C de72campos. REASON/EXIT solo son válidos tras join real (C original así
los publica), no leer estadísticas privadas C activas. Páginas1–6 intactas.

## Validación local

22casos de factory/safe exactos:16previos con checksum/RAM/headers/carga,
dos ciclos normales y UI; fallo de identidad trascommand1, lectura fallida
inmediata y salida del motor84 con join/unload distinguidos. Más ready
retrasado más de310polls (supera el
límite200 anterior), rechazo exacto al2250 y parada atascada que mantiene
200. Sin forzar unload del hilo que no termina. UI sigue teniendo6widgets
enCHECKING, errorrecrea30 y muestraCODE; flags de páginas7/8 funcionan.
No mide tiempo/sonido/rendimiento ni confirma causa de fallo en RW4. Los
flags visibles son el último snapshot recibido; si una lectura falla pueden
ser anteriores al error. No afirmar que corresponden a su instante exacto.
S3 solo ejecutó Lua; módulo/shell/files en mocks. Temporales retirados.
No repetir campañaC ni recompilar el motor sin cambios.

Paquete13recursos exactos,6tamper,24partes por C#IPC/receptor sintético,
dependencias/colisión/rechazo/hash/corte,6modosretry/resume denegados,
CLIprepare/gatecerrado. RegresiónR382paquete y shared23escenarios pasan.
Sin radio adicional durante esta preparación; journal físico intacto.

## Alcance y procedimiento tras autorización

UNA instalación inactiva47.2KB y UN ensayo manual, con un reinicio normal
antes de abrirlo, batería≥50% y observación. El reinicio se pide porque R382
llegó a cargar C y no confirmó descarga; limpia ese estado, no es una
exigencia por cada pequeño envío. Nunca Restablecer. Se puede instalar
inactivo antes del reinicio, sin ejecutar C; esperar cierre del transporte.

Gate PHYSICAL_START_R383_REVIEWED=false. Abrir tras aprobación SOLO
general+StartJS y C#Large, build y assertLargeNativeDispatchReady con
targetvacío→InvalidTarget antes de privados/journal/radio.
`node tools/pc-doom-boot-r381.mjs install --start-r383` UNA vez, catálogo con
365220002/own365220005ausente. Journalstart-r383 separado; no retry/resume.
Cerrar gates/rebuild ante cualquier resultado antes de instrucciones de juego.

Manual desde esfera habitual: Ajustes→Sistema→Reiniciar, NO Restablecer.
No abrir DoomLean/Boot/Packed. Seleccionar DoomStart ámbar/tresverticales.
SiREADY, STARTuna vez y mantener CHECKING/LOADING despierto con toques
breves fuera de botones. Permitir hasta~90s de espera inicial más el checksum
Lua. Si inicia, NEWGAME→I, controles/sonido/pausa y SALIR≤60s de juego→CLOSED.
SiERROR, no repetir/reabrir: GATE/FREE/MAX+MODE→CODE/READ/TOTAL;
siGATE≥50 añadir páginasSTART/READY/FINISH y JOIN/REASON/EXIT (MODE2vecesmás).
Volver desde Ajustes. Si queda imagen encima, reiniciar desde Ajustes y dejar
esfera habitual. UNarranque, no segundo ciclo. No exigir otra aprobación para
este ensayo ya incluido. Si no hay reporte de menús anómalos, asumir normales.

R382 se consumió: es un payload Lua nuevo que requiere aprobación según
regla inicial del usuario. Mantiene riesgos de bloqueo/corrupción/reinicio
por cargar el mismo motor C completo aún no validado físicamente con este
WAD. La espera mayor no puede interrumpir una llamada nativa atascada.
Recuperación integral sigue sin validar.
