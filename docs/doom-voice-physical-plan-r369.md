# R369: formato de audio correcto y cierre gráfico independiente

## Incidente físico R367

DoomAudio permaneció sin sonido con AUDIO ERR=0, PCM SFX=0, CACHE=532927.
Al cambiar de esfera y también al intentar SALIR después de reiniciar, dejó
parte de la imagen sobre los menús y no completó CLOSED. El usuario confirmó
que otro reinicio, dejando su esfera habitual sin abrir Doom, recuperó el reloj.
No repetir DoomAudio ni DoomSound. Un error cero no prueba que el servicio haya
respondido: el código solo se almacenaba cuando regresaba la llamada.

El worker del juego esperaba indefinidamente al audio antes de marcar FINISHED.
El cierre de la imagen exigía ese FINISHED/join, y los errores gráficos previos
también impedían retirar la imagen. Estos acoplamientos son errores del port;
cambiar de esfera debe ser una salida admitida.

## Causa de formato localizada en el firmware exacto

Se extrajo exclusivamente `vela_audio.bin` del paquete local de firmware ya
fijado, comprobando límites ZIP, tamaño, CRC y SHA256. Imagen de audio 1778532 B,
SHA256 `6e0dd7d67bfdf9c6ed6dc31b7b8a777c84d88d0d5ee992316c062b6ba3e2228c`.
Nunca se ejecutó ni se incluye en Git o en el paquete.

La tabla del worker dirige SET_OPTIONS (3) a offset 0xf2bf6. Allí se pasan
`=` como separador clave/valor y `:` como separador entre pares al parser
(llamada 0xf2c02). Los literales están en 0xf2e64 y 0xf2e60. La preparación
consulta `format`, busca ese nombre en los demuxers y falla antes de abrir
la entrada si no lo reconoce (0xf07ee..0xf0804, salto a 0xf2ad6).

La tabla inspeccionada contiene mp3, ogg, s16le, silk y wav. Se resolvió también
el descriptor silk ubicado en un segmento RAM inicializado; no se confundió
ese puntero con el alias de solo lectura. Esta es inspección, no una nueva
base de ejecución para el port.

Antes enviábamos `format=s16le,sample_rate=22050,channels=1`. Con ese parser,
el valor entero queda dentro de `format`, sin seleccionar ningún demuxer.
R369 envía `format=s16le:sample_rate=22050:channels=1`.

