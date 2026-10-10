# R106 — diagnóstico consolidado, una actualización

**Actual R131:** [diagnóstico interno de apertura compilado y plan](android-opening-diagnostic-r131.md).
Un APK reúne clasificación R01/R02/U00, resultado de lectura L01/L02/L00 y
revisión del intento, además del toolkit existente. Fuentes/PC tests/build/
manifest/firma/DEX revisados. No corregida aún la conexión ni probado en teléfono;
un PROBE manual propuesto, sin consulta batería/autenticación o cambios de ajuste.

**Actual R114:** [inventario de servicios implementado](rw4-service-inventory.md)
como opción adicional del mismo toolkit. Requiere un ticket propio y se ejecuta
en Activity de primer plano; no abre nuestro socket/protocolo. Informes de
conexión anterior e inventario separados. Pruebas PC pasan, ejecución Android
real pendiente. No volver a repetir PROBE por más etiquetas. El texto inferior
conserva el historial de r106 y sus intentos.

**Actual R113:** [PROBE con permiso Mi Fitness denegado falla igual](rw4-permission-isolated-probe-result.md).
Connect386ms/G08, sin auth/GET, retorno normal por reporte tras restaurar permisos.
No más intentos iguales: servicio/endpoint actual aún por identificar.
APK sin cambios; guías inferiores son historial de ensayos anteriores.

**Actual R109:** [segundo PROBE r106 y plan de permiso Nearby](rw4-bluetooth-profiles-result.md).
Fallo connect151ms/G08, cierre local registrado; no auth/GET. Posible actividad
Mi Fitness observada por notificación, aún sin causa confirmada. Retorno actual
pendiente; no ejecutar QUERY ni más PROBE hasta revisar aislamiento. APK sin cambios.

**Actual R107:** [ensayo manual PROBE realizado](rw4-bluetooth-probe-result.md).
Falló en `connect()` antes de protocolo/auth, con G08, y registró cierre local.
El usuario informa funcionamiento de ambos y ~18 pasos de diferencia. No guiar
QUERY/reintento: comparte el mismo socket que falló. Los estados pendientes y
la guía de primer ensayo inferiores describen la preparación histórica R106.

**APK listo:** `artifacts/android-diagnostic-r106/RW4Diagnostics-r106.apk`,
versión `0.94.0-rw4-diagnostic-r106`,31411032 bytes. SHA256:
`2223db7255f8e864400a58111eb1666839c5c57754952db8ce1b64149e70539c`.
Inspector pasa: mismo package, debugfalse,10 permisos, sin INTERNET ni bindings
sensibles. apksigner oficial verifica v1/v2 y mismo certificado SHA256
`47eeb041e241c7ab785ed8bdcf06c6fcce90020e52d4794aa3c6c66590577709`.
Build final SUCCESSFUL1m58s/73 tareas (10 ejecutadas); anteriores builds de
revisión fueron solo PC, no entregados ni instalados. lintVital pasa con
baseline upstream, sin afirmar auditoría exhaustiva. Firma asegura integridad,
no inocuidad. Instalación/UI/radio de r106 pendientes del usuario.

2026-10-09. El usuario pide reunir las herramientas antes de entregar otro
APK, evitando actualizar por cada nuevo detalle. Esta revisión prepara la
app completa para la etapa Bluetooth/auth/GET; no incluye instalar watchfaces,
firmware o código nativo en el reloj.

## Herramientas en el mismo APK

Tocar la tarjeta del RW4 abre un menú local:

1. **Informe y caché local:** estado de permisos/Bluetooth/discovery, caché
   B/T/S o C, traza, tiempos, error detallado, modo y datos recibidos.
2. **Probar solo Bluetooth:** apertura del socket seguro SPP por SDP y cierre;
   retorna antes del lector/inicialización del protocolo Xiaomi. No auth/GET.
3. **Consultar batería e información:** conserva el handshake y whitelist
   r101 para batería/modelo/firmware. No uploads/syncTime/perfil/otros servicios.
4. **Cancelar sesión:** cancela también el ticket todavía pendiente y bloquea
   las salidas mientras el servicio procesa la desconexión.

Las acciones físicas tienen confirmación independiente con descripción del
modo. Abrir el menú o informe no inicia ninguna de ellas. No encadenamiento
automático probe→auth ni selección alternativa de BLE/canales/insecure sockets.
Una sola aceptación por proceso, ticket5s y sesión30s siguen vigentes.
El modo está ligado al ticket en memoria, no a un extra manipulable del intent.
Una cancelación consume/invalida el ticket; un intent tardío no puede conectarse.

El informe actualiza la traza en vivo, permite **Copiar informe**, cancelar y
cerrar/cancelar mediante Atrás. Quitar el diálogo elimina su refresco. Resultados
se conservan en preferencias privadas del teléfono, sin claves/MAC/seriales/
paquetes/excepciones crudas. No activa ni exporta logs generales de Gadgetbridge.
Modelos y firmware recibidos se incluyen solo si pasan formatos explícitos;
campos desconocidos no se copian. La clave se comprueba solo por formato para
QUERY (32 hex, con prefijo0x opcional); no se exporta valor/longitud/hash, ni se
afirma que un formato correcto implique clave válida. PROBE no lee la clave.

## Detalles reunidos

