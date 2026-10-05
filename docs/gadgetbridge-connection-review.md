# Primera conexión Xiaomi: revisión y alternativas

R81,2026-10-04. Solo PC; no APK instalado/ejecutado ni reloj conectado. [APK revisado](gadgetbridge-apk-review.md). Este documento es un expediente de diseño, **no instrucciones para iniciar la conexión**.

## Fuente inspeccionada

Archivo entregado por usuario desde [source enlazado por F-Droid](https://f-droid.org/repo/nodomain.freeyourgadget.gadgetbridge_253_src.tar.gz):80957440bytes, SHA256 `700b2364858e6d26c4446c277d5c89ec7cba795d857d90a7a8d68533c1a69cb1`. Este pin es local, sin hash publicado independiente. Es TAR sin compresión pese al sufijo `.tar.gz`; no asumir corrupción ni causa concreta de esa diferencia.

`tools/review-gadgetbridge-source.mjs` usa tar.exe del Windows existente para listar10219 entradas, comprobar rutas y copiar28archivos de texto seleccionados a `artifacts/research/gadgetbridge-source/`. Cada seleccionado es archivo regular, no enlace, con nombre único y tamaño acotado; la salida usa basenames propios. No extracción general ni ejecución de Gradle/scripts. Reporte `artifacts/research/gadgetbridge-source-review.json` registra hash de cada fuente. Archivos terceros permanecen ignorados; no se redistribuyen en Git. El build.gradle declara0.94.0/253, consistente con manifiesto APK; no se reprodujo el build ni se demostró equivalencia de cada método con el DEX.

## Lo que envía al conectar

Fuentes de esta distribución, líneas de referencia del texto extraído:

| Ruta / función | Hallazgo |
|---|---|
| RedmiWatch4Coordinator.java39-52 | Reconoce nombre `Redmi Watch 4 XXXX`, experimental y BT_CLASSIC/SPP; no emulación BLE ni prueba de firmware2.2.86 |
| XiaomiSppSupport.java61-85,279-280 | Abre transporte, solicita versión de protocolo, inicializa sesión y empieza handshake cifrado |
| XiaomiAuthService.java90-97,145-158,221-234 | Nonce/HMAC y datos del teléfono/idioma como región; al recibir respuesta de auth marca INITIALIZED y llama onAuthSuccess |
| XiaomiSupport.java426-436 | onAuthSuccess: sincroniza hora si preferencia global lo permite e inicializa todos los servicios |
| XiaomiHealthService.java224-237,301-343 | `setUserInfo()` incondicional: altura, peso, cumpleaños, género, FC máxima y objetivos desde perfil Gadgetbridge |
| XiaomiWeatherService.java77-86,476-497 | Envía unidad de temperatura durante initialize |
| XiaomiCalendarService.java59-61,85-145 | Llama syncCalendar; incluso con preferencia deshabilitada envía `disabled=true` al reloj |
| XiaomiSystemService.java123-143 | Solicita info/estado/batería, password y configs; rearma consultas periódicas |
| XiaomiSupport.java164-175 | dispose invoca dispose de servicios y transporte; evidencia para cerrar conexión, sin retorno Mi Fitness ensayado |

Comandos automáticos identificados:

| Propósito | type/subtype protobuf | Configuración enviada |
|---|---|---|
| Perfil de salud |8/0 | Perfil/objetivos locales de Gadgetbridge; posible sustitución de valores stock |
| Temperatura |10/10 | Preferencia de unidad de la app |
| Calendario |12/1 | Sync/eventos o disabled=true; desactivar sync en app no impide enviar este comando |
| Hora, condicional |2/3 | Fecha/hora/zona/formato12-24h |
| Handshake |1/26 y1/27 | Nonces/HMAC y metadatos de teléfono; efectos persistentes del firmware desconocidos |

**Refutado para este flujo de código:** una primera conexión ordinaria equivale a solo leer. Deshabilitar la sincronización de hora no evita perfil/unidades/calendario. Retirar permisos de calendario del teléfono tampoco demuestra que no se envíe disabled=true. No se ha probado qué comandos acepta o persiste RW4/2.2.86; distinguir intención del cliente y comportamiento real del firmware. El código revisado separa instalación de watchface/firmware del initialize; no se ejecutó ninguno. No inferir cobertura completa de todas las callbacks/eventos desde este audit de entrada.

Privacidad: XiaomiAuthService.java210-213 registra claves de sesión a nivel DEBUG; XiaomiSystemService.handleDeviceInfo incluye serial en log/UI. No solicitar/exportar logs crudos de una futura conexión ni activar DEBUG como paso rutinario. Una herramienta limitada debe eliminar esos logs/redactar campos, no confiar únicamente en ajustes de nivel.

## Alternativas concretas para decidir

| Alternativa | Preparación | Consecuencia / límite |
|---|---|---|
| Diagnóstico limitado propio (recomendado) | Partir de fuente revisada, modo específico RW4 con autenticación y consultas mínimas; bloquear envíos de configuración y cualquier upload | Requiere cambios revisables/build Android/pruebas en PC; aún no implementado. Conserva firmware del reloj, pero el APK sería una variante propia, no la distribución oficial |
| APK oficial inspeccionado | Anotar privadamente valores actuales y configurar perfil/unidades equivalentes; documentar impacto calendario y retorno antes de conexión | Menos desarrollo; acepta envíos normales de configuración. No llamar read-only ni prometer restauración automática con Mi Fitness |

Para variante limitada, diseño mínimo a implementar/revisar: saltar initialize de servicios y syncTime; filtro de salida con denegación por defecto, permitir solo handshake1/26,1/27 y GET batería2/1/GET info2/2; bloquear upload/OTA/watchfaces/configuración y callbacks de envío no solicitadas; omitir password/health/calendar; ocultar claves/serial en logs; desconexión explícita con tiempo acotado y reconexión automática deshabilitada. Revisar los bypass de transporte y respuestas requeridas antes de afirmar que la política está completa. Autenticación y enlace siguen siendo comunicaciones activas; no garantizar cero writes internos del firmware.

No compilar/instalar esa variante antes de decidir el camino y revisar sus dependencias. No perseguir root, exploit o firmware modificado. La elección solicitada al usuario decide desarrollo en PC, **no autoriza conexión física**.

## Expediente físico pendiente para ambas alternativas

| Requisito | Estado / propuesta por validar |
|---|---|
| Unidad | M2315W1/2.2.86, Android/Mi Fitness3.59.1i, datos comunicados; región y versión Android pendientes |
| Secuencia UI exacta | Pendiente de alternativa y build revisable; no se pide instalar/conectar aún |
| Alcance primera conexión | Autenticación y observación de resultado; sin paquetes, módulos C o Doom |
| Backup | Datos de uso sincronizados en Mi Fitness y ajustes anotados localmente; no backup completo de firmware |
| Almacenamiento | App/clave/bond en teléfono persistentes; comandos de configuración en reloj pueden persistir; efecto de auth interno desconocido |
| Particiones / bootloader | Sin comandos previstos de escritura cruda/boot ni firmware mod; no probado por runtime físico |
| Retorno propuesto | Desconectar y forzar detención de Gadgetbridge, abrir Mi Fitness y comprobar conexión/sync/funciones; conservar registro original sin desvincular/resetear/desinstalar/borrar datos |
| Rollback de ajustes | Para APK normal, restablecer explícitamente perfil/unidades/calendario/hora; no probado que Mi Fitness lo haga por sí sola |
| Peor fallo razonable | Autenticación fallida, conflicto de conexión/configuración, UI bloqueada/reboots; todavía no ensayo local |
| Soft brick | No descartado; reboot documentado no garantiza resolver reapertura/estado persistente |
| Hard brick | Sin mecanismo de flash/boot previsto; no cuantificado ni afirmar riesgo cero |
| Recovery conocido | Reboot forzado y retirada de esferas si UI responde, documentados por Xiaomi; no recovery de firmware corrupto2.2.86 |
| Evidencia compatibilidad | Coordinator RW4 de0.94.0 y ficha experimental; no prueba de unidad/firmware concreto |
| Stop | Si pide reset/unpair, actualización, cambio de firma del reloj o firmware, detener; ningún paso así incluido |

No hay prueba física lista para aprobación todavía. Una vez elegida la alternativa, completar los pendientes y pedir revisión explícita antes de ejecutar/conectar; mantener intacta la vinculación actual mientras tanto.
