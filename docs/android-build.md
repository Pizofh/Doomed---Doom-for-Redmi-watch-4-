# Build de la variante de diagnóstico

## R92: retirar declaración sensible innecesaria — build pendiente

2026-10-06. El usuario describe el aviso de datos sensibles/robo de identidad/
fraude financiero. Coincide con el aviso documentado por Google para ciertos
permisos sensibles en instalaciones externas; el texto también tiene otros
contextos, así que no prueba por sí solo la causa concreta del dispositivo.
[Guía oficial](https://developers.google.com/android/play-protect/warning-dev-guidance).

Reinspección del APK-r87: sus diez uses-permission estaban restringidos, pero
**NotificationListener seguía declarado**, enabled=false y protegido por
BIND_NOTIFICATION_LISTENER_SERVICE. La revisión anterior comprobaba estado
habilitado/exportado y omitió considerar ese binding sensible en componentes
deshabilitados. Google incluye lectores de notificaciones entre los accesos
que pueden provocar este aviso. Relación razonable, no confirmación de la
decisión de Play Protect sobre este APK.

Se elimina la declaración completa del listener con tools:node=remove, no
solo se deshabilita. La función no sirve para batería/modelo/versión. No se
altera package, certificado, targetSdk ni protecciones Android. Nueva versión:
0.94.0-rw4-diagnostic-r92. Inspector exige ausencia de bindings de notificaciones,
accesibilidad, administración de dispositivos y permisos SMS, incluso si el
componente está deshabilitado. El test de regresión rechaza el APK-r87 real
por ese motivo; XML fuente parseado confirma cero bindings y una regla de
eliminación. Sources22/hashes doctor OK; APK previo ya no corresponde a ellas.

Compilar desde PowerShell habitual:

```powershell
node tools/android-build.mjs build-diagnose 2>&1 | Tee-Object -FilePath artifacts/research/android-build-r92.txt
```

Después: inspeccionar merge/firma del APK nuevo y preparar su copia verificada
para repetir **solo la prueba offline ya autorizada**, con Play Protect activo.
La compilación/revisión no aseguran que desaparezca el aviso. Si persiste,
detenerse y revisar opciones normales/posible apelación, sin envíos automáticos.
No reutilizar APK-r87, cambiar identidad para eludir detección ni instalar vía
ADB sobre teléfono. Emulador Android aplazado: no aporta evidencia del RW4 y
el usuario prioriza llegar al reloj. El emulador Vela/S3 donde Doom funciona
es distinto de Android. Ninguna conexión física autorizada o realizada.

**R89:** el [plan de arranque Android offline](android-offline-test.md) ya está
preparado y el APK-r87 copiado/verificado en artifacts/android-offline-test-r87.
No se modificó la app ni se recompiló. Instalación manual pendiente de aprobación;
ninguna conexión al reloj incluida. La fase runtime todavía no se ha ejecutado.

## R88: segundo APK compilado y revisado

2026-10-05. El build del usuario terminó **BUILD SUCCESSFUL en 2m41s**:
73 tareas, 20 ejecutadas y 53 up-to-date. Compilaron los cambios de Java/Kotlin
contra Android real. Los mensajes `deprecated API` y `unchecked or unsafe
operations` son advertencias de APIs y tipos genéricos, no fallos de compilación.
PowerShell los presenta como NativeCommandError al recibirlos por stderr;
el resultado final de Gradle es el que confirma el éxito. Persisten avisos
de Gradle/API y del baseline lint: lint vital no encontró problemas nuevos,
pero no equivale a lint completo ni auditoría de seguridad.

| Campo | Resultado |
|---|---|
| APK | app-mainline-rw4diagnostic.apk, 31394778 bytes |
| SHA256 | bf95f228b51e4ff1920f918b9c8502f0d85b9a7d8975b40e5c82fedcee975fd2 |
| Versión / package | 0.94.0-rw4-diagnostic-r87/253, nodomain.freeyourgadget.gadgetbridge.rw4diagnostic |
| Configuración | min23, target35, compile37, debuggable=false |
| Firma | apksigner oficial exit0, v1/v2 válidas; certificado debug local igual a R86 |
| Permisos efectivos declarados | Diez: nueve previstos y DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION de AndroidX |
| Servicios / receivers | Solo DeviceCommunicationService habilitado, no exportado; otros declarados deshabilitados, jobs/receivers retirados |
| Activities | Solo launcher exportado; alias deshabilitado y no exportado |
| Runtime / hardware | No instalado ni ejecutado; ninguna conexión al reloj |

El permiso interno añadido por AndroidX tiene nivel `signature` en el
manifiesto fusionado y no da acceso a datos del teléfono. `aapt2` confirma
límites API30 de permisos antiguos y `neverForLocation`; el inspector propio
rechaza cualquier permiso/componente fuera de la lista prevista. El APK no
declara INTERNET, InternetHelper, llamadas/SMS, contactos/calendario, salud
ni ubicación de segundo plano. No confundir declaración con concesión ni
restricciones del manifiesto con comportamiento probado en Android.

Apksigner conserva los 103 avisos META-INF/v1 ya observados en R86; firma
v2 verificada, sin modificar el APK. Certificado SHA256:
47eeb041e241c7ab785ed8bdcf06c6fcce90020e52d4794aa3c6c66590577709.
El inspector registra los 22 hashes de fuentes preparadas y actualiza
`apkMatchesPreparedSources=true`; no prueba reproducibilidad byte a byte.

Artefactos ignorados en artifacts/research/: android-build-restricted.txt,
android-diagnostic-apksigner-r87.txt, android-diagnostic-badging-r87.txt,
android-diagnostic-apk-inspection-r87.json y reporte actual sin sufijo.
La evidencia del primer APK se conserva en el reporte con sufijo-r86.

**Siguiente checkpoint:** preparar una prueba de arranque/cierre de la app
Android sin Bluetooth ni comunicación con el reloj. Aún falta revisar logs,
comportamiento/lifecycle y el procedimiento de instalación antes de pedir
esa acción manual. No instalar ni conectar ahora; gate físico cerrado.
No repetir este build exitoso sin cambios nuevos.

## R87: preparación del segundo build (histórico)

2026-10-05. Se prepararon **22 archivos modificados** a partir del mismo TAR
fijado; 59 textos originales seleccionados para revisión. `refresh` admite
nuevos archivos solo con procedencia verificada y valida todos los archivos
anteriores antes de escribir. Doctor confirma sus hashes y el SDK existente.
La versión será **0.94.0-rw4-diagnostic-r87**. El APK R86 aún presente pertenece
a las fuentes anteriores: `apkMatchesPreparedSources=false`. No instalarlo.

- Manifiesto fuente: nueve permisos, un servicio habilitado; sin llamadas,
  SMS, contactos, calendario, salud, Internet/InternetHelper ni ubicación en
  segundo plano. Receivers deshabilitados y actividades internas sin exportar,
  excepto el launcher. Se retiran jobs/receivers añadidos por dependencias y
  sus inicializadores automáticos. El merge real debe comprobarse en el APK.
- Bluetooth clásico/administración y ubicación fina limitados a API 30;
  API 31+ utiliza SCAN/CONNECT, SCAN con `neverForLocation`. La ubicación fina
  antigua corresponde a descubrimiento en primer plano, no a leer GPS del
  reloj. [Permisos oficiales](https://developer.android.com/develop/connectivity/bluetooth/bt-permissions).
  Se mantienen notificación, wake lock y servicio de dispositivo conectado;
  [requisitos del servicio](https://developer.android.com/develop/background-work/services/fgs/service-types#connected-device).
- Solo los dos callbacks de toque de «Conectar» emiten un ticket en memoria
  ligado al dispositivo. Caduca en cinco segundos y se consume una vez por
  proceso. Eventos Bluetooth, shortcuts, service restart, preferencias y nuevas
  instancias del soporte no proporcionan ese ticket. El servicio es
  START_NOT_STICKY y acepta exclusivamente conectar/desconectar; desconectar
  también lo detiene. Sigue vigente el límite de sesión de 30 segundos.
- La fábrica admite únicamente coordinator RW4 y dirección Bluetooth válida
  con vínculo Android ya existente. Descubrimiento registra el dispositivo
  y la clave en almacenamiento privado **del teléfono**, sin iniciar conexión
  ni crear un vínculo. Si no hay vínculo previo, este camino se detiene;
  no desvincular Mi Fitness ni crear otro para sortearlo sin revisión.
- Se omiten tareas de exportación/salud/notificaciones y conexiones de
  InternetHelper. No se ha auditado completamente cada pantalla/log ni
  demostrado comportamiento Android, cierre de socket o ausencia de cambios
  internos causados por autenticar en firmware 2.2.86.

Validación PC: prueba de política/sesión y nueva prueba de tickets pasan
(caducidad, destino incorrecto, reutilización y doce consumidores concurrentes
con un solo éxito). WriteAction generado sigue pasando con socket falso.
XML fuente parseado: nueve permisos activos y un servicio habilitado. El
inspector de APK ahora rechaza permisos/componentes inesperados tras merge,
límites de API incorrectos y el APK antiguo R86. Su parser ampliado conserva
la verificación/tamper tests del APK upstream. Ninguna prueba usa Bluetooth.

El siguiente paso necesita el PowerShell habitual del usuario: el contexto
restringido del agente falló en ZipFS/Gradle (R85), mientras ese PowerShell
compiló correctamente (R86). Desde la raíz del repo:

```powershell
node tools/android-build.mjs build-diagnose 2>&1 | Tee-Object -FilePath artifacts/research/android-build-restricted.txt
```

Después del build: revisar resultado, manifiesto/firma del nuevo APK y logs
antes de preparar instalación. **No instalar, escanear ni conectar aún.**
No se necesitan descargas SDK, licencias ni reconstruir Doom nuevamente.

## R86: primer APK generado y revisado

2026-10-05. El usuario ejecutó el build desde su PowerShell habitual:
**BUILD SUCCESSFUL en6m28s,73tareas ejecutadas**. Java/Kotlin de la variante
compilaron contra Android/protobuf reales; se generaron DEX y APK. Lint vital
no reportó errores/avisos nuevos con su baseline; no equivale a lint completo
sin baseline ni a una auditoría de seguridad. Avisos de API deprecada/unchecked,
una safe-call Kotlin innecesaria y deprecaciones de Gradle siguen presentes.
PowerShell presenta algunos mensajes stderr como NativeCommandError incluso
en este build exitoso; distinguir esos avisos del resultado final de Gradle.

Archivo para **teléfono Android, no ejecutable del reloj**:
`build/android-diagnostic-worktree/gadgetbridge/app/build/outputs/apk/mainline/rw4diagnostic/app-mainline-rw4diagnostic.apk`.
No instalado/ejecutado. No se recompiló Doom ni se conectó ningún dispositivo.

| Campo | Resultado local |
|---|---|
| Tamaño |31397290bytes|
| SHA256 |1acf1e8581bc03b21984209da54eaebe213ed049b343d66cd3eb8bf6132c8661|
| Package |nodomain.freeyourgadget.gadgetbridge.rw4diagnostic|
| Nombre |RW4 Diagnostics|
| Versión |0.94.0-rw4-diagnostic/code253|
| SDK |min23/target35,compile37/minor0|
| Debuggable |false|
| Firma |Debug local RSA2048, un signer; no identidad del publisher|
| Cert SHA256 |47eeb041e241c7ab785ed8bdcf06c6fcce90020e52d4794aa3c6c66590577709|
| Permisos declarados |72, heredados de app completa; no son72permisos concedidos|

`apksigner` oficial Build Tools36.0.0 verifica correctamente v1 y v2 (exit0).
No hay v3/v3.1/v4/SourceStamp en este artefacto. Sus avisos sobre103entradas
META-INF sin protección en v1 se conservan; v2 verificado cubre el contenido
protegido de APK, no interpretar esos avisos como fallo de firma v2 ni eliminar
archivos después de firmar. `aapt2 dump badging` confirma nombre/package/SDK.
El inspector Node existente también valida v2/manifiesto del caso soportado.
Fuentes preparadas11 siguen coincidiendo con hashes; las clases de política,
sesión y WriteAction están en los outputs de javac. No es una comparación
semántica completa entre fuente y DEX, ni prueba de runtime.

Artefactos ignorados: android-build-user.txt, android-diagnostic-apksigner.txt,
android-diagnostic-badging.txt y android-diagnostic-apk-inspection.json, bajo
artifacts/research/. `node tools/inspect-android-diagnostic.mjs` regenera el
reporte estático y actualiza el registro local de APK producido. `refresh`
invalida su asociación a las fuentes actuales; tras cambios habrá que compilar
y revisar de nuevo. No hay prueba de reproducibilidad byte a byte.

**Efecto adicional observado:** AGP instaló automáticamente Platform-Tools37.0.1
durante el build, pese a que sdk-install solo solicitaba plataforma/build-tools.
Doctor registra ahora su presencia; ninguno de nuestros scripts proporciona
acciones ADB, instalación o conexión. No confundir herramientas presentes con
una prueba de hardware ni borrar componentes del SDK para ocultar el resultado.

**Siguiente checkpoint:** cerrar el modo de diagnóstico en permisos, alcance
de dispositivos y reconexión global. El APK actual conserva llamadas/SMS,
contactos/calendario, Health Connect, otras integraciones y servicios/UI de
Gadgetbridge. No declara android.permission.INTERNET, pero sí la integración
InternetHelper; no afirmar aislamiento de red absoluto. Falta limitar esto y
revisar logs/lifecycle y retorno a Mi Fitness antes de plantear instalación.
Los filtros probados y la compilación no garantizan cero escrituras internas
del firmware por autenticación ni compatibilidad con2.2.86.
Gate físico cerrado; build completo no es autorización para teléfono/reloj.

## Historial del setup y diagnóstico

R83, 2026-10-05. Herramientas preparadas y pruebas de componentes en PC.
**Todavía no hay un APK propio compilado. Ningún comando de este documento
instala apps, conecta el reloj o abre el gate físico.**

**R84,2026-10-05: corrección del paquete SDK.** La primera instalación del
usuario falló porque nuestro script pedía `platforms;android-37`. El catálogo
Google descargado por su sdkmanager (`repository2-4.xml` en caché local)
publica `platforms;android-37.0`, API37.0, revisión2 y canal estable0; no publica
el nombre solicitado. Coincide con `release(37) / minorApiLevel=0` de upstream.
Instalación, doctor y preflight del build ahora usan `android-37.0`, sin bajar
compileSdk ni cambiar fuentes/firmware. Se comprueba la existencia de ambos
componentes tras instalar, incluso si sdkmanager devuelve0 con avisos.
Licencias ya presentes en el SDK local; no se pide aceptarlas otra vez.

**R85,2026-10-05: SDK instalado, build bloqueado en esta sesión.** Tras el
usuario ejecutar el comando corregido, doctor confirma `platform37=true` y
`buildTools36=true`, con las once fuentes preparadas intactas. source.properties
declara API37.0/revisión2/PreviewSdkInt0 y Build Tools36.0.0. Ya no faltan paquetes.
Primer build falla en29s, antes de la compilación Android, con
`GeneratedClassCompilationException`; un segundo intento con `--stacktrace`
falla en21s y señala `AccessDeniedException` al cerrar ZipFS del JAR
`gradle-classloaders-9.7.1.jar`, dentro de `ZipFileSystemProvider.removeFileSystem`.
El src.zip del JDK21 existente confirma que ese método llama a `toRealPath`.

Un programa propio aislado reprodujo `readable=true`, canonical/nofollow con
AccessDeniedException, zip-open=ok y fallo al cerrar ZIP, sin Gradle ni Android.
El archivo no tiene atributo ReadOnly y su ACL muestra permisos heredados
Allow/Modify/FullControl; no se modificaron ACL, JDK o binarios de Gradle. Esto
apunta a una limitación de acceso de esta sesión; no demuestra todavía que el
build funcione desde el usuario normal ni que la integración Android compile.
JDK observado21.0.7. Resultados en artifacts/research/android-build-first.txt,
android-build-diagnose.txt y android-build-path-probe.txt, todos ignorados.

Se solicitó al usuario ejecutar desde su PowerShell habitual:

```powershell
node tools/android-build.mjs build-diagnose 2>&1 | Tee-Object -FilePath artifacts/research/android-build-user.txt
```

Genera/loguea un build de PC con stacktrace, sin instalar APK ni conectarse.
`build-diagnose` añade solo `--stacktrace`; no DEBUG ni upload de Build Scan.
El reproducer se conserva como BuildPathProbe.java; se puede ejecutar con
`node tools/android-build.mjs path-probe` para comparar contextos de acceso.
No repetir builds idénticos aquí hasta que cambie el bloqueo. No hay APK
producido ni gate físico abierto.

## Herramientas verificadas

Los ZIP encontrados en `tools/local/android-build/` coinciden con los hashes
publicados por sus distribuidores; se revisaron índices/rutas antes de extraer:

| Paquete | Bytes | SHA256 publicado / local |
|---|---:|---|
| commandlinetools-win-15859902_latest.zip |155655386|90ae805d20434428bffcb699c290860f19bb5f66a67e6b330067e3de801fb04a|
| gradle-9.7.1-bin.zip |151433392|acd53f1edaf02f1a8ff99879f8a34b302661a057d9b063ae9e35b552f804d20a|

Fuentes: [descargas oficiales de Google](https://developer.android.com/studio#command-tools)
y [checksums oficiales de Gradle](https://gradle.org/release-checksums/).
`versions` ejecutó las herramientas verificadas con el JDK21 existente y
terminó correctamente; sdkmanager informa22.0 y avisa que su CLI es deprecada.
Se conserva este mecanismo operativo para el primer build; no se ejecutó el
wrapper de fuentes, que no incluye su JAR/launchers en este archivo.

El catálogo recibido fija AGP9.3.2. La [tabla oficial AGP9.3](https://developer.android.com/build/releases/agp-9-3-0-release-notes)
soporta API37, requiere Gradle mínimo9.5 y usa Build Tools36.0.0 por defecto.
Se preparan esos paquetes y se mantiene Gradle9.7.1 fijado por upstream;
la compilación completa aún debe comprobar la combinación y resolver dependencias.

La extracción de fuente verificó el pin local del TAR, rutas únicas sin
traversal y tipos de entradas. Se omitió el único symlink de changelogs banglejs,
que no necesita la variante mainline. Fuentes y herramientas están ignoradas
por Git. No se creó un segundo repositorio Git.

## Comandos

Desde la raíz del repo:

```powershell
node tools/android-build.mjs doctor
node tools/android-build.mjs versions
node tools/android-build.mjs sdk-list
node tools/android-build.mjs sdk-licenses
node tools/android-build.mjs sdk-install
node tools/android-build.mjs build
```

`sdk-licenses` es interactivo: el usuario revisa las licencias y decide si
aceptarlas. No se automatiza la respuesta. `sdk-install` solicita solamente
`platforms;android-37.0` y `build-tools;36.0.0`; no platform-tools/ADB ni imágenes
de emulador Android. `build` ejecuta únicamente
`:app:assembleMainlineRw4diagnostic` y todavía no se ha ensayado.

El SDK va a `tools/local/android-build/sdk/`, Gradle a `runtime/gradle-9.7.1/`,
y las cachés Gradle/Android a `gradle-user/` y `android-user/` dentro de esa
carpeta. El entorno se aplica al proceso hijo, sin cambiar PATH/JAVA_HOME
persistentes. El launcher Node ejecuta el script propio como texto de comando
porque la política local rechaza `powershell -File`; no modifica ExecutionPolicy.

`prepare` ya se ejecutó una vez: verificó los ZIP/TAR, extrajo y aplicó once
fuentes a `build/android-diagnostic-worktree/gadgetbridge/`. `prepared.json`
registra procedencia y hashes. Rechaza repetir/extraer sobre una carpeta existente.
Si se modifica el generador, regenerar y aplicar con:

```powershell
node tools/prepare-android-diagnostic.mjs
node tools/android-build.mjs refresh
```

`refresh` comprueba los hashes anteriores antes de reemplazar archivos propios;
rechaza cambios manuales, enlaces y cambios del conjunto de archivos. No borra
directorios. El generador también rechaza editar vistas previas ajenas a su
manifiesto. No reejecutar prepare para corregir un fallo de compilación.

La variante propuesta tiene applicationId terminado en `.rw4diagnostic`,
nombre RW4 Diagnostics y sufijo de versión propio. Usa firma debug local para
el artefacto de desarrollo, no la identidad del publisher. Se evita consultar
el Git padre para hash/changelog. Identidad/manifiesto/firma resultantes deben
inspeccionarse cuando exista APK; no son resultados verificados del build.

## Resultado actual y límite

`doctor`: herramientas/JDK presentes, once fuentes coinciden, faltan plataforma37
y Build Tools36. `sdk-list` falló con avisos de IO al obtener manifiestos;
`artifacts/research/android-sdk-list.txt` conserva salida. No confundir la
ausencia de paquetes con incompatibilidad de la fuente ni con un error del reloj.
Se solicitó al usuario ejecutar licencias e instalación desde su terminal habitual
porque las descargas de esta sesión están restringidas.

Las pruebas de política/sesión y de WriteAction con socket falso pasan, pero no
sustituyen Android/protobuf, la cola real, servicio global o una conexión física.
Los scripts de módulos y repositorios se inspeccionaron: Google/Maven Central,
Gradle Plugin Portal, JitPack restringido a com.github y mavenLocal para plugins
en el archivo recibido. No se han resuelto/auditado íntegramente las dependencias
ni demostrado reproducibilidad del APK. Revisar resolución local, logs globales,
reconexiones y alcance de otros dispositivos antes de permitir instalación.

La preparación SDK y el primer build se completaron en R86; el segundo build
y su revisión estática, en R88. El checkpoint actual figura al inicio;
el [plan físico](physical-device-plan.md) sigue cerrado.
