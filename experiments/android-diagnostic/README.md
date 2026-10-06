# Diagnóstico Android limitado: prototipo en PC

**R87:** permisos/componentes y reconexión global limitados en las fuentes.
Ticket manual con caducidad, un intento por proceso y vínculo existente;
registro local sin conectar automáticamente. Pruebas Java propias pasan.
Primer APK R86 compilado, pero **el segundo build con estos cambios está
pendiente**. [Estado actual](../../docs/android-build.md). Las notas R83/R82
de abajo son históricas. No instalar ni conectar; gate físico cerrado.

**R83,2026-10-05:** fuente seleccionada ampliada a46textos y vista previa
actual en `build/android-diagnostic-preview-r83/` (once fuentes/nueve diffs).
Sesión propia sincronizada con reloj monotónico: vence sin depender del timer,
cierra al desconectar y rechaza intentos/auth duplicados. WriteAction comprueba
la sesión al ejecutar y antes de escribir, clona el payload y deniega por defecto;
la variante BTBR solo abre ese gate desde RW4 SPP. Activity ya no se despacha
a salud; entrada después de cerrar se ignora. Se eliminaron también logs crudos
y direcciones identificados en BtBRQueue. Negociación/ACK siguen siendo tráfico
activo; un write ya iniciado puede terminar después del límite. Cierre del socket
y reconexión global aún no probados. No es una auditoría global de privacidad.

Pruebas nuevas: expiración exacta a30s, regresión del reloj, cierre explícito,
un intento/auth por sesión; componente WriteAction real parcheado con socket
falso rechaza cola vencida y cierre durante lookup, conserva copia del payload.
No Android runtime/Bluetooth. [Herramientas/build](../../docs/android-build.md)
preparados con ZIP oficiales verificados; SDK remoto bloqueado en esta terminal.
No APK producido ni gate físico abierto. Esta actualización sustituye rutas,
requisitos y pendientes operativos R82 descritos debajo.

```powershell
node tools/test-android-diagnostic-policy.mjs
node tools/prepare-android-diagnostic.mjs
node tools/test-android-diagnostic-queue.mjs
node tools/android-build.mjs doctor
```

R82, 2026-10-05. El usuario eligió desarrollar una variante limitada de
Gadgetbridge antes de plantear una conexión física. Esta elección autoriza el
trabajo en PC; **no la instalación ni conexión al reloj**.

La primera sesión prevista intentará autenticar y consultar batería, modelo y
versión. No demuestra ejecución nativa ni instalación de esferas. El objetivo
final del proyecto sigue siendo Doom.

## Implementado y comprobado

`Rw4DiagnosticPolicy.java` permite únicamente nonce/autenticación `1/26` y
`1/27` durante el handshake, y GET batería `2/1` e información `2/2` después.
Deniega el resto y cualquier comando cuando la sesión está cerrada. Comprueba
también la forma protobuf: GET sin payload, nonce de 16 bytes, HMAC de 32 bytes
y metadatos cifrados acotados, sin campos adicionales. No interpreta el contenido
de los metadatos cifrados ni sustituye la autenticación de upstream.

La prueba Java propia pasó en PC: cuatro combinaciones permitidas, comandos de
configuración prohibidos, payload añadido, nonce inválido, duplicados, mensajes
truncados y fase cerrada. No usó claves reales, Android, Bluetooth ni código
ejecutable de terceros descargado.

El generador prepara cinco fuentes y cuatro diffs revisables a partir del
archivo de fuentes fijado en [la revisión](../../docs/gadgetbridge-connection-review.md).
En la variante propuesta:

- Se omiten la inicialización general de servicios y la sincronización de hora.
- Se filtran los envíos protobuf en XiaomiSupport y en la salida SPP inferior.
- Se rechazan las transferencias por `sendDataChunk`.
- Se procesan batería/modelo/firmware sin publicar el serial recibido.
- Se eliminan los logs identificados de claves/nonces y paquetes crudos.
- Se deshabilita la reconexión automática en el soporte Xiaomi y se solicita
  desconexión a los 30 segundos; un intento por instancia.

**Es una propuesta de integración, no un APK compilado ni una política completa
demostrada en runtime.** El GET de información puede recibir un serial aunque
la variante no lo muestre. Autenticar envía nonces y datos del teléfono; no
garantiza ausencia de cambios internos en el firmware.

## Reproducción local

Desde la raíz del repositorio, con el archivo de fuentes ya revisado y un JDK:

```powershell
node tools/review-gadgetbridge-source.mjs
node tools/test-android-diagnostic-policy.mjs
node tools/prepare-android-diagnostic.mjs
```

El primer comando inspecciona el TAR local fijado y selecciona 38 textos. El
segundo compila y ejecuta exclusivamente la política/prueba propias. El tercero
verifica hashes y genera `build/android-diagnostic-preview/`, incluido
`manifest.json` con `androidCompilationPerformed=false` y `hardwareGateOpen=false`.
Rechaza una fuente cambiada o una vista previa existente con contenido distinto.
No descarga, compila Android, instala, conecta ni aplica cambios a upstream.
Fuentes extraídas, diffs y clases compiladas están ignorados por Git; los
scripts y la política propia permiten regenerarlos. Licencia de la política,
prueba y generador: AGPL-3.0-or-later, indicada en sus encabezados.

## Pendiente antes de producir un APK

Revisar negociación SPP, configuración de sesión, ACK y el canal Activity:
esas rutas de transporte no quedan cubiertas por el filtro protobuf. Revisar
colas ya encoladas, concurrencia del estado, cierre efectivo y reconexiones
creadas por el servicio global. El temporizador solicita desconexión; todavía
no se ha probado que la complete ni que cancele todo envío pendiente.

Integrar y compilar contra las APIs reales de Android/protobuf, revisar el
resto de callbacks/UI y limitar la variante a RW4. Preparar identidad y firma
propias de la app, sin suplantar la distribución oficial. No afirmar que la
eliminación de los logs seleccionados es una auditoría de privacidad completa.

El PC tiene JDK21 y JDK26, pero no se encontró Android SDK en su ruta habitual
ni una distribución Gradle en la caché habitual. Los archivos recibidos declaran
toolchain Java21, source/target17, compileSdk37 y wrapper Gradle9.7.1; son datos
del archivo, **no versiones verificadas aquí contra los distribuidores**. Antes
de ejecutar el build, revisar catálogo de dependencias/wrapper y contrastar
distribuciones/checksums con fuentes oficiales. No se ejecutó Gradle.

Siguiente checkpoint: obtener un build Android de esta variante con la
integración revisada. Después completar el [plan físico](../../docs/physical-device-plan.md)
y solicitar revisión explícita; no abrir el gate por tener un APK.
