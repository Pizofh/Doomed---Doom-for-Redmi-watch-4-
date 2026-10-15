# R278: contratos de filesystem/caché y paquete de assets offline

El 2026-10-15 se contrastaron las rutas de imagen del AP candidato RW4 y se
construyó un carrier offline con el ELF original y el WAD como recursos
separados. **No se abrió Bluetooth/USB, no se inició otra prueba del emulador
y no se instaló ni ejecutó este paquete.** No es el launcher final.

## Filesystem de LVGL: ruta identificada

La imagen AP sigue fijada por SHA256
`2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db`.
Los offsets siguientes son de ese archivo privado, no direcciones portables.
Se distinguen los alias LVGL `code+0x1bff187c`, `data+0x3bff187c` y el código
NuttX inspeccionado con base `0x0c100000`.

| Contrato | Evidencia estática |
|---|---|
| Driver de filesystem con letra `/` | Inicializador33f70; escribe47 en driver+0 y cache_size0 en+2; registra con4488c |
| Open conserva la ruta absoluta | lv_fs_open44374 retira el prefijo; callback33f28 reconstruye con `/%s` |
| Open llega al filesystem NuttX | Veneer64f7c→495b7c→file_open/descriptor; no solo recurso gráfico propietario |
| Read llega a nuestra callback | Callback33efc→veneer64e14→496190; dispatcher usa fops+8 |
| Seek/tell | Callbacks33ec0/33e9c→veneer64fb4→4956a4; offset64 interno, posición32 del API LVGL |
| Formato de imagen por archivo | Built-in info24b10 valida extensión `bin`;24bac lee4bytes y cierra |

Esto respalda `/dev/rw4doomimage.bin`: después de quitar y reconstruir el
prefijo resulta la misma ruta. El driver LVGL inspeccionado no activa su
caché de lectura de filesystem. No se afirma que todos los drivers o rutas
de recursos utilicen este mecanismo ni que ya funcione físicamente nuestro
nodo. Los campos file/fops siguen siendo contratos privados candidatos.

La ventana exploratoria5f8cc0 vista anteriormente tenía operaciones de recursos
y no era por sí sola prueba del port POSIX de imágenes. Se siguieron las
referencias reales a drv_init4487c y drv_register4488c hasta33f70. Los nombres
tentativos de las primeras ventanas no se usan como identificación de funciones.

## Caché: selección y retirada identificadas

La rutina55050 llama al inicializador LRU64778. La instalación del gestor en
648da..648e8 conecta su tercer callback con646c4. El binding candidato
`lv_img_cache_invalidate_src`24638 llama a ese callback. En646c4 se comparan
rutas por contenido y se cierra el decoder mediante2517c antes de retirar la
entrada. La consulta decoder_get_info24fc0 recorre los decoders y, para archivos
binarios, vuelve a leer su cabecera.

Esto proporciona una cadena estática para el retiro por nombre ya previsto:
eliminar Image en UI → invalidar esa ruta → comprobar lectores → liberar slot.
No se añade una supuesta función de header-cache desde S3. **No demuestra la
ausencia universal de otras cachés, el backend de dibujo activo o su consumo
real.** El render físico RW4 del nuevo port continúa pendiente.

En55072 aparece0xd00000 como argumento del inicializador de caché. Es un
parámetro estático, no prueba de13MiB ya reservados, usados o libres. No se
incluye como una reserva medida ni se utiliza para deducir la RAM disponible.

## Presupuesto de memoria

| Componente | Bytes | Procedencia |
|---|---:|---|
| Secciones asignables del candidato RW4 |899056| ELF: text203880, rodata130916, data61172, BSS503088 |
| Pico de reservas del runtime |6583985| Observado en S3 con el mismo motor/private libc; no medido en RW4 |
| Stack solicitado al worker |32768| Configuración candidata, no high-water físico |
| Subtotal orientativo |7515809| Unos7,17MiB, antes de loader, overhead, cachés y sistema |

El pico del runtime ya incluye la zona de6MiB y DG_ScreenBuffer: no se vuelven
a sumar. Los dos slots RGB565 están incluidos en BSS. El WAD se leería desde
almacenamiento; no se cuenta como un buffer completo de4MiB en RAM. El límite
de reservas8MiB del runtime no limita la memoria total del proceso/sistema.

