# R387: DoomTune, continuidad de audio y encuadre/táctil

## Motivo y límites de evidencia

R386 funcionó físicamente para Doom II, controles, guardar/cargar y cierre;
usuario reportó «todo ok» salvo audio, luego aclaró ENTRE CORTADO. Mantener
fondo azul/imagen abre selector stock sin SALIR. Foto muestra imagen y HUD
grandes, con recorte en las esquinas superiores redondeadas. No se midieron
latencia acústica ni underruns del dispositivo. Ensayo R386 consumido.

Código R386: PCM se genera en el hilo de juego según intervalos de reloj;
el hilo de audio vacía cuatro bloques de longitudes variables y sustituye
cola vacía por silencio. Esto puede cortar un efecto cuando el juego tarda
en generar la tanda siguiente. Es una causa de software plausible, no prueba
de que explique todos los cortes del servicio real.

## Cambios agrupados

El mixer y sus estados ADPCM ahora pertenecen SOLO al hilo de audio. El juego
publica peticiones por canal y volumen mediante atómicos lock-free; generación
de24bits distingue retriggers. La última petición de cada canal sustituye la
anterior antes de render, como reemplazo de voz; no hay cola de eventos sin
límite ni memoria dinámica. Fin de efecto devuelve feedback atómico a Doom.
Cache inmutable tras creación del hilo y hasta join; begin/reset solo sin hilo.
End deshabilita nuevas mezclas, sin liberar datos usados por el worker.

Bloques constantes512muestras/22050Hz (~23.2ms), sin depender de llamadas
I_UpdateSound ni del dibujo para avanzar PCM. El mismo worker regula envíos
con el reloj host ya usado por el motor (100us/tick) y sleeps≤5ms. Un write
rápido no permite precargar silencio ilimitado; si write tarda, descarta deuda
temporal en vez de enviar ráfagas de recuperación. Pausa/reanudación reinician
el plazo. Mantiene16bloques de silencio inicial, mismos bindings media/foco,
4voces, los107SFX en ADPCM320KiB/310485B útiles; sin música MIDI.
No garantiza eliminar cortes o bajar latencia del servicio físico.

