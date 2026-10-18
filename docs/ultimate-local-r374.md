# R374: Ultimate Doom completo, validación local

El usuario autorizó avanzar con Doom1. Se importó únicamente el DOOM.WAD de su
ZIP fijado, a `tools/local/doom-ultimate/doom.wad` ignorado; no se ejecuta ningún
programa del ZIP ni se redistribuyen sus datos. Perfil exacto en
`doom/platform-rw4/ultimate-profile-r374.json`:36mapas,4episodios,12408292B,
CRC3205409472,2306lumps. Futuro ID365220001/DoomUltimate, módulo rw4ultimate374.

El candidato conserva el menú/render/controles y cierre R370, y el arranque
de audio local R372. Sigue usando zona3MiB y slot196608B. Caché de efectos pasa
de544 a672KiB(+128KiB), con684809B de muestras precargadas verificadas. El
cargador verifica tamaño/CRC del WAD completo y el slot admite episodios1–4;
otra identidad WAD se rechaza. Las rutas/perfil son propios; no sustituyen el
shareware963 ni los guardados anteriores. MinFree propuesto7153219B conserva
196608B adicionales frente al perfil anterior; no representa RAM libre medida.

## Evidencia

- Compilaciones RW4 y S3 model sin imports pendientes.
- RW4 ELF624976B SHA256
  `410d7bd578e28112f19b6c2fd1a184a17e7f94bf454ba34cc456fb6f93230cd6`.
- S3 ELF633400B SHA256
  `46fb624fa23c6dbee2d04cc9113f37c3327515ca588fb50ca50f98f15e6b97de`.
- Dos ciclos con Doom real/hilos: título mantenido, menú, NEWGAME/E1M1/spawn,
  controles/pausa/save/load, carga desde título y join/unload. Cache684809B,
  erroraudio0. Gráficos/audio modelados, sin medir altavoz físico.
- Los36mapas E1M1..E4M9 arrancan, avanzan brevemente, guardan/cargan y cierran
  con alloc/free equilibrados, sin streams ni módulos retenidos. Adaptadores
  `-warp` por mapa son fixtures de prueba y no entran en el candidato.
- Mayor guardado74450B, debajo de196608B. Máximo pico dinámico contabilizado
 3467433B; NO es RAM total del reloj: excluye estáticos del módulo/driver/UI,
 stacks, loader y otras reservas. Todos usan zona3MiB en este modelo.
- No playthrough de campaña, transiciones finales de todos los episodios,
  sesión larga de audio ni prueba de rendimiento de estos mapas en RW4.

Resultados ignorados: `build/doom-audio-r374/s3-model/test-result.json` y
`artifacts/research/ultimate-campaign-r374/result.json`. El WAD temporal en flash
del S3 fue verificado por readback y retirado después de los tests. El WAD
shareware, las esferas y el reloj físico permanecen intactos.

## Trabajo pendiente antes de hardware

No hay paquete ni gate/instalador R374. Faltan UI/config/bancos propios,
validación de la UI exacta, rechazo de slots ajenos y cierre con audio bloqueado.
La entrega con WAD será de unos13MB. El worker grande actual tiene límite
4900000B/4128frames y sesión660000ms: no puede enviarla. No ampliar sus límites
globalmente. Se necesita un perfil separado y acotado, comprobar el presupuesto
del instalador/almacenamiento y presentar plan concreto para nueva aprobación.

Durante las pruebas el usuario pidió revisar `doom_complete.pk3` y después
esperar la comparación de una colección. Se pausó la preparación del paquete;
el ensayo local ya iniciado terminó limpiamente. No seguir instalando bajo
ninguna aprobación anterior consumida.

El PK3 local tiene3279entradas,47695663B sin comprimir y173mapas WAD; `smooshed.txt`
identifica WadSmoosh. `mapinfo.txt` refiere Doom1/2, MasterLevels, TNT, Plutonia y
SIGIL y registra WadSmooshHandler; contiene ZScript. No es un IWAD del motor
actual ni un reemplazo directo del WAD original. Solo se leyó su índice y dos
metadatos pequeños; no se extrae, ejecuta ni adapta para el reloj.