Esto explica una vía concreta para que prepare no llegue a conectar al listener
y el cliente quede esperando accept. El ensayo R367 no tenía telemetría de
llamada en curso: aún no demuestra que esa fuese su única espera bloqueada.
El ejemplo de la [API actual](https://raw.githubusercontent.com/open-vela/frameworks_multimedia_media/dev/include/media_player.h)
usa comas; no sustituye el contrato del firmware 2.2.86 inspeccionado.

## Cierre y retención

SALIR, pageOnPause, recuperación y errores en contexto UI solicitan STOP y
retiran la imagen/listener propios, después de comprobar contexto y completar
los fences gráficos. Esta retirada no borra descriptores ni buffers, y admite
que el productor todavía esté terminando una copia a su slot privado.

El juego ya no espera al audio antes de terminar. Después de su join real se
retiran los descriptores. El módulo solo se puede descargar tras confirmar
quiescencia y join del audio también. No se libera código, callback ni PCM que
puedan seguir en uso. Un fallo gráfico continúa siendo persistente; limpiarlo
visualmente no borra el error ni autoriza descarga.

El controlador espera hasta 50 ticks de UI (~2 s nominales) al cierre del audio
y después muestra ERROR, conservando módulo y memoria. Ese límite solo limita
la espera del controlador; no cancela la llamada nativa. GC solo solicita STOP
atómico: no llama LVGL, no hace join y no descarga. La retirada requiere un
callback UI o reentrada. Contexto inválido/fence fallido todavía pueden impedir
la retirada: no se presenta como garantía física absoluta.

MODE añade CALL / AUDIO END / IMAGE ON. CALL identifica la llamada síncrona
actual: 0 ninguna, 1 validación, 2 foco, 3 open, 4 prepare, 5 start, 6 pausa,
7 write, 8 stop, 9 close, 10 abandonar foco. AUDIO END=1 indica quiet, no prueba
por sí solo el join. IMAGE ON=0 indica que no queda el objeto de imagen propio.

## Paquete y comprobaciones

- DoomVoice, ID365219937, módulo rw4voice369, preview cinco barras amarillas.
- `build/doom-audio-r369/package/DoomVoice-id-only.face`: 672372 B, 61 recursos.
- Paquete SHA256 `dca5c7cdb2c21da337275e85841b54286b56d10e267fe35d403d7a28d1ecc348`.
- ELF624456 B, SHA256 `4b1c28d3ad1886ab2c16e359539f0ac4936476df8f3d1df19fecf39657fda690`.
- Lua SHA256 `d12ba5b1124c8f2e3fed2f7ad79bed76437de0ecdccf4160812c6d959660d52b`.

Compilado RW4 sin imports pendientes. Dos ciclos con Doom real en S3 mantienen
guardar/cargar, pausa, inicio original, PCM no silencioso y cierre/join/unload.
Con prepare y close retenidos por el servicio falso: imagen retirada antes
del join del juego, juego termina, descarga rechazada mientras el audio sigue
bloqueado y limpieza completa solo tras liberar explícitamente el servicio falso.

Se ejecutaron los casos originales del render y los nuevos de retirada con
productor activo, draw ausente, eliminación externa, error de fence, propietario
equivocado y listener retenido. Son gráficos modelados, no GPU física. Siete
casos Lua cubren salida, espera normal breve, cuarentena, GC/reentrada y errores.
También pasaron fallos del adaptador, contrato estático del servidor, 61 recursos,
cinco alteraciones rechazadas y parse de Lua exacta. Gate de instalación cerrado,
prepare offline y journal independiente probados con identidad/clave sintéticas.

## Ensayo autorizado

UNA instalación inactiva y DOS arranques manuales de hasta 30 s con batería ≥50%,
usuario observando y volumen audible. Conserva DoomReady/DoomLauncher y bancos
previos; los bancos de DoomVoice son propios. Sin WAD nuevo, reinicio previo,
reintento, resume, borrado ni activación automática.

Primero START una vez, probar disparos/puerta, PAUSA 2 s/SEGUIR, SALIR antes de
30 s. Recoger AUDIO ERR/PCM SFX/CACHE y CALL/AUDIO END/IMAGE ON tras CLOSED.
Solo si hay sonido, cierre correcto y AUDIO ERR=0: segundo START breve y salir
cambiando a la esfera habitual; al volver, comprobar CLOSED sin otra partida.
Si el selector no abre, usar Ajustes; no insistir en la pulsación larga.

Ante silencio, ERROR, corrupción, suspensión o cierre fallido: no repetir ni
reabrir, recoger las dos páginas de audio si responde. Si vuelve a quedar una
imagen sobre los menús, reiniciar desde Ajustes y dejar la esfera habitual.

La corrección intenta llegar por primera vez al flujo PCM real con opciones
compatibles. Media/foco y nueva retirada gráfica pueden bloquear, causar panic
o corrupción; una llamada puede requerir reinicio aunque se retire la imagen.
Seguimos sin recuperación integral validada. No se afirma sonido físico logrado.

Tras autorización: abrir únicamente perfil C# Large y gates JS main+Voice,
recompilar y comprobar InvalidTarget sin radio antes de credenciales/journal;
`node tools/pc-doom-voice-r369.mjs install` UNA vez. Restaurar gates cerrados y
recompilar el transporte. No activar automáticamente. Journal voice-r369.jsonl.

## Instalación ejecutada

El usuario autorizó una instalación y los dos ensayos condicionados, pudiendo
observar con batería ≥50%. Se completó UN envío: RegisteredInactive,
registeredVerified=true, installStatus=0, MD5 eco coincidente, resume=0,
329 partes, closeConfirmed=true, workerExitConfirmed=true, exit=0.
No selección automática ni ejecución de C. contentVerified=false: no se leyó
de vuelta el contenido; el START manual verifica ELF/WAD. Gates main/Voice y
Large C# restaurados a false y transporte cerrado recompilado. Pendiente el
resultado físico manual; no repetir envío ni pedir la misma aprobación.

## Resultado físico recibido

El usuario oyó disparos, respiraciones y la muerte del monstruo después de abrir
la primera puerta. Reportó CLOSED, PCM SFX=646, AUDIO ERR=0, dos pruebas sin
problema y regreso normal a su esfera. No reportó otra imagen retenida.
Esto confirma efectos audibles y cierres correctos en los ensayos descritos;
no constituye todavía una sesión larga o campaña completa con audio.

Antes de la primera puerta no oyó sonido. No hay medición de tiempo ni orden
de efectos suficiente para atribuirlo a buffering, inicio del servicio o eventos
del juego. Se conserva como observación pendiente, sin solicitar otro ensayo
ni afirmar que ese comportamiento sea normal. No hay nuevo envío autorizado.