Táctil: root propio CLICKABLE/PRESS_LOCK durante actividad; capa hits propia
390×450 captura también huecos e imagen, con botones hijos por encima. No
nuevos widgets previos al guard de RAM, sin handlers globales, ajustes stock
ni modificación de ancestros. CLOSED/ERROR/READY liberan captura y cadenas
como antes. No impide notificaciones/corona/gestos de borde por el sistema.
Referencia de búsqueda de objetos: [LVGL8.3](https://github.com/lvgl/lvgl/blob/v8.3.11/src/core/lv_indev.c),
sin equiparar las extensiones Xiaomi con esa implementación.

Encuadre: misma fuente320×200, zoom uniforme288/256 y posición nativaY39;
bounds calculados x15/y26.5/w360/h225, termina251.5 antes de UP252. Ancho
5.88% menor que382.5, controles iguales y sin tocar HUD. Solo cambia argumentos
de las mismas funciones ya usadas; antialias sigue OFF. Margen conservador
inferido de la foto, sin certificación geométrica del panel real. No cambia
render/resolución/buffers del motor ni añade trabajo por frame.

## Identidad y memoria

DoomTune365220008/rw4doomii387: MARCO MENTA y TRES BARRAS VERTICALES.
Paquete privado build/doom-tune-r387/package/DoomTune-id-only.face:
676120B SHA25620829805e03a4572b21bb73c750638083f6949bfe6998e364407b0deb473e2a6.
ELF631972B SHA6166c1f23db3d73b0b5632cec54f72fef494837015704479e329563bbcf83ad8.
Lua30376B SHA3658f5c4092ccf36d57d942f0e0ce559bcea0238f90b38008d860e20c53519bd.
Dos recursos, sin WAD/assets duplicados. UI/ELF008; WAD/assets/slots en006.
CONSERVAR DoomII006 y DoomFit007 probado. Sin borrados ni reenvío del juego.

ALLOC alineado1897708B, ahorro329792B frente R3842227500.
Frente R3861901456 ahorra3748B adicionales.
Min_free=ceil((7366211-329792)/4096)*4096=7036928; misma reserva planificada,
redondeo ARRIBA. Largest4194320 intacto. No garantía de memoria actual o éxito
de cada asignación; no guard arbitrario, reducción de zona ni capacidad slots.
Zona3MiB, slots192KiB,32mapas y partidas conservados.

## Validación local

Codec/mixer ADPCM idéntico a R386, sus26vectores/107efectos y4voces a4rates
reutilizados. Nuevo fixture C enlaza objetos exactos de producción S3 y verifica
hashes de fuentes iguales a RW4:9casos mailbox,2000retriggers, silencio antes
de ready, continuidad sin updates del juego, pause/stop/volume/clipping4voces,
completion/end.9casos worker: servicio inmediato, lento sin catch-up, errores
open/write/sleep, pausa/reanudación, stop antes de worker y cuarentena close.
Detectó un plazo obsoleto al reanudar; corregido y volvió a pasar.

Motor real/threads en S3 modelado:2ciclos título/MAP01, controles, menús,
guardar/cargar, persistencia/carga desde título, join/unload;693 y690bloques,
133 y120no silenciosos, error0/cache310485B. Held prepare/close: imagen retirada,
juego unido con audio bloqueado, unload denegado hasta liberar servicio fake.
Sin reproducción acústica ni gráficos físicos. No repetir/afirmar campaña
32mapas R387: los mapas/guardado no cambian, campaña anterior es R384.

Lua exacto:25casos de CRC/RAM/lifecycle, más hit routing muestreado cada7px
en toda390×450 durante juego/pausa, huecos sin acciones y liberación al cerrar;
control de movimiento sigue delante. Modelo de hit test, no selector físico.
Paquete:2recursos/slices/hash,6alteraciones,331partes C#IPC, dependencia006,
5fallos y6retrymodes denegados; CLI prepare sin radio/install cerrado.
Transporte compartido23casos. WAD temporal del guest retirado al terminar.

## Protocolo propuesto, requiere nueva aprobación

UNA instalación inactiva676KB y UN ensayo≤60s de juego; batería≥50%, volumen
audible, reloj junto al PC, Mi Fitness cerrado y observación~1–2min de envío.
Sin reinicio previo, borrados/SET/autostart/reenvío WAD/retry/resume. Si quota
rechaza, detener: no eliminar personales por cuenta propia ni repetir.

Tras aprobación abrir SOLO general+TUNE_R387JS y C#Large; rebuild/readiness
targetvacío antes de privados/radio. CLIpc-doom-tune-r387.mjs install UNA vez,
journal tune-r387 nuevo, exige carrier006; no alterar journals anteriores.
Cerrar gates/rebuild SIEMPRE mediante finally inmediatamente tras resultado.

Tras registro inactivo/cierre/worker confirmados: seleccionar DoomTune, READY→
START UNA vez, CHECKING/LOADING despierto con toques breves fuera de botones;
permitir~90s de carga más checksum. Título/NEWGAME/dificultad/MAP01; comprobar
encuadre, FIRE y puerta/USAR (¿siguen cortes?), controles y PAUSA/SEGUIR.
Mantener3s una zona azul libre y3s la imagen: no debería abrir selector.
PAUSA/GUARDAR→GUARDADO, SEGUIR/mover, PAUSA/CARGAR→CARGADO, SEGUIR/SALIR
antes de60s de juego; esperar≤40s nominales sin insistir hasta CLOSED.
No segundo arranque. Después comprobar que hold en fondo de CLOSED permite
selector y volver a habitual. No registrar cifras de rendimiento de rutina.

Si selector abre durante juego, elegir habitual y NO reabrir DoomTune; describir.
Ante ERROR/silencio/corrupción/cierre fallido, no repetir; MODE GATE/FREE/MAX,
CODE/READ/TOTAL; siGATE≥50 START/READY/FINISH,JOIN/REASON/EXIT; AUDIOERR/CALL.
Volver por Ajustes. Imagen retenida en menús: reinicio normal NO Restablecer,
dejar habitual. Asumir resto normal salvo reporte del usuario.

Regla original del usuario: aprobar cada payload físico nuevo. Este cambia
sincronización/propiedad del mixer, ritmo de writes y captura de touch. Puede
bloquear/corromper el sistema, impedir CLOSED o requerir reinicio. Recuperación
integral sigue sin validar. Nada enviado ni journal físico R387 al preparar.
