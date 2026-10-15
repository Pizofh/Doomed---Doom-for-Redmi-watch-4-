# R273: enlace completo del candidato, solo en PC

El motor original, runtime, libc privada, adaptador y puente enlazan con **cero
símbolos externos pendientes**. No se ha enviado ni ejecutado este candidato en
el reloj. No es todavía un paquete instalable ni una demostración de Doom físico.

## Resultado reproducible

Después de preparar las fuentes y el runtime R271:

```powershell
node tools/build-doom-rw4-libc.mjs
node tools/build-doom-rw4-device.mjs
node tools/build-doom-rw4-bindings.mjs
```

Salida local ignorada: `build/doom-rw4-bindings/doom-rw4-candidate.elf`.
601308 bytes; secciones asignables 897872 bytes; entrada Thumb 202385.
SHA256 `67ebfd6f117040d89b5894997c0f0f9ab2cd35a09afd9b5aca4d69221cfe4dc7`.
ARMv8-M.mainline/base PCS soft-float, ET_REL, VMA cero por sección.
Relocaciones presentes: ABS32, THM_CALL y THM_JUMP24. Esto no demuestra que
el loader físico acepte el binario completo ni que exista RAM suficiente.

El presupuesto anterior aumenta 436 bytes: subtotal 7478096 bytes con zona
de 6 MiB, DG 256000 bytes y stack 32768, antes de extras/loader/otros heaps.
La RAM libre real de aplicaciones sigue sin medirse.

Los builders anteriores mantienen su identificador de etapa R272; el resultado
del enlace con bindings se registra como R273. No se descargaron dependencias.

## Procedencia y contratos

[Manifiesto](../doom/platform-rw4/device/firmware-bindings.lock.json) con 20
entradas y SHA256 de 64 bytes por entrada. Imagen AP candidata local R193:
SHA256 `2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db`.
Base de código candidata `0x0c100000`; offsets de archivo en la tabla.
No se publica la imagen, sus bytes ni un memory map completo supuesto.

| Función candidata | Offset | Evidencia y límite |
|---|---|---|
| malloc / free | 1f5180 / 1f513c | Wrappers al mismo heap global; inferencia estática |
| fopen / fclose / fread | 1ebf0c / 1ebff4 / 1ec130 | Usadas físicamente por ensayos previos; no prueba este port completo |
| fseek / ftell | 1ec2b8 / 1ec328 | Rutas Lua seek/tell; wrapper de offset/long de 32 bits |
| feof / ferror / clearerr | 1ec970 / 1ec984 / 1ec9cc | Accessors de flags; FILE permanece opaco para nuestro código |
| token del task actual | 1bd000 | Devuelve el puntero TCB actual; NO PID/gettid ni pthread_t |
| reloj de 64 bits | 1b9934 | Retorno r0/r1; conversión de Lua y otras rutas sugieren 10000 Hz |
| usleep | 1f3da4 | Handler NSH y conversión usec/timespec inspeccionados |
| attr init / destroy / stack | 1e88c0 / 1e88ec / 1e8934 | Copia/limpieza de 12 bytes, tamaño en word +8; inferencia estática |
| thread create / join | 1e8aac / 1bbca0 | Wrapper de cuatro argumentos y ruta de espera/resultado; sin prueba física de estos contratos |
| register / unregister | 497624 / 497670 | Registro StepC y retirada ExitC físicos anteriores, más inspección |

`0x1bc310` corresponde a cancelación, no a join: no se utiliza.
No encontramos un gettid por nombre; no se inventó ese símbolo. El runtime
compara un token de identidad del task obtenido sin interpretar el TCB. El
`_getpid` de la libc privada devuelve 1; no convierte una dirección en PID.

