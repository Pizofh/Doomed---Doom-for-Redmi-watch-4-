# R107 — resultado de la prueba solo Bluetooth

2026-10-09. Ensayo manual del usuario con RW4 Diagnostics r106, modo PROBE,
en la unidad M2315W1/firmware mostrado 2.2.86 y teléfono Android API 36.
Es el tercer intento de enlace registrado; los dos anteriores fueron consultas
que también fallaron antes de autenticar. No lo ejecutaron herramientas del PC.

## Informe recibido

```text
Preflight: P00
Caché local y del intento: B01/T01/S01
Modo: solo Bluetooth
Formato de clave: no evaluado
D01 > D02 > D03 > D18 > D04 > E03 > D17 > D13
D01 +0ms > D02 +106ms > D03 +114ms > D18 +117ms >
D04 +117ms > E03 +414ms > D17 +420ms > D13 +440ms
G08: IOException; lectura falló, mensaje ambiguo entre cierre y timeout
Cierre local solicitado al registrar el error: no
Batería: sin respuesta
Modelo y firmware: sin dato reconocido
```

Se conserva únicamente el informe saneado: sin clave, dirección, número de
serie, paquetes ni logs crudos. El modelo/firmware indicados arriba proceden
de identificación previa del usuario, no de una respuesta a esta prueba.

## Lo que demuestra

| Observación | Interpretación y límite |
|---|---|
| P00 | Bluetooth encendido, permisos disponibles y sin discovery activo según preflight local |
| B01/T01/S01 | Vínculo guardado, tipo Classic y SPP en caché Android; no prueba que el servicio esté disponible ahora |
| D18 | Se creó el objeto socket; crear no equivale a conectar |
| D04 → E03 | La llamada `BluetoothSocket.connect()` falló: 414 − 117 = **297 ms** entre las marcas |
| Sin D05 | No se registró apertura exitosa; no se alcanzaron lector/protocolo/auth/GET |
| G08 | Categoría de IOException genérica, sin código Axx ni causa específica disponible en este informe |
| Cierre solicitado: no; sin E08 | El error se registró antes de solicitar cierre local y antes del límite propio de 30 segundos |
| E03 → D17 | La marca de retorno de `close()` llegó 6 ms después; no mide el cierre radio completo |
| D13 +440 ms | La app registró desconexión local |

La fuente del APK coloca D04 inmediatamente antes de `connect()`, D05 después,
y el lector/inicialización después de ambos. PROBE además retorna antes de
inicializar el protocolo y deniega sus payloads. Por tanto, **este intento no
envió autenticación ni comandos Xiaomi desde nuestra app**. La apertura de
Bluetooth sí puede intercambiar señalización de enlace/SDP; no es una lectura
pasiva ni demuestra ausencia de todo efecto interno del reloj.

No recibir batería/modelo/firmware es esperable en PROBE, incluso si conectara.
No clasificar esos campos como fallo de las consultas: no se ejecutaron.

## Retorno y diferencia de pasos

El usuario responde que Mi Fitness y reloj están bien, pero Mi Fitness muestra
aproximadamente **18 pasos más** que el reloj. Se registra la diferencia sin
declarar igualdad de datos ni atribuirla a nuestra prueba. No tenemos medición
anterior, marcas temporales comparables ni seguimiento para establecer causa.

Sincronización/caché u otras fuentes de pasos son hipótesis, no resultados
demostrados para esta unidad. No hay ruta de escritura del contador en PROBE
y el socket falló antes de los comandos Xiaomi. Tampoco se investigó el
algoritmo de pasos de Mi Fitness 3.59.1i. No se indica reset, desvincular ni
cambiar firmware para corregir esta diferencia.

## Comprobación de fuentes y límites

- Fuente local inspeccionada: `BtBRQueue.java` del worktree r106; selección
  RW4 `BT_CLASSIC`, servicio SPP UUID `00001101-0000-1000-8000-00805f9b34fb`,
  resolución de canal mediante SDP. No se añadió socket insecure ni fallback.
- [API oficial Android: connect](https://developer.android.com/reference/android/bluetooth/BluetoothSocket#connect())
  admite errores de apertura; el informe no identifica qué parte del enlace falló.
- [AOSP histórico, revisión 975a8d0](https://android.googlesource.com/platform/frameworks/base/%2B/975a8d0/core/java/android/bluetooth/BluetoothSocket.java)
  contiene el patrón de G08 en `readAll` y utiliza lecturas del socket local
  durante `connect`. Explica por qué una lectura fallida puede preceder a los
  datos de la aplicación. No es fuente de HyperOS/Android 16 del teléfono;
  no permite localizar el fallo de esta unidad en una línea concreta. La fuente
  modular Android 16 no fue accesible mediante la herramienta web.
- [Ficha upstream RW4](https://gadgetbridge.org/gadgets/wearables/xiaomi/#redmi-watch-4)
  sigue indicando soporte experimental y cobertura desconocida. PR #3693 no
  fue accesible; no afirmar que se revisaron sus comentarios. Las notas de
  BLE/Classic en modelos relacionados no demuestran compatibilidad RW4 2.2.86.

## Diagnóstico y siguiente checkpoint

La causa exacta sigue abierta: disponibilidad/resolución del servicio,
seguridad del enlace, endpoint seleccionado, conflicto de sesión o pila del
teléfono son hipótesis. El fallo rápido no demuestra rechazo explícito del
reloj. Tampoco demuestra una clave Xiaomi incorrecta ni imposibilidad de Doom.

**Siguiente meta: identificar con evidencia el transporte/servicio usado por
Mi Fitness para esta unidad y contrastarlo con el cliente Classic/SPP.**
Priorizar documentación/fuentes y metadatos locales saneados existentes; no
necesitamos un APK nuevo para añadir más etiquetas de debug. Si la evidencia
exige una nueva operación radio o acceso manual, preparar esa operación
concreta antes de pedirla. No exportar claves/logs privados ni leerlos en bruto
en la terminal.

QUERY no soluciona este fallo: abre primero el mismo socket. No guiar aún esa
acción ni otro PROBE, cambio de clave, unpair/reset, escaneo de canales,
socket insecure o fallback BLE. Conservar r106 y Mi Fitness funcionando.
No hubo cambios de código/build en R107; no repetir las suites PC por un
cambio documental. Instalación de watchfaces, nativo y firmware sigue cerrada.
