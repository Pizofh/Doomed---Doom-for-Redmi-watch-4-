# R64: compilación e inventario del motor real

2026-10-04. Se compilaron **80 archivos C originales de doomgeneric** para ARM y se combinaron con `ld -r`, sin ejecutar el resultado. No se cargó código ni WAD en el guest, no se navegó o reinició el emulador y no se repitieron ensayos R58/R62/R63. Hardware fuera de alcance. Esta fase confirma compilación, no gameplay ni ABI de ejecución.

## Fuentes y build

Revisión [dcb7a8dbc7a16ce3dda29382ac9aae9d77d21284](https://github.com/ozkl/doomgeneric/tree/dcb7a8dbc7a16ce3dda29382ac9aae9d77d21284). Se obtuvieron 181 archivos de texto, 1.561.118 bytes, mediante el conector GitHub: headers, 80 C del Makefile excluyendo el backend X11, Makefile y documentación/licencia. Cada archivo coincide en tamaño y Git blob SHA1 con el árbol del commit. No es un checkout Git ni todo el repositorio. Fuente intacta y LICENSE conservada localmente; ninguna fuente upstream, asset o binario añadido al Git del proyecto. [Lock de archivos](../doom/doomgeneric-source.lock.json).

`prepare-doomgeneric-source.mjs` materializa el bundle local del conector después de verificar todos los blobs contra el lock. Rechaza rutas y archivos cambiados; no ejecuta scripts upstream. En otra máquina, un checkout normal de ese commit en `third_party/doomgeneric` también sirve al build, que comprueba el lock. `setup.ps1 -FetchSources` requiere acceso normal de red y destino compatible con su flujo Git; no tratar nuestro snapshot sin .git como un checkout existente.

Build propio Node, toolchain Arm14.3 ya revisada, Cortex-A7/Thumb/NEON/hard-float, GNU17, Os, freestanding, long-calls y resolución320×200. `-fcommon` conserva el tratamiento clásico de globals del código; sus COMMON **también consumen memoria**, aunque no figuren dentro de .bss en el objeto parcial. Se genera stack-usage. No se define FEATURE_SOUND, no se incluye X11 ni SDL ni se enlazan libc/libm/libgcc. VFP permitido para las operaciones del motor; no usar el flag general-regs-only de los probes enteros como premisa para todo Doom.

Salida ignorada `build/doom-audit/engine-audit.o`: ET_REL32LE ARM/EABI5, entry0, **425928 bytes**, SHA256 `30ba8ead4ca94fd69d661d774edd3a9fbd449dfe68696798ad4519c7daa56366`. Resultado `build/doom-audit/result.json`: loadableModule=false, contractReviewed=false, guestExecuted=false. Tiene50 imports pendientes y ninguna entrada/init/uninit propia aprobada. No copiarlo al guest ni renombrarlo a un módulo para intentar cargarlo.

El primer helper completó compilación/link y falló al intentar capturar la tabla de símbolos grande del guest (ENOBUFS). Se corrigió la inspección leyendo el ELF ya fijado directamente; segunda ejecución completa pasa. No fallo del motor ni runtime/crash. Después se amplió el informe de memoria mediante `inspect`, usando el mismo objeto, sin recompilar o ejecutar.

## Memoria: cifras estáticas, no mediciones del reloj

| Componente | Bytes | Alcance |
|---|---:|---|
| .text |121368| Código del objeto parcial |
| .rodata y strings |100358| Datos constantes |
| .data |60004| Globals inicializados |
| .bss |36448| Globals reservados |
| COMMON415 símbolos |207173| Pendiente de ubicación y padding |
| Total estático antes de alineación |525351| Excluye loader y adaptador |
| Zona de memoria predeterminada |6291456| 6MiB en I_ZoneBase, reserva dinámica |
| DG_ScreenBuffer320×200 |256000| Create reserva cuatro bytes/pixel, incluso seleccionando RGB565 |

Subtotal7072807bytes, aproximadamente6,75MiB, **antes** de otras asignaciones, stack, loader, libc, puente, copias LVGL y almacenamiento del WAD. I_VideoBuffer64000bytes usa Z_Malloc: pertenece a la zona y no se suma de nuevo. El directorio persistente de lumps usa calloc fuera de la zona, por ejemplo1264×28=35392bytes con este ABI. Una copia del WAD en tmpfs añade4196020bytes a memoria del guest; almacenamiento flash sería diferente. No se afirmó RAM física32MB ni RAM libre M2315W1.

Archivos .su: mayor frame individual I_Error568bytes, D_DoomMain504. Sin frames dinámicos reportados en los80 C compilados. Esto **no** acota profundidad de llamadas, stack de libc/adapter o consumo real del worker. No se eligió stack del motor basándose únicamente en esos máximos.

## Imports y diferencias de plataforma

50 imports sin resolver. Seis son DG_Init/DrawFrame/GetKey/GetTicksMs/SleepMs/SetWindowTitle, que implementará el adaptador. `_ctype_` y `abs` no aparecen como símbolos definidos del guest exacto. Otros42 nombres sí están presentes; eso no prueba firma, tipo, task-group o compatibilidad de datos. No se enlazó ninguno a sus direcciones.

La compilación utiliza headers **newlib de la toolchain**, exclusivamente para este inventario. `_impure_ptr` está presente en el guest, pero la expresión stderr de esos headers depende de layout interno de newlib no validado. Tampoco importar tablas ctype ni layouts FILE/stat por coincidencia de nombres. El FILE opaco y llamadas read/seek contrastadas en R58/R63 serán base del shim del port, no permiso para enlazar el objeto actual.

Dependencias a tratar: malloc/calloc/realloc/free/strdup; stdio, logs y varargs; strings/ctype; __aeabi_ldivmod y aritmética flotante; exit/system; mkdir/remove/rename/fwrite. El reporte conserva la lista completa. No usar system para el diálogo zenity ni exit de escritorio para abandonar un worker que comparte el entorno del reloj.

## Salida y efectos sobre almacenamiento

Inspección local de fuentes originales:

- `i_system.c`: DEFAULT_RAM y MIN_RAM6; la lista I_AtExit asigna nodos que upstream no libera. I_Quit ejecuta callbacks y retorna porque ORIGCODE está desactivado. I_Error intenta diagnóstico/GUI y llama exit(-1). El retorno de I_Quit **no es una salida del juego** en este port.
- `doomgeneric.c`: Create reserva el buffer sin comprobar NULL. `d_main.c`: Create/Main inicializan y ejecutan un tick; D_DoomLoop termina tras ese tick. Tick/TryRunTics pueden esperar: correr desde worker, nunca bloquear Timer UI.
- `m_config.c`: Load/SaveDefaultCollection no hace su I/O con ORIGCODE desactivado; aun así M_SetConfigDir y M_GetSaveGameDir llaman mkdir. Savegames, capturas y demos tienen otras rutas de escritura que siguen compiladas. Sin sonido no significa read-only.
- `w_wad.c` y `w_file_stdc.c`: zona más allocations externas y streams abiertos necesitan ownership explícito. Descargar el módulo no libera por sí solo esos recursos.

Decisión para el primer runtime: WAD exacto read-only, escrituras de datos bloqueadas por el adaptador, sin guardar partidas/capturas/demos/configuración ni ejecutar shell desde el motor. UI conserva ownership LVGL y señaliza STOP; el worker debe abandonar controladamente, cerrar streams y liberar todas sus allocations antes de retirarse. Reutilizar el gate de referencias/PID de R62 para unload. La estrategia de unwinding todavía requiere implementación: no enlazar directamente exit/pthread_exit ni matar el worker.

Un allocator que registre únicamente malloc directo sería insuficiente: strdup de la libc y streams pueden reservar internamente. Interceptar las allocations del motor y contabilizar sus recursos opacos aparte. Al volver a jugar, recargar módulo limpio evita conservar globals Doom de una sesión anterior; archivos almacenados persistentes y residencia temporal en RAM siguen siendo conceptos distintos.

## Advertencias y validación acotada

122 warnings upstream conservadas en build-log, sin ocultarlas. Incluyen13 de formatos en i_video,2 de dangling-pointer en R_SortVisSprites y varios unused/sign-compare. El recorrido normal de R_SortVisSprites mueve los elementos de su sentinel local a una lista persistente antes de retornar; no se demostró un use-after-return ni se cambió renderer. Formatos `%d` con uint32_t de newlib son incompatibles formalmente aunque ambos sean32bits: revisar al preparar los headers/port. Ninguna de estas observaciones autoriza ignorar crashes futuros.

No tests añadidos para duplicar inspecciones previas, no ensayo masivo, allocator sobre guest ni engine runtime en esta fase. Verificación realizada: identidad de fuentes/herramientas/guest, compilación/link parcial y revisión de imports, memoria, stack y warnings. Git diff/sintaxis de herramientas propios comprobados al cerrar.

```powershell
node tools/build-doom-audit.mjs
# Solo analizar el objeto ya fijado, sin recompilar:
node tools/build-doom-audit.mjs inspect
```

## Siguiente checkpoint

Crear el shim de libc y el ownership de allocations/streams/salida del worker; obtener un candidato cuyo enlace no dependa de estructuras newlib ni exit/system de escritorio. Validar ese contrato con una prueba pequeña nueva antes del primer E1M1. No repetir display/touch/WAD ya aprobados salvo cambios o un fallo concreto. No se solicita ni autoriza hardware.
