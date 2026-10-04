# Lectura y posiciones de archivo desde C

R57, 2026-10-03 (Bogotá). **Confirmado solo en el emulador S3 exacto:** C abrió un archivo propio en modo solo lectura, verificó sus 1.048.613 bytes, realizó 41 lecturas por posición y manejó cuatro errores esperados. Todos los handles propios se cerraron, se descargó el módulo y se eliminaron sus dos temporales sin reboot. No se compiló Doom ni se usó un WAD o el reloj físico.

## Contrato inspeccionado

Guest SHA256 `849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa`, FLAT Cortex-A7/EABI5/hard-float. Compartir memoria con el sistema sigue implicando riesgo: el módulo no está sandboxeado. Estas direcciones no son utilizables en M2315W1.

`inspect-fs.mjs` conserva símbolos, funciones desensambladas, macros y tipos DWARF acotados en artifacts ignorados. `off_t` sigue off_t→int64_t→_int64_t→signed long long de8 bytes; size_t es unsigned32 y ssize_t signed32. `CONFIG_FS_LARGEFILE=1`. La función lseek compilada recibe fd en r0, offset en r2/r3 y whence en stack; devuelve el offset en r0/r1. Se declaró explícitamente ese contrato, sin adoptar tipos POSIX de newlib como ABI del guest.

Macros de este guest: O_RDONLY=1, SEEK_SET=0, SEEK_CUR=1, SEEK_END=2, ENOENT=2, EBADF=9 y EINVAL=22. O_RDONLY no es el valor0 habitual de Linux. Los wrappers compilados de open/read/lseek/close traducen errores a -1 y errno; __errno obtiene el almacenamiento de la tarea. El probe captura errno inmediatamente después de cada fallo esperado.

