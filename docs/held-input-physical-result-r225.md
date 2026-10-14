# R225/R226 — HoldPad y retorno normal confirmados en RW4

**Resultado R226:** tras las instrucciones de cuatro contactos sostenidos,
liberación, EXIT, selector y vuelta a la habitual, el usuario respondió:
«todo funciona al 100, super bien :D esto es muy bueno».
Se registra como confirmación del ciclo solicitado en M2315W1/FW2.2.86.
Ensayo completado; no autorización para repetirlo o instalar otro payload.

2026-10-13. Usuario autorizó [plan R225](held-input-physical-plan-r225.md):
«Sí, autorizo y puedo observar el reloj». Solicitud incluía batería≥50%; se
registra su afirmación, sin lectura adicional de batería. Un ensayo de paquete
fijo, cuatro contactos/EXIT/retorno. No permiso de repetir, borrar o enviar C.

## Instalación y cierre

HoldPad ID365219979,15552bytes, SHA256
`296868366da0f29a010777d031559ddf08a1c52d73f45021b9f3f034fbabff16`.
Fuente/paquete/informe UI verificados; journal/lock ausentes antes del intento.
Solo r224 y gate C# habilitados temporalmente. Helper autorizado SHA256
`de48e44fa6fe9e8d9f8337639bd4e06930bdb1ecdf7883e040708e9fa7ac9223`.
Copias privadas archivadas para evidencia: no ejecutarlas directamente.

Un `node tools/pc-static-watchface.mjs install r224` terminó RegisteredInactive:
8partes,15610bytes de stream,16045bytes TX/17frames TX/16RX. ID registrada,
eliminable e inactiva; selección anterior conservada. selectedByClient=false,
socket/worker cerrados, exit0, sin error nativo. Modelo/FW2.2.86 exigidos por
preflight. transferAcceptanceVerified=false: no afirmar ACK final explícito
ni funcionamiento runtime a partir de la transferencia.

En finally se restauraron fuentes Nodefalse/r167 y C#false; helper reconstruido
cerrado SHA256 `4d4fd3a822d5d5bb6e494c77e7578bcb4aaff8572254ae2b2568f01a185e88f0`.
Prueba de entradas cerradas pasó con cero sockets antes del GET independiente.

Un `node tools/pc-rfcomm.mjs watchfaces` terminó Complete con HMAC/ACK/cifrado
verificados. Catálogo15→16: las15previas conservan IDs/active/canDelete; solo
HoldPad añadida/inactiva/eliminable. Activa365210175 sin cambio. Segundo socket/
worker cerrados/exit0. Journal `held-input-r225.json` Registered/8partes/sin lock.

Reportes privados sanitizados en `artifacts/held-r225-authorized/`: autorización,
install-report, inventory-report y comparison; sin claves/MAC/serial/logs crudos
publicados. No SET/autoactivación, DELETE, firmware, reset, cambio de vínculo,
shell o C desde PC. Solo almacenamiento del paquete stock y consultas previstas.

## Historial: observación solicitada tras instalar

Seleccionar HoldPad (cinco barras naranjas) una vez, comprobar cinco grises y
START. Si inicial rojo/pantalla fallida/etiquetas ausentes, no START ni repetir.
START una vez; UP/LEFT/RIGHT/FIRE mantenidos unos4s cadauno y soltar: acción
verde durante hold/gris después; selector no debe abrir durante juego. EXIT
una vez; observar cinco filas finales. Mantener zona neutra sobre START para
abrir selector; volver a habitual y confirmar menús/scroll/pulsación larga.
Si selector no abre, Ajustes→Esferas como recuperación parcial conocida.
No reabrir o repetir START ni pruebas C anteriores.

En ese momento no se habían observado controles/EXIT/selector físicos; el
resultado R226 siguiente completa esa observación según respuesta del usuario.

## R226 — alcance de la confirmación

La respuesta global confirma la prueba indicada: sostener controles sin abrir
el selector, liberar al soltar, salir y recuperar navegación/cambio normales.
No constituye una transcripción individual de los cinco colores ni medición
cronometrada de cada hold; no se recogieron logs de runtime del reloj. Tampoco
demuestra pérdida de foco durante contacto, cancelación física fuera de zona,
multitouch, comodidad en muñeca, corona o sesiones prolongadas.

La máscara de acciones vive en Lua: no se enviaron teclas a C ni al motor.
El script solo modifica objetos propios; no desactiva el ajuste stock global.
Con R222 se tienen dos piezas físicas separadas: imágenes generadas en C y
animadas por Lua, y ahora contacto sostenido/salida stock. Falta unirlas en un
backend C que siga atendiendo input sin bloquear la UI. La carga anterior de
C fue síncrona y finita; no implica un worker residente ya validado en RW4.

La watchface es un contenedor viable para seguir desarrollando este recorrido;
no significa Doom jugable, app separada, sandbox o recuperación integral nuevos.
El paquete sigue almacenado; START solo se limita por VM, no por marca en flash.
No reabrir para repetir ni retirar automáticamente. Gates siguen cerrados.
