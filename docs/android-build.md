# Build de la variante de diagnóstico

R83, 2026-10-05. Herramientas preparadas y pruebas de componentes en PC.
**Todavía no hay un APK propio compilado. Ningún comando de este documento
instala apps, conecta el reloj o abre el gate físico.**

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
`platforms;android-37` y `build-tools;36.0.0`; no platform-tools/ADB ni imágenes
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
