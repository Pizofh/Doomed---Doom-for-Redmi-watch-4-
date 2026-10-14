# R216/R217 — mensaje de archivo C y retirada confirmados en RW4

**Resultado R217:** el usuario comunica FILE/MARK/C TEXT/UNLOAD/END verdes,
con movimiento y cambio de esfera conservados. Según la fuente fijada, C leyó
su marca, escribió el mensaje exacto y Lua confirmó registro/retirada/limpieza.
La sección de observación pendiente inferior conserva el estado de instalación.

2026-10-13. El usuario autorizó el [plan fijo R216](native-log-physical-plan-r216.md)
con «Sí, autorizo un ensayo y puedo observar el reloj». Un envío, sin activación
automática; selección, RUN C único y retorno manuales incluidos en ese ensayo.
No autorización para otro envío, DELETE, rearmar la marca o cambiar el payload.
Batería≥50% era precondición del plan; no se consultó ni se midió en esta sesión.

## Instalación y cierre

NativeLog ID365219999,28.348bytes, SHA256
`1e88ce20dcbb28f6680be89f1625c22682890fb8efc8f2a605b0d34bde6579eb`.
ELF1500bytes SHA256
`9dff873fd6d41669de0d336528a35c7c281fa1e03ee1eb5ebcddd6d6907ca652`.
Prepare verificó paquete/fuente/build; journal y lock ausentes antes del ensayo.
Node habilitado temporalmente solo r215 y gate C# habilitado para este envío.
Helper temporal SHA256
`a94c5025b8a7f9e8f2302e7ae9f95e854326925c7eaa76a8aeaa54179d641c2e`.
Copias privadas de helper/build/CLI/Probe archivadas; no ejecutar esas copias.

Un comando `node tools/pc-static-watchface.mjs install r215`:
RegisteredInactive,14partes,28.430bytes de stream con cabeceras,28.957bytes TX,
23frames TX/16RX. Registro propio verificado/eliminable, esfera anterior activa,
selectedByClient=false. Socket cerrado y worker terminado, exit0/sin error nativo.
transferAcceptanceVerified=false: no se deduce un ACK final explícito ni ejecución
del runtime por ese campo. Modelo/FW reconocidos por el preflight requerido.

Ambas fuentes de habilitación se restauraron en finally y el helper cerrado se
reconstruyó SHA256
`d5e433352308720472131885fbeca97e8b942738082ffb9a87f382eaf4f643c4`.
Test de gates cerrados pasó sin llamadas a sockets. No SET, DELETE, C ejecutado
desde PC, reinicio, cambio de vínculo o firmware.

## Consulta independiente

Después del cierre, una consulta `node tools/pc-rfcomm.mjs watchfaces`:
Complete, HMAC/ACK/cifrado válidos,15esferas/una activa. Comparación contra las
14filas previas del journal: IDs/active/canDelete conservados; solo NativeLog
añadida, inactiva y eliminable. Activa365210175 sin cambio; FirstC2 almacenada
e inactiva. Journal Registered/14partes/sin lock. Socket/worker cerrados, exit0.

Reportes privados en artifacts/native-log-r216-authorized: install-report.json,
inventory-report.json y comparison.json. GET transcrito desde su único resultado
sanitizado, sin segunda consulta. No claves/MAC/serial/logs crudos publicados.

## Historial: observación pendiente después de instalar

Se pidió seleccionar NativeLog (cinco barras cian), comprobar cinco indicadores
grises y etiquetas FILE/MARK/C TEXT/UNLOAD/END; pulsar RUN C una sola vez si la
interfaz está correcta; comunicar colores y volver a habitual desde Ajustes.
END rojo inicial, etiquetas ausentes o fallo: no pulsar/repetir, describir estado.

La instalación solo prueba almacenamiento/registro. **Todavía no demuestra
lectura/escritura desde este C, carga/retirada del nuevo módulo ni retorno de UI.**
FirstC2 mínimo ya probado no valida las cinco nuevas APIs. Privilegios, memoria,
ABI completo y recuperación integral siguen sin determinar. No nuevos comandos
físicos mientras se espera esta observación.

## R217 — cinco verdes comunicados por el usuario

Respuesta al ensayo: «file, mark, ctext, unload, end todo en verde. se conserva
movimiento y pueduo cambiar de esfera». Se interpreta C TEXT como la tercera
fila del paquete NativeLog fijado, no como salida stdout. El usuario confirma
navegación/cambio; no identifica explícitamente qué esfera quedó activa al final.
No nueva selección, click o consulta remota necesarios para registrar el resultado.

| Fila verde | Condición de la fuente de producción |
|---|---|
| FILE | ELF1500bytes leído y comparado completamente contra el candidato fijado |
| MARK | Marca propia escrita/flush/cerrada, readback exacto y presencia independiente |
| C TEXT | Registro de rw4logr211 observado tras ausencia previa y lectura del mensaje exacto RW4_C_FILE_R214 más newline del archivo creado por C |
| UNLOAD | rmmod propio retornó y lsmod reconocido confirmó ausencia propia |
| END | Controller Complete: mensaje/carga/retirada/capturas y limpieza verificados |

La UI solo pinta la tercera fila verde con load_observed y message_verified.
El adapter Lua no fabrica el mensaje: lee el archivo; solo file-r214.c crea
ese contenido durante su inicializador. La inspección previa del loader y la
ausencia antes de cargar vinculan el resultado al ELF revisado. Las cinco
APIs fopen/fread/fwrite/fflush/fclose y los siete relocations ABS32 funcionaron
para este payload/ruta/contexto en M2315W1/2.2.86. Es evidencia instrumental
de C propio con I/O real y retirada, sin reemplazar firmware ni abrir el reloj.

Según los guards del carrier, rw4minr197/rw4minr202/rw4logr211 estaban ausentes
en el inventario final reconocido; no se descargaron módulos anteriores/ajenos.
Lua retiró el archivo de salida y las capturas propias; la marca del intento
permanece. No abrir/rearmar NativeLog para otra ejecución. Paquete/ELF almacenados
no significan módulo residente; esta prueba de un intento no valida relanzar Doom.

Evidencia: colores comunicados y lógica/fuentes fijadas, sin dump físico crudo,
foto, traza CPU o medición de RAM/heap. El resultado no prueba aislamiento,
recuperación integral, generalidad ABI/APIs, exclusión concurrente de wbx,
durabilidad por reboot/powerloss, display/touch desde C, temporización, memoria
suficiente para Doom ni ausencia de fugas/corrupción latente. Navegación normal
es una observación funcional, no un diagnóstico completo del sistema.

Al registrar R217 solo se editaron documentos en PC; cero operaciones de
Bluetooth, nuevos archivos enviados, C ejecutado, DELETE, reset o firmware.
Gates cerrados. Siguiente checkpoint PC: preparar un patrón de imagen generado
por C y presentado desde Lua/LVGL stock, conservando salida y retirada; cualquier
nuevo ensayo físico requiere su plan concreto y autorización.
