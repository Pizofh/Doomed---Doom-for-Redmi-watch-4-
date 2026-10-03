# Ejecución y privilegios

No hay ejecución nativa demostrada en esta sesión. No se ejecutaron `insmod`, ELF, `iwasm`, shell Lua ni exploits. No hay una razón demostrada para root/jailbreak. Referencias y estados: [research.md](research.md), [matriz](evidence-matrix.md).

| Camino | Evidencia actual | Bloqueo | Experimento posterior en PC |
|---|---|---|---|
| QuickApp / JS / RPK | API oficial Vela; debug físico documentado S4 | Soporte RW4 y bridge C/WASM no demostrados | App JS mínima, consulta de capacidades; no la llamar C |
| Lua / watchface | Fuente TouchEvents específica RW4 | Versión/runtime, exit y packaging no ejecutados | Reproducir original en emulador |
| Lua → shell | Sin prueba de `os.execute` en RW4 o emulador local | Biblioteca estándar puede estar recortada | Inspeccionar presencia/tipo primero, experimento separado |
| ELF userspace | NuttX upstream soporta loaders según build | ISA, ABI, exports, loader y modo desconocidos | Inventario read-only, luego hello C si hay contrato válido |
| Módulo / `insmod` | NuttX upstream documenta módulos kernel | No presencia ni privilegios comprobados en build Xiaomi | Inspeccionar `help`/config; no cargar para descubrir ABI |
| WASM / `iwasm` | No evidencia específica M2315W1 | Runtime, imports, memoria y UI desconocidos | Identificar comando/config sin ejecutar payload |
| App nativa precompilada/builtin | Concepto upstream | Builtin no significa carga de app arbitraria stock | Identificar registro/launcher y build requerida |

Un componente de UI implementado internamente en C no da a una QuickApp permiso para ejecutar un binario arbitrario. La existencia de una toolchain Linux ARM no basta: NuttX necesita contrato de libc, relocations, arquitectura y símbolos compatible. No usar un ELF Linux en el emulador como ensayo de compatibilidad.

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

Registrar encabezado ELF esperado (clase/endian/machine, tipo ET_REL/ET_EXEC/ET_DYN), ISA y flags, EABI/FPU, toolchain y versión, linker/relocations, entrypoint, libc y símbolos/imports. Identificar quién ejecuta init/exit, contexto/task, stack/heap, privilegios y recuperación del emulador. Distinguir binario host del payload guest. Falta toda esa caracterización local.

Hello C posterior: imprimir una línea y devolver; sin drivers, hooks, writes, persistencia ni display. Solo promover ese checkpoint cuando exista un mecanismo demostrado y coherente. El esqueleto de `experiments/hello-native` no contiene código ni build anticipados.

## Salida antes del hardware

Probar abrir/cerrar repetidamente y medir liberación de RAM, input y display. Tener salida UI y un mecanismo externo documentado de terminar la instancia en emulador. No ejecutar `kill` ni escribir watchdog/config para descubrir su comportamiento. Un timeout del host solo termina el cliente ADB; no asegura la terminación de un programa dentro del guest. Un reboot no sustituye el requisito de devolver el control al reloj sin reiniciarlo.
