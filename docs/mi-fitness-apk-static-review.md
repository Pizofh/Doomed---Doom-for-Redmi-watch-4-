# R120 — Mi Fitness instalado: identidad, SPP y servicio Lyra

2026-10-10. El usuario exportó manualmente el APK del teléfono mediante USB.
Esta investigación posterior ocurrió en PC, sin ejecutar el APK, usar ADB real,
abrir Bluetooth o modificar RW4 Diagnostics. El reloj conserva el gate cerrado
para instalar watchfaces/código nativo o cambiar firmware.

## Resultado que cambia la investigación

Mi Fitness contiene una ruta SPP que coincide con nuestro UUID y factory segura.
También puede delegar su núcleo a un servicio externo de Xiaomi. Los logs ya
aportados contienen registros de esa delegación exitosa. Por tanto, detener
solo Mi Fitness **no demostró aislamiento de toda su ruta de comunicación**.
Que otro servicio conservara el enlace y causara E03 sigue siendo hipótesis;
no se ha comprobado el estado actual del servicio ni su transporte para RW4.

## Copia y verificación

| Campo | Resultado observado |
|---|---|
| APK base | 141427237 bytes; cuatro partes instaladas reportadas, solo base copiado |
| SHA256 revalidado en PC | `56e7bdbe139b369a72839b48d2f29e67e3df25984dd33a9b80abbbc44b511fdd` |
| Manifest binario | `com.xiaomi.wearable`, versionCode359001, versionName3.59.1i |
| SDK mínimo / target / compile | 26 / 35 / 35; no es la versión Android del teléfono |
| apksigner36.0.0 | Verifica; v2/v3/v3.1 sí; v1/v4 no; SourceStamp verifica |
| Certificado informado para API33+ | SHA256 `3fb18466b99ce7dcf5b85d4c326d88b04e076671a01259a143969905d54e0f1a` |
| Certificado informado para API24–32 | SHA256 `b031fe98a4dbb0d4d82661787f25de643182b378e9ef632d8adea75aab58f2d8` |
| Autenticidad Xiaomi independiente | Pendiente: firma válida y package coincidente no bastan para verificar el titular |
| DEX inspeccionados | 12; índice acotado completo, clases relevantes confirmadas mediante smali del SDK |

Los `false` del exporter eran verificaciones pendientes durante la copia, no
fallos de firma. Su JSON histórico se conserva intacto; el análisis posterior
está en `artifacts/research/mi-fitness-apk/review.json`, ignorado por Git.
No se verificaron los otros tres splits. No se publican APK, DEX, smali ni assets.

Herramientas oficiales ya instaladas: JDK21, apksigner/AAPT2 Build-Tools36.0.0,
apkanalyzer de Command-Line Tools. apkanalyzer sufrió primero acceso denegado
en sandbox; se autorizó su ejecución fuera de él. Su conversión del manifest
falló por una entidad `&` no escapada. AAPT2 leyó directamente los atributos del
manifest binario, sin reparar/reempaquetar el APK. El listado global de paquetes
DEX superó el buffer48MiB y se conserva **incompleto** en privado; no fundamenta
una afirmación de ausencia. Se sustituyó por un índice acotado de los doce DEX.