Siguen desconocidos el heap libre del reloj, el bloque contiguo disponible
para la zona de6MiB y la disponibilidad en el heap específico que usa malloc.
No se toma la especificación comercial de32MB como memoria libre. El futuro
launcher debe hacer preflight y rechazar la carga si no puede determinar un
presupuesto adecuado; la política y la fuente exacta de esa lectura siguen
pendientes. Se incluirá en el ensayo agrupado, sin rearmar probes anteriores.

## Carrier de archivos: construido y verificado en PC

`tools/package-doom-assets-r278.mjs` usa el Compiler.exe/DeviceInfo.db revisados,
sin ADB adyacente, y verifica los registros serializados byte por byte.
Archivo privado ignorado: `build/doom-assets-r278/output/DoomAssets.face`.

| Recurso | Bytes | SHA256 |
|---|---:|---|
| lua/main.lua, solo dos objetos de color |220|a916312bf050c5cb2251dd32b23afe14d1e0a7cc26e9679fc4d5c1235565b7c3|
| lua/doom.elf, candidato RW4 |603692|45d3044d0139db84f4f8c7f74f67f1c196b76a7843a416e5520ca5a593c459d7|
| lua/doom1.wad, shareware1.9 |4196020|1d7d43be501e67d927e415e0b8f3e29c3bf33075e859721816f652a526cac771|

Paquete4807680bytes/SHA256
`387e6c80616296ca7c8727e1a356e169c5b3575e1f2c33d4c9e9a32729ffa7c9`.
ID propuesto365219963, sin comprobación reciente de disponibilidad física.
No hay hexadecimal del ELF/WAD en Lua, ni os.execute, I/O, timers o carga nativa
en el bootstrap. El ELF conserva su ruta WAD placeholder y no es ejecutable
mediante este carrier. No se edita su header para un envío físico.

Rutas propuestas, sujetas a validar la extracción de recursos:

```text
/data/app/watchface/market/365219963/lua/doom.elf
/data/app/watchface/market/365219963/lua/doom1.wad
```

Esta prueba confirma empaquetado local, no extracción por el firmware, espacio
libre, aceptación de4,8MB por el reloj, instalación ni persistencia física.
El binario final deberá recompilarse con la ruta aprobada y llevar otro hash.
Los assets y paquetes quedan fuera de Git y de artifacts públicos de CI.

## Bloqueo concreto del transporte actual

`chunks()` en static-watchface-transfer.mjs limita a64partes. El carrier
necesitaría2353partes con el chunk de2048bytes utilizado hasta ahora.
StaticWatchfaceSession, además, fija32768bytes de presupuesto de transmisión
tanto al inicializar como al enviar. Son límites deliberados de nuestras
herramientas de probes, **no un límite de watchfaces demostrado en RW4**.

No se levantó ninguno. La transferencia grande requiere un camino propio,
acotado al hash/tamaño revisado, con pacing, offsets/ACK, journal, recuperación
de interrupciones y fallos probados en PC. No se reutiliza una autorización
física antigua ni se generaliza la reanudación R270 de1886bytes.

## Reproducción y estado siguiente

Con las fuentes/dependencias locales revisadas y el candidato R275 construido:

```powershell
node tools/review-rw4-deployment-r278.mjs
node tools/review-rw4-deployment-r278.mjs follow
node tools/review-rw4-deployment-r278.mjs contracts
node tools/review-rw4-deployment-r278.mjs resolved
node tools/package-doom-assets-r278.mjs
```

Ya ejecutados. Los directorios de análisis y carrier rechazan sobrescritura;
conservar evidencia antes de una revisión futura. El informe resolved verifica
literales/punteros/veneers y hashes de regiones; no contiene pruebas dinámicas.
No se alteró el candidato C ni se repitieron los ensayos S3 ya aprobados.

La siguiente meta es **preparar y validar en PC el instalador/launcher de Doom
completo**, incluyendo extracción de recursos, archivo WAD persistente,
transferencia grande y preflight de memoria. Con esos artefactos fijos se
preparará el plan físico agrupado para revisión. El último ensayo físico sigue
siendo R270; el gate permanece cerrado.
