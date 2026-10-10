# R132 — fallo después de recibir canal y lectura pasiva preparada

## Resultado posterior R133 — lectura pasiva completada

2026-10-10. El usuario ejecutó `node tools/phone-rfcomm-logs.mjs collect` y
aportó el JSON R132: nativeHeadersObserved=false; ownCloseMarkers=0; las cuatro
categorías de fallos candidatos y las 25 categorías PORT_* tienen conteo cero.
No atribución al intento r131 ni socket activo verificados; rawOutputSaved,
bluetoothOperationRequested, watchCommandRequested y logConfigurationChanged
son false. La lectura terminó sin el aviso fijo de error.

**Resultado inconcluso:** no hay líneas con las cabeceras nativas reconocidas
por el lector. Puede ser ausencia de esos tags/niveles, ventana sobrescrita o
formato distinto. No se demuestra que HyperOS nunca registre la causa, que
no hubiera error nativo, que el canal esté libre ni quién cerró. No se solicita
repetir collect, ampliar a logs crudos o habilitar logging.

Se conserva el fallo R02/L01 de apertura como último dato atribuible. No hay
base para cambiar UUID, seguridad del socket o clave. [Siguiente ensayo manual
con la app existente](phone-adapter-restart-plan.md): una desconexión completa
del adaptador del teléfono y un PROBE; preparado, todavía no realizado.

2026-10-10. Usuario aporta un intento r131 y confirma «todo ok en watch y app».
Instalación y ejecución de la revisión r131 confirmadas por el informe/usuario;
no solicitar otra confirmación de retorno normal para este mismo intento.

## Resultado físico reportado

| Campo | Resultado |
|---|---|
| Android/revisión del intento | API36/r131 |
| Modo/preflight/caché | Solo Bluetooth/P00/B01-T01-S01 |
| Traza | D01 → D02 → D03 → D18 → D04 → E03 → D17 → D13 |
| Tiempos relativos | 0/128/132/142/142/540/546/553ms |
| connect hasta error | 398ms |
| Categorías | G08/R02/L01 |
| Cierre local ya solicitado al guardar error | No |
| Clave Xiaomi/auth/protocolo/GET | No evaluada/no alcanzados |
| Retorno a Mi Fitness y reloj normal | Confirmado por usuario |

R02 reconoce la cadena `readAll → waitSocketSignal → connect`. En la fuente
Java AOSP revisada esto sucede después de recibir un entero de canal positivo.
L01 reconoce EOF(-1) del stream local entre Java y el servicio Bluetooth.
No demuestra timeout, quién cerró, ocupación, rechazo remoto o causa de enlace.
Tampoco prueba que se recibieran cero bytes de señal: readAll podría haber leído
una parte antes de EOF. D17 solo confirma que close retornó en nuestra app.

El inventario r114 incluido es el resultado anterior16,132ms/40callbacks ya
documentado en R117/R118, no un inventario nuevo ni evidencia de conexión SPP
actual. Batería/modelo/firmware siguen sin respuesta; no se transmitió código.

## Revisión nueva de fuentes primarias en PC

Se obtuvieron archivos públicos de `platform/packages/modules/Bluetooth`, rama
android16-release, en texto Gitiles(base64), sin ejecutar su código. El navegador
no permitió consultar estos archivos; lectura de red del sandbox falló y se
repitió con permiso fuera del sandbox. Copias privadas ignoradas por Git bajo
artifacts/research/aosp-android16-*. No APK/firmware propietario nuevo descargado.

| Fuente relativa | SHA256 del texto UTF8 guardado |
|---|---|
| system/btif/src/btif_sock_rfc.cc | 9e8c84819d448c7b739f6dc1c716bc9e5551870e539ffadf9aede6f0f38100c5 |
| system/btif/src/btif_sock.cc | 9b11f203b220a562475e9ef21fcacd562abc8af2ec1e6f071c0f847d8ee18215 |
| system/btif/src/btif_sock_logging.cc | 1eba696a74f72f0db8617695dc631289070117ff67ce7d6305cd988db8d14fca |
| system/include/hardware/bt_sock.h | f29a3edfec764de055e5a68f730726044a65745fa2b3cf49d5704b14e27f3d6f |
| system/bta/jv/bta_jv_act.cc | a7c13925c6b9effa77c3122e89763e1578272fca03cc112863f37835d508f818 |
| system/stack/include/port_api.h | 5e026a3a31f169f06b7c18c1c729a6f14927dd73a370911160e8b94f03575133 |

La rama puede evolucionar; hashes identifican los textos leídos en esta sesión,
no un commit único ni la implementación propietaria de HyperOS. Se conservan
licencias upstream en copias locales.

