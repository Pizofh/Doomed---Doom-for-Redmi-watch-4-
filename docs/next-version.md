# 0.2: efectos de sonido confirmados en el reloj

**Resultado físico R369:** el usuario oyó disparos, respiraciones y muerte del
monstruo; reportó dos pruebas sin problema, CLOSED, PCM SFX=646 y AUDIO ERR=0,
y regreso normal a su esfera. No reportó imagen retenida sobre los menús.
El audio comenzó después de la primera puerta: falta medir o explicar ese
inicio tardío. No se ha validado todavía una sesión larga con audio.

**R369:** R367 se instaló y falló: silencio y cierre bloqueado con imagen sobre
los menús. Reloj recuperado con reinicio y esfera habitual. Se encontró en el
servidor del firmware exacto que SET_OPTIONS separa pares con `:`, mientras
enviábamos comas. DoomVoice corrige ese formato y separa retirada de imagen,
join del juego y join del audio, conservando recursos si el servicio se atasca.
Pasaron pruebas de llamadas bloqueadas, dos ciclos de Doom y cierre/reentrada
locales. [Paquete y resultado físico R369](doom-voice-physical-plan-r369.md).
Instalación cerrada; no reabrir las versiones fallidas R365/R367.

**Candidato R365 preparado:** efectos integrados en Doom, cuatro voces y cola
PCM en memoria; adaptador media/foco con servicio simulado y compilación RW4.
Dos ciclos y arranque/save/load/salida en los nueve mapas pasan con zona de
3 MiB. Paquete DoomSound ID365219939 de 669676 bytes listo, sin envío físico.
La reproducción RW4 permanece sin validar: solicita un ensayo combinado concreto
en [plan físico R365](doom-sound-physical-plan-r365.md). Esperas del servicio
siguen cooperativas; no se promete cancelación de una llamada bloqueada.

0.1.0 está aceptada y permanece intacta. El usuario pidió preparar su entrega
pública y avanzar la siguiente versión sin ensayos pequeños sucesivos ni gasto
abierto de créditos. Todo R356 es local; no hay nuevo payload físico autorizado.

## Trabajo ya ejecutado

Un comprobador de requisitos informa las carencias de otro entorno sin leer
credenciales. Se comprobó contra checkout vacío, fuentes ausentes, compilador
alterado y los 181 archivos upstream del entorno local. Hace visible la deuda
del build incremental; no pretende resolverla ni habilita instalación.

El prototipo de audio es un **modelo de referencia en Node para PC**, separado
del motor y del juego instalado. Decodifica los 55 efectos DS del WAD fijado,
con muestras de 11025/22050 Hz; el mayor tiene 18560 muestras útiles. Se probó
un mezclador mono de cuatro canales y salida PCM signed 16-bit a 22050 Hz:
límites del formato, padding DMX, conversión de frecuencia, saturación,
pausa sin consumir posición, stop, silencio y continuidad entre bloques.

El formato y el recorte de padding se contrastaron con
[CacheSFX de doomgeneric en la revisión fijada](https://github.com/ozkl/doomgeneric/blob/dcb7a8dbc7a16ce3dda29382ac9aae9d77d21284/doomgeneric/i_sdlsound.c).
El modelo conserva vistas sobre muestras de 8 bits y produce bloques de hasta
512 muestras (1024 bytes PCM); no expande todo el banco a PCM. La memoria de
Node/WAD en PC no representa el presupuesto del reloj.

Se generó un WAV privado de dos segundos de pistola en
`artifacts/research/audio-r356/pistol-local-only.wav`, sin reproducirlo ni
redistribuirlo. Es una comprobación del contenido PCM; no se ha escuchado ni
validado por hardware. El informe del inventario queda en la misma carpeta.

```powershell
node tools/test-audio-reference-r356.mjs
node tools/preview-audio-r356.mjs
```

El segundo comando necesita el WAD local exacto y rechaza sobrescribir la salida.
No abre un dispositivo de audio ni contiene conexión Bluetooth.

## Siguiente implementación, con alcance cerrado

**Avance R358:** ruta PCM localizada por inspección del firmware; núcleo C de
cuatro voces compilado para RW4 y ejecutado en S3 con muestras idénticas al modelo
de PC. No integrado al juego ni conectado al altavoz. El ownership/formato y la
liberación completa del driver siguen pendientes. Ver
[contrato y evidencia de audio](audio-contract-r358.md).

**Decisión R359:** priorizar media player gestionado sobre buffers DMA directos.
El lower BES inspeccionado tiene PAUSE/RESUME sin efecto y el cliente de media
antiguo cierra la conexión ante escrituras parciales. Ocho candidatos fijados por
huella, aún no llamables. Falta cerrar esperas del proxy y escenario/foco antes
de implementar transporte y preparar hardware. Ver
[ciclo de vida y decisión](audio-lifecycle-r359.md).

**Avance R360:** controlador de transporte C compilado para RW4 y probado con
fallos en S3, sin llamar al audio. Retiene recursos ante timeout/cierre ambiguo;
dos ciclos normales pasan. El proxy inspeccionado hace envío/recepción síncronos
sin deadline visible en esa ruta. Falta confirmar configuración de socket y foco;
no se promete cancelación ni descarga segura de un worker bloqueado. Ver
[control de transporte y evidencia](audio-transport-r360.md).

**Avance R361:** ABI de foco antigua identificada: devuelve un token entero
codificado, no un objeto que Doom deba liberar. Creación/conexión del proxy sin
timeout explícito en el caller; falta revisar el método inferior del socket y
recuperar la configuración de escenarios. Ver [foco y socket](audio-focus-r361.md).

1. Identificar por inspección del firmware fijado la ruta de salida PCM y su
   contrato real: formato, frecuencia, buffers, ownership, exclusión con llamadas
   y cierre. No asumir que las interfaces genéricas NuttX son las de esta unidad.
2. Si hay una ruta utilizable, portar el modelo al backend C de efectos, con
   memoria acotada y entrega no bloqueante. Conectar `DG_sound_module` y una
   implementación explícita de música deshabilitada; mantener silencio como
   comportamiento válido si el dispositivo no está disponible. El `i_sound.c`
   upstream incluye SDL_mixer bajo FEATURE_SOUND: activar el define solo no basta.
3. Comprobar en PC/emulador el backend, pausa/carga/salida y carga de memoria,
   antes de preparar **un ensayo físico combinado** concreto para aprobación.
   No añadir diagnóstico a DoomReady ni cambiar su paquete durante esta fase.

La documentación upstream distingue los módulos de sonido y música:
[portabilidad de doomgeneric](https://github.com/ozkl/doomgeneric/tree/dcb7a8dbc7a16ce3dda29382ac9aae9d77d21284#sound).
Música MUS/MIDI y multitáctil están fuera de esta tanda. No se promete audio
físico hasta conocer y probar la ruta de salida.

La segunda línea de 0.2 es sustituir la cadena de objetos/build logs históricos
por una receta desde fuentes y entradas explícitas, sin rutas absolutas de este
PC. El comprobador y la guía pública son el primer paso; el build limpio y la
instalación por otro propietario aún no están completados.
