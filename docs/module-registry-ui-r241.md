# R241 — ModInfo preparada, solo PC/emulador

**Actualización R242:** paquete posteriormente autorizado e instalado inactivo;
[CHECK manual pendiente](module-registry-physical-result-r242.md). Lo siguiente
documenta la preparación previa al envío, no el estado actual del ensayo.

2026-10-14. [Investigación R240](module-registry-r240.md) integrada en un paquete
Lua/PNG nuevo. **No instalado ni autorizado físicamente.** La causa del fallo
de StepC y su residencia siguen desconocidas; no se abre su nodo o ejecuta C.

## Paquete fijo

ModInfo, ID365219975,15792bytes, perfil r241:
`artifacts/registry-r241/ModInfo-id-only.face`, SHA256
`df32945c91dfa484ce573164ee38daf1bdfe6a05aa9a873a7b172fa0e2b56f99`.
main.lua5984bytes, SHA256
`0abc68497640495a6189fcb50dae35fcefeb5a6a5c55a3b31b2945f1745f462a`.
Cuatro recursos lua/main.lua,legend.png,title.png,check.png verificados byte a
byte en el paquete. Preview de **dos barras naranjas**, título MOD INFO.
PNG originales; dimensiones/leyenda revisadas. No depende de fuentes LVGL.

`registry-source-r241.mjs` exige hash del lector R240 y lo incorpora por función
de reemplazo literal. Solo añade indicadores explícitos de apertura/lectura
antes del cierre, manteniendo el algoritmo y límites. No modifica R240 ni las
pruebas físicas anteriores. Fuente UI: `registry-main-r241.lua`.

Al seleccionar, solo comprueba ausencia de su marca; no lee procfs. CHECK
manual crea/verifica una marca propia de17bytes bajo365219975/lua/,
`registry-attempt-r241.txt`, contenido `RW4-MODINFO-R241\n`. No la elimina:
reentrada o segundo click no repiten la lectura. Marca existente/desconocida
o fallo de escritura/cierre detiene antes de procfs. Sin trabajo desde GC.

Lee únicamente `/proc/modules` en rb con el lector acotado. Sin shell, archivo
de captura, Timer, writes antiguos, `/dev`, ELF, nuevo C, insmod o rmmod.
No muestra ni guarda la tabla cruda o direcciones. No informa integridad del
módulo, referencias, callbacks, privilegios o retirada segura.

## Indicadores, arriba hacia abajo

| Fila | Verde | Rojo / otro color |
|---|---|---|
| MARK | Marca propia escrita y verificada | Error: no consulta |
| OPEN | `/proc/modules` abrió | Error: no inferir registro vacío |
| READ | Lectura acotada y EOF confirmados | Lectura/error/excepción/exceso de tamaño/EOF no confirmado |
| CLOSE | Cierre retornó éxito | Error: no interpretar contenido |
| ASCII | Bytes permitidos y CRLF normalizado | Control/CR aislado u otro byte no reconocido |
| END LINE | Archivo vacío o registros terminados en LF | Falta LF; posible truncamiento, no causa demostrada |
| ROWS | Etapa de límites/filas superada | Fila vacía/exceso de filas o longitud |
| FIELDS | Nueve campos CSV | Campos faltantes/extra |
| NAMES | Nombres acotados y únicos | Nombre inválido/duplicado |
| POINTERS | Punteros u32 hex reconocidos | Campo vacío, overflow o representación desconocida |
| NUMERIC | Enteros u32 decimales | Campo vacío/overflow/formato inválido |
| C MODULE | Registro íntegro incluye rw4step234 | Registro íntegro no lo incluye; gris=desconocido |
| NO MOD | Registro íntegro vacío | Registro íntegro contiene módulos; gris=desconocido |
| NAME HINT | Nunca verde | **Amarillo**=prefijo propio observado; pista, no inventario válido; gris=no pista |
| FINAL | Registro íntegro reconocido y archivo cerrado | Ensayo fallido/bloqueado; no cargar/retirar C |

Etapas de formato se procesan en orden: verde indica que se avanzó a la etapa
siguiente; la primera fallida queda roja y posteriores grises. Si falla CLOSE
o READ, no se interpreta metadata. C MODULE/NO MOD solo dejan gris cuando el
registro completo es válido. NAME HINT amarillo nunca autoriza rmmod, ni
demuestra nodo sano. C MODULE verde con NO MOD rojo es un resultado normal.

## Validación y reproducibilidad

```powershell
node tools/test-registry-r241.mjs
node tools/package-registry-r241.mjs
node tools/pc-rfcomm.mjs build
node tools/test-static-watchface-transfer.mjs r241
node tools/test-static-watchface-session.mjs r241
node tools/test-static-watchface-gates.mjs
node tools/pc-static-watchface.mjs prepare r241
```

Test/package rechazan artefactos existentes. Lector38casos y UI17casos pasan
en Lua S3 real con fixtures tmpfs; procfs/widget/fallos simulados. Incluye marca
persistente, no lectura al seleccionar, doble click, reentrada tras CHECK,
fallo de lectura/cierre, filas truncadas/inválidas y presencia/ausencia no falsa.
Inventario S3 real antes/después idéntico y carpetas temporales retiradas.
Evidencia `artifacts/emulator/registry-r241-final/summary.json`.

Primera prueba UI falló por reemplazo JS que interpretaba `$'` del patrón Lua;
corregido usando callback literal. Log fallido conservado en registry-r241,
fixtures retiradas; versión corregida ejecutada y empaquetada. Es un fallo del
ensamblador detectado en PC, no un resultado de RW4.

Compiler original revisado, pins sin cambios, sin ADB disponible: cero upload
automático. Readback de cuatro recursos correcto. Transfer12casos y sesión36
casos sintéticos pasan; gates Node/C# cerrados verificados con cero sockets.
Preparación offline8partes dentro del presupuesto32768bytes. Helper cerrado
SHA256 `fedc4b769c986b31f8d7f45a023af5493ba7ed388c289a0db3150666d448903e`.
No nuevo Bluetooth/USB/RW4 utilizado. No emulación exacta de M2315W1.

Siguiente: revisar [plan físico R242](module-registry-physical-plan-r242.md),
autorizar un ensayo con observación; no reutilizar aprobaciones consumidas.
