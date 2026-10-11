# Retomar el proyecto

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
