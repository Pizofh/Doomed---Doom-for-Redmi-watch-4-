# R190 — NativeInfo instalada; diagnóstico visual pendiente

2026-10-12. Usuario responde «Sí, autorizo el ensayo y puedo observarlo»
al [plan R189](native-info-physical-plan-r189.md). Un intento de instalación
del paquete fijo, selección/observación/retorno manuales y retirada exclusiva
opcional si se decide después. No permiso para cargar C, ELF o firmware.

## Preparación y único envío

Perfil r188/contentKind lua-native-info, ID365219994,12708bytes;
SHA256 `e0fe5fb93311460eb784d44b449613ec0defc20841e061096811b4b42eea9c4d`.
Fuente SHA256 `764d532c6810a51999434c1f7847ec075e5d85c273792ab9b5777a91c7a2f4a7`.
PNGleyenda SHA256 `b8991bea47c296a6f602bff28aa3552e343d045aca675dec48d49db9575d70b0`.
El nuevo journal y su lock no existían antes. Prepare verificó hashes.

Gates habilitados temporalmente, Node solo r188; helper autorizado SHA256
`5414210031559ac4cddcfc77f86acff532ac684a9adbf5ea407671189602c336`.
Copias privadas exe/build/CLI habilitados archivadas en
`artifacts/native-info-r190-reviewed`; no reejecutar esas copias directamente.

Comando una vez: `node tools/pc-static-watchface.mjs install r188`.
Resultado RegisteredInactive, siete partes,12762bytes de stream con cabeceras,
13182bytesTX totales,16framesTX/16RX. Registrada y eliminable; selección previa
conservada, sin SET por cliente. Socket cerrado/worker terminado,exit0,sin error
nativo. `transferAcceptanceVerified=false` permanece en reporte: no se afirma
ACK final explícito o validación de runtime por ese campo.

## Comprobación independiente y cierre

Después del envío se restauraron ambos gates y se reconstruyó el helper antes
del GET independiente `node tools/pc-rfcomm.mjs watchfaces`. Complete,
HMAC/ACK/datos cifrados válidos,catálogo15→16,unaactiva,propia inactiva/eliminable.
Las15 entradas previas conservan IDs/active/canDelete. Antes y después, la activa
es LuaImage365219993; eso es el snapshot actual, no se atribuye al instalador
ni se cambia el resultado comunicado de retorno normal enR187.

Segundo socket/worker cerrados,exit0. GET no contiene datos nuevos de batería
o firmware; modelo/FW2.2.86 se exigen en el preflight del ensayo.
Journal r188 Registered,sietepartes,sin lock restante. Reportes sanitizados
privados, sin claves/MAC/serial/raw paquetes publicados.

Node PHYSICAL_WRITES_REVIEWED=false, REVIEWED_VARIANT=r167; nativo
StaticPhysicalReviewed=false. Build cerrado SHA256
`2aab9fbfa09cc8c6e021c9ed684d972b5cfc3e0215a6e75027da6f1aeba7cd93`.
Prueba de entradas cerradas pasa sin radio real. No DELETE/reinicio/revinculación
o nueva transferencia de pruebas anteriores. La autorización de envío se utilizó.

## Pendiente usuario

Seleccionar NativeInfo una sola vez (preview dos barras blancas). Leer las
once filas: OS FUNC, IO FUNC, LOAD FUNC, SHELL, INSMOD, RMMOD, LSMOD, IWASM,
NUTTX, ARM NAME, CLEANUP. Amarillo=función expuesta;verde=resultado reconocido;
rojo=no;gris=desconocido. Primeras tres amarillas y resto verdes sería el patrón
del emulador, **no se supone que el RW4 lo repita**. Si falla/vacío/captura
residual, no reabrir ni limpiar a ciegas; volver desde Ajustes si responde.

Volver a esfera habitual y comprobar menús/pulsación larga. El cliente no
seleccionó la esfera ni llamó a shell/loaders durante transferencia. Shell/io,
comandos anunciados y limpieza física siguen pendientes de esta observación.
Aunque se anuncie insmod, no hay contrato ABI/exports/privilegios o helloC
físico autorizado. No activar/cargar un ELF por un resultado verde.

Sin nueva consulta después de una selección manual todavía. Propia inactiva
describe el GET postinstalación, no estado tras futuras acciones del usuario.
No se ha decidido retirada opcional.

**Siguiente checkpoint único:** obtener los indicadores del inventario y
confirmar retorno normal de este mismo paquete instalado.
