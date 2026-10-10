# R131 — localizar la apertura antes de cambiar el transporte

2026-10-10. Objetivo: obtener una ubicación interna del fallo que antes quedaba
reducido a G08. No es una corrección de la conexión ni demuestra compatibilidad
nativa del firmware RW4. [Investigación y fuente Android16](bluetooth-open-failure.md).

## Cambios y revisión PC

Se integraron los clasificadores en `Rw4DiagnosticStatus.error`: solo se guardan
los nombres de enums R01/R02/U00 y L01/L02/L00 en preferencias privadas de
nuestra app. L01 reconoce el mensaje exacto AOSP de `read ret: -1`, fin de
flujo local; L02 reconoce retorno0. Mensajes de vendor diferentes quedan L00.
No se publica la excepción, traza, nombre de archivo, número de línea o dirección.

La revisión del intento se guarda al comenzar D01. Los informes previos se
marcan como anteriores/sin intento nuevo; no se reinterpretan como una prueba
r131. Un nuevo intento limpia la etapa y lectura anteriores. El inventario de
UUIDs conserva su implementación y almacenamiento r114 independiente.

Se revisó la ruta `BtBRQueue`: se conserva socket seguro SPP1101 por API pública,
resolución de servicio de Android, plazo de30s, un ticket/consumo por proceso,
cancelación y cierre. PROBE retorna después de connect/D05 y antes de iniciar
lector/protocolo. No nuevas llamadas al reloj, canales manuales, sockets inseguros,
fallback BLE, reintentos, hooks, APIs privadas, permisos o servicios.

Pruebas `test-android-diagnostic-policy.mjs` y `test-android-diagnostic-status.mjs`
pasan. Cubren clasificador, enums filtrados, persistencia e informe, limpieza
entre intentos, datos previos/corruptos, privacidad y límites existentes.
El preview contiene30archivos con hashes; refresh valida las fuentes previas
antes de actualizar el worktree. Compilación/inspección/firma: resultado abajo.

## Qué permitiría decidir el resultado

| Resultado | Conclusión permitida | Siguiente trabajo |
|---|---|---|
| R01 + L01 | La cadena reconocida falla al recibir el entero inicial del servicio local, con EOF | Revisar ruta local/native de creación/resolución antes de proponer cambios de transporte |
| R02 + L01 | La cadena reconocida ya recibió un canal positivo y falla esperando la señal de conexión, con EOF | Revisar señal/cierre native y apertura remota; no concluir automáticamente que el canal está ocupado |
| U00 o L00 | Android/HyperOS no produjo una estructura reconocida | No repetir la prueba para obtener el mismo dato; revisar implementación o evidencia pasiva disponible en PC |
| Axx explícito | Android suministra un código tipado, con las limitaciones ya documentadas | Revisar la causa indicada y cualquier cambio estrictamente pertinente |
| D05 + D14 + D17 | connect retornó y la prueba pidió/cerró su socket local antes de protocolo | Cerrar, restaurar Mi Fitness y revisar el resultado antes de autorizar QUERY |

Ninguna rama habilita automáticamente autenticación, instalación de archivos,
escalación, firmware o ejecución nativa. R01/R02 dependen de coincidencia de
frames AOSP; no son prueba de identidad del firmware HyperOS.

## Plan manual concreto — solo después de APK verificado

Dispositivos: M2315W1/2.2.86, teléfono HyperOS3.0.302.0/Android16(API36), Mi
Fitness3.59.1i. No cambia identificación/región ni requiere una clave nueva.

1. Actualizar únicamente nuestra app con `RW4Diagnostics-r131.apk`, conservando
   datos. No instalar APK de Mi Fitness modificado. Si Android rechaza firma o
   Play Protect bloquea, detenerse y comunicar el aviso, sin desactivar protección.
2. Comprobar que Mi Fitness sigue sincronizando. Forzar detención manual solo
   de Mi Fitness y nuestra app. Mantener permisos, perfiles, vínculo y ajustes
   del sistema actuales. No desactivar/forzar detención del core de Xiaomi.
