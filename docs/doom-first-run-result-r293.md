# R293: DOOM real ejecutado en Redmi Watch4 stock

En el único ensayo autorizado de DoomRun, el usuario confirmó que CHECKING
terminó, pudo jugar, la imagen apareció en la parte superior, todos los
botones funcionaron y EXIT terminó en **CLOSED**. Volvió a su esfera desde
Ajustes; confirmó corona, menús y funcionamiento habitual normales.

**Incidencia abierta:** después de EXIT no pudo abrir el selector de esferas
por pulsación larga. La salida del juego funcionó, pero el retorno de esa
interacción no fue completo. No se ha probado otro arranque ni se debe repetir
la prueba de un solo uso para diagnosticarlo.

## Alcance demostrado

- Unidad M2315W1, firmware2.2.86, sin reemplazar/modificar firmware.
- Motor original doomgeneric/DOOM y doom1.wad shareware ya almacenados en el
  carrier365219963; launcher Lua separado365219961. No traducción de C a Lua.
- Primer juego/render/input físicos reportados por el usuario. La UI utiliza
  un frame320×200 en la parte superior de la pantalla390×450, tal como estaba
  diseñado para este ensayo; no es un render a pantalla completa.
- EXIT muestra CLOSED. En el código instalado ese estado se alcanza después
  de finished/JOIN, balance de allocations/frees, cleanup, identidad y retirada
  del módulo/nodos. Es evidencia del controlador observado, no una consulta
  independiente posterior del registro nativo.
- No se enviaron nuevos comandos al reloj después de recibir el resultado.
  Gates PC permanecen cerrados. La marca de un uso no se elimina ni reinicia.

El flujo observado es consistente con pasar CRC/tamaños/cabeceras y umbral de
RAM antes de insmod. No se capturaron valores numéricos nuevos de RAM, FPS,
latencia o consumo. Tampoco se midió duración exacta ni se verificó el límite
automático: el usuario usó EXIT. No inferir aislamiento de privilegios ni
recovery integral de un ensayo exitoso.

## Qué falta para el MVP general

Todavía falta restaurar bien la navegación tras EXIT y permitir otro arranque
manual sin reinstalación/PC. Los archivos ya son persistentes; la barrera de
un uso de DoomRun es deliberada, no una limitación demostrada del firmware.
Faltan estabilidad en varios ciclos, controles/imagen más cómodos y medidas
reales de rendimiento/memoria. No se prueban reinicio ni persistencia de app
ejecutable tras reboot con este resultado. Sonido/savegames siguen fuera.

## Siguiente checkpoint único

Preparar y validar en PC un launcher reutilizable que libere los controles
al finalizar, restituya el acceso al selector y permita iniciar/cerrar dos
veces usando el mismo ELF/WAD persistente. Mantener controles que consuman
pulsación larga solo durante el juego; no cambiar gestos globales del sistema.

Inspección inicial: DoomRun deja root/controles visibles con flags CLICKABLE y
PRESS_LOCK después de CLOSED. HoldPad, que sí pasó el retorno físico, oculta
su página de juego y deja el contenedor de reposo no clickable. Es una
**hipótesis de causa**, pendiente de reproducción y comprobación: no atribuir
el fallo a C/firmware sin evidencia. El próximo payload requiere un plan nuevo
y revisión del usuario; no reabrir el ensayo actual ni borrar sus marcas.

Evidencia pública sin datos identificativos:
[observations-r293.json](../experiments/doom-runtime-rw4/observations-r293.json).
No se publican WAD, firmware, claves, direcciones, logs crudos ni capturas.
