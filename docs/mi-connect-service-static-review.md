# R121 — servicio Xiaomi: acceso restringido y ciclo de conexión

## Actualización R123 — papelera identificada por capturas y código

2026-10-10. Dos capturas aportadas muestran la papelera en «Dispositivos», con
RW4 «Conectado» y mensaje de sincronización exitosa; «Desvincular» aparece en
«Más», junto a versión del dispositivo2.2.86. Son controles y pantallas distintos.
Las imágenes muestran el estado de la UI en ese momento; no prueban por sí
solas un transporte, servicio ocupado o la causa de E03.

Se revisaron con el SDK oficial las clases ManagerActivity, ManagerViewModel,
ivg y ManagerActivity$confirmUnbound$1 del mismo APK Mi Fitness verificado en
R120. El botón final de la barra tiene descripción common_delete; ivg.onClick
llama B→onCreate$lambda$0→onTitleBarEndViewClicked. Fuera de edición, este
handler activa changeDisplayMode(true) cuando hay elementos, salvo una rama
condicionada de aviso de ahorro de energía. changeMode cambia el modo de UI y
notifica al adaptador; no es una llamada a disconnect.

La acción de eliminación de una fila llega a confirmUnbound. Su callback de
confirmación positiva, con red disponible, llama unbind→
ManagerViewModel.unbindDevice→DeviceManager.unbindDevice. **La papelera inicia
gestión para eliminar/desvincular; no proporciona la pausa temporal buscada.**
No se pulsó ni confirmó nada en el teléfono; no se ejecutó bytecode del APK,
ADB, Bluetooth o comandos del reloj. La revisión adicional de DeviceInfoFragment
no se usa como prueba de equivalencia exacta entre las dos rutas completas.

Salidas smali privadas: manager-activity.txt, manager-view-model.txt,
manager-title-click.txt y manager-unbind-confirm.txt bajo artifacts/research/
mi-fitness-apk (ignorados por Git). Un primer intento de clase «livg» falló por
interpretar la L de un descriptor como parte del nombre; corregido a «ivg».
No se publican esas salidas ni se copian las capturas al repositorio.

Checkpoint de identificación de controles cerrado. No se propone otro PROBE
ni cambios de autostart como prueba de aislamiento; aún falta una ruta temporal
soportada que libere la conexión y permita restaurarla sin desvinculación.

## Actualización R122 — controles de UI e inicio automático

2026-10-10. El usuario no encuentra Desconectar, Conexión automática o
Interconectividad en la pantalla inspeccionada. Describe **dos controles
distintos**: «Desvincular» y un icono de papelera. Se corrige la suposición
inicial del asistente de que eran el mismo control. La función de la papelera
no se ha identificado; no se recomienda pulsarla ni abrir una confirmación.
Esto no demuestra que toda la app carezca de una pausa de conexión.

