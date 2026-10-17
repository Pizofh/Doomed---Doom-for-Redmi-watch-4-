# Doomed 0.1.0-rc1 — primera versión jugable

Entrega local basada en **DoomReady R351**, probado físicamente en R352.
No cambia el ejecutable, la esfera ni las partidas que ya están en el reloj.
Se conserva como candidata hasta completar la prueba continua descrita abajo.

## Qué incluye

Imagen proporcional ampliada, cruceta con retroceso, FIRE, USAR, pausa y salida.
Guardado y carga desde PAUSA, con persistencia al cambiar de esfera y la
transición original de Doom. El usuario confirmó estos comportamientos en el
reloj, con buena fluidez y salida CLOSED.

Compatibilidad revisada: Redmi Watch 4 **M2315W1, firmware 2.2.86**.
Un botón táctil activo a la vez; sin sonido ni disparo automático.
Límite cooperativo de 30 minutos por sesión, incluyendo pausas.
Ni el límite completo ni la campaña entera se han validado físicamente.

## Instalación y conservación

**En el reloj actual ya está instalado: no reinstalar para esta entrega.**
Conservar DoomReady y DoomLauncher, que contiene los datos del juego.
DoomPads queda como respaldo si aún está instalado. Eliminar DoomReady puede
eliminar sus partidas; el paquete de entrega no contiene una copia de ellas.

El archivo local `DoomReady.face` es una copia exacta del paquete instalado,
ID 365219940, 660896 bytes, SHA256:

```text
fa2146fde2cb9bba9a7637779c747fdbbb24faf62e7b56386c66e575f3ead5c8
```

Este archivo no incluye el WAD y no constituye un instalador independiente para
otros relojes. Una instalación futura usa el procedimiento revisado del proyecto
y su aprobación específica. No hay instalación, activación, descarga ni conexión
al reloj al preparar esta entrega. No se publica ningún binario en GitHub.

## Uso

START inicia el juego. Mantener despierta la pantalla durante CHECKING con
toques breves fuera de botones. La cruceta avanza, retrocede y gira; FIRE
dispara y USAR abre puertas o activa interruptores.

PAUSA detiene la simulación. GUARDAR debe terminar en GUARDADO; CARGAR debe
terminar en CARGADO. SEGUIR reanuda. SALIR debe terminar en CLOSED antes de
cambiar de esfera. El guardado es manual y reemplaza una única partida lógica;
sus dos copias alternadas protegen frente a una escritura incompleta.

Consultar [la guía de juego](playing.md) para mensajes y límites del guardado.

## Única comprobación pendiente para cerrar la candidata

Usar la DoomReady instalada, sin reinicio previo ni nueva instalación, con
batería suficiente y pudiendo observar el reloj:

1. Jugar entre 10 y 15 minutos, manteniendo la pantalla despierta. Comprobar que
   la fluidez y los controles siguen como al principio; no hacen falta cifras.
2. Hacia el final, PAUSA → GUARDAR → GUARDADO. Moverse y después
   PAUSA → CARGAR → CARGADO → SEGUIR; comprobar que restaura lo guardado.
3. SALIR → CLOSED y volver a la esfera habitual. Informar solo si hubo un
   problema; para cerrar basta confirmar duración aproximada y resultado.

Ante ERROR, ERROR SLOT, corrupción de imagen o bloqueo, detener la prueba y
describir lo ocurrido sin repetir START. Mantener el resultado como pendiente
hasta recibir el reporte: esta entrega no afirma que la prueba ya se realizó.

Esta comprobación no valida el límite de 30 minutos ni garantiza recuperación
ante un bloqueo del sistema. La recuperación integral sigue sin validar.

## Preparación local

Desde la raíz del repositorio:

```powershell
node tools/stage-playable-release-r354.mjs
```

Escribe únicamente en `build/releases/Doomed-0.1.0-rc1/`: paquete exacto,
guías, manifiesto y sumas SHA256. Comprueba la identidad del paquete antes de
copiarlo y no sobrescribe una entrega existente. No recompila ni modifica gates.
Los binarios y esta carpeta permanecen ignorados por Git. Fuentes y licencias
de las dependencias se describen en [la revisión de fuentes](doom-build-audit.md).

Sonido y multitáctil quedan fuera de esta versión. No se añadirán otras esferas
de diagnóstico como parte de este cierre.
