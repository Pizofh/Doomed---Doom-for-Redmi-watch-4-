# R114 — inventario de servicios desde Android

**R118, 2026-10-10:** el usuario confirma que, tras el segundo inventario completo,
Mi Fitness sincroniza normalmente y el reloj sigue funcionando bien. Queda cerrado
el checkpoint de inventario y retorno normal para este intento. No demuestra
recuperación de firmware, seguridad de código nativo ni conexión SPP funcional.
Siguiente investigación únicamente en PC: explicar el fallo del endpoint SPP
con fuentes verificables. No otra prueba radio, APK o cambio del reloj solicitado.

## Resultado R117 — segundo inventario completado

2026-10-10. El usuario mantuvo abierta la pantalla sin copiar ni cambiar de
pestaña y reportó r114/API36, `I1: completado`, tiempo16132ms. ACTION_UUID
recibido para el objetivo aceptado; cinco UUIDs listados, SPP1101/HFP/HID
observados, FE95 no observado. BLE: ventana completada, 40 callbacks,
cero coincidencias de dirección registrada y cero candidatos por nombre
anunciado; FE95 no observado. Error0. Stop BLE y retiro del receptor retornaron.

Esto confirma por reporte la ejecución completa del controlador y del escaneo
en el teléfono, con cierre sin excepciones capturadas. Los 40 callbacks no
equivalen a 40 dispositivos distintos. Ningún anuncio se pudo atribuir al RW4
por los criterios implementados; no descarta anuncios anónimos, dirección BLE
distinta/aleatoria ni que el reloj use BLE bajo otras condiciones.
La lista de Android concuerda con la caché SPP previa, pero puede proceder de
caché incluso tras SDP: no valida servicio/canal RFCOMM remoto actual ni explica
los errores de conexión anteriores. No hay autenticación o transporte Xiaomi
funcional demostrado, ni acceso a código/apps/filesystem del reloj.

No se pidió un tercer inventario, PROBE, QUERY, cambio de clave, canal o
transporte. No nuevo APK/código/build/tests ni hardware desde herramientas.
**Retorno a Mi Fitness y normalidad del reloj tras este segundo intento confirmados
en R118**; el reporte positivo R115 corresponde al primero.
El checkpoint de inventario y retorno está completado por reporte del usuario.
El siguiente paso es investigar el endpoint SPP a partir de fuentes verificables en PC,
sin repetir el mismo socket o cambiar a BLE automáticamente. Instalación y
ejecución nativa en M2315W1 siguen cerradas.

---

## Resultado R116 — cancelación al perder primer plano

2026-10-10. El usuario recuperó el registro guardado: r114/API36, `I3: salida
de primer plano`, tiempo5922ms, SDP esperando ACTION_UUID/UUIDs-1, BLE no iniciado,
contadores0, error0, cierre BLE no requerido y receptor llamada retornó.
Reloj normal y sincronización normal confirmados en el reporte anterior R115;
no se pidió otra operación radio entre ambos reportes.

El registro terminal confirma la ejecución del cierre por `onPause` antes de
la ventana SDP de 10s: no se registró respuesta aceptada ni comenzó el escaneo
BLE. El retiro del receptor retornó sin excepción capturada; no demuestra
cancelación del SDP encargado al OS ni ausencia de operaciones Bluetooth del
sistema. La causa concreta de pérdida de primer plano no está registrada:
no atribuirla al usuario, al bloqueo de pantalla, al clipboard o a HyperOS.
No es prueba negativa de compatibilidad SDP/BLE ni fallo del límite de 20s.

La espera es poco clara: el informe no actualiza el tiempo en cada tick mientras
espera SDP. Esta limitación se puede resolver en el procedimiento actual sin
otra instalación. No se modificó código ni se generó un APK nuevo.

### Segundo inventario manual propuesto, mismo APK

Se propone **una segunda ejecución**, porque la primera terminó antes de la fase
BLE; no repetir PROBE ni QUERY. Alcance, comandos/API, persistencia, reversión,
riesgos y límites de recuperación son los mismos de la tabla del plan R114 abajo.
El registro de la primera ejecución queda aquí antes de reemplazar el resumen
privado del teléfono. Ningún paso es ejecutado por herramientas PC.

1. Forzar detención de Mi Fitness y nuestra app para cerrar el proceso anterior
   y obtener un ticket manual nuevo. Mantener permisos/perfiles/vínculo actuales
   y Bluetooth ON; no borrar datos ni cambiar la clave.
