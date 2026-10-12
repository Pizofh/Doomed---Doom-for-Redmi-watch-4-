# R173 — alternativa de ID preparada únicamente en PC

El intento R172 fue rechazado por InstallStart antes de recibir el archivo;
el catálogo y la UI quedaron conservados. No se repitió la escritura.

Hay una diferencia observable, todavía sin semántica demostrada del firmware:

| Origen | Prefijo / ID |
|---|---|
| Paquete original del compiler, antes de editar | `167210065` |
| Catálogo de esta unidad | Prefijos36511:1,36521:17,36522:2,36523:1 |
| ID propio del primer intento | `365799910`, prefijo36579 no observado |
| Alternativa propia propuesta | `365219990`, prefijo36521 observado |

Que un ID esté libre no prueba que el firmware acepte cualquier prefijo.
Usar un prefijo observado podría evitar una validación del ID. Es una
**inferencia razonable**, no causa confirmada del rechazo: no hay código del
firmware ni código numérico del primer rechazo que demuestre esa restricción.
Tampoco se ha confirmado cuota/espacio libre; no borrar esferas para probarlo.

`node tools/prepare-static-id-alternative.mjs` generó solo en PC una copia del
paquete propio. Cambian exclusivamente los offsets43,44,47 del ID ASCII, de
365799910 a365219990. Imagen, tamaños, tablas y byte5=0 son idénticos.
Nuevo archivo25224bytes,SHA256:
`90069d708bea26770e85464c087dfce51ae3640e565ab33ad44f78526d5f35e5`.
Salida ignorada `artifacts/static-watchface-r173/`, con review.json.

El ID alternativo no colisiona con el snapshot previo, cuyo catálogo quedó
verificado idéntico después del fallo. No hay reserva permanente ni garantía
de que no exista ese ID en un catálogo comercial futuro; nunca sobrescribir
una entrada existente al instalar.

**No enviado, no validado físicamente y no aceptado por el SHA pin del adaptador
actual.** No se cambiaron sus constantes ni se modificó el registro incierto
del intento original. Los gates siguen cerrados. No es un comando nuevo para
el reloj ni permiso de cambiar/borrar otra esfera.

Antes de cualquier ensayo alternativo, revisar el cambio de ID/paquete, adaptar
el flujo limitado y un journal separado que preserve el anterior, comprobarlo
offline y revisar el plan físico correspondiente. No repetir una escritura
para obtener exclusivamente el código de error que faltó registrar.
