# R370: título, menú original y partida nueva verificable

El usuario confirmó sonido, CLOSED y dos pruebas correctas con DoomVoice R369.
Después aclaró que faltan el título y el menú original, y que percibe el inicio
en otro lugar/nivel con muertos presentes. Esta última observación física no
se considera resuelta por una comprobación exclusiva del emulador.

## Comportamiento

El port anterior forzaba `-warp 1 1 -skill 2`: omitía el título y menú y entraba
directamente al mapa. R370 elimina ambos argumentos de autoinicio. START abre
TITLEPIC original; un botón abre el menú. Las flechas navegan, OK confirma y
ATRÁS vuelve. MENU abre/cierra el menú durante una partida. Se mantiene un dedo
y el mismo tamaño/renderizado, efectos y cierre aceptados en R369.

El título se conserva hasta una acción del usuario; no entra en una demo
automática de combate al esperar. NEW GAME usa las pantallas originales de
episodio y dificultad. El primer episodio inicia E1M1. La traducción de entrada
retiene la tecla que se pulsó hasta RELEASE, aunque la confirmación cambie de
menú a juego; soltar OK no se convierte en un disparo.

Guardar/cargar continúan en PAUSA → GUARDAR/CARGAR, con las dos copias propias.
Las opciones originales SAVE/LOAD muestran esa instrucción, sin intentar
archivos DOS ni partidas ajenas. CARGAR funciona también desde el título:
no hace falta comenzar otra partida antes. GUARDAR se oculta fuera del nivel.
No hay autocarga con START o NEW GAME. QUIT original admite OK/ATRÁS para
confirmar/cancelar y se verificó su salida limpia localmente.

La nueva partida en S3 se comprobó como juego real (no demo), E1M1, jugador 1
x=1056, y=-3616, ángulo90°, 50 balas y salud100. El mapa se conserva intacto;
el WAD tiene objetos de cadáveres decorativos. Esto no demuestra por sí solo
qué imagen/posición percibió el usuario en RW4; el ensayo pide comparar ese
recorrido visible desde el menú.

La música no se añade: siguen los efectos que ya sonaron físicamente en R369.
El inicio tardío de esos efectos antes de la primera puerta sigue sin medir.

## Paquete

- DoomMenu, ID365219936, módulo rw4menu370, preview cuatro líneas verdes.
- `build/doom-audio-r370/package/DoomMenu-id-only.face`, 673488 B, 64 recursos.
- SHA256 `f95a8d3bf5882aa5d7af5dca089a0ecd8841546df876d6f8da36685a8f3bf4a8`.
- ELF624260 B, SHA256 `e7ff2e2871a4ab394886a80a6c399581eaf7c22faddbb1c87e54e3d9178b9719`.
- Lua SHA256 `cf2100ceb032feda8f3c1cf1b5c52bc881cbc4bda9450e9f3c0e42f0906c0f5d`.

Conserva DoomVoice/DoomReady/DoomLauncher y sus bancos; no migra ni modifica sus
partidas. DoomMenu usa su carpeta propia. Sin WAD nuevo, audio nativo nuevo,
cambio de buffers, escalado o llamadas de GPU nuevas.

El control pasa a versión8 y snapshots72 palabras: añade contexto del menú,
demo y posición inicial capturada. Los opcodes anteriores conservan función;
la máscara64 corresponde a MENU. El contrato rechaza versiones anteriores.

## Validación local

Dos ciclos con Doom real, hilos y servicio de audio modelado: título mantenido
más allá del plazo habitual de la demo, navegación NEW GAME/episodio/dificultad,
E1M1 y spawn original, confirmación sin disparo, movimiento, FIRE/USAR, MENU,
guardar/cargar, pausa y cierre/join/unload. Otra carga desde el título restauró
posición/ángulo/ammo/salud del checkpoint. QUIT original también cerró y descargó.

Las esperas de la prueba presentan cuadros como hace el Timer real: el primer
cuadro del nivel dispara el efecto melt; no se toma como fallo de movimiento
un input enviado durante ese efecto. El arnés usa una sola tarea Lua propietaria
por ciclo y un plazo máximo de45s por comando en el emulador aislado. Un intento
inicial dividido en dos tareas perdió el propietario; se recuperó solo el S3
con snapshot y reset guardados, sin reiniciar el reloj físico.

