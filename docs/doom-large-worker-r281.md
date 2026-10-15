# R281: transporte grande compilado y supervisado

La transferencia de 4,8 MB y la sesión autenticada R280 pasan por un proceso
C# real en Windows y sus pipes. Los sockets del ensayo son sintéticos; no se
consultó la caché Bluetooth, abrió radio ni contactó con el reloj o teléfono.

## Cambio

`experiments/pc-rfcomm/LargeSessionWorker.cs` añade un perfil independiente.
Conserva sin ampliar los límites anteriores de SessionWorker: 16/32 KiB,
96 frames y 55 segundos. El perfil nuevo limita:

| Recurso | Límite |
|---|---:|
| Escrituras acumuladas | 4861000 bytes |
| Frames enviados | 4128, incluyendo comandos |
| Frame individual | 4096 bytes |
| Solicitudes stdin | 16384 |
| Respuestas acumuladas | 131072 bytes |
| Apertura | 20 segundos |
| Sesión worker | 660 segundos |
| Escritura sin progreso | 15 segundos |

El bucle usa Winsock no bloqueante en el camino nativo preparado. Retoma
escrituras parciales y WSAEWOULDBLOCK conservando el offset, sin duplicar la
parte ni emitir SENT hasta completar el buffer. Una excepción, EOF o deadline
termina el intento y cierra el transporte. El cierre se intenta incluso si
falló la escritura al pipe de salida. SENT sigue siendo confirmación local,
no ACK remoto ni prueba de instalación.

`tools/doom-upload-pc-pipe.mjs` supervisa el ejecutable local cuyo hash y
fuentes coinciden con build.json. Solo lanza escenarios PC con el token fijo
PC_ONLY_R281, sin direcciones ni claves reales. Usa un máximo de 675 segundos
en el proceso padre, 25 para abrir, 20 por operación y 2 para cerrar. Un envío
atascado, SIGINT o cancelación fuerza la terminación del hijo. Confirma por
separado cierre y salida del proceso: matar un proceso no inventa CLOSED:1.
No permite solicitudes simultáneas que mezclen las respuestas de dos I/O.

El timeout del padre también cubre stdin/stdout bloqueados y un driver que no
retornase. Un timeout en el worker por sí solo no puede interrumpir ReadLine.
Esas esperas se probaron con un proceso hijo real, no únicamente con mocks.

La entrada `session-large-r281` permanece cerrada **antes** de leer destino,
consultar caché o construir NativeWinSockApi. El perfil nativo está preparado,
pero su funcionamiento con el controlador Bluetooth real no se ha probado.

## Resultado reproducible

```powershell
node tools/pc-rfcomm.mjs build
node tools/pc-rfcomm.mjs test
node tools/test-doom-large-worker.mjs
```

Los tests usan bytes propios; no necesitan WAD, firmware, emulador ni secretos.
El ejecutable C# se compila desde el repositorio con el compilador .NET del PC.
Build probado: SHA256
`a1546894c7330995819ebaa12adf6225f168ed3175938be3649fe4dc3a479344`.
Ese hash puede cambiar con las fuentes o sus finales de línea; el build vuelve
a calcular y comprobar la identidad local, sin tratar este hash como universal.

Diez escenarios pasan:

- 2353 frames de una transferencia completa, con escrituras de hasta 73 bytes
  y would-block periódico. Hash SHA256 y longitud calculados en C# coinciden
  con la secuencia enviada por Node. El reloj virtual supera el límite antiguo.
- Sesión completa de autenticación, modelo/FW, install/upload y catálogo, con
  2353 partes. Tanto frames enviados como respuestas sintéticas pasan por el
  bucle C# de Send/Receive y los pipes; RegisteredInactive, cierre y exit0.
- Retorno cero, excepción, falta de progreso y deadline total durante Send.
- Envío indefinidamente bloqueado: el supervisor lo termina; no afirma cierre
  limpio, pero sí confirma salida del proceso hijo.
- EOF de recepción y cierre fallido.
- Cancelación con un envío pendiente y rechazo de I/O simultánea.

El receiver Xiaomi sigue siendo sintético. En el escenario autenticado, Node
genera sus respuestas y las inyecta en la API Receive del fixture C#: no es una
respuesta del reloj ni del stack Bluetooth. El digest independiente C# valida
el paso íntegro de bytes enviados, sin convertirlo en evidencia de radio.

Resultado: `artifacts/doom-upload-session-r280/worker-r281-1792079473731.json`.
La suite C# pasa 5579 aserciones, incluyendo presupuestos y gates. También
pasan las suites anteriores de Xiaomi, gates físicos y los 22 escenarios R280.
CI incorpora este test después del build Windows; no se ejecutó CI remota.

## Siguiente checkpoint

Integrar el launcher RW4 y asignar la ruta persistente del WAD al build de
Doom. Reutilizar el motor, entrada, salida y transporte ya validados, evitando
otra ronda de pequeñas pruebas de las mismas funciones.

Antes de un ensayo físico siguen pendientes el journal ligado a identidad real
y bloqueo entre procesos, el presupuesto de memoria real y un plan concreto
del paquete final. El carrier actual es inerte y el ELF RW4 conserva su WAD
placeholder. R270 sigue siendo el último ensayo físico; esta sesión no cargó,
instaló, retiró ni ejecutó nada en el reloj.
