# Jugar a Doom

DoomMenu es la versión actual probada: menú original, carga y cambio de esfera
funcionaron según el usuario. Incluye efectos de sonido, aunque el primer
efecto no se oye y su corrección solo está probada localmente. El contenido
instalado es Doom shareware: primer episodio, E1M1–E1M9. Los demás episodios
no vienen en este WAD. No hay música original ni multitáctil.

DoomReady se conserva como respaldo probado: controles, interacción, pausa, guardado,
carga con la transición original, persistencia al cambiar de esfera y salida
CLOSED correctos. En la aceptación final el usuario jugó aproximadamente media
hora, recuperó una partida guardada tras morir y salió en CLOSED sin fallos.
La activación exacta del límite automático de30min y una campaña entera no se
han validado físicamente.

## Arranque y controles

Selecciona la esfera de juego y pulsa START. Conserva DoomLauncher: contiene
los datos del juego. Durante CHECKING mantén despierta la pantalla con toques
breves fuera de los botones. El primer arranque de DoomReady comprueba el ELF
en Lua y todo el WAD en C; los siguientes en el mismo contexto omiten la
comprobación completa del ELF. Volver a abrir la esfera puede crear otro contexto.
No se usa una marca permanente para saltarse comprobaciones tras un reinicio.

En DoomMenu START abre el título, sin cargar automáticamente una partida.
OK abre/confirma el menú original; flechas navegan y ATRÁS vuelve. NEW GAME →
Knee-Deep in the Dead → dificultad inicia el primer mapa. MENU abre/cierra el
menú durante el juego. Las opciones originales SAVE/LOAD indican que se usen
GUARDAR/CARGAR del panel PAUSA.

La cruceta sirve para avanzar, retroceder y girar. FIRE dispara y USAR abre
puertas, activa interruptores y permite la interacción original del juego.
Solo se admite una entrada táctil activa: no hay movimiento y disparo simultáneos.
Las armas recogidas siguen las reglas originales del motor.

PAUSA congela la simulación y libera las teclas. SEGUIR vuelve al juego.
SALIR detiene el motor, espera su cierre y muestra CLOSED. Después puedes
volver a tu esfera habitual. Ante ERROR no repitas START: recoge los códigos
con MODE si responde y describe lo ocurrido.

## Partidas

En PAUSA aparecen GUARDAR y CARGAR. GUARDAR reemplaza el slot lógico único
y solo muestra GUARDADO cuando terminó la escritura y su comprobación.
GUARDAR requiere estar dentro de un nivel, fuera de la intermisión/final.
En DoomMenu CARGAR también funciona desde el título; en DoomReady ambas
operaciones requieren un nivel activo.
CARGAR restaura ese slot y deja el juego pausado; pulsa SEGUIR para verlo avanzar.
SIN PARTIDA significa que no encontró una copia válida. ERROR SLOT indica
que no pudo completar la operación; la copia anterior se conserva si seguía válida.
Espera el resultado antes de pulsar SEGUIR; SALIR puede cancelar la operación.

El slot usa dos archivos alternados dentro de esta esfera, con versión,
identidad del WAD, generación, tamaño y CRC. Una escritura cortada o una copia
dañada no invalida automáticamente la anterior. No son una copia de seguridad
externa ni un formato para importar partidas arbitrarias.
Cada versión usa su carpeta propia; no migra partidas de las otras esferas.
Si eliminas una esfera de juego puedes perder sus partidas. No elimines
DoomLauncher mientras uses el juego. No hay guardado automático al salir.

La sesión nueva tiene un límite cooperativo de treinta minutos, incluyendo
pausas; guarda antes de alcanzarlo. El límite no garantiza detener un bloqueo
del sistema. El comportamiento al suspender la pantalla sigue pidiendo salida;
mantén el reloj despierto al jugar. DoomReady es el respaldo sin sonido;
DoomMenu conserva los efectos, con el fallo inicial indicado arriba.

## Alcance

Motor original, imagen de aproximadamente383×239, botones con fondo al35% y
flechas nuevas70×58. Se mantiene el renderizado que el usuario describió sin lag.
Los nueve mapas shareware arrancaron, guardaron y cargaron en el emulador;
eso no equivale a completar toda la campaña ni a una prueba larga en hardware.
El candidato actual se limita al modelo M2315W1 y firmware2.2.86 revisados.