[SDK: apksigner](https://developer.android.com/tools/apksigner),
[SDK: lectura DEX con apkanalyzer](https://developer.android.com/tools/apkanalyzer),
[AOSP: tablas DEX](https://source.android.com/docs/core/runtime/dex-format).

## Camino SPP confirmado en código, sin atribuirlo todavía al RW4

| Clase / método | Observación estática |
|---|---|
| `com.xiaomi.wearable.spp.a` constructor | UUID `00001101-0000-1000-8000-00805F9B34FB` |
| `a.connect` | Comprueba permiso/vínculo, cierra su cliente anterior, cancela discovery si activo; si ya vinculado llama connectAfterBond |
| `SystemClient.connectAfterBond` | Usa `BluetoothDevice.createRfcommSocketToServiceRecord(SPP_UUID)` y un executor |
| `SystemClient.socketConnect` | Llama socket.connect; rama API34+ captura BluetoothSocketException y obtiene código; no canal numérico/insecure en este método |
| `zlq.d` | Construye SystemClient usando DeviceInfo.address; su constructor crea SppConnection |
| `ApiCallFactory.createApiCall` | Selecciona zlq en ramas dual/dual-core-WearOS y earphone; selecciona v23 en otra rama BLE/local-bind |
| `DeviceInfo.isDual` | Tipos6/7; no demuestra el tipo/producto asignado al M2315W1 del usuario |

El candidato `com.xiaomi.wearable.spp.b` resultó ser un objeto de parsing/datos,
**no un segundo cliente de socket**. No se dedujo un transporte de su nombre.
Hay BLE y otros proveedores Classic para otros ecosistemas dentro del APK:
su presencia no prueba compatibilidad RW4. No apareció un literal exacto RW4
en el índice de strings; eso tampoco descarta mappings descargados/obfuscados.

El indexador propio busca posibles referencias dentro de code items; **no
decodifica límites de instrucciones** y puede producir falsos positivos en
operandos/payloads. Sus candidatos solo sirven para localizar clases. Las
conclusiones anteriores se confirmaron leyendo métodos smali con apkanalyzer.
No se incorporó código propietario de Xiaomi al port o a nuestra app.

## Delegación del núcleo: evidencia nueva

`MiWearCoreClient` contempla modos INDEPENDENT, AUTO_SWITCH, SERVICE y CLIENT.
En `runningAsClient`, llama a RemoteServiceConnector y marca remoteServiceInUse
si bind retorna true. `RemoteServiceConnector.bindService` construye un Intent
para `CoreExtKt.targetPackageName()` con acción `<package>.MiWearCoreService`.
El destino por defecto es `com.xiaomi.mi_connect_service`; puede sobrescribirse.
`useRemoteService()` exige soporte, Lyra habilitado y permiso según sus guards.
El manifest solicita `com.xiaomi.mi_connect_service.permission.MI_WEAR_CORE`;
su nivel de protección efectivo y posibilidad de acceso para nuestra app aún
no están establecidos. No se intentó bind ni añadir ese permiso a nuestra app.

Se creó un filtro de **conteos fijos** para los cuatro logs privados existentes.
No exporta líneas, IDs, direcciones, claves, timestamps o nombres de unidades.

| Marcador | Líneas coincidentes agregadas |
|---|---:|
| useLyra: soporte/habilitado/permiso todos true | 178 |
| runningOnClient | 178 |
| bind lyra service result true | 178 |
| bind lyra service result false | 0 |
| Nombre de paquete mi_connect_service | 356 |
| MiWearCoreService | 178 |
| Inicio/fallo del SystemClient socket | 0 |

Son **registros agregados**, posiblemente duplicados entre logs/backups, no
178 conexiones Bluetooth distintas. Demuestran marcadores de delegación IPC en
el historial aportado, no el estado actual del teléfono, tipo de dispositivo,
canal remoto, causa de E03 o éxito de autenticación de nuestra app.

## Reproducción en PC

```powershell
node tools/inspect-mi-fitness-apk.mjs review
node tools/index-mi-fitness-dex.mjs
node tools/inspect-mi-fitness-apk.mjs code-batch com.xiaomi.wearable.spp.SystemClient system-client com.xiaomi.wearable.spp.a spp-base com.xiaomi.wearable.core.server.ApiCallFactory api-factory com.xiaomi.wearable.core.client.RemoteServiceConnector remote-connector com.xiaomi.wearable.core.CoreExtKt core-environment
node tools/test-mi-fitness-core-service.mjs
node tools/check-mi-fitness-core-service.mjs
```

El lector verifica tamaño/hash antes de llamar al SDK y escribe resultados
privados bajo artifacts; nunca carga clases del APK como código. Solo ejecuta
lectores oficiales del PC. El SDK puede requerir la autorización fuera del
sandbox ya descrita. Índice completo y métodos SDK relevantes inspeccionados;
tests sintéticos de privacidad/decisiones pasan. Exporter con ambos paquetes
fijos probado con fakeADB/ZIP: sin llamadas físicas por nuestras herramientas.

## Único siguiente checkpoint: inspección estática del servicio

Antes de otro intento Bluetooth, copiar el APK instalado de
`com.xiaomi.mi_connect_service` para verificar manifest/firma y estudiar su
gestión de conexiones. Se preparó `plan-core`/`export-core` en el exporter
existente: solo dos paquetes fijos, sin selector arbitrario o fallback.

Plan concreto, **ejecución manual del usuario**, no automática:

```text
adb -d get-state
adb -d shell pm path com.xiaomi.mi_connect_service
adb -d pull <base APK path devuelto por pm> <parcial local del proyecto>
```

| Propiedad | Alcance |
|---|---|
| Componente afectado | Lectura del package manager/APK instalado en el teléfono; copia en PC |
| Escrituras persistentes | Preferencias/autorización USB del teléfono si se reactivan; archivo/host ADB en PC. Ninguna escritura al reloj |
| Reversión | Desconectar USB, desactivar depuración, revocar autorización del PC si concedida para esta copia |
| Peor fallo razonable | Paquete ausente, lectura denegada, ruta no permitida, archivo parcial o límite256MiB; detener sin root/fallback |
| Soft/hard brick del reloj | No se plantea mediante estas consultas/copia; no envían comandos al reloj ni escriben firmware |
| Recovery / compatibilidad M2315W1 | No necesita mecanismo del reloj para esta lectura del teléfono; recovery del reloj sigue sin validar |

Destino ignorado: `tools/local/mi-connect-service/MiConnectService-base.apk`.
No detener/deshabilitar el servicio, cambiar permisos Xiaomi, desvincular el
reloj, capturar HCI, instalar APKs o conectarse a sus interfaces. No respaldo
de firmware/datos. Este checkpoint aún **no se ha ejecutado**.

Con la misma autorización USB normal del teléfono usada antes:

```powershell
node tools/export-mi-fitness-apk.mjs export-core
```

Al terminar, desconectar cable y desactivar Depuración USB. No modificar la
copia anterior de Mi Fitness, ni repetir PROBE/QUERY. Si export-core falla,
informar solo la línea de error; no cambiar a root, firmware o rutas privadas.
