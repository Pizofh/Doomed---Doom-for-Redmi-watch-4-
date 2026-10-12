# Primera instalación física — RW4Probe estática, pendiente de revisión

2026-10-12. **No autorizada ni ejecutada.** El usuario no puede observar el reloj
durante esta sesión remota. No realizar operaciones físicas en estas condiciones.
Las entradas Node y nativa devuelven GateClosed.

## Unidad y evidencia

M2315W1, versión del dispositivo2.2.86, región sin confirmar, nombre/versionado
exacto de HyperOS/Vela del reloj sin dato adicional. Teléfono Xiaomi con
HyperOS3.0.302.0, Android16/API36 y Mi Fitness3.59.1i según usuario.

Pruebas de ESTA unidad: autenticación Xiaomi V1/HMAC, respuestas cifradas,
modelo/FW reconocidos, batería y GET de 21 esferas. Menús normales tras
autenticación con Windows y Bluetooth del teléfono apagado; registro Mi Fitness
conservado. Instalación/DELETE de paquete propio en2.2.86 aún no demostrados.

El paquete se generó con el perfil RW4 del empaquetador revisado, con solo un
widget imagen propia, sin scripts o ejecutables. Render, cambio a otra esfera
y retirada de archivos probados en MiWatchEmulator/S3. Esto NO equivale a probar
el parser, firmware, almacenamiento o recovery del RW4 físico.

## Paquete concreto

| Campo | Valor |
|---|---|
| Archivo local | `artifacts/static-watchface-r167/RW4Probe-id-only.face` |
| ID propio | `365799910` |
| Tamaño | 25224bytes |
| SHA256 | `7df88688c61e63b1aaab208ddf2b3976bf912fbaa08c01bf6f0d0e986ad9e93a` |
| Contenido | Imagen390×450: texto RW4 PROBE y barras RGB |
| Header | Byte5 original0; solo nueve bytes del ID editados |
| No contiene | Lua, C, ELF, launcher, WAD, comandos de shell, hooks o firmware |

No usar otra esfera, otro ID, un paquete del emulador modificado por el bridge,
ni liberar espacio borrando otras esferas. El ID estaba libre en el snapshot
R167; se reconsulta en la sesión, sin asumir que sigue libre.

## Secuencia propuesta tras revisión y habilitación

Mantener el bloque con PC sin reemparejar entre comandos. No borrar el registro
de Mi Fitness, no actualizar firmware y no cambiar claves. Antes de empezar,
reloj encendido/cargado, usuario presente, menús accesibles y esfera actual
conocida. Anotar su nombre visual; la sesión registra su ID de forma privada.
Si el vínculo actual ya no sirve, revisar el estado; no repetir automáticamente
«Conectar nuevo teléfono» ni los pasos de emparejamiento anteriores.

| Paso | Comando/acción exacta | Efecto persistente y reversión |
|---|---|---|
| Preparación PC | `node tools/pc-static-watchface.mjs prepare` | Verifica paquete/build; no Bluetooth ni escritura en reloj |
| Instalación propuesta | `node tools/pc-static-watchface.mjs install` | Actualmente bloqueado. Tras habilitación: auth, info2/2, GET4/0, INSTALL4/4, upload22/0 tipo16, partes MASS5 y GET. Escribe archivo/registro de esfera en almacenamiento persistente. No SET automático |
| Primera observación | En el reloj, abrir el selector habitual de esferas | Confirmar que existe RW4Probe, que la esfera anterior sigue disponible y que menús responden. Si no aparece, detener; no repetir instalación |
| Render | Seleccionar RW4Probe desde ese selector | Cambia selección persistente. Observar texto/barras y respuesta de la corona/gestos stock. No Doom ni prueba táctil programada |
| Volver | Abrir el mismo selector y seleccionar la esfera anterior | Comprobar hora/UI y que RW4Probe dejó de estar activa antes de borrarla |
| Retirada propuesta | `node tools/pc-static-watchface.mjs remove` | Actualmente bloqueado. Tras habilitación: registro privado de propiedad, auth/info/GET, DELETE4/2 exclusivamente propio e inactivo, ACK y GET posterior; escribe catálogo/almacenamiento para retirar la esfera |
| Cierre del bloque | Cerrar cliente PC; cuando se decida terminar, retorno a Mi Fitness por el flujo ya probado | Comprobar sincronización y funciones. No exigir esta transición entre pruebas del mismo bloque |

