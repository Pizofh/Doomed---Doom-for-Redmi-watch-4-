# R142 — revisar el componente Bluetooth de este teléfono

## R144 — fallo del exporter identificado y estrategia acotada

El usuario aporta stage=PACKAGE_PATH_REFUSED, usbState=device, una ruta y
metadata privada guardada. Revisión PC: el APK devuelto está dentro de
`/apex/com.android.bt/app/Bluetooth@<build>/Bluetooth.apk`. El parser omitía
el sufijo de build del directorio. **Error de validación propio**, no rechazo
Bluetooth, fallo de autorización USB ni paquete ausente en esta consulta.
No modifica/explica todavía el EOF del socket al reloj.

Corregido el patrón únicamente para directorio Bluetooth/BluetoothGoogle
con sufijo @build ASCII acotado; se mantienen módulo APEX fijo, rechazo de
traversal/caracteres de shell, base única y selector de paquete fijo. Regresión
con la forma exacta observada y casos negativos pasa. No pull/ADB real por el
agente. La copia ahora puede intentarse con el comando export-bluetooth del
plan inferior; no repetir diagnose-bluetooth ni borrar su metadata.

El usuario pide cambiar de estrategia tras demasiadas iteraciones. Decisión:
no seguir variaciones HCI/logging ni nuevas APKs solo de instrumentación. Una
revisión offline del componente, si se completa la copia, debe aportar una
corrección/ruta concreta; si no, registrar el límite y cambiar de vía. No
convertir cada incógnita en otra prueba física.

Se preparó [consulta técnica para upstream](upstream-connection-question.md),
sin enviar/publicar. RW4 continúa experimental/cobertura desconocida en su
documentación. No suponer que una actualización disponible arregla el fallo
ni instalar el cliente completo con envíos automáticos de configuración.

Alternativa de otro host (PC o Android prestado): potencialmente separa el
problema HyperOS, pero compatibilidad, transporte y necesidad/efectos de un
nuevo vínculo no demostrados. Usuario no tiene otro teléfono disponible.
Inventario CIM del radio PC fue denegado en sandbox; disponibilidad desconocida,
no equivale a ausencia y no se solicitaron permisos para esa rama opcional.
No iniciar pairing, migración/reset o transferencia hasta plan/decisión expresa.

Checkpoint recomendado: compatibilidad real del enlace, combinando el último
análisis offline acotado y evidencia upstream. Firmware/nativo/instalación en el
reloj siguen pendientes aunque se resuelva Bluetooth; no prometer Doom físico
como consecuencia automática de abrir SPP.

## R143 — exportación fallida, causa aún no identificada

El usuario recibe el aviso genérico de exportación fallida y confirma Bluetooth
encendido/depuración USB activada. Esto no prueba autorización USB efectiva,
presencia del paquete ni ruta aceptada. PC: carpeta de exportación ausente y
los tres hashes ADB coinciden con los pins; no copia/partial local encontrados.
No ADB real ejecutado por el agente. No afirmar todavía cuál fue el error.

El mensaje original era demasiado genérico. Se prepara un diagnóstico completo
de la fase anterior a la copia, sin repetir `pull` ni abrir Bluetooth:

```powershell
node tools/export-mi-fitness-apk.mjs diagnose-bluetooth
```

Solo `adb -d get-state` y, si autorizado, `adb -d shell pm path com.android.bluetooth`.
Reporta estado USB, stage del fallo y aceptación/unicidad de la ruta. No copiar
APK ni ejecutar/instalar nada. No variantes de paquete ni fallback automático.
Si pm devuelve rutas APK, conserva únicamente esa metadata de software en
`tools/local/phone-bluetooth-diagnostic-r143/package-path-metadata.json`, privado
e ignorado. No logs, datos de usuario o nombres/rutas al JSON mostrado. La
metadata permitirá revisar offline una ruta rechazada antes de ampliar el
parser; no relajar validación por conjetura. No overwrite ni repetición cuando
ya existe metadata. Errores no reconocidos se descartan.

No cambios de configuración, permisos, vínculo, radio o reloj. Mi Fitness puede
seguir abierta. Restauración: desactivar depuración USB si se activó para esto.
Mismo alcance de lecturas USB del plan inferior; fallo razonable lectura fallida,
timeout o escritura local de metadata, sin recovery del reloj requerido por
estos comandos. Tests fake-ADB pasan (una/dos lecturas, error unauthorized,
paquete vacío, formato desconocido, rutas aceptadas/rechazadas, privacidad y
refusal antes de USB si hay metadata). Resultado real pendiente.

