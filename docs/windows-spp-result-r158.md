# R158 — SPP real abierto desde Windows

2026-10-12, reporte manual del usuario:

```json
{"checkpoint":"R154","simulated":false,"outcome":"Opened","elapsedMs":1337,"startRequests":1,"closeConfirmed":true,"physicalEnabled":true,"bluetoothOperationRequested":true,"watchCommandRequested":false,"workerExitConfirmed":true}
```

Confirma apertura/cierre local del canal SPP con nuestra herramienta y unidad
M2315W1/2.2.86, no solo etiqueta de micrófono de Windows. 1337ms corresponde al
ensayo completo del controlador, no una medida aislada del handshake. Un Start,
cierre de recursos confirmado por API y worker terminado. Sin comandos Xiaomi,
send/recv, autenticación de aplicación, archivos o código enviados al reloj.
No prueba loader nativo, RAM disponible, persistencia de Doom o ABI del hardware.
No atribuye los fallos Android exclusivamente a HyperOS: también cambió el estado
de vinculación y host. No repetir el probe de apertura para volver a demostrarlo.

Usuario aún mantiene el vínculo PC; aplaza volver a Mi Fitness. Retorno anterior
sí confirmado; retorno DESPUÉS de este intento sigue pendiente, sin presumir fallo
o recuperación. Esto no bloquea preparar/pruebas offline.

## R159 — pruebas agrupadas solicitadas

El usuario pide agrupar pruebas para evitar cambios repetidos PC/Mi Fitness.
Preparar una sesión: versión de protocolo → auth si hay clave conocida válida →
batería e información de modelo/firmware → cierre. Detener si falta requisito,
HMAC no coincide o formato desconocido, sin probar claves alternativas.
Puede conservar emparejamiento PC durante preparación. Una vuelta a Mi Fitness
al acabar la sesión, no una por consulta. Sin nueva APK diagnóstica.

Fuentes inspeccionadas localmente: worktree Gadgetbridge de diagnóstico existente,
XiaomiSppSupport/PacketV1/ProtocolV1/PacketV2/ProtocolV2/AuthService, xiaomi.proto
y XiaomiSystemService. Tiene parches diagnósticos; no describirlo como upstream
íntegro ni reverse engineering nuevo del firmware. Consulta de versión precede
auth; V1 y V2 tienen framing/session distintos; auth deriva claves mediante
HMAC y cifrado CCM/CTR. Solo consultas System(2,1) battery y (2,2) device info;
NO usar initialize() completo: incluye otros servicios/config/timers.
Clave antigua puede haber cambiado con las desvinculaciones. No inferir vigencia
por longitud; comprobar HMAC antes de completar auth y no exportar credenciales.

La solicitud de pruebas agrupadas no autoriza instalar, flashear, explotar,
ejecutar kernel/ELF físico o hacer escrituras nuevas. Plan específico del batch
debe existir antes de instrucciones de ejecución; no ejecución automática.
