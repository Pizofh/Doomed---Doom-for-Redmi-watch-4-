# R375: un intento de Ultimate tras liberar espacio

**Autorizado y consumido, detenido en preflight sin enviar datos.** El intento R374 quedó
rechazado por INSTALLstatus3 antes de enviar datos; el usuario confirma que
liberó espacio. No se consulta ni escribe el reloj durante esta preparación.
La aprobación anterior cubría un solo intento y está consumida.

Resultado R375: CatalogPreflight,10entradas, revisión de removidos=false,
5frames/185B TX,0partes; sin INSTALL ni upload. Cierre y salida del worker
confirmados. Gates cerrados y worker reconstruido. Diagnóstico de solo lectura
y corrección propuesta: [R376](doom-ultimate-catalog-retry-r376.md).

## Paquete y alcance

Exactamente el [paquete R374](doom-ultimate-physical-plan-r374.md):
DoomUltimate ID365220001,13090600B, SHA256
`dfd89cd54542142a3cddb5dd444f6553fbd648b6e9d7dd1140f9b67b464ad8ca`.
WAD/ELF/Lua intactos; Ultimate1.9 con4episodios/36mapas y bancos propios.
No reinstalar versiones anteriores ni borrar/seleccionar esferas desde PC.
Conservar el carrier DoomLauncher y las versiones/partidas que siguen allí.

Una instalación inactiva nueva; dos arranques manuales≤90s solo si se instala
correctamente. Batería≥50% y usuario observando; envío estimado12–18min.
Mantiene perfil retail acotado, pausas100ms y límites R374 sin ampliación.
Los riesgos de bloqueo/corrupción, falta de espacio y reinicio persisten;
no hay recuperación integral validada. Liberar esferas no mide bytes libres
ni garantiza que el instalador acepte este paquete.

## Guard independiente

`PHYSICAL_ULTIMATE_SPACE_R375_REVIEWED=false`, gate general y C#Retail cerrados.
El gate inicial R374 y los de retry/resume anteriores permanecen falsos.
CLI `pc-doom-ultimate-r374.mjs install-after-space` exige el gate R375 antes de
leer privados; `prepare-after-space` solo verifica el paquete local.

Antes de abrir el transporte se valida íntegramente el journal HMAC original
para el mismo target/clave/paquete. Únicamente admite intento1 con tres etapas
exactas Created→InstallIntent→Uncertain, catálogo presente y todos los campos
upload=null. No admite negociación de upload, lote incierto, MASS, cambio de
clave/paquete/target, history alterado, resume o retry genérico.

Se agrega intento2 `retry-after-space-r375` al mismo journal sin cambiar su
prefijo original. La consulta posterior debe mostrar menos esferas, solo
eliminaciones de entradas antes eliminables, todos los flags supervivientes
iguales, una activa conocida, DoomLauncher presente e IDUltimate ausente.
Conservar la selección ACTUAL, aunque haya cambiado desde el intento previo.
El paquete completo no depende de otra UI instalada.

Cualquier fallo de este segundo intento, incluso durante preflight y con
cero partes, consume este procedimiento. No retry automático, tercero,
resume, otros IDs ni reducción del guard de RAM.

## Verificación local

`tools/test-ultimate-space-r375.mjs`:43casos, historia/pins/HMAC y bloqueo de
tercer intento, catálogos admitidos/rechazados, selección actual, puertas y
CLI. Incluye6405partes del paquete inalterado por IPC C# y receptor simulado,
registro inactivo y cierre confirmados. Resultado ignorado
`artifacts/research/ultimate-space-r375/result.json`.

Regresión de retry antiguo18casos y catálogo anterior17casos aprobados.
Sin C nuevo ni repetición de campaña; sin Bluetooth ni reloj en esos tests.

## Ejecución después de aprobación

Abrir solo general+R375 en JS y Retail en C#, rebuild y comprobar
targetvacío→InvalidTarget antes de lookup/credenciales/journal.
Ejecutar `node tools/pc-doom-ultimate-r374.mjs install-after-space` UNA vez.
Ante cualquier rechazo/corte: detener, conservar journal y cerrar gates.
Tras el comando, cerrar gates y rebuild antes de abrir DoomUltimate.

Solo si queda RegisteredInactive, con cierre y salida del worker confirmados,
usar los dos arranques del plan R374: título/4episodios, NEWGAME/E1M1,
primer sonido/controles/guardar/EXIT→CLOSED; después reapertura/carga propia,
NEWGAME/episodioIV breve y EXIT→CLOSED. No ejecutar otro START ante fallo.
