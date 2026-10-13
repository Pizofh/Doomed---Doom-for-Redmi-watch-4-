# R194 — contrato parcial del loader RW4 y primer C compilado en PC

2026-10-13. Inspección estática de la imagen principal obtenida en [R193](firmware-analysis-r193.md),
SHA256 `2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db`.
No se ejecutó esa imagen, el módulo generado o ningún comando físico.

## Método y trazabilidad

Se buscaron strings acotados de shell/modlib y sus referencias, y se
desensamblaron ventanas concretas con GNU objdump de la toolchain Arm ya
verificada. Código propietario y desensamblados completos quedan en artifacts,
ignorados por Git; este documento registra conclusiones y offsets de evidencia.

La hipótesis inicial de un único mapeo lineal de strings con el alias 0x2c no
produjo referencias. Se amplió la búsqueda y se validó una tabla de comandos
con nombre, handler Thumb, límites de argumentos y ayuda. Para este grupo de
strings, dirección menos offset de archivo da 0x3bff187c; los handlers coinciden
con código en el archivo usando 0x0c100000. **No es un memory map completo ni
un header de direcciones para el port.** El ranking heurístico produjo falsos
candidatos: solo las referencias contrastadas con tabla y llamadas se usan aquí.

Se contrastó la estructura con NuttX 12.3.0, commit
[`8fdb56b5f2124de351a48125a252ba4264665e3d`](https://github.com/apache/nuttx/tree/8fdb56b5f2124de351a48125a252ba4264665e3d):
[mod_insmod.c](https://github.com/apache/nuttx/blob/8fdb56b5f2124de351a48125a252ba4264665e3d/sched/module/mod_insmod.c),
[modlib.h](https://github.com/apache/nuttx/blob/8fdb56b5f2124de351a48125a252ba4264665e3d/include/nuttx/lib/modlib.h),
[modlib_symtab.c](https://github.com/apache/nuttx/blob/8fdb56b5f2124de351a48125a252ba4264665e3d/libs/libc/modlib/modlib_symtab.c).
Son referencias para interpretar el binario, **no la versión exacta del source
Xiaomi**. Las conclusiones siguientes se comprobaron en la imagen RW4.

## Lo que comprueba esta implementación

Todos los offsets de esta tabla son offsets del archivo descomprimido.

| Aspecto | Evidencia estática | Conclusión acotada |
|---|---|---|
| Arquitectura de arranque | 0x14–0x26: MSP, MSPLIM, CONTROL e ISB; rutas armv8-m | Refuerza ARMv8-M/Thumb; no identifica por sí solo el core comercial |
| Entrada del shell | Handler insmod 0x220910 llama a 0x1bb6cc con filepath/modname | Se localizó una implementación, no solo un nombre en help |
| Admisión ELF | 0x1e800c verifica magic y e_type==1; llama a 0x1e6a24 | Esta ruta acepta ET_REL y rechaza ET_DYN/ET_EXEC |
| Arquitectura ELF | 0x1e6a24: e_machine==40, EI_CLASS==1, EI_DATA==1 | ELF32 ARM little-endian; no valida allí ISA/FPU/atributos completos |
| Inicialización | 0x1bb734–0x1bb740: textalloc+e_entry; r0=&modinfo; BLX; retorno int | Inicializador con un puntero, no main(argc,argv); retorno negativo provoca retirada por error |
| modinfo | Se pasa module+24; rmmod lee callback en +24 y arg en +28 | Dos primeros campos equivalentes a uninitializer/arg de la referencia NuttX |
| Descarga | Handler rmmod 0x220954 busca el nombre y llama a 0x1bb79c | Comprueba dependencias, callback opcional y libera allocations/registro |
| Relocación tipo 2 | TBH de 0x1e6a62 lleva al caso 0x1e6bf0 | Suma valor del símbolo al word de destino: R_ARM_ABS32 |
| Imports | Resolución de undefined puede consultar registro de módulos y getter 0x1e7f48 | Tabla global/número leídos de memoria; contenido runtime todavía desconocido |

La identificación de [R_ARM_ABS32 y ELF ARM](https://github.com/ARM-software/abi-aa/blob/main/aaelf32/aaelf32.rst)
se contrasta con la especificación de Arm. No se afirma que todas las relocaciones
emitidas por Doom sean admisibles; se inspeccionó un caso concreto.

El initializer se invoca directamente desde el loader, sin crear una tarea o
transición de aislamiento visible en ese tramo. Esto **no establece** la build
FLAT/PROTECTED/KERNEL ni el privilegio actual de NSH; no llamar sandbox al módulo.
Hay instrucciones VFP en rutinas del loader. Eso demuestra código con esas
instrucciones, no el ABI de paso de argumentos float/double del sistema.

No se recuperó aún una tabla de imports utilizable. En particular, `printf` y
`free` aparecen también como comandos NSH: su nombre en la tabla **no identifica
la función libc correspondiente**. No generar direcciones de APIs a partir de eso.

## Candidato C construido, sin ejecución

[minimal.c](../experiments/hello-native-rw4/minimal.c) es un inicializador que
ignora el argumento y devuelve cero. No imprime hello, modifica modinfo, llama
APIs, reserva memoria, retiene callbacks o abre drivers. Permite revisar el
formato de una futura primera carga con dependencia mínima del firmware.

```powershell
node tools/build-rw4-minimal.mjs
```

Build Arm GNU 14.3 revisada, flags principales:
`-march=armv8-m.main -mthumb -mfloat-abi=soft -Os -ffreestanding`.
Soft es una elección para este C entero sin llamadas; **no un contrato de ABI
flotante para Doom**. Se descartó la alineación de dos bytes de la primera build
y se fijó explícitamente a ocho en el source. La primera build fallida se
conserva fuera de Git; no se relajó el check para admitirla.

| Resultado revisado | Valor |
|---|---|
| Artefacto privado | build/hello-native-rw4/r194/minimal.elf |
| Tamaño ELF | 784 bytes |
| Tipo/entry | ELF32 ARM LE ET_REL, e_entry=1 (Thumb) |
| Código ejecutable | 4 bytes: movs r0,#0; bx lr |
| Imports/relocaciones | Cero/cero |
| Alineación .text | 8 bytes |
| SHA256 ELF | `8248f76bdabd9c44aee6df46e8ba4d8c999acc9ca1d0c8367e1652ce0675da6d` |
| SHA256 source al compilar | `4b63f15f8e9223b338d3932e4c54bf10339c5e3dc0693682ad51a87a6aaa53bb` |
| Ejecución/compatibilidad física | No ejecutado; no verificada |

El script verifica hashes de seis herramientas y de la imagen, cabecera,
atributos, imports, relocaciones y código exacto. No importa componentes de
transporte o emulador. La compilación reproducible no demuestra una carga exitosa,
recuperación ante fallo del loader o aceptación del filesystem físico.

## Comandos de investigación ejecutados solo en PC

```powershell
node tools/review-rw4-loader.mjs
node tools/review-rw4-references.mjs
node tools/review-rw4-references.mjs --infer
node tools/review-rw4-references.mjs --infer-wide
node tools/review-rw4-references.mjs --candidate
node tools/disassemble-rw4-loader.mjs
node tools/disassemble-rw4-loader.mjs --contract
node tools/disassemble-rw4-loader.mjs --relocation
```

Los reportes están en artifacts/research/rw4-loader-r194. La revisión corregida
de referencias es candidate-references-v2.json: codeBase 0x0c100000. Son datos
privados de investigación; scripts rehúsan overwrites y no deben repetirse para
crear reportes idénticos. Scripts/source propios sí se versionan.

Validación: build con warnings como errores, auditoría ELF/código exacto
completada, sintaxis de los cuatro scripts Node correcta y diff sin errores
de whitespace. Se confirmó que el ELF/desensamblados están ignorados por Git
y los dos gates físicos siguen false. No se repitió la batería de Doom/S3:
estos cambios no usan ni alteran el port o runtime del emulador.

## Lo que falta antes del hardware

Determinar contexto/privilegios y cómo preparar y retirar el archivo nativo
mediante nuestro paquete sin alterar componentes stock. Revisar riesgos del
loader, recuperación disponible y retorno al launcher. Para el port completo
faltan además imports y ABI de sus APIs. El candidato no se empaquetó ni se
envió y los gates físicos permanecen cerrados. El próximo checkpoint es cerrar
el plan concreto del primer ensayo C; ninguna carga física queda autorizada
por la compilación o por el ensayo anterior NativeInfo.
