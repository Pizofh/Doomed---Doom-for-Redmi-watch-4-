# R384: Doom II completo, candidato local privado

Pendiente de aprobación específica para el reloj. La indicación «dale el 2»
autoriza preparar el port; no sustituye la revisión de cada payload físico
exigida inicialmente por el usuario. Todos los gates permanecen cerrados.

## Alcance

DoomII, ID365220006, módulo rw4doomii384. Preview: marco ROJO y DOS BARRAS
VERTICALES. Paquete autónomo: su Lua, ELF, imágenes y Doom II completo
comprimido. No depende de DoomLauncher ni de DoomPacked. Sin sobrescribir
otros IDs, SET, borrados desde PC, reintentos ni reanudación automática.

El ZIP aportado por el usuario contiene DOOM2.WAD v1.9,14604584B,
SHA25610d67824b11025ddd9198e8cfc87ca335ee6e2d3e63af4180fa9b8a471893255,
2919lumps/MAP01–MAP32. Compresión sin pérdida a6531369B/223páginas,
SHA25615db36b4806b99138ed4c2d1fd31b7b594470a778f52e51a760be9c8397a7ece.
El WAD no se altera ni se expande entero en flash o RAM. Datos/paquete privados
e ignorados por Git; nunca incluir en publicación.

Paquete final `build/doom2-r384/package/DoomII-id-only.face`:7221744B,
SHA256483dcce2620f99839f930881c5024f1b0c67885e27a36cd1b1a26e5d6864f5a1.
77recursos. Lua30160B SHA256f4731caa45feb2c7bf502956022bfab2de30a2a7273d3671ae98d32be83d4995.

Mismo render directo, imagen grande, controles de un dedo, zona3MiB y lector
de dos páginas. No afirmar multitáctil. Partidas de DoomII en dos bancos dentro
de su propio ID y con CRC de IWAD distinto; no importar partidas DoomI.
Slots192KiB/MAP01–32, menú original de DoomII sin selector de episodios.

Todos los107efectos caben: promediado de pares PCM y mitad de frecuencia de
muestra en caché (5512/11025Hz); conserva duración aproximadamente, reduce
fidelidad. WAD original intacto.620164B útiles en caché640KiB, frente672KiB
de Ultimate. Sin aumento del presupuesto para audio. Silencio inicial16bloques
~372ms y alimentación continua cuando no hay efectos para evitar inanición
del pipe; mayor uso del audio durante el juego. Política candidata, no prueba
de altavoz listo ni de sonido inicial corregido. Música MIDI sigue deshabilitada.

ELF físico630004B SHA256b800ffa5a1880fdeb8a3839bd738eca2ba15d2898dbd6315632902c6087dc575.
SeccionesALLOC2227500B frente2259640B R378:32140B menos. Se conservan guardas
MinFree7366211/MinLargest4194320; no rebajarlas si rechaza. Sigue panel diferido.
Esto no garantiza RAM/FPS de todas las situaciones del reloj.

## Cierre pendiente de hardware

R383 arrancó y funcionaron controles; usuario confirmó ERROR después de SALIR,
antes de cambiar de esfera. No dio códigos/CLOSED. No probado guardar/cargar.
No inventar causa ni afirmar corregido. No reabrir la prueba para pedir datos.

R384 separa contadores de arranque2250callbacks (~90s), parada500 (~20s) y
espera de audio500 (~20s). Timers cooperativos, no garantía de plazo. Oculta
botones al iniciar STOPPING/RECOVERING. Etapas GATE80detach/81stop/82audio/
83join/84unload y CODE709audio_timeout, además de diagnósticos R383.
Nunca forzar join, rmmod ni cerrar por éxito un audio retenido. Un timeout
retiene el módulo y exige reinicio normal antes de otra prueba.

## Validación

Los32mapas arrancaron, guardaron, cargaron y finalizaron con join/unload en S3.
Máximo guardado81378B; pico dinámico observado3484597B. Todos con620164B
de efectos, erroraudio0 y allocated==freed. No es una partida completa de cada
mapa ni medida de rendimiento en RW4. Gráficos/audio modelados.