La UI exacta pasó con widgets/backend simulados: etiquetas OK/ATRÁS frente a
FIRE/USAR según contexto, MENU64 y eventos de liberación, PAUSA/SEGUIR y salida
de esfera. Siete casos del controlador adaptado pasan; paquete64 recursos,
cinco alteraciones rechazadas, parse de Lua exacta, journal propio con clave
sintética, preparación offline y puerta de instalación cerrada. No se repitió
la campaña de nueve mapas ni los tests de driver/audio/render sin cambios.
No se presenta el servicio o GPU modelados como nueva validación física.

## Ensayo autorizado y resultado físico

En una ampliación del mismo resultado, el usuario confirma menú/carga/cambio
de esfera y funcionamiento general; observa solo un capítulo disponible y
que el primer efecto no se oye, pero sí los siguientes. Cree que quizá hubo
lag de audio, sin medida. Esto mantiene abierto el arranque del audio aunque
la navegación funcione. No se repitió ensayo ni se envió otro payload.

La inspección del directorio del WAD local fijado4196020B enumera E1M1–E1M9,
sin otros episodios. El M_Episode original rechaza otras elecciones en modo
shareware. Explica el capítulo disponible; no demuestra por sí solo que la
posición que recuerda el usuario sea correcta o distinta. No modifica assets.

El usuario respondió: «todo se vio bien. cargó bien, si se vio el menú. cambié
esfera y toto». Confirma menú visible, carga y cambio de esfera, con resultado
general positivo y sin fallos reportados. No aportó mediciones de audio,
posición exacta, duración ni estados de cierre individuales; no se infieren
esas mediciones ni se exige otra prueba para repetir lo ya aceptado.

El usuario autorizó esta instalación y ambos ensayos condicionados. La única
instalación terminó RegisteredInactive/registeredVerified=true, installStatus0,
MD5eco correcto,330partes,resume0,338frames y680080B transmitidos. Conexión y
worker cerrados, exit0. No selección ni START automático; contentVerified=false
porque no hay lectura de contenido. Main/Menu JS y Large C# restaurados a false,
transporte cerrado recompilado. No se permite otro envío con esta aprobación.

UNA instalación inactiva y DOS arranques manuales de hasta60s, con batería≥50%,
volumen audible y usuario observando. Sin reinicio previo, borrado, reintento,
reanudación, nueva copia del WAD ni selección automática.

Primer ciclo: START una vez, mantener CHECKING despierto; confirmar título,
abrir menú con OK, NEW GAME → primer episodio → dificultad. Comprobar el inicio
del primer mapa, controles y efectos. PAUSA → GUARDAR, SEGUIR y SALIR → CLOSED.
Solo si todo funciona: reabrir, confirmar título de nuevo, PAUSA → CARGAR →
SEGUIR y SALIR. Se comprueba persistencia sin autocarga y sin volver a NEW GAME.

Ante ERROR, corrupción, suspensión o cierre fallido: no repetir START ni reabrir;
anotar mensaje y MODE C ERROR/GPU CODE/PHASE, AUDIO ERR, CALL/AUDIO END/IMAGE ON
si responde. Si reaparece imagen retenida, reiniciar desde Ajustes y dejar la
esfera habitual. No se exige otra confirmación de menús/corona si no hay problema.

Tu regla exige aprobar cada nuevo payload físico. Aquí cambian entrada y
recorrido del motor, carga desde título y asignaciones de menú: pueden bloquear
o corromper el sistema. Sigue sin haber recuperación integral validada; el
cierre del audio conserva sus límites cooperativos.

Tras aprobación abrir solo main+Menu JS y Large C#, compilar y comprobar
InvalidTarget sin radio antes de privados; ejecutar una vez:
`node tools/pc-doom-voice-r369.mjs install --menu-r370`.
Journal independiente menu-r370.jsonl. Restaurar puertas cerradas y recompilar
transporte. No activar ni ejecutar C automáticamente. La aprobación ya fue recibida.
