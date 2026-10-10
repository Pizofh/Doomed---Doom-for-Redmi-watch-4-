# R119 — revisión del endpoint SPP y copia de Mi Fitness

2026-10-10. Inventario completo y retorno normal confirmados en R117/R118.
La lista Android incluye SPP, HFP e HID; no valida el canal remoto. Tres PROBE
ya fallaron antes de D05. Esta sesión trabaja únicamente en PC: revisión de
cliente, fuentes primarias y preparación de una lectura del APK del teléfono.
No nuevo intento Bluetooth, ejecución de ADB real, cambio de nuestra app o firmware.

## Ruta revisada

Se verificaron hashes de seis textos originales contra el review del archivo
F-Droid Gadgetbridge0.94.0/code253, SHA256
`700b2364858e6d26c4446c277d5c89ec7cba795d857d90a7a8d68533c1a69cb1`.
Se comparó el tramo pertinente de `BtBRQueue` con el preview r114 preparado.

| Tramo | Evidencia de código | Alcance |
|---|---|---|
| Selección RW4 | `RedmiWatch4Coordinator.getConnectionType()` devuelve BT_CLASSIC | Implementación cliente; no compatibilidad garantizada2.2.86 |
| Selección soporte | `XiaomiSupport.createConnectionSpecificSupport()` consulta override solo para BOTH | Forzar Classic otra vez no cambia esta ruta RW4 |
| Servicio | `XiaomiSppSupport.getSupportedService()` entrega SERIAL_PORT_PROFILE; XiaomiUuids construye1101 sobre UUID Bluetooth base | UUID esperado00001101-0000-1000-8000-00805f9b34fb |
| Canal principal | `AbstractBTBRDeviceSupport.getRfcommChannel()` devuelve -1, sin override en soporte SPP revisado | Android resuelve por servicio; no canal numérico fijado |
| Creación socket | `BtBRQueue.connect()` cancela discovery, obtiene dispositivo y usa `createRfcommSocketToServiceRecord(mService)` para canal negativo | Socket seguro por API pública; factory preservada en nuestra variante |
| Apertura | Handler registra D04, llama `mBtSocket.connect()`, registra D05 solo al retornar | E03 sinD05 ubica fallo en apertura, no en handshake Xiaomi |
| Cierre PROBE | Rama de expiración/cancelación y cierre exitoso PROBE están después de connect/D05 | Esa rama no explica por sí sola el fallo anterior; otras carreras no descartadas globalmente |

No se identificó un error concreto del UUID/factory en este tramo. Esto no es
una auditoría integral ni descarta bugs de lifecycle, Android, firmware o caché.
Cambiar clave, anunciar iOS en el paso final de auth o cambiar renderer de Doom
no resuelve un fallo que ocurre antes de llegar a esos pasos.