En la ruta por UUID revisada, `handle_discovery_comp` recibe SDP exitoso/canal,
inicia RFCOMM y después envía el entero de canal. Un fallo SDP previo sigue otra
ruta. Esto **apoya como inferencia condicionada a esa implementación** que el
intento R02 superó la devolución inicial del canal; no garantiza un servicio
remoto correcto ni elimina bugs de caché/vendor.
[RFCOMM AOSP](https://android.googlesource.com/platform/packages/modules/Bluetooth/+/refs/heads/android16-release/system/btif/src/btif_sock_rfc.cc).

`bta_jv_port_mgmt_cl_cback` recibe un resultado PORT_*. En fallo lo pone en
`rfc_close.port_status`. El receptor `on_rfc_close` no utiliza ese parámetro y
limpia el slot con BTSOCK_ERROR_NONE, cerrando el socket local. Esto explica
una ruta en que Java recibe EOF sin obtener el motivo preciso. Existen otras
rutas de cierre; no se ha demostrado que esta sea la recorrida por HyperOS/RW4.
[Callback BTA](https://android.googlesource.com/platform/packages/modules/Bluetooth/+/refs/heads/android16-release/system/bta/jv/bta_jv_act.cc),
[códigos PORT](https://android.googlesource.com/platform/packages/modules/Bluetooth/+/refs/heads/android16-release/system/stack/include/port_api.h).

El logger actual también conserva16eventos. Su dump imprime estado/tipo/canal,
pero **omite UID y código de error**, aunque ambos se envían a métricas. No
preparar un dumpsys Bluetooth suponiendo que ese historial explica la causa o
permite atribuirla a nuestra app. No se consultaron métricas/historial del teléfono.
[Logger AOSP](https://android.googlesource.com/platform/packages/modules/Bluetooth/+/refs/heads/android16-release/system/btif/src/btif_sock_logging.cc).

## Lectura manual de registros existentes, sin nuevo intento

`tools/phone-rfcomm-logs.mjs` tiene default **plan**, sin ADB. **collect** es
exclusivamente una acción manual del usuario, con SDKADB37.0.1 ya presente y
sus tres hashes fijados. Cuatro lecturas mediante USB(`-d`):

```text
adb -d get-state
adb -d shell am get-current-user
adb -d shell cmd package list packages -U --user CURRENT_USER nodomain.freeyourgadget.gadgetbridge.rw4diagnostic
adb -d shell logcat -b main -b system -d -t 2000 -v brief bluetooth:V bt_btif_sock:V bt_btif_sock_rfcomm:V *:S
```

CURRENT_USER se sustituye solo por el entero validado de la segunda consulta.
`:V` selecciona registros que ya existen; no habilita registro verbose ni cambia
propiedades. No `logcat -c`, stream, bugreport, snoop, paquete Bluetooth modificado,
stop/deactivation del core, nueva conexión o comandos Xiaomi.

Buffers solo en memoria del PC,2MiB/consulta,30s/consulta,2000filas/log y32KiB/fila.
No stdout/stderr crudos ni archivos de logs. Errores/formatos no reconocidos no
se interpretan como ausencia de problema. Informe solo esquema fijo de enums,
conteos y booleanos; UID/PID/slot/puerto/direcciones/tiempos no se exportan.

La asociación candidata de una advertencia native con nuestra app exige marcador
de cierre con UID de nuestro paquete y mismo PID/slot en las siguientes64filas
reconocidas. IDs pueden reutilizarse: **no demuestra atribución al intento r131**.
Los PORT_* del callback se cuentan aparte **sin atribución a una app**. No tomar
PORT_SEC_FAILED global como prueba de que falló nuestro vínculo/clave. Resultados
cero pueden deberse a niveles de logging, buffer sobrescrito o formato vendor.

Tests sintéticos/privacidad/errores/límites/PID-slot-UID y plan/sintaxis pasan:

```powershell
node tools/test-phone-rfcomm-logs.mjs
node tools/phone-rfcomm-logs.mjs plan
```

El agente no ejecutó collect ni ADB real. Resultado del teléfono pendiente.

### Pasos manuales propuestos

1. Mantener Mi Fitness funcionando normalmente; no repetir PROBE ni detener apps.
2. Conectar **teléfono** por USB al PC. Habilitar depuración USB normal/autorización
   de este PC si hace falta; no OEM unlocking, root, USB especial Xiaomi o ajustes
   de instalación. El reloj permanece en su estado normal.
3. Desde el repo, ejecutar una vez `node tools/phone-rfcomm-logs.mjs collect`.
   Compartir únicamente el JSON filtrado o el aviso fijo de error.
4. Desactivar depuración USB/revocar autorización del PC al terminar si se habilitó
   para esta lectura. No cambiar el vínculo ni perfiles Bluetooth.

| Componente/efecto | Persistencia/reversión | Riesgo/fallo razonable |
|---|---|---|
| USBADB/lecturas Android | Puede iniciar servidor ADB del PC; autorización/depuración son ajustes persistentes del teléfono. Desactivar/revocar manualmente | Lectura denegada, timeout o formato desconocido; no altera apps/datos/configuración Bluetooth |
| Registros en memoria del PC | Sin archivo crudo; solo JSON emitido | Riesgo de privacidad reducido por filtrado y tests, no garantía de auditoría integral |
| Reloj | No comando/conexión/envío de código solicitado por estas lecturas | Sin escritura de flash/particiones/bootloader/firmware solicitada; no ensayo de recovery |

No se requiere firmware modificado ni reinicio para revertir una operación del
reloj porque el script no inicia ninguna. No habilita carga nativa/instalación
en M2315W1; recovery integral sigue desconocido. Si el registro no aporta una
causa atribuible, revisar alternativas en PC antes de pedir otra prueba física.
