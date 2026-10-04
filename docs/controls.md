# Controles táctiles propuestos

Estado: diseño para un prototipo en PC/emulador. No implementado ni validado en el M2315W1. El usuario delega la elección y pide evitar controles incómodos; la comodidad es un criterio de aceptación, no un resultado demostrado.

## Primera propuesta

Uso con un dedo, sin requerir multitouch. Corona opcional en el futuro; no asignar avanzar a su pulsación ni consumirla hasta comprender la API y su relación con la salida stock.

Layout inicial para 390×450, ajustable tras probarlo:

| Área | Rectángulo en píxeles | Función |
|---|---|---|
| Juego | x35, y35, 320×200 | Frame del motor; despejado de controles |
| Movimiento | x20, y255, 210×170 | Zona grande para avanzar y girar |
| Disparo | x245, y255, 125×100 | Mantener para disparar; soltar para detener |
| Menú | x245, y365, 125×60 | Pausar y mostrar USAR, REANUDAR y SALIR grandes |

Estas coordenadas son una propuesta, no el layout de UIProbe actual. Conservar márgenes y evitar depender de gestos que empiezan en el borde del sistema. La salida propia del menú debe funcionar aunque la corona no sea accesible.

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

Checkpoint inmediato sin cambios: frames repetidos con recursos acotados, pausa y salida. No compilar Doom ni tocar el reloj para probar este diseño.
