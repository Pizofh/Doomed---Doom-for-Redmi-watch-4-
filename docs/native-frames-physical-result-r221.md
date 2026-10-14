# R221/R222 — frames generados en C, animación y salida confirmados en RW4

**Resultado R222:** usuario comunica FILE/MARK/FRAMES/UNLOAD/EXIT verdes,
animación visible y navegación/cambio de esfera normales. Reabrió por iniciativa
propia y observó bloqueo rojo sin poder iniciar; coherente con la marca de un
intento. La sección de observación pendiente inferior conserva el estado previo.

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

## Historial: observación manual pendiente después de instalar

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

## R222 — ejecución, animación y cierre comunicados por el usuario

Respuesta: «file, mark, frames, unload, exit green, la animación estuvo bien,
cuadritos queu van cambiando la ubicación de las lineas. luego salí, volví a
entrar y todo esta bien. cambié coronas y ien, todo bien. cuando volvi a entrar
ya aparecia solo rojo, no se podía iniciar de nuevo. super...».

El usuario describe animación y cambios de líneas, salida/navegación/cambio de
esfera normales, y reapertura con inicio bloqueado. «Coronas» se interpreta por
el contexto como cambio de esferas, no evidencia de giro/API de la corona física.
No se distingue inequívocamente si el cierre usó EXIT, autoparada o pageOnPause;
no atribuir un mecanismo concreto ni duración24callbacks a esta respuesta.

| Indicador verde | Condición de la fuente fijada |
|---|---|
| FILE | ELF2780bytes comparado completamente con el candidato embebido, decodificado de base64 |
| MARK | Marca15bytes escrita/flush/cerrada, readback exacto y presencia independiente |
| FRAMES | Registro rw4framesr218 observado tras ausencia previa y cuatro PNG18564bytes, firma y Adler de archivo completo coincidentes |
| UNLOAD | rmmod propio retornó y lsmod reconocido confirmó ausencia ANTES de presentar imágenes/Timer |
| EXIT | finish(false): pausa de timer/deshabilitación de EXIT, eliminación de objetos Image y retirada/ausencia de cuatro PNG confirmadas |

Los cuatro indicadores de preparación solo se pintan al devolver el controller.
La animación se inicia únicamente tras Complete/retirada confirmada; EXIT verde
exige que termine la fase visual y cleanup atribuido. El adapter Lua no crea los
PNG; frames-r218.c los genera en el inicializador con las cinco APIs stock de
archivo ya probadas,18ABS32 y stack propio GCC400bytes. Es evidencia instrumental
de **C propio que produce imágenes consumidas por Lua/LVGL y luego sale**, en
M2315W1/FW2.2.86 sin reemplazar firmware. Los colores/posiciones observados confirman
presentación dinámica, más que solo construcción de Image o indicadores verdes.

Según guards e inventarios reconocidos, rw4framesr218/rw4minr197/rw4minr202/rw4logr211
estaban ausentes en la comprobación final previa a la animación. No se retiraron
módulos anteriores/ajenos. El C no permanece cargado durante la animación ni
retiene tareas/callbacks; esta usa cuatro imágenes precalculadas, no streaming
continuo desde C. No es Doom ni evidencia de FPS/latencia del motor.

Marca/package/ELF permanecen almacenados; los cuatro PNG y capturas propias se
retiraron según indicadores. No se mide heap, cache, stack libre, corrupción
latente o durabilidad por reboot/powerloss. Evidencia mediante observación del
usuario y código fijado; sin dump/foto/trazaCPU físicos. Aislamiento, ABI general,
recovery integral, memoria suficiente y timers/input nativos siguen pendientes.

## Reapertura observada y siguiente checkpoint

El usuario reabrió por iniciativa propia, sin que se le pidiera repetir. Rojo
inicial/inicio bloqueado concuerda con frames-main-r219.lua: si marker_state()
no es absent, ui.stop() deshabilita RUN C. El mismo rojo también cubre setup
incierto; no identifica por sí solo causa exacta, ni demuestra lectura de marca
por reboot o una segunda carga. No se comunicó otra ejecución exitosa.

Ensayo autorizado completado. No reabrir/rearmar/borrar marca, nuevos envíos,
DELETE o rmmod remoto. Al registrar esta respuesta solo se editaron documentos
en PC; ninguna nueva operación Bluetooth/USB/reloj. Gates siguen cerrados.
Siguiente checkpoint PC: controles sostenidos con cambio de esferas por pulsación
larga habilitado, salida y restauración de navegación. Ese requisito es condición
para elegir la watchface como contenedor final; no está probado por NativeFrames.
