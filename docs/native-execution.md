# Ejecución y privilegios

Referencia adicional del 2026-10-03: [MiWatchNativeApps](https://github.com/m0tral/MiWatchNativeApps/tree/a392529b9e369d046b9c15858d990f358fdf6c29), para S3/Band 10 Pro. Su header S3 usa direcciones absolutas del firmware; no ejecutar esos módulos en el emulador Cortex-A ni en M2315W1. «Userspace module» en documentación ajena no prueba separación de memoria. Fijar contrato/exports/init/uninit de nuestro guest antes de hello C. Ver R35 en research.md.

Se ejecutó un [hello C propio](hello-native-emulator.md) mediante insmod y se descargó con rmmod en dos ciclos, únicamente en el emulador. También se ejecutaron comandos builtin y Lua por ADB. No se ejecutó WASM, iwasm, os.execute ni exploits. No hay una razón demostrada para root/jailbreak. Referencias y estados: [research.md](research.md), [matriz](evidence-matrix.md), [runtime observado](emulator-runtime.md).

La [inspección estática del ELF guest](emulator-package-review.md) identifica Goldfish Cortex-A7, ELF32 ARM/EABI5/hard-float, `CONFIG_BUILD_FLAT`, loaders ELF/módulos y soporte Lua/WAMR. Son capacidades compiladas de la imagen del emulador, no prueba de ejecución de código propio ni evidencia M2315W1. Los ejecutables Windows del launcher sí se ejecutaron tras revisar su procedencia; distinguirlos de payloads guest.

| Camino | Evidencia actual | Bloqueo | Experimento posterior en PC |
|---|---|---|---|
| QuickApp / JS / RPK | API oficial Vela; debug físico documentado S4 | Soporte RW4 y bridge C/WASM no demostrados | App JS mínima, consulta de capacidades; no la llamar C |
| Lua / watchface | TouchEvents original empaquetado; render/touch/cierre y reentrada en emulador | API para lanzar C y compatibilidad física pendientes | Experimento separado de launcher si se demuestra spawn |
| Lua → shell | Símbolos `os_execute`/`system` definidos en ELF del emulador | Exposición desde watchface/RW4 sin probar | Inspeccionar presencia/tipo primero, experimento separado |
| ELF / exec | `CONFIG_ELF`, `CONFIG_LIBC_EXECFUNCS`, `execv`/`posix_spawn` en emulador | Exports, contrato loader/entrypoint y lifecycle pendientes | Inventario read-only, luego hello C si hay contrato válido |
| Módulo / `insmod` | Hello C con símbolo puts ligado al guest exacto; dos ciclos de carga/descarga | Sin sandbox, API estable ni compatibilidad RW4 demostrada | Patrón display tras identificar API/ownership |
| WASM / `iwasm` | `iwasm_main` y macros WAMR en emulador | Imports, memoria/UI/lifecycle y RW4 desconocidos | Identificar comando/runtime sin ejecutar payload |
| App nativa precompilada/builtin | Concepto upstream | Builtin no significa carga de app arbitraria stock | Identificar registro/launcher y build requerida |

Un componente de UI implementado internamente en C no da a una QuickApp permiso para ejecutar un binario arbitrario. La existencia de una toolchain Linux ARM no basta: NuttX necesita contrato de libc, relocations, arquitectura y símbolos compatible. No usar un ELF Linux en el emulador como ensayo de compatibilidad.

El inventario confirma los comandos de módulos y `/bin/iwasm`; `lsmod` no muestra módulos cargados. `help -v insmod` indica `insmod <file-path> <module-name>`. **El comando NSH `exec` acepta una dirección hexadecimal**, no un filename ELF. No confundirlo con las funciones C exec/execv ni utilizarlo como exploración. `help -v` no describe builtins Lua/iwasm aunque sí aparecen y Lua se ejecutó.

CLI Lua 5.4 expone `os.execute`/`package.loadlib` como funciones y carga LVGL; eso no prueba disponibilidad desde una watchface o el firmware RW4. La prueba CLI histórica del original TouchEvents falló al crear su fuente. Posteriormente, el original empaquetado y abierto mediante el launcher watchface sí demostró render, touch, cierre y reentrada: [resultados](touch-events-emulator.md).

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

TouchEvents demostró una entrada Lua persistente en el emulador, con render/touch y cierre al cambiar a una watchface stock [resultado](touch-events-emulator.md). Esto facilita futuros launchers, pero no demuestra os.execute desde ese contexto ni puente QuickApp→nativo. El hello C se cargó desde NSH/ADB, sin launcher persistente.

Registrar encabezado ELF esperado (clase/endian/machine, tipo ET_REL/ET_EXEC/ET_DYN), ISA y flags, EABI/FPU, toolchain y versión, linker/relocations, entrypoint, libc y símbolos/imports. Identificar quién ejecuta init/exit, contexto/task, stack/heap, privilegios y recuperación del emulador. El contrato mínimo del hello ET_REL quedó contrastado; stack/heap completos, tareas y ownership de UI aún no se caracterizaron para DOOM.

Hello C completado: una línea y devolución, sin recursos propios, drivers, hooks ni display. La [investigación del loader](native-loader-emulator.md) contrastó init/unload y relocations con el guest. El import puts no funcionó; el enlace al símbolo del ELF exacto sí. No extrapolar ese mecanismo a M2315W1.

## Salida antes del hardware

Probar abrir/cerrar repetidamente y medir liberación de RAM, input y display. Tener salida UI y un mecanismo externo documentado de terminar la instancia en emulador. No ejecutar `kill` ni escribir watchdog/config para descubrir su comportamiento. Un timeout del host solo termina el cliente ADB; no asegura la terminación de un programa dentro del guest. Un reboot no sustituye el requisito de devolver el control al reloj sin reiniciarlo.
