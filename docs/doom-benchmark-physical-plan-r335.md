# R335: medir el cuello de botella de Doom

Pendiente de autorización física. R334/DoomPalette mostró colores, controles,
CLOSED y navegación correctos, con una mejora pequeña pero rendimiento todavía
insuficiente. Este ensayo mide; no promete una aceleración nueva.

## Cambio concreto

DoomBench conserva engine/libc, PNG indexado 320x200/65048 bytes, zona 4 MiB,
bindings, Timer 100 ms y comandos 1..9. Agrega contadores atómicos, protocolo
128-v3 y una calibración: tres esperas de 200000 us en el worker; conserva el
menor intervalo de reloj. No cambia todavía la conversión ticks/10 del motor.
La escala de 10000 Hz procedía de análisis estático, no de una medición RW4.

Tras READY del motor, Lua toma dos fases consecutivas de aproximadamente cinco
segundos, cada una de 25 intervalos calibrados: motor sin construir Images y
motor presentando imágenes. Los controles de juego/PAUSE quedan inactivos;
EXIT conserva STOP manual. Al terminar ambas fases se pide STOP fuera del
observer de estado, después de native.tick, para no corromper la secuencia.
Se conservan detach/liberación/JOIN/cleanup/rmmod comprobados y sus guards.
No se adoptan módulos residentes ni se fuerzan descriptores/referencias.

Cuatro páginas de resultados cached tras CLOSED, MODE sin IO:

| Página | Filas | Interpretación |
|---|---|---|
| 1 | CAL TICK, ENG MS, DRAW MS | ticks por espera de 200 ms; duración medida de fases |
| 2 | ENG TICS, DRAW TIC, IMAGES | avance de gametic en cada fase y construcciones Image exitosas |
| 3 | PREP MS, READ MS, FRAME MS | tiempo de prepare, callbacks read y conversión/copia en fase visible |
| 4 | TICK MS, SLEEP MS, GAP MS | wall time de doomgeneric_Tick, sus sleeps y mayor separación entre snapshots visibles |

CAL TICK cercano a 2000 respaldaría la escala actual; cerca de 200 o 20000
señalaría otra escala. Son aproximaciones: el scheduler puede retrasar sleeps.
Los tiempos se solapan e incluyen preempción; no son porcentajes CPU exclusivos.
READ mide callbacks propios, no toda la decodificación. IMAGES no prueba FPS
físicos. La fase sin Images deja dos frames READY y luego descarta producción;
por tanto la diferencia incluye la conversión que se evita al no consumir.
Snapshots atómicos por palabra, no una transacción global; resolución limitada
por Timer/decodificación. Si el motor termina antes, resultados incompletos
99999999 (se conserva la calibración disponible). ERROR conserva FIRST/LAST/DIMS.

Sin buffers de frame/heap nuevos, bindings nuevos o escrituras de frames a
flash. Diferencia conservadora de secciones residentes respecto a R331:3596 B,
dentro de los 4096 B ya reservados por R333. Mismos guard min_free6471381 y
min_largest4194320. Las marcas propias de lease/shell siguen siendo las previas.

## Evidencia local

- Build reproduce exactamente ELF R333 antes de enlazar el candidato ARMv8-M
  Thumb soft ABI; sin imports pendientes. Mismo bindings.o.
- 150 checks C con VFS/stdio/decoder S3 reales: calibración válida/fallida,
  publicación sin parcial, reserva, readers simultáneos, PNG golden idéntico,
  tiempos/bytes, guard de retirada y tiempo congelado al finalizar. Clock,
  worker y scheduler simulados: no valida el reloj físico ni sus hilos.
- 68 casos Lua (61 anteriores +7): límites y wrap del contador, protocolo,
  separación de fases, autoSTOP después del observer, UI compuesta, páginas
  sin IO y reinicio de estado. IO/widgets/nativo simulados.
- 7 escenarios de upload simulado: pins/tampering, cierre, carrier ausente,
  journals anteriores intactos y bloqueo antes de datos privados. Regresión
  del paquete R333 pasa. No radio ni ejecución RW4 nuevos en esta preparación.

## Payload fijo y un ensayo

| Pin | Valor |
|---|---|
| Nombre / ID / preview | DoomBench / 365219946 / cinco barras amarillas |
| Archivo | build/doom-bench-r335/package/DoomBench-id-only.face |
| Bytes / recursos / partes / wire | 649256 /46 /318 /655324 |
| SHA256 paquete | 4ab579c492a51f5743d5c5f71b362f2d96f56ca43fdc24b306562a59a904ac38 |
| Lua23746B SHA256 | 389ee211b38f65ac4fed0f003d7e371c2f3558221b758097b61dfb8f847f92bc |
| ELF607400B SHA256 | fd41ae2439a0b24d211fa5c837603c1fb399aa7ee013d8afdacbfbada172ab0b |
| Transporte SHA256 | ce5802e67e31b36a8e7b8710d0380c0a242417623ccf1f7cc089d7f0cc64042e |
| Adapter SHA256 | e504534fea3cd836a5b99e54a67ae2e15949d0ee0e5f4ee5a6eb725d1f840fc2 |
| Módulo / base | rw4png335 / /data/app/watchface/market/365219946/lua/ |
| Journal privado | tools/local/pc-rfcomm/doom-deployment/bench-r335.jsonl |

Conservar carrier DoomLauncher963 y DoomPalette947. WAD compartido963 no se
reenvía. Sin inventario adicional ni cantidad fija de esferas.

1. Usuario observando, batería >=50%. Un envío inactivo, pausas100ms/parte;
   conservar selección y esferas. No reinicio previo tras CLOSED confirmado.
   Ante rechazo/corte/cupo: detener, sin retry/resume o borrado automático.
2. Seleccionar DoomBench, solo READY: START una vez. CHECKING despierto con
   toques breves en zona vacía. Primera fase sin imagen esperada; después Doom
   aparece unos5s, sin controles, y sale automáticamente. EXIT solo si se
   necesita abortar; no repetir START para obtener datos faltantes.
3. Tras CLOSED, fotografiar página inicial y las tres siguientes con MODE.
   Volver a esfera habitual. Se asume navegación normal salvo aviso del usuario.
4. Ante ERROR/UI ausente/suspensión: no repetir ni reabrir. Fotografiar estado
   y páginas cached disponibles; volver desde Ajustes si responde.

Los nuevos contadores, lecturas de clock y calibración en C pueden alterar
timing, bloquear, provocar panic o corrupción. No hay recovery integral validado.
STOP y límites UI~30s/worker120s son cooperativos, sin watchdog duro.

CLI pc-doom-bench-r335.mjs prepare pasa offline. DEPLOYMENT/BENCH_R335 y C#
Large cerrados. Runner preparado artifacts/doom-bench-physical-r336/install-once.ps1:
solo tras aprobación abre esos tres, ejecuta un install y restaura bytes exactos
en finally, recompila helper cerrado y comprueba gates. Todos los otros gates,
static/resume/retry permanecen cerrados; no publicación ni logs privados.
