# R320: DoomIO termina en ERROR 3016; retorno normal confirmado

Usuario reportó «error 3016 rojo despues del checking». Sin reabrir DoomIO,
confirmó vuelta a su esfera habitual y menús/corona normales. No reportó
imagen animada ni CLOSED. El segundo ciclo condicionado queda descartado;
no se hizo nuevo envío, lectura de nodos, descarga de módulo o reinicio.

## Qué establece el código

En el launcher fijo R318, 30 es el checkpoint de limpieza que ejecuta
`view.detach()` y `command(7)`, antes del checkpoint31/JOIN. 16 es el último
errno capturado por apertura del control o su escritura. Por tanto **3016
no identifica por sí solo una escritura fallida ni un lector concreto**.
Puede producirse al abrir el control r+b o al escribir command7. El mensaje
inicial al usuario describió correctamente la etapa de liberación; no debe
convertirse en afirmación de que command7 alcanzó necesariamente el C.

Ese checkpoint se alcanza cuando el controlador ya está cargado y la lectura
de estado da finished=1/joined!=1. Según el flujo del paquete, pasó CRC/RAM,
registro vacío antes de carga e inicio nativo. No llegó a JOIN/rmmod; asumir
que rw4png318 permanece residente. No hay snapshot numérico exportado y no
se conoce la causa de terminación del worker. Menús normales no prueban
retirada del módulo, liberación total de RAM ni ausencia de corrupción.

Si command7 llegó a C, errno16 corresponde a guards started/joined o a
image_ref retenido tras image_drop. Si falló open, control_ref/gate serían
candidatos distintos. Ninguno queda aislado por los cuatro dígitos. Tampoco
queda demostrado que el loader PNG propietario recorriera su rama sin close.

## Regresión de diagnóstico reproducida en PC

`test-doom-readers-errors-r320.mjs` ejecutó el mismo Lua instalado en el
intérprete S3, con IO, nativo y widgets simulados. Pasan22base+7juego+7cleanup
y dos casos nuevos. Ambos inyectan una primera excepción de imagen en etapa25,
STOP ordenado, y luego respectivamente fallo de write7 o de open-control con
errno16: **ambos terminan mostrando3016**, ocultando el primer checkpoint25.
No se repiten operaciones tras ERROR, Timer o GC. Esto prueba ambigüedad y
enmascaramiento del diagnóstico, no que el reloj haya seguido ese primer fallo.

Artefacto ignorado: `artifacts/research/image-vfs-r320/error-path-tests.json`.
Fuente Lua R318 y paquete/ELF instalados **sin cambios**. Inventario S3 igual
antes/después y scratch retirado; sin C nuevo cargado, hilos o reloj.

También se revisaron ventanas estáticas acotadas de fs-open44374,
close4449c/read444e0 y seek446ec/tell4477c del AP local fijado, mediante
`review-rw4-image-vfs-r320.mjs`. Hay caminos con y sin caché y callbacks
indirectas; no se identificó aún el driver elegido ni un fallo causal. La
ventana opcional registry es contexto previo a open, no prueba del registro
de un driver concreto. No ejecutar firmware ni derivar bindings de estas ventanas.

## Próximo cambio útil

Conservar el primer fallo y distinguir apertura/escritura/cierre del control,
además del fallo final de limpieza; añadir observabilidad agrupada antes de
otra prueba física. No repetir el mismo3016 ni cargar otro módulo con el
residente actual. Cualquier variante debe tener fuente/ID/hash independientes
y un plan concreto que resuelva el residente sin forzar referencias/rmmod.
No hay nuevo paquete preparado ni autorización de otro ensayo/reinicio.

Conservar DoomIO365219953 y DoomLauncher365219963/WAD. No reabrir DoomIO,
DoomRAM o DoomTrace, ni borrar ejecutables/carriers del residente. Gates PC
siguen cerrados; solo commit local, sin consultas remotas o publicación privada.
