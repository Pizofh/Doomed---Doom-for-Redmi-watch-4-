# R203 — FirstC2 instalada; ejecución manual pendiente

2026-10-13. El usuario respondió «adelante» al
[plan R203](first-c-corrected-physical-plan-r203.md), que solicitaba revisión del
único ensayo y presencia junto al reloj con batería≥50%. No permiso para otro
payload, firmware, reintentos o retirada del módulo anterior. Batería no consultada
por el protocolo; presencia/batería se solicitaron como precondiciones al usuario.

## Único envío aprobado

FirstC2 ID365219998,24.736bytes, SHA256
`7229a104de8cc8031ab3e689e0b11564b371aa55a7d2c3182a28d3d3710e4e67`.
Prepare verificó paquete, fuente y build; journal/lock nuevos ausentes.
Node habilitado solo r202 y helper temporal revisado SHA256
`c166433a30d558850d99483b6d83b5deac906039953ceaade8b75848ce71b7dc`.
Copias privadas helper/build/CLI/Probe archivadas en artifacts/first-c-r203-reviewed;
no ejecutar esas copias directamente.

Un comando: `node tools/pc-static-watchface.mjs install r202`.
Preflight autenticado exige modelo reconocido y firmware2.2.86, con15esferas
en ese momento. RegisteredInactive:13partes,24.814bytes de stream con cabeceras,
25.326bytes TX,22frames TX/16RX. Propia eliminable, selección anterior conservada,
selectedByClient=false. Socket cerrado, worker terminado, exit0 y sin error nativo.
transferAcceptanceVerified=false conserva el límite: no ACK final explícito ni
validación del runtime inferidos de ese campo.

No activación por PC, SET, DELETE, cambios de vínculo, reset o firmware.
El ELF está almacenado con la esfera como dato; su carga exige un toque manual.

## Cierre y GET independiente

Gates Node/C# restaurados inmediatamente después del envío, antes del GET.
Helper cerrado reconstruido SHA256
`a9c232582c008c21c0ac47b599346d36a7e3ed7e130d312d9ebca66134a0c923`.
Entradas cerradas comprobadas con test sin sockets.

`node tools/pc-rfcomm.mjs watchfaces`: Complete, HMAC/ACK/cifrado válidos,
catálogo16esferas. Comparación contra el snapshot del journal actual:
las15esferas previas conservan IDs/active/canDelete; FirstC2 inactiva/eliminable.
FirstC365219996 sigue almacenada e inactiva. Activa365210175, sin cambio.
Segundo socket/worker cerrados, exit0. Journal Registered,13partes, sin lock.
El catálogo ya tenía15 antes de este ensayo; diferencias con snapshots históricos
no se atribuyen al nuevo envío. No batería/FW nuevos en este GET.

Reportes sanitizados install-report.json, inventory-report.json y comparison.json
privados bajo artifacts/first-c-r203-reviewed. Sin claves/MAC/serial/paquetes crudos
publicados. Fuentes temporales de habilitación restauradas, sin cambios pendientes
en herramientas o C#.

## Observación pendiente

Se pidió seleccionar FirstC2 (no FirstC), comprobar etiquetas y cinco indicadores
grises, pulsar RUN C una sola vez y comunicar FILE/MARK/LOAD/UNLOAD/END.
Si END rojo inicial, etiquetas ausentes o UI falla: no pulsar ni repetir.
Después volver a habitual desde Ajustes y comprobar menús/pulsación larga.

**No observación física de UI, carga C o retirada recibida todavía.** No afirmar
éxito nativo por instalación. No nuevo envío, rearmar/borrar marca, abrir FirstC
anterior o rmmod remoto ciego. El guard de rw4minr197 y las limitaciones de
privilegios/recovery del plan siguen aplicando al toque autorizado.