2026-10-11. La consulta R141 no encontró configuración exportable: build user,
dos propiedades sin valor explícito y tres archivos inexistentes. Ya tenemos
APK Mi Fitness y Mi Connect Service; falta identificar el componente Bluetooth
instalado. El análisis será estático, antes de proponer un cambio de conexión.

La [ficha actual del proyecto Gadgetbridge](https://gadgetbridge.org/gadgets/wearables/xiaomi/#redmi-watch-4)
mantiene RW4 como experimental con cobertura desconocida. Su
[guía de conexión Classic](https://gadgetbridge.org/basics/topics/xiaomi-protobuf/#multiple-connection-types)
no aporta por sí sola una corrección a nuestro ensayo: el cliente revisado ya
utiliza Classic/SPP. No repetir el mismo transporte ni reconstruir la app por
un cambio de instrumentación. Codeberg no accesible desde la herramienta web
por robots; no afirmar que se revisaron sus issues/cambios actuales completos.

## Copia propuesta

Mantener Mi Fitness normal y HCI inhabilitado. Teléfono por USB con depuración
normal autorizada, sin extras. En el repo:

```powershell
node tools/export-mi-fitness-apk.mjs export-bluetooth
```

Comandos exactos del ADB37.0.1 existente, con hashes fijados:

```text
adb -d get-state
adb -d shell pm path com.android.bluetooth
adb -d pull <APK base devuelto por pm y validado> <REPO>/tools/local/phone-bluetooth/Bluetooth-base.apk.partial
```

Solo ese paquete fijo. Se admiten rutas de aplicaciones de sistema ya validadas
y rutas APK Bluetooth dentro de APEX `com.android.bt`/`com.android.btservices`,
incluyendo versión numérica montada. Validación de gramática/traversal, argv
directo sin shell, un APK base inequívoco, límite256MiB, no overwrite y no
fallback si falta paquete o acceso. No copiar un APEX completo ni buscar nombres
de paquetes alternativos automáticamente.

Destino final privado/ignorado:
`tools/local/phone-bluetooth/Bluetooth-base.apk`. Se guarda hash/tamaño y estado
de copia en export-review.json. Nombres/rutas del teléfono no se imprimen.
Manifest/firma son verificaciones posteriores, no ya completadas al copiar.
No publicar el APK ni ejecutarlo. No instalar/abrir/actualizar/deshabilitar el
componente. El APK puede no contener las bibliotecas nativas de la pila; no
prometer que su revisión resuelva por sí sola el fallo o la ruta HCI.

## Alcance, riesgo y restauración

Lecturas del software instalado en el teléfono y escritura de una copia en el
PC. No se leen datos privados de usuario, vínculos/claves, contactos o salud.
Sin comandos al reloj, Bluetooth, logging, permisos de apps, particiones,
bootloader o firmware. Posible inicio del servidor ADB local y diagnóstico
interno Android; no prometer cero escrituras internas del teléfono.
USB autorizado puede persistir: desactivar/revocar si se habilitó para esto.

Peor fallo razonable: USB no autorizado, paquete ausente, lectura denegada,
timeout120s, poco espacio o archivo parcial local. No retry/delete/root ni
modificación para resolverlo. Dejar Mi Fitness abierta; no se requiere reboot
ni desvinculación. Ningún mecanismo previsto para brickear el reloj mediante
estas lecturas; su recovery integral y gate nativo/instalación siguen sin validar.

Antes de analizar el código: revalidar hash/tamaño, firma y manifest con SDK
oficial ya instalado; identificar versión/package. Luego inspeccionar de forma
acotada manejo de sockets y registro. No interpretar strings aislados como
prueba de ruta ejecutada. No inferir compatibilidad nativa M2315W1 desde código
arm64 del teléfono.

Default y plan-bluetooth no ejecutan ADB. Tests fake-ADB pasan: comandos exactos,
APEX permitido solo para este selector, rutas privadas/traversal/APEX ajeno
rechazados, sin raw ni overwrite/fallback. No ADB real por el agente ni copia
del componente realizada todavía.
