# R165 — pairing dirigido agotó su espera; retorno normal confirmado

2026-10-12. Un intento manual, sin código de comparación mostrado:

```json
{"checkpoint":"R163","status":"NativeRejected","authenticationRequests":1,"nativeResult":258,"handlesClosed":true,"bluetoothOperationRequested":true,"watchCommandRequested":false,"workerExitConfirmed":true,"pairingApiCompleted":true,"supervisor":null,"bondCurrentlyUsableVerified":false,"filesTransferred":false,"rawOutputSaved":false}
```

El usuario confirma que el reloj conserva menús normales y Mi Fitness vuelve a
sincronizar al encender Bluetooth del teléfono. No repetir pregunta de retorno.
No hubo protocolo Xiaomi, uso de auth.json o archivos transmitidos por este helper.
No nueva lectura de logs, build, APK o prueba física del agente.

[Microsoft define 258 como WAIT_TIMEOUT](https://learn.microsoft.com/en-us/windows/win32/debug/system-error-codes--0-499-).
Es el retorno real de BluetoothAuthenticateDeviceEx, no el deadline de 60s del
supervisor (supervisor=null, pairingApiCompleted=true). NativeRejected es el
nombre genérico de nuestra CLI para códigos no enumerados, no prueba de rechazo
remoto explícito. Tampoco prueba clave errónea, peer inalcanzable, causa en
Windows o impossibilidad global de conservar la asociación. Duración no medida
en este JSON. Cierre de handles y salida del worker confirmados; bond usable no.

Conclusión: la variante dirigida en el estado normal no funcionó en este intento.
No añadir detalle a la app ni repetir el mismo ensayo para obtener otro timeout.
La candidata R164 sigue preparada; su HMAC no se ha probado. No cambiarla ni
probar claves alternativas como respuesta a este fallo de pairing.

## Siguiente hipótesis distinta: modo del reloj sin unlink de Mi Fitness

Los intentos SPP/version/nonce exitosos anteriores usaron el reloj en QR, pero
también hubo desvinculaciones de Mi Fitness. Falta separar esas dos operaciones.
Propuesta: entrar al modo Conectar nuevo teléfono del reloj SIN Desvincular ni
eliminar su registro en Mi Fitness, luego pairing Windows GUI y un único lote
ya preparado. La clave podría conservarse o cambiar: todavía desconocido.

[La FAQ oficial RW4](https://www.mi.com/uk/support/faq/details/KA-91528/)
describe Conectar nuevo teléfono mientras el teléfono original está conectado
para migrar con la misma cuenta. No requiere en esa descripción borrar primero
el registro de la app, ni garantiza conservación de clave o compatibilidad PC.
No seguir su alternativa de reset para otra cuenta. Esta hipótesis no equivale
a mantener dos conexiones activas simultáneas.

### Plan concreto propuesto, pendiente de revisión del usuario

1. Estado inicial: Mi Fitness conectado y sincronizado (confirmado), candidato
   R164 preparado. Mantener la cuenta habitual y el registro actual de la app.
2. Mientras sigue conectado, abrir en reloj Ajustes → Sistema/Operación del
   sistema → Conectar nuevo teléfono. Cancelar aviso de borrar/reset/cambio de
   cuenta o cualquier requisito de Desvincular de Mi Fitness. QR esperado.
3. Apagar Bluetooth del teléfono; NO Desvincular en Mi Fitness o Android.
4. En Windows, agregar RW4 por el flujo GUI usado anteriormente y verificar el
   código en ambos. Si queda un registro Windows anterior, quitar SOLO RW4 antes
   de agregarlo; no apagar Bluetooth del PC/teclado. No volver a pulsar Conectar
   nuevo teléfono tras confirmar el código nuevo. No usar el helper dirigido.
5. Después de ese pairing, una vez desde la raíz:

   ```powershell
   node tools/pc-rfcomm.mjs session
   ```

   Un socket: versión, nonce/HMAC; solo si válido, auth-final y batería/info;
   cierre. Mismatch detiene el lote sin auth-final/queries. Código sin cambios,
   límites/privacidad/build del [plan R159](windows-xiaomi-session-plan-r159.md).
6. Compartir solo JSON y si permaneció QR o volvieron los menús. Mantener PC
   mientras se revisa el bloque; no re-pair entre consultas ni repetir comando.

### Riesgo y retorno de esta variante

| Campo | Evaluación |
|---|---|
| Unidad/compatibilidad | M2315W1/2.2.86 reportados; QR+Windows/SPP/v1 antes sí funcionaron; omisión de unlink y vigencia de clave no probadas |
| Componente | Modo stock de migración, registros Bluetooth PC/reloj, servicio Xiaomi existente |
| Comandos | Menús stock/GUI Windows; session ya audita versión, nonce, auth y dos lecturas; no setters o uploads |
| Almacenamiento persistente | Sí puede modificar estado de vínculo/keys; no RAM-only ni read-only. Auth también puede guardar metadata de cliente |
| Particiones/bootloader/firmware | Ninguna herramienta u operación de escritura cruda, boot o firmware modificado |
| Reversible por reboot | No prometido; reboot no restaura necesariamente asociación/clave anterior |
| Revertir | Quitar solo vínculo PC y reconectar mediante registro/cuenta Mi Fitness existente. Si requiere re-vincular, procedimiento normal ya observado, pero esta variante exacta no probada |
| Backup | Sync previa no es backup integral de flash/firmware; no datos/assets propios instalados todavía |
| Peor fallo razonable | QR hasta re-vincular, rechazo/timeout o cambio de clave; necesidad de renovar logs tras retorno. No continuar con guesses/retries |
| Soft brick | UI de setup puede impedir uso normal temporalmente; no es por sí sola corrupción de firmware. Bloqueo de pila stock no descartado |
| Hard brick | Sin mecanismo directo identificado en este flujo de flash/boot; no evidencia específica ni garantía absoluta de riesgo cero |
| Recovery | Retorno Mi Fitness ya probado varias veces; no recovery integral de firmware validado |
| Stop | Aviso de borrado/reset/cuenta distinta, clave inválida, pairing/cierre fallido, formato distinto o Mi Fitness no retorna; no exploits/ELF/kernel |

No ejecutar esta variante automáticamente ni asumir aprobación por el JSON
del intento fallido. Plan listo para decisión del usuario; ninguna instalación
de watchface, C, Doom o modificación de firmware incluida. Meta única: validar
la candidata R164 en QR conservando el registro de Mi Fitness.