2. Abrir nuestra app → tarjeta RW4 → Inventario de servicios → Iniciar inventario.
3. Mantener la pantalla abierta y encendida durante **30 segundos**, sin cambiar
   de app ni copiar el texto durante la espera. Que al principio siga mostrando
   13ms u otro tiempo pequeño no demuestra que se haya detenido.
4. Al terminar debe mostrar un estado terminal, por ejemplo `I1: completado`, y
   el botón **Cerrar**. Copiar después, cerrar y comprobar sincronización Mi Fitness.
   Un error terminal también sirve: reportar sin volver a intentarlo.
5. Si tras 30s sigue I0, copiar, salir y recuperar Último inventario desde Informe
   y caché local. Si aparece I3 sin haber cambiado de pantalla, indicarlo; no
   repetir por tercera vez. Si surge pairing nuevo, cancelarlo y salir.

La guía anterior de R115 de no repetir correspondía a recuperar el registro
pendiente. Este resultado permite proponer una segunda ejecución explícita
con espera clara. Su resultado y retorno siguen pendientes. Instalación/nativo
en reloj siguen cerrados.

---

## Resultado reportado R115 — informe inicial, desenlace pendiente

2026-10-10. Usuario confirma haber seguido el procedimiento; reloj normal y
Mi Fitness sincroniza correctamente. El informe pegado muestra r114/API36,
`I0: en curso`, SDP esperando ACTION_UUID, UUIDs -1, BLE no iniciado,
todos los contadores 0, error0, tiempo13ms y cierres no requeridos.
Esto confirma apertura de la pantalla y un snapshot inicial del controlador.
No confirma que la API haya contactado al reloj, respuesta SDP, escaneo BLE,
terminación por límite ni resultado negativo de los servicios.

Los 13ms son el tiempo del snapshot publicado, no una medida de cuánto
esperó el usuario ni cuándo copió el texto. El controlador no publica en cada
tick mientras espera SDP. Una copia previa al desenlace, un informe desactualizado
o un problema de ejecución/UI no se distinguen con esta evidencia.
No atribuir al usuario una copia prematura ni afirmar fallo del watchdog.

Revisión de fuente: `onPause` finaliza y guarda un nuevo snapshot; `Cerrar`
también finaliza antes de salir. El toolkit **Informe y caché local** permite
leer `Rw4InventoryStatus.report` sin emitir ticket, SDP, escaneo o conexión.
Siguiente acción: recuperar exclusivamente **Último inventario** desde ese menú.
No detener Mi Fitness, iniciar otro inventario, usar PROBE/QUERY ni actualizar
APK para obtener ese registro. Si permanece I0, el lector añade aviso de registro
incompleto; reportar ese texto sin repetir. No se hicieron operaciones físicas
desde herramientas ni cambios de código/build en R115.

---

2026-10-10. Investigación del M2315W1/2.2.86, teléfono API36 y Mi Fitness
3.59.1i. Después de tres PROBE fallidos, incluido el aislamiento de permisos
R113, repetir el mismo socket no aporta información. Este cambio incorpora
una capacidad diferente en un único APK: solicitud de UUIDs y observación
de anuncios BLE. No cambia automáticamente el transporte del cliente Xiaomi.

## Alcance y evidencia

`Rw4InventoryActivity` es una Activity no exportada, sin servicio nuevo.
Un toque confirmado emite un ticket de modo `SERVICE_INVENTORY`; solamente
`consumeInventory` puede consumirlo. Los consumidores de conexión rechazan
ese modo, y los gates de payload requieren un intento `QUERY` aceptado.
No hay `connectGatt`, socket RFCOMM, pairing, autenticación, lecturas de
características ni comandos Xiaomi en el inventario.

Primero se registra un receptor para `ACTION_UUID` y cambios de vínculo;
`fetchUuidsWithSdp()` solicita información para el dispositivo ya vinculado.
El controlador acepta únicamente la dirección seleccionada. Tras la respuesta,
rechazo de la API o ventana de 10s sin respuesta, intenta un escaneo BLE
`LOW_POWER`, sin filtros ni `PendingIntent`, durante hasta otros 10s.
El límite global del controlador es 20s, con reloj monotónico y ticks de 250ms.
Es una ventana lógica, no garantía de temporización de Android bajo bloqueo
del proceso o del sistema.

