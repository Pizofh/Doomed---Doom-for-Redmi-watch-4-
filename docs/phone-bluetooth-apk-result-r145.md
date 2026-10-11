# R145 — revisión final del APK Bluetooth del teléfono

2026-10-11. Se completó la revisión acotada acordada en R144. **No se encontró
una corrección concreta de la conexión. Se cierra la serie de pruebas repetidas
de apertura/HCI y de builds destinados solo a añadir diagnósticos.** El siguiente
checkpoint es obtener evidencia externa de una configuración que conecte este
RW4/firmware con un cliente independiente. La consulta preparada no se ha enviado.

## Archivo y verificación

El usuario exportó un único APK instalado de `com.android.bluetooth`, sin
instalarlo, ejecutarlo ni solicitar operaciones Bluetooth. Copia local privada:
`tools/local/phone-bluetooth/Bluetooth-base.apk`.

- Tamaño: 12 366 135 bytes.
- SHA-256: `f126feddc207990ab89626379c6a6fd1e3a49782d84072a997aaac5303ef42ad`.
- Manifest: paquete esperado, versión 16, versionCode 36, minSdk 33, targetSdk 36.
- Firma APK v3 verificada por apksigner oficial. Certificado SHA-256:
  `9ce631cbfb2d59a596cbe7597f7260f7ffba6cd11ae7a3b7481a254631dcb63c`.

La verificación prueba integridad criptográfica de este APK firmado; la identidad
del certificado fabricante no se contrastó con una referencia independiente.
El origen observado es el software instalado en el teléfono del usuario.

Los lectores oficiales aapt2/apksigner/apkanalyzer se ejecutaron únicamente en
PC. Java recibió AccessDeniedException en sandbox al listar el ZIP; se repitió
la lectura fuera del sandbox con aprobación. No se ejecutó código del APK,
ADB ni comunicaciones al teléfono/reloj por el agente. Salidas detalladas y
bytecode permanecen en `artifacts/research/phone-bluetooth-apk`, ignorado por Git.

## Ruta de conexión inspeccionada

Se leyeron clases completas BluetoothSocketManagerBinder, AdapterNativeInterface
y AdapterService, y el método Utils.checkConnectPermissionForPreflight.

1. `BluetoothSocketManagerBinder.connectSocket` llama a enforceActiveUser y
   al control de BLUETOOTH_CONNECT. Si el preflight falla, retorna null.
2. Obtiene la dirección de identidad mediante AdapterService.getIdentityAddress
   (usa la identidad conocida si existe, en otro caso conserva la dirección).
3. Transfiere dirección, tipo, UUID, canal, flags y UID llamante a
   AdapterNativeInterface.connectSocket; los parámetros adicionales de offload
   son cero/vacíos en esta ruta normal.
4. AdapterNativeInterface.connectSocket delega directamente a la declaración
   nativa connectSocketNative, y el binder adapta el descriptor retornado.

En estos métodos no apareció una lista explícita de paquetes permitidos para
SPP, una sustitución de UUID ni un protocolo especial que justifique rehacer
la conexión de nuestra app. Esto **no descarta** controles de permisos auxiliares,
AppOps, políticas nativas, fallos remotos o efectos de otra conexión. No se
auditó toda la pila ni se atribuyó el cierre observado al teléfono o al reloj.

AdapterService carga `bluetooth_jni`. El listado de este APK contiene un DEX y
no contiene archivos `.so`: la implementación nativa responsable de negociar
RFCOMM no está disponible en esta copia. No se solicitaron más bibliotecas,
APEX completos, privilegios o cambios del teléfono para continuar esta rama.

## Hallazgo concreto de Xiaomi sobre HCI

Se siguió el flujo de AdapterService.dump, no solo una búsqueda de strings.
Después del dump normal/nativo, intenta crear una carpeta y copiar:

```text
origen:  /sdcard/btsnoop_hci.log
destino: /sdcard/MIUI/debug_log/common/com.android.bluetooth/btsnoop_hci.log
```

El método captura excepciones y el resultado booleano de copyFile no se comprueba.
Por tanto, el código demuestra un **intento de copia**, no que exista el origen,
que el logger escriba allí o que el informe incluya el destino. También significa
que un dump no es necesariamente una operación sin escrituras locales del teléfono.
No se ejecutó ese método ni se pidió activar HCI otra vez.

Se revisó solo metadata de los dos ZIP ya autorizados, buscando esas rutas
exactas bajo FS/sdcard y FS/storage/emulated/0. Ambos devolvieron cero coincidencias;
no se abrieron nuevas entradas ni se extrajeron archivos. Esto no demuestra
que los archivos no existieran fuera del ZIP. Los buffers vacíos previamente
revisados siguen sin aportar causa del fallo.

## Reproducción en PC

```powershell
node tools/inspect-mi-fitness-apk.mjs --bluetooth review
node tools/inspect-mi-fitness-apk.mjs --bluetooth packages
node tools/inspect-mi-fitness-apk.mjs --bluetooth code-batch com.android.bluetooth.btservice.BluetoothSocketManagerBinder socket-manager com.android.bluetooth.btservice.AdapterNativeInterface native-interface com.android.bluetooth.btservice.AdapterService adapter-service
node tools/inspect-mi-fitness-apk.mjs --bluetooth code com.android.bluetooth.Utils connect-permission 'checkConnectPermissionForPreflight(Landroid/content/Context;)Z'
node tools/test-phone-hci-inventory.mjs
node tools/inspect-phone-hci-report.mjs inventory-capture
node tools/inspect-phone-hci-report.mjs inventory
```

Regresión de inventario sintético pasa: rutas exactas contadas, otras rechazadas,
ningún contenido nuevo seleccionado, sin nombres privados exportados. Diff check
sin errores. No nueva APK diagnóstica, intento de conexión, captura o resultado
de ejecución física de Doom. Firmware, instalación y código nativo en RW4 continúan
con sus gates previos; resolver el transporte por sí solo no demuestra esos pasos.

## Decisión

Actualizar la [consulta de compatibilidad](upstream-connection-question.md) con
este límite y buscar una experiencia verificada antes de otro ensayo físico.
No enviar/publicar automáticamente. Las rutas HCI halladas quedan documentadas
para una revisión futura motivada por nueva evidencia; no iniciar otro ciclo
de logging para comprobar cada incógnita. El trabajo de emulador ya logrado
se conserva.
