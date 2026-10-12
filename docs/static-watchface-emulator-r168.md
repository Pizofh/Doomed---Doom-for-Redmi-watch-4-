# R168 — esfera estática validada en emulador; transferencia aún offline

2026-10-12. No Bluetooth, comandos ni archivos enviados al reloj físico en esta
sesión. El usuario conserva el vínculo Windows del bloque previo; no se pidió
otro cambio de asociación ni datos del teléfono.

## Validación del mismo paquete, sin ajustar su versión

El emulador antiguo no estaba ejecutándose. Se verificó ausencia del PID27964,
QEMU y listeners locales; CIM requirió escalación por permiso. Se archivó el
registro viejo sin terminar procesos ni inventar su fecha de salida. Arranque
headless oculto del launcher revisado: Node5588,launcher440,QEMU25900. Estos PID
son históricos, no identificadores reutilizables para matar procesos.

Transporte dedicado ADB5039/emulator-5554, guard de identidad/propiedad de QEMU,
puertos localhost y sin USB. El teléfono no fue usado. MiWatchEmulator sigue
siendo guest XiaomiWatchS3, no firmware/SoC exacto RW4. Datos del guest y lista
respaldados antes de cambios; snapshot de imagen pausada no garantiza toda la
consistencia del filesystem ni incluye RAM.

Se instaló SOLO /data/app/watchface/market/365799910/resource.bin del paquete
RW4Probe-id-only.face revisado:25224bytes,SHA256
7df88688c61e63b1aaab208ddf2b3976bf912fbaa08c01bf6f0d0e986ad9e93a.
Readback idéntico. Byte5 original0 conservado; variante bridge no utilizada.

| Prueba | Resultado / evidencia local ignorada |
|---|---|
| Registrar tras rescan/reset | RW4Probe,id365799910,version0 en caché |
| Preview en selector stock | screenshots/static-r168-raw-last.png |
| Abrir el paquete | screenshots/static-r168-render.png: texto y tres barras RGB390×450 |
| Menús stock accesibles | Panel→Settings→Watchfaces durante prueba |
| Volver a esfera conocida sin reboot | screenshots/static-r168-stock-return.png,Storage activo; propia in_use0 |
| Retirar archivos propios en guest | Resource SHA comprobado,inactivo,solo nombres resource.bin/preview.bin/config.json; rmdir del directorio vacío |
| Tras rescan/reset posterior | Propia ausente,25IDs ajenos conservados,UI stock normal; static-r168-after-removal-ready.png |

La navegación del selector necesitó gestos más amplios; la presencia inicial
de la caché no se tomó como prueba de render. No se aplicó un parche header para
resolverlo: el mismo paquete original funciona en este runtime. Se vieron
scrollbars del contenedor; el contenido de la imagen sí coincide visualmente.
No medir FPS/latencia/memoria con estas capturas.

Se corrigió una colisión de nombres de logs: el log ADB list-before.json podía
sobrescribir el archivo de caché descargado con igual nombre. La primera
retirada falló en preflight antes de borrar. Logs ahora adb-<label>.json; la
retirada final guardó caché/backup separados y verificó igualdad del conjunto
de IDs ajenos antes/después. El backup de imagen pausada original no fue
sobrescrito por ese bug. Una consulta inmediata tras reset falló porque aún no
había caché regenerada; la lectura posterior la confirmó, sin repetir borrados.

Importante: is_delete0 también aparece en las otras esferas del emulador
instaladas por filesystem. Borrar esta carpeta propia con ADB NO valida la
operación Xiaomi DELETE ni garantiza canDelete en hardware. El editor del
bridge cambia byte5 a10 y la caché informa version2560 para aquellos paquetes:
no denominarlo automáticamente formato físico «versión10». Nuestro candidato
permanece intacto y la revisión local marca emulatorValidated=true,
hardwareValidated=false,installed=false (referido al reloj físico).

## Prototipo de transferencia y retirada, sin backend real

