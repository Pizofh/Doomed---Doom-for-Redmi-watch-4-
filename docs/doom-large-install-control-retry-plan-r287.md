# R287: segundo intento tras cero partes, pendiente de aprobación

**No ejecutado.** R286 consumió la autorización de un envío, sin MASS. El
usuario confirmó esfera/menús normales. [Resultado y corrección](doom-large-install-result-r287.md).
Se requiere revisión explícita de este segundo intento y usuario observando,
batería≥50%, sin OTA/otro cliente/cambio de vínculo. No Doom/C ni activación.

## Archivo y operación

Mismo paquete, sin cambiar un byte: ID365219963,4827044bytes,
SHA256`d0fc0d8257e9a384b42129f312de99570b49dade455511d0fc5fddd80fecf048`.
Native launcher permanece deshabilitado. Cambian solo parser host y la ruta
del journal para un segundo intento demostrablemente sin datos anteriores.

Tras aprobación, habilitar temporalmente DEPLOYMENT y CONTROL_RETRY en Node
y LargePhysicalReviewed en C#, reconstruir/verificar/prepare. Resume=false.
Una única ejecución:

```powershell
node tools/pc-doom-deployment.mjs retry-no-data
```

El mismo journal privado verifica HMAC/cadena, vínculo y paquete, attempt1 con
Created/InstallIntent/UploadIntent/Uncertain y ninguna fase de MASS. No se borra
ni cambia de nombre. Añade attempt2 antes de conectar. Nueva auth/modelo/FW y
catálogo deben coincidir; ID propio ausente y selección/entradas preservadas.
INSTALL/upload stock; offset inicial0, MD5 coincidente cuando se devuelve y
chunk2048por default stock si falta. Offset no cero o respuesta inválida:
parar antes de MASS, sin fallback a resume. Registrar solo diagnóstico acotado.

Transferencia2362partes con100ms entre partes, aproximadamente4–6min. Registro
final inactivo; no SET/DELETE/insmod/rmmod. Ante otro error, parar sin repetir.
No reintento3 automático. Finally cerrar worker/conexión y restaurar todos los
gates, rebuild y test cerrado. Si se registra, catálogo independiente; usuario
confirma su esfera/menús habituales. No seleccionar el launcher en este ensayo.

## Riesgo y reversión

Se mantienen identidad M2315W1/FW2.2.86 y todos los límites del
[plan original](doom-large-install-physical-plan-r286.md). No se verificó espacio
libre físico ni se determinó si quedó reserva parcial de INSTALL.

Escribe flash/filesystem stock para paquete/catálogo; reboot no lo revierte.
Sin escritura dirigida de particiones, bootloader, recovery o firmware. No
firmware modificado. El ELF solo se almacena. Backup: fuentes/paquete/hash,
catálogo y journal privado; no backup integral de firmware/datos del reloj.

Peor fallo razonable: falta de espacio, transferencia parcial, UI bloqueada,
panic/reinicio o corrupción FS; soft brick posible. Sin operación dirigida a
boot que deba provocar hard brick, sin garantía integral. Recovery integral
no validado. Recuperación parcial comprobada: menús/cambio de esfera si responde.
No borrar automáticamente, reiniciar, cambiar vínculo, flashear, abrir el reloj
o improvisar recovery ante fallo. Una retirada o reanudación requieren revisión
posterior, y esta autorización no cubre ninguna ejecución nativa de Doom.
