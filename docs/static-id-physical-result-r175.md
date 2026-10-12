# R175 — intento único del ID alternativo autorizado

2026-10-12. Usuario autoriza explícitamente: «Sí, autorizar un intento con ese ID»
para el [plan R174](static-id-trial-plan-r174.md). No autoriza otros IDs,
borrado de esferas ajenas, autoSET, Lua/C/Doom, firmware o exploits.

Paquete variante r173: ID365219990,25224bytes,SHA256
`90069d708bea26770e85464c087dfce51ae3640e565ab33ad44f78526d5f35e5`.
Solo los tres bytes del ID difieren del paquete original R167. No se recompiló
ni alteró la imagen. Hash/build/perfil verificados por prepare antes/después
de habilitar ambas entradas temporalmente, Node limitado a r173.

Ejecutable aprobado para este intento SHA256:
`a2e3cc4dfc6fd2afb3f0fe8da10b375869ae994a7e2bf0920f9f2fe153fe0902`.
Copia de exe/metadata/entradas habilitadas bajo artifacts/static-r175-reviewed,
ignorados por Git, como evidencia. No ejecutar esa copia para repetir el ensayo.
El registro r173 no existía; se conservará separado del original incierto.

Comando autorizado: `node tools/pc-static-watchface.mjs install r173`, una vez.
Modelo/FW y colisión se reconsultan antes de INSTALL. No SET automático.
## Resultado del intento autorizado

`StoppedNeedsReview`, fase `Rejected`, `installStatus:3`, 6 frames enviados,
225 bytes TX, 12 recibidos, **0 partes y ningún archivo enviado**. Cierre de
socket y salida del worker confirmados. Registro r173 `Uncertain`, fase previa
`Intent`, conservado intacto. Ambos gates cerrados y build reconstruido.

GET posterior: 21 esferas y una activa; ninguno de los dos IDs propios
presente. IDs, flags y esfera activa anteriores conservados. Usuario confirma
«Sí, todo sigue normal». No reinicio, desvinculación o borrado desde PC.

## Interpretación verificada del código 3

Se inspeccionó como datos la copia de Mi Fitness instalada en el teléfono del
usuario: paquete `com.xiaomi.wearable`, versión 3.59.1i, APK base SHA256
`56e7bdbe139b369a72839b48d2f29e67e3df25984dd33a9b80abbbc44b511fdd`.
Firma criptográfica y manifest verificados anteriormente; identidad del
certificado de Xiaomi no validada independientemente. No se ejecutó el APK
ni se lanzó la app o utilizó ADB/Bluetooth para esta inspección.

Traza estática reproducible con `tools/inspect-mi-fitness-apk.mjs code-batch`:

1. `FaceBleInfoViewModel.installBleFace` llama a `FaceInstallBleImpl.preInstall`.
2. `preInstall` envía comando 4/4 con el objeto de instalación.
3. `FaceInstallBleImpl$preInstall$1.onSuccess` obtiene el entero de `dtt.i()`:
   el campo protobuf 5, correspondiente a `installStatus`. Si no es cero,
   entrega el mismo entero al callback de fallo, sin convertirlo.
4. `FaceInfoBleFragment.installBleFace$lambda$40` selecciona `s4l.g0` al
   recibir fallo con entero 3.
5. `s4l.g0` es `0x7f150e25`. `aapt2 dump resources` sobre ese APK resuelve
   el recurso como `string/face_hint_storage_low`: aviso de espacio
   insuficiente que propone eliminar esferas.

Los archivos smali inspeccionados y APK permanecen privados/ignorados; no
publicar código propietario. Reproducción local de la lectura de recurso:

```powershell
& 'tools/local/android-build/sdk/build-tools/36.0.0/aapt2.exe' dump resources 'tools/local/mi-fitness/MiFitness-base.apk' |
  Select-String -Pattern '0x7f150e25' -Context 0,4
```

**Conclusión:** Mi Fitness 3.59.1i interpreta este estado 3 de preinstalación
como almacenamiento insuficiente para esferas. No mide bytes libres ni
distingue cupo de almacenamiento físico; no demuestra un máximo de 20,
agotamiento de RAM o capacidad total usada. Cambiar únicamente el ID no
resolvió el rechazo con el catálogo de 21 entradas.

Después el usuario eliminó varias esferas por sí mismo y autorizó expresamente
otro intento del mismo paquete. Se registra por separado en
[R176](static-space-trial-r176.md), sin borrar/reutilizar los registros fallidos.
