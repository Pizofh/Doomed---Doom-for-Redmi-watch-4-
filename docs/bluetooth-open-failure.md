# Apertura Bluetooth: evidencia y límite del diagnóstico

## R129 — revisión en PC, 2026-10-10

La captura de Configuración adicional de HyperOS muestra «Lista negra de
Bluetooth», «Vincular dispositivos compatibles», opciones de audio y «Mostrar
dispositivos Bluetooth sin nombre». No muestra el contenido de la lista negra
ni prueba que se aplique a nuestro intento SPP. Solo se propuso abrir la lista
para comprobar visualmente si figura el reloj, sin modificarla. Resultado
pendiente. Mi Fitness sincroniza según las confirmaciones anteriores.

## Qué significa G08

Los informes recibidos fallan dentro de `BluetoothSocket.connect()`: D04 aparece
y D05 no. No alcanzan la negociación Xiaomi ni evalúan la clave. G08 clasifica
el mensaje genérico de IOException; no identifica una causa Bluetooth concreta.

Se logró consultar la fuente primaria de la rama **android16-release** de AOSP,
archivo BluetoothSocket.java, blob `824dda69d4b5bddc10ae22e58e676e27841a88a3`.
Esto actualiza la limitación de acceso a fuentes Android16 anotada en R128,
pero **no demuestra identidad con el código de HyperOS del teléfono**.
[Fuente AOSP](https://android.googlesource.com/platform/packages/modules/Bluetooth/+/refs/heads/android16-release/framework/java/android/bluetooth/BluetoothSocket.java).

En esa fuente, la apertura normal obtiene un descriptor local del servicio
Bluetooth y realiza dos lecturas mediante el mismo helper `readAll`:

| Tramo | Lectura | Lo que podría localizar una traza compatible |
|---|---|---|
| `readInt` dentro de `connect` | Entero de canal, 4 bytes | Fallo al recibir el primer dato del servicio Bluetooth local |
| `waitSocketSignal` dentro de `connect` | Señal de conexión, 44 bytes en esta revisión | Fallo después de recibir un canal positivo, esperando la señal de conexión |

`readAll` puede lanzar el mismo IOException genérico en ambos tramos. Por eso
el mensaje G08 y su duración no distinguen estos casos. Incluso conocer el
tramo no probaría por sí solo ocupación, fallo SDP, rechazo remoto o timeout.
Los códigos de BluetoothSocketException ya manejados por nuestra app no
resuelven un error emitido como IOException genérico.

## Por qué no podemos recuperar ese detalle del informe anterior

`tools/android-diagnostic-status-patches.mjs` reemplaza deliberadamente el log
upstream de la excepción de apertura por un aviso fijo. `Rw4DiagnosticStatus`
conserva categoría, tiempos y cierre solicitado, pero no examina ni guarda
frames de la excepción. El detalle no está disponible en los informes recibidos;
no pedir al usuario logs crudos suponiendo que nuestra app lo conservó.

## Siguiente decisión técnica

Si hace falta instrumentar un próximo build, registrar únicamente una categoría
fija derivada de frames de `android.bluetooth.BluetoothSocket` (`readInt`,
`waitSocketSignal`, desconocido), sin texto libre, direcciones, rutas ni claves.
Usar frames existentes de Throwable no implica invocar métodos privados ni
cambiar el transporte. Validar clasificación y privacidad primero en PC.
Integrarlo con cualquier cambio de conexión justificado para evitar una cadena
de APKs que solo añaden detalles. No hay build nuevo ni otra prueba Bluetooth
autorizada por este documento; antes debe existir un plan concreto de prueba.

La desaparición del ServiceRecord R128 sigue sin demostrar socket libre.
La captura R129 no justifica cambiar audio, autostart, permisos, emparejamiento,
servicios del sistema o parámetros de RFCOMM.
