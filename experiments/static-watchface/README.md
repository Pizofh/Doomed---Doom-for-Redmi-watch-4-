# RW4Probe — primera esfera candidata, imagen estática

**R169:** [transporte y registro privado preparados y probados offline](../../docs/static-watchface-transport-r169.md).
`node tools/pc-static-watchface.mjs prepare` inspecciona el paquete y su build,
sin Bluetooth. INSTALL/DELETE siguen bloqueados en CLI y cliente nativo hasta
revisión del [plan físico](../../docs/static-watchface-physical-plan-r169.md).
Ninguna operación física durante esta sesión remota.

**R168:** [render,menús,retorno yretirada confirmados en emulador](../../docs/static-watchface-emulator-r168.md)
con el candidato ID-only/byte5original0. No variante bridge usada ni archivo
físico cambiado. Eso no acredita aceptación/retirada por protocolo en RW4.

Proyecto propio DeviceType365,390×450, un widget Image/Shape30. La imagen propia
«RW4 PROBE» y barras RGB se generan al empaquetar; no assets Doom, código Lua,
touch, timers, llamadas OS, shell, ELF o módulos. No representa un reloj con
hora: sirve para comprobar instalación/render y vuelta a una esfera conocida.

`node tools/package-static-watchface.mjs` usa el compiler EasyFace4.23 previamente
inspeccionado, fijado por SHA256 y sin ADB adyacente. Solo genera archivos PC.
Rechaza un directorio de salida existente para no sobrescribir revisiones.

Salidas privadas/ignoradas: artifacts/static-watchface-r167/ contiene preview,
paquete original, candidato ID-only, log compiler y review.json. El compiler
ignora el ID CLI: se prepara una copia cambiando únicamente los nueve bytes del
ID a365799910. No se copia el cambio de versión/byte5 del bridge del emulador.
Modelo, magic, tamaño, ID y diferencias se comprueban; eso NO garantiza
compatibilidad del formato ni aceptación del firmware físico2.2.86.

ID365799910 no figura en las21entradas del inventario físico R167; es un snapshot,
no reserva permanente. Reconsultar al instalar y rechazar colisión. La esfera
activa se conserva y su ID está guardado en el snapshot privado. No borrar otras
esferas por espacio automáticamente.

Preparación solamente: validar render en emulador (S3 no réplicaRW4), terminar
inspección de estructura/preview y preparar instalador exclusivo para watchfaces
con rollback antes de pedir revisión para una escritura física. No instalar
directamente este candidato ni reutilizar los paquetes del emulador con native
launchers. No se ofrece comando de upload en esta herramienta.
