# R164 — Mi Fitness sincronizado; candidata del vínculo nuevo preparada

2026-10-12. El usuario confirma «conectado y sincronizado con mi fitness»
después del retorno solicitado en R163. No repetir preguntas ni otro retorno
antes del próximo bloque. Se conservó la autorización de leer logs por USB.

Lectura SDK fijado por SHA256 completada: cuatro .log actuales, a la carpeta
privada tools/local/mi-fitness-logs-usb-r164/, sin sobrescribir snapshots previos.
No app lanzada, operación Bluetooth, comando de reloj o modificación de archivos
remotos. Se usó el mismo helper acotado de R162 con destino nuevo; permisos USB
ya autorizados. No HCI, logcat, root, bases de datos o nuevas instalaciones.

Inspección local: un archivo con tres líneas contextuales RW4 y un único valor
de 32 hex, coincidente entre encryptKey/token. Es diferente tanto de la clave
usada en los fallos R161 como del candidato de R162. Actividad máxima reconocida
2026-10-12 y fecha de línea precedente cercana a las claves también 2026-10-12;
sin timestamp propio reconocido, JSON same-object o MAC target reconocida en
esas líneas. No afirmar que esos límites de parsing prueban ausencia de identidad
en el archivo. La sincronización confirmada por el propietario y la lectura
posterior refuerzan la procedencia del vínculo activo, sin verificar HMAC.

La nueva candidata fue guardada en tools/local/pc-rfcomm/auth-candidate-r164.json
y preparada en auth.json para el cliente. La configuración anterior se preservó
en auth-historical-r159.json; validación validateAuth, escritura temporal y rename
local, comprobación de lectura posterior. Reversible en el PC; no envíos de clave,
hash de clave, MAC o registros al chat/Git. El candidato R162 sigue separado.
HMAC nuevo aún NO probado. No iterar automáticamente alternativas ni cambiar el
algoritmo para aceptar un HMAC inválido. Cliente SPP/EXE/hash de R160 intactos.

## Próximo intento manual; conservar la asociación

El [plan revisable R163](windows-directed-pairing-plan-r163.md) está preparado y
sus pruebas offline ya pasaron. Se indica un único intento manual de pairing
Bluetooth stock dentro del alcance de las pruebas Windows solicitadas por el
usuario; el agente no ejecuta la operación. La variante dirigida a la dirección
conocida NO está validada en RW4 ni garantiza conservar la asociación Mi Fitness.

1. Apagar temporalmente Bluetooth del teléfono, SIN Desvincular de Mi Fitness.
   Mantener el reloj encendido en sus menús normales. No Conectar nuevo teléfono,
   QR, reset o cambio de cuenta. Bluetooth PC sigue encendido por el teclado.
2. Una vez: node tools/pc-pairing.mjs pair, desde la raíz del repo.
3. Si aparece comparación, verificar el mismo código entre el reloj y Windows
   antes de aceptar. Cancelar código diferente, PIN, dispositivo inesperado,
   aviso de borrado/migración o petición de usar Conectar nuevo teléfono.
4. Compartir solo el JSON; no session/probe todavía. Preservar el bloque PC si
   fue exitoso y el reloj sigue con menús normales. Si falla o vuelve a QR,
   no repetir ni regenerar vínculos: revisar el resultado primero.

Esta operación solicita un bond persistente stock; puede alterar registros del
vínculo y requerir volver a Mi Fitness por el procedimiento ya observado. Reboot
no deshace automáticamente ese cambio. No archivos, firmware, particiones o
código nuevo del reloj solicitados. Plan R163 describe comando, componente,
writes, peor fallo, recuperación y límites de compatibilidad. Recovery integral
de firmware sigue sin validar; no subir ELF/módulos/esferas/WAD por este resultado.

Meta única: comprobar si Windows acepta el bond dirigido mientras se conserva
el vínculo de aplicación. Después, con el mismo bond si funciona, validar la
candidata mediante la sesión de consultas ya preparada; sin volver a Mi Fitness
entre cada consulta. No afirmar éxito físico antes del JSON del usuario.
