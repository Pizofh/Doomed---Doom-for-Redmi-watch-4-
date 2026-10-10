# R124 — observar Lyra sin intentar otra conexión

## R126 — baseline recibida y lector ampliado en PC

2026-10-10. Después de stopped, el usuario aporta baseline con
miFitnessStopped=false, serviceFormatRecognized=true, activeCoreRecords=0 y
coreProcessRecord=not-established; confirma Mi Fitness conectada y sincronizando
normalmente. No se guarda como una secuencia temporal baseline→stopped: las
lecturas recibidas fueron stopped→reapertura→baseline. Ambas usan el lector R124.

```json
{"checkpoint":"R124","label":"baseline","serviceFormatRecognized":true,"activeCoreRecords":0,"coreProcessRecord":"not-established","miFitnessStopped":false,"currentWatchSocketVerified":false,"rawOutputSaved":false,"bluetoothOperationRequested":false,"watchCommandRequested":false}
```

No hay evidencia nueva de Lyra reteniendo el socket. Se detecta una limitación
reproducible del lector: R124 reconocía solo la cabecera, y emitía cero incluso
con cuerpo ausente/no compatible. **No se demuestra que esa limitación haya
causado los ceros del teléfono**: el cuerpo no se guardó, deliberadamente.

Manifest de ambos APKs ya revisados declara MiWearCoreService, con paquetes
distintos. Se amplía la lectura a servicios de ambos paquetes fijos para evitar
presuponer que el componente remoto es el que se usa en esta sesión. Presencia
de un servicio local tampoco demuestra que ese servicio atienda al RW4.

### Plan actual, reemplaza la consulta manual R124

Con Mi Fitness conectada normalmente y USB autorizado, ejecutar **una** lectura:
`node tools/phone-core-state.mjs collect baseline`. No detener Mi Fitness, cambiar
permisos/autostart o ejecutar PROBE. El script actual emite checkpoint R126:

```text
adb -d get-state
adb -d shell am get-current-user
adb -d shell dumpsys activity services com.xiaomi.mi_connect_service
adb -d shell dumpsys activity services com.xiaomi.wearable
adb -d shell dumpsys package com.xiaomi.wearable
```

Mismo ADB fijado, usuario-manual, consultas sin --client, sin radio o ejecución
de componentes app solicitada. Scope nuevo: metadatos de servicios de dos
paquetes concretos, procesados en RAM; dumps no almacenados ni publicados.
El JSON incluye remote/local con cabecera reconocida, marcador explícito
`(nothing)`, secciones activas, registros parseados/no reconocidos, contador
del core para el usuario actual y agregado para otros usuarios (sin IDs).
Nombres cortos del componente se normalizan; estados desconocidos devuelven
null, no cero. ProcessRecord asignado sigue sin probar socket o hilo vivo.

Esta lectura no modifica almacenamiento del reloj/teléfono, particiones,
bootloader o firmware. Depuración/autorización USB mantiene el riesgo/reversión
del plan R124: al terminar desconectar, desactivar/revocar. Peor fallo razonable
de la consulta: denegación, timeout o formato no reconocido; no soft/hard brick
RW4 esperado ni recovery integral proporcionado. No requiere nuevo APK.

Tests PC pasan: cabecera sola→null, vacío explícito→0, registros no reconocidos,
componente corto/local, usuarios distintos, reinicio, canarios privados y cinco
comandos fijos mediante fakeADB. Plan/sintaxis pasan; no ADB físico por agente.
Resultado R126 del teléfono pendiente. Si no se reconoce cuerpo, no usar sus
contadores para concluir aislamiento o elegir transporte.

El historial R125/R124 que sigue conserva sus salidas originales.

## Resultado parcial R125 — stopped recibido

2026-10-10. El usuario aporta la salida de `collect stopped`:

```json
{"checkpoint":"R124","label":"stopped","serviceFormatRecognized":true,"activeCoreRecords":0,"coreProcessRecord":"not-established","miFitnessStopped":true,"currentWatchSocketVerified":false,"rawOutputSaved":false,"bluetoothOperationRequested":false,"watchCommandRequested":false}
```

Android reporta Mi Fitness stopped=true. El lector reconoce la cabecera de
servicios y no encuentra registros activos del componente Lyra filtrado para
el usuario consultado. **No demuestra socket libre, proceso del paquete ausente
o causa de E03.** Tampoco confirma que el formato completo HyperOS se corresponda
con el parser: falta una baseline positiva de comparación. La hipótesis de Lyra
persistente no queda respaldada por esta lectura parcial; no se declara refutada.

Falta recibir baseline (si ya fue ejecutada, recuperar su JSON de la terminal)
y confirmar que Mi Fitness vuelve a sincronizar tras abrirla. No repetir
stopped/PROBE ni cambiar ajustes. Solo salida aportada, sin ADB real por el agente.
El plan y sus resultados sintéticos que siguen corresponden a R124.

2026-10-10. Objetivo: comparar el registro del servicio MiWearCoreService y el
flag Android stopped de Mi Fitness antes/después de detener únicamente Mi Fitness.
No identifica sockets ni demuestra la causa de E03. Resultado físico pendiente.

## Investigación PC completada

