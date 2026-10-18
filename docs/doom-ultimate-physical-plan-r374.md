# R374: Ultimate Doom, paquete completo y aislado

El usuario autorizó expresamente una instalación inactiva y dos arranques
manuales con batería≥50% y observación. **El intento de instalación ya se
consumió y fue rechazado antes del archivo**. No hay autorización de reintento.
No se hicieron los arranques manuales porque el paquete no quedó instalado.

## Paquete

- DoomUltimate, ID `365220001`, módulo `rw4ultimate374`.
- Preview: marco ámbar con cuatro barras verticales (cuatro episodios).
- `build/doom-audio-r374/package/DoomUltimate-id-only.face`: **13090600 bytes**.
- SHA256 `dfd89cd54542142a3cddb5dd444f6553fbd648b6e9d7dd1140f9b67b464ad8ca`.
- ELF624976B, SHA256
  `410d7bd578e28112f19b6c2fd1a184a17e7f94bf454ba34cc456fb6f93230cd6`.
- IWAD original de Ultimate Doom1.9 del ZIP aportado:12408292B,
  4episodios/36mapas. No PK3, DoomII, expansiones ni música MUS.
- Main27335B, SHA256
  `4092c1be9759fc647917cc6821c1c19ae049d4956afd6a2aab925f3a539ad9ca`.

El paquete privado contiene el IWAD comercial y no se publica. Tiene WAD,
ELF y bancos propios; no reemplaza DoomMenu, DoomVoice, DoomReady,
DoomLauncher ni partidas previas. No se borra ninguna esfera ni se selecciona
la nueva desde PC. START manual abre el título; no carga una partida solo.
Conserva controles y render aceptados. Sin multitáctil, autofuego o teclas
enclavadas. Añade la preparación silenciosa R372 para evitar descartar el
primer efecto mientras abre el servicio; su mejora física aún no está probada.

## Evidencia local

- Dos ciclos con motor/hilos reales: título/menú, E1M1/spawn, controles,
  pausa/save/load, carga desde título y join/unload.
- 36mapas arrancan, avanzan brevemente, guardan/cargan y cierran;
  máximo guardado74450B frente a196608B de capacidad. No son playthroughs.
- UI de producción y parse Lua completos; contexto de botones, pausa y salida.
- 23casos de bancos/CRC/errores: rechazo de banco shareware válido, copia
  alternada, reapertura, fallos de escritura/importación y guard de RAM.
- Audio bloqueado en prepare/close: imagen retirada, motor unido, módulo
  retenido hasta liberar explícitamente el servicio simulado. No prueba
  recuperación integral ni permite interrumpir una llamada nativa atascada.
- Paquete65recursos comprobados byte a byte; seis alteraciones rechazadas.
- Envío completo6405partes cifradas por IPC del C# y receptor sintético,
  hash/tamaño verificados; también3212partes a4080, corte y rechazos antes
  de datos. Escrituras parciales13107200B, fallos/deadlines/cuelgue del worker.
- Regresión del perfil anterior:10escenarios IPC. C#15499aserciones,
  cero llamadas nativas Bluetooth. Todas las puertas siguen cerradas.

Gráficos, altavoz y servicio de audio son modelados en esos ensayos. No hay
medición de FPS/RAM total del RW4 para mapas completos ni prueba de campaña
larga. La zona del motor sigue en3MiB; caché crece128KiB hasta672KiB.
MinFree7153219B/minLargest4194320B son requisitos del guard, no memoria libre
medida. Si el guard rechaza, se detiene; no se rebaja durante el ensayo.

## Transporte independiente

Entrada `session-retail-r374`, gate C# `RetailPhysicalReviewed`.
El gate `LargePhysicalReviewed` anterior permanece falso.

Solo el factory con tamaño/hash/ID exactos obtiene el perfil físico nuevo.
Límites antiguos conservados:4900000B/4128frames/660000ms en C#,
4096partes/600000ms en algoritmo. Perfil R374:

- C#:13400000B,6632frames,1260000ms; máximo32768peticiones y
  131072B de respuestas. Idle por envío15s, cada frame≤4096B.
- Algoritmo:6600partes/1200000ms; pausas100ms entre partes, sin aceleración
  del protocolo probado. Paquete exacto6405partes a2048.
