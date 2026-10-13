# R192 — inicio de adquisición de metadatos, solo PC

**Continuación R193:** [otras copias locales permitieron obtener e inspeccionar
el paquete 2.2.86](firmware-analysis-r193.md). Este documento conserva el resultado
de la carpeta original vacía; no describe la totalidad de los logs disponibles.

2026-10-12. Después de [confirmar el shellRW4](native-info-physical-result-r190.md)
se busca evidencia del [contrato nativo2.2.86](rw4-native-contract.md), sin
probar un loader con un ELF desconocido.

## Copias locales de logs

`node tools/find-rw4-firmware-metadata.mjs` inspecciona exclusivamente la
carpeta conocida tools/local/mi-fitness-logs; no teléfono/ADB/red/Bluetooth.
Busca URLs junto a términos de firmware, modeloRW4 y versión2.2.86. Solo
exporta recuentos: no URLs, líneas, claves, direcciones o tokens. Una coincidencia
sería pista sintáctica, no paquete/modelo/integridad autenticados.

La carpeta actual está vacía. Primera ejecución rechazó ausencia de inputs;
se ajustó el resultado a `NoLocalLogCopies`, sin asumir que el firmware no existe.
Informe final ignorado en artifacts/research/rw4-firmware-metadata-r192.json:
filesRead=0, firmwareObtained=false, networkRequested=false. No se pidió al
usuario recopilar o entregar nuevos logs.

## Datos de Mi Fitness disponibles

Se conserva el APKbase ya exportado del teléfono, Mi Fitness3.59.1i,
SHA256 `56e7bdbe139b369a72839b48d2f29e67e3df25984dd33a9b80abbbc44b511fdd`.
La revisión previa en artifacts/research/mi-fitness-apk/review.json registra
signatureVerified/manifestVerified=true, apkExecuted=false, certificado del
fabricante no verificado independientemente. No se reejecutó esa auditoría ni
la aplicación; solo se leyó metadata/caché de clases existente.

Los índices contienen clases de firmware/OTA de diversas familias, entre ellas
`com.xiaomi.hm.health.bt.proto.Como$OtaUpdateEvent` y helpers de versión de
esferas. **No constituyen una URL o contratoRW4 verificados.** Una búsqueda
genérica inicial de ota también coincidía con nombres ajenos (NotAllowed/ToTarget);
se acotó a nombres/paquetes de firmware. No atribuir esos falsos positivos al
mecanismo de actualización.

## Estado y continuación

No firmware/SDK2.2.86 obtenido, descargado, ejecutado o flasheado. No código C
compilado para el RW4 ni comandos nuevos al reloj. Gates siguen cerrados.
La siguiente fuente candidata es el flujo de metadatos de actualización en
el APKlocal, inspeccionado como datos; aún no se ha desensamblado aquí ese flujo.
Sin solicitudes de OTA, credenciales en red, app launch o instalación adicional.

Solo si se identifica un paquete de origen verificable y modelo/versión exactos
se inspeccionará estáticamente fuera deGit. No sustituir evidencia del firmware
por un nombre de archivo, firmware de otro modelo o flags/direccionesS3.
