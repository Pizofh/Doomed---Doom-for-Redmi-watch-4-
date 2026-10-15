# R286: instalador grande integrado con journal privado

**Preparado y probado en PC; gates físicos cerrados.** No conexiones al reloj,
transferencias físicas, ejecución del candidato ni consultas remotas de CI.
El paquete fijo es R285:4827044bytes, ID365219963, SHA256
`d0fc0d8257e9a384b42129f312de99570b49dade455511d0fc5fddd80fecf048`.
Conserva `allow_native=false`. No basta editar un JSON para cambiar su pin.

## Flujo final

`pc-doom-deployment.mjs` valida paquete/fuente/build del helper y formato del
destino/clave privados. Prepare pasa sin conexión, worker o journal nuevo.
La entrada física usa el mismo núcleo autenticado y el worker grande C# que
el ensayo PC, pero requiere una capability propia y dos gates de código:
`PHYSICAL_DEPLOYMENT_REVIEWED=false` y `LargePhysicalReviewed=false` en C#.
La reanudación tiene además `PHYSICAL_RESUME_REVIEWED=false` separado.
No hay switches de entorno ni fallback al instalador pequeño.

El endpoint físico es de uso único. Su constructor no crea un proceso: el
worker se crea al abrir, **después** de reservar el journal y su lock. La rama
física utiliza nonce aleatorio de la sesión base; la constante de los fixtures
permanece solo en el peer simulado. Auth/modelo/FW/catálogo preceden INSTALL.
Al terminar cierra recursos y borra de los buffers las claves que controla.
No se afirma borrado forense de memoria de V8 o del sistema operativo.

El upload conserva límites4.900.000bytes/4096partes, batch32,100ms entre partes,
deadline600s y supervisión del proceso675s. Guarda intención antes del batch,
sin confundir escritura local con ACK remoto. Catálogo final debe mantener
entradas y selección previas, y registrar el ID propio inactivo/eliminable.
`RegisteredInactive` prueba catálogo, **no integridad de archivos extraídos**.

## Journal

Ruta física fija, ignorada por Git:
`tools/local/pc-rfcomm/doom-deployment/{watch.lock,transfer.jsonl}`.

- Un lock exclusivo `wx` serializa instalaciones grandes incluso de otro
  destino/clave. Token de propietario impide borrar el lock de otra instancia.
  No impide que Mi Fitness u otras herramientas externas intenten conectar.
- Registros vinculados a destino, clave, modelo/FW y ID/hash/tamaño del archivo.
  Deriva identificador y clave HMAC con dominios separados; no guarda dirección
  ni clave originales. HMAC por registro y cadena SHA256 detectan alteración,
  cambio de orden y cadena incompleta. Registro máximo2MiB, write+fsync.
- Primer intento crea un archivo exclusivo. Otro intento fresco con journal
  existente queda bloqueado antes de abrir/autenticar; no elige otro nombre.
- Crash puede dejar un lock o línea incompleta: **no limpiar automáticamente**,
  aunque el PID parezca muerto. Requiere revisar evidencia y un plan concreto.
- Resume explícito verifica toda la cadena, mismo vínculo/paquete, estado
  Uncertain y batch con posible entrega. Nueva sesión comprueba mismo catálogo,
  MD5 y offset remoto dentro del intervalo registrado. No reanuda por sí sola.
- Estados Created sin envío o resultados completados no son autorización para
  repetir. Cambiar clave/paquete o reiniciar el reloj no rearma el registro.
- Solo se eliminan locks propios; los intentos permanecen en el mismo historial.
  `fsync` no demuestra durabilidad absoluta ante pérdida eléctrica de Windows.

Los reportes públicos no contienen MAC, claves, paquetes crudos o salidas nativas
sin filtrar. Los journals de pruebas también quedan en artifacts ignorados.

## Validación ejecutada

**33 casos** con el paquete R285 real y receptor sintético: envío completo2362
partes, corte con11posibles entregas/10escrituras locales confirmadas, resume
desde22462con2351partes, bloqueo de duplicado, distinto destino/clave/paquete,
historial alterado/reordenado/truncado, crash, lock ajeno, offset fuera de rango,
firmware inesperado y cierre fallido. Incluye envío por pipes/proceso C# reales,
con socket sintético, digest/longitud verificados por el worker. Ningún socket
Bluetooth real. El motor Doom no se ejecuta en estas pruebas.

22 escenarios legacy pasan tras compartir el núcleo. Los gates de install,
resume, capability falsa, adaptador falso y entrada C# cerrada también pasan.
La ruta de radio real y su integración con el driver siguen **sin probarse**
para esta sesión grande. No presentar el fixture C# como ensayo físico.

```powershell
node tools/pc-doom-deployment.mjs prepare
node tools/test-doom-deployment.mjs --local-package
node tools/test-doom-deployment-gates.mjs
```

Sin assets privados, `node tools/test-doom-deployment.mjs` utiliza una fixture
sintética del mismo tamaño y cubre32casos; omite solo el caso IPC del paquete
local. No se ejecutaron builds remotos ni se añadieron secretos a Git.

El siguiente paso propuesto es [un único envío grande inactivo](doom-large-install-physical-plan-r286.md),
pendiente de revisión del usuario. No autoriza START, C o Doom físicos.