Los menús exactos de la unidad deben observarse al realizar la prueba; no
reutilizar coordenadas del emulador. Ante cualquier resultado de error o cierre
incierto, detener y conservar el JSON sanitizado y el registro privado. No
compartir claves, direcciones, registro privado ni logs crudos.

El envío usa un máximo32KiB total, sin reintentos ni resume. Un ACK que pida
chunk4096 se rechaza antes de enviar las partes, después de la solicitud de
instalación; puede quedar staging interno y el registro se marca incierto.
No hay eliminación automática de un staging o ID de procedencia incierta.
Un catálogo con el ID es solo registro; la aceptación visible la evalúa el
usuario. Cualquier activación inesperada exige detenerse y observar la UI.

## Backup, recuperación y riesgo

Se conservan el paquete original/hash, catálogo inicial y registro privado.
La sincronización habitual de Mi Fitness conserva los datos que esa app
soporte; no proporciona un backup de firmware ni de todas las esferas.
No se han leído particiones ni obtenido un backup completo del reloj.

Xiaomi documenta [gestión de esferas y problemas por archivos de esfera](https://www.mi.com/global/support/faq/details/KA-228715/)
y [reinicio normal/forzado](https://www.mi.com/global/support/faq/details/KA-228897/).
Si la UI funciona: seleccionar una esfera conocida y eliminar solo la propia
por el flujo propuesto o la gestión stock disponible. Si se bloquea: el reinicio
forzado documentado mantiene el botón de encendido unos12segundos; no se ha
ensayado con este paquete/build ni garantiza salir de un bucle de arranque.
No efectuar factory reset, flash o cambios de boot como fallback automático.

| Gate | Instalación / selección / retirada |
|---|---|
| ¿Reversible solo por reboot? | No: el paquete y la selección pueden persistir |
| ¿Escribe flash/almacenamiento persistente? | Sí, mediante el servicio stock de esferas |
| ¿Escribe particiones crudas? | Ningún comando para ello; no se conoce el mapeo interno del servicio stock |
| ¿Toca bootloader/recovery? | Ningún comando para ello |
| ¿Requiere firmware modificado? | No, la ruta propuesta usa firmware actual |
| Riesgo esperado | Mayor que las consultas anteriores; archivo/parser y transferencia todavía no validados físicamente. Sin porcentaje fiable |
| Peor fallo razonable | Transferencia parcial, corrupción de la esfera o UI bloqueada/reboots; posible reapertura persistente del paquete problemático |
| Soft brick | No descartado si UI/boot se bloquean y no permiten retirar la esfera |
| Hard brick | No hay operación de boot/flash crudo prevista; no se puede garantizar riesgo cero ante bugs desconocidos |
| Recovery conocido | Gestión stock y reboot documentados; restauración de firmware/boot2.2.86 NO validada |

La instalación de una imagen estática evita ejecutar scripts propios, pero
utiliza parsers nativos del firmware y no es una sandbox. La falta de recovery
integral sigue siendo una limitación que debe aceptar/revisar el usuario antes
de autorizar una escritura. La autorización previa de consultas NO cubre este
paso. Si el usuario necesita garantía de recuperación completa, no instalar.

Esta prueba no demuestra Lua, shell, `insmod`, privilegios, ABI, RAM libre o
capacidad de ejecutar Doom en el reloj. De salir bien, el siguiente gate sería
una esfera Lua mínima y su ciclo de salida/retirada, revisados por separado.