Fuentes primarias relacionadas: [fcntl.h OpenVela fijado](https://github.com/open-vela/nuttx/blob/9e79ad292fd103d3b9ef737757081a3f7fbbf9a4/include/fcntl.h) y [fs_lseek.c](https://github.com/open-vela/nuttx/blob/9e79ad292fd103d3b9ef737757081a3f7fbbf9a4/fs/vfs/fs_lseek.c). No se identificó esa revisión como fuente exacta del guest: el código moderno separa nx_seek, que no aparece como símbolo en esta imagen. La ABI se determina por DWARF y código compilado del guest revisado.

| Import | Dirección Thumb | Uso limitado |
|---|---|---|
| open | 0x641a8d | Fixture fijo en solo lectura y nombre inexistente propio |
| read | 0x641e79 | Buffer512/73/1 bytes; fd=-1 para EBADF |
| lseek | 0x641751 | Offset signed64, tres orígenes, posición alta sin lectura |
| close | 0x640c31 | Handles abiertos por el probe |
| __errno | 0x614ab5 | Lectura inmediata del error de la tarea |
| printf | 0xfa2d25 | Marcadores y checksums de diagnóstico |

## Payload y fixture

Fuente: `experiments/native-fs/fs-probe.c`. ELF ET_REL de3680 bytes, entry0x481,35 relocations R_ARM_ABS32, sin imports adicionales ni .data/.bss propios. Usa stack local, sin allocator, workers, callbacks retenidos, UI o drivers. La ejecución ocurre dentro del initializer invocado por NSH. Sus bucles están limitados; un fallo dentro de una llamada del sistema aún podría colgar el guest. El timeout ADB termina el cliente y no detiene C; si falta el marcador final, el runner deja el estado para inspección y no descarga a ciegas.

SHA256 fuente normalizada LF: `fde5747ed5edb6c944d9d26df0c539588c5495a8954108168ba8c7a49071337c`.

SHA256 ELF: `872950b90470b8b6a3f6d56087dcf4bfcfc11cfbdccbc15750030bdd8175a3fa`.

Fixture propio de1MiB+37 bytes; byte en posición i = ((i×37) XOR (i>>8) XOR (i>>16) XOR 0xa5) AND255. No contiene assets de terceros. SHA256 `a2db28e8d2e36e24f7b2d04e31bfbce38659094951bafed5834f80cfbebaa65f`; FNV-1a32 completo `259aadbc`.

El runner comprueba ownership QEMU/loopback, guest y ADB revisados, módulo propio ausente, tres nombres propios libres y mount `/tmp type tmpfs` antes de copiar. C abre únicamente en solo lectura; no importa write. El host copia ELF y fixture a tmpfs, verifica readback SHA256 y posteriormente retira solo `/tmp/rw4-fs-probe.elf` y `/tmp/rw4-fs-fixture.bin`. No escribe /data para esta prueba; no instala persistencia nativa.

## Resultado reproducido

Artefactos locales ignorados: `artifacts/emulator/native-fs-1791082444827`. Primer intento de ejecución pasó; no hubo candidato fallido cargado ni reset. Build inicial con contractReviewed=false se inspeccionó antes de fijar pins y cargar.

- Lectura secuencial:2049 llamadas de hasta512 bytes; última lectura corta37; siguiente lectura devuelve0 en EOF. Cada byte y checksum coinciden con el fixture generado en PC.
- Nueve posiciones de borde y32 posiciones pseudoaleatorias deterministas,41 ventanas en total. Incluyen cruce de512/65536 bytes, último byte y lectura de longitud0 justo en EOF. Bytes, tamaños, posiciones resultantes y41 checksums coinciden con cálculo independiente en Node.
- SEEK_SET, SEEK_CUR hacia delante/atrás y SEEK_END con offset negativo válido. Ninguna prueba solicita posición negativa absoluta.
- Seek a 2^32+7, consulta de posición y restauración a0 pasan: argumento y retorno conservan palabra alta. **No** se leyó allí, no se creó archivo de4GiB ni se probó acceso a datos mayores de32 bits.
- Nombre propio ausente: ENOENT; read(-1) y lseek(-1): EBADF; whence99 con fd válido: EINVAL, posición conservada. El archivo ausente continúa inexistente al terminar.
- Dos aperturas del mismo archivo mantienen posiciones independientes:777 y333. La segunda se cierra; la primera se cierra al retornar. Reabrir comienza en0, lee byte165 y cierra con rc0.
- SHA256 del fixture después de C coincide. Marcador final windows41/errors4/close0 e insmod retornado preceden rmmod. lsmod y ls finales confirman descarga y ausencia de ambos temporales. Shell responde después; no se probó touch ni UI activa en R57.

`free` antes/después: GImageCache usado1.675.376 sin cambio; Umem usado18.025.688→18.025.912 (+224), nused500/nfree55 sin cambio; maxused21.165.812→22.180.660 (+1.014.848). El fixture ocupó tmpfs durante la prueba, pero no se aisló la causa de cada delta. Estas dos muestras no demuestran ausencia de fugas ni memoria pico del futuro motor; la RAM del emulador tampoco indica RAM física RW4.

## Reproducción

Desde la raíz del proyecto, con el emulador revisado del usuario ya activo y sin otro módulo propio cargado:

```powershell
node tools/inspect-fs.mjs
node tools/build-fs.mjs
node tools/run-fs-emulator.mjs
```

No acepta destinos, comandos, fixtures ni binarios externos por argumentos. Herramientas, source y ELF cambiados cierran el gate de carga. PowerShell build admite FsProbe; en este PC se usa Node sin cambiar ExecutionPolicy. Capturas de UI congeladas no se utilizan como evidencia de actividad ni hace falta despertar/resetear el guest para comprobar archivo en NSH.

## Alcance y siguiente checkpoint

Este resultado demuestra POSIX read/lseek sobre tmpfs en el guest exacto. No prueba acceso C a FAT persistente, cuota, WAD, stdio, allocator del motor, scheduling, rendimiento, savegames, launcher persistente o compatibilidad física.

El backend [w_file_stdc.c de doomgeneric fijado](https://github.com/ozkl/doomgeneric/blob/dcb7a8dbc7a16ce3dda29382ac9aae9d77d21284/doomgeneric/w_file_stdc.c) usa fopen("rb"), fread, fseek y fclose. Su compatibilidad aún no se deduce de POSIX. **Siguiente meta única:** comprobar esas operaciones y consulta de longitud mediante stdio con el mismo fixture propio, tras inspeccionar su ABI. No compilar Doom todavía. Scheduling y recursos del motor serán gates posteriores, además del gate físico independiente.