Android puede devolver UUIDs **de caché** después de solicitar SDP y puede
encolar la solicitud. Recibir `ACTION_UUID` no verifica que el endpoint remoto
esté activo ni descubre su canal RFCOMM. No usamos `fetchUuids(int transport)`
porque requiere API37 y el teléfono es API36.
[Contrato oficial BluetoothDevice](https://developer.android.com/reference/android/bluetooth/BluetoothDevice#fetchUuidsWithSdp()).

Para BLE se cuentan callbacks, coincidencias con la dirección registrada y
candidatos por nombre anunciado exacto. Una coincidencia de nombre es débil:
no demuestra identidad. Una dirección BLE distinta o aleatoria puede impedir
asociarlo con la dirección Classic. Se exportan solo flags de familias públicas
SPP1101, FE95, HFP y HID, y conteos; máximo 64 UUIDs por respuesta/batch y
9999 callbacks por contador. Truncamientos y anuncios sin UUID/nombre limitan
las conclusiones. No observar anuncios no descarta BLE. La pantalla encendida
evita la suspensión normal del escaneo sin filtros; `neverForLocation` también
puede limitar resultados.
[Contrato oficial BluetoothLeScanner](https://developer.android.com/reference/android/bluetooth/le/BluetoothLeScanner).

Salir, cambiar de aplicación, apagar la pantalla con pérdida de primer plano,
cambio de vínculo, error o límite finalizan el controlador; no hay reinicio en
`onResume` ni repetición al recrear la Activity. Se llama `stopScan` y se retira
el receptor independientemente, incluso si falla una de las limpiezas. El informe
indica si esas llamadas retornaron o fallaron. **No existe aquí una cancelación
pública de la solicitud SDP pendiente**: retirar el receptor no cancela una
operación ya encargada a Android. No se apaga Bluetooth para cancelarla.

## Persistencia y privacidad

La dirección y nombre objetivo se usan solamente en memoria en este componente.
El almacenamiento separado `rw4.inventory.r114` contiene 14 enteros y un booleano,
sin claves, identificadores, UUIDs arbitrarios, bytes de anuncios ni excepciones.
Se validan tipos y rangos antes de mostrar registros anteriores. Un registro sin
terminación se presenta como incompleto. El informe de conexión previo sigue
separado y se etiqueta como posiblemente anterior. Esto no constituye una
auditoría integral de todo el código heredado de Gadgetbridge ni de Android.

La instalación actualiza nuestra app en el teléfono y conserva sus datos. Android
puede actualizar su caché Bluetooth. No se solicita instalar archivos, modificar
firmware, escribir particiones, bootloader o configuración del reloj. No conocemos
todos los efectos internos de una solicitud de servicios en su stack Bluetooth.

## Plan para una prueba manual

| Paso / comando o acción | Componente afectado | Persistencia | Reversión / fallo razonable | Riesgo y recuperación |
|---|---|---|---|---|
| Instalar `RW4Diagnostics-r114.apk` sobre nuestra app | Android, mismo paquete y certificado | APK/datos del teléfono | Cerrar/desinstalar nuestra app; no borrar Mi Fitness | Actualización propia; firma comprobada no equivale a garantía de seguridad |
| Forzar detención de Mi Fitness y nuestra app; Bluetooth ON | Procesos del teléfono | Ajustes/permisos no se cambian | Abrir Mi Fitness al finalizar | Mantener vínculo y perfiles actuales; no reset/unpair |
| Tarjeta RW4 → Inventario de servicios → Iniciar inventario | APIs Android y stack Bluetooth del RW4 | Caché OS y resumen privado en teléfono; efectos internos del reloj desconocidos | Cancelar/salir: stopScan + receptor retirado; SDP OS puede seguir | Riesgo estimado bajo para consulta estándar; posible interrupción temporal de enlace. No recuperación de corrupción firmware validada |
| Copiar informe, Cerrar, abrir Mi Fitness | Clipboard/resumen del teléfono y enlace normal | Resumen local | Retorno normal a verificar por usuario | Detener si aparece nuevo pairing, bloqueo o cambio inesperado; no reintentar |

Ningún paso escribe particiones, toca bootloader o requiere firmware modificado.
No hay indicios de una vía de hard brick en este código de inventario, pero no
se promete riesgo cero para firmware desconocido. Un reinicio puede resolver
un bloqueo temporal; no es garantía contra corrupción persistente. El retorno
normal observado en R113 es evidencia de ese intento, no validación de R114.
Seguimos sin backup integral ni recovery de firmware documentado para esta unidad.
La compatibilidad de estas APIs con API36 está documentada; su respuesta en
M2315W1/2.2.86 sigue pendiente. **Instalación en reloj y ejecución nativa cerradas.**

Procedimiento para el usuario, una sola vez:

1. Actualizar nuestra app con el APK r114; no desinstalar ni borrar datos.
2. Forzar detención de Mi Fitness y de nuestra app. Mantener permisos restaurados
   y perfiles actuales; no hace falta volver a negar permisos ni tocar Quick Share.
3. Bluetooth encendido, reloj cerca. Abrir nuestra app, tocar la tarjeta RW4 y
   elegir **Inventario de servicios**. Confirmar **Iniciar inventario**.
4. Mantener la pantalla abierta/encendida hasta que termine (hasta unos 20s).
   No pulsar Probar solo Bluetooth ni Consultar batería. Si aparece un nuevo
   enlace, cancelarlo y salir; no compartir una clave.
5. Copiar únicamente este informe, cerrar y abrir Mi Fitness. Reportar el informe
   y si vuelve a sincronizar. Un error es resultado suficiente; no repetir.

## Reproducción en PC

Resultado de preparación: **BUILD SUCCESSFUL**, build final 2m19s / 73 tareas
(10 ejecutadas). Las cinco suites de diagnóstico pasan; inspección de manifest,
hashes de fuentes preparadas, presencia de las tres clases en DEX y apksigner
oficial pasan. Firma v1/v2 con el mismo certificado, paquete y 10 permisos de
r106; Activity nueva no exportada; sin permiso INTERNET. Los avisos heredados
de deprecaciones y baseline lint de otra variante no constituyen auditoría
integral del código. Un primer build falló por bloqueo de red del sandbox;
se compiló después con acceso autorizado a dependencias. No se instalaron
herramientas nuevas. Python no estaba disponible para una lectura DEX opcional;
se usó ZipFile de .NET para comprobar presencia estática de clases.

Bundle: `artifacts/android-diagnostic-r114/RW4Diagnostics-r114.apk`, 31,411,083 bytes.
Versión `0.94.0-rw4-diagnostic-r114`, código253, min23/target35, no debuggable.

```text
APK SHA256: 0f44f91ead190e1e70b460e32fcf21bd2eebf903b382c1a164bfbebd540f3dc8
Cert SHA256: 47eeb041e241c7ab785ed8bdcf06c6fcce90020e52d4794aa3c6c66590577709
```

El bundle conserva `SHA256SUMS.txt` y `review.json`; r106 permanece disponible.
**Instalación/UI/radio/retorno r114 pendientes de usuario.**

Desde la raíz del repositorio, JDK17+ y SDK local ya preparado:

```powershell
node tools/prepare-android-diagnostic.mjs
node tools/test-android-service-inventory.mjs
node tools/test-android-diagnostic-policy.mjs
node tools/test-android-bluetooth-cache.mjs
node tools/test-android-diagnostic-status.mjs
node tools/test-android-diagnostic-queue.mjs
node tools/android-build.mjs refresh
node tools/android-build.mjs build
node tools/inspect-android-diagnostic.mjs
& 'C:\Program Files\Java\jdk-21\bin\java.exe' -jar 'tools/local/android-build/sdk/build-tools/36.0.0/lib/apksigner.jar' verify --verbose --print-certs 'build/android-diagnostic-worktree/gadgetbridge/app/build/outputs/apk/mainline/rw4diagnostic/app-mainline-rw4diagnostic.apk' | Out-File -LiteralPath 'artifacts/research/android-diagnostic-apksigner-r114.txt' -Encoding utf8
node tools/package-android-diagnostic.mjs
```

Pruebas del controlador real con radio simulada en PC: fases/deadlines, origen
incorrecto, identificación débil por nombre, privacidad, callbacks tardíos,
cancelación, cambios de vínculo, reloj incoherente, fallos de API y limpieza.
Pruebas de tickets cubren rechazo entre modos y expiración. Pruebas de preferencias
usan stubs Android y verifican almacenamiento solo numérico y datos corruptos.
Guards de fuente y compilación validan integración, no comportamiento real del UI.
No se realizó instalación, escaneo ni conexión física desde herramientas.

El único siguiente checkpoint es obtener este inventario y verificar el retorno
a Mi Fitness; no autenticar ni instalar código después automáticamente.
