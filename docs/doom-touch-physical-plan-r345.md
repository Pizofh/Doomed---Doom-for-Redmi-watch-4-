# DoomTouch R345: controles superpuestos y perfil único de presentación

R346: usuario autorizó una instalación y un ensayo. Instalación completada,
RegisteredInactive,316partes sin resume, sesión cerrada y worker exit0.
Registro confirmado; contenido no releído. Gates restaurados y helper cerrado
verificado (5589asserts y7escenarios de paquete). Ensayo manual completado;
no repetir el envío. Reporte: artifacts/doom-touch-physical-r346/install-result.json.

Resultado del usuario: TIME MS26461,TICS842,IMAGES246,C ERROR0,GPU CODE0,
PHASE2 (cierre). Salida, retorno y menús normales. Describe buena fluidez,
«sin lag»; reporta que PAUSE no sirve y espacio inferior desaprovechado.
Foto confirma disposición actual. ~9,30presentaciones/s por contador;
no benchmark controlado ni FPS físicos de pantalla. Falta revisar PAUSE:
la UI oculta PAUSED y no cambia su botón, aunque eso no demuestra por sí
solo la causa completa del problema. No repetir el ensayo ni enviar otro payload.
El usuario pidió reunir los cambios de rendimiento y controles en una versión.

## Configuración

- Mismo ELF de DoomDirect, 606564 bytes, SHA256
  cb7d0c4c0322c9b1c9c827fb67511705262caf988beb04075c66f9c887a16de3.
  Sin cambios de C, renderer, resolución320x200, buffers, fences o unload.
- Una lectura de estado por cuadro en lugar de dos; comando PRESENT separado.
  Un error devuelto por PRESENT sigue fallando inmediatamente; su snapshot se
  recoge en el manejo de error. El siguiente tick comprueba el estado resultante.
- PLAYING repetido no vuelve a cambiar imágenes de estado ni navegación.
- Timer40ms (solicitud máxima25Hz, NO promesa de25FPS).750ticks conservan
  la petición cooperativa de salida de aproximadamente30s; no límite duro.
- UP/LEFT/RIGHT/FIRE sobre las esquinas inferiores del juego, fondo al35%,
  letras PNG RGBA con transparencia. PAUSE/EXIT inmediatamente debajo.
  Sin nueva Image de juego ni PNG por cuadro. No escalado que añada carga.
- Capa visual propia creada en la pantalla activa después de la Image C;
  zonas de toque transparentes dentro del contexto Lua de la esfera. Solo
  los botones reciben eventos; se liberan por RELEASED/PRESS_LOST/CANCEL/
  DEFOCUSED. Se conserva el guard que evita soltar un botón por el foco de otro.
- Al cerrar se retiran ambas capas; pageOnPause retira las capas propias en UI
  antes de solicitar STOP. GC no llama LVGL/join/rmmod.
- Misma comprobación de assets/CRC/registro/lease y presupuesto RAM previo.
  WAD compartido de DoomLauncher963. No requiere reinicio previo.

## Evidencia local y límites

Nueve casos de controlador Lua con IO/shell/C simulados: lifecycle y dos ciclos,
errores y rechazo de unload, GC, módulo ajeno, estado inválido,100ticks con
exactamente200aperturas de control y cero actualizaciones PLAYING redundantes.
Main final parseado por Lua del guest.

UI real S3 con main de producción y adaptador S3 separado: dos partidas con
controles de pantalla, disparo reduce munición50->49, teclas sueltas al pausar,
PAUSE/RESUME, STOP/JOIN/cierre y unload,14alloc/14free por ciclo, cero error.
Capturas inspeccionadas: juego completo y botones transparentes visibles encima.
El adaptador de pruebas conserva el mismo guard de liberación que producción;
el campo nativo de teclas es una máscara actual, no un contador acumulado.
Cleanup restaura UIProbe por hash y confirma módulo/nodo/temporales ausentes.
Las primeras revisiones locales detectaron orden de capas y guard de liberación
del adaptador de pruebas; no se enviaron al reloj.

Pruebas de paquete:43recursos extraídos y comparados, pin de ELF sin cambios,
sin WAD, siete escenarios de transferencia simulada, gate cerrado antes de
abrir archivos privados. La aceptación del paquete anterior Direct no cambia.
No se repiten pruebas del motor C que no cambió.

No hay una configuración óptima demostrada ni FPS físicos de esta versión.
La composición transparente también cuesta tiempo de GPU; el ensayo confirma
si el ahorro de IO/UI compensa. El baseline físico Direct fue168presentaciones
en21818ms (~7,70/s), con sensación de mejora y cierre correcto.

## Instalación y único ensayo propuestos

DoomTouch ID365219943, preview de una CRUZ CIAN,644560bytes/43recursos.
Paquete SHA256 c686a9b4d5c13ae004a452866939c19539119ecb5cc792b71831c4c303ec1a0c.
Lua20936bytes SHA256 6dd2f1a4d5f4e494922fd3996b523ec4dcfba20a3cf3fe2a20c6a9dd796b8d69.
Manifest: build/doom-touch-r345/package/review.json; CLI pc-doom-touch-r345.mjs.
Prepare offline:316partes/650590wire, sin journal ni radio. Runner parseado.
Journal independiente touch-r345.jsonl. DEPLOYMENT/TOUCH_R345 y C#Large cerrados.
Runner artifacts/doom-touch-physical-r346/install-once.ps1 ejecutado una vez.

1. Usuario observa, batería>=50%. Un envío inactivo, sin activar ni borrar
   esferas, sin reenviar WAD, retry, resume o reboot. Conservar Direct944 y963.
2. Seleccionar DoomTouch. Solo READY ->START una vez. Mantener CHECKING despierto
   con toques breves fuera de botones. Probar movimiento/giro/FIRE y PAUSE/RESUME;
   EXIT antes20s. Un ciclo, comparar fluidez y comodidad con DoomDirect.
3. CLOSED ->TIME MS/TICS/IMAGES. Ante ERROR/corrupción/suspensión/UI ausente,
   no repetir START ni reabrir. MODE ofrece C ERROR/GPU CODE/PHASE guardados.
   Volver desde Ajustes si responde. Asumir menús/corona normales salvo aviso.

Riesgo: nuevo payload Lua con capa fuera del contexto, eventos y frecuencia
de presentación distintos; puede bloquear/corromper el sistema. Conserva el C
probado, pero no existe recuperación integral validada. Revisión física exigida
por la regla inicial del usuario antes de cada payload. Runner abre solo los
tres gates de este intento y restaura bytes exactos y helper cerrado en finally.
Solo commits locales, sin push ni comprobaciones remotas.