El usuario cree que Mi Fitness tiene inicio automático habilitado en Android;
su estado no está confirmado. [Xiaomi documenta el permiso de autoinicio](https://dev.mi.com/xiaomihyperos/documentation/detail?pId=1624)
y [recomienda mantener Mi Fitness en segundo plano para RW4](https://www.mi.com/global/support/faq/details/KA-91967/).
Ninguna de esas fuentes demuestra que desactivar el inicio automático cierre
un socket existente del servicio Lyra. No se solicita cambiar ese ajuste,
deshabilitar un servicio, desvincular o repetir PROBE.

Siguiente lectura: identificar la ubicación y etiqueta de ambos controles con
una captura recortada de la pantalla, ocultando identificadores. No requiere
otra APK ni una operación Bluetooth. El análisis R121 que sigue es histórico.

2026-10-10. El usuario completó `export-core` manualmente por USB. Todo el
análisis posterior ocurrió en PC, sin ADB real por el agente, ejecución de APK,
bind al servicio, Bluetooth o cambios en el reloj. El usuario dispone únicamente
del teléfono HyperOS actual; no se propone migración/emparejamiento en otro móvil.

## Resultado

El servicio exportado incluye el endpoint Lyra utilizado por Mi Fitness y una
implementación SPP con el mismo UUID/factory pública segura que revisamos antes.
Su API operativa comprueba el paquete y certificado del llamante: **nuestra app
no figura en la lista admitida**. Añadir un permiso al manifest no resolvería
ese control. Esto limita esa API concreta, no demuestra que haga falta root o
que una app independiente no pueda usar RFCOMM mediante Android.

El recorrido revisado al morir el cliente no desconecta todos los dispositivos
vinculados. El servicio puede recuperar su dispositivo guardado y programar
reconexión. Eso refuerza la hipótesis de competencia por el enlace, pero aún
**no identifica la causa de E03 ni prueba un socket RW4 activo durante PROBE**.

## Identidad y alcance de la copia

| Campo | Evidencia local |
|---|---|
| Archivo / partes | APK base30540367bytes; una parte instalada reportada |
| SHA256 verificado | `ba8ab69da2808d8273e2dc68ac4944fc3587650f6e597542f94fffd5d2cbbaff` |
| Manifest binario AAPT2 | `com.xiaomi.mi_connect_service`, versionName5.1.251.10, versionCode50012513 |
| SDK mínimo / target / compile | 28 / 35 / 35; corresponde al APK del teléfono |
| apksigner36.0.0 | Verifica; v3 sí, v1/v2/v3.1/v4 no; ausencia de otros esquemas no es fallo de esta verificación |
| Certificado SHA256 | `c9009d01ebf9f5d0302bc71b2fe9aa9a47a432bba17308a3111b75d7b2149025` |
| sharedUserId declarado | `android.uid.system`; UID efectivo y proceso actual no consultados al teléfono |
| DEX | Tres: clases.dex8639clases, clases2.dex7958, clases3.dex2133; índice completo |
| Código nativo incluido | Bibliotecas arm64-v8a del teléfono; no se ejecutaron ni son evidencia de ISA/ABI RW4 |

Firma criptográfica válida no equivale a contraste independiente del titular
Xiaomi. `export-review.json` conserva las verificaciones pendientes originales;
el review posterior es privado en `artifacts/research/mi-connect-service-apk/`.
APK/smali/índices completos no se publican o incorporan al port. No herramientas
nuevas instaladas. El lector Java requirió autorización fuera del sandbox tras
acceso denegado, igual que en R120; AAPT2/apksigner leyeron la copia correctamente.

## Entrada al servicio y controles

| Tramo confirmado mediante SDK smali | Comportamiento |
|---|---|
| Manifest | `com.xiaomi.wearable.core.MiWearCoreService` exported=true; acción `com.xiaomi.mi_connect_service.MiWearCoreService` |
| onBind | Devuelve ICoreInstance; no basta para obtener la interfaz operativa |
| coreInstance.getMiWearCoreBinder | Obtiene identidad del caller; verifica checkCert antes de devolver IMiWearCoreImpl; falla con SecurityException si no autorizado |
| `eb.d.a` | Usa Binder.getCallingUid y PackageManager.getNameForUid; identidad no elegida mediante un string por nuestra app |
| PermissionChecker.checkCert | Lista interna con `com.mi.health` y `com.xiaomi.wearable`; rechaza package ausente; verifica firma/historial contra certificados permitidos |
| PermissionChecker.checkCallPermission | Admite esos dos paquetes en los métodos donde se invoca |

El certificado histórico de Mi Fitness reportado para API24–32 coincide con la
huella MD5 permitida para com.xiaomi.wearable; el checker obtiene
getSigningCertificateHistory. Esa coincidencia explica una compatibilidad
estática con rotación, no confirma el resultado de una llamada real en Android36
ni es una certificación independiente de autenticidad. No se falsificó paquete,
certificado o identidad Binder, ni se intentó obtener el binder del teléfono.

MI_WEAR_CORE aparece como permiso solicitado, **no definido** en este manifest.
No se le atribuye el protectionLevel de otros permisos definidos aquí. Su nivel
efectivo aún es desconocido; la barrera de certificado ya es evidencia directa.
Exported=true permite exposición entre apps, pero no elimina controles de
permiso o de código.
[Android: servicio exportado y permisos](https://developer.android.com/guide/topics/manifest/service-element),
[Android: definición de permisos](https://developer.android.com/guide/topics/manifest/permission-element).

## Ruta SPP y lifecycle

`ApiCallFactory` selecciona `com.xiaomi.wearable.wear.api.l` para ciertas ramas
dual/earphone. `l.i` crea `ib.o` con DeviceInfo.address y una bandera
createBondWithoutDialog. `ib.e` inicializa UUID1101 y gestiona vínculo/discovery;
`ib.o.g` usa createRfcommSocketToServiceRecord y `ib.o.o` llama socket.connect.
No ruta RW4 concreta deducida del tipo genérico; mapping M2315W1 aún pendiente.

Existe una rama opcional anterior a connect que enlaza con
`com.xiaomi.bluetooth`/MiuiNearbyApiService para creación de vínculo sin diálogo.
Depende de esa bandera del dispositivo, cuyo valor RW4 no conocemos. Es una
diferencia real de código frente al cliente de R120, **no una solución probada**
ni motivo para repetir un vínculo ya existente. No se copiaron APIs ocultas o
privadas a nuestra app, ni se modificó el vínculo del reloj.

`IMiWearCoreImpl.initCurrentDevice` puede recuperar DeviceInfo del almacenamiento
propio del servicio y llamar connectDeviceIfNeed; este último programa trabajo
con retraso3000ms y consulta si la conexión está activa. No se leyeron esos datos
privados del teléfono. `onClientDied` cancela una tarea de transferencia mediante
gb.a y, en binding mode, cierra conexiones sin autenticar que no figuren entre
las ya vinculadas. El helper gb.a revisado cancela una tarea; no llama a una
desconexión general. Nada de esto garantiza que el servicio sobreviva a cualquier
acción del OS; demuestra que la muerte del cliente no obliga al cierre general
en ese recorrido.

Hay un método distinto `disconnect(did)`: desconecta su WearApiCall y, si inLyra,
guarda un flag disconnect_device en SharedPreferences del teléfono. **No es solo
RAM**. No se invocó. Restaurar su comportamiento requiere comprender la ruta
normal de conexión que revierte ese estado, antes de proponer un cambio.

## Búsqueda de desconexión normal en Mi Fitness

Se confirmó una llamada normal BaseDeviceModel.disconnectDevice→
IMiWearCoreClient.disconnect, y otra cuando BluetoothDeviceModel deja de ser el
dispositivo actual. Son implementaciones internas, no botones disponibles
garantizados en la UI global del usuario.

Los candidatos UI revisados están asociados a cambiar de dispositivo/app y
ConnectNewPhoneActivity. Este último también cambia bind-new mode; la elección
de app incluye envío de user setting a través de DeviceSettingManager. No se
presentan como una simple pausa de Bluetooth ni se recomienda abrir esas rutas
para esta prueba. No se ejecutó disconnect/removeBond/unbind, logout, cambio de
región, selección de otra app o cambio de teléfono.

## Reproducción y comprobaciones

```powershell
node tools/inspect-mi-fitness-apk.mjs --core review
node tools/index-mi-fitness-dex.mjs --core
node tools/inspect-mi-fitness-apk.mjs --core code-batch com.xiaomi.wearable.core.MiWearCoreService core-service com.xiaomi.wearable.core.server.PermissionChecker permission-checker ib.o system-spp-client ib.e spp-base
node tools/inspect-mi-fitness-apk.mjs --core code-batch 'com.xiaomi.wearable.core.MiWearCoreService$coreInstance$2$1' binder-instance eb.d calling-context com.xiaomi.wearable.core.server.IMiWearCoreImpl core-impl gb.a client-death-helper
```

Los dos scripts comparten perfiles fijos con hashes/tamaños separados para ambos
APKs. El indexador deja nombres de clase en artifacts ignorados para localizar
candidatos sin emitir strings crudos; no ejecuta bytecode. Scanner de referencias
no es disassembler: sus71candidatos del servicio y68de Mi Fitness al ampliar la
búsqueda no son llamadas válidas garantizadas. Conclusiones confirmadas en
métodos SDK smali, no por presencia de cadenas. Hashs se revalidaron y no cambió
ningún APK. No se repitieron suites Android o builds que no afecta este análisis.

## Siguiente checkpoint y riesgos

**Encontrar una desconexión temporal soportada en este teléfono, con una ruta
de restauración conocida y verificable, antes de otro PROBE.** Continuar primero
con investigación PC de UI/ciclo de conexión. Usuario no tiene otro Android.

Se solicitó únicamente lectura de la pestaña Dispositivo de Mi Fitness para
saber si muestra Desconectar/Conexión automática/Interconectividad: nombres de
opciones, sin cambiar ajustes, desvincular o cambiar teléfono. Esta lectura
de la UI no requiere instalar otra APK ni ejecutar comandos. Respuesta recibida
y corregida en R122 arriba; falta identificar la papelera distinta de Desvincular.

No se prepara una orden force-stop/disable/clear/uninstall del servicio de sistema:
es compartido por otras funciones del teléfono y falta determinar el efecto.
No usar la API restringida evadiendo su identidad. No volver a transferir un APK
diagnóstico solo para añadir etiquetas de debug. Si la investigación conduce
a una prueba física distinta, documentar comandos, componentes, persistencia y
reversión antes de solicitarla; ningún paso físico se ejecuta automáticamente.

Esto no aporta backup/recovery RW4, ABI nativa, acceso al filesystem del reloj,
loader ELF o persistencia Doom. Firmware, instalación y nativo M2315W1 siguen
cerrados. No hay evidencia aquí de que se necesite root/jailbreak del reloj.
