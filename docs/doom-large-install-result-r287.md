# R287: primer envío grande detenido antes de MASS; parser corregido

El usuario autorizó un único envío R285 y confirmó disponibilidad para observar.
El intento se ejecutó; no se repitió. Resultado:

| Campo | Resultado |
|---|---|
| INSTALL | status0, aceptado |
| Fase al detenerse | UploadIntent |
| Error | MalformedProtocol |
| Control enviado | 7frames,277bytes |
| Partes MASS intentadas/escritas | 0 |
| Registro/archivos remotos verificados | No |
| Cierre / salida del worker | Confirmados, exit0 |
| Gates Node/C# | Restaurados a false en finally, recompilados y verificados |
| Observación del usuario | Esfera y menús normales |

INSTALL puede reservar estado persistente aunque no se hayan enviado bytes del
archivo. No afirmar «ningún cambio en flash». Tampoco afirmar que el paquete
quedó instalado o que el receptor lo rechazó: la petición inicial fue aceptada.

## Defecto encontrado

El uploader grande exigía MD5, offset y chunk en la respuesta. La copia local
revisada de `xiaomi.proto`, SHA256
`1227aa35991c3cbae08e3a4d6317fefa020827ff82a2bb3dfc63da1432331611`,
declara opcionales los cuatro campos de DataUploadAck. La implementación
`XiaomiDataUploadService.java`, SHA256
`5cb3f33ab47e3143d53653dd1e7d91c3eca6fba7897a846c564e8df9e533c674`,
usa2048cuando falta chunk y getters numéricos cuyo default es0. Son copias en
`artifacts/research/gadgetbridge-source/`, no source exacto del firmware RW4.
El instalador pequeño ya aceptaba varios de esos campos ausentes.

Este defecto reproduce el mismo error en PC y es una explicación razonable del
fallo físico. **No se capturó la presencia de campos en aquella respuesta**:
no sabemos cuál faltó ni descartamos otra diferencia del protocolo.

Nuevo parser `doom-upload-ack.mjs`: envelope autenticado/cifrado22/0 y submensaje
ACK obligatorios; campos opcionales con defaults stock. MD5 presente debe ser
16bytes y coincidir. Para envío fresco solo offset0; tipo/duplicados/chunk no
admitidos se rechazan. Resume sigue exigiendo MD5 y offset explícitos, además
de los límites del journal. Si falta MD5 en un envío fresco, se informa que no
hubo eco; el request/stream siempre incluyen MD5 local. No es verificación de
contenido remoto. Diagnóstico nuevo guarda solo etapa/presencia de campos y
parámetros no sensibles; sin paquetes crudos, MAC o claves.

39casos pasan:16combinaciones de presencia, errores de tipo/duplicación/hash,
resume incompleto y dos sesiones completas sintéticas con ACK mínimo/default.
No motor Doom, conexión física o actualización del paquete en esos tests.

## Reintento acotado preparado, no ejecutado

El journal real conserva las cuatro entradas firmadas:
Created → InstallIntent → UploadIntent → Uncertain, todas con upload=null.
Se comprobó firma/identidad/elegibilidad en una copia ignorada del journal,
usando la clave local sin imprimirla. Original idéntico después del dry run.
No se creó un worker ni se conectó al reloj para esa comprobación.

Acción nueva `retry-no-data`: solo admite attempt1 con exactamente esas fases,
mismo destino/clave/ID/hash/tamaño y ningún estado Uploading o batch de envío.
Conserva las entradas originales y añade attempt2 al mismo archivo. Cualquier
posible MASS, otro patrón, cadena incompleta o segundo reintento bloquea la
acción. Exige gate separado `PHYSICAL_CONTROL_RETRY_REVIEWED=false`.
No habilita resume ni elimina locks, cachés, journals o esferas.

18casos pasan con firmas reales y peers sintéticos, incluido un segundo envío
completo tras fallo de control. Gates de install/resume/retry-no-data/C# pasan
cerrados. Los tests guardan fixtures en artifacts ignorados. Se mantiene el
paquete R285 exacto con native=false. [Plan pendiente](doom-large-install-control-retry-plan-r287.md).
