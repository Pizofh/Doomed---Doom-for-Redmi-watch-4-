# R134/R135 — diagnóstico Bluetooth privado del teléfono

## Resultado R136,2026-10-11 — copia válida, historial disponible vacío

Usuario completa collect con privateReportSaved/headerRecognized=true, contenido
no revisado entonces, hciIncluded=null, sin radio/comandos reloj/configuración
logging solicitados. Agente analiza únicamente el ZIP local autorizado, sin ADB.

Archivo244,073,738bytes,13,173entradas y directorio central1,319,885bytes. Límite
inicial8192entradas rechazó el archivo; aumentado a32768 conservando límites de
bytes/formatos y probado con fixture13,173. Además hay nombres repetidos/colon
en entradas ajenas a Bluetooth: se ignoran sin abrir/extracción; unicidad y rutas
siguen estrictas para candidatos y texto principal. No interpretar ese rechazo
inicial como informe corrupto ni solicitar otra copia. Clasificación de errores
del lector ahora códigos Zxx fijos, sin nombres/rutas/mensajes privados.

Inventario reconoce un archivo SNOOZ de16bytes. Revisión seleccionada valida
cabecera BTSNOOPv1/HCIUART1002 y CRC/tamaño ZIP de las entradas revisadas:
**cero registros HCI**. Scanner del texto principal, en streaming, descarta texto
general y solo busca delimitadores BTSNOOP_LOG_SUMMARY: **ningún resumen inline**.
No se analizan campos de otras apps ni se exponen nombres/identificadores.
No archivos extraídos o payloads guardados/exportados. El ZIP completo permanece
privado/ignorado; integridad del archivo completo no comprobada, CRC no es firma.

No evidencia atribuible de la causa del fallo: este historial disponible está
vacío. No prueba que Bluetooth nunca funcione/registre, que el canal esté libre
o que la causa esté en el reloj. Sin otro PROBE/logging/ajustes por agente.

Lector: `node tools/inspect-phone-hci-report.mjs review` (solo PC). Pruebas PC:
test-phone-hci-inventory.mjs, test-phone-hci-review.mjs y test-phone-hci-report.mjs
pasan. Cubren formatos/stream/CRC, datos truncados, marcadores divididos entre
bloques, canarios privados, ausencia/v1/v2 y colector con destinos fijos separados.
Decoder cuenta tipos de paquete; no interpreta aún causas/enlace/RFCOMM del
tráfico real, porque no hay paquetes disponibles.

Siguiente alternativa preparada: [captura HCI de un único PROBE](phone-hci-capture-plan.md),
**aprobación nueva pendiente** por activar registro detallado y hacer otra prueba.
La autorización R135 era para el informe existente, no para esta captura nueva.

**R135,2026-10-11:** el usuario respondió «sí» a obtener el informe privado
del teléfono en su PC con análisis limitado a Bluetooth. Autorización vigente;
no volver a solicitarla para este mismo paso. Se entregó el comando manual
`node tools/phone-hci-report.mjs collect`; aclarado que termina en collect sin
punto ni argumentos. Copia/resultado todavía no recibidos. No ADB por agente.

Lector inicial preparado: `node tools/inspect-phone-hci-report.mjs inventory`
en PC solamente. Default plan/import sin acceso al informe. Lee el directorio
central ZIP, no los contenidos, con archivo máximo2GiB/directorio8MiB y8192
entradas. Rechaza ZIP64/multidisco, nombres ambiguos/rutas peligrosas, candidatos
cifrados/con métodos desconocidos/enlaces. Solo reconoce entradas bajo
FS/data/misc/bluetooth/logs/btsnoop_hci.log o btsnooz_hci.log, incluyendo .last;
otras rutas vendor quedan fuera. No atribuir ausencia de candidatos a ausencia
total de Bluetooth. Cuenta también posibles textos bugreport, pero no los abre
ni busca aún su resumen inline. JSON sin nombres, identificadores ni contenido.
No extracción/integridad CRC/decodificación de paquetes realizadas o prometidas
por ese inventario. Pruebas sintéticas de límites/rutas/métodos/destino/privacidad
y plan/sintaxis pasan; informe real aún no disponible al preparar el lector.

2026-10-11. El PROBE informado después del plan OFF→ON termina con R02/L01,
connect191ms; Mi Fitness vuelve a sincronizar. No corrección demostrada, otra
APK o prueba de radio propuesta. El lector logcat previo no obtuvo líneas útiles.

## Evidencia nueva y objetivo

