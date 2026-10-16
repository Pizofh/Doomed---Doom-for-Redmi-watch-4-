# R316/R317: lector PNG concurrente corregido en PC, sin ensayo físico

Tras CExit12/errno16 se inspeccionó solo el AP local fijado, sin ejecutarlo.
Las ventanas están ignoradas en artifacts/research/png-lifecycle-r316*.
Herramienta: review-rw4-png-lifecycle-r316.mjs (modos fijos follow/decoders/
callbacks/formats/png/load; salidas inmutables y rangos acotados).

## Hallazgos estáticos

Se siguieron cuatro registros de decoder; el de5de54 es candidato JPEG por
su firmaffd8ff, no se confundió con PNG. La rutina643ac compara la firma de
ocho bytes y lee anchura/altura PNG de24bytes. Su registro64448 instala
info643ac/open642c4/close642b8. Open llama al cargador61e60, después al decode.

61e60 abre/seek-end/tell/cierra, asigna buffer y vuelve a abrir para leer todo.
En61ec8 una lectura con error salta a61ed0; en61ece una lectura corta también
alcanza ese retorno. Esas ramas no pasan por close de61ee4. Esto demuestra
una ruta estática de retorno sin close en el candidato, no que esa rama fuera
la recorrida por el reloj ni qué provocó el error inicial. Tampoco es prueba
de una ABI general basada en una versión pública de LVGL.

La ruta de nombres3e8b8c puede intentar conversión png→bin mediante4888b8/
4889cc, pero no se demostró que fuera llamada para nuestro src Lua. No tomarla
como causa ni asumir que se creó un bin en /dev. Image-drop24638/646c4 compara
rutas y cierra entradas de caché, pero no contiene una solución universal a
handles que escaparon de un cargador fallido.

## Regresión reproducida y cambio propio

El puente anterior admite un único lector y comparte cursor global. En S3,
mantener un fopen real del nodo y llamar al get_info de LVGL real provoca
rechazo con el puente anterior. La nueva variante permite la misma consulta
con otro lector abierto. Este es un caso reproducido, no prueba de que hubo
lectores solapados en el hardware.

pngReadersTransport() conserva el serializer y protocolo, permite hasta8
lectores con refcount y guarda posición en cada file (campos+8/+12 ya fijados).
Open/read/seek tras START exigen su UI owner; close puede retirar la referencia
propia. Sigue habiendo una sola lease de frame inmutable compartida. No hay
nuevo binding, asignación heap por lector ni writes de frames a flash. Release,
JOIN y uninit siguen bloqueados mientras quedan lectores; no se ponen refs a0
por timeout ni se cierran descriptores ajenos. El duplicado de un fd no tiene
un nuevo contrato probado: se ensayan fopen/fclose independientes, no dup.

## Verificación realizada

| Prueba | Resultado y límite |
|---|---|
| R316 base, VFS/stdio S3 reales |72checks: PNG completo192278bytes en una lectura y bloques coincide con referencia independiente; EIO inyectado + rama sin close deja release/uninit busy; solo el handle propio de fixture se cierra |
| R317 variante, VFS/stdio+get_info S3 reales |114checks: lectores solapados, posiciones/seek independientes, máximo8, cierre de todos antes de liberar, guards de owner de open/read/seek, PNG exacto y EIO simulado |
| Código de motor candidato RW4 |605180bytes, ARMv8-M Thumb soft ABI, sin imports; mismo motor/libc/bindings/WAD y codec, solo transport nuevo |

Ninguna prueba ejecuta el PNG loader propietario, C de motor real/hilos reales,
firmware RW4 o píxeles decodificados visibles. No se copió código de firmware
para ejecución: el caso de error es una reconstrucción propia con EIO explícito.
Módulos/nodos/archivos de fixture retirados del emulador tras los casos.

El emulador se había cerrado; se confirmó launcher/QEMU ausentes y puertos
libres, se marcó el registro antiguo y se abrió el mismo perfil (PID3532,
sesión5298). No USB/reloj. El harness inicial tuvo variable no usada y el
primer build candidato una advertencia de indentación; corregidos, nuevas
pruebas/build pasan. Salida incompleta anterior queda conservada sin usar.

## Artefacto final y próximo trabajo

ELF **build/doom-png-readers-r317/final/doom.elf**, SHA256
`8de1b31c8fe82c4fe3b52eb780e424cbdeca674c539557b58f20941093dc384f`.
Transport SHA256`d0fe36a03463348fb78a8298a97864a4bfbc9adf36ce4062d4897d5bfaba70c0`.
Bindings SHA256`523ce18e38ea031ff706145b0cb41c6e63ba4d5b4f7cdf592a2c515bd2d90081`.
Reprodujo el ELF físico previo980e13… mediante sus objetos originales; no
afirmar que esa reproducción sea la del ELF PNG6a5d43… instalado actualmente.
review.json contiene imports/relocs y physicalDeploymentAuthorized=false.
loader-tests.json/readers-tests.json en artifacts/research/png-lifecycle-r316.

**No está empaquetado, aprobado ni instalado.** El viejo módulo sigue retenido;
esta variante no puede repararlo en RAM. Integrar launcher/instalador con errores
localizados y cierre de un intento; revisar una sustitución normal del residente
antes de nueva ejecución. Cualquier reinicio físico necesita su plan/aprobación;
no forzar rmmod o refs. No activar otro Doom, borrar957/963 o cambiar vínculo.
Retirada manual de CInfo/CExit aconsejada, aún sin confirmación explícita.
Gates físicos siguen cerrados, journals intactos, solo commitlocal sin push/CI.

Se consultó [documentación upstream de imágenes LVGL8](https://lvgl.io/docs/open/8.3/overview/image.html)
como contexto para rutas RAM futuras; no aporta un binding Lua/RW4 validado y
no se usaron direcciones o estructuras upstream nuevas para este candidato.
