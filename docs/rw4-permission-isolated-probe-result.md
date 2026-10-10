# R113 — PROBE con permiso Mi Fitness denegado

2026-10-10. Usuario confirma: retiró Dispositivos cercanos a Mi Fitness,
detuvo ambas apps, ejecutó un PROBE r106, restauró los permisos y todo funciona
bien. No se pidieron ni ejecutaron operaciones físicas desde herramientas PC.
Es el quinto intento de enlace registrado, tercer PROBE. Los interruptores
llamadas/entrada estaban OFF según el control R112; no confirmación separada
de esos toggles al final. No volver a preguntar por detalles menores ni asumir
que normalidad significa identidad de todos los datos.

## Resultado saneado

```text
P00; caché local y del intento B01/T01/S01
RW4 Diagnostics r106; Android API36; modo solo Bluetooth
Formato de clave: no evaluado
D01 > D02 > D03 > D18 > D04 > E03 > D17 > D13
D01 +0ms > D02 +117ms > D03 +128ms > D18 +149ms >
D04 +150ms > E03 +536ms > D17 +543ms > D13 +549ms
G08: IOException; lectura falló, mensaje ambiguo cierre/timeout
Cierre local solicitado al registrar el error: no
Sin batería/modelo/firmware (PROBE no los consulta)
```

Intervalo D04→E03 **386ms**, E03→D17 **7ms**; D13 a549ms de solicitud.
Son tiempos entre marcas del cliente, no métricas radio/CPU del reloj.
Misma etapa y G08 que R107/R109: creación de socket exitosa, connect falla,
sin D05/protocolo/auth/GET y antes del límite propio30s/cierre solicitado.
No validar/rechazar clave ni atribuir causa a timeout o rechazo remoto.

## Qué cambia en el diagnóstico

La hipótesis «basta retirar el permiso de Mi Fitness para que abra nuestro
socket» **no se cumplió en este ensayo**. La explicación de Mi Fitness
reconectándose mediante sus APIs normales pierde fuerza. No demostrar ausencia
de perfiles del sistema/componentes privilegiados ni estado residual de la
pila, porque no se capturó radio ni se auditó HyperOS/Mi Fitness. No desinstalar
Mi Fitness ni repetir el mismo intento para perseguir esa hipótesis.

Permisos restaurados y funcionamiento normal por reporte: retorno confirmado
para R113, no prueba genérica de recovery integral ni ensayo de firmware/nativo.
Quick Share no se modificó; tampoco hay evidencia causal contra esa función.

## Investigación estática PC realizada

Fuente Gadgetbridge0.94.0/code253 ya inspeccionada:

- `RedmiWatch4Coordinator` fija `BT_CLASSIC`.
- `XiaomiSupport` permite override de tipo solo para coordinators `BOTH`;
  la preferencia genérica de forzar BLE/Classic no cambia este coordinator RW4.
- `XiaomiSppSupport` elige UUID SPP1101 y el soporte usa canal no especificado,
  resuelto por SDP. No nuevo canal, socket insecure o loader probado.
- La lista BLE de `XiaomiUuids` menciona otros modelos, no demuestra un set
  de servicios/características de M2315W1/2.2.86. No trasladar esas direcciones
  a un nuevo ensayo físico por semejanza.

La [ficha upstream RW4](https://gadgetbridge.org/gadgets/wearables/xiaomi/#redmi-watch-4)
sigue experimental/cobertura desconocida. La [advertencia de tipos de conexión](https://gadgetbridge.org/basics/topics/xiaomi-protobuf/#multiple-connection-types)
es de familia y no establece que RW4/2.2.86 use BLE. Las recomendaciones
genéricas de unpair/forzar Classic no se aplican automáticamente a este cliente.

Se creó `tools/check-mi-fitness-transport.mjs`, PC-only, que inspecciona los
archivos privados existentes mediante una lista fija de términos y devuelve
solo contadores de líneas y coincidencia de etiqueta RW4 en la misma línea.
No exporta textos, nombres de archivo, claves, direcciones, seriales ni UUIDs
descubiertos; no red/Bluetooth/procesos externos/escrituras sobre esos archivos.
Guards de tamaño/UTF8/symlink, errores fijos, y límite de longitud de línea.

Prueba sintética `tools/test-mi-fitness-transport.mjs` pasa: mezcla de modelos,
conteo por línea, palabras parciales, exclusión de datos privados, agregación,
UTF8 inválido/binary, y flags explícitos de no atribución. La coincidencia
misma línea puede incluir objetos distintos; deliberadamente **no** demuestra
mismo objeto/unidad/transporte.

```powershell
node tools/test-mi-fitness-transport.mjs
node tools/check-mi-fitness-transport.mjs
```

Resultado real: 4 archivos, **12 líneas con BLE**,0 con etiqueta RW4 en la misma
línea. Todos los demás marcadores listados (connectGatt/BluetoothGatt/GATT,
callbacks/escritura característica/BluetoothSocket/createRfcomm/RFCOMM/SPP/UUID
SPP conocido)0;0 líneas largas omitidas. **No identifica el transporte del RW4**.
Ausencia de términos en estos logs no demuestra ausencia del protocolo.
Contadores documentados; ningún fragmento de log añadido a Git/artifacts.

## Siguiente checkpoint único

**Identificar el servicio/endpoint de datos disponible en esta unidad y
contrastar con el Classic/SPP que intenta r106.** Hará falta una fuente
específica RW4 o un inventario del servicio actual con procedimiento concreto
revisado. B01/T01/S01 es caché, no inventario remoto actual ni canal validado.
El filtro de logs existente no resuelve esa falta y no justifica cambiar a BLE.

No otro PROBE idéntico, consulta de batería, cambio de clave, desinstalar,
unpair/reset, canales al azar, firmware o nativo. No APK nuevo solo para sumar
etiquetas de debug. Una herramienta de inventario futura debe prepararse y
revisarse completa antes de pedir otra transferencia/instalación. Todavía no
se implementó ni autorizó automáticamente un nuevo inventario radio.