tools/static-watchface-transfer.mjs solo admite la imagen fija por tamaño,
magic,ID,byte5 y SHA256 exacto. Crea planes internos inmutables; objetos externos
no sirven para invocar su flujo. Por defecto inspecciona archivos PC y no tiene
backend Bluetooth,ADB o procesos. No instala ni borra en hardware.

Hechos del cliente Gadgetbridge estudiados:

- Watchface INSTALL4/4 lleva WatchfaceInstallStart id/tamaño; upload request22/0,
  Command.dataUpload campo24,tipo16,MD5,tamaño. Tipo32 corresponde a firmware;
  no parametrizarlo ni ofrecer archivos genéricos.
- El stream es0,tipo16,MD5(16bytes),tamañoLE32,archivo,CRC32LE. Cada parte lleva
  totalLE16 y númeroLE16. Default2048 produce13partes para esta imagen; tamaños
  aceptados512..4080, máximo64partes. Resume distinto de0 se rechaza.
- El transporte SPP V1 usa canal MASS5, cifrado CCM con nonce0 y sin prefijo del
  contador de comandos; canal OTA7 no se necesita. Se consultaron las copias
  originales artifacts/research/gadgetbridge-source/XiaomiSppSupport.java y
  XiaomiSppPacketV1.java; el worktree Android diagnóstico tiene sendDataChunk
  deliberadamente bloqueado y no sirve como implementación original de upload.
- La implementación original callback.onSend se llama al encolar; no confirma
  aceptación remota. Su callback de watchface hace SET automático después.
  El prototipo omite SET y consulta lista; usa registeredVerified, NO
  installedVerified/transferAcceptanceVerified. Un ID presente no acredita
  validación del contenido completo por el firmware.

Flujo simulado:auth/contextV1,FW2.2.86/modelo reconocido,lista sin colisión y
con una esfera activa,InstallStart,ACKupload,partes y hasta6consultas de lista.
No seleccionar automáticamente. Reporta registro inactivo, no eliminable o
activación inesperada; no trata ninguno como éxito de render físico.

Retirada simulada requiere receipt interno del plan creado en esta ejecución,
ID propio presente/inactivo/canDelete,DELETE4/2/ACK1 y lista posterior sin propio
y sin pérdida de IDs ajenos. No puede borrar otro ID. Este receipt vive solo
en memoria: falta diario privado de ownership/estado ligado al target para
retirada en otra ejecución y recuperación de transferencia parcial. No
presentar ese mecanismo como sandbox ni como instalador físico terminado.

Pruebas locales con la imagen propia y APIs falsas:12escenarios más codec CRC32
check value,partes512/2048/4080,MD5/protobuf/tamaño/ID y archivos alterados.
Incluyen colisión/FW incorrecto/sin activa/16KiB antes de writes,resume/start
rechazados,activación/no-removible,envío sin registro y pérdida de entrada ajena.
No sockets/OS/radio. Dependen del artefacto propio local; no se añadieron aún
a CI sin una estrategia de fixture legal/reproducible. CI remoto no ejecutado.

## Siguiente checkpoint obligatorio antes de aprobación física

Integrar prototipo y diario de propiedad con un modo separado del transporte,
acotado a este paquete. El worker actual de lecturas tiene límite16KiB, menor
que el archivo25KiB: el prototipo exige32KiB y rechaza ese worker ANTES de iniciar
la escritura. No aumentar globalmente su límite ni intentar transferir a medias.
Completar pruebas por wire/IPC,failure/cleanup y retirada persistente; mantener
CLI físico bloqueado hasta plan/paquete/retorno revisables y revisión del usuario.

Preparar plan físico de INSTALL del paquete concreto, restricciones de tipo,
selección manual,retorno a esfera anterior y retirada exclusiva,peor fallo,
recovery conocido y límites de compatibilidad. Nada de Doom,Lua,C,ELF,kernel,
OTA o modificación de firmware autorizado por estas pruebas del PC.
