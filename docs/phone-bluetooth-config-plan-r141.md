# R141 — identificar configuración del registro sin repetir la conexión

## Resultado R142, 2026-10-11

El usuario completó la consulta: buildType=`user`, configuredSnoopMode=`UNSET`,
legacyPathProperty=`UNSET`; los tres candidatos config devolvieron `NOT_FOUND`.
Consulta completada, sin fallo del script ni lectura de configs disponible.
UNSET significa respuesta vacía de getprop, no ausencia de Bluetooth o del
mecanismo de logging. No confirma logging efectivo deshabilitado; el estado
original restaurado fue confirmado por el usuario en R140. No volver a activar
HCI ni repetir PROBE. No nuevo retorno funcional informado específicamente
después de estas lecturas, y no se solicitaron cambios de estado.

La ruta de exportación y la causa de EOF siguen sin identificar. La build user
coincide con la condición que bloquea el socket live en el código AOSP revisado;
no demuestra que el binario HyperOS sea idéntico. No inferir necesidad de root.
[Siguiente revisión del componente instalado](phone-bluetooth-apk-plan-r142.md)
preparada, sin APK nueva, captura, vinculación o ejecución de software copiado.

Las secciones siguientes son el plan histórico anterior al resultado.

2026-10-11. Investigación y herramientas PC terminadas; consulta del teléfono
todavía no realizada. Se conserva el retorno normal confirmado en R140.

## Lo aprendido

La metadata del ZIP nuevo no contiene `bt_stack.conf` en las tres rutas
candidatas del lector, entradas bajo `FS/data/vendor/bluetooth/`, ni archivos
anidados zip/gz/tar reconocidos como Bluetooth por su nombre. Son búsquedas
acotadas, no prueba de ausencia en todas las rutas vendor. No se abrieron
archivos desconocidos ni datos de otras apps.

El código primario
[ParameterProvider Android16](https://android.googlesource.com/platform/packages/modules/Bluetooth/+/refs/heads/android16-release/system/gd/os/android/parameter_provider.cc)
devuelve `/data/misc/bluetooth/logs/btsnoop_hci.log` por defecto y permite
override interno. El archivo descargado como texto, sin ejecutar, tiene SHA256
`0e3c8a0308b6e5ce46b77433bc10fd5d5a0283fe29fb5140d2f800ee24176556`.
La descarga inicial falló por red del sandbox; la repetición fuera del sandbox
fue autorizada y exitosa. No herramientas nuevas instaladas.

El [SnoopLogger Android16](https://android.googlesource.com/platform/packages/modules/Bluetooth/+/refs/heads/android16-release/system/gd/hal/snoop_logger.cc),
fuente local ya verificada, condiciona la creación del socket de captura a que
`ro.build.type` sea distinto de `user`, citando revisión de seguridad pendiente.
No proponer Wireshark/forward8872 como mecanismo soportado para este teléfono
sin evidencia de su implementación. Esto es código AOSP, no binario HyperOS
identificado; la consulta siguiente puede confirmar el tipo de build, no la
equivalencia de la pila.

La documentación Xiaomi localizada describe bugreports de Mi Box o análisis
de crashes de apps; no se encontró una ruta HCI específica para HyperOS3.0.302.0.
No activar códigos de marcador ni servicios de logging vendor por consejos de
otros modelos. No actualización de Android, root o instalación de Wireshark
necesarios para esta consulta.

## Consulta manual preparada

Con Mi Fitness normal, HCI deshabilitado y depuración USB normal autorizada,
ejecutar una vez en el repo:

```powershell
node tools/phone-bluetooth-config.mjs collect
```

Solo ejecuta estos comandos del ADB37.0.1 ya revisado, con sus tres hashes
fijados. No shells compuestos ni argumentos derivados de respuestas:

```text
adb -d get-state
adb -d shell getprop ro.build.type
adb -d shell getprop persist.bluetooth.btsnooplogmode
adb -d shell getprop persist.bluetooth.btsnooppath
adb -d shell cat /vendor/etc/bluetooth/bt_stack.conf
adb -d shell cat /system/etc/bluetooth/bt_stack.conf
adb -d shell cat /etc/bluetooth/bt_stack.conf
```

Las tres rutas son candidatos estáticos, no presencia/compatibilidad demostrada.
La propiedad de path es una pista histórica; no se asume utilizada por la pila
actual. Solo se retienen categorías de ubicación y los campos BtSnoopFileName /
BtSnoopLogOutput si aparecen; no se abre `bt_config.conf` con vínculos/claves.
`DENIED`/`NOT_FOUND` se reportan sin intentar root, cambiar permisos o buscar
directorios privados. No se lee el archivo que indique la configuración.
El contenido de config y mensajes de error se descartan, sin raw ni paths
desconocidos exportados. El modo de logging se informa, no se modifica.

Este script no consulta batería, autentica, abre sockets, acciona Bluetooth,
reinicia servicios, detiene Mi Fitness ni genera otro bugreport. No requiere
APK nueva. Default/plan no ejecuta ADB. Salida final: JSON saneado, no archivo
privado nuevo ni logs. El agente no ejecutará collect sobre el teléfono.

## Efectos, reversión y límites

Componente afectado: lecturas USB de propiedades/configuración del teléfono.
No comando al reloj ni escritura explícita de almacenamiento/particiones,
bootloader o firmware. ADB puede iniciar su servidor local y Android mantener
su diagnóstico interno; no se afirma ausencia absoluta de escrituras internas.
La autorización USB, si se habilita, es persistente hasta revocarla.

Peor fallo razonable de los comandos propuestos: lectura denegada/inexistente,
desconexión USB o timeout15s por comando. No reintentos ni fallback. Dejar Mi
Fitness abierta; no cambiar permisos/Bluetooth. Desactivar depuración USB si
se activó para esto. No se prevé una vía de brick mediante estas lecturas;
no implica recovery integral del reloj, que sigue sin validar.

Las rutas/propiedades declaradas no prueban que se aplicaron ni que el archivo
pueda exportarse. Si solo hay valores ausentes/denegados, registrar ese límite,
no repetir PROBE ni pedir privilegios para resolverlo. El gate de ejecución
nativa/instalación/firmware del reloj permanece cerrado.

Tests fake-ADB pasan: comandos exactos, valores/categorías permitidas, claves
canario no exportadas, conflictos, paths traversal, límites y default sinADB.
Comando: `node tools/test-phone-bluetooth-config.mjs`.
