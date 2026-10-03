# MiWatchEmulator: preparación y pruebas pendientes

## Estado real

2026-10-02: release y documentación consultadas, **emulador no descargado, no arrancado, sin ADB local, sin shell y sin ejecución de TouchEvents**. El usuario confirmó que no tiene el paquete local. No existe un inventario guest obtenido en esta sesión.

Los cuatro `git clone --depth 1` fallaron con `Failed to connect to github.com port 443`. Se continuó por navegador y conector GitHub; esos canales consultan código/metadata, no suministraron un ZIP ejecutable al PC. No se intentó cambiar la restricción de red.

Además, la ejecución de `scripts/setup.ps1` fue rechazada por la política de PowerShell. El parser sí aceptó los seis scripts. No se cambió la política de ejecución. No afirmar pruebas funcionales de scripts a partir del parsing.

## Artefacto candidato

| Campo | Evidencia consultada |
|---|---|
| Release | [m0tral/MiWatchEmulator v1.0](https://github.com/m0tral/MiWatchEmulator/releases/tag/v1.0) |
| Fecha de publicación | 2025-02-16T16:44:04Z |
| Archivo | MiWatchEmulator.zip |
| Tamaño | 733,139,307 bytes, aproximadamente 699.2 MiB |
| Asset ID GitHub | 229620973 |
| Digest publicado | `null` en metadata consultada |
| Revisión README | f637d22a07727e59ffe96aa919b1a9193d23db95 |
| Source de binarios del bundle | No identificado |
| Licencia para redistribuir bundle | No identificada |
| Arquitectura host | PC AMD64; PE de launcher/emulador/ADB sin inspeccionar |
| Arquitectura guest/ABI | Desconocidas; no derivar de host ni nombre RW4 |
| Tipo de sistema | Autor de EasyFace declara emulador de Watch S3 |

El link de descarga se conserva en `third_party/dependencies.lock.json`. No descargar APKs ni instaladores desde mirrors. Un tag verificable facilita rastrear origen, pero no valida el contenido propietario ni las dependencias del ZIP.

## Revisión previa al arranque

1. Obtener únicamente el ZIP de la release original. Guardar URL, fecha, tamaño y SHA256. Un SHA local no es un checksum independiente del mantenedor.
2. En un entorno que permita scripts locales revisados, ejecutar `inspect-package.ps1 -ArchivePath ...`. Solo lista ZIP y genera reporte; no extrae. Revisar rutas absolutas/traversal, expansión total y launchers. Si hay anomalías, parar.
3. Extraer en carpeta nueva bajo `emulator/local/`, después de la revisión. Esta operación aún no se hizo ni tiene script automático.
4. Ejecutar `inspect-package.ps1 -DirectoryPath ...`: hashes, Authenticode y arquitectura PE de ejecutables/DLLs; listar scripts. Leer scripts/launchers con `Get-Content`, buscar comandos elevados, persistencia host, red, flash y writes fuera del bundle. No seguir el requisito de administrador de EasyFace sin una razón específica.
5. Identificar imagen guest, ejecutable, config de pantalla y endpoint ADB. Registrar argumentos exactos del launcher **después de verlos**. No inventar nombres de `.bat` ni puerto 5555.
6. Si el origen de un binario importante no queda razonablemente verificado, detener ejecución y evaluar emulador oficial AIoT-IDE de [Xiaomi](https://iot.mi.com/vela/quickapp/en/tools/start/project.html), sin asumir que incluya la misma superficie Lua.

El proceso del emulador puede escribir su imagen guest y archivos del PC. Una imagen guest no sandboxea el ejecutable host. Una VM separada es una alternativa cuando no se puede establecer confianza suficiente. No publicar el bundle.

## Arranque y ADB reproducibles una vez revisado

El comando exacto de arranque está **pendiente de inspección del launcher**. No hay un comando validado de esta sesión. Si se lanza un helper en background, usar ventana oculta y conservar stdout/stderr; la UI del emulador es una interacción explícita cuando corresponda.

En una terminal con política que permita estos scripts revisados, desde la raíz del proyecto:

```powershell
# Sustituir por el binario inspeccionado, su hash y endpoint del launcher.
.\scripts\emulator.ps1 -Action Connect -AdbPath 'C:\ruta\adb.exe' -ExpectedAdbSha256 '<SHA256 revisado>' -Serial '127.0.0.1:<puerto observado>'
.\scripts\emulator.ps1 -Action Devices -AdbPath 'C:\ruta\adb.exe' -ExpectedAdbSha256 '<SHA256 revisado>'
.\scripts\emulator.ps1 -Action Inventory -AdbPath 'C:\ruta\adb.exe' -ExpectedAdbSha256 '<SHA256 revisado>' -Serial '127.0.0.1:<puerto observado>'
```

Son plantillas, **no comandos ejecutados**. El script usa servidor ADB en loopback, puerto host 5039 configurable, serial obligatorio para shell y únicamente `127.0.0.1:<port>` o `emulator-<id>`. No acepta un serial USB. El puerto del servidor ADB no es el puerto del endpoint guest. Verificar compatibilidad de flags del ADB incluido antes de utilizarlo; si el launcher exige otra integración, adaptar el procedimiento tras inspección.

ADB puede iniciar un server/key store en el host y enumerar transports; nunca se selecciona un USB para shell ni se autoriza un teléfono/reloj. El transporte loopback tampoco prueba por sí solo que una instancia guest corresponda al preset deseado: cotejar launcher y runtime. No instalar paquetes ni enviar payloads hasta hacerlo.

## Inventario de solo lectura

Allowlist preparada, un comando por llamada ADB: `help`, `uname`, `version`, `ps`, `free`, `mount`, `df`, `ls /`, `ls /dev`, `ls /data`, `ls /proc`, `ls /bin`, `ls /data/app`, `ls /data/app/watchface`, `env`, `getprop`. Timeout 15 segundos por comando; detener inventario si uno expira. No escribe datos guest de forma solicitada; el sistema podría generar logs de conexión.

| Dato solicitado | Resultado de esta sesión |
|---|---|
| Dispositivos ADB | No obtenido |
| Propiedades/identificadores Vela/NuttX/kernel/version | No obtenidos |
| Mounts/particiones/FS/permisos | No obtenidos |
| Procesos y memoria guest | No obtenidos |
| `/dev`, framebuffer y input devices | No obtenidos |
| Shell/`insmod`/`rmmod`/`lsmod`/`iwasm` | No inspeccionados localmente |
| Modelo de privilegios | Desconocido |

No asumir herramientas GNU ni `which`. Revisar `help` primero y registrar `command not found` como ausencia de ese comando en esa build/interfaz, no ausencia de capacidad de todo RW4. No ejecutar `insmod`, `rmmod` o `iwasm` para averiguar si existen. `lsmod` se podrá agregar como lectura después de conocer sintaxis/capacidad. No usar `dd` del README como inventario: su ejemplo crea un dump persistente guest.

Captura en `artifacts/emulator/inventory.json`, ignorada. Extraer después un resumen pequeño en docs: timestamp, release/hash, preset, serial redactado si contiene identificación, comandos, salidas, errores. No se inventaron outputs de guest.

## TouchEvents: intento preparado, ejecución bloqueada

Revisión del sample: [5af6e14](https://github.com/m0tral/MiWatchLuaWatchfaces/tree/5af6e14ea92830a394c88dc04f76ceef697a6ded/RedmiWatch4/TouchEvents). Archivos fuente/SHAs en el lock. `main.lua`, `root.lua`, `image.lua`, `cat.png`, proyecto `.fprj` y assets de preview. No hay `resource.bin` local generado ni editor ejecutado.

Después de shell/inventario y revisión del packer:

1. Copiar estado guest antes de instalar, con emulador detenido según launcher validado. Registrar filesystem/ruta host exactos; aún desconocidos.
2. Construir el original sin modificaciones con un packer revisado. EasyFace v4.23 compiler ZIP tiene digest publicado en el lock; MSI y editor tienen procedencia separada. No se ejecutaron.
3. Verificar ID del header y rutas de `require`/imagen. Reservar ID único **después** de listar watchfaces, sin asumir que cambiar el nombre de carpeta cambia el header.
4. El README upstream propone `/data/app/watchface/market/<id>/resource.bin`, actualizar caché de lista y reboot. Son mutaciones. No automatizarlas como inventario read-only ni copiar su `rm` al flujo antes del backup. Registrar comandos concretos cuando exista paquete e ID válidos.
5. Abrir sample mediante UI emulada. Ver imagen/label; pulsar centro/bordes, arrastrar y gesto. Guardar captura y logs. `get_point` es posición; `get_vect` delta. Verificar salida por navegación original y volver a watchface previa. Repetir entrada/salida.

No sabemos si el binding acepta `EVENT_BUBLE`, cómo se resuelve `SCRIPT_PATH`, qué objetos libera al salir ni qué versión Lua ejecuta. Esos datos se obtienen con el original antes de escribir nuestro experimento. No llamar esta preparación una validación.

**Siguiente checkpoint:** obtener un paquete de emulador cuya revisión permita ejecución, arrancarlo y obtener `adb shell` con `help` e identificación del guest. Solo después decidir si hello C es un siguiente paso razonable.
