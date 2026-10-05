# Instalación y retirada: unidad identificada, ruta pendiente

R75, 2026-10-04. Datos comunicados por usuario: M2315W1, versión mostrada2.2.86, teléfono Android, Mi Fitness3.59.1i. Se conserva la letra final exactamente. Origen/firma de la app, región, ABI y loader no verificados. No se descargaron APKs, obtuvieron claves, conectaron dispositivos ni instalaron paquetes.

## Separar operaciones

| Operación | Evidencia | Estado para nuestra unidad |
|---|---|---|
| Personalizar foto/estilo | [FAQ oficial RW4](https://www.mi.com/my/support/faq/details/KA-228707/) | No equivale a importar Lua/C; no se solicita actualizar |
| Instalar archivo Lua propio con Mi Fitness3.59.1i | Sin documentación específica encontrada | Pendiente de inspección visual del menú; no afirmar soporte |
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

No hay todavía acción física lista para aprobación ni ejecución. El siguiente paso es **solo mirar** Mi Fitness → Dispositivo → Gestionar esferas y comprobar si ofrece importación local o Debug; pregunta enviada, sin Apply/descarga. Si no ofrece importación, concretar el estudio de Gadgetbridge sin instalarlo, o buscar acceso oficial de desarrollo. La falta de recovery para un paso de riesgo obliga a revisión antes de ejecutarlo.
