# Siguiente checkpoint: cerrar el ciclo del módulo residente

Preparación PC R265 completada: [ExitC y plan R266](native-exit-physical-plan-r266.md).
68casos y retiradaS3 pasan; sin autorización o ejecución física nueva.
Se eligió listado del directorio padre, sin abrir/stat el hijo tras descarga.

R264 completado físicamente: diez indicadores verdes, menú y cambio de esferas
normales. El cliente confirmó13ACKs, estado STOPPED/held0 y todos sus cierres;
el registro definido key64 permaneció igual. No hay captura raw nueva: valores
finales validados por los indicadores y la fuente fijada, no por un dump digital.
Esto prueba write/START/INPUT/STEP/PAUSE/RESUME/STOP del puente en esta unidad.
No significa que el motor DOOM ya se ejecutó en el RW4.

El módulo `rw4step234` sigue residente en RAM desde R237. STOP cambia su estado
privado, no libera código ni permite START de nuevo. Para una aplicación que
pueda cerrarse y abrirse de nuevo hay que retirar sus recursos antes de descargar
C, y después cargar una instancia nueva desde almacenamiento persistente.
No rearmar marcas ni reiniciar para saltarse esta validación.

## Trabajo PC autorizado; no operación física bajo este documento

Preparar un ensayo de retirada **solo del módulo detenido**, con plan y revisión
nueva antes del hardware. Usar identidad canónica y snapshot STOPPED conocido;
cerrar el lector antes de solicitar una única retirada. No enviar otro STOP,
crear C nuevo ni recrear los archivos antiguos desaparecidos.

Revisar la implementación fijada de `step_uninit`: rechaza refs propios, held
o fase activa; pone closing y llama unregister sobre `/dev/rw4step234`.
No tiene hilos/Timer C/worker que requieran join. Los cierres y la exclusividad
del cliente reducen el problema, pero no demuestran ausencia de toda referencia
del sistema ni inventario completo. Key64 no incluye DATA SIZE.

El unregister de la imagen candidata puede quitar el path antes de devolver
error por referencias: **ausencia del nodo sola no demuestra descarga segura**.
La operación shell debe obtener resultado inequívoco, confirmar desaparición
del registro y comprobar el path sin abrirlo/invocar callbacks después de
retirar C. Determinar primero qué mecanismo stock permite ese último chequeo.
Si cualquier cierre/identidad/resultado es incierto: no rmmod/retry/reload.
No usar apertura del nodo como detector después de liberar el código.

La prueba S3 R263 retiró su propio módulo correctamente, pero tiene ABI y
uninitializer diferentes. No es prueba física de unregister/uninit R234.
Primeros ensayos FirstC2/NativeLog demostraron retirada de otros módulos;
el módulo que registra un nodo requiere comprobar esta ruta concreta.

Tras ciclo de vida validado, reutilizar el trabajo del DOOM real en S3 y
adaptarlo a RW4: APIs de memoria/temporización/WAD, buffers de frames y ciclo
de ejecución con salida. No repetir la investigación del registro ni portar
gameplay a Lua. Memoria libre y rendimiento físico siguen pendientes.
