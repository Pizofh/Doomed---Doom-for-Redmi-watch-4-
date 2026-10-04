# R72: sesión de90s a50ms

El 2026-10-04 pasó una sesión E1M1 de90164ms medidos por el guest, con Timer50ms y los mismos C/ELF R67 y Lua R71.3156tics (~35/s),1571frames producidos en la ventana y1580entregas totales registradas por Lua. Giro a30s y FIRE a70s respondieron; munición50→47, teclas neutrales después de release. EXIT retiró worker116 y recursos propios sin reboot ni unload host.

Resultado `artifacts/emulator/doom-stability-1791153850848/result.json`, passed=true; diez muestras0–90s, cuatro capturas y log filtrado. Captura t90 muestra Doom/HP100/ammo47. Solo emulador Xiaomi Watch S3; no hardware M2315W1.

## Memoria y archivos

Muestras de `free` del guest, bytes globales: incluyen sistema, Lua, UI, allocator y otras tareas. No representan RAM exclusiva del motor ni presupuesto físico RW4.

| Medida | Observación |
|---|---|
| GImageCache durante0–90s |1363384used en las diez muestras, sin cambio |
| Umem durante20–90s |30850584–31114016used; oscilación263432bytes |
| Umem entre20s y90s |30850584→30852344, diferencia+1760bytes |
| Antes del START / después de EXIT, Lua aún abierta |22806584→23473504used, diferencia+666920bytes |
| GImageCache antes/después de EXIT |1107288used en ambas muestras |
| Umem final, Storage activa y tmp retirado |18098856used |
| Umem maxused antes/después |26647652→36100380; pico histórico global, no consumo actual |

Las muestras no muestran crecimiento continuo en esta sesión, pero no demuestran ausencia de fugas durante horas. La diferencia post-EXIT tiene causa no aislada; Lua/UI y buffers de diagnóstico siguen residentes. La muestra final incluye **cambio de watchface y retirada de ELF/WAD tmp**, por lo que no permite atribuir la bajada solo a cerrar Lua.

En cada muestra había exactamente cuatro archivos propios: ELF446144bytes, WAD4196020 y dos imágenes128012bytes cada una. Sin nuevos nombres ni crecimiento de tamaño. El helper permite tamaños de imagen menores durante una posible carrera stat/truncation/write; en las diez muestras ambas tenían128012bytes. No se leyó contenido mutable para analizar frames durante la sesión.

Las trazas Lua se saturaron en256frames/256callbacks y permanecieron acotadas; se emitieron después del unload.1580entregas totales no equivalen a FPS exacto: la ventana incluye arranque y pequeños intervalos fuera de las muestras, sin muestreo continuo de display. Las tasas visibles de R71 siguen siendo el resultado pertinente de fluidez.

Recursos propios del motor:13alloc/free, streams0, cleanup0, pico tracked6582961bytes. Uninit0 exige driver/input/lectores neutrales y worker/PID retirado; después módulo/nodos/copias ausentes. Heap global y allocator propio son evidencias distintas.

## Reproducción y alcance

```powershell
# Guest responsive, UIProbe R71 instalada, sin módulos/archivos propios activos.
node tools/doom-ui-emulator.mjs stage
# Seleccionar UIProbe por Ajustes; Ready, sin START previo.
node tools/test-doom-stability-emulator.mjs
# Volver a Storage mediante selector inspeccionado.
node tools/doom-ui-emulator.mjs cleanup
```

Nuevo helper `tools/test-doom-stability-emulator.mjs`: guard de payload/guest/ADB/Lua R71, snapshots espaciados10s, archivos propios, controles breves, duración acotada y salida UI. Si falla, registra y conserva para inspección; no descarga código por la fuerza. No usar el helper corto de profiling, que exige trazas completas sin truncar. No se cambiaron sources C/Lua, paquetes ni límite cooperativo120s; sin compilaciones, instalaciones o descargas nuevas. Sintaxis Node y diff comprobados.

Baseline `doom-stability-baseline-1791153720582`: guard no encontró evidencia reciente de screen OFF y rechazó reset; la navegación confirmó panel responsive. **Cero resets** en este checkpoint. Stage `doom-ui-stage-1791153836674`; cleanup `doom-ui-cleanup-1791154112205` verificó WAD intacto y retiró ELF/WAD tmp. Final read-only `doom-stability-final-1791154142254`, passed=true: Storage365700764 activa, UIProbe365799903 modo doom/perfil R71 almacenada, worker116/módulo/nodos/copias/temporales ausentes.

No stress/SMP, crash/kill, horas de sesión, corona, ergonomía en muñeca ni recovery física demostrados. FLAT sigue sin sandbox. Doom todavía no está instalado persistentemente.

Siguiente checkpoint único: persistencia en el emulador, instalando ELF/WAD una vez en un directorio propio de `/data`, abriendo desde el launcher y reabriendo después de un reset limpio sin retransmitir assets. El diseño puede conservar el C actual: ELF desde almacenamiento, copia WAD acotada a la ruta tmp fija al abrir y retirada al salir. Verificarlo antes de afirmar compatibilidad; nada de hardware físico.
