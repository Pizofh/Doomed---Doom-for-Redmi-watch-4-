# R166 — consulta de inventario de esferas; sin instalación

Estado previo: [sesión Xiaomi v1 completa en RW4](windows-xiaomi-success-r166.md),
menús normales, teléfono BT apagado, vínculo Windows conservado. No repetir
pairing ni borrar el registro Mi Fitness. Objetivo: lista de IDs/marcas para
preparar después un paquete propio sin colisiones y estudiar retirada.

## Comando manual único

Desde la raíz del proyecto, con el MISMO vínculo:

```powershell
node tools/pc-rfcomm.mjs watchfaces
```

El agente no ejecuta este comando físico. Hasta aproximadamente un minuto por
supervisor, sin retry. Devolver solo JSON; conservar PC durante revisión del
bloque. Si reloj vuelve a QR, reportarlo antes de cambiar vínculos.

## Qué hace y cómo se comprobó

Negociación/auth igual al cliente ya probado. Requiere HMAC válido y ACK antes
de un único GET(type4/subtype0). No repite batería/info en este modo. Exige
respuesta cifrada e integridad CCM en V1; límites/cleanup existentes. El modo
session anterior mantiene su comportamiento.

Fuente local: XiaomiWatchfaceService.requestWatchfaceList en el worktree de
Gadgetbridge usado para diagnóstico: COMMAND_TYPE=4, CMD_WATCHFACE_LIST=0.
xiaomi.proto: Command.watchface=6, Watchface.watchfaceList=1, lista repetida=1;
WatchfaceInfo id=1/name=2/active=3/canDelete=4. Es evidencia de cliente de familia,
no GET físico de nuestro FW ya confirmado. No initialize completo de servicios.

Salida: watchfaces.count, activeCount, deletableCount, unknownIdCount y entradas
con id numérico uint32 normalizado, active y canDelete. Nombres, imágenes,
identificadores no reconocidos, MAC, seriales y claves no se publican. No raw
dump persistente. IDs no reconocidos se cuentan; faltantes/duplicados/booleans
inválidos se rechazan. Máximo128entradas y límites protobuf/bytes previos.

canDelete es una marca declarada por el firmware, no permiso para borrar ni
garantía de rollback. La lista no mide espacio libre ni RAM. Si unknownIdCount
no es cero, no tomar los IDs numéricos como inventario completo para una futura
instalación. Ningún paquete propio se declara compatible solo por esta consulta.

Whitelist amplía únicamente GET4/0; SET4/1, DELETE4/2, INSTALL4/4 y upload22
continúan rechazados. Nada de firmware/OTA, setters, reloj/hora, contactos,
imágenes/sensores, shell, ELF, módulos, ganchos o ejecución de watchface Lua.
Perfil desconocido se rechaza antes de crear el proceso/conectar.

Build final x64 nuevo que liga hashes de los módulos de protocolo; fuente C# del
transport no cambió. Artefacto local ignorado SHA256
5593fb2e2ba3b390a584f5423928bc818c9f7cdf9b62f94455028b9dc549a505.
Pruebas offline:144aserciones C#,22sesiones sintéticas protocolo (incluyen10del
inventario V1/V2, HMACbad/noACK/timeout/cleartext),4sesiones completas por IPC
falso y6fallos IPC existentes. Además parser vacío/IDs desconocidos/duplicados/
límites/booleans inválidos, privacidad y mutaciones bloqueadas. No llamadas de
radio/API nativa reales. Workflow previo ejecutará tests del módulo si se publica;
CI todavía no corrido. No instalaciones adicionales ni tests físicos del agente.

## Efectos y gate físico

| Campo | Evaluación |
|---|---|
| Unidad | M2315W1/2.2.86 reportados; v1/auth/modelo/firmware y menús demostrados en esta unidad |
| Componente | Cliente propio PC y servicio stock Xiaomi de inventario; GET4/0 aún no probado aquí |
| Persistencia | Consulta no solicita escribir archivos/seleccionar esferas; handshake puede guardar metadata interna como el anterior |
| Particiones/boot/firmware | Ninguna escritura cruda, flash o cambio de firmware solicitado |
| Reversible por reboot | La consulta no cambia esferas intencionalmente; no prometer reboot como reversión de metadata/bond |
| Revertir/cierre | Socket/worker cerrados después del GET; mantener Windows. Al acabar bloque, retorno habitual Mi Fitness; no re-pair por consulta |
| Peor fallo razonable | Query sin respuesta/protocolo distinto, auth fallida o bloqueo de pila stock; detener, no retry ni initialize completo |
| Soft/hard brick | No nuevo código de reloj ni upload; sin mecanismo directo de corrupción boot identificado, sin garantía absoluta frente a bugs stock |
| Recovery | Retornos Mi Fitness previos probados; recuperación integral de firmware no demostrada |
| Stop | HMAC/tag inválido, timeout, reporte malformado, cierre/worker no confirmado, QR/cuelgue; no instalación como fallback |

Esta prueba amplía el inventario mediante API existente; no autoriza posteriores
writes. Antes de instalar la primera watchface propia: paquete RW4 revisado,
ID sin colisión, tipos permitidos, rechazo de firmware, prueba de retirada y
plan físico explícito independiente. La primera no contendrá módulos nativos
ni Doom; loader y ABI reales siguen pendientes.
