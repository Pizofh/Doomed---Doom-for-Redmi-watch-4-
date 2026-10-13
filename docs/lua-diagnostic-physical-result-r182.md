# R182 — ensayo LuaDiag autorizado

2026-10-12. Usuario responde «Sí, autorizar el ensayo LuaDiag» al
[plan R181](lua-diagnostic-physical-plan-r181.md). Un intento de instalación,
selección/observación/retorno manuales y retirada propia opcional si se decide
tras retorno. No autoSET, sustitución de LuaProbe, otras esferas, C/Doom o firmware.

Perfil r180,ID365219992,size10524,SHA256
`140b2a05618f617e70a7f5f28029beefed64251c43af0086cfaacfe0a681c8f1`.
Fuente SHA256
`7dece1ba7dac11e500157cf5569b92dc0999c3ea1e95c4b1d07e61b7b60115bd`.
Prepare verificó paquete/fuente/build. Registro lua-diagnostic-r181.json ylock
no existían. Registros anteriores conservados. Gates habilitados temporalmente,
Node únicamente r180. Build aprobado SHA256
`a704a4a45ebd16939024062611560699eacac6e80fcd18e864752ba703e132b3`.
Copias privadas de exe/metadata/source habilitado en artifacts/lua-r182-reviewed;
no reejecutar copias archivadas.

Comando autorizado una vez: `node tools/pc-static-watchface.mjs install r180`.

## Instalación y catálogo

Un único intento `RegisteredInactive`,6partes,10574bytesstream con cabeceras,
10979bytesTX totales,15framesTX/17RX. No SET automático; previousFaceStillActive,
owninactivo/eliminable. Cierre de socket y salida worker confirmados,exit0.
GET independiente: catálogo13→14,13IDs/flags/activa anteriores conservados,
propia presente/inactiva/eliminable. Journal r180 Registered,6partes.
Reportes sanitizados privados en artifacts/lua-r182-reviewed.

Ambos gates restaurados FALSE,REVIEWED_VARIANT=r167; build cerrado SHA256
`03d3be0cb02ef6cea717a11fc4cb82c6ca66cd8d51d8186107149961e4af217b`.
Prueba Node/nativo de entradas cerradas pasa sin conexiones. No DELETE,reinicio,
reemplazo de LuaProbe,firmware o nueva asociación.

## Observación física del usuario

Usuario confirma fondo negro,panel pequeño magenta,marcador amarillo y verde.
Pulsación larga/cambio a otras esferas funcionan y el resto funciona normal.
En aclaración adicional,confirma **sin texto**,solo panel y marcadores. No se
pidió reabrir la esfera para aclararlo. Desbordamiento del nuevo preview no
fue confirmado por separado; no darlo por corregido físicamente.

**Lua y creación de objetos LVGL confirmados en M2315W1/2.2.86:** los colores
y objetos de runtime no existen en el previewX. Amarillo demuestra llegar al
primer marcador. Verde solo demuestra que `pcall(root:Label(...))` terminó
con retorno verdadero/no nulo: no identifica el tipo real del retorno,fuente
resuelta,contenido/dimensiones de label ni render de texto.

**Texto no demostrado:** en este ensayo el texto esperado no aparece. Al
eliminar Font explícita/timer/cambiar constructor/tamaño,cambió también
el diagnóstico; no aislar Font24 como causa única del fondo azul anterior.
Hipótesis por investigar: fuente por defecto no disponible,contrato de
constructor/propiedades en este binding,estilo/dimensiones o visibilidad de
label. No excepciones/logs físicos disponibles para decidir entre ellas.

El usuario puede cambiar a otras esferas y reporta funciones normales; no
afirmar un hook de pausa/resume o cierre de VM observado por log físico.
No se hizo relectura de catálogo tras su selección manual,por lo que own
inactivo describe el snapshot postinstalación, no un GET posterior al usuario.
No prueba timer,touch programático,native C/ELF,privilegios o Doom físicos.
Ambas esferas Lua se conservan almacenadas; retirada opcional autorizada
todavía no decidida ni ejecutada. No reintentos del mismo paquete.

**Siguiente checkpoint:** investigar en PC documentación/código del binding
de texto/fuentes específico de RW4; preparar diagnóstico si hay evidencia.
No otro envío ni escalación por el éxito de dibujo Lua.
