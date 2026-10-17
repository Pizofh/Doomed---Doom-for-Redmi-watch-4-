# R341: contrato de imagen directa en el firmware RW4

La ruta equivalente al prototipo S3 existe en el AP fijado del RW4. Se ha
seguido desde el constructor Lua y el registro del display hasta la espera
del backend. Es evidencia estática, sin ejecutar firmware, tocar Bluetooth
ni instalar otro payload. No demuestra todavía velocidad ni cierre físico.

## Decisión

Continuar con un bridge C en tarea UI que conserve una Image y dos fuentes
32bit. Evita codificar PNG, leerlo por cuadro y recrear el widget, los costes
que sigue pagando DoomDemand. Los ~35,26 tics/s y ~5 Images/s físicos siguen
sin demostrar un techo de hardware de 5 FPS.

No copiar el layout LVGL9 del S3: el RW4 usa otro contrato. Tampoco usar el
retorno de set_src, invalidate o refresh como confirmación de fin correcto.
El análisis encuentra una espera nativa real, pero su wrapper pierde errores.

## Enlaces contrastados en el AP

Offsets de archivo, no direcciones que deban ejecutarse directamente. El
script calcula direcciones Thumb usando el alias ya contrastado y guarda
huellas SHA256 de los primeros 64 bytes. El AP y objdump mantienen los pins R339.

| Función/campo | Offset | Evidencia |
|---|---:|---|
| Image create |0x4c740|Lua Image 0x5e6388 carga el literal 0x5e6394 y lo llama mediante factory 0x5e61f0, pasando parent|
| Image set_src |0x4c75c|Variable conserva descriptor; contrato de 12B y píxeles 32bit ya contrastado en R339|
| Pantalla activa |0x13bfc|Lee display+16; NULL obtiene display default en 0x41b18|
| Refresh timer |0x20cb0|Registro de display 0x41842 usa literal 0x41978; timer user_data+12 o display default si NULL|
| Draw flush |0x1fccc|Carga display.driver+96 y llama 0x21880 antes de flush de pantalla|
| Draw wait |0x21880|Invoca callback draw_ctx+52, si existe|
| GPU context init |0x55dbc|Instala 0x55ba0 en draw_ctx+52 usando literal 0x55e34|
| Configuración de driver |0x5592c|Literal 0x55ab0 instala ese init en driver+100, luego registra el display|
| GPU wait wrapper |0x55ba0|Llama 0x59678, registra error no nulo y retorna void|
| GPU finish con resultado |0x59678|Retira su lista interna de recursos y llama 0xfe78; conserva el resultado en r0|
| Finish bajo |0xfe78|Comprueba cola; propaga errores de preparación 0xfccc, submit 0xf900 y wait 0xf7c4|
| Espera kernel |0x13810, comando 5|Tabla salta a 0x139b2, llama 0x135b8; timeout retorna 4; comprueba bits de error|
| Espera de notificación |0x135b8|Espera con deadline; recoge flags de interrupción. La rutina de IRQ 0x13590 publica esos flags y despierta la espera|
| Invalidate Lua |0x5e2738|Termina en veneer 0x5b48a8 → 0x19974; invalida, sin fence ni resultado de dibujo|

La cadena identifica la espera como parte del dibujo stock, no solo por un
nombre de string. El caller de flush y el instalador coinciden en ctx+52.
No se han extrapolado offsets del emulador. El registro de timer y el factory
Lua confirman por rutas independientes refresh y constructor.

Como contexto, [LVGL 8.3.11 upstream](https://raw.githubusercontent.com/lvgl/lvgl/v8.3.11/src/core/lv_refr.c)
también espera el backend antes de flush. Esa fuente no identifica la revisión
Xiaomi ni sustituye los enlaces del AP. Su [contrato de draw context](https://raw.githubusercontent.com/lvgl/lvgl/v8.3.11/src/draw/lv_draw.h)
describe una callback para terminar operaciones de fondo.

## Condiciones para implementar y retirar el bridge

- Toda creación, cambio de fuente, refresh, cache drop y delete desde la
  misma tarea UI. Init/uninit/GC/worker no llaman LVGL. Ninguna callback propia
  queda registrada en LVGL al descargar el módulo.
- Validar huellas de funciones, display/parent y callback efectiva antes
  de presentar. El binario analizado muestra la configuración del backend;
  todavía no se ha leído la instancia viva en el reloj.
- Dos descriptores distintos, estables y píxeles B/G/R/X a contrastar con
  patrón independiente. Dos imágenes 320x200x4 requieren 512000B, además del
  motor y buffers existentes. No asumir que liberar PNG basta para el presupuesto.
- El worker escribe solamente el buffer trasero libre. La fuente visible
  queda inmutable hasta retirar su uso y completar la espera correspondiente.
  Tras actualizar, usar el estado de finish con resultado; un retorno void
  del wrapper no acredita éxito. Un fallo de fence bloquea reutilización y
  descarga, sin liberar por timeout ni forzar rmmod.
- STOP: parar/join del motor, confirmar fin de dibujo, eliminar Image en UI,
  refrescar el área y completar espera, retirar cache de ambas fuentes y
  cerrar control antes de permitir uninit. No escribir framebuffer stock,
  sustituir callbacks stock ni ejecutar las ramas de reset GPU directamente.

Una comprobación posterior con resultado no demuestra por sí sola ausencia
de errores anteriores que el wrapper stock haya consumido. La implementación
debe resolver esa observabilidad y contrastar el backend vivo antes de tratar
la retirada como validada. No se afirma recuperación integral ni que un
callback nativo pueda interrumpirse si cuelga.

## Resultado reproducible y alcance restante

`node tools/review-rw4-direct-lifetime-r341.mjs audit` valida seis enlaces de
puntero, ocho llamadas Thumb, callback+52 en caller/instalador y el salto del
comando kernel de espera contra el AP completo fijado. Los modos entry,
follow, fence, finish, contract y wait guardan ventanas acotadas ignoradas;
ningún desensamblado ni firmware entra en Git. Cada modo rechaza sobrescritura.

Artefactos: artifacts/research/direct-lifetime-r341-*/review.json y ventanas
locales. Solo el script y esta explicación son publicables.

La investigación estática de la ruta normal queda delimitada. Antes de
hardware faltan el bridge RW4 y sus guards de lifetime/errores, presupuesto
RAM y pruebas locales de publicación/retirada con fallos. El primer ensayo
físico debe comparar patrones y ritmo completo de presentación; no inferir
FPS del reloj por los ~20 updates/s del S3. No hay paquete físico nuevo ni
autorización pendiente. Conservar DoomDemand945 y carrier963 como respaldo.