- Supervisor1275000ms; cada operación≤20s y cierre2s. La muerte forzada
  del worker no cuenta como cierre remoto confirmado.
- Modelo M2315W1/firmware2.2.86, una selección conocida, IDnuevo ausente.
  No exige el carrier shareware porque lleva su propio WAD.
- Journal HMAC privado `ultimate-r374.jsonl`, lock por reloj. Preservar
  ante cualquier ambigüedad. Sin retry ni resume, incluso si no envió datos.
- Solo registro inactivo y conservación del catálogo/selección constituyen
  éxito del instalador; no prueban CRC del contenido instalado. El arranque
  comprueba los assets antes de ejecutar.

Tiempo de envío esperado **12–18min**, con tope del worker21min. No es una
promesa del enlace. La capacidad libre de flash no está medida por este
preflight; los13MB y el staging del instalador pueden provocar rechazo o
agotar espacio. No se borra ni se repite para forzarlo.

## Procedimiento tras aprobación explícita

1. Usuario con batería≥50%, reloj estable y disponible para observar.
2. Habilitar solo gate general+Ultimate en JS y Retail en C#; rebuild.
   Verificar entrada nativa con target vacío: InvalidTarget antes de lookup,
   antes de leer credenciales o crear journal. No abrir el gate antiguo.
3. `node tools/pc-doom-ultimate-r374.mjs install` una sola vez, supervisado.
   Ante rechazo/corte/timeout se detiene sin reenvío ni selección.
4. Cerrar gates y rebuild antes de pedir al usuario abrir la esfera.
5. Tras registro inactivo y cierre confirmado: usuario selecciona DoomUltimate.
   READY→START una vez. Mantener CHECKING despierto con toques breves fuera
   de botones. Confirmar título y cuatro episodios, NEWGAME→episodioI.
   Probar primer disparo/USAR, fluidez, PAUSA/GUARDAR/SEGUIR y SALIR→CLOSED
   antes de90s. No pedir todas las métricas si funciona.
6. Solo si el primer ciclo funciona: cambiar a esfera habitual y volver.
   START→título; PAUSA/CARGAR debe recuperar el guardado propio. Después
   MENU→NEWGAME→episodioIV, jugar brevemente y SALIR→CLOSED antes de90s.
   Las partidas shareware anteriores permanecen en sus versiones originales.
7. Ante ERROR, corrupción, suspensión, silencio o cierre fallido, no repetir
   ni hacer el segundo ciclo; recoger estado y CERROR/GPUCODE/PHASE,
   AUDIOERR/PCMSFX si responde. Volver desde Ajustes; si queda la imagen sobre
   menús, reiniciar desde Ajustes y dejar la esfera habitual.

Puede haber bloqueo/panic/corrupción de flash, falta de espacio o necesidad de
reinicio. El límite de sesión es cooperativo, no detiene un cuelgue. La
recuperación integral sigue sin validar. Estos riesgos requieren la revisión
del usuario para este nuevo payload antes de cualquier escritura física.

## Resultado del único intento autorizado

El transporte Retail se compiló habilitado y rechazó un target vacío antes
de lookup nativo. Se ejecutó `pc-doom-ultimate-r374.mjs install` una vez.
Modelo/FW correctos; catálogo14esferas, IDnuevo ausente. Respuesta de INSTALL
4/4: **installStatus3**. FaseInstallIntent, StoppedNeedsReview,
registeredVerified=false,6frames/226B TX, **0partes MASS**, sin petición de
upload22/0 ni selección desde PC. CloseConfirmed/workerExitConfirmed=true,
workerExitCode0. Journal privado `ultimate-r374.jsonl` conservado Uncertain.

La [traza estática del cliente Mi Fitness3.59.1i](static-id-physical-result-r175.md)
ya identificaba el campo5/estado3 como `face_hint_storage_low`. Es un rechazo
de almacenamiento/cupo de esferas; no mide bytes libres ni demuestra un límite
de tamaño del archivo o falta de RAM. No se volvió a consultar el reloj.

Se cerraron gates JS general/Ultimate y C#Retail inmediatamente, y se
reconstruyó el worker cerrado. No retry/resume, borrado ni otra escritura.
Usuario recibió indicación de conservar DoomMenu/DoomLauncher y esfera
habitual; se espera confirmación de espacio antes de preparar/revisar un
eventual intento nuevo. El paquete y sus hashes no cambiaron.
