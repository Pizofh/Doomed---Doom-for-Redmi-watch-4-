# R221 — NativeFrames instalada; ejecución y observación pendientes

2026-10-13, Bogotá. El usuario autorizó el [plan fijo R221](native-frames-physical-plan-r221.md)
con «Sí, autorizo el ensayo y puedo observar el reloj». La solicitud incluía
presencia/batería≥50%; no se consultó ni midió batería por el protocolo. Un envío,
selección manual/RUN C único/animación/EXIT/retorno; ningún reintento o DELETE.

## Instalación única aprobada

NativeFrames ID365219980,29.704bytes, SHA256
`94b65fb94b7b299496ca672348f1a5281fe123e5ee7991044f59e90e1705481e`.
ELF2780bytes SHA256
`80b75ebe516a80a931ac30e93a4d30cc76eb137e8bc7d57195091a680ad5f636`.
Paquete/fuente/build verificados; journal/lock nuevos ausentes. Solo perfilr220
y gate C# habilitados temporalmente, helper SHA256
`009c3aeaa087004a63a4b2aea01d57430e9194cce7887b31989d2dd9f85ab879`.
Copias privadas de helper/build/CLI/Probe archivadas; no ejecutarlas directamente.

Un `node tools/pc-static-watchface.mjs install r220`: RegisteredInactive,
15partes,29.790bytes de stream con cabeceras,30.332bytes TX/24frames TX/16RX.
Registro propio verificado/eliminable, esfera anterior sigue activa y
selectedByClient=false. Socket/worker cerrados, exit0/sin error nativo.
Modelo/FW reconocidos por el preflight requerido. transferAcceptanceVerified=false
conserva el límite: sin deducir un ACK final explícito o runtime/C funcionando.

No selección/SET, DELETE, firmware, reinicio, cambio de vínculo o ejecución C
desde PC. Los archivos se almacenaron como datos; exige toque manual RUN C.

## Gates cerrados y catálogo independiente

Fuentes Nodefalse/r167 y C#false restauradas en finally, helper cerrado reconstruido
SHA256 `b3a53acdcfb081758f381a16a50d12fa8eba1ef73a42a9536e5342a17f978466`.
Test de entradas cerradas pasó sin sockets antes de consultar el catálogo.

Un `node tools/pc-rfcomm.mjs watchfaces`: Complete/HMAC/ACK/cifrado válidos,
15esferas/una activa. Comparación contra snapshot actual del journal: las14previas
conservan IDs/active/canDelete; solo NativeFrames añadida, inactiva/eliminable.
Activa365210175 sin cambio; FirstC2 y NativeLog almacenadas e inactivas.
LuaImage365219993 ya no estaba en el catálogo PREVIO de este ensayo; no se atribuye
su ausencia al envío. Segundo socket/worker cerrados, exit0. Journal Registered,
15partes/sin lock. No nuevo dato de batería/FW en este GET.

Reportes sanitizados privados en artifacts/native-frames-r221-authorized:
install-report.json, inventory-report.json, comparison.json. GET transcrito desde
su único resultado, sin segunda consulta. Sin claves/MAC/serial/dumps publicados.

## Observación manual pendiente

Se pidió seleccionar NativeFrames (cuatro barras cian), comprobar cinco grises
FILE/MARK/FRAMES/UNLOAD/EXIT, RUN C UNA vez, observar colores/barra que cambian,
EXIT tras varios cambios o parada automática24callbacks (~9,6s nominales).
Comunicar imagen/animación y cinco colores finales; volver a habitual desde
Ajustes y confirmar menús/desplazamiento/pulsación larga. EXIT rojo inicial,
etiquetas ausentes/fallo: no pulsar/repetir, describir. No reabrir/rearmar.

**Instalación no demuestra ejecución de C, generación/display/Timer, retirada
del módulo/PNG o retorno normal de esta prueba.** NativeLog físico y S3 sirven
de antecedentes; no sustituyen la observación pendiente. Códigos, IDs y hashes
siguen fijos. El criterio [de contacto sostenido sin selector](controls.md) queda
pendiente; no se pidió ensayarlo con este paquete, que no implementa controles Doom.
Privilegios, RAM/stack libres y recuperación integral siguen sin determinar.
