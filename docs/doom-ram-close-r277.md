# R277: cambiar de esfera con Doom activo y recoger al volver

El 2026-10-15 pasó un ciclo real de E1M1 con el backend RAM nuevo: salir de
UIProbe seleccionando Storage, sin EXIT, y volver a UIProbe. El finalizador
pidió STOP; la reentrada completó la retirada desde la UI. **Solo emulador
S3; no hubo conexión ni escritura nueva al reloj físico.**

## Resultado

| Momento | Evidencia |
|---|---|
| START | E1M1 activo, pthread88, frames producidos |
| Seleccionar Storage365700764 | GC registró `close retained stop=true` |
| Después del cierre de Lua | finished1, joined0; controles neutrales; módulo conservado |
| Volver a UIProbe365799903 | Identifica módulo, solicita STOP, retira caché desde UI, JOIN y rmmod |
| Después de JOIN | reason1, code0, 14 reservas/14 liberaciones, cleanup_error0 |
| Después de unload | Hilo y tres nodos ausentes; launcher muestra Closed / resources retired |
| Prueba posterior | Dos START/EXIT, movimiento, ambos giros, disparo y pausa/reanudación pasan |

No se solicitó STOP ni unload desde la herramienta del PC. No se usó reset para
salir o recoger. El último snapshot del motor tenía wall_ms34587, por debajo
del límite120s: la terminación se atribuye al STOP observado, no al límite de
ejecución. El pico contabilizado fue6.583.985bytes, sin incluir BSS/stack/cachés.

Resultado acumulado:
`artifacts/emulator/doom-ram-close-reentry-1792075170831/result.json`.
Fases anteriores: `doom-ram-close-start-1792075105534` y
`doom-ram-close-closed-1792075142307`. Regresión posterior:
`doom-ram-test-1792075184081/result.json`, threads210/344, ambos14/14.
La captura `screenshots/r277-collected.png` se inspeccionó visualmente.

## Cambio

El finalizador marca el contexto como cerrado antes de pedir STOP. No elimina
widgets, invalida cachés, espera JOIN ni descarga código. Los callbacks del
timer dejan de operar sobre la UI cerrada.

Al entrar, el launcher comprueba el nodo y exige una única fila del módulo
`rw4doomram276` en `/proc/modules`, además de la versión/estado esperado. No
inicia otro motor mientras recoge el anterior. Desde el timer UI elimina la
presentación retenida mediante op7, espera finished, hace JOIN, verifica las
reservas y descarga únicamente ese módulo. Se conserva la comprobación C de
identidad del task que hizo START: no se permite transferir el control a otro
owner. En este guest, cierre y reentrada conservaron el contexto UI compatible.

Se permite navegación stock fuera de los controles mediante scroll-chain del
root. Los botones conservan sus flags propios sin propagación de gestos. La
navegación de este ensayo empezó por el margen derecho x385, evitando pulsar
PAUSE/EXIT al deslizar. No se modificó el ajuste global de pulsación larga.
Este test no demuestra el comportamiento de todos los gestos físicos del RW4.

No cambió el código C ni el ELF: sigue siendo610.484bytes/SHA256
`4cc023ce788a69605c1265b874dc4926e27c11b1673b133f79c95939a330af2a`.
Lua actual tiene SHA256
`ea7c49214c013e7fbaccbe2eca6a189517137413b900a0e2f077af44e87fdd5b`.
Se reconstruyó para actualizar el manifiesto de fuentes y verificar el mismo
binario. No se repitieron las fixtures C sin cambios.

## Reproducción

```powershell
node tools/build-doom-ram-s3.mjs
node tools/package-ui-probe.mjs doomram
# UIProbe inactiva en la VM y ningún módulo propio cargado:
node tools/install-ui-probe-emulator.mjs refresh
node tools/doom-ram-s3-emulator.mjs stage
# Seleccionar UIProbe desde el selector stock:
node tools/test-doom-ram-close.mjs start
# Elegir Storage desde Ajustes/Esferas sin pulsar EXIT:
node tools/test-doom-ram-close.mjs closed
# Volver a seleccionar UIProbe; no pulsar START:
node tools/test-doom-ram-close.mjs reentry
# Comprobar otra vez salida explícita y controles con las fuentes revisadas:
node tools/doom-ram-s3-emulator.mjs test
node tools/doom-ram-s3-emulator.mjs cleanup
```

La herramienta nueva tiene fases registradas, verifica el launcher y el ELF,
comprueba el cierre antes de la reentrada y conserva la evidencia. Solo utiliza
el QEMU revisado, ADB5039/emulator-5554. No ejecuta escrituras al nodo de control
ni llamadas LVGL desde el CLI. Los cambios de esfera se hacen por la UI stock.

La VM necesitó un reset antes de instalar/stage, sin módulos ni archivos del
ensayo, para recuperar input tras reposo. Ninguna terminación de Doom dependió
de ese reset. Al terminar, los dos temporales ELF/WAD fueron verificados y
retirados; UIProbe queda instalada, con launcher cerrado y recursos ausentes.
El directorio persistente del port S3 anterior sigue conservado.

## Límites y siguiente checkpoint

Esto cubre el cierre normal del intérprete al cambiar de esfera. No garantiza
limpieza tras corrupción, panic, kill, falla de drivers ni un owner distinto.
Hasta volver a entrar, se conserva deliberadamente el módulo y su memoria
estática; el worker sí termina. No se denomina sandbox a esta retención.

El siguiente checkpoint es cerrar los contratos específicos RW4 de imagen,
filesystem/caché, memoria y ruta del WAD para preparar el ensayo físico
agrupado. La prueba PC no confirma los bindings, decoder ni RAM libre del
M2315W1. R270 sigue siendo el último ensayo físico y no existe autorización
para enviar el ELF PC ni un nuevo payload.
