# R279: extracción persistente y transferencia grande en PC

El emulador S3 extrajo el carrier de4,8MB y conservó los tres archivos con
hashes idénticos tras reiniciar. El modelo de upload pasó siete escenarios
con el paquete real y con datos sintéticos, más doce rechazos. **No hubo
Bluetooth, instalación física ni ejecución del ELF RW4.**

## Extracción y persistencia

`tools/doom-assets-emulator-r279.mjs` instala únicamente el carrier R278 en
la VM propia, como ID PC365799912. Verifica que el registro de módulos esté
vacío, conserva snapshot y recurso anterior del catálogo, cambia solo byte5
a10 e ID para el bridge del emulador, hace push/readback y rescan/reset.
Después se seleccionó DoomAssets desde la UI stock. Su main.lua de220bytes
solo crea dos objetos de color; no tiene I/O, Timer, insmod o llamadas C.

Se descargaron y verificaron contra los recursos originales:

| Archivo extraído | Bytes | Resultado antes y después de reset |
|---|---:|---|
| lua/main.lua |220| SHA256 idéntico |
| lua/doom.elf |603692| SHA25645d3044d… idéntico; ARMv8-M tratado solo como datos |
| lua/doom1.wad |4196020| SHA2561d7d43be… idéntico |

Informes: `artifacts/emulator/doom-assets-verify-1792078027023/result.json`
y `doom-assets-verify-1792078339669/result.json`. Entre ambos hubo reset sin
otro push. El primer connect inmediatamente después del reset aún no encontró
el guest; el guard de la verificación siguiente conectó y pasó. El carrier
permanece instalado/seleccionado en PC y sus archivos están bajo
`/data/app/watchface/market/365799912/lua/`. No hay módulos cargados.
Esto prueba persistencia/extracción en S3, no en M2315W1.

## Modelo de transferencia grande

`tools/doom-large-upload.mjs` no contiene backend RFCOMM, ADB, procesos o CLI de
instalación. Solo admite un adaptador con ámbito `pc-upload-simulator`. Conserva
los límites actuales de los probes y del worker nativo; no los eleva.

El preparador exige el hash/tamaño exactos del carrier R278. Se detectó que el
Compiler deja ID167210065 en el header aunque reciba otro argumento. La copia
de upload corrige sus nueve bytes a365219963, manteniendo byte5=0. SHA256 nuevo:
`100b40aa866b327761f75fefd300a2c1647e5c3cdd3baa5afd4d7fd6cd2a155f`.
Este paquete sigue sin launcher C y sin WAD path asignado: no está listo para
enviar. No se añade como variante al instalador físico existente.

El modelo implementa tipo16, MD5/tamaño completos, suffix desde resumePosition,
CRC32 del nuevo stream, partes LE16/LE16 y MASS5/CCM. El serial exterior es de
8bits y hace wrap explícito; los números de parte son independientes. Solo se
admiten chunks2048/4080 y hasta4096partes. No se inventan ACKs por parte:
`send()` confirma escritura local del adaptador, no recepción del reloj.

Antes de cada lote de hasta32partes se persiste intención; después se registra
lo escrito localmente. Un fallo detiene el lote con estado Uncertain, sin
reenvío automático. La reanudación exige el mismo plan, MD5 del ACK, offset
acotado por la intención anterior y un nuevo stream numerado desde1. El journal
no autentica el contenido remoto del prefijo. El presupuesto wire se calcula
antes de enviar; pacing100ms y límite600s se evalúan entre escrituras. Ese
límite no interrumpe una promesa de transporte atascada: un backend real aún
necesita timeout/cierre propios.

Referencia primaria ya disponible localmente: Gadgetbridge253 y sus fuentes
XiaomiDataUploadService.java, XiaomiSppProtocolV1.java, XiaomiSppPacketV1.java.
El SHA700b2364… citado en R270 corresponde al archivo de distribución fuente,
no al archivo Java individual; la copia Java consultada tiene SHA5cb3f33a….
Se contrastaron el suffix/CRC/numeración, el nonce de MASS y serial&0xff.
No se ejecutaron los archivos Java ni se modificó la app Android.

## Pruebas

El peer de pruebas descifra con una implementación independiente de CCM y
reconstruye el stream. Comprueba CRC con otra implementación contrastada con
el vector123456789, MD5, bytes completos, secuencia y wrap del serial. Los
journals privados usan write/fsync real en PC antes de permitir cada lote.

| Escenario | Resultado |
|---|---|
| Completo, chunk2048 |2353frames; paquete reconstruido idéntico |
| Completo, chunk4080 |1180frames; paquete reconstruido idéntico |
| Desconexión tras posible entrega de parte11 | Uncertain; solo10 escrituras confirmadas localmente |
| Reanudación en offset22462 |2342frames; prefijo más suffix reconstruyen el archivo completo |
| Falla del journal antes del primer lote |0frames enviados |
| Falla al registrar el primer lote terminado |32frames; detención Uncertain |
| Límite temporal vencido |0frames; detención Uncertain |

Doce rechazos adicionales cubren MD5/ACK/offset/chunk inválidos, plan cambiado
o ajeno y frame excesivo. Una copia modificada no altera el plan interno.
Todos los envíos completos terminan **SentNotVerified**, nunca instalados.
Los235,2s del caso2048 son tiempo virtual de pacing, no tiempo medido de radio.

Resultado real: `artifacts/doom-large-upload-r279-1792078435595/result.json`.
Sintético: `doom-large-upload-r279-1792078411502/result.json`.
El primer test reconstruía innecesariamente el layout completo por frame;
se canceló ese proceso y se reutiliza un layout por escenario. No cambió el
formato ni se usó ese intento incompleto como resultado aprobado.

```powershell
# Solo con los assets privados R278 preparados:
node tools/test-doom-large-upload.mjs
# Sin Doom, firmware, toolchain, emulador o secretos:
node tools/test-doom-large-upload.mjs --synthetic
# Comprobación de que los accesos físicos previos siguen cerrados:
node tools/test-static-watchface-gates.mjs
```

Se añadió el job large-file-model al workflow pc-rfcomm-offline.yml, con fixture
propia determinista de4807680bytes. No sube artifacts ni requiere WAD/firmware.
La prueba sintética pasó localmente; **GitHub Actions no se ejecutó desde esta
sesión**. La prueba de gates existentes pasó con cero sockets/operaciones BT.

## Pendiente para el instalador completo

Falta conectar este modelo al cliente autenticado y al worker RFCOMM mediante
un perfil específico, con presupuesto, deadline, contrapresión, cierre y
verificación del catálogo. El modelo actual comienza después del ACK de upload;
no implementa autenticación, install-start, consulta de catálogo o borrado.
No se abrirán sus límites antiguos de forma global ni se hará fallback desde0.

Después hay que integrar el launcher RW4, ruta WAD persistente, comprobación de
assets/memoria y su ensayo PC. La aceptación de un paquete grande y la RAM
libre del reloj siguen sin demostrar. R270 continúa siendo el último ensayo
físico y no hay nueva autorización para enviar estos archivos.
