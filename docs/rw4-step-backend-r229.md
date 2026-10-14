# R227–R229 — backend cooperativo candidato y núcleo C probado

2026-10-13. Solo PC/emulador; ningún teléfono/Bluetooth/comando físico nuevo.
HoldPad R226 sigue siendo el último ensayo del reloj, completado y sin repetir.

## Decisión de diseño

Para el primer puente se prefiere un módulo residente con callbacks breves:
Lua entrega acciones y solicita un STEP desde su Timer; C devuelve estado y
devuelve el control al finalizar cada llamada. El siguiente paso es un nodo
virtual propio en el pseudofilesystem, no un driver del touchscreen ni un archivo
actualizado en flash por cada acción. Esta arquitectura ya funcionó en S3;
el adapter RW4 y su ABI aún necesitan validación específica.

Esto es ejecución cooperativa, no C y Lua en paralelo. Residente significa
código/datos retenidos en RAM hasta cierre, no un bucle independiente. Doom
podría avanzar por llamadas acotadas a su motor original; la duración de init,
tick y render y su impacto sobre UI siguen sin medir en RW4. Si luego hace falta
un worker, se investigará como alternativa con lifecycle propio.

No recargar insmod por cada frame, escribir entradas en flash continuamente,
usar package.loadlib como si estuviera habilitada o leer input stock por detrás.
EXIT futuro debe detener el trabajo, neutralizar input, cerrar referencias y
retirar el nodo antes de descargar C. Una bandera de STOP sola no demuestra
ausencia de callbacks, descriptores o hilos dentro del código.

## Investigación específica de 2.2.86

Imagen privada de R193,6636408bytes,SHA256
`2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db`,
tratada como datos, nunca ejecutada/distribuida. Objdump oficial Arm14.3 revisado
SHA256 `ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1`.
Los offsets siguientes son de archivo y **no un header para ejecución**.

| Candidato | Evidencia estática | Alcance |
|---|---|---|
| pthread_create wrapper0x1e8aac | Caller stock0x3062a0; wrapper reordena4argumentos, añade trampoline y llama0x1bba74 | Inferencia fuerte; ninguna llamada física |
| pthread_startup0x1e8a90 | Llama entry(arg) y pasa retorno a salida stock | Rastreado; no thread nuevo probado |
| pthread_join0x1bbca0 | Fuente diagnosticada pthread_join.c, lookup grupo/joininfo, espera y copia retval a argumento2 | Inferencia fuerte; depende del grupo de creación |
| 0x1bc310 NO es join | Literal0x1bc380 apunta a pthread/pthread_cancel.c; cuerpo solicita cancelación | Refutado el candidato provisional R228; no usar para esperar salida |
| pthread_attr_init0x1e88c0 | Copia12bytes desde default compartido con create | El campo usado como stacksize es2048; no RAM libre ni stack recomendado Doom |
| register_driver0x497624 | Caller stock0x1c1e3c pasa path/ops/mode/priv; reserva inode, asigna ops/priv y tipochar | Inferencia fuerte; nuevo contrato físico no probado |
| unregister_driver0x497670 | Lock, callee compatible con inode_remove, unlock y retorno | Inferencia; referencias/errores precisan revisión |
| Tabla fops0x66444 | Ocho pointers Thumb seguidos de /dev/urandom; referencia stock como ops | Dato de tabla; no inferir configuración/ABI entero por coincidencia |

Fuentes primarias comparadas, **NuttX10.3.0 upstream, no fuente Xiaomi exacta**:

- [create interno](https://github.com/apache/nuttx/blob/nuttx-10.3.0/sched/pthread/pthread_create.c), blob `2e64bf4a68cc4553eeebc9d52e0fcaa78457d23e`.
- [wrapper create](https://github.com/apache/nuttx/blob/nuttx-10.3.0/libs/libc/pthread/pthread_create.c), blob `b9e8d692c4adca68c55c6f0eb281978948e42c87`.
- [join](https://github.com/apache/nuttx/blob/nuttx-10.3.0/sched/pthread/pthread_join.c), blob `f200461b3e3af515b3413ce8f2e9c42079dd44b1`.
- [modlib.h](https://github.com/apache/nuttx/blob/nuttx-10.3.0/include/nuttx/lib/modlib.h), blob `6b72429cee763912b20374a9abdf3c63082968df`.
- [fs.h](https://github.com/apache/nuttx/blob/nuttx-10.3.0/include/nuttx/fs/fs.h), blob `8c7b5d2ff78522e65e63818d98202413d98ded84`.
- [register_driver](https://github.com/apache/nuttx/blob/nuttx-10.3.0/fs/driver/fs_registerdriver.c) describe registro de un nodo char en pseudofilesystem; su flujo coincide con el cuerpo inspeccionado.

Solo se descargaron cinco archivos fuente oficiales como texto, con aprobación
de red después del bloqueo del sandbox. No herramientas nuevas ni binarios
descargados ejecutados. Las cinco copias tienen SHA256/blobSHA guardados en el
informe R228; la sexta referencia se leyó en web. No identificar NuttX10.3 exacto
en Xiaomi por esa comparación. Privilegios/configuración siguen desconocidos.

## Núcleo portable, ejecución real en S3

[core-r229.h](../experiments/native-step/core-r229.h) define un request24bytes:
magic/version/seq/op/held/reserved; response32bytes con seq/phase/held/steps/edges.
Serialización LE explícita; no struct de wire dependiente de padding. Una secuencia
exacta evita replay y gaps; comandos START/INPUT/STEP/PAUSE/RESUME/STOP. Cuatro
bits de acción, sin duplicar edge al mantener la misma máscara. PAUSE/STOP
neutralizan; RESUME exige nuevo INPUT; STOP impide volver a START en ese estado.
STEP solo aumenta contador diagnóstico, **no render/gameplay ni motor alternativo**.

No OS, alloc, driver, thread, timer, lectura de dirección firmware o filesystem
en el core. Mensajes inválidos no cambian estado; el adapter futuro deberá
cancelar/pausar ante fallo de transporte y no seguir con teclas mantenidas.
Counters/seq rechazan overflow; el futuro presupuesto finito debe evitar llegar
a ese límite durante una sesión. No claims de concurrencia/atomics/identidad
del cliente o descarga segura a partir de `rw4_step_is_stopped`.

[tests-r229.c](../experiments/native-step/tests-r229.c) ejecutó41assertions reales
como inicializador S3: cuatrobits mantenidos/repetidos/STEP/release, combinación3,
pause/resume/stop/restart rechazado, snapshot, longitud/magic/version/reserved,
secuencia repetida/gap, máscara/op inválidos y overflow. Entrada de test finita;
único import puts ya revisado del guest, sin nuevo nodo, thread o UI conectada.

ELF S3 **2600bytes**, SHA256
`a902b5d417864a738332600f9f59963740fe4168838ce8aa6be2c9f9e4ee5f0f`,
CortexA7/Thumb/hardfloat, dosR_ARM_ABS32 y cero imports sin resolver. Nunca enviarlo
al RW4. CoreSHA `c35bae7691012ef29507e19354d06f96119a3266362ce4621994b7642b1cba5b`;
fixtureSHA `55d157b582376412adaa081117fc4dac10a4964bc0b518eba9aefe11ae0e232c`.
Salida `RW4_STEP_CORE_OK 41`, registro observado/retirada confirmada, inventario
de módulos igual y propio `/tmp/rw4stepcore229.elf` retirado/verificado.

Primer build pidió memset generado por inicialización agregada; allowlist
rechazó antes de push/insmod. Se conservó el intento y se reemplazó esa
inicialización por stores propios explícitos. Segundo build tuvo solo puts.
No se amplió la allowlist para hacer pasar el test.

## Reproducción y siguiente meta

```powershell
node tools/research-rw4-scheduling-r227.mjs
# Requiere las cinco fuentes upstream fijadas, guardadas como texto.
node tools/research-rw4-worker-contract-r228.mjs
node tools/review-rw4-scheduling-r229.mjs
# Emulador propio iniciado/verificado; no usa ADB de teléfono.
node tools/test-step-core-emulator-r229.mjs
```

Scripts rechazan resultados existentes; no repetir lo ya aprobado para continuar.
Datos privados: artifacts/research/rw4-scheduling-r227,rw4-worker-contract-r228,
rw4-scheduling-r229; test válido artifacts/emulator/step-core-r229-reviewed.
Inspecciones follow/driver-follow/driver-core adicionales de R228 se conservaron;
las funciones definitivas y rangos son reproducibles con el reviewer R229.

**Siguiente meta única PC:** verificar layout/dispatch/lifecycle de file_operations
y modinfo específicos y conectar core al nodo propio con Lua, probando ACK/input/
EXIT en S3. No hay todavía módulo/paquete RW4 desplegable o nuevo plan físico.
No se necesitan flash, root, firmware modificado o exploits para esta investigación.
