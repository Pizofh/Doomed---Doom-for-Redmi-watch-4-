# R166 — primera sesión Xiaomi completa en el RW4 físico

2026-10-12. Resultado manual del usuario:

```json
{"checkpoint":"R159","status":"Complete","protocolVersion":1,"keyHmacVerified":true,"authenticationAck":true,"encryptedDataReceived":true,"battery":97,"modelRecognized":true,"firmware":"2.2.86","sentFrames":5,"receivedFrames":12,"rawOutputSaved":false,"filesTransferred":false,"closeConfirmed":true,"workerExitConfirmed":true,"supervisor":null,"workerExitCode":0,"nativeError":false,"nativeOutcome":null,"nativeStage":"Close","failureStage":null,"nativeErrorCode":null,"connectionRequested":true,"elapsedMs":662,"bluetoothOperationRequested":true,"watchCommandRequested":true}
```

El usuario confirma que activó Conectar nuevo teléfono, emparejó con Windows
sin borrar el registro de Mi Fitness y, después de session, el reloj permite
usar sus menús. Bluetooth del teléfono permanece apagado; mantiene el vínculo
Windows. No pedir otro retorno/re-pair ni repetir session para validar lo mismo.

## Hechos demostrados en esta unidad

- SPP, negociación Xiaomi v1, verificación HMAC con la candidata R164 y
  confirmación de autenticación funcionan desde nuestro cliente Windows.
- Batería97, firmware2.2.86 y etiqueta de modelo reconocida proceden de respuestas
  cifradas con integridad CCM verificada. El modelo físico M2315W1 fue reportado
  anteriormente; el JSON solo publica un booleano de reconocimiento del modelo,
  no la cadena exacta recibida.
- Se pidieron cinco tramas: versión, nonce, auth-final, batería y device info.
  Doce recibidas incluyen tráfico atendido/descartado; no un packet dump público.
- Handles/socket cerrados y worker terminado normalmente, exit0, sin supervisor
  forzado. Los662ms son duración total de esa sesión, no FPS/CPU/latencia de Doom.
- Auth permitió salir del QR y usar los menús stock con el teléfono Bluetooth
  apagado. No se transfirieron archivos ni se instaló código en el reloj.

Conservar el registro Mi Fitness, entrar al modo del reloj y emparejar con
Windows no impidió usar la clave R164 en ESTE ciclo de M2315W1/2.2.86. Corrige
la preocupación anterior de que esa opción necesariamente invalidaría la clave;
no generalizar a todos los firmware ni decir que el menú es una desconexión
pasiva. Que borrar el registro en Mi Fitness invalidara la clave anterior sigue
siendo inferencia de la secuencia, no un experimento causal aislado.

La advertencia verbal anterior de detener el cambio de modo por incertidumbre
no invalida el resultado aportado después: registrar la prueba realmente hecha,
sin inventar un procedimiento distinto. Retorno Mi Fitness de ESTA sesión
completa todavía no probado; usuario conserva PC para agrupar pruebas. Retornos
anteriores de otras sesiones sí están documentados. No imponer retorno ahora.

## Lo que todavía no prueba

No es Doom físico, instalación de watchface/app, C en el reloj, filesystem,
persistencia de archivos, loader/ELF/insmod, ABI, memoria libre o recovery de
firmware. El código del nuevo cliente C#/Node corre en PC. Tampoco prueba
conexiones simultáneas PC/teléfono o que no se escribiera metadata interna de
cliente durante la autenticación. Firmware/bootloader/particiones no modificados
por herramientas de flash; no se realizó auditoría del almacenamiento interno.

## Próxima consulta preparada: inventario de esferas

Para el único siguiente checkpoint se preparó el
[plan read-only R166](windows-watchface-inventory-plan-r166.md): obtener IDs y
marcas de las esferas instaladas para estudiar colisiones/retirada futura.
No capacidad de almacenamiento, dumps de imágenes, selección, eliminación,
instalación o ejecución Lua incluidos. Mismo bond y clave; no volver a vincular
Mi Fitness entre consultas. Ningún comando de inventario físico ejecutado por
el agente ni resultado afirmado hasta el JSON del usuario.
