# Contrato nativo del emulador: investigación estática

Inspección del 2026-10-03, iniciada antes de compilar/cargar C. Posteriormente se completó el [hello nativo](hello-native-emulator.md). Esta página describe exclusivamente la imagen guest de MiWatchEmulator v1.0, identificada como Xiaomi Watch S3; no establece compatibilidad con M2315W1.

## Imagen y evidencia reproducible

Archivo local: `emulator/local/reviewed-v1.0/system-images/vela-release-4.0/nuttx`.
SHA256: `849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa`.
El hash debe contrastarse con el reporte local, que es la referencia de identidad; no redistribuir el firmware.

```powershell
node tools/inspect-native.mjs emulator/local/reviewed-v1.0/system-images/vela-release-4.0/nuttx modules
```

Reporte local ignorado: `artifacts/package-review/nuttx-modules-static.json`. El inspector lee bytes, secciones ELF, símbolos y cadenas de depuración; no ejecuta la imagen ni llama sus direcciones.

| Dato | Evidencia en el guest | Alcance |
|---|---|---|
| ELF32 little-endian ARM, EABI5, hard-float | Encabezado ELF, flags `0x5000400` | Imagen del sistema; no contrato completo del payload |
| GCC 11.3.1 20220712 | Cadenas de unidades de compilación | Compilador original del guest |
| Cortex-A7, Thumb, hard-float, neon-vfpv4 | `-mcpu=cortex-a7 -mthumb -mfloat-abi=hard -mfpu=neon-vfpv4 -march=armv7ve+simd` | Flags encontrados; no flags del BES2700iBP |
| FLAT y módulos | `CONFIG_BUILD_FLAT 1`, `CONFIG_MODULE 1` | Memoria compartida; no sandbox |
| Loader ELF relocatable | `CONFIG_BINFMT_ELF_RELOCATABLE 1` y funciones `modlib_*` | Hello propio ligado al guest cargado y descargado posteriormente |
| Tabla allsyms | 44.839 entradas de 8 bytes, nombre y valor | Lectura estática; binding del loader pendiente |
| `puts`, `printf`, `malloc`, `free`, `memcpy`, `clock_gettime` | Nombres en allsyms | No prueba de imports resolubles |

Tres nombres superan el límite de lectura de 1.024 bytes del inspector y se omiten de la selección de APIs cortas. Ninguna entrada tiene nombre nulo. Los valores de funciones en allsyms difieren en el bit Thumb respecto de sus símbolos ELF: no generar un header de direcciones absolutas a partir de esa tabla.

## Fuente de referencia y diferencia de versiones

El guest anuncia revisión `9aec7d0ff1`; no se encontró esa revisión en el repositorio público OpenVela consultado. Su código exacto todavía no está identificado.

OpenVela actual, revisión [`9e79ad292fd103d3b9ef737757081a3f7fbbf9a4`](https://github.com/open-vela/nuttx/tree/9e79ad292fd103d3b9ef737757081a3f7fbbf9a4), implementa `insmod` mediante `libelf_insert`. El guest conserva funciones `modlib_*`; el código actual no es una réplica del loader observado.

Como referencia histórica se inspeccionó Apache NuttX 12.3.0, commit [`8fdb56b5f2124de351a48125a252ba4264665e3d`](https://github.com/apache/nuttx/tree/8fdb56b5f2124de351a48125a252ba4264665e3d). No se afirma que el guest use esa versión.

- [`mod_insmod.c`](https://github.com/apache/nuttx/blob/8fdb56b5f2124de351a48125a252ba4264665e3d/sched/module/mod_insmod.c): carga y enlaza el módulo; para ET_REL llama un initializer calculado desde memoria de texto y `e_entry`, pasando información del módulo.
- [`modlib.h`](https://github.com/apache/nuttx/blob/8fdb56b5f2124de351a48125a252ba4264665e3d/include/nuttx/lib/modlib.h): el initializer devuelve `int`; la información contiene uninitializer, argumento y exports. No equivale a `main(argc, argv)`.
- [`mod_rmmod.c`](https://github.com/apache/nuttx/blob/8fdb56b5f2124de351a48125a252ba4264665e3d/sched/module/mod_rmmod.c): comprueba dependencias, llama al uninitializer cuando existe y libera las asignaciones del módulo.
- [`modlib_symtab.c`](https://github.com/apache/nuttx/blob/8fdb56b5f2124de351a48125a252ba4264665e3d/libs/libc/modlib/modlib_symtab.c): selección de tabla depende de la configuración. Encontrar allsyms no basta para asegurar que sea la tabla de imports.

Se contrastaron con objdump las funciones reales insmod, rmmod, modlib_getsymtab, modlib_symvalue, modlib_findglobal, symtab_findbyname, modlib_verifyheader y up_checkarch/up_relocate. Init ET_REL recibe información del módulo y devuelve int; rmmod libera memoria y permite uninitializer nulo. El payload usa únicamente R_ARM_ABS32, cuya rama suma el valor del símbolo al word de destino. El ELF entry Thumb 0x1 cumple la validación observada. No se usó la carga para descubrir la ABI.

## Toolchain obtenida y revisada

El enlace antiguo de Arm 11.3 en developer.arm.com falló en el navegador del usuario. Se solicitó el ZIP portátil Arm GNU Toolchain 14.3.rel1, Windows x64 / arm-none-eabi, y su checksum desde Arm Keil. El enlace del ZIP consta en [`supportedToolchains.ini` de Raspberry Pi](https://github.com/raspberrypi/pico-vscode/blob/81e0cd88cf920b3a8c2a3619dd7c0572062fba09/data/0.18.0/supportedToolchains.ini). Las peticiones web devolvieron tipos binarios que la herramienta no interpreta; la revisión se completó posteriormente con la descarga local.

El usuario descargó ZIP y checksum; coincidieron. Se inspeccionaron manifiesto, documentación GNU y las seis herramientas utilizadas; extracción local sin PATH global. [Hashes, flags y resultados](hello-native-emulator.md). GCC 14.3 produjo el módulo con atributos ARM y relocations revisados antes de ejecutarlo.

Checkpoint hello C completado en el emulador. Display, timers, input C, filesystem y DOOM permanecen pendientes. `insmod` en FLAT comparte memoria con el sistema incluso si el archivo reside en `/tmp`.
