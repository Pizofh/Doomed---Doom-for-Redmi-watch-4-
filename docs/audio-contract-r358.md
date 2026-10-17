# R358: ruta de audio identificada y mezclador C ejecutado en S3

## Resultado

Se encontró una ruta de audio PCM en el AP RW4 fijado: upper half NuttX,
lower drivers BES y BES RPMsg, `nxplayer` y una capa de media session/focus.
La existencia de estos componentes está respaldada por referencias de código,
no solo por nombres de funciones encontrados en cadenas.

El mezclador ya tiene implementación C separada, compilada para RW4 y ejecutada
en el emulador S3 con vectores comparados contra el modelo de PC. **No está
conectado al driver ni integrado en DoomReady**. No se ha reproducido sonido
en el reloj ni abierto un dispositivo de audio en esta fase.

## Evidencia estática y límites del contrato

AP SHA256 `2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db`.
Las ubicaciones siguientes son offsets del archivo inspeccionado, no direcciones
aprobadas para enlazar un módulo físico.

| Componente | Evidencia e interpretación |
|---|---|
| `audio_ioctl`, 0x4b2a78 | Dispatch observado para 0x1001–0x100f. GETCAPS, CONFIGURE, reserva/liberación, controles, buffers y MQ tienen ramas propias; otros comandos se delegan al lower half. |
| `audio_open`, 0x4b2df0 | Contador de aperturas protegido; abrir no equivale a adquirir ownership de reproducción. |
| `nxplayer` | Configura con 0x1004 y consulta con 0x1001. La estructura de capacidades usada por este binario mide 16 bytes. |
| Receptor del player, alrededor de 0x218708 | Recibe mensajes de 8 bytes; distingue devolución de buffer y finalización. Un buffer enviado no puede sobrescribirse o liberarse antes de su devolución. |
| Selector de dispositivo, 0x2189d4 | Abre la ruta y consulta capacidades antes de guardarla. No prueba que la salida vaya al altavoz. |
| Comando PCM stock, 0x280f5c | Selecciona `/dev/audio/pcm2p` y llama a reproducción raw con mono, 16 bits, 48000 Hz. No prueba que esa salida sea apropiada para efectos de juego. |
| Media write, 0x5b198c | Un wrapper reenvía identificador, puntero y longitud a una función de media. Su ownership, bloqueo y formato no están cerrados. |

La documentación [NuttX de audio](https://nuttx.apache.org/docs/latest/os/audio/index.html)
sirve para interpretar la arquitectura. Los
[headers actuales de OpenVela](https://github.com/open-vela/nuttx/blob/dev/include/nuttx/audio/audio.h)
incluyen campos que no corresponden directamente a los 16 bytes usados aquí.
No se copian sus layouts ni se infiere multi-session del firmware por esa fuente.

Antes de enlazar o abrir audio en RW4 faltan: mapear la salida física y el foco
de llamadas; cerrar el layout exacto de buffers/descriptores y los retornos de
alloc/enqueue; comprobar formato/frecuencias aceptados y la secuencia de
STOP/dequeue/unregister/release/close. Se prioriza una ruta con arbitraje de
media/focus si su contrato permite entrega PCM; no usar directamente HAL/DMA.
No hay contrato completo ni candidato físico listo para aprobación todavía.

## Núcleo C y validación

Fuentes: `doom/platform-rw4/audio/pcm-core.{h,c}`. Cuatro canales mono, entrada DMX
unsigned 8-bit, remuestreo entero y salida signed 16-bit con saturación. La
memoria de las muestras pertenece al llamador y debe permanecer válida hasta
stop/finalización; el núcleo tiene un único propietario y no es thread-safe.

Estado del mezclador: 104 bytes en ARM32; salida por bloque como máximo 1024
bytes, aportada por el llamador. No heap, globales mutables, hilos, llamadas a
drivers, filesystem ni LVGL. El objeto RW4 tiene 490 bytes text y cero data/bss.
Estas cifras excluyen el futuro cache, transporte, buffers y driver de audio.

Prueba ejecutada:

```powershell
node tools/test-audio-core-r358.mjs
```

Compila el núcleo RW4 sin ejecutarlo; compila y ejecuta en el S3 propio un
módulo sintético sin WAD ni audio. Verifica límites DMX y de bloques, entradas
inválidas, cuatro voces, clipping, cambio de frecuencia, pausa sin consumir
muestras, stop y silencio. A 8000/16000/22050/48000 Hz, los checksums de las
muestras C coinciden con los generados por el modelo Node:
3352193158, 640730155, 2632120483 y 1506425579.

La prueba final usa Cortex-A7 para S3 y sus instrucciones de división; no importa
libgcc ni funciones del sistema. Un intento previo con helpers de división fue
rechazado por el loader del emulador; se corrigió el build del test. El módulo
final cargó, completó los vectores y se descargó; la lista de módulos volvió
exactamente a su estado previo. La copia anterior se retiró solo después de
verificar que coincidía con el ELF propio fallido. No hubo reboot ni uso del
altavoz. S3 valida el código y el ciclo de carga, no la ruta de audio del RW4.

Informe final: `build/audio-core-r358-cortex-a7/result.json`. ELF de prueba S3:
SHA256 `3f1cc3745fab2463ba68d8d0dc92367de024eee14e42bc17a2760f54836635cd`.
Las fuentes y guías previas de DoomReady no cambian; no se recompila su paquete.

## Reproducción de la inspección

```powershell
node tools/review-rw4-audio-r358.mjs
node tools/review-rw4-audio-code-r358.mjs
```

Ambos verifican las entradas fijadas y rechazan sobrescribir su salida. Cadenas
y disassembly permanecen en `artifacts/research/audio-r358/`, ignorados por Git.
No ejecutan firmware ni abren conexiones. No se incluye firmware, WAD o PCM
derivado en el repositorio público.
