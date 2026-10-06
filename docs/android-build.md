# Build de la variante de diagnóstico

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

Siguiente checkpoint: completar paquetes SDK y conseguir el primer build
Android; después revisar el APK y cerrar los pendientes de transporte/UI,
antes del [plan físico](physical-device-plan.md).