CoreExtKt.isLyraEnabled lee SharedPreferences `version_v3_<versión>` con valor
predeterminado true; setLyraEnabled guarda ese booleano. El índice DEX ampliado
localiza dos candidatos de llamada, ambos confirmados en el mismo callback de
muerte de Binder de RemoteServiceConnector: desactivación tras crashChecker o
reintento de enlace fallido. No se encontró mediante esta búsqueda de llamadas
directas un control de UI normal que escriba ese flag. No descarta reflexión,
código nativo, splits u otros controles; no provocar fallos ni editar preferencias.

El índice completo del APK base pasó de68 a70candidatos al añadir ese setter.
Los candidatos siguen incluyendo posibles operandos/payloads; las dos llamadas
nuevas fueron comprobadas en SDK smali ya disponible. No se ejecutó APK ni ADB.

## Lectura preparada

[dumpsys](https://developer.android.com/tools/dumpsys) permite consultar diagnóstico
de servicios del sistema. Se usa `activity services` (plural), sin `--client` ni
el subcomando `activity service` que puede solicitar un dump al componente app.
El formato de registros/proceso tiene referencia en [AOSP ActiveServices](https://android.googlesource.com/platform/frameworks/base/+/refs/heads/pie-release/services/core/java/com/android/server/am/ActiveServices.java)
y [ServiceRecord](https://android.googlesource.com/platform/frameworks/base/+/refs/heads/main/services/core/java/com/android/server/am/ServiceRecord.java).
Estas fuentes son Android upstream, no garantía de formato HyperOS: el lector
devuelve unknown/null ante campos no reconocidos y no interpreta ausencia como
servicio detenido. ProcessRecord asignado tampoco prueba socket abierto o hilo vivo.

`node tools/phone-core-state.mjs plan` muestra el plan y NO inicia ADB. Solo
`collect baseline` o `collect stopped`, ejecutado manualmente por el usuario,
hace estas cuatro lecturas fijas con ADB oficial37.0.1, binarios previamente fijados:

```text
adb -d get-state
adb -d shell am get-current-user
adb -d shell dumpsys activity services com.xiaomi.mi_connect_service/com.xiaomi.wearable.core.MiWearCoreService
adb -d shell dumpsys package com.xiaomi.wearable
```

Solo USB, un teléfono autorizado; sin selección por serie ni conexión inalámbrica.
Datos de diagnóstico se procesan en RAM del PC: no se imprimen/guardan dumps,
direcciones, PID, UID, seriales, claves o campos libres. Sale JSON de esquema fijo
con label, formato reconocido, número de registros activos para el usuario actual,
asignación ProcessRecord/null/no establecido y miFitnessStopped true/false/null.
Los límites y errores bloquean la consulta; no fallback ni comandos adicionales.
Consultas consecutivas, no snapshot atómico: estado puede cambiar entre ellas.

## Procedimiento manual y reversión

1. Conectar solo teléfono por USB y autorizar depuración normal en este PC.
   No activar desbloqueo OEM ni permisos de instalación/depuración de seguridad.
2. Con Mi Fitness conectada normalmente, ejecutar desde la raíz del repo:
   `node tools/phone-core-state.mjs collect baseline`.
3. En ajustes Android de **Mi Fitness**, pulsar Forzar detención. Mantener los
   permisos, autostart y Bluetooth como están; no detener/deshabilitar servicio Xiaomi.
4. Sin reabrir Mi Fitness ni probar nuestra app, ejecutar
   `node tools/phone-core-state.mjs collect stopped`.
5. Abrir Mi Fitness y comprobar que vuelve a sincronizar; desconectar USB y
   desactivar depuración/revocar autorización al terminar. Compartir solo ambos JSON.

| Acción | Componente / persistencia | Reversión / peor fallo razonable |
|---|---|---|
| Autorizar USB | Ajuste y autorización en teléfono; ADB puede iniciar servidor/usar clave host PC | Revocar/desactivar depuración; acceso diagnóstico mientras autorizado |
| Consultas fijas | Lecturas Android/PC; no cambios de app, radio o reloj solicitados | Desconectar USB; timeout, denegación o formato sin reconocer |
| Forzar detención Mi Fitness | Estado stopped persistente del paquete Android; puede interrumpir sincronización/notificaciones | Abrir Mi Fitness; Lyra puede continuar y no quedar aislada |

No flash/particiones/bootloader/firmware/watchface/nativo del reloj. No soft/hard
brick del RW4 esperado de estas operaciones de teléfono; no constituye recovery
integral del reloj. No nuevos comandos Xiaomi, autenticación, socket/GATT o
exploit. Usuario realiza acciones manuales; agente no las ejecuta automáticamente.

## Validación PC y siguiente decisión

`node tools/test-phone-core-state.mjs` pasa con respuestas sintéticas: secuencia
exacta de comandos, estados stopped, secciones activas vs reinicio, usuarios
distintos, formatos desconocidos, límites/denegación y canarios privados. Modo
plan y sintaxis comprobados. Formato y salida del teléfono real todavía pendientes.

Si ambos campos se reconocen, contrastar baseline/stopped. No repetir PROBE
automáticamente cualquiera que sea el resultado; diseñar la siguiente acción
según evidencia. No existe aún una pausa temporal soportada identificada.
