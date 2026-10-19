# R386: DoomFit, reducir memoria residente del audio

## Resultado físico del ensayo

Usuario informó «todo ok» en respuesta al protocolo: Doom II arrancó y las
pruebas de controles, guardar/cargar y SALIR/CLOSED resultaron correctas.
Excepción explícita: audio entrecortado (confirmado al aclarar el síntoma).
También reportó selector stock al mantener fondo azul o imagen y mostró foto
con recorte superior por las esquinas redondeadas. No hay cifras nuevas ni
medida de latencia. Ensayo consumido: no repetir START/reabrir por este plan.
No nuevo payload físico autorizado; pulido posterior se prepara localmente.

## Resultado de instalación

2026-10-18: UNA ejecución autorizada terminó RegisteredInactive,
registeredVerifiedtrue/contentVerifiedfalse. Modelo/FW esperados; catálogo10,
ID007 ausente y carrier006 presente. INSTALL0, MD5 correcto/status0/offset0,
chunk2048.331partes/339frames/681479BTX; selectedByClientfalse. Cierre y
workerexit confirmados/exit0/nativeErrorfalse. No SET, borrados ni autostart.
Journal nuevo fit-r386.jsonl terminado; NO otro install/retry/resume.
Gates general/FITJS/C#Large restauradosfalse y worker reconstruido mediante
finally inmediatamente tras el resultado. Todos los demás permanecieronfalse.
No ejecución C durante la instalación inactiva; el ensayo posterior y sus
límites se registran arriba. Ningún arranque adicional autorizado por R386.

## Autorización

El 2026-10-18 el usuario respondió «Sí, autorizo y puedo observar» a UNA
instalación inactiva y UN ensayo≤60s, batería≥50%, volumen audible y reloj
junto al PC. Incluye el codec C revisado; no autoriza reintento/reanudación,
borrados, otro arranque ni otro payload. No exigir reinicio previo.

## Evidencia y alcance

El ensayo R385 rechazó CHECKING en GATE21/CODE201: FREE7270920 frente al
mínimo7366211 (déficit95291B); MAX7192944 supera4194320. CRC ELF correcto,
READ/TOTAL630004 y todas las métricas nativas0. No llegó a insmod/command1:
esto identifica la comparación que impidió arrancar, no demuestra incapacidad
real de asignación ni que el hardware no pueda ejecutar Doom II.

El usuario aclaró que acababa de reiniciar. Se cancela la propuesta de otro
reinicio; no se aprobó ni ejecutó. No atribuir el dato a reservas Bluetooth.
La oferta de borrar esferas no autoriza este payload ni implica necesitar
borrados: conservar las nueve personales y el carrier DoomII365220006.

## Cambio concreto

Cache de107efectos: PCM640KiB→ADPCM320KiB;310485B útiles. Conserva el
remuestreo a mitad de frecuencia de R384; añade compresión con pérdida.
IMA/DVI4bits, predictor PCM16 e índice por voz,4voces independientes; decodifica
solo hasta la posición requerida en el mixer, sin heap, archivos, llamadas
media ni buffer de expansión completa. Una búsqueda acotada al cargar cada
efecto mejora el índice inicial de transitorios. No música MIDI ni multitáctil.
No prometer calidad idéntica ni mejora de latencia: falta reproducción física.

Mantiene zona3MiB, slots192KiB,32mapas completos, resolución, controles,
guardado/carga y lector paginado. El worker de audio y sus16bloques iniciales
de silencio no cambian. El fallo de SALIR reportado en R383 sigue sin causa
física validada; conserva presupuestos independientes de stop/audio R384,
ocultación de imagen y diagnóstico, sin force-unload de un hilo bloqueado.

Secciones ELF SHF_ALLOC alineadas con el cálculo del cargador:
2227500→1901456B, ahorro326044B. Se resta solo ese ahorro al mínimo anterior,
preservando la reserva planificada, y se redondea hacia ARRIBA a4KiB:
ceil((7366211-326044)/4096)*4096=7041024B. Largest4194320 intacto.
FREE observado dejaría229896B sobre el nuevo mínimo; es un margen modelado,
no garantía de RAM actual, éxito del cargador ni todos los gastos del sistema.
No eliminar el guard ni reducirlo arbitrariamente.

## Identidades y dependencia instalada