3. Abrir nuestra app, tocar la tarjeta del RW4 y elegir **Probar solo Bluetooth**.
   La confirmación explica apertura/cierre de socket, sin auth/comandos Xiaomi.
   Aceptar exactamente una vez; mantener abierto el informe. No elegir batería
   ni inventario ni aceptar nuevo emparejamiento. Esperar el resultado/cierre,
   hasta30s; copiar únicamente el informe filtrado.
4. Cerrar nuestra app. Abrir Mi Fitness y verificar sincronización/normalidad del
   reloj. Compartir el informe y el resultado de retorno; no repetir el intento.

No usa ADB/USB sobre hardware. La detención manual de Mi Fitness no demuestra
que cualquier socket del core esté libre; esa incertidumbre se mantiene.

## Efectos, riesgo y reversión

| Operación | Componente afectado / persistencia | Reversión / fallo razonable |
|---|---|---|
| Actualización r131 | APK/datos de nuestra app en almacenamiento del teléfono | Cerrar/desinstalar nuestra app; conservar Mi Fitness. No reversible solo por reboot |
| Detener Mi Fitness | Proceso de la app Android, sin borrar sus datos | Reabrir Mi Fitness; retorno normal ya reportado tras pruebas anteriores, no garantía futura |
| Un PROBE | Pila Bluetooth del teléfono/reloj; Android puede actualizar caché. Nuestra app guarda solo informe local | Cancelar/cerrar nuestra app y reabrir Mi Fitness; posible desconexión transitoria, fallo de app/pila o necesidad de reinicio |

No se solicita escritura de archivos/firmware/particiones del reloj, modificación
de bootloader o recovery, ni se envía código al reloj. Se usa el vínculo existente;
no se solicita crear/eliminar vínculo. Las escrituras internas habituales de la
pila Bluetooth no están auditadas. Riesgo estimado bajo para este ensayo de
transporte frente a carga nativa; no equivale a riesgo cero.

Soft brick y hard brick no se han observado en nuestros intentos anteriores,
pero no están cuantificados ni existe un recovery integral M2315W1 documentado
en este proyecto. Reconexión y reinicio normal no son restauración de firmware.
Si falla el retorno normal, detener pruebas. Gates de instalación/código nativo
del reloj y firmware siguen cerrados; este plan no los abre.

## Artefacto

APK listo: `artifacts/android-diagnostic-r131/RW4Diagnostics-r131.apk`,
31,411,089 bytes; versión `0.94.0-rw4-diagnostic-r131`, código253.
SHA256: `9b5b59e31e6dbd477235e122e3dfb9b19d8bd65d2b3300ebdbdf12193a0285ac`.

Build SUCCESSFUL en2m29s,73tareas(20ejecutadas). Primer intento de compilación
falló por red del sandbox; repetición con permiso para acceder a dependencias
Gradle terminó correctamente. No herramientas de desarrollo nuevas instaladas.
LintVital pasó con baseline upstream y avisos de variante/baseline, APIs
deprecadas y compatibilidad futura Gradle10; no equivale a lint completo/auditoría.

Inspector verifica package esperado, min23/target35, no debuggable, diez permisos,
sin INTERNET ni bindings sensibles; fuentes preparadas y doctor coinciden.
apksigner oficial36 verifica v1/v2 y mismo certificado SHA256:
`47eeb041e241c7ab785ed8bdcf06c6fcce90020e52d4794aa3c6c66590577709`.
SDK apkanalyzer confirma llamadas a ambos clasificadores, renderizadores y
registro de revisión r131 en DEX del APK empaquetado. Firma válida no garantiza
inocuidad. APK/SHA256SUMS/review locales ignorados por Git.

No instalado ni ejecutado en Android; ensayo/retorno r131 pendientes del usuario.
Agente no ejecutó ADB sobre hardware ni operaciones Bluetooth. No utilizar
el APK anterior para esta captura: no incluye los nuevos clasificadores.
