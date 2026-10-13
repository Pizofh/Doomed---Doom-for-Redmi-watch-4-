# R190/R191 — shell NuttX e inventario de módulos confirmados en RW4

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

## R191 — observación física y retorno del usuario

El usuario comunica las once filas y, en respuesta posterior, confirma retorno
a esfera habitual con menús/pulsación larga normales. «insumos» se interpreta
como la fila INSMOD de la lista solicitada; ninguna otra fila tiene ese nombre.
No se pidió reabrir la esfera ni repetir comandos.

| Fila | Color observado | Conclusión específica de 2.2.86 |
|---|---|---|
| OS FUNC | Amarillo | os.execute expuesto como function; su uso se demuestra además por captura reconocida |
| IO FUNC | Amarillo | io.open expuesto; las lecturas/cierres de captura avanzaron hasta los indicadores posteriores |
| LOAD FUNC | Amarillo | package.loadlib expuesto como function, **no invocado**; implementación desconocida |
| SHELL | Verde | help produjo una salida reconocida con tokens help/uname |
| INSMOD | Verde | help anuncia insmod; no se cargó ningún módulo |
| RMMOD | Verde | help anuncia rmmod; no se descargó ningún módulo |
| LSMOD | Verde | help anuncia lsmod; no se invocó ni se vio lista de módulos |
| IWASM | Rojo | iwasm no aparece como token en la salida capturada de help; no demuestra ausencia de WAMR interno u otra interfaz |
| NUTTX | Verde | uname -a contiene el token NuttX |
| ARM NAME | Verde | uname contiene arm; no determina ISA/core/FPU/ABI concretos |
| CLEANUP | Verde | os.remove devolvió éxito para captura propia; no readback independiente físico de ausencia |

**Lua→shell NuttX confirmado en M2315W1/2.2.86**, mediante este paquete y la
observación del usuario. Se efectuaron las dos consultas literales aprobadas,
redirección a archivo propio, lectura/cierre desde Lua y eliminación devuelta
como exitosa. No equivale a probar escritura io.write desde Lua, acceso a
archivos arbitrarios, comandos interactivos o privilegios aislados.

Este resultado difiere del S3: allí IWASM era verde. No trasladar disponibilidad
de comandos/config del emulador al RW4. Función loadlib expuesta puede ser stub.
Anunciar insmod tampoco establece soporte efectivo de nuestro ELF o formato,
relocations/imports/ABI, init/unload o modelo FLAT/PROTECTED/KERNEL.

Sin captura/log físico o texto completo de uname/help: se conocen estos
tokens/resultados, no versión exacta NuttX, número de símbolos, memoria libre
o configuración de compilación. La salida normal observada no prueba cierre
de VM por log ni recovery ante código nativo incorrecto.

No nuevas conexiones, consultas, envíos, DELETE o reinicio por el agente enR191.
El GET anterior es previo a selección manual; propia inactiva no es un GET tras
el retorno del usuario. Se conserva instalada; retirada opcional no decidida.
Gates siguen cerrados. Ningún C/ELF propio se ha cargado en el reloj.

**Siguiente checkpoint único:** obtener evidencia verificable del contrato
nativo específico de2.2.86 desde PC, antes de compilar/cargar un helloC físico.
Ver [contrato pendiente](rw4-native-contract.md).
