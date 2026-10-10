# Primer intento de consulta física

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
