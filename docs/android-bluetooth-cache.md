# R104 — consulta de caché Bluetooth del teléfono

## Resultado R105 — lectura real reportada

2026-10-09. El usuario abrió el diálogo r104 y reportó:

```text
B01: vínculo guardado confirmado
T01: tipo clásico
S01: SPP presente en caché
```

Esto confirma instalación/apertura del flujo y lectura local según reporte
del usuario. Android reconoce el vínculo y guarda el UUID de SPP para ese
registro. La selección Classic/SPP de r101 coincide con estos datos. No se
midió tráfico radio; la ausencia de intento de conexión corresponde al código
del flujo r104 y su mensaje, no a una captura independiente.

No demuestra que el servicio remoto esté disponible ahora ni que Android
pueda abrirlo. T01 no identifica todas las capacidades físicas del chip:
es el tipo que Android informa para el registro. El fallo anterior sigue
localizado antes de auth Xiaomi; ninguna clave rechazada demostrada.

### Diseño del siguiente diagnóstico

Objetivo único: obtener la categoría del fallo de apertura del mismo socket
seguro Classic/SPP, sin cambiar transporte, canal, vínculo o clave.
La caché sola no permite recuperar la IOException del intento anterior.

Android dispone de `BluetoothSocketException.getErrorCode()` desde API34;
el teléfono reportado es Android16, mientras que nuestra app conserva min23.
Una implementación deberá aislar y proteger el acceso API34. Hay errores
genéricos y operaciones que lanzan IOException ordinaria: puede que el código
no baste para identificar la causa.
[Referencia oficial](https://developer.android.com/reference/android/bluetooth/BluetoothSocketException#getErrorCode()).

Propuesta para una futura prueba: abrir y cerrar únicamente el socket,
sin inicializar protocolo Xiaomi, autenticar o enviar GET. Un intento manual,
sin fallback/reconexión; mismo UUID/método seguro y límite de30s como máximo,
con cierre al terminar/cancelar. Guardar solo categoría fija de excepción,
código reconocido, duración acotada y si el cierre local por timeout ya había
empezado. No guardar mensajes crudos, claves, MAC, direcciones ni paquetes.
Separar «error devuelto por Android» de «cierre provocado por nuestro límite».

La apertura implica enlace/SDP Bluetooth reales; no describirla como lectura
local ni garantizar cero efectos internos del reloj. Antes de guiarla deben
estar implementados/revisados/probados el cierre y la clasificación, preparado
el APK y actualizado el plan físico para revisión explícita de esa prueba.
**Diseño preparado, no código/build nuevo ni tercer intento solicitado.**
La versión r104 instalada continúa bloqueando Conectar. No repetir la lectura
de caché ni pruebas de emulador para obtener el dato que falta.

## Preparación y verificación R104 (historial)

**Listo en PC:** build Android SUCCESSFUL2m57s (73 tareas,20 ejecutadas),
prueba de componente/entrada local pasa, inspector y apksigner oficial pasan.
APK `artifacts/android-diagnostic-r104/RW4Diagnostics-r104.apk`,31394652 bytes,
versión `0.94.0-rw4-diagnostic-r104`; SHA256
`7e0f7db1613a0f33d4e048b21088ecbf13fb15e46a663aa584403105c1ad9828`.
Mismo certificado SHA256
`47eeb041e241c7ab785ed8bdcf06c6fcce90020e52d4794aa3c6c66590577709`.
Firma v1/v2 válida; no prueba inocuidad. DEX contiene clase/etiquetas r104.
En la preparación R104 aún no se habían probado instalación/UI/caché reales;
el reporte R105 superior actualiza ese estado.

2026-10-09. El segundo intento r101 falló en el socket antes de autenticación
Xiaomi; el usuario confirma Mi Fitness/reloj normales después. El próximo
diagnóstico consulta lo que Android ya tiene guardado, sin repetir Conectar.

## Cambio

`Rw4BluetoothCache` obtiene únicamente el dispositivo RW4 registrado, verifica
su vínculo local y lee tipo/UUIDs en caché. No enumera otros dispositivos,
abre sockets, inicia discovery/SDP, accede a claves ni guarda el resultado.
La salida utiliza categorías fijas; no muestra MAC, serial, nombre, UUIDs
crudos o texto de excepciones. `getUuids()` devuelve la copia local y no inicia
descubrimiento, según [Android](https://developer.android.com/reference/android/bluetooth/BluetoothDevice#getUuids()).

El toque en la tarjeta, que antes pedía Conectar, abre ahora el diálogo
«Caché Bluetooth local — r104». El menú equivalente pasa a «Consultar caché
local». Se retira el snackbar «Conectando» y la creación de acceso directo.
No emite tickets, intents de conexión ni inicia el servicio desde esa acción.
Además, el servicio rechaza `ACTION_CONNECT` incluso si lo recibe por otra
ruta interna. Conserva la traza histórica r101; la consulta no la reinicia.
Los módulos de transporte/auth siguen compilados, pero esta versión no
habilita su uso mediante el flujo de diagnóstico.

| Código | Interpretación |
|---|---|
| B01 | Android confirma vínculo guardado |
| B02 | Vínculo no confirmado; se omite lectura de tipo/servicios |
| T01 / T02 / T03 / T04 | Tipo clásico / BLE / dual / desconocido |
| S01 | UUID de SPP presente en caché |
| S02 | Caché disponible sin SPP encontrado |
| S03 | Caché nula o vacía |
| C01 / C02 | Selección distinta de RW4 o registro local no válido |
| C03 / C04 / C05 | Adaptador ausente / acceso Android denegado / lectura no disponible |

S01 no garantiza que el servicio esté disponible ahora. S02/S03 no prueban
que el firmware carezca de él. Un dispositivo dual no demuestra que nuestra
autenticación Xiaomi funcione por BLE. Esta lectura no identifica por sí sola
la causa de E03; orienta el siguiente diagnóstico.

## Verificación en PC

```powershell
node tools/prepare-android-diagnostic.mjs
node tools/test-android-bluetooth-cache.mjs
node tools/android-build.mjs refresh
node tools/android-build.mjs build
node tools/inspect-android-diagnostic.mjs
# Verificar con apksigner oficial y conservar reporte r104.
node tools/package-android-diagnostic.mjs
```

Prueba de componente Java con datos sintéticos: presencia/ausencia/caché
vacía, tipos, vínculo/modelo/registro inválidos, permisos y excepción local.
Los stubs no ofrecen APIs de radio, sockets, persistencia o logs. Comprueba
también el adapter generado sin tickets/servicio y el rechazo de CONNECT.
Esto verifica el contrato del componente, no equivale a ejecución en Android.
lintVital no encontró errores/warnings con el baseline upstream (1406 entradas
no encontradas/variante distinta); no afirmar auditoría lint exhaustiva.
Primer build falló por red bloqueada en sandbox; rerun aprobado fuera del
sandbox completó el build. Advertencias de APIs deprecadas y manifiesto
heredadas conservadas. No se instaló software adicional ni accedió al reloj.

## Consulta manual en teléfono

Actualizar nuestra app sobre la existente, con el mismo package/certificado;
sin borrar datos, volver a introducir claves o registrar el reloj. Mi Fitness
puede seguir funcionando; no forzar su detención, apagar Bluetooth o cambiar
el vínculo para esta consulta. Abrir RW4 Diagnostics y tocar la tarjeta del
reloj existente. Si se utiliza el menú, elegir «Consultar caché local».
Copiar únicamente B/T/S o C del nuevo diálogo y cerrarlo. No pulsar Añadir,
escanear, compartir logs ni seguir otros menús heredados.

Componente afectado: caché Bluetooth del teléfono y UI de nuestra app.
Persistencia prevista: actualización del APK solo en el teléfono; ninguna
escritura nueva del resultado ni comando al reloj desde esta consulta.
Reversión: cerrar la app; el APK r101 previo sigue conservado, sin recomendar
volver a ejecutar su consulta. Peor fallo razonable de la lectura: error local
o cierre de nuestra app. No operación sobre particiones/bootloader/firmware
del reloj ni prueba de código nativo. No ampliar este resultado a garantía de
seguridad de todos los menús heredados de Gadgetbridge.

En R104 quedaba pendiente el ensayo UI/caché; resultado recibido en R105 arriba.