| Grupo | Información |
|---|---|
| P00–P05 | Preflight local: permisos, adaptador, encendido, discovery activo/error |
| B/T/S/C | Vínculo, tipo y SPP guardados en caché; pueden estar desactualizados |
| D01–D13/E01–E09 | Solicitud, soporte, socket, protocolo, nonce/auth, GET y cierre/límite |
| D14/D15/D16 | Probe terminó, ambos GET recibidos, cancelación solicitada |
| D17/E10/D18 | close devolvió éxito/error, socket creado antes de conectar |
| D19/D20/D21/E12/E13 | Protocolo seleccionado por cliente, HMAC verificado/no coincide, error local de auth |
| A00–A21/A99 | Categorías fijas del código oficial BluetoothSocketException |
| G00–G08 | IOException/seguridad/excepción local y patrones conocidos sin exponer mensaje |
| Tiempos | Milisegundos relativos a la solicitud; máximo24 entradas y valores0..60000 |
| Cierre/error | Si ya se había solicitado cierre local cuando se guardó el error |

API34 se accede mediante clase aislada/guard; el teléfono es Android16, minSDK
de la app sigue siendo23. [Android documenta los códigos](https://developer.android.com/reference/android/bluetooth/BluetoothSocketException#getErrorCode()).
Los códigos A04/A06 describen seguridad del enlace Bluetooth, no validación de
la clave Xiaomi. G08 conserva la ambigüedad del mensaje que menciona cierre
o timeout: no inventa cuál ocurrió. Android puede seguir devolviendo un fallo
genérico, incluso con toda esta instrumentación.

En éxito del probe se cierra antes de cualquier inicialización; el gate de
lectura/salida deniega sus payloads además de ese retorno. Tras recibir ambos
GET se solicita cierre sin esperar30s. Fallos del socket solicitan desconexión
inmediata. El deadline es monotónico; una conexión que devuelve tarde se cierra
antes de inicializar. El timer/close son una solicitud local de cancelación,
no garantía de instante exacto de cierre radio ni watchdog del reloj. D17
significa que la llamada Java close retornó, no que todos los perfiles del
reloj se desconectaron. Un write admitido antes de cancelar puede estar en curso.

## Reproducción y validación PC

```powershell
node tools/prepare-android-diagnostic.mjs
node tools/test-android-diagnostic-policy.mjs
node tools/test-android-bluetooth-cache.mjs
node tools/test-android-diagnostic-status.mjs
node tools/test-android-diagnostic-queue.mjs
node tools/android-build.mjs refresh
node tools/android-build.mjs build
node tools/inspect-android-diagnostic.mjs
# apksigner oficial, reporte artifacts/research/android-diagnostic-apksigner-r106.txt
node tools/package-android-diagnostic.mjs
```

Pasan política/payloads, tiempo monotónico, tickets/concurrencia/modos,
cancelación previa a consume, traza acotada, categorías/privacidad, caché y
Status real con stubs (API guard, timeout, reset, retención, preferencias
corruptas). Comprobaciones de fuente: menú local, consume obligatorio, probe
retorna antes de lector/protocolo y gates sin envíos. WriteAction real prueba
expiración, copia de payload y cierre durante lookup. No equivale a un ensayo
UI Android, prueba radio real ni medición de latencia de cierre en teléfono.

## Plan manual para el próximo intento, sin ejecución automática

Unidad conocida: M2315W1, firmware mostrado2.2.86; teléfono Android16/HyperOS
3.0.302.0, Mi Fitness3.59.1i. Fuente upstream reconoce RW4 como experimental;
la caché real B01/T01/S01 coincide con Classic/SPP. Eso no prueba endpoint
actual ni autenticación en esta build. Dos fallos previos antes de auth/GET;
Mi Fitness y reloj normales después, confirmado. No repetir dichos builds.

Actualizar nuestra app sobre la existente (mismo package/cert), conservar
datos/vínculo/clave. No usar Añadir, cambiar bond o conceder accesos nuevos.
Para el primer ensayo r106: detener Mi Fitness, abrir app/tocar tarjeta,
**Probar solo Bluetooth → Iniciar este intento**. Esa confirmación manual
inicia la operación; al terminar o al límite, Copiar informe, cerrar y volver
a Mi Fitness. Compartir únicamente ese informe saneado y confirmar uso normal.
Si Android pide un nuevo emparejamiento, cancelar y reportar; no aceptarlo.
No ejecutar QUERY automáticamente después. Está en el mismo APK para un paso
manual posterior revisado; no habrá que reinstalar para cambiar de modo.

| Aspecto | Probe | QUERY disponible, separado |
|---|---|---|
| Operación | createRfcommSocketToServiceRecord(UUID1101), connect, close | Mismo enlace, handshake y GET2/1,2/2 |
| Componente | Bluetooth Classic/SDP del teléfono y reloj | Transporte/auth stock y consultas |
| Persistencia explícita | APK/informe privados del teléfono | Igual; efectos internos de auth del reloj desconocidos |
| Escritura particiones/bootloader/firmware imagen | Ninguna implementada | Ninguna implementada |
| Reversión prevista | Cancelar/cerrar, abrir Mi Fitness | Igual, sin garantizar reversión de estado interno de auth |
| Peor fallo razonable | Fallo de enlace, app/reloj sin respuesta temporal o imposibilidad temporal de reconectar | Igual más posibles efectos de autenticación sin documentar |
| Soft/hard brick | No observado ni mecanismo de escritura de firmware implementado; riesgo no cuantificado | Sin prueba exitosa en2.2.86; no equiparar a cargar código kernel |
| Recovery conocido | Uso normal de Mi Fitness/reloj probado después de fallos previos; reboot físico12s documentado | No recuperación integral de firmware corrupto documentada |

No hay backup integral validado ni flasheo/recovery completo. Se conservan
watchfaces/apps del usuario; la app no permite publicarlas/instalarlas por
estos modos. No asegurar que un reboot revierta toda persistencia interna.
Instalación de Doom/nativo sigue fuera de este paso. Este plan documenta una
operación concreta de diagnóstico; no amplía permiso a tests automáticos o
otros mecanismos. El APK se prepara en PC; ensayo manual r106 pendiente.
