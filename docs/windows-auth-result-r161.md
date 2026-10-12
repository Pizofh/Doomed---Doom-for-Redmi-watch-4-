# R161 — protocolo Xiaomi v1 responde; autenticación no verificada

2026-10-12. El usuario ejecutó dos sesiones después del nuevo vínculo Windows.
Durante la primera, el reloj pidió vincular otra vez; el usuario aceptó y ejecutó
la segunda. No fue un retry automático del cliente. No repetir con esta clave.

| Campo del JSON | Primera sesión | Segunda sesión |
|---|---|---|
| status | AuthHmacMismatch | AuthHmacMismatch |
| protocolVersion | 1 | 1 |
| sentFrames / receivedFrames | 2 / 2 | 2 / 2 |
| keyHmacVerified / authenticationAck | false / false | false / false |
| encryptedDataReceived | false | false |
| batería / modelo / firmware | null / null / null | null / null / null |
| closeConfirmed / workerExitConfirmed | true / true | true / true |
| workerExitCode / nativeError / supervisor | 0 / false / null | 0 / false / null |
| nativeStage / failureStage / nativeErrorCode | Close / null / null | Close / null / null |
| connectionRequested / bluetoothOperationRequested | true / true | true / true |
| watchCommandRequested / filesTransferred / rawOutputSaved | true / false / false | true / false / false |
| elapsedMs | 7433 | 1762 |

## Lo demostrado y el límite

SPP ya permite intercambio de aplicación: versión Xiaomi v1 y respuesta al
desafío nonce. No es únicamente el perfil audio. El HMAC recibido no coincide
con el calculado usando el candidato histórico. El cliente no envió auth-final
ni las consultas de batería/info, y ambos sockets/workers cerraron normalmente.
La autenticación Bluetooth del vínculo y la autenticación Xiaomi son capas
distintas. No se enviaron archivos, Lua, ELF, WAD o firmware.

La clave histórica no autentica estos intentos con nuestra implementación;
eso no demuestra por sí solo qué clave usa el reloj ni que la causa sea
exclusivamente una clave caducada. Tampoco prueba que el firmware use exactamente
el algoritmo de esta versión de Gadgetbridge. No hay payload crudo retenido para
reproducir el desafío real offline; se conserva solo el informe sanitizado.

## Revisión de código y procedencia

Relectura local de XiaomiAuthService.java en el worktree de diagnóstico existente:
computeAuthStep3Hmac usa HMAC-SHA256 con salt phoneNonce||watchNonce, secret como
entrada, expansión de 64 bytes con miwear-auth. Los primeros 16 bytes son RX,
los siguientes 16 TX. La confirmación recibida es HMAC(RX, watchNonce||phoneNonce).
derive/authResponse en nuestro módulo usan el mismo orden y separación. El
watchNonce y HMAC se leen de los campos protobuf 31/1 y 31/2; tamaños se validan.
Las pruebas existentes comparan la expansión con hkdfSync y verifican que un
mismatch impide enviar auth-final/queries. No se cambió código ni se recompiló,
ni se repitieron pruebas offline sin un cambio que lo requiera.

La [guía primaria de Gadgetbridge](https://gadgetbridge.org/basics/pairing/huami-xiaomi-server/#entering-key),
reconsultada hoy, advierte que desvincular de la app fabricante invalida la clave.
Es evidencia documental de familia; la rotación concreta de nuestra unidad no
se midió. Hubo desvinculaciones/migraciones desde la copia histórica de logs:
una credencial obsoleta es la hipótesis principal. La solicitud de pairing de
la primera sesión pertenece a Bluetooth; no valida ni renueva la clave Xiaomi.

## Siguiente checkpoint y transición necesaria

Una vuelta al flujo Mi Fitness ya observado para obtener logs posteriores a la
sincronización actual. Quitar SOLO el reloj de Windows; Bluetooth del teléfono
encendido, vincular mediante Mi Fitness habitual y comprobar sincronización.
No reset, cambio de cuenta, desinstalación, actualización o botón basura como
equivalente. Es el retorno stock autorizado, no recuperación de firmware.

Copiar los .log actuales desde
Android/data/com.xiaomi.wearable/files/log al directorio privado nuevo
tools/local/mi-fitness-logs-current/ (sin mezclar con copias históricas). La copia
es local/PC, no enviar logs o claves al chat/cloud/Git. Acceso por el método de
archivos ya usado; no activar HCI ni root. Originales del teléfono se conservan.

Después CONSERVAR la asociación Mi Fitness: no Desvincular ni Conectar nuevo
teléfono para probar inmediatamente Windows. Revisar primero la credencial y
un mecanismo de acceso PC que conserve dicha asociación. Obtener una clave
fresca y volver a invalidarla mediante otro unlink sería repetir el problema.
Los archivos nuevos se inspeccionarán localmente sin mostrar valores; no se
sobrescribe automáticamente auth.json ni se prueba una lista de candidatos.

Meta única: establecer un candidato de autenticación reciente y asociado a
esta unidad, sin otra prueba de radio todavía. La verificación criptográfica
solo podrá afirmarse tras una futura sesión con HMAC válido. El retorno de
estos dos intentos a Mi Fitness sigue pendiente; no pedir un retorno entre
consultas del mismo bloque. Instalación y código nativo físico siguen cerrados.
