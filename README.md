# DOOM en Redmi Watch 4

Investigación para portar DOOM real mediante doomgeneric a Xiaomi Redmi Watch 4, modelo objetivo **M2315W1**, preservando el firmware Xiaomi y las funciones normales del reloj si resulta técnicamente viable.

**Estado al 2026-10-03:** TouchEvents original validado en el emulador Xiaomi Watch S3 a 390×450, con cierre y reentrada sin reinstalar. Un hello C propio imprimió su mensaje y se descargó mediante rmmod en dos ciclos; enlaza puts desde la imagen exacta del emulador. [Prueba nativa y limitaciones](docs/hello-native-emulator.md), [prueba Lua](docs/touch-events-emulator.md). No se compiló DOOM ni se conectó el reloj físico. Estado para continuar en [HANDOFF](docs/HANDOFF.md).

**Display C:** patrón RGB565 mostrado y retirado; píxeles originales, touch y panel stock comprobados después sin reboot en una prueba con pantalla activa. Framebuffer compartido, no ownership exclusivo. [Captura y reproducción](docs/native-display-emulator.md).

## Alcance de esta sesión

**Touch C:** observador independiente leyó 36 muestras de `/dev/input0`; TouchEvents y el panel stock respondieron simultáneamente. Descriptor cerrado y módulo descargado sin reboot posterior. [Contrato, logs y reproducción](docs/native-touch-emulator.md).

**UI propia Lua:** START/EXIT/reentrada y gestos centrales comprobados; abrir panel stock llama pause y cerrarlo resume. [Prueba y límites](docs/lua-ui-emulator.md).

**Puente Lua ↔ C:** START carga nuestro módulo mediante os.execute/insmod; un dispositivo virtual recibe eventos propios y devuelve estado C. Panel pausa/reanuda y EXIT descarga. También se verificó descarga al cambiar de watchface sin EXIT en dos ciclos, más cierre normal y error Lua controlado por consola. loadlib está deshabilitado en este guest. Persistencia nativa y recuperación ante crash siguen pendientes. [Contrato](docs/lua-native-bridge-emulator.md), [limpieza del cierre y reproducción](docs/lua-native-close-emulator.md).

**Frames C en LVGL:** patrón RGB565 de320×140 animado durante300 actualizaciones, con dos archivos fijos en tmpfs y un Timer Lua. Pausa/reanudación, EXIT/reentrada y cierre al cambiar de watchface comprobados. Lua tras GC estable en la prueba corta; un contador de máximo uso del guest aumentó sin causa aislada. No Doom ni FPS del motor medidos. [Resultado, memoria y reproducción](docs/native-frame-loop-emulator.md), [snapshot anterior](docs/native-frame-lvgl-emulator.md).

**Controles mantenidos:** avanzar, giro y disparo llegan a C con cola de32 eventos; pausa, cancelación con contacto activo y salida liberan teclas. Dos EXIT/reentrada y cambio de watchface limpian el módulo. Panel stock deja el prototipo pausado hasta RESUME explícito. No Doom ni ergonomía física demostrados. [Pruebas, fallo corregido y límites](docs/native-controls-emulator.md).

**Tiempo C:** reloj monotónico con257 lecturas sin retroceso y19 esperas relativas medidas. Panel stock responde mientras espera la tarea de consola; retorno, descarga y cleanup comprobados. Esperas pequeñas tienen variación y no se permite dormir en el callback UI. [ABI, mediciones y reproducción](docs/native-time-emulator.md).

**Archivos C:** lectura completa de un fixture propio de1MiB+37 bytes,41 ventanas por posición, EOF, cuatro errores y reapertura comprobados en tmpfs. Archivo intacto y módulo/temporales retirados sin reboot. [Contrato y reproducción](docs/native-fs-emulator.md).

**Stdio del lector WAD:** fopen/fread/fseek/ftell/fclose pasaron con el fixture propio, incluidos buffers, longitud y tres reaperturas. En este guest, seek no limpia EOF; clearerr sí. [Resultado y límite concreto](docs/native-stdio-emulator.md). Siguiente checkpoint: lifecycle de una tarea C separada de UI para evitar bloquearla. Todavía no se cargó WAD ni se compiló Doom; gate físico cerrado.

- Crear documentación, matriz de evidencia y herramientas de inspección para PC.
- Identificar dependencias originales y fijar revisiones consultadas.
- Preparar revisión del paquete del emulador y captura de inventario de solo lectura.
- Validar `RedmiWatch4/TouchEvents` y un hello C mínimo exclusivamente en el emulador.

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

El inventario exige un transporte de emulador explícito. Nunca selecciona automáticamente un dispositivo USB. Consultar [comandos y limitaciones](docs/emulator.md) antes de usarlo. `build.ps1 -Target Hello` compila el hello local; `-Target Doom` conserva el gate cerrado.

En este PC los `.ps1` están bloqueados por ExecutionPolicy. Las herramientas Node propias se ejecutan sin cambiar esa política:

```powershell
node tools/verify-emulator.mjs
node tools/emulator-host.mjs help
node tools/build-hello.mjs
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
- [Hello C: build, carga y descarga verificadas](docs/hello-native-emulator.md)
- [Display C: framebuffer, patrón y devolución a stock](docs/native-display-emulator.md)
- [Touch C: lector independiente y coexistencia con stock](docs/native-touch-emulator.md)
- [UI propia Lua: scroll, salida y pausa/reanudación](docs/lua-ui-emulator.md)
- [Modelo de riesgo](docs/risk-model.md)
- [Gate para dispositivo físico, cerrado](docs/physical-device-plan.md)
- [Reporte de esta sesión](docs/session-2026-10-02.md)

## Resultado eventual

DOOM original, WAD shareware verificado, temporización y touch funcionales, salida fiable al reloj y archivos persistentes para volver a jugar sin PC. Sonido, corona, savegames e integración en menú se evalúan después. El motor, gameplay y renderer no se reimplementan.

## Distribución

No se incluyen WADs, firmware, APKs, emuladores ni compiladores binarios. La licencia del motor y los derechos de los datos del juego son asuntos separados. La mención de shareware en doomgeneric no basta para redistribuir `doom1.wad`: hay que revisar la licencia del paquete original completo. Las fuentes comunitarias sin licencia explícita se referencian, no se incorporan como código propio. Este repositorio aún no establece una licencia para sus aportes originales; decidirla antes de publicarlo.
