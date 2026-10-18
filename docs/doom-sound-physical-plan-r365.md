# R365: primer ensayo combinado de efectos de sonido

Paquete local preparado, aún sin aprobación física ni envío. DoomReady y
DoomLauncher se conservan. No se publica ni se transmite WAD, firmware o partidas.

## Candidato concreto

- Nombre: **DoomSound**, preview de tres barras amarillas.
- ID: **365219939**, módulo `rw4sound365`.
- Paquete: **669676 bytes**, 58 recursos, 328 partes de hasta 2048 bytes.
- SHA256 paquete: `26fd403d01e2ac79120d2102bd49ca7f3272a61ff05a24ee623fbc7137235ad6`.
- ELF: 623096 bytes, SHA256
  `cf52c9d8b31570bfb90ae28d6ea950c90932ce223f166be8eba6d4462dd48dc4`.
- Lua SHA256: `b9df2f28916cfc367cce3c8716cc12415a204b2cc4ee9c8b6348b62ae1485bd7`.

Utiliza el WAD ya instalado en DoomLauncher. Instalación inactiva, una sola
transferencia, sin retry/resume, borrado ni selección automática. El catálogo
actual es el baseline de esta instalación; debe conservarse con su selección.
No exige reinicio previo. Los controles y el renderizado proceden de DoomReady.
GUARDAR/CARGAR usan los bancos propios de DoomSound, sin modificar los de DoomReady.

## Cambios y comprobaciones locales

Efectos DMX mono de cuatro voces a 22050 Hz/S16. Copia privada de las 532927
muestras útiles de los 55 efectos del WAD; capacidad de caché 557056 bytes.
Los enlaces entre efectos comparten muestras. Cola SPSC de cuatro bloques de
hasta 512 muestras: el productor no espera al consumidor ni escribe PCM en flash.
Sin música MIDI, SDL, cambio de volumen global ni acceso directo a HAL/DMA.

La configuración ROMFS del AP fijado confirmó el escenario Music y la ruta
gestionada de media hacia pcm2p a 48000 Hz; el grafo hace la conversión. Su
política puede elegir otra salida disponible: no se fuerza el altavoz sobre
el arbitraje del sistema. La matriz incluye llamadas, alarmas y notificaciones.
Los cuatro archivos originales extraídos quedan únicamente en artifacts privado.

El adaptador pide foco Music, abre el player, prepara PCM, arranca y escribe
desde un worker independiente. El callback de foco solo actualiza un atomic;
el worker aplica pausa/silencio o atenuación. Al salir hace STOP, CLOSE y abandona
el foco. El juego no marca finalización hasta que el worker haya cerrado y se
haya unido. Un cierre sin confirmación conserva el módulo y sus recursos.

El motor usa zona de 3 MiB en vez de 4 MiB para compensar la caché y el worker.
Los nueve mapas pasaron arranque/save/load/salida con el consumidor simulado;
pico de memoria gestionada del runtime 3438257 bytes, más estáticos/stack/servicio.
No equivale a jugar una campaña completa ni a medir la memoria del servicio físico.
El preflight de UMEM conserva los umbrales conservadores de DoomReady.

Validación ejecutada:

- Dos ciclos con Doom real, hilos, controles, pausa, save/load, join y unload;
  532927 bytes cacheados y bloques PCM no silenciosos en ambos, error cero.
- Nueve mapas: inicio, guardar/cargar y cierre, allocations=free en cada uno.
- Adaptador C probado contra servicio falso: fallos de validación/foco/open/
  prepare/start, foco denegado, pausa/reanudación, duck, envío parcial/negativo
  y cierre ambiguo sin repetición. No llamó firmware ni dispositivos.
- Compilación RW4, ELF sin imports pendientes, nueve huellas de funciones AP.
- Empaquetado aislado sin adb, 58 recursos verificados, cinco alteraciones
  rechazadas; Lua exacto analizado por el intérprete del emulador sin ejecutarlo.
- Instalador cerrado antes de leer credenciales o abrir radio; preparación offline
  correcta. No se han repetido auditorías del historial ni operaciones remotas Git.

## Riesgo nuevo y alcance de aprobación solicitado

Este ensayo ejecutaría por primera vez en el reloj las funciones de media/foco
inspeccionadas. El emulador usa un doble del servicio: **todavía no se ha oído
sonido ni probado la ruta RW4**. Los wrappers del firmware son síncronos y no
se ha demostrado un plazo máximo para connect/accept/send/recv/control.
Separarlos en un worker no los hace cancelables. Si uno queda bloqueado, EXIT
puede no llegar a CLOSED: no se fuerza descarga ni se libera memoria pendiente.
Puede requerirse reiniciar desde Ajustes si responde; no hay recuperación
integral validada. Existen riesgos de bloqueo/panic/corrupción, además de la
escritura del paquete en flash. No prometer sonido ni cierre seguro antes del ensayo.

Se solicita **una instalación y dos arranques manuales**, batería ≥50% y usuario
observando. Mantener volumen multimedia audible. Primer ciclo de hasta 60 s:
disparo, movimiento, puerta, PAUSA de 2 s/SEGUIR, guardar/cargar y SALIR. Verificar
sonido, fluidez y CLOSED; MODE tres veces recorre rendimiento, GPU y audio.
La página audio muestra AUDIO ERR, PCM SFX y CACHE. Solo con audio correcto,
AUDIO ERR=0 y CLOSED, segundo START corto y SALIR para comprobar reutilización.
Ante silencio, error, corrupción o cierre fallido: no repetir ni reabrir;
recoger estado/códigos si responde y volver a la esfera habitual desde Ajustes.

## Comandos locales preparados

```powershell
node tools/build-doom-audio-r362.mjs s3-model
node tools/build-doom-audio-r362.mjs rw4
node tools/test-audio-media-r364.mjs
node tools/test-doom-audio-r362.mjs
node tools/test-ready-campaign-r351.mjs --audio-r365
node tools/package-doom-sound-r365.mjs
node tools/test-doom-sound-package-r365.mjs
node tools/pc-doom-sound-r365.mjs prepare
```

Builders rechazan reemplazar revisiones ya completadas. No repetirlos sin cambios.
`install` retorna PhysicalGateClosed; las dos puertas de despliegue siguen false.
Tras aprobación específica, abrir solo main+sound para este paquete, instalar
una vez, verificar registro inactivo y cerrar de nuevo ambas puertas.
