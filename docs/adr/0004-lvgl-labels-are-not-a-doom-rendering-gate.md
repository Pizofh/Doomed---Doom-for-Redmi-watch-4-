# 0004 — texto LVGL no es requisito del render de Doom

2026-10-12. Estado: aceptado para orientar investigación, no autoriza hardware.

R182 confirma Lua/objetos LVGL en RW4 y ausencia del texto de una Label,
aunque su creación retorna sin excepción. Invertir sucesivos ensayos físicos
solo para conseguir una etiqueta retrasaría la validación del camino a Doom.

El motor original dibuja su imagen,HUD y caracteres de juego en sus propios
buffers usando assets del WAD. Nuestro adaptador S3 entrega DG_ScreenBuffer
como frames y Lua/LVGL presenta una Image. Una etiqueta del launcher es otro
componente; su fuente de sistema no genera los caracteres del motor.
Fuente local: `experiments/doom-ui/adapter.c`,función DG_DrawFrame, y renderer
original bajo `third_party/doomgeneric/doomgeneric/` fijado por lock.

Decisión: mantener investigación de Label como diagnóstico acotado. No usar
su fallo para concluir que Doom no puede renderizar,ni su éxito para concluir
que C/ELF puede ejecutarse. Las próximas capacidades relevantes son Image,
input/timers y un mecanismo de ejecución C con ABI/privilegios entendidos.
Todas siguen requiriendo evidencia RW4 y planes físicos revisados.

La alternativa mejor respaldada para texto es probar builtinMONTSERRAT_14,
que aparece en una muestra etiquetada RW4. Su presencia física y render no
se han demostrado. No se requiere probarla en hardware antes de estudiar el
camino de display/input o documentar las restricciones del loader.
