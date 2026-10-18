# R381: launcher pequeño para identificar el fallo de CHECKING

Aprobado e instalado inactivo el 2026-10-18; ensayo manual pendiente. Usuario reportó en R380
CHECKING→ERROR, todos los contadores nativos en0; volvió a su esfera/menús.
No repitió el ensayo ni se pidió el segundo arranque. Ceros no prueban que
jamás se ejecutó init nativo: pueden fallar antes del primer snapshot.
No hay causa exacta confirmada ni motivo para borrar/reenviar el juego.

## Paquete

DoomBoot ID365220003, preview MARCO ROSA con CINCO BARRAS. Solo41900B,
SHA256 fa971e356a2d7d79757eb9deae49e3475285d1b24ed83cb13101ab070c6cca9a.
`build/doom-boot-r381/package/DoomBoot-id-only.face`,7recursos. Lua28995B,
SHA256 f67ddb3259179e58647e475d0417121dcba59dd63173711a502da1b8c7977d3b.
No ELF/WAD nuevo. Usa exclusivamente motor rw4packed378, WAD, gráficos y
slots ya instalados bajo365220002; config.ui_base propia365220003.
Conservar DoomPacked y DoomLauncher/esfera habitual: no borrados/SET ni
reescritura de recursos del carrier. Solo lease/slots/shell propios del
launcher compartido pueden escribirse al ejecutar, igual que en R378.

Controles/render/audio/slots sin cambios. Recoge una vez los temporales Lua
antes de medir UMEM; mantiene guard free7366211/max4194320 y CRC exacto.
Esto puede liberar basura del checksum, pero NO se ha probado que fuera
la causa ni que vaya a resolver el problema físico. No rebajar mínimos.

El safe() conserva solo códigos acotados; nunca muestra texto OS/rutas o
errores crudos. Al fallar abre página5 GATE/FREE/MAX, MODE→página6 CODE/READ/
TOTAL. READ cuenta bytes verificados del ELF en este inicio; en otro inicio
del mismo contexto con CRC cacheado puede ser0, TOTAL629904.
Los contadores C anteriores siguen en páginas1–4. No medir ni publicar
causas específicas basándose solo en los ceros del reporte R380.

Etapas:10start,11openELF,12readCRC,13finalCRC/close,19GC,20parsemem,
21RAMguard,30assets,31ELFheader,32WADheader/layout,40registry,41nodes,
42lease,50insmod,51loadedregistry,52firststate,53startcommand,60started,
70recoverregistry,71ownership/lease,72residentstate.
Códigos:101ELFchecksum,201UMEM,301packedheader,302identity,303layout,
304ELFmissing,305WADmissing,401foreignmodule,402retainednode,
501insmodreport,502loadedidentity,503controlmissing,601fileoperation,
999otro. Los mensajes de error internos de una lectura ya no se pierden
detrás del assert genérico de opened(); siempre se intenta cerrar el handle.
Si hay módulo ajeno/sin lease verificable, se conserva y se rechaza; no
forzar rmmod, recovery, reinicio ni repetir START automáticamente.

## Validación local

16casos con factory y safe() exactos en Lua del S3; archivos/OS/native
simulados. Corrupción/truncado/ausenciaELF, RAMbaja/fragmentada, formatoRAM,
cabecera/identidad/layoutWAD, faltaWAD, registro/nodo ocupado, rechazoinsmod,
snapshotinválido, residente ajeno y dos ciclos normales. Rechazos previos a
carga verifican0loads/0nativeReads. UI real con widgets/backend simulados
comprueba menús/controles y muestra00000201 en páginaCODE al simular UMEM.
Se comprueba orden GC→lecturaRAM y se mantienen los dos mínimos.
No es prueba de recolección efectiva, memoria o rendimiento del reloj.

Paquete7recursos exactos;6alteraciones rechazadas,21partes por C#IPC real
y receptor sintético, falta de dependencia bloquea antes de INSTALL;
colisión/rechazo/hashincorrecto/corte, journal separado y6modos de retry/
resume denegados. CLIprepare/gate cerrado pasan. Regresión compartida23casos
pasa. Temporales Lua/ELF del S3 retirados; no C ejecutado en estos tests.
No repetir pruebas del motor/WAD sin cambios.

## Único intento y ensayo solicitados

UNA instalación inactiva42KB y UN ensayo≤60s, batería≥50% y pudiendo observar.
Reloj cercaPC/MiFitness cerrado; sin reinicio previo ni reenviar el WAD/ELF.
Gate general+PHYSICAL_BOOT_R381_REVIEWED y C#Large únicamente; Retail y
R378/R379/R380/retries/resumes cerrados. Rebuild y assertLargeNativeDispatchReady
targetvacío→InvalidTarget antes de privados/journal/radio.
`node tools/pc-doom-boot-r381.mjs install` UNA vez; requiere catálogo con
365220002 y own365220003 ausente. Nuevo journal boot-r381.jsonl, sin retry.
Después cerrar gates/rebuild ante cualquier resultado antes de abrir UI.

Seleccionar DoomBoot, no DoomPacked. Si READY, START una vez, mantener
CHECKING despierto con toques breves fuera de botones. Ante ERROR (incluso
antes de START), anotar GATE/FREE/MAX y MODE una vez→CODE/READ/TOTAL;
no repetir START ni reabrir. Volver desde Ajustes. Si inicia: NEWGAME→I,
probar brevemente controles/primer disparo/sonido/pausa y SALIR≤60s→CLOSED;
indicar fluidez. Sin segundo arranque. Si queda imagen sobre menús, reiniciar
desde Ajustes y dejar esfera habitual. Con error claro decidir la corrección
offline antes de otro payload; no diagnosticar por tanteo ni bajar guardas.

R380 consumió su envío y el ensayo falló; es un payload Lua nuevo y la regla
inicial exige aprobación explícita. No añade C, pero cambia el orden GC/RAM
y puede intentar cargar el mismo motor aún no validado con este WAD en
hardware: riesgo de bloqueo/corrupción/reinicio. El cierre es cooperativo,
no garantiza cortar llamadas bloqueadas. Recuperación integral sin validar.

## Resultado de instalación

Una instalación autorizada: modelo/FW correctos, catálogo11/ownIDausente,
INSTALL0 y ACKMD5/status0/offset0/chunk2048.21partes,29frames/42621B TX.
RegisteredInactive/registeredVerifiedtrue/contentVerifiedfalse,
selectedByClientfalse. Esferas y selección anteriores preservadas. Cierre y
workerexit0 confirmados/nativeErrorfalse. Gatesgeneral/BootJS/LargeC#
cerrados y worker reconstruido inmediatamente; Retail permaneció cerrado.
No borrados/SET/reinicio ni reenvío WAD/ELF. UN ensayo manual ya aprobado
pendiente; no repetir instalación.

### Ensayo físico R381

Usuario: GATE21, FREE7361008, MAX4776864, CODE201, READ629904/TOTAL629904;
resto de contadores nativos0. Regresó y menús normales. El checksum ELF
terminó correctamente; el guard de UMEM rechazó por5203B de free, antes de
native.start()/insmod. Max supera el mínimo4194320 por582544B: no es este
rechazo por bloque contiguo. No repetir START ni bajar umbrales.
R382 difiere solo en el momento de crear los30widgets del panel de diagnóstico,
que antes ocupaban RAM aun ocultos. No cambia C/caché/CRC/guard.