[Wrappers tipados](../doom/platform-rw4/device/firmware-bindings.c) evitan que
FILE/reent privados atraviesen la frontera entre bibliotecas. `rw4_host_validate`
compara FNV de las 20 regiones antes del primer registro de nodos. Un rechazo
devuelve -8 sin registrar el puente. Esto detecta diferencias en esas regiones,
no autentica firmware completo, no prueba ABI y no protege contra un mapa
incompatible que falle al leer código. Tampoco crea aislamiento de privilegios.

Inspección reproducible de nombres, referencias y ventanas acotadas:

```powershell
node tools/review-doom-rw4-platform.mjs
node tools/review-doom-rw4-platform.mjs follow
node tools/review-doom-rw4-platform.mjs detail
```

Ya ejecutada: salidas inmutables en `artifacts/research/doom-platform-r273*`.
No volver a ejecutar sobre esos directorios existentes. Incluyen candidatos
descartados; una etiqueta del disassembly no confirma el nombre de la función.

## Validación que sí se ejecutó

```powershell
node tools/test-doom-rw4-transport.mjs
node tools/test-doom-rw4-libc.mjs
```

Emulador S3 propio y fijado, recompilación para su ISA, nunca el ELF RW4:

- Puente: 1038 comprobaciones en un fixture, incluidas unas 1000 lecturas de
  fragmentos del mismo frame. Nuevo caso: rechazo de validación deja cero nodos.
  Kernel y worker simulados; no prueba concurrencia ni pthread real.
- Libc: dos instancias independientes, salida normal y OOM; 18 comprobaciones
  cada una, seis reservas/seis liberaciones, cero streams/bloques al salir,
  fixture de siete bytes intacta. No es una medición del motor completo.
- Módulos y temporales propios de ambas pruebas retirados.

Resultados privados: `doom-transport-r272-1792025238648/result.json` y
`doom-libc-r272-1792025249299/result.json` bajo `artifacts/emulator`.
La recompilación fue necesaria por el token de identidad, la libc y el nuevo
rechazo de inicialización; no se repitieron ensayos físicos.

## Imagen en RAM: vía identificada, aún no validada

En la imagen RW4, el método Lua `set_src` en offset `0x5e1cac` acepta userdata
o string, obtiene su dirección y llama a un veneer en `0x5b4220`, cuyo destino
es `0x1c03dfd9`. Es evidencia estática de una ruta de puntero, **no** de un
descriptor RGB565 compatible. Ese destino no se puede interpretar como offset
directo en el archivo AP. La función propiedad `src` inspeccionada no basta
para concluir que `image:set{src=...}` y `image:set_src(...)` son equivalentes.

La función [luavgl_toimgsrc upstream](https://raw.githubusercontent.com/XuNeo/luavgl/master/src/util.c)
también obtiene punteros de strings/userdata. Su master actual no identifica
la revisión exacta del firmware RW4. En
[LVGL 8.3.11, lv_img_set_src](https://raw.githubusercontent.com/lvgl/lvgl/v8.3.11/src/widgets/lv_img.c)
una fuente variable conserva el puntero. Su
[descriptor de imagen](https://raw.githubusercontent.com/lvgl/lvgl/v8.3.11/src/draw/lv_img_buf.h)
es contexto técnico, no prueba de la versión/layout configurado por Xiaomi.

Consecuencia: hay que conservar descriptor, píxeles y módulo mientras LVGL o
su backend puedan usarlos. Ni retornar de `set_src`, ni esperar un Timer, ni
cerrar el stream demuestran por sí solos que el render terminó. Nuestro frame
RGB565 con header de 32 bytes no se entrega directamente como descriptor LVGL.
No se integró una liberación basada en una espera arbitraria.

## Siguiente trabajo concreto

Cerrar la entrega C → Lua → imagen LVGL y su retirada, sin escribir cada frame
en flash. Después integrar WAD/ruta persistente, marca de propietario, worker
real y ciclo completo de Doom en PC. Solo entonces preparar el ensayo físico
agrupado E1M1/controles/EXIT para revisión. R270 sigue siendo la última operación
física completada; no hay un envío nuevo autorizado ni se rearman marcas viejas.
