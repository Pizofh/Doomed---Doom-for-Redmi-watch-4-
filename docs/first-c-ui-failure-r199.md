# R199 — interfaz FirstC fallida; estado nativo no confirmado

2026-10-13. Continuación del [único envío autorizado R198](first-c-physical-result-r198.md).
No nueva instalación, consulta Bluetooth, ejecución de shell en el reloj,
retirada o modificación de firmware durante esta revisión.

## Observación física

Usuario: «no sale ninguna file ni mark ni load ni nada. solo un cuadrado gris
con otros cuadritos blancos creo. menus funcionan bien». Después confirmó que
tocó la pantalla y no ocurrió nada. No vio el botón/las cinco filas requeridas
ni comunicó un resultado Complete. No se pidió abrirla o tocarla de nuevo.

**El ensayo funcional falla en la UI; no confirma carga C ni retirada.**
Tocar una pantalla sin respuesta tampoco prueba que no se invocó un callback.
La descripción no identifica con certeza los colores/objetos, ni permite
deducir el punto exacto del fallo. Los menús funcionan según el usuario;
retorno explícito a esfera habitual y pulsación larga aún pendientes de respuesta.
No asumir que un módulo está presente/ausente o ejecutar rmmod a ciegas.

## Hallazgo de código, sin atribuir causa al reloj

En main.lua R197, root/dots se construyen primero. Después, un único pcall
contiene checks de global load, compilación de controller/adapter, construcción
del backend, imágenes, marca y registro del callback. **Las etiquetas y el
botón se crean después de los pasos de backend.** Si cualquiera de los primeros
pasos falla, la UI solo deja el panel/indicadores y trata de poner END rojo.

Global load no había sido demostrado en nuestra unidad física; NativeInfo
probó una función distinta, package.loadlib, sin invocarla. El sufijo estricto
/365219996/lua/ y la preparación del adapter tampoco fueron comprobados en el
runtime físico. Son hipótesis de fallo, no causas confirmadas. Las dimensiones
y creación de imágenes posteriores añaden otros posibles puntos de detención.

Los29 escenarios R197 usaron widgets simulados. Pasaron como pruebas de lógica,
no como prueba de render/eventos LVGL reales; esa limitación estaba registrada.
El resultado físico refuta que esa validación bastase para dar la UI por operativa.
El paquete aprobado/source original y sus hashes permanecen intactos.

## Trabajo PC realizado

`experiments/hello-native-rw4/ui-r199.lua` separa construcción de UI y habilitación
del botón. Es una factory sin io/os/load/shell/timers/C. Construye leyenda y
botón antes de que el caller prepare un backend; el botón comienza deshabilitado.
Solo ui.arm(callback) lo habilita después de registrar el evento. ui.stop()
deshabilita definitivamente y muestra END rojo. Un callback falla bajo pcall;
no se rearma ni se repite después de un toque.

Esta factory es trabajo para un sucesor, **no una corrección desplegada ni un
paquete físico nuevo**. Su compilación futura debe ser estática dentro del
script o utilizar un mecanismo Lua probado; no depender de load para mostrar
la interfaz. No aflojar la validación de rutas/archivos/comandos para sortear
un fallo desconocido del backend.

`node tools/test-rw4-ui-r199.mjs` ejecutó seis escenarios en Lua5.4 del S3 propio:
UI preservada ante backend detenido, un callback, bloqueo de repetición/rearme,
error de callback, fallo de imagen/dimensiones y fallo de registro de evento.
Widgets simulados, sin imágenes/ELF transferidos. Único archivo Lua temporal
propio con readback exacto, retirado; lsmod real idéntico antes/después.
Reporte privado artifacts/emulator/ui-r199/summary.json:
sourceSHA256807119943a71900d5a73e9da4c27045f59e06ae266ff6e97dce2b7ebc3aa9592,
harnessSHA25690b9f70e0c6e04adbb6a2e9b012c827f29a0598adcfebe7f212465868720969f.

**Render/toque LVGL real de esta factory no verificados todavía.** Siguiente
checkpoint PC: integrar y observar la UI separada con LVGL real en emulador,
sin backend nativo ni ELF RW4 ejecutable. Después fijar paquete/plan revisable.
No nuevo C físico hasta resolver inventario previo/atribución y revisar el
sucesor; no reintentos, borrar marca, unload ciego o activar desde PC.
