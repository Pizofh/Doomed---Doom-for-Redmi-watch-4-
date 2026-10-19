# R395: evitar descompresión innecesaria al inicializar gráficos

La medición física R394 dio CHECK4590, ELF144, TOTAL32674, VERIFY1218,
INIT26008, READY27887, FRAME41, CLOSE198 y CLOCKERR0, en ms salvo el flag.
INIT supone el79,6% de TOTAL; READY incluye VERIFY e INIT. Ese resultado
justifica investigar doomgeneric_Create, no otra optimización del loader.

## Investigación local

El perfil S3 instrumenta R_Init, S_Init, lecturas/recodificación de efectos y
fallos de las dos páginas de caché. Usa el ELF R394 fijado y objetos sustituidos
en un directorio nuevo. Publica contadores atómicos únicamente en fixtures PC;
no se distribuye ese perfil ni cambia la ABI del reloj.

Dos arranques originales: Create3870/3891ms; render2902/2909ms;
S_Init817/832ms, de los cuales leer sonidos729/737ms y codificar87/94ms.
Lectura/descompresión/CRC de páginas3681/3704ms,364 fallos y9993343 bytes
comprimidos leídos por páginas. Los intervalos están anidados, no se suman.

Leer solo cabeceras de texturas dio3579/3610ms; añadir cabeceras de sprites
derivadas del WAD dio2721/2720ms. Son experimentos locales, no payloads físicos.

La variante seleccionada incluye los metadatos necesarios de469 patches y
1381 sprites (158608B). Derivados del WAD privado fijado por SHA256, permiten
preparar tablas sin leer/descomprimir los píxeles de todos esos recursos.
No se incluyen datos derivados en Git: se generan en build ignorado.

Resultado emulado seleccionado: Create1009/990ms frente3870/3891ms,
media3880,5→999,5ms (-74,24% del tramo Create, NO de toda la apertura).
Render26/26ms; S_Init831/817ms;49 fallos y2182267 bytes comprimidos leídos.
El audio modelado y la velocidad S3 limitan cualquier extrapolación al reloj.
No se promete todavía una duración física ni una mejora porcentual total.

## Límites y candidato

La verificación integral del archivo comprimido y CRC de cada página leída
siguen intactas. Runtime, lector, adapter, transporte, controles y audio son
idénticos a R393 por hashes en ambos targets. Solo se recompila r_data.c.
La tabla de texturas comprueba identidad de lump/posición/tamaño antes de
usarse; la de sprites comprueba intervalo y cantidad. El píxel y la composición
de texturas siguen usando los caminos originales del WAD. No admite otro WAD
ni PWAD distinto de la identidad que ya fijan las verificaciones del producto.

RW4 ELF790692B, SHA256f6e298d367dc37df596b1d2b35b5a60bdf0fdd66c7f53a5655bbbd68e0c27d7e.
Residente2056428B frente1897868B (+158560B); el futuro launcher debe elevar
el mínimo de7036928 a7196672B, sin rebajar el bloque mínimo4194320B.
Todavía no hay launcher/paquete físico R395 ni transporte autorizado.
El ELF de investigación usa el WAD instalado en011 y no debe enviarse solo.

## Validación

Dos ciclos del motor candidato con menú original, posición inicial, pausa,
guardar/cargar, cargar desde título y join/unload completos: aprobados, todos
los efectos cacheados310485B y error0. Campaña y comparación de tablas nativas
se registran al terminar sus comprobaciones. No es una partida completa de
la campaña ni validación visual/audio del hardware.

Herramientas: tools/profile-doom-init-r395.mjs,
tools/doom-texture-headers-r395.mjs y tools/test-doom-metadata-r395.mjs.
Builds originales permanecen intactos. No se hizo operación Bluetooth.

## Validaci?n completada ? 2026-10-19

Los32 mapas arrancaron y aprobaron guardar/cargar y join/unload sin errores, con310485B de efectos cacheados. El wrapper retir? sus directorios y WAD propios del emulador. Resultado artifacts/research/doom2-campaign-r395/result.json; no es una campa?a jugada completa.

Comparaci?n nativa de tablas generadas: originales y candidato produjeron el mismo hash FNV32 de todas las columnas de texturas/composite sizes (3469632181) y de anchuras/offsets de todos los sprites (2698088337), en dos aperturas cada uno. Hashes de regresi?n, no prueba criptogr?fica de im?genes completas. Fixtures baseline-check y metadata-check en build/doom-init-r395-*/result.json. Ambos cerraron y descargaron sus m?dulos; no queda WAD propio ni m?dulos de estas pruebas.

Confirmaci?n de tiempos en esos fixtures con hashing: original3812/3783ms frente1045/1000ms, coherente con la reducci?n principal observada. Motor original/R393 y candidato/R395 tienen adapter, transporte, audio, runtime y lector iguales por hashes para RW4 y S3. No se modificaron ni seleccionaron esferas f?sicas.
