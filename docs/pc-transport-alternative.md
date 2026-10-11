# R147 — alternativa de transporte desde Windows

2026-10-11. La consulta upstream es ayuda externa; no es una dependencia técnica
obligatoria para continuar. El usuario pregunta por vías autónomas después de
cerrar el bucle de diagnósticos Android. Se evalúa un host distinto antes de
proponer nuevas operaciones sobre el reloj.

## Evidencia local nueva

Se realizó, con aprobación fuera del sandbox, esta lectura del inventario del PC:

```powershell
Get-CimInstance -ClassName Win32_PnPEntity -ErrorAction Stop |
  Where-Object { $_.PNPClass -eq 'Bluetooth' -and $_.Service -eq 'BTHUSB' } |
  Select-Object Status,Manufacturer,Name
```

Windows reportó `Realtek Bluetooth Adapter`, fabricante Realtek Semiconductor
Corp., estado `OK`. No se imprimieron direcciones Bluetooth, identificadores de
instancia ni seriales. No se usaron ADB, discovery, SDP, pairing o sockets.
La denegación previa de CIM era una limitación del sandbox, no prueba de ausencia
de adaptador. El resultado actual tampoco prueba radio encendida, servicio SPP
remoto disponible ni compatibilidad del reloj con Windows.

## Por qué es un experimento distinto

[Microsoft documenta clientes Bluetooth RFCOMM](https://learn.microsoft.com/en-us/windows/win32/bluetooth/bluetooth-and-socket)
y [connect con AF_BTH](https://learn.microsoft.com/en-us/windows/win32/bluetooth/bluetooth-and-connect).
La API permite dirigir una conexión al servicio; una resolución de servicio o
una apertura real puede comunicarse con el dispositivo. No es una lectura pasiva
del inventario local.

Un cliente propio de Windows no usa la pila Android/HyperOS ni depende del
servicio Lyra del teléfono. Si fuera posible abrir SPP, tendríamos una nueva
vía para desarrollar transporte. Si falla, por sí solo no atribuye la causa al
reloj: driver, seguridad del enlace, bonding y estado remoto pueden intervenir.
Un vínculo diferente tampoco representa un A/B idéntico al vínculo Android.

## Siguiente checkpoint autónomo

Preparar un cliente mínimo de PC, con pruebas offline y una abstracción de
transporte simulada. La preparación no tiene que escanear ni conectar el reloj.
El alcance del primer ensayo físico eventual sería exclusivamente apertura
segura/cierre de SPP, sin autenticación Xiaomi ni envío de paquetes de aplicación.
No reutilizar código nativo ARM del emulador como ejecutable Windows o RW4.

Requisitos del cliente antes de ese ensayo:

- Default sin radio; modo físico explícito separado de pruebas simuladas.
- Servicio SPP fijo, seguridad documentada y sin fallback inseguro/canales manuales.
- Un intento, timeout acotado y cierre garantizado del socket.
- Sin retries, bonding automático, transferencias, comandos Xiaomi o persistencia.
- Categorías de error y tiempos sin direcciones, claves, payloads ni logs crudos.
- Fuente propia legible y build con herramientas oficiales existentes o revisadas.

Falta determinar si esta unidad permite el enlace desde PC sin perder su vínculo
actual. No dar por hecho que Windows dispone ya de las claves de enlace ni que
la clave de autenticación Xiaomi sustituye el pairing Bluetooth. No emparejar,
desvincular, migrar, resetear o cambiar permisos automáticamente.

Antes de un ensayo físico se debe anexar al plan de dispositivo el comando,
efectos sobre vínculos/almacenamiento persistente, rollback, fallos posibles,
recovery conocido y evidencia M2315W1. Requiere revisión del usuario; la aprobación
para publicar una consulta o leer el inventario PC no autoriza ese ensayo.

## Otras vías y su estado

| Vía | Trabajo autónomo posible | Límite actual |
|---|---|---|
| Cliente Windows | Preparación y pruebas offline del transporte; radio reconocida | Compatibilidad y efectos de vínculo RW4 por establecer |
| Instalación con Mi Fitness stock | Investigar entrada oficial o flujo de distribución de esferas | Usuario no tiene importación Lua local visible; no asumir que personalizar foto instala código |
| QuickApp oficial | Revisar runtime y canales soportados | [Debug físico oficial](https://iot.mi.com/vela/quickapp/en/tools/devicedebug/start.html) documentado para S4/partners, no demuestra RW4 |
| Camino comunitario de EasyFace | Estudiar empaquetado y procedencia | [README original](https://github.com/m0tral/EasyFace#how-to-install-custom-watchfaces) propone Mi Fitness mod vía Telegram; no instalar ni usar como atajo autorizado |
| Emulador y DevOps | Build reproducible, CI y pruebas de nuestro port | Útil para el proyecto, pero no resuelve instalación/ABI/loader físicos |

No presentar ninguna vía como soporte nativo confirmado de M2315W1. La respuesta
de Gadgetbridge puede ahorrar trabajo, pero no condiciona el avance offline.
Publicación aún no realizada por falta de navegador disponible; autorización R146
vigente y mensaje preparado. No nueva APK Android, intento SPP, captura HCI o
operación sobre el reloj en R147.
