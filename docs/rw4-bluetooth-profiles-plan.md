# R108 — aislar perfiles Bluetooth gestionados por Android

2026-10-10. Tras pedir avanzar, el usuario inspecciona los ajustes Bluetooth
del teléfono con Mi Fitness detenido según la guía. Reporta llamadas telefónicas
conectadas al audio, y dispositivo de entrada conectado, ambos interruptores
encendidos; compartir contactos/historial está desactivado.

Eso aporta evidencia de perfiles conectados gestionados por Android. No
demuestra que SPP esté abierto, ocupado ni que esos perfiles causaran G08.
No se presupone el protocolo exacto del perfil etiquetado «entrada».
Cerrar una pantalla de Mi Fitness tampoco equivale a forzar su detención.

## Operación concreta propuesta, solo manual

Se conserva APK r106, vínculo, clave y acceso a contactos desactivado.
No nuevo build ni herramienta ejecutando radio/ADB físico.

1. Forzar detención de Mi Fitness y RW4 Diagnostics desde los ajustes del
   teléfono. No borrar datos. La detención de Diagnostics permite un nuevo
   proceso para su ticket de un intento, no un reintento automático.
2. En los detalles Bluetooth de esta misma unidad, desactivar solamente los
   interruptores «Llamadas telefónicas» y «Dispositivo de entrada» observados.
   Bluetooth general permanece encendido. No pulsar Olvidar/Desvincular.
3. Comprobar que esos dos perfiles ya no figuran conectados. Si siguen
   conectados o Android pide emparejar de nuevo, detener antes del ensayo
   y comunicar el estado; no aceptar un nuevo bond ni explorar otros canales.
4. Si ambos perfiles se desconectaron, abrir r106, tarjeta del reloj →
   Probar solo Bluetooth → confirmar un único intento. Se utiliza el mismo
   socket seguro SPP/SDP, sin clave/auth/GET ni cambio de transporte.
5. Copiar informe saneado y cerrar Diagnostics. Volver a activar los dos
   interruptores originales y abrir Mi Fitness para comprobar uso normal.
   Si cualquier paso falla, restaurar los interruptores y no repetir PROBE.

Se cambia una condición conjunta: perfiles Android habilitados vs deshabilitados.
Incluso si ahora conecta, eso no distingue cuál perfil intervino ni excluye
que el nuevo proceso/estado temporal de la pila influyera. Un fallo equivalente
debilitaría esta hipótesis, sin demostrar incompatibilidad de firmware.

## Alcance, reversión y riesgo

| Aspecto | Evaluación de esta operación |
|---|---|
| Comandos/acciones | UI Android: forzar detención, dos toggles, confirmación PROBE r106; sin comandos shell |
| Componente | Preferencias/perfiles Bluetooth del teléfono y señalización stock con el reloj; luego RFCOMM/SDP |
| Almacenamiento persistente | Sí: preferencias de perfiles e informe privado en teléfono; no escritura de archivos/particiones del reloj implementada. Estado interno Bluetooth del reloj no auditado |
| Particiones/bootloader/firmware | Ninguna operación de flash, recovery o carga nativa implementada |
| Reversible por reboot | No confiar en reboot: los toggles pueden persistir; reactivar ambos explícitamente |
| Reversión | Cerrar Diagnostics, restaurar ambos toggles, abrir Mi Fitness, comprobar conexión/funciones |
| Peor fallo razonable | Llamadas/entrada suspendidas durante la prueba; fallo de enlace o reconexión temporal |
| Soft/hard brick | No observado en intentos previos y no identificada ruta de escritura de firmware aquí; no cuantificar como riesgo cero |
| Recovery conocido | Mi Fitness/reloj funcionan tras R107 por reporte; reinicio normal documentado previamente, no recovery integral de firmware corrupto validado |
| Compatibilidad concreta | M2315W1/2.2.86 identificado por usuario; perfiles observados en su teléfono; r106 llegó a create/connect/close. SPP exitoso sigue sin demostrar |

[Android distingue desconectar de olvidar y admite ajustes por accesorio](https://support.google.com/android/answer/9417604?hl=es).
La UI HyperOS concreta se basa en la lectura del usuario; no se operó desde PC.
Durante la prueba las funciones de esos perfiles quedan deshabilitadas;
restaurarlas es parte del procedimiento, no una modificación permanente deseada.

Resultado todavía pendiente. No ejecutar consulta de batería/autenticación,
instalar watchface/Doom, cambiar permisos/claves/bond, firmware ni probar BLE.