DoomFit365220007/rw4doomii386; preview MARCO MORADO y DOS BARRAS VERTICALES.
Paquete privado build/doom-fit-r386/package/DoomFit-id-only.face:
674868B SHA25637a0161b7c9b7fbc9955d9d7a19ba0c5a43af29de7a18bab6975bfb07da1a136.
ELF631588B SHAd3aae03d409d9b32dbee80c19c042cbcca1304448f41a07482714a353cca154d.
main.lua30206B SHA9f36b15456154ec6d9a91e0f131696f84785cc3cdcdf8cef4527672c228cc946.
Dos recursos Lua/ELF, sin WAD ni assets duplicados. UI/ELF propios007;
WAD/assets/slots/lease/capture permanecen en006. CONSERVAR DoomII aunque
se abra DoomFit. Sin cambios ni reenvío del WAD lossless6531369B.

## Validación local completada

- Codec:26vectores reales/sintéticos,107efectos inspeccionados; bytes C
  contrastados con referencia JS independiente, golden nibble, límites de
  buffer/longitudes impares, reinicio/pausa/final y mezcla4voces a4rates.
  SNR medio por efecto19.43dB, mínimo11.17dB; no evaluación perceptual.
- Motor real modelado:2ciclos con título, MAP01/spawn original, movimiento,
  FIRE/USAR, menú, pausa, guardar/cargar, persistencia desde título y unload.
  Cache310485B/error0;188 y169bloques no silenciosos. No salida de audio real.
- Hilos reales:prepare/close modelados bloqueados, imagen retirada y juego
  unido antes de liberar audio; unload denegado mientras sigue bloqueado.
- Lua exacto:25casos, incluyendo FREE/MAX observados aceptados con cierre;
  min_free-1 y min_largest-1 rechazados, CRC/identidad/lifecycle/cuarentena.
- Paquete:2recursos/slices/hash,6alteraciones rechazadas,331partes C#IPC,
  dependencia006, colisión/rechazo/MD5/corte,6modos de retry denegados.
  Prepare sin radio; install cerrado antes de privados/journal. Transporte
  compartido23casos. La campaña32mapas sigue siendo R384 anterior, sin
  cambios de mapas/guardado; no se repite como campaña R386.

Artefactos privados en build/adpcm-r386 y build/doom-audio-r386; pruebas de
boot/paquete en build/doom-fit-r386. WAD temporal del emulador retirado,
ningún reloj físico usado al preparar. Instalación posterior registrada arriba;
todos los gates físicos nuevamente cerrados.

## Procedimiento autorizado

UNA instalación inactiva y UN arranque manual de hasta60s de juego, batería≥50%,
volumen audible, reloj junto al PC, Mi Fitness cerrado y observación. No exige
reinicio previo: R385 no cargó C. Sin borrados, reenvío WAD, SET/autostart,
reintento ni reanudación automáticos. La instalación pequeña puede tardar
aproximadamente1–2min, sin garantía. Si falta espacio, detenerse y revisar;
no quitar caras personales por cuenta propia.

Tras aprobación abrir SOLO PHYSICAL_DEPLOYMENT_REVIEWED/FIT_R386 y C#Large,
rebuild y readiness con target vacío antes de privados/radio. Ejecutar UNA vez
node tools/pc-doom-fit-r386.mjs install. Journal nuevo fit-r386.jsonl, sin
alterar doom2-r384.jsonl; exige carrier006 en catálogo antes de INSTALL.
Cerrar gates y rebuild inmediatamente ante cualquier resultado.

Tras RegisteredInactive y cierre/worker confirmados: seleccionar DoomFit,
READY→START UNA vez, mantener CHECKING/LOADING despierto con toques breves
fuera de botones. Esperar hasta~90s de carga además de checksum. Título→OK→
NEW GAME→dificultad→MAP01, controles/FIRE/USAR, sonido desde primer disparo,
PAUSA/GUARDAR→GUARDADO; SEGUIR/mover, PAUSA/CARGAR→CARGADO, SEGUIR/SALIR
antes de60s de juego. Esperar hasta~40s nominales para CLOSED sin insistir.
Solo un arranque; no volver a START ni reabrir con este permiso.

Si ERROR/silencio/corrupción/cierre fallido: MODE GATE/FREE/MAX,CODE/READ/TOTAL;
siGATE≥50, START/READY/FINISH y JOIN/REASON/EXIT; AUDIOERR/CALL si responde.
Volver a habitual desde Ajustes. Si imagen retenida, reiniciar normalmente
(NO Restablecer), dejar habitual y no reabrir pruebas. Asumir menús/corona
normales salvo reporte del usuario.

La regla inicial del usuario exige aprobar cada payload físico nuevo. R386
incluye C nuevo de codec/mixer y puede bloquear/corromper el sistema, impedir
CLOSED o requerir reinicio. Recuperación integral todavía sin validar.
