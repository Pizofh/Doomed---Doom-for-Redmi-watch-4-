# R405: avanzar al completar un mapa

R405 corrige solo la entrada entre mapas. Antes, la capa del reloj trataba la
intermisión y el final como menú: convertía FIRE en Enter y USAR en Atrás. El
motor de Doom avanza esas pantallas con FIRE normal, así que el jugador podía
quedar detenido al terminar un nivel.

En R405 el remapeo Enter/Atrás queda restringido al título, menú y demo. En
intermisión/final, FIRE permanece FIRE y se rotula **SIGUE**; USAR conserva su
etiqueta. No cambia el motor, render, audio, WAD, partidas o controles de nivel.

La esfera `365220015` importa el WAD y partidas ya verificadas de
`365220014` en el primer START. El paquete contiene 80 recursos, ELF de
790732 B y ningún WAD. Se conserva la esfera anterior hasta que la nueva haya
iniciado, cargado una partida y cerrado con CLOSED.

Validación local: compilaciones RW4 y S3, comprobación estática de la ruta
FIRE/USAR en intermisión, paquete íntegro y transporte preparado con 525 partes.
La prueba física es una instalación inactiva; no selecciona ni inicia desde el
PC. Luego el usuario abre la nueva DOOM II, carga la partida, juega normal y al
terminar el siguiente mapa pulsa SIGUE para continuar. Si hay ERROR o cierre
fallido, no se reabre y se vuelve a la esfera habitual; R397 permanece disponible.
