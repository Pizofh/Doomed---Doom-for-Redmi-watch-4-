# R63: lectura del WAD shareware desde C

2026-10-04. **CONFIRMADO EN EMULADOR**, exclusivamente guest S3 fijado: C leyó `doom1.wad` shareware 1.9, validó los límites de las 1264 entradas, leyó 16 recursos seleccionados y recorrió los 4.196.020 bytes. Todos los checksums coinciden con el PC. No se compiló ni ejecutó Doom; leer E1M1 no equivale a cargar el nivel en el motor. Hardware M2315W1 sin tocar.

## Procedencia y distribución

El usuario descargó `doom-wad-shareware_1.9.fixed.orig.tar.gz` del [mirror de Debian PSNC](https://ftp.psnc.pl/linux/debian/pool/non-free/d/doom-wad-shareware/). El enlace de deb.debian.org anunciado en la ficha devolvió 404 al usuario; la terminal dio EACCES al intentar descargar desde gamers.org. No se intentó eludir esas restricciones.

La [ficha Debian](https://packages.debian.org/sid/doom-wad-shareware) identifica el paquete como datos shareware para un motor separado. Su [registro de copyright](https://metadata.ftp-master.debian.org/changelogs/non-free/d/doom-wad-shareware/doom-wad-shareware_1.9.fixed-5_copyright) conserva la licencia limitada de id y una aclaración de John Carmack de 1999 que permite distribuir el WAD shareware. El archivo conserva copyright de id, restricciones sobre modificaciones y condiciones para distribución comercial; no es un asset GPL ni autoriza redistribuir el WAD comercial. Política del proyecto: datos locales, sin incluir WAD ni archivo comprimido en Git o artifacts públicos. No hace falta publicarlos para reproducir el port.

La identidad se contrastó con tamaño, MD5 y SHA1 de [game-data-packager de Debian, versión67](https://sources.debian.org/src/game-data-packager/67/data/doom.yaml/): 4196020, `f0cefca49926d00903cf57551d901abe`, `5b2e249b9c5133ec987b3ea77596381dc0d6bc1d`. Es comprobación de identidad, no validación de firma del editor; MD5/SHA1 son hashes antiguos. SHA256 locales fijados tras esa comprobación:

- Archivo comprimido1756095bytes: `e02c8b5e01be7373d4c53f82556118e2aaaf8f83fa2af5eee1efadf9c55c4eb1`.
- WAD4196020bytes: `1d7d43be501e67d927e415e0b8f3e29c3bf33075e859721816f652a526cac771`.

No se verificó firma Debian ni comparó un SHA256 publicado por id. El tar contiene solo `doom-wad-shareware-1.9.fixed/doom1.wad`. El importador propio usa zlib y parsing acotado, comprueba checksum del header, límites y tipos; rechaza links y rutas inseguras. Escribe exclusivamente el WAD verificado en `tools/local/doom-shareware`, ignorado. Ningún ejecutable descargado se ejecutó.

## Contrato nativo

Formato contrastado con [w_wad.h de doomgeneric fijado](https://github.com/ozkl/doomgeneric/blob/dcb7a8dbc7a16ce3dda29382ac9aae9d77d21284/doomgeneric/w_wad.h). Parser propio de inspección, sin copiar renderer/gameplay ni enlazar el motor. Header12bytes y entradas16bytes little endian; se decodifican bytes, sin castearlos a structs. Límites: archivo8MiB, entradas4096, offsets/tamaños dentro del archivo y nombres ASCII acotados. Se exige E1M1..E1M9 y la secuencia de diez recursos del primer mapa. Comprueba tamaños de registros, pero no interpreta geometría ni valida cada contenido del juego.

`experiments/native-wad/wad-probe.c` es un initializer NSH finito: abre `/tmp/rw4-wad-probe.wad` únicamente `rb`, cierra en las salidas controladas y retorna. Sin tareas, drivers, callbacks, escritura de datos ni llamadas LVGL. FILE opaco y long/size_t32; nueve imports del contrato R58 ya revisado. clearerr antes de seek evita depender del comportamiento EOF particular del guest. Dos buffers512bytes se combinan en un frame compilado de1100bytes más36bytes de registros; esto no incluye stack interno de libc ni es un pico medido.

Guest SHA256 `849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa`, FLAT Cortex-A7/Thumb/EABI5/hard-float. FLAT comparte memoria y privilegios; RAM-only no es sandbox. No usar direcciones/ELF sobre RW4.

Pins: fuente LF `c2076359cf52951d17e745a0df136724f59899f117e829306c00a66205d1d94a`; ELF3672bytes `5f75898a47ee32b58cfa0bd0c60b983d3a22cf6222aafdeb32f43dcee9b93e37`, entry0x4c1,42 ABS32, .data/.bss0, sin imports no resueltos. Build GCC14.3 revisado y reproducido; código generado inspeccionado antes de cargar. Primer build falló por dos advertencias de indentación; corregidas antes del ELF y ningún candidato fallido cargado.

## Resultado reproducible

`artifacts/emulator/native-wad-1791133863026/result.json`: passed=true, primer runtime pasa sin reset. Directorio en4175796, FNV32 `d3db499b`; archivo completo8196 lecturas con buffer512, FNV32 `03c09342`, EOF1/error0. FNV es diagnóstico, no autenticación.

Las16 lecturas completas seleccionadas incluyen marcador E1M1, sus diez entradas THINGS..BLOCKMAP, PLAYPAL, COLORMAP, PNAMES, TEXTURE1 y TITLEPIC. Índices/offsets/tamaños/checksums coinciden con cálculo independiente Node. Se hizo readback SHA256 antes de cargar y después de leer: WAD intacto. Insmod retornado y close0 preceden rmmod. Módulo `rw4wad` y sus dos archivos tmpfs retirados; shell responde y Storage365700764 sigue registrada activa. No se comprobó actividad táctil/UI en este ensayo ni se confía en una captura congelada para afirmarlo.

Umem usado18009744→18009968 (+224), maxused21166380→25328004 (+4161624); nused500/nfree55 iguales. GImageCache usado1071144 estable. Dos muestras incluyen copia tmpfs del WAD y actividad del sistema; no aíslan causas ni prueban ausencia de fugas o presupuesto RAM físico. Solo se mantuvo un buffer pequeño dentro del lector C; la copia tmpfs completa sí ocupa memoria del guest.

Tests host con bytes propios pasan: un IWAD estructural, un tar y27 rechazos de entradas truncadas, límites, nombres, mapas, tipos/rutas/checksum tar e identidad equivocada. No ejecutan esos archivos negativos en C ni prueban equivalencia completa de ambos parsers. Ningún asset id se usa en esos tests.

```powershell
node tools/import-shareware.mjs
node tools/test-wad-data.mjs
node tools/build-wad.mjs
node tools/run-wad-emulator.mjs
```

Requiere archivo descargado en la ruta fija local y guest revisado funcionando, Storage activa y módulos propios ausentes. El runner fija guest/ELF/source/ADB, loopback5039/emulator-5554 y tmpfs. No USB ni /data writes. Si no observa completion/close correctos, deja evidencia y exige inspección; timeout del cliente no cancela C. No unload a ciegas.

## Siguiente checkpoint

Auditar dependencias libc y memoria de doomgeneric fijado y preparar su build sin sonido para este guest. Primero resolver contrato de allocator, salida del motor y lectura desde su worker. No ejecutar motor automáticamente sobre hardware. Persistencia WAD/C en storage, savegames, ergonomía y compatibilidad M2315W1 siguen pendientes.
