# R386 DoomFit instalado inactivo; UN ensayo manual ya autorizado

Usuario aprobó «Sí, autorizo y puedo observar» el 2026-10-18. UNA instalación
terminó RegisteredInactive/registeredVerifiedtrue/contentVerifiedfalse.
Catálogo10/carrier006 presente/007ausente/modeloFWesperados; INSTALL0,
ACKMD5/status0/offset0/chunk2048.331partes/339frames/681479BTX,
selectedByClientfalse. closeConfirmed/workerExitConfirmedtrue/exit0/
nativeErrorfalse. Gates general/FITJS/C#Large restauradosfalse y rebuild
inmediato por finally, demásgatesfalse. No SET/borrado/autostart ni WADreenviado.
Journalfit-r386 terminado: NO otro install/retry/resume/consultaBluetooth.

Pendiente UN ensayo manual≤60s YA autorizado. No nueva aprobación/reinicio.
Seleccionar DoomFit (MARCO MORADO y DOS VERTICALES), conservar DoomII carrier.
READY→START1, mantener CHECKING/LOADINGdespierto (~90s carga más checksum).
Título→OK/NEWGAME→dificultad→MAP01, controles/primerdisparo/sonido/USAR,
PAUSA/GUARDAR→GUARDADO; SEGUIR/mover, PAUSA/CARGAR→CARGADO,
SEGUIR/SALIR≤60sjuego→CLOSED; esperar cierre sin insistir (~40s nominales).
No segundo arranque/reabrir. Error/silencio/corrupción/cierrefallido: MODE
GATE/FREE/MAX,CODE/READ/TOTAL; siGATE≥50 START/READY/FINISH,JOIN/REASON/EXIT;
AUDIOERR/CALL si responde. Habitual desde Ajustes; imagenretenida→reinicio
normal NO Restablecer y dejar habitual. Asumir menús/corona normales salvo
reporte. Ningún gameplay/audio/cierre de DoomII validado físicamente aún.

## Preparación anterior R386 (autorización e instalación ya consumidas)

Usuario aclaró que acababa de reiniciar antes del fallo R385. Cancelada la
propuesta de repetir reinicio; no autorizada ni ejecutada. No atribuir la RAM
observada al transporte. Ofreció borrar esferas si sirve: conservar personales;
ese borrado libera flash y no demuestra que aumente RAM de arranque.

DoomFit ID365220007/rw4doomii386, marco MORADO y DOS barras VERTICALES.
Actualización de674868B, SHA256
37a0161b7c9b7fbc9955d9d7a19ba0c5a43af29de7a18bab6975bfb07da1a136.
ELF631588B SHAd3aae03d409d9b32dbee80c19c042cbcca1304448f41a07482714a353cca154d.
Reutiliza WAD/assets/slots de DoomII365220006: CONSERVAR DoomII, abrir DoomFit.
Sin WAD incluido, borrados ni cambio automático de esfera. Plan completo
docs/doom-fit-physical-plan-r386.md. Aprobación e instalación posteriores
registradas arriba; gates cerrados y journal físico R386 consumido.

Cache ADPCM320KiB (107SFX/310485B útiles), decodificación incremental por voz,
sin heap ni expansión completa en mixer. Conserva frecuencia R384, zona3MiB,
slots192KiB, resolución/controles/32mapas. Compresión adicional CON pérdida:
calidad y coste real pendientes. ALLOC alineado2227500→1901456, ahorro326044B.
min_free=ceil((7366211-326044)/4096)*4096=7041024; misma reserva planificada,
redondeo hacia arriba. Largest4194320 intacto. Frente FREE7270920 observado,
margen modelado229896B; no garantiza asignaciones ni RAM actual del reloj.

Pruebas:26vectores codec+107efectos/4voces a4rates, bytes C vs referenciaJS;
2ciclos motor real título/MAP01/guardar/cargar/persistencia/cierre;
held prepare/close con threads reales;25casos Lua exacto (FREE observado
aceptado, ambos límites-1 rechazados); paquete2recursos/6tamper/331partes
C#IPC/5fallos/6retrymodes denegados; regresión transporte23casos.
Gráficos/audio modelados, NO reproducción física. Campaña32mapas es R384
anterior; no llamarla nueva campaña R386. Guest WAD temporal retirado.

Preparación contemplaba UNA instalación inactiva + UN ensayo≤60s,
batería≥50% y observación, sin reinicio/borrados/reenvío WAD. Instalación
consumida: no ejecutar ese procedimiento otra vez. Mantener DoomII carrier
y nueve personales. Solo queda el ensayo manual descrito arriba.
Error anterior SALIR R383 aún sin causa validada: R386 conserva cierre R384,
no afirmar arreglado. Riesgo bloqueo/corrupción/reinicio; recovery sin validar.

## R385 primer ensayo: guard de RAM rechazó antes de C

Usuario reportó ERROR durante CHECKING: GATE21/FREE7270920/MAX7192944,
CODE201/READ630004/TOTAL630004. TodosSTART/READY/FINISH/JOIN/REASON/EXIT y
TIME/TICS/IMAGES0. ELFCRC pasó; faltan95291B frente min7366211. El bloque
contiguo supera4194320 por2998624B: rechazo por libre total, no fragmentación
que impida ese mínimo. No insmod/command1 ni motorC ejecutado en este ensayo.
No segundo arranque ni guardado/audio/cierre del juego validados. Esto prueba
rechazo del mínimo planificado, NO un fallo real de asignación del motor.

Código revisado: seis widgets antes de arranque,30diagnósticos diferidos,
CRC streaming y collectgarbage('collect') antes de ram(). El C nuevo de640KiB
SFX no está cargado todavía; su ahorro estático no aumenta FREE preinsmod.
El usuario aclaró reinicio reciente; la propuesta de otro reinicio queda
cancelada. La siguiente revisión R386 reduce memoria residente real y deriva
un mínimo nuevo, sin omitir esa reserva ni reducir la zona del motor.

## R385 instalación anterior

Una ejecución install-after-space completada el 2026-10-18: RegisteredInactive,
registeredVerifiedtrue/contentVerifiedfalse. Catálogo9/modeloFWesperados,
sameSelectiontrue/reviewedSpaceRemovalstrue, INSTALL0/ACKMD5/status0/offset0/
chunk2048.3534partes/3542frames/7289214BTX. closeConfirmed/workerExitConfirmed
true/exit0/nativeErrorfalse. Nueve esferas personales/selección preservadas;
solo retiro manual de Packed aceptado. Sin SET/autostart/borrados desdePC.
Gates general/DOOM2SPACEJS/C#Retail cerrados/rebuild inmediato, todosotrosfalse.
Journaldoom2-r384 conserva intento1 rechazado y intento2RegisteredInactive.
NO otro envío/retry/resume/consultaBluetooth. Mismo paquete7221744B
SHA483dcce2620f99839f930881c5024f1b0c67885e27a36cd1b1a26e5d6864f5a1.
DoomII365220006/rw4doomii384, preview marcoROJO/DOSVERTICALES.

Protocolo histórico R385, detenido por el primer ERROR; NO ejecutarlo ahora:
READY→START1, CHECKING/LOADINGdespierto (~90s arranque más checksum).
TítuloDoomII→OK/NEWGAME→dificultad→MAP01, controles/primerdisparo/sonido,
USAR, PAUSA/GUARDAR→GUARDADO; SEGUIR/mover, PAUSA/CARGAR→CARGADO,
SEGUIR/SALIR≤60sjuego→CLOSED. Esperar salida sin insistir (~40s nominales máx
de stop/audio; cooperativo). SOLO si todo correcto: habitual→volverDoomII,
START1/cargar desde título/SEGUIR/SALIR→CLOSED. Error/sonidoausente/cierre
fallido: no segundo ciclo/repetir/reabrir. MODE: GATE/FREE/MAX,CODE/READ/TOTAL,
START/READY/FINISH,JOIN/REASON/EXIT,AUDIOERR/CALL si responde. Imagenretenida:
reinicio normal (NO Restablecer), habitual. Asumir menús/corona normales salvo
reporte del usuario. Nada físico de gameplay/audio/cierre validado todavía.

## R385 autorización y preparación anteriores

Usuario confirmó eliminación de DoomPacked y AUTORIZÓ el nuevo envío:
«ya la borré. te autorizo a que envies. dale». No preguntar de nuevo.
Plan R385 ajustado: preservar las NUEVE caras personales con flags/selección
idénticos y aceptar únicamente retiro de Packed365220002. La propuesta previa
de retirar otras ocho fue rechazada. No borrar personales ni desdePC.
Mismo paquete7221744B/hash483dcce...; no cambios ELF/Lua/WAD ni nuevosensayosC.
Nuevo guard pasó47casos/3534IPC; paqueteR384 pasóregresión. Listo para abrir
SOLO general+DOOM2SPACEJS/C#Retail, build/emptytargetready,
pc-doom2-r384.mjs install-after-space UNA vez; cerrar/rebuild siempre.
No otro reinicio necesario. Usuario al reloj, batería≥50%/observación ya
confirmadas. No otro reintento automático. DOS ensayos≤60s incluidos, segundo
solo si primer CLOSED y todo correcto. R384 sigue consumido0partes.

## R385 preparación anterior (reemplazada por el alcance anterior)

Usuario confirmó reinicio, batería≥50%, espacio/observación y autorizó UNA
instalación y DOS ensayos. R384 consumido: instalación detenida INSTALLstatus3,
catálogo10/ownIDausente/modeloFWesperados,6frames/226BTX,0MASS/uploadnull.
Cierre y workerexit0/nativeErrorfalse. Gates cerrados/rebuild inmediato.
No juego instalado ni C ejecutado. NO repetir CLIinstall ni borrar journal.

Catálogo ya recibido: habitualactiva365210175, DoomPacked365220002 inactivo,
otras8caras eliminables/inactivas. No tamaños ni byteslibres medidos; status3
compatible con cuota/statfs. Proponer conservar SOLO Packed/habitual entre
descargadas y eliminar otras8 manualmente. No borrados desdePC ni abrirPacked.
No otro reinicio: el usuario ya reinició y R384 no envió datos ni ejecutóC.

R385 mismo paquete/ELF/Lua/WAD, NO recompilar ni repetir campaña32mapas.
Plan docs/doom2-space-retry-r385.md, gateDOOM2SPACEfalse/R384false, todoscerrados.
CLIpc-doom2-r384.mjs prepare-after-space|install-after-space. Nuevo guard exige
HMAC/key/target/hashchain y exactamente historia3 del intento1 uploadnull;
conserva journaloriginal y añade intento2/retry-doom2-space-r385. Catálogo nuevo
EXACTAMENTE2: habitualactiva175 y Packedinactivo002 conflagsanteriores.
43casosR385/3534IPC pasan, paqueteR384regresión pasa. Shared23/R37543casos pasan.
Ninguna radio adicional ni alteración del journal físico durante preparación.
Falta confirmar limpieza y NUEVA aprobación UN envío/DOSensayos≤60s,
batería≥50/observar8–12min/relojcerca/MiFitnesscerrado/volumenaudible.
Tras aprobar SOLO general+DOOM2SPACEJS/C#Retail, build/emptytargetready,
install-after-space1, cerrar/rebuild inmediato. Fallo→detener, sin retry/resume.
Segundo arranque solo si primer CLOSED y todo funciona. Riesgos R384 intactos.

## R384 preparación anterior

Usuario pidió «dale el2». Solo preparación local, ningún envío/R384journal.
DoomII ID365220006/rw4doomii384, marcoROJO/DOSBARRASVERTICALES; autónomo
sin DoomLauncher/DoomPacked. Paquete7221744B SHA256
483dcce2620f99839f930881c5024f1b0c67885e27a36cd1b1a26e5d6864f5a1
en build/doom2-r384/package/DoomII-id-only.face, privado/ignorado.
ELF630004B SHAb800ffa5a1880fdeb8a3839bd738eca2ba15d2898dbd6315632902c6087dc575.
Lua30160B SHAf4731caa45feb2c7bf502956022bfab2de30a2a7273d3671ae98d32be83d4995.
WAD lógico14604584B/32mapas; lossless6531369B/223páginas. 107SFX remuestreados
a mitad de frecuencia,620164B en640KiB; menor fidelidad, ninguno omitido.
No música MIDI. Mantiene render grande/controles de un dedo/zona3MiB/slots192KiB,
bancos propios con CRC distinto. No multitáctil añadido.

Cambios audio:16bloques silencio~372ms y alimentar silencio con cola vacía;
no afirmar primer sonido corregido sin hardware. ALLOC2227500B,32140menos
queR378; guardas7366211/4194320 INTACTAS. Cierre: audio_wait independiente500,
stop500, startup2250callbacks; oculta overlays enSTOPPING/RECOVERING.
GATE80detach/81stop/82audio/83join/84unload, CODE709audio_timeout. No forceunload.
R383 ERROR fue DESPUÉS de SALIR, confirmado por usuario; causa aún desconocida.

Validado:32mapas arrancan/guardan/cargan/cierran con join/unload, todosallocated==
freed/audioerr0/cache620164. Máximoguardado81378B/picodinámico3484597B.
Dos ciclos título/NEWGAME/spawnMAP01/controles/guardar/cargar/carga desde título,
joins/unload pasan.24casosLuaUI, audio prepare/close retenidos con hilos reales,
siete escenarios startup (repetido tras corregir expectativa de fixture sobre
writes silenciosos; motor intacto), paquete77resources/6tamper/3534partesC#IPC/
5fallos/6retriesdenegados pasan. RegresiónR383paquete/shared23 pasan. Gráficos y
audio modelados; no FPS/altavoz RW4 ni playthrough de32mapas. Temporales y WAD
guest retirados, sin módulos retenidos. Todos los gates JS/C# cerrados.

Plan docs/doom2-physical-plan-r384.md. ESPACIO antes de enviar:
DoomLauncher4827044+DoomPacked6165808+DoomII7221744=18214596>cuota15728640.
Proponer retirar manualmente SOLO DoomLauncher antiguo si conserva DoomI
completo; ambos completos son autónomos y suman13387552, margen2341088 para
otras caras (no medición). Conservar DoomPacked/habitual. No borrar desdePC.
Falta confirmación de liberación y aprobación específica UNA instalación/DOS
arranques≤60s; no inferir del «daleel2». Reinicio normal antes de abrir porque
R383 no confirmó descarga, NO Restablecer. Relojcerca/MiFitnesscerrado/batería≥50/
observación. CLIpc-doom2-r384.mjs prepare|install. GateDOOM2/retail cerrado;
tras aprobar solo general+DOOM2JS/C#Retail, build/emptytarget readiness, install1,
cerrar/rebuild inmediato. Ningún retry/resume automático.

## R383 resultado anterior

Resultado del ensayo autorizado, según usuario: juego y controles funcionaron;
no probó guardar/cargar. Al intentar volver apareció ERROR; salió de la esfera,
regresó y ya no pudo iniciar. No informó CLOSED ni cifras de diagnóstico.
No atribuir causa a timeout/audio ni dar join/unload por confirmados.
Sonido defectuoso al principio, después se normaliza. No reabrir para obtener
cifras; reinicio normal desde Ajustes antes de otra prueba, sin Restablecer.
Ensayo R383 consumido; no queda otro arranque/envío autorizado.

Usuario aclara que su nostalgia era por Doom II y pregunta si conviene migrar.
Inspección local: doomgeneric ya reconoce Doom II/commercial; WAD aportado
14604584B/32mapas, frente Ultimate12408292B/36mapas. El tamaño del WAD no
equivale a RAM activa. Perfil actual fija identidad/CRC, mapas de episodios y
slots; cachéSFX672KiB no cubre1240277B de todos los efectos DoomII. Hará falta
perfil/compresión, audio con presupuesto acotado, slots separados y validación
de32mapas. No prometer mismo FPS/RAM ni compatibilidad sin probar. Recomendación:
corregir cierre y arranque de audio compartidos, luego preparar DoomII localmente,
sin otra instalación diagnóstica física solo para decidir. No WADII enviado.

## Registro de instalación R383

Usuario autorizó UNA instalación y UN arranque, reinicio previo, batería≥50%
y observación. Instalación realizada el 2026-10-18 una sola vez: RegisteredInactive,
registeredVerifiedtrue/contentVerifiedfalse; modelo/FW esperados, catálogo13,
INSTALL0/ACKMD5/status0/offset0;24partes/32frames/47978BTX.
Cierre confirmado, workerexit0/nativeErrorfalse. Gatesgeneral/StartJS/C#Large
cerrados y rebuild inmediato. Journalstart-r383 existe: NO repetir envío.
No SET/borrados/reenvío ELF/WAD. CONSERVAR DoomPacked365220002.
Falta solo UN ensayo ya autorizado: reinicio normal desde Ajustes antes de
abrir DoomStart ámbar/tresverticales. READY→START1; mantener despierto,
esperar arranque~90s+checksum. Sierror GATE/FREE/MAX,CODE/READ/TOTAL;
siGATE≥50 START/READY/FINISH y JOIN/REASON/EXIT. No repetir/reabrir.
Si inicia, NEWGAME→I, controles/sonido/pausa y SALIR≤60sjuego→CLOSED.
No segundo ciclo. No pedir autorización adicional para este ensayo.

R382 físico: no juego, GATE60/FREE7370096/MAX4776864/CODE999/READ629904/
TOTAL629904. Métricas0 salvoPHASE1/AUDIOEND1. RAMguard ya pasa por3885B,
mejora9088B vsR381; insmod/state/command1 pasaron. No CLOSED/join/unload
confirmados: no afirmar motor no cargado ni causa exacta. Usuario aclaró
CASI INMEDIATO trasCHECKING; hace menos probable timeout8s, NO atribuirlo
a timeout ni prometer resuelto. R383 distingue fallos inmediatos poscommand1.

R383 soloLua: startup2250callbacks≈90s nominales, stop200/audio50 intactos,
wait_ticks reseteado already. MismoC/WAD/guard/paneldiferido. CODE701startup,
702stop,703cleanup,704identity,705read,706write,707unload,708registry;
otrosstrings90000000+líneaLua, no textoOS. MODEpáginas7/8 START/READY/FINISH,
JOIN/REASON/EXIT. El timeout anterior200≈8s puede explicarR382, NO demostrado.

DoomStartID365220005, marcoÁMBAR/TRESVERTICALES; paquete47200B SHA
4f81e1a07f9ab9044236adbb2adf8c647ec32341c569662070c57a63f50e257a,
Lua29947B SHA2eb6b5d652c5e44b7079b7c46f26722b6166df4177ac23f401eb5eea0a49202b.
build/doom-start-r383/package; reusa365220002(CONSERVAR DoomPacked).
22casos Lua/UIpasan (errores inmediatos poscommand1,exit84 conjoin, ready>
310polls,init2250 y stop200), paquete13recursos/
6tamper/24partesIPC/retries6/dependencia/CLI pasan. R382paquete y shared23
pasan. No repetir campaña C. Sin radio/escritura al reloj en preparación.

Plan docs/doom-start-physical-plan-r383.md aprobado: UNA instalación47.2KB
ya completada y UNensayo≤60sjuego, batería≥50%/observararranque~90s, con REINICIO normal
antes de abrir porque R382 cargó C sin descarga confirmada (no Restablecer).
Puede instalarse inactivo antes, esperar conexión cerrada antes de reiniciar.
CLIpc-doom-boot-r381.mjs install --start-r383 ya consumido. GateSTARTfalse,
todo cerrado/rebuild confirmado. Journalstart-r383, no retries/resume.
Manualtrasreinicio READY→START1, CHECKING/LOADINGdespierto; sierror6cifras+
flags2páginasnuevas siGATE≥50; no repetir. Siinicia controles/sonido/pausa y
SALIR≤60s→CLOSED. No segundoarranque. No usar permisosR382consumidos.

## R382 instalación y preparación anteriores

Usuario aprobó instalación y ensayo el 2026-10-18. Una instalación completa:
modelo/FW correctos, catálogo12/ownIDausente, INSTALL0/ACKMD5/status0/offset0/
chunk2048.21partes/29frames/43033BTX. RegisteredInactive, selección/esferas
preservadas, contentVerifiedfalse. Cierre/workerexit0/nativeErrorfalse.
Gatesgeneral/LeanJS/C#Large cerrados/rebuild inmediato, otros cerrados.
No borrados/SET/reinicio ni ELF/WAD reenviados. No más radio necesario.

Pendiente UN ensayo ya autorizado: DoomLean marcoAZUL/SEISBARRAS, siREADY
START1/CHECKINGdespierto. ERROR→GATE/FREE/MAX+MODE→CODE/READ/TOTAL, no
repetir/reabrir. Si inicia NEWGAME→I, controles/primer sonido/pausa y
SALIR≤60s→CLOSED; reportarfluidez. Sin segundo arranque. No pedir otra
aprobación para este ensayo ni volver a preguntar menús si no reporta fallo.
No asumir que los30widgets diferidos liberan suficiente RAM hasta medir.

## R382 preparación anterior

R381 físico GATE21/CODE201, FREE7361008/MAX4776864, READ/TOTAL629904.
Faltan5203B frente min7366211; bloquecontiguo sí supera4194320. ELFCRCpass,
rechazo antes de insmod. Usuario volvió/menús normales. No repetir ni bajar
guard. ContadoresC0 son esperables en este camino y ya hay causa confirmada.

R382 aplaza30widgets de diagnóstico, crea solo6enREADY; ERROR/CLOSED los
recrea y cadaCHECKING elimina otra vez panel+MODE antes de CRC/GC/RAM.
MISMO C/ELF/WAD/caché2páginas/render/audio/slots y guard7366211/4194320.
No modificación del lector. Bytes ahorrados en RW4 NO medidos; verificar
FREEsi aún rechaza.16casos Lua+UI pasan, confirma6widgets/elim30/recreación
y dosciclos. Package7recursos/6tamper/21partesIPC/retry6/dependencias pasa.
RegresiónR381 y shared23 pasan; no repetir campañaC sin cambios.

DoomLeanID365220004, MARCOAZUL/SEISBARRAS, paquete42312B SHA
49e2e10535cbca4466248b10bf77d96c64a679774cb2b21486489ea083bb7901,
Lua29266B SHA8400604e8ecdc05bb94f7011f7556514499d037422419d4f25d79428ddecae72.
build/doom-lean-r382/package; reusa365220002(CONSERVAR DoomPacked), sinELF/WAD.
CLIpc-doom-boot-r381.mjs prepare|install --lean-r382; gateLEANR382false,
todo cerrado. Plan docs/doom-lean-physical-plan-r382.md listo: pedirUNA
instalación42KB y UNensayo≤60s/batería≥50%/observar, sinreinicio/borrado/SET.
Tras aprobación abrir SOLO general+LeanJS/C#Large, build/emptytargetready,
installUNAvez, cerrar/rebuild siempre antes de jugar. Journallean-r382 separado,
sin retries/resume. ManualREADY→START1; ERROR→GATE/FREE/MAX+MODE→CODE/READ/
TOTAL, no insistir. Si inicia controles/sonido/pausa ySALIR≤60s→CLOSED.
No segundo arranque autorizado. No radio adicional en esta preparación.

## R381 instalación y preparación anteriores

Usuario aprobó instalación y ensayo el 2026-10-18. Envío único completo:
modelo/FW correctos, catálogo11/IDnuevoausente, INSTALL0, ACKMD5/status0/
offset0/chunk2048;21partes,29frames/42621BTX. RegisteredInactive, selección/
esferas preservadas, contentVerifiedfalse. Cierre/workerexit0/nativeErrorfalse.
Gatesgeneral/BootJS y C#Large cerrados/rebuild inmediato; Retail quedó cerrado.
No borrados/SET/reinicio ni WAD/ELF reenviado. No más Bluetooth necesario.

Falta UN ensayo ya autorizado: DoomBoot (marcoROSA/cincobarras), SOLO siREADY
STARTuna vez/CHECKINGdespierto. SiERRORantesodespuésSTART, anotar GATE/FREE/MAX
y MODE→CODE/READ/TOTAL, no repetir ni reabrir; volverdesdeAjustes. Si inicia,
NEWGAME→I, controles/sonido/pausa y SALIR≤60s→CLOSED, reportarfluidez.
Sinsegundoarranque. No inferir causa todavía; gates/guardRAMsiguen cerrados.
El resto del bloque describe preparación previa.

Primer ensayo R380: CHECKING→ERROR; todas las páginas C en0, no salió juego.
Usuario volvió/menús normales. No pedir comprobación repetida ni segundoSTART.
Ceros no prueban ausencia de init C: aún no sabemos causa exacta.

DoomBootID365220003,41900B SHAfa971e356a2d7d79757eb9deae49e3475285d1b24ed83cb13101ab070c6cca9a,
Lua28995B SHAf67ddb3259179e58647e475d0417121dcba59dd63173711a502da1b8c7977d3b.
Paquete build/doom-boot-r381/package, soloLua+6labels/preview, NOELF/WAD.
Reusa base/engine/slots/gráficos de365220002; CONSERVAR DoomPacked.
Mismo C y guardRAM7366211/4194320, GCantesRAM. Etapa/ram/code/readbyte visibles
en páginas5/6. No afirmar fallo RAM/archivo ni mejora física todavía.
16casos Lua exacta+UI simulada/two cycles pasan; package7recursos/6tamper/
21partesC#IPC/retry6modes/dependencias/CLI pasan. No repetir tests del motor.
Tools doom-boot-r381, test-boot-r381, package-boot-r381, test-boot-package-r381,
pc-doom-boot-r381. PHYSICAL_BOOT_R381_REVIEWED=false; todo gate cerrado.
Plan docs/doom-boot-physical-plan-r381.md: pedir UNA instalación42KB y UN
ensayo≤60s. Tras aprobar abrir SOLO general+Boot JS y C#Large (no Retail),
build/emptytargetready, installUNAvez; cerrar/rebuild siempre antes de jugar.
Journalboot-r381 separado, no retries/resume. Exige carrier365220002 presente.
Manual: marcoROSA/cincobarras; READY→START1, error→GATE/FREE/MAX+MODE→CODE/
READ/TOTAL; no repetir/reabrir. Si inicia, jugar≤60s y SALIR→CLOSED. No segundo
arranque. No borrar/reinstalar juego ni usar la autorización R380 consumida.
No radio ni escritura al reloj durante esta preparación. Fuente/ELF/WAD R378
siguen intactos. Primer paquete de UI previo a checkpoints recovery archivado
localmente package-before-recovery-checks; NO usar, factory solo acepta final.

## R380 instalación anterior

Usuario aprobó UNA reanudación y DOSensayos el 2026-10-18. Se ejecutó UNAvez:
modelo/FW correctos, catálogo10/samemembership/sameselection, INSTALL0,
ACKMD5/status0/offset3378710/chunk2048.1364partes de cola enviadas,
1372frames/2813338BTX. RegisteredInactive/registeredVerifiedtrue,
contentVerifiedfalse/selectedByClientfalse. Cierre y workerexit0 confirmados,
nativeErrorfalse. Gatesgeneral+R380 JS/RetailC# cerrados y rebuild inmediato.
No borrados/SET/reinicio ni otra conexión. Journal intento3 conservado.

No repetir instalación/consulta/tests del emulador. Falta el ensayo físico
ya autorizado: DoomPacked ID365220002 (marco menta/tres barras), READY→START
una vez y mantener CHECKING despierto. Primer ciclo≤90s juego: título/cuatro
episodios, NEWGAME→I, primer disparo/sonido/movimiento/USAR/pausa, guardar
y SALIR→CLOSED. Solo si funciona: esfera habitual/reabrir/START, cargar desde
título, comprobar guardado, MENU→NEWGAME→IV breve, SALIR≤90s→CLOSED.
Ante ERROR/corrupción/suspensión/silencio/cierre fallido no repetir ni hacer
segundo ciclo; MODE CERROR/GPUCODE/PHASE y AUDIOERR/PCMSFX si responde,
volver desde Ajustes; reiniciar solo si queda imagen encima. No pedir otra
autorización para estos DOSensayos. No asumir rendimiento/memoria/primer
efecto válidos antes del reporte. Usuario prefiere asumir menús normales
salvo que indique fallo; no repetir preguntas de salud innecesariamente.

## R380 preparación anterior

R379 autorizado/consumido el 2026-10-18: modelo/FW y catálogo10 iguales,
INSTALL0, ACK MD5correcto/status0/offset3378710/chunk2048. Guard desde0
detuvo correctamente antes de MASS:7frames/277BTX,0partes nuevas,
DoomLargeUploadRefused. NativeErrorfalse, close/workerexit0. Gatesgeneral+
R379/RetailC# cerrados/rebuild. Journalpacked116filas: intento2restart-packed
Created→InstallIntent→UploadIntent→Uncertain/uploadnull, prefijo112intacto.
No registrado ni ensayos. No otra consulta física necesaria por ahora.

R380 usa MISMO paquete/ID/ELF, CLIprepare-resume/install-resume. Exige HMAC/
cadena del journal116filas exactas, agrega intento3resume-packed-r380,
recupera descriptorupload de intento1. ACKdebe incluir MD5correcto y offset
EXACTO3378710; otrooffset (incluido0) o faltaidentidad bloquean antes de MASS.
Catálogo mismo conjunto/flags y selecciónACTUAL. Quedan2787098B/1364partes,
wire2813040B. 53casos locales nuevos y R37947/shared23 pasan. Predicado
estructural acepta historial físico sin tocarlo; HMACsevalida antes de conectar.
Plan docs/doom-packed-resume-r380.md listo, falta aprobación UNA reanudación
y DOSarranques≤90s, batería≥50%, observar3–6min, reloj alPC/MiFitness cerrado.
Gate PHYSICAL_PACKED_RESUME_R380_REVIEWED=false. Tras aprobar abrir SOLO
general+R380 JS/RetailC#, build/emptytargetready, install-resumeUNAvez;
cerrar/rebuild antecualquierresultado ANTESde jugar. No retry4/SET/borrados.

## R379 preparación anterior

Usuario confirma cambio de distancia/conexión durante R378; ya vuelve a dejar
reloj al lado del PC. No prueba causa exacta. Mismo paquete R378 sin cambios.
Plan docs/doom-packed-link-retry-r379.md: UN envío nuevo desde0 y DOSensayos≤90s,
6–10min/batería≥50%/cercaPC/MiFitness cerrado. No borra/SET/reinicio previo.
47casos nuevos pasan, incluido C#IPC completo3017partes; shared23/retry18/
catalog17 pasan. No más pruebas del motor ni radio en R379 hasta aprobación.

CLI pc-doom-packed-r378.mjs prepare-restart/install-restart, checkpointR379.
Gate nuevo PHYSICAL_PACKED_RESTART_R379_REVIEWED=false. Solo general+R379 y
RetailC# se abrirían tras aprobación; R378 y retry/resume anteriores cerrados.
Journal original112filas debe validar HMAC/identidad y patrón exacto observado;
agrega intento2 restart-packed-r379 conservando prefijo. Nuevo envío solo con
ACKposición0 y mismo catálogo/flags, selecciónACTUAL preservada. Otro intento
se bloquea. No tocar journal privado ni suplantar con otro nombre.
prepare-restart no lee privados ni reclama journal. El helper estructural ya
acepta el historial físico original sin modificarlo; HMAC se valida al instalar.
Tras cualquier resultado cerrar gates/rebuild antes del ensayo. Falta pedir
aprobación concreta; no interpretar el mensaje «ya» como permiso nuevo.

## R378: envío parcial detenido; sin instalación registrada

Usuario aprobó el 2026-10-18 UNA instalación y DOS ensayos manuales≤90s.
Intento consumido: modelo/FW y catálogo10 correctos, INSTALLstatus0, ACK
hash/status0/offset0; 1687/3017partes escritas localmente, 3482621B TX,
1695frames. LargeSessionRefused durante Uploading; workerexit1 y cierre
confirmados. Journal packed-r378.jsonl intento1 Uncertain, seq112,
highestPossibleOffset3466602B. No presumir entrega remota ni espacio liberado.
NO reintentar/reanudar ni seleccionar DoomPacked. No ensayos realizados.
General+PackedR378 JS/RetailC# cerrados y reconstruidos inmediatamente.
Consulta posterior SOLO catálogo completa/cifrada/HMAC: mismas10esferas y
selección, ID365220002 ausente; cierre/workerexit0. No borrados/SET/reinicio.

El informe anterior omitió el diagnóstico nativo al cerrar, así que NO se
conoce el error específico del intento: no atribuirlo a radio, espacio,
timeout o compresión. Se añadieron los campos nativos ya validados al informe
compartido y prueba sintética de timeout durante MASS; 23escenarios pasan.
Esto no modifica el paquete ni recupera retroactivamente el código perdido.
Falta preparar/revisar cualquier nuevo intento y obtener nueva aprobación;
el journal actual prohíbe todos los retry/resume. No repetir pruebas de juego
ni compresión ya aprobadas sin cambios. El resto describe preparación previa.

R376 autorizado/consumido: guardcatálogo10 pasa, INSTALLstatus3,6frames/226BTX,
0MASS. Cierre/workerexit confirmados. Gates JSgeneral/R376/RetailC# cerrados y
rebuild. Intento3 journal Uncertain intacto. No cuarto intento autorizado.
Usuario prefiere compresión antes de borrar más (solo usa una esfera).

R377 estático: cuota15MiB conjunta market existentes+tamañoentrante,
prepareoffset43ca08, cmp43cc0a/branch43ccb8. Carrier4827044+paquete13090600
ya suman17917644>15728640. docs/packed-wad-r378.md; toolreview-rw4-storage-r377.
No consulta física ni byteslibres medidos en R377.

R378: tools/pack-ultimate-r378.mjs genera privado build/doom-packed-r378/doom.rwc
5482926B SHA f177618dd0da2ba304b9d12049832607d39904ee0b36536a3d83037f6afec38c,
190páginasdeflate64KiB, sin pérdida. Reader C doscachés64K+input64K/8cursores,
sin nueva ABI/hilo/escritura. tinf upstream fijado57ffa1... en lock/licenciaZlib,
fetch-tinf-r378 source-only (third_party ignorado). Byte/lump+600random/8faults
Ctest PASA. Rama --packed-r378 del builder compila rw4/s3-model/s3-hold.
RW4ELF629904B SHA1de7d78294e7885513344990e477a4d7530aa85f2955eba7e1210b10f724d746.
S3ELF638300B SHA21f531ca0efd9a6954c98ae3a14a92a7d1fbbfa99cf9105bf8c3257dc207c91d.
2ciclos menús/save/load/titleload/cierre PASAN; 36mapas con compresión PASAN
(NO repetir), final artifacts/research/packed-campaign-r378/result.json.
Extra secciones203728B, guard+212992 →minfree7366211/minlargest4194320.

Finales PASAN: UI exacta con13headersválidos/dañados, store23 y heldprepare/
close. Paquete generado con package-ultimate-r374.mjs --packed-r378:
DoomPackedID365220002 privado6165808B (antes13090600), SHA256
069e1a1dfdd676de6382565ba177cad411c07647929b8158dbe8d131cc9a490a, fuente27715B
SHA933395b6dc77ae114b54c5276db4af4dcf1c2223dbf82e270e589ea615babda3.
Factory prepareDoomPacked en doom-large-upload fija size/hash/ID, native=true.
CLI pc-doom-packed-r378.mjs plan/prepare/install. Scope packed:true+retail:true
independiente, PHYSICAL_PACKED_R378_REVIEWED=false; todos gatescerrados.
Journal propio packed-r378.jsonl, prohíbe todos retries/resume. PackageTest65
recursos/6tamper/3017partesIPC/5fallos/4retryModes pasa; funciona sin carrier.
Regresiones18/17 pasan. Plan docs/doom-packed-physical-plan-r378.md listo:
pedir aprobación UNA instalación inactiva6.17MB y DOSarranques≤90s, batería≥50%,
observación6–10min; conserva esferas/partidas restantes y no borra nada.
NO usar R376consumida. Tras aprobar abrir SOLO general+PackedR378 JS y RetailC#,
rebuild/targetvacío antes de privados/journal, installUNAvez. Después cerrar
gates y rebuild ANTES del ensayo. No otrosIDs/autoSET/retry/resume.

Emulador estaba apagado: se verificó PID5752 ausente/puertos ausentes, respaldó
vela_data.bin en artifacts/research/ultimate-storage-r377/pre-compression...
y registro viejo, marcó observación y arrancó instanciaaislada PID10572
(sesión24112). Headerownership+ADB ahora pasan. Scriptstagepacked escribe
solo/data/app/watchface/market/365799913/lua/doom-r378.wad, readbackSHAok.
WAD comprimido del S3 YA retirado, al igual que el raw del Creader; módulos
y nodos limpios, QEMU aislado queda funcionando para próximas pruebas.
Primer ELF sufría sufijo.rwc tratado como lump único; build preservado en
build/doom-audio-r378-pre-wad-suffix, NO usar. Fixtures de campaña fallidos
preservados; versión final corrige espera de mapa y rm sin-f. No C nuevo
desde el build final. No confundir fallos de fixture con Doom físico.

## R376 antes del intento

R375 fue autorizado/consumido: CatalogPreflight,count10, sameSelectiontrue,
reviewedSpaceRemovalsfalse,5frames/185BTX,0MASS/sinINSTALL. Close/workerexit
confirmados. Gates general/R375/Retail cerrados y rebuild. Intento2 journal
Created→Uncertain, before=null/uploadnull; originalR374 prefijo intacto.

GET sololectura posterior completó HMAC/cifrado/cierre. Carrier963 presente,
sin adiciones/cambios de flags; guardfallaba porque la entrada365110003 antes
canDeletefalse ya no aparece. No inferir borrado de archivos protegidos.
Inventario privado tools/local/pc-rfcomm/ultimate-catalog-r375.json.

R376 autoriza únicamente esa ausencia adicional. Gate independiente
PHYSICAL_ULTIMATE_CATALOG_R376_REVIEWED=false; CLI prepare-after-catalog/
install-after-catalog. Journal requiere5filas exactas R374/R375, sin upload,
mismaidentidad/paquete; recupera baselineoriginal y agrega intento3.
No cuarto intento/resume, ni C/Lua/WAD nuevos. GuardR376 ya pasa inventario
registrado sin Bluetooth. Tests26casos/6405partesIPC pasan, regresiones43/18/17
pasan. Plan docs/doom-ultimate-catalog-retry-r376.md pendiente de aprobación
para UN envío13.09MB y DOSarranques≤90s; batería≥50%, observar12–18min.
Tras aprobar abrir SOLO general+R376 JS/RetailC#, rebuild/targetvacío, ejecutar
UNAvez, cerrar gates/rebuild antes del ensayo. No reutilizar R375 consumida.

## R375 preparado antes del intento

Usuario confirmó espacio liberado. Paquete R374 idéntico y privado; C/ELF/Lua
sin cambios. Preparado docs/doom-ultimate-space-retry-r375.md, no reloj usado.
tools/pc-doom-ultimate-r374.mjs prepare-after-space/install-after-space.
Nuevo gate PHYSICAL_ULTIMATE_SPACE_R375_REVIEWED=false, todos gates cerrados.
Después de aprobación abrir SOLO general+R375 JS y RetailC#, rebuild/target
vacío antes de privados/journal. NO abrir gate R374 ni retry/resume genéricos.

afterSpace exige journal HMAC íntegro/mismaidentidad/paquete, intento1,
Created→InstallIntent→Uncertain y uploadnull en todas las3filas. Agrega intento2
retry-after-space-r375 sin tocar prefijo. Catálogo debe reducirse solo mediante
remociones eliminables, flags supervivientes iguales, carrier963 presente e
IDUltimateausente; conservar selección ACTUAL. Sin dependencia de UI previa.
Cualquier fallo consume ese intento, no tercero/resume. No cambiar WAD ni C.
Tests43casos con6405partes por IPC C# y receptor sintético pasan; regresiones
retry18/catálogo17 pasan. Aún no aprobación ni envío R375.

Pedir autorización concreta para UNA instalación inactiva13.09MB y DOSarranques
≤90s, batería≥50%, observación12–18min; mismo riesgo de flash/bloqueo/reinicio y
recoveryintegral sin validar. Las esferas/partidas restantes se conservan.

## R374: intento rechazado antes del archivo; puertas cerradas

Usuario autorizó UNA instalación y DOS arranques; luego «sigue, se habían
acabado los créditos». Antes de esa continuación solo se habían abierto
gates/compilado/verificado targetvacío; NO se había iniciado install.
Se ejecutó install una vez tras su continuación: StoppedNeedsReview,
InstallIntent/installStatus3, modelo/FW correctos, catálogo14/ownIDausente,
6frames/226B TX,0partes MASS, registeredVerifiedfalse. Cierre/socket y worker
confirmados/exit0. NO payload instalado ni arranques. GateJSgeneral+Ultimate
y C#Retail cerrados y worker reconstruido. Journal privado ultimate-r374.jsonl
Uncertain intacto. No retry autorizado, tampoco si0partes.

Estado3 ya trazado en docs/static-id-physical-result-r175.md a recurso MiFitness
face_hint_storage_low (campo5→callback3→recurso). No byteslibres/cupo exacto
ni prueba de límite13MB/RAM. Se pidió al usuario liberar espacio conservando
DoomMenu/DoomLauncher/habitual; se espera su respuesta. No PCdelete/SET ni
consulta posterior. Al confirmar espacio: preparar plan/guard/journal de un
eventual reintento separado, sin reutilizar aprobación R374. Dos ensayos
manuales no proceden hasta que haya instalación real. No cambiar el payload
innecesariamente. No registrar detalles triviales de borrados en commits.

## Preparación local completada antes del intento

Tras «ok, entiendo» se completó la preparación local autorizada de Ultimate.
Paquete privado13090600B/65recursos, SHA256
dfd89cd54542142a3cddb5dd444f6553fbd648b6e9d7dd1140f9b67b464ad8ca.
Main27335B SHA4092c1be9759fc647917cc6821c1c19ae049d4956afd6a2aab925f3a539ad9ca.
tools/doom-ultimate-r374.mjs configura paths/CRC/bancos propios ID365220001.
Preview marco ámbar y4barras verticales. UI exacta+parse completos pasan;
23casos store/CRC/RAM, sharewarebank rechazado; heldprepare/close con realDoom
pasan. WAD S3 temporal otra vez retirado y módulos/nodos limpios. No repetir
los36mapas ni ciclos sin cambios al C. No audio/FPS físicos nuevos.

tools/package-ultimate-r374.mjs genera el paquete privado ignorado. NO publicar
IWAD. tools/pc-doom-ultimate-r374.mjs plan/prepare/install; gates cerrados.
Nuevo perfil separado session-retail-r374 con RetailPhysicalReviewed=false;
mantener LargePhysicalReviewed=false. C#13.4MB/6632frames/21min; algoritmo
6600partes/20min, supervisor21m15s. Antiguos límites intactos. Paqueteexacto
6405partes2048/3212partes4080. Tests de paquete6alteraciones, envío entero
cifrado por IPC nativo sintético, parcial13.1MB,6rechazos/cortes,4fallos
nativos y perfil antiguo pasan. Regresión IPC anterior10escenarios y C#15499
aserciones pasan. Sin radio/credenciales/journal físico.

Plan docs/doom-ultimate-physical-plan-r374.md: pedir autorización nueva para
UNA instalación inactiva y DOS arranques≤90s. Observación12–18min y batería≥50%.
Sin retry/resume/borrado/selección desdePC, conservar versiones/partidas.
Flash libre no medida: staging/paquete mayor pueden fallar/llenarFS. Guard
RAM7153219/4194320 no se rebaja si rechaza. No recovery integral validado.
Antes de hardware: aprobación explícita de este paquete, abrir SOLO gates
general+Ultimate JS y RetailC#, rebuild y targetvacío→InvalidTarget antes
de privados/journal. Tras único envío cerrar gates/rebuild antes del ensayo.
No aprovechar aprobaciones antiguas consumidas. Resultado ignorado nuevo:
build/doom-audio-r374/package-test.json. Commit local autorizado, no push.

## Preparación del motor y revisión de edición

Usuario dijo «vamos con el1». Se importó WAD Ultimate fijado del ZIP a
tools/local/doom-ultimate/doom.wad (ignorado). No programas del ZIP ni reloj.
Perfil doom/platform-rw4/ultimate-profile-r374.json, ID365220001/DoomUltimate,
módulo rw4ultimate374, path propio doom.wad; 4episodios/36mapas/CRC3205409472.
Builder --ultimate-r374 conserva R372startup, caché672KiB(+128),zona3MiB,
slot192KiB; Cslot/adapter admite4ep y nueva identidad. Fuentes anteriores intactas.
RW4ELF624976B SHA410d7bd578e28112f19b6c2fd1a184a17e7f94bf454ba34cc456fb6f93230cd6.
S3ELF633400B SHA46fb624fa23c6dbee2d04cc9113f37c3327515ca588fb50ca50f98f15e6b97de.
2ciclos producción menú/save/load/titleload/join/unload pasan, cache684809,error0.
36mapas reales arrancan/save/load/cierre, alloc==free/streams0. Maxsave74450B;
maxPeakDynamic3467433B NO RAM total. Gráficos/audio modelados; no playthrough/FPS
RW4. No repetir tests; docs/ultimate-local-r374.md. WAD S3 propio retirado,
guest sin módulos/nodos retenidos. Resultados buildR374/artifactscampaign.

Usuario luego pidió revisar último Descargas: doom_complete.pk3,19.5MBcomprimido,
3279entries/47695663B descomprimidos/173mapas. WadSmoosh + MAPINFO/ZScript,
incluye referencias Doom1/2,Master,TNT,Plutonia,SIGIL. Solo índice/smooshed/mapinfo
leídos, no extracción/ejecución. No compatible directamente con motor actual.
Después pidió «espera...lo más completo y que logre quedar; busca acá el mejor»
en archive.org/download/doom-wads. Se revisó listado sin descargar más contenido;
se detuvo preparación de paquete. Recomendación técnica: Ultimate1.9 local para
Doom1 completo; expansión futura por WADs separados/selector, no PK3GZDoom.

La consulta de edición terminó con «ok, entiendo» y se siguió con Ultimate.
El PK3 sigue fuera de alcance; no cambiar a DoomII/expansiones automáticamente.
No envío autorizado todavía.

# R373: WAD completos aportados e inspeccionados, sin extracción ni ejecución

Usuario pidió revisar los dos ZIP más recientes de Descargas. Cada uno solo
contiene un WAD: Ultimate Doom, The.zip/DOOM.WAD12408292B,36mapas E1M1..E4M9,
2306lumps; Doom II - Hell on Earth (v1.9).zip/DOOM2.WAD14604584B,32mapas,2919lumps.
CRC ZIP/deflate/directorios/registros pasan. IdentidadMD5 coincide referencias
Debian1.9. SHA256/CRC32/pins: docs/retail-iwad-inspection-r373.md. Inspector
tools/inspect-doom-archives-r373.mjs. Nada extraído a disco, ejecutado o enviado.
No pedir que compre/consiga otro WAD: ya están en estos ZIP locales.

DMX con ÚLTIMA entrada por nombre como motor (Ultimate55duplicados anteriores):
Ultimate67efectos684809B útiles; DoomII107/1240277B. Caché557056B: excesos127753
(~125KiB) y683221(~667KiB). Contar todos los DS brutos inflaba Ultimate a122/
1217736B; no usar esa cifra inicial. Falta comprobar caché real y todos los mapas;
rawmapmax E4M9190318B/MAP14204410B no es RAM/FPS. Empezar Ultimate; adaptar perfil
WAD, mapas/save/cache. No reemplazar shareware963 ni tocar partidas anteriores.
Revisión solicitada no autoriza instalar; no hay nuevo ensayo físico aprobado.

# R371/R372: multitáctil stock sin ruta viable; candidato de arranque de audio local

Usuario aceptó plan: viabilidad táctil, audio, WAD completo y entrega conjunta.
Aclaró que aún no tiene WAD completo; preguntó por obtenerlo y por precio.
Se verificó GOG oficial DOOM+DOOMII con originales DOS; compra requiere su cuenta.
No se descargó WAD comercial ni se tocó el reloj. No anotar precios cambiantes
como requisito del build. Esperar copia/ruta antes de validar otros episodios.

R371 inventaría Thumb BL hacia notify0x1c2fec en toda la imagen AP fijada:
0x1dadc0,0x1dccee,0x1de8c8. Las tres rutas construyen npoints=1 e ID0. No hay
puntero absoluto Thumb a notify. Upper puede manejar más, pero no reconstruir
contactos que lower descarta. No es grafo exhaustivo indirecto/tail-call ni
identifica panel activo; no afirmar hardware universalmente single-touch. No
preparar otra prueba de Doom ni prometer dos dedos con la ruta actual. Trabajo
de lower driver sería otro alcance. Usuario rechaza autofire/toggles/latched.
Helper tools/review-rw4-touch-path-r371.mjs, informe rw4-touch-r371-v3 ignorado.

R372 reproduce una carrera del audio anterior: mezcla avanza/cola llena de
silencio durante open; el primer efecto corto se consume y descarta antes de
que el sink lea. No afirmar que sea la única causa física. Nueva variante
local congela mezcla hasta open+4bloques512samples silenciosos(~93ms) y publica
flag atómico; mantiene juego/joins/cierre R369, sin nueva API/hilo/bancoPCM.
No garantiza speaker-ready ni interrumpe llamadas síncronas bloqueadas.
Fuentes aceptadas intactas; generator tools/doom-audio-startup-r372.mjs y nuevo
startup-r372.c/h; builder explícito --startup-r372. Sin instalador/gate/paquete
R372 ni autorización física nueva. No instalar bajo autorización R370 consumida.

RW4 ELF624972B SHA50a55b3f0dfc667b224664365feb6497d45b2ca1acfc2fa5d2037b2644d08176.
S3 ELF633312B SHAa28e773d0264169616308df7162f6eb4e9e4698000ed88e7d758e83d70df2362.
test-audio-startup-r372 pasa baseline-loss+7casos C con scheduling/serviciofake,
64muestras iniciales exactas; compila RW4, no audio real. Primer intento tuvo
THM_CALL intrafichero; -ffunction-sections como el test de PCM existente deja
soloABS32. No se cargó ese primer ELF rechazado por el gate de relocación.
test-doom-menu-r370 --startup-r372 pasa dos ciclos con Doom/hilos reales,
título/NEWGAME/E1M1/spawn/save/load/titleload/pausa/join/unload; PCM931/938,
nonzero122/121,cache532927,error0, gráficos/audio modelados. No repetir tests.
Siguiente: si se prepara payload, pinnear nuevas fuentes/ELF, adaptar paquete
y probar recuperación bloqueada/UI exacta antes de pedir aprobación concreta.
WAD completo requiere adaptar identidad/maps/cacheFX/save y probar con archivo
real; no prometer compatibilidad basada en shareware. Gates físicos cerrados.
Detalle: docs/touch-path-and-audio-startup-r371-r372.md. No push/CI/auditorías.

# R370: menú y carga confirmados físicamente

Ampliación del mismo ensayo: usuario confirma «todo todo ok», menú/carga y
cambio de esfera; solo puede elegir un capítulo. Reporta pérdida del primer
efecto: el audio se oye después de que ya haya ocurrido un sonido; posible lag
de audio percibido, sin medida. No declarar audio resuelto ni hacer otro envío.
Inspección local del directorio del WAD fijado4196020B enumera únicamente
E1M1..E1M9. M_Episode upstream rechaza episodios>1 cuando gamemode=shareware:
limitación del contenido instalado, no prueba de que empiece en otro mapa.
La posición percibida por el usuario sigue sin comparación visual exacta.
Audio: sink abre/prepara/start en hilo propio sin confirmación de reproducción;
SPSC4bloques descarta/avanza mezcla si se llena. Estos son posibles puntos para
investigar al arranque, no causa física demostrada. No añadir replay/autofire ni
presentar silencio de calentamiento como corrección sin medir su efecto real.

Respuesta del usuario al ensayo: «todo se vio bien. cargó bien, si se vio el
menú. cambié esfera y toto». Resultado general positivo; confirma menú visible,
carga y cambio de esfera sin problema reportado. No solicitar cifras ni otra
confirmación de menús/corona. No atribuir a esta respuesta mediciones de audio,
coordenadas del spawn, duración o estados CLOSED de cada ciclo no detallados.
DoomMenu es la versión actual con menú; conservar DoomLauncher como portador
del WAD y DoomReady como respaldo estable. Las partidas de otras versiones
siguen en sus carpetas propias, sin migración. No nuevo envío autorizado.

Usuario autorizó UNA instalación y DOS arranques condicionados<=60s, batería>=50%
y observando. Envío terminado RegisteredInactive, registeredVerified=true,
installStatus=0, MD5ecoOK,330partes,resume0,338frames,680080B transmitidos.
closeConfirmed/workerExitConfirmed=true, exit0. contentVerified=false (sin
readback). Sin selección ni START automático. Main/Menu JS y Large C# cerrados;
transporte recompilado con physicalEnabled=false. No reintento ni nuevo envío.
Ensayo entregado y respuesta recibida arriba. No repetir aprobación ni tests.

Usuario aclara que faltan título/menú y percibe otro nivel/posición con muertos.
No considerar su percepción resuelta solo por tests S3; R367/R369 verificaban
spawn original solo en emulador. R370 elimina -warp Y -skill (ambos autostart),
abre TITLEPIC, flechas/OK/ATRÁS y botón MENU64; mantiene título sin demoattract.
NEW GAME original/episodio/dificultad. Keyrelease conserva tecla traducida para
no soltar FIRE tras confirmar Enter. SAVE/LOAD del menú remiten a PAUSA portable;
CARGAR desde título probado, GUARDAR oculto fuera de nivel. Música no añadida.
Sound/render/cleanup R369 conservados; no afirmar resuelto inicio tardío audio.

DoomMenu936 rw4menu370 preview4líneasverdes, paquete673488B64recursos,
build/doom-audio-r370/package/DoomMenu-id-only.face,
SHAf95a8d3bf5882aa5d7af5dca089a0ecd8841546df876d6f8da36685a8f3bf4a8.
ELF624260 SHAe7ff2e2871a4ab394886a80a6c399581eaf7c22faddbb1c87e54e3d9178b9719.
LuaSHAcf2100ceb032feda8f3c1cf1b5c52bc881cbc4bda9450e9f3c0e42f0906c0f5d.
Controlv8/snapshot72. NuevoCmenu-input-r370 y generadoresdoom-menu*. Builder
build-doom-audio-r362 {rw4|s3-model} --menu-r370. Tests reales2ciclos+titleload,
QUIT original, UI exactamock,controller7cases,paquete/tamper/parse/gateoffline.
Gráficos/audio modelados en tests; resultado físico general positivo arriba.
Cuerpo m_menu upstream generado conserva
licencia; redirige solo Save/Load al mensaje PAUSA, sin DOSfiles/noautocarga.

Plan aprobado docs/doom-menu-physical-plan-r370.md: UNAinstalación
inactiva+DOSarranques<=60s>=50bateríaobservando, primero título/newgame/episodio1/
skill/primer mapa/controles/FX/guardar/salir; segundo solo todoOK, título/PAUSA/
CARGAR/SEGUIR/SALIR. ConservarVoice937+Ready940+carrier963; bancos936 propios.
No reinicio/retry/resume/WAD/borrado/autoselección. Instalación ya consumida;
Journalmenu-r370.jsonl. CLI con flag explícito eligió perfil/pin/gate/ID Menu.

TestsS3inicialesfallaron porarnés: dosprocesosLua cambianowner, se hizo snapshot
y resetguest soloemulador; luego unproceso45s acotado. Restos/modelos retirados.
La transiciónmelt necesita present Timer antes de medirinput. Resultadofinal
twoCyclesJoinedAndUnloaded/originalPlayer1SpawnBothCycles/loadDirectlyFromTitle
true, PCMnozero/error0. No repetir tests aprobados ni CI/auditorías/push.

# R369: efectos de sonido confirmados físicamente; dos pruebas correctas

Usuario confirmó en DoomVoice disparos, respiraciones y muerte del monstruo,
CLOSED, PCM SFX=646 y AUDIO ERR=0. Probó dos veces sin problema y pudo volver
normalmente. No reportó nueva imagen retenida. Sonido físico logrado para estos
ensayos; no ampliar esta evidencia a sesión larga/campaña completa con audio.

Observación pendiente: no oyó audio antes de abrir la primera puerta. Después
sí hubo efectos. No hay tiempos ni secuencia suficiente para distinguir demora,
buffering o cuándo se solicitaron los efectos: no declararlo normal ni resuelto.
No pedir otra prueba ahora. Próximo trabajo local: revisar arranque/latencia del
audio conservando el render y cierre aceptados; cualquier payload nuevo requiere
su aprobación concreta. Gates main/Voice/Large cerrados. No reenviar ni reabrir
R365/R367. No tests repetidos, push, CI ni auditorías generales.

# R369 instalación autorizada ejecutada; historial

Usuario autorizó UNA instalación y DOS arranques condicionados<=30s, puede
observar/batería>=50%. Envío terminado RegisteredInactive, registeredVerifiedtrue,
installStatus0, MD5ecoOK,329partes,resume0, closeConfirmed/workerExitConfirmedtrue,
exit0. No selección/START automático. contentVerifiedfalse (sin readback).
Main/VoiceJS y LargeC# false restaurados; transporte cerrado recompilado.

Dar/esperar manual DoomVoice (NO DoomAudio/Sound), CINCO barras AMARILLAS.
READY->START1, CHECKINGdespierto, disparo/puerta, PAUSA2s/SEGUIR, SALIR<=30s.
Recoger sonido/CLOSED/AUDIOERR/PCM; si falla MODEhasta CALL/AUDIOEND/IMAGEON,
sin repetirSTART/reabrir. Segundo solo sonido+CLOSED+ERR0: STARTcorto, cambiar
esfera desdeAjustes, volverDoomVoice comprobar CLOSED sin otra partida.
Si overlaymenús reaparece, reiniciar y dejarhabitual. No más envío autorizado.
No pedir menús/corona si no reportaproblema. No push/CI/auditorías extras.

# R369 preparado y aprobado después; historial técnico

R367 físico falló: silencio, AUDIOERR0/PCM0/CACHE532927, error al cambiar esfera
y al SALIR tras reinicio, imagen persistente sobre menús. Usuario confirmó reloj
normal tras reinicio dejando esfera habitual sin abrir Doom. No repetir Audio938
ni Sound939. DoomReady940 sigue como versión jugable aceptada, carrier963.

Correcciones locales R368/R369: juego deja de esperar audio para FINISHED/join;
op10 retira Image/listener en UI con fences, SIN liberar buffers/código ni exigir
join. GC conserva op4 solo atomics. op5 retira descriptores tras join real juego,
pero solo marca joined/unload tras quiet+join audio. Errores gráficos persistentes
admiten retirada visual, no borrado del error ni unload. Controller nuevo versión7,
50ticks (~2s nominal) espera cierre audio; ERROR/cuarentena si sigue pendiente.
No timeout que cancele llamada nativa. No garantía física de cleanup aún.

Hallazgo importante: vela_audio.bin del stock fijado, SHA6e0dd7d67bfdf9c6ed6dc31b7b8a777c84d88d0d5ee992316c062b6ba3e2228c.
Inspección privada artifacts/research/audio-server-r368, nunca ejecutar/publicar.
SET_OPTIONS3 tbb a f2bf6 usa ':'/ '='; antes opcionesconcomas hacían formatentero
inválido. Preparación rechaza formato antes de abrir/conectar pipe. Tabla real
mp3/ogg/s16le/silk/wav (silk descriptorRAM). R369 envía opcionesconcolon.
Esta vía explica hangprepare, pero R367 no capturó llamada actual; no afirmar
única causa ni audio logrado. Nuevo snapshot UI: s45 Image, s46 hook, s47 quiet,
s48 CALL (0idle,1validate,2focus,3open,4prepare,5start,6pause,7write,8stop,9close,10abandon).

DoomVoice ID365219937 rw4voice369, preview CINCO barras amarillas. Paquete
build/doom-audio-r369/package/DoomVoice-id-only.face 672372B,61resources,
SHAdca5c7cdb2c21da337275e85841b54286b56d10e267fe35d403d7a28d1ecc348.
ELF624456 SHA4b1c28d3ad1886ab2c16e359539f0ac4936476df8f3d1df19fecf39657fda690.
LuaSHAd12ba5b1124c8f2e3fed2f7ad79bed76437de0ecdccf4160812c6d959660d52b.
docs/doom-voice-physical-plan-r369.md pide UNAinstalacióninactiva+DOSarranques<=30s,
observación/batería>=50/audioaudible. Segundo solo sonido+CLOSED+ERR0: cambiar
esfera desde juego y volver para comprobar CLOSED. No guardar/cargar extra ni
reinicioprevio/retry/resume/WAD/borrado/autoselección. Aprobación aún pendiente.

Gates main/Voice y C#Large false. CLI pc-doom-voice-r369 prepare offline listo,
journalvoice-r369.jsonl independiente probado fakekeys; compiledLarge cerrado.
Tras aprobación específica no pedirotra: abrirC#Large/build/checkInvalidTarget,
JSmain+Voice, instalaruna vez, cerrarJS/C# y buildclosed. NadafísicoenR368/R369.

Tests R369: contractservidor,compileRW4,2ciclosmotorreal+save/load+PCM+join/unload,
S3hold prepare/close (imagen retirada antesgamejoin, unloadrechazado hasta release),
mediafaults,7controllercases,26rendercasesinclbaseline,package61/tamper5/Luaparse.
S3 audio/graphics modelados, no reproducciónreal. No repetir unchanged tests,
CI/Gitaudits/push. Nuevos C/h y tools están locales; commit propio sin privados.

# R367 instalado inactivo; esperar primer ensayo físico de direcciones corregidas

Usuario autorizó instalación+2ensayos<=60s,>=50%batería,podíaobservar.
Se abrieronLargeC#yJSmain+Audio,buildypruebaInvalidTargetsinBTprevios; CLI
pc-doom-audio-r367 install terminó RegisteredInactive/registeredVerifiedtrue,
installStatus0,MD5ecoOK,resume0,328partes; closeConfirmed,workerExitConfirmedtrue,
exit0. No activación/START automático. Contenido no leído de vuelta: verificación
ELF/WAD al START. Journal propio audio-r367.jsonl. No más envíos autorizados.
RestauradosLargeC#=false,JSmain/Audio=false y recompilado transporte cerrado.

Dar/esperarensayoDoomAudio(noDoomSound),CUATROBARRASAMARILLAS,READY->START1,
disparo/USARpuerta/pausa2s/resume/save-load/EXIT<=60s. AudioERR/PCM SFX/CACHE.
Solo consonido+CLOSED+ERR0,segundoSTARTcorto+EXIT. Si silencio/error/noCLOSED,
no repetiry recogerestadoycifras. No re-pedirmenús/corona salvo reporte.
Sonido RW4 todavía no validado. Base ahora0c100000; erroresetapa1xxx..9xxx.

# R367 preparado; Sound físico sin audio y causa de direcciones localizada

Usuario probóR365:todoOKsinsonido,AUDIOERR22,PCM0,CACHE532927; segundoensayo
NOautorizadopracticamenteporcondiciónaudioOK, no repetir. DiceSTARTsinCARGAR
apareceenunladoycadáveres. ScriptsverificaronWAD:15decorcadáveresE1M1,
spawnP1(1056,-3616,90°). DosciclosS3realconfirmaronexactospawn,50ammo100health
sinautoload,inclusodespuésdesave/loadanterior. Físicocoordenadasnocapturadas.

Error propio:audio-bindings-r363 usabaoffset+1bff187c(aliasinspección) envezde
0c100000delcontratofirmware-bindings.lock. R367leeese lock,validapinnedAP,
contrasta4bindingslegacy y punteroabsolutoAP4e0188=c5df909. Fingerprintsconservados.
Código22anteriorconsistenteguardFPperoetapanoestabareportada. Nuevoscódigos
1xxxvalidación(1001..9pin),2xxxfoco,3xxxopen,4xxxprepare,5xxxstart,6xxxpause,
7xxxwrite(7104partial),8xxxclose,9xxxabandon. Cierreconservaprimererror.

NuevoDoomAudio ID365219938,rw4audio367,previewCUATROBARRASAMARILLAS.
build/doom-audio-r367/package/DoomAudio-id-only.face,669980B,58recursos.
SHA1b7887eddc2a609460fb521a29c7f8a57476c0c301bc9cf261286fa5fdb38f05.
ELF623320SHA3a7726ae20173d89623ef03aa144181b3e2e0e3a99181ad9d731cf3895d05730.
docs/doom-audio-physical-plan-r367.md concreto,listoparaUNAaprobación nueva
instalacióninactiva+2STARTmanualhasta60s,>=50batería,observación,volumenaudible.
Si llegaaprobaciónNO volverapreguntar. No aprobado aún. No envío/arranqueR367.

Gatesmain+PHYSICAL_AUDIO_R367_REVIEWED+LargePhysicalReviewed=false. CLI
pc-doom-audio-r367.mjs comprueba dispatchcon targetvacío antesdeauth/journal;
prepareofflineOK,instalacióncerrada. Journalindependienteaudio-r367.jsonlprobado
conclave/identidadfalsa. No retry/resumeparaR367. TrasaprobaciónabrirC#Large,
build,abrirJSmain+Audio(noSound/controlretry),installUNAvez,cerrartodo+build.
ConRegisteredInactive darprimerensayoSTARTsonido/puerta/pausa/save/load/EXIT,
soloaudioOK+CLOSED+ERR0segundo. Mismoscontroles/render/zonade3MB/caché55efectos.
Conserva940/963/939ybancos;R367propios938sinmigración. NoC/WAD/frameflashnuevos
fuera delnuevoELF/paquetecandidato. Serviciofísicoaúnsinprobar,cooperativecleanup.

ValidadoCfaultsconetapasexactas(build/audio-media-r367),2ciclosDoomrealS3
originalPlayer1SpawnBothCycles=true,cache532927,PCMnonzero,error0,save/load,
pause/join/unload. CompileRW4,generaciónbindingscontratada,paquete58resources,
tamper5,Luaexactaparse,CLIoffline/gateclosed,journalpropio. No repetir9mapas
(mismazona/engineR365),auditoríasGit,CI/push. Sonidonogarantizadohastaoírreloj.

# R366 instalado inactivo; esperar dos ensayos manuales ya autorizados

Usuario autorizó UNreintento+mismos2arranques, batería>=50 ypuedeobservar.
Instalación terminó RegisteredInactive,registeredVerified=true,installStatus0,
md5EchoMatches=true,resume0,328partes,closeConfirmed yworkerExitConfirmed=true,
exit0. Noactivarautomático. Contenidoenflashnoleídodevuelta(contentVerifiedfalse),
Lua/CdebenverificaralSTART. No más envíos ni reintentos autorizados/necesarios.

Antesdelaconexión hubo otrolocalDoomJournalRefused: historial tenía
Created/Uncertain/Uncertain por doblecleanup, testsolocubríaunamarca. Corregido
soloSoundattempt1,1o2Uncertain,todoshistorialbefore=null/upload=null; testreproduce
doblemarca yrechazatercerintento. Esa negativa noappendiniciótransferencia.
Después hubo UNatransferencia real aprobada yseconfirmócorrecta.

Restaurados main/Sound/controlretryJS=false, LargePhysicalReviewedC#=false y
recompiladoexenativocerrado. NOrehabilitar ni instalar nada al recibirresultado.
Dar/esperarinstrucciones manuales: seleccionarDoomSound(preview3barrasamarillas),
START1,probarsonidodisparo/puerta,pause2s/resume,guardar/cargar,EXIT<=60s.
Solo conaudioOK,CLOSEDyAUDIOERR0,segundoSTARTcorto+EXIT. MODE3paginas
(rendimiento,GPU,audio). Recoger AUDIOERR/PCM SFX/CACHE(532927) si falla/silencio.
No pedirmenús/corona si usuario nodiceproblema. Anteerror no repetir/reabrir.
Falta oírsonido real y confirmarreutilización física; no afirmarlo logrado aún.

# R366: R365 aprobado pero no instalado; reintento local preparado

El usuario aprobó instalación+2arranques R365. No hubo transmisión ni consultas.
Proceso1falló BeforeConnection/DoomJournalRefused por faltar filename nuevo;
corregido sound-r365.jsonl. Proceso2 creó Created/Uncertain pero C# LargePhysicalReviewed
estaba false, retornó GateClosed/exit2 antesdeRunNative/conexión. Report tx0,
sentFrames0,massParts0,before=null,upload=null. NO seleccionar DoomSound aún.

Se preparó docs/doom-sound-local-retry-r366.md y CLI retry-local, journal solo
permite Soundattempt1Created/Uncertain/before=null/uploadtodosnull ->attempt2.
Tercerareentrada rechazada; noafectaotroskinds. Test-sound-journal-r365 pasócon
identidadclavefalsas. PruebaC#temporalLarge=true/build/test-large-native-gate-r365
con targetvacío pasóE:InvalidTarget sinBT. RestauradoLarge=falseybuildcerrado.
Main/Sound/controlretry JS todosfalse. Auth/MAC seleyeronensendpathpero jamás
seimprimieron. No archivospreviosborrados/renombrados.

Pedirautorización UNreintento delmismopaquete+2ensayos porqueR365prohibíaretry;
si llega, NO pedirdenuevo. Abrir Probe.cs LargePhysicalReviewed=true, build,
test-large-native-gate-r365 sinBT; luego JSmain+Sound+controlretry=true;
node tools/pc-doom-sound-r365.mjs retry-local UNAvez. Cerrar3JSyLargeC#ybuild
despuésdelresultado, tambiénenfallo. Noautorreintentos. PaqueteintactoSHA26fd...ad6.
Conregistroinactivoconfirmado, darinstruccionesmanualesR365(2cicloshasta60s).
No nuevaspruebasPCM/juego/auditoríasGit/push necesarios. Conserva940+963.

# R365: DoomSound integrado y empaquetado; pendiente aprobación física específica

Usuario pidió continuar hasta lograr sonido y volver a montar en reloj. Se completó
trabajo local, aún sin prueba ni transferencia física. Pedir una única aprobación
concreta del plan docs/doom-sound-physical-plan-r365.md. NO volver a pedirla si
ya llega respuesta autorizando este paquete/ensayo. No exigir reinicio previo.

DoomSound ID365219939, rw4sound365, 669676 B, 58 recursos, 328 partes.
build/doom-audio-r365/package/DoomSound-id-only.face, SHA
26fd403d01e2ac79120d2102bd49ca7f3272a61ff05a24ee623fbc7137235ad6.
ELF623096 SHA cf52c9d8b31570bfb90ae28d6ea950c90932ce223f166be8eba6d4462dd48dc4.
Preview tres barras amarillas. Conserva DoomReady940 y carrier963, sin WAD nuevo.
No importar/escribir saves de940, bancos propios939. Controles/render igualReady.
MODE ahora3paginas: rendimiento, GPU, audio(AUDIO ERR=s64,PCM SFX=s62,CACHE=s63).

Audio código nuevo doom/platform-rw4/audio/{doom-sfx,doom-module,sink-worker,
media-sink,media-model}, pipeline4voicesS16/22050; 544KiBcache532927 muestras de55
efectos, aliasescomparten; SPSC4*512samples (~93ms máximo PCM encola), noflash.
Motor3MiBcompensaestaticos/stack; runtimepeak3438257+nativo/stack/servicio.
Servicio físico no ejecutado: media-sink usaFocusMusic,playerMusic/prepareoptions
format=s16le,sample_rate=22050,channels=1. Foco callback atomic sinreentrada,
worker pausa/silencia/duck; STOP+CLOSE+abandon. Cierre sinack nofinished=no
unload; gameworker espera audio, puede quedarse sinCLOSED y requerirreinicio.
No deadline/cancelación demostrados paraRPC/socket; explicitar al aprobar.

ROMFSAPbase1298360,size13776 validado checksum, configrealprivada enartifacts
audio-romfs-r362/audio-policy-r362: ruta graphpcm2p/48000, Music=>InMusic,
políticas speaker/A2DP/SCO, matrizprioridad12escenarios. No publicar configraw.
focus-table4df334/4df53c/4df5f8 callbacks síncronos bajo lock de foco; abandon
borraentrada. NuevasbindingsAP9funcs generadaslocal/fingerprints64B.

Pasó: C adapterfaults(r364), dosciclosDoomrealconserviciomodeladoR365,
9mapasstart/save/load/salidaR365, compileRW4, paquete58recursos/tamper5,
parseLuaexactaenVM, CLIinstallgateclosedyofflineprepare. No repetir sin cambios.
Build scripts tools/build-doom-audio-r362.mjs (outputR365), test-doom-audio-r362,
test-ready-campaign-r351 --audio-r365,package-doom-sound-r365,test-doom-sound-package.
R362/R363/R364 outputs retenidosprivadoscomoiteraciones, productoúnicoR365.

tools/pc-doom-sound-r365.mjs prepare listo. install cerrado. Gates
PHYSICAL_DEPLOYMENT_REVIEWED=false y PHYSICAL_SOUND_R365_REVIEWED=false en
doom-deployment-physical.mjs. Abrirsoloestos tras aprobación, instalarUNAvez,
cerrarlos después, nuncaAUTOretry/resume. Noauth/MAC leídosenturno.
No push ni auditoríasGitglobales. Usuario asume menús/corona normales si nodice.

# R361: ABI de foco antigua y creación de socket fijadas

docs/audio-focus-r361.md; focus-contract-r361.json no llamable.
review-rw4-audio-lifecycle-r359 --focus-r361 genera 3 ventanas privadas existentes.
review-audio-focus-r361 --check verifica contrato/6 instrucciones/literal/AP.
focus_request4e19bc args initial*,scenario,callback,cookie, retorno token entero
(id<<16)|15, si initial==1 suma8 al id. No heap pointer. abandon4e1f94 signed>14,
ASR16, tabla bajo lock. Falta quiescencia callback y funciones tabla.
Config literal /etc/media//media_focus.conf, contenido/escenario no recuperado.
proxy_connect4e14e8 alloc44, socket(domain ap=1/otro65,type1,proto0), connect,
initlock+20; sin setsockopt/nonblock explícitos. create498780 contempla tipo0x800,
caller no lo pasa. connect48e45c indirecto ops+28, falta implementación inferior.
Siguiente: métodos local/remoto y config media, sin payload físico todavía.
No repetir tests PCM/guard sin cambios. DoomReady intacto; crédito contenido.

# R360: guard C probado; proxy síncrono todavía sin plazo demostrado

Continuar sonido local sin alterar DoomReady ni instalar en reloj. No autorización
física nueva. docs/audio-transport-r360.md contiene evidencia/límites.
transport-guard.h/.c: propietario único, tokens, una operación pendiente,
orden de etapas, escrituras completas, pausa entregas, timeout persistente,
retención ante cierre ambiguo, no segundo CLOSE. Adaptador aún no implementado.
test-audio-transport-r360.mjs pasó C real S3 y compilación RW4, dos ciclos y fallos.
build/audio-transport-r360/result.json; módulo retirado, lsmod igual, fichero propio borrado.
review-rw4-audio-lifecycle-r359.mjs --proxy-r360 produjo 3 ventanas privadas.
4e15d8 lock+20 -> 4e10c8 send-loop flags0 -> 4e1108 recv-loop flags0 -> unlock.
send cero no avanza; recv cero=-32. No deadline/poll visible aquí; posible timeout
configurado en otra parte todavía sin revisar. Un worker no cancela llamada.
Siguiente: creación/configuración socket (proxy-open y connect) y foco genérico
4e1948/4e19bc, sin usar wrapper teléfono. No hardware listo, no repetir tests
sin cambios ni auditorías Git/CI/push. Mantener uso de créditos contenido.

# R359: transporte media gestionado elegido; esperas/foco pendientes

Usuario"ok" continua sonido local. docs/audio-lifecycle-r359.md contiene resultado.
BESpause/resume1f8648/1f862c solo log+return0; no asumir pausa/silencio deDMA.
NxplayerSTOP sigue devoluciones; FreeBuffer/UnregisterMQ/Release/close despues.
MediaRW4 write4e0378 exige envio completo, parcial>=0 fuerza104/closefd20=0;
negativo tambiencierra, difiere upstreamactual EINTR. get_socket4e0420 no cede
ownership. prepare4e0194 esperaaccept; close4e00b0 puede fallarRPC/proxydisconnect
antes de liberar. No descargar/reenviar/repetirclose ciegamente anteambiguedad.
Preferir media gestionado, no DMA/HAL directo. 8candidatos conhuellas64B en
doom/platform-rw4/audio/managed-candidates-r359.json,callable:false/no autorizacion.
Herramientas review-rw4-audio-lifecycle-r359 + review-audio-managed-candidates-r359.
Falta revisar proxy/tiemposespera y scenario/focus. Wrapper audio_focus_request
del telefono no usar comoAPIgenerica. Siguiente transporteC con doblefallos
solo trascontrato; no payload/testfisico listo. MezcladorCsin cambios, no rerun.
Sin instalar/radio/reboot/push. No preguntar alusuario por pruebamanual aun.

# R358: PCM localizado; mezcladorC probado en S3; driver aun no cerrado

Usuario "ok sigamos" autoriza trabajo local para sonido0.2, no payloadfisico.
APpinned scan507strings; nxplayer/audioUpper/BES-RPMsg/media-focus presentes.
docs/audio-contract-r358.md separa hechos/inferencia: upperioctl0x1001..0x100f,
caps16B/MQ8B; stockraw usa pcm2p/mono/S16/48000 pero no prueba rutaaltavoz.
Falta arbitraje/foco, formato real y ownership/STOP-dequeue-close completo.
No enlazar direccionesdriver ni copiar ABI actualOpenVela. No ensayo listo aun.
Core doom/platform-rw4/audio/pcm-core.c+h:GPL2only,4vocesmono,DMX,remuestreoentero,
S16saturado,estado104B ARM32/bloque<=1024B caller-owned,sinheap/drivers/threads.
RW4obj text490,data0,bss0. No cache/transporte/driver incluidos en esas cifras.
tools/test-audio-core-r358.mjs compilaRW4 y ejecuta S3CortexA7 sinlibgcc/imports;
vectores a4frecuencias coinciden Node, pausa/stop/bounds pasan. Init pasa, unload
y lsmod igualbefore. Resultado build/audio-core-r358-cortex-a7/result.json.
IntentoS3previo conlibgcc rechazo loader; copia fallida propia retirada porhash,
sin reset ni modulo retenido. Artefactos compilacion previos conservados locales.
NoWAD/PCM/deviceaudio en modulo sintentico. Sin nuevo paquete ni cambioDoomReady.
Inspeccion reproducible tools/review-rw4-audio{,-code}-r358.mjs, salidasignoradas.
Proximo: cerrar ruta salida/foco/ownership antes de backend DG_sound_module y
ensayo combinado; usuario quiere avanzar sin muchas esferas/tandas pequenas.

# R357: licencia predeterminada GPL-2.0-only elegida por usuario

Usuario eligio "esa" tras explicacion de GPL-2.0-only. LICENSE contiene textoGPL2
verbatim verificado contra blob upstream; LICENSING.md define default para codigo
propio sin aviso distinto. SPDX GPL-2.0-or-later ya existentes se conservan,
tambien dependencias/derechos previamente otorgados. No estrechar esos archivos
ni alterar sus hashes/buildpins. README/guia actualizados. Sin cambio al juego,
paquete instalado o gates. Eleccion de licencia ya resuelta; no volver a preguntar.

# R356: entrega publica preparada y prototipo de efectos en PC

Usuario autoriza preparacionGitHub local y avanzar0.2, con gastoacotado. No push.
Guia docs/getting-started.md y notas docs/releases/v0.1.0.md listas; explican
buildincremental y falta segundo propietario, no fingir instalador universal.
Licencia general propia preguntada entonces; resuelta en R357 como GPL-2.0-only.
SPDX de archivos/dependencias se conserva individualmente.
Doctor tools/check-release-prerequisites.mjs verifica181blobs y entradas fijadas,
sin auth/MAC/logs;4escenarios pasan, cleanCheckoutBuildSupported=false explicito.
AudioPC tools/audio-reference-r356.mjs:DMX+4canalesmono/22050/S16/bloques<=512;
tests de bounds/resample/clip/pausa/stop/continuidad pasan. Preview WAD exacto:
55efectos,11025/22050Hz,max18560muestras. WAVprivado generado,no escuchado ni
subido. No integracion C/audiofisico/medicion rendimiento del reloj.
Siguiente paso acotado docs/next-version.md: identificar salida PCM en AP fijado,
portar backendC solo si contrato utilizable;musica/multitouch fuera. Sin payload.
AuditGitprivacidad corregido a lotes8MiB porque historia109MB excedia buffer96MiB;
362commits/2838blobs/14lotes,sin hallazgos conocidos, alcance limitado detector.
Ningun cambio al juego instalado, firmware, gates o sesionfisica.

# R355: primera version jugable 0.1.0 aceptada

Usuario reporta aproximadamente media hora de juego sin fallos; murio, recupero
partida guardada y salio CLOSED. Aceptacion larga COMPLETADA. No pedir cifras,
repeticiones ni otros ensayos para cerrar. Duracion aproximada, no prueba de
activacion exacta del corte30min ni campana completa. No cambios al juego.
Entrega final build/releases/Doomed-0.1.0/ con mismo paquete R351 fijado porSHA,
guia/manifiesto/sumas actualizados. RC anterior conservada como historica.
Sin instalar/radio/gates/push. DoomReady940+Launcher963; Pads941 respaldo.

# R354: cierre local 0.1.0-rc1; pendiente entonces partida continua 10–15 min

Usuario aprobo cerrar version jugable, paquete/guia y prueba larga sobre DoomReady
ya instalada. Sin nuevo payload ni instalacion. No sonido/multitouch/autofire.
docs/first-playable-release.md contiene instrucciones concretas; helper
tools/stage-playable-release-r354.mjs copia paquete R351 exacto a build/releases/
Doomed-0.1.0-rc1 con allowlist, manifiesto y SHA256SUMS, sin recompilar/radio/gates.
No dar por completada la prueba larga sin reporte. Pedir solo duracionaprox,
fluidez/guardar/cargar/CLOSED; no mas cifras, reset o esferas de diagnostico.
Conservar DoomReady940+Launcher963; Pads941 respaldo. Solo commitlocal, sinpush.

# Estado actual R352: DoomReady probado fisicamente, guardado persistente correcto

DoomPads R350 probado: usuario confirma sinlag/interaccion/pausa/CLOSED correctos.
TIME26809,TICS948,IMAGES273,CERROR0,GPUCODE0,PHASE2. Pidio flechas mayores y
cerrar el proyecto con el mayor avance posible en una entrega; solo trabajo local.
DoomReady940: flechas70x58, renderWide identico, sesiones30min cooperativas,
ELF CRC cache solo contexto/WAD CRC completo enC, mapas1..9, GUARDAR/CARGAR
en PAUSA con dos bancos alternados propios y verificacion. Sin sonido/autosave.
NativeRAMslot196608B, ninguna escrituraFSdesdeC; nodos rw4doomready/rw4doomslot,
protocolo6. FREE6956611/LARGEST4194320, zona4MiB. Slots pertenecen a la esfera.
Close de importacion invalida libera VFS con exito y valid=0 impide LOAD;
prueba CRC negativa detecto/corrigio retencionVFS antes del paquete.
2ciclos engine con11rechazos,10casos controlador y23store/wrapper pasan.
UI final147017ms/4801tics/3384presentaciones y segundo ciclo tras unload,
save persistido y banco corrupto ignorado;14alloc14free,PHASE2,cleanup porhash.
StartupS3 5726/2659ms. Nueve mapas arrancan/guardan/cargan/cerran, no playthrough.
Paquete660896B/55recursos/324partes, SHAfa2146fde2cb9bba9a7637779c747fdbbb24faf62e7b56386c66e575f3ead5c8.
Prepare667078wire,7escenarios paquete pasan,pinPads preservado. Todosgatescerrados.
Plan docs/doom-ready-physical-plan-r351.md. Usuario autorizo UNA instalacion
y DOS arranques observando bateria>=50%. RunnerR352 ejecutado una vez:
RegisteredInactive,324partes offset0,registro confirmado,contenido no releido.
Seleccion no activada por cliente,conexion cerrada,worker exit0,gates restaurados,
helper cerrado reconstruido,5589asserts y7escenarios offline pasan.
Reportes artifacts/doom-ready-physical-r352/. No repetir envio.
Usuario confirma ambos arranques satisfactorios: guardar/cargar con screenmelt,
persistencia tras cambiar de esfera y CLOSED. Ultimo ciclo corto TIME2406ms,
TICS89,IMAGES18,CERROR0,GPUCODE0,PHASE2. No medir primer juego o FPS con eso.
No pedir mas cifras/repeticiones; limite30min y campa?a entera no probados enHW.
R353: usuario pide 2/3 botones realmente sostenidos; rechaza FIREtoggle/autofire
y movimiento retenido. C acepta combinaciones, UI una tecla. Revision offline:
adaptadorChipone emite npoints1/ID0; upperhalf admite muestras variables pero
no demuestra que lowerdriver entregue varios contactos. AP contiene varias
familiasTP; controlador activo/capacidadpanel aun sin identificar. Sin ruta
multitouch verificada, conservar inputDoomReady. No basta cambiar mascarasUI.
Ver docs/touch-feasibility-r353.md y tools/review-rw4-touch-r353.mjs.
Sin payload/modulo/radio/firmwarepatch ni mas pruebas/envios autorizados.
ConservarDoomPads941+Launcher963; sinreboot/borrado/WAD/retry/resume.
README/guia actualizados. Solo commitslocales,no push/CI/no notas de borrado.

# R347: DoomWide validado localmente

Usuario eligio imagen mayor/proporcion y controles redistribuidos; pidio
optimizar antes de esperar otro reporte de lag. DoomWide942, marco NARANJA.
BackendC nuevo aplica zoom306/256 y antialias0 solo en primer src de Image,
propietarioUI. Fuente320x200/buffers512000B/motor/transporte/fences identicos;
baselineELF anterior reproducido porSHA en ambos builds. Imagen~383x239,
todos los pads debajo (y>=252), HUD libre, sin mezcla de botones enareaanimada.
PAUSA grande145x50 ->CONTINUAR y PAUSADO visible; capas dentro contextoLua.
Timer40ms/750ticks y una lectura/tick conservados. Sin escaladoCPU/PNGporframe.
RW4 ELF607116B SHA408caa1de2e6f6c697012be26b0a43645fd502e88b5259d932acff9b6d4a8275;
extraStatic242B, guardFREE6727235/LARGEST4194320. Dos nuevas huellas de setter:
zoom4d420/tabla19a144, antialias4d538/tabla19a150. Solo inspeccion AP fijado.
9casosLua pasan, main parseado; UI S3 final2ciclos111/104presentaciones,
14alloc14free, error0, municion49, teclas0 alpausar; tics ypresentaciones
congelados600ms y retomados134->135/133->135; glifosCONTINUAR/PAUSADO visibles.
Capturas correctas, cleanup restaura source yretira modulo/nodo/temporales.
VM reiniciada antes deensayos sinmodulo propio por UIstock sinrespuesta,
ningun reset para cerrar ciclos. No inferirFPSfisicos deS3.
Paquete646628B/44recursos/317partes SHA275e1aa7383f021af2cbb549ad170991d38f2b25912f99f18bfe59234b8c96b3;
Lua21169B SHAb89ab9b7e473231eaee03762c2e02fcb4003559726f5051a1147a8ef45480a60.
7escenarios paquete y7Touch pasan. Prepare317partes652677wire sinjournal/radio.
Plan docs/doom-wide-physical-plan-r347.md. Instalacion autorizada y completadaR348;
WIDE_R347/DEPLOYMENT/C#Large ypermisosanteriores restaurados/cerrados.
Pendiente UN ensayo<=20s. ConservarTouch943+carrier963;
no reboot/WAD/retry/resume/borrado.
PAUSAesperar2s/CONTINUAR/SALIR; recoger TIME MS/TICS/IMAGES, fluidez. NuevoC
solo cambia Image setup pero requiere aprobacion porregla inicial. Sinpush/CI.

# R346: DoomTouch probado; fluidez buena, revisar PAUSE y layout

Ensayo usuario completado: TIME MS26461,TICS842,IMAGES246,C ERROR0,GPU CODE0,
PHASE2 (=DIRECT_CLOSED). Salida/retorno/menus normales. Usuario describe
"sin lag", muy jugable; reporta PAUSE sin funcionar y espacio inferior sinuso.
Foto confirma viewport320x200 enpartealta y huecoinferior grande.
246/26.461=9.2967presentaciones/s (Direct168/21.818=7.700); ensayos no
controlados, posibles pausas y sensacion subjetiva, no FPS de panel.
No mas tuning pequeno de rendimiento. Preservar esta ruta y C probado.
Pendiente preferencia de layout: ampliar al ancho util manteniendo proporcion
y redistribuir controles, o tamano actual y botones mayores abajo.
PAUSED actualmente oculta status igualquePLAYING y conserva leyendaPAUSE;
falta feedback visual demostrado por codigo, aun sin causa completa del fallo
fisico. Proximo: botonRESUME/indicadorPAUSED visible y verificar tics congelados.
Sin nuevo payload/ensayo fisico autorizado. PaqueteR345 publicado local intacto.

# R346: instalacion inactiva confirmada

Usuario autorizo UNA instalacion y UN ensayo de20s observando bateria>=50%.
RunnerR346 ejecutado una vez: RegisteredInactive,316partes, resume0,
seleccion no activada por cliente, registro confirmado (contenido no releido).
Sesion cerrada, worker exit0; gates restaurados a bytes originales, helper
cerrado reconstruido,5589asserts y7escenarios paquete pasan. No repetir envio.
Reportes sanitizados propios: artifacts/doom-touch-physical-r346/install-result.json
y gates-restored.json. Journaltouch-r345.jsonl creado.
Ensayo manual completado; resultado y observaciones arriba.
Sin segundo ciclo ni reinicio autorizados; asumir salud normal salvo aviso.

# R345: DoomTouch combinado validado localmente

Usuario pide controles transparentes encima del juego y reunir rendimiento en
una sola configuracion. Nuevo DoomTouch943, preview CRUZ CIAN; C identico a
Direct343 (606564B, SHAcb7d0c4c0322c9b1c9c827fb67511705262caf988beb04075c66f9c887a16de3).
Sin PNG por frame; una lectura de estado/tick en vez de dos; PLAYING deduplicado;
timer40ms/750ticks conserva salida cooperativa~30s. Imagen320x200 sin escalado.
Pads35%opacity y glifosRGBA: capa visual en activeScreen trasImageC, hitboxes
dentro del contexto de esfera. Retiro visual/hits en CLOSED/error/pageOnPause.
9casos Lua pasan, incl100ticks/200opens/0updates redundantes. UI S3 real con
main produccion/adaptador S3: dos ciclos, disparo50->49, teclas sueltas alpausar,
14alloc14free, cero error, cierre/join/unload y restauracion del fixture.
No atribuir FPS fisicos ni optimo garantizado; medir una vez frente aDirect.
43recursos empaquetados, nuevo pin/gate/journalTOUCH_R345/touch-r345.jsonl,
sin tocar pins/gates antiguos. Guard cerrado antes de privados; sin radio.
Paquete644560B SHAc686a9b4d5c13ae004a452866939c19539119ecb5cc792b71831c4c303ec1a0c;
Lua20936B SHA6dd2f1a4d5f4e494922fd3996b523ec4dcfba20a3cf3fe2a20c6a9dd796b8d69.
7escenarios de paquete pasan y7del anteriorDirect; prepare316partes650590wire.
Plan: docs/doom-touch-physical-plan-r345.md. Instalacion aprobada y completadaR346.
Pendiente UN ensayo manual<=20s; no reboot/WAD/retry/resume/borrado.
ConservarDirect944+carrier963.
No repetir tests pasados ni checks remotos; commits locales unicamente.

# R344: DoomDirect probado fisicamente, mejora de fluidez

Resultado usuario: TIME MS21818, TICS779, IMAGES168; C ERROR0,
campo GPU reportado como gpumode0, PHASE2 (=DIRECT_CLOSED).
Controles/salida/retorno/menus normales; claramente mas jugable aunque aun lag.
168/21.818=7.700 presentaciones/s frente a139/27.821=4.996 Images/s de
DoomDemand: cocientes de contadores diferentes y ensayos no controlados,
no FPS de panel ni benchmark equivalente. Mejora percibida confirmada;
no techo del hardware demostrado. Sin nuevo ensayo ni envio autorizado.
Actual jugable DoomDirect944, depende del WAD de DoomLauncher963.

Usuario autorizo UNA instalacion y UN ensayo observando bateria>=50%.
Runner R344 ejecutado una vez: RegisteredInactive, catalogo previo13,
314partes escritas, sin resume, seleccion no activada por cliente.
Registro confirmado; contenido instalado no releido (contentVerified:false).
Sesion cerrada y worker exit0. Gates restaurados a sus bytes originales;
helper cerrado reconstruido,5589asserts y7escenarios de paquete pasan.
Reportes privados sanitizados: artifacts/doom-direct-physical-r344/install-result.json
y gates-restored.json. Journal direct-r343.jsonl creado. No repetir envio.
Ensayo manual autorizado completado; resultado arriba.
Sin reboot ni segundo ciclo autorizados; asumir salud normal salvo aviso.

# R343: Doom directo integrado y paquete validado localmente

Doom real usa direct-view-r342 con transporte nuevo direct-transport-r343.c:
copias32bit a dos buffers512000B, una Image C, cero PNG/nodos de frame.
Control /dev/rw4doomdirect, MAGIC0x34445752,256B/v4. Ops1START2INPUT3PAUSE4STOP
5JOIN+cierreImage6RESUME7PRESENT; no frame devuelve exito sin dibujar.
JOIN OS real antes de retirar listener/Image/cache. Uninit bloquea errores,
writer/worker/control pendientes. Sin LVGL en init/uninit/GC/worker.
Build RW4 final606564B SHAcb7d0c4c0322c9b1c9c827fb67511705262caf988beb04075c66f9c887a16de3,
secciones1157094B (+251758B frenteDemand),17huellas graficas/owner mas bindings
previos. Posicion35,35: setters x18a7c/y18ab4 contrastados tablaLua19a68c/19a698.
Backend S3 independiente con DWARF9, nunca ejecutar adaptadorRW4 en VM.
Dos ciclos Doom+pthread reales/modelo grafico:30presentaciones, movimiento,
giro/fire/pausa/resume/backpressure/rechazos6porciclo/STOP/join/cierre/unload.
Dos ciclos con UI real S3:102/101presentaciones,204/202drawEvents,309/306fences;
capturas pausadas64000px RGB565 hash exacto a fuente (159colores) ambas.
Motor pico4486833B,14alloc14free por ciclo. No inferir FPS fisicos del RW4.
VM reiniciada antes del ensayoUI sin modulo cargado por UI sin respuesta;
ensayos finalizaron sin reset. Cleanup confirma Storage activo, UIProbe903
source previo restaurado con readback/hash, modulo/nodo/temporales retirados.
Launcher RW4 de bitmap: sin Image Lua por frame; timer50ms/limite600ticks;
guardFREE6723139/LARGEST4194320 antes de load; CRC ELF/WAD y cache verificada.
TIME MS/TICS/IMAGES trasCLOSED; MODE ->C ERROR/GPU CODE/PHASE cached.
8casos controlador/mock y main parseado;7escenarios transferencia y7R337 pasan.
Paquete DoomDirect ID365219944,SEIS barrasCIAN,640508B/37recursos/314partes,
SHAa0ddd3fce496c88cebb6d3ceea6fef18e8aa54fd65734b5ecf01357baf013bd6.
Lua17931B SHAb06d1927366f0e23afa8e4d5b777a447de7babed4c095eef1206544001191ddb.
WADcarrier963 no duplicado. Runtime actual944+963. Docs/plan: docs/doom-direct-physical-plan-r343.md.
CLI pc-doom-direct-r343.mjs prepare paso314partes646500wire sinjournal/radio;
install rechaza antes de privados con DEPLOYMENT/DIRECT_R343/C#Large cerrados.
Runner artifacts/doom-direct-physical-r344/install-once.ps1 ejecutado tras
aprobacion; resultado R344 arriba. Instrucciones READY/START/EXIT<=20s.
No reboot previo, retry,
resume, activacion/borrado ni segundo ciclo. Asumir salud normal salvo aviso.
Riesgos: listeners/esperaGPU32bit nuevos fisicos; bloqueos/panic/corrupcion sin
recovery integral. Hooks observan nuestras esperas, no errores internos previos
ya consumidos. Estado historico R342 abajo. Solo commits locales/sin push/CI.

# Estado actual R342: bridge directo implementado, C probado; integracion pendiente

Nucleo device/direct-view-r342.[ch] y adaptador direct-rw4-r342.[ch] nuevos.
Una Image, dos buffers320x200x32, un productor con tickets/generaciones,
publicacion atomica, slot visible inmutable y anterior libre tras finish/cache.
Callback registrada solo en Image propia (no reemplazo stock). AP Image dibuja
MAIN21/POST24; finales22/25 llaman finish59678 con resultado antes del void wait
stock. DELETE33 externo invalida puntero y bloquea instancia. Primer error fijo;
no reinicio, reutilizacion ni unload tras fallo. Retira callback antes de delete
normal. Close exige productor salido y join real del integrador; bool no validaOS.
Native valida15huellas, display/parent/ctx y callback; usa offsets RW4, no S3.
build-direct-rw4-r342 compila ARMv8-M Thumb soft,0imports, SIN entry de modulo.
Componente4732B,secciones2304B,SHA779409a9d35b0e589a719756601cd4d566d4bd1b8825ed1a6f27a3886d810e06.
Buffers externos512000B; no presupuesto neto Doom aun. No paquete instalable.
test-direct-view-r342 ejecuta mismo nucleo C en S3 con graficos/scheduler
modelados:20escenarios,329asserts de control+3072000pixeles,2ciclos24frames.
Inyecta fallos de finish inicial/MAIN/POST/present/close, luego stock exitoso:
primer error permanece. Ownership/tickets/join/slots/borrado/fallos host pasan.
Modulo de tests y temporal propios retirados normalmente. Sin UI/LVGL real,
threads reales ni Doom nuevo; no FPS inferidos ni adaptadorRW4 ejecutado.
Limite: callback captura NUESTRAS esperas, no errores internos ya consumidos;
backend/eventos vivos pendientes. No declarar R341 completo fisicamente.
Docs: docs/direct-image-bridge-r342.md. Evidencia build/direct-rw4-r342 y
artifacts/research/direct-view-r342; reviewer review-rw4-events-r342 entry/follow.
Siguiente: integrar productor Doom+join real, posicionar Image y validar dibujo/
retirada real local, presupuesto RAM, luego paquete/plan y aprobacion fisica.
Conservar DoomDemand945+carrier963. Sin Bluetooth, payload fisico, autorizacion
pendiente, push/checks remotos ni housekeeping. Estados previos historicos.

# Estado actual R341: ruta RW4 identificada; errores de espera limitan el cierre

Revision estatica del AP fijado, sin firmware ejecutado, Bluetooth ni payload.
Lua Image confirma create4c740; default41b18/active13bfc; refresh20cb0 tiene
registro independiente41978. Flush1fccc llama drawWait21880: ctx+52. Init55dbc
instala gpuWait55ba0 en el mismo campo; configuracion driver5592c lo selecciona.
gpuWait llama finish59678, registra errores pero los pierde (void). Finish
propaga fe78 -> preparacion/submit/wait; comando kernel5 ->139b2 ->135b8 espera
notificacion con deadline; timeout retorna4. No basta retorno de refresh para
certificar exito. Segundo finish correcto no demuestra ausencia de error previo
consumido por wrapper. Resolver observabilidad antes de validar retirada.
Audit pasa6punteros/8calls Thumb/campos callback/salto kernel contra AP completo.
Herramienta tools/review-rw4-direct-lifetime-r341.mjs modos entry/follow/fence/
finish/contract/wait/audit, cada uno no sobrescribe artifacts/research propios.
Mapa, evidencia y limites: docs/direct-image-rw4-contract-r341.md. Sin trasladar
offsets LVGL9 S3; RW4 driver.draw_ctx96,ctx.wait52. Guard vivo aun sin validar.
Siguiente implementacion local: bridge UI de una Image/dos buffers32bit,
guards errores/lifetime y RAM512000B de fuentes, pruebas de fallos antes de
paquete fisico. No prometer20FPS RW4;5Images/s actual no es techo demostrado.
Conservar DoomDemand945 y carrier963. Sin aprobacion fisica pendiente, sin
push/checks remotos ni housekeeping. R340 y estados anteriores historicos.

# Estado actual R340: imagen persistente real en S3 pasa; RW4 a?n sin payload nuevo

Prototipo C/UI,2fuentes inmutables320x200x32,una Image por ciclo,Timer50ms.
Dos ciclos de59presentaciones/2905y2925ms. Capturas:19,77y16,82cambiosvisibles/s,
96capturas/6144000p?xeles sin mezclas;~1,23/1,20ms set-src+refresh medio S3.
No motor Doom, GPU/RW4 ni FPS f?sicos inferidos. Patrones precalculados.
Crea/cambia/elimina Image en tarea UI desde callback de driver; no LVGL en
init/worker/GC/uninit. Cada refresh y STOP comprueban cola vac?a por offsets
DWARF S3 (display.layer_head672,layer.task_head56,next64);cache retirada y
m?dulo descargado normalmente en ambos ciclos. Buffers vivos hasta entonces.
Readback confirma restauraci?n Lua previo de UIProbe903. Storage seleccionado,
m?dulo/nodo y temporales propios retirados. No reset para terminar el ensayo.
Tipos exactos:lv_image_dsc_t S3=20B;R339 us? contenedor24B con4B padding, no ABI24.
ELF4820B SHA2f471ec48c6367e68d01c1c84f32895e98132ce545ca2b20dc6a7217b25e609e.
Docs/evidencia:docs/direct-image-ui-prototype-r340.md;tools/build-direct-ui-s3-r340.mjs,
tools/direct-ui-s3-r340.mjs(stage/test/cleanup). Resultados artifacts/emulator/
direct-ui-r340-stage/test-result.json.13bindings S3,512000B patrones est?ticos.
Siguiente: contrastar nuevas funciones/contexto UI/formato32bit/fin de dibujo
con AP RW4 y presupuesto RAM. No reutilizar offsets/tipos S3 como firmwareRW4.
R338/DoomDemand f?sico cerrado/controles bien pero~5Images/s; conservar945+carrier963.
Sin paquete, Bluetooth ni prueba f?sica nuevos. No autorizaci?n f?sica pendiente.
Sin push/checks remotos/housekeeping. Estados anteriores hist?ricos.

# Estado actual R339: evaluaci?n de imagen directa, sin payload f?sico nuevo

R338/DoomDemand: CLOSED, controles/navegaci?n normales; mejora percibida pero lag.
TIME27821ms/TICS981/IMAGES139;FIRST/LAST0,DIMS320x200. ~5Images/s/~35tics/s.
R339 prueba local: S3 decoder acepta descriptor XRGB8888 reutilizado320x200;
31checks,12open/close/drop:directo300us vs archivoPNG26000us agregados. No Image,
GPU/p?xeles/FPS medidos. No prometer87x de FPS ni extrapolar timings al RW4.
AP RW4 variable-open24c04 usa data_ptr+8 directo para cf4/5/6 (32bit); cf18
RGB565 va a error24c52. Lua set_src pasa string/userdata pointer; invalidate
aparece en tabla. Canvas/set_buffer no demostrados como API Lua utilizable.
Decisi?n: prototipo PC de Image persistente y buffers32bit inmutables. Requiere
p?xeles completos, presentaci?n medida y ownership/retirada/backend terminados
antes de hardware. Sincronizaci?n GPU RW4 sigue sin cerrar; no liberar por un
Timer o retorno de set_src. No hay prueba de techo f?sico5FPS. No otro PNG
como sustituto. Plan/criterios/evidencia: docs/direct-render-feasibility-r339.md.
No paquete, gate, Bluetooth, instalaci?n ni ensayo f?sico nuevos autorizados.
Herramientas review-rw4-direct-render-r339.mjs y test-direct-decoder-r339.mjs.
Resultados ignorados artifacts/research/direct-render-r339 y direct-decoder-r339.
Conservar DoomLauncher963 y DoomDemand945; DoomPalette947 respaldo opcional.
Sin push/checks remotos ni housekeeping. Estados anteriores hist?ricos.

# Estado actual R337: DoomDemand preparado, pendiente de aprobaci?n f?sica

R336/DoomBench termin? CLOSED, navegaci?n normal. Clock2019ticks/200ms respalda
escala actual; motor185tics/5080ms sin Images y187/5461ms con Images;22Images,
PREP507/READ445/FRAME239ms, TICK5468/SLEEP11/GAP1285ms. Unos4 Images/s,
no FPS f?sicos. No reabrir bench para repetir medici?n.
R337 evita D_Display cuando no hay slot FREE mediante nodrawers original;
TryRunTics/entrada siguen. Snapshot tambi?n tras Tick sin dibujar. Mismo PNG,
resoluci?n320x200/colores, bindings,4MiB; RAM3724B sobreR331 dentro4096guard.
164checks C/VFS +71Lua +2ciclos E1M1/hilos reales S3 +7escenarios upload pasan.
S3 demuestra slots llenos=>sin nuevos dibujos pero tics avanzan; controles,
pausa/resume, STOP/JOIN/unload correctos;14alloc/14free en ambos ciclos.
UI normal jugable; tras EXIT/CLOSED fotografiar TIME MS/TICS/IMAGES.
Plan/pins/l?mites: docs/doom-demand-physical-plan-r337.md. Un install inactivo y
un ciclo<=20s propuestos; no reboot previo. Payload nuevo a?n NO autorizado.
ID365219945,645148B, SHA149d7a2ac8bdeaebfb4a36f090f747c5d7b26c77807d17dd32e5674a9cde7071.
ELF607636B SHA0ea7b00529435a0d4a249f5aa12c52bd9c584bc95bba2aba0b4ef870c88232b6.
CLI pc-doom-demand-r337.mjs;prepare316partes/651178wire;gates todos cerrados.
Runner artifacts/doom-demand-physical-r338/install-once.ps1 preparado NO ejecutado;
journal demand-r337.jsonl no creado. Conservar carrier963/respaldo947.
Sin push/checks remotos; asumir salud normal salvo aviso del usuario.
Estados pendientes anteriores sustituidos por este; no registrar housekeeping.

# Estado actual R335: DoomBench preparado, pendiente de aprobaci?n f?sica

R334/DoomPalette: usuario confirma imagen/colores, controles y CLOSED correctos;
mejora parcial pero sigue demasiado lento. Navegaci?n normal. No reboot previo.
R335 mide clock y pipeline antes de otra optimizaci?n: tres sleeps200ms y fases
~5s sin Images/~5s con Images; autoSTOP fuera del observer. Mismo motor, codec,
bindings, 4MiB y guards RAM; protocolo128-v3. No ensayo f?sico nuevo autorizado.
Plan completo/pins/l?mites: docs/doom-benchmark-physical-plan-r335.md.
150 checks C/VFS +68 Lua +7 escenarios upload pasan; prepare318partes/655324wire.
ID365219946,649256B, SHA4ab579c492a51f5743d5c5f71b362f2d96f56ca43fdc24b306562a59a904ac38.
ELF607400B SHAfd41ae2439a0b24d211fa5c837603c1fb399aa7ee013d8afdacbfbada172ab0b.
CLI pc-doom-bench-r335.mjs; gates DEPLOYMENT/BENCH_R335/Large cerrados.
Runner preparado artifacts/doom-bench-physical-r336/install-once.ps1, NO ejecutado.
Un install inactivo y un ciclo autom?tico propuestos; cuatro p?ginas MODE tras
CLOSED. Conservar DoomLauncher963 y DoomPalette947. Journal bench-r335.jsonl
no creado. Sin push/remote checks; asumir salud normal salvo aviso del usuario.
Los estados pendientes anteriores son hist?ricos y quedan sustituidos aqu?.

# Retomar el proyecto

**Actual R333: DoomPalette listo, pendiente de autorización física.**
Plan/pins/evidencia docs/doom-palette-physical-plan-r333.md. R332 DoomFast:
botones/imagen/CLOSED correctos, algo más rápido pero aún lento. No reboot previo.
R333 PNG indexado320x200/65048B (~66% menos bytes), expansión RGB idéntica al
RGB565 de DoomFast, <=256colores; rechaza257 antes de Image y suelta solo slot
recién reservado. No encoded/indexed frame buffer, heap o bindings nuevos.
BSS+2824; guard RAM+4096=>min_free6471381, largest4194320/zona4MiB iguales.
4255checks codec/145VFS con S3 decoder real/61Lua y7escenarios paquete pasan;
regresión R331 pasa. Encoder S3 total25300->23400us/3rondas: no gran ganancia
CPU, hipótesis reducir datos/decoder, no FPS RW4. Si no mejora, medir pipeline.

DoomPalette365219947,645952B/46recursos, SHAebb889227feafa8fd7cf1fa820d2170723847dfc49c5642911b9673f3a19c26f.
ELF606272B SHA2accf39509b79f32eef7050a8be501c1d6372116ecd3df0f34311aa25839b9c2;
Lua21743B SHA2ae089250b1ca8d75e0dfafb9d57c0332887403cd3ad984b598c04ff9d044a93.
Módulo rw4png333/base947; WAD963, conservar963/backup948. Prepare offline
317partes/652001wire pasa. CLI pc-doom-palette-r333.mjs, journal palette-r333.jsonl
no creado. DEPLOYMENT/PALETTE_R333/Large cerrados. No envío o ejecución física
nuevos. Propuesta1install inactivo/hasta2ciclos observados; sin reinicio,
autoactivar/borrar/retry/resume. Segunda vuelta solo tras CLOSED y render/
controles correctos. Párrafos R331 y siguientes históricos, sustituidos aquí.

**Actual R331: DoomFast preparado, pendiente de aprobación física.**
Plan/pins/pruebas en docs/doom-fast-physical-plan-r331.md. R330 DoomHold muestra
Doom, controles operativos y CLOSED, pero lento. No necesita reboot previo.
Codec propio nuevo mantiene PNG320x200/192278B idéntico; cursor secuencial y
Adler+CRC en una pasada, sin buffers/imports/comandos nuevos. Transporte R329
idéntico. Ccodec5708checks, VFS142checks yLua59casos pasan; package46recursos,
7escenarios y regresión R329 pasan; prepare316partes/651618wire. No envío físico.
Benchmark emulador solo prepare/read:153400us->24200us agregado3rondas (~6,3x),
no FPS ni promesa de aceleración RW4. Datos completos/límites en el plan.

DoomFast365219948,645588B, SHA7dbecda4486d1f9314dffcceacf2c82abc726d6260ac1f5c056f97e329af38fd.
ELF605908B SHA7e16929469dfa183b151a4f7e53a61b52dcfe80f1fc7b86e00655495e563b077;
Lua21743B SHA3a3af095ab159dd42f40fe5cc1ca3d9a4fab6891a050b8babf275a7316620fdc.
CodecSHA009dd32024e076294d4b9fab97e2f0407049bdd88792e592e147c7dfa11e87e7.
Módulo rw4png331/base948; WAD963, conservar carrier963/backup949. CLI
pc-doom-fast-r331.mjs; journal fast-r331.jsonl no creado. DEPLOYMENT,FAST_R331
yLarge cerrados. Propuesta una instalación inactiva/hasta2ciclos, segundo solo
tras CLOSED e imagen/controles correctos; sin reinicio/retry/resume/borrado.
Lo que sigue R329/R327 y demás es histórico, sustituido por este estado.

**Actual R329: DoomHold listo, pendiente de aprobación física.**
Plan/evidencia/pins en docs/doom-hold-physical-plan-r329.md. R328 DoomLease
mostró Doom con parpadeo, controles no confirmados y CLOSED; no necesita reboot
previo al siguiente ensayo. R329 consulta READY con command9 antes de detach,
mantiene imagen/lease/controles si pendiente, y reserva con8 solo tras retirar.
Mismo motor/codec/bindings/zona4MiB; sin buffers/imports/firmware nuevos.
142 checks C/VFS y59 casos Lua pasan, paquete46recursos/siete escenarios y
regresión R327 pasan; prepare offline316partes/651506wire. No nuevo ensayo físico.

DoomHold365219949,645476B, SHAbe5f8cf0568fa6868c1477822fc3ef2611c8e4788f2d3a9d2b87b987887836b1.
ELF605796B SHAde82634e961871d34b675b38dc4a715578ac0642ff93062eb6fa6f1ab2a3f6ce;
Lua21743B SHAb41f6b73249ca515496637c8c7f7dd64d682c8066119ba7f4b7fddb3f766a1c1.
Módulo rw4png329/base949, WAD compartido963. Conservar carrier963/backup950.
CLI pc-doom-hold-r329.mjs; journal hold-r329.jsonl no creado. DEPLOYMENT,
HOLD_R329 y Large cerrados. Propuesta: instalación inactiva y hasta2ciclos,
segundo solo tras CLOSED y render/controles correctos. Ninguna aprobación aún.
Lo anterior R327/R326 y siguientes párrafos son históricos, sustituidos aquí.

**Actual R327: DoomLease preparado y validado, sin aprobación física aún.**
Plan fijo: docs/doom-lease-physical-plan-r327.md. Corrección/evidencia en
docs/doom-image-lease-r327.md. R326 instaló DoomRefs aprobado; fotos completas
FIRST24031607/LAST30031607/DIMS320x200, refs1/open8/close7, clserr0/reads6/rderr1,
skerr0/firstC779/lastC1296/maxread192278/relerr1/pos4. Retorno normal confirmado.
El módulo actual rw4png325 puede seguir residente; no reabrir pruebas ni forzar
descarga. Nuevo ensayo requiere aprobación y un reinicio normal observado.

R327 reserva READY/prepara PNG con command8 antes de crear Image; EAGAIN solo
en esa reserva espera otro tick sin consumir secuencia ni crear lectores.
Mismos bindings/codec/engine/zona4MiB, counters v2 y guard de cierre. Baseline
sin inyección reproduce histórico produced>0/no READY/read-11 (30 checks).
Candidato129 checks C/VFS y55 casos Lua pasan; no decoder RW4 ni hilos reales.
Siete escenarios de upload/gates/journals y regresión R325 pasan. No ensayo
físico nuevo. No se afirma causa física completa ni corrección física probada.

DoomLease365219950,645404B,46recursos, paquete SHA502dbc6b9081ad7f61da0d7377e6809ee7a6f957b24138d77a854cb1a0e63a95.
ELF605772B SHA14ff85dbe2de6ea7373e0b4a71f0f1aadd42d2381c854770fc03edf87c7b9fd1;
Lua21695B SHA3b4fe3cd034bc79e9c836d22c0c0fa4bbdbf12be819dfd91d4693c5028d88681.
Módulo rw4png327/base950; solo WAD compartido963. CLI pc-doom-lease-r327.mjs;
gate DEPLOYMENT+LEASE_R327 y C#Large cerrados; journal lease-r327.jsonl no creado.
Plan propone un reinicio observado, envío inactivo y START/EXIT único; ERROR
usa las cinco páginas cached. Sin retry/resume/adopción/activación/borrado.

Lo siguiente es histórico, sustituido por R327/R326 arriba.

**R325: DoomRefs preparado SOLO PC, pendiente de aprobación física.**
Plan concreto: docs/doom-refs-physical-plan-r325.md. Un reinicio normal stock
observado para retirar rw4png321 pendiente, un envío inactivo y un START con
READY; ERROR: FIRST/LAST/DIMS y cuatro páginas MODE cached; CLOSED: no repetir.
No hay aprobación de ese plan todavía. Ninguna operación física nueva.

Paquete build/doom-refs-r325/package/DoomRefs-id-only.face, ID365219951,
644796bytes/46recursos, SHA f514f46706ec100481af51453dcf3b54f63b24383145fce17fdd81f1a136a8c0.
ELF build/doom-image-counters-r325/doom.elf,605684bytes,
SHA94531cff5e62e5824b272b11cbbe7ee67df0479754b23581d6caca1e037370af.
Lua21175bytes/SHAfa662c5a7c2c52433cf709a7f0200de3cd7c85f30890e76249c6a1468140bb69.
Nuevo módulo rw4png325/base951, WAD compartido963. Mismos bindings/codec/engine.

tools/doom-image-counters-source-r325.mjs deriva R317 con wrappers de callbacks;
11atomics/44bytes BSS, sin heap/reset refs/cierre ajeno ni bindings nuevos.
Packet128bytes VERSION2: words1–20 originales,21–32 refs/openOK/closeOK/closeErr/
readCalls/readErr/seekErr/firstC/lastC/maxN/releaseErr/lastPosition. First/lastC
site*256+errno:1open2close3read4seek5release. Contadores individuales atómicos,
snapshot no transaccional. Rechaza v1. No comandos nuevos.
tools/doom-refs-source-r325.mjs conserva FIRST/LAST/DIMS, guarda última lectura
de estado YA programada antes de cleanup. MODE cuatro páginas solo memoria,
sin consultas adicionales. Números8decimales/99999999 sin captura o saturado.

Tests C194checks S3 VFS/stdio/get_info real; worker/thread/motor simulados,
EIO explícito en fixture, no loader RW4 ni pixelsdecoded. Ctestmodule
0440c54e56d60386a1fa05dc132d8aa74fe5afa5a7b14fff86588893083d0758 retirado,
nodos/temporales ausentes. Primera compilación de fixture tuvo BOM intermedio,
corregido antes de cargar. Source producción97fdddd8f72fa39a67fa4a1984f1071da9078fde558d542d3ab2cd0f6c5cd6ce;
sourceinyectado de test distinto. artifacts/research/image-counters-r325/counters-tests.json.
Lua51casos(48previos+3), mocks; UI reproduce24031607/30031607/320x200 y muestra
12counters enMODE sinIO. artifacts/doom-refs-r325/{ui-tests,package-tests}.json.
Paquete7escenarios/pins/gates y journalsviejos protegidos; R321package8pasa.

CLI tools/pc-doom-refs-r325.mjs prepare ->OfflinePrepared316parts650826wire.
Gate PHYSICAL_DEPLOYMENT_REVIEWED=false + PHYSICAL_REFS_R325_REVIEWED=false;
C#Large=false. Nuevo journal refs-r325.jsonl no creado físicamente. Tras
aprobación/retorno normal de reboot habilitar solo esos gates/Large, un install,
finally cerrar/rebuild/test. No retry/resume/autoactivate/delete. El residente
actual sigue siendo rw4png321, no ejecutar nuevo C sobre él ni reabrir pruebas.

**R324: revisión técnica de callbacks, sin nueva prueba física.**
docs/doom-reader-lifetime-r324.md y tools/review-rw4-image-lifetime-r324.mjs
(modos fixed follow/finish/core), outputs AP privados ignorados. Driver `/`
registrado33faa->4488c, cache0, close33f18/read33efc/open33f28. Close llama
POSIX64fac pero retorna0: puede ocultar fallo close, no se prueba ocurrencia.
No confundir con driver recursos5f914c cuyo close vacío es intencionado.
Método Lua objeto.delete5dff8c identificado por tabla19a3e0; según flag propio
userdata+4 llama nativo vía5b42f8->1f404->1f234 directamente. No evidencia para
afirmar que añadir una espera arregle3016. file_close4942f4 limpia f_priv
DESPUÉS del callback, no antes. Faltan contadores C open/close/read/seek/ref
para separar close oculto/lectura fallida/lector vivo. No payload/fix nuevo.

**Actual R323: FIRST24031607/LAST30031607/DIMS03200200, ERROR.**
Usuario puede volver/usar menú. docs/doom-fault-result-r323.md. Primero es
etapa24/op3WRITE/errno16/command7 al renovarimagen trasdetach. DIMS320x200
pruebaobjetoImagecreado/tamaño consultado antes; NOpruebapíxeles/animación.
Luego cleanup30/write7/16 antesJOIN. STOPintentado porfallo24; finished1en
cleanupsegúnflujo; descargaNOconfirmada. Asumir rw4png321 residente, baseELF953,
lease/capture952,WAD963. No reabrir/START/reboot/forzarrmmod nuevos.
Ahora primerfallo NOconstructor/getsize/opencontrol; foco lifecyclecache/reader
retirement entreframes. Noatribuirreaderconcreto/closecookie/ram/guardassinprueba.
Usuario pidequéborrar: aconsejado DoomTrace956+DoomRAM957 INACTIVAS desdehabitual,
sinabrirlas. Ambasold304 borrables trasrebootprevio/registrovacío al cargar321,
no dependenciesactuales(ELF953WAD963). ConservarDoomIO953,DoomFault952,
DoomLauncher963. Delete manualaúnNOconfirmado; noinventarioredundante ni
asumircountmenor. Borrarviejasliberaflash,no descarga321. Gatescerrados;
sincomandofísiconuevo. Solo commitlocal.

**Actual R322: DoomFault INSTALADA INACTIVA; esperar FIRST/LAST/DIMS.**
Usuario confirmó restartnormal/menús/corona/batería>=50%/observación. UN install
RegisteredInactive,catprevio15,18partes/26frames/35724TX,ACKMD5offset0/chunk2048,
cierre/workerexit0. No autoactivación/CdesdePC/retry/resume/delete niqueryextra.
docs/doom-fault-install-r322.md. Artifactsprivados doom-fault-physical-r322/
install-result/gates-restored.json. Journal fault-r321.jsonl EXISTE,norecrear.
Finallyrestauró gatesyProbeoriginales;helpercerradoSHA24ab86192623cd548672d3631b7aebb0881bbd80f56440704bb0164ab86e0ec0;
5589assertions0nativecalls+ochoescenariospaquete/gates pasan.
Asyncsolicita seleccionarDoomFault(NO DoomIO), START1 soloREADY, CHECKINGdespierto,
siERROR leerFIRST/LAST/DIMS sinrepetirSTART/EXIT/reabrir; siDoomfunciona EXIT~5s,
CLOSED; volverhabitualdesdeAjustes yconfirmarmenús/corona. UNciclo,no2.
Autorizaciónyaobtenida,no pedirlaotra vez ni enviar/reiniciar. NopayloadnuevoC:
usaELF953yWAD963; conservarambos. Noresultadofísicomanualrecibidoaún, noinferir
ausenciaviejo318/carganuevo321/renderfixdesdeelcatálogo. Solo commitlocal.

**R321 aprobado; esperar confirmación de reinicio antes del envío R322.**
Usuario respondió «ok» a la aprobación concreta del plan. Async pide reinicio
normal desdehabitual, retorno menús/corona, batería>=50% y observación; aún
sin respuesta a ese prerrequisito. No repetir permiso ni enviar antes.
Journal fault-r321.jsonl y watch.lock AUSENTES; gates cerrados. Runner preparado
sin ejecutar: artifacts/doom-fault-physical-r322/install-once.ps1, derivado del
envío R319; abre solo deployment/fault/Large, guarda resultado sanitized,
finally restaura bytes originales/build/testhelper/testpaquete. Un install,
sin retry. Requiere ejecución física escalada después de confirmar retorno.
No hardware, reboot desdePC, compilación ni envío en este turno de aprobación.

**Actual R321: DoomFault listo en PC; aprobación física pendiente.**
Usuario «ok» autorizó continuar corrección PC trasR320. No aprobaron nuevo
reboot/instalación/START. Plan concreto docs/doom-fault-physical-plan-r321.md:
UN reinicio normal stock observado desdehabitual, UN envío inactivo, UN START
condicionadoREADY, leer FIRST/LAST/DIMS o CLOSED y volver habitual/menús/corona.
No ciclo2. Residente actual asumir rw4png318/base953; no reabrir/forzar/borrar.
Paquete build/doom-fault-r321/package/DoomFault-id-only.face ID365219952,
35060bytes/32recursos/SHA836cb01accfaf7a403c9629757ea8d5620586c140cd0cf8af4ae52d679718106.
Lua20248bytes/SHA079e682cff9d4b6121b468df0790b7a89dc7464b5410e25abfeb847d312d01f2.
NOELF/WAD incluidos. Reutiliza605180B ELF R317 instaladoenDoomIO953, mismohash
8de1b31...; WAD963. Conservar953/963. Nuevo nombre módulo rw4png321, lease/capture
enui_base952, sin tocarauxiliares953. Nativebase953 yui_base952 distintos.
fault-record-r321.lua conserva snapshots numéricos primero/último (sinrawstrings)
ywidth/height9999desconocido. FIRST/LAST ocho dígitos:etapa/op/errno/comando;
DIMS ancho4alto4. Ops1openctl,2read,3write,4close,5setvbuf,6Imageconstructor,
7get_img_size,8dimensiones,9delete,0sinIO. Captura antesdeclose, no duplica
fault al safewrapper siya registrado; cleanupfaultenclavadoR318 intacto.
Source tools/doom-fault-source-r321.mjs compone variante sin editar fuentes
R318 niELF. Pruebas test-doom-fault-ui-r321.mjs:48casos(36previos+12nuevos),
incluye UIbitmaprealcompuesta con mocks, camposfirst,last/dims y flagsselector.
Paquete test-doom-fault-package-r321.mjs:8escenarios incluye faltaindependiente
carrier953/963, journalsviejosprotegidos, pin/noELF/gateclosed. R318package7
tambiénpasa. artifacts/doom-fault-r321/{ui-tests,package-tests}.json ignorados.
CLI tools/pc-doom-fault-r321.mjs prepare ->OfflinePrepared18parts35428wire,
sinjournal/radio. Installgate PHYSICAL_DEPLOYMENT_REVIEWED=false + nuevo
PHYSICAL_FAULT_R321_REVIEWED=false, C#LargePhysicalReviewed=false. Nuevojournal
fault-r321.jsonl (no físico creado); no resume/retry. Usa perfil grande porque
35060 excede32768, NO ampliar staticbudget. Solo gatesfault/deployment/Large
trasaprobación+retornoreboot; finallycerrar/rebuild/test. No envíoahora.
No fixPNGclaim: permite diagnosticar primerfallooculto; no observación nueva
del residente. Solo commitlocal, sin push/auditoríasrepetidas.

**Actual R320: DoomIO ERROR3016, habitual/menús/corona normales confirmados.**
docs/doom-readers-result-r320.md. No ciclo2/reabrir/envío/reboot después del
reporte. Residente actual asumir rw4png318/base953, NO viejo304 (reboot previo
confirmado y flujo318 comprueba registro vacío antes de insmod). Stage30 antes
de JOIN/rmmod, últimoerrno16 capturado en open O write ctl: NOafirmarwrite7
confirmado/refimagenconcreta. Segúnflujo finished1/joined!=1, checksCRC/RAM/
load/start pasaron; no snapshotexportado, causaengineexitdesconocida.
Tests test-doom-readers-errors-r320.mjs:38casos(22+7+7+2),mockIO/native/widgets
enLuaS3. Primerfalloimagen25->STOP->falloopenctl16 O write7/16 ambosmuestran3016:
diagnósticoactual SOBRESCRIBEprimerfallo, pero no pruebaocurrenciaphysical.
Timer/GC no retry trasERROR; ningúnnuevomódulo, inventarioS3igual/scratchretirado.
Herramientaestática review-rw4-image-vfs-r320.mjs [registryopcional] fijahashAP/
objdump+ventanas44374/4449c/444e0/446ec/4477c; wrappercache/callbacks revisados,
driverconcretonoidentificado/causanuevaNOconfirmada. Ventanaregistryprevioopen
NOpruebadriverregister. Output artifacts/research/image-vfs-r320*/ ignorado.
Conservarprimerfallo + distinguiropen/write/closecontrol espróximocambioútil,
agrupado, no repetir3016. No payload/plan/aprobaciónnuevos; no forzarrefs/rmmod,
reabrirDoomIO/RAM/Trace, borrar953ELF/963WAD, ni reiniciar sinautorizaciónconcreta.
Resultadoobservado artifacts/doom-readers-physical-r319/result-r320.json sinraw.
Gatescerrados, paquete318/source909959... inmutables. Solo commitlocal,sinpush.

**Actual R319: DoomIO INSTALADA INACTIVA; esperar resultado manual autorizado.**
Usuario confirmó reboot NORMAL, menús/corona normales, batería>=50%/observación.
UN install completado RegisteredInactive,14previas,312parts/320frames/643358TX,
ACKMD5offset0/chunk2048, cierre/workerexit0. No autoactivación, C desdePC, retry,
resume, delete o consulta física extra. docs/doom-readers-install-r319.md.
Finalmente restaurados deployment/readers/RAMPNG/resume/controlretry y C#Large/
Static cerrados; rebuilt helper d10e34e0014e7990af06098745bb3a5d99daf62f43f4098e5a5eb4405533e9bd,
5589 assertions0nativecalls + siete escenarios paquete/gates pasan.
artifacts/doom-readers-physical-r319/{install-result,gates-restored}.json y
install-once.ps1 ignorados. Journal readers-r318.jsonl EXISTE, no borrar/recrear.
Se pidió async seleccionar DoomIO(NO DoomRAM), START1 con READY, CHECKING
despierto, observar imagen completa animada/controles/pausa/EXIT<30s. Solo si
CLOSED/todoOK, START2 sin salir de instancia, EXIT, habitual/selector/menús/corona.
AnteERROR/basura/sueño/missingUI no ciclo2/reabrir; reportar cuatro dígitos
etapa/errno. Ya autorizado, NO pedir permiso de nuevo ni enviar/reboot adicionales.
Resultado visual/cierre/ausencia viejaC aún desconocidos; catálogo no los prueba.
Solo commit local, sin CI/push; MAC/key/raw no impresos.

**Actual R318: DoomIO autorizado; esperar confirmación del reinicio normal.**
Usuario respondió «ok» al permiso concreto del plan R318. Se pidió por async
reiniciar normalmente desde la esfera habitual, confirmar menús/corona,
batería >=50% y observación disponible. TODAVÍA SIN RESPUESTA a esa pregunta.
No repetir permiso del plan, no enviar hasta confirmar ese prerrequisito.
Nuevo journal readers-r318.jsonl y watch.lock comprobados AUSENTES, gates
cerrados. No hubo hardware, restart, build ni instalación en este turno.
Abajo, el estado de preparación previo a esta aprobación:

**R318: DoomIO preparado SOLO PC.**
Plan docs/doom-readers-physical-plan-r318.md: un reinicio NORMAL stock por el
usuario desde su esfera habitual (NO reset de fábrica), un envío inactivo y
hasta DOS ciclos manuales condicionados a CLOSED/imagen completa/menús normales.
Nada físico ejecutado/autorizado en R318. Viejo rw4png304 sigue residente según
última evidencia. No forzar refs/rmmod, repetir CExit/Trace/RAM ni cargar nuevo C.
User deletion CInfo955/CExit954 sigue sin confirmación; se pueden quitar solo
esas UI inactivas si falta cupo; conservar DoomLauncher963/WAD y DoomRAM957.
Paquete build/doom-readers-r318/package/DoomIO-id-only.face, ID365219953,
637108 bytes, SHA5fb7ec0b289a7492a0d97b3ef798de9aeba0003f2510be8c58b6d331d909a823.
Lua9099594bee52dd635c048b38961423055556b8f7eb876481d4a5e3412b5d6abf;
ELF R317 final 605180 bytes/8de1b31c8fe82c4fe3b52eb780e424cbdeca674c539557b58f20941093dc384f.
Nuevo módulo rw4png318, mismos nodos PNG/control, own base953/lease/capture.
Source tools/doom-readers-source-r318.mjs compone fuentes anteriores sin cambiar
ensayos previos. STOP antes de release; fallo en presentación permite UN intento
STOP+cleanup; fallos de cleanup enclavan ERROR sin retry desde Timer/GC. No adopta
ningún residente: recover solo registro vacío o ERROR40. Digits: etapa/errno.
Misma instancia segundo START omite CRC largo tras éxito; reopening verifica.
36 Lua casos (22base/7juego/7fault) pasan en S3 interpreter con mocks; siete
escenarios protocolo + gate cerrado + journal viejo protegido pasan. Test R304
también pasa. Inicial test extendido falló por fixture que cambiaba callback ya
capturado; se corrigió fixture y harness exige marcador FINAL, no solo exit0 de
Lua. artifacts/doom-readers-r318/{ui-tests,package-tests}.json. 30 recursos exactos.
Prepare: node tools/pc-doom-readers-r318.mjs prepare -> OfflinePrepared,312parts.
Install bloqueado por PHYSICAL_DEPLOYMENT_REVIEWED=false y nuevo
PHYSICAL_READERS_R318_REVIEWED=false; LargePhysicalReviewed=false en Probe.cs.
Journal nuevo readers-r318.jsonl, NO EXISTE físico aún. No retry/resume aprobados.
Tras autorización y retorno normal del reboot, habilitar SOLO gates apropiados,
rebuild worker, un install, finally cerrar/rebuild/test. No abrir R304/static/etc.
Sin push/CI remota/auditorías repetidas; conservar privacidad y solo commit local.

**Actual R316/R317: corrección C multilector probada/compilada SOLO PC.**
docs/doom-png-lifecycle-r316-r317.md. APstaticPNGinfo643ac/open642c4/close642b8,
loader61e60 erroresread61ec8/short61ece retornan61ed0 SINclose61ee4: rutaestática
confirmada, NO probarocurrenciaphysical/causalectura. Conversiónpng->bin3e8b8c
existepero NOvinculadaalLuaactual. No confundirJPEGinit5de54conPNGinit64448.
EmuladorR316base72checks(realVFS/S3LVGLinfo): heldreader bloquea get_info, fullPNG
goldenexacto yEIOinyectado+sinclose retiene busy. R317114checks: nuevoslectores
hasta8, posicionesfdindependientes, actualget_info conheldreaderPASA, limit8,
close/unloadguards,UIowneropen/read/seek; faultEIOmodelado(NOAPejecutado).
Nuevo tools/doom-png-readers-source-r316.mjs genera transportdesdePNGoriginal,
NOmodificaoriginal/ELF304. Leaseframeúnica,refcountatomic,fdpos8/12,cookie20,
sinheapnuevo/bindings niwritesframes; mantiene JOIN/unloadbloqueadosconlectores.
Closeanyownerpermitefinalcallback;read/open/seekUIownertrasSTART. NOpruebafddup.
Testmodules/temporales/nodosS3retirados; worker/OSthreadmock,norenderpixels/
realDoom niRW4. Newtools test-rw4-png-loader-r316.mjs,test-rw4-png-readers-r317.mjs,
review-rw4-png-lifecycle-r316.mjs modos fijos. EmuladorreabiertoalverPID10984/QEMU/
puertosausentes: nuevoPID3532 sesión5298; antiguo marcadoexited. NoUSB/watch.
Build FINAL build/doom-png-readers-r317/final/doom.elf605180B
SHA8de1b31c8fe82c4fe3b52eb780e424cbdeca674c539557b58f20941093dc384f,
transportd0fe36a03463348fb78a8298a97864a4bfbc9adf36ce4062d4897d5bfaba70c0.
Mismoengine/libc/bindings523ce18…/WAD963/codec/zone4MiB; sinimports/nuevosbindings.
Buildrepro980e13(originalR285),NOreprodelactualPNG6a5d43. Primera compilación
parcialbuild/.../root fallóindentación, conservarNOusar; final/review.json válido.
Pruebas artefacts/research/png-lifecycle-r316/{loader-tests,readers-tests}.json.
NO paquete/launcher nuevo preparado/aprobado/instalado. Gatescerrados/journals
intactos; viejoCresidenteNOreparableporestenuevoELF. Siguienteintegrarlauncher/
installerpequeño agrupado+plan sustituciónnormal(quizárestartstockobservado,
NOhacerlosinautorizaciónconcreta). No physicalrootcause/fixclaim aún, no más
minidiagnósticosidénticos/noresetrefs/forzarrmmod/reabrirDoom/borrar957/963.
CInfo/CExitborradosNOconfirmadosexplícitos; noconsultacatálogoextra. Solo commitlocal.

**Actual R315: CExit etapa12/IOERR16; falla WRITE command7, NO JOIN/rmmod.**
Fotos3páginas: REGOWN1/LEASE1/EXITCODE0/COPEN1/CREAD1/CCLOSE1;SEQ7/STARTED1/
READY1/FINISHED1/JOINED0/ERROR0;REASON0/IOERR16/PEAK0/ALLOC0/FREED0/CLEANUP0.
Usuario confirma habitual/menús/coronanormales. Snapshot visiblePREcomando,
NOrelecturapostfallo;CCLOSE1 no prueba close del fdwrite. R315obs/doc guardados.
command7 devuelve16enstarted/joinedguard oimage_refocupado; conprev1/0 el
image_refretenido candidato directo; owner sería1 ypacket22. NOcausaRAM/PNG/
decoderhandle/closecookieprobada. CeroStatsindefinidospreJOIN. NOforzarrefs0/unload,
repetirCExit/Trace/RAM/reboot ni nuevos comandosfísicos. Siguiente lifecycleimagen,
nootrointentoidénticoop7. No payload nuevo preparado/autorizado.
Usuario pidióespacio; indiqué borrarmanualmente CInfo365219955+CExit365219954
INACTIVAS (notimers/GCnative,ensayosfinalizados,CExitantesde shell). NOconfirmación
deborradotodavía, NOPCdelete/catálogo/journalupdates, noconteo14asumido. Conservar
DoomRAM365219957ELF yDoomLauncher365219963WAD. BorrarUI NOretiramóduloresidente.
docs/doom-resident-close-result-r315.md. Solo commitlocal,sinpush/CI.

**Actual R314: CExit instalada INACTIVA; UN CLOSE C manual YAautorizado pendiente.**
Usuario«si»aprobóR313. UNinstallRegisteredInactive12parts21frames24747TX,
close/workertrueexit0. FinallyStaticfalse/r167,C#Staticfalse,otrosgatescerrados,
rebuild/testpaqueteclosedPASS. Helper0d40ce68fb195140ca4e884a5305709ccba95df7f210a8c10db0f4e8aed50f12.
Catálogoindependiente16vs15previas,flags/selecciónpreservados,owninactivo/eliminable,
WAD963/ELF957presentes,1activa0unknown,close/workertrue.contentVerifiedfalse.
Noactivación/C commandsdesdePC. docs/doom-resident-close-install-r314.md.
Journaldoom-resident-close-r313.json EXISTE NOrecrear/reintentar. Artifacts
doom-resident-close-physical-r314/install-result.json(posibleUTF16LE),catalog-after.json.
SiguienteusuarioCExit4barrasNARANJAS,C CLOSE,puntogris,CLOSE C1,anotarcódigo/color+
3páginasMODE(P1REGOWN/LEASE/EXITCODE/COPEN/CREAD/CCLOSE;P2SEQ/STARTED/READY/FINISHED/
JOINED/ERROR;P3REASON/IOERR/PEAK/ALLOC/FREED/CLEANUP),habitual+menús/corona.
No pedir otra autorización para ese ensayo. FallaUI/errorNOrepetir/reabrir;
NOSTARTDoom/Trace/RAM/reboot/borrar957/963/cambiarvínculo. RetiroCpendiente.
Solo commitlocal, nopush/CI/repeticiónrutina.

**Actual R313: CExit SOLO PC listo, pendiente aprobación UNinstall+UN CLOSE C.**
User«ok»trasR312 dio continuarPC, NO aprobación física específica nueva todavía.
Plan docs/doom-resident-close-physical-plan-r313.md. ID36521995424176B32recursos,
SHA209350fb388977c248e55571e21aa544ac00beed3e8ee4a0854354df2b61c584,
source3e78cb58f1309a9209cc938a2db200e619269459b92891561f83d20b8d88ec22.
Artifactartifacts/doom-resident-close-r313/package-final/CExit-id-only.face.
12parts24430MASS+512control. Journaldoom-resident-close-r313.json NOcreado.
GatesStaticfalse/r167,C#Static/Largefalse,otrosdeploymentfalse. HelperclosedSHA
d5b5420d0393b0cf2ad7c5ee822e07dcd8933cebe2072e15077a8c1c81173ce1.
15LuaS3 casos con C/shell/files/widgetsMOCKPASS: cierres/busy/owner/balance/cleanup/
preconditions/rmmod/node/captureguard,UIidle/once. TestUIharness inicialmente
syntaxporcomentariosplit, corregido y15PASS; nofallopayload. Package/readback32/
pins/tamper/gatePASS; build/prepareOfflinePASS. No comandos físicos trasR312.
CExit preview4barrasNARANJAS,C CLOSE/CLOSE C/MODE. Inertealabrir,SINtimer/GCnative.
Botón1:captureCInfo ownlease/finished1/error0; sijoined0 command7UNA,verifyseq,
command5UNA,verifyseq/join; sijoined1skipambos; balance/error0+registry/lease
antesde1rmmod. ShellcapturasSOLOui954/close-shell.txt,siocupadopara,max8192,
exigerespuestavacía+registryempty+lsdevnodosausentes,retira957leaseexacta.
NoSTART/STOP/cargarotroC/Doom. C owner/refcount/slotguards intactos. Primerfallo
termina, noretry/recoversafe/timer/rmmodforzado. IOERR abs(errno),9999unknown.
P1REGOWN/LEASE/EXITCODE/COPEN/CREAD/CCLOSE;P2SEQ/STARTED/READY/FINISHED/JOINED/ERROR;
P3REASON/IOERR/PEAK/ALLOC/FREED/CLEANUP. Code10..14op7,20..24op5,30balance,
31identity32rmmod33registry34nodes35lease; snapshotfallos1..7,preconditions8/9.
Solo00verde+postconditionsasegura retiro;failurecamposúltimasnapshot,noactual.
Manual1CLOSEy3páginasMODE,habitualmenús; NOreabrir/STARTDoominclusotraséxito
sinrevisión. No marca persistente pero eso NOautoriza repetir. Solo commitlocal.

**Actual R312: CInfo lectura física OK; FINISHED1/JOINED0/ERROR0, residente.**
4fotos=P1/P2 repetidas,noP3. P1REGOWN1/LEASE1/CAPTURE0/COPEN1/CREAD1/CCLOSE1.
P2SEQ7/STARTED1/READY1/FINISHED1/JOINED0/ERROR0. Código00/puntoverde, registryestable.
Usuario confirma habitual/menúsnormales. docs/doom-resident-info-result-r312.md,
observations-r312.json. No comandos físicos tras fotos. EnsayoR311consumido,
NOrepetir/reabrirCInfo/Trace/RAM. P3stats solo definidosjoined1, NOpedirfotoP3
si exige reabrir. No descargaC; guardar957ELF/963WAD/lease/vínculo.
Acotado antesdeJOINcompletado: controller detach7->join5->balance/registry/rmmod.
Hostjoinrc/valuefailure pondríaERROR1, no respalda esa rama elERROR0 observado.
Candidatosdetach/release/owner/refcounts/slot/I/O, no causa demostrada. El test
Cexistingreproducebloqueoporlector/lease, NO equivalencia física. Próximocambio
debedistinguir7vs5 yerrno exacto, detenerseprimerfallosinretrycleanup; no quitar
guards/forzarunload. Aún NO nuevo payload preparado/autorizado. No suponerOOM,
PNGdefectuoso/pthreadABI. No reboot/borrar/START. Solo commitlocal,sinpush/CI.

**Actual R311: CInfo instalada INACTIVA; UN READ C YA autorizado pendiente.**
Usuario«ok»aprobóR310. UN installr310 RegisteredInactive10parts19framesTX20653B,
close/workertrueexit0. Finally NodeStaticfalse/r167,C#Staticfalse,otrosgatescerrados,
rebuild/testpaqueteclosedPASS. HelperSHA51d9053901047c9a1fe0c137ffed6588784c169875bb7e71e9c98662a866834d.
Catálogoindependiente15vs14previas,flags/selecciónpreservados,owninactivo/eliminable,
WAD963/ELF957presentes,1activa0unknown,close/workertrue.contentVerifiedfalse.
Noactivación/Lua/C/residentread desdePC. docs/doom-resident-info-install-r311.md.
Journaldoom-resident-info-r310.json EXISTE NO recrear/reintentar. Artefactos
artifacts/doom-resident-info-physical-r311/install-result.json(posibleUTF16LE),catalog-after.json.
SiguienteusuarioCInfo3barrasAMARILLAS,READ C1siUI/puntogris,seisfilas.
Anotarcódigo/color+3páginasconMODE(noI/O);P1REGOWN/LEASE/CAPTURE/COPEN/CREAD/CCLOSE;
P2SEQ/STARTED/READY/FINISHED/JOINED/ERROR;P3REASON/CODE/PEAK/ALLOC/FREED/CLEANUP.
Despuéshabitual+menús/corona. SiUIausente/errornoREADrepeat/reabrir; capturaparcial.
No pedir otra autorización para esa lectura. NOreabrirTrace/RAM,reboot,borrar957/963,
forzarrmmod. EstadoC/unloadtodavía desconocidos. Solo commitlocal no push/CI.

**Actual R310: CInfo SOLO PC listo; pendiente aprobación UN install+UN READ C.**
Usuario confirma NO CLOSED y habitual/menús normales tras ERROR30. ObsR309
actualizada; NO descarga demostrada. Sin comandos físicos desde reporte.
CInfo36521995520120B SHA7c42c37d9775cc5860615e7c1fcb303a70642d39a47f565a2e87fc6e61c40430,
source435e5b720f69be2d4c85d817869e1b05bbf1520f840b556b4a0de2c8c46ebe1a.
artifacts/doom-resident-info-r310/package-final/CInfo-id-only.face32recursos,
10parts20336MASS+512control; package-reviewed candidato previo descartado.
Plan docs/doom-resident-info-physical-plan-r310.md. Journaldoom-resident-info-r310.json
NO creado. Staticfalse/r167,C#Static/Largefalse,otrosdeploymentgatesfalse.
Helper cerrado5122d49cbf9c7e640034be416e3035b20f6cf3e3366a3b6f23039a2aa1e7bf70.
14casos LuaS3 con archivos/widgets mockPASS, paquete/pins/tamper/gatePASS,
build/prepareOfflinePASS. Emulador estaba apagado, PID11676/QEMU/puertos ausentes;
registro antiguo marcadoexited y emulator-host start con permiso, PID10984.
Nueva sesión exec94909 conserva launcher; no hardware. No módulos/nodos probados.
CInfoSINlecturaalabrir,SINtimer/shell/escrituras/STOP/JOIN/rmmod/carga/descarga.
READ C1 lee registro/lease/capture1byte yctl128+EOF conclosefinally, antes/después
registryestable. 3páginas de6filas, MODEsoloUI. Preview3barrasAMARILLAS.
P1 REGOWN/LEASE/CAPTURE/COPEN/CREAD/CCLOSE;P2SEQ/STARTED/READY/FINISHED/JOINED/ERROR;
P3REASON/CODE/PEAK/ALLOC/FREED/CLEANUP. Punto/códigoetapaerror. Datoscleanup
solodefinidosjoined1. Usuario debe anotar/fotografiar3páginas,volverhabitualmenús.
No repetir/reabrirTrace/RAM ni borrar957/963; siguiente payload lectura NO autorizado
todavía. Solo commitlocal. No push/CI/repeticiónrutina.

**Actual R309: DoomTrace ERROR30 AL ABRIR; no START reportado.**
FREE/MAX ceros son valores iniciales, NO medición RAM: view.ram solo en START.
Control flow implica recuperación residente + tick con finished==1; checkpoint30
agrupa JOIN/balance/registry/rmmod/postconditions. NO operación exacta/causa/unload
confirmadas. No nuevo comando físico. docs/doom-trace-result-r309.md y
experiments/doom-runtime-rw4/observations-r309.json. Pregunta async pendiente:
¿CLOSED adicional apareció y retorno habitual/menús normales?, sin reabrir.
No START/repetir/reabrirTrace/RAM; no borrar957/963, reboot o rmmod forzado.
El ensayo R308 ya produjo resultado; no tratarlo como pendiente ni repetir.
Próximo trabajo: localizar subpaso de cierre/estado C con lectura acotada,
no bajar guards ni adivinar PNG/OOM. No payload nuevo preparado/autorizado.

**Actual R308: DoomTrace instalada INACTIVA; UN ensayo manual YA autorizado pendiente.**
Usuario «si» aprobó R307. UN install r307 RegisteredInactive,16partes/25frames/
32511TX, cierre/workertrue exit0. Finally Staticfalse/r167 y C#Staticfalse,
rebuild/test-paquete-gatePASS; otros gates siguen cerrados. Helper cerradoSHA
4e683f1ce86b420ba66547e27c9c1f1a9291cd4fd9445ccab47cbaf2cc350ac8.
Consulta independiente14vs13 previas, IDs/flags/selección intactos, owninactivo/
eliminable, WAD963/ELF957 presentes,1activa0unknown,close/workertrue.
contentVerified=false. docs/doom-trace-install-r308.md. Journaldoom-trace-r307.json
EXISTE: no recrear/reintentar. No activación/recuperación/C desde PC.
Siguiente: usuario DoomTrace4barrasBLANCAS. RECOVERING esperarREADY/CLOSED;
ERRORinicial anotar2dígitos/FREE/MAX/CLOSEDextra SIN START. Si habilitadoSTART1,
CHECKINGdespierto; ERROR anotar mismosdatos trasunossegundos sinrepetir.
Si juego completo/animado observar5s+EXITantes30s. Habitual+menús/corona.
No pedir otra aprobación para este ensayo; no reabrirDoomRAM ni borrar957/963.
La preparación histórica sin aprobar de abajo queda sustituida por R308.
Solo commitlocal; no push/CI ni repetir pruebas rutinarias.

**Actual R306/R307: DoomRAM falló; DoomTrace pequeño listo SOLOPC, sin aprobar.**
UsuarioCHECKING→instanteblanco→ERROR/rojo; volvióhabitual/menúsnormales.
NOimagenjuego, NOpruebanativaarrancada/retirada, NOcausa. Segundo cicloR304
condiciónNOcumplida; NOreabrir/repetirDoomRAM. No comandosfísicosdespuésdelreporte.
docs/doom-ram-failure-r306.md y observations-r306.json. Cpodríaseguircargado;
NOforzarrmmod/reboot/borrarDoomRAM365219957 o carrier365219963.

PC: test-rw4-png-decoder.mjs ejecuta decoderREAL S3 get_info/open/close sobre
PNGregular yPNGvirtual, ambos320x200/openOK,35checks. Sinpixelsvisuales ni
equivalenciaRW4. Archivos/módulo/nodospropiosS3retirados. artifacts/doom-ram-png-r304/decoder-tests.json.
InspecciónAPmetadatos/ventanasexistentesNOcausa; no asumirfstat/formato/RAM.
No cambiaron C/ELF/WAD trasR306. HeaderLVGL9websolo contextoprototiposS3,
no nuevosbindingsfísicos. Evitar búsquedasamplias research/**/*.json (ruido/URLs).

Siguiente paquete DoomTrace36521995631864B SHA5cb06a7c3135412f54203afe7a8e4233c1b4395f58ff5cf6f1206eec702609d6,
sourcea58190e62aaad411f9f10934fdf7f272ebcff76f14fa606158b8927ddadcb74f.
artifacts/doom-trace-r307/package-reviewed/DoomTrace-id-only.face,26recursos,
16parts32194MASS+512control<=32768. package/package-finaldescartadosNOpins.
tools/doom-trace-source.mjs+trace-main.lua, mismoELFbase365219957/604992B6a5d43...
yWADcarrier365219963; módulo rw4png304. NewUIui_base365219956. SinC/WADreenviados.
32Lua22base+10tracePASS; paquete/source/readback/tamper/gateclosedPASS.
build/prepare r307 OfflinePreparedPASS; helperclosedSHAd403798e60b91c7fa9c124aeef50024465b75eee30a34fbd28c45af04906b531.
Todosgatescerrados NodeStaticfalse/r167,C#Static/Largefalse,deployment/RAMPNG/
resume/controlfalse. Journaltools/local/pc-rfcomm/doom-trace-r307.json NOcreado.

Plan docs/doom-trace-physical-plan-r307.md, PENDIENTEautorización 1install+1START
observado≥50%. AlSELECCIONARpuedeRECUPERAR/retiraroldmod SOLOlease/hash/registro/
estado/dueñocoincidentes; STOP/JOIN/cache/rmmodnormal, noadopciónciega.
STARTone-use14B marca, RAMantesCRC ydespués, mismosumbralesno rebajados.
PNGpreflight33B/firma320x200/seekend192278/EOF/close antesImage. Sincontroles,
animaciónsifunciona,EXIT30s. Erroresfijan2dígitosyFREE/MAX; safetrySTOP ytick
continúacierre, rótuloCLOSEDabajosoloalrecibirCLOSED aunqueERRORsigavisible.
SiSTOPfalla módulos/lease se retienen; GCsoloSTOP. NoLogcrudo/nuevasPNGflash.
Codigos01CRC/marca,02RAM,10..13prechecks,14..18load/fresh/lease/start,19estado,
20open21header22size23EOF24close25Image26getsize27present30cleanup40recover.
Preview4barrasBLANCAS. Inicialpaneloscuro/no grid; siRECOVERINGesperarREADY/
CLOSED;siERRORinicialanotarcódigoFREE/MAX/CLOSEDsinSTART. START1sihabilitado,
CHECKINGdespierto,erroranotarmismosdatos; sijuego5s+EXITCLOSED; habitualmenús.
No pedirotraautorizaciónR304ya consumida; esteNUEVOpayloadsípendienteaprobación.
No instalar/push/CIremota sininstrucción. Solo commitlocal. Créditosprioridad:
no repetirensayos/suites/healhchecks porrutina ni investigarABIaciegas.

**Actual R305: DoomRAM instalada INACTIVA; DOS ciclos YAautorizados pendientes.**
Usuario«utorizado» aprobóR304. UNinstallRegisteredInactive311parts319frames/
640443TX,modeloFW/MD5/offset0bien,close/workertrue0. Finallydeployment/RAMPNG/
resume/controlfalse,C#Large/Staticfalse,rebuild/gates+packagePASS. HelpercerradoSHA
6759a08edfccaf8fecc5d16dbd73f6c3128d668cbc9c28f0b788664c6f6ab19b.
Catálogoindependiente13vs12previasactuales, flags/selecciónintactos,owninactivo/
eliminable,carrier365219963presente,1activa0unknown,cierretrue. NOexigir11estimado.
docs/doom-ram-png-install-r305.md. Journaldoom-deployment/ram-png-r304.jsonl
EXISTE; no borrar/recrear/reintentar; transfer.jsonlantiguointacto. Artifacts
doom-ram-png-physical-r305/install-result.json(posibleUTF16LE),catalog-after.json.
NO pedirautorizaciónotra para mismosDOS ciclosmanuales. DoomRAM5barrasNARANJAS,
READY/START1/CHECKINGdespierto, PLAYINGfullimageMOVIMIENTO/controles/pausa,
EXITantes30sCLOSED. Solosiprimerobien+CLOSED: SINsalirdeesferaSTART2(quick),
EXITselectorhabitualmenús/corona. Antebasura/ERROR/vacío/suspensión/falloNOciclo2,
NOrepetir/reabrir; volverdesdeAjustessiresponde. No tercertrial. Resultado pendiente,
NOclaimfix/FPS. GatesPCcerrados no deshabilitanSTARTmanualinstalado. Solo commitlocal.

**Actual R304: DoomRAM animado por PNG virtual listo SOLOPC, pendiente aprobación.**
Usuario confirmó4borrados DoomStill/DoomRun/DoomPlay/MemInfo. Conteoesperado11
desdeúltimo15, NOconsultadonuevamente. Preservar DoomLauncher365219963/WAD y
DoomPNG365219958. Pidió acelerar/créditos: NOmásdiagnósticosmínimos/CI/push.
PreguntaCHECKING: temporal; ahora reducción SOLOsegundoSTARTsin salir de misma
instanciaLua. Reabrir verificaotra vez. Audio/savegames contemplados sinimplementar;
prioridad imagenmovimiento/salida, guardados,sonido. observations-r304.json.

Plan docs/doom-ram-png-physical-plan-r304.md. NO hardware nuevo autorizado/hecho.
DoomRAM365219957634212B, SHA98d0c6c54a16e4c1575e170d6add896df742d26cbff445a6d4a38bfa31338326,
source1c0396d3973d2c7629351a8f5af5b561ac4b349310239d56882cf599dd6deff7.
build/doom-ram-png-r304/package/DoomRAM-id-only.face. ELF604992B SHA6a5d43df8a3c9753c6b943ca5fd25a9835edd7cd97b4f93a33aa199d8926704e.
Módulorw4png304, base365219957/lua, WADcompartido365219963/lua/doom1.wad.
ReproduceexactamenteoldELF980e13... antesenlace. Mismoengine/adapter4MiB/bindings.
Nuevo png-view.c/h PNG192278B virtual desdeRGB565,1KBCRCtable,NOPNGbufferextra
ni escriturasframeflash. Decoderstock puedeasignarRAM. Transport generado
porpngTransport cambiaheader/pathy prepararCRC al adquiriframe; sourcesviejasintactas.
Nuevo/dev/rw4doomimage.png, controla/rawigual. UIreusable/controles100ms/30sSTOP,
cache/leasecleanupigual. No FPS/hardwaredecoderprobados. VerplanriesgosOOM/panic.
811CchecksS3+30VFSreal+22base7Lua+7protocolscenarioPASS; oldgates/nativeclosedPASS.
No repeat testsjustbecause. build/package inmutables: no rerun sobre reviewexistente.
pc-doom-ram-png.mjs prepare PASS sinprivateI/O/radio; install gateclosedPASS.
NuevafactoryprepareDoomRamPngpin; kindreview-ram-png-manual; nativeLaunchertrue.
NuevoPHYSICAL_RAM_PNG_REVIEWED=false ademásdeployment/resume/controlfalse;
ProbeStatic/Largefalse. Nuevojournaldoom-deployment/ram-png-r304.jsonl NOcreado,
transfer.jsonlanteriorintacto; mismowatch.lockglobal. Noresume/retry ennuevoCLI.
Pedirrevisiónconcreta1install634KB+2ciclosmanualesobservados≥50%,segundosolosi
primeroCLOSED/fullframe/inputsbien, sin salirLua parafastSTART, luegoEXITselectorhabitual.
Preview5barrasNARANJAS. install311partes~40-60sestimado. Cnuevo síesriesgo aunque
bindingsiguales; nofirmware/recoveryintegral. Trasaprobarabrirdeployment+RAMPNG
yC#Largeúnicamente; build/prepare/installUNAVEZ; finallyrestore/build/testclosed,
siinstalócatálogoindependiente. No cambiarvínculos/healthchecks porrutina.
Solo commitlocal, NOpush. Nuevoplan NOautorizado todavíaporelusuario.

**Actual R303: DoomPNG FRAME COMPLETO CORRECTO, retorno normal confirmado.**
Usuario: todo bien, Doom completo, menús/cambioesfera normales. Registra
observations-r303.json y docs/doom-png-result-r303.md. Frame320x200, NO390x450
demostrado ni animación/FPS nuevo. FNV/EOF/cierres inferidos por código antes
Image; no mediciónindependiente. RutaBIN principal sospechosa, causaexactapendiente.
NOescribir PNGcontinuamente enflash paraanimar. Próximameta animación porRAM.
Ensayo R301/R302 consumido. Ningúncomandofísico trasreporte; gatescerrados.
Usuario pregunta québorrar: desdehabitual puedeeliminar DoomStill/DoomRun/
DoomPlay/MemInfo (365219959/961/960/962); NO borrar DoomLauncher365219963
carrierELF/WAD4.8MB ni DoomPNG365219958 referenciaéxito. Últimocatálogo15;
posiblecupo, espacioFS/RAM no medidos. Borrados NO ejecutados/confirmados.
No tocarjournals ni exigirhistóricodecatálogo igual trasborrados manuales.
Solo commitlocal, NOpush/CIremota. No nuevoensayofísico aprobado.

**Actual R302: DoomPNG instalada INACTIVA; ensayo manual YAautorizado pendiente.**
Usuario«ok» aprobó planR301. UNinstallr301 RegisteredInactive,16parts25frames/
32351TX,close/workertrue0. Finally Nodefalse/r167+C#Staticfalse/Largefalse,
rebuild/testpackageclosedPASS. HelpercerradoSHAff8173ecd2b6c14455ac1f7d9a73efcf63d2861148c563cddbe26c554468f594.
Consultaindependiente15entradas,14previasflags/selecciónintactos,owninactivo/
eliminable,carrierpresente,1activa0unknown,cierretrue. docs/doom-frame-png-install-r302.md.
Journal tools/local/pc-rfcomm/doom-frame-png-r301.json EXISTE no borrar/recrear.
artifacts/doom-frame-png-physical-r302/install-result.json(posibleUTF16LE),catalog-after.json.
Instrucción: DoomPNG3barrasCIAN, referencia limpia antesSTART, START1,
CHECKINGdespierto~CRC+5sconversión, PAUSEDobservar5sfullframe/franja, sincontroles,
EXITantes30s/CLOSEDref,habitualmenús/corona. SiERROR/vacío/dormidaNOreabrir/repetir.
NO pedirautorizaciónotra para mismoensayo, NOinstalarotra vez. Resultado pendiente.
GatesPCcerrados no deshabilitanSTARTmanualinstalado. No afirmarfix todavía.
Solo commitlocal, NOpush/CIremota. No comandos extra por rutina.

**Actual R300/R301: DoomStill congelado sigue corrupto; DoomPNG listo SOLO PC.**
Usuario: «todo ok excepto la imagen», sigue franja pequeña/basura dentro del
recuadro. Reporte global favorable al resto del lote; sin estados individuales.
observations-r300.json, docs/doom-frozen-result-r300.md. Renovación rápida NO
necesaria; causa exacta pendiente. No pedir repetir DoomStill ni otro healthcheck.
R298/R299 ensayo consumido. Ningún comando físico después del reporte.

DoomPNG ID365219958,31704B, SHAae84530371510fd13e4e4803959c3fc954704ad3405fa6e4b285a0e9888d566c,
sourcefd17dab3c793f73d81c34b36f8546ac3eeb1aafc6c09f8a4d9dfe5e5f81b2181.
artifacts/doom-frame-png-r301/package/DoomPNG-id-only.face. Plan completo:
docs/doom-frame-png-physical-plan-r301.md. NO instalado/ensayado/autorizado.
Meta: raw32+128000RGB565/FNV ->unaPNG195651B propia (retener trasEXIT), noBIN.
MismoELF/WAD/CRC/RAM/one-shot/PAUSE/STOP30s/cleanup. Cuatrofilas/tick50ticks,
sininputs/RESUME. Raw callbacks físicamente nuevos; nuevaFlash196KB+memoriaPNG.
PNG incompleta se retiene en error, nunca reintentar/reabrir; captura se cierra
antes STOP/JOIN/crearImage. Error=>STOP sin unloadciego, mismo lease/recover.
PC:22encoder casos,64000píxeles/202CRC/Adler comprobados,22+20+7UI PASS.
Paquete15recursos/16parts32034MASS+512control<=32768; pins/gateclosedPASS.
prepare r301 OfflinePrepared. HelpercerradoSHA42836543bc947052bc19fb283af78a575ea71949437cf33dd306519c64b586dd.
Gates Nodefalse/r167,C#Staticfalse/Largefalse; no cambiaron gates ni C ni ELF.
Journal tools/local/pc-rfcomm/doom-frame-png-r301.json NO creado.
Siguiente SOLO tras aprobación concreta:1installr301+1STARTmanual observado≥50%.
Preview3barrasCIAN, referencia limpia antesSTART, CHECKINGCRC+5sPNG, PAUSED5s,
EXITantes30s/CLOSED/ref, habitualmenús/corona. No3ertrialDoomPlay ni borrarfaces.
Restaurargates/build/testclosed finally comoR299. Sinretry/resumeautomáticos.
Solo commitlocal,NOpush/CIremota, no datos privados o firmware/WAD enGit.

**Actual R299: DoomStill instalado INACTIVO; ensayo manual ya autorizado pendiente respuesta.**
docs/doom-snapshot-install-r299.md. UNinstallr298 completóRegisteredInactive:
15parts24frames30400tx,close/workerexittrue0. FinallyNodefalse/r167+C#Staticfalse,
rebuild/testpackageclosedPASS,Largefalseintacto. HelpercerradoSHA
7b93832cea2a92fc3824568e8ad4fe3b38e2d51a6f26b74b782ce5e364390327.
Catálogoindependiente14entradas,13actualespreviasIDs/flags/selecciónintactos,
carrierpresente,DoomStill365219959inactivo/eliminable,1activa0unknown,cierretrue.
Journal tools/local/pc-rfcomm/doom-snapshot-r298.json EXISTE; no borrar/recrear.
Artifacts/doom-snapshot-physical-r299/install-result.json(posibleUTF16LE),catalog-after.json.
Preguntaasyncyaenviada: DoomStill4barrasMAGENTA,PNG4colores/cuadrículaANTESSTART;
siestábien START1/CHECKINGdespierto/PAUSEDobservar5s (fullframeofranjabasura),
sincontroles,EXITantes30s/CLOSED+cuadrícula,volverhabitualmenús/corona.
SiPNGmalNOSTART,siERROR/vacío/dormidaNOrepetir/reabrir. Esperarrespuesta.
NO pedirautorizaciónotra para mismoensayo YAaprobado. No declararcausa/fix.
GatesPCcerrados no deshabilitanSTARTmanualinstalado;marcaunusopropia.
No comandosfísicosextra porrutina. Solo commitlocal NO push/CIremota.

**Actual R297/R298: FOTOS CONFIRMAN RENDER CORRUPTO; diagnóstico congelado listo SOLOPC.**
Usuario fotos:solofranjaarribamarcadaesDoom,restobug. Assistantreconocióvaloración
optimista. NOHUDnormal, NOframecompleto/MVPvisual. docs/doom-render-corruption-r297.md.
Último usuario «okahorasi ejecuta»: autoriza investigación/cambiosPC, no hubo
nuevohardware. Mantenergatescerrados hasta revisión plan docs/doom-snapshot-physical-plan-r298.md.
Se revisaronCcodec/VFS/ABI/APventanaslocales; NOcausademostrada, NOcambiaron
formatos/stride/bindings/ELF. PreparadoDoomStill: UI PNGreferenciacuadrícula
320x200, START1marca/CRC/RAM/sameELF,primerframe→PAUSE+UNImage, sinrenovar,
inputs/resumedisabled, EXIT/autoSTOP30s/cleanup y referenciaretorna.
Si PNGbien+frozenmal descarta renovaciónnecesaria; frozenbien apunta timing/
lifetime, no pruebaexacta. Este payloadNOesfixconfirmado.
ID365219959,29772B,SHA09e9da3ff0301a2f479abe8cd9c98b0fe055c7f0edb13e9ee72a2fe27e45f7ba,
source7c2af63e4832d32199256f107b053ae9bba1f260e006bf5fd535dd14672fdb59.
artifacts/doom-snapshot-r298/package/DoomStill-id-only.face;preview4barrasMAGENTA.
47casosLua22+20+5PASS,native/UI simulated,NOCnuevoejecutado. Pack20recursos/
15parts30083wire+512controlpinsclosedPASS. prepare r298PASS;helperclosedSHA
7099eba1e226cc154db255efdd57427e04cafad049440f6f2975c1c8382076c4.
StaticSpec r298nuevo; Nodefalse/r167,C#Static/Largefalse. Journalnuevo
tools/local/pc-rfcomm/doom-snapshot-r298.json NOcreado. Plan1install+1START
manualobservado≥50%,PNGbaselineANTESSTART; si bad noSTART, no controls,
PAUSEDframefijo5s, EXITCLOSED,habitualmenús. NO reintentar/reanudar/borrar apps.
Con14faces puedellegar15; rechazo full parar. Preguntar revisión precisaantes
deinstalar,sourceusuarioinitialhardwaregate. No screenshotsprivadoscommiteados.
Solo commitslocales, NO push/CIremota. No nuevasmétricasinventadas.

**Actual R296: usuario respondió globalmente TODO OK al lote DoomPlay, con detalle visual pendiente.**
docs/doom-reusable-observation-r296.md y observations-r296.json. No repetir
checklist/ensayo por rutina: respuesta favorable a2ciclos/selector/retorno,
sin estadosdesglosados. Describe rayones/colores BAJO imagen/casi mitadpantalla.
NO asumir normal ni corrupción: puedeHUDdentrorectángulo o artefactofuera.
Geometríajuego x35..354,y35..234; HUDúltimasfilas,estadoPNGx20y249 180x20,
dotx350y249. SerializerRW4BGRA4bytes+header4,internoRGB565;S3otroformato.
Inspecciónlocalsin causademostrada; NO cambiócódigo ni hubo hardware después.
GatesPCsiguen cerrados. Siguiente: si YA tienefoto pedirverla por mensaje
normal (NOasync herramienta de texto para pediruploads); no reabrir/arrancar
solo porfoto. UbicarHUD/estado/artefacto antesdeotraprueba/payload.
No inventarFPS/RAM/cleanupindependiente. Autorizacióndosensayosconsumida según
reporte global, no ejecutar un tercero. Solo commitlocal, no push/CIremota.

**Actual R295: DoomPlay instalado INACTIVO, DOS ciclos manuales YA autorizados pendientes.**
docs/doom-reusable-install-r295.md. UNinstallr294real completó RegisteredInactive:
15parts24frames29460tx,close/workerexittrue0. Finally restauróNodefalse/r167 y
C#Staticfalse,helperrebuild+testpackageclosedPASÓ;Largefalseintacto.
HelpercerradoSHA9bb86dc936d00f2e8c5adbd64eabbd842138a191b90fb6b1f86654da3d73cb34.
Consultaindependiente14entradas,13previasIDs/flags/selecciónintactos,
carrier365219963presente,DoomPlay365219960inactivo/eliminable,1activa0unknown.
Journal tools/local/pc-rfcomm/doom-reusable-r294.json EXISTE no borrar/recrear.
Artifacts/doom-reusable-physical-r295/install-result.json(posibleUTF16LE),catalog-after.json.
Asyncyaenviada: elegirDoomPlay4barrasVERDES(noDoomRun),ciclo1START1/CHECKING
despierto/juego/EXITantes30s/CLOSED; longpresszonaVACÍA sobreSTART→selector,
habitual→DoomPlay,ciclo2igualSINPC/reinstalar,volverhabitualmenús/corona.
Si primerselector/UI/ERROR/dormidaCHECKING falla NOciclo2/reabrir/insistir;
volverdesdeAjustessiresponde. Esperarresultados, NO pedirotraautorización para
esosmismos2ciclosyaaprobados. No afirmarseleccionfix/relaunch todavía.
GatesPCcerrados NOdeshabilitanDoomPlayinstalado,permiteSTARTmanualtraschecks.
Noejecutarmáscomandosporrutina. R293realDoom1ciclo sigueevidenciabase.
Solo commitslocales NO push/CIremota. Histórico debajo.

**Actual R294: DoomPlay reutilizable PREPARADO SOLOPC; no autorización física aún.**
Plan docs/doom-reusable-physical-plan-r294.md. R293realDoom1ciclo+CLOSED conocido;
normal confirmado, NO repetir preguntas ni comandos físicos por rutina.
UI nueva rootnoCLICKABLE; gamegroupCLICKABLE/PRESS_LOCK soloactivo, HIDDEN+
noCLICKABLE enreposo, STARTsolovisibleidle. C/controlador/ELF/WAD originales
sin cambios. Wrapperreusable sinmarcadeunuso; CRC/RAMcadaSTART,soloREADY/CLOSED,
ERRORbloquea esaactivación,300ticksSTOP y pageOnPauseSTOP. No contador2usos:
payloadpermiteSTARTmanualrepetido; planobservadosolo2ciclos.
NuevoID365219960,DoomPlay,preview4barrasVERDES,28832B,
SHAf66628fe42ef40e5f69e5348bf52487e849d4047f5fa9506427228aff3430799,
sourceSHA19d0a8647d0b37404d5c5cd5a53a00c76579cf22a86fcd808a10cac164afa81e.
Salida artifacts/doom-reusable-r294/package/DoomPlay-id-only.face.
53casosLuaS3pasan22+20+11:native/UI simulados,WADCRC real, noC nuevoejecutado.
Pack19recursos/15parts29143wire+512controlpins/gatepass;R291pinsintactospass.
Prepare r294PASA,helpercerradorebuildSHA13ee615c879a161c59cc04acf564594bc6d566766c0cea6326d9e284841bf2e4.
GatesNodefalse/variantr167,C#Staticfalse/Largefalse, ningunoabierto.
Siguienterevisión: UNAinstallr294 inactiva +DOS ciclosusuarioSTART/juego/EXIT,
selectorporzonaVACÍA sobreSTART→habitual→DoomPlay otra vez SINPCentre ciclos.
Si falla primerselector/ERROR/noframe/dormidaCHECKING NOsegundociclo/reintento.
Si autorizado habilitarStatic+r294+C#Static temporal,build/prepare/UNinstall;
finallyrestaurar/rebuild/testclosed,catalogindependiente. Journalnuevo fijo
tools/local/pc-rfcomm/doom-reusable-r294.json NOcreado. NO borraroldmarkers/apps.
Solo commitslocales, no push/CIremota. No afirmar fixselector/relaunchfísico aún.

**Actual R293: DOOM REAL FÍSICO funcionó; ensayo autorizado consumido.**
docs/doom-first-run-result-r293.md y experiments/doom-runtime-rw4/observations-r293.json.
Usuario: CHECKING completó, pudojugar, imagenarribapequeña, todosbotonesbien,
EXIT→CLOSED. Pulsaciónlarga NO abrióselector; volviódesdeAjustes y esfera/
corona/menúsnormales confirmados. NO pedir confirmación normal otra vez.
NO comandos físicos despuésdelreporte, NO reabrir/repetirSTART/borrarmarca,
instalar/reiniciar/alterarvínculoautomáticamente. GatesPCcerrados comoR292.
CLOSED sugierepostcondicionesJOIN/cleanup/rmmod/nodos del controlador; NOhay
consultaregistronativoindependiente. No inventarFPS/RAM/latencia/estabilidad.
Render320x200arriba previsto, nofull390x450. Unciclo observado, faltaMVPgeneral.
Siguientecheckpoint PC: launcherREUTILIZABLE conliberacióncontactos/selector
trasEXIT y dosciclos usandoELF/WAD existentes sinreinstalar. Nuevo plan+
aprobación antesdeotromódulo/ensayofísico. HipótesisUI:root/controlesCLICKABLE/
PRESS_LOCK visiblesdespuésCLOSED; HoldPadocultajuego+rootnoCLICKABLE alreposo.
Reproducir/validarantesdeatribuircausa. No modificarpayloadR291yaaprobado ni
presumir susegundoarranque; mantenerpinsyartefactoshistóricos. No push/CIremota.

**Actual R292: DoomRun instalado INACTIVO; ensayo MANUAL ya autorizado, pendiente respuesta.**
docs/doom-first-run-install-r292.md. Usuario aprobó UN ensayoR291≥50%observando.
UNinstallr291real: RegisteredInactive,16parts25frames32191tx,close/workerexittrue0.
FinallyrestauróNodePHYSICAL_WRITESfalse/variantr167 y C#Staticfalse,rebuild/test
packagegateclosedPASÓ. Largefalse intacto. HelpercerradoSHA
90a6d6cad53988daa8b0a09e17d096f3473b276d3e45135f363348dd829d681b.
Consultaindependiente13entradas,12previasIDs/flags/selecciónintactos,
DoomRun365219961inactivo/eliminable y carrier365219963presente,1activa0unknown.
NO reenviar/reintentar/activarporPC. Journalnuevo tools/local/pc-rfcomm/
doom-first-run-r291.json YA existe, no borrar. Artifacts/doom-first-run-physical-r292/.
Preguntaasync yaenviada: elegirDoomRun5barrasCIAN(noDoomLauncher),siREADY
START1, CHECKING~1minmantenerdespierta con toquescortosvacío; E1M1/UPLEFTFIRE
brevesEXITantes30s,CLOSED/ERROR,volverhabitualyreportarmenús.
Si falla/duermechecking no repetir/reabrir. Esperarresultado: NO pedirotra
aprobación para mismoensayo yaautorizado. No afirmar Doom ejecutado aún.
GatesPCcerrados NO bloqueaninstalledDoomRun allow_native=true detrásSTART/checks.
Si usuario reportafallo, documentar y diagnosticarPCsinreintentonativociego.
Solo commitslocales, NO push ni CIREMOTA. Histórico debajo.

**Actual R291: primer arranque Doom PREPARADO SOLOPC; pendiente autorización.**
Plan docs/doom-first-run-physical-plan-r291.md. No hardware nuevo; R290normal.
DoomRun ID365219961,31544B,SHA58f8a9b5d62cd1ac6851be1153029539771e2eaac13c0b5860d9c41e23b61698,
sourceSHA ddf70b83387d6fe554bcb965f93a8e075e3f8b6bafd13605f277fcd5a75480dd.
Salida artifacts/doom-first-run-r291/package-final/; borradorespackageyroot NOusar.
Nuevo tinyprofile UIpropia, carga ELF/WADde365219963sinreenviar4.8MB.
CRC32stream8192porTimer100ms,checksheaders/size,RAM UMEMfree6467285/largest4194320,
marcaunuso14bytesANTESchecks, STARThumanmanual,300ticks~30sSTOP, pageOnPauseSTOP,
salida JOIN/cleanup/identity/rmmod existente. CooperativoNOwatchdog;ELF120scooperativo.
42casosLuaS3pasan(22base+20first),WADrealCRC4196020/371943786; native/UI simulated.
No C nuevo ejecutado siquieraenVMenestaetapa. Testpackage19recursos/16partes/
31874wire+512controlpinsyclosedgatepasa. prepare r291 PASA, helperrebuildcerrado.
staticSpec r291 añadido; PHYSICAL_WRITESfalse/REVIEWED_VARIANTr167 y C#Staticfalse;
gatesgrandesfalse. NO install/activar/C físico hasta aprobación explícita.
Siguiente pregunta concreta UN ensayo installr291(inactivo)+selecciónSTART1,
CHECKING~1minmantenerpantalla, E1M1/controlesbrevesEXIT, volverhabitual.
Si aprobado: sóloStaticgatevariant=r291+C#Statictrue temporal,build/prepare/
UNinstall,finallyrestaurar/rebuild/testclosed, catálogoindependiente.
Journalnuevo tools/local/pc-rfcomm/doom-first-run-r291.json (no creadooffline).
Si rechaza/corta NOretry/resume. Marcausonoeliminar. No garantías RAM/sandbox/
recovery; riesgosOOM/panic/corrupción, planexpreso. Solo commitslocales NO push.

**Actual R290: paquete COMPLETO instalado INACTIVO; reloj normal confirmado.**
docs/doom-large-install-result-r290.md. Usuario autorizó UNenvíoR289 y observó.
UN retry-no-data real terminó RegisteredInactive: expectedModel/FWtrue,
catálogo11/reviewedTwoRemovalstrue,INSTALL0,ACKmd5/status/offset presentes,
chunkausente→2048,offset0;2362MASS/2370frames/4872246tx. close/workerexittrue0.
FinallyrestauróDEPLOY/CONTROL_RETRY/RESUMEfalse y C#Largefalse,rebuild/gatesPASS.
Consulta independiente watchfaces:12entradas,11previasIDs/active/canDelete
intactos,nuevo365219963inactivo/eliminable,1activa,0unknown,cierretrue.
Usuario confirmó esfera/menús/desplazamiento normales. NO pedirlo otra vez.
PaqueteR2854827044/d0fc...ELF603760/980e...WAD4196020 YA almacenados por paquete;
hashesextraídosNO comprobados. allow_native=false; NO seleccionar launcher,
START/insmod/C/Doom físico, borrar/reinstalar/reintentar/reboot sin nuevo plan.
Journal real original termina attempt4RegisteredInactive, mantienehistoria;
NO borrar/renombrar/sustituir. Autorización envío consumida; gates cerrados.
Artifacts/doom-deployment-physical-r290/attempt-result.json(posibleUTF16LE),
catalog-after.json. HelpercerradoSHA d2efc024ad441e661d828b37348ec88303625425ec57380061423bf1c1b4e4c5.
Siguientecheckpoint prepararprimerarranqueDoomlimitado con archivos/RAM/imagen/
salida/limpieza agrupados en plan. Evaluar launcherPEQUEÑO que use recursos
ya instalados para no reenviar4,8MB; no habilitarnativoautomáticamente.
Solo commitslocales, NO push/CIremota/auditoríaspublicación. Histórico abajo.

**Actual R289: intento3 consumido, reloj normal confirmado; NO enviar sin nueva autorización.**
docs/doom-large-install-removals-r289.md contiene resultado+plan concreto.
Ejecutado UN retry-no-data autorizado: modelo/FWtrue, catálogo11 vs13,
CatalogPreflight/LargeSessionRefused,5frames185bytes0MASS,sin INSTALLnuevo.
close/workerexittrue; finally fuentes restauradas/rebuild/testgates cerrado.
Usuario confirmó borróDOSesferas y todo normal. No más consultas físicas.
Journal real original añade attempt3 Created/Uncertain, before/uploadnull;
NO borrar/renombrar/reemplazar/freshinstall. Ahora preparado attempt4 SOLO
patrón firmado1control+2/3preflightsinMASS; catálogo exige exactamenteDOSbajas
eliminables, sin altas/flagsalterados; conserva selección ACTUAL. Noattempt5.
No nuevo hardware después de corrección.14casosnuevos+17catálogo+18retry=49PC
pasan. Mismo paqueteR285 ID365219963/4827044/d0fc... nativefalse.
Siguiente revisión: UNretry-no-data observador≥50%4–6min, sinactivar/C/Doom/borrar.
Solo tras aprobación DEPLOY+CONTROL_RETRY+C#Large temporales, RESUMEfalse,
rebuild/prepare/unenvío; finallyrestaurar/rebuild/testgates.
Artifacts/doom-deployment-physical-r289/attempt-result.json (posibleUTF16LE).
Solo commitslocales; NO push/CIremota/auditoríaspublicación. Histórico abajo.

**Actual R288: segundo intento autorizado consumido; NO continuar físicamente sin otra aprobación.**
Plan/resultado: docs/doom-large-install-preflight-r288.md. Un retry-no-data real:
LargeSessionRefused,5frames/185bytes,0MASS,sin INSTALL nuevo,close/workerexit true.
Fuentes restauradas finally + helper reconstruido + gates cerrados comprobados.
Consulta independiente: mismos13IDs, otra selección, ID propio ausente.
Usuario aún no confirmó estado visual después de ESTE intento. Preguntar junto
con revisión del siguiente envío, sin consultas físicas repetidas por rutina.
Journal real MISMO archivo: attempt1 cuatro estados anteriores; attempt2 solo
Created/Uncertain sin before/upload. NO borrar ni renombrar ni freshinstall.
Guard PC corregido: retry sin datos compara IDs/canDelete y guarda selección
ACTUAL; resume sigue exacto. Fases/reportes device/catalog seguros añadidos.
Continuación SOLO patrón firmado exacto attempt2 anterior, todos upload null,
recupera baseline attempt1 y añade attempt3; no attempt4. 16casos nuevos +18
retry anteriores pasan; gates CLI/C# cerrados. No nuevo hardware tras corrección.
Siguiente aprobación: mismo R285 ID365219963/4827044/d0fc... nativefalse,
UN retry-no-data, observador≥50% durante4–6min; no C/Doom/activar/borrar.
Solo tras autorización: DEPLOY+CONTROL_RETRY+C#Large temporal, RESUMEfalse,
rebuild/prepare/un comando; finally restaurar/rebuild/test cerrado.
Artifacts locales: artifacts/doom-deployment-physical-r287/attempt-result.json
(posible UTF16LE), catalog-after.json. No MAC/key/raw logs. Commits locales,
NO push ni CI remota/auditorías de publicación. Notas inferiores son históricas.

**Actual R287: primer intento grande AUTORIZADO falló antes de MASS. Reloj normal.**
Usuario aprobó un envío y observar≥50%. EjecutadoinstallR286: INSTALL0aceptado,
UploadIntent/MalformedProtocol,7frames/277tx,0MASS. close/workerexittrue exit0.
Gates restoredfinally/rebuild/test cerrados. Usuario confirmó esfera/menús.
Journal REAL tools/local/pc-rfcomm/doom-deployment/transfer.jsonl YA EXISTE,
4entradasCreated/InstallIntent/UploadIntent/Uncertain uploadnull. NO borrar,
renombrar ni freshinstall/resume. No instalación comprobada; INSTALL pudo reservar.
DefectoPC encontrado: grande exigía camposopcionales protoAck; pequeño toleraba.
Nuevo doom-upload-ack.mjs: envelope22/0 cifrado+ACK requerido, defaultsstock
status0/offset0/chunk2048, MD5si presente16matching. Freshsolooffset0; resume
requiereMD5+offsetexplícitos. Reporteetapa/presencia safe sin bytes ni hashMD5.
NO sabemos qué faltó realmente: no captura de presencia en R286.39casos pasan
incluidos16combinaciones y2sesionesPC completas ACKmínimo/defaults.
retry-no-data nuevo y CERRADO: soloattempt1 patrónexacto4registros, ningún
Uploading/batch; vínculo/paquete iguales, añadeattempt2 MISMOarchivo conhistoria.
No resume ni bucle. PHYSICAL_CONTROL_RETRY_REVIEWED=false ademásDEPLOYfalse y
RESUMEfalse; C#Largefalse. CLIopciones/claim capacidades distinguen modos.
18casosretryPC pasan. Dryrun en COPIA deljournal real validó firma+elegibilidad,
original hashidéntico, sinworker/radio; reporte offline-eligibility-r287.json
enartifacts/doom-deployment-physical-r286/. Nunca usar copia como fallbackreal.
Plan nuevo docs/doom-large-install-control-retry-plan-r287.md PENDIENTE usuario;
mismo paqueteR285d0fc...4827044/nativefalse, no C/Doom/activar/borrar.
Para futuro intento aprobado: habilitar DEPLOY+CONTROL_RETRY+C#Large, mantener
RESUMEfalse; prepare y UN retry-no-data; finallyrestaurartodos/rebuild/gates.
No ejecutar sin nueva autorización. Último hardwareR286; soloPC después.
Commit local solamente; no push/CIremota. No repetir engine/UI/memoriatest.

**Actual R286 PC: instalador grande/journal integrado; NO hardware nuevo.**
docs/doom-deployment-journal-r286.md + doom-large-install-physical-plan-r286.md.
Nuevo doom-deployment-journal.mjs: destino/key→tag+HMAC derivados, model/FW+hash
de paquete en cada snapshot, HMAC/cadena SHA/seq; archivo transfer.jsonl fijo,
wx watch.lock exclusivo/tokenpropio. Write+fsync antes de batches, 2MiB límite.
Crash/lockviejo/incompleto/duplicado NO se rearma. Resume solo explícito con
cadena completa/statusUncertain+bounds+MD5/catálogo iguales. No borrar privados.
Ruta real tools/local/pc-rfcomm/doom-deployment/ AÚN NO creada por prepare.
Tests artifacts/doom-deployment-r286-UUID/ con valores SOLO sintéticos.
Nuevo pc-doom-deployment.mjs plan|prepare|install|resume pinR285d0fc...4827044.
prepare PASA, valida archivo/fuente/helper+formatos privados sin conectar.
factory prepareDoomLowMemory; pins R278/R282 intactos. Synthetic size4827044.
doom-deployment-physical.mjs capability nueva; worker solo se crea al opened,
DESPUÉS journal. PHYSICAL_DEPLOYMENT_REVIEWED=false, RESUME_REVIEWED=false;
LargePhysicalReviewed=false C# intacto. Nonce real aleatorio; fixture sigue71.
Core doom-upload-pc-session.mjs compartido entre peersPC y entrada física propia;
uploadToPcAdapter/reviewedAdapter distintos, este último exige peer branded.
reviewedLargeExecutable exportado de pc-pipe, limita al helper propio con hashes.
No allow_native true: mismo paquete de R285 contiene carga C DESHABILITADA.
33casos --local-package PASAN, incluye IPC C# real/sockets sintéticos,2362full/
2351resume; antes29/30casos se ampliaron. 22legacy también pasan; gates CLI
install/resume/C# y capability falsa pasan. No CI remota/push. Último físicoR283.
Siguiente: revisión del único envío grande INACTIVO, planconcreto escrito.
No ejecutar automáticamente, no START/insmod/activar/delete/reintentar. Autorizar
envío no autoriza reanudación ni C/Doom. Usuario debe observar batería≥50%.
Guardar SOLO commits locales como pidió; no repetir tests pasados por rutina.

**Actual R285 PC: candidato RW4 -mb4 y paquete nuevo listos, NO enviados.**
Ver docs/doom-low-memory-candidate-r285.md. tools/build-doom-low-memory-rw4.mjs
reusa source EXACTO adapter-low.c R284 SHA2e7e2146...; recompila solo adapter
v8-M.main/thumb/soft, reproduce ELF R282 previo5365bf... antes de nuevo link.
ELF603760 SHA980e13cc85813d463d229aec93b4b2000654b188b3c80a36bdcf30eaa3a3c8a5.
build/doom-low-memory-rw4-r285/review.json y doom.elf. 80engine objetos/libc
reutilizados, 0imports y3relocs anteriores. NO ejecutar ELF RW4 en VM S3.
package-doom-launcher.mjs rw4-low-memory genera20recursos, mismoID365219963,
módulo rw4doom282/basepersistente, allow_native=false. Paquete4827044 SHA
d0fc0d8257e9a384b42129f312de99570b49dade455511d0fc5fddd80fecf048.
SourceSHA54cd86feea0b3cf6639cb9848a0d584856b4aa83e611b931abe3508373cd2ea6.
2362partes/wire4871948 +8192 cabe4900000, pins anteriores NO aceptan nuevohash.
No factory/gate/transfer añadido aún para nuevo carrier. No más hardware R285.
GNUsize confirma .text203880/.rodata130964/.data61172/.bss503088: raw899104;
modelo loader alineado text334844/data564264=899108. +S3peak4486833+stack32768
=5418709, margen1586419 frenteUmem libre. Reservar1MiB como SUPUESTO deja537843,
NO cota medida, no prueba de fit. Picos físico/loader/UI/mapa malloc pendientes.
inspect-doom-loader-memory.mjs fija SHA firmware+objdump y2500bytes4ventanas.
Capturas privadas artifacts/research/doom-loader-r285/. Load0x1e7890 dos
grupos alignsection/round4, shdr640bytes, IObuf32inicial ampliable, bind2048
buffer+28nodos caché. No total loader2048 ni pools separados garantizados.
Siguiente: instalador grande vinculado a destino/hash +journal/lock privado,
plan concreto posterior para hardware. No repetir tests S3/memoria aprobados.
Gates siguen cerrados. Usuario quiere SOLO commits locales; no push/CI remota.

**Actual R284: MemInfo completada y Doom -mb4 probado en S3.**
Usuario aporta fotos y confirma menús/retorno habitual. Observations JSON
experiments/memory-preflight/observations-r284.json, sin fotos privadas.
Pool visible IMG?CACHE: total13631144/free9160312/largest8413048; nombre exacto
desconocido (? sustituye _ o -). UMEM total11031720/free7005128/largest6928624.
No sumar pools; malloc/loader mapping no demostrado. Medida NO 32MB libres.
Usuario pide ahorrar: commits locales, NO push/CI remota/audit de publicación
innecesarios. Mantener privacidad/exclusiones/gates; no subir nada nuevo.
Nuevo tools/build-doom-low-memory.mjs reproduce ELF S3 R282 byte exacto,
recompila SOLO adapter generado con -mb4 (opción upstream) y argc10. No cambia
fuentes originales/RW4/launcher ni objetos Doom. ELF S3-only610568 SHA
8400146175448f1f9a1b3b87325bede2accea8604c35835c624bc9bf9da45ccc.
tools/test-doom-low-memory.mjs + low-memory-r284.lua pasan DOS ciclos reales
sin UI nueva: E1M1, framesRGB565/143colores, movimiento/giros/fuego/pausa,
STOP/JOIN/rmmod/14alloc14free/cleanup0. Pico4486833 vs6583985: ahorro2MiB.
Resultados build/doom-low-memory-r284/test-result.json; ELF/script /tmp retirados,
VM conserva launcher READY anterior y archivos persistentes sin cambiar.
Proyección RW4 oldstatic899092+4486833+32768=5418693, margen1586435 antes
loader/allocator/UI/cachés/variación. NO decir que físicamente cabe probado.
Siguiente: candidato RW4 con -mb4 y presupuesto/loader, journal grande. No
repetir MemInfo ni más microprobes. No ensayo C grande físico autorizado.
Detalle docs/doom-memory-budget-r284.md. R283 de abajo es historia ya completada.

**Actual R283: MemInfo instalada inactiva; lectura manual PENDIENTE.**
Usuario autorizó UN ensayo y puede observar batería≥50%. Envío único
RegisteredInactive11partes/TX21768/20frames/16rx, close/workerexit true;
catálogo independiente autenticado confirma inactiva y previas conservadas.
Gates restaurados en finally/rebuild/testgates pasan. Git sin cambios de gates.
Journal tools/local/pc-rfcomm/memory-preflight-r283.json YA EXISTE: NO borrar,
reinstalar, reenviar ni rearmar. Report post-install.json en artifacts propio.
Se pidió al usuario seleccionar MemInfo, READ RAM UNA vez, MODE fotografiar
TODOS los pools y volver habitual/confirmar menús. Esperar esa respuesta;
NO asumir lectura/UI/salud confirmadas por catálogo. RAM física desconocida.
Ver memory-preflight-r283.md y memory-preflight-physical-plan-r283.md.
45 contratos Lua/parser/UI pasan, lectura real S3 /proc/meminfo pasa. No shell,
C, timers ni writes de Lua; snapshot4096B/EOF/cierre, MODE recorre sin releer.
UI widgets simulados, composite PNG inspeccionado, no live selection R283.
ID365219962 paquete21216B SHA c497120e409fa0d7412583d1f381033d6eab9476bc21d5205e8ac42aa5d3985b.
SourceSHA28f5c98dd1e7a07a4aa0b49d1f1c1bb0768b62b25aed6a1e80c8d18c087679a0.
50 recursos exactos, compiler sinADB; artifacts/memory-preflight-r283/{tests,
review}.json, MemInfo-id-only.face y layout.png. Empaquetador no sobrescribe.
staticSpec r283 + prepare pasa; verificador C# corregido5→6 fuentes actuales.
Gates Node/C# cerrados comprobados; último físico R283, lectura pendiente.
Build cerrado5284909ae14fbe585d28910fd78a7010c8d53bddc347318dee139ceeeb3ac0a7.
CI añade45contratos sin assets privados. Sesión sintética r283 pasa48casos.
Nuevo prepareDoomLauncher pin exacto R282, allow_native=false; vieja fábrica
R278 intacta. Copia/byte alterado/rechazo vieja fábrica comprobados.
Journal/lock de despliegue GRANDE contra destino físico aún pendiente; NO
describir journalPC R280 como instalador físico listo. Antes obtener RAM real.
Siguiente: respuesta del usuario del ensayo MemInfo YA instalado;
NO abrir gates ni reinstalar. Valor MAXFREE mostrado literal, no inferir
heap usado por malloc ni sumar GImageCache/Umem. Pantalla verde=parser, no fit.

**Actual R282 PC: launcher y WAD persistente integrados y probados.**
[Detalle](doom-persistent-launcher-r282.md). No hardware nuevo; R270 último físico.
Nuevo doom/platform-rw4/launcher/{controller,main}.lua, tools/*doom-launcher*.mjs,
experiments/doom-runtime-rw4/launcher-tests-r282.lua. RW4 ID365219963/módulo
rw4doom282, allow_native=false; PC ID365799913/rw4doompc282 allow_native=true.
WAD compilado en AMBOS adapter/transport al base/lua/doom1.wad persistente.
ELF previo reproducido antes de recompilar solo esos dos C; 80C no repetidos.
RW4 ELF603728 SHA5365bf23602cc9b4fc8a55a0e0e29459518614dc1b240d1a81182d76f70bdf29.
S3 ELF610540 SHA97a684758b8e19588a45bb2825f27a21f7454e4e5efba803f73a4a7ea8b28239.
Build/pack tools rw4|s3; build no sobrescribe review completo, package permite
misma payload/review presupuesto, archiva metadata inicial. 20 recursos exactos;
no asumir unique-path-string porque WAD path ahora aparece dentro del ELF.
RW4 package4827012 SHA1d6df25e064336122ce56449856d828dd1e30532d4b8fcb0c1467a4343db799b.
S3 package4833824 SHAccea73b8d3d0109366fa09974cd5ff5239eb1aaf11184238dd4c324404f7867d.
Bitmap labels propias: no fuentes. START manual; r+b control; lease propia
SHAesperado+registro definido hastaNUL; shell capture+postcondiciones no tuple.
EXIT detach/drop/STOP/finished/JOIN/stats/rmmod/registro/directorio/retirarlease.
GC soloSTOP, recoge en reentry UI; esa ruta nueva solo test simulación enR282.
22 contratos Lua pasan; suite también CI Ubuntu lua5.4 sin assets privados.
S3 real paquete seleccionado desde stock, dos ciclos E1M1/move/turn/fire/pause/
EXIT/relaunch sin reinstalar; módulos/nodos/lease ausentes al final. 20 hashes
iguales tras reset con registro vacío. VM queda DoomLauncher ACTIVA READY,
archivos persistentes 365799913/lua/, sin módulos cargados. GoBack despierta
pantalla negra (no asumir falloUI; captura inicial estaba dormida). Neat index6,
DoomAssets27,DoomLauncher28 tras rescan; 22swipesizq desdeNeat. Sin tocar Silent.
Tests artifacts/emulator/doom-launcher-contracts-1792094882416/result.json,
doom-launcher-test-1792095103022/result.json y verify-1792095285976/result.json.
Worker grande cap ahora4900000 (antes4861000, no cabía +19KB del launcher);
fixture exact4827012/2362partes pasa10IPC, C#5589. Legacycaps/gates y7+12modelo
viejo pasan. No native profile de este paquete habilitado. CI añadida.
RW4 static899092+picoS3runtime6583985+stack32768=7515845B antesdecoder/OS.
Siguiente: despliegue físico/journal target real/preflight memoria y plan.
prepareDoomAssets R279 sigue PINNED al carrierR278 (rechaza R282); no abrirlo
sin nuevo plan. No repetir pruebas del motor/UI aprobadas ni cargar ELF RW4 enS3.

**Privacidad reforzada 2026-10-15, petición expresa del usuario.** No publicar
MAC, claves de conexión/anteriores, seriales, logs o datos privados. Auditoría
ampliada de 294 commits pasa:46 archivos locales privados/6 representaciones,
sin coincidencias históricas. Ver docs/privacy.md. El hook .githooks/pre-push
usa audit-git-publish.mjs --require-private; core.hooksPath activado en este PC.
Bloquea errores y falta de perfiles actuales, sin imprimir valores. CI no tiene
esos inputs; solo patrones genéricos/rutas. No saltarse hook ni subir privados.

**GitHub conectado el 2026-10-15.** Remoto origin:
https://github.com/Pizofh/Doomed---Doom-for-Redmi-watch-4-.git
Rama local renombrada master→main, siguiendo origin/main; historial conservado.
Primer push293 commits hasta29cf3ec confirmado por ls-remote idéntico a HEAD.
Auditó2177blobs/71439101bytes, sin hallazgos de assets excluidos, patrones de
credenciales o coincidencias con clave/MAC actuales (sin imprimir valores).
tools/audit-git-publish.mjs deja reporte ignorado artifacts/publish/git-audit.json.
El primer push no mostró runs CI; el commit de seguimiento añade job audit
de historial completo y su path trigger. Consultar Actions para estado real.
Preferencia del usuario: subir los avances a GitHub, no dejarlos solo locales.
No subir firmware/WAD/binarios/datos privados. Sin cambios de VM/reloj.

**Actual R281 PC: worker grande compilado y supervisado pasa.**
[Detalle/reproducción](doom-large-worker-r281.md). Commit posterior a aae636d.
Nuevo experiments/pc-rfcomm/LargeSessionWorker.cs, tools/doom-upload-pc-pipe.mjs,
tools/test-doom-large-worker.mjs. RunCore compartido native/fixture: parcial,
would-block, deadline/progreso y finally cierre aun con stdout roto.
Budget4861000B/4128frames/4096frame/16384requests/131072RX, abrir20s,
sesión660s/idleSend15s. Legacy SessionWorker intacto 16/32KiB/96/55s.
Probe entry session-large-r281 gate false ANTES de destino/cache/nativeAPI.
PrivatePipe admite large-r281 (cerrado) y large-pc-r281 con tokenPC_ONLY_R281.
LargeUploadPcPipe verifica exe/sourcehash, solo escenarios sintéticos fijos;
parent675s/open25s/io20s/close2s, no I/O simultánea, cancel/kill con salida
confirmada y sin inventar closeConfirmed. 10 escenarios compiledIPC pasan:
2353 frames parciales73B+wouldblock con SHA/len C#; auth/install/upload/catalog
completos cruzando C# Send/Receive; zero/error/idle/total/stuckSend/EOF/closefail
y cancel+concurrentcall. Bridge replies siguen sintéticas inyectadas Node.
createDoomUploadIpcPeer integra worker a runnerR280, sin capability física.
BuildSHA a1546894c7330995819ebaa12adf6225f168ed3175938be3649fe4dc3a479344.
Resultado artifacts/doom-upload-session-r280/worker-r281-1792079473731.json.
C# selftests5579, Xiaomi legacy, gates y R28022 escenarios pasan. CI Windows
incorpora worker test tras build; CI remota no ejecutada. Sin VM/USB/BT nuevo.
Siguiente: launcher RW4 + WAD path persistente. Antes físico: journal target
real/lock, memoria, paquete/plan revisable. No repetir toy probes C/UI.
Carrier inerte/ELF placeholder conservados. R270 último físico; no nueva
autorización física. Estado VM R279 no modificado.

**Actual R280 PC: sesión autenticada grande integrada, 22 escenarios pasan.**
[Detalle y reproducción](doom-upload-session-r280.md).
Nuevos tools/doom-upload-pc-session.mjs, doom-upload-pc-simulator.mjs,
test-doom-upload-pc-session.mjs. Solo endpoint PC propio congelado y de un uso;
sin PrivatePipe/backend físico nuevo. Auth v1/modelo/FW/catálogo antes de
install/upload; serial &255 compartido MASS/PROTO, nonce counter separado.
Presupuesto wire completo +8192, 32 comandos/4096 partes. Caps físicos intactos.
Journal JSONL write/fsync por lote32, padre Uncertain ligado a targetTag y
plan/catálogo; sin reintento automático. Resume 22462 tras 11 entregas posibles
y 10 escrituras locales pasa 2342 partes. Completo2048:2353 partes/4852711B;
4080:1180/4830424B. Catálogo RegisteredInactive NO prueba contenido instalado.
Rechazos de auth/modelo/FW/ID/MD5/offset/chunk, entrada ausente/activada/no
retirable, pérdida de catálogo, cierre fallido/deadline cubiertos.
Resultado artifacts/doom-upload-session-r280/result-1792078932564.json.
Tests anteriores Xiaomi y gates pasan 0 sockets. CI job large-file-model
extendido; ejecución remota no realizada. Sin acceso nuevo a VM/USB/BT/reloj.
Próximo: worker grande separado + supervisor/IPC sintético. Después launcher
RW4/ruta WAD persistente/preflight memoria. No repetir motor/UI ya validados.
El carrier sigue inerte, ELF RW4 con WAD placeholder. No payload físico nuevo
autorizado; R270 último ensayo físico. Estado VM del bloque R279 no cambiado.

**Actual R279 PC: extracción/reset y modelo upload grande pasan; CI preparada.**
[Detalle](doom-large-transfer-r279.md). NOhardware/NObackendgrandeconectado.
tools/doom-assets-emulator-r279.mjs install|verify: carrierR278 instaladoen
PC ID365799912 byte5=10/IDedit; fuente220B soloobjetoscolor, ARMv8ELFsoloDATOS.
Tras selecciónDoomAssets enUIstock, lua/main.lua,doom.elf,doom1.wadextraídos
hashidéntico. Verify1792078027023 ytrasreset1792078339669sinpush pasan.
CarrierPC permaneceACTIVO/instalado,3archivos bajo /data/app/watchface/market/
365799912/lua. Módulosvacíos. NoejecutarELFRW4enS3. Catálogo despuésresetNeat
index6,Spotlight14,DoomAssets27; navegación total21swipesizq desdeNeat.
tools/doom-large-upload.mjs modelo sinRFcomm/ADB/procesos,sóloadaptadorPC.
PreparaR278pinned→corrigeIDheader167210065a365219963 (Compilerignoróarg);
hashidonly100b40aa866b327761f75fefd300a2c1647e5c3cdd3baa5afd4d7fd6cd2a155f.
No launcherC niWADpathasignado. NOperfilfísiconuevo. weak-ownedplan,suffixCRC,
MASS5CCMnonce0,serial&255,4096partsmax,chunk2048/4080,pacing100,wirebudgetexacto.
Intención durable porlotes32; escritura local NOACK; Uncertainaborta sinretry;
resumeexigeMD5mismo yoffsetacotadoparent. Timeout600sentreenvíos,noabortapromisastuck.
tools/test-doom-large-upload.mjs y --synthetic pasan7escenarios+12rechazos.
Real result artifacts/doom-large-upload-r279-1792078435595;synthetic1792078411502.
2353framesfull,1180maxchunk,fallotras11delivered/10locallywritten,resume22462
2342frames; fsyncjournalactual,fallaantesenvío0/traslote32,límite0frames.
Primertest1792078172596canceladovíawrite_stdinCtrlC porlayoutrecomputadoporframe;
CIMconsulta fue denegada y NOseusópara matarprocesos. Corregidocachelayout/tests.
GitHubworkflow job large-file-model usa fixturepropia sinWAD/firmware/artifactupload;
CIremotaNOejecutada. Staticphysicalgates testpasa0sockets. Capsviejos intactos.
Siguiente: integrar modelo enperfilRFCOMMpropio (auth/install/query/budget/cierre),
launcherRW4+WADpersistente+preflightmemoria. No repetir pruebasC/UIaprobadas.
ÚltimofísicoR270, sinpayloadnuevoautorizado. VM sigueownedPID11676últimoregistro.

**Actual R278 PC: contratos RW4 y carrier4,8MB preparados offline.**
[Detalle/reproducción](doom-rw4-deployment-r278.md). Sin emulador/USB/BT nuevo.
tools/review-rw4-deployment-r278.mjs normal|follow|contracts|resolved ejecutados;
outputs inmutables artifacts/research/deployment-r278*. Final resolved verifica
driverLVGL33f70 letter/ cache_size0; callbackopen33f28 formato/%s,read33efc,
seek33ec0/tell33e9c; veneers64f7c→495b7c,64e14→496190,64fb4→4956a4.
InicializadorLRU55078→64778,managerapply648e8→24590,dropcallback646c4;
la invalidación24638 cierra decoder2517c. Headerinfo24bac lee4B/cierra y
24fc0 recorredecoders; no añadir headercache S3. Backend físico siguependiente.
Las primeras ventanas5f8cc0/5f95 eran exploratorias, NOportPOSIX identificado.
Memoria: ELFstatic899056 +picoS3runtime6583985 +stack32768 =7515809B
antesdecoder/loader/overhead. No doblecontarzone6MiB ni DG256k; ambos en pico.
RAMfree/largestblock físico desconocidos; parámetroLRU0xd00000 no memoriausada.
tools/package-doom-assets-r278.mjs ejecutado sinADB: build/doom-assets-r278,
DoomAssets.face4807680B/SHA387e6c80616296ca7c8727e1a356e169c5b3575e1f2c33d4c9e9a32729ffa7c9.
3records byte-exactos: main.lua220B (soloobjetoscolor),doom.elf603692B SHA45d3..,
doom1.wad4196020B sharewarepin. IDpropuesto365219963, noinstalado.
Sin hexenLua, sinlauncherC/IO/timers. Candidate mantieneWADplaceholder;
NOejecutarcarrier yNOenviar. Extracciónruntime ypersistenciafísica sinprobar.
Bloqueoconcreto: static-watchface-transfer chunks cap64parts; haríanfalta2353.
static-watchface-session limita32768B init/send. Nocambiarcap a ciegas.
Siguiente meta: instalador/launcherDoom completoPC,validarextracción/WADpath,
transferenciagrandeacotada/journal/resume ypreflightmemoria antesplanfísico.
No repetirfixturesC niensayosS3 sin cambios. CandidatoyELF no cambiaron.
R270 sigueúltimofísico; ningúnpayload nuevoautorizado. ArtifactsWAD nuncaCIpúblico.

**Actual R277 PC: cierre por cambio de esfera y recogida al volver pasan.**
[Resultado/reproducción](doom-ram-close-r277.md). Sin hardware nuevo.
Lua doom-ram-ui.lua añade closing, GC soloSTOP, timer inhibido al cerrar;
al reentrar valida fila rw4doomram276 de /proc/modules +snapshot, STOP,
op7 en UI tras destrucción anterior, JOIN, stats14/14 y rmmod. Owner C no
se cambia. Root permite stock scroll-chain fuera de los controles; controles
mantienen flags sin propagación. Swipe385,430→385,40 evita botones inferiores.
Test nuevo tools/test-doom-ram-close.mjs start|closed|reentry; no STOP/unload
desdeCLI. Resultado artifacts/emulator/doom-ram-close-reentry-1792075170831:
thread88, GCstoptrue, finished1/joined0 conStorage activa, luego14/14,
reason1/code0/cleanup0; módulo/hilo/3nodos ausentes al reentrar. wall34587<120s.
Regresión doom-ram-test-1792075184081 pasó controles/pausa y2START/EXIT,
threads210/344,14/14 ambos. Captura r277-collected inspeccionada.
ELF C no cambió:610484B/SHA4cc023ce788a69605c1265b874dc4926e27c11b1673b133f79c95939a330af2a.
Lua SHAea7c49214c013e7fbaccbe2eca6a189517137413b900a0e2f077af44e87fdd5b.
Builder ypackage rehechos,UIProbe refreshsinreset. UnresetVMsinmódulosANTES
destageporreposo; ninguno para salir/recoger. Cleanupfinal ELF/WADtemporales
retirados y nodos/módulo ausentes. UIProbe activa Closed; viejoDoomdir conservado.
Siguiente: cerrar contratosRW4 filesystem/cache/backend/RAM/rutaWAD antes
planfísicoagrupado. Ya no repetir cierrePC/fixturesC sin cambio o fallo.
R270 sigueúltimofísico,234retirado/relojnormal; nada físico nuevoautorizado.

**Actual R276 PC: Doom real + RAM image + pthread + libc privada pasan.**
[Resultado y reproducción](doom-ram-engine-r276.md). Sin hardware nuevo.
Commit posterior a0583d89. Builder tools/build-doom-ram-s3.mjs recompila80C
originales paraARMv7-A/Thumb/soft con libreríasv7-a/nofp fijadas y runtime
generado R271; no reutiliza motor S3 hard-float. ELF610484B/SHA
4cc023ce788a69605c1265b874dc4926e27c11b1673b133f79c95939a330af2a.
S3 host adapta fops32→40; attrs12 confirmados DWARF, clock_gettime timespec16
→ticks100us. Misma fuente adapter/transport/image-view/glue del candidato RW4.
UI experiments/doom-runtime-rw4/doom-ram-ui.lua, modo package doomram.
Helper tools/doom-ram-s3-emulator.mjs stage|test|cleanup usa guard loopback.
Resultado artifacts/emulator/doom-ram-test-1792074005969/result.json:
E1M1, avance, izquierda/derecha, disparo50→47, pausa neutral/resume pasan.
Dos instancias: threads246/402, pico6583985B,14alloc/14free,cleanup0,
reason1 STOP; módulo y3nodos retirados.114/29 presentaciones, NO mediciónFPS.
No archivos de frames. Capturas inicial/trascontroles inspeccionadas.
Primertest1792073804463 fallóLeftMissing: DEFOCUSED del botón anterior
cancelaba el nuevo. Corregido: solo libera si mask==su key. EXIT14/14 sinreset.
ELFno cambió al corregirLua. Otrotest fallópreSTART OwnFaceNotActive por
transiciones rápidas; Silent accidental restauradoOFF. Usar650ms entrepantallas,
verificar screenshots antes seleccionar. Selectorprev: swipe150→360 evitaBACK
desde bordeizq; Storage2antesUIProbe. No usar20→360para iratrásencarrusel.
Cleanup final retira /tmp/rw4-doom-ram-s3.elf y .wad trasverificarhashes;
queda UIProbe365799903 DOOM RAM Closed, sin módulos/nodos. DirectorioDoom
persistenteanteriorconservado. RequierestageparaSTART, NOejecutarloahora.
VMpid11676 seguíaactiva; sesiónhost25093. ResetVMsinmódulosantesdestagepor
pantallareposo, ninguno duranteDoom o salida. No consultarUSB/BTparaPC.
Siguiente: completar recogida al reentrar traspageclose/GC enPC ycerrarcontratos
RW4 filesystem/cache/backend/RAM/rutaWAD antesensayo físicoagrupado.
No repetirprobesviejos. R270 sigueúltimofísico:234retirado/relojnormal.
Sin nuevaautorizaciónfísica. CandidatoRW4 R275 no modificado/NOinstallable.

**Actual R275 PC: frames RAM visibles en LVGL S3; 2ciclos START/NEXT/EXIT pasan.**
[Resultado/reproducción/límites](doom-ram-image-ui-r275.md). No hardware.
UI fixture experiments/doom-runtime-rw4/image-ui.lua +image-ui-probe.c:
worker sincrónico simulado publica2patrones, adaptador fops40 + header12/RGB565
explícito con RW4_IMAGE_S3_TEST. RW4 default sigue header4/cf4/32bpp.
tools/build-image-ui-r275.mjs y image-ui-emulator-r275.mjs stage|test|cleanup.
Fixture ELF11336B/SHA bf67c59aeff5a46c173f9ffc19228887baa4376944917a31c611ab958916fe8c.
WatchfaceUIProbe365799903 modo ramimage instalada por refresh; no se borró
su directorio Doom persistente. TemporalfixtureELF/nodos/módulo retirados.
VM queda en launcher RAMIMAGEClosed, para probarotra vezhacefaltastage.
Primer test visual falló64000px: prefetch/info consumía fase0 al cerrarFD.
Corrección: image_slot persisteentreopens/closes; rw4_game_image_release
solo despuésdedetach/cacheclose (o fixtureVFS sinLVGL). JOIN/uninitbloquean
tambiénleasepresentación sinFD. No volver a liberar slot en image_close.
Op7 control: soloSTARTowner, invalidaúnicamentepathpropio yverificarefs0
antesliberar. No llamadasLVGL desdeGC/worker/uninit; STOPenGCconservarecursos.
Ownerno demuestraautomáticamentequeestáenUI; contratodelcaller.
UIrealpasó4frames/256000píxeles tolerancia7/canal ydosunloads sinreset;
result artifacts/emulator/ram-image-test-1792072718495/result.json.
CPUfixture1124checks (op7wrongowner/FDheld/preSTART), VFS27checks,codec1060
frameFNV1c083d2f pasan. No motor/hiloreal/GCinesperado niFW físico probado.
UnresetprevioSINmódulos porSCREENOFF; noresetparaexit. ArranquePC requirió
escalaciónparaencontrarperfil. Registroanteriorpreservadoresume-r275.
CachebindingRW4 image_dropoffset24638 alias1bff187c→1c015eb5;21APIs+3contracts
fijados. SoloS3 usaheadercachedrop; RW4headercache/FS/backendpendientes.
NOusar25204comoheaderinvalidate: ventanaesassert, noentryaprobada.
BuildsfullRW4 rehechos603692B/static899056/0imports, SHA
45d3044d0139db84f4f8c7f74f67f1c196b76a7843a416e5520ca5a593c459d7.
Siguenflagsloadablefalse/UIphysicalfalse. Comentariofuente corregidotras
test; rebuildmismoELFconfirmaquesolocambióhashsource, no códigoejecutado.
Siguiente: motororiginal+WAD+hilo realPC conbackendnuevo,controles/salida;
cerrarcontratosRW4/RAM antesplanfísicoagrupado.No repetirprobesviejos.
R270 siguelastphysical:234retirado/relojnormal; nada nuevoautorizado.

**Actual R274 PC: formato RW4 identificado, vista RAM/read/seek y VFS S3 pasan.**
[Resultado y límites](doom-rw4-image-r274.md). No se tocó hardware.
Alias LVGL código offset+1bff187c, datos+3bff187c: set_src4c75c→1c03dfd9
y decoder_info24fc0→1c01683d cruzan sus veneers. No memory map completo.
Header RW4=4bytes,cf4=32bpp (tabla c9340, ref21be8);320x200→19050004.
No usar header S3 de12bytes en RW4. Nueva image-view.c/h convierte slots565
a B,G,R,255 por read,256004B lógicos, sin reserva/frame ni writes de imagen.
transport ahora registra tercer nodo /dev/rw4doomimage.bin con lease hasta
close; header-only no consume frame; EOF/seek64 acotados; JOIN/uninit bloqueados
por image_ref. Falta integrar widget/caché UI: NO afirmar render ya validado.
ABI ampliada: fops seek+16; file f_pos64+8 y cookie driver+20, solo esos campos.
AP495620 dispatcher;495a4c initcampos;495b1c temporal→FD. Tres fingerprints
de contrato añadidos a20APIs (total23regiones). NO comparación de puntero file:
se mueve/copia entreopen yread. Primer fixture VFS falló4 y dejóref retenida,
rmmod16; se preservaron logs y se reseteó soloVM propia. Segundo falló17seek/EOF,
faltaba clearerr de nuestro runtime; módulo retirado/ELFhashverificadoyretirado.
Final VFS25checks pasa con stdio/VFS reales S3 y fops40adaptada; worker no corre.
Test puente1114checks simulado pasa; codec1060checks/fullframeFNV1c083d2f pasa.
Todo temporal/nodos/módulos retirados. No repetir tests iguales sin causa.
Builddevice+bindings rehechos:603364B/static898936,0imports,entry203033,
SHA a7ce84bf35ee6a0051c2690fbdb8e77cbf8d181c5fa89a3cbeefcb64bb3b8d90.
Candidate NOinstallable/NOautorizado. Libc R273 sin cambios/no repetida.
Siguiente trabajo: Lua widget+cache sólocontextoUI y presentación/salidaPC,
luego WAD/marca/workerreal; preparar ensayo físico agrupado cuando corresponda.
Los scripts review-rw4-image* ya ejecutados, outputsimage*r274* inmutables.
No rearmar pruebas viejas; R270 sigue último físico/234retirado/relojnormal.

**Actual R273 PC: candidato completo enlaza con cero imports; no se envió al reloj.**
[Resultado, contratos y reproducción](doom-rw4-bindings-r273.md).
Nuevo tools/build-doom-rw4-bindings.mjs consume los objetos de libc/device
reconstruidos y el manifiesto device/firmware-bindings.lock.json (20 APIs).
Salida 601308B/static897872, SHA
67ebfd6f117040d89b5894997c0f0f9ab2cd35a09afd9b5aca4d69221cfe4dc7.
FNV32 sobre64bytes por API antes de registrar nodos; imagen AP y SHA256 de
esas64bytes por función fijados.
No prueba ABI/memory map/firmware completo ni protege de un fault de lectura.
owner_token llama al getter de TCB actual 1bd000, no gettid/PID; no interpreta
TCB. Runtime macro nxsched_gettid→rw4_host_owner_token; _getpid privado=1.
Wrappers en device/firmware-bindings.c; fseek/ftell32, clock64, attrs12,
create1e8aac/join1bbca0 siguen contratos estáticos. 1bc310 NO es join.
No cargar este ELF ARMv8 en S3. loadableModule=false, autorización física=false.
Tests afectados S3 pasan: transporte1038 (nuevo rechazo deja cero nodos) y
libc dos instancias18checks/6alloc/6free/streams0/fixtureintacta. Temporales
y módulos retirados. Scripts siguen reportando etapa R272; resultado conjunto273.
No repetir pruebas físicas o tests sin cambios.
RAM image: Lua set_src5e1cac acepta string/userdata y pasa puntero al veneer
5b4220→1c03dfd9. No mapear ese destino ROM como offset directo del AP.
Upstream luavgl/LVGL8 solo contexto; layout RW4 y finalización/cache pendientes.
No pasar header32 propio como descriptor ni liberar/reutilizar píxeles tras
set_src/Timer sin contrato demostrado. Conservar fuerte referencia Lua y lease
C hasta detach/cache/render completado; falta implementarlo y validarlo.
Siguiente: cerrar entrega/retirada de imagen RAM, integrar WAD/marca/worker
real en PC y preparar ensayo físico agrupado, no probes diminutos por defecto.
R270 sigue último físico:234 retirado/reloj normal, gates físicos cerrados.
Las tres variantes review-doom-rw4-platform ya ejecutadas; dirs research
doom-platform-r273, -follow, -detail inmutables. No correr otra vez sobre ellos.

Historial inmediato:

**Actual R272 PC: C completo enlaza sin DG/libc pendientes;20rw4_host_* aún sin bind.**
[Resultado/contratos/reproducción](doom-rw4-device-r272.md). No operación física.
tools/build-doom-rw4-libc.mjs usa engine-port R271 y recompila solo runtime-host/
glue; newlib/libm/libgcc privadas y fijadas en device/newlib.lock.json.
No FILE/reent firmware interpretados, calloc/malloc/realloc/free internos→runtime
contabilizado. Logs a tail256RAM; no libc privada después de cleanup; unload y
reload de instancia nueva obligatorios. memcpy Thumb propio evita ARM state de
newlib S3 rechazado por loader (dos insmod22 previos; no residuo de módulo).
Linker device/module.ld ahora fija VMA0 por sección ET_REL; no atribuir el22
solo a eso. MOVW/MOVT S3 handler65c83a revisado; finalRW4 soloABS32/THMCALL/JUMP24.
Test libc S3 pasó2módulos:18checks cadauno,6alloc/6free/peak1248/streams0,
fixture7B intacto; temporales retirados. Perfil v7-a/nofp distinto al RW4.
PruebaC transport con kernel/worker simulados pasa1037checks (1000son reads de
fragmentos del mismo frame, no escenarios). No pthread real ni Doom en ese test.
device/adapter.c implementaDG6/warpE1M1/salida120scooperativa, reloj64/10inferido.
device/transport.c fops32/fileopaco/refsgate, ctl16B/read128EOF y frameRGB565LE
320x200/header32/FNV/dos slots; workerSTART→STOP→finished→JOIN antesunload,
sin llamadasLVGL/escriturasFS. Interleaving real/ABIworker pendientes.
Nuevo builder build-doom-rw4-device.mjs compilaambos y enlaza600012B/static897436;
SHA2629256b9de4357da1c984a9f2c6371e9fa346770e37cbaa5badc5e0f8e9b1cb.
Con zona6MiB/DG256K/stack32768 subtotal7477660B antesextras, RAMlibre desconocida.
No fingerprint/initmarker/WADruta final/bindings/Luaimagefeed ni payloadaprobado.
Frame propio NOdescriptor LVGL niPNG; no pasarlodirectoaImage:set_src.
Seguir20bindings/workerreal y presentaciónRW4; integrar motor real nuevasfuentes
en PC antesdeplanfísicoagrupado. No repetirprobesfísicos/libctestsyaiguales.
Los dirs artifacts/emulator/doom-libc-r272-* y doom-transport-r272-* preservan
fallos y éxitos; scripts ignorados cleanup/inspect soloPC ya consumidos.
R270 sigueúltimopaso físico:234retirado, relojnormal; NO rearmarpruebasviejas.

Historial inmediato:

**Actual R271 PC: motor real y runtime compilados; ninguna operación física nueva.**
Usuario aprobó acelerar a dos checkpoints: preparar el port completo en PC y,
si los contratos lo permiten, un ensayo corto E1M1/controles/salida. No añadir
probes físicos pequeños por defecto; tampoco hay autorización nueva de envío.
[Resultado reproducible y límites R271](doom-rw4-build-r271.md).
Builder tools/build-doom-rw4.mjs:80C originales→ARMv8-M Thumb soft/libgcc local;
modo runtime reutiliza objeto comprobado y genera runtime-device.c del S3 fijado,
con jump.S propio40bytes, sin tocar fuentes/fixtures S3.444560B/static534008B,
36imports pendientes (DG6/libc30), no entry/bindings/transport/loadable module.
Zona6MiB+DG256KB→subtotal7081464B antes de extras; RAM libre física desconocida.
111warnings originales conservados. Hash final6206720ca434b8903a2ba41c29ccb5efce304341839e5cafa3e83cc4a695223a.
test-doom-rw4-jump.mjs pasa en owned S3: valor7 y0→1 desde tres llamadas anidadas,
sentinels/SP estables; módulo/ELF temporales retirados. No test físico/ABI completo.
Primer fixture bloqueado por Werror antes de ejecutar; logs preservados.
Research runtime/ follow/ contracts ya ejecutados, dirs inmutables; no repetirlos.
Malloc/free1f5180/1f513c mismo heap; seek/tell1ec2b8/1ec328 desde Lua; reloj
1b9934→1b98e4 devuelve64bits en r0/r1, /10000 observado. Candidatos estáticos,
no llamadas físicas nuevas ni asumir origen/monotonicidad. No confundir comandofree.
Continuar con libc/clock/worker y DG/frames/controles/WAD persistente, revisión de
THM_CALL/JUMP24 y presupuesto total; no volver al debugging de Bluetooth/registro.
No enviar los objetos intermedios, rearmar ExitC/StepC ni recargar234.

Último resultado físico completado:

**Actual R270 COMPLETO: módulo rw4step234 retirado; reloj normal.**
El usuario autorizó completar el tramo y el ensayo. Se envió una sola parte
de1916bytes (1886bytes útiles desde offset22462), con el mismo paquete/MD5.
Catálogo independiente12→13: ID365219964 inactiva/removible, las12entradas y
flags anteriores conservados; activa365210175 sin cambios.
Socket y worker cerrados, sin error nativo; gates restaurados y comprobados.
Journals R266/R268 intactos byte a byte, sin locks; journal R270 Registered1.
No se activó ExitC ni se ejecutó rmmod/C durante la transferencia.
Helper autorizado dbd472d0c08816e92f047d47c9eb5ed41512c9c6352ca66c26d83e2f3961e3bd;
helper cerrado ce36f0936e75bd758b4eb206f21af4f04a3baf45298355ec7949f8309ec530d5.
Runner artifacts/exit-r270-authorized/run-install.mjs consumido: no repetir.
Evidencia privada: install-report.json, comparison.json, prior-journal-preservation.json.
Usuario informó diez verdes y menús/esferas normales. El paquete fijado comprobó
STOPPED/cierre/identidad, rmmod y registro/nodo ausentes. Módulo234 retirado.
No reabrir ExitC ni pruebas antiguas, rearmar marcas o recargar234.
Siguiente trabajo solo PC: adaptar los contratos de runtime del Doom S3 al RW4;
memoria/temporización/lectura WAD y ejecución fuera de UI siguen pendientes.
No rearmar marcas, recargar C, reiniciar, borrar paquetes ni repetir transferencias.

**Actual R267 PC completo; R268 requiere aprobación del único reintento.**
Usuario confirmóesfera/menúsnormales tras R266. Registro privado user-observation.json.
Audit finalpaquetesStateMatch/CtrlProbe/ExitC24recursos/12partes/CRC/MD5readback:
sin defecto porchecks, causa R266desconocida. Noatribuir aLua/espacio/overrun.
[PlanR268](native-exit-retry-physical-plan-r268.md): mismopaqueteID365219964/hash
8c69e4003c1caef9eed58902cfc5d45112d5b9cf21f7ccdab8c1b379284da3e8;
CLIinstall-paced-retryr265, perfil exit-r268.11pausas100ms+1000msantesGET,
2,1snominales. Sin cambio deLua/C/bytescifrados/chunk2048/timeout/límites.
15tests nuevos+47IPCjournal pasan sinradio; fixtures incompletos catálogo/nonce
corregidos, fallos preservados.68Lua anteriores NOrepetidos. NoMASSretries.
Originalnative-exit-r266.jsonUncertain se preserva/validacon targethashmismosdatos;
nuevonative-exit-r268-paced.json debeestar fresh/sinlock. Gateextra
REVIEWED_PACED_RETRY=false ademásPHYSfalse/VARIANTr167/C#false.
Helper cerradoactual898ec2cb6522cbde1544faed041e4c371734322ee98edc01fccd057b6f5fed35.
Prepare-paced-retry/gates0sockets pasan; nohardware nuevo. R266 autorización
UNinstallconsumida; normalidad NOautoriza segundo envío. Si aprueba, runner
fijonuevohabilita3gates yC#, UN install-paced-retryr265; finallyrestore/rebuild/
gates+GETindependiente, oldjournalhashintacto. Solo trasregistro propioinactivo
proceder ensayoEXIT C ya revisado (nueva revisión incluye ese ensayo).
Nocleanup/delete/SET/rearm/reboot/reload; no invocar ExitC si registroincierto.

**Actual R266: intento único con timeout, ExitC ausente del catálogo.**
Usuario autorizópresencia≥50%; runnerexit-r266-authorized consumido.
INSTALLstatus0/upload0resume0chunk2048MD5matching.12parteslocales/TX24898/
20TX14RX/phaseSent; primera consultaGETdeesa sesiónTimeout. No asumircausa,
archivo no escrito o instalación correcta. Journalnative-exit-r266.json
Uncertain/previousPartWritten/12/registeredfalse/sinlock. Socket/workerexit0;
finallygatescerradosrebuild/test0sockets. Ningúnrmmod/CdesdePC.
GETindependiente Complete12→12 vsantesDEESTEintento: IDsflags/activa365219965
preservados, ExitC365219964ausente. No eliminaciónporinstalador; antesya12.
Evidence artifacts/exit-r266-authorized/install-report.json/inventory-followup.json.
Helper cerradoactuala9af51d07515f1d592751702ab70123c0aa63ea8bb5a49ce8a1f7c08a5083195.
Pregunta pendiente usuario: esfera/menús normales. No seleccionarExitC/pruebasC,
reenviar, borrar/rearmar marca o journal, reiniciar o cambiarvínculo.
No autorización para segundo envío (único intento consumido). Retirada234aún
sin prueba física, móduloúltimoestado STOPPEDR264; no reabrir para confirmar.
[Plan/resultadoR266](native-exit-physical-plan-r266.md). InvestigaciónPCposible;
nueva acción física requiere revisión concreta, no inventar falloLua/espacio.

**Actual R265 PC completo; R266 pendiente de autorización física.**
[Plan concreto](native-exit-physical-plan-r266.md). ExitC ID365219964,24348bytes,
SHA8c69e4003c1caef9eed58902cfc5d45112d5b9cf21f7ccdab8c1b379284da3e8;
source3617fd532ac64b36112c8328b7a579d67446b815460f52aa29c231beefec81d5.
68casos +retiradaC realS3 trasSTOP13. Nodo/registroRW4/widgets mapeados/simulados;
soloprintfsuccessS3normalizado; no prueba físicauninit234. Modelo/callbackschar
rastreadoencandidata; usarls/dev sinflags lista nombres sinstatdelhijo.
Noio.open delnodo después de rmmod: bloqueo enforced en tests. Backend revalida
key64+snapshotexactSTOPPED+close+listadoprevio+key64; un rmmod; salida vacía+
procfs vacío+listadosinnodo. Retornoshellsolo no pruebaéxito. Capturaspropias
persisten, marker14bytes anti-reentrada, sinload/nodowrite/Timer/worker/remove.
Paquete24recursosreadback,12casostransferencia/gates0sockets/preparepasan.
Helper cerradoactual10d248e0ef9458892db90d60c59f5258307427b80fd3f9a7546932dff3e6cd24.
NoBluetooth/instalación/lectura/rmmodRW4 nueva. UseroksoloautorizóPC; pedirrevisión
R266 conpresencia≥50% antes deUNinstallr265/selecciónmanualEXIT C.
Journalnative-exit-r266.jsonfresh;runnerfijonuevo, finallygatescerrados+GET.
FilasMARK/REG INFO/STOPPED/CLOSE C/REG SAME/PATH PRE/RMMOD/REG GONE/PATH GONE/FINAL;
preview4barrasBLANCAS. EXIT CODEauto64hex ante fallo; nootraesfera debuginnecesaria.
No repetirrearmarreloadreboot. C234 aún residenteSTOPPED desde R264.

**Actual R264 COMPLETO: diez verdes, menú y watchfaces normales.**
Usuario «todo verde, menu y watchfaces sin problema». Validación por indicadores
de13ACKs/control/STEP/PAUSE/RESUME/STOP/close/postkey64. Final esperado
seq13phase3held0steps4edges5status0, sin rawframe/code nuevo capturado.
No métricas inventadas. Reporte privado control-r264-authorized/user-observation.json.
Marca consumida; no reabrir CtrlProbe/RUN/rearmar/STOP/reload/reboot automáticamente.
C234 sigue residente, detenido; uninit/unregister de este módulo no probados
físicamente. No DOOM físico aún. [Checkpoint siguiente](native-lifecycle-next-checkpoint.md):
PC preparar retirada atribuida del módulo detenido/cierres, con resultado shell
y metadata/path sin abrir nodo tras unload. Unregister puede desvincular path
antes de rechazar; nodo ausente solo no certifica nada. No readyToUnload/key64
como inventario completo. Nueva operación física exige plan/revisión; ninguna
retirada autorizada por R264. Helper/gates cerrados actuales siguen
01794a3af30a4653892da0c2a9d7fd5620997ae5d267ca2d178ad54494406a55.

**Actual R264 instalada inactiva; RUN C manual pendiente.**
Usuario autorizóUNensayo/presencia≥50%: «Sí, autorizo y puedo observar el reloj».
Runner `artifacts/control-r264-authorized/run-install.mjs` consumido.
RegisteredInactive12partes/stream23862/TX24359/21TX16RX. GET13→14, previosIDs/
flags preservados y activa observada365219966 conservada; propia965inactiva/
removible. Journalnative-control-r264.json Registered12/sinlock. Socket/worker
cerrados/exit0. Finallygatescerrados/rebuild/test0sockets. Sinproc/nodo/CdesdePC.
Helper autorizadoa0a83f287f67da579ae2af70a8d2eeaecba58b75ab86507768a78cf8a9b56647.
Helper cerrado actual01794a3af30a4653892da0c2a9d7fd5620997ae5d267ca2d178ad54494406a55.
[Plan/resultado](native-control-physical-plan-r264.md). Próximo seleccionar
CtrlProbe5barrasVERDES;10grises/RUN C UNAvez; leer colores/fotoautomáticacode si
falla; volverhabitual/menú/scroll/longpress. SiFINALrojoinicial/faltaUI noRUN.
No repetir/rearmar/reset/reload/unload; STOPsoloestadoRAM, Cquedacargado.

**Actual R263 PC completo; R264 físico pendiente de aprobación.**
[Plan concreto](native-control-physical-plan-r264.md). CtrlProbe ID365219965,
23.788bytes, SHA a2f0b5ed36b0eb524c23a97cee6ea83e87436d7260ec44dad8a4b5ccb67b1648.
Source2b9f4c8567c7970486aca4ecdd71ed2c9af2ba7d072ed5f2c6aa26944858e667.
169casos Lua/UI con nodo/registro simulados +13comandos reales al puenteS3;
same core, ABI específicaS3, no prueba de writeRW4. Scratch retirado/módulos
iguales. Reporte artifacts/emulator/control-r263-verified/summary.json.
Primer fixture mark falló al habilitar RUN; corregido/reporte preservado, no C
cargado en ese intento.24recursos paquete readback sinADB.
Gates/prepare pasan sin socket; helper cerrado
a37683c2de8f4324fbcc7f847a98c02c31e3f0516f7438d700250205cdf42513.
No instalación, operación BT o nuevo nodoI/O físico en R263. No autorización
R264 aún. Próximo: revisión/presencia≥50%, runner fijo nuevo para UNinstallr263,
journalnative-control-r264.json fresco y finallygates cerrados; luego selección
manual RUN C una vez. MARK/REG INFO/INIT/START/INPUT/STEP/PAUSE/RESUME/STOP/FINAL.
13comandos acotados,ACKexactos; finalseq13STOPPEDheld0steps4edges5. Si falla,
CTRL CODE automático, no otra write/STOP de recuperación/descarga/reintento.
Sin nuevo ELF/shell/Timer/hilo. C residente234 queda cargado; STOP no rearma.
Userok anterior solo autorizaba PC; no hardware nuevo. No reabrir pruebas viejas.

**Actual R262 COMPLETADO: diez verdes y retorno/corona/menú/esferas normales.**
Usuario«todos verdes. , otras watchfaces ok, corona ok,menu ok». No necesitaMODE/REGCODE,
no reabrirparaobtenernúmero. Nativeopen/read32/EOF/frameIDLEx0/close/postkey64/FINAL pasan.
Sinrawsnapshot/trailerestaejecución, no inventar captura. CorrecciónR261validada físicamente.
Marca persiste, ensayo consumido. NoCwrite/STEP/STOP/uninit/unregister/reload nuevo.
[ResultadoR262](state-match-physical-plan-r262.md), [checkpointcontrol](native-control-next-checkpoint.md).
NextPC cliente residente/comandos13acotados/ACK exacto yplanSTOP, no más diagnóstico registro.
No automáticaescrituraC ni unload/reset; requiere implementar/probar/plan/aprobación nueva.
Gatescerrados; helperúltimocerrado9dab80136bd06cf732d1b15e55a53702d75aec73b7c9e0982a1393d45c8afff8.

**Actual R262: StateMatch instalada inactiva; READ C manual pendiente.**
Usuario«ok»autorizaUNensayo/presencia>=50%; runnerstate-match-r262-authorized consumido.
InstallRegisteredInactive12partes/stream24350/TX24847/21TX16RX, cierresworker/socket/exit0.
GET12→13 IDsflagsintactos, activa365210175conservada; propia365219966inactiva/removible.
JournalRegistered12/sinlock. Finallygatescerrados/rebuild/test0sockets. NoSETDELETEretry/proc/CdesdePC.
[Plan/resultadosR262](state-match-physical-plan-r262.md). NextStateMatch4barrasAZULES,
10grises/READCUNAvez→foto o todasverdes→habitual/menúscrolllongpress. Rojoinicial/faltaUI NO READ.
MismoCresidente sinreload/unload; comparaciónkey64, trailer65/66solo diagnóstico. NoSTEPSTOP/rearmado/reboot.

**Actual R261: rechazo de trailer localizado; StateMatch preparada NO autorizada/enviada.**
R260fotoREG CODE004200420F03000600410000:66/66,0Fopen/read/EOF/close,shape03,
mask00/06,diff65,errno0. Primeros64iguales/NUL64; solo65/66nonzero. CframeIDLE/closegreen;
usuario«menu y esferas ok». Owncomparator exigía3NUL y raw66igual; ese es el rechazo.
Formatter64/copyretvalestáticocandidataR240 explica2bytesfuera de texto; allocation/sourcebytesUNKNOWN.
[PlanR262](state-match-physical-plan-r262.md). ID365219966,24276B,4barrasAZULES,
SHA710562ea9139bcc346332318545b64b569317248144ff172c7592431fe19395c,
source15b6fd25b3114fc5d9a49100dc87bb3f1388de7ae26d2c6ed1b54fefa8be832b.
ClassifierR261 key64; len66/NUL64/ASCII63/camposptr/offsetsstrictosigual, trailer2solo diagnóstico.
meta/inventoryComplete/dataSizeKnownfalse, NOreadyToUnload. Flags10canonical recognized,
rawformat03puedeverse conFINALverde si solo65/66varían. Mismonativeopen/read32/EOF/close, no writes.
51casosS3/tmpreal/noderegwidgetssimulados incluyendo256trailerpatterns/rejectterminator/body pasan;
reportartifacts/emulator/state-match-r261-verified; 24readbacknoADB. PrimerSyntaxFail0theadbackendsinexec preservado.
Gatescerrados/journalstate-match-r262.json no usado. Next autorizaciónUNensayo/presencia>=50%.

**Actual R260: repetición solicitada instalada como StateTrace2; READ C pendiente.**
R258foto mismo8verdes/postregrojo/frameválidoIDLEx0; usuariocambió antesMODE, diagno capturado.
Pedido«si quieres vuelve a hacer la instalacion o reinicialo o algo y lo vuelvo a inentar»
autoriza repetición equivalente; se eligiócopiafreshID, no rearmado/borrado/reboot/Cload.
[Plan/resultadosR260](state-trace-repeat-physical-plan-r260.md). StateTrace2ID365219967,24052B,
SHA64e3ba292a2230b051c0d88dbbd4df5457278bae9aceca6bf980f8e352ac1eef,
source00a72b041a95b488929cd5f61375e247edb2f278f5a5cc87dd1139aabb782b40.
SoloIDruta marca/vistainicial cambia: postregrojo muestraREG CODEsinMODE, todoverdeFRAMEHEX;
MODE opcionalmismoRAM.48casosS3/tmpreal/noderegwidgetssimulados pasan,24readbacknoADB.
InstallRegisteredInactive12partes/24126stream/24623TX/21TX16RX, GET15→16 previosIDsflagsintactos,
activa968conservada; propia967inactiva/removible. JournalRegistered12/sinlock; cierresexit0.
Finallygatescerrados/rebuild/test0sockets. Runnerstate-trace2-r260-authorized consumido.
Next StateTrace2(nootra),4barrasMORADAS/10grises/READCUNAvez→FOTO INMEDIATAREGCODE→habitual/menúscrolllongpress.
Rojoinicial/faltaUI NOREAD. No repetir/rearmar/retirar/recargarC/STEPSTOP/reboot.

**Actual R258: StateTrace instalada inactiva; READ C/MODE manual pendientes.**
Usuario«ok»autorizaUNensayo/presencia>=50%; runnerstate-trace-r258-authorized consumido.
InstallRegisteredInactive12partes/stream24070/TX24567/21TX16RX, socketworkerclosed/exit0.
GET17→18 IDsflagsintactos, previaactiva365219969(RegCheck)conservada; propia968inactiva/removible.
JournalRegistered12/sinlock. Finallygatescerrados/rebuild/test0sockets. NoSETDELETEretry/proc/CdesdePC.
[Plan/resultadosR258](state-trace-physical-plan-r258.md). NextStateTrace4barrasMORADAS,
C STATE/10grises/READ CUNAvez→FRAME HEX64foto→MODEuna vez→REG CODE24foto→habitual/menúscrolllongpress.
Rojoinicial/faltaUI NO READ. No repetir/rearmar/loadunload/STEPSTOP/reboot automático.

**Actual R257: RegCheck15verdes/retorno normal; StateTrace preparada NO autorizada/enviada.**
FotoR256004200420000000000000000, dosregistros66Bidénticos/shape00/EOFcloseOK;
usuario«ok»habitual/menu/cambio. RojoR254no reproducido, causaUNKNOWN.
[PlanR258](state-trace-physical-plan-r258.md). StateTraceID365219968,23996B,4barrasMORADAS,
SHA6f19fd203b8613fad9d9496e14115e0a0841522ac9e78fcc69cebc9d8349a9bf,
source97423a164996f46a0a5a5d2fe4a958216f542c5dad0280121230fa10a93b9e76.
MismoC snapshotread32EOFclose; postproc flags/code/lens/masks/diff/errno, sinrelajarparser.
READCUNAvez; MODE alterna FRAME HEX64/REG CODE24 soloRAMsinIO; referencia004200421F00000000000000.
Flags1F=open/read/EOF/close/shape.48casosS3/tmpfsreal/noderegwidgetssimulados pasan,
inclnuevotail + MODEsinIO. Reportartifacts/emulator/state-trace-r257-final,
paqueteartifacts/state-trace-r257/StateTrace-id-only.face,24resourcesnoADBreadback.
Ownmarker15Bpersiste; no oldfiles/nodewrite/loadunload/shell/Timer. Gatescerrados;
journalstate-trace-r258.json no usado. Next revisiónUNensayo/presencia>=50%.

**Actual R256: RegCheck instalada inactiva; CHECK manual pendiente.**
Usuario«ok»autorizaUNensayo/presencia>=50%; runnerregistry-check-r256-authorized consumido.
InstallRegisteredInactive10partes/stream20234/TX20701/19TX16RX, socketworkerclosed/exit0.
GET16→17 IDsflagsintactos, activa365210175; propia365219969inactiva/removible.
JournalRegistered10/sinlock. Finallygatescerrados/rebuild/test0sockets. NoSETDELETEretry/proc/CdesdePC.
[Plan/resultadosR256](registry-check-physical-plan-r256.md). NextRegCheck4barrasVERDELIMA,
REG CHECK/15grises/CHECKuna vez→colores/LEN CODE24hex→habitual/menúscrolllongpress.
Rojoinicial/faltaUI NO CHECK. No repetir/rearmar/Cloadunload/STEPSTOP/reboot.

**Actual R255: retorno R254 normal confirmado; RegCheck preparada NO autorizada/enviada.**
Usuario«todo ok» habitual/menúscrolllongpress. R254frame/CreadEOFclose probados, postregrojo desconocido.
[PlanR256](registry-check-physical-plan-r256.md). ID365219969,20168B,preview4VERDELIMA,
SHAcb0cd4325d698b976e998e22e762071852703221e2054dcf015286c5beb57487,
sourceeedac3f0cb5f3012ddc73229a7feac7e318c1818946f3d04121c0be1306f46b9.
RegCheck/CHECK/15grises, dosprocRB67+EOF+close, segundoopenNOtrascloseincierto.
ShapeR251estricto, LEN/HEAD/Tailsame + resumen24hex lens/codes/nonzero-mask/firstdiff/errno.
No C/node/shell/load/unload/oldfiles/Timer. Ownmark14bytespersiste.
19casosS3/tmpreal/procwidgetssimulados pasan sinfixturefail; compiler22readback/noADB.
Reporteartifacts/emulator/registry-check-r255-verified; paqueteartifacts/registry-check-r255/RegCheck-id-only.face.
No nuevaoperaciónfísica. Gatescerrados, journalregistry-check-r256.json no usado.
Next revisiónUNensayo/presencia>=50%, no autorrepetirC/relajarparser/unload.

**Actual R254: snapshot32bytes C válido/IDLE/cierre confirmados en foto; REG LAST rojo.**
[Resultado](state-read-physical-result-r254.md). Foto: primeras8filasverdes, REG LAST/FINALrojos.
Hex4134575201000000+24bytes00: magic0x52573441/version1/state/status0,32bytes.
Privatephoto-observation.json enstate-read2-r254-authorized, manual no digitalcapture.
OPEN/read32/EOF/fclose propios probados físicamente por indicadores/frame; no STEP/START/STOP/uninit.
REG LAST combina postreadEOFclose/inspect/byteigualdad; subcausa desconocida. No afirmarpadding/corrupción/unload.
Retornohabitual/menúscrolllongpress preguntado víaasync, aúnpendiente. No nuevo hardware.
Next metadataONLY para verificarregistroactual/estabilidad/prefix-tail-len, después normalreturn.
No repetirStateRead2/rearmar/recargar/rmmod/STOP/driverfísico. Privilegios/recoveryintegraldesconocidos.

**Actual R254: StateRead2 instalada inactiva; READ C manual pendiente.**
Usuario«si»autorizaUNensayo/presencia>=50%. Runnerstate-read2-r254-authorized consumido.
InstallRegisteredInactive10partes/stream20430/TX20897/19TX16RX, cierresworker/socket/exit0.
GET15→16 previosIDsflagsintactos, activa365210175; propia365219970inactiva/removible.
Journalstate-read-r254.json Registered10/sinlock. Finallygatescerrados/rebuild/test0sockets.
SinSET/DELETE/retry/C/proc/node desdePC. [Plan/resultadosR254](state-read-physical-plan-r254.md).
NextusuarioStateRead2(noStateRead),4barrasCIAN,C STATE/10grises/READ C una vez→colores/framehex→
habitual/menúscrolllongpress. Rojoinicial/faltaUI NO READ. No repetir/rearmar/load/unload/STEP/STOP.
C sigue residente sin lectura física propia confirmada. PreviewtítuloC STATE deliberado.

**Actual R253: fallo R252 localizado; StateRead2 preparada, NO autorizada/enviada.**
UsuarioPreCheck00420000, MARK/REG OPEN/READ/EOF/CLOSE/SHAPE verdes, OLD OPEN/FINALrojo,
OLD READ/CLOSE/MATCHgris; habitual/cambio/menúnormal. Propio registro66bytes identificado;
fallóapertura marca viejasinerrno, no C. CatálogosguardadosR250StepC977sí/R252no.
Retiradaesfera/archivosmientrasCresidente explicacióncoherente, no atribuirR250fallo anterior.
NuevaStateRead2 ID365219970,20364B,4barrasCIAN, source0878f66374d1f0026a56464ab00699e93e28d6e3733fb04b370d164b26353f0f,
SHAba0ecb35a5a868048f52a7c1290bf2d9be8aec01431fdca32e5ecf8831849348.
Soloquitaroldmarkprereq; mismosregistry/one-shot/read32EOFclose/postregframe, nooldpaths.
47casosS3/tmpreal/noderegwidgetssimulados pasan, incluyeoldfaults sinaccesoold/harnessreject.
Reportartifacts/emulator/state-read-r253-final, paqueteartifacts/state-read-r253/StateRead2-id-only.face.
Plan [R254](state-read-physical-plan-r254.md), journalstate-read-r254.json aúnno usado.
Emulador8216yaausente; recordarchivado yrelanzadoescaladoSteveregistration, PID6816/sesión64013.
NoPTkillhardware/reboot. Gatescerrados. Next revisiónUNensayo/presencia≥50%.

**Actual R252: PreCheck instalada inactiva; CHECK manual pendiente.**
Usuario«ok go» autorizaUNensayo/presencia>=50%; runnerprecheck-r252-authorized consumido.
InstallRegisteredInactive10partes/stream19194/TX19661/19TX16RX, sockets/worker/exit0.
GETindependiente15→16, previosIDsflagsconservados, activa365210175; propia365219971inactiva/removible.
NoSET/DELETE/retry/C/proc desdePC. JournalRegistered10/sinlock. Finallygatescerrados/rebuild/test0sockets.
Plan/resultados [R252](precheck-physical-plan-r252.md). Next usuarioPreCheck4barrasNARANJAS,
11grises/CHECKuna vez→colores+LEN CODE8hex→habitual/menúscrolllongpress.
Rojo inicial/faltaUI NO CHECK; no reabrir/rearmar/repetir/load/unload/STEP/STOP/reboot.

**Actual R251: PreCheck preparada, NO autorizada/enviada.**
[Paquete/pruebas/planR252](precheck-physical-plan-r252.md). ID365219971,19128bytes,
SHA3f0bc2fcd0303df735a02fa203e1967b9f1bfff233dc7c8d5f3bc87192121c9e;
sourceSHA0d1e5ede95dd0dc318ac4bbef031c030aef4f707bd5163f6032835333bee3c70.
25casos focalizados pasan S3/tmpfsreal/registrywidgetssimulados; reportprecheck-r251-verified.
Main reutilizaUI R249 con11dots/8glifos, preview4NARANJAS/PRECHECK/CHECK/LEN CODE.
Filas MARK/REG OPEN/REG READ/REG EOF/REG CLOSE/REG SHAPE/OLD OPEN/OLD READ/OLD CLOSE/OLD MATCH/FINAL.
Una marcaown16bytes persiste; leeproc67+EOF+close, oldmark15+close independiente;
cierreincierto nooldcheck. No /dev/C/shell/load/unload/STEP/STOP. Hexlensreg4/old2/code2;
referencia00420E00; códigosdoc. No direcciones. Oldmarker soloRB.
Compiler noADB22resourcesreadback, perfilr251/journalprecheck-r252.json aúnno usado.
Prepareclosed10partes/TXbudget32768 confirmado; helpercerrado
f80f5f7ccf658e9682e267f0bafff2c9dc0d6bebb6e30e1384d9bdc62add8e3d.
Se omitieron suites completas protocolo/transferencia ya aprobadas; helpergatescerrados.
Rework para evitar dos rebuilds de habilitación aúnpendiente, no afirmar completado.
Next revisiónUNensayo/presencia≥50% antes de enviar; no reutilizarR250.

**Actual R250,2026-10-14: StateRead preflight falló; retorno normal confirmado.**
Usuario inicialgrises/FRAME HEXsinpunto; MARKverde,REG INFOrojo,«frame final rojo»,restogris.
REG INFO combina lectura/EOF/cierre/clasificación deproc y marcaantigua exacta/cierre.
Código devuelve antesopenC conREG INFO/FINALrojo; OPENgris apoya no callbackspropios.
No snapshot; causa/subfase desconocidos, no inferir ausencia de módulo o fallo de C.
Si FRAME tambiénrojo, discrepanciaconrama que lo dejagris; conservarreporte.
Usuario puedevolver/cambiar esfera/menúnormal. Marcaown persiste; ensayo consumido.
Next separarchecks previos enPC, no repetir/rearmar/recargar/unload/STEP/STOP/reboot.

**Instalación R250 anterior a la observación:**
[Resultado](state-read-physical-result-r250.md). Usuario autorizó UN ensayo/presencia,
pregunta con batería≥50%. Runner privado artifacts/state-read-r250-authorized consumido.
ID365219972,20536bytes, paquete SHAde20e2c8a68d7148cecbb756a0245d6c357eb792cf220e198a276af455db80e9.
RegisteredInactive,11partes/stream20606/TX21088/20TX16RX. Sin SET/DELETE/retry.
GET independiente16→17, previos IDs/flags intactos, activa365210175; propia inactiva/removable.
Journalstate-read-r250.json Registered11/sinlock. Socket/worker/exit0 confirmados.
Finally Nodefalse/r167/C#false, gates0sockets; helpercerrado
49d593a7efa36fc2739e97fa2a47d55d9eda330bd441f18197f4cd3c879cd78c.
Durante instalación NO callbacksC/node/proc; rw4step234 sigue sin snapshot comprobado.
Next usuario StateRead4barrasAMARILLAS/C STATE/10grises/FRAME HEX vacío/READ C UNA vez;
si FINALrojo inicial/faltaUI NO pulsar. Reportar colores/frame y retornohabitual/menús/scroll/longpress.
Rows MARK/REG INFO/OPEN C/READ C/EOF C/FRAME/IDLE/CLOSE C/REG LAST/FINAL.
IDLEamarillo no acción; FINALverde no permiso de unload. No reabrir/rearmar/repetir,
recargar/retirarC/STEP/STOP/reset/reboot automático. Privilegios/recovery integral desconocidos.

**Historial R249,2026-10-14: preparación PC anterior a autorización/envío R250.**
[Carrier](state-read-r249.md), [planR250](state-read-physical-plan-r250.md).
ID365219972,20536B, artifacts/state-read-r249/StateRead-id-only.face,
SHAde20e2c8a68d7148cecbb756a0245d6c357eb792cf220e198a276af455db80e9,
sourceSHA73e65d7a693d6449239077da14694a68e10b284845021607e85111b406e0e1e2.
Preview4barrasAMARILLAS, C STATE/READ C/10grises/FRAME HEX vacío. No C alseleccionar.
Ownmarca15B state-read-attempt-r249.txt(RW4-STATE-R249\n), persiste; beforeMETA67+EOF
classifierR248pinned/oldmark14exact(closesknown)→nodeRB/setvbufno/read32/EOF1/close1explícito
→decode/idlecheck/postMETAigual→framehex64chars. Sin nuevoELF/load/unload/shell/nodewrite/
STEP/STOP/Timer/hilo/GCcódigo. SÍ invocaCresidente; flags nativeExecutablefalse no significan
noNativeCallbacks. Open/read/close modificanRAMrefs/cursor. Cierre incierto no postMETA.
Rows MARK/REG INFO/OPEN C/READ C/EOF C/FRAME/IDLE/CLOSE C/REG LAST/FINAL.
IDLEamarillo frameválido no inicial, NOacción; FINALverde no safeunload.
47casosLuaS3/tmpfsreal/nodo-registry-widgetsSIMULADOS pasan, módulosigual/tmpretirado.
Primerconteo48harnessincorrecto→47, sourceproducciónigual; logsoriginalesconservados.
Finalartifacts/emulator/state-read-r249-final. NO C RW4 o callbacks realesS3 ejecutados.
Compiler noADB/readback22recursos;64celdasg17yaProcView; transfer12/gates0sockets/prepare11partes.
Nodefalse/r167/C#false, helpercerradof8ec0ebda8392d3c7f96d81e333ac04f5ed36cf8c7a1367a3c639d857ffbd62c.
NoBT/USB/hardware nuevo; journalstate-read-r250.json ausente. NextaprobaciónUNensayo/presencia>=50%.
No reutilizarR247/autorecargar/retirarStepC/driverfísico/firmware; codepotencialmenteprivilegiado
callbacksABI aúnno probadafísicamente. EstadoInterno/residenteshandlesUNKNOWN.

**Actual R248,2026-10-14: registro físico reconstruido, StepC residente.**
Usuario2fotosProcViewTEXT/HEX,4verdes/LEN0042=66. Head64/tail16 overlap14 exacto,
reconstrucciónprivada artifacts/proc-photo-r248;63ASCIIacabacomaDATA SIZE+3NUL/sinLF.
Nombre rw4step234; entrybase+1/uninitbase+0x141/text972/arg0/export0 coincidenR234;
DATAptrnonnull privado, tamañoDATAAUSENTE(no inventar36). Registropropioobservado,
init/registeréxitoinferenciafuerte; estado/handles/callbacksno probados.
Ruta de fallo probable RegistryUncertainAfterLoad antes snapshot/START; no log237certificando.
Retornohabitual/menús/scroll/longpressconfirmado «si, todo nice». R247consumido.
Classifierpuro proc-own-record-r248.lua sourceSHA19d01972e4da124c634569c71c36f75d8034ce7f550865428449abb5111403b5,
24casosLuaS3/fixtureprivadas pasan, modulesigual/tmpretirado; metadata/inventoryCompletefalse,
dataSizeKnownfalse, NO readyToUnload, NO files/shell/C ni integradohardware.
Toolsreconstruct-proc-snapshot-r248.mjs/test-proc-own-record-r248.mjs guardexisting.
Nextsnapshot32delMISMOmoduloresidente, NOrecargarELF. Prepararcarrier/validación/plan
antesautorizar open/read/close callbacksC nuevos. Luego solo considerar unloadcontrolado.
No RMMOD/StepC/ProcView/rearmar/delete/reboot automático; privilegios/recoveryunknown.
Gatesfalse/r167/C#false; helper fdb70ddc1963e8c0da7e7185bd867751369613e7405fd077a827721768ef052b.
[Análisis](proc-observation-r248.md); direccionesextractoprivados,no publicar.

**Historial R247,2026-10-14: instalación previa a vistas/retorno ya completados.**
[Resultado](proc-view-physical-result-r247.md). Usuario1ensayo/presenciaafirmados,
pregunta>=50%batería; autorregistrada. Runnerprivadoproc-view-r247-authorizedconsumido.
UNinstallRegisteredInactive11partes/stream21906/TX22388/20TX16RX, modelFWgate,
selectedByClientfalse/transferAcceptanceVerifiedfalse, cierreworker/socket/exit0.
GETindep15→16, previosIDs/flagsintactos, activa365210175; propia973inactive/removable.
Journalproc-view-r247.jsonRegistered11/sinlock. NoSET/DELETE/retry/C/procdesdeelPC.
Helperautorizado4a5e4c817a02047a8c364916bc8b8045dc309a15c8bb66a8d136270b45cbe0d5.
FinallyNodefalse/r167/C#false, helpercerrado
fdb70ddc1963e8c0da7e7185bd867751369613e7405fd077a827721768ef052b,gates0sockets.
NextusuarioProcView3barrasAZULES/PROC DATA/4grises/camposvacíos/CHECK.
Rojoinicial/faltaUI NO CHECK. CHECKuna vez; si4verde/datos, imagenTEXT conLENHEX/TAIL,
MODEuna vez imagenHEXmismaRAM/noIO; luegohabitual/menús/scroll/longpress.
No pedirZIP/log/claves, no publicarextractosreales. Sierror NOreabrir/rearmar/reboot/DELETE.
StepCresidenciaUNKNOWN, ningunaretirada/Cautomáticaautorizada.

**Historial R246,2026-10-14: ProcView preparada antes del envío R247.**
[Vista](proc-view-r246.md), [planR247](proc-view-physical-plan-r247.md).
ID365219973,21836B, artifacts/proc-view-r246/ProcView-id-only.face,
SHA07527d9a79a8d24d7e761db65c73198f93f3265da2304963b95bbc916d85b75a;
sourceSHA5db8d5670f96ef1940c7d60f011a8015d0eb7a6182731b98dcb786f467c6b209.
Preview3barrasAZULES/PROC DATA,4filasMARKOPENREADCLOSE, LEN HEX/HEAD TEXT/TAIL HEX,
CHECKmanual1lectura+MODE alternaHEAD TEXT/HEX enmismaRAM sinIO. Ownmarca17B
proc-view-attempt-r246.txt(RW4-PROC-VIEW246\n), persiste, rootnormalizadopinned973.
Proc read8193+1EOF <=8192, cierre; soloRAMlen/head64/tail16; no tabla/capturaPNGsaved,
no shell/dev/C/ELF/Timer/GCIO.164celdasImage+leyendas/botones, RW4capacidadnoensayada.
22casosS3/tmpreal+mockproc/widgets pasaninclbinario0..255/hexexacto/dobleclick/reentrada,
20MODEsinIO/errores/paths. Finalartifacts/emulator/proc-view-r246-final; primerendextra
Lua corregidoantespack, logpreservado. ModulosS3igual ytmpretirado.
Compiler noADB/readback51recursos. PreviewsPNGcompuestossintéticosrevisados, NO LVGLreal.
Transfer12/gates0sockets/prepare11partes32768; protocoloigual no repetir36sesión.
Nodefalse/r167/C#false; helperclosed3e1d6e4a9105d916c630557d08d4954e61203163450e2a3e667ab43c705f518f.
No nuevoBT/USB/hardware; journalproc-view-r247.json no creado. NextaprobaciónUNensayo/presencia>=50%.
No autoenviar, consumircorrecciónprevia, rearmar/retirarStepC. ResidenciaUNKNOWN.

**Actual R245,2026-10-14: ModInfo2 CHECK observado, retorno normal.**
Inicial15grises; usuario MARK/OPEN/READ/CLOSE verdes, END LINE/FINAL rojos,
restogris; confirma menú/cambio de esfera sin problema. Fuente implica ASCIIverde
siENDLINErojo, pero reportado dentrorestogris: conservar discrepancia, no inventar
observación/bytes. Lectura/cierre pasó; condiciónLF apunta faltaLFfinal de textono vacío,
truncamiento64hipótesis. Inventario/residenciaCStepC UNKNOWN, NO cargar/retirar/reabrir.
EnsayoR244consumido. Gatesfalse/r167/C#false, helper6ba6f357d42859c7c1713fc092df9e42fdc42e2d05ee5eb06ca2c12ec24032d9.
PruebaPC sintética explain-registry-boundary-r245.mjs: fila65→payload63 con nuevecampos
y size36→3todavíadecimalválido; ignorarLF no soluciona integridad. NoHWnuevo.
Next: preparar vista acotada de longitud/head/tail reales, sinC/tabla cruda guardada;
paquete/validación/plan y revisión antes enviar. Nootrogrupo deindicadores ambiguos.
[Análisis](module-registry-result-r245.md), [resultado](module-registry-physical-result-r244.md).

**Historial R244,2026-10-14: ModInfo2 instalada, CHECK posteriormente observado.**
Usuario pidió «pues corrige eso concreto y mandalo al reloj de una, te estas demorando mucho»;
autorización directa, sin re-pregunta. R242negra, pudo volver/cambiar esfera/abrirmenú,
sin resultadoCHECK/proc/mark. Defecto assertSCRIPT_PATH==own reproducido con //lua/,
normalizadorR201 incorporado+fullrootpinned, imágenescanónicas; causa física no probada.
R243ID365219974,16512B, artifacts/registry-r243/ModInfo2-id-only.face,
SHA7c9d38eb641db97c96db35ccd495d1f8b8505db2b4158b91aeddac1ec11dfb25.
Main6703B SHA44d0906a031b1a1f8fb927efcb002bdcbddeb1605aaab7896b52272bb835043c.
Reader/PNGidénticos; ownmarkregistry-attempt-r243.txt17B.38lector+32UI pasanS3/mockproc,
incluye2formas//+12rutasrechazadas+legacyfail; tmpretirado/modulesigual.
PlanR244registradoantes. UN installRegisteredInactive9partes/stream16574/TX17026/18TX16RX;
modeloFWgate; noSET/DELETE/retry. GETindep14→15previosIDs/flagsintactos,
activa365219975(ModInfo)segúncatálogo, propia974inactive/removable. Catalogpre14vsR242post15
causadesconocida; usuariohabíadichohabitual, noinferirvisualdesdecatálogo, nomodificarauto.
Journalmodule-registry-r244.jsonRegistered9/sinlock, doscierres/exit0.
FinallyNodefalse/r167/C#false; helperclosed6ba6f357d42859c7c1713fc092df9e42fdc42e2d05ee5eb06ca2c12ec24032d9/gates0sockets.
Nextusuario seleccionarModInfo2(NO ModInfo),2barrasNARANJAS/MODINFO15grises/CHECKuna vez;
reportarrojos/grises/amarillos y retornarhabitual/menus/scroll/longpress. No reabrir/rearmar
o intervenirStepC, residenciaUNKNOWN. [Resultado](module-registry-physical-result-r244.md).

**Historial R242,2026-10-14: ModInfo instalada, posteriormente observada negra.**
[Resultado](module-registry-physical-result-r242.md). Usuario autoriza1ensayo y presencia;
pregunta>=50% batería, afirmaciónregistrada. UN installRegisteredInactive8partes,
stream15850/TX16285/17TX16RX, preflightmodeloFW2.2.86, sinSET/DELETE/retry.
Socket/workerclose/exit0, transferAcceptanceVerifiedfalse. GETindep14→15,
previosIDs/flagsintactos, activa365210175 conservada, ModInfoinactive/removable.
Journal module-registry-r242.json Registered8/sinlock.
Artifacts privados module-registry-r242-authorized, runnerconsumido no reejecutar.
Helper autorizado6c66b77a4461801963359042dca33d6905e8ea97cf164083cdcec5e37570e705.
FinallyNodefalse/r167/C#false; helpercerrado actual
c9af7995a379ebd80aae1699170f0bc134891b3de9ae23f348cc7deacab38657; gates0sockets.
Nextusuario ModInfo2barrasNARANJAS, MOD INFO/15grises/CHECK. RojoFINALinicial/faltaUI
no CHECK. CHECKuna vez/reportarrojosgrisesamarillos; luegohabitual/menus/scroll/longpress.
EstadoCStepC DESCONOCIDO. Sinproc/shell/Cload/unload desdePC; no reabrir/rearmar/DELETE/reboot.

**Historial R241,2026-10-14: preparación previa a autorización/envío R242.**
[UI/validación](module-registry-ui-r241.md), [plan físico R242](module-registry-physical-plan-r242.md).
ID365219975,15792B, artifacts/registry-r241/ModInfo-id-only.face,
SHAdf32945c91dfa484ce573164ee38daf1bdfe6a05aa9a873a7b172fa0e2b56f99.
Main5984B SHA0abc68497640495a6189fcb50dae35fcefeb5a6a5c55a3b31b2945f1745f462a.
Preview2barrasNARANJAS, MOD INFO,15indicadores/CHECK; consulta solo alclick.
Marca17B propia registry-attempt-r241.txt bajo365219975/lua; persiste/no rearmar.
LectorR240derivado solo2flags open/read antes close. /proc/modules rb fijo;
sin shell/captura/dev/ELF/C/GCIO.38lector+17UI pasan S3tmpfsreal, proc/widgets/fallos
simulados; inventarioS3igual y tmpretirado. Error ensambladoJS $' detectadoPC,
corregido callbackliteral; logfallido registry-r241 preservado, final-pasa registry-r241-final.
Compiler noADB/readback4recursos. Transfer12/sesión36/gates0sockets; prepare8partes.
Nodefalse/r167/C#false; helpercerrado fedc4b769c986b31f8d7f45a023af5493ba7ed388c289a0db3150666d448903e.
NoBT/USB/hardware nuevo. Journal module-registry-r242.json todavía no creado.
StepCresidencia DESCONOCIDA. Next: aprobación UN ensayo/presencia>=50%; no ejecutar
instalación hasta respuesta. No repetir C ni consumir autorización previa.
Rows MARK/OPEN/READ/CLOSE/ASCII/END LINE/ROWS/FIELDS/NAMES/POINTERS/NUMERIC/C MODULE/
NO MOD/NAME HINT/FINAL. Hintamarillo no safeunload; modverde+nomodrojo válido.

**Actual R240, 2026-10-14: StepDiag completada y retorno normal confirmado.**
Resultado R239: PACK/UNPACK/IO MODE/STEP ELF/STEP MARK/OLD CAP/CLOSE verdes;
LSMOD rojo; C MODULE/NO MOD grises. Usuario confirma habitual, menús,
desplazamiento y pulsación larga normales. Una autorización consumida, no retry.
La marca exacta demuestra que el preflight inicial precedió a su escritura
según el código; no prueba carga, nodo o retirada C. Inventario DESCONOCIDO.
No abrir /dev/rw4step234, cargar/descargar C, rearmar o repetir los ensayos.
[Investigación y siguiente lectura](module-registry-r240.md): formateador de
lsmod encontrado en imagen candidata fijada; lee /proc/modules y formatea CSV.
La causa del rojo no está identificada. Gates Node=false/r167 y C#=false.
No nuevo Bluetooth, USB ni operación física en R240.
Lector registry-r240.lua preparado: /proc/modules rb fijo, <=8193+1 EOF,
<=8192/64filas, CSV9campos; decimalu32 separado de pointerhex; errores por etapa,
partial ownNameHint no inventario válido.38tests pasan LuaS3/tmpfsreal,
proccontenido/fallos simulados; inventarioS3igual y tmpretirado.
SourceSHA dce2b453b8eda83d1a648bc31a5dcce8858655ad00da3d2f45823472efecdc4d.
No UI/paquete/perfil físico nuevo. Next: UI integral para esta lectura,
paquete/tests/plan/pins antes de autorización; no reintentar C.
Researchfinal artifacts/research/rw4-lsmod-r240-final; r1=64 en1bb8c2.
Posible truncamiento, no causa física demostrada; imagen candidata no hardware.

**Historial R239: instalación previa al CHECK (observación ya completada arriba).**
[Resultado](step-diagnostic-physical-result-r239.md). Usuario autoriza1ensayo/presencia,
pregunta incluía>=50%batería, afirmaciónregistrada. Perfilr238 aprobado intacto.
Artefactoprivado artifacts/step-diag-r239-authorized, script un intento confinally.
Helperautorizado3f317f35b1981cbb399bf9e227db802ba36f8edc0427bc2231c4236ec6104726.
UNinstallRegisteredInactive,11partes/stream20850/TX21332/20TX/16RX, modelFWgate,
selectedByClientfalse/transferAcceptanceVerifiedfalse; socket/workerclose/exit0.
Finally Nodefalse/r167/C#false, helperclosedactual
9ec4971116e0bc8b1ca6ab21fb0f0edc0bab05050f25c73005aac0eb5bf61228; gates0sockets.
GETindepComplete:13→14previos IDs/active/canDelete intactos, activa365210175;
StepDiag365219976inactive/removable, StepC365219977 presente. Cambio17→13 sucedió
ANTES de esteenvío; causanoatribuida, noDELETE nuestro. JournalRegistered11/sinlock.
NoSET/shell/lecturaFS/operacióndeC desdePC. El estadoC237 continúaDESCONOCIDO.
CHECK y retorno ya observados: véase el estado actual arriba.
Sinrepetir/reabrir/DELETE/rearmar/reboot/RMMOD/otraC carga automática.

**Historial R238,2026-10-14:** usuario StepC5grises→START→EXITrojo inmediato,
prueba bloqueada; luego confirmahabitual/menus/scroll/longpressnormal «si,todo normal».
EnsayoR237 CONSUMIDO; no reabrir/rearmar/repetir/DELETE/reboot/RMMOD automático.
Carga/nodo/módulo/retirada DESCONOCIDOS, ningúnruntime log/razón capturado.
NoinferirCfalló/nuncaentró/ya salió. [Resultado](step-physical-result-r237.md).
PreparadoStepDiagR238 Lua+PNG, leeold3archivos SOLO rb; pack24/unpack32 puros,
setvbuf enmarcaREGULAR propia, un lsmod a captura propia; NO /dev ni C load/unload.
Códigoen experiments/native-step/diagnostic{-main,-tests}-r238.lua ydiagnostic-r238.lua;
builder tools/step-diagnostic-source-r238.mjs pinELF234 comoDATOS comparación, no materializa.
19 casosLua/tmpfsreal/UI/shellSIMULADOS pasan, scope rejects oldwrites/cmdextra,
módulosrealesiguales/tmpausente. Package20780B ID365219976 StepDiag3barrasAMARILLAS,
artifacts/step-diag-r238/StepDiag-id-only.face SHAe4d30fa6da8a08164bea262a1d54616447fc81d71ebe4fedfda42aad4914447c.
main11204B SHA16f37c1c206e374e7f8fb73fa1bd6bd5ba5563921805f62e7ba044ccc093496b.
Perfilr238/plan [R239](step-diagnostic-physical-plan-r239.md), posteriormente autorizado,
instalado y observado; journal Registered11. Prepare11partes/transfer12/session35/gates0sockets.
Helperclosedactuale4f5ea512bb55da612a0aedc14cb556a6091d63c96c8372f2f8d7cd044b99973;
Nodefalse/r167/C#false. Sin nuevoBT/USB/hardware enesta preparación.
FilaUI PACK/UNPACK/IO MODE/STEP ELF/STEP MARK/OLD CAP/LSMOD/C MODULE/NO MOD/CLOSE.
GreenMODULE+redNOMOD válido; NO exigirallgreen. InventarioAHORA no retrocausa exacta.
Este checkpoint fue completado por R239; NOrecargarCpara averiguarlo.

**Actual R237, 2026-10-14: StepC instalada, manual pendiente.**
[Resultado/plan](step-physical-result-r237.md). Usuario autoriza UN ensayo/presencia,
pregunta incluía batería>=50%; afirmación registrada, no consultaextra.
Perfilr236/paquete aprobado intacto. Primera preparaciónPC fallóCOPYFILE_EXCL
nombreauthorized-build duplicado ANTES install/BT; finally gatesoff/build/test0sockets,
sinjournal/install-report. Continuación verificaausencia/intención y mismoSHA,
preservaoriginalartifact, corrige metadatafilename; UN envío físico total.
Archivosprivados artifacts/step-r237-authorized-final (originalpreparaciónconservado).
Helperautorizado9e726818b32e0ae85b433937cba8eab60b24e80ef9baf583df89a70bd58976c2.
Installr236 RegisteredInactive,16partes,stream31898/TX32455/25TX/16RX, modeloFWgate,
selectedByClientfalse/transferAcceptanceVerifiedfalse; socket/workerclose/exit0.
Finally fuentesoriginales Nodefalse/r167,C#false; helperclosed
982519961fcc293799d9b83771bec38cc898e2ef53a4d95dc1f90711c577bde0/gates0sockets.
GETindependienteComplete:16→17, IDs/active/canDelete anteriores intactos,
activa365219979(HoldPad), propia365219977inactive/removable. JournalRegistered16partes,
sinlock. NoSET/DELETE/cargaC desdePC/cambioBT/firmware/particiones.
AHORA usuario: seleccionarStepC5barrasVERDES, C STEP y cinco grises/START;
rojoinicial/faltaUI NO START. STARTuna vez, barra, UP/LEFT/RIGHT/FIRE hold4s+release,
verdehold/grisrelease y sinselector; EXITuna vez, leer5indicadores; volverhabitual
selectorneutro oAjustes y menús/scroll/longpressnormales. Faltaobservaciónruntime.
Norepetir/reabrir/rearmar/reinstalar/DELETE/rebootautomático. Autorizaciónsolo1ciclo.
SinpruebaCcallbacks/BSS/driver/retiradaRW4 nueva aún; awaitrespuesta manual.

**Actual R236, 2026-10-14, PC completo; R237 pendiente:** [StepC](step-ui-r236.md),
[plan físico](step-physical-plan-r237.md). NO aprobación/envío nuevo aún.
ui-r236.lua +main template+materialize-r236.lua, builder step-ui-source-r236:
R235 fábricas originales pin/evidencia intactos; deriva check_file para escribir
ELF ausente2620B y readback exacto, NO overwrite; nodo modo r+b evita creación.
31UI+37carrier pasan con Lua producción/tmpfs real, widgets/Timer/input/shell/C
SIMULADOS. Report artifacts/emulator/step-ui-r236-final (anteriores preservados).
UI hold ACK antesverde, STEP muevebarra, STOP activefalse/Timerpausa primero;
EXITverde solo retired y UIgood, erroresrojo aunque cleanup; pagePause hook previo.
GC flags solo, NO I/O/retirada; puede quedar C residente sin STEP. Presupuesto300.
StepC365219977 preview5barrasVERDES, tituloC STEP; package31808B en
artifacts/step-r236-final/StepC-id-only.face SHA5c117cce07ccb5388f0bf0c2345f829827e810daae0db2c32886d9d75a14ed40.
main21842B SHA63b1dee6d625f0908e6b8952c4deb115bfd0973125195154a1702f6308c92053.
ELF234 sin cambios SHA713fe535880f2cbae928efe5199d15b0c39a01bc455aab819f8a534cbab4d424,
solo incrustado en main, generado manualSTART; no ELF recurso duplicado.
Perfil r236 nuevo/spec, journal native-step-r237.json AUSENTE según instalación
no realizada (comprobar antes futuroenvío). prepareoffline16partes pasó.
Transfer12/session34 r236 +regresión session34 r220; gateCLI/native0sockets.
Primer sessiontest falló512 por framingbudget; guard reserva MASS+6queries
antesprimerMASS,512 rechaza sin datos,2048/4080pasan. Budget32KiB intacto.
Helperrebuild cerrado SHA292fa4a4b9b79c48c93f14ac11ea429ba2f129083bae37e33bb6971859487c6f.
Gates Nodefalse/r167/C#false sin cambios. NoBT/USB/hardware, stock guest intacto.
Siguiente: pedir UNA aprobación/presencia/batería>=50% para ensayo fijo R237;
no ejecutar por «ok». NoDELETE, no rearmar marcas, no C234 en S3.
Si autoriza: activar solo r236/C# temporalmente, build/pins/prepare/installUNA,
finally gatesoff/rebuild/tests, GETindependiente, instrucciones manualesplan.
Antefallo incompleto/busy/EOFunknown detener sin fallback/unload a ciegas.

**Actual R235, 2026-10-14, solo PC:** [Cliente del candidato RW4](step-carrier-r235.md).
Commit R234 7f7b92b. Nuevo client-rw4-r235.lua puro + adapter-rw4-r235.lua;
fábricas ensambladas por step-carrier-source-r235.mjs, ELF234 mismo hash/2620B.
Nodo /dev/rw4step234, módulo rw4step234, raíz365219977/lua, marca234 persistente.
Single START/STOP/rmmod; 300STEP/2048mensajes; ACK secuencia/fase/mask/counters,
EOF32, cierres auditados. No GC I/O. Desconocido/cierre fallido => conservar C;
STOP recupera solo low/high del propio envío; ACK de STOP perdido => no retry.
Habilitación false falla antes de escribir marca. Inventario inicial vacío y
propio exclusivo; snapshot inicial cero antes de atribuir nodo; no unload a ciegas.
37 escenarios pasan con Lua producción y tmpfs real; shell/node SIMULADOS,
NO ELF ejecutado, NO widgets/Timer/privilegios/timeout duro probados.
Informe artifacts/emulator/step-carrier-r235-reviewed, anterior35 conservado.
Tmpfs propio retirado/inventario real sin cambios; emu guard/connect pasó.
Node gates false/r167, C# false verificados; sin nuevo BT/USB/hardware.
Next: integrar cliente en UI HoldPad/Timer/EXIT/pageOnPause; pruebas fallos UI,
paquete fijo/plan para revisión. NO paquete, perfil físico ni autorización nueva.
Fuentes/hashes/limitaciones en doc235; no repetir test con informe ya existente.

**Actual R234,2026-10-14, soloPC:** [Contrato/candidatoRW4](rw4-step-candidate-r234.md).
Scripts232stdlib→VFS,233dispatch,234anchors/candidatebuild. fops0/4/8/12 verificados
porcallersRW4; tabla32bytesvs40S3, fileopaco. Modinfoinitmodule+24,uninit0/arg4;
retornonegativoevitaFree. InodeRemove desvinculaANTESbusy: exigirhandles0/STOP,
no asumirpath sigue siError, nunca retirara ciegas. No config/priv completos.
Ccandidate bridge-rw4-r234.c (misma lógicacoreR229) node/dev/rw4step234, marca14B
RW4-STEP-R234newline rootfutura365219977/lua/step-attempt-r234.txt. NOcarriercreado.
5bindings/FNP64: OPEN/READ/CLOSE físicasanteriores; REGISTER497624/UNREGISTER497670
NUEVASsoloestática. FPnuevospuedenfault. BSSzeroguard, refscliente único noatomic.
ELF2620B SHA713fe535880f2cbae928efe5199d15b0c39a01bc455aab819f8a534cbab4d424,
v8Mmain/Thumb/soft, entry1,text972align8,BSS36,17ABS32/imports0; stackinit40/read88/
write24/uninit8 sincallees. NOejecutadoS3/RW4, noBSSfísicovalidada. Gates cerrados,
sin otrohardware ni perfil físico para candidato. NextPCcarrier específico RPC/
STOP/retiro/error/ACK/cierre conregistro/ELF/marca; luego empaquetar/plan/revisión.
Emu actualizadoTTY62822/pid8216 (guard antesusar), stockNeat activa/S3StepPadinactiva.
Último resultado físico sigueHoldPadR226. No confundir binarioS3 y candidatoRW4.

**Historial R231, completado2026-10-14, PC/S3:** [UI→C→estado visible/EXIT](step-bridge-emulator-r231.md).
No hardware/BT/USB nuevo; gatesNodefalse/r167,C#false intactos. BridgeS3 node
/dev/rw4step230/modulerw4step230/ELF2604B SHA89863182dabd4c8ce63c398c8734b98c4d1079c5dc68019bc68acecdc69f253c,
3imports register/unregister/printf,18ABS32, sinworker/flash. CLI34assertions realLuaC
passed/retiroNodo+module+ownfiles. StepPad365219978/20468B S3ONLY noELFembebido,
SHAf42cfcc39f25650ae86313e28c43d2f99eb24345e3a26a59e49400738f121fa5.
UIcuatroholds3300ms/ACK/STEP81 ordenados,masks0/1/2/4/8,barraCposicionesvariables,
manualEXIT5green/StoppedButton/Unregister0/refs0/held0 ANTEScorte. Auto300tambiénretiróC.
LongpressONdurantetests,selectortrasEXIT; OFFinicialrestaurado. No nativeframe/Doom.
Guardsfallos:buildWerrorindent;catálogoJSONvacío(iniciarresumeNOreenvío);píxelbarra
18porredondeo(nativoandabien,primerbudgetAuto). SegundoVMcompletóholds+manual.
Host15168 desapareció entre mensajes; usuario dicecancelaciónporcréditos causa
PROBABLE,no crashevidenced. Logs archivadosstep-ui-r231/prior-host antesrestart.
RestartguardadoemuTTY62822/pid8216,revisarantesusar. Final Neat362130003activa,
StepPadinactiva/IDsconservados/modulenodoTmpausentes. Inventario independiente
DESPUÉSrestart; LuaCloseANTEScorte=false. No atribuir ausenciafinalreboot a cleanup.
Reportesstep-bridge-r230/summary,step-ui-r231/{contact-test,validation}; no repetir.
SiguientePC: ABI/dispatch fops+unregister RW4 específico; no físicaadapter/plannuevo.

**Historial R229, 2026-10-13, PC/S3:** [Core y APIs candidatas](rw4-step-backend-r229.md).
No hardware/BT/USB nuevo. Gate Nodefalse/r167,C#false intactos. FW tratado datos.
Scripts research227→contract228→review229: pthread_create1e8aac, join1bbca0;
0x1bc310 esCANCEL nojoin, refutado tras verpthread_cancel.c. register_driver497624/
unregister497670 inferidos, opsRAMtable66444, atributoscopy12/defaultstack2048,
NOABIheader completo ni llamadas físicas. Cinco fuentes NuttX10.3 descargadas
oficiales con aprobación; pins enreport228, no misma fuente Xiaomi.
Decisión primerpuente cooperativo: LuaTimer llamaSTEPbreve vía nodoRAM propio,
no thread al inicio/no inputstock/no flashpercontact/noinsmodperframe.
Core header+fixture enexperiments/native-step: 41assertions realesS3, puts único,
ELF2600B SHAa902b5d417864a738332600f9f59963740fe4168838ce8aa6be2c9f9e4ee5f0f.
Módulo rw4stepcore229 retirado/tmpELFausente/inventarioigual. Report válido
artifacts/emulator/step-core-r229-reviewed; build-rejected original mantiene
memset UND rechazado antesdecarga, solucionadostores propios. No driver/UI real
conectado en229. PróximoPC: ABI/dispatch fops+modinfo y nodoACK/input/EXIT enS3.
No paquete/plannuevoRW4: no autorización física pedida o derivada de «dale».

**Último resultado físico R226, 2026-10-13:** [HoldPad controles/EXIT/retorno confirmados](held-input-physical-result-r225.md).
Usuario tras instrucciones completas: «todo funciona al 100, super bien :D esto
es muy bueno». Confirmación global del ciclo indicado; sin colores individuales,
medición temporal/logs runtime. Watchface viable para continuar este recorrido;
no Doom/inputC/ergonomía/multitouch/corona/workerRW4/sandbox/recovery probados.
Ensayo único completado, NO repetir/reabrir/instalar nuevo por permiso previo.
Gatescerrados Nodefalse/r167,C#false; helper4d4fd3a822d5d5bb6e494c77e7578bcb4aaff8572254ae2b2568f01a185e88f0.
JournalRegistered/8parts/sinlock; fuente/paquete/ID anteriores intactos.
SiguientePC [backend C con UI/input vivo](rw4-input-backend-next.md): auditar
bridge y scheduling/lifecycle específicos2.2.86, sin reutilizar direcciones S3
ni cargar C desde este feedback. No nuevoBT/USB/DELETE/reset.

**Historial R225, 2026-10-13:** [HoldPad instalada sin activación; manual pendiente](held-input-physical-result-r225.md).
Usuario autorizó ensayo/presencia/batería≥50%. Un installr224 RegisteredInactive,
8partes/TX16045/17TX/16RX; GET independiente15→16, anteriores IDs/active/canDelete
y activa365210175 conservados, propia365219979 inactive/removable. Ambos sockets/
workers cerrados/exit0. GateNodefalse/r167,C#false restauradosfinally/rebuild/test
0sockets. Helperclosed4d4fd3a822d5d5bb6e494c77e7578bcb4aaff8572254ae2b2568f01a185e88f0.
Journalheld-input-r225.json Registered/8parts/sinlock; archiveprivado
artifacts/held-r225-authorized, NO ejecutar helpertemporal archivado.
Pendiente usuario: seleccionarHoldPad CINCO barrasNARANJAS, cinco grises/START;
STARTuna vez, holdUP/LEFT/RIGHT/FIRE4s cadauno+release, EXIT, holdneutro275sobreSTART
→selector→habitual ymenús/scroll/longpressnormal. Rojoinicial/fallo NO START/retry;
si selectorabredurantejuego volverhabitual/parar. No reabrirHoldPad/Cpruebas ni
másBT/USB/envío/DELETE/reset. Instalar NO prueba input/EXIT físico, awaitrespuesta.

**Historial R224, 2026-10-13:** [HoldPad lista; input mantenido/EXIT/selector pasan S3](held-input-r224.md).
Usuario autorizó preparación PC, NO envío nuevo. [Plan R225](held-input-physical-plan-r225.md)
pendiente de una aprobación/presencia antes de tocar reloj. No BT/USB físico en
este checkpoint. 14 casos Lua mocks; cuatroholds reales3300ms/release/EXIT;
longpress stockON verificado antes/durante/después, selector abre antesSTART y
trasEXIT, Neat362130003 activa/closeLua/módulosvacíos al final. ToggleOFF inicial
restaurado por operador. S3 NO M2315W1; layoutdiagnóstico, noergonomía/inputC.
Paquete15552B ID365219979 SHA296868366da0f29a010777d031559ddf08a1c52d73f45021b9f3f034fbabff16,
Lua1ee9ff3db8c572c1737ff27f764144c5869e810eb1280ef84f1393c234a90f59.
Perfilr224, journalheld-input-r225.json/lock AUSENTES. GatesNodefalse/r167,C#false;
helperclosed675fac96664454694f9309be2515132071e37a3c17e818eaf1087adc09ad5249.
prepare8partes/transfer12/session33/helper258/gates0sockets pasan. No repetir
tests que rechazan artifacts existentes; UI queda enstock. EmuTTY33175/pid15168
arrancadofueraSandbox con perfilsteve; comprobar proceso/guard antes de usar.
Catálogorebuild Spectrum→Neat y cierreADBtransitorio registrados, no replayinstall.
Siguiente: un ensayo HoldPad, cuatroholds4s+EXIT+holdneutroselector+habitual,
sinC/shell/io/os/globalsettings/ancestros. No rearmar/reabrir pruebasC previas.

**Historial R222, 2026-10-13:** [NativeFrames cinco verdes/animación/retorno normales](native-frames-physical-result-r221.md).
Usuario: FILE/MARK/FRAMES/UNLOAD/EXIT green, animación cambiando líneas, salida y
cambio de esfera normales. Reabrió por iniciativa propia, rojo/inicio bloqueado:
coherente con marca, no prueba causa exacta/reboot/segunda carga. No repetir.
No distinguir EXITmanual/autostop/pageOnPause; respuesta no lo identifica.
«Coronas» en contexto cambioesferas, NO APIrotación física. UNLOAD antes de
animación, EXIT verde exige pausa/detach/unlink4PNG; C no residenteenanimación.
Cuatro framesprecalculados porC2780B/5APIs, consumidosLua/LVGL, noDoom/FPS.
Guardinventario bloquea197/202/211 y exige propiaausentealretirar; FSmarca/paquete
persisten, PNG/capturaslimpias segúnboolinstrumentación. No heap/priv/recovery/ABI
general/input/timersnativos/RAMDoom confirmados. Gatescerrados, sin nuevosBT/USB.
Ensayo completado. SiguientePC: contacto sostenido con selectorlongpress stock
habilitado, salida/restauraciónnormal; contenedorwatchface condicionado a esto.
NOrearmar/enviar/DELETE/activar otro paquete por permiso previo.

**Historial R221:** [NativeFrames instalada](native-frames-physical-result-r221.md).
Usuario autorizó UN ensayo y presencia. Install r220 RegisteredInactive,
15partes, TX30332/24framesTX/16RX; GET independiente14→15 con anteriores IDs/
flags y activa365210175 conservados. Own365219980 inactive/removable. Socket y
workerscerrados. LuaImage993 yaausenteANTES de este envío; no nuestra retirada.
Gates Nodefalse/r167,C#false restauradosenfinally/rebuild/test0sockets.
Helperclosed b3a53acdcfb081758f381a16a50d12fa8eba1ef73a42a9536e5342a17f978466.
Journalnative-frames-r221.json Registered/15parts/sinlock; archiveprivado
artifacts/native-frames-r221-authorized. NOejecutarhelpertemporalarchivado.
Entonces pendiente respuesta a NativeFrames/4barrascian/cincogris/RUN C UNavez, observar
animacióncolores/barra, EXIT trasvarioscambios oauto-stop~10s, cincoindicadores
finales yvolvera habitualconmenus/scroll/longpressnormales. EXITrojodeinicio/
etiquetasausentes/fallo NOclick/retry. No másBT/envío/DELETE/reset/otraactivación.
Instalar solo NOpruebaC/display/Timer/retiroFS; resultadoR222 arriba. LongpressencontrolesDoom NOprobado,
[criterioobligatorio](controls.md) registradoe9fa80c; noensayarloenestaDemo.

**Historial de preparación R220:** [NativeFrames PC/emulador lista](native-frames-r220.md).
Usuario pidió acelerar agrupando pruebas; autorizó preparar PC, NO nuevo envío.
[Plan fijo pendiente de revisión](native-frames-physical-plan-r221.md).
Siguiente: pedir UN ensayo con presencia, paquete fijo, RUN C una vez/observar
rotación de colores/barra/EXIT y retorno stock. NO instalar por «sigamos».
Gates Nodefalse/r167, C#false. Helpercerrado95abb76e35633ea30cffd2fda57f7d354a92c15d91e1f749e5963ffb1321f7bf.
Perfilr220 NativeFrames365219980,29704B,SHA94b65fb94b7b299496ca672348f1a5281fe123e5ee7991044f59e90e1705481e.
Lua18035B,SHA7b554c6d6e0012e1425efbfc0123ea56fb6cfac9c55508e35b46bbc19e8b31e1.
ELF RW42780B,SHA80b75ebe516a80a931ac30e93a4d30cc76eb137e8bc7d57195091a680ad5f636,
18ABS32,text1497,stackGCC400B sincallees; mismas5APIs físicas R217. Cuatro PNG
18564B cadauno/74256B; marca15B, rw4framesr218, raíz exacta365219980/lua.
C NOtareas/loopsruntime/callbacks/display nativo; genera4frames y se retira ANTES
deanimar. Lua validaAdler/tamaño,4Image inmutables,Timer400ms24callbacks,EXIT/pause
detachaantesunlink. GCsolo closing, puedequedarFS siVMcierra; marcaNOrearmar.
Bloquea módulos197/202/211; cleanup solo retiradaconfirmada o initrechazado/ausente.
UI FILE/MARK/FRAMES/UNLOAD/EXIT; EXITgris mientrasanima, verde solofinishcorrecto.
Preview4barras cian; no autoC/alreabrir. No Doom/streaming ni FPS demostrado.

Build separado S3 CortexA7/hard2680B SHA8a0947684397194d670d55d716d86f61e7012aef15bd91beca80e10c6de5d179:
solo este se ejecutó en tmpfsS3 y produjo cuatroPNG byte/píxel/CRC/zlib exactos;
retirado/fixtureborrada/inventarioigual. Artefactosframes-c-r218.
24casos Lua producción+I/Otmpreal+exec/widgets/TimerSIMULADOS pasaron,
frames-lua-r219/summary.json; fixtureslimpias. Error inicial de sintaxis harness
conservado aparte. Paquetes35320/32028B fallaron presupuesto/sesión fragment512;
sin ampliar TX: comments/indentación fuera, base64ELF compara bytes, previewmenor.
Final passes transfer12/session32/gates0sockets, prepare15partes.

UIreal S3 FramesUI365219981 NOELF/NSH, mismoUIhash5b5843... con frames C copiados:
capturas[1,2,3,1,2,3] todoslos píxeles verificados,4callbacks faseobservados,
EXITmanualdetacha, closeLua y stock Spectrum362130009 activa. Cleanup/nativobackend
simulados enestaUI; noasegurarFS físico/auto-stop real. Reportframes-ui-r220/validation.json.
CatálogoS3: ownafterAODnoseveía; reordenarown antesNeat permitióselecciónGUI.
Fixture89KB reducida14KB +4PNG separados; noatribuircausaúnica. UiOnly propio
fue movidotemporalmente a /data/app/watchface/r220-hold-365219997 y YA RESTAURADO
byteexacto/confilacatálogo. Final31IDs/prior30preservados, owninactive; selección
originalStorage NOrestaurada, normalSpectrum sí. Módulosvacíoigual. No nuevoBT,
teléfono,hardware,firmware. No repetir los scripts de build/test que rechazan outputs.

**Historial R217:** [NativeLog C/archivo/retirada confirmados](native-log-physical-result-r216.md).
Usuario: «file, mark, ctext, unload, end todo en verde. se conserva movimiento
y pueduo cambiar de esfera». Tercera verde exige load_observed y message_verified;
C escribe RW4_C_FILE_R214 newline16bytes tras leer marca19bytes, cinco bindings
fopen/fclose/fread/fwrite/fflush y7ABS32 efectivos para este payload2.2.86.
ENDverde exige limpieza/registro/retirada; marca permanece, no repetir/rearmar.
Navegación/cambio confirmados; esfera activa final no identificada explícitamente.
No heap/RAM/recovery/ABI general/display nativo/timers probados. Gates cerrados.
Siguiente PC: patrón de imagen C mostrado por Lua/LVGL stock, plan nuevo antes
de cualquier hardware. Al registrar esta observación, cero BT/comandos físicos.

**Historial de instalación R216:** [NativeLog instalada](native-log-physical-result-r216.md).
Usuario autorizó único ensayo y presencia; un install r215 RegisteredInactive,
14partes, GET independiente14→15 con anteriores IDs/flags y activa365210175
conservados. Propia365219999 inactiva/eliminable. Socket/workers cerrados.
Gates Nodefalse/r167 y C#false restaurados/rebuild; test0sockets pasó.
Helper cerrado d5e433352308720472131885fbeca97e8b942738082ffb9a87f382eaf4f643c4.
Journal native-log-r216.json Registered/14partes/sin lock. Archivo privado de
revisión artifacts/native-log-r216-authorized (no ejecutar helper habilitado).
Observación solicitada entonces: NativeLog/cinco grises/RUN C UNA vez,
colores FILE/MARK/C TEXT/UNLOAD/END y retorno desde Ajustes; respuesta R217 arriba.
NO repetir envío/click, rearmar marca, DELETE o nuevos comandos físicos.
Instalación sola NO demuestra ejecución; resultado posterior arriba. FirstC2/marca intactas.

**Historial de preparación R215/R216:** [NativeLog lista PC](native-log-r215.md),
[plan físico ahora aprobado](native-log-physical-plan-r216.md).

R211 test nativo S3 antiguo hello-bound1020B/SHA125cc7167fb0ae27c6c598504e0604c679e838ea5c8eb781e8c56b4f34559008
desdeLua os.execute insmod >tmpfile: native capture0bytes, mensaje sale alcaller.
S3 SHA849a04...; módulo retirado/inventario idéntico, fixturetmpretirada. No RW4 C
ejecutado. Diseño stdout descartado; R210 candidato histórico NOusar en carrier.
R212/R213 LuaIO y callees RW4: fopen1ebf0c, fclose1ebff4, fread1ec130;
fwrite1ec4e4/fflush1ec608 siguen. Modeparserx→OR8/O_EXCL inferido, no FS físico.

C file-r214.c +build-rw4-file-r214.mjs: build/hello-native-rw4/r214/log.elf
1500B,SHA9dff873fd6d41669de0d336528a35c7c281fa1e03ee1eb5ebcddd6d6907ca652,
source3f240e2486d776c0bf56be53542213ff33924e767b0a3617c099c36ec92d186d.
ET_REL entry1,text465aligned8,7ABS32,cero imports POR NOMBRE/5APIsfijas, sin tareas.
5FNV64guard, lee19B marca, fopen ownoutput wbx(nofallback), write16B RW4_C_FILE_R214
newline/flush/close; init0 solo fullsuccess. FILEopaco, APIs asignan/bloquean;
no safe-read/ABI físico probado. Privilegios amplios y sin recovery integral.

Controller/adapter/main R211, raíz EXACTA /data/app/watchface/market/365219999/lua/
normalizada, ui antesbackend/no globalload, ui199 solo condición C TEXT modificada.
FILE/MARK/C TEXT/UNLOAD/END. Captures native-stdout-r211.txt (archivo C directo,
no >), log-inspect-r211.txt (NSH), marca log-attempt-r211.txt nunca borrada.
31escenarios pasaron, report artifacts/emulator/log-r211/summary.json,
I/Orealtranslatedtmpfixture +executor/widgets SIMULADOS; C solo datos/inventario
real idéntico/árbolretirado. Firstfailedharness gsub segundo retorno hizo absent_os,
corregido paréntesis; report log-r211-failed-harness preservado. No prodchange.
Con execnormal + registropropio confirmado, read/logfailure aún intenta retiro.
Exec/inventarioincierto o módulos197/202 bloquean unloadciego. Initrechazo/ausente
no rmmod. Complete requieremsg/carga/retiro/cleanup; repaintrojo conunloadverde.

NativeLog ID365219999,28348B,SHA1e88ce20dcbb28f6680be89f1625c22682890fb8efc8f2a605b0d34bde6579eb,
artifacts/native-log-r215/NativeLog-id-only.face. Lua18156B
SHAdf5c6cc3171d3441839d3dd9bd00e4aae98aaa24876be380f12e0627b9a28477.
Compiler sinADB/4records exactos. Perfilr215CERRADO,prepare14parts; journal/lock
ausentes antes del envío (estado actual arriba). Transfer12/sesión31offline pasan.
Helper previo b8d7a688d0d3a6765a21ad3dadac34cda2a46a877ad0c1853fc583aa068ebc85.
Reportes build/test/package existentes rechazan overwrite; no repetir/borrar.
Usuario comentó aviso OpenAI desconocido: no vimos texto y no lo atribuimos;
continuó alcancePC. No datos privados crudos publicados ni firmware/toolsflash.

**Historial R210, 2026-10-13:** [C logging candidato solo PC](rw4-log-candidate-r210.md).
loadlib registrada0xb0408→código0x2fdf10: flujo de fallback deshabilitado,
DLMSG/absent/init, caso cache/* solo true; no nueva invocación física. Contrastado
Lua5.4.0 upstream. [R207–R209](rw4-lua-bridge-r209.md) sigue Lua print: nombre
es sufijo compartido, offset0xb1474, tabla0xb0ff4, caller0x303590. Tres callees:
streambase0x1bcba4 sin args (TCB/group+92), writer0x1ec4e4 tipo fwrite,
flush0x1ec608 tipo fflush; stdoutbase+128 en caller. Contraste NuttX10.3,
no versión Xiaomi identificada ni SDK. Import normal todavía sin symtab usable.

log-r210.c +ld, build-rw4-log-r210.mjs: build/hello-native-rw4/r210-final/log.elf,
1120bytes,SHAcbfcae4a6fb3b0d9cae9389b8f99d774cd8df8af40b0170c144ebb0b41b2157e.
ET_REL ARMv8M/Thumb,entry1,text226aligned8,cero imports POR NOMBRE,3APIsfijas,
1ABS32 interno; sin writableestado/heap/tasks/FPU. Fuente SHAe7a27a884b97ea545ac1eb925cb605d698ffa9f677d8988d2fafed36a687f965.
BindingsThumb0c2bcba5/0c2ec4e5/0c2ec609, tres FNV64bytes guard, mensaje17bytes
RW4_C_HELLO_R210+newline; write+flush→0 o negativo. Guard puede fault al leer,
no sandbox/recovery/ABI proof; stdout/NSHcontext pendiente, puede bloquear.
Primerbuild privado r210 rechazado por3THMCALLhelper; always_inline dejaABS32,
finalr210-final separado/review/disasm. No reejecutar ninguna copia ni borrar
outputs existentes (scripts rechazan). SHAheadersmetadatos no firmwarecodepublicado.

Sin carrier/ID/journal/physicalprofile/plan final; no autorización nueva ni
operaciones reloj/teléfono/BT. FirstC2/marker no tocar. Siguiente soloPC:
carrier captura acotada exacta de mensaje C y cleanup también cuando init
rechaza/no registro; simular backend, NO ejecutar ARMv8M/direccionesRW4 enS3.
Revisión física solamente después de paquete/hash/plan concreto. Gates cerrados.

**Historial R206, 2026-10-13:** [exports investigados solo PC](rw4-exports-r206.md).
Scripts research-rw4-exports-r205.mjs / research-rw4-export-selection-r206.mjs
pasaron hashes/anclas sobre imagen privada R193. Reportes ya existen en
artifacts/research/rw4-exports-r205 y rw4-export-selection-r206; scripts rechazan
sobrescribir. No repetir ni borrar reportes para continuar.
Loader intenta imports vía módulos y getter0x1e7f48/lookup0x1ef738. Getter lee
globals3c1aef98/94, ambos en BSS puesta a cero; no fallback visible ni setter
identificado. Un literal exacto cada uno, cero MOVWlow16exactos. No exhaustivo:
bases/otrasimágenes/runtime pueden inicializar. No afirmar tabla vacía permanente
ni APIs imposibles. printf/usleep son NSH; fopen/fread revisados son mensajes,
no exports. gettimeofday otraestructura sin clasificar. NuttX12.3 ref fijada,
no fuente exacta Xiaomi. Sin logging C/nuevo binario/medición de RAM.
Usuario reabrió FirstC2 y vio ENDrojo inicial: coherente con marca, color no
prueba causa exacta/otra carga/reboot. Guardado en resultadoR203; no rearmar.
No operaciones reloj/teléfono/BT. Gates sin cambios/cerrados.
Siguiente solo PC: rastrear puente Lua/nativo y su resolución de funciones para
identificar logging con contrato comprobado. No llamadas absolutas basadas en
nombres/tablas sin clasificar; no nueva autorización física disponible.

**Historial R204, 2026-10-13:** [primer C propio RW4 ejecutado/retirado y retorno normal](first-c-corrected-physical-result-r203.md).
Usuario: «al darle run c file,mark,l oad, unload y end quedaron verdes».
Después «todo ok, volvi a la original» a menús/desplazamiento/pulsación larga.
Ensayo R203 completado. No reabrir/repetir, borrar marca o retirar esfera
automáticamente. Ningún nuevo comando al reloj/teléfono/BT este turno.

FILE prueba ELF784bytes exacto; MARK write/flush/close/readback+presencia;
LOAD registro propio tras ausencia, UNLOAD inventario final sin propio y
END Complete. Parser solo acepta inventarios sin rw4minr197: anterior también
ausente al final; no se descargó. No reconstruir primer FirstC fallido.
Fuente fija SHA1ef5835d1c9c2d062acf13190a398ba97af1a9d3e82cc3e0788d6e70a801b40f,
paquete7229a104de8cc8031ab3e689e0b11564b371aa55a7d2c3182a28d3d3710e4e67,
payload8248f76bdabd9c44aee6df46e8ba4d8c999acc9ca1d0c8367e1652ce0675da6d.
Code movs0/bxlr, no imports/tareas/APIs/relocs. Ejecución C confirmada por
indicadores+loader inspeccionado, no resultado sintético de UiOnly. Sin raw
lsmod/trace físico. Marco de privilegios desconocido/potencialmente amplio.

No hello/logging C aún: texto/colores son Lua. No native display/input/FS,
ABI flotante/FPU/core completo, symtab/exportspointers, RAM suficiente o recovery
integral demostrados. Marca readback no prueba powerloss/reboot. Paquete queda
almacenado, módulo retirado; un intento solamente, no reapertura Doom validada.
Gates Node/C# false; helper cerrado a9c232582c008c21c0ac47b599346d36a7e3ed7e130d312d9ebca66134a0c923.
Siguiente checkpoint SOLO PC: identificar exports/contrato de APIs para un
mensaje desde C; investigar imagen RW4 y fuentes, no nuevas consultas/cargas
físicas sin paquete/plan/revisión. No usar direcciones/ELF/ABI del emulador S3.

**Historial R203, 2026-10-13:** [FirstC2 instalada una vez tras autorización](first-c-corrected-physical-result-r203.md).
Usuario «adelante» al plan fijo R203 y presencia/batería≥50% solicitadas.
ID365219998,24.736bytes/SHA7229a104de8cc8031ab3e689e0b11564b371aa55a7d2c3182a28d3d3710e4e67.
Prepare con helper temporal habilitado c166433a30d558850d99483b6d83b5deac906039953ceaade8b75848ce71b7dc,
archivado con build/CLI/Probe bajo artifacts/first-c-r203-reviewed; no reejecutar.
Un install r202: RegisteredInactive,13partes,24814bytesstream/25326TX,22TX/16RX,
sin SET/autoactivación,close/exit0,sin error nativo. No C ejecutado por envío.

Gates restaurados/rebuild ANTES del GET independiente. Helper cerrado ahora
SHAa9c232582c008c21c0ac47b599346d36a7e3ed7e130d312d9ebca66134a0c923.
GET Complete:15→16,anteriores IDs/flags exactos,propia inactiva/eliminable,
activa365210175,FirstC365219996 sigue almacenada/inactiva. Snapshot ya tenía15
antes de este ensayo; no atribuir a nosotros diferencias con el antiguo R198.
Journal first-c-r203.json Registered13partes,sinlock,autorizaciónenvío utilizada.
Dos sockets/workers cerrados. Gates test pasa sin radio. Node/C#gates false.

Pregunta async pendiente: seleccionar FirstC2(noFirstC), labelsFILE/MARK/LOAD/
UNLOAD/END y5grises→RUN C UNA vez→colores→volverAjustes/habitual y confirmar
menús/longpress. ENDrojo inicial/labels ausentes/falloUI: no tocar/repetir.
Todavía no UI/C/retirada físicos observados. No nuevoenvío/DELETE/insmod/rmmod,
borrar/rearmarmarca o abrirFirstCantigua. Guard de rw4minr197 sigue bloqueando.
Al llegar resultado, registrar literalmente; no inferir C por transporte.

**Historial R202/R203, 2026-10-13:** [FirstC2 lista solo PC](first-c-corrected-r202.md).
Siguiente acción: solicitar autorización expresa y presencia del usuario para
el [plan fijo R203](first-c-corrected-physical-plan-r203.md). No habilitar gates,
instalar o hacer nuevas consultas al reloj sin esa autorización. El «dale» de
este turno autoriza preparar el sucesor; no reutilizar la revisión R198.

FirstC2 ID365219998,24.736bytes, artifacts/first-c-r202/FirstC2-id-only.face,
SHA7229a104de8cc8031ab3e689e0b11564b371aa55a7d2c3182a28d3d3710e4e67.
Fuente materializada15.267bytes SHA1ef5835d1c9c2d062acf13190a398ba97af1a9d3e82cc3e0788d6e70a801b40f.
ELF original784bytes SHA8248f76bdabd9c44aee6df46e8ba4d8c999acc9ca1d0c8367e1652ce0675da6d,
sin ejecutar. Controller R196, UI R199 y normalizador R201 sin cambios.
main-r202 compila factories estáticas, muestra UI antes del backend; no load,
loadfile/dofile. Botón solo se habilita tras setup/ausencia de marca.

Adapter r202 normaliza path validado a /365219998/lua/, nombre rw4minr202,
marca/captura propias r202. Cualquier fila rw4minr197 hace recognized=false:
abort antes de carga, o antes de retiro si aparece después. No descargar el
anterior ni atribuir un inventario mixto al nuevo. Own module previo también
bloquea. Un intento, marca/readback, registro/retirada/ausencia confirmados.

38 casos pasaron en Lua5.4 S3, I/O tmpfs real, executor/widgets simulados.
Incluyen ruta duplicada, load ausente, backend ausente con UI visible y módulos
previos/mixtos. Report final artifacts/emulator/adapter-r202/summary.json;
árbol temporal retirado, lsmod real idéntico. ELF solo datos, no instalado el
paquete armado en S3. Primer harness pasó segundo retorno de gsub como
missing_system; corregido con paréntesis. Fixture anterior validada/retirada,
reporte preservado adapter-r202-failed-harness. No cambio de producción por él.

Compiler sinADB y4records íntegros. Perfil r202 CERRADO; prepare R20313partes.
Transfer12 casos y sesión30 casos para r202, cero sockets; gates Node/C# false.
Helper cerrado nuevo SHAdcb923c4f3fefdf9756c22401b211a6be286306b39919c84a76673d86538c617.
Journal tools/local/pc-rfcomm/first-c-r203.json aún no creado. No borrar/reabrir
FirstC ni su marca, no rmmod remoto. No Bluetooth/teléfono/reloj este turno.
UI factory real R200 y normalizador16casos R201 reutilizados por hash; no
afirmar UI completa FirstC2 física o C probado. Privilegios/recovery pendientes.

**Historial R200/R201, 2026-10-13:** [UI real emulada validada](ui-only-emulator-r200.md),
[rechazo de doble slash reproducido y normalizador puro](first-c-path-r201.md).
Usuario confirma cambio a habitual/pulsación larga y menús/desplazamiento normales.
Recuerda4grises/blancos+inferiorrojo,total5,sin reacción. CompatibleSetupStopped,
no prueba directa de C/retirada. No reabrir FirstC; no borrar marca/unload ciego.

UiOnly365219997 sin ELF/controller/io/os/shell/timers/global load invocado;
factory inlineestática, labelsFRAME/ICON/INPUT/TOUCH/END, TEST UI y resultado
sintético solo visual. Paquete12784SHAecb3f0cb9f5fceac877c20eb77944a3ecf6ebbc6f97fe48a6197eb9e39ea8e84,
Lua4293SHA12ea3bc8395bca3fdc8d83e68839c848952f5ef5a8b1b8d537051584ebb43820.
Perfil físico NOregistrado; solo emulador. Preparecompiler sinADB y3records exactos.
Instalación emulador guardADBOwnership5039, backupdata pausada, recurso/readback,
invalidatecache/resetguest. Primerpreflight read-only falló por2activas(tipo1Storage,
tipo2AOD362150001); preservado -preflight, aceptadosIDsconcretos sineditarflags.

LVGL real: capturaslabels/button/gray→greenclick, logcallback1, segundo tap y
retorno panel idénticos. VolvióStockStorage, closeLua observado,29→30 IDs anteriores
preservados,UIOnlyinactiva,source/assets extraídos SHA exactos,modregistryvacío.
Checker artifacts/emulator/ui-only-r200/validation.json. Screenshotpixelchecker
verifica bitmaps enteros/toleranciaRGB565, no C. TogglelongpressOFF sincambiar.

BUG concretoS3: hostlog pmainSCRIPT_PATH /data/app/watchface/market/365219997//lua/;
global load function S3, sufijo esperadofalse. Oldadapter niega // y no dibuja
legend/button antesbackend. No ruta físicaRW4 confirmada; causa física inferida.
path-r201.lua normaliza internal/+ trasvalidarASCII/límite/absoluta; rejectsleading//,
traversal/metacaracteres/IDajeno yexigesufijoID/lua.16cases LuaCLI conoldadapter
constructor rechazoformaobservada/aceptacióncanonical,ceroIO/shellinLua.
Report artifacts/emulator/path-r201/summary.json, Lua tmp retirada,modulesidénticos.
Pathsource4edc7473370f3ce624a67df1b5fa77b42ca0bb4e867aca9ad554e0e01558ddbf.

NextcheckpointPC: integrarUI estática+normalizador+backendprimerC, priorinventory
DEBEtambiénbloquear módulo anteriorrw4minr197 antesdecargarnuevo;noautocarga,
unintento,atribución/unloadyconfirmación. NuevoID/hash/paquete/plan requeriránrevisión;
NOautorizadosporR198. Privilege/recoveryintegral aún desconocidos. PaqueteR197
intacto,FirstCno tocada,Node/C#gatesfalse,helperf64ead8b42f5872198ac0aaa52cafba5bf2cd22e75bbc0fd95a347af0b8fec44.
No operacioneshardware este turno. No repetir pruebasya pasadas sin cambios.

**Historial R199, 2026-10-13:** [FirstC falló en UI; C físico no confirmado](first-c-ui-failure-r199.md).
Usuario no ve FILE/MARK/LOAD/UNLOAD/END ni RUN C; solo panel gris/cuadritos
posiblemente blancos. Tocó y no pasó nada; menús funcionan. Segunda pregunta
async pendiente: volver por Ajustes a habitual y confirmar pulsación larga.
No reabrir/tocar/reinstalar/borrar FirstC o marca; no asumir módulo ausente.
Toques sin respuesta no prueban ausencia de callback/carga; ningún Complete.

Hallazgo PC: main R197 crea imágenes/botón DESPUÉS de load/controller/adapter/
path. Un fallo temprano oculta leyenda/botón. No afirmar causa: global load,
sufijoSCRIPT_PATH e imágenes/backend son hipótesis no verificadas físicamente.
NativeInfo probó package.loadlib expuesta, NO global load. Source/paqueteR197
intactos; gates físicosFALSE, helper cerrado f64ead8b42f5872198ac0aaa52cafba5bf2cd22e75bbc0fd95a347af0b8fec44.

ui-r199.lua nueva factory SIN io/os/load/shell/timers/C, construye imágenes y
botón deshabilitado antes del backend; arm registra antes de habilitar, stop
es terminal, callback/error/reentrada consumen un intento. No paquete enviado.
tools/test-rw4-ui-r199.mjs pasó6 casos en Lua5.4S3 con widgetsSIMULADOS, Lua tmp
propia retirada y lsmod real idéntico. Report artifacts/emulator/ui-r199.
Source807119943a71900d5a73e9da4c27045f59e06ae266ff6e97dce2b7ebc3aa9592.
No LVGL real/render/toque validados por esos casos. Próximo checkpoint PC:
integrar/observar UI separada en LVGL real emulado SIN C RW4, preparar sucesor
con revisión. No nuevo C físico sin inventario previo/atribución y plan revisado.

**Historial R198, 2026-10-13:** [FirstC instalada una vez tras autorización](first-c-physical-result-r198.md).
Usuario «si» al plan concreto y presencia/batería≥50% solicitadas. Instalada
ID365219996/22.500bytes/SHA bf3bfbd4147ed27527fc7659aac0098472252016725af6ef2750e86cd2f5cbf9.
Helper habilitado SHAa6404d9d00c6c5377cef4a7fa8ac9a8389b61c75a911e4d8eedd0a16d922f924
archivado con build/CLI/Probe en artifacts/first-c-r198-reviewed; no reejecutar.
RegisteredInactive,12partes,22574bytesstream,23071TX,21TX/16RXframes,close/exit0.
Gates restaurados/rebuild ANTES del GET independiente: helper cerrado ahora
SHAf64ead8b42f5872198ac0aaa52cafba5bf2cd22e75bbc0fd95a347af0b8fec44.
GET Complete:16→17,anteriores IDs/flags idénticos,propia inactiva/eliminable,
activa365210175; socket/worker cerrados. Gates test pasa, ninguna radio en test.
Journal first-c-r198.json Registered12partes,sin lock; autorización envío usada.

Pendiente respuesta a pregunta async: seleccionar FirstC (5barraspreview),
cinco filas grises y RUN C, un click si UIcorrecta, colores FILE/MARK/LOAD/UNLOAD/END,
volver por Ajustes a habitual y confirmar menús/longpress. ENDrojo/amarillo antes
delclick/falloUI: no pulsar/repetir. Todavía NO C/retirada físicos observados.
No nueva transferencia/DELETE/insmod/rmmod/lectura remota de archivos ni borrar
marca. Si llega resultado, registrar literalmente y sus límites; no asumir
Complete por paquete registrado. Privilegios/recovery integral sin resolver.

**Historial R197/R198, 2026-10-13:** [adaptador, UI manual y paquete final preparados](first-c-adapter-r197.md).
Siguiente acción: pedir revisión expresa del [plan físico R198](first-c-physical-plan-r198.md)
y presencia del usuario antes de habilitar gates o enviar nada. El «go» actual
autoriza preparación PC; no el primer C potencialmente privilegiado en hardware.

FirstC ID365219996,22.500bytes; artifacts/first-c-r197/FirstC-id-only.face
SHA bf3bfbd4147ed27527fc7659aac0098472252016725af6ef2750e86cd2f5cbf9.
Lua materializada SHA b431f91f31c36fe1fb58a48595a51ee6c5593f5c2d0924c37746988ed3ed7c85.
ELF784bytes intacto SHA8248f76bdabd9c44aee6df46e8ba4d8c999acc9ca1d0c8367e1652ce0675da6d.
Dos instrucciones return0, sin imports/relocs/APIs/tareas; no hello/logging/Doom.
No ejecutado física ni emuladamente. No instalar paquete armado en S3 Cortex-A7.

Adapter usa path fijo validado .../365219996/lua/, ELF comparado completo,
marca propia antes de insmod; parser estricto lsmod, nombre rw4minr197.
Abrir esfera solo dibuja/lee marca; RUN C manual se consume antes del backend.
Máximo un insmod y un rmmod atribuible, inventario final exige ausencia.
No retries/timeout duro/sandbox. Incertidumbre detiene, no unload ciego.
Marca flush/readback no garantiza durabilidad por powerloss ni atomicidad multivm.

Tests:24 core previos +29 adapter actuales en Lua5.4 S3, I/O tmpfs real,
executor/widgets simulados. Report final artifacts/emulator/adapter-r197-v3.
ELF solo fixture de datos; lsmod real idéntico antes/después, árbol propio retirado.
UI LVGL real y toque específicos FirstC aún no validados. FPRJ/compiler/records
del paquete comprobados; fuente materializada final coincide con reporte.
El test negativo v2 representaba load ausente con and/or incorrecto: corregido
a nil explícito; fixture anterior retirado con propiedad/readback verificados.

Perfil r197 añadido CERRADO. prepare r197 R198 pasa12partes; gates pasan todos
los perfiles. Transfer12 escenarios y sesión29 escenarios ejecutados con r197,
sin sockets. Helper cerrado SHA3ec38ceabd9c9a15dd86a8d229afd29be13e11637720d34bbd7465a8cf921d97.
Node PHYSICAL_WRITES_REVIEWED=false/REVIEWED_VARIANT=r167; C#StaticPhysicalReviewed=false.
Journal tools/local/pc-rfcomm/first-c-r198.json todavía no creado.
Preflight comprueba modelo/FW2.2.86/catálogo, NO batería: usuario comprueba≥50%.
No operaciones teléfono/BT/reloj este turno; no tocar vínculo ni borrar esferas.
Emulador sigue en launcher15696/QEMU14908 del arranque R196, ADB5039/emulator-5554.
No repetir pruebas ya pasadas sin cambios. Tras aprobación: un único install,
cerrar gates, GET independiente y selección/click manual observado por usuario.

**Historial R196, 2026-10-13:** [controlador puro pasó24 pruebas Lua/backend simulado](controller-r196.md).
experiments/hello-native-rw4/controller.lua: M.new(backend).run(), latch por
instancia antes de backend, marker_state/check_file/list_modules/write_marker,
readback independiente de marca, load→registroobservado→unload→ausenciaconfirmada.
Sin io/os; 'returned' indica retorno síncrono, no éxito exitcode. Error/incertidumbre
detiene secuencia; no retry/unloadciego ni tocarmóduloprevio. No backend real/UI.

tools/test-rw4-controller.mjs usó guardPropiedadADB5039/emulator-5554. Source real
ejecutado en Lua5.4 S3 con env limitado y backend simulado. 24 escenarios éxito,
erroresFS/inventario/carga/descarga,reentrada,marca retenida trasreinicio simulado.
No ELF transferido/ejecutado, lsmod real antes/después idéntico, tmp propio
/tmp/rw4-controller-r196.lua creado/readbackexacto/retirado/ausencia comprobada.
Report privado artifacts/emulator/controller-r196. Source060db50622dd1577ad62092a1cf0d4b202633d2c856064a85ca6563f1030b08d;
testsfb4b902351418d6b250ee1a2d891905956547ed8c723622cf7d0b2cf5ccae654.

Emulador antes apagado con recordstalePID440; ausenciaPID/QEMU confirmada, record
guardado stale-before-controller-r196.json y marcadoexited. Primerlaunch sandbox
falló perfilVVD; reintentoautorizado arrancólauncher15696/QEMU14908. Sesiónexec7688
mantiene launcher; ADBconnect89481 mostródevice, puede seguirpendiente por FDdaemon.
hoststdout/stderr ahora de nuevoarranque, no logsR188. No nuevas operaciones
teléfono/Bluetooth/reloj; gates físicosFALSE. No tocar vínculoPC/reloj/esferas.

Siguientecheckpoint: backend real shell/archivos y UI MANUAL (no runalselección),
testear sin ELF RW4 cargado y generar paquete/hash/plan físico final. Marca real
no prueba durabilidad porpowerloss ni atomicidad multivm; gesto manual impide
carga automática alboot aunque marcadorse pierda. No aprobaciónHW todavía.

**Historial R195, 2026-10-13:** [carrier y borrador del primer ensayo C](first-c-plan-r195.md).
Solo PC. package-lua-minimal.mjs native-carrier produjo ID365219995,
12.452bytes, artifacts/native-carrier-r195/NativeCarrier-id-only.face,
SHA6bfb350bdf5bc362b9598a2110b5e05a681481ed0999784feae6e539a28e0aa1.
ELF R194784bytes idéntico; verify-native-carrier.mjs verifica registros app
header20/nombre/highbyte/lenlow24/data, no mera aparición de magic.
Lua materializada3502bytes SHA41cd28d20f825365d6cfa51c9efbf4fee0ba373d8c5cfda813ccf55f57947115;
source template experiments/lua-native-carrier/main.lua usa token ELFHEX sustituido
en build, no sourceArtifact físico. Solo io.open(rb)/read785/comparación/cierre,
UI/Image propios. No shell/loadlib/timers/C ejecutado. Modelo/probe mismo2.2.86;
extracción/runtime del carrier no probados. No instalarlo como ensayo intermedio.

Perfil r195 AUSENTE en staticSpec: readback verificó rechazo. Gates físicos false;
sin teléfono/ADB/Bluetooth/reloj usado, firmware/C no ejecutados. No borrar esferas.
NuttX12.3 sched/Kconfig CONFIG_MODULE sin depends BUILD_FLAT en ese bloque; no
inferir FLAT por insmod. Contexto real desconocido, tratar código como potencialmente
privilegiado. Reboot12s documentado Xiaomi no es recovery integral ni garantía.

Primer C final aún NO preparado/autorizable: falta controlador de un intento,
marca persistente ANTES deinsmod para impedir recarga por reboot/reentrada,
lsmodpre para no tocar módulos previos,insmodúnico,lsmodconfirmación,rmmodpropio,
lsmodausencia,capturaspropias acotadas. No retries/kill/unload ciego/hardtimeout
prometido. Preparar/testear con backend simulado en PC; no ejecutar ELFARMv8-M
en S3Cortex-A7. Hash/IDfinal cambiarán y requerirán revisión del plan concreto.
No aprobar/ejecutar hardware usando el carrier deshabilitado o este borrador.

**Historial R194, 2026-10-13:** [loader RW4 y primer C compilado solo PC](rw4-loader-r194.md).
Imagen SHA2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db.
Objdump revisado usado solo como lector. Startup Thumb MSP/MSPLIM/CONTROL refuerza
ARMv8-M; no Cortex-A7. Tabla NSH: handler insmod offset220910→loader1bb6cc.
ELFverify1e800c solo ET_REL; archcheck1e6a24 ARM40/class1/data1. Init1bb734:
textalloc+e_entry, r0=module+24, BLX y retorno int (negativo error). Rmmod1bb79c
callback módulo+24/arg+28, dependencies y free/registro. Tipo2 R_ARM_ABS32 caso
1e6bf0 confirmado con TBH. No native/module execution física o emulada R194.

Scripts propios review-rw4-loader/references/disassemble; outputs PRIVADOS bajo
artifacts/research/rw4-loader-r194. Mapeo datos inicial0x2c falló; ranking ancho
halló tabla validada: strings de ese grupo base3bff187c, handlers codeBase0c100000.
No generalizar ese delta a todo memorymap o usarlo como APIheader. Report correcto
candidate-references-v2.json corrige codeBase del primer candidato exploratorio.
Globals symtab/número leídos pero contenido runtime no recuperado. printf/free
en tabla NSH no prueban función libc. VFP en loader no identifica ABI float.
Referencias NuttX12.3.0 son comparación, no source Xiaomi exacto.

experiments/hello-native-rw4/minimal.c: int init(void*) return0, alineado8,
sin imports/relocs, sin writes/APIs/tasks/callbacks. node tools/build-rw4-minimal.mjs
compiló784bytes/código4bytes movs r0,0;bx lr, entry1 ARMv8-M mainline soft.
ELF privado build/hello-native-rw4/r194/minimal.elf SHA
8248f76bdabd9c44aee6df46e8ba4d8c999acc9ca1d0c8367e1652ce0675da6d.
Source4b63f15f8e9223b338d3932e4c54bf10339c5e3dc0693682ad51a87a6aaa53bb.
Primer build falló por alineación2, se conservó en raíz del build privado; nueva
alineación explícita8 pasó. No printshello: candidato de contrato, no hello
ejecutado. Soft para intsinllamadas no fija ABI de todo Doom.

Gates físicos FALSE, ningún teléfono/ADB/radio/comando reloj en esta sesión.
Siguiente checkpoint: cerrar contexto/privilegios, carrier/retirada y plan concreto
del primer ensayo C físico, sin ejecutarlo antes de revisión. No enviar ELF todavía.

**Historial R193, 2026-10-13:** [firmware e imagen principal adquiridos, solo PC](firmware-analysis-r193.md).
Shell físico confirmado R191: NativeInfo mostró funciones OS/IO/loadlib amarillas,
shell/insmod/rmmod/lsmod/NuttX/arm/cleanup verdes, iwasm rojo. Usuario volvió a
habitual con menús/pulsación larga normales. No C físico. LuaImage física R187
muestra cuadrantes/cruz y salida normal; Label físico sigue sin texto.

No pedir más logs: tres snapshots ya existentes R162/R164 resolvieron metadata.
tools/local/firmware-research/candidates-r193.json contiene URLs firmadas PRIVADAS;
no imprimirlas ni parámetros, firmas, claves o líneas crudas. Original HEAD403
no significaba expiración: SDK FDS firma método; GET Range0–0 funcionó206.
GET descargó53.979.532bytes, MD5 de mismo registro LatestVersion verificado,
SHA256 d9dee6871ca6dc893000214d04ef6f5429a1b0f9ea57c79d8db9caf83cff6321.
No firma fabricante independiente verificada. Blob propietario ignorado:
tools/local/firmware-research/rw4-stock-candidate-r193/rw4-stock-2.2.86-candidate.bin.

325ZIP embebidos validados por límites/headers, no CRC de todos. Solo vela_ap.bin
descomprimido con CRC/longitud/consumo verificados:6.636.408bytes,
SHA2562c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db.
Archivo privado vela-ap-inspection-only.bin; reports artifacts/research/*r193.json.
Modelo M2315W1/Redmi Watch4/2.2.86 internos; strings armv8-m/modlib/NuttX/Lua5.4.0.
No FPU/ABI/exports/FLAT/PROTECTED/KERNEL demostrados. /dev/fb0 string no open probado.

Native gates permanecen FALSE; no nuevo ADB/radio/hardware en R193, no herramientas
de flash, ejecución firmware, C/ELF/insmod físicos. NativeInfo autorizó solo help
y uname y su captura propia; no ampara nuevos scripts/consultas. No borrar esferas.
Downloader PC whitelist --head/--probe/--download, URL datos nunca shellsource,
no redirects/cookies/TLSbypass; source/size/checksum/hashes fijados. Prefix escalado
node tools/retrieve-rw4-firmware.mjs aprobado. Reejecuciones rechazan overwrite.

Siguiente checkpoint único: inspección estática de loader/exports en vela_ap.bin
para completar docs/rw4-native-contract.md. No aplicar headers/direcciones S3 o
ELF Cortex-A7. Solo después preparar helloC específico y plan físico revisable.

**Historial R183, 2026-10-12:** [investigación de fuentes solo PC](lua-font-research-r183.md).
Usuario autorizó investigar/probar en PC, sin otro envío físico. Muestra
AnalogTimeAnimated/RW4 de m0tral, commit5af6e14, usa BUILTIN_FONT.MONTSERRAT_14.
TouchEvents usa MiSansW regular32. Son muestras, no pruebas de la unidad2.2.86.
LuaVGL62868a0 resuelve builtin según configuración y puede consultar
ctx.make_font para otras familias; no es fuente exacta del firmware.

Diez fuentes/licencia obtenidas como datos del conector GitHub coinciden con
GitblobSHA1 y SHA256. Caché ignorada artifacts/research/lua-fonts-r183; metadata
pública docs/lua-font-sources-r183.json. LuaVGL MIT conservada; licencia m0tral
no identificada, no publicar scripts/assets. verify-font-research.mjs verifica
bytes sin ejecutar fuentes o usar ADB.

inspect-fonts-emulator.mjs ejecutó el Lua propio finito en S3, guard de QEMU y
ADB5039/emulator-5554 sin USB. Lua5.4, Font función, MONTSERRAT12/14/16 userdata,
Font montserrat14 creado; MiSansW regular24/32 dieron cannot-create-font.
No widgets/timers/archivos guest/shell desde Lua. Require/Font inicializan
bindings o reservan objetos: no lectura pura. Storage visible después, sin
reset o cambios de paquetes. No render de esta constante medido en R183.
R177 sí renderizó MiSans24 en watchface S3; no extrapolar fallos de CLI al
contexto watchface o atribuir causa exacta a callback sin inspección del binario.

Sin Bluetooth/teléfono/USB/reloj físico usado. Gates false, build nativo R182
03d3be0cb02ef6cea717a11fc4cb82c6ca66cd8d51d8186107149961e4af217b.
ADR0004: texto LVGL no bloquea el renderer de Doom, que usa buffers y WAD.
Siguiente checkpoint único: preparar una Image mínima en PC sin labels,
basada en wrapper RW4. Antes del hardware: paquete/plan/revisión concretos.
Mantener MONTSERRAT14 como pista, sin encadenar ensayos físicos de fuentes.
C/ABI/loader/privilegios siguen sin demostrar; Lua/formas físicas son R182.

**Historial R182, 2026-10-12:** [Lua/objetos LVGL físicos confirmados,texto ausente](lua-diagnostic-physical-result-r182.md).
Usuario «Sí,autorizar elensayoLuaDiag» aplanR181; una installr180 completada
RegisteredInactive,6partes,10979bytesTX,15TX17RX,cierre/workertrueexit0.
GETposterior13→14,13IDs/flags/activa anterioresconservadas,own365219992
presente/inactiva/eliminable. Journal tools/local/pc-rfcomm/lua-diagnostic-r181.json
Registered/contentKindlua-diagnostic. Reportes/buildhabilitado privados
artifacts/lua-r182-reviewed. SinSET/DELETE/reboot/reenlace/firmware.
GatesFALSE,REVIEWED_VARIANTr167,buildcerradoSHA
03d3be0cb02ef6cea717a11fc4cb82c6ca66cd8d51d8186107149961e4af217b.
Gates tests pasan,no cambionuevoimplementación(solo habilitar/restaurar).

Observaciónusuario: negro,panel pequeñoMAGENTA,AMARILLO+VERDE; longpress/cambio
aotras yrestofuncionesnormales. Aclaró SIN TEXTO,no reabrirparacomprobar.
RuntimeobjetoscoloresNOexistenpreviewX: pruebainequívocaLua ejecuta/creaobjetos
enRW42.2.86. Verde: pcallLabel devuelveverdadero,no pruebafont/render/tipo real.
NOTexto/timer/inputprogramático/C/ELF/privilegios/doomconfirmados. No hooks
pause/resume/cierreVM observadosporlogfísico. Nuevopreviewdesborde noaclarado,
noprometer corregidoenRW4. NoGETtrasobservación: owninactivo es snapshotantes
manual,nodespués. AmbasLuaalmacenadas,retiradaopcionalyaautorizada pero sin
decisiónderetirar; nodelete/reinstalar/reabrira ciegas.

Siguiente: investigaciónPC fuentes/bindingLabelRW4(parent:Label ypropiedades,
fuentesdefault/nombres/tamaños/estilo). CausaR179/R182sigueSINLOGFÍSICO:
noatribuirafont24 porque cambióvariasdependencias. Nada nuevofísico autorizado
salvoretiradaspropias opcionales anteriores,que requieren decisión/retorno/GET
inactivo/eliminable. No pedirconfirmación de seguridadotra vez: usuarioreportó
normallongpress/otras/fullfunciones; no migrarMiFit/reemparejar porrutina.

**Historial R180/R181, 2026-10-12:** [diagnósticoPC/emulador](lua-diagnostic-r180.md) y
[plan revisable](lua-diagnostic-physical-plan-r181.md).
Usuario CONFIRMA retorno a esfera habitual víaAjustes y pulsaciónlarga normal
trasfalloazulR179. También describe cuadrado desbordado enselector; sin captura
física noasignarpreview/runtime/clipping ni decirsoloestético. NO DELETE/nuevo
radio/comandos alreloj enesteturno. LuaProbeinstalada,no reabrirla a ciegas.

Fuente experiments/lua-diagnostic/main.lua:panel192x144centrado,root/marcadores
sinCLICKABLE/SCROLLABLE,labelparent:Label+defaultFontconpcall,sintimer/hook/touch.
PreviewnegroXblanca distinta delruntime magenta+amarillo+verde/rojo. Verde:
callLabeldevolvióobjeto,no prueba textorender. Root/timer/fonts causaR179sigue
hipótesis,sinlog físico. No VMsandbox/privilegiofísico caracterizado.

PaqueteID365219992,size10524,SHA140b2a05618f617e70a7f5f28029beefed64251c43af0086cfaacfe0a681c8f1,
fuenteSHA7dece1ba7dac11e500157cf5569b92dc0999c3ea1e95c4b1d07e61b7b60115bd.
Artifacts/lua-diagnostic-r180/LuaDiag-id-only.face byte5=0. PChelpers
package/install/check-lua-minimal-emulator.mjs diagnostic explícito,seconserva
modooriginaldefault. No reemplazos;emuidnuevo/sourceextraída/readbackexactos.
S3previewXcontenida,panel+marcadores+texto vistos,colorescheckautomático,
panelstockabre/cierra conPNG idénticoalretorno,Storageseleccionada ycloseLua.
Owninactiva,26IDspreviospreservados,total27. Longpressno probado:settingOFF.

Perfilr180/contentKindlua-diagnostic integradoenstaticSpec,prepare/CLI/journal
separado tools/local/pc-rfcomm/lua-diagnostic-r181.json. GatesFALSE,
REVIEWED_VARIANTr167,hashbuildcerrado
eeb17d09e2b4ee571186f80cd8066c62f031f015996e4906cdc36bf53118cf27.
Cuatroperfiles12codec/API+26wire/IPC/journalcadauno,todosparescruzados/gates
cerrados/regresionesquerieshealth pasan, sin sockets físicos en tests.
Prepare r180:SCRIPTSincluidos,NATIVECpropiofalse,seispartes,gatescerrados.

Siguiente: revisión paraunensayo install r180,selecciónmanual/observaciónmarcadores
ytexto,retornoAjus→habitual,retiradaopcional remove r180 si decidióyretornó.
NO autoSET/deletesferasajenas/reintentos/C/Doom/firmware. AutorizacióndeR179
eraúnicoensayodelpaqueteanterior,yausada; nuevoperfilrequierenueva revisión.
No tocarLuaProbe/evidenciaRegistrosanteriores. MantenerbondPCbloque; no
migrarMiFit porrutina. Registrarbuildhabilitado trasautorizar,únicoinstall,
cerrargates/rebuild yGETantesobservación. Aprobar no sustituye observación.

**Historial R179, 2026-10-12:** [LuaProbe registrada, prueba funcional fallida](lua-physical-result-r179.md).
Usuario autoriza explícitamenteensayo ypuede observarreloj segúnpreguntaR178.
Una instalación r177 completada:RegisteredInactive,10partes,20329TXbytes,
19TX16RX,cierre/workertrueexit0. Own365219991inactiva/eliminable,anterioractiva.
GETposteriorindependiente12→13,12IDs/flags/activa previos conservados.
SinSET/DELETE/reboot/pairing/firmware. NO repetir instalación. Registro
tools/local/pc-rfcomm/lua-minimal-r178.json Registered/contentKindlua-minimal.
Reportes/exehabilitado/source archivados privados artifacts/lua-r179-reviewed.
AmbosgatesFALSE,REVIEWED_VARIANT=r167,buildcerradoSHA
818e3d06a9662cff879771c6cea736b83fe7ed4f740c39b600f7d8d1f673c03b.
Gate tests pasan; no código de implementación nuevo, solo habilitación temporal
restaurada y documentación del resultado.

Usuarioobserva previewconbarras peroalactivarqueda soloazul,sintexto/contador.
Pulsaciónlarga noabreselector; atrás/notificaciones/arriba/derecha/menús sí
funcionan. NOconfirmar timer/runtimelifecycle; fallo funcional físico. Pregunta
manualresuelta: usuariovolvióvíaAjustes→habitual yrecuperópulsaciónlarga.
No másradio/comandos despuésdeeste reporte. Prioridad retorno normal.
PC: objetoazulsecreaantesprimeraLabel/Fontmisansw regular24; fuente/binding
es hipótesisdeexcepción,sinlogreal. Previewyrootmismocolor,azulsolo noes prueba
inequívoca deLua. FuturodiagnósticoPC: bloquesfasecontrastadosrespectopreview,
Labelmétodoparent/defaultfont,sintimeralprincipio; NO enviarsin nueva revisión.
Retirada opcional YAautorizada dentroensayo, pero requiereconfirmaciónretorno
ydecisiónderetirarla,GETowninactiva/eliminable/journalválido. No pedir otra
autorización delmismoalcance si usuario eligerealizarla. Nada de C/ELF/Doom
autorizado. ConservarbondPCdurantebloque,sin migraciónMiFit por rutina.

**Historial R178, 2026-10-12:** [plan físico Lua completo y adaptador bloqueado](lua-physical-plan-r178.md).
Usuario «ok» a preparar instalador/plan: NO autorización de envío Lua físico
todavía. No radio/phone/ADB/watch usados aquí, solo PC y lectura web FAQsXiaomi.
staticSpec ahora fija tresperfiles: imágenesr167/r173 y Luaminimalr177 separado,
ID365219991/tamaño19796/SHAa40c8560…(completoenplan). SourceSHAe871590b…,
prepare exige fuente exacta embebida. contentKind explicit lua-minimal/static-image
en plan/reporte/journal; nombresStatic internos históricos, no imagen sin scripts.

Comandos propuestos install r177/remove r177 en tools/pc-static-watchface.mjs.
Journal exclusivo tools/local/pc-rfcomm/lua-minimal-r178.json ligado a
target/model/FW/hash/variante/contentKind; no reutilizar registros r169/r173
inciertos ni after-space Registered de esfera estática. Lua journal sinKind o
maletiquetado rechazado; antiguosimagencompatibles sinreescribirlos.

Pruebas3perfiles:12codec/API+25wire/IPC/journal porperfil, todosparescruzados
rechazadosanteslink. Estado3storageInterpretation y0partes probado. Native258,
gates3perfiles +afterspace +native cerrados; queries22synthetic4IPC6fallos;
health10synthetic1IPC incluyenIdLua pero no UI/render. CIofflinetambiénLua gate,
noCIremoto. Prepare R178 confirma source/package/build/gateclosed/diezpartes.
Build cerrado SHA78e03bb41a151961832e03f05920df3f2dcc5947253995ab51d749d30a486a0b.

Próximo paso: pedir revisión del plan para un solo ensayo Lua con usuario
presente: instalar sinautoSET, seleccionar manual, contador10,retorno habitual;
retirada propia opcional dentrodealcance explícitamenteautorizado, esperando
confirmaciónde retorno+GETinactivo/eliminable antesDELETE. DELETE4/2 aún NO
probado físicamente; no asegurar recoverycompleto. Dosgates siguenFALSE y
REVIEWED_VARIANT=r167. Si autoriza: habilitar SOLO r177 temporalmente, rebuild,
registrar exe/hash/sourceantesuna instalación, cerrar/rebuildposterior. No
repetir permisos del mismoalcance. Sin firmware/ELF/C/Doom ni otroID autorizado.
Si enerror no reintentar ni borrarsferasajenas/staging incierto. ConservarbondPC
durantebloque; no exigir migraciónMiFit entre pasos. Solicitud de autorización
queda separada de los comentarios históricos inferiores.

**Historial R177, 2026-10-12:** [Lua mínima validada solo en emulador](lua-minimal-r177.md).
Usuario confirma esfera habitual/menús normales tras R176 y autoriza preparar
Lua en PC. Fuente experiments/lua-minimal/main.lua: texto +timer1000ms,10ticks,
pausa al ocultarse/resume si presupuesto pendiente; mantiene gestos stock.
NO os/shell/files/ELF/native/sensores. No traducir DoomC aLua; launcher/bridge
en S3 existen pero ABI/loader/privilegios físicos siguen sin demostrar.

Build fijo artifacts/lua-minimal-r177/LuaProbe-id-only.face,ID365219991,
19796bytes,SHAa40c85607a8c208823f2dd6064ebca3c907a850e9a392c0b3eb0d718d3c9490a.
Compiler revisado sinADB; parche soloID,byte5=0 conservado. Mismo paquete
instalado en guestS3,readback exacto; sin header emu10 ni fuente derivada escrita.
Render visto; fuenteextraída exacta,Lua5.4,ticks1…10,limit,pausa/resume entre9/10,
closeLua al seleccionarStorage. LuaProbe almacenada/inactiva,Storage365700764
activa,25IDs anteriores conservados. Header0 validado solo runtimeS3.
Tools package/install/check-lua-minimal-emulator.mjs reproducibles, la instalación
no se repite sobreunregistro previo. Primero preflight rechazó dosin_use de
distintostipos antes de mutar; inspección aclaró normal/AOD. Selectorrequiere
esperaranimaciones. Pressholdguest se activó accidentalmente y restauróOFF.

No Bluetooth/phone/USB/reloj usado en R177. Gates físicos false,perfilLua NO
incluido en staticSpec ni adaptador físico. Scripts físicos NO autorizados
todavía. Siguiente: perfilpinned/registro separado,tests cruzados yplan revisable
de instalación/retirada, sin autoSET/borradoajeno. No pedir permiso hasta que
ese paso concreto esté implementado/probado. No ejecutar imagenr173 comoLua.

**Historial R176, 2026-10-12:** [esfera estática instalada y visible](static-space-trial-r176.md).
Tras R175 rechazado con status3, inspección estática del APK Mi Fitness3.59.1i
trazó el campo installStatus hasta recurso face_hint_storage_low: ver
[resultado y método](static-id-physical-result-r175.md). No límite20/bytes medidos.
Usuario eliminó varias por sí mismo y autorizó «vuelve a intentar» el MISMO
paquete r173, ID365219990/hash90069d…; NO otrosIDs/Lua/C/Doom/firmware.

Nuevo action install-after-space r173 usa registro fijo
tools/local/pc-rfcomm/static-watchface-r173-after-space.json, exige count<21
antes de INSTALL. Un único intento: RegisteredInactive,13partes,22TX16RX,
25814bytesTX. GET independiente count11→12,own presente/inactivo/eliminable,
11IDs/flags/activa anteriores preservados, close/worker confirmados.
Usuario seleccionó la esfera y dice «se ve bien»: render confirmado por él.
Usuario después confirma retorno a esfera habitual y funcionamiento normal.
Paquete permanece instalado. NO SET/DELETE desde PC. Registros r169 y r173
anteriores Uncertain quedan intactos; el nuevo Registered es el recibo válido.

Gates Node/native FALSE, REVIEWED_VARIANT=r167. Build cerrado SHA256
3dbcb5dab5df5dcec024963beba36636c64a2de5e876535110818de1ccba7d1e.
Build habilitado/exe/sources y reportes sanitizados archivados ignorados en
artifacts/static-r176-reviewed; no reejecutar copias. Pruebas transfer/session
r173 y gates pasan; test condición de reducción sin mutaciones.
Vínculo PC se conserva durante el bloque: no pedir otro pairing/Mi Fitness
sin necesidad. Siguiente: preparar en PC Lua mínima de texto con lifecycle,
salida y plan; prueba física de scripts aún NO autorizada.
Si retirar propia en otro paso revisado, usar remove-after-space r173 con
registro nuevo e ID inactivo/eliminable; nunca borrar otras esferas.

Las entradas siguientes son historial, no instrucciones del estado actual.

**Historial R174, 2026-10-12:** [ensayo alternativo preparado](static-id-trial-plan-r174.md).
Usuario «adelante» a preparar ID alternativo. Ningún hardware/BT/phone/ADB usado
en este turno. Nuevo módulo static-watchface-spec fija r167 y r173 (NO IDs/files
genéricos); factory exige SHA/ID del perfil, CLI etiqueta explícita r173 y
journal separado static-watchface-r173.json. El original incierto NO tocado.
Se comprueba matches(plan) entre journal/perfil antes de abrir link; prueba
cruzada rechaza variante equivocada. Healthcheck identifica ambos IDs previstos
con flags propios, no ownership/render por presencia.

Ambas variantes pasan12codec/API y22wire/IPC/journal cada una. Regresión y
9healthchecks sintéticos+1IPC pasan; worker258assertions/gates ambos perfiles
y native cerrados pasan. Build yprepare r173 confirmados, physicalfalse.
Gates Node/native FALSE, REVIEWED_VARIANT=r167: no instalar ahora ni solo por
poner r173 como argumento. Nuevo perfil bytes/hash los de R173, no modificado.
Plan preparado incluye install r173/remove r173; nuevo paquete/ID necesitan
revisión del ensayo limitado antes de abrir gates, un solo intento, noautoSET,
ni otrosIDs/deleteajenos/firmware. No pedir otra recuperación del intentoR172,
ya confirmada. Próximo único checkpoint: ensayo limitado tras revisión concreta.

**Actual R172/R173, 2026-10-12:** [primer intento físico rechazado](static-watchface-physical-r172.md),
[alternativa de ID solo PC](static-id-alternative-r173.md). Usuario aprobó la
prueba estática y puede manejar el reloj. Se habilitaron temporalmente ambas
entradas y build aprobado, luego UN install. Rejected/StaticTransferRefused:
6TX225bytes,0partes,sin upload22/0,close+workertrue/exit0/sinerror. Número del
installStatus no conservado; NO asumir2/cuota/ID bloqueado. Added capture
sanitizada para futuros ensayos,21 escenarios offline pasan, sin reintento.
Registro privado original sigue Uncertain/previousIntent/parts0; NO borrarlo,
reclasificarlo o cambiarlo para permitir retry. Copia del exe habilitado en
artifacts/static-r172-reviewed sirve solo como evidencia, no ejecutarlo.

Usuario confirma esfera/menús normales. Gates Node/nativo restauradosfalse,
build cerrado y test gates pasan. Un GET posterior comparó journal inicial:
21faces/1activa,propio ausente,todos los IDs yflags iguales,mismaactiva;close/exit
normal. Sin phone/pairing/delete/SET. No pedir otra recuperación ya confirmada.

Hallazgo offline: IDs actuales prefijos36511(1),36521(17),36522(2),36523(1);
compiler ID167210065. Propio365799910 tiene prefijo no observado, posible
validación de ID es INFERENCIA, NO causa. Alternativa365219990 preparada solo
PC cambiando3bytes del ID;SHA90069d708bea26770e85464c087dfce51ae3640e565ab33ad44f78526d5f35e5.
El adaptador actual NO acepta ese SHA/ID y no fue modificado para hacerlo.
Próximo: revisar motivo de InstallStart/alternativa, preparar backend limitado
y journal separado antes de considerar nuevo ensayo. No borrar otras esferas,
no cambiar firmware, no repetir escritura para obtener número perdido.

**Actual R171, 2026-10-12:** [healthcheck físico correcto](healthcheck-physical-r171.md).
Usuario «bueno,dale;cuando sea necesario lo hago yo» autoriza avanzar con
chequeo previamente descrito. Agente ejecutó una vez `pc-rfcomm.mjs healthcheck`:
Complete/V1/HMAC+auth+cifrado,batería97,modelo reconocido,FW2.2.86,21faces/1activa/
0unknown,propio365799910 ausente,6TX12RX/1727ms,close+workertrue/exit0/sinerror.
Sin archivos/USB/ADB/phone/pairing/reintentos. UI/render/recovery no observados.
No pedir retorno a Mi Fitness ni repetir healthcheck sin nueva necesidad.
Gate de primera escritura estática sigue cerrado; falta revisión/autorización
separada del plan R169. No interpretar health positivo como permiso INSTALL.

**Actual R170, 2026-10-12:** [healthcheck preparado](healthcheck-r170.md) tras
pregunta del usuario sobre supervisión remota. Nueva acción manual
`pc-rfcomm.mjs healthcheck`: auth + batería/info/lista en la misma sesión,
solo whitelist anterior de consultas/worker16KiB. 8 sesiones sintéticas y1 IPC
pasan, además de regresión. No ejecutado físicamente. No lista de IDs ajenos
en JSON; flags propios365799910 y conteos. No prueba render/UI/recovery ni
ausencia de reboots. INSTALL/SET/DELETE/upload siguen bloqueados. No usar el
healthcheck como autorización de instalación desatendida. Rebuild/hash local
actualizado; no usar pins anteriores.

**Actual R169, 2026-10-12:** [transporte y registro offline](static-watchface-transport-r169.md).
El usuario está remoto y no puede observar el reloj. NO usar hardware/ADB/radio
en este bloque. Conservó el vínculo PC anteriormente; su estado actual no fue
consultado. No preguntas de pairing o regreso a Mi Fitness necesarias ahora.

Implementados adaptador V1 limitado al paquete R167, canal MASS5, control de
partes exactas y presupuesto TX32KiB aislado (lecturas conservan16KiB).
Registro privado persistente antes de INSTALL/cada parte/DELETE; lock exclusivo,
target/hash/ID ligados. Recibo restaurado desde otra instancia; estados parciales
o inciertos bloquean borrado/reinstalación automática. Sin SET ni reintentos.
No confundir registro del catálogo con aceptación/render del contenido.

CLI `pc-static-watchface.mjs prepare` verifica paquete/build sin transporte.
`install`/`remove` devuelven PhysicalGateClosed. También la entrada nativa
`session-static-r169` devuelve GateClosed antes de leer target/caché/Winsock.
Ruta operativa preparada detrás de dos constantes de código falsas, NO flags
de usuario/env. No habilitarlas sin revisión física explícita y nuevo build/hash.
El ejecutable se reconstruyó; usar build.json/prepare actuales, no hashes históricos.
258 assertions nativas, regresión R166 y20 escenarios wire/IPC/journal pasan.
Suites del paquete requieren artefacto local; CI solo prueba native/read/gates
sin esa fixture. Workflow actualizado, sin ejecución remota de CI.

**Próximo checkpoint único:** revisar [plan de primera instalación estática](static-watchface-physical-plan-r169.md)
cuando el usuario pueda observar/manejar el reloj. Paquete exacto anterior
25224bytes/ID365799910/SHA7df88688...d9e93a; no Lua/C/Doom físicos. No exigir
otra migración de vínculo entre pruebas del mismo bloque. Stock delete/reboot
documentados, no recovery integral2.2.86 ni garantía de parser/package físico.

**Actual R168, 2026-10-12:** [validación de la esfera y prototipo offline](static-watchface-emulator-r168.md).

No se usaron el reloj, el teléfono ni Bluetooth en esta sesión. El usuario
conserva el vínculo PC. Se archivó el registro obsoleto del emulador tras
verificar procesos y puertos; se inició el launcher oculto. Al terminar seguía
ejecutándose QEMU PID25900, con ADB dedicado 5039 sin USB. Verificar identidad
actual antes de cualquier operación; los PID documentados no autorizan matar procesos.

El paquete exacto RW4Probe, ID365799910 y byte5 original0, renderizó texto y
barras RGB. Se volvió a Storage sin reboot. Después se retiraron únicamente
sus archivos, verificando hash, inactividad y nombres permitidos. Tras rescan
la esfera propia estaba ausente y los 25 IDs ajenos seguían presentes.
La esfera de prueba YA ESTÁ RETIRADA; no repetir instalación o borrado.
Se corrigió una colisión entre nombre de log ADB y archivo de caché: la primera
retirada falló antes de borrar; la retirada final sí quedó verificada.
El backup pausado no incluye RAM ni garantiza toda la consistencia del filesystem.

La variante bridge no se usó. Byte5=10 se muestra como version2560 en otras
esferas del emulador; no atribuirle automáticamente una versión física.
La retirada por filesystem no prueba la API Xiaomi DELETE. El paquete está
validado en este emulador S3, no en hardware RW4.

`tools/static-watchface-transfer.mjs` prepara INSTALL, partes tipo16 y retirada
exclusiva con APIs falsas, sin backend Bluetooth. Pasaron 12 escenarios y las
pruebas del codec. No selecciona automáticamente la esfera y diferencia registro
en catálogo de aceptación del contenido. La lista real de comandos permitidos
sigue siendo de lectura. El recibo de propiedad solo vive en RAM: falta el diario
privado persistente para otra ejecución o transferencia parcial.

**Próximo checkpoint:** integrar un modo de transporte separado, limitado a
este paquete y 32KiB, más diario de propiedad y pruebas de wire/IPC/retirada.
El worker actual admite 16KiB, menos que el paquete; no iniciar el envío con él.
Después preparar el plan físico concreto para revisión del usuario. No hay
instalación física autorizada ni comandos nuevos que el usuario deba ejecutar hoy.

**Actual R167,2026-10-12:** [inventario físico correcto/paquete estático PC](watchface-inventory-result-r167.md).
User watchfaces Complete/v1/HMAC+auth+encryptedtrue,21faces/1active/20canDelete/
0unknownIDs,4TX10RX/1959ms/close+workertrue/exit0/noerror/filesfalse. No device
queryrepeat; nullbattery/model/FW esperados. No re-pair/retornoentrequeries.
SnapshotIDS+activeID PRIVADO tools/local/pc-rfcomm/watchfaces-r167.json.
ID365799910 libreenSNAPSHOT. Preparado experiments/static-watchface/RW4Probe.fprj
y tools/package-static-watchface.mjs: imagen390450own,sinLua/nativo/timers/input;
Shape30metadataImage/Device365RW4 confirmados ReflectionOnly esquema compiler
embedCommon, tools/inspect-managed.mjs opcional schema conserva modo anterior.
BuildPC25224bytes,NoErrors/RW4/noADB,previewPNG visto. artefactos ignorados
artifacts/static-watchface-r167/, candidatoID-only.face sha7df88688...d9e93a.
CAMBIO SOLOoffset40..48-ID; byte5=0ORIGINAL PRESERVADO, no parche emu10. Original
.face guardado. ValidaciónheaderSUBSET,NOemurender/NOHWaccept/NOinstall; no code
hecho uploader. GETmodelo vigentehistórico,R164keycontinúaválidaenGETsincronizado.
Siguientecheckpoint estructura/render candidata emulador+PC yinstaladorrestringido
conrollbackANTESdeaprobarwritesHW. UpstreamINSTALL4/4+uploadsharedFW yautoSET;
no copiarautoSETniusarfilegenerico. Whitelistactualmutacionesbloqueadas. No
physicalesfera/nativeC/Doom. No nuevoscomandosuser hoy; keepPCsiquierebloque.

**Actual R166, 2026-10-12:** [ÉXITO Xiaomi físico completo](windows-xiaomi-success-r166.md).
User session Complete/v1/HMACtrue/authAcktrue/encryptedtrue/battery97/modeltrue/
FW2.2.86/5TX12RX/662ms/close+workertrue/exit0/noNativeError. Usuario confirma
Conectar nuevo teléfono→Windows SINborrar registro Mi Fitness; después auth
MENÚSNORMALES, BTcelOFF. PC mantiene; NO repetirpair ni pedirretornoahora.
R164key CRIPTOvalidadaenestasesión; preocupación invalidaciónnecesaria por ese
menú refutadaPARAESTE ciclo, no universal. Trasadvertenciaverbalse recibióensayo
hecho: registrarlo, noinventarsecuencia. RetornoMiFitpostComplete aúnpendiente,
retornosprevios sí. NoDoom/C/instalación/loader/ABI/RAMfree HW demostrados.
Preparado [inventarioesferas GET4/0](windows-watchface-inventory-plan-r166.md),
comandoMANUAL `node tools/pc-rfcomm.mjs watchfaces` MISMOvínculo; NOagente ejecutó.
Auth→unGET,no battery/info repetidos; outputIDnumérico+active/canDeletecounts,
no nombres/imágenes/idsraros/credenciales; desconocidos contados,noarraycompleta
asumir. Whitelist solo4/0; sets/delete/install/upload siguenbloqueados. No
archivo/flash/nativo/runtime. Buildnuevohash5593fb2e...49a505,144C#tests,22synthetic,
4IPCfull,6IPCfail pasan offline; defaultsessionbase sin cambio, inventarioHW NO.
Próximo metaJSONdeinventario, noinstalarpaquetesni shell. CIprevio incluye tests
actualizados automáticamente/no run. No extra toolchain/APK, no nuevoshasheskey.

**Actual R165, 2026-10-12:** [pairing dirigido258 y propuesta distinta](directed-pairing-result-r165.md).
Un intento user NativeRejected/nativeResult258=WAIT_TIMEOUT,1request, sinUIcode,
handlesClosed+workerExittrue,pairingApiCompletedtrue,supervisornull. NoXiaomi/
keyused/files. Usuario confirma menúsnormales+MiFitnesssync tras BTON; no repetir
pregunta ni pairingdirigido/APK/debug. Causa NOdemostrada, no rechazo remoto
explícito ni claveinválida; no duraciónenJSON. No cambios/build/tests nuevos.
authR164 candidata NOHMAC probada. Próxima hipótesis preparada/revisión PENDIENTE:
Conectar nuevo teléfono SOLOreloj mientrasMiFitconectado, NOunlink/basura/appdelete,
BTOFFteléfono→GUIpairingWindows código→UNsessionR159 conauthR164. STOPborrado/reset/
cuenta/Desvincular requerido/HMACbad; noactivarConectarNuevootra vezdespuéspair.
Planefectos/retorno/no guarantee key en docR165. No indicarejecutarantesdecisión
usuario; no radioagente. No volverMiFit entrequeries si bloquesiguePC. Root/
firmware/nativo/instalación siguen fuera.

**Actual R164, 2026-10-12:** [Mi Fitness sincronizado y candidata nueva](synchronized-auth-r164.md).
Usuario confirma retorno/conectado+sync; NO preguntarotra vez. USB4logs COMPLETO
a tools/local/mi-fitness-logs-usb-r164/; sinBT/watch/app/phonefilewrites. Unvalor,
3líneasRW4, encryptKey/token, fecha cercana12, noJSONsameobject/MACreconocida.
Distinto deR159fallido yR162. auth-candidate-r164.json preparado y PROMOVIDO a
auth.json conbackup privado auth-historical-r159.json, tmp/rename/readback;
HMAC NO probado. No hashes/valoresprivados públicos. Scripts locales r164ignorados.
ClienteSPP/exeR160 no cambiado, pairingR163 sin cambios/retests extra.
Próximo MANUAL único `node tools/pc-pairing.mjs pair`: teléfono BT OFF temporal,
SIN unlinkMiFit ni Conectar nuevo teléfono; reloj menúsnormales/encendido,
WindowsUI códigoambosverificar, cancelPIN/diferente/reset. PlanR163+R164 efectos
revisables; alcanceBluetoothstock ya solicitado, agenteNOAPI/radio. No session
todavía; esperarJSON, no retornoentrecadaquery/repeatpair. Bond dirigido real/
preservaciónapp todavía NO probados. SiQR/falla revisarantesotro vínculo.

**Actual R163, 2026-10-12:** [pairing por dirección preparado/plan](windows-directed-pairing-plan-r163.md).
Usuario clarifica reloj se apagó COMPLETO, volvió encender/confirmar código
Windows, no Conectar nuevo teléfono/unlink en último pairing. SIGUE EN QR:
no asumir retorno Mi Fitness por haber copiado logs. Causa apagado no documentada.
Siguiente MANUAL solo retorno conocido: quitar SOLO RW4 Windows→Mi Fitness
cuenta habitual/sync/menús normales, avisar; después leer logs USB de eseestado.
No session/keyvieja/nuevaprobe. DirectedPairing.cs +tools/pc-pairing.mjs preparados
soloPC: NativeAPI AuthenticateDeviceEx MITM3 stockUI/direcciónprivada/sin inquiry,
unradio/layout/cachegate (AlreadyAuth no retry)/cleanup/supervisor60s. Build/test
14C#fakes y6JSfakes sinAPI/radio pasan. EXE separado ignorado/metadatahashes;
SPP R160 no modificado. Nueva operación pair requiere revisión del plan y vínculo
Mi Fitness conservado; NO ejecutada ni autorizada por preparación/clarificación.
No autoconfirmación/PIN/fallback/cachedelete/keyread/Xiaomi payloads. CI añade
soloJSfake supervisor, no run; compilador localpinned no portableCI aún.

**Actual R162, 2026-10-12:** [logs actuales y segundo candidato](current-auth-candidate-r162.md).
Usuario copió4logs y autorizó lectura directa USB; Unauthorized resuelto con
aprobación manual del teléfono, colección SDK-pins fuera sandbox COMPLETE4files.
Solo Mi Fitness/files/log .log actuales a tools/local/mi-fitness-logs-usb-r162/;
sin app/radio/watch/phonefilewrites. Copias yUSB:2valores distintos,1archivo,
9líneasRW4,0JSONsameObject/MACtarget reconocida. Viejo→nuevo sin reversión.
Logs máximafecha12, candidatos contextual fecha11 previa: NO clavevigente probada.
Un valor nuevo separado en tools/local/pc-rfcomm/auth-candidate-r162.json,
sourceTag user-supplied porlogs propios; validateAuth OK. auth.json NO cambiado,
session sigueclavevieja: NO ejecutar. No HMACnuevo/keys/hashes/MACpublicados.
Helpers locales ignorados current-auth-inspection.mjs (copies/usb/prepare) y
current-phone-logs.mjs (one-shot refuseexistingdest); preparación soloPC, sin
rebuild/tests de motor. Mantener Mi Fitness asociado; NO otro unlink/Conectar
nuevo teléfono para invalidarcredencial. Investigar pairing Windows a MACconocida
API BluetoothAuthenticateDeviceEx normalUI (docs consultadas); NO construida,
ejecutada o validadaRW4. Próximo meta accesoSPP sin migraciónapp; requiere preparar
herramienta/plan antes de acción física. No APK/HCI/cloud/root/nativewatch.

**Actual R161, 2026-10-12:** [dos sesiones con Xiaomi v1 y AuthHmacMismatch](windows-auth-result-r161.md).
2TX/2RX cada una, 7433/1762ms, close+worker true/exit0, sin nativeError/supervisor.
Primera pidió pairing; usuario aceptó y repitió manualmente. No auth-final/GET/
upload/archivos. SPP y nonce response físicos CONFIRMADOS; clave histórica NO
autentica, causa rotación probable/no demostrada. Orden KDF/HMAC coincide con
XiaomiAuthService del worktree existente; no cambio/build/tests nuevos. Guía GB
reconsultada advierte invalidación al desvincular. NO repetir session ni guesses.
Próximo: una vuelta Mi Fitness, sincronizar, copiar logs actuales a privado
tools/local/mi-fitness-logs-current/ (directorio preparado; aún vacío). Mantener
Mi Fitness asociado después: NO otro unlink/Conectar nuevo teléfono hasta revisar
credencial y acceso Windows que preserve asociación. auth.json viejo NO renovado;
prep actual solo usa directorio histórico y no sobrescribe, no ejecutarlo para
renovar. Agente no radio/ADB. Retorno de estos intentos aún pendiente, no asumir
recovery ni datos físicos/nativo/Doom. No nueva APK/HCI/cloud/login.

**R160, 2026-10-12:** [batch falla antes de Xiaomi en20147ms](windows-session-open-failure-r160.md),
workerexit1 confirmado, categoría nativa no guardada; no inferir key/proto.
Usuario reactivó Conectar nuevo teléfono pero WINDOWS CONSERVÓ VÍNCULO VIEJO.
Hipótesis stale, no causa probada. Corregido bug parent-close: no C/kill al worker
terminal; regresiones E→EPIPE→CLOSED1 pasan. Nuevos enums/WSA real/stages acotados,
sin datos crudos. Un nuevo pairing Windows (quitar SOLO RW4, QR actual, código)
y una sesión manual del mismo lote; no volver a cambiar vínculo reloj después.
BT teléfono OFF durante ensayo. No APK/repeatprobe/retries auto. Ambas listas
con reloj funcional observadas, no prueba de dos conexiones activas. PC sigue;
retorno actual pendiente por decisión usuario. Agente no radio.

**Actual R159, 2026-10-12:** usuario exige pruebas AGRUPADAS/una sesión, no
desconectar entre consultas. [Lote listo/plan](windows-xiaomi-session-plan-r159.md):
node tools/pc-rfcomm.mjs session MANUAL, un socket, versión→auth→battery/info→close.
Sin uploads/config/initialize completo. Usuario sigue PC; no pedir re-pair
innecesario ni repetir probe. Auth candidata histórica única preparada en
tools/local/pc-rfcomm/auth.json, sin exponer/hashing key; asociación por línea,
vigencia solo futura HMAC. Target existente válido. No radio del agente.
Build/tests:142C# assertions,12synthetic protocol sessions,2fake IPC full,4IPC
failures,10previous supervisor cases; CI actualizado/no run. Hashes incluyen
5C# y3JS protocolos. Lote real/retorno posterior PENDIENTES; retorno previo sí.
Comando del usuario tarda hasta~1min; único JSON sin keys/MAC/serial/raw. Tras
terminar lote vuelve Mi Fitness una vez. No autoriza firmware/módulos/ELF físicos.

**R158/R159, 2026-10-12:** [SPP real Opened/1337ms/1Start/cierre y worker OK](windows-spp-result-r158.md).
No appcomandos. NO repetir probe. Usuario mantiene vínculo PC y difiere volver
a Mi Fitness; no asumir retorno actual o fallo, anterior sí comprobado. Solicita
AGRUPar pruebas en UNA sesión y no volver entre cada consulta. Preparar versión,
auth con HMAC/claves vigentes si disponibles, battery/device info, cierre; una
vuelta Mi Fitness al final. No APK nueva/initialize completo/config/uploads.
Auditoría de fuentes existentes identifica V1/V2 y auth HMAC+CCM/CTR, no firmware
RE. Batch aún en preparación, no ejecutar radio automáticamente. Mantener alcance
solo lecturas/handshake: código nativo y firmware siguen fuera de autorización.

**R157, 2026-10-11:** usuario completó target privado con MAC compacta (12 hex,
sin separadores). Solo formato inspeccionado, sin exponer valor. Se normalizó
address a pares con dos puntos, verificando mismo identificador y validateTarget
correcto; JSON/modelo/FW/plan coinciden. Archivo sigue privado/ignorado. No radio,
cache query o probe ejecutado. Usuario puede continuar el único ensayo ya
autorizado R156; no repetir prueba si luego entrega resultado ni pedir MAC al chat.

**R156, 2026-10-11:** usuario autoriza continuar el único [probe SPP Windows del
plan](windows-spp-probe-plan-r154.md) tras aclarar unlink Mi Fitness. NO preguntar
revisión otra vez. Se creó tools/local/pc-rfcomm/target.json con placeholder
inválido/sin MAC, EXE y fuentes hash coinciden; sin recompilar o repetir tests.
Instrucciones manuales: completar address local desde Acerca, desvincular Mi
Fitness según flujo ya observado, BT teléfono OFF, pairing Windows desde QR,
node tools/pc-rfcomm.mjs probe UNA vez, quitar solo vínculo PC, volver a Mi Fitness.
Pedir solo JSON fijo/no MAC. Agente no ejecutó radio/probe; resultado y retorno
posteriores pendientes. No API Xiaomi/clave/upload/código/retry autorizado.

**R155, 2026-10-11:** aclaración importante: usuario también DESVINCULÓ EN MI
FITNESS antes del pairing PC, no solo Bluetooth. Aviso reportado «no se pierden
datos»; retorno completo ya comprobado. [Plan R154 corregido](windows-spp-probe-plan-r154.md).
No tratarlo como desconexión temporal de radio; asociación app sí cambia.
Aviso no demuestra supervivencia de futuros ELF/WAD. No repetir preguntas de
retorno; único intento SPP sigue pendiente de revisión, no ejecutarlo por esta
aclaración. No tocar firmware/reset/botón basura como equivalentes.

**R154, 2026-10-11:** usuario confirma que quitó RW4 del PC y volvió a vincular
Mi Fitness, restaurando todas las funciones. No repetir preguntas de retorno.
Trabajar con un vínculo a la vez para este ensayo; no inferir límite universal.
[Cliente/plan SPP Windows](windows-spp-probe-plan-r154.md) preparados, NO ensayo
físico autorizado/ejecutado. Ahora probe explícito disponible; requiere target
privado verificado/modeloFW/plan, caché autenticada y único radio. Worker supervisado,
20s controlador/30s padre; cierre forzado no confirmado. Default gate sigue,
134 aserciones C# +10 escenarios JS pasan sin sockets/radio. CI actualizado/no run.
No APK nueva, clave Xiaomi o código enviado; target privado no creado. Antes de
indicar pairing/probe obtener revisión del plan; luego instrucciones de una sola
prueba y retorno observado (quitar PC, Mi Fitness). No invocar worker directamente.

**R153, 2026-10-11:** usuario conectó RW4 al PC; Windows «Micrófono conectado».
Ahora QR no permite salir/usar normalmente: NUEVO estado tras conexión PC,
retorno anterior R152 no aplica. [Resultado y restauración pendiente](pc-cache-and-migration-r150.md).
Se pidió BT teléfono encendido → Mi Fitness cuenta habitual → Conectar si aparece
en registro existente. Esperar resultado; no más pruebas PC/socket/código ni
eliminar registro/reset/añadir reloj. No cortar BT de todo PC: teclado conectado.
Nombre completo/imagen no publicados. Gate R148 sigue cerrado; SPP no verificado.

**R152, 2026-10-11:** usuario confirma salida del QR y retorno normal a Mi Fitness;
corregir exceso de cautela, no repetir pregunta de recuperación. [Siguiente prueba
manual](pc-cache-and-migration-r150.md): descubrimiento Windows con QR abierto y
BT teléfono apagado, sin seleccionar candidato/pairing; cancelar y restaurar.
Resultado aún pendiente. No operación del agente, gate SPP/código cerrado.

**R151, 2026-10-11:** usuario reporta QR para la app al inspeccionar el flujo
propuesto. [Resultado](pc-cache-and-migration-r150.md). STOP: no escanear ni pairing
Windows/SPP/reset. No asumir bond borrado, cancelabilidad o visibilidad nueva.
Se indicó gesto atrás; si sale, activar BT teléfono y abrir Mi Fitness; si no,
reportar antes de otras acciones. RETORNO Y SINCRONIZACIÓN PENDIENTES. No repetir
inspección ni proponer otro intento hasta conocer ese estado. Agente sin radio/ADB.

**R150, 2026-10-11:** usuario buscó Windows con Bluetooth del teléfono apagado.
[Caché Classic real](pc-cache-and-migration-r150.md) leída con aprobación, sin
inquiry/pairing/sockets: 7 registros, 3 autenticados, cero candidatos RW4 por
nombre; no identidad verificada/alias descartado. Script propio y layouts x64
validados; sandbox ExecutionPolicy se resolvió por escalación, no Bypass.
Usuario confirma opción de menú preguntada; no pulsada/nombre exacto no transcrito.
Plan de inspección de «Conectar nuevo teléfono» preparado, PENDIENTE revisión,
puede cambiar estado de vínculo incluso antes de confirmar. No asumir rollback
por reboot ni mandar al usuario migrar/resetear. Gate RFCOMM físico cerrado.

**R149, captura posterior:** usuario buscó manualmente desde «Agregar un
dispositivo» de Windows; no aparece RW4 por nombre, sí dispositivos desconocidos
sin identidad. No atribuirlos al reloj ni tratar la búsqueda como prueba de
incompatibilidad/bond. [Registro](pc-link-preflight-r149.md). Ruta PC sin validar;
no solicitar nuevas búsquedas, seleccionar desconocidos o migrar/resetear como
atajo. Captura con datos personales no copiada al repo. Agente sin radio/ADB.

**R149, 2026-10-11:** usuario pregunta cómo conservar vínculo al usar PC.
[Preflight y límite](pc-link-preflight-r149.md): lectura PnP local aprobada cuenta
cero registros por nombre RW4; NO prueba bond inexistente/identidad. Ninguna
operación de radio o reloj. Falta consulta de caché autenticada sin inquiry.
FAQ oficial RW4 documenta migración de teléfono, no PC/dual-host. Tabla oficial
en FAQ Watch6 tiene columna RW4 explícita: SPP Android y BLE iOS; RAM32/ROM256
comerciales, no memoria libre ni ABI medida. Evidencia etiquetada en matriz.
Cliente R148 sigue offline/gate cerrado; coexistencia no demostrable por simulación.
No emparejar/migrar/reset sin plan concreto y revisión. Consulta autorizada aún
no publicada. No cambios de código ni recompilación necesarios en R149.


**R148, 2026-10-11:** [cliente C# Windows offline](../experiments/pc-rfcomm/README.md)
implementado. node tools/pc-rfcomm.mjs build/test; compiler oficial de Windows
con firma válida, sin instalaciones. Tests pasan, 113 aserciones con clocks/API
falsas; cinco simulaciones CLI ejercitadas. Backend Winsock preparado con UUID
SPP/auth+encrypt/nonblocking/select/SO_ERROR, pero api.Physical=true bloquea antes
de WSAStartup y no hay entrada física en CLI. Native API real NO ejecutada.
Sin discovery, pairing, ADB o cambio del reloj. Resource cleanup, errores,
deadline/cancel/late results, layouts y guard físico probados. Fixture Poll
corregido al detectar que retenía el error anterior; suite final pasa.
Workflow GitHub Actions Windows preparado, NO ejecutado ni subido; repo sin remote.
Próximo: vínculo Windows/RW4, preflight/adapter y supervisor antes de habilitar
probe físico; plan y revisión todavía obligatorios. No prometer timeout de driver
nativo solo por simulation ni sandbox de módulos. Consulta R146 aún no publicada.


**R147, 2026-10-11:** usuario pregunta por avance independiente de upstream.
[Alternativa Windows evaluada](pc-transport-alternative.md): lectura CIM aprobada
fuera del sandbox detecta Realtek Bluetooth Adapter, estado OK. No direcciones,
seriales, discovery, pairing ni conexión. Resuelve disponibilidad del adaptador
reportado, no radio encendida/compatibilidad RW4. API Microsoft RFCOMM documentada.
Checkpoint autónomo propuesto: cliente PC y pruebas simuladas, sin reloj. Antes
de físico: compatibilidad y vínculo actual, plan explícito y revisión; no bonding
automático/unpair/reset/inseguro/canales manuales. Upstream ayuda, no dependencia.
Autorización de publicación R146 sigue vigente; consulta aún no publicada.


**R146, 2026-10-11:** usuario autoriza explícitamente publicar la consulta de
compatibilidad en soporte Gadgetbridge. Autorización vigente; no pedirla de nuevo.
README oficial dirige a Codeberg/Freeyourgadget/Gadgetbridge/issues/new/choose.
Herramienta UI: inventario sin navegadores, IAB y Chrome no disponibles. No se
publicó nada. [Mensaje solo cuerpo](upstream-connection-message.md) preparado
para publicación manual o desde una sesión conectada. Esperar enlace real antes
de registrar envío/resultado. No crear cuentas, usar credenciales ni publicar
en otro destinatario como alternativa automática. Sin nuevas pruebas del reloj.


**R145, 2026-10-11:** [última revisión offline completada](phone-bluetooth-apk-result-r145.md).
APK Bluetooth exportado por usuario, tamaño/hash fijados, manifest y firma v3
verificados. Binder de apertura delega a connectSocketNative; libbluetooth_jni
no está en el APK. No corrección concreta encontrada. AdapterService.dump intenta
copiar HCI de /sdcard a logs MIUI; no prueba archivo/logging efectivo. Metadata
de los dos ZIP previos: cero rutas exactas halladas, sin abrir entradas nuevas.
Test de inventario pasa. Cerrar bucle PROBE/HCI/builds solo de detalle; siguiente
checkpoint: compatibilidad externa verificada. Consulta upstream actualizada,
todavía NO enviada/publicada. No nuevas operaciones físicas ni APK diagnóstica.
Lectores SDK usados en PC con aprobación tras Java AccessDenied en sandbox.


**R144, 2026-10-11:** diagnóstico usuario device/1path/PACKAGE_PATH_REFUSED.
Metadata PC identifica Bluetooth@<build> dentro de APEX esperado: parser propio
rechazaba sufijo, no USB ni ausenciapaquete. Corregido/testregresión pasa; no
copy real aún, no repetirdiagnose ni borrar metadata. Usuario pide opciones y
cambio estrategia: [decisión acotada](phone-bluetooth-apk-plan-r142.md), no bucle
HCI/PROBE/APKsdebug. [Draft upstream](upstream-connection-question.md) listo,
NO enviado/publicado; requiere instrucción explícita para comunicar. Última
copia/análisisoffline posible con export-bluetooth corregido, buscar fix concreto;
si no, cambiar vía. Otro hostPC/prestado solo alternativa no compat probada,
otrophone no disponible; inventarioCIMPC opcionaldenied/no disponibilidad
establecida. No nuevos vínculos/migración/reset sinplan/decisión. Gatesnativo/fw
cerrados, éxitoexport no resuelve EOF delreloj por sísolo.

**R143, 2026-10-11:** [exportación fallida y diagnóstico preparado](phone-bluetooth-apk-plan-r142.md).
Usuario aviso genérico exportfailed, BT/USBdebug encendidos; autorización/ruta/
pkg no demostrados. PC exportdir ausente,3ADBhashpins coinciden, no partial.
Nuevo diagnose-bluetooth SOLOusuario: getstate→pmpath fijo si device, no pull/
radio/watch/APK. JSONstage+estado sinraw; pathsAPKprivados solo metadata en
tools/local/phone-bluetooth-diagnostic-r143/package-path-metadata.json, nooverwrite.
No relajar parser sin metadata, no variantespaquete. Tests fake pasan. Resultado
pendiente, agente sinADB real. No repetirexport ni cambiarBT/keys/permisos.

**R142, 2026-10-11:** usuario [consulta R141 completada](phone-bluetooth-config-plan-r141.md):
user, modeUNSET/pathUNSET, config3NOT_FOUND. No ruta/cause/effective logging
demostrados; no interpretarUNSET como Bluetoothausente/error. No otroPROBE/HCI/
APKdebug. [Exportación Bluetooth instalada preparada](phone-bluetooth-apk-plan-r142.md):
node tools/export-mi-fitness-apk.mjs export-bluetooth SOLOusuario; paquete fijo
com.android.bluetooth, getstate/pmpath/pullAPK normalUSB, sinuser-data/radio/
watch/instalar/ejecutar. Destino privado tools/local/phone-bluetooth. APKbase
puede no incluir JNI; no garantizar solución. Extensión exporterAPEXestricto
soloBT/testsfake pasan; plan noADB. Copia/JSON pendientes. Tras resultado:
pin hash/tamaño, firma/manifest SDK antes de análisis; no inferiractualpath por
strings ni ISA RW4 por teléfono. RetornoR140 normal ya confirmado, sin cambios
de estado solicitados enR141. Gates nativo/fw cerrados, noagenteADB real.

**R141, 2026-10-11:** [investigación y consulta de configuración preparada](phone-bluetooth-config-plan-r141.md).
ZIP: metadata config/vendor/nestedBT counts0; no abrirunknown. AOSP16 socket
live deshabilitado en user; ParameterProvider defaultpath+override, fuente
oficial descargada autorizada/hash documentado, no ejecución. HyperOS ruta
efectiva aún desconocida. Nuevo phone-bluetooth-config.mjs collect SOLOusuario:
7lecturasUSB fijas (getstate,3getprop,3cat de bt_stack.conf), sinradio/watch/
logging/permisos/stop/reporte nuevo; MiFitnormal/HCIoff. Reporta enums/categorías,
denied/missing sinfallback/raw, noleerbt_config.conf/keys. Testsfake pasan,
plan/default noADB. Resultado real pendiente; entregar uncomando/JSONsolo,
sinAPK nueva/PROBE/captura/reinicio. RetornoR140 confirmado, no repetir pregunta.
Gate firmware/nativo cerrado; no afirmar ruta activa por config declarada.

**R140, 2026-10-11:** [captura nueva revisada](phone-hci-capture-result-r140.md).
Usuario PROBE r131 G08/R02/L01, apertura529ms, sinD05/auth/GET; collect-capture
exitoso. Confirma todo restaurado y funcionando: no pedir otra confirmación.
PC inventory/review:13184 entradas, dosSNOOZ16B/cero registros/CRC seleccionados
OK, sininline ni otros nombres HCI reconocibles. Propiedad exacta full1:
configuración registrada, no logging efectivo demostrado. Tags/formatos nativos
permitidos sin matches; causa inconclusa. Scanner ampliado con counts/enum sin
raw y tests PC pasan. No agenteADB/radio. No otraAPK/PROBE/copia/clave por
conjetura. Próximo: ruta/exportación efectiva HCI HyperOS específica; búsqueda
primaria no la identificó (MiBox solootrodispositivo). Captura privada en
tools/local/phone-hci-r136; no divulgar. Gates nativo/instalación/fw cerrados.

**R139,2026-10-11:** HCI localizado por usuario: «Registro snoop de Bluetooth
HCI», originalInhabilitado, opcionesFiltradohabilitado/Habilitado; registro
pilasInformación y filtroHCI aparte. ElegirHabilitado, no tocarpilas/filtros;
misma secuencia autorizadaR137. RestaurarInhabilitado SOLOdespuéscollect-capture
y cicloBT. No activación/PROBE/copia136 reportados todavía; agente sinADB/radio.
[Plan](phone-hci-capture-plan.md). No pedir otra aprobación; esperar JSON/informe/
retorno, no rawZIP ni reintentos. Gate nativo/fw cerrado.

**R138,2026-10-11:** usuario no encuentra HCI, capturas solo audio/AVRCP/MAP/
page scan/AudioDump/LEAudio, no inicio. No HCIausente en toda build demostrado.
[Guía de localización](phone-hci-capture-plan.md): inicio del menú/buscarHCI,
AOSP16 XMLprimary key bt_hci_snoop_log debugmisc antesUSB; HyperOSubicación
desconocida. No tocarpageScan/audiodump, no activarPROBE aún. Si no aparece,
captura del inicio paraidentificar, no root/setprop. AutorizaciónR137 vigente;
captura/probe/copiarresultado aún pendientes, agente sinADB/radiofísico.

**R137,2026-10-11:** usuario SÍ autoriza captura HCI nueva según
[plan completo](phone-hci-capture-plan.md). No volver a pedir autorización para
misma secuencia. Manual pendiente: teléfonoUSBnormal/MiFitnormal→HCIoriginal
anotado/enablefull→Nearby SOLOMiFit deny/stop ambas→BTOFF10sON→unPROBEr131
→copiarinforme/cerrarapp→collect-capture ANTESHCIrestore/Bluetoothrestart
→HCIoriginal/OFFON/Nearbyrestore/MiFitnormal/USBdebugoff. Destino fresh136,
mismaAPKr131 sinupdate. Plan-capture verificado sinADB. Pedir solo JSON/informe
filtrado/retorno, no ZIP/raw. Si ajuste no claro o falta, detener y etiquetas;
sierror restaurar sinretry. No QUERY/bond/corestop/nativo/fw. Resultados
todavía pendientes; agente noADB/radiofísico. RevisiónlocalBT autorizada,
decodercausas ampliar/probar antes de leer paquetes reales si aparecen.

**R136,2026-10-11:** usuario collect exitoso R134; copia local244073738B,
13173entries/central1319885B. Agente SOLOPC inventario/review, noADB. Límite
8192 demasiado bajo→32768 con fixture13173; unrelated duplicates/colon ignorados
sin abrir, candidates/maintext uniqueness strict. ErrorZxx fijo, private names
noexport. [Resultado](phone-hci-review-plan.md): únicoSNOOZ16B/BTSNOOPv1UART1002,
CRC/tamañoselectedentriesOK, records0; streamingmaintext soloBTSNOOPmarkers,
sininline. Historialdisponible VACÍO, causa noatribuida. Decoder cuenta tipos,
no causas reales; sinraw/extract/noappssemantic read. Tests inventory/review/
collector pasan (stream/CRC/markers/trunc/privacy/v1v2). Fuente btsnooz/AOSPprevia.
[Nueva captura plan completo](phone-hci-capture-plan.md) preparada; DECISIÓN
PRIVACIDAD NUEVA PENDIENTE (registroHCI completo+unPROBE no cubiertos por R135).
MismaAPKr131, UI HCIoriginal→enable→Nearby SOLOMiFit/stop ambas→OFF10sON→unPROBE
→collect-captureANTESloggingrestore (AOSPdisabled puede borrar logs)→HCIoriginal/
OFFON/Nearbyrestore/MiFitnormal→debugUSBoff. Destino tools/local/phone-hci-r136
fresh distinto134, dosUSBreads getstate+bugreport sinfallback; modes plan-capture
sinADB, inventory-capture/review-capture PC preparados, tests destinosseparados.
NOactivar/probe/colectar poragente. No ZIP/rawchat/Drive/Git. No más aprobación
para historial existente; nueva captura requiere síexplícito. Nativo/fwcerrados.

**R135,2026-10-11:** usuario SÍ autoriza obtener bugreport privado en PC y
analizar solo Bluetooth. No volver a pedir aprobación para misma copia. Manual
entregado phone-hci-report.mjs collect (SIN punto/args), teléfonoUSBnormal,
MiFitnormal; pegarJSON/avisofijo, no ZIP/raw. Resultado/copiapendiente, no ADB
por agente. [Plan actualizado](phone-hci-review-plan.md).
Nuevo inspect-phone-hci-report.mjs inventory PC: ZIPcentralmetadataONLY,
max2GiB/8MiBcentral/8192entries, fixedFS Bluetoothnames +countbugreporttext,
no contenido/extracción/nombresexport/CRC/HCI/atribución; rejects invalid/ZIP64/
split/traversal/duplicates/encryptedmethods/symlinkcandidates. Tests sintéticos
privacy/bounds/paths/format pasan, defaultplan/syntaxOK; ZIPreal no presente
al check de preparación. Siguiente: cuando usuario aporteJSON, inventory local
y elegir decoder solo secciónBT según formato encontrado, tests antes de leer
contenido real. No loggingfull/PROBE/corestop/nativo/firmware autorizado.

**R134, 2026-10-11:** respuesta al planOFF→ON: r131/API36/P00/B01T01S01,
traceD01D02D03D18D04E03D17D13, times0/139/145/148/148/339/343/359ms;
connect191ms/G08R02L01/no cierre local previo/noD05/auth/GET. Usuario dice
sincroniza correctamente: retorno sync confirmado, no pedir misma confirmación.
Inventoryr11440callbacks/16132ms es histórico. Pasos OFF/ON no observados por
agente; no prueba exclusividad/cierre core/causa. [Resultado](phone-adapter-restart-plan.md).
No repetir variantes permisos/perfiles/PROBE ni APK soloinstrumentación.
[Siguiente plan privado](phone-hci-review-plan.md): fuentes AOSP btsnooz.py/
SnoopLogger oficiales obtenidas con permisos, sin ejecutar; memoria con HCI y
L2CAP/RFCOMMheaders posible, HyperOS/bufferactual desconocidos. HCI completo
NO habilitado; fuentes/hashes/doc. Herramienta phone-hci-report.mjs defaultplan
NOADB; collectSOLOusuario tras decisión PRIVACIDAD, getstate+bugreport USB,
ZIP privado completo tools/local/phone-hci-r134 destinofresh, timeout30/300s,
SDKpins/no rawconsole/no fallback; ZIPheader no análisis/HCI prueba. Tests
mock/privacy/nooverwrite/invalid/offline/default/syntax pasan PC. Extractor de
paquetes aún NO implementado; prepararlo/probar antes de leer contenido real.
No collect ni ADB/radio por agente; aprobación privacidad pendiente porque ZIP
incluye diagnóstico otrasapps. No archivos crudos al chat/Drive/Git. Firmware/
nativo/instalación reloj CERRADOS, core/bond intactos. No publicar APK/firmware.

**R133, 2026-10-10:** usuario completó lector pasivo R132: cabeceras nativas
false, cierres propios0, candidatos4 y PORT25 todos0. Completó sin error; sin
atribución r131 ni socket actual. Inconcluso, no repetir lector ni pedir rawlogs.
[Registro](rw4-opening-result-r132.md) y [único ensayo siguiente preparado](phone-adapter-restart-plan.md):
misma app r131, denegar temporalmente Nearby SOLOMiFit/stop ambas→Bluetooth
teléfono OFF real10s→ON→un PROBE→cerrar/restaurar Nearby/abrirMiFit/verificar.
Nuevo factor respectoR113: ciclo completo adaptador; no exclusiva garantizada,
core puede reconectar. Estado PREPARADO/no realizado; no ADB físico por agente.
No APK nuevo/QUERY/insecure/canalmanual/corestop/unpair/reset/firmware/nativo.
Si mismo fallo, no repetir variantes: evidencia profunda con privacidad o
alternativa respaldada por código. Fuentes AndroidAdapter y fichaGB revisadas;
PR3693 inaccesible, no corrección actual atribuida. Sin tests nuevos para docs.

**R132, 2026-10-10:** [PROBE r131 recibido y próximo lector pasivo](rw4-opening-result-r132.md).
Usuario r131/API36/TRANSPORT_ONLY/P00/B01T01S01: traceD01D02D03D18D04E03D17D13,
times0/128/132/142/142/540/546/553ms; connect398ms; G08R02L01;
failureAfterCloseRequestno; sin auth/key/GET. Confirma todoOKwatch/app: retorno
CERRADO para este intento, no volver a preguntar/repetir PROBE. Inventoryr114
copiado es anterior R117/R118, NO nuevo. EOF puede ocurrir tras señal parcial.
PC fuentes Android16RFC/BTA/port/logger descargadas oficiales con permiso red,
sin ejecutar código; SHA/textos en doc/privateartifacts. BTA callback pasa
port_status pero receptoron_rfc_close ignora y cleanupNONE cierra fd→EOF posible.
NO ruta HyperOS/causa real probada. SDPsuccess→RfcommConnect→sendSCN en fuente,
inferencia condicionada. SocketEvents16 dump omiteUID/error, métricas sí: no pedir
dumpsys creyendo que los dará. Nuevo tools/phone-rfcomm-logs.mjs defaultplan
NOADB; collectSOLOMANUAL4USBreads getstate/currentuser/cmdpkgownUID/logcat
main+system -d-t2000-vbrief 3tags:V/*:S. NOenable/clear/rawsaved/stdout/radio,
2MiB/30s/2000rows; summaries fixedcounts/enums bool. Candidateownslot exige
ownUIDclosure+samePID/slot≤64rows, NO atribuciónr131/socketactivo; portcodes
unattributed aparte. TestsFakeADB/privacy/bounds/correlation/syntax/plan PASAN.
Siguiente manual: teléfonoUSBnormal→collect una vez conMiFitnormal→copiarJSON
→debugoff/revocar si activado. NO otraAPK/PROBE/settingschange/corestop/hardware
por agente. Lectura y resultado pendientes; native/firmwaregates CERRADOS.

**R131, 2026-10-10:** [integración/APK y plan de ensayo](android-opening-diagnostic-r131.md).
Status.error guarda openingStage/localReadResult enums; report render fijo, D01
graba recordedRevisionr131 y limpia datos; reports antiguos no reinterpretados.
L01 reconoce EXACTO mensaje AOSP ret:-1 (EOF local, NO prueba timeout/autor),
L02ret0/L00unknown. Helpers/Status/privacy/reset tests PC PASAN; preview30/refresh/
doctorOK. Socket seguro UUID1101/API/PROBE-noauth/gates/plazos/reintentos sin cambios.
APK listo artifacts/android-diagnostic-r131/RW4Diagnostics-r131.apk,31411089B,
SHA9b5b59e31e6dbd477235e122e3dfb9b19d8bd65d2b3300ebdbdf12193a0285ac.
BuildSUCCESS2m29s/73tasks20exec; sandbox red falló→build escalado permitido exitoso.
Inspector min23/target35/debugfalse/perms10/noINTERNET/bindings sensibles ausentes;
apksigner36v1/v2verify certificado47eeb041e241c7ab785ed8bdcf06c6fcce90020e52d4794aa3c6c66590577709.
SDKDEX confirma llamadas clasificadores/render/revision en APK empaquetado.
Inventory código/storage/report módulo r114 conservados; conexión/UI app r131.
Manual propuesto: update propia app→MiFitnormal→stop SOLOMiFit/propia→unPROBE
→mantener informe abierto/copiar→cerrar/volverMiFit/verificar normalidad.
NO QUERY/newbond/cambiarprefsprofilespermissions/systemcore/canales/fallback.
Resultado/instalación/retorno r131 PENDIENTES; agent noADB/radio/hardware.
Plan incluye riesgo/persistencia/recovery limitado/criterios por resultado;
NO prometer conexión arreglada ni socket core libre. Native/firmwaregates CERRADOS.

**R130, 2026-10-10:** usuario confirma lista negra vacía. Sin bloqueo visible
en esa lista, NO descarte de otras políticas/causa E03. Helper puro Java añadido
en Rw4DiagnosticDetails: SocketOpeningStage R01/R02/U00; reconoce solo cadena
exacta readAll→readInt/waitSocketSignal→connect de android.bluetooth.BluetoothSocket.
Máx64frames, ambiguous/unknown/runtimefailure→U00, no causes/raw/privates/reflection.
Tests ampliados Details y runner test-android-diagnostic-policy PASAN PC.
NO integrado Status, NO preview/APK/build Android/ADB/radio, instalada sigue r114.
[Detalle](bluetooth-open-failure.md). Próximo: revisión completa captura apertura,
integración y plan con criterios para corregir transporte antes de otro intento.
No nueva instalación/manualtest solicitado; no inventar conexión arreglada.

**R129, 2026-10-10:** [captura y límite G08](bluetooth-open-failure.md).
Captura HyperOS tiene Lista negra Bluetooth; solo revisión visual sugerida,
contenido/efecto SPP PENDIENTES, sin cambios de ajustes. Fuente AOSP Android16
accesible vía directorio/click: BluetoothSocket blob824dda69d4b5bddc10ae22e58e676e27841a88a3.
connect: readInt4bytes → canal positivo → waitSocketSignal44bytes; ambos readAll
pueden producir mismo IOException G08. NO código HyperOS confirmado ni causa E03.
App propia descarta stack de apertura al reemplazar upstream log por fijo;
Status solo categoría/tiempos, no recuperar fase de informes anteriores.
Próximo PC: si se instrumenta, categoría fija por frames readInt/waitSocketSignal/
unknown, sin logs crudos/reflection/transporte distinto; agrupar con cambios
justificados antes de nuevo APK. Ningún build/ADB/PROBE/hardware ejecutado.
R128 retorno normal ya confirmado; no volver a preguntar. Gates intactos.

**R128, 2026-10-10:** [comparación de servicio completada](phone-core-state-plan.md).
Stopped lectorR126: remote header/bodytrue/sections1/parsed4/unparsed0/core0/
otherusercore0/processnot-established; local header/bodytrue/explicitNothingtrue/
sections0/parsed0/core0. MiFitstoppedtrue. Tras abrirla usuario confirma sync/reloj
normal. Contra baselineR127 remotecore1/localparsed7: ServiceRecord core ya no
observado tras stop; REFUTA persistencia de registro activo en esta medición,
NO socket libre/proceso terminado/causaE03. PC: coreService sin onDestroy/onUnbind;
Binder→Companion.getInstance→static final IMiWearCoreImpl instancia, smali confirmado
nuevo core-impl-companion.txt; onClientDied R121 no cierre bound general. Posible
vida distinta de Service/objeto/socket si proceso persiste, runtime NO comprobado.
Next único: diagnóstico Android transporte/cierre, investigación primaria PC
antes de otro PROBE. AOSP btif_sock.cc ee02f4df3b Socket Events es historial16,
NO activos; Android16refs inaccesibles, no código HyperOS probado. No pedir dumps
crudos/otra APK/stop/disable servicios/PROBE. Sin nuevos tests o ADB físico agente.

**R127, 2026-10-10:** [baseline positiva R126 aportada](phone-core-state-plan.md).
Remote header/bodytrue/activeSections1/parsed5/unparsed0/otherusercore0/
coreRecords1/processassigned. Local header/bodytrue/activeSections1/parsed7/
unparsed0/otherusercore0/coreRecords0/processnot-established. MiFitstoppedfalse.
No socket verificado ni causaE03/competencia demostrada. No reinterpretar ceros
R124. Próximo MANUAL: Forzar detención SOLOMiFit→mismo lector collect stopped
→abrirMiFit/verificarsync→USBdebugoff/revocar. Sin permisos/autostart/profiles/core
changes/PROBE/QUERY/APK nuevo. Cinco lecturas fijas R126, salida y retorno PENDIENTES.
No ADB físico por agente, firmware/instalación/nativo reloj CERRADOS.

**R126, 2026-10-10:** [baseline recibida y lector mejorado](phone-core-state-plan.md).
Usuario baseline R124: coreRecords0/processnot-established, headertrue,
MiFitstoppedfalse; confirma conectado/sync normal. Ordenreal stopped→baseline,
NO before/after inverso. No Lyra socket probada. Lector anterior reconocía solo
cabecera y cero ante cuerpo desconocido; limitación reproducida, NO causa real
de ambos ceros demostrada (raw nunca guardado). Ambos manifests tienen core
con paquetes distintos; nueva consulta una sola baseline normal, SIN stop/PROBE.
phone-core-state.mjs ahora checkpointR126: getstate/currentuser + dumpsys
activity services de DOS paquetes fijos mi_connect_service/wearable +pkgMiFit.
JSON remote/local estructura/emptyexplicit/activeparsed/unparsed/otherusercounts/
coreassigned; unknownnull, normalización componentes cortos. NO IDs/raw/radio.
Tests ampliados/fake5commands/plan/syntax pasan. ResultadoR126 PENDIENTE;
no ADB físico por agente ni APK nuevo. USBdebugoff/revocar al terminar.

**R125, 2026-10-10:** usuario aporta SOLO collect stopped R124:
serviceFormatRecognized=true, activeCoreRecords=0, coreProcessRecord=not-established,
miFitnessStopped=true, currentWatchSocketVerified=false; raw/radio/watchfalse.
[Resultado parcial](phone-core-state-plan.md). Confirma stopped MiFit, no registro
activo del componente filtrado observado; NO prueba socket libre/proceso ausente/
causaE03 ni formato completo HyperOS compatible. Falta baseline positiva para
contraste (pedir JSON previo si ya corrió) y retorno/sync MiFit al abrirla.
No otra consulta stopped, PROBE, APK o cambios de ajustes. Lyra persistente no
respaldada por esta lectura, tampoco refutada. Agente no ejecutó ADB/hardware.

**R124, 2026-10-10:** [plan lectura USB del estado Lyra](phone-core-state-plan.md).
CoreExt setLyraEnabled escribe pref version_v3_; índice68→70, dos llamadas
confirmadas en RemoteServiceConnector muerte Binder/crash/rebind fallido,
NO UI normal encontrada por esta búsqueda; no inducir fallos ni editar prefs.
Tool phone-core-state.mjs plan NOADB; collect baseline|stopped solo MANUAL,
cuatro lecturas fijas USB: get-state, am get-current-user, dumpsys activity
services componente core, dumpsys package com.xiaomi.wearable. No raw saved/
stdout, serial/PID/UID/keys/radio/socket/watchcommands. Parser reporta registros
activos para usuarioactual, ProcessRecord assigned/null/unknown, MiFit stopped;
no socket o proceso vivo probado, snapshots no atómicos. Tests sintéticos y plan
pasan; datos reales PENDIENTES. Usuario: MiFitnormal→baseline→forzar detención
SOLOMiFit enUI→stopped→abrirMiFit/restaurar/verificarsync, USBdebugoff/revocar.
No cambios Nearby/autostart/profiles/core, no nueva APK ni PROBE. Gates intactos.

**R123, 2026-10-10:** capturas identifican papelera en Dispositivos, RW4 conectado/
sincronizado según UI; Desvincular en Más, versión2.2.86. SDK smali del APK
verificado: ManagerActivity common_delete→ivg→B→onCreate$lambda$0→
onTitleBarEndViewClicked→changeDisplayMode/editMode (aviso power-save opcional).
Eliminar fila→confirmUnbound→callback positivo/red→unbind→ManagerViewModel→
DeviceManager.unbindDevice. Papelera NO pausa de Bluetooth; no pulsarla para
liberar SPP. [Evidencia](mi-connect-service-static-review.md). Lectura PC solo,
sin nuevo APK/build/radio/hardware. Capturas no copiadas al repo. R122 pendiente
de identificar papelera RESUELTO; pausa temporal soportada aún desconocida.
No otro PROBE/autostart/disable-core/unbind. Causa E03 y gates nativos pendientes.

**R122, 2026-10-10:** usuario no ve pausa de conexión en la pantalla MiFit
inspeccionada. Corrige que **Desvincular y papelera son controles distintos**;
no atribuir a papelera una función sin identificar su contexto. Autostart MiFit
posiblemente habilitado («creo»), no confirmado. Fuentes oficiales Xiaomi
documentan autoinicio y recomiendan segundo plano para RW4; no prueban que
desactivarlo libere el SPP de Lyra. No cambiar ajustes ni repetir PROBE.
Siguiente lectura: captura recortada de los dos controles, sin identificadores,
sin pulsarlos. [Actualización y fuentes](mi-connect-service-static-review.md).
No nuevos builds, operaciones de teléfono/reloj o mediciones en esta revisión.

**R121, 2026-10-10:** [servicio Xiaomi y opciones de desconexión](mi-connect-service-static-review.md).
Usuario ejecutó export-core: una parte30540367B/SHAba8ab69da2808d8273e2dc68ac4944fc3587650f6e597542f94fffd5d2cbbaff.
Verificación PC oficial: packagecom.xiaomi.mi_connect_service,5.1.251.10/code50012513,
min28/target35, apksigner36v3sí/otrosfalse/verifica, certSHAc9009d01ebf9f5d0302bc71b2fe9aa9a47a432bba17308a3111b75d7b2149025.
Manifestdeclara sharedUIDandroid.uid.system, UID/proceso actuales NOconsultados;
servicioexportedcom.xiaomi.wearable.core.MiWearCoreService/actionpackage.MiWearCoreService.
onBind retornaICoreInstance; getMiWearCoreBinder obtiene caller medianteeb.d.a
Binder.getCallingUid→PackageManager.getNameForUid→PermissionChecker.checkCert.
WhitelistSOLOcom.mi.health/com.xiaomi.wearable con firmas permitidas; packageausente
rechazo/SecurityException. Nuestraappnodomain no admitida; añadirpermiso no resuelve.
MI_WEAR_CORE solo solicitado, no definido enmanifest; nivel efectivo desconocido.
FingerprintMD5legacyMiFitness coincide conwhitelist; getSigningCertificateHistory
usado, no prueba de APIruntime ni fabricanteindependiente. NOspoof/bypass/bindreal.
RutaSppcore ApiCallFactory→wear.api.l→ib.o, UUID1101ib.e/factorysegura/Socketconnect;
flagDeviceInfo.createBondWithoutDialog opcional invocaMiuiNearbyApiServicepackage
com.xiaomi.bluetooth antesconnect, estadoRW4flagUNKNOWN/noimplementarAPIsprivadas.
initCurrentDevice restaura suconfig y programa connectDeviceIfNeed3s; onClientDied
gb.a canceltarea +cierraunauth no vinculadas enbindingmode, no cierre global bound.
No prueba de servicioactivo durantePROBE ni causaE03. disconnect(did) escribe
SharedPrefsdisconnect_device_ enTELÉFONO; no ejecutado, retorno necesitaestudio.
APKcore3DEX/18730clases/71candidatos completo; nombresclases guardadosprivados;
MiFitíndiceampliado68candidatos12DEX. No interpretaroperand candidatescomo instrucciones.
SDKsmali confirmado. Tools ahora perfilesfijoscompartidos installed-apk-targets.mjs,
inspect/index admiten--core, code exige reviewprevio. SDKjavaAccessDenied→autorización
fuerasandbox sinAPKexec/ADB/hardware; APKs hashes inalterados. No nuevos builds
Android/tests radio o instalaciones/proprietarycodepublicado. UIcandidatos revisados
BaseDeviceModel.disconnect/BluetoothDeviceModel.setCurrentStatus, DeviceTabVM,
MainActivitycheckCommonApp yConnectNewPhoneActivity: varios cambianbinding/app/
usersettings, NOrecomendar comopausa. Usuario NOtieneotroAndroid; no migración.
Pregunta pendiente soloLECTURA: enMiFitDispositivo ¿veDesconectar/Conexiónautomática/
Interconectividad? Comunicar únicamente nombres, no activar/desvincular/cambiar.
Próximo checkpoint: ruta normal temporal +restauración antes de otroPROBE.
No force-stop/disable/clear/uninstall sistemacore/sharedUID ni root. Gateswatch
instalación/nativo/firmwareCERRADOS, recuperaciónABIloaderRW4pendientes.

**R120, 2026-10-10:** [revisión estática de Mi Fitness y plan del servicio](mi-fitness-apk-static-review.md).
Usuario exportó manualmente base141427237B/SHA56e7bdbe139b369a72839b48d2f29e67e3df25984dd33a9b80abbbc44b511fdd,
4partes instaladas/baseonly. Export-review histórico siguefalse; review posterior
en artifacts/research/mi-fitness-apk/review.json verifica packagecom.xiaomi.wearable,
3.59.1i/code359001/min26/target35; apksigner36 v2/v3/v3.1 ySourceStamp verifican;
certAPI33+3fb18466b99ce7dcf5b85d4c326d88b04e076671a01259a143969905d54e0f1a,
API24–32b031fe98a4dbb0d4d82661787f25de643182b378e9ef632d8adea75aab58f2d8;
titularXiaomi no contrastado independiente. SDKlectorAccessDenied sandbox→autorizado
fuera; apkanalyzerXML falla entidad&, AAPT2binarymanifest funciona; dexpackages
global supera48MiB y quedaINCOMPLETO, no prueba ausencia. Nuevo índice completo
12DEX/22candidatos (escaneo sin límitesinstruction: falsos positivos posibles)
confirmados relevantes con SDKsmali. SystemClient→SPP1101/factoryseguraigualpropia;
a.connect vínculo/permisos/discovery; zlq creaSystemClient; ApiCallFactory ramas
dual/dualcoreWearOS/earphone→zlq, otraBLE/localbind→v23; DeviceInfo.isDual6/7;
mapping/type específicoRW4 aún desconocido. spp.b resultóparser NOotrocliente.
MiWearCoreClient permiteCLIENT/AUTO_SWITCH etc; RemoteServiceConnector hacebind
al targetPackageName defaultcom.xiaomi.mi_connect_service, actionpackage.MiWearCoreService;
CoreExtKt.useRemoteService guards soporte/habilitado/permiso; manifestsolicita
MI_WEAR_CORE, protección efectiva/accesoapp propia sin determinar. Filtro
check-mi-fitness-core-service.mjs sobre4logs existentes:178alltrue/178runningclient/
178bindtrue/0bindfalse/356package/178CoreService/0socketmarkers; agregados pueden
duplicarse, NO178BTconexiones ni identidadRW4/currentstate/causeE03. Testsprivacy
canary/decision/longline pasan. No deshabilitar servicio ni repetir PROBE/query.
Exporter extendido SOLOtargets fijosfitness/core; plan-core sinADB pasó y
fakeADBtests pasan ambos. Próximo ÚNICO checkpoint MANUAL: teléfonoUSBnormal
autorizado, `node tools/export-mi-fitness-apk.mjs export-core`, después desconectar/
depurUSBoff/revocar. Destinotools/local/mi-connect-service/MiConnectService-base.apk,
no overwrite/launch/data/BT/watch/root/fallback; planriesgos documentado.
CoreAPK NOcopiadoaún. Herramientas soloPC/lectoresSDK, ningúnADB real ejecutado
poragente. No nuevas instalaciones/buildsAPK/publicación/nativo/firmwareRW4.

**R119, 2026-10-10:** usuario «ok»; investigación PC del endpoint SPP.
[Informe + plan de copia APK](rw4-spp-endpoint-research.md). Seis archivos fuente
upstream rehash contra review F-Droid0.94/code253 pasan. Ruta revisada:
RW4BT_CLASSIC→XiaomiSppSupport→UUID1101→defaultchannel-1→factoryseguraServiceRecord;
cancelDiscovery preservado. D04 precede socket.connect/D05; PROBEclose está después
de connect, no explica el fallo previo por sísolo. No bug concreto identificado,
no auditoría global/carreras descartadas. Override soloBOTH; sugerenciaClassic
genérica no cambia RW4; comentarioiOS finalauth no desbloquea preconnect.
Web oficialRW4 aún experimental/unknown; Codebergraw no accesible, GitHubarchivado
no latestfix. No PR3693 leído ni firmware2.2.86 validado por fuente upstream.
Nuevo `export-mi-fitness-apk.mjs` plan/export (plan sinADB); usa SDKplatform-tools
37.0.1 ya presente con pinexe+2DLL. Export solo manualUSBphone (`-d get-state`,
`-d shell pm path com.xiaomi.wearable`, `-d pull`base), sin install/run/data/logs/
BT/watchcommands. Pathsstrict/nooverwrite/partialprivado/max256MiB, no rawserial/
remotePath en resumen. `test-mi-fitness-apk-export.mjs` fakeADB/ZIP pasa; plan
ejecutado sinADB. PaqueteMiFit verificado en fichaGooglePlay, APKinstalado aún
sin firma/manifest verificados; exportsoloheaderhash, baseonly/splitslimit claros.
Siguienteúnicocheckpoint manual: activarDepurUSBnormal en teléfono, conectarUSBPC
propio/unPhone/autorizar, ejecutar `node tools/export-mi-fitness-apk.mjs export`,
desconectar/desactivarDepurUSB/revocarconfianza; resultado en tools/local/mi-fitness/
MiFitness-base.apk +export-review.json ignoradosGit. NO tools ejecutaronADB real,
APKcopiado/hardware/BT nuevo, ni root/OEM/securityUSBextras/HCIcapture/apkbuild.
Después verificar identidad/firma/transportestático sin ejecutarAPK ni atribuir
merascadenas aRW4. No solicitar claves/logs crudos ni publicarAPKpropietario.
Fuente SDK actual64MiB APKinspector general es estrecho; APKMiFit podría requerir
inspector oficialmáscapacidad/signer distinto; no relajarvalidaciones a ciegas.
Gatesinstalación/nativo/firmwareRW4CERRADOS; R118 retorno normal confirmado.

**R118, 2026-10-10:** usuario confirma «sí, todo nice» al preguntar por
sincronización MiFitness y funcionamiento del reloj tras segundo inventario r114.
[Inventario + retorno normal completados](rw4-service-inventory.md). No extrapolar
al recovery de firmware, ejecución nativa o transporte SPP funcional. Siguiente
único checkpoint: investigación del fallo del endpoint SPP en PC con fuentes
verificables; sin otro intento radio, APK nuevo, QUERY/PROBE, cambio de clave,
perfiles, permisos, vínculo o transporte automático. Documentación únicamente;
ningún hardware ejecutado por herramientas. Instalación/nativo/firmware CERRADOS.

**R117, 2026-10-10:** usuario mantuvo pantalla abierta y reporta segundo inventario
r114/API36 completado I1/16132ms. [Resultado](rw4-service-inventory.md): ACTION_UUID
con5UUIDs, SPP1101/HFP/HID sí, FE95 no observado; BLE ventana completada,
40callbacks,0addressHits/0nameHits, FE95 no observado; error0, stopScan/detach
llamadas retornaron. Inventario completo confirmado por reporte en teléfono.
No asumir UUIDs frescos remotos, canal válido,40dispositivos o ausenciaBLEdelRW4.
No auth/transporteXiaomi exitoso/native/filesystem demostrado. RetornoMiFit
y normalidad reloj de ESTE segundo intento pendientes; R115 fue el primero.
Único siguiente paso inmediato: cerrar propiaapp/abrirMiFit y confirmar normalidad;
después investigar endpoint SPP por fuentesPC, sin tercerinventario/PROBE/QUERY
ni fallbackBLE/canales/clave/reset. Documentación solo; no código/build/tests
nuevos, APK o hardware desde herramientas. Nativo/firmware en reloj CERRADOS.

**R116, 2026-10-10:** registro guardado recuperado: I3/salida primer plano,
5922ms, SDP esperando UUIDs-1, BLE no iniciado/contadores0/error0, cierreBLE
no requerido y receptor llamada retornó. [Resultado y segundo intento propuesto](rw4-service-inventory.md).
Primera ejecución cancelada antes10s/antesBLE; sin respuesta aceptada hasta
cancelación. No causa foreground registrada ni compatibilidad descartada.
Normalidad reloj/MiFit ya reportada R115, sin otro intento entre reportes.
Revisado código: onPause termina/guarda; UI no publica tiempo en cada tick SDP.
Sin cambio código, nuevo APK, tests repetidos o hardware desde herramientas.
Siguiente único checkpoint: segundo inventario explícito mismo APKr114,
force-stop ambas apps para nuevo proceso/ticket, permisos/perfiles/BT actuales,
mantener pantalla abierta encendida30s sin copiar/cambiarapps; copiar al estado
terminal/botónCerrar, retornoMiFit. Si sigueI0 a30s, copiar/salir/recuperar guardado;
si I3 sin cambiar pantalla o error, reportar/no tercerintento. Popupbond cancelar.
No PROBE/QUERY/transporte automático/native/firmware. Plan de alcance/riesgo R114
aplica igual; resultado del segundo inventario pendiente.

**R115, 2026-10-10:** usuario reporta r114/API36, I0/en curso, SDP esperando,
UUIDs-1, BLE no iniciado, contadores0, error0, tiempo13ms, cierres no requeridos;
confirma procedimiento seguido, reloj normal y MiFitness sincroniza bien.
[Interpretación](rw4-service-inventory.md): snapshot inicial, no desenlace;
13ms es tiempo de última publicación, no tiempo de espera/copia del usuario.
No concluir ausencia SDP/BLE, prueba completada ni fallo de timer. Fuente revisada:
onPause/Cerrar guarda snapshot terminal; menú Informe y caché local lee último
inventario sin ticket/radio activa. Único siguiente paso manual: abrir toolkit,
Informe y caché local, copiar sección Último inventario; sin force-stopMiFit,
nuevo inventario/PROBE/QUERY, APK nuevo o cambios de permisos. Si persisteI0,
recoger aviso de registro incompleto, no reintentar. UI apertura confirmada por
reporte; radio/terminación no confirmadas. Documentación únicamente, sin build
ni acciones físicas desde herramientas. Firmware/nativo reloj CERRADOS.

**R114, 2026-10-10:** usuario dice «adelante» después de R113. [Inventario
de servicios completo](rw4-service-inventory.md) implementado y empaquetado,
sin nuevo intento físico. Activity no exportada/foreground-only y ticket exclusivo
SERVICE_INVENTORY; solicitud UUID Android + escaneo BLE LOW_POWER, ventanas
10s/10s y límite lógico20s. Cancelación en onPause/onDestroy, sin autoretry;
stopScan y retiro receptor independientes. SDP del OS no tiene cancelación propia
y puede devolver caché. Dirección registrada y nombre exacto solo en memoria;
coincidencia por nombre es débil. Informe separado solo14ints+boolean en teléfono.
Inventario no habilita socket/GATT propio/protocolo/auth/GET; gates QUERY positivos.
Todas cinco suites PC pasan, build final SUCCESSFUL2m19s/73tareas10ejecutadas,
inspector/apksigner/Dex verifican3clases. APK31411083B,
SHA0f44f91ead190e1e70b460e32fcf21bd2eebf903b382c1a164bfbebd540f3dc8,
misma firma47eeb041...577709/paquete/10permisos, versiónr114, min23/target35.
Bundle `artifacts/android-diagnostic-r114/RW4Diagnostics-r114.apk`; r106 conservado.
No APK instalado/UI/radio r114 probado. Siguiente único checkpoint manual:
actualizar propia app sobre existente sin borrar datos; force-stop MiFitness y
propiaapp; mantener permisos restaurados/perfiles actuales/BT ON; tarjetaRW4
→Inventario de servicios→Iniciar inventario; pantallaabierta20s; copiar informe,
cerrar/retornoMiFit y comunicar normalidad. No PROBE/QUERY, nuevo bond, negar
permisos otra vez ni cambiar transporte/canales. Si popup de enlace/error:
cancelar/salir y reportar, no repetir. Firmware/nativo/instalación en reloj CERRADOS.
Solo PC modificado; no dependencias nuevas. Build red requirió ejecución autorizada.
Historial inferior conserva estados anteriores.

**R113,2026-10-10:** usuario confirma NearbyMiFitOFF/ambasforce-stop/PROBEr106 y permisosrestaurados/todonormal. [Resultado](rw4-permission-isolated-probe-result.md): P00B01T01S01, cadenaD01D02D03D18D04E03D17D13, tiempos0/117/128/149/150/536/543/549, G08/cierreprevio:no. Connect386ms/close7ms; sinauth/GET/deadline; hipótesispermMiFit como solución nocumplida, no exclusión totalpila/privilegios. Nuevo filtroPC `check-mi-fitness-transport.mjs`+test pasa yse ejecutó sobre4logsprivados:12líneasBLE,0same-lineRW4,otrosmarcadores0; no transporteRW4 identificado, sin raw/secret/path/export. Fuente0.94 RW4Classic/SPP/SDP y override soloBOTH; BLEUUIDsotrosmodelos no compatRW4. No más PROBEsiguales/QUERY/otroAPKporlogging/unpair/reset/desinstalar/BLE/canales. Próximoúnicocheckpoint: evidencia servicio/endpoint actual deunidad, inventario futurorevisablecompleto antes deotraAPK/radio; aún noimplementado/automático. Sin nueva appbuild/testAndroid/hardware desdeherramientas.

**R112,2026-10-10:** usuario caminó y reporta sincronización de pasos nuevos enMiFit con llamadas/entradaOFF. Evidencia práctica de comunicación reciente por reporte, no solo datosguardados; no prueba transporte/causaE03. Mantener perfilesOFFpara compararR109 y cambiar solo permisoNearbyMiFit; no insistir activarONantes delensayo. Guía vigente: denegar/verificarNearbySoloMiFit, force-stopambas, unPROBEr10630s, copiar/cerrar, devolverNearby/MiFit y reactivar perfilesoriginalesONalterminar para recuperarfunciones. [Registro](rw4-bluetooth-profiles-result.md). Permiso/ensayoaislado no ejecutados/reportados aún; no nuevoAPK/autoHW/QUERY. R111 eshistorial supersedido por sincronizaciónreciente.

**R111,2026-10-10,corrección:** usuario aclara llamadas/entrada aún OFF; inicialmente creeMiFitno conecta, después cree sí por datos sincronizados aunque no figura conectado enBT. R110 no confirma togglesrestaurados ni conexiónactual; datos pueden ser cache. Guiar activarambosoriginales/verificarestadoConectadoenMiFit; si falla parar/avisar, sinreset/unpair. Solo tras control normal mantener planNearbydenegadoSoloMiFit/force-stop ambas/unPROBEr106/cierre/restaurarpermiso/retorno. Sin ensayo nuevo/build/código/tests; no atribuir fallo a perfiles ni notificación. Estado runtime actual deMiFit y restauración aún por comprobar.

**R110,2026-10-10:** respuesta async confirma restaurados los dos toggles y MiFitness/reloj normales tras R109. [Plan revisado](rw4-bluetooth-profiles-result.md): guiar un único PROBE r106 si usuario verifica permisoNearby denegado SOLOaMiFit; ambasappsforce-stop sinborrardatos, perfilesoriginales/BTon/QuickShare intactos; no nuevo bond; cierre/restaurarpermiso/MiFit y reporte saneado/normalidad. Permisorevocado/probe/retorno de este nuevo ensayo aún NO reportados. No nuevoAPK/código/test/hardware automático ni QUERY/retries/BLE/unpair. NotificaciónMiFit previa sigue sin probar conexión/causa. Siguientecheckpoint: resultado del ensayo aislado, no asumir resolveráSPP.

**R109,2026-10-10:** nuevo informe PROBE r106 `D01>D02>D03>D18>D04>E03>D17>D13`, tiempos0/108/112/115/115/266/272/283ms, G08/cierre previo:no, P00/B01T01S01. [Resultado y aislamiento preparado](rw4-bluetooth-profiles-result.md): connect151ms, close6ms después; noauth/GET/deadline. Toggles durante prueba no confirmados separadamente. Usuario cree reapareció MiFitness por notificación y QuickShare aparece conBT: no inferir reconexión/conflicto/causalidad. Entrada propia dirige servicio explícito a nuestra app; QuickShare usaBT, no intermediario requerido. Pregunta async de restauración/MiFit/reloj enviada, respuesta pendiente. Plan siguiente preparado: retirar temporalmente SOLO permisoNearby deMiFit, detener ambas apps, verificar permiso y restaurarlo al terminar; ninguna nueva prueba guiada hasta retorno/aislamiento verificados. Conservar APKr106/bonddatosclave/perfiles originales/QuickShare; nobuildnuevo, noautohardware/QUERY/reset/unpair. Fuentes primarias Android runtimepermissions/QuickShare y advertenciaupstreamconflicto leídas. No asumir R107normalidad cubra R109.

**R108,2026-10-10:** usuario observa llamadas/audio y dispositivo de entrada conectados/habilitados en ajustes Bluetooth, compartir contactos/historial desactivado. Confirma perfiles Android activos, no SPP ocupado ni causa G08. [Plan manual concreto](rw4-bluetooth-profiles-plan.md): detener MiFitness/Diagnostics sin borrar datos, desactivar solo ambos perfiles, comprobar desconexión; si siguen conectados/nuevo pairing, parar; de lo contrario un PROBE r106 y copiar informe/cerrar/restaurar toggles/abrirMiFit. Preferencias persistentes teléfono; reboot no reemplaza rollback. Sin build nuevo/auto hardware/QUERY/BLE/insecure/reset/unpair. Un éxito no distinguiría cuál perfil ni excluiría proceso/pila temporal como factor. Resultado de cambios y nuevo intento pendiente; no afirmar autorización automática ni ejecución por herramientas.

**R107,2026-10-09:** usuario ejecuta PROBE manual r106 y aporta informe saneado P00/B01/T01/S01, `D01>D02>D03>D18>D04>E03>D17>D13`, tiempos0/106/114/117/117/414/420/440ms, G08, cierre local aún no solicitado al error. [Resultado](rw4-bluetooth-probe-result.md): socket creado, connect falla en297ms antes de D05/auth/GET; no deadline propio30s ni clave evaluada. close retorna6ms después del error; no prueba cierre radio integral. Usuario dice MiFitness/reloj bien, con ~18 pasos más en app: diferencia conservada, causa no establecida, no declarar datos idénticos. AOSP histórico confirma origen genérico del patrón readAll, no es código HyperOS/API36 ni prueba causa; fuente Android16 y PR3693 inaccesibles. No nuevos builds/código/tests/hardware automático. No QUERY/reintento/cambiar clave/reset/unpair/BLE/insecure/canales. Siguiente único checkpoint: identificar transporte/servicio que MiFitness usa en esta unidad a partir de fuentes/metadatos existentes saneados; no otro APK solo para debug. R106 e inferiores son historial.

**R106,2026-10-09:** usuario exige consolidar diagnóstico para evitar transferencias/actualizaciones pequeñas. [Toolkit y plan concreto](android-consolidated-diagnostic.md) implementados: menú local/informe copiable actualizado, permisos/cache/tiempos, códigos Android34 guardados para min23, categorías IOException sin mensajes, formato clave sin valores, protocolo/HMAC/auth/GET, resultados saneados retenidos. PROBE abre/cierra mismo socket seguro antes del lector/protocolo, gates sin payload; QUERY conserva whitelist batería/info y termina al recibir ambos. Cancelación invalida ticket pendiente y gates; fallo pide cierre inmediato,30s/deadline monotónico/sin fallback de transporte/autoretry. Una aceptación por proceso, modo ligado al ticket. Pruebas policy/ticket/modos/cancel/trace/details/cache/Status APIguard-privacy/WriteAction pasan; Android compila/lintVital baseline/inspector/apksigner pasan. Bundle **artifacts/android-diagnostic-r106/RW4Diagnostics-r106.apk**31411032B SHA2223db7255f8e864400a58111eb1666839c5c57754952db8ce1b64149e70539c, misma firma47eeb041...577709, versión0.94.0-rw4-diagnostic-r106. Build final1m58s; revisiones PC no instaladas/entregadas. Próximo manual propuesto: actualizar una vez sin borrar datos; MiFitness detenido; tarjeta→Probar solo Bluetooth→confirmar un intento; copiar informe, cerrar/retornar MiFitness y reportar normalidad. No QUERY automático ni hardware ejecutado por herramientas; UI/radio r106 pendientes. Android puede seguir dando error genérico: el informe no promete causa definitiva. No volver a fragmentar por más etiquetas de debug; ambos modos ya en mismo APK, etapa nativa/firmware sigue cerrada. Formato de clave se consulta solo en QUERY; PROBE no accede a ella. No datos privados/firmware/WAD añadidos a Git.

**R105,2026-10-09:** usuario reporta diálogo r104 B01/T01/S01: vínculo confirmado, tipo clásico, SPP presente en caché Android. [Resultado/diseño](android-bluetooth-cache.md). Instalación/apertura/lectura local confirmadas por reporte; no captura radio ni servicio remoto actual demostrado. Classic/SPP de r101 coincide con caché, causa E03 aún desconocida/pre-auth. Próximo checkpoint diseñado: capturar categoría de error del mismo socket y cierre, idealmente prueba solo transporte sin auth/GET; API oficial BluetoothSocketException.getErrorCode desde34 (guard min23), IOException puede seguir genérica. Diseño preparado, **sin implementación/build nuevo ni tercer intento solicitado/autorizado**. Mantener r104 sin conectar; no repetir caché/emulador, reset/unpair/cambio clave/BLE/canales. Antes de prueba futura: APK concreto revisado, cierre/test límite y plan físico para revisión. No nuevas métricas/resultados de reloj nativo. Apartados anteriores son historial.

**R104,2026-10-09:** usuario pide seguir; [consulta de caché del teléfono](android-bluetooth-cache.md) implementada y APK listo. `Rw4BluetoothCache` lee solo vínculo/tipo/getUuids del RW4 registrado, sin sockets/discovery/claves/logs/persistencia de resultados. Toque de tarjeta y menú muestran diálogo local; no tickets/servicio, ACTION_CONNECT denegado en servicio. Sin nuevo intento físico. Prueba Java sintética y guards de fuente pasan; build SUCCESSFUL2m57s/73tasks; inspector/apksigner oficial/DEX pasan. Misma firma47eeb041...577709, versión0.94.0-rw4-diagnostic-r104,31394652B, SHA7e0f7db1613a0f33d4e048b21088ecbf13fb15e46a663aa584403105c1ad9828. Bundle artifacts/android-diagnostic-r104/RW4Diagnostics-r104.apk listo, r101 conservado. Siguiente manual: actualizar nuestra app sobre existente, dejar Mi Fitness funcionando, abrir/tocar tarjeta RW4, comunicar únicamente B/T/S o C del diálogo. No force-stop MiFitness, nuevo bond/clave, añadir/escanear ni pulsar conexión de versión antigua. Instalación/UI/caché r104 pendientes; no auth/GET exitosa ni nativo RW4 demostrado. Esta lectura orienta el problema; S02/S03 no prueban ausencia del servicio. Primer build bloqueado red sandbox, rerun aprobado completado. No dependencia nueva ni hardware tocado por herramientas.

**R103,2026-10-09:** segundo intento r101 reporta `D01>D02>D03>D04>E03>E08>D13`. Usuario confirma después **Mi Fitness conecta y reloj funciona normalmente**. [Resultado y diagnóstico](first-rw4-query-result.md): IOException al abrir socket RFCOMM/SPP, antes de D05/protocolo/autenticación; no rechazo de clave demostrado. E08 es límite local30s, D13 cierre local, no reboot del reloj. Coordinator RW4 ya usa BT_CLASSIC/UUID1101 por SDP; no forzar Classic como supuesto cambio ni probar BLE/canales inseguros. Causa concreta desconocida. No más intentos guiados, build nuevo, logs privados, unpair/reset o cambios de firmware. Siguiente checkpoint: preparar lectura manual de caché local Android (`getUuids`, tipo y bond), sin discovery/socket, con salida fija sin identificadores; aún propuesta, no implementada ni probada. Ausencia en caché no demuestra ausencia de servicio. Historial inferior conserva estados anteriores.

**R102,2026-10-09:** usuario confirma instalada actualización r101 suministrada. No se ha reportado todavía apertura estable ni segundo intento/auth/GET. Continuación manual del diagnóstico solicitado: MiFitness forzar detención, Bluetooth ON, abrir r101/un toque Conectar/30s, comunicar solo códigos/textos fijos, desconectar/salir/retorno MiFitness. No reset/unpair/firmware/instalación reloj ni reintentos; si pide clave de nuevo o aparecen menús distintos, detener antes de conectar. [Plan actualizado](first-rw4-query-plan.md). Fuente/manifest/cert r101 verificados R101, misma whitelist; nueva persistencia solo códigos en teléfono. Falta resultado de UI, etapa alcanzada y retorno del segundo intento.

**R101,2026-10-09:** usuario confirma MiFitness detenido antes/permisos cercanos concedidos; muestra dispositivo pero solo No conectado. No inferir clave inválida/firmware incompatible. [Nueva instrumentación](android-diagnostic-stages.md) implementada: 24códigos enum privados teléfono y etapa/cadena en tarjeta, sin claves/paquetes/excepciones; whitelist/ticket30s/autoreconnect/upload intactos. Javapolicy/attempt/trace/cola pasan. Build Android aprobado fuera sandbox por bloqueo red, SUCCESSFUL; inspector/apksigner pasan/mismo cert47eeb041...577709. r101 APK31394664B SHA61888725cda97a93f52e43cabf745c314c5d56c168c3a97fae5cca78ffb8c3a3, bundle artifacts/android-diagnostic-r101/RW4Diagnostics-r101.apk; DEX contiene clases. No r101 instalado/UI/radio probados. Siguiente: actualizar app propia con Bluetooth OFF, comprobar versión r101; después revisión de un segundo auth/GET manual30s con códigos y retorno MiFitness. No tocar reloj/firmware/nativo ni repetir r92. Registro r100 retorno normal sigue válido.

**R100,2026-10-09:** usuario retoma procedimiento guiado y reporta clave introducida/Conectar/no conectó. Después confirma Mi Fitness conecta correctamente y diagnóstico solo mostró «No conectado». [Resultado físico](first-rw4-query-result.md), fase/tiempo desconocidos; no auth/GET exitosa ni instalación reportadas. No afirmar clave inválida o incompatibilidad. Falta detención previa MiFitness/permisos cercanos. No repetir intento/reset/unpair ni solicitar secretos/logs. Lectura PC ticket/session/SPP/auth/UI/factory no demuestra causa; ningún cambio de código/build/test nuevo. Siguiente: aclarar esos dos prerrequisitos antes de proponer instrumentación o nuevo intento; instalación/nativo cerrados. R97 diferimiento es historial: ya se ejecutó la acción manual reportada, sin éxito confirmado.

**R99,2026-10-09:** usuario pide verificar watchfaces con scripts/juegos y proporcionalidad del riesgo. [Evidencia](rw4-lua-games-evidence.md): upstream RW4 TouchEvents/LVGL; autor reporta Duck Hunt Lua y Battle City RW4 como watchface. Habr897742 diferencia watchface Lua de app independiente habilitada por firmware especial; no asumir modificación para todo juego. Xiaomi documenta crash/reinicio de esfera y retirada, no brick permanente. Riesgo Lua widgets/eventos no equivale a cargar nuestro C; sandbox/os.execute2.2.86/ABI siguen sin demostrar. No ejecutar/descargar juegos, instalar mods ni conectar hardware. Prioridad futura: fuente conocida, salida/retirada y ruta stock de instalación RW4 antes de nativo; investigación auth/retorno R97 pendiente si usuario aporta PR3693. No nueva autorización física.

**R98:** usuario pregunta por simular mejor firmware. [Fidelidad](emulation-fidelity.md) documenta OpenVela configurable (control/reproducibilidad, no más fidelidad automáticamente), vendorBES2600 sin target stockRW4 demostrado y QEMU requiere modelo placa/periféricos además ISA. No encontrado emulador público M2315W1/BES2700/2.2.86 en búsqueda acotada. Mejor candidato para reducir incertidumbre nativa: procedencia OTA oficial exacta y análisis estático PC, aún sin paquete/descarga ni promesa de obtener símbolos/ABI/recovery. No instalar otro entorno grande/WSL/Docker ni ejecutar imagen stock. Consulta física R97 sigue diferida; pregunta PR3693 pendiente, no reemplazar objetivo Doom stock ni tomar pregunta como permiso de hardware.

**R97,2026-10-06:** usuario expresa preocupación sobre seguridad/recovery y elige investigar evidencia RW4 antes de hacerlo. Diferir acción física; no guiar Conectar ni clave mientras revisamos. [Informe](rw4-auth-return-research.md) recoge docs/0.81.0/familia/authcliente/closure y relato Watch5 descartado como prueba RW4. No hallado ciclo reproducible M2315W1/2.2.86→Gadgetbridge→MiFitness. PR3693/Codeberg bloqueado y mirrors/history ilegibles; pregunta async enviada para que usuario lea PR y pegue solo descripción/comentarios sin datos sensibles. Última UI: pantalla clave, no registro/auth confirmados; archivo con campo identificado privadamente sin imprimir valor. No nuevo build/test/emulador. No inferir riesgo alto/brick observado de falta de recovery; tampoco riesgo cero. Siguiente: revisar contenido PR si usuario lo aporta, actualizar evidencia y exponer conclusión antes de continuar consulta.

**UI actual:** usuario encuentra aviso «Ya vinculado» con consejo genérico de borrar vínculo. Revisión callback preparePair de r92: OK solo comprueba RW4/bond y abre AuthKeyActivity; no unlink ni conexión. Guiar Aceptar/OK para llegar a clave, conservar bond y no seguir consejo de eliminarlo. Sin auth ejecutada/reportada todavía; no recompilar para este texto heredado.

**R96:** usuario autoriza «hagámoslo, qué hago, paso a paso» tras plan/riesgos R95. Aprobación incluye descubrimiento, registro local con bond existente y entrada privada clave, un intento auth/GET batería/info30s y retorno Mi Fitness. No volver a pedirla, no reintentos ni nuevos bonds/instalaciones/nativo. Guiar manualmente por etapas, comprobar pantalla de clave y después Conectar una vez; no solicitar secretos/capturas/logs. Consulta autorizada sin resultado todavía; instalación/nativo siguen cerrados.

**R95,2026-10-06:** usuario confirma reloj ya emparejado en Ajustes Bluetooth y Mi Fitness conecta bien. Teléfono HyperOS3.0.302.0, Android16 BP2A.250605.031.A3; no versión HyperOS del reloj. [Plan físico](first-rw4-query-plan.md) completado: Nearby/SCAN+CONNECT, notificación propia opcional, sin ubicación enAPI36; clave privada por lectura manual local encryptKey/contextoRW4, sin export automático ni chat. Descubrimiento activo incluido en alcance propuesto, registro teléfono sin conectar, un toque Conectar/un intento/30s, desconexión/retorno MiFitness. Sin recovery firmware completo, solo reboot12s documentado; pedir revisión/autorización explícita antes de todo descubrimiento/auth desde nuestra app. No usuario necesita recompilar o repetir offline. Gate cerrado hasta respuesta; no inferir aprobación de datos recibidos.

**R94,2026-10-06:** usuario instaló r92 y completó prueba offline: sin permisos, lista vacía/espera/Salir/reabrir/denegar/Salir; Forzar detención desactivado, después Bluetooth restaurado. No crash reportado ni registro de reloj. Solo ciclo UI e instalación demostrados por reporte usuario, no terminación interna/captura de tráfico/autenticación. No repetir build ni prueba. Helper/bundle actualizado a hash r92 y guard sensible; [borrador físico](first-rw4-query-plan.md) preparado, no aprobado. Siguiente: mirar solo dispositivos ya vinculados en Ajustes Bluetooth del teléfono; no pulsar conectar/emparejar/desvincular. Bond Android existente y retorno Mi Fitness pendientes. Gate reloj cerrado.

**R93,2026-10-06:** usuario compiló r92. Inspector del APK nuevo pasa: versión0.94.0-rw4-diagnostic-r92,31394646bytes, SHA2561ed56b90fc7e56daf0ceff4f8eec8c799db8eff95e899ada41981c39ee783c97;10permisos, sin bindings sensibles. apksigner36 oficial exit0/Verifies, v1/v2true, mismo certificado local47eeb041...577709; warnings META-INF documentados en artifacts/research/android-diagnostic-apksigner-r92.txt. Firma válida no demuestra inocuidad ni aceptación Play Protect. Falta actualizar helper/bundle r92 (aún fijado a r87), registrar resultado de instalación/prueba offline autorizada. No conexión reloj autorizada, gate cerrado.

**R92,2026-10-06:** usuario describe aviso datos sensibles/identidad/fraude; guía Google warning-dev-guidance coincide con categoría permisos. Reinspección realr87 muestra NotificationListener declarado enabled=false+BIND_NOTIFICATION_LISTENER_SERVICE; controluses-permission10 no detectó el binding. Causa plausible, no decisión interna Google demostrada. Generador elimina declaración completa tools:node=remove y conserva package/cert/targetSDK; versión-r92. Inspector ahora rechaza bindings sensibles/SMS incluso disabled; regression test con APK-r87 real pasa(rechazado), XMLnuevo0bindings/1tombstone. Fuentes22 actualizadas/doctorhashmatch, asociaciónAPK invalidada. Falta build usuario: node tools/android-build.mjs build-diagnose 2>&1 | Tee-Object -FilePath artifacts/research/android-build-r92.txt. Después revisar nuevoAPK/firma y actualizar bundlehelper pin/hash/name-r92; no instalaroldr87. Aprobación R90 sigue offline y no pedir de nuevo; ningún bypass/ADBteléfono/desactivarProtect. Androidemulator aplazado por preferencia usuario; VelaS3Doom no equivale teléfonoAndroid niRW4. Objetivo siguiente tras resolverapp: preparar primera comunicaciónRW4, no ejecutarla automáticamente. Gate reloj cerrado.

**R91,2026-10-06:** usuario informa bloqueo de instalación por Play Protect; texto exacto/botones aún pendientes, solicitado por pregunta async. No asumir malware ni falso positivo/reputación/debug-signing como causa. APK bundle PC conserva SHA bf95f228...975fd2; esto no verifica la copia en teléfono ni garantiza seguridad. No desactivar Play Protect, cambiar firma/package para evadir detección, usar ADB sobre teléfono o insistir en instalar. La aprobación R90 sigue limitada a prueba offline, no bypass ni reloj. Guía ya exigía detenerse ante bloqueo. Fuente oficial Google2812853 distingue análisis de app desconocida, bloqueos por permisos sensibles y detección dañina; posible apelación solo si corresponde y usuario autoriza envío. Alternativa: Android Emulator oficial en PC (distinto del Vela/S3); sin descarga/instalación preparada todavía. Próximo: clasificar mensaje exacto y decidir ruta compatible; runtime Android sin resultados. Gate del reloj cerrado.

**R90:** usuario autoriza explícitamente instalación/prueba manual en teléfono según R89, con Bluetooth apagado y permisos denegados; abrir/salir/reabrir, sin registrar reloj ni introducir claves. No pedir esta aprobación otra vez. Instalación/resultados todavía no recibidos. No autorización de comunicación con reloj ni firmware. Bundle conservado como preparación R89 anterior a aprobación; no recompilar. Siguiente: guiar pasos y esperar resultado mínimo de Android/UI/crash/BTpedido. Gate del reloj cerrado.

**R89,2026-10-05:** [plan Android offline](android-offline-test.md) y bundle preparados; APK-r87 inmutable SHA bf95f228...975fd2, sin otro build. Helper tools/prepare-android-offline-test.mjs valida fuente22/APK/cert/permisos y copia APK+guía/JSON/SHA a artifacts/android-offline-test-r87, sin ADB/red/instalación. Revisión read-only64 textos del TAR: Welcome tiene Ir a app separado de Añadir dispositivo; DB propia vacía no importa bondsMiFitness; log_to_file/TRACE defaultfalse; ControlCenter.requestDeviceInfo bloqueado por proxy antes de servicio, shortcuts sin ticket. DeviceManager aún registra receiver dinámico para metadatos Bluetooth, no afirmar cero receivers globales. No APK ejecutado/instalado ni hardware. Paso propuesto: teléfono BTapagado, permisos denegados, sin claves/añadir dispositivo; abrir->Quit->reabrir->Forzar detención, luego restaurarBT. BluetoothOFF desconecta MiFitness/accesorios temporalmente, no desvincula. Aprobación de instalación manual del teléfono pendiente (solo preparación en PC autorizada); conexión del reloj no incluida. No pedir rebuild ni claves/logs completos. Resultado mínimo Androidversion/UI/crash/permisos/BTpedido. Gate físico cerrado.

**R88,2026-10-05:** segundo build usuario SUCCESS2m41s/73tasks(20executed/53uptodate); avisos deprecated/unchecked por stderr no son fallo. APK versión0.94.0-rw4-diagnostic-r87,31394778bytes SHA bf95f228b51e4ff1920f918b9c8502f0d85b9a7d8975b40e5c82fedcee975fd2. Inspector+apksigner36(exit0/v1v2/debugcertigualR86)+aapt2 pasan. Diez permisos=9previstos+signature internoAndroidX; límitesAPI30/neverForLocation correctos. Solo DeviceCommunicationService habilitado/noexportado, receivers restantes deshabilitados/jobs retirados, solo launcher exportado. Fuente22 hashesmatch; prepared.apkMatchesPreparedSources=true. Artifacts android-build-restricted.txt y apksigner/badging/inspection-r87; R86 reporte conservado. [Detalle](android-build.md). No instalar/ejecutar/Bluetooth/hardware; no runtime ni privacidad completa demostrados. Siguiente: preparar plan de prueba de arranque/cierre Android sinBluetooth antes de pedir instalación manual; revisar logs/lifecycle. No repetir build ni suites Doom. Gate cerrado.

**R87,2026-10-05:** fuentes Android restringidas preparadas,22 archivos/hashes doctor OK;59 originales revisados. Version nueva0.94.0-rw4-diagnostic-r87; APK R86 presente pero asociación invalidada. Manifiesto fuente9permisos/1servicio habilitado, jobs/receivers/integraciones anulados; merge pendiente. Ticket manual5s/destino/consumo único por proceso: tests propios concurrencia/caducidad pasan; WriteAction y parserAPK/tamper siguen pasando. Solo RW4 con bond existente; Discovery registra localmente sin crear bond/conectar, factory vuelve a verificar bond. GBDeviceService rechaza genéricas antes de start; service NOT_STICKY/CONNECT con ticket/DISCONNECT y stopSelf, sin receivers externos. No auditoría completa de logs/pantallas ni runtime. [Detalle](android-build.md). Siguiente: usuario ejecuta node tools/android-build.mjs build-diagnose 2>&1 | Tee-Object -FilePath artifacts/research/android-build-restricted.txt en PowerShell normal; luego leer artefacto y revisar nuevo APK/firma/permisos. No repetir Gradle restringido (ZipFS conocido), SDK/licencias ni suites Doom. No instalar/ADB/hardware. Gate cerrado.

**R86,2026-10-05:** build del usuario SUCCESS6m28s/73tasks; [APK/reporte](android-build.md). app-mainline-rw4diagnostic.apk31397290bytes SHA1acf1e8581bc03b21984209da54eaebe213ed049b343d66cd3eb8bf6132c8661. Package nodomain.freeyourgadget.gadgetbridge.rw4diagnostic, nombreRW4 Diagnostics, version0.94.0-rw4-diagnostic/253, min23target35/debuggablefalse. Fuentes11match; javac policy/session/BTBRWriteAction reales compilados, no runtime. Apksigner oficial36 verifica v1/v2(exit0), debugRSA2048 cert47eeb041...577709; v3/v4 no,103warningsMETA-INF/v1 no significan fallo v2. Aapt2/inspectorpropio corroboran. AGP auto instalo Platform-Tools37.0.1; sin comandosconexion/ADB en helpers. APKhereda72permisos, InternetHelper sin AndroidINTERNET, UI/otrosdevices/globalreconnect pendientes. No APK ejecutado/instalado/hardware. No repetir build exitoso ni suites Doom. Siguiente cerrar permisos/alcance/globalreconnect antes de plan fisico. Artefactos android-diagnostic-* bajo artifacts/research; helper inspect-android-diagnostic.mjs, metadata prepared.json updatedAPKtrue y refresh invalida association. Gate cerrado.

**R85,2026-10-05:** usuario sdk-install corregido termina100%; doctor ambosSDKtrue, fuentes11intactas. API37.0 revision2/Preview0, buildtools36.0.0. Build inicial falla29s GeneratedClassCompilationException; build-diagnose21s revela AccessDeniedException/ZipFS.close->toRealPath de gradle-classloaders JAR. Probe Java propio: readabletrue, canonical/nofollow denied, zipopenok/close denied. ACLheredadaAllow y attributeArchive; no ACL/JDK/bin changes. Probable restriccion de contexto, no asumir que buildusuario pase. JDK21.0.7. [Detalles](android-build.md). Pedido usuario node tools/android-build.mjs build-diagnose 2>&1 | Tee-Object -FilePath artifacts/research/android-build-user.txt; leer artifact al responder. No pedirSDK/ZIP/licencias otra vez. No builds identicos en sandbox. No APK/hardware. BuildPathProbe fuente propia y path-probe CLI disponibles. Gate cerrado.

**R84,2026-10-05:** usuario ejecuto licencias/install; fallo package android-37. Cache oficial sdkbin repository2-4 publica android-37.0 revision2/API37.0/canal0, no android-37. Script nuestro corregido a platforms;android-37.0 y doctor/preflight carpeta37.0, sin bajar compileSdk37/minor0. Licencias locales presentes; no volver a pedirlas/ZIP. Pedir solo node tools/android-build.mjs sdk-install desde terminal habitual; luego doctor/build si paquetes completos. Fuente/politica intactas, no nuevas pruebas de Doom/hardware. Detalles [build](android-build.md). Gate cerrado.

**R83,2026-10-05:** [build Android](android-build.md) preparado. ZIP Google155655386/Gradle151433392 coinciden SHA oficiales, extraidos localmente; JDK21 existente, versions pasa/sdkmanager22.0(deprecated). Source TAR extraido en build/android-diagnostic-worktree/gadgetbridge sin symlink changelog banglejs, sin segundoGit. Fuente auditada46textos, vista previa-r83 once fuentes/nueve diffs; appID suffix rw4diagnostic/firma debug propuesta, no APK. Session sincronizada monotonic30s/un intento/close, WriteAction gate en ejecucion/prewrite+clone, Activity ignorada y logs crudos/direcciones de cola eliminados. Tests politica/session y exacto WriteAction con stubs pasan. No garantia harddeadline de write iniciado ni cierre/reconnect global/privacidad completos. sdk-list fallo IO manifiestos, artifact android-sdk-list.txt; doctor plataforma37/buildtools36 ausentes. Usuario solicitado sdk-licenses y sdk-install en PowerShell normal; no repetir descargasZIP ya verificadas. build aun no intentado. CLI node tools/android-build.mjs; nunca adb/install/hardware. Gate cerrado.

**R82, 2026-10-05: variante limitada elegida.** Usuario acepta desarrollo en PC para autenticar/consultar bateria, modelo y version; no autoriza instalar/conectar. [Prototipo y pendientes](../experiments/android-diagnostic/README.md). Politica Java propia y pruebas pasan; generador produce cinco fuentes/cuatro diffs en build/android-diagnostic-preview con hashes. Omite servicios/syncTime, filtra protobuf en soporte/salida SPP, bloquea sendDataChunk, omite serial y logs sensibles identificados, propone timeout30s/sin autoreconnect. No Android compilado ni APK generado: revisar transporte crudo/Activity/colas/concurrencia/cierre global y APIs reales antes. Fuente seleccionada ampliada28 a38textos; sin ejecutar upstream. PC tiene JDK21/26; Android SDK no hallado en ruta habitual, Gradle no cacheado. Versiones declaradas por fuente no verificadas contra distribuidores. Gate fisico cerrado.

**R74, 2026-10-04:** [Auditoria stock](rw4-stock-feasibility.md), implementacion00198f1.17Git blobs verificados (10RW4Lua,3NativeApps S3,4Gadgetbridge), sin ADB/nuevosbinarios/hardware. NativeApps no tieneRW4target; relato original Habr de m0tral eleva Lua/shell a inferencia, no confirmacionfirmware. Gadgetbridge candidato con fuente, fichaexperimental/authkeylocal; mirrorGithub2024 no actualCodeberg.

**Identificacion recibida:** M2315W1, version mostrada2.2.86, usuario2026-10-04; no serial/MAC. Region/ABI/NuttX desconocidos, sin nuevas acciones fisicas.

**Telefono/app recibidos:** Android y Mi Fitness3.59.1i, literalmente. [R75 ruta y retirada](rw4-installation-route.md): reboot12s/deletionUI Xiaomi documentados, sin recovery corruption/native2.2.86.

**R76: respuesta recibida:** Mi Fitness3.59.1i solo muestra esferas online y guardadas en reloj, sin importacion local/Debug visible. Ruta directa descartada por ahora; no seguir buscando ese menu.

**R77: carpeta accesible:** usuario confirma `.device.log` y backups `.bak`; contenido no leido. Comprobador propio `tools/check-mi-fitness-auth.mjs` y prueba sintetica pasan, sin red/Bluetooth/escritura de resultados ni valores de claves en salida. Carpeta privada `tools/local/mi-fitness-logs/` creada e ignorada; `.log.*`/`.bak` tambien ignorados.

**R78: comprobacion real completada:** tras confirmacion del usuario, `node tools/check-mi-fitness-auth.mjs` devuelve `candidate-found`:4 archivos,0 backups reconocidos,1 archivo con candidatos,1 valor distinto, campos `encryptKey` y `token`. No valores/hashes/nombres de archivos/lineas en salida. Ninguna autenticacion o asociacion al dispositivo demostrada, sin red/Bluetooth/ADB ni cambios en reloj. No copiar contenido crudo a artifacts, terminal/chat o Git.

**R79: asociacion por contexto:** comprobador propio `tools/check-mi-fitness-association.mjs` probado con fixtures y ejecutado localmente. Resultado `same-line-rw4-label-only`:4archivos,5lineas con candidato,5con etiqueta RW4,0asociaciones JSON mismo objeto. Refuerza inferencia, no identifica unidad/valida autenticacion. Sin valores/MAC/serial/lineas en salida. No forzar parser ni tratar cercania como prueba.

**R80: APK inspeccionado:** [reporte](gadgetbridge-apk-review.md). Usuario descargo APK0.94.0/code253:20301941bytes, SHA38b7666166f6fd0268b598ad0b40435744833f26b8cb7b13eb724ca61894a66b. Manifiesto package correcto/SDK23-35/debuggablefalse. Inspector limitado propio verifica firma/digest v2 RSA-PKCS1/SHA512 y cert01cce931...969bc7be; test mutacion de buffers pasa, archivo intacto. Jarsigner JDK26 exit0/verified con warnings streaming/autofirma, documentados. No APK ejecutado/instalado ni logs privados leidos aqui. No afirmar apksigner completo, build reproducido o confianza de indice firmada localmente.

**R81 source recibido/auditado:** [conexion y alternativas](gadgetbridge-connection-review.md). TAR80957440bytes sin compresion aunque sufijo.gz; SHA700b2364858e6d26c4446c277d5c89ec7cba795d857d90a7a8d68533c1a69cb1. Native Windows tar inspecciona10219entradas/copia28textos regulares, sin ejecutar upstream. build.gradle0.94.0/253. RW4 usaBT_CLASSIC; onAuthSuccess envia perfil8/0, temperatura10/10, calendario12/1 incluso sync disabled y hora2/3 condicional. No conexion read-only; efectos RW4/2.2.86 no ensayados. DEBUG de auth contiene claves de sesion, no exportar logs.

**Siguiente concreto:** leer descripción/comentarios de PR3693 aportados por usuario y clasificar firmware, autenticación y retorno Mi Fitness. Investigación antes de consulta por petición R97; no seguir instrucciones físicas R96 automáticamente. No recompilar, reinstalar, desvincular ni repetir emulador.

**Ultimo resultado runtime, R73, 2026-10-04:** [Persistencia S3 emulada](doom-persistence-emulator.md). ELF/WAD instalados una vez en /data, E1M1/FIRE/EXIT antes/despues de reset sin push de assets. Lua final cancela preparacion con panel y ejecuta otro ciclo limpio. Implementacion **3ba88df**. No hardware conectado/modificado.

## Estado vigente y siguiente paso

Direccion DevOps solicitada: [plan](devops-roadmap.md), doctor/build/test/package, perfiles compatibles, CI ligera y runner emulador controlado; no hay workflow implementado/publicado aun. Mantener como prioridad investigacion stock M2315W1.

- Final: Storage365700764 activa; UIProbe365799903 instalada perfil R73 persistente, inactiva. Workers/modulo/nodos/copias/tmp ELF/WAD ausentes. Assets /data conservados; no reinstalar, stage ni cleanup historicos.
- Next checkpoint unico: investigar con fuentes primarias el camino stock especifico M2315W1 para instalar launcher/ejecutar codigo suficiente. No ELF/direcciones S3 en hardware; ABI/privilegios/RAM/recovery fisicos pendientes y gate cerrado. Nada de firmware/USB/exploit/root ni nuevas acciones fisicas autorizadas.
- No repetir suites R67-R72/80fuentesC. Persistencia no elimina limites120s/E1M1, ni prueba horas/crash/kill/corrupcion FAT/GC durante copia. Nuevos tests solo por cambios/fallos relevantes.

## Git y estado reproducible

Repo real: C:/Users/steve/Documents/Devs/Doomed/redmi-watch4-doom, master, commits locales, sin remoto. El usuario solicito quitar Doomed/.git; intento del agente rechazado por politica, pero inspeccionR74 posterior observa padre.git ausente. Solo repo hijo conserva historial; es standalone y no se atribuye retirada manual al agente. Abrir carpeta hija en VS Code. Git safe.directory NO cambia cwd: usar workdir de la carpeta hija o git -C. No se publico nada en GitHub.

Persistentes: /data/app/watchface/market/365799903/doom/doom.elf (446144bytes), doom1.wad (4196020bytes). Archivo en flash/FS no es residencia RAM. C FLAT no sandbox. Launcher prepara WAD temporal 32768bytes por Timer50ms (~8,3s), verifica size/FNV1a32 (no autenticacion), carga ELF de /data. Host SHA256 readback; EXIT espera C/unload/cache y elimina tmp, conserva /data.

C fuente LF d6fd905b95929cd857df3693db6ca9c199f197c03ff7133d73d5752a3fbb3353; ELF SHAe115971e75ec32f33e2ee63a3c2af9799b8d207f73c3779db3bb31b53cef9639 unchanged. Lua final SHA3a167aaf0598281eb57bb615df4246a6ba59ec40b80e9a6b6bf98f868b692a1a; paquete24744 SHA2d0b8e2fd3d709fd4598f8a9b2e975be27599098c28858d7c81804a2a75edd99. Refresh backup/readback, sin reset.

Artifacts ignorados: doom-storage-install-1791156103728 y authoritative doom-storage-install.json (installed); doom-persistence-latest.json (complete/passed), cancel-1791156417673 (parcial65536), run-1791156431823 worker1032 prep8273,5ms ammo50-48; reset-1791156501836 despuesEXIT/snapshot; post-reset-1791156531409 worker468 prep8225,6ms ammo50-47. Cada salida13alloc/free streams0 cleanup0; sin reboot para salir. Dos ciclos persistencia usaron Lua R73 anterior; finalSourceSupplement doom-prepare-focus-1791157330775 prueba cancelpanel y worker1131 prep8262,1ms E1M1/EXIT con Lua final. Verify SHA final doom-storage-verify-1791157364962. Final read-only doom-persistence-final-1791157623136 Storage/noC/tmp, assets conservados.

Incidencias: baseline reset por screenOFF antes de C (doom-persistent-baseline-1791156243265), no confundir reset demostracionpersistencia ni rebootexit. Primer cancel-helper fallo regex NSH pathabsoluto (doom-persistent-cancel-1791156341879), Doomworker373 arrancado; MENU/EXIT normal, corregido regex. No crashengine. Guard ownership/dedicated loopback5039/emulator-5554, nunca USB.

## Comandos vigentes

Solo lectura: node tools/doom-ui-emulator.mjs state; node tools/doom-storage-emulator.mjs verify. Instalacion ya completada; doom-storage-emulator.mjs install rechaza repetir. Seleccionar UIProbe por Ajustes y START, esperar~8,3s, MENU/EXIT; regresar Storage. No host pushes entre sesiones. Node para no alterar ExecutionPolicy.

Si cambia Lua: C/tmp ausentes y UIProbe inactiva, node tools/package-ui-probe.mjs doom, luego node tools/install-ui-probe-emulator.mjs refresh (snapshot/readback). Subcarpeta doom/ preservada. Si C retenido por cierre sin EXIT, reentrar UIProbe y dejar Timer retirarlo antes de cambiar launcher. No force unload/kill.

Test helper persistence cancel/run/post-reset requiere secuencia/record; reset aparte con snapshot/revision. Supplement test-doom-prepare-focus.mjs requiere evidencia completa+UIProbeReady. No resetear registros para forzar pruebas. Rama remove assets tiene guard/hash/snapshot pero NO validada en runtime; no ejecutada para conservar instalacion. Binarios/WAD/snapshots ignorados, sin nuevos downloads.

## Historial anterior (no son instrucciones vigentes)

R72 y anteriores debajo documentan estado previo, incluidos paths tmp y proximos checkpoints ya realizados; la seccion R73 arriba los sustituye operativamente.

**R72, 2026-10-04:** [Sesion90s a50ms](doom-stability-emulator.md) pasa:90164ms/3156tics,1580entregas totales, giro y FIRE a30/70s. Cache constante, Umem20-90s oscila263432bytes y termina+1760bytes; EXIT libera13reservas/streams, sin reboot. Diferencia global post-EXIT+666920bytes no atribuida; final tras Storage/tmp18,10MB. Siguiente: persistencia ELF/WAD en emulador; gate M2315W1 cerrado.

Implementacion **dd803c0**. `doom-stability-1791153850848/result.json`, passed=true, diez muestras/cuatro capturas/worker116. Engine90164ms/3156tics/1571produced; Lua1580submitted con buffers256frames/256timers acotados. Giro30s angle1073741824 a46137344; FIRE70s ammo50 a47; releases neutrales, HP100. Motor tracked6582961/13alloc-free/streams0/cleanup0.

C/ELF R67 y Lua/paquete R71 intactos (pins debajo), sin builds/installs ni cambio limite120s. Nuevo helper test-doom-stability-emulator.mjs valida esos inputs y guarda memoria/tmp cada10s. Umem20-90s min30850584/max31114016/ultimo30852344; cache1363384 fija. Umem antesSTART22806584/despuesEXIT23473504; no atribuir residuo666920 solo a Doom. FinalStorage+tmp retirado18098856; mezcla cierreLua y retirada4,64MB de assets tmp. No prueba horas/leak freedom.

Baseline `doom-stability-baseline-1791153720582` guard rechazo reset sin evidencia screen OFF; panel responsive, cero resets. Stage `doom-ui-stage-1791153836674`, cleanup `doom-ui-cleanup-1791154112205` WAD intacto. Final read-only `doom-stability-final-1791154142254`: Storage365700764 activa, UIProbe365799903 perfil R71 instalada; worker116/modulo/nodos/copias/ELF/WAD tmp ausentes.

**Siguiente checkpoint unico:** persistencia emulador: assets en directorio propio de /data, launcher abre/reabre tras reset limpio sin push entre sesiones. Ruta candidata /data/app/watchface/market/365799903/doom; inspeccionar espacio/mount y backup antes de escritura. Puede mantenerse ELF/C exacto: cargar ELF persistente, copiar WAD a tmp con buffer acotado para el runtime que permite ruta fija /tmp/rw4-doom1.wad, retirar copia solo al salir/streams0. Aun sin implementar/probar, no afirmar persistencia. No escribir /resource/sistema ni tocar reloj. No repetir suites R67-R72 o80fuentesC salvo fallo/cambio.

Todo lo siguiente es historial R71 y anteriores; tomar R72 como estado operativo actual.

**Historial R71, 2026-10-04:** [Timer50ms medido](doom-50ms-emulator.md).17,45entregas/s frente a4,87; giros12,67-13,55cambios visibles/s observados frente aunos5. Motor ~35tics/s, pausa400ms y EXIT limpios. Mismo C/ELF R67, Lua R71; solo emulador S3. Siguiente: una sesion de90s para observar estabilidad/memoria, gate M2315W1 cerrado.

Implementacion **ba2bc70**. Resultado `doom-perf-1791153000333`, passed=true; comparison.json conserva referencia R70 `doom-perf-1791152085442`.119frames/141callbacks/75capturas. Intervalo57,31ms media; pipeline1,57ms/P952,00/max2,40; motor221tics/6327ms. Input UI observado27,90-54,20ms (4edges), host51,37/48,80ms incluye RPC/ADB. Entrega de fuente no es flush; muestreo max80ms puede saltar frames; no claim20FPS.

Lua SHA8e347b1b0a0ea4706e50761ca3a58739fe985660585afbd6b1b8f008f54990aa, paquete21608bytes SHAced173992bf6b787abde199c8af2399f8e19b6d05d89b34e0298fad42be2f963. Timer50ms/trace_limit256; C/ELF R67 intactos. Helper measure-doom-emulator.mjs exige perfil50/200 y trazas completas, compara captura identica y agrega pausa400ms/EXIT despues de medir.

Final Storage365700764, UIProbe365799903 modo doom/perfil R71 almacenada. Cleanup `doom-ui-cleanup-1791153170789` WAD intacto; final read-only `doom-fast-final-1791153209832`, passed=true: worker88/modulo/nodos/copias/ELF/WAD tmp ausentes.13alloc/free/streams0/cleanup0/pico6582961. Baseline screen OFF respaldo/reset antes de C `doom-fast-baseline-1791152867635`; primer guard postboot encontro ADB aun no listo, connect posterior resuelve sin segundo reset. Nunca reboot para salir.

**Siguiente checkpoint unico:** sesion90s con el Timer50ms actual, snapshots espaciados de memoria/cache/tmp y salida limpia, sin ampliar limite nativo120s. Los buffers de perfil estan acotados256, asi que NO usar el helper corto que exige trazas completas para un run90s: preparar helper de estabilidad sin recompilar C ni pedir traza infinita. No repetir R67/R68/R69/R70/R71. Sesion90s no implica estabilidad de horas ni seguridad fisica; persistencia posterior, gate RW4 cerrado.

Todo lo siguiente es historial R70 y anteriores; consultar R72 al inicio para el estado operativo actual.

**Historial R70, 2026-10-04:** [Presentacion y controles medidos](doom-performance-emulator.md). Pipeline Lua/LVGL media1,48ms, intervalos205,30ms/4,87entregas/s; giros con4,57-5,08cambios visibles/s observados. C/ELF R67 intactos, instrumentacion Lua acotada; salida limpia. Siguiente: Timer200 a50ms y comparar, sin prometer20FPS. Solo emulador S3, gate M2315W1 cerrado.

Implementacion **a69b143**. Resultado `doom-perf-1791152085442`, passed=true:33frames/39callbacks perfilados,75capturas, worker88. Pipeline p951,70ms/max2,90; Timer callback media1,89ms/max3,80. Motor222tics/6343ms (~35/s),444DG callbacks distintos de FPS. Handler input0,30-0,60ms, confirmacion UI29,70-151,30ms incluye espera al Timer; host angle/key observado<=46,91/116,14ms incluye RPC/ADB/polling. No latency exacta/fotones, ni flush completion.

Lua instrumentada SHA34e6a38154f130e537f1b02150a5cb8078448a3ff9960d39467cdaddfa256f6c; paquete21472bytes SHAf5b00512904ce4d4a4eba5f7d7618230b1f4d16844e4438a6e5755520c8f3e31. C/ELF R67 intactos. Clock revisado en `doom-perf-clock-review-1791151751886`: os.clock lee ticks guest/10000, no CPU time portable; no asumir RW4.

Baseline screen OFF: backup/reset antes de stage/C `doom-perf-baseline-1791151868826`, nunca para salir. Refresh readback sin reset, sin nuevas herramientas/compilacion C. Cleanup `doom-ui-cleanup-1791152232386`; final read-only `doom-perf-final-1791152271086`, passed=true. Storage365700764 activa, UIProbe365799903 modo doom con perfil R70; worker88/modulo/nodos/copias/ELF/WAD tmp ausentes.

**Siguiente checkpoint unico:** Timer200 a50ms, aumentar buffers de traza si hace falta y ejecutar `tools/measure-doom-emulator.mjs` para comparar tasas/costos/input, con pausa/EXIT dentro del ensayo. No repetir suite R67/R68/R69 ni fuentes80C por este cambio Lua salvo fallo. La medicion corta no sustituye estabilidad/memoria/crash/persistencia ni gate fisico.

Todo lo siguiente es historial R69 y anteriores; consultar R71 al inicio para el estado operativo actual.

**Historial R69, 2026-10-04:** [Cierre sin EXIT y reentrada](doom-close-emulator.md) pasan con Doom original. Seleccionar Storage detiene el worker104 y libera13 reservas/streams; conserva modulo/copias hasta reentrada UI, que recoge todo. Sin reboot para salir ni unload host. C/Lua/ELF R67 intactos; solo emulador S3, gate M2315W1 cerrado. Siguiente: medir frames presentados, costo de copia y latencia antes de optimizar.

Implementacion R69 guardada en **bcc1829**. Resultado completo: `artifacts/emulator/doom-close-reentry-1791147966833/result.json`; cierre `doom-close-closed-1791147862451`; cleanup `doom-ui-cleanup-1791148267953`; final read-only `doom-close-final-1791148293324`, passed=true. Storage365700764 activa, UIProbe365799903 modo doom almacenada; PID104/modulo/nodos/copias/ELF/WAD tmp ausentes. Baseline screen OFF requirio un reset limpio antes de stage/C (`doom-close-baseline-1791147587283`), nunca para salir. 13alloc/free, streams0, cleanup0, pico6582961; global Umem used+240080/maxused+8148368, GImageCache used+992, causa no aislada.

Helper `tools/test-doom-close-emulator.mjs start|closed|reentry`; navegacion manual inspeccionada entre fases, exactamente un START/ningun EXIT. Pins R67 debajo intactos, sin nuevas compilaciones/instalaciones. Crash/kill y sesiones largas siguen sin garantia. No repetir R58/R62/R63/R65/R66/R67/R68/R69 salvo cambio o fallo.

Todo lo siguiente es historial R68 y anteriores; consultar R70 al inicio para el estado operativo actual.

Implementación R68 guardada en **ae255fa**. Final read-only `doom-focus-final-1791145679942` confirma Storage activa y worker/módulo/nodos/tmp ausentes.

**HISTORIAL R68,2026-10-04:** [Panel stock/STOP con FIRE down](doom-focus-emulator.md), `doom-focus-test-1791145311054`, passed=true. Nueve snapshots/siete capturas: panel con worker104 vivo congela tic86/posición/ángulo/ammo/callbacks/input; tap neutro50,45 no llega al motor. Regreso PAUSED/System panel hasta RESUME, tics96→157. FIRE held mask8/ammo50→48; NSH op2 STOP sin release, UI recoge Image/cache/worker/módulo antes de soltar. reason1/uninit0/live0/refs0/input0/keys2,13alloc-free/streams0/cleanup0/pico6582961; launcher Ready: exited y sin autoSTART con pointerdown. Sin reboot para salir ni crash.

Reutilizados C/Lua/ELF/paquete R67, pins debajo intactos; no recompile80C, no nuevos downloads/installs. Solo helper `tools/test-doom-focus-emulator.mjs`; preflight real ELF/WAD/Lua/ID/píxeles. STOP admite únicamente hasta6retries EINVAL22 por secuencia, nunca kill/unload/LVGL host. Una marca del result inicial `retirementObservedAtUtc` se guarda después de checks/capturas, no latencia aislada; helper la llama ahora `retirementChecksCompletedAtUtc` sin repetir motor por el nombre.

Baseline estaba SCREEN_STATE_OFF, ratón no despertó. Un backup/reset limpio antes de stage/C en `doom-focus-baseline-1791145112979`, ninguna salida requiere reboot. Final **Storage365700764**, UIProbe365799903 modo doom almacenada. Cleanup `doom-ui-cleanup-1791145462593`: WAD intacto, ELF/WAD tmp retirados, worker/módulo/nodos/copias ausentes. Umem used+233512/maxused+8125240/GImageCache+603664, causa no aislada; no leak/RW4RAM claim.

**Siguiente checkpoint único:** cambiar de watchface con Doom activo **sin EXIT**, verificar stop/recursos propios limpios con código/copias retenidos, volver a UIProbe para recoger caches/módulo sin reboot. R62 ya probó transporte; el motor original no ha hecho aún ese flujo. Después medir presentación/copia/latencia antes de optimizar. No repetir R58/R62/R63/R65/R66/R67/R68 salvo cambio/fallo.

R68 no demuestra foco perdido mientras una acción sigue mantenida, llamadas/notificaciones/corona, crash/kill/SMP/agotamiento/errores pthread, sesiones largas, persistencia o hardware. Gate M2315W1 cerrado. Repro: guest responsive/UIProbe doom instalada→`doom-ui-emulator.mjs stage`; abrir UIProbe/Ready sinSTART→`test-doom-focus-emulator.mjs`; volverStorage→`doom-ui-emulator.mjs cleanup`. Fuente/ELF no cambiaron. Launcher user sigue abierto, verificar ownership vigente antes de actuar; si screen OFF, reset limpio/backup antes de stage, nunca para sustituir EXIT.

Todo lo siguiente es historial R67 y anteriores; consultar R69 al inicio para el estado operativo actual.

Implementación R67 guardada en commit **a3884e8**. Estado final read-only validado en `artifacts/emulator/doom-ui-final-1791144160277`; Storage365700764/PIDs104 y408 ausentes/ningún módulo, nodo o archivo tmp propio.

**ACTUAL R67,2026-10-04:** [DOOM original en UI con controles](doom-ui-emulator.md), passed=true en `artifacts/emulator/doom-ui-test-1791143272849`. E1M1 visible320×200 en página Lua/LVGL390×450, MOVE/FIRE/MENU. Posición/ángulo cambian, munición50→47; pausa congela tic/posición/ammo/drawn y RESUME avanza.24 snapshots/ocho capturas,64000 píxeles comparados con copia RGB565,167 colores. Workers104/408 ownerUI28, init NSH88/407, stack32KiB solicitado; dos STOP reason1,13alloc/free por ciclo, streams0/cleanup0, PID ausente antes de unload. Reentrada recarga ELF/globals/posición inicial/ammo50, sin PC ni reboot entre ciclos.

Código nuevo `experiments/doom-ui/{adapter.c,transport.c,game-ui.h,main.lua}`. DG original, worker detached; ringSPSC32/epochs→edges64→DG_GetKey. Pausa vacía/entrega KEYUP+D_ProcessEvents en límite de Tick y descuenta tiempo pausado. Snapshot192/48words: primeras32R62+16engine/stats; delivered_keys son edges del adaptador, no array privado gamekeydown. No cat/read-all del control. Stream128028 =meta16+header12+128000RGB565, dos slots inmutables; Lua escribe payload128012 en dos paths fijos, cache-drop solo UI. No workerLVGL/directFB/native shared-input.

ELF446144 SHAe115971e75ec32f33e2ee63a3c2af9799b8d207f73c3779db3bb31b53cef9639; source LF combinado d6fd905b95929cd857df3693db6ca9c199f197c03ff7133d73d5752a3fbb3353; entry0x1fc61,45imports exactos guest,6993ABS32+4THM_CALL permitidos comoR66. Cache core50d8fb8911766fb0285eedd81e3965be7b923562c7a3782abd87e068c6a21c8e verificado, no recompilar80C ni repetir R58/R62/R63/R65/R66/R67 sin cambio/fallo. Lua SHAb86f0cee70c58a544a09c5069c4c4fcd260a9ebb4b0b05deb827507d9d7120d9; paquete19576 SHAec1cf33c1e236a5682684fc9b2d6d8578c5acfd8b7090935a5cd5fa689d52143.

Final **Storage365700764 activa**, UIProbe365799903 instalada modo **doom**; módulo/worker/nodos/copias/ELF/WAD tmp retirados en doom-ui-cleanup-1791143492626. WAD intacto al retirar. Panel/Ajustes normales después de EXIT inspeccionados. Refresh con backup/readback sin reset; un reset de baseline por SCREEN_STATE_OFF precedió C (doom-ui-baseline-reset-1791143049777), staging refeito después de boot/UI responsive. Ningún reboot para salir ni crash R67. Launcher original del usuario sigue identificado por guard; comprobar estado antes de acciones. Puede apagarse de nuevo tras300s: no asumir screenshot vivo ni hacer staging antes de boot.

Medidas: window2534ms/89tics/13frames produced/178callbacks; ~35tics/s y transporte~5/s, **no FPS visibles exactos**. Timer200ms, sin optimización. Pico owned6582961 (~6.28MiB), secciones793228 aparte, stack/Lua/cache/loader/libc/tmpfs excluidos. Umem used+237000/maxused+8192104 sin causa aislada, GImageCache igual; no leak/physicalRAM claim. Sesión límite120s real incluidas pausas/10000Ticks/E1M1; cooperativo, no hard watchdog. Map change sale; audio/saves/config deshabilitados. No persistencia nativa al reset, no ergonomía/corona/multitouch/MOVE+FIRE simultáneo probados.

**Siguiente checkpoint único:** panel/foco stock y stop cooperativo con FIRE mantenido **mientras ejecuta Doom original**, incluyendo neutralidad/salida sin reboot. Menú y EXIT ya pasan; R62 probó transporte, pero motor no se ensayó aún con foco stock/contacto mantenido ni cierre sin EXIT. Después medir y mejorar transporte/fluidez; no optimizar antes de medir ni pasar a hardware.

Repro exacta: `build-doom-ui.mjs`, `package-ui-probe.mjs doom`, UIProbe inactiva/módulos ausentes→`install-ui-probe-emulator.mjs refresh`; guest responsive→`doom-ui-emulator.mjs stage`; abrir UIProbe por Ajustes/capturas/Ready sinSTART→`test-doom-ui-emulator.mjs`; volverStorage→`doom-ui-emulator.mjs cleanup`. Helper host nunca unload/cache ni USB; reentrada UI requerida si módulo retenido. No fuentes/downloads/tools nuevos necesarios. ExecutionPolicy intacta, usar Node; todos los binarios/assets/logs ignorados. Gate M2315W1 cerrado: ninguna conexión/firmware/flash/exploit/root físico autorizado.

Todo lo que sigue es **historia R66 y anteriores**; pendientes antiguos de motor/UI/WAD fueron resueltos por los checkpoints posteriores. Consultar R67 arriba como estado operativo.

**Actual R66,2026-10-04:** [DOOM real ejecutado, E1M1 capturado](doom-first-frame-emulator.md), passed=true en la primera ejecución guest. doomgeneric dcb7a8d con doom1.wad R63; worker210 stack32KiB, Create/wipe completo y siguiente Tick produce320x200. Captura e1m1.png/e1m1.bgrx en doom-first-1791140202974, inspección visual escenario/arma/HUD correctos. FNV07aece36/145colores, gametic6,43callbacks incluyendo wipe/1263ms NO FPS. Quit local reason2/code0,13alloc/free,2streams open/close,2denials, pico6582961bytes/13blocks; cero recursos,join0/worker ausente/unload/tmp/WADintacto sin reboot. No UI del guest ni controles conectados, no hardware.

ELF438940 SHA f0f55f55cd72fab7052a3caaca40cbb43567ac9cf5bdcf4326280a8fa11a7539; source LF combinado a1125230f83a3bd515287967d3a3f5d366dc16ac66cfb00b1e64443b89e92dcc; entry0x1ead5.41imports guest fijados, COMMON415 asignados,6900ABS32+4THM_CALL de autorrecursión permitidos por up_relocate tipo10 inspeccionado. Memcpy/memset/strcmp ARM: conservar estado original, no forzar Thumb. Nuevas inspecciones stdlibs/math/AEABI/fwrite/attr12bytes. Pragma long_calls no elimina autorrecursión; helper valida cada call dentro de su función/.text. Raw fwrite solo exportación fija post-join, core sigue writes-blocked. No cambiar pins sin revisión; sources upstream intactas, overlay I_Quit/I_Error R65.

Repro build-doom-first.mjs [relink] y run-doom-first-emulator.mjs. Relink verifica el core50d8fb8911766fb0285eedd81e3965be7b923562c7a3782abd87e068c6a21c8e sin recompilar80C. Primeros guards Thumb-only/ABS32-only y dump ENOBUFS fallaron antes de guest; corregidos y no repetir candidatos. Límite15s cooperativo en DG y8Ticks tras Create, no hard watchdog. Join/cleanup/ioerror inciertos retienen módulo. Stats pico no incluyen secciones788032/stack/tmpfs/loader/libc. Umem usado+1392/maxused+7837320 en dos muestras, no leak/peak aislado. No repetir R58/R62/R63/R65/R66 sin cambio/fallo.

**Siguiente meta única:** frames reales en UI Lua/LVGL del emulador con controles R62 y START/EXIT. Estado watchfaces Storage/UIProbe winput anterior no modificado ni actividad revalidada. Gate M2315W1 cerrado. Estados R65 y anteriores debajo son históricos: el pendiente «ejecutar motor/primer frame» ya se completó en R66.

Implementación R66 guardada en commit **8ac74e3**. No repetir la ejecución ya aprobada salvo cambio/fallo; la captura y logs quedan en artifacts ignorados. `.ps1` parseado sin ejecutar/cambiar política, helpers Node pasan sintaxis. No descargas ni instalaciones nuevas.

**Actual R65,2026-10-04:** [runtime de recursos/salida probado y motor con shim compilado](doom-runtime-emulator.md). Ocho ciclos en worker139 pasan: retorno, quit/error, stop, OOM/overflow/free inválido y close doble rechazado. Cero reservas/streams propios después de cada ciclo; join0, worker ausente, módulo/fixture/ELF tmp retirados sin reboot. Pico137bytes corresponde al fixture, no Doom. Artefacto native-runtime-1791136344622. ELF9668bytes SHA6fe5f39f45e9dcc7ffe28d97d51acd083a1a1806ba751be41218dadde529887a; source LF combinado e7c908f177034c26037640a099db79ee14ac309f38e7d65fdccc71622dbc7840. ABI malloc/free/vsnprintf/setjmp/longjmp inspeccionada; FLAT sin sandbox. Stop externo, I_Error del motor y cierre con motor siguen pendientes.

Build80C+runtime sin sonido compila usando headers propios/overlay de I_Quit/I_Error; upstream intacto. Objeto435288 SHA0281a7dc95222408d41c3eb05cc83ae4531b899b104995bfb7537f0484bd4f3b,39imports:16contratos del shim,17biblioteca por revisar y6DG sin implementar. No entry/bindings finales,415COMMON; NO cargarlo. Eliminados imports privados Newlib y writes/exit/system directos. Runtime limita128reservas/8streams/payload≤8MiB, solo workerowner dentro del run, logs511chars. Nuevo module.ld une function sections en .text; primer candidato THM_CALL rechazado en host, ninguno fallido ejecutado. Buildshim inicialmente detectó mode_t incompatible, corregido con sys/stat mínimo propio. Umem usado+576 sin causa aislada/no leak claim. No repetir R58/R62/R63 ni R65 salvo cambio/fallo. No hay engine runtime ni hardware en R65.

**Siguiente meta única:** completar bindings revisados y DG para producir el primer frame real de Doom en el emulador, con límite de ejecución y cleanup. Repro: build-runtime.mjs y run-runtime-emulator.mjs solo si hace falta repetir; build-doom-audit.mjs shim o inspect-shim para análisis sin guest. Estado watchfaces anterior Storage/UIProbe winput no modificado ni actividad UI revalidada. Gate físico cerrado.

Los estados R64 y anteriores debajo son históricos; los pendientes de runtime/build allí se reemplazan por R65. La ABI física M2315W1 continúa sin demostrarse.

Implementación R65 guardada en commit **2b753ec**. No hay acciones manuales pendientes para reproducir el análisis local; conservar abierto el launcher del usuario para futuros experimentos nuevos. `.ps1` solo parseado, ExecutionPolicy intacta; helpers Node pasan sintaxis. Binarios/WAD/guest/logs siguen ignorados.

**Actual R64,2026-10-04:** [motor real compilado para inspección](doom-build-audit.md).181fuentes snapshot GitHub del commit dcb7a8dbc7a16ce3dda29382ac9aae9d77d21284, cada Git blob verificado; LICENSE local preservada, upstream intacto/ignorado.80C core ARM compilados sin sonido/X11. Objeto parcial425928bytes SHA30ba8ead4ca94fd69d661d774edd3a9fbd449dfe68696798ad4519c7daa56366,entry0/50imports sinresolver. No módulo apto para cargar. Newlibheaders solo compileaudit, _impure_ptr/stderr no aprobados; _ctype_/abs ausentes en guest. Memoria525351estática antesalineación+6MiBzone+256000DG=~6,75MiB antesextras. I_Quit upstream retorna, I_Error llamaexit/system; mkdir y otraswrites posibles inclusoORIGCODEoff. Siguiente shimlibc/allocator/streams/salida cooperativa y contrato pequeño nuevo, sin repetir display/input/WAD.122warnings preservados; stackframes no pico. Helper inicial fallóENOBUFS trascompile/link, inspector corregido; build final y inspect pasan. Ninguna operación guest, reset ni hardware en R64; estado R63/Storage/UIProbe permanece sin nuevas observaciones. Repro build-doom-audit.mjs [inspect], lock doom/doomgeneric-source.lock.json.

R63 debajo es histórico; preparación/auditoría de build preliminar ya completada, runtime pendiente.

**Actual R63,2026-10-04:** [WAD shareware leído desde C](native-wad-emulator.md), passed=true. Usuario descargó tar de mirror Debian PSNC; contiene solo doom1.wad. Identidad4196020/MD5/SHA1 Debian coincide; SHA256local1d7d43be501e67d927e415e0b8f3e29c3bf33075e859721816f652a526cac771. Licencia/distribución documentadas, datos ignorados. C verificó1264entradas,16recursos,8196chunks del archivo completo. WAD intacto y rw4wad/temporales retirados; Storage365700764 permanece activa, UIProbe modo winput intacta. Sin reboot, motor ni hardware. Artefacto native-wad-1791133863026. Build3672bytes SHA5f75898a47ee32b58cfa0bd0c60b983d3a22cf6222aafdeb32f43dcee9b93e37,entry0x4c1/42ABS32/nueve imports R58/BSS0. Tests host27 negativos pasan. Siguiente: auditar libc/allocator/salida y preparar build doomgeneric sin sonido para guest; no repetir ensayos pasados sin cambio/fallo.

R62 debajo es histórico; la lectura WAD pendiente allí ya fue completada por R63.

**Actual R62,2026-10-04:** [input consumido por worker C](native-worker-input-emulator.md) completado. UI28 produce máscaras mediante ring SPSC32/epochs; workers439/791 tradujeron22 key edges y produjeron frames.38 snapshots/cuatro imágenes completas pasan; HOLD TEST cancela con ratón down, overflow32 deja neutral y panel desde **y440** pausa. Regreso exige RESUME/contacto nuevo. STOP cooperativo NSH con FIRE mantenido en worker885 pasa, sin host-unload. Cierre968→Storage conserva código/copias hasta reentrada UI, que recoge todo. Final Storage365700764, UIProbe365799903 instalada modo **winput**, módulos/nodos/copias/ELF propios retirados; PIDs104/439/791/885/968 ausentes. No Doom, WAD ni hardware. Siguiente: licencia/procedencia y lectura de doom1.wad desde C.

Pins R62: C LF28175b7cc88b126ad99fe9f3a29e837787af108e6ee044cf6cee6fb142ee675a; ELF8436bytes SHA54facb91f2d27c3e1172bba174c3d2ac85a07343aa0ca2574f621a13e362f00c; entry0xf1d/79 ABS32/mismos10 imports/BSS179620. Lua090b7618d7bbca7150af4ba50aacb9443c19ce489ca48c927fda629af4c0fdb3; paquete20972 SHA3da72d93acea9b2e5171aecaef42560bfd1eb4f59bbc1548326f67230836ae8f. Snapshot128 añade12 words input; no cat/read-all. Uninit exige referencias0, requested/applied/queued0 y PID ausente. GC no LVGL/unload; helper host exige reentrada para limpiar. FLAT no sandbox; sin open/unload general, SMP, crash, límite180s o foco stock con dedo aún apoyado probados.

Artefactos R62: worker-input-test-1791131669210, worker-input-held-stop-1791131823074, worker-input-close-1791132028553, worker-input-reentry-1791132117672, worker-input-final-1791132187928. Umem usado+160928/maxused+96736, GImageCache usado+603664, causa no aislada/no leak claim. Primer runner1791131537341 esperaba panel desde y410 dentro de MOVE/PRESS_LOCK: el gesto se canceló y C siguió sano; menú/EXIT retiró worker104 sin reset. Helper corregido a y440, C/Lua intactos. Rescan volvió a Neat antes de C; no asumir Storage tras update. Un reset de instalación previo a C, ninguno para salir.

Repro: build-worker-input.mjs; package-ui-probe.mjs winput; UIProbe inactiva/módulos ausentes antes de install-ui-probe-emulator.mjs update. Confirmar boot/UI responsive y worker-input-emulator.mjs stage. Abrir UIProbe con preview/Ready revisados SIN START; test-worker-input-emulator.mjs. Desde launcher aún staged, test-worker-input-stop.mjs. Para módulo retenido, volver a UIProbe; después Storage y worker-input-emulator.mjs cleanup. No repetir ensayos pasados salvo cambio/fallo. Guards comprueban imagen/QEMU/ADB loopback y fuente/ELF remoto/ID/píxeles; no USB.

Lo siguiente es **histórico R61**, no el modo instalado actual:

Estado activo al **2026-10-04** (Bogotá). Resultado actual **R61: [frames desde worker C](native-worker-frame-emulator.md)**. Binario final:12 capturas de44800 píxeles, dos lectores simultáneos/tercero rechazado, dos START/EXIT y panel pausa/resume pasan. Workers107/277 en UI28 tras init NSH; otro worker374 termina al cambiar a Storage sin EXIT y reentrada recoge caches/módulo/copias en UI. Ensayo inicial también pasó con402/562/660; worker242 de un helper fallido alcanzó límite natural solo en ese primer candidato. Sin reboot para salir. **Final Storage365700764, UIProbe365799903 almacenada modo wframe; PIDs107/277/374 y módulo/nodos/copias/ELF propio ausentes. No Doom, WAD ni hardware.** Siguiente: controles mantenidos Lua→worker con liberación al pausar/cerrar.

R61 separa payload y Lua en experiments/native-worker-frame. Dos slots C FREE/WRITING/READY/READING; no sobrescribir mientras el lector posee bytes. Snapshot80 incluye produced/readers/blocked. Stream89612bytes con EOF por descriptor; Lua cierra antes de os.execute, copia a dos nombres tmpfs y llama cache-drop desde UI con owner comprobado en C. Finalizador no toca LVGL ni descarga; reentrada invalida caches en UI y recoge código retirado. Helper host rechaza unload de módulo R61 retenido. FLAT compartido, no sandbox; concurrencia arbitraria/SMP/crash no validados.

Pins R61 finales: ELF5740bytes SHAd6b2c68d6f74b536f8cac4086f38ca2636f9fd7e8011dbd83ebede88596f38fc; C normalizado LF37e8a66231d9b38d6aac2bc9b2b1ff6282a5fadbfd6f0b02ac771eaa97dd6fa0; BSS179312bytes. Paquete15640bytes SHA926116d3a58dad9fdfee1e6355e74c6e6985ce84cd0037215b0f13474adafa8a. Fuente/runtime/pins completos en el documento R61. Artefactos finales worker-frame-test-1791129002565, wframe-atomic-close-1791129131313, wframe-atomic-reentry-1791129189170 y wframe-atomic-final-1791129242309. Umem usado+180640 y maxused+953112 en dos muestras; no causa aislada, leak claim ni presupuesto físico. Metadatos sequence/cycle ahora atómicos: revisión corrigió carrera UI write/NSH read antes del ensayo final. Un reset adicional de guest limpio precedió ese ensayo por SCREEN_STATE_OFF, jamás para salir de C.

Fallos R61 preservados: ELF tmp desapareció tras staging cercano a reset (causa no aislada); parser Lua19/20 words falló antes de worker; resume asíncrono dio falso fallo; helper trató EAGAIN como error. Corregidos preflight remoto, parser20, polling de estado VM y retry acotado con handles cerrados. Update inicial ejercitó reparación del derivado añadida en R60. Nuevo refresh con backup/readback pasó sin reset, solo UIProbe inactiva y módulos ausentes. Stage **después de boot completo/UI responsive**, no del ack de reset. No repetir tests ya pasados salvo cambio o fallo pendiente.

Histórico R60: [START/EXIT con worker C](native-launcher-emulator.md). Sus pins/artefactos y limitaciones se mantienen como evidencia anterior; no describen el modo actualmente instalado.

Histórico R54: op6 invalida cache del slot0/1 y avanza fase; op7 invalida ambos después de borrar Image durante EXIT. Imports lv_image_cache_drop y lv_image_header_cache_drop ligados al guest exacto. **Op6/op7 solo desde nuestra watchface en contexto UI; nunca CLI/NSH, worker ni uninit.** file_write llama síncronamente al driver; no se midió thread ID. Un Timer Lua por VM, periodo200 ms, máximo300 frames por START, pausa/resume/EXIT; timer __gc compilado revisado. Slots /tmp/rw4-loop-frame-0.bin y -1.bin,89612bytes cada uno. Imagen x35y205 320×140; no punteros de módulo retenidos por LVGL ni framebuffer global. Guard marca closing antes de descargar; callbacks comprueban is_running. Finalizador propio no llama LVGL. Reproducción del checkpoint histórico requiere `package-ui-probe.mjs loop`, no bridge; `test-frame-loop-emulator.mjs` comienza desde launcher SIN START previo.

Evidencia: frame-loop-1791075123314,18 observaciones y ambas fases verificadas sobre44800píxeles/captura con tolerancia2. Panel state seq45 estable, límite300 seq305 estable. ~4,92 actualizaciones de fuente/s, NO FPS del motor. Lua post-GC72,405KiB desde frame50 hasta300 y reentrada; GImageCache usado1.900.024 constante tras panel. Umem usado muestreado estable con variación; maxused23.529.596→23.663.676 aumentó134080bytes sin causa aislada. No pico acotado ni fugas prolongadas descartadas. Regresión CLI stream/busy/pausa y cierre normal/error pasan con C nuevo.

Histórico R53: primer stream con lector único/estado global falló al probar otro lector y os.execute con handle abierto; se observó panic y reinicio guest. Artefactos retenidos, causa exacta del panic no aislada. Primer ajuste per-descriptor aún fallaba la expectativa del shell; versión final permite aperturas múltiples y guarda cursor/fase en file.f_priv. DWARF exacto: file32bytes, f_priv20; nunca dereferenciar cookie numérico. Fuente NuttX de dup reabre drivers, referencia para interpretar herencia al crear NSH. Candidatos fallidos fuera de pins. ABI/símbolos solo guest exacto, FLAT no sandbox.

Final R54: Storage365700764, Lua cerrado, módulo/ambos nodos y temporales propios ausentes; /tmp solo temporary.db. UIProbe365799903 permanece instalada en modo loop. Preparar ELF después de reset/cleanup. C3992bytes SHA f345f4c2e2ec7a6811dad0f66e077dc65b397271aa8291da4b1fdd2f1851a0b6; source LF e04c6d1ad8fa4e680113f71e4fb0a8c4246884dc98e7a4026e09ebb313406a27. Watchface21928bytes SHA f1b26fc16722eed1c9aa8b2c3bbab7a97559c7710a177ea5c65e5de7f9ab84d1. Cierre normal sin EXIT en frame-loop-close; regressiones native-frame-1791074808268 y lua-bridge-close-{normal-1791074813034,error-1791074817541}. Commit implementación71836d9. Capturas/logs ignorados. Revisar cada pantalla en Settings; no navegación ciega.

**Checkpoint anterior R55:** UIProbe365799903 instalada en modo controls, no loop. C5212bytes SHA ec7b6d5d1eab951a27423607a82ef8801778c9ccc6dfd515a2c50a4891e0a844; source LF40a18e07975dd0c57b898e37a08c1ae9eddfc6cdbdddfbf97a6412a3de208078. Watchface24364bytes SHA224900da6086fe578d8dafd42b83feda768bbe24c11226d51d36b7e8d1e11597. Paquete/control/contrato en native-controls-emulator.md. Un control anterior cancelaba FIRE al perder foco: corregido con contact==kind; intento fallido ui-keys-1791079130203, final ui-keys-1791079378297 pasa26 snapshots. HOLD TEST pausa con contacto mantenido, no prueba foco stock mantenido. Panel seq183 estable y regreso pausado; RESUME seq193 neutral. Dos EXIT y tercer START→Storage sin EXIT limpian; final Storage, C/nodos/temporales propios ausentes. Artefactos controls-system-panel-close. Cola CLI, stream y cierre normal/error con FIRE mantenido pasan. Commit implementación adbf567.

**Checkpoint anterior R56:** módulo separado experiments/native-time/time-probe.c; bridge R55 intacto. ABI exacto timespec16,tv_sec int64,tv_nsec int32 offset8; clock_gettime1 usa contador, no hora calendario. Imports clock_gettime0x606b65,clock_nanosleep0x656609,nxsched_gettid0x606999,printf0xfa2d25. Time ELF2228bytes SHA4cceedf220a4df9133b89fc8f29db45a6cf9d22fe54efe31b30d1810b934012d,source LF1380bc88db44387cd5517a7ae7c5fca5429b7182810fdb4a36ed1e6eeab95bcd. inspect-time/build-time/run-time-emulator.mjs. Final native-time-1791081427770 pasa257 lecturas/19 waits; ps identifica mismo PID sh -c insmod Waiting Signal antes y después de captura panel; píxeles Storage idénticos al terminar. C/ELF retirados sin reboot para salir. Ensayos fallidos de helpers/screen OFF documentados; reset único del guest limpio para baseline. Helper ahora preflight valida UI activa, no se fía de captura congelada. Normal+AOD pueden tener in_use1; exigir type1 Storage. UIProbe almacenada sigue modo controls. Esperas1ms finales5,3–15ms; no prometer precisión1ms ni dormir desde UI. Sin prueba de interrupciones ni mutación de hora.

**Checkpoint anterior R57:** experiments/native-fs/fs-probe.c, ELF3680 bytes SHA872950b90470b8b6a3f6d56087dcf4bfcfc11cfbdccbc15750030bdd8175a3fa; source LFfde5747ed5edb6c944d9d26df0c539588c5495a8954108168ba8c7a49071337c. ABI off_t signed64/size_t32/O_RDONLY1,35 ABS32 y6 imports contrastados. inspect-fs/build-fs/run-fs-emulator.mjs. Primer runtime native-fs-1791082444827 pasa2049 chunks,41 ventanas y4 errores, SET/CUR/END, seek2^32+7 sin leer allí, posiciones independientes/reopen. Fixture SHA a2db28e8d2e36e24f7b2d04e31bfbce38659094951bafed5834f80cfbebaa65f intacto; module rw4fs y dos tmp propios retirados sin reboot. No UI activa ensayada en R57, no /data/persistencia/WAD/stdio. Umem used+224/maxused+1014848 en dos muestras, causa no aislada/no leak claim. UIProbe almacenada controls/Storage previamente activo. Ver native-fs-emulator.md.

**Checkpoint anterior R58:** experiments/native-stdio/stdio-probe.c; FILE opaco, long32 para fseek/ftell, size_t32, buffer128. ELF4668 bytes SHAe78421f6950558a66c51bd4d05aafc4e78c7915bc5762780c71ed7afc504606b, source LFb873aa0cdb429aa0ca867a42236141599b81b53cb9a07a930c9577d33736b62e; entry0x605,51 ABS32,10 imports permitidos. inspect-stdio/build-stdio/run-stdio-emulator.mjs. Primer runtime native-stdio-1791083260165 pasa; EOF1 tras fseek0 aunque reread13 funciona, clearerr poneEOF0/error0/position13. Longitud1048613 restaura posición13 buffered y lee19;41 ventanas, size4 retorna9 elementos de37bytes, size3 retorna13, erroresENOENT/EINVAL, streams790/5 y3reopen. Fixture mismo SHA R57 intacto; rw4stdio y tmp propios retirados sin reboot. No UI activa, WAD ni /data en este ensayo. Umem used+224/maxused+1720, nused/nfree iguales, causa no aislada/no leak claim. Fuentes doomgeneric d_main/d_loop muestran TryRunTics con I_Sleep: no llamarlo desde Timer UI. Ver native-stdio-emulator.md.

**Checkpoint anterior R59:** experiments/native-task/task-probe.c, signed32 pthread_t, attrNULL, trampoline guest permite retornar worker, timespec16 y module_info16. Atomics32 release/acquire con DMB, BSS36. ELF3288 bytes SHA0a6065fbb3588716ce2093285db69cb2b794d84fab34b8c977ad8bca0639a6f3; source LFb69f308bb56cabd4fba03d4634dc1f5b605d3dacfd57c74b44fc9a3d822d5fb6. inspect-task/build-task/run-task-emulator.mjs. Final native-task-1791084264858 pasa: owner54, workers55/75/82, pasos38/3/6, stop/natural/stop, join61/124/47ms, cookies34570001/12/21. Busy uninit -16 probado con llamada directa, no rmmod concurrente. Ps pthread55 Waiting Signal antes/después panel, stack4072 used592 dos muestras; no pico ni budget Doom. Final PIDs ausentes/unload/tmp retirados, Storage pixels iguales, sin reboot para salir. Preflight1791084176550 screen OFF antes de push/C; un reset de guest limpio con backup, registrotask-baseline-reset.json. Helper pthread minúscula corregido antes de payload. No worker post-init, UI create/join, fallo join, kill, WAD o RW4 probados.

**Siguiente meta única:** mostrar en LVGL un frame RGB565 producido por el worker C, con buffers/cleanup seguros. Input concurrente y WAD legal pendientes; gate físico cerrado.

Implementación R56 guardada en commit3d2660a; build/run/ABI y documentación en native-time-emulator.md. Reproducción final del runner mueve la copia tmpfs después del preflight activo; cambio de orden sin cambio al ELF probado.

Implementación R57 guardada en commit0f62e6e. Reproducción con inspect-fs/build-fs/run-fs-emulator.mjs; source/ELF fijados y probados, salida passed=true. No repetir runtime salvo cambios/fallos pendientes. Stdio completado después en R58.

Implementación R58 guardada en commitbe75f7c. Reproducción con inspect-stdio/build-stdio/run-stdio-emulator.mjs, resultado passed=true con seekClearsEof=false documentado. Lifecycle desde NSH completado después en R59; launcher pendiente. No repetir pruebas aprobadas sin cambios/fallos que lo justifiquen.

Implementación R59 guardada en commitf52ac98. Reproducción inspect-task/build-task/run-task-emulator.mjs; runtime pasa tres ciclos y panel activo. Después se reforzó el assertion de retorno de píxeles, respaldado por el resultado restoredPixels=true existente, sin repetir C. Source/ELF probados intactos. Siguiente START/EXIT con worker desde launcher, no Doom/WAD ni hardware.

Lifecycle conservado: guard __gc global, handles close, pausa/resume, EXIT y cierre al cambiar watchface. C/nodos retirados y archivos propios eliminados. /dev/rw4bridge: read32 o64 snapshot SIN EOF; read8 consume una tecla y devuelve0 si cola vacía. Nunca cat/read-all; no competir con consumidor UI. Crashes/panic/kill forzado no garantizan finalizador. Reloj monotónico C probado por separado; todavía no implementa DG_GetTicksMs/DG_SleepMs ni scheduling del motor. Persistencia C y WAD pendientes. Ergonomía y foco stock mantenido no demostrados.

- Nunca se conectó el reloj físico M2315W1. Gate físico cerrado; sin flash, exploits, mods APK ni DOOM/WAD. Hello C propio validado únicamente en el emulador.
- Guest Xiaomi Watch S3 / NuttX 0.0.0, revisión 9aec7d0ff1; pantalla configurada 390×450. No emulación exacta RW4/BES.
- ADB shell funciona por emulator-5554, servidor dedicado 5039. NAT 2512 está offline. Helpers comprueban puertos loopback/PID/ruta de QEMU y excluyen USB.
- Launcher actual fue iniciado por el usuario (PID inicial 27964). QEMU sobrevivió a resets por gRPC, incluido el baseline display; comprobar ownership vigente antes de actuar. La terminal del usuario se mantiene abierta.
- TouchEvents original empaquetado sin modificar sus seis fuentes/assets; compiler EasyFace original v4.23 revisado por hash y metadata/IL. Se ejecutó sin su ADB: transferencia automática omitida.
- Instalación propia 365799901 en /data/app/watchface/market. Backup de data image pausado y caché previo, readback SHA256 idéntico. Sin sobrescribir stock.
- En TouchEvents original: render, touch RELEASED, navegación stock, cierre Lua al seleccionar Storage y reentrada tras reset sin reinstalar demostrados. Ese ejemplo no tiene botón de salida propio. UIProbe posterior sí valida coordenadas absolutas y EXIT; gestos exhaustivos y fugas aún pendientes.
- Última watchface activa: Storage365700764. TouchEvents365799901 y UIProbe365799903 siguen almacenados. GoBack por teclado no fue un exit validado; swipe horizontal desde borde izquierdo sí volvió de Sound a Settings.
- Probe anterior de padres LVGL cerró QEMU con Bad ram pointer. Retirado, logs archivados; no repetir. No llama load_scr/exec-direcciones para explorar.
- Repositorio Git guarda documentación y herramientas propias. ZIPs, firmware, compiler, assets y logs permanecen ignorados. No publicar esos archivos.

## R60: reproducir

Checkpoint histórico. Para el modo actualmente almacenado usar R61:

```powershell
node tools/build-worker-frame.mjs
node tools/package-ui-probe.mjs wframe
# Storage activa y módulos propios ausentes antes de actualizar.
node tools/install-ui-probe-emulator.mjs update
# Esperar boot completo y comprobar UI responsive antes de stage.
node tools/worker-frame-emulator.mjs stage
# Abrir UIProbe y revisar Ready, SIN START previo.
node tools/test-worker-frame-emulator.mjs
# Tras cleanup de UI y seleccionar Storage:
node tools/worker-frame-emulator.mjs cleanup
```

`refresh` exige derivado propio existente y evita reset; ver condiciones R61. No hacer cleanup host si queda módulo: volver a UIProbe y dejar que su Timer retire caches/código primero.

Ver native-launcher-emulator.md. inspect-launcher.mjs, build-launcher.mjs, package-ui-probe.mjs worker; actualizar solo con Storage y módulos propios ausentes. stage después del reset; test-launcher-emulator.mjs empieza en Ready sin START. launcher-emulator.mjs state|cleanup rechaza tareas vivas.

Artefactos finales: native-launcher-1791086511822; launcher-close-1791086602592; launcher-reentry-1791086646164; launcher-final-1791086773782. ELF3788 SHA72a7f070468f6d2670de52079e57fd144feb0e6667583ffd2f23e0023f4edba9; source LF11e15ce8edc14fa0bf6b7073ea741df19097e03fd169f4bf5beb8498bc1e90a9. Watchface12660 SHA499d2d58570724f7a70c1af6ac61c4367bd00d92d88a3d5ad63bed70e2d86f6c. Cambio corto de Lua dejó cola antigua: backup del derivado, remove/push propio y readback exacto corrigieron sesión. Installer actualizado pero su nueva rama completa sigue sin runtime de reinstalación; la reparación manual equivalente sí pasó. No repetir START/EXIT salvo cambio/fallo pendiente.

## Próxima meta

R62 completó consumo de controles mantenidos en worker C y su cancelación cooperativa. Siguiente: verificar procedencia/licencia del WAD shareware y comprobar su lectura desde C, antes del motor real. No incluir WAD ni compilar Doom todavía; hardware fuera de alcance.

Preferencia del usuario registrada en [controls.md](controls.md): controles cómodos, táctiles inicialmente, sin asignar avanzar a pulsar la corona. Ahora consumidos por worker en R62, ergonomía pendiente; un dedo, zonas grandes, diagonal para avanzar+girar, menú con salida visible. Combatir mientras se mueve sigue siendo una limitación. No foco stock con dedo aún apoyado demostrado; HOLD TEST y STOP son pruebas distintas.

## Experimentos anteriores

UIProbe original, solo Lua: experiments/lua-ui/main.lua, launcher START/página/EXIT. Desactivar eventos/gestos no bastó (commit5ed95ec reproduce widgets stock); también se desactivó SCROLL_CHAIN_HOR/VER en objetos propios durante juego. Drags centrales4direcciones y hold no mueven home. Borde inferior aún abre panel; pageOnPause/pageOnResume confirmados con callbacks propios. Tap50,45 en panel no llegó a página. Dos EXIT/reentrada, luego Storage y Lua cerrado, sin reboot para salir. Lua5.4 y type(package.loadlib)=function dentro de watchface; en esa prueba loadlib NO invocado. No native worker/timers/canvas C. El puente posterior está descrito arriba.

Build final12168bytes SHA4a61184a1e46aeac951d5b74ad5c62f46120142cb58263acbfca79482fe43fc5; instalado3988c7741e4560bda4eadea22942596ea39999cc2fb7efa0780447860915400e. Logs ui-probe-exercise-1791058256861. tools/package-ui-probe.mjs y install-ui-probe-emulator.mjs; update verifica ID propio inactivo/recurso anterior, copia y readback antes de reset. tools/exercise-ui-probe.mjs exige página propia y marcadores PNG, pero capturas/logs requieren revisión.

Incidente PC: navegación automática tras reset activó Silent sin cargar UIProbe; restaurado OFF con captura y log set mute mode0. No repetir navegación multi-page sin capturas por paso; no asumir estado/tiempo de transición. Recursos/backup en artifacts/emulator/watchface-365799903 y emulator/local/backups. Los bordes globales requieren pausa del futuro C, no prometer exclusividad total.

Touch C: experiments/native-touch/observer.c abrió /dev/input0 read-only/nonblocking sin ioctl/grab; 36 muestras absolutas, tap60,90 y drag145,225. TouchEvents y panel stock respondieron durante la lectura; close=0, rmmod y tap posterior sin reboot. Logs artifacts/emulator/native-touch-1791048828975. Reset previo únicamente para baseline (UI estaba OFF). C imprime logs, no crea widgets. Flags DOWN repetidos en drag sintético: conservar estado. Build/run en tools/build-touch.mjs y run-touch-emulator.mjs; SHA ELF57a649bfcac60d98ed1120197d69ca19a2c26a98ad2c59ffd820eb9b055b8d54.

Display: consultas /dev/fb0 desde C confirman 390×450 RGB565, stride780, virtual390×900, memoria702000. Patrón temporal respalda ambos buffers en RAM, usa FBIOPAN_DISPLAY, restaura/free/close y luego rmmod. Capturas idénticas antes/después; en prueba activa touch cambia label y panel stock abre sin reboot. Al terminar esa prueba quedó TouchEvents; tras la sesión UIProbe quedó Storage.

Primer intento de input fue inconcluso: el guest estaba OFF desde 15:48:36 por inactividad, antes del patrón. Se reseteó solo el guest para baseline; el segundo patrón devolvió input sin otro reset. Key Power no despertó y no quedó como comando soportado. LVGL9/extension, CONFIG_LV_USE_OS=0, libuv: no llamar widgets desde NSH sin resolver contexto. No afirmar exclusividad del framebuffer ni FPS/RAM pico.

Avance: [hello C](hello-native-emulator.md). Arm 14.3 ZIP/checksum revisados, extracción local; build reproducible en este PC mediante tools/build-hello.mjs. Guest compilado con GCC 11.3.1, Cortex-A7/Thumb/hard-float. Import puts falla con error 2; enlace al símbolo del ELF exacto funciona. tools/run-hello-emulator.mjs bound carga desde /tmp, observa mensaje/lsmod, rmmod y elimina archivo. Dos ciclos, shell y captura TouchEvents posteriores correctos. Sin persistencia nativa, medición de RAM pico ni compatibilidad física demostradas.

Nunca usar direcciones de otros firmwares S3/Band10Pro de MiWatchNativeApps. El hello deriva puts del ELF guest identificado por SHA256 y conserva su bit Thumb; build/carga rechazan otra imagen. OpenVela actual difiere del guest; NuttX 12.3 es referencia histórica. Display con callbacks/LVGL necesitará uninitializer real antes de descarga.

## Comandos útiles

Desde C:\Users\steve\Documents\Devs\Doomed\redmi-watch4-doom:

```powershell
node tools/emulator-adb.mjs connect
node tools/emulator-screenshot.mjs current
node tools/build-hello.mjs
node tools/run-hello-emulator.mjs bound
node tools/build-display.mjs pattern
node tools/run-display-emulator.mjs pattern
node tools/build-touch.mjs
node tools/run-touch-emulator.mjs
node tools/build-lua-bridge.mjs
node tools/package-ui-probe.mjs loop
# Si ya existe UIProbe: seleccionar primero Storage antes de actualizar.
node tools/install-ui-probe-emulator.mjs update
# Después de boot/reset, preparar el payload temporal:
node tools/stage-lua-bridge.mjs stage
# Pruebas de cierre por consola, estando UIProbe inactiva:
node tools/test-lua-bridge-close.mjs normal
node tools/test-lua-bridge-close.mjs error
node tools/test-native-frame.mjs
# Seleccionar UIProbe y dejar en launcher, SIN START previo:
node tools/test-frame-loop-emulator.mjs
node tools/lua-bridge-state.mjs
# Tras el ensayo, probar otro START→Storage sin EXIT; después:
node tools/stage-lua-bridge.mjs cleanup
```

Si el emulador está cerrado, el usuario normal puede arrancarlo con tools/emulator-host.mjs start desde su PowerShell y dejarla abierta. No abrir una segunda instancia sobre el mismo disco. Antes de descartar un marker antiguo, comprobar PID/QEMU y salida registrada.

Build/install TouchEvents ya realizados: no repetir scripts que rechazan directorios existentes. Restaurar data exige cerrar y verificar que QEMU dejó de usar la imagen; no se necesitó ni se probó restauración. Backups bajo emulator/local/backups/, logs/capturas bajo artifacts/emulator/.

La terminal restringida no accede a GitHub para descargas; el usuario descargó ambos ZIP originales. Browser/conector GitHub permiten investigación. ExecutionPolicy bloquea .ps1; se usaron herramientas Node/PowerShell inline sin cambiarla.

En futuras pausas, guardar únicamente una nota breve con el siguiente paso. No iniciar verificaciones ni ampliar documentación por motivo de pausa.
