# Resultados de consulta física RW4

## R103 — segundo intento r101: fallo del socket y retorno normal

2026-10-09. Reporte del usuario, sin captura de tráfico ni acceso al teléfono:

```text
D01>D02>D03>D04>E03>E08>D13
E03: falló la conexión Bluetooth
```

Después de salir de nuestra app, el usuario confirma que **Mi Fitness volvió
a conectar y el reloj sigue funcionando normalmente**. No se reporta bloqueo,
instalación de archivos, batería/modelo recibidos ni autenticación exitosa.

| Observación | Interpretación sustentada en fuente r101 |
|---|---|
| D01–D03 | Solicitud manual aceptada y soporte creado |
| D04, E03, sin D05 | `BluetoothSocket.connect()` lanzó IOException antes de marcar conexión establecida |
| Sin D06 ni D08 | No se alcanzó consulta del protocolo ni inicio de autenticación Xiaomi |
| E08 | Expiró el límite local de sesión de30s; no es un watchdog del reloj |
| D13 | Callback local de desconexión; por sí solo no certifica el instante de cierre radio |
| Mi Fitness/reloj normales después | Retorno de uso normal confirmado por usuario para este intento fallido |

No inferir clave inválida, fallo de permisos, incompatibilidad Lua/nativa,
brick ni inviabilidad de Doom. El retorno tras **autenticación exitosa** sigue
sin probarse. La traza no registra texto de excepción ni su causa detallada.

### Transporte revisado en PC

En el worktree de fuentes inspeccionadas usado para r101:

- `RedmiWatch4Coordinator.getConnectionType()` devuelve `BT_CLASSIC`.
- `XiaomiSppSupport.getSupportedService()` selecciona SPP:
  `00001101-0000-1000-8000-00805f9b34fb`.
- Canal predeterminado sin especificar (`-1`); `BtBRQueue` crea socket con
  `createRfcommSocketToServiceRecord`, con resolución SDP del servicio.
- D04 está inmediatamente antes de `connect()`, D05 inmediatamente después;
  E03 está en su rama IOException. Esto localiza el fallo del intento.

Android documenta que la conexión RFCOMM usa SDP para encontrar el canal;
ese enlace Bluetooth precede a la autenticación Xiaomi con nuestra clave.
No se alcanzó el envío del protocolo de inicialización según la traza, pero
sí hubo un intento de enlace/SDP. No afirmar cero efectos internos del reloj.
[Referencia BluetoothDevice](https://developer.android.com/reference/android/bluetooth/BluetoothDevice#createRfcommSocketToServiceRecord(java.util.UUID)),
[BluetoothSocket.connect](https://developer.android.com/reference/android/bluetooth/BluetoothSocket#connect()).

No se ha distinguido entre servicio no disponible, fallo de SDP, conflicto
de sesión o fallo de la pila Android. Forzar Classic repetiría la selección
actual. El comentario upstream sobre posible BLE/iOS no prueba compatibilidad
de ese transporte en M2315W1/2.2.86. No cambiar clave ni vínculo para probar.

### Siguiente checkpoint sin otra conexión

Preparar una lectura manual de caché del teléfono: tipo Bluetooth, estado
del vínculo y presencia de SPP en `BluetoothDevice.getUuids()`. Este método
devuelve la copia local y no inicia descubrimiento de servicios, según
[Android](https://developer.android.com/reference/android/bluetooth/BluetoothDevice#getUuids()).
No llamar `fetchUuidsWithSdp`, discovery, connect, ni probar canales.
Resultado futuro: categorías fijas sin MAC, nombre, UUIDs crudos o claves;
no registrar otros dispositivos. Caché nula o sin SPP no prueba que el reloj
carezca de ese servicio. **Solo propuesta: no implementada, compilada o
ejecutada.** No se solicita un tercer intento físico en esta revisión.

El menú Debug upstream permite compartir logs, no se encontró visor local
del error en `MainDebugFragment`; no pedir logs completos ni activar su
exportación como diagnóstico. No cambios de código ni nuevo APK en R103.

## Historial R100 — primer intento r92

R100, 2026-10-09. Tras recibir nuevamente los pasos de la consulta limitada,
el usuario informa: introdujo la clave y pulsó Conectar; no conectó.

## Resultado disponible

- Entrada privada de clave y acción Conectar reportadas por el usuario.
- Conexión exitosa no reportada; batería/modelo/versión no recibidos según la
  información disponible. No hay evidencia de autenticación exitosa.
- Usuario precisa que la app solo mostró «No conectado»; no reporta un error
  específico. Tiempo y fase del fallo desconocidos.
- **Mi Fitness sigue conectando correctamente**, confirmado por el usuario
  después del intento. Detención previa de Mi Fitness aún sin confirmar;
  tampoco se ha confirmado ningún bloqueo del reloj.
- No se solicitaron ni recibieron claves, capturas, logs crudos o direcciones.

No atribuir el fallo a clave inválida, firmware incompatible, transporte o
política propia sin evidencia. No prueba que Lua o Doom sean inviables.
No hay instalación/transferencia/firmware reportados.

## Revisión PC y próximo paso

**Actualización R101:** detención previa Mi Fitness y Dispositivos cercanos
confirmados por el usuario. La hipótesis de permiso faltante no queda
respaldada por ese reporte. [Instrumentación de etapas](android-diagnostic-stages.md)
preparada/compilada en PC; aún sin instalación/UI/radio r101. Notas inferiores
describen la investigación inicial R100.

Lectura de fuentes generadas r92: UI emite ticket manual, servicio lo consume,
soporte abre sesión y SPP intenta negociación antes de autenticación. Ticket
caduca a los 5 s; sesión a los 30 s. Existen ramas de rechazo sin detalle
visible suficiente. Auth tiene mensaje específico de fallo; SPP y socket
tienen otros fallos posibles. Esto describe el código, no la fase que alcanzó
este intento ni una causa demostrada. No se modificó ni recompiló la app.

Pregunta enviada al usuario: salir del diagnóstico, abrir Mi Fitness y
confirmar retorno; indicar texto visible de la app y si Mi Fitness estaba
detenida antes. Si Android permite forzar detención del diagnóstico, puede
usarse para cerrar su proceso. No olvidar vínculo, resetear ni repetir Conectar.

Respuesta recibida: Mi Fitness conecta y diagnóstico solo mostró «No conectado».
Falta confirmar detención previa de Mi Fitness y permisos Dispositivos cercanos.
No concluir que llegó a autenticación ni que la clave fue rechazada. Revisada
también ruta UI/servicio/factory: existen filtros antes de abrir el socket.
La variante declara debuggable false; no atribuir el fallo a stressTestConnect
de las ramas DEBUG sin evidencia de APK distinto.

Con los datos restantes, localizar la etapa del fallo y preparar corrección o
diagnóstico mínimo en PC si hace falta. Un nuevo intento físico requiere
revisión del resultado; el plan previo autorizaba un solo intento. Instalar
watchfaces y ejecutar nativo siguen siendo pasos posteriores separados.
