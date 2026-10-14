# R216 — NativeLog instalada; prueba manual pendiente

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

## Observación pendiente

Se pidió seleccionar NativeLog (cinco barras cian), comprobar cinco indicadores
grises y etiquetas FILE/MARK/C TEXT/UNLOAD/END; pulsar RUN C una sola vez si la
interfaz está correcta; comunicar colores y volver a habitual desde Ajustes.
END rojo inicial, etiquetas ausentes o fallo: no pulsar/repetir, describir estado.

La instalación solo prueba almacenamiento/registro. **Todavía no demuestra
lectura/escritura desde este C, carga/retirada del nuevo módulo ni retorno de UI.**
FirstC2 mínimo ya probado no valida las cinco nuevas APIs. Privilegios, memoria,
ABI completo y recuperación integral siguen sin determinar. No nuevos comandos
físicos mientras se espera esta observación.
