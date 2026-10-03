# Ejecución y privilegios

No se ejecutó ningún payload C propio, módulo ELF o WASM. Sí se ejecutaron comandos builtin y Lua por ADB en el emulador. No se invocaron `insmod`, `rmmod`, `iwasm`, `os.execute` ni exploits. No hay una razón demostrada para root/jailbreak. Referencias y estados: [research.md](research.md), [matriz](evidence-matrix.md), [runtime observado](emulator-runtime.md).

La [inspección estática del ELF guest](emulator-package-review.md) identifica Goldfish Cortex-A7, ELF32 ARM/EABI5/hard-float, `CONFIG_BUILD_FLAT`, loaders ELF/módulos y soporte Lua/WAMR. Son capacidades compiladas de la imagen del emulador, no prueba de ejecución de código propio ni evidencia M2315W1. Los ejecutables Windows del launcher sí se ejecutaron tras revisar su procedencia; distinguirlos de payloads guest.

| Camino | Evidencia actual | Bloqueo | Experimento posterior en PC |
|---|---|---|---|
| QuickApp / JS / RPK | API oficial Vela; debug físico documentado S4 | Soporte RW4 y bridge C/WASM no demostrados | App JS mínima, consulta de capacidades; no la llamar C |
| Lua / watchface | Fuente TouchEvents específica RW4 | Versión/runtime, exit y packaging no ejecutados | Reproducir original en emulador |
| Lua → shell | Símbolos `os_execute`/`system` definidos en ELF del emulador | Exposición desde watchface/RW4 sin probar | Inspeccionar presencia/tipo primero, experimento separado |
| ELF / exec | `CONFIG_ELF`, `CONFIG_LIBC_EXECFUNCS`, `execv`/`posix_spawn` en emulador | Exports, contrato loader/entrypoint y lifecycle pendientes | Inventario read-only, luego hello C si hay contrato válido |
| Módulo / `insmod` | `CONFIG_MODULE`, `cmd_insmod`/`cmd_rmmod`/`cmd_lsmod` en emulador FLAT | Carga y teardown no probados; sin aislamiento de memoria | Inspeccionar `help`/exports; no cargar para descubrir ABI |
| WASM / `iwasm` | `iwasm_main` y macros WAMR en emulador | Imports, memoria/UI/lifecycle y RW4 desconocidos | Identificar comando/runtime sin ejecutar payload |
| App nativa precompilada/builtin | Concepto upstream | Builtin no significa carga de app arbitraria stock | Identificar registro/launcher y build requerida |

Un componente de UI implementado internamente en C no da a una QuickApp permiso para ejecutar un binario arbitrario. La existencia de una toolchain Linux ARM no basta: NuttX necesita contrato de libc, relocations, arquitectura y símbolos compatible. No usar un ELF Linux en el emulador como ensayo de compatibilidad.

El inventario confirma los comandos de módulos y `/bin/iwasm`; `lsmod` no muestra módulos cargados. `help -v insmod` indica `insmod <file-path> <module-name>`. **El comando NSH `exec` acepta una dirección hexadecimal**, no un filename ELF. No confundirlo con las funciones C exec/execv ni utilizarlo como exploración. `help -v` no describe builtins Lua/iwasm aunque sí aparecen y Lua se ejecutó.

CLI Lua 5.4 expone `os.execute`/`package.loadlib` como funciones y carga LVGL; eso no prueba disponibilidad desde una watchface o el firmware RW4. El original TouchEvents falla en su fuente; la copia temporal sin esa propiedad termina sin excepción reportada, pero la captura sigue mostrando UI stock. Render/touch y lifecycle siguen pendientes.

## Modelo de memoria

NuttX [documenta modos de memoria](https://nuttx.apache.org/docs/latest/implementation/memory_configurations.html) diferentes:

| Modo | Modelo general upstream | Consecuencia para nuestro port |
|---|---|---|
| FLAT | Dirección compartida entre OS y aplicaciones | Un task C puede dañar el sistema; salida no garantiza aislamiento |
| PROTECTED | Separación de kernel/userspace con MPU según arquitectura | Hay frontera de privilegios; verificar regiones y syscalls concretas |
| KERNEL | Entornos de direcciones con MMU y separación por proceso | Más separación; el loader y los permisos aún requieren revisión |

El nombre Vela no determina el modo. Buscar evidencia de `CONFIG_BUILD_FLAT`, `CONFIG_BUILD_PROTECTED`, `CONFIG_BUILD_KERNEL`, `CONFIG_MODULE`, `CONFIG_LIBC_EXECFUNCS`, loader ELF y símbolos de exportación en la **build relevante**. Examinar UID/GID/credenciales únicamente si esa build los implementa. No inferir privilegios Unix por una salida que parece `ls -l`.

NuttX distingue [módulos kernel y shared libraries](https://nuttx.apache.org/docs/latest/implementation/kernel_modules_vs_shared_libraries.html). `insmod` es una ruta potencialmente privilegiada, no sinónimo de un proceso aislado. `rmmod` requiere teardown correcto: callbacks, timers, objetos LVGL, tareas y referencias vivas pueden impedir una descarga segura. En FLAT ni siquiera un task ordinario establece un sandbox.

## Contrato mínimo antes de hello C

Registrar encabezado ELF esperado (clase/endian/machine, tipo ET_REL/ET_EXEC/ET_DYN), ISA y flags, EABI/FPU, toolchain y versión, linker/relocations, entrypoint, libc y símbolos/imports. Identificar quién ejecuta init/exit, contexto/task, stack/heap, privilegios y recuperación del emulador. Distinguir binario host del payload guest. Ya se caracterizó el encabezado del firmware guest y su modo FLAT; no se ha determinado el contrato de un payload propio.

Hello C posterior: imprimir una línea y devolver; sin drivers, hooks, writes, persistencia ni display. Solo promover ese checkpoint cuando exista un mecanismo demostrado y coherente. El esqueleto de `experiments/hello-native` no contiene código ni build anticipados.

## Salida antes del hardware

Probar abrir/cerrar repetidamente y medir liberación de RAM, input y display. Tener salida UI y un mecanismo externo documentado de terminar la instancia en emulador. No ejecutar `kill` ni escribir watchdog/config para descubrir su comportamiento. Un timeout del host solo termina el cliente ADB; no asegura la terminación de un programa dentro del guest. Un reboot no sustituye el requisito de devolver el control al reloj sin reiniciarlo.
