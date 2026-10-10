# Diagnóstico visible de conexión — R101

**R102:** usuario confirma actualización r101 instalada en el teléfono.
Apertura/UI estable y segundo intento aún sin resultados reportados. Las
notas de preparación inferiores corresponden a R101.

2026-10-09. El primer intento r92 solo mostró «No conectado». Mi Fitness
conecta después; el usuario confirma que había forzado su detención antes y
que Dispositivos cercanos estaba permitido. No hay causa demostrada ni
evidencia de rechazo de clave. El nombre visible no demuestra autenticación.

## Cambio y límites

R101 muestra etapas en la tarjeta del dispositivo y conserva hasta 24 códigos
en preferencias privadas del teléfono. Solo permite valores enum definidos:
no registra claves, MAC, serial, paquetes o mensajes de excepciones en este
diagnóstico. Código/campos del reloj no se usan para construir el texto.
La cadena sigue disponible al cerrar/reabrir la app; un nuevo toque Conectar
empieza la cadena de solicitud. No extraer ni pedir logs completos.

| Código | Etapa |
|---|---|
| D01–D03 | Solicitud manual, servicio y creación de soporte |
| D04–D05 | Inicio y éxito del socket Bluetooth |
| D06–D07 | Consulta y respuesta del protocolo |
| D08–D10 | Inicio, respuesta y éxito de autenticación |
| D11–D12 | Respuestas de batería e información |
| D13 | Cierre; leer también los códigos anteriores |
| E01–E02 | Rechazo local de solicitud o soporte no disponible |
| E03–E04 | Fallo del socket o bloqueo por permisos Android |
| E05 | Timeout del protocolo; continúa el fallback upstream |
| E06–E07 | Fallo de autenticación o comando bloqueado por política |
| E08–E09 | Límite de sesión o excepción local de conexión |

Las marcas prueban que se alcanzó una rama de código; no certifican efectos
internos del firmware. AUTH_STARTED precede la preparación/envío del nonce;
COMMAND_BLOCKED indica decisión local, no rechazo del reloj. E06 no identifica
por sí solo una clave inválida. D13 no garantiza cierre físico puntual del socket.
No se alteraron whitelist, expiración del ticket, límite 30s, ausencia de
reconexión automática ni bloqueo de uploads. Nuevos writes: códigos de etapa
solo en almacenamiento privado del teléfono. No firmware/nativo/instalación
de watchfaces en el reloj.

## Validación y artefacto

Pruebas Java: política/session/ticket y traza acotada, descarte de entradas
desconocidas y conservación de fallo tras cierre; WriteAction de cola pasa.
Build Android completo **BUILD SUCCESSFUL**; lintVital pasa con baseline
upstream, sin afirmar auditoría lint exhaustiva. Advertencias upstream de
deprecación/manifiesto conservadas. Primer build falló por red del sandbox;
rerun con aprobación fuera del sandbox completó dependencias/build.

Inspector estático pasa: package existente, versión
`0.94.0-rw4-diagnostic-r101`, debuggable false, 10 permisos, sin INTERNET ni
bindings sensibles. apksigner oficial exit0/Verifies, v1/v2, mismo certificado
`47eeb041e241c7ab785ed8bdcf06c6fcce90020e52d4794aa3c6c66590577709`.
Warnings META-INF documentados, firma no prueba inocuidad. Lectura ZIP/DEX
confirma clases nuevas de traza/status incluidas; no APK ejecutado en PC.

Paquete local ignorado por Git:
`artifacts/android-diagnostic-r101/RW4Diagnostics-r101.apk`.
31394664 bytes; SHA256
`61888725cda97a93f52e43cabf745c314c5d56c168c3a97fae5cca78ffb8c3a3`.
`SHA256SUMS.txt` y `review.json` acompañan el APK. Bundle r92 histórico intacto;
su helper exige el build r92, no usarlo para empaquetar r101.

```powershell
node tools/prepare-android-diagnostic.mjs
node tools/test-android-diagnostic-policy.mjs
node tools/test-android-diagnostic-queue.mjs
node tools/android-build.mjs refresh
node tools/android-build.mjs build
node tools/inspect-android-diagnostic.mjs
# Verificar firma oficial y conservar reporte r101 antes de empaquetar.
node tools/package-android-diagnostic.mjs
```

## Siguiente paso manual

Actualizar nuestra app en el teléfono usando el paquete revisado, con Bluetooth
apagado durante instalación/apertura inicial. Mismo package/certificado:
actualización sobre la app existente; no borrar datos ni desinstalar para
resolver un conflicto de firma. Confirmar versión r101 y pantalla estable.
No instalación ni UI r101 probadas aún.

Después revisar un segundo intento manual de auth/GET: detener Mi Fitness,
restaurar Bluetooth, un toque Conectar/30s, capturar únicamente códigos de
etapa, desconectar/salir y comprobar retorno Mi Fitness. No ejecutar ni
autorizar reintentos automáticos; alcance y límites del
[plan de consulta](first-rw4-query-plan.md) se mantienen. No pedir otra vez la
clave si Android conserva los datos; no compartir capturas del registro.
