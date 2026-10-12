# R160 — apertura fallida después de cambiar vinculación

2026-10-12, usuario ejecutó batch R159:

```json
{"checkpoint":"R159","status":"PreflightOrOpenFailed","rawOutputSaved":false,"filesTransferred":false,"closeConfirmed":false,"workerExitConfirmed":true,"supervisor":"TransportFailure","workerExitCode":1,"nativeError":true,"elapsedMs":20147,"bluetoothOperationRequested":null,"watchCommandRequested":false}
```

Fallo anterior a comandos Xiaomi, worker terminado. No auth/nonce/version query
enviados; no conclusión sobre clave, protocolo o ABI. Aproximación a20s coincide
con presupuesto de apertura, pero reporte antiguo no preservó categoría nativa:
no afirmar retrospectivamente Deadline, RadioTimeout o un código Winsock específico.

Usuario observó reloj «vinculado» y funcional mientras figuraba en Bluetooth
teléfono y PC. No demuestra dos conexiones activas, perfiles, SPP o sync simultánea;
registrar como observación, no prueba universal de una sola/múltiples asociaciones.
Después volvió a Conectar nuevo teléfono y QR. Confirma que WINDOWS CONSERVÓ EL
VÍNCULO ANTERIOR, no nuevo pairing con código. Claves stale son hipótesis razonable,
no causa confirmada. Etiqueta «micrófono conectado» no verifica servicio SPP.

## Corrección propia y pruebas

Bug reproducido con fixture: worker anuncia error terminal y cierra stdin; parent
close() aún intenta escribir C. EPIPE podía provocar force/kill y borrar una
confirmación CLOSED:1 observada. Ahora marca terminal al error/cierre, no escribe
a worker terminal e ignora error de stdin esperado en ese estado. Conserva cierre
si fue observado y no hubo terminación forzada. Error físico anterior no puede
reclasificarse como cierre confirmado porque no se guardó pipe crudo.

Añadido reporte sanitizado completo: nativeOutcome, nativeErrorCode (solo código
WSA realmente observado, null si no hay), nativeStage/failureStage, connectionRequested.
No nombres/MAC/keys/payloads/excepciones. Native devuelve etapas cache/apertura/
send/recv/cierre; deadline del cliente distinto de10060 del proveedor. recv=0
se clasifica desconexión sin inventar WSA10054. Valores solo enums/enteros conocidos.
No nuevos comandos de reloj ni retries automáticos.

Regresión: error Deadline/RadioTimeout→stdin cerrado→CLOSED:1→exit1; cero comandos
post-terminal, closeConfirmed=true, supervisor=null y categoría correcta. Otros
tests existentes pasan. Fix del informe NO demuestra resolución de apertura.

## Próxima secuencia manual, mismo lote autorizado

Con reloj YA en QR: mantener Bluetooth del teléfono apagado, quitar SOLO RW4 de
Windows y agregarlo de nuevo confirmando código coincidente. No volver a activar
Conectar nuevo teléfono después de ese pairing nuevo ni reiniciar otros vínculos.
Esto reemplaza la asociación local Windows antigua; puede guardar nuevas claves
en reloj/PC, operación stock ya usada, sin firmware/reset/particiones solicitados.
Retorno conocido sigue quitar PC y re-vincular Mi Fitness; no prometer reboot.

Después UNA ejecución del mismo `node tools/pc-rfcomm.mjs session`, herramienta
corregida/recompilada. No repetir probe ni re-instalar APK, no nuevos archivos
enviados. Dejar PC hasta revisar el único JSON y completar bloque agrupado.
Si aviso de borrado, código distinto o nueva solicitud pairing durante batch,
cancelar/detener. No ejecución de radio por agente.
