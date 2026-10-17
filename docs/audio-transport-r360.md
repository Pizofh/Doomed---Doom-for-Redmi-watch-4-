# R360: control local de transporte y esperas del proxy

No instala paquetes ni ejecuta audio en el reloj. DoomReady permanece intacto.

## Evidencia del firmware fijado

La herramienta `review-rw4-audio-lifecycle-r359.mjs --proxy-r360` añade tres
ventanas fijas de desensamblado privado, verificando las mismas huellas de AP y
objdump de R359. Los offsets siguientes son de archivo, no direcciones llamables.

`media_proxy_once` (0x4df76c) pasa por 0x4e15d8: toma el lock del objeto +20,
envía el parcel por 0x4e10c8, recibe la respuesta por 0x4e1108 y libera el lock.
Ambas llamadas reciben flags cero. El envío llama repetidamente a 0x48e6d0
hasta completar el tamaño; un retorno cero vuelve al bucle sin avanzar. La
recepción llama a 0x48e59c y acumula los bytes de cabecera/cuerpo; cero acaba
con error -32. No se ve reloj, deadline ni poll acotado en estas rutas.

Esto no demuestra que el socket carezca de configuración de timeout en otro
punto. Sí impide tratar las funciones públicas start/stop/close como operaciones
de tiempo acotado basándose solo en sus wrappers. Un worker separado no permite
descargar su módulo mientras siga bloqueado. No se ha probado cancelación.

## Implementación propia

`doom/platform-rw4/audio/transport-guard.{h,c}` es un controlador sin llamadas al
firmware, heap, hilos ni dispositivo. Un único propietario procesa peticiones
y completions serializadas. Comprueba orden open/prepare/start/write/stop/close,
PCM S16 de hasta 1024 bytes, pausa de nuevas entregas y un solo trabajo pendiente.

Cada operación obtiene un token sin reutilización. Un plazo vencido deja un
fallo persistente y retiene la operación pendiente. Una respuesta tardía permite
cerrar recursos, pero no volver a activar audio. Una escritura parcial o negativa
no se reintenta. CLOSE solo se solicita una vez por handle; un cierre ambiguo
no habilita otro cierre ni descarga. Un OPEN fallido tampoco libera por suposición.
El adaptador debe aportar confirmación explícita de que ya no quedan referencias
al handle, callbacks o PCM antes de señalar liberación.

El propietario debe consultar los plazos regularmente con reloj monotónico de
32 bits (sin dejar pasar una vuelta completa). No debe reinicializar el guard
para borrar fallos. La pausa solo detiene nuevas entregas: no afirma silenciar
audio que ya esté encolado. `unloadable` cubre las referencias representadas por
el contrato; el futuro adaptador también debe asegurar que su worker haya salido.

## Validación y límite

`node tools/test-audio-transport-r360.mjs` compiló el controlador para RW4 y
ejecutó las aserciones C en el emulador S3: dos ciclos normales, pausa, límites,
token equivocado/duplicado, fallo en cada etapa inicial, cuatro resultados de
escritura incompleta, reloj que cruza UINT32_MAX, timeout con respuesta tardía,
cierre sin confirmación, OPEN fallido con liberación y agotamiento de tokens.
El módulo se retiró y el inventario de módulos quedó igual al inicial.

Resultado privado: `build/audio-transport-r360/result.json`.
SHA256 del módulo de pruebas:
`e5cd4fa9256e3721a972ca443328fb1d7a62b97c433db98ad550d808bc8b7158`.
No hubo llamadas media, driver, altavoz, Bluetooth ni reloj físico.

Siguiente dependencia concreta: revisar creación/configuración del socket y
foco genérico; elegir un adaptador cuyo arranque y cierre puedan terminar de
forma demostrable. El controlador probado no convierte una llamada síncrona
bloqueada en cancelable. No hay todavía payload físico de sonido listo.
