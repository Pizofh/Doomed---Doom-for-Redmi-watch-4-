# Primera consulta RW4 — intento sin conexión, retorno confirmado

**Estado vigente R103:** segundo intento r101 finalizado con
`D01>D02>D03>D04>E03>E08>D13`; fallo del socket antes de auth. Usuario
confirma Mi Fitness y reloj normales después. [Resultado](first-rw4-query-result.md).
No repetir el procedimiento inferior; es historial del intento R102.
Próximo checkpoint: diagnóstico de caché local Android, todavía sin implementar.
No nueva consulta física, cambio de vínculo, transporte o firmware autorizado aquí.

## R102: segundo intento manual con etapas, aún sin resultado

2026-10-09. Usuario pidió continuar diagnóstico y confirma actualización r101
instalada. Primer intento r92 no conectó; retorno Mi Fitness normal confirmado.
Detención previa de Mi Fitness y permiso cercano confirmados posteriormente.

Artefacto actual: `0.94.0-rw4-diagnostic-r101`, mismo package/certificado,
SHA256 `61888725cda97a93f52e43cabf745c314c5d56c168c3a97fae5cca78ffb8c3a3`.
[Verificación y etapas](android-diagnostic-stages.md). Cambia visualización y
preferencias privadas del teléfono; mantiene exclusivamente handshake/GET,
ticket único, sesión30s y uploads/reconexión automática bloqueados.

Secuencia guiada: forzar detención Mi Fitness sin borrar datos; Bluetooth ON;
abrir r101, verificar pantalla y dispositivo existente; un toque Conectar,
esperar30s, anotar solo cadena/código/mensaje fijo; Desconectar si disponible,
Salir; abrir Mi Fitness y confirmar retorno. Si pide clave de nuevo o el flujo
no corresponde, detener antes de conectar; no reinstalar/desvincular/resetear.

Componente afectado: transporte/auth stock y consultas de batería/información;
ninguna instalación/escritura de particiones/bootloader prevista. Persistencia
explícita nueva: códigos en teléfono; efectos internos de auth del reloj siguen
desconocidos. Reversión propuesta: cerrar diagnóstico y volver a Mi Fitness;
no garantizar que reboot revierta escrituras internas. Peor fallo razonable,
riesgo de bloqueo/reinicio y recovery limitado al reboot/gestión de UI
permanecen como en el expediente inferior. No recovery de firmware corrupto
validado ni cuantificación de brick. Evidencia de compatibilidad: coordinator
RW4 y nombre/registro de esta unidad, sin éxito auth/GET específico2.2.86.

Un solo intento adicional solicitado/guiado, nunca automático. Instalación
de watchface/nativo/firmware siguen fuera del alcance. Segundo resultado
pendiente; no declarar éxito por instalación de la app en el teléfono.

## Historial del primer intento

**R100,2026-10-09:** después de retomar guía, usuario reporta clave introducida
y un toque Conectar, sin conexión. Después confirma Mi Fitness conecta bien
y diagnóstico solo mostró «No conectado». [Resultado y pendientes](first-rw4-query-result.md).
No repetir el intento; falta confirmar prerrequisitos y localizar etapa del fallo.
Los apartados de autorización/diferimiento inferiores conservan el historial.

**R97:** tras consultar seguridad/recovery, el usuario pide investigar pruebas
específicas antes de hacerlo. La autorización R96 queda como antecedente;
no continuar descubrimiento/clave/Conectar durante esta revisión. [Hallazgos](rw4-auth-return-research.md).
Última UI reportada: clave requerida; no guardado ni auth confirmados.

**R96:** usuario dice «hagámoslo, qué hago, paso a paso» tras revisar alcance
y recovery limitado. Autoriza descubrimiento/registro local/entrada privada
de clave y **un intento** de autenticación/consultas, con retorno a Mi Fitness
según este plan. No pedir aprobación otra vez. No autoriza instalación en
reloj, firmware, nuevas vinculaciones, reintentos ni código nativo. El agente
solo guía; no ADB/radio/acciones automatizadas sobre hardware.

Actualizado R95, 2026-10-06. Objetivo: un intento de autenticación seguido de consultas
de batería e información; después retorno a Mi Fitness. No instalar código,
watchfaces, WAD ni firmware. Solo se abre el gate de esta consulta limitada;
el gate de instalación y ejecución nativa permanece cerrado.

## Artefacto y evidencia

RW4 Diagnostics r92/code253, package
`nodomain.freeyourgadget.gadgetbridge.rw4diagnostic`.
SHA256 `1ed56b90fc7e56daf0ceff4f8eec8c799db8eff95e899ada41981c39ee783c97`.
Firma oficial apksigner v1/v2 válida, mismo certificado local anterior.
Identificación visual: aapt2 del APK-r92 confirma application-label
«RW4 Diagnostics», pero launchable-activity ControlCenterv2 conserva label
«Gadgetbridge». El icono del launcher puede aparecer como Gadgetbridge.
Si hay dudas u otras instalaciones, verificar versión
0.94.0-rw4-diagnostic-r92 en información de la app antes de conceder permisos.
Usuario ya instaló y probó abrir/Salir/reabrir sin permisos y con lista vacía.
El manifiesto carece de acceso SMS, lector de notificaciones, accesibilidad
y administrador. No nueva compilación necesaria.

