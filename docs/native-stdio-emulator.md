# Lectura stdio desde C

R58, 2026-10-03 (Bogotá). **Confirmado solo en el emulador S3 exacto:** las operaciones stdio que usa el lector WAD de doomgeneric leen correctamente nuestro fixture propio. Lectura completa, 41 ventanas, longitud/restauración de posición, dos errores y tres reaperturas pasan. El módulo y sus temporales se retiraron sin reboot. **No se cargó doom1.wad ni se compiló o ejecutó Doom.**

También se confirmó una diferencia de este guest: fseek exitoso no limpia la marca EOF. La relectura funciona y clearerr sí limpia la marca. `passed=true` significa que pasaron las operaciones y observaciones definidas abajo; no significa conformidad completa de esta libc con C/POSIX.

## ABI y fuente del motor

Guest SHA256 `849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa`, FLAT Cortex-A7/EABI5/hard-float. No aplicar estas direcciones o tipos al M2315W1. FLAT comparte memoria; este módulo no tiene aislamiento de proceso.

El [backend w_file_stdc.c fijado](https://github.com/ozkl/doomgeneric/blob/dcb7a8dbc7a16ce3dda29382ac9aae9d77d21284/doomgeneric/w_file_stdc.c) abre en rb, busca con fseek, lee con fread de elementos de un byte y cierra con fclose. [M_FileLength en m_misc.c](https://github.com/ozkl/doomgeneric/blob/dcb7a8dbc7a16ce3dda29382ac9aae9d77d21284/doomgeneric/m_misc.c) consulta posición, salta al final, consulta longitud y restaura la posición original. La prueba propia reproduce esa secuencia de llamadas; no enlaza ni compila código del motor.

DWARF del guest: long signed de 4 bytes, size_t unsigned32; off_t signed64 ya contrastado en R57. El fseek compilado recibe offset32 en r1, lo extiende con signo y llama fseeko64. ftell llama ftello64 y devuelve la palabra baja como long32. Por tanto no usar la declaración lseek64 para fseek ni esperar posiciones mayores de 2 GiB en esta prueba. FILE se declara como tipo incompleto y se trata como puntero opaco, sin tomar el layout FILE de newlib ni dereferenciarlo.

El [stdio.h OpenVela fijado](https://github.com/open-vela/nuttx/blob/9e79ad292fd103d3b9ef737757081a3f7fbbf9a4/include/stdio.h) es una referencia primaria de prototipos, no la revisión exacta identificada del guest. Símbolos, wrappers, fread, flush de lectura/escritura, modo de apertura y fclose se inspeccionaron en la imagen exacta. CONFIG_STDIO_BUFFER_SIZE=128; fread devuelve cantidad de elementos completos y usa el buffer del stream. ftello corrige la posición física restando bytes prefetched pendientes. No se utilizó acceso directo al FILE para comprobarlo.

| Import | Dirección Thumb | Contrato usado |
|---|---|---|
| fopen | 0xfa3465 | Dos strings válidos; únicamente modo rb |
| fclose | 0xfa353d | Stream propio válido, una vez |
| fread | 0xfa365d | Puntero, size32, count32, stream; retorno size32 |
| fseek | 0xfa37e9 | Stream, long32 signed, origen int32 |
| ftell | 0xfa386d | Posición long32 signed |
| feof / ferror | 0xfa3c55 / 0xfa3c69 | Consulta de flags con stream válido |
| clearerr | 0xfa3cb1 | Limpia flags del stream propio |
| __errno | 0x614ab5 | Lectura inmediata después del error |
| printf | 0xfa2d25 | Diagnóstico |

## Payload y resultado

`experiments/native-stdio/stdio-probe.c`: initializer NSH finito, sin workers, callbacks, drivers, llamadas UI ni imports de escritura. Fopen/fclose sí asignan y liberan recursos internamente en la libc. Todos los streams abiertos por el probe se cierran en las salidas controladas; no se garantiza cleanup ante panic/crash.

ELF ET_REL de 4668 bytes, entry 0x605, 51 relocations R_ARM_ABS32, diez imports permitidos, .data/.bss propios de tamaño0. SHA256 ELF `e78421f6950558a66c51bd4d05aafc4e78c7915bc5762780c71ed7afc504606b`; fuente normalizada LF `b873aa0cdb429aa0ca867a42236141599b81b53cb9a07a930c9577d33736b62e`.

Artefactos ignorados: `artifacts/emulator/native-stdio-1791083260165`. Primer intento de ejecución pasó; no reboot ni candidato fallido cargado. Build inicial no autorizado para cargar hasta inspección del código generado y fijación de hashes.

Fixture: el mismo contenido propio de R57, 1.048.613 bytes; SHA256 `a2db28e8d2e36e24f7b2d04e31bfbce38659094951bafed5834f80cfbebaa65f`, FNV-1a32 `259aadbc`. Se generó otro archivo con nombre propio en tmpfs, sin datos de terceros.

- 2049 lecturas con fread de size1 y count512; última lectura 37, siguiente 0, feof 1/ferror 0. Todos los bytes y checksum coinciden con PC.
- 41 ventanas, nueve bordes y 32 posiciones deterministas; checksums y ftell después de cada lectura coinciden con cálculo Node.
- Tras EOF, fseek al principio devuelve 0, feof sigue 1 y fread lee 13 bytes correctos. clearerr deja feof 0/ferror 0 y conserva posición 13. La observación coincide con el desensamblado: fseeko/flush no limpian el flag EOF.
- Consulta de longitud con posición lógica13 y datos prefetched: devuelve 1048613, restaura 13; siguiente lectura 19 obtiene bytes 13..31 y deja posición 32.
- SEEK_CUR ajusta posición lógica después de lectura buffered, hacia delante/atrás; SEEK_END negativo válido deja 1048576. No se probaron posiciones absolutas negativas ni archivos mayores de 2 GiB.
- Con 37 bytes restantes, fread(size4,count10) devuelve 9 elementos completos y llega al final; se verifican los 36 bytes de elementos completos. Fread(size3,count13) devuelve 13 y avanza 39 bytes; count 0 devuelve 0 y no mueve posición.
- Fopen de nombre propio inexistente devuelve NULL/ENOENT2. Whence 99 con stream válido devuelve -1/EINVAL22 y conserva posición 123. No se pasan NULL, punteros liberados ni streams corruptos a fread/fclose. No se provocó un error de lectura para activar ferror; solo se comprobó ferror 0 en estas operaciones.
- Dos streams mantienen posiciones independientes 790/5 y cierran. Tres reopen empiezan en 0 con flags limpios, leen byte 165 y cierran con rc 0.
- SHA256 del fixture posterior coincide. Marcador final e insmod retornado preceden rmmod; lsmod/ls finales confirman descarga y ausencia de los dos temporales. Shell responde después. No UI activa ni touch ensayados en R58.

Free antes/después: GImageCache usado 1.675.376 estable; Umem usado 18.025.912→18.026.136 (+224), nused 500/nfree 55 iguales; maxused 22.180.660→22.182.380 (+1720). Son dos muestras con actividad de sistema y fixture tmpfs, no memoria pico de Doom ni prueba de ausencia de fugas. Causa de los deltas no aislada.

## Reproducción y límites

Con emulador revisado ya activo, sin otro módulo propio cargado:

```powershell
node tools/inspect-stdio.mjs
node tools/build-stdio.mjs
node tools/run-stdio-emulator.mjs
```

El runner fija guest/source/ELF/ADB, comprueba ownership QEMU y solo usa emulator-5554, servidor 5039 y loopback. Verifica `/tmp type tmpfs` y nombres ausentes antes de copiar, hace readback y retira únicamente ELF/fixture propios. No escribe /data para este checkpoint. El timeout del cliente no mata C; sin marcador final no se descarga a ciegas. No necesita activar UI o resetear el guest para esta prueba.

La marca EOF persistente requiere atención en un adaptador que consulte feof: clearerr quedó probado. El backend WAD inspeccionado no consulta feof en su función de lectura; inferencia limitada: esa diferencia no bloquea la secuencia de lectura ensayada. No se auditó todavía cada uso de stdio en todo el motor. No se validó WAD, memoria del motor, stdio en tarea propia, storage persistente o RW4.

## Siguiente meta única

Validar el lifecycle de una tarea C separada de UI: creación, parada, recogida de la tarea y descarga, primero con payload finito de prueba y ABI inspeccionada. No introducir el motor en un Timer UI que pueda esperar/bloquear.

Motivo concreto: [doomgeneric_Tick en d_main.c](https://github.com/ozkl/doomgeneric/blob/dcb7a8dbc7a16ce3dda29382ac9aae9d77d21284/doomgeneric/d_main.c) llama TryRunTics; [TryRunTics en d_loop.c](https://github.com/ozkl/doomgeneric/blob/dcb7a8dbc7a16ce3dda29382ac9aae9d77d21284/doomgeneric/d_loop.c) puede esperar mediante I_Sleep(1). El sleep actual solo se probó desde NSH, nunca UI. El mecanismo de creación de tarea y su ABI aún no se han validado; tampoco la sincronización engine/LVGL. WAD legal y primera build del motor vienen después de ese contrato, manteniendo independiente el gate físico.

Actualización R59: [worker C finito](native-task-emulator.md) completó create/stop/join desde NSH con UI activa. La siguiente meta actual es integrarlo con START/EXIT del launcher; no se ejecutó el motor ni WAD.