La ficha oficial mantiene RW4 como experimental con cobertura desconocida,
sin validar nuestra versión de firmware.
[Gadgetbridge RW4](https://gadgetbridge.org/gadgets/wearables/xiaomi/#redmi-watch-4).
La recomendación genérica de forzar Classic para dispositivos BOTH no aporta
un cambio en este coordinator ya Classic.
[Documentación de la familia](https://gadgetbridge.org/basics/topics/xiaomi-protobuf/#multiple-connection-types).

La copia GitHub de Freeyourgadget está archivada y remite a Codeberg; su
`XiaomiSppSupport` conserva el UUID SPP, pero no se presenta como fuente actual
de una corrección. El coordinator/raw actual Codeberg no fue accesible. No
afirmar lectura del PR3693 ni inexistencia de fixes posteriores.
[Repositorio archivado](https://github.com/Freeyourgadget/Gadgetbridge),
[archivo SPP consultado](https://raw.githubusercontent.com/Freeyourgadget/Gadgetbridge/master/app/src/main/java/nodomain/freeyourgadget/gadgetbridge/service/devices/xiaomi/XiaomiSppSupport.java).

## Siguiente evidencia: APK de la app instalada

Conviene estudiar qué mecanismos implementa Mi Fitness antes de cambiar nuestro
socket. El paquete `com.xiaomi.wearable` corresponde a la ficha Mi Fitness de
Xiaomi en Google Play; eso no verifica el certificado/origen de la instalación
concreta del usuario. Versión3.59.1i reportada, manifest/firma pendientes de leer.
[Ficha de Google Play](https://play.google.com/store/apps/details?id=com.xiaomi.wearable).

Se preparó `tools/export-mi-fitness-apk.mjs`: **plan** no ejecuta ADB; **export**
solo se ejecutará manualmente por el usuario. Usa Platform-Tools37.0.1 ya presente
del SDK del proyecto, con pins SHA256 de adb.exe y sus dos DLL. Esos pins detectan
cambios respecto al paquete local existente, no una certificación independiente
de autenticidad. SDK oficial usado en la preparación Android anterior.

Operaciones permitidas, con `-d` para exigir un único dispositivo USB:

```text
adb -d get-state
adb -d shell pm path com.xiaomi.wearable
adb -d pull <ruta base APK devuelta por pm> <archivo parcial local del proyecto>
```

Consulta solamente rutas del paquete y copia su APK base. No instala, inicia
apps, lee bases de datos/logs/claves/cuenta/salud, cambia radio, ni envía comandos
al reloj. Se usa argv directo y gramática estricta de rutas; se rechazan rutas
de datos privados, metacaracteres, múltiples bases, export anterior y cambios de
binarios SDK. Solo cabecera ZIP, tamaño y hash se comprueban durante la copia;
manifest y firma se verificarán después. Si hay splits, se informa su cantidad
y solo se copia base: la implementación relevante podría estar en un split o
en librería nativa y requerir otra inspección. No probar un socket por encontrar
una cadena/API sin demostrar su uso en RW4.
[ADB oficial: selección, package manager y pull](https://developer.android.com/tools/adb).

Resultado local en `tools/local/mi-fitness/MiFitness-base.apk` y
`export-review.json`, ambos ignorados por Git. No salida cruda de ADB, serial
del teléfono ni ruta instalada en el resumen. Rechazo/fallo puede dejar un
parcial privado, sin reintento/fallback automático. Límite256MiB, timeout120s
por llamada; un timeout es fallo, no consentimiento para escalar privilegios.

## Plan del paso manual y reversión

| Acción | Componente / persistencia | Reversión y fallo razonable | Riesgo / recuperación |
|---|---|---|---|
| Activar Opciones de desarrollador/Depuración USB, autorizar PC propio | Preferencias y autorización ADB del teléfono, persistentes | Desactivar depuración y revocar autorización al terminar | Permite acceso ADB autorizado al teléfono; usar solo PC propio |
| Ejecutar export | ADB servidor PC, query package manager y lectura APK del teléfono | Desconectar USB/desactivar depuración; fallo de autorización/lectura detiene script | Sin escritura de particiones/bootloader o firmware; no operación del reloj |
| Guardar copia y review | Filesystem PC privado y clave host ADB si el SDK necesita crearla | Borrar copia local cuando deje de ser necesaria; revocar confianza del PC en Android | No datos de cuenta/salud solicitados, no binario publicado o ejecutado |

No necesita root, desbloqueo OEM, instalación por USB ni Depuración USB
(ajustes de seguridad). Si el permiso normal no basta, reportar fallo sin
habilitar extras. El peor fallo esperable de este script es lectura denegada,
archivo parcial o copia incompleta; no hay comandos de flash/reset/unpair.
No se plantea un riesgo de soft/hard brick del reloj mediante estas lecturas
del teléfono. La recuperación de firmware del M2315W1 continúa sin validar;
esta copia no es un backup del reloj ni de los datos de Mi Fitness.

Guía propuesta:

1. En el teléfono: Ajustes → Sobre el teléfono → Información detallada y
   especificaciones → pulsar Versión del SO siete veces. Volver a Ajustes →
   Ajustes adicionales → Opciones de desarrollador → activar Depuración USB.
   Los nombres pueden variar en HyperOS3.
   [Xiaomi: acceso al menú](https://www.mi.com/global/support/faq/details/KA-168649/),
   [Xiaomi: depuración USB](https://www.mi.com/global/support/article/KA-06515/).
2. Conectar solo el teléfono por cable de datos USB al PC propio, desbloquear
   y aceptar su autorización de depuración. Bluetooth/Mi Fitness pueden seguir
   en su estado normal. Ningún cable o acción para el reloj.
3. Desde PowerShell en la raíz del proyecto, ejecutar
   `node tools/export-mi-fitness-apk.mjs export` y comunicar únicamente éxito/fallo.
4. Desconectar el cable y desactivar Depuración USB; revocar autorización del
   PC si se concedió para esta copia. No publicar ni enviar el APK a terceros.

Validación PC: `node tools/test-mi-fitness-apk-export.mjs` pasa con respuestas
ADB y ZIP **sintéticos**; verifica selección USB, comandos exactos, rutas
malformadas/privadas, no overwrite, no fallback y privacidad del resumen.
`node tools/export-mi-fitness-apk.mjs plan` pasa sin invocar ADB.
No APK real copiado ni export probado en teléfono todavía. No nuevas herramientas
instaladas, cambios de app diagnóstica, tests de radio o capturas HCI.

Alternativa diferida: AOSP documenta capturas HCI y reinicio Bluetooth para
activarlas; capturas completas añaden exposición de datos de tráfico. No se
habilitaron, prepararon ni solicitaron en esta sesión.
[AOSP: Bluetooth debug](https://source.android.com/docs/core/connect/bluetooth/verifying_debugging).

**Único siguiente checkpoint: disponer de esa copia local y revisar manifest,
firma y camino de transporte en PC sin ejecutarla.** Gates de instalación/nativo
en reloj permanecen cerrados.
