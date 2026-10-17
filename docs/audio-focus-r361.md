# R361: foco antiguo identificado; socket sin plazo demostrado

Revisión local del AP fijado, sin ejecutar firmware ni tocar el reloj.
`review-rw4-audio-lifecycle-r359.mjs --focus-r361` genera tres ventanas privadas;
`review-audio-focus-r361.mjs` fija cuatro candidatos y comprueba instrucciones
clave. Su opción `--check` contrasta el contrato registrado sin sobrescribirlo.
Todos siguen `callable:false`: no se generan enlaces ni payload.

## Diferencia de ABI que afecta al adaptador

El candidato `media_focus_request` en offset 0x4e19bc guarda r0 como dirección de
initial, r1 como escenario, r2 como callback y r3 como cookie. Busca el escenario
en una tabla con entradas de 32 bytes. Si falta la tabla, intenta leer
`/etc/media//media_focus.conf`. Esa ruta está confirmada por el literal del AP;
no se ha recuperado su contenido ni seleccionado un escenario para Doom.

La salida normal en 0x4e1ac2..0x4e1adc **codifica un identificador entero**:
si initial es 1 suma 8 al id, desplaza 16 bits y hace OR con 15. No es una
dirección de memoria que deba liberar Doom. Hay salidas de fallo con cero.
`media_focus_abandon` en 0x4e1f94 valida el token con comparación signed >14,
recupera el id mediante desplazamiento aritmético de 16 bits y modifica la
tabla bajo el mismo lock global. Falta revisar las funciones de tabla y las
notificaciones para demostrar cuándo ya no puede invocarse el callback.

Por tanto, no se importará sin adaptación el contrato de una versión actual de
Vela ni se convertirá el token a un objeto propio. Son inferencias de estas
instrucciones del firmware concreto; todavía no son una ABI probada físicamente.

## Creación y conexión del proxy

0x4e14e8 crea un objeto de 44 bytes. Elige dominio 1 para `ap` o 65 para otros
destinos; llama a socket con tipo 1 y protocolo 0, después conecta por 0x48e45c
y solo entonces inicializa el lock +20. En esta función no hay setsockopt ni
activación explícita de modo no bloqueante. El camino de eventos 0x4e13e8 crea
otro socket, bind/listen y luego el worker acepta conexiones.

El constructor de socket 0x498780 contempla los bits de tipo 0x800 y 0x80000;
el caller observado pasa únicamente 1. El wrapper connect delega al método
indirecto +28 de las operaciones del socket. Esto deja el límite de espera
dependiendo de la implementación inferior, aún no verificada; no prueba que
todos los sockets del sistema carezcan de timeout.

## Resultado y siguiente cambio

Contrato con huellas de 64 bytes guardado en
`doom/platform-rw4/audio/focus-contract-r361.json`. Se verificaron instrucciones,
ruta de configuración y huella completa del AP; no corresponde repetir pruebas
del mezclador ni del juego. DoomReady y su guardado siguen sin cambios.

El siguiente paso útil es revisar los métodos de socket local/remoto y localizar
la configuración de media del firmware. Hasta entonces no añadir un worker
físico que prometa detenerse con un timeout del controlador: ese timeout solo
detecta el atasco. La integración de efectos sigue pendiente; no hay sonido aún.
