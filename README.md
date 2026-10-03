# DOOM en Redmi Watch 4

Investigación para portar DOOM real mediante doomgeneric a Xiaomi Redmi Watch 4, modelo objetivo **M2315W1**, preservando el firmware Xiaomi y las funciones normales del reloj si resulta técnicamente viable.

**Estado al 2026-10-03:** emulador arrancado, `adb shell` obtenido por `emulator-5554` e inventario capturado. `uname -a` identifica Xiaomi Watch S3. TouchEvents original falla al crear una fuente; una copia con fuente por defecto termina por CLI, pero no aparece en pantalla ni se validó touch. Hay captura real 390×450 de la UI stock. No se compiló DOOM ni C propio y no se conectó el reloj físico. Estado y comandos para continuar en [HANDOFF](docs/HANDOFF.md).

## Alcance de esta sesión

- Crear documentación, matriz de evidencia y herramientas de inspección para PC.
- Identificar dependencias originales y fijar revisiones consultadas.
- Preparar revisión del paquete del emulador y captura de inventario de solo lectura.
- Analizar `RedmiWatch4/TouchEvents` sin atribuir una prueba de ejecución al análisis del código.

La release comunitaria candidata es [MiWatchEmulator v1.0](https://github.com/m0tral/MiWatchEmulator/releases/tag/v1.0). El autor describe un sistema derivado del emulador Watch S3 en [EasyFace](https://github.com/m0tral/EasyFace/blob/f76a9fe1f559bc8b1d91cf2a1f5af1a630848098/README.md). **MiWatchEmulator no demuestra compatibilidad de ISA, ABI, firmware ni privilegios con M2315W1.** Cambiar la resolución a 390×450 solamente configura la presentación.

## Empezar

Desde esta carpeta, con Windows PowerShell 5.1:

```powershell
.\scripts\setup.ps1
.\scripts\setup.ps1 -FetchSources
```

El primer comando inventaría el host y no instala herramientas. El segundo obtiene únicamente fuentes de los cuatro repos originales, fijadas por SHA; requiere una terminal con red. Ninguno descarga o ejecuta el emulador, compila DOOM o accede al reloj. Si hay restricciones locales de ejecución de scripts, documentarlas; estos comandos no las cambian.

Antes de ejecutar un paquete descargado, seguir [la revisión del emulador](docs/emulator.md). Las herramientas preparadas son:

```powershell
.\scripts\inspect-package.ps1 -ArchivePath 'C:\ruta\MiWatchEmulator.zip'
.\scripts\inspect-package.ps1 -DirectoryPath 'C:\ruta\paquete-extraido'
.\scripts\emulator.ps1 -Action Inventory -AdbPath 'C:\ruta\adb.exe' -ExpectedAdbSha256 '<hash revisado>' -Serial '127.0.0.1:<puerto confirmado>'
```

El inventario exige un transporte de emulador explícito. Nunca selecciona automáticamente un dispositivo USB. Consultar [comandos y limitaciones](docs/emulator.md) antes de usarlo. `build.ps1` está bloqueado deliberadamente hasta demostrar mecanismo de ejecución y ABI.

En este PC los `.ps1` están bloqueados por ExecutionPolicy. Las herramientas Node propias se ejecutan sin cambiar esa política:

```powershell
node tools/verify-emulator.mjs
node tools/emulator-host.mjs help
```

La [revisión local del paquete](docs/emulator-package-review.md) describe procedencia, hashes y la configuración pendiente. No ejecutar `start` hasta registrar el perfil según [emulator.md](docs/emulator.md).

## Evidencia y diseño

- [Investigación y fuentes](docs/research.md)
- [Matriz de evidencia, incluidas las 23 hipótesis](docs/evidence-matrix.md)
- [Arquitectura propuesta y persistencia](docs/architecture.md)
- [Entorno local](docs/host-environment.md)
- [Emulador y TouchEvents](docs/emulator.md)
- [Inspección del paquete y ELF del emulador](docs/emulator-package-review.md)
- [Boot observado y conectividad](docs/emulator-runtime.md)
- [Estado completo para retomar](docs/HANDOFF.md)
- [Ejecución nativa y privilegios](docs/native-execution.md)
- [Modelo de riesgo](docs/risk-model.md)
- [Gate para dispositivo físico, cerrado](docs/physical-device-plan.md)
- [Reporte de esta sesión](docs/session-2026-10-02.md)

## Resultado eventual

DOOM original, WAD shareware verificado, temporización y touch funcionales, salida fiable al reloj y archivos persistentes para volver a jugar sin PC. Sonido, corona, savegames e integración en menú se evalúan después. El motor, gameplay y renderer no se reimplementan.

## Distribución

No se incluyen WADs, firmware, APKs, emuladores ni compiladores binarios. La licencia del motor y los derechos de los datos del juego son asuntos separados. La mención de shareware en doomgeneric no basta para redistribuir `doom1.wad`: hay que revisar la licencia del paquete original completo. Las fuentes comunitarias sin licencia explícita se referencian, no se incorporan como código propio. Este repositorio aún no establece una licencia para sus aportes originales; decidirla antes de publicarlo.