Android documenta un historial BTSnoop en memoria y extracción BTSnooz desde
bugreports. La fuente android16-release de SnoopLogger conserva, con snoop
deshabilitado, paquetes en memoria: comandos/eventos HCI; señalización L2CAP;
para otros ACL limita normalmente a14bytes, suficiente para cabeceras RFCOMM
de control. Audio SCO/ISO se omite en esa ruta. Esto abre una vía distinta a
logcat para estudiar el establecimiento y cierre de conexiones.
[Depuración AOSP](https://source.android.com/docs/core/connect/bluetooth/verifying_debugging).

No es una prueba de disponibilidad/formato en HyperOS ni de presencia del
intento en un buffer finito. Comandos/eventos completos pueden incluir datos
sensibles; **no declarar todo ese historial anónimo** ni compartirlo sin filtrar.
El ZIP bugreport también contiene diagnósticos/logs de otras apps. Android
documenta su contenido amplio y posibles archivos FS.
[Bugreports Android](https://developer.android.com/studio/debug/bug-report).

Fuentes obtenidas del dominio oficial en texto Gitiles, decodificadas UTF8,
guardadas en artifacts/research privado; no ejecutadas ni redistribuidas:

| Fuente android16-release | SHA256 del texto |
|---|---|
| system/tools/scripts/btsnooz.py | ff4c96875c555f50e34eb5031ad23b53894cf0d8cfc59aac6289f711645a66bd |
| system/gd/hal/snoop_logger.cc | e8996f04ac15c3f537e03bbdfd1263172a396a45fed7dbb45f3bfe2d25d0948b |

Sandbox sin red; descarga repetida con permisos. Una primera validación del
texto falló; se corrigió el tratamiento byte[]/string de Invoke-WebRequest y
la identificación del script sin cabecera Copyright. Ningún texto fallido se
ejecutó. Rama móvil, hashes identifican textos, no build HyperOS.

[SnoopLogger](https://android.googlesource.com/platform/packages/modules/Bluetooth/+/refs/heads/android16-release/system/gd/hal/snoop_logger.cc),
[decodificador de referencia](https://android.googlesource.com/platform/packages/modules/Bluetooth/+/refs/heads/android16-release/system/tools/scripts/btsnooz.py).

## Acción concreta preparada

`tools/phone-hci-report.mjs` importa sin efectos y su modo predeterminado/plan
solo describe la operación. **collect solo se propone tras autorización del
usuario**, ejecutado manualmente, nunca por el agente. Dos comandos del SDK
ADB37.0.1 ya revisado, con los mismos hashes de adb.exe/ambasDLL fijados en R132:

```text
adb -d get-state
adb -d bugreport <REPO>/tools/local/phone-hci-r134
```

Exige un teléfono USB autorizado y destino nuevo; no sobrescribe, borra,
reintenta ni ejecuta fallback. Timeout30s/300s; salida de consola hasta1MiB en
memoria, sin guardar/imprimir texto del teléfono. Conserva **el ZIP privado
completo** producido por Android en tools/local, ignorado por Git; revisa solo
cabecera ZIP/tamaño y genera collection-review.json sin identificadores.
La cabecera ZIP no prueba contenido válido ni inclusión de HCI.

No PROBE/auth/GET, ajustes Bluetooth, logging completo, clear de buffers,
stop de apps/core, root, desbloqueo, instalación o comando del reloj. Mantener
Mi Fitness normal. Un bugreport genera diagnóstico y puede escribir archivos
temporales/persistentes en el teléfono: **no llamarlo lectura sin escrituras**.
La ruta exacta, inclusión de HCI y efecto del dump vendor aún no están probados.

Pruebas sintéticas pasan: selección USB/comandos/plazos, default sinADB,
rechazo de destino previo/offline/errores/timeout/ZIP faltante o inválido,
sin fallback ni exportación de canarios privados. No prueba real del teléfono:

```powershell
node tools/test-phone-hci-report.mjs
node tools/phone-hci-report.mjs plan
```

## Flujo manual posterior a aprobación

1. Mantener reloj/Mi Fitness normales. Conectar teléfono al PC propio por USB;
   depuración USB normal/autorización solo si hace falta, sin extras de Xiaomi.
2. Desde el repo, `node tools/phone-hci-report.mjs collect` una vez. Puede tardar
   varios minutos; no es una prueba Bluetooth. Compartir únicamente JSON o el
   aviso fijo de error; no ZIP, capturas del bugreport ni logs por chat/Drive.
3. Desactivar depuración/revocar autorización si se habilitaron para esto.
4. En PC, revisar estructura ZIP de forma acotada y únicamente entradas de
   Bluetooth/BTSnooz. No volcar ni leer el diagnóstico general de otras apps.
   El extractor/analizador de paquetes se preparará y validará con fixtures
   antes de leer contenido real. No ejecutar scripts incluidos en el informe.
5. Exportar solo hechos técnicos mínimos del establecimiento: evento/estado,
   dirección y orden de control; sin claves/payload/MAC/nombres/seriales. No
   atribuir tráfico a nuestra app/RW4 sin correlación demostrada. Si el buffer
   falta o no contiene el intento, registrar ese límite y decidir antes de
   una captura nueva. No activarla automáticamente.

## Riesgo, persistencia, reversión y gate

| Componente | Efecto / persistencia | Reversión y peor fallo razonable |
|---|---|---|
| Teléfono | USB/autorización y archivos de diagnóstico; posible carga de CPU/almacenamiento durante generación | Desactivar/revocar USB; eliminar posteriormente informe privado local y copia del teléfono por UI si existe. Timeout, poco espacio o HCI ausente; no borrar datos de apps |
| PC | ZIP completo privado e informe mínimo bajo tools/local, servidorADB puede iniciarse | Borrar estos archivos una vez concluido el análisis; no subir/commitear. Riesgo principal: exposición accidental de diagnóstico de otras apps |
| Reloj | Ninguna conexión/comando/escritura del reloj solicitado por el recolector | Sin flash/particiones/bootloader/recovery/firmware modificado. No prueba de ejecución nativa o recuperación |

No operación que requiera reboot del reloj para revertir; no se plantea un
soft/hard brick del reloj por este recolector. Backup/recovery integral M2315W1
continúan sin validar; no usar este resultado como permiso para instalar código.
Identificación conocida M2315W1/2.2.86, HyperOS3.0.302.0/API36, Mi Fitness3.59.1i;
compatibilidad del diagnóstico vendor pendiente. Si falla, detenerse sin root,
lectura de rutas protegidas o cambiar firmware para obtener logs.

**Gate actual R136:** copia y revisión del historial existente completadas.
Ningún ADB físico por agente. Autorización no incluye activar logging, repetir
PROBE, divulgar el informe completo o cargar código en el reloj. Captura nueva
propuesta por separado; no ejecutar todavía.
