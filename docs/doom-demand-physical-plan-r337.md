# R337: dibujar solo cuando hay espacio

Preparado localmente, pendiente de autorización física. No instalación ni
ejecución RW4 nuevas durante esta preparación.

## Evidencia R336/DoomBench

El ensayo autorizado terminó CLOSED y el usuario volvió normalmente. Las
cuatro pantallas proporcionan estos resultados, sin reabrir la prueba:

| Medida | Resultado |
|---|---:|
| Calibración, ticks/200ms | 2019 |
| Fase sin Images / con Images, ms calibrados | 5080 /5461 |
| Avance gametic sin Images / con Images | 185 /187 |
| Construcciones Image en fase visible | 22 |
| Prepare /read /frame copy, ms | 507 /445 /239 |
| Tick /sleep /mayor intervalo UI, ms | 5468 /11 /1285 |

La escala de 10000 Hz queda respaldada aproximadamente; no se cambia ticks/10.
El motor avanza cerca de 35 tics/s, pero se construyen unas4 Images/s. No son
FPS físicos medidos. Tick incluye sleeps/preempción y puede solaparse con los
otros tiempos. Los snapshots son atómicos por palabra, no transaccionales.

El código anterior llama D_Display en cada doomgeneric_Tick incluso cuando
los dos slots están ocupados: solo descarta el frame al llegar al transporte,
después de renderizar y convertir la imagen upstream. Es trabajo evitable.

## Cambio

Nueva función interna rw4_game_frame_wanted consulta ready/accepting/stop/paused
y los dos estados de slot mediante atomics; no reserva ni cambia estados,
refs, secuencias, memoria o APIs del firmware. Existe un único productor;
el consumidor no puede quitarle un slot FREE observado por ese productor.

Antes de doomgeneric_Tick el adapter asigna nodrawers según esa disponibilidad.
Es la salida temprana original de D_Display (d_main.c). TryRunTics, entrada y
S_UpdateSounds siguen ejecutándose. Tras Tick se restablece nodrawers y se
actualiza snapshot también cuando no hubo dibujo, para reflejar los tics reales.
Inicialización, pausa/flush y parada conservan sus rutas anteriores.

No se modifica upstream ni se recompila el motor; adapter/transporte sí.
Conserva resolución320x200, colores y PNG R333 idénticos, dos buffers, 4MiB,
calibración/contadores R335, comandos1..9 y protocolo128-v3. Sin heap/frame
buffers/bindings nuevos o frames a flash. Diferencia conservadora de secciones
residentes frente a R331:3724B, dentro del margen4096. Guards RAM6471381/4194320.

UI jugable habitual: controles, PAUSE/RESUME, EXIT y límite300ticks cooperativo.
Tras CLOSED muestra TIME MS/TICS/IMAGES cached, para contar actualizaciones sin
otro benchmark. TIME mide ready hasta fin del worker (incluye cierre); TICS
mide avance entre primeras/últimas lecturas ready, con resolución del Timer.
MODE alterna esta página y FIRST/LAST/DIMS sin IO. La siguiente partida reinicia
sus contadores. Timer100ms conserva techo nominal10 callbacks/s; no se promete
una tasa física ni se descarta que la decodificación siga siendo costosa.

## Validación

- Build RW4 reproduce exactamente ELF R333 antes de enlazar el nuevo candidato;
  Thumb ARMv8-M soft ABI, sin imports pendientes, bindings.o sin cambios.
- 164 checks con VFS/stdio/decoder S3 reales y worker/clock simulados: demanda
  antes de READY, pausa, espacio libre, ambos slots ocupados, consumidor que
  libera espacio, STOP, readers/reserva, PNG golden y retirada normal.
- Dos ciclos con E1M1 y pthreads reales en S3: con dos slots llenos se congela
  el número de dibujos pero avanzan los tics; consumir permite otro dibujo.
  Movimiento, giro, disparo, pausa/resume y STOP/JOIN/unload pasan. Pico4486833B,
  14 asignaciones/14 liberaciones por ciclo. El fixture cambia solo la cola
  del snapshot a métricas del juego para verificar posición/ángulo/ammo; no
  es el ELF RW4 y no valida rendimiento/decoder físico.
- 71 casos Lua (68 previos +3): controles, rechazo v2 antes de START, UI
  compuesta, CLOSED con estadísticas, MODE sin IO y siguiente ciclo reiniciado.
- 7 escenarios upload simulado, paquete/pins/tampering, carrier ausente,
  journals previos preservados, gates cerrados antes de datos privados.
  Preparación offline316partes/651178wire; sin radio.

## Paquete fijo y ensayo

| Pin | Valor |
|---|---|
| Nombre /ID /preview | DoomDemand /365219945 /tres barras blancas |
| Archivo | build/doom-demand-r337/package/DoomDemand-id-only.face |
| Bytes /recursos /partes | 645148 /37 /316 |
| SHA256 paquete | 149d7a2ac8bdeaebfb4a36f090f747c5d7b26c77807d17dd32e5674a9cde7071 |
| Lua22016B SHA256 | e0b0ca05796ce8d7bc58d756e6b7c7e881db5becaf098a311ff8e215734fddc7 |
| ELF607636B SHA256 | 0ea7b00529435a0d4a249f5aa12c52bd9c584bc95bba2aba0b4ef870c88232b6 |
| Transporte SHA256 | df75f2addf3d168c41539ac3964d7f837d16731dca3618d75de16184cfaf2268 |
| Adapter SHA256 | 129ec936c8e7b11393dc672061e0aee73038c28a2a75530daae64146073b3866 |
| Módulo /base | rw4png337 / /data/app/watchface/market/365219945/lua/ |
| Journal privado | tools/local/pc-rfcomm/doom-deployment/demand-r337.jsonl |

1. Usuario observando con batería>=50%. Una instalación inactiva, conservando
   selección/esferas. Sin reboot previo tras CLOSED, retry/resume, borrado o
   activación automáticos. WAD compartido963 no se reenvía. Conservar
   DoomLauncher963 y DoomPalette947 como respaldo.
2. Seleccionar DoomDemand. Solo READY: START una vez, CHECKING despierto con
   toques breves en zona vacía. Probar brevemente UP/LEFT/RIGHT/FIRE y
   PAUSE/RESUME; EXIT antes de20s. Comparar fluidez con DoomPalette.
3. Solo tras CLOSED, fotografiar TIME MS/TICS/IMAGES y volver a esfera habitual.
   Un ciclo únicamente. No solicitud redundante de salud: se asume normal salvo
   aviso. Si ERROR/UI ausente/suspensión/basura, no repetir ni reabrir; guardar
   estado y páginas cached disponibles, volver desde Ajustes si responde.

El nuevo patrón de dibujo/sleeps y la carga repetida de C pueden bloquear,
provocar panic o corrupción. No existe recuperación integral validada. Límites
UI~30s y worker120s son cooperativos, sin garantía ante un cuelgue.

DEPLOYMENT/DEMAND_R337 y C#Large cerrados. Runner preparado, NO ejecutado:
artifacts/doom-demand-physical-r338/install-once.ps1. Tras aprobación abriría
solo esos tres, haría un install y restauraría bytes exactos en finally,
rebuild/test del helper cerrado y comprobación cerrada del paquete. Los otros
gates/static/resume/retry siguen cerrados. Sin push ni publicación de datos.
