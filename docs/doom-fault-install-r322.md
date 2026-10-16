# R322: DoomFault instalada inactiva; un arranque manual pendiente

**Actualización R323:** [FIRST24031607/LAST30031607/DIMS320x200](doom-fault-result-r323.md).
ERROR al liberar imagen durante renovación; vuelta/menús disponibles. Sin
segundo ciclo, JOIN o descarga confirmados. No repetir ni reabrir.

Usuario aprobó el [plan R321](doom-fault-physical-plan-r321.md) con «ok» y
confirmó reinicio normal, menús/corona normales, batería>=50% y disponibilidad
para observar. Un único envío completó **RegisteredInactive**, sin activación
desde PC. No repetir aprobación, envío o reinicio.

ID365219952,35060bytes, SHA256
`836cb01accfaf7a403c9629757ea8d5620586c140cd0cf8af4ae52d679718106`.
Modelo/firmware esperados; catálogo previo15entradas, nuevoIDausente y ambos
carriers requeridos presentes. InstallStatus0, ACKMD5correcto/offset0/chunk2048.
18partes,26frames,35724bytesTX. Cierre/worker confirmados; exit0. Registro
inactivo verificado por catálogo; contenido no extraído/autenticado. Ningún
C nuevo ejecutado desde PC; sin reintento/reanudación/borrado de esferas.

Finalmente se restauraron bytes originales de los gates y Probe.cs, todos
cerrados; worker recompilado SHA256
`24ab86192623cd548672d3631b7aebb0881bbd80f56440704bb0164ab86e0ec0`.
5589assertions sin sockets nativos y ocho escenarios de paquete/gates pasan.
Sin consulta física adicional redundante.

Artefactos privados ignorados:
`artifacts/doom-fault-physical-r322/{install-once.ps1,install-result.json,gates-restored.json}`.
Journal `tools/local/pc-rfcomm/doom-deployment/fault-r321.jsonl` EXISTE: no
borrar/recrear/reenviar. No MAC/claves/paquetes crudos publicados.

## Ensayo manual ya autorizado y solicitado

Seleccionar **DoomFault**, no DoomIO. Si READY, START una vez; mantener despierto
CHECKING con toques breves. Si ERROR, informar FIRST/LAST/DIMS sin repetir,
reabrir o pulsar EXIT. Si llega al juego, EXIT tras unos5s y observar CLOSED.
Volver desde Ajustes a la esfera habitual y confirmar menús/corona.
**No segundo ciclo.** Ante UI ausente, ERROR inicial o fallo de navegación,
no pulsar START y describir el estado. Conservar DoomIO953/ELF y DoomLauncher963/WAD.

FIRST/LAST tienen ocho dígitos: etapa/operación/errno/comando en grupos de dos;
DIMS tiene anchura/altura de cuatro dígitos,9999desconocido. El resultado aún
no se recibió: no afirmar retirada de rw4png318, carga de rw4png321, causa
inicial de3016 o corrección del render a partir de la instalación.
