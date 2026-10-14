# R245 — lectura física pasó, delimitación no reconocida

2026-10-14. [Resultado ModInfo2](module-registry-physical-result-r244.md): cuatro
primeras filas verdes, END LINE/FINAL rojos; usuario pudo cambiar de esfera y
abrir menús. Registro/residencia de StepC desconocidos. Ensayo consumido, sin
reapertura, archivos borrados, carga/retiro C o reboot automático.

El rechazo ocurre después de la lectura y el cierre, según las filas indicadas.
El código usa END LINE rojo para un texto no vacío sin LF final; existe una
discrepancia en la fila ASCII reportada y no tenemos los bytes reales. Falta
LF no demuestra por sí sola el truncamiento del formateador encontrado en la
imagen candidata; puede ser otra representación de esta build/contexto.

No resolverlo simplemente añadiendo LF o aceptando cualquier última fila.
La prueba sintética `node tools/explain-registry-boundary-r245.mjs` muestra una
fila de65bytes: si un búfer64reserva un byte para NUL, su prefijo63todavía
contiene nueve campos y un tamaño decimal válido, pero36queda convertido en3.
Una fila completa sin solo el LF también tiene nueve campos, y conserva36.
Un parser de nueve campos/números no distingue estos casos al ignorar el LF.
Ejemplo sintético, no printf stock ejecutado ni datos del reloj.

Evidencia `artifacts/research/registry-boundary-r245/review.json`; el script
rechaza sobrescribirla. No firmware, secretos, red, Bluetooth o hardware usados.
Las pruebas Lua anteriores de filas incompletas permanecen intactas.

**Siguiente checkpoint concreto:** una vista acotada del contenido y longitud
de `/proc/modules` que muestre el inicio y el final en el reloj, sin ejecutar C
o guardar una tabla cruda. Esto permitirá distinguir una fila incompleta de
un delimitador diferente y leer el nombre real. Preparar UI/paquete/prueba/plan
antes de autorización; no enviar otra tanda de indicadores ambiguos.
Todavía no existe ese paquete ni autorización física para él.
