# R198 — FirstC instalada; ejecución C pendiente de observación

2026-10-13. El usuario respondió «si» a la revisión del
[plan R198](first-c-physical-plan-r198.md), que solicitaba autorización del único
ensayo y presencia junto al reloj con batería≥50%. No permiso para Doom,
firmware, otra carga nativa o reintentos. La batería no se consultó por protocolo.

## Preparación y único envío

FirstC, ID365219996,22.500bytes. SHA256 del paquete:
`bf3bfbd4147ed27527fc7659aac0098472252016725af6ef2750e86cd2f5cbf9`.
Prepare verificó paquete, fuente y build. El journal exclusivo no existía.
Gates habilitados temporalmente: Node solo perfil r197; helper revisado SHA256
`a6404d9d00c6c5377cef4a7fa8ac9a8389b61c75a911e4d8eedd0a16d922f924`.
Copias privadas del helper/build/CLI/Probe y reportes sanitizados archivadas
en artifacts/first-c-r198-reviewed; no ejecutar esas copias directamente.

Un comando: `node tools/pc-static-watchface.mjs install r197`.
Preflight autenticado exige modelo reconocido y firmware2.2.86; catálogo previo
con16entradas. Resultado RegisteredInactive: doce partes,22.574bytes de stream
con cabeceras,23.071bytes TX,21frames TX/16RX. Registro propio eliminable,
selección anterior conservada y selectedByClient=false. Socket cerrado y worker
terminado, exit0, sin error nativo. transferAcceptanceVerified=false sigue sin
demostrar ACK final explícito o ejecución de la esfera.

No activación automática, SET, DELETE, cambio de vínculo, reset o modificación
de firmware. Este envío almacena el ELF como dato con la esfera; no ejecuta C.

## Cierre e inventario independiente

Se restauraron los gates Node/C# inmediatamente después del envío y se
reconstruyó el helper. SHA256 cerrado actual:
`f64ead8b42f5872198ac0aaa52cafba5bf2cd22e75bbc0fd95a347af0b8fec44`.
`node tools/test-static-watchface-gates.mjs` confirmó cierre, sin sockets.

`node tools/pc-rfcomm.mjs watchfaces` devolvió Complete, HMAC/ACK/cifrado
válidos y catálogo17entradas. Comparación independiente contra el journal:
las16entradas anteriores conservan exactamente IDs/active/canDelete;
FirstC aparece inactiva y eliminable. La activa sigue siendo365210175.
Segundo socket cerrado y worker terminado, exit0. Journal Registered,
doce partes, sin lock restante. No nuevos datos de batería/FW en este GET.

Reportes install-report.json, inventory-report.json y comparison.json privados
en artifacts/first-c-r198-reviewed. No claves, direcciones o paquetes crudos
publicados. Fuentes temporales de habilitación restauradas, árbol Git sin
cambios en herramientas o C#.

## Observación pendiente

Se pidió al usuario seleccionar FirstC una vez, comprobar cinco indicadores
grises y RUN C, pulsar una sola vez únicamente si la UI inicial es correcta,
informar FILE/MARK/LOAD/UNLOAD/END y volver a la esfera habitual desde Ajustes.
Ante ENDrojo/amarillo inicial o fallo de UI: no pulsar/repetir.

**No se ha recibido aún una observación física de Lua, carga C o retirada.**
No afirmar ejecución a partir del transporte. No repetir instalación/carga,
borrar la marca/esfera o hacer unload remoto ciego mientras falta el resultado.
La revisión del contexto potencialmente privilegiado y la falta de recovery
integral siguen siendo limitaciones del ensayo.
