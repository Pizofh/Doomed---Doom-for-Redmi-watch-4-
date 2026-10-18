# R380: completar una vez el paquete parcial confirmado

Aprobado por el usuario el 2026-10-18: una reanudación y ambos ensayos. R379 recibió del reloj un ACK
cifrado con MD5coincidente y posición3378710B, sin enviar MASS. Su guard
solo permitía empezar en0 y detuvo correctamente. Este plan permite continuar
desde esa posición, sin convertirlo en una recuperación automática genérica.

## Alcance

UNA reanudación del mismo DoomPacked ID365220002/6165808B, SHA256
069e1a1dfdd676de6382565ba177cad411c07647929b8158dbe8d131cc9a490a.
Paquete/ELF/lector/juego idénticos a R378:36mapas. Quedan2787098B de paquete,
1364partes a2048 y2813040B en streamwire. Observación3–6min, batería≥50%,
reloj junto al PC/MiFitness cerrado. No borrados/SET ni reinicio previo.
Instalación inactiva; DOSarranques manuales≤90s solo si registra correctamente.
Conservar esferas/partidas y selecciónACTUAL. No medir ni asumir espacio libre.

## Guardas

Nuevo gate `PHYSICAL_PACKED_RESUME_R380_REVIEWED=false`. Abrir tras aprobación
solo general+R380 JS y RetailC#; R378/R379 y resume/retry genéricos cerrados.
CLI `pc-doom-packed-r378.mjs prepare-resume|install-resume` (checkpointR380).
Prepare es offline, sin leer privados/reclamar journal/radio.

Antes de conectar, validar HMAC/identidad/paquete/cadena del MISMO journal
packed-r378.jsonl. Exigir las112filas exactas R378 del guard R379 más4filas
R379 de intento2 restart-packed-r379: Created→InstallIntent→UploadIntent→
Uncertain, todos uploadnull, baseline sin cambios. No otro historial.
Conservar prefijo116filas y agregar intento3 resume-packed-r380. Recuperar
baseline/descriptor de upload de intento1 (offset0, highestPossible3466602),
sin inventar recepción remota de las1687partes escritas localmente.

Nueva consulta: mismo conjunto/flags, una selección válida e IDnuevo ausente.
INSTALL debe aceptar. ACK debe ser cifrado y contener EXPLÍCITAMENTE hash
MD5coincidente y posición3378710 exactamente, dentro del límite original.
Si falta identidad/posición, es distinta (incluido0), hay rechazo o cambio
de catálogo, detener antes de MASS. No adaptar el offset ni reiniciar completo.
Enviar solo la cola restante con el protocolo de resume ya existente,
MD5original/CRCdelstream, mismos límites y pausas100ms. Verificar registro
inactivo/esferas/selección, cierre y worker. No afirmar contenido verificado
hasta que el lector del reloj valide el WAD al abrir el juego.

Otro fallo consume intento3 y bloquea cualquier otro resume/retry. Ningún
reenvío automático ni borrado/cancelación del parcial. Journal siempre intacto.

## Validación

53casos locales pasan: ambos intentos reproducidos, historial116filas,
alteraciones/opciones/HMAC/identidad, offsets0/adyacentes/fuera de rango,
hash o posición ausentes y MD5incorrecto rechazados antes de MASS; catálogo,
colisión y rechazo. Reanudación1364partes por C#real IPC/receptor sintético,
bytes/CRC/MD5 esperados, registro inactivo, selección actual/prefijo intactos,
cierre/unload del worker y bloqueo de intento4. Regresión R37947casos y
shared23escenarios pasan. Historial físico aceptado estructuralmente sin
modificarlo; HMAC completa se exige antes de la conexión autorizada.
No repetir tests del motor: no cambió. No radio adicional en esta preparación.

## Ejecución y ensayo tras aprobación

Reconstruir transporte con los tres gates permitidos y comprobar
assertRetailNativeDispatchReady targetvacío→InvalidTarget antes de privados.
Ejecutar `node tools/pc-doom-packed-r378.mjs install-resume` UNA vez.
Tras cualquier resultado cerrar gates/rebuild antes del ensayo.

Si RegisteredInactive+cierre+worker confirmados: DoomPacked (marco menta/tres
barras), volumen audible. READY→START una vez, mantener CHECKING despierto
con toques breves fuera de botones. Confirmar título/cuatro episodios y
NEWGAME→I/dificultad. Probar primer disparo/sonido, movimiento/USAR,
pausa/seguir, GUARDAR→GUARDADO y SALIR≤90s→CLOSED. Solo si todo funciona:
cambiar a esfera habitual/reabrir/START, desde título PAUSA→CARGAR→CARGADO→
SEGUIR; luego MENU→NEWGAME→IV breve y SALIR≤90s→CLOSED.
Ante ERROR/corrupción/suspensión/silencio/cierre fallido: no repetir START ni
segundo ciclo; recoger CERROR/GPUCODE/PHASE y AUDIOERR/PCMSFX con MODE si
responde. Volver desde Ajustes; si queda imagen encima, reiniciar desde
Ajustes y dejar la esfera habitual.

La autorización R379 se consumió y prohibía resume: hace falta aprobación
explícita nueva para esta continuación concreta. Escribe flash y conserva
el riesgo de bloqueo/corrupción/reinicio y del lector C aún no probado en
hardware. El límite cooperativo no corta una llamada nativa bloqueada.
Recuperación integral sigue sin validar.

## Resultado de instalación — 2026-10-18

Una reanudación autorizada completada. Modelo/FW esperados, catálogo10 con
mismos miembros/selección, INSTALL0. ACK cifrado con MD5correcto/status0,
posición3378710 exacta/chunk2048. Cola1364partes enviada;1372frames y2813338B
TX con consultas. Registro propio inactivo verificado, selección/esferas
anteriores preservadas. RegisteredInactive, registeredVerifiedtrue,
contentVerifiedfalse, selectedByClientfalse. Cierre y workerexit0 confirmados;
nativeErrorfalse, sin fallback/retry. Gatesgeneral/R380/RetailC# cerrados y
worker reconstruido inmediatamente. No borrados/reinicio/SET ni consulta extra.

Los DOSensayos manuales ya aprobados siguen pendientes. El registro no prueba
el contenido completo del WAD ni rendimiento/sonido en hardware; la comprobación
del lector y el reporte del usuario deben confirmarlos. No repetir instalación.

### Primer ensayo reportado

Usuario: CHECKING→ERROR; CERROR/GPUCODE/PHASE y todas las páginas en0,
sin juego visible; salió y menús responden. Segundo arranque no se realiza
según regla de parada. No inferir que nunca ejecutó init C: puede fallar antes
del primer snapshot. No hay checksum/RAM/etapa Lua visible en R378.
Se prepara launcher-only R381 para conservar el error de preflight, mostrar
etapa/RAM y recoger temporales del CRC antes de medir, sin rebajar guardas ni
reenviar el juego. No hay causa exacta ni corrección física confirmadas.
