# Instalación y retirada: unidad identificada, ruta pendiente

R75, 2026-10-04. Datos comunicados por usuario: M2315W1, versión mostrada2.2.86, teléfono Android, Mi Fitness3.59.1i. Se conserva la letra final exactamente. Origen/firma de la app, región, ABI y loader no verificados. No se descargaron APKs, obtuvieron claves, conectaron dispositivos ni instalaron paquetes.

## Separar operaciones

| Operación | Evidencia | Estado para nuestra unidad |
|---|---|---|
| Personalizar foto/estilo | [FAQ oficial RW4](https://www.mi.com/my/support/faq/details/KA-228707/) | No equivale a importar Lua/C; no se solicita actualizar |
| Instalar archivo Lua propio con Mi Fitness3.59.1i | Usuario revisó el menú: solo online y guardadas en reloj | No hay entrada de importación visible en esta instalación; ruta directa descartada por ahora |
| Debug RPK | [FAQ Vela](https://iot.mi.com/vela/quickapp/en/guide/other/faq.html) describe app proporcionada mediante contacto comercial | No prueba que el Debug exista en esta app/build ni que ejecute C |
| Transferir watchface con Gadgetbridge | [Ficha RW4](https://gadgetbridge.org/gadgets/wearables/xiaomi/#redmi-watch-4), fuentes R74 | Candidato experimental, sin validación física |
| Ejecutar módulo C | Relato Lua/shell, targets relacionados y emulador | Bloqueado por contrato del firmware2.2.86 |

El número de versión de una app no prueba su firma, procedencia ni habilitación de funciones. No descargar una copia desde mirrors para sustituir la app del usuario.

## Retirada y recuperación de UI documentadas

Xiaomi documenta para RW4 [cambio/eliminación de watchfaces y un caso de crash por archivo de esfera](https://www.mi.com/global/support/faq/details/KA-228715/). Si interfaz y conexión responden, el futuro rollback consistiría en seleccionar una esfera conocida y eliminar exclusivamente la de prueba desde la gestión de esferas de Mi Fitness o Ajustes del reloj. Los textos/menús exactos de3.59.1i están por confirmar. No eliminar caras stock ni sobrescribir sus IDs.

Xiaomi también documenta [reinicio normal y forzado](https://www.mi.com/global/support/faq/details/KA-228897/): botón de encendido unos12s para forzar reboot. Es un mecanismo documentado para bloqueos, **no recuperación validada de firmware/bootloader/flash corruptos**, ni garantía de que una esfera problemática no se abra de nuevo. No se ejecutó. Sin procedimiento de restauración de sistema demostrado para esta unidad.

La documentación reconoce que una esfera errónea puede causar crash/reboot. No calificar instalación Lua como totalmente segura; carece de un contrato de aislamiento demostrado en2.2.86.

## Gadgetbridge y clave local: opción por evaluar

[El propio proyecto](https://gadgetbridge.org/basics/pairing/huami-xiaomi-server/#mi-fitness-mi-health-xiaomi-wear) describe informes de claves presentes en logs de Mi Fitness accesibles sin root, dependiendo de app/Android. No está confirmado para3.59.1i, ni basta encontrar un campo llamado token para identificar su función. No se buscó ni leyó ningún log del teléfono.

La clave autoriza la vinculación Bluetooth; no es root del reloj. No enviarla al chat, guardarla en el repo, incluir logs crudos en artifacts o usarla en CI. No ejecutar extractores cloud ni pedir contraseñas. Si el acceso requiriera root del teléfono, mod dudoso o cambio de firmware, detener y revisar alternativa.

La documentación advierte de conflictos de conexión con la app del fabricante y de invalidación de claves al desvincular. **No desvincular, resetear, desinstalar Mi Fitness ni revocar permisos ahora.** Antes de proponer vinculación, definir retorno a Mi Fitness y conservación de sincronización/funciones; no asumir funcionamiento simultáneo. La ruta experimental podría resultar inadecuada para la prioridad de conservar funciones normales.

## Primera prueba propia: expediente aún incompleto

Candidata: TouchEvents RW4 conocido, preparado y probado en PC, sin ELF/WAD/shell/exploit. No empezar por Doom. La instalación requeriría:

| Campo del gate | Estado |
|---|---|
| Comando/secuencia exacta | Pendiente: instalador compatible y menú real no demostrados |
| Componente | Archivo/registro de watchface y UI Lua; no componente stock a sobrescribir |
| Almacenamiento persistente | Sí al instalar el paquete; reboot no lo elimina |
| Particiones crudas / boot / firmware mod | No permitidos |
| Backup | Anotar cara actual, conservar paquete propio y datos que Mi Fitness pueda sincronizar; no backup completo de firmware disponible |
| Rollback | Seleccionar cara conocida y retirar la propia si UI/conexión responden; todavía no ensayado en la unidad |
| Peor fallo razonable | UI colgada/reboots y posible reapertura de la esfera problemática |
| Soft brick | No descartado; reboot forzado no acredita resolución |
| Hard brick | Sin mecanismo de flash/boot previsto; no cuantificable ni garantía de riesgo cero |
| Recuperación | Reboot/gestión de esferas documentados para RW4 en general; restauración de sistema2.2.86 no validada |
| Compatibilidad | Fuentes RW4 disponibles; aceptación de paquete y runtime2.2.86 sin demostrar |

No hay todavía acción física lista para aprobación ni ejecución. La falta de recovery para un paso de riesgo obliga a revisión antes de ejecutarlo.

## R76: no hay importación visible; siguiente comprobación local

El usuario revisó Mi Fitness3.59.1i y solo encontró esferas online y guardadas en el reloj, sin importación local/Debug visible. Es una observación de esta instalación, no prueba de que todas las versiones/modelos carezcan del mecanismo. No insistir en buscar ese menú ni sustituir la app por un mod.

Siguiente comprobación: usando únicamente el gestor de archivos ya disponible en el teléfono, mirar si se puede acceder a `Almacenamiento interno/Android/data/com.xiaomi.wearable/files/log`. Informar solo si hay archivos, carpeta vacía/inexistente o acceso denegado. No abrir, copiar ni enviar logs/claves; no conectar al reloj, instalar herramientas, activar ADB, cambiar permisos o desvincular. Si el gestor no permite acceder, registrar esa limitación sin intentar sortearla.

La ruta procede de [Gadgetbridge](https://gadgetbridge.org/basics/pairing/huami-xiaomi-server/#mi-fitness-mi-health-xiaomi-wear): hay informes de claves en logs de Mi Fitness sin root, con disponibilidad dependiente de versión/Android. La mera existencia de archivos no demuestra que contengan la clave correcta ni compatibilidad del instalador. Cualquier extracción posterior debe ser local y evitar divulgar credenciales; antes de una conexión alternativa sigue pendiente el plan de retorno a Mi Fitness. No se ha instalado Gadgetbridge ni accedido a esos archivos.

## R77: carpeta accesible; comprobador local preparado

El usuario confirma archivos `.device.log` y sus backups `.bak` en la carpeta. No se han leído sus contenidos ni encontrado/validado una clave. La comprobación de disponibilidad R76 está completada; su restricción de no copiar se refería a ese paso. El siguiente diagnóstico propone copiar únicamente el `.device.log` actual al PC, manteniendo el original en el teléfono, sin cambiar conexión/vinculación del reloj.

Destino privado: `tools/local/mi-fitness-logs/` (creado, ignorado por Git). Usar la transferencia de archivos habitual del teléfono si hace falta; no requiere depuración USB ni ADB. No subir al chat, GitHub, servicios cloud o artifacts. Los backups solo serían necesarios si el registro actual no contiene candidatos; su información puede estar desactualizada.

Comando reproducible desde la raíz del repo:

```powershell
node tools/check-mi-fitness-auth.mjs
```

El comprobador es código propio sin dependencias externas, red, Bluetooth, subprocesses o escritura de resultados. Lee `.log`/`.log.bak` en esa carpeta; emite solo recuentos, nombres de campos conocidos y estado `candidate-found`/`no-candidate-found`. No imprime valores, hashes de claves, nombres de archivos, rutas ni líneas. Los errores tampoco muestran datos de entrada. Límites:100 archivos,32MiB cada uno,128MiB total; rechaza archivos binarios/UTF-16 y symlinks finales. No ofrece opción para exportar claves. Las copias privadas permanecen en el PC hasta que el usuario las retire; Git ignore no cifra archivos ni evita backups/cloud del PC.

Los patrones se basan en los campos publicados por Gadgetbridge y variantes snake_case, incluyendo JSON con comillas escapadas. Un `token` genérico puede pertenecer a otro uso. Encontrar32 caracteres hexadecimales no identifica M2315W1 ni demuestra autenticación. Un resultado negativo solo cubre esos patrones/formato y las copias presentes; no demuestra ausencia de la clave en toda la app.

Validación: `node tools/test-mi-fitness-auth.mjs` pasa con datos ficticios: candidatos repetidos/múltiples, JSON escapado, longitudes incorrectas, nombres de campos parciales, UTF-16 y ausencia de secretos en salida/errores. No se ejecutó contra logs reales. Después de este diagnóstico siguen pendientes asociación local de clave/dispositivo, retorno a Mi Fitness y revisión de una eventual primera conexión/instalación; gate físico cerrado.

## R78: resultado del diagnóstico local

Tras confirmar el usuario que había copiado los archivos, se ejecutó el comprobador contra las copias privadas: `candidate-found`,4 archivos analizados,0 backups reconocidos por el patrón,1 archivo con candidatos,1 valor distinto encontrado en los campos `encryptKey` y `token`. Son cuatro archivos presentes, no asumir que todos proceden de la misma sesión ni que sean todos registros actuales. No se expusieron valores, hashes, nombres de archivos ni líneas del registro; solo estos metadatos se guardan en documentación/session-status. No hubo red/Bluetooth/ADB ni cambios en la vinculación o el reloj.

Este resultado confirma un candidato con sintaxis compatible en logs locales de la instalación del usuario. No confirma asociación a M2315W1, vigencia, autenticación ni capacidad de instalar watchfaces. No hace falta recopilar backups adicionales por ahora. El siguiente checkpoint es confirmar la asociación local sin divulgar credenciales y completar el plan de conexión temporal/retorno a Mi Fitness antes de proponer una acción física. La ejecución de este diagnóstico no abre el gate.

## R79: asociación contextual y preparación de Gadgetbridge

`node tools/check-mi-fitness-association.mjs` analiza las copias locales sin exponer registros:4archivos,5líneas con candidatos,5con etiqueta «Redmi Watch 4»/M2315W1,0asociaciones parseables en el mismo objeto JSON. Estado `same-line-rw4-label-only`. El método separa coincidencia de línea y objeto estructurado; no une dispositivos de arrays u objetos hermanos. Pruebas sintéticas pasan para esa distinción, etiquetas en campos de identidad, JSON anidado/escapado y salida privada. Un formato no parseable queda desconocido. El contexto refuerza la inferencia; no prueba unidad física/vigencia/autenticación.

Preparación en PC: la [ficha F-Droid](https://f-droid.org/en/packages/nodomain.freeyourgadget.gadgetbridge/) publica0.94.0/code253, añadido2026-09-16, mínimo Android6.0. Se seleccionó su APK sugerido firmado por desarrollador: [descarga exacta](https://f-droid.org/repo/nodomain.freeyourgadget.gadgetbridge_253_01cce93.apk). Selección documental, no firma local verificada. Destino ignorado `tools/local/gadgetbridge/nodomain.freeyourgadget.gadgetbridge_253_01cce93.apk`, carpeta creada. Intento `Invoke-WebRequest` falló por acceso de esta terminal; no APK ejecutado/instalado. El usuario puede descargar por navegador para inspección estática, sin abrirlo ni instalarlo.

Orden propuesto, sin autorización física implícita:

1. Revisar APK/origen/firma y fuentes de inicialización, sin ejecución ni conexión.
2. Completar expediente de una conexión temporal antes de pedir revisión: permisos, secuencia, comandos automáticos, posibles writes y retorno a Mi Fitness. No denominar conexión «read-only» sin auditar las operaciones de inicialización/sincronización.
3. Solo tras revisión explícita, considerar probar autenticación y retorno. Todavía no transferir esferas, módulos, firmware ni Doom. La primera instalación propia seguirá siendo la esfera Lua conocida con su gate separado.

La [ficha RW4 de Gadgetbridge](https://gadgetbridge.org/gadgets/wearables/xiaomi/#redmi-watch-4) mantiene soporte experimental/desconocido. La [guía de autenticación](https://gadgetbridge.org/basics/pairing/huami-xiaomi-server/#entering-key) advierte conflictos con la app del fabricante y cambios de clave por desvincular/resetear. Como propuesta por verificar, cerrar Gadgetbridge y volver a abrir Mi Fitness conservaría su registro existente; no hay prueba de retorno en2.2.86 ni de que baste cerrar una app. No ejecutar instrucciones genéricas de desinstalar/revocar permisos/desvincular. Si exige reset, pérdida de registro o cambios no reversibles, detener y revisar alternativa. Nada de esta preparación exige tocar el reloj ahora.
