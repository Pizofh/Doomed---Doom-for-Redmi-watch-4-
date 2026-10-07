# Primera consulta RW4 — borrador para revisión, no autorizado

R94, 2026-10-06. Objetivo: un intento de autenticación seguido de consultas
de batería e información; después retorno a Mi Fitness. No instalar código,
watchfaces, WAD ni firmware. Este documento no abre el gate físico.

## Artefacto y evidencia

RW4 Diagnostics r92/code253, package
`nodomain.freeyourgadget.gadgetbridge.rw4diagnostic`.
SHA256 `1ed56b90fc7e56daf0ceff4f8eec8c799db8eff95e899ada41981c39ee783c97`.
Firma oficial apksigner v1/v2 válida, mismo certificado local anterior.
Usuario ya instaló y probó abrir/Salir/reabrir sin permisos y con lista vacía.
El manifiesto carece de acceso SMS, lector de notificaciones, accesibilidad
y administrador. No nueva compilación necesaria.

Unidad declarada: M2315W1, firmware mostrado 2.2.86, Mi Fitness 3.59.1i.
Región, versión Android y build Vela/ABI desconocidos. El coordinator RW4 de
Gadgetbridge 0.94.0 reconoce este modelo por nombre y usa BT_CLASSIC/SPP.
[Soporte upstream](https://gadgetbridge.org/gadgets/wearables/xiaomi/#redmi-watch-4)
es experimental: no garantiza compatibilidad 2.2.86.

## Prerrequisitos antes de solicitar aprobación

- Comprobar solo en Ajustes Bluetooth del teléfono si el reloj figura entre
  dispositivos **ya vinculados/guardados**. No pulsar su nombre, conectar,
  emparejar, olvidar ni desvincular. Estar visible entre dispositivos nuevos
  no prueba un vínculo Android. Nuestra variante exige BOND_BONDED.
- Confirmar que Mi Fitness sigue usando su registro original y funciona.
  Conservar sus datos y anotar ajustes importantes localmente; una sync no
  es backup completo de firmware. No borrar sus datos ni hacer factory reset.
- Confirmar versión Android para concretar los permisos: Nearby en Android
  12+, ubicación mientras se usa para descubrimiento en Android 11 o anterior.
  Publicar notificaciones propias es distinto de leer notificaciones de otras
  apps. Acceso sensible adicional, si se solicita, exige detenerse.
- Preparar entrada privada de la clave en la app, sin pegarla en chat/Git ni
  activar TRACE. Hay candidato local, pero vigencia/unidad no demostradas.
  El procedimiento de entrega privada aún debe concretarse; no enviar logs.

Si falta vínculo existente, no crear otro como atajo: revisar alternativa.
No conectar para averiguar si el vínculo existe.

## Secuencia propuesta, solo después de revisión y aprobación explícitas

No comandos de terminal/ADB sobre teléfono o reloj; operación manual en UI.

1. Anotar batería/versiones y estado Mi Fitness. Detener temporalmente Mi
   Fitness desde Ajustes del teléfono, conservando app/datos/vinculación.
   Puede interrumpir notificaciones/sync durante la prueba. No desinstalarla.
2. Abrir RW4 Diagnostics y conceder únicamente los permisos concretados arriba.
   Entrar en Añadir dispositivo, seleccionar solo el RW4 ya vinculado. Si
   propone desvincular, resetear, emparejar de nuevo o actualizar, cancelar.
3. Introducir privadamente la clave en la pantalla AuthKey. Guardar registra
   dispositivo/clave en almacenamiento privado del teléfono; la variante no
   inicia una conexión en este paso. Comprobar que queda desconectado.
4. En el menú de ese dispositivo elegir Conectar una sola vez. La fuente
   revisada genera un ticket manual ligado al destino, válido 5 s y consumible
   una vez por proceso. La sesión admite 30 s según reloj monotónico; no es
   un watchdog del reloj ni garantiza cierre físico puntual del socket.
5. Observar autenticación, batería/modelo/versión o fallo durante esos 30 s.
   No tocar instalador, sincronización, controles del reloj ni repetir intento.
   Si es necesario, menú Desconectar, Bluetooth OFF y detener esta app.
6. Salir de RW4 Diagnostics y forzar detención si Android lo permite. Abrir
   Mi Fitness con Bluetooth restaurado y comprobar retorno de conexión y
   funciones normales. Si no retorna, detener pruebas y revisar el estado;
   no borrar bonds, resetear, cambiar firmware o reintentar automáticamente.

Rótulos de UI restantes y retorno en este Android deben confirmarse durante
el procedimiento autorizado; no utilizar instrucciones genéricas de pairing.

## Comandos y efectos previstos

Handshake protobuf 1/26 y 1/27, negociación y ACK del transporte SPP; después
GET batería 2/1 e información 2/2. Metadatos del teléfono/idioma se envían
durante auth. El filtro propio bloquea otros comandos, payloads inesperados y
transferencias sendDataChunk. Se omiten sync de hora/perfil/salud/calendario/
temperatura e inicialización general. Pruebas Java y socket falso verifican
contratos, no el comportamiento firmware ni cierre de la radio en esta unidad.

| Acción | Componente | Persistencia / reboot | Riesgo y retorno |
|---|---|---|---|
| Permisos, registro y clave | App privada del teléfono | Sí; reboot no borra, desinstalar esta app sí | Exposición si se comparten logs/backups; no compartir |
| Detener Mi Fitness | Proceso teléfono | Datos conservados; abrir app para retorno | Interrupción temporal de funciones conectadas |
| Auth y consultas | Bluetooth/SPP y handlers stock del reloj | Escrituras internas de auth desconocidas; no garantizar reversión por reboot | Conflicto de conexión/auth, bloqueo o reboot posibles |
| Instalar archivos / escribir particiones / bootloader | Fuera del plan | No mecanismos de upload/flash/boot invocados | Prohibido; gate separado |

No firmware modificado, exploits ni nativo en reloj. El primer intento es
comunicación activa, no lectura pasiva ni una conexión con cero escrituras
persistentes garantizadas. Una escritura ya iniciada puede terminar después
del límite de sesión.

## Fallo, recovery y condición de revisión

Peor fallo razonable: auth fallida, conflicto con Mi Fitness, pérdida temporal
de funciones conectadas o bloqueo/reinicio del reloj. Soft brick no descartado
si un fallo deja estado persistente o bloquea UI; riesgo sin cuantificar.
No vía de escritura de firmware/boot prevista, pero no afirmar riesgo cero de
hard brick por bugs desconocidos del firmware.

Xiaomi documenta [reboot forzado RW4](https://www.mi.com/global/support/faq/details/KA-228897/)
manteniendo botón aproximadamente 12 s. No probarlo como rutina. Eso no es
recovery de firmware corrupto; no hay restauración de particiones/boot validada
para esta M2315W1/2.2.86. Por la stop condition original, este límite debe
revisarse explícitamente con el usuario antes de autorizar la comunicación.

Rollback propuesto: desconectar/BT OFF, detener diagnóstico, restaurar BT y
abrir Mi Fitness sin modificar el registro. No se ha ensayado en esta unidad.
No garantía de que revierta efectos internos de auth. Si el usuario no acepta
este límite, continuar solo en PC y buscar evidencia/recovery específicos.

Resultado a registrar: auth sí/no, consultas recibidas sí/no, desconexión y
retorno Mi Fitness sí/no, cambios observados. Nunca claves, MAC, serial ni
logs crudos. Un éxito no abre el gate de instalación de watchfaces o nativo.
