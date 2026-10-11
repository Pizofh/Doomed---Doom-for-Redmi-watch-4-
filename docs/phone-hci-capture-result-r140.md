# R140 — captura copiada, registro configurado, paquetes no disponibles

2026-10-11. El usuario completó el único PROBE y `collect-capture` autorizados.
También confirmó: «Sí, todo restaurado y funciona». HCI deshabilitado, permiso
de Mi Fitness restaurado y sincronización/reloj normales, según su respuesta.
El agente solo revisó la copia del PC; no ejecutó ADB ni abrió Bluetooth.

## Intento y retorno

App r131, API36, P00 y caché B01/T01/S01. Secuencia:
`D01 > D02 > D03 > D18 > D04 > E03 > D17 > D13`.
Tiempos desde solicitud: 0/103/111/113/114/643/650/658 ms. La llamada de apertura
tardó aproximadamente 529 ms; fallo G08/R02/L01, sin solicitud de cierre local
previa. No D05, autenticación, evaluación de clave ni consultas Xiaomi.
El inventario r114/40 callbacks/16132 ms que acompaña al informe es histórico.
No constituye un nuevo inventario ni prueba de canal remoto.

El JSON del usuario confirma copia privada y cabecera ZIP reconocida. No
confirmaba contenido HCI: `archiveContentReviewed=false`, `hciIncluded=null`.

## Revisión local

Comandos reproducibles, solo PC y sin extraer archivos:

```powershell
node tools/inspect-phone-hci-report.mjs inventory-capture
node tools/inspect-phone-hci-report.mjs review-capture
```

El archivo contiene 13184 entradas. Se ignoran 79 anomalías de nombres ajenos
a las entradas permitidas sin abrirlas. Se revisaron dos archivos SNOOZ de
16 bytes: ambos son BTSNOOP v1/HCI UART1002 válidos, con **cero registros**.
CRC y longitud de las entradas seleccionadas coinciden. Esto no verifica la
integridad/autenticidad de todo el ZIP.

El texto principal no contiene resumen inline BTSNOOP_LOG_SUMMARY. Un scanner
estricto encuentra una línea exacta de la propiedad Bluetooth:
`persist.bluetooth.btsnooplogmode=full`. Esto confirma el valor registrado en
ese informe, **no** que la pila aplicara el modo ni que guardara/exportara
paquetes durante el intento. No atribuir el resultado a un error del usuario.

La búsqueda por nombres de entrada no encuentra otros candidatos con
`btsnoop`, `btsnooz` o `hci_snoop`/`hci_log` en su basename. Solo es una
heurística de metadata; nombres vendor desconocidos o archivos anidados
pueden quedar fuera. Ninguna ruta desconocida se abrió automáticamente.

Los tags nativos exactos y formatos brief/threadtime admitidos por el scanner
tampoco producen registros reconocidos. No demuestra ausencia de mensajes
en otros tags/formatos/archivos. No se obtuvo motivo PORT_* atribuible.

No payloads, claves, direcciones, nombres privados, texto general del informe
o archivos extraídos se guardaron/exportaron como resultado. El ZIP privado
original permanece ignorado por Git.

## Lector y fuentes

Se añadieron conteos de nombres HCI alternativos sin seleccionar su contenido,
la lectura de cuatro valores enumerados de una propiedad exacta y conteos de
mensajes nativos Bluetooth reconocidos. No se exportan mensajes ni se atribuyen
conteos globales a nuestra app. Tests sintéticos de privacidad, formatos,
propiedad dividida entre bloques y rechazo de otros tags/valores pasan:

```powershell
node tools/test-phone-hci-inventory.mjs
node tools/test-phone-hci-review.mjs
```

[AOSP documenta](https://source.android.com/docs/core/connect/bluetooth/verifying_debugging)
activar HCI y reiniciar Bluetooth, y sitúa normalmente los logs bajo
`data/misc/bluetooth/logs`. El
[SnoopLogger Android16](https://android.googlesource.com/platform/packages/modules/Bluetooth/+/refs/heads/android16-release/system/gd/hal/snoop_logger.cc)
consultado usa la propiedad exacta anterior. No son pruebas de implementación
idéntica de HyperOS3.0.302.0.

La búsqueda de fuentes primarias Xiaomi no identificó una ruta/exportación
documentada para esta build. La
[guía Mi Box](https://www.mi.com/sg/support/article/KA-07022/) pertenece a otro
dispositivo; no justifica repetir capturas ni aplicar pasos específicos a este
teléfono. No utilizar herramientas comunitarias con root para extraer logs.

## Decisión y siguiente checkpoint

**La copia fue exitosa; el diagnóstico de la causa sigue inconcluso.** No
modificar la conexión por conjetura, reconstruir otra APK de instrumentación,
repetir PROBE/bugreport o pedir un nuevo cambio de clave. Conservar la captura
privada por si una ruta documentada permite revisar un componente ya incluido.

Siguiente checkpoint: determinar un mecanismo de obtención del registro
Bluetooth efectivo para esta build de HyperOS, antes de proponer otra prueba
física. Cualquier procedimiento nuevo debe precisar datos recogidos y
restauración; no root, unpair/reset, cambios de servicio del sistema o firmware.
La ejecución nativa y la instalación en el reloj siguen sin autorización ni
ABI/privilegios/recovery demostrados.
