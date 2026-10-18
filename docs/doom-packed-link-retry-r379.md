# R379: un nuevo envío completo del mismo DoomPacked

Preparado; pendiente de aprobación nueva. Usuario confirma cambio de distancia
o conexión durante R378 y ahora vuelve a dejar el reloj junto al PC. Es una
causa posible, no un diagnóstico nativo confirmado: el código original no se
conservó. No se ha iniciado otro envío ni consulta física durante R379.

## Paquete sin cambios

Mismo DoomPacked ID365220002, privado6165808B, SHA256
069e1a1dfdd676de6382565ba177cad411c07647929b8158dbe8d131cc9a490a.
ELF, controles, audio, lector comprimido y 36mapas idénticos a R378.
[Plan y resultado R378](doom-packed-physical-plan-r378.md) conserva los pins
y pruebas del juego; no repetirlas por un cambio exclusivo del transporte.

UNA instalación inactiva desde cero y DOS arranques manuales≤90s, solo si
instala. Batería≥50%, observación6–10min, reloj junto al PC y Mi Fitness cerrado.
No borrar esferas/partidas ni cambiar selección desde PC, no activar el juego,
no reinicio previo requerido. El envío parcial puede ocupar almacenamiento;
no se midió ese espacio y un nuevo rechazo es posible.

## Excepción acotada al historial observado

Gate nuevo `PHYSICAL_PACKED_RESTART_R379_REVIEWED=false`, junto al general
y C#Retail. R378 y todos los retry/resume antiguos siguen cerrados.
Acciones `prepare-restart` (offline) e `install-restart` en
`tools/pc-doom-packed-r378.mjs`. Sin nuevo producto ni journal alternativo.

El journal original packed-r378.jsonl se conserva. Antes de conectar valida
HMAC, mismo target/clave/paquete/cadena y exactamente112filas de intento1:
Created→InstallIntent→UploadIntent→Uploading,52batches32partes completos,
batch1665..1696 con1687partes escritas, tres checkpoints Uncertain finales.
Se comprueban offset0/chunk2048/total3017, highestPossibleOffset3466602,
wireBytes3480281 y el catálogo original10. Cualquier diferencia bloquea.

Solo agrega intento2 `restart-packed-r379`, sin modificar el prefijo original.
El baseline del catálogo se conserva; el cursor de envío empieza vacío. La
consulta nueva debe mostrar mismo conjunto/flags y IDnuevo ausente, con una
selección válida: conserva la selección ACTUAL. INSTALL debe aceptar; ACK
debe indicar posición0. Si devuelve posición no cero, rechazo o cambia el
catálogo, detener antes de MASS: no reanudar ni adaptar a otro cursor.

Con posición0 se envían las3017partes completas, mismos límites R378 y pausas
100ms. Debe verificar registro inactivo, selección y esferas conservadas,
cierre de socket/worker. El reporte ahora retiene los códigos nativos
validados, sin texto crudo de OS. Otro fallo consume este intento y no permite
un tercero, ni siquiera si no hubo datos. No cancelar/borrar parciales desde PC.

## Validación local

47casos nuevos pasan: reproducción del historial112filas/1687partes,
16historiales alterados rechazados, identidad/HMAC, opciones incompatibles,
registro ya reclamado, catálogo/colisión/flags/rechazo/offset no cero, envío
completo3017partes con C#real IPC y receptor sintético, selección actual,
prefijo original intacto y bloqueo de otro intento. CLI/gates cerrados pasan.
Regresión compartida23escenarios, retry18casos y catálogo17casos pasan.
El predicado estructural acepta el historial físico observado sin modificarlo;
la validación HMAC completa se realiza antes de la conexión autorizada.

## Ejecución tras autorización

1. Abrir SOLO general+R379 JS y RetailC#, reconstruir con
   `node tools/pc-rfcomm.mjs build`; comprobar targetvacío→InvalidTarget con
   assertRetailNativeDispatchReady antes de privados/journal/radio.
2. `node tools/pc-doom-packed-r378.mjs install-restart` UNA vez. Sin fallback.
3. Ante cualquier resultado, cerrar esos gates y reconstruir inmediatamente.
4. Solo si RegisteredInactive, cierre y worker confirmados: ensayo manual R378,
   preview marco menta/tres barras. Título/cuatro episodios, episodioI,
   controles/primer sonido/pausa/guardar/salir≤90s→CLOSED. Solo si funciona,
   cambiar esfera/reabrir/cargar desde título, probar brevemente episodioIV,
   salir≤90s→CLOSED. No insistir ante ERROR/silencio/corrupción/suspensión;
   recoger CERROR/GPUCODE/PHASE y AUDIOERR/PCMSFX con MODE si responde.
   Si queda imagen sobre menús, reiniciar desde Ajustes y dejar esfera habitual.

Hace falta una aprobación nueva porque R378 autorizaba un único intento y
ya se consumió. El envío escribe flash y podría bloquear/corromper el sistema
o requerir reinicio. Se conserva el riesgo del lector C aún no validado en
hardware; el límite cooperativo no detiene llamadas nativas bloqueadas.
Recuperación integral sigue sin validar.
