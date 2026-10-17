# R339: decisión sobre imagen directa

Evaluación local acotada; sin paquete ni operación física nuevos. Conclusión:
hay evidencia suficiente para un prototipo de imagen directa reutilizable en
PC. Todavía no para afirmar FPS, seguridad de retirada o preparar un ensayo RW4.

## Punto de partida medido

DoomDemand R337 terminó CLOSED, controles y navegación normales. El usuario
reporta mejor jugabilidad, aún con lag. TIME27821ms, TICS981, IMAGES139;
FIRST/LAST00000000, DIMS03200200. Son unas4,996 construcciones Image/s y
35,26tics/s; frente a4,03 Images/s en R335, mejora aproximada24%. No es una
medición de refrescos físicos ni una demostración de techo del hardware.

## Firmware RW4, inspeccionado como datos

AP candidato fijado SHA256
2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db.
Herramienta reproducible tools/review-rw4-direct-render-r339.mjs; ventanas
privadas en artifacts/research/direct-render-r339. No se ejecutó firmware.

- Método Lua set_src5e1cac acepta string/userdata y pasa su dirección al
  setter nativo, vía5b4220. Permite una ruta de descriptor, no prueba su lifetime.
- En variable-open24c04, source-kind0 toma source+8 como puntero a píxeles.
  Para formatos4/5/6 lo publica directamente en decoder+24 y retorna éxito
  (24c16..24c36), sin apertura de archivo ni PNG. La tabla revisada R274 da
  32bits para esos formatos. Header4/data_size4/data_ptr4: no es el stream
  con metadata32 que produce nuestro driver.
- El formato18, de16bits en la tabla de profundidad, se despacha por la tabla
  24d74 a24c52: limpieza/error. El built-in inspeccionado NO acepta ese RGB565
  como sustituto directo. No extrapolar códigos/layouts del S3 al RW4.
- invalidate aparece en tabla de métodos Lua (entrada19a4d8, función5e2738);
  Canvas no aparece como export con ese nombre. canvas/set_buffer como strings
  no prueban una API Lua utilizable: set_buffer no tiene referencia de tabla
  identificada en este análisis. No inventar una API Canvas por su nombre.

La ruta de memoria evita el camino de archivo binario antiguo que mostró
corrupción R297/R300. Esa diferencia no demuestra que el dibujo directo RW4
ya sea correcto: el defecto físico del archivo no tuvo causa completamente
aislada, y falta verificar el backend de dibujo para el descriptor directo.

## Prueba ejecutada en S3

tools/test-direct-decoder-r339.mjs compila un módulo propio pequeño para el
guest fijado SHA849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa.
Usa el layout S3 explícito de24bytes/header12 y XRGB8888, diferente del RW4.
Imagen320x200, buffer propio estático256000bytes. Sin Doom, workers, drivers,
widgets, pantalla o GPU. Bindings resueltos de la tabla de símbolos del guest.

31 comprobaciones pasan. Get-info reporta320x200 y decoder-open acepta la
fuente directa. Doce ciclos open/close/cache-drop conservan descriptor/buffer;
otra apertura tras cambiar sus píxeles, solo después de cerrar/retirar caché,
también pasa. Comparación acotada con PNG indexado320x200 de referencia:

| Trabajo, agregado12 ciclos | Tiempo S3 |
|---|---:|
| Open/close/cache-drop de descriptor directo |300us|
| Open/close/cache-drop de archivo PNG |26000us|

Es una sola ronda, resolución del clock limitada y condiciones del emulador.
El acceso directo difiere trabajo al dibujo: no se inspeccionaron píxeles
decodificados, no se creó una Image ni se midió GPU/presentación. NO es una
mejora87x de FPS ni una predicción de velocidad RW4. Sí confirma un camino
aceptado por el decoder S3 sin descomprimir un PNG por renovación.

El guard inicial rechazó la VM terminada antes de enviar el módulo; se inició
solo la VM propia tras verificar PID/puertos libres. Un primer enlace carecía
de memset y fue rechazado antes de cargar. La prueba corregida pasó y retiró
módulo/temporales propios; inventario final idéntico. Sin impacto físico.

## Decisión y límite del próximo trabajo

Concentrar el próximo prototipo en una Image persistente con fuentes de memoria
inmutables. Mantener DoomDemand como respaldo. No preparar otra variante PNG
como sustituto de esta evaluación.

Tres criterios antes de un nuevo paquete físico:

1. Patrón móvil completo en Image real del emulador, píxeles comprobados y sin
   archivo PNG por frame. Medir presentación completa con resolución fija.
2. Propiedad explícita de descriptor/píxeles: fuertes referencias Lua y leases
   mientras el renderer pueda usarlos; cierre/cache retirement y fin del uso
   por backend comprobados. set_src/delete/esperar un Timer no son por sí solos
   una fence GPU. No forzar refs o rmmod para terminar.
3. Contrastar layout, formato, invalidación y sincronización con el AP RW4
   fijado, con presupuesto RAM y firmas antes de proponer hardware. Una pareja
  320x200x32 ocupa512000bytes (256000 más que los dos slots565 actuales), además
   del framebuffer del motor; no afirmar que está presupuestado sin medirlo.

Si no se puede demostrar la retirada del buffer en el backend RW4, esa ruta
queda bloqueada para despliegue aunque funcione en S3. Si el prototipo completo
no mejora, revisar frecuencia efectiva de Timer/refresh antes de otro ensayo.
No tenemos evidencia actual de un límite duro de5FPS del reloj.