Dos ciclos reales desde título/NEWGAME/MAP01, spawn original contrastado con
THINGS, movimiento/retroceso/giro/FIRE/USAR, menú, pausa, guardar/cargar,
carga desde título, joins/unload: aprobados. AudioPCM no silencioso, error0.
24casos de Lua/UI exactos aprobados: CRC/RAM/identidad, carga, dos ciclos,
fallos inmediatos, esperas separadas, cierre de audio lento310callbacks que
se recupera, audio retenido500callbacks que da709 SIN unload forzado. Solo
6widgets antes del arranque y30de diagnóstico diferidos. Native/files mockeados.
Prepare/close de audio bloqueados con hilos reales en S3: imagen retirada,
juego unido y unload rechazado hasta liberación explícita del servicio falso.
Siete escenarios deterministas de startup pasan: primer efecto conservado
tras apertura tardía,16bloques de cebado, alimentación silenciosa de cola vacía,
fallos de apertura/escritura/cierre, pausa y stop. Un fallo inicial de la propia
prueba esperaba el número de writes del antiguo worker que dormía sin escribir;
ajustado a los writes silenciosos reales y repetido. Sin cambios al motor.

Paquete77recursos exactos;6tamper,3534partes de envío íntegro mediante C#IPC
y receptor sintético, cinco fallos de transporte, seis retry/resume rechazados,
journalaislado/gatecerrado/CLIprepare. RegresiónR383paquete y shared23casos
pasan. Temporales de pruebas y WAD del guest retirados, ningún módulo retenido.
Todo local: no radio, escritura al reloj ni journal físico R384 creado.

## Espacio y ensayo propuesto

Cuota conjunta de esferas market:15MiB (R377). DoomLauncher4827044B+
DoomPacked6165808B+este paquete7221744B=18214596B supera la cuota incluso sin otras caras.
No intentar ese catálogo esperando que quepa. Proponer al usuario retirar el
DoomLauncher antiguo si desea conservar DoomI completo (DoomPacked); DoomII
y DoomI completo son autónomos. Confirmar elección/liberación antes del envío;
no borrar nada automáticamente. Conservar la esfera habitual y partidas elegidas.
Sin DoomLauncher, ambos juegos completos suman13387552B, dejando2341088B
de la cuota para otras esferas. No equivale a una medición del espacio restante.

CLI `node tools/pc-doom2-r384.mjs prepare|install`; nuevo pin, gate
PHYSICAL_DOOM2_R384_REVIEWEDfalse y journaldoom2-r384. Solo tras consentimiento
específico abrir general+DOOM2JS/C#Retail; build y assertRetailNativeDispatchReady
con targetvacío→InvalidTarget antes de privados/radio. UNA ejecución install;
cerrar gates y rebuild ante cualquier resultado. Conservar estado del journal,
sin retry/resume. No abrir gates C#Large/Static ni otros payloads. Catálogo debe
carecer de365220006; modeloFWpinned. No exige carrier, ni SET ni autostart.

Tras aprobación específica: UNA instalación inactiva y DOS arranques manuales
de hasta60s. Reloj junto al PC, MiFitness cerrado, batería≥50%, volumen audible,
observación. Primero reinicio normal (NO Restablecer) desde Ajustes porque R383
no confirmó descarga. Puede instalarse inactivo antes del reinicio, esperando
el cierre del transporte. No abrir otras pruebas C.

Primer arranque: READY→START1, mantener CHECKING/LOADING despierto; título
DoomII→NEWGAME→dificultad→MAP01. Primer disparo/sonido, controles/USAR,
PAUSA→GUARDAR→GUARDADO, SEGUIR/mover y CARGAR→CARGADO; SALIR≤60sjuego.
Esperar hasta~40s nominales de parada/audio, sin insistir. Solo si CLOSED y
todo correcto: cambiar esfera, volver a DoomII, START1, cargar desde título,
SEGUIR y SALIR→CLOSED. Ante ERROR/ausencia de sonido/cierre fallido no segundo
arranque ni reapertura: recoger GATE/FREE/MAX, CODE/READ/TOTAL y flags nuevos,
AUDIOERR/CALL si responde. Si imagen sobre menús, reinicio normal y habitual.

Nuevos riesgos: identidad y mapas DoomII, restauración de32mapas, efectos
remuestreados y flujo continuo de audio, flash~7.2MB. Puede bloquear/corromper
el sistema, atascar audio/imagen o exigir reinicio. Recuperación integral sigue
sin validar. El resultado local no resuelve ese riesgo ni confirma el cierre RW4.
