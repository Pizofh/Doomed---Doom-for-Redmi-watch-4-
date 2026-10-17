# R340: una Image nativa persistente, píxeles y cierre comprobados en S3

El prototipo local pasa dos ciclos completos. Una Image por ciclo alterna dos
fuentes de memoria320x200, sin PNG/archivo por cuadro. No incluye Doom y no se
preparó paquete RW4 ni se operó sobre el reloj.

## Resultado visible

| Medida | Ciclo1 | Ciclo2 |
|---|---:|---:|
| Presentaciones completas, incluida inicial |59|59|
| Tiempo hasta última presentación, ms |2905|2925|
| Ritmo de actualizaciones tras la inicial, /s |19,97|19,83|
| Cambios visibles observados por segundo |19,77|16,82|
| Capturas con todos los64000píxeles comprobados |48|48|
| Refresh/set-src agregado, us |72700|70900|
| Refresh/set-src máximo, us |6000|6500|
| Images creadas/eliminadas |1/1|1/1|
| Drains con cola de dibujo vacía |60|60|

Total6144000píxeles contrastados con referencia propia independiente del
renderer; tolerancia7por canal por cuantización RGB565 del display. Todos los
capturados pertenecen íntegramente a uno de los dos patrones; sin mezcla o
franjas corruptas en esas capturas. Cambios visibles son una cota observada:
RPC/captura puede omitir renovaciones. Timer50ms; aproximadamente20updates/s.

Coste medio de set-src+refresh+verificación de cola:~1,23/~1,20ms en S3. Excluye
generación de un frame de Doom: los patrones se precalculan al cargar y luego
permanecen inmutables. Dos fuentes no permiten inferir latencia o rendimiento
de un motor concurrente ni rendimiento del RW4. No comparar estos20updates/s
del S3 con5Images/s del RW4 como aceleración física medida.

## Arquitectura y propiedad

- C init solo rellena dos buffers estáticos512000B y registra un dispositivo
  propio. No crea widgets ni llama LVGL desde NSH. Sin worker o framebuffer
  stock escrito directamente.
- START ejecutado por un botón Lua/UI crea una Image nativa hija de la pantalla
  activa. Cada Timer50ms manda un comando desde esa misma tarea UI; C conserva
  el objeto y cambia su source entre dos descriptores estáticos. No necesita
  exportar punteros de memoria hacia Lua ni conserva punteros de strings Lua.
- Mientras existe Image, cualquier comando de otra tarea es rechazado. La
  retirada del módulo se niega si hay Image, fase activa o descriptor de
  control abierto. No se fuerzan referencias ni descarga.
- Cada presentación llama _lv_display_refr_timer(NULL), después comprueba
  display.layer_head y todos los layer.draw_task_head, recorrido acotado8.
  Se comprueba también la cola antes de delete y después de refrescar el área
  invalidada; finalmente se retiran las dos entradas de cache/header.
- STOP elimina la Image desde UI. Solo después de cola vacía y cache retirada,
  Lua cierra control y solicita rmmod. Uninit no llama LVGL: comprueba guards
  y desregistra únicamente su dispositivo. No callbacks nativos permanecen
  registrados en widgets, eventos o timers al retirar el módulo.

Los offsets privados se obtuvieron de DWARF del guest fijado, no de una versión
upstream asumida: display.layer_head672; layer.draw_task_head56; layer.next64.
El builder vuelve a comprobarlos. Lectura únicamente; nunca escribe esos
campos. El código local de refresh también se inspeccionó como contexto.

[LVGL9 upstream](https://raw.githubusercontent.com/lvgl/lvgl/v9.0.0/src/core/lv_refr.c)
espera a vaciar tareas antes de flush; es contexto, no identificación de la
revisión Xiaomi ni una fence genérica del RW4. La evidencia runtime de esta
prueba se limita a la cola del S3 y los ciclos/snapshots descritos.

## Contrato fijado y reproducción

Guest S3 SHA849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa.
Trece bindings extraídos de su tabla de símbolos, no direcciones RW4.
Thumb Cortex-A7/hard-float/general-regs-only, cero imports pendientes.

| Pin | Valor |
|---|---|
| ELF4820B SHA256 |2f471ec48c6367e68d01c1c84f32895e98132ce545ca2b20dc6a7217b25e609e|
| C SHA256 |07e57146df066a16f6005f3f859175a9ff57774b44b32c974587991ec3af07de|
| Lua SHA256 |d9353c0ce9795b6518695e282b0b3a43e011719566863e478557c7651f697075|
| Descriptor S3 real, según DWARF |20B:header12/data_size4/data_ptr4|
| Formato |XRGB8888, código0x11 en este S3|

Corrección de precisión respecto de R339: aquella sonda usó un contenedor24B,
con4B de relleno después de los20B válidos. Eso no invalida su apertura, pero
no define el tamaño real de lv_image_dsc_t. R340 usa el descriptor20B exacto.
El RW4 sigue con su layout/formato distinto; no reutilizar los offsets S3.

```powershell
node tools/build-direct-ui-s3-r340.mjs
node tools/direct-ui-s3-r340.mjs stage
# Seleccionar UIProbe en la VM por Ajustes; mantener reloj físico intacto.
node tools/direct-ui-s3-r340.mjs test
# Volver a Storage en la VM.
node tools/direct-ui-s3-r340.mjs cleanup
```

Se respalda y sustituye solo el Lua derivado de nuestra UIProbe365799903
inactiva. La sesión de VM se reinició antes del ensayo, sin módulo propio
cargado, para recuperar su UI. Ningún reinicio para cerrar o descargar el
prototipo. Al terminar: Storage seleccionado, módulo/nodo ausentes, Lua previo
restaurado con readback/hash y ELF/resultado tmpfs propios retirados.

Evidencia ignorada: artifacts/emulator/direct-ui-r340-stage/test-result.json,
observations.json de la sesión direct-ui-test, capturas direct340-c*-s*.png y
build/direct-ui-s3-r340/review.json. Ninguna comprobación repetida en hardware.

## Lo que falta para el RW4

El criterio de prototipo visible y cierre normal en S3 está satisfecho. La
presentación desde C en tarea UI es una ruta concreta para evitar PNG y la
recreación de widgets. Falta contrastar en el AP RW4 las nuevas funciones,
formato32bit, parent/entrada y finalización de dibujo/backend, y presupuestar
RAM. No hay firma/mapa/cola del RW4 validados por esta prueba; no preparar un
payload físico hasta cerrar ese contrato. Ante sincronización sin demostrar,
mantener DoomDemand jugable como respaldo, sin buffers liberados por timeout.
