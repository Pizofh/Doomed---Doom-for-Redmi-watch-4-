# Autenticación RW4 y retorno a Mi Fitness: evidencia disponible

R97, 2026-10-06. El usuario solicita investigar antes de continuar la consulta
autorizada en R96. **No guiar Conectar mientras se revisa esta evidencia.**
Última UI reportada: pantalla de clave. No entrada/guardado de clave ni
autenticación confirmados. No nuevos ensayos de emulador, build o hardware.

Resultado: hay implementación específica RW4 y documentación de autenticación
para la familia Xiaomi; no se encontró una prueba reproducible del ciclo de
retorno a Mi Fitness en M2315W1/2.2.86. Ausencia de evidencia accesible no
equivale a incompatibilidad ni demuestra daños. PR original pendiente de leer.

## Fuentes consultadas y límites

| Fuente primaria / original | Evidencia | Límite |
|---|---|---|
| [Release 0.81.0, 2024-07-05](https://gadgetbridge.org/blog/release-0_81_0/) | Introdujo soporte RW4 como experimental | No especifica firmware/región ni prueba de retorno al fabricante |
| [Ficha RW4 actual](https://gadgetbridge.org/gadgets/wearables/xiaomi/#redmi-watch-4) | Coordinator dedicado, token Xiaomi requerido, experimental y cobertura desconocida | No presenta ciclo auth/desconexión/Mi Fitness para 2.2.86 |
| [Protocolo Xiaomi upstream](https://gadgetbridge.org/basics/topics/xiaomi-protobuf/) | Auth/encryption, GET info/batería implementados; selección BLE/Classic puede fallar según firmware | Documentación de familia, no prueba de nuestra build/unidad |
| [Guía de claves y conflictos](https://gadgetbridge.org/basics/pairing/huami-xiaomi-server/#entering-key) | Advierte conflicto con app fabricante e invalidación al desvincular | Recomienda retirar permisos/desinstalar fabricante como ruta genérica; no prueba que forzar detención y volver funcione en RW4 |
| [PR original #3693](https://codeberg.org/Freeyourgadget/Gadgetbridge/pulls/3693) | La ficha lo identifica como incorporación del soporte RW4 | Página/API no accesibles por esta herramienta; no afirmar que se leyeron descripción/comentarios |
| [Reporte original, hilo Watch 5](https://www.reddit.com/r/Gadgetbridge/comments/1jrv9wo/redmi_watch_5_authentication_token/) | Autor menciona que Watch 4 funcionaba y reporta usar perfil RW4 en Watch 5 | Sin firmware/región/retorno del RW4; éxito narrado con perfil RW4 corresponde al Watch 5. No convertirlo en prueba del M2315W1 |

Los relatos RW4/2.2.86 sobre actualizaciones o fallos stock de otros foros no
demuestran interacción con Gadgetbridge. No atribuir un reboot stock a auth
sin relación reproducible ni usar testimonios de Watch 5/Mi Band como garantía.

## Qué aporta el código ya disponible en PC

Archivo de fuentes Gadgetbridge 0.94.0/code253, pin SHA256
`700b2364858e6d26c4446c277d5c89ec7cba795d857d90a7a8d68533c1a69cb1`.
Se releyeron textos seleccionados y las fuentes parcheadas de r92; no se
leyeron ni publicaron claves/identificadores del usuario.

- RedmiWatch4Coordinator identifica el nombre RW4, marca experimental y
  selecciona BT_CLASSIC. Estar vinculado para llamadas no demuestra que el
  servicio SPP esperado funcione con esta app/firmware.
- XiaomiAuthService.startEncryptedHandshake usa la clave existente y nonce
  aleatorio. handleWatchNonce deriva claves de sesión y envía metadatos del
  teléfono/API/idioma; hay campos desconocidos/TODO. No contiene una operación
  explícita de desvincular o instalar firmware en esa ruta. Efectos internos
  del firmware y conservación de ownership no pueden probarse desde el cliente.
- XiaomiSppSupport.dispose delega al soporte; BtBRQueue dispone de cierre del
  socket/cleanup. Eso respalda el retorno propuesto como diseño, sin demostrar
  cierre efectivo, latencia o reconexión Mi Fitness en Android16/RW4 2.2.86.
- En r92, Discovery registra solo almacenamiento privado del teléfono y exige
  bond existente; onAuthSuccess permite únicamente batería/info. Los filtros
  y pruebas PC reducen alcance, sin convertir autenticación en lectura pasiva.

No nuevo test necesario: no cambiaron implementación ni APK. Pruebas de código
no reemplazan evidencia del firmware o del ciclo de retorno a Mi Fitness.

## Búsqueda reproducible y cobertura

Consultas usadas, con variantes y revisión de resultados originales:

```text
"Gadgetbridge" "Redmi Watch 4" "Mi Fitness"
"Redmi Watch 4" "2.2.86" Gadgetbridge
site:codeberg.org/Freeyourgadget/Gadgetbridge "Redmi Watch 4"
"Redmi Watch 4" "Gadgetbridge" "connected"
"Redmi Watch 4" "Gadgetbridge" "reconnect"
"Redmi Watch 4" "Gadgetbridge" "Mi Fitness" "back"
"Redmi Watch 4" "Gadgetbridge" "Mi Fitness" "switch"
"Redmi Watch 4" "3693"
site:reddit.com/r/Gadgetbridge "redmi watch 4"
```

Codeberg y sus API de issue/comments fallaron; GitHub/Gitea history/API tampoco
entregaron historial legible. No intentar eludir restricciones. La búsqueda
indexada no cubre toda la comunidad ni Matrix/Telegram/grupos privados. No
enviar mensajes, logs ni APK a terceros automáticamente.

Se pidió al usuario abrir el PR #3693 desde su navegador y aportar únicamente
descripción/comentarios relevantes, excluyendo logs/credenciales/MAC/serial.
Es una lectura documental; no exige nuevas acciones sobre el reloj.

## Evidencia necesaria para resolver la incertidumbre

Reporte de propietario/mantenedor con modelo real, región, firmware, versión
cliente y pasos: vínculo Mi Fitness conservado → detener fabricante → auth
Gadgetbridge → desconectar → volver a Mi Fitness, sin reset/unpair ni cambio
de clave. Idealmente 2.2.86; otra versión solo aporta evidencia parcial.

No requerimos que reporte incluya una clave ni dump de firmware. La prueba
del upstream original tampoco garantiza nuestra variante, pero ayuda a valorar
viabilidad/retorno. Un fallo de auth no demuestra un brick; un test exitoso
no establece recuperación de firmware corrupto.

Siguiente checkpoint: leer la discusión original #3693 y clasificar sus pruebas.
Si no contiene lo necesario, preparar pregunta para upstream, sin publicarla
hasta autorización de envío. El intento de conexión sigue pendiente.
