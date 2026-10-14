# R230–R231 — controles de UI conectados a C, solo S3

Completado2026-10-14. **C/Lua/LVGL reales en el emulador S3; no nuevo hardware.**
HoldPad R226 sigue siendo el último ensayo físico. StepPad no está preparada
para instalarse en RW4: carga un ELF específico CortexA7/S3 desde tmpfs.

## Resultado

El nodo propio `/dev/rw4step230` comunica Lua con el módulo `rw4step230`.
START carga C y devuelve control a la UI. Sostener UP/LEFT/RIGHT/FIRE durante
3300ms produce confirmación de C y mantiene su máscara; soltar neutraliza.
El Timer real solicita STEP y dibuja una barra cuya posición procede del contador
devuelto por C. Se observaron81ACK de STEP consecutivos y máscaras0/1/2/4/8.
La pulsación larga stock estaba ON; selector no apareció en esos cuatro holds.

EXIT manual envió STOP, confirmó estado neutral, retiró el nodo y descargó C;
cinco indicadores verdes y mensajes Unregister0/refs0/held0 lo verificaron antes
de cerrar el proceso host. Hold neutro después abrió el selector stock. Un ciclo
anterior llegó a300callbacks y salió automáticamente, retirando también C.
No engine/Doom, render nativo de frames, pthread o worker independiente: son
llamadas cooperativas breves y un contador diagnóstico, no gameplay alternativo.

## Implementación

[Bridge C](../experiments/native-step/bridge-s3-r230.c) reutiliza el core R229.
ABI S3 previamente inspeccionada: file_operations40bytes, primeros callbacks
open/close/read/write en0/4/8/12; modinfo16bytes. `struct file` permanece opaco:
no accede a f_priv, TCB o punteros de Lua. Únicamente register_driver,
unregister_driver y printf del ELF S3 exacto. Sin tareas, timers nativos,
drivers físicos, malloc propio o escritura de archivos/flash desde C.

Solo un handle propio abierto a la vez. Write requiere request24bytes; el core
rechaza errores, y el adapter los convierte en máscara0/pausa. Read entrega un
snapshot32bytes con cursor y EOF por apertura. Uninit rechaza active/paused,
mask mantenida o handle abierto; después de STOP/estadoidle retira el nodo.
Contrato para un cliente serial controlado; refs no es una solución atómica
para clientes arbitrarios concurrentes. El módulo tiene acceso amplio, no sandbox.

[Cliente Lua](../experiments/native-step/client-s3-r230.lua) usa I/O no bufferizado,
handles `<close>`, flush/cierre/longitud/EOF/ACK verificados. Consume seq al completar
write, incluso si pierde ACK; STOP recupera solo una secuencia compatible y
estado propio reconocido. Comprueba inventario vacío antes de carga, único registro
propio antes de retiro y ausencia posterior de nodo/módulo. Cualquier incertidumbre
retiene C; no rmmod ciego. GC intenta STOP sin widgets; crash/terminación forzada
y esa ruta específica de GC no probados en este checkpoint.

StepPad se deriva de la fuente HoldPad fija mediante anclas únicas; el paquete
físico anterior no cambia. UI solo pone una acción verde tras ACK; Timer exige
held coincidente y actualiza posición desde steps C. EXIT pausa Timer y confirma
stop/unload antes de mostrar launcher. Fallo de unload no produce EXIT verde.
La marca START es por VM, no flash; reapertura sin START no carga C.

## Validaciones y artefactos

| Ensayo | Resultado | Límite |
|---|---|---|
| CLI Lua/io/C real |34assertions, cuatrobits/hold/release/steps/pausa/resume | No UI |
| Descarga activa desde CLI | Rechazada; STOP permitió retiro | No concurrencia arbitraria |
| Write inválida | Neutraliza/pausa, conserva seq; STOP limpia | No todos los errores driver/FS |
| UI real | Cuatroholds3300ms/release y cincoverdes tras EXIT | Ratón S3, no comodidad/touch RW4 |
| Barra de contador C | Posiciones71/251/121/311/191;81ACK ordenados | No FPS ni motor Doom |
| Longpress | ON durante holds; selector tras EXIT | Solo esta UI/S3 |
| Parada automática |300STEP observados, Unregister0 y salida | Presupuesto cooperativo, no watchdog duro |
| Estado final | Neat activa, StepPad inactiva, IDs previos conservados, módulo/nodo/temporales ausentes | Inventario final independiente DESPUÉS de relanzar host |

