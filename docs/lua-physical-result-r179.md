# R179 — ensayo Lua físico autorizado

2026-10-12. El usuario responde «Sí, autorizo ese ensayo y puedo observar el
reloj» al [plan R178](lua-physical-plan-r178.md): una instalación de LuaProbe,
selección/retorno manuales y retirada propia opcional después de confirmar
retorno. No C propio, Doom, otros paquetes, autoSET o firmware autorizados.

Perfil r177, ID365219991,19796bytes,SHA256
`a40c85607a8c208823f2dd6064ebca3c907a850e9a392c0b3eb0d718d3c9490a`.
Fuente SHA256
`e871590b80c50f2981ea8a8a796e3b0ca2f84977e7aa9a4e9fa32be7a608749d`.
Prepare verificó fuentes/build/paquete. Gates habilitados temporalmente,
Node limitado a r177. Registro lua-minimal-r178.json y su lock no existían.
Registros de imágenes anteriores conservados.

Build autorizado SHA256:
`6f35da227f04fad4af1fad05239f3ef45151c862a7bd020bb248f3cf77ff6420`.
Exe/metadata/entradas habilitadas archivadas privadas bajo
`artifacts/lua-r179-reviewed`; no reejecutar copias.

Comando autorizado una vez: `node tools/pc-static-watchface.mjs install r177`.
## Resultado de instalación

Un único intento completó `RegisteredInactive`,10partes,19862bytes de stream
con cabeceras,20329bytesTX totales,19framesTX/16RX. No SET: own inactivo,
canDelete observado y esfera anterior todavía activa. Socket cerrado y
worker terminado,exit0. Campo `transferAcceptanceVerified:false`: no usar
callbacks/presencia para afirmar render o ejecución Lua.

GET independiente posterior: catálogo12→13,own presente/inactivo/eliminable,
12IDs anteriores y sus flags conservados,activa anterior intacta. Registro
propio `Registered`,10partes. Auth/model/FW vigentes comprobados por preflight.
No borrado, cambio de vínculo, reinicio o firmware. Paquete queda almacenado.
Reportes sanitizados en artifacts/lua-r179-reviewed,ignorados por Git.

Ambos gates restaurados FALSE,REVIEWED_VARIANT=r167. Build cerrado SHA256:
`818e3d06a9662cff879771c6cea736b83fe7ed4f740c39b600f7d8d1f673c03b`.
Tests de gates Node/nativo pasan sin conexiones físicas.

## Observación manual: prueba funcional fallida

Usuario confirma preview con barras, pero al seleccionar LuaProbe queda
únicamente fondo azul: **sin texto ni contador**. La pulsación larga no abre
el cambio de esfera. Sí funcionan atrás, notificaciones, navegación superior,
derecha y menús, según su observación. No reporta reboot o bloqueo global.
No afirmar runtime completo, timer funcional o lifecycle correcto en RW4.

Se pidió volver por Ajustes→Esferas a su esfera habitual, sin volver a elegir
LuaProbe ni depender de la pulsación larga. Confirmación de retorno pendiente.
No nueva conexión/comando al reloj después de recibir esta observación.
Retirada opcional autorizada no ejecutada: requiere retorno confirmado,
decisión de retirarla y comprobación propia inactiva/eliminable.

## Diagnóstico inicial solo PC

El script crea un objeto raíz azul antes de crear las labels. La primera
label evalúa `lvgl.Font("misansw regular",24)` antes de construir el objeto.
Una excepción al resolver esa fuente o un binding distinto podría interrumpir
la inicialización dejando el fondo, sin alcanzar las siguientes labels/timer.
Es hipótesis, **no error identificado en un log del firmware físico**.
La versión32 del mismo nombre figura en TouchEvents upstream etiquetado RW4;
ni ese sample ni el éxito del tamaño24 en S3 demuestran la fuente en2.2.86.

El fondo observado coincide con el objeto Lua pero también con el fondo del
preview generado: no tomar solo su color como prueba inequívoca de ejecución.
Una futura variante de diagnóstico podría distinguir fases con bloques de
color diferentes del preview y usar fuente por defecto, primero sin timer.
Requeriría paquete/hash/plan propios y nueva revisión antes de envío físico.
No modificar/reinstalar este perfil fijo ni saltar a C para diagnosticarlo.

**Siguiente checkpoint inmediato:** confirmar retorno normal por selector de
Ajustes. Después preparar diagnóstico mínimo en PC, sin nuevos envíos.
No C/ELF/Doom físico autorizado por este ensayo.
