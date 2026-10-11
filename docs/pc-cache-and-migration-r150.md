# R150 — caché local Windows y límite de migración

## Resultado posterior R151: QR reportado, retorno pendiente

2026-10-11. Tras proponer la inspección limitada, el usuario informa:
«sí, sale el qr … para ponerlo en la app». Se registra pantalla de vinculación
por reporte del usuario, sin captura, contenido del QR ni comandos del agente.
No prueba que el vínculo anterior se haya borrado, que el reloj ahora sea visible
en Windows, o que un emparejamiento con PC esté soportado. Tampoco demuestra
que el flujo pueda cancelarse sin cambios persistentes.

Se alcanza el stop previsto: no escanear QR, no emparejar Windows, no abrir SPP,
no reset ni código. Intentar volver atrás con gesto habitual; si sale, activar
Bluetooth del teléfono y abrir Mi Fitness. Si no puede salir del QR, comunicar
ese estado antes de otras acciones. Retorno/sincronización aún NO confirmados.
No pedir repetir la inspección. El plan inferior conserva el alcance propuesto
como historial; no autoriza pasos adicionales de migración o recuperación.

2026-10-11. El usuario aclara que mantuvo el Bluetooth del teléfono apagado
durante la búsqueda de Windows sin RW4 por nombre. No atribuir ese resultado
a una conexión activa del teléfono ni asegurar que apagarlo hace visible el reloj.
El usuario confirma que aparece la opción preguntada en Ajustes/Sistema del reloj;
la pregunta mencionaba «Conectar nuevo teléfono» u opciones de visibilidad.
No hay captura ni transcripción del nombre exacto; no se pidió activarla.

## Consulta realizada en el PC

Lector propio [pc-bluetooth-cache.ps1](../tools/pc-bluetooth-cache.ps1).
Build de C# mediante Add-Type de Windows; no binarios descargados ni instalaciones.
APIs del sistema bthprops.cpl, con búsqueda de DLL restringida a System32.
BluetoothFindFirstDevice/NextDevice con fIssueInquiry=FALSE, timeout=0, hRadio=NULL.
Hasta 64 registros, cierre del handle en finally, errores con estados fijos.
No nombres, direcciones, timestamps de dispositivos o excepciones crudas impresos
o guardados. Las coincidencias por nombre son candidatos, no identidad verificada.
No llamadas de inquiry, sockets, pairing, ADB, autenticación o comandos Xiaomi.

```powershell
powershell.exe -NoProfile -File tools/pc-bluetooth-cache.ps1 -ValidateOnly
powershell.exe -NoProfile -File tools/pc-bluetooth-cache.ps1
```

El sandbox rechazó ambos comandos por política de scripts; se reintentaron con
aprobación fuera del sandbox. No se cambió ExecutionPolicy ni se usó Bypass.
Validación local: tamaños x64 Search=40 y Device=560; offsets Inquiry=20,
Radio=32, Address=8, Authenticated=28, Name=64; flags de inquiry/timeout cero.
No es una suite de comportamiento del driver o prueba de conectividad.

Resultado real:

```json
{"checkpoint":"R150","status":"COMPLETE","cachedClassicRecords":7,"authenticatedRecords":3,"rememberedRecords":3,"rw4NameCandidates":0,"authenticatedRw4NameCandidates":0,"truncated":false,"closeConfirmed":true,"watchIdentityVerified":false,"inquiryRequested":false,"pairingRequested":false,"socketRequested":false,"watchCommandRequested":false,"rawOutputSaved":false}
```

No se identificó vínculo RW4 por nombre. No descarta alias entre los tres registros
autenticados, claves obsoletas ni dispositivos BLE: esta API solo enumera Classic.
No concluye que un dispositivo desconocido observado por el usuario sea el reloj.
El gate del cliente RFCOMM R148 permanece cerrado y no se recompiló.

Fuentes primarias:

- [Microsoft: Search params](https://learn.microsoft.com/en-us/windows/win32/api/bluetoothapis/ns-bluetoothapis-bluetooth_device_search_params): inquiry separado de selección de registros.
- [Microsoft: Device info](https://learn.microsoft.com/en-us/windows/win32/api/bluetoothapis/ns-bluetoothapis-bluetooth_device_info_struct): recordado no equivale a autenticado.
- [Microsoft: FindFirstDevice](https://learn.microsoft.com/en-us/windows/win32/api/bluetoothapis/nf-bluetoothapis-bluetoothfindfirstdevice): no enumera LE.
- [Xiaomi: binding RW4](https://www.mi.com/global/support/faq/details/KA-228885/): comprobación de pantalla QR en pairing; no garantiza visibilidad fuera de ese flujo.
- [Xiaomi: FAQ RW4](https://www.mi.com/uk/support/faq/details/KA-91528/): migración misma cuenta desde reloj conectado al teléfono original. No describe Windows, coexistencia ni cancelación exacta del firmware 2.2.86.

## Plan para revisión: inspección del flujo de cambio de teléfono

**Historial del plan propuesto; QR reportado en R151, retorno pendiente.** No es un ensayo SPP o una
instalación. Solo tendría sentido si el usuario acepta un posible cambio del
estado de vinculación. No confundir tocar la entrada del menú con leer su nombre.

| Elemento | Alcance concreto |
|---|---|
| Identidad | Usuario M2315W1/FW2.2.86; opción de sistema reportada; región desconocida |
| Precondición | Restaurar Bluetooth del teléfono y comprobar Mi Fitness conectado; misma cuenta actual; no salir de ella |
| Operación manual propuesta | Ajustes → Sistema → «Conectar nuevo teléfono», una vez; leer la primera pantalla |
| Si muestra confirmación | No confirmar cambio ni restablecimiento; volver atrás y comunicar texto sin identificadores |
| Si aplica inmediatamente/muestra QR | No emparejar Windows ni escanear QR; comunicarlo y detener nuevas acciones |
| Componente | Flujo stock de conexión/vinculación, no bootloader/loader nativo |
| Escritura persistente | No conocida para abrir esa opción; podría cambiar estado de vínculo. Nuevo pairing sí puede persistir claves; no forma parte de esta inspección |
| Particiones/bootloader/firmware | Ninguna escritura solicitada, sin flash ni firmware modificado; no auditar aquí las escrituras internas de stock |
| Reversible por reboot | No demostrado; no usar reboot como garantía de restaurar claves |
| Retorno propuesto | Cancelar si la UI lo permite, activar Bluetooth y abrir Mi Fitness; verificar reconexión/sincronización |
| Recuperación documentada | Xiaomi documenta volver a vincular desde Mi Fitness, misma cuenta. No prueba retorno sin pérdida de datos desde una migración incompleta a Windows |
| Peor fallo razonable del alcance | Interrupción del vínculo y necesidad de reemparejar. Si solo se recupera con reset, detener y revisar; no se autoriza reset |
| Soft/hard brick | No hay evidencia de brick causado por esta operación stock ni ejecución de código nuevo; ausencia de evidencia no garantiza imposibilidad. Principal incertidumbre aquí es vínculo/datos, no firmware |
| Stop | Nombre distinto, advertencia de borrar, cambio aplicado sin confirmación, Mi Fitness no reconecta; no continuar a pairing/SPP ni reset |

Alternativa conservadora: mantener el vínculo y cerrar la vía PC hasta encontrar
un procedimiento específico de pairing RW4 que preserve el estado actual. No
seguir generando APKs o repitiendo PROBE/HCI para cubrir esta incertidumbre.
Este plan es una decisión separada de la autorización para consultar la caché del PC.
