# R133 — un PROBE después de apagar y encender Bluetooth del teléfono

2026-10-10. Plan manual preparado, no realizado. La lectura pasiva R132 terminó
sin registros nativos reconocidos. No hay una corrección de transporte demostrada.
Se reutiliza la app r131 instalada; no se compila, instala ni instrumenta otra APK.

## Propósito y límites

Cambiar una condición que los intentos anteriores no comprobaron de forma
documentada: cerrar todas las conexiones del adaptador del teléfono antes del
PROBE. Detener Mi Fitness retiró su ServiceRecord, pero no demostró cierre del
socket del core. Denegar su permiso Nearby ya se probó en R113 sin resolver
el fallo; lo nuevo aquí es el ciclo completo OFF→ON antes del intento.

Android documenta que apagar el adaptador cierra las conexiones y sus servicios
Bluetooth. Su API disable/enable está restringida para apps desde Android13;
**no se usa esa API, ADB, reflexión ni una evasión**: el usuario opera el ajuste
normal del teléfono. Esperar el estado apagado real, no solo pulsar el interruptor.
[Contrato del adaptador](https://developer.android.com/reference/android/bluetooth/BluetoothAdapter#disable()).

Esto no borra el vínculo deliberadamente ni equivale a borrar caché/datos. Tampoco
garantiza acceso exclusivo después de encender: el core u otros componentes pueden
volver a conectar. R121 ya identificó reconexión condicional en el servicio Xiaomi;
la denegación del permiso de Mi Fitness no deniega el permiso de ese servicio.
Si vuelve a fallar, no concluir incompatibilidad definitiva ni ocupación probada.

La ficha RW4 de Gadgetbridge sigue declarando soporte experimental/desconocido.
La recomendación genérica de forzar Classic no cambia nuestro coordinator ya
Classic. El PR3693 enlazado no pudo leerse; no se atribuye una solución a ese PR.
[Ficha RW4](https://gadgetbridge.org/gadgets/wearables/xiaomi/#redmi-watch-4),
[tipos de conexión](https://gadgetbridge.org/basics/topics/xiaomi-protobuf/#multiple-connection-types).

## Secuencia manual única

Unidad M2315W1/2.2.86, teléfono HyperOS3.0.302.0/Android16, Mi Fitness3.59.1i.
Sin comandos de terminal ni USB. Hacerlo cuando no se dependa de llamadas o
accesorios Bluetooth durante unos minutos.

1. Mi Fitness debe estar funcionando normalmente antes de empezar. En sus
   ajustes Android, anotar el permiso actual de **Dispositivos cercanos** y
   denegarlo temporalmente. No cambiar otros permisos, perfiles o autostart.
2. Forzar detención únicamente de Mi Fitness y RW4 Diagnostics/Gadgetbridge.
   Si nuestra app ya terminó y el botón está deshabilitado, continuar. No detener
   ni deshabilitar Bluetooth o Mi Connect Service como aplicaciones del sistema.
3. En Ajustes del teléfono, apagar Bluetooth. Verificar que queda apagado y
   esperar 10 segundos; encenderlo y esperar que indique encendido. No abrir
   Mi Fitness ni cambiar el vínculo. No repetir ciclos ni reiniciar el reloj.
4. Abrir nuestra app r131 → tarjeta RW4 → **Probar solo Bluetooth**, confirmar
   una vez y mantener el informe en primer plano hasta su cierre (máximo30s).
   Si solicita emparejamiento nuevo, cancelar y terminar la prueba. No elegir
   consulta de batería, inventario ni cambiar clave.
5. Copiar el informe filtrado. Cerrar nuestra app, restaurar el permiso original
   de Mi Fitness, abrirla y comprobar sincronización y reloj normal. Comunicar
   informe y retorno, aunque el intento falle. No repetirlo.

## Efectos y recuperación

| Paso | Persistencia y reversión | Peor fallo razonable / riesgo |
|---|---|---|
| Permiso y detención de Mi Fitness | Permiso persistente del teléfono; restaurarlo y abrir Mi Fitness. Reboot solo no restaura ese permiso | Sincronización suspendida, posible reinicio del proceso por Android; no borrar datos |
| Adaptador OFF→ON | Estado del ajuste del teléfono; dejarlo encendido como al inicio | Se desconectan reloj y accesorios temporalmente; posible fallo de reconexión/pila que requiera reinicio normal del teléfono |
| PROBE r131 | Informe en almacenamiento de nuestra app; cachés Bluetooth internas no auditadas | Conexión fallida/desconexión transitoria; cerrar nuestra app y restaurar Mi Fitness. Estimación baja para transporte, no garantía de riesgo cero |

El PROBE conserva el socket seguro/API pública existente y termina antes del
protocolo Xiaomi: no auth, código, archivos, configuración o firmware enviados.
No escritura explícita de flash/particiones/bootloader del reloj, firmware
modificado, apertura física o herramientas de flash. Las escrituras internas
habituales de su pila Bluetooth no se han auditado. No es un backup ni valida
recovery; recuperación integral de M2315W1 sigue desconocida. No se espera
soft/hard brick de esta operación ordinaria de transporte, pero no existe una
medición que permita cuantificar ese riesgo. Si Mi Fitness no vuelve a conectar
o el reloj presenta anomalías, detener pruebas y reportar, sin reset/desvincular.

## Criterio de decisión

- D05/D14/D17: apertura/cierre local logrados bajo la nueva condición; revisar
  resultado antes de proponer autenticación. No demuestra aún instalación viable.
- E03/R02/L01 otra vez: este ciclo no resolvió la apertura; no repetir variantes
  de permisos/perfiles ni construir otra APK de diagnóstico genérico. Elegir
  evidencia de protocolo más profunda con plan y revisión de privacidad, o una
  alternativa de transporte respaldada por código específico.
- Otro error/estado o retorno anómalo: interpretar el informe y restaurar primero.

Solo documentación modificada en PC. No nuevo test de radio, ADB físico,
compilación o ejecución de APK por el agente. Gates de instalación/nativo/firmware
del reloj permanecen cerrados.
