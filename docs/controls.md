# Controles táctiles propuestos

**Actual R226:** [Usuario confirma holds/EXIT/retorno stock en RW4](held-input-physical-result-r225.md).
HoldPad pasó el ciclo solicitado según respuesta global; la pulsación larga
durante controles deja de ser un bloqueo observado para este contenedor.
Solo acciones Lua, sin C/Doom. Layout final, foco durante hold, comodidad y
movimiento+disparo simultáneos siguen pendientes. No reabrir el ensayo completado.

**R224:** [S3 pasó holds con longpress stock ON y selector tras EXIT](held-input-r224.md).
Cuatro contactos de3,3s, releases y EXIT reales; script solo toca sus objetos.
RW4 pendiente de [ensayo R225](held-input-physical-plan-r225.md), gates cerrados.
HoldPad es una prueba diagnóstica, no reemplaza el layout final ni prueba comodidad.

**Criterio de entrada/navegación, 2026-10-13:** el usuario acepta una watchface
como contenedor solo si mantener los controles del juego no abre el selector
de esferas. Si no se resuelve con mecanismos stock y una salida fiable, buscar
otra entrada antes de considerar jugable el port. Es la ruta de ejecución
demostrada, no una decisión final de interfaz. App/actividad separada requiere
demostrar compatibilidad real; no asumir que está disponible en RW4.

En juego, sostener avanzar/girar/disparar debe controlar Doom. Fuera del juego
y después de EXIT, conservar navegación/cambio de esfera normales. MENU/EXIT
propios y liberar teclas ante pérdida de foco siguen siendo obligatorios; no
basta desactivar globalmente el cambio de esferas para ocultar el conflicto.

PRESS_LOCK y flags del prototipo S3 por sí solos no demostraban el comportamiento
RW4. R226 añade confirmación física de este paquete; no aisla qué flag fue
decisivo ni demuestra todos los gestos del sistema.
Ensayos visuales anteriores con el toggle de longpress del emulador en OFF no
cuentan como prueba de supresión en juego. Hace falta contacto sostenido con
la función stock habilitada y retorno normal, primero PC y después bajo plan
físico revisado. NativeFrames R220 comprueba imágenes/animación/EXIT, no este
criterio de input; su ensayo físico R222 ya completado permanece sin cambios.

**R68:** [Panel stock y STOP manteniendo FIRE](doom-focus-emulator.md) probados con Doom. Panel desde y440 pausa motor, regreso exige RESUME; STOP retira todo antes de soltar FIRE. Abrir panel con acción aún mantenida y ergonomía física no probados. No confundir la salida cooperativa desde consola del emulador con un control disponible en el reloj físico.

**Historial R67:** [Controles de Doom original probados](doom-ui-emulator.md): MOVE permite avanzar/girar, FIRE consume munición real, MENU/RESUME/EXIT funcionan. Layout actual del port S3: imagen x35/y40/320×200, pad x20/y285/210×140, FIRE x245/y285/125×85, MENU x245/y385/125×40; margen y440 libre para navegación stock. Un dedo, sin corona/multitouch/MOVE+FIRE simultáneos. La tabla inferior y ensayos del patrón son históricos; comodidad física, USAR y foco con contacto mantenido siguen pendientes. El motor conserva su inercia/fricción original: KEYUP no equivale a anular su momentum inmediatamente.

Estado: diseño con [prototipo mantenido validado en PC/emulador](native-controls-emulator.md). No implementado ni validado en el M2315W1. El usuario delega la elección y pide evitar controles incómodos; la comodidad es un criterio de aceptación, no un resultado demostrado.

## Primera propuesta

Uso con un dedo, sin requerir multitouch. Corona opcional en el futuro; no asignar avanzar a su pulsación ni consumirla hasta comprender la API y su relación con la salida stock.

Layout inicial para 390×450, ajustable tras probarlo:

| Área | Rectángulo en píxeles | Función |
|---|---|---|
| Juego | x35, y35, 320×200 | Frame del motor; despejado de controles |
| Movimiento | x20, y255, 210×170 | Zona grande para avanzar y girar |
| Disparo | x245, y255, 125×100 | Mantener para disparar; soltar para detener |
| Menú | x245, y365, 125×60 | Pausar y mostrar USAR, REANUDAR y SALIR grandes |

La imagen320×200 sigue siendo propuesta para Doom; el prototipo de controles utiliza patrón320×140 en x35,y50 y las tres zonas inferiores de esta tabla. Conservar márgenes y evitar depender de gestos que empiezan en el borde del sistema. La salida propia del menú debe funcionar aunque la corona no sea accesible.

Movimiento: indicar un centro visible dentro de la zona. Desplazar el dedo hacia arriba activa avanzar; hacia los lados, girar; una diagonal combina ambos. Una zona neutra amplia evita giro involuntario. Mantener el dedo conserva las teclas activas; soltar detiene el movimiento. Primero probar una separación sencilla entre neutral y activo, sin prometer velocidad analógica ni modificar la física de Doom.

El primer esquema permite moverse y detenerse para disparar. Es una limitación explícita: no demuestra comodidad para combate. Si la prueba resulta demasiado torpe, comparar una opción de disparo continuo activada deliberadamente con un toque, con indicador visible y apagado al pausar/salir. No introducir ese modo silenciosamente ni asumir que el reloj soporta dos dedos.

USAR comienza dentro del menú pausado: entregar una pulsación breve al reanudar. Su posición definitiva depende de comprobar que esta secuencia no entorpece abrir puertas. No relegar SALIR a un gesto difícil ni a una pulsación prolongada sin señal visible.

## Reglas de implementación

- Registrar press, movimiento, release y cancelación; RELEASED con coordenadas solamente, que es lo que entrega el puente actual, no basta.
- Traducir el estado a eventos de tecla de Doom con una cola acotada. No enviar nuevos key-down indefinidamente mientras una tecla ya está activa.
- Ante pausa, pérdida de foco, apertura del menú, cancelación o cierre: liberar todas las teclas y desactivar cualquier disparo continuo. Al volver, exigir una pulsación nueva.
- Actualizar controles en el contexto de UI validado; no leer dispositivos compartidos por detrás de la página stock.
- Respetar la navegación stock según lo que se demuestre en la build pertinente. Una interacción que escapa a la página debe pausar el juego, no seguir avanzando en segundo plano.

## Prueba antes de Doom

Después del checkpoint de frames repetidos, usar un patrón y un indicador de acciones para probar mantener avanzar, avanzar+girar, girar parado, disparar y soltar, menú y salida. Repetir entradas/salidas y pausa durante un contacto: no deben quedar teclas activas ni acciones filtradas a una pantalla stock.

El emulador valida coordenadas, eventos y lifecycle. Un dibujo a escala de pantalla puede orientar el tamaño de las zonas; ni ese dibujo ni el ratón validan ergonomía en la muñeca. La prueba física de comodidad solo llegará tras el gate de hardware y su aprobación. No hay todavía métricas de latencia, precisión o comodidad.

El checkpoint de frames repetidos se completó en un ensayo finito de300 imágenes: [resultados y límites](native-frame-loop-emulator.md). R55 probó input por separado; [R62 conecta UI al worker C](native-worker-input-emulator.md):38 snapshots,22 key edges desde el propio hilo y display concurrente. Pausa/overflow y STOP con FIRE mantenido dejan neutral; volver del panel exige RESUME/contacto nuevo. Gesto stock desde el margen inferior libre (y440); y410 cae dentro de MOVE/PRESS_LOCK y fue retenido/cancelado, como registra el intento fallido. Ergonomía, movimiento+disparo simultáneos y pérdida real de foco stock durante contacto mantenido siguen pendientes. Ese siguiente paso histórico se completó en R63 y R67 conectó el motor. El reloj físico sigue fuera del alcance.
