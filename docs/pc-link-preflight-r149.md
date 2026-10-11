# R149 — qué significa conservar el vínculo con Mi Fitness

2026-10-11. El usuario pregunta cómo se evaluará el enlace Windows/RW4. El cliente
R148 y sus simulaciones no responden a la capacidad de coexistencia del reloj.
No existe aún una ruta física Windows validada ni un comando de conexión habilitado.

## Lectura local realizada

Se aprobó una lectura CIM del inventario PnP de Windows, filtrando únicamente
registros cuyo nombre empieza por Redmi Watch 4. Salida limitada:

```json
{"checkpoint":"R149","nameMatchingPnpRecords":0,"authenticatedWindowsBondVerified":false,"lookup":"local-PnP-only","bluetoothOperationRequested":false,"watchCommandRequested":false}
```

No nombres, direcciones, seriales o identificadores de instancia exportados;
no discovery, pairing, sockets, ADB ni cambios de configuración. Cero coincidencias
por nombre no prueba ausencia de un bond: puede haber alias o una representación
distinta del dispositivo. PnP tampoco prueba claves de enlace válidas. Una futura
consulta de la caché Bluetooth debe distinguir registro recordado y autenticado,
sin inquiry ni conexión; aún no implementada/ejecutada.

## Evidencia oficial RW4

[FAQ original Xiaomi RW4](https://www.mi.com/uk/support/faq/details/KA-91528/),
sección de cambiar teléfono: para la misma cuenta describe Connect New Phone;
para una cuenta diferente describe reset y nuevo enlace. Esto es documentación
de migración, **no un contrato de dos hosts simultáneos ni de pairing con Windows**.
No se solicitó activar esos menús, desvincular o resetear.

Una [tabla oficial Xiaomi](https://www.mi.com/global/support/faq/details/KA-694585/)
en la FAQ de Watch 6 incluye columnas explícitas Watch 6, Watch 5 y **Watch 4**.
La columna RW4 declara SPP para pairing Android, HFP para llamadas e HID para
cámara, y BLE para pairing iPhone/ANCS/AMS. Es evidencia documental específica
del RW4, aunque esté publicada en una comparación de otro modelo. No prueba
servicio abierto a Windows, coexistencia de bonds ni disponibilidad BLE en la
unidad firmware 2.2.86. No iniciar una nueva ronda BLE basándose solo en esa tabla.

La misma columna declara RAM 32 MB y ROM 256 MB. Se registra como especificación
oficial comercial de RW4, no como medición de nuestra unidad ni RAM libre del
motor. No identifica SRAM/PSRAM, chip de flash, mapas de memoria o permisos.

## Secuencia que tendría sentido, sin autorizarla todavía

1. Comprobar si Windows tiene ya un vínculo Bluetooth autenticado con la unidad.
   No confundir un nombre en caché con identidad o bond válido.
2. Si no lo tiene, un cliente seguro puede requerir pairing nuevo. Determinar
   efectos y retorno antes de proponerlo: la clave Xiaomi extraída para el
   protocolo de la app no sustituye a las credenciales Bluetooth de Windows.
3. Solo después del preflight y un plan revisado: un intento SPP de apertura/cierre,
   sin autenticación Xiaomi, bytes de aplicación o transferencia de código.
4. Verificar retorno y sincronización normal. Si requiere migración/reset,
   detener: es una decisión adicional, no un paso automático de diagnóstico.

No garantizar que esta secuencia pueda completarse sin alterar el vínculo actual.
Si el firmware solo acepta un host, una prueba desde PC tendría un coste de
migración temporal que debe valorarse aparte. No inferir esto como restricción
confirmada de RW4 a partir del procedimiento de migración.

La preparación offline avanza sin depender de upstream; demostrar aceptación
física de otro host requiere evidencia específica o un ensayo revisado. Seguir
generando simulaciones no demuestra esa propiedad. No se abrió el gate físico
ni se modificó el ejecutable R148 en este checkpoint.