ELF S3 **2604bytes**, SHA256
`89863182dabd4c8ce63c398c8734b98c4d1079c5dc68019bc68acecdc69f253c`;
18ABS32, imports resueltos3, Thumb/CortexA7/hardfloat, no thread. StepPad
ID365219978/20468bytes SHA256
`f42cfcc39f25650ae86313e28c43d2f99eb24345e3a26a59e49400738f121fa5`.
UISHA `63972b10b1d8a2085e624132ee62dc93a0953d2c137a6c3336e5df5cd1b1f4b0`.
Paquete incluye Lua/PNG propios, no ELF; este se prepara separadamente en /tmp.
Ningún perfil físico de transferencia para StepPad. Gates Node/C# anteriores cerrados.

Informes privados: `artifacts/emulator/step-bridge-r230/summary.json`,
`artifacts/emulator/step-ui-r231/{contact-test,validation}.json`, capturas
`step-r231-*` y logs previos preservados en `prior-host/`. Sin binarios stock
o logs crudos publicados. El checker separa pruebas antes del cierre del host
de la restauración/inventario posterior; no atribuye ausencia de RAM después
de reboot a limpieza anterior.

## Incidencias y recuperación de la sesión PC

Primer build rechazado por misleading-indentation; corregido sin relajar
warnings-as-errors. Conservado bajo build/native-step-bridge-r230; build válido
en sufijo-reviewed. Al reconstruir catálogo, apareció un JSON vacío transitorio;
se reanudó inspección del paquete ya enviado, sin duplicar instalación. El script
ahora espera el catálogo completo, no solo existencia del archivo.

Primera comprobación de barra exigía20píxeles verdes: LVGL redondea las puntas
y quedan18en la fila examinada. Mientras se ajustaba, el budget300callbacks
detuvo y retiró C. Tras verificar nodo/módulo ausentes se cerró/reabrió la UI
S3 y se completó el ciclo manual, sin cambiar fuentes/ELF de producción.
Algunos swipes del selector no avanzaron; se revisó la pantalla antes de elegir
Neat finalmente. Una reapertura intermedia sin START no cargó C.

El host dejó de estar presente entre mensajes. Usuario informa que la
conversación se canceló al agotarse tokens: **causa probable**, no demostrada
por exit code/crashdump. No diagnosticar crash C. Se archivaron stdout/stderr/
record antes de relanzar. Inventario/restauración acabaron después de ese reinicio:
Neat362130003 activa, StepPad inactiva, longpressOFF inicial restaurado. No se
repitieron los contactos. `luaCloseBeforeHostLoss=false`: no afirmar cierre normal
de VM antes del corte; el retorno y cierre final corresponden al host relanzado.

## Reproducción, con dependencias revisadas

```powershell
node tools/build-step-bridge-r230.mjs
node tools/test-step-bridge-emulator-r230.mjs
node tools/package-step-ui-r231.mjs
node tools/install-step-ui-emulator-r231.mjs
# Si catálogo vacío transitorio: resume verifica paquete/inventario, no lo reenvía.
# Settings: longpressON, seleccionarStepPad. Captura cycle2-ready según test.
node tools/test-step-ui-r231.mjs
# EXIT/selector/stock y restaurar toggleOFF; comprobar y guardar evidencia.
node tools/check-step-ui-r231.mjs
```

En esta sesión el checker usa logs archivados tras el corte. No es CI GUI
end-to-end: requiere revisión de pantallas y sus capturas. Scripts rechazan
resultados existentes. No repetir pruebas ya aprobadas sin cambios/fallos nuevos.

Siguiente checkpoint PC: inspeccionar dispatch/ABI y retirada del nodo específico
en la imagen RW4; preparar candidato de puente solo cuando ese contrato esté
respaldado. Ningún envío físico autorizado por «continúa».
