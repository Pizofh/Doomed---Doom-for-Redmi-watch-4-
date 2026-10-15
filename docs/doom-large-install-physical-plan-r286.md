# R286: propuesta de instalación grande, pendiente de autorización

**No ejecutada.** Instalación de archivos, sin activación ni ejecución de C/Doom.
No reutilizar aprobaciones de MemInfo, módulos o esferas anteriores. El usuario
debe poder observar el reloj, batería≥50%, menús normales y sin OTA en curso.

## Identidad y evidencia

M2315W1/FW2.2.86, Mi Fitness3.59.1i y Android16/HyperOS3.0.302.0 según evidencias
anteriores. Región y build Vela exactos desconocidos. La sesión exige el destino
privado revisado, HMAC válido, modelo reconocido/FW exacto, catálogo inequívoco
y ID365219963 ausente antes de escribir. Si cambia algo, parar.

En esta unidad funcionaron autenticación desde Windows, instalaciones pequeñas,
Lua/PNG y C limitado con salida. No se ha probado recepción/extracción de4,8MB
ni ejecución del motor completo. S3 no replica el RW4; sus pruebas no sustituyen
esa evidencia. [Candidato](doom-low-memory-candidate-r285.md),
[journal y pruebas](doom-deployment-journal-r286.md).

## Comando, componentes y almacenamiento

Solo tras revisión: habilitar temporalmente el gate de instalación R286 y el
gate C# grande, reconstruir/verificar el helper, prepare y **un único**:

```powershell
node tools/pc-doom-deployment.mjs install
```

Archivo fijo `build/doom-low-memory-rw4-r285/DoomLauncher-rw4.face`,
ID365219963,4827044bytes, SHA256
`d0fc0d8257e9a384b42129f312de99570b49dade455511d0fc5fddd80fecf048`.
20recursos incluidos ELF, WAD shareware y launcher con `allow_native=false`.
El ELF solo se almacena. No se envía insmod/rmmod, SET de esfera o DELETE.

Stock INSTALL4/4, upload22/0 y2362partes MASS5,100ms entre partes, unos4–6min
según el host/radio. El worker limita bytes/tiempo; no cerrar la terminal ni
cambiar vínculos durante el ensayo. El receptor puede necesitar espacio para
el paquete y copias extraídas (aproximadamente10MB como previsión, no medido).
No asumir256MB ni espacio disponible. Si rechaza por espacio, parar; no borrar
esferas o reintentar automáticamente.

Writes persistentes: paquete/cache/catálogo de esferas stock. No escritura
directa de particiones, bootloader, recovery o firmware. Registro y lock privados
en PC antes de abrir conexión; intención antes de cada batch. Un rechazo/corte
consume este intento: conservar todo y parar. Reanudación queda cerrada y no
está autorizada por esta propuesta, aunque el reloj ofrezca un offset.

Finally cerrar conexión/worker y restaurar ambos gates a false, rebuild y test
de entradas cerradas. Si se confirma RegisteredInactive, una consulta de catálogo
independiente puede confirmar ID inactiva y selección/entradas previas intactas.
No seleccionar el launcher ni arrancar Doom bajo esta revisión. El usuario solo
comprueba que conserva su esfera, menús y desplazamiento normales.

## Backup, reversión y fallos

Backup limitado: paquete/hash/fuentes y catálogo previo en journal del PC. No
backup integral del firmware, particiones, datos de salud o claves internas.
Recovery integral no validado. La reinstalación/restauración de Mi Fitness no
equivale a recuperar firmware dañado.

| Paso | Escribe flash | Reboot lo revierte | Bootloader / particiones dirigidas | FW modificado | Reversión |
|---|---|---|---|---|---|
| Auth y consultas stock | Sin escritura de archivos solicitada; stack puede actualizar estado de sesión | No garantiza deshacer estado | No | No | Cerrar sesión; observar |
| Instalar paquete/catálogo | Sí | No | No | No | Retirar solo ID365219963 tras revisión y habitual activa |
| Observación de esfera habitual | No cambio solicitado | No aplica | No | No | Mantener habitual |
| Journal/lock | Solo disco del PC | No | No acceso al reloj | No | Conservar evidencia |

Peor fallo razonable: rechazo, transferencia parcial, almacenamiento lleno,
bloqueo, reboot/panic o corrupción de filesystem por bug stock; posible soft
brick. No operación dirigida a boot que deba provocar hard brick, sin garantía
integral frente a defectos del firmware. No llamar sandbox al paquete ni a Lua.
No prometer recuperación automática por reboot: los archivos son persistentes.

Recuperación parcial conocida si responde: volver/cambiar a esfera habitual
desde Ajustes. Este ensayo no la cambia de forma automática. Ante bloqueo,
parar y revisar antes de reiniciar, borrar, reanudar o modificar nada. No flash,
firmware ajeno, bootloader, exploit, SWD/JTAG o apertura física automática.
La retirada también requiere una decisión explícita posterior; no borrar como
parte de un rollback automático incierto.
