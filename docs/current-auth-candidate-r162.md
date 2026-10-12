# R162 — logs actuales leídos; segunda credencial candidata preparada

2026-10-12. El usuario dejó cuatro copias nuevas en
tools/local/mi-fitness-logs-current/ y ofreció leer directamente el teléfono
conectado. Se inspeccionaron las copias y después los logs actuales por USB.

## Resultado local, sin exportar valores

| Comprobación | Resultado |
|---|---|
| Archivos de la copia del usuario / lectura USB | 4 / 4 |
| Archivos con candidatos | 1 en cada conjunto |
| Valores distintos de 32 hex | 2 |
| Campos reconocidos | encryptKey y token |
| Líneas con candidatos y etiqueta RW4 | 9 |
| Asociaciones JSON en el mismo objeto | 0 |
| Candidato utilizado en R161 | Sigue presente en las entradas anteriores |
| Candidato diferente del utilizado | Uno; aparece después del anterior, sin retorno al valor anterior |
| Fecha máxima reconocida en los logs | 2026-10-12 |
| Fecha explícita de las líneas de claves | No reconocida |
| Fecha en línea precedente cercana a las claves | 2026-10-11; contexto, no timestamp propio verificado |
| MAC privada del target presente con formato reconocido en esas líneas | No |
| HMAC con la segunda credencial | No probado |

No llamar a la segunda clave «vigente/verificada» todavía. Los logs actuales
contienen historial; la copia reciente no convierte todas las entradas en
eventos recientes. Las coincidencias de nombre en una línea no demuestran
asociación estructurada a la unidad física. El resultado refuerza la hipótesis
de cambio de credencial desde la copia original, sin identificar el instante ni
la operación que lo causó. El secreto puede validarse con certeza solamente
mediante un HMAC correcto en una futura sesión compatible.

Se preparó exclusivamente tools/local/pc-rfcomm/auth-candidate-r162.json,
validado con validateAuth. Se seleccionó el único valor distinto del candidato
anterior, exigiendo un solo archivo con registros contextuales y una transición
sin regreso al valor antiguo. No se probaron valores contra el reloj.
auth.json sigue SIN CAMBIAR y el comando session seguiría usando la clave vieja;
no ejecutarlo ahora. El sourceTag user-supplied del archivo separado se refiere
a los logs propios aportados/autorizados por el usuario, no a validación HMAC.
No se imprimen ni se guardan hashes de claves, MAC, nombres de unidad o seriales.

## Lectura USB autorizada

La primera lectura no estableció acceso USB. La comprobación fuera del sandbox
identificó Unauthorized. El usuario desbloqueó y autorizó depuración USB del PC.
Después se completó la lectura con los adb.exe/DLL del SDK previamente fijados
por SHA256, sin instalaciones ni actualización del SDK.

Operaciones exactas del helper local tools/local/current-phone-logs.mjs:

1. adb -d get-state: exige un teléfono USB autorizado.
2. adb -d shell ls -1 /sdcard/Android/data/com.xiaomi.wearable/files/log.
3. Para los nombres .log actuales, validados con gramática ASCII sin espacios,
   shell stat -c %F:%s sobre esa carpeta fija: exige archivo regular y límites.
4. exec-out cat sobre esos archivos fijos: se guarda solo en
   tools/local/mi-fitness-logs-usb-r162/, con creación exclusiva, no sobrescritura.

Máximo 100 entradas, 32 MiB por archivo, 128 MiB total; timeout de cada comando
30 s. Solo archivos .log actuales, sin backups, base de datos privada, logcat,
HCI, datos de otras apps o root. stdout/stderr de ADB se captura y no se muestra;
solo errores enumerados y metadatos agregados. El servidor ADB del PC puede
arrancar; la autorización manual del usuario sí puede persistir en el teléfono.
El helper no modificó archivos del teléfono ni lanzó apps/radio/comandos de reloj.

Resultado final: COMPLETE, usbState=device, filesCopied=4. La inspección local
tools/local/current-auth-inspection.mjs usb reproduce los recuentos anteriores;
prepare creó el candidato separado, no otro intento de autenticación. Los
helpers, logs y secretos permanecen en el directorio ignorado; no se incorporan
al commit. No se recompiló el cliente ni se cambió su algoritmo. El hash/build
R160 sigue aplicando; no nuevas pruebas de motor, Bluetooth o firmware.

## Siguiente paso con la asociación conservada

Mantener Mi Fitness asociado. No Desvincular, Conectar nuevo teléfono o repetir
session. Investigar emparejamiento Windows dirigido a la MAC conocida mientras
el reloj conserva su asociación de aplicación, con Bluetooth del teléfono
temporalmente apagado únicamente durante una futura prueba aprobada.

[Microsoft documenta BluetoothAuthenticateDeviceEx](https://learn.microsoft.com/en-us/windows/win32/api/bluetoothapis/nf-bluetoothapis-bluetoothauthenticatedeviceex)
como solicitud de autenticación Bluetooth a una dirección conocida con UI
normal y requisitos de seguridad. No exige que nuestra aplicación descubra el
nombre primero. Esto no demuestra que RW4 acepte el pairing en su estado normal
ni que conserve todas las claves: una ruta posible por investigar, no un
procedimiento físico ya preparado/probado. No API ejecutada ni nuevo código
de pairing construido en R162. Antes de proponerlo: herramienta PC revisable,
límites/cancelación, secuencia y plan de efectos/retorno explícitos.

Meta: conseguir acceso SPP desde PC conservando la asociación Mi Fitness, y
solo después validar la segunda clave. No firmware modificado, ELF, módulos,
upload de esfera o Doom físico autorizado por este diagnóstico USB.
