# R298: imagen de Doom pausada, diagnóstico pendiente de aprobación

**No instalado, sin nueva ejecución física.** Propuesta: una instalación
inactiva y UN arranque manual con imagen congelada, seguido de EXIT y retorno.
Es diagnóstico, no un parche de render confirmado. Reutiliza sin modificar
el ELF/WAD ya presentes; no introduce código C ni bindings nuevos.

## Artefacto y mecanismo

| Elemento | Valor |
|---|---|
| Dispositivo/firmware | M2315W1 / 2.2.86 |
| Paquete nuevo | DoomStill, ID365219959,29772bytes,20recursos |
| SHA256 paquete | `09e9da3ff0301a2f479abe8cd9c98b0fe055c7f0edb13e9ee72a2fe27e45f7ba` |
| SHA256 Lua | `7c2af63e4832d32199256f107b053ae9bba1f260e006bf5fd535dd14672fdb59` |
| ELF existente |365219963/lua/doom.elf,603760bytes,SHA256 `980e13cc85813d463d229aec93b4b2000654b188b3c80a36bdcf30eaa3a3c8a5` |
| Journal nuevo |tools/local/pc-rfcomm/doom-snapshot-r298.json |

Artefacto: artifacts/doom-snapshot-r298/package/DoomStill-id-only.face.
No reemplaza ni borra ninguna esfera. La selección actual se conserva durante
la instalación. Con14entradas conocidas puede alcanzar15; si el reloj rechaza
por espacio/cupo, parar sin borrar ni reintentar automáticamente.

Al seleccionar muestra una PNG propia320×200 con cuatro colores y cuadrícula
blanca. START consume una marca de un uso de14bytes en el paquete nuevo y hace
los mismos CRC completos/cabeceras/tamaños y umbrales UMEM de R291.
Carga el MISMO módulo rw4doom282 con el mismo WAD. Cuando hay un frame, Lua
envía PAUSE, crea UNA Image para /dev/rw4doomimage.bin y conserva esa Image y
lease. No la renueva ni invalida durante la observación. No permite RESUME ni
controles de movimiento/disparo en esta variante. El C no cambia.

Después de300callbacks desde START nativo (~30s) solicita STOP, o antes al
pulsar EXIT. La salida conserva detach/STOP/finished/JOIN/balance/cleanup/
identidad/rmmod/registro/nodos. CLOSED vuelve a mostrar la cuadrícula PNG.
Timer y límite nativo120s son cooperativos, NO watchdog duro.

## Operaciones tras autorización

Usuario observando con batería≥50%, reloj normal, sin OTA/otro cliente/cambios
de vínculo. Backup disponible: fuentes/paquetes/hashes y catálogo/journal,
no imagen integral de firmware/datos ni recovery integral validado.

1. Habilitar temporalmente PHYSICAL_WRITES_REVIEWED+REVIEWED_VARIANT=r298 en
   pc-static-watchface.mjs y StaticPhysicalReviewed en Probe.cs; demás gates
   cerrados. Reconstruir y `prepare r298`.
2. UNA vez: `node tools/pc-static-watchface.mjs install r298`.
   Quince partes, sin activación. Parar ante rechazo/corte sin retry/resume.
   Finally restaurar gates/fuentes, reconstruir, test cerrado. Si registra,
   una consulta independiente de catálogo; no activar por PC.
3. Usuario elige DoomStill, preview de CUATRO barras MAGENTA. Primero observa
   si la cuadrícula ocupa completa el área rectangular superior y es limpia.
   Si ya está corrupta o falta UI, NO pulsa START.
4. Si la referencia es correcta, START UNA vez, pantalla despierta durante
   CHECKING. Cuando PAUSED aparezca, observar unos5segundos: ¿Doom completo y
   quieto en320×200 o solo la franja/otros patrones? No probar controles.
5. EXIT UNA vez antes de30s; observar CLOSED y retorno de la cuadrícula.
   Volver a esfera habitual, comprobar menús/corona. No repetir/reabrir si hay
   ERROR, pantalla vacía, suspensión o fallo. No abrir pruebas C anteriores.

Comandos al reloj: mecanismo stock de instalación; Lua consulta /proc/modules,
/proc/meminfo y `ls /dev`, lee ELF/WAD, `insmod .../365219963/lua/doom.elf rw4doom282`,
PAUSE/STOP/JOIN/DETACH en el nodo propio, `rmmod rw4doom282` solo tras confirmar
postcondiciones. Captura/lease propias del carrier y marca propia de DoomStill.
No shell arbitrario, cambios de firmware o descargas de código nuevo.

## Lectura de resultados

| Referencia PNG | Doom fijo | Interpretación, no diagnóstico absoluto |
|---|---|---|
| Correcta | Corrupto | Renovación rápida no es condición necesaria; seguir formato/lectura/backend binario |
| Correcta | Correcto | Renovación/temporización/lifetime es candidato; no prueba aún cuál caché o contrato falla |
| Corrupta | No arrancar | Revisar presentación PNG/UI antes de probar el frame nativo |

## Risk gates

| Paso | Reboot revierte | Flash | Particiones/bootloader | Firmware modificado | Riesgo/retirada |
|---|---|---|---|---|---|
| Instalación | No | Paquete/catálogo | No dirigido | No | FS parcial/lleno; retirar stock solo si responde y con revisión |
| Verificar/congelar frame | No garantizado | Marca/lease/captura propias y estado stock | No dirigido | No | OOM/panic, bloqueo o corrupción; módulo sin aislamiento demostrado |
| EXIT/descarga | No garantizado | Retira auxiliares propios | No dirigido | No | Decoder/caché/uninit podrían retener referencias; no forzar rmmod/tareas |

Mantiene deliberadamente viva una lease hasta EXIT: no liberar el frame por
timeout. Peor fallo razonable: bloqueo/panic o corrupción persistente con
posible soft brick. No hay operación dirigida a boot que deba causar hard
brick, sin garantía integral. No existe recuperación integral validada.
No reiniciar/flashear/abrir/escribir particiones ni improvisar recovery ante
fallo. Ver [riesgos R291](doom-first-run-physical-plan-r291.md).

## Evidencia PC

47casos Lua S3:22base+20previos+5de snapshot. Comprueban PAUSE automático,
una sola Image sin reemplazos durante40–50ticks, RESUME/inputs bloqueados,
EXIT/autoSTOP/cleanup y retorno PNG. Native/LVGL están simulados; no reproduce
el defecto físico. No se ejecutó C nuevo ni firmware, ni se usó radio.
Paquete:20recursos exactos,15partes/30083bytes MASS+512control previstos;
pins/prepare/gate cerrado pasan. No demuestra render físico corregido.

Reproducir: `node tools/test-doom-snapshot.mjs`,
`node tools/package-doom-snapshot.mjs` (salida fija, no sobrescribir review),
`node tools/test-doom-snapshot-package.mjs`.