Unidad declarada: M2315W1, firmware mostrado 2.2.86, Mi Fitness 3.59.1i.
Teléfono Xiaomi HyperOS 3.0.302.0, Android 16 BP2A.250605.031.A3, comunicado
por usuario R95. El usuario observa RW4 ya emparejado en Ajustes Bluetooth y
Mi Fitness conecta bien. Esto satisface la comprobación manual del vínculo,
no una consulta instrumental BOND_BONDED ni prueba de SPP/auth propia.
Región y build Vela/ABI del reloj desconocidos. El coordinator RW4 de
Gadgetbridge 0.94.0 reconoce este modelo por nombre y usa BT_CLASSIC/SPP.
[Soporte upstream](https://gadgetbridge.org/gadgets/wearables/xiaomi/#redmi-watch-4)
es experimental: no garantiza compatibilidad 2.2.86.

## Prerrequisitos y permisos concretos

- **Completado por usuario:** reloj ya emparejado en Ajustes Bluetooth.
  No crear otro vínculo, olvidar ni desvincular. Nuestra variante vuelve a
  exigir BOND_BONDED antes de registrar y al construir el soporte.
- **Completado por usuario:** Mi Fitness conecta normalmente antes de probar
  nuestra app. El retorno después de la futura autenticación sigue sin probar.
  Conservar sus datos y anotar ajustes importantes localmente; una sync no
  es backup completo de firmware. No borrar sus datos ni hacer factory reset.
- **Android 16 confirmado:** conceder Dispositivos cercanos a RW4 Diagnostics
  para SCAN/CONNECT. La variante declara SCAN neverForLocation y ubicación con
  maxSdk30, por lo que no debe pedir ubicación en este teléfono. Se puede
  permitir publicar la notificación propia del servicio; no acceso a leer
  notificaciones de otras apps, accesibilidad, SMS, contactos o almacenamiento.
  [Permisos Bluetooth Android](https://developer.android.com/develop/connectivity/bluetooth/bt-permissions).
  Si pide acceso adicional, cancelar y comunicar solo el nombre del permiso.
- Entrada privada de la clave, **solo durante el procedimiento autorizado**:
  abrir con Bloc de notas un log propio de `tools/local/mi-fitness-logs` en el
  PC, buscar `encryptKey`, comprobar contexto Redmi Watch 4 y tomar únicamente
  sus 32 caracteres hexadecimales. Transcribirlos en el teléfono; no enviar
  captura/chat/log, guardar otro archivo ni usar portapapeles sincronizado.
  Si el campo/contexto no es inequívoco o hay varios valores, detenerse. No
  elegir un token genérico por su longitud. El candidato previo no demuestra
  vigencia ni autenticación: se verificará únicamente con el intento aprobado.

Si falta vínculo existente, no crear otro como atajo: revisar alternativa.
No conectar para averiguar si el vínculo existe.

## Secuencia propuesta, solo después de revisión y aprobación explícitas

No comandos de terminal/ADB sobre teléfono o reloj; operación manual en UI.

1. Anotar batería/versiones y estado Mi Fitness. Detener temporalmente Mi
   Fitness desde Ajustes del teléfono, conservando app/datos/vinculación.
   Puede interrumpir notificaciones/sync durante la prueba. No desinstalarla.
2. Abrir RW4 Diagnostics y conceder únicamente los permisos concretados arriba.
   Entrar en Añadir dispositivo, seleccionar solo el RW4 ya vinculado. Esta
   pantalla puede iniciar descubrimiento Bluetooth activo; forma parte de
   esta autorización propuesta, no de la prueba offline anterior. Si
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

Pantalla de clave: «Clave de autenticación para …», según recursos españoles
del APK; botón submit_auth_key_button guarda SharedPreferences y devuelve
RESULT_OK. DiscoveryActivityV2 registra DB y vuelve a la lista sin conectar.
El menú «Conectar» emite el ticket; «Desconectar» cierra la sesión. Si los
rótulos/flujo reales difieren, detenerse antes de una acción no reconocida.

**Aviso «Ya vinculado» observado por usuario:** DiscoveryActivityV2.preparePair
conserva el texto genérico que sugiere borrar el vínculo si falla. Revisada la
callback exacta del APK r92: Aceptar/OK solo llama checkAuthKeyAndPair, que
exige RW4 con bond existente y abre AuthKeyActivity. No borra bond ni conecta.
Se puede aceptar este aviso para llegar a la clave; **no seguir su sugerencia
de eliminar el vínculo**, tampoco si falla. No requiere nuevo build/intento.
Una solicitud real de nuevo pairing/reset/desvinculación sigue siendo stop.

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
| Descubrimiento Bluetooth | Radio teléfono y dispositivos próximos | Sin escritura persistente al reloj solicitada; no garantía sobre firmware | No seleccionar otros dispositivos ni aceptar nuevo pairing |
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
