# R284: memoria física medida y Doom con zona de4MiB probado en S3

El usuario proporcionó fotos de las dos páginas de MemInfo y confirmó menús y
retorno a su esfera habitual sin problemas. Esto completa el ensayo R283.
No se repitió ni se envió nada más al reloj. Por preferencia nueva del usuario:
commits locales; sin push, consultas remotas CI ni auditorías de publicación
cuando no se vaya a publicar. Mantener exclusiones y gates físicos cerrados.

## Medición física M2315W1/FW2.2.86

| Pool mostrado | TOTAL bytes | FREE bytes | LARGEST bytes |
|---|---:|---:|---:|
| IMG?CACHE | 13631144 | 9160312 | 8413048 |
| UMEM | 11031720 | 7005128 | 6928624 |

Transcripción estructurada: `experiments/memory-preflight/observations-r284.json`.
Las fotos originales no se publican: incluyen parte del escritorio del usuario.
El signo `?` sustituye un carácter que nuestro UI no representa; no conocemos
el nombre exacto del primer pool a partir de esa pantalla. No hace falta otro
ensayo físico para corregirlo. Hay dos pools en la misma captura, no dos
mediciones independientes. No sumarlos ni presentarlos como RAM física total.

Umem libre≈6,68MiB; bloque mayor≈6,61MiB. El primer pool parece destinado a
imágenes por su nombre, pero su relación con malloc/loader no está demostrada.
No afirmar que el espacio de un pool pueda emplearse automáticamente desde otro.
Esta observación también confirma lectura/cierre de `/proc/meminfo` y UI de
MemInfo en esta unidad. Es una captura, no una garantía de disponibilidad futura.

El presupuesto orientativo anterior era7515845bytes antes del decoder,
cargador y otras reservas: **supera Umem libre en510717bytes**. Un bloque de
6MiB podría caber por sí solo, pero eso no basta para todo el port.

## Cambio mínimo y resultado

El `i_system.c` de doomgeneric fijado localmente ya implementa `-mb`: con esa
opción usa la cantidad indicada en lugar del default de6MiB. Se pasó `-mb 4`
al argv del adaptador experimental S3, sin cambiar renderer, gameplay,
resolución320×200, motor upstream o WAD. No se parcheó el motor ni se modificó
el candidato RW4 previo; la prueba nueva es **solo ARMv7-A/S3**.

Primero se reprodujo byte por byte el ELF S3 anterior R282, reutilizando los
80 objetos de Doom y bibliotecas fijadas. Solo se recompiló el adaptador.
Nuevo ELF610568bytes, SHA256
`8400146175448f1f9a1b3b87325bede2accea8604c35835c624bc9bf9da45ccc`.
Se conserva en `build/doom-low-memory-r284/`, ignorado por Git.

Dos ciclos completos, cada uno con carga/descarga nueva, pasaron:

- E1M1 original; frames RGB565320×200 con143 colores distintos.
- Avance, ambos giros, disparo, pausa y reanudación comprobados en estado C.
- STOP, finalización, JOIN,14reservas liberadas de14 y cleanup_error0.
- Módulo ausente después de cada ciclo; ELF/script temporales retirados.
- Pico runtime contabilizado **4486833bytes**, antes6583985: ahorro exacto
  **2097152bytes (2MiB)** en ambos ciclos.

El ensayo consume frames por el nodo propio desde un solo task Lua, sin widgets
LVGL ni lease de imágenes. No afirma un nuevo ensayo visual del launcher, FPS,
estabilidad prolongada, otros mapas ni viabilidad física. El launcher S3
persistente anterior sigue instalado, sin tocar sus archivos o selección.

## Presupuesto orientativo actualizado

Proyección usando static RW4 anterior899092 + pico runtime S3 reducido4486833
+ stack32768 = **5418693bytes**. Frente al snapshot Umem dejaría1586435bytes,
aproximadamente1,51MiB, **antes** del overhead de allocator, carga/relocación,
decoder/cachés, Lua/UI y variación del sistema. El static del futuro ELF RW4
recompilado debe volver a medirse. No es un límite ni una medida física de Doom.

El resultado mejora la plausibilidad; no autoriza cargar el módulo físico.
Siguiente trabajo útil: incorporar la opción a un candidato RW4 con presupuesto
explícito, medir su static y reservas transitorias del loader, y terminar el
journal/lock del instalador grande. No más probes de formato de memoria.
Un primer ensayo nativo grande requerirá plan y revisión propios.

## Reproducción local

Con dependencias revisadas y el VM propio S3 activo, sin módulos cargados:

```powershell
node tools/build-doom-low-memory.mjs
node tools/test-doom-low-memory.mjs
```

El builder no sobrescribe un review completo. El test verifica guest/ADB,
registro vacío, nodos ausentes, ELF por hash y WAD persistente legal ya revisado.
Solo puede usar ese VM loopback. No hay conexión física, firmware ni instalación
de otro paquete. No se ejecutaron CI remota, push o pruebas ajenas a este cambio.
