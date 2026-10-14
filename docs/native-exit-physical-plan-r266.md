# R265/R266 — retirar el puente C detenido

Estado R266: usuario autorizó «Sí, autorizo y puedo observar el reloj».
**Un intento de instalación terminó en timeout; ExitC no figura en el catálogo
posterior. No seleccionar ni ejecutar EXIT C.** Retorno visual pendiente.
R264 terminó con diez verdes y menú/esferas normales. El módulo234 quedó
STOPPED, no descargado; no repetir CtrlProbe ni rearmar marcas.

## Paquete y compatibilidad

ExitC, ID365219964,24.348bytes, perfilr265, preview cuatro barras blancas.
`artifacts/exit-r265/ExitC-id-only.face`, SHA256
`8c69e4003c1caef9eed58902cfc5d45112d5b9cf21f7ccdab8c1b379284da3e8`.
Lua SHA256 `3617fd532ac64b36112c8328b7a579d67446b815460f52aa29c231beefec81d5`.
24recursos serializados verificados con Compiler revisado/PATH sinADB.
Solo Lua/PNG; no ELF nuevo, C write/START/STOP, Timer, worker o firmware.

M2315W1/FW2.2.86 del usuario. Región, configuración FLAT/PROTECTED/KERNEL y
recovery integral sin verificar. Teléfono habitual Android16/HyperOS3,
Mi Fitness reportada3.59.1i. Instalador exige mismo modelo/FW; no OTA, otros
clientes o cambios de vínculo concurrentes. Presencia del usuario/batería≥50%
y menú normal requeridos antes del ensayo. No reiniciar: C234 sigue residente.

Base concreta: Lua/io/shell y rmmod de otros módulos probados físicamente;
C234open/read/EOF/close,13requests/ACKs/STOP y key64 posterior pasan en R264.
Su uninit rechaza refs propios, held y fase activa; llama unregister sobre su
único nodo. No hilo/Timer C o punteros exportados a Lua; UI solo conserva bytes.
**uninit/unregister de este módulo siguen sin probarse físicamente.**

## Revisión estática y pruebas

Imagen candidata fijada2.2.86 SHA2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db,
inspeccionada como datos, no ejecutada. Tabla LS0x77da0→entry0x21cbc0,
rmmod0x77ed0→0x220954. Rmmod resuelve nombre en0x220960 y llama retirada en
0x220966; errores producen mensaje `nsh: %s: %s failed: %d`.
Loader0x1bb7c0 invoca uninit, retorno negativo0x1bb7c4 evita liberar código.
Unregister puede desvincular path antes de rechazar busy: ausencia sola no
certifica descarga. Cierres propios no prueban ausencia de toda referencia.

Se elige **`ls /dev` sin opciones**, no `ls /dev/rw4step234`: examina el
directorio padre. Flags iniciales0 en0x21cbce; callback de entradas0x21c2f4
bifurca en0x21c304 hacia0x21c402, omitiendo stat individual sin `-l`/`-s`.
El nodo propio es char, no symlink; se comparan nombres completos. El
[source primario NSH](https://raw.githubusercontent.com/apache/nuttx-apps/nuttx-10.3.0/nshlib/nsh_fscmds.c)
confirma esa estructura upstream, no la versión Xiaomi exacta. El
[unregister upstream](https://raw.githubusercontent.com/apache/nuttx/nuttx-10.3.0/fs/driver/fs_unregisterdriver.c)
es contexto; la ruta candidata fue desensamblada por separado.
No se afirma identidad íntegra del firmware real ni ausencia de fallos latentes.

68escenarios Lua/UI con nodo y registro simulados pasan: preflight, estado no
detenido, fallo de rmmod, retorno sin descarga, nodo restante, captura grande,
read/EOF/close inciertos, reentrada y MODE sin I/O. Diagnóstico ya integrado.
La misma Lua retiró el módulo **S3 real** tras13comandos de preparación hasta
STOP; registro vacío y listado sin nodo, inventario original/restos retirados.
Se mapearon ruta/nombre S3, registro RW4/UI simulados y se normalizó únicamente
el printf de éxito propio del uninit S3. Esto no prueba la ABI uninit234 RW4.
Reporte `artifacts/emulator/exit-r265-verified/summary.json`.

Reproducibles PC con guest propio y destinos frescos:

```powershell
node tools/research-lifecycle-r265.mjs
node tools/test-exit-r265.mjs
node tools/package-exit-r265.mjs
node tools/pc-rfcomm.mjs build
node tools/test-static-watchface-gates.mjs
node tools/test-static-watchface-transfer.mjs r265
node tools/pc-static-watchface.mjs prepare r265
```

Herramientas rechazan reportes previos para no sobrescribir evidencia.
Helper cerrado de preparación10d248e0ef9458892db90d60c59f5258307427b80fd3f9a7546932dff3e6cd24;
prepare,12escenarios transferencia y gates0sockets pasan. Sin operación física.

## Único ensayo propuesto, tras revisión del usuario

1. Runner fijo nuevo, gates únicamente r265/C#, rebuild/hash/prepare. **Un**
   `node tools/pc-static-watchface.mjs install r265`, journal fresco
   `tools/local/pc-rfcomm/native-exit-r266.json`. Transferencia stock al ID nuevo,
   sin activar, reemplazar, DELETE o retry. No borrar esferas para espacio;
   rechazo detiene. Finally restaura gates/rebuild/test y GET independiente
   verifica propia inactiva y IDs/flags/selección anteriores conservados.
2. Usuario selecciona **ExitC**: MARK/REG INFO/STOPPED/CLOSE C/REG SAME/PATH PRE/
   RMMOD/REG GONE/PATH GONE/FINAL grises, botón EXIT C. Falta UI o FINAL rojo
   inicial: no pulsar; volver a habitual y comunicar.
3. **EXIT C una sola vez.** Crea/verifica marca propia14bytes
   `RW4-EXIT-R265\n` en
   `/data/app/watchface/market/365219964/lua/exit-attempt-r265.txt`.
   Tres capturas propias deben estar ausentes; se conservan después, sin
   borrado/rearmado ni acceso a archivos de pruebas anteriores.
4. Procfs rb/read67/EOF/close y clasificador R261 exigen key64 atribuida.
   Única apertura rb `/dev/rw4step234`: setvbufno/read32/read1EOF/close; bytes
   deben coincidir exactamente con seq13/STOPPED/held0/steps4/edges5/status0.
   Sin Cwrite, STOP nuevo o otra apertura del nodo.
5. `ls /dev > /data/app/watchface/market/365219964/lua/exit-pre-r265.txt`.
   Leer hasta8193/EOF/close, exigir≤8192, formato completo reconocido/nombre
   rw4step234. Procfs nuevamente y key64 igual; ningún handle propio abierto.
6. **Un** `rmmod rw4step234 > /data/app/watchface/market/365219964/lua/exit-command-r265.txt`.
   Lee≤257/EOF/close y exige salida vacía. La tupla Lua shell es informativa:
   retorno normal o vacío por sí solos no prueban retirada. Error/throw/texto
   inesperado detiene sin reintento ni acceso adicional al nodo.
7. Procfs rb/read67/EOF/close debe dar cadena vacía. Luego
   `ls /dev > /data/app/watchface/market/365219964/lua/exit-post-r265.txt`:
   listado completo≤8192/nombre ausente. **No abrir/stat el hijo tras rmmod**.
   Solo todos los checks juntos permiten FINAL verde.
8. Usuario lee indicadores y vuelve a su esfera habitual, comprobando menú,
   desplazamiento y pulsación larga. No repetir/reabrir ni recargar C.
   Si todo verde, no hace falta MODE/número extra. Archivos persisten; C sale RAM.

## Fallos y diagnóstico

Primer fallo detiene; intenta close del handle abierto una vez. Close incierto
impide más I/O/rmmod. Después de despachar rmmod, no se vuelve a invocar código
del módulo, incluso si la retirada parece haber fallado. No GC/recovery writes,
reload, reboot o timeout que pueda interrumpir un shell/uninit bloqueado.

EXIT CODE automático ante FINAL rojo:64hex. Prefijo20hex: stage2/closeUncertain2/
dispatched2/shellTuple2/errno2/commandIndex2/captureLength4/procLength4; restantes
44hex son los primeros22bytes de la última captura, rellenos0. Stage1marca,
2registro,3snapshot,4listado previo,5registro igual,6rmmod,7registro vacío,
8listado posterior,0éxito. Tuple1true/exit0,2num0,3false,4otra,FFthrow;
no prueba éxito. Errno0no capturado,FFerror sin clasificación. Los datos son
última lectura, no captura digital del estado actual. MODE solo RAM.

## Riesgo, persistencia y recuperación

| Componente/operación | Flash | Particiones/boot | Reboot revierte | Reversión/fallo |
|---|---|---|---|---|
| Paquete/catálogo/selección | Sí | Sin acceso dirigido | No | Habitual vía Ajustes si UI responde; no borrado automático |
| Marca14bytes y3capturas propias | Sí | Sin acceso dirigido | No | Persisten; lectura acotada no limita escritura del shell a priori |
| Procfs/snapshot/listado padre | No write al nodo | Sin acceso dirigido | RAM sí, daño persistente no garantizado | Bloqueo/close incierto; no seguir |
| rmmod/uninit/unregister | Sin write de flash solicitado | Sin acceso dirigido | Estado RAM sí, corrupción persistente no garantizada | Retirada parcial, refs ajenas, panic/corrupción |

Módulo potencialmente privilegiado, sin sandbox. Peor fallo razonable bloqueo,
panic/reboot/corrupción RAM o FS; soft brick posible. Sin operación dirigida a
boot que deba producir hard brick, sin garantía integral. Backup solo de fuente/
paquete/hash/catálogo/journal; firmware/recovery integral no validados.
Recuperación parcial conocida: volver a habitual por Ajustes si responde.
Retirada no se revierte automáticamente: no recrear marca/ELF originales ya
desaparecidos o cargar otro modelo. Ante fallo revisar estado; no flash, boot,
particiones, exploits, JTAG/SWD o reinicio automático. Firmware stock preservado.

## Intento R266 y consulta posterior

Runner fijo `artifacts/exit-r266-authorized/run-install.mjs` consumido. INSTALL
aceptó código0; upload devolvió unknown2=0/resume0/chunk2048/MD5 coincidente con
la solicitud. Se completaron12envíos locales de partes, TX24.898bytes,
20TX/14RX; faseSent. La primera consulta de catálogo de esa sesión venció su
espera: StoppedNeedsReview/Timeout, no confirmación de registro/aceptación final.
Esto no prueba que el almacenamiento esté sin modificar ni explica la causa.
No etiquetar como falta de espacio, paquete inválido o fallo de Lua sin evidencia.

Socket/worker cerrados/exit0, sin error nativo. Finally gates cerrados y test
0sockets pasó. Journalnative-exit-r266.json Uncertain/previousPhasePartWritten,
parts12/registeredVerifiedfalse/sin lock; **no reusar ni reintentar**.
Helper autorizado d36b6805fee1fd5ebdf1ad85064e27f7aee45c8cba9d50be9a0a0968cf33d1d7;
helper cerrado posterior a9af51d07515f1d592751702ab70123c0aa63ea8bb5a49ce8a1f7c08a5083195.

Un GET independiente posterior Complete:12→12 respecto del preflight de ESTE
intento, IDs/flags/activa365219965 conservados, propia365219964ausente. Estos
12ya eran el inventario previo al envío; no atribuir la diferencia con14del
checkpoint anterior a esta instalación. Registro propio no confirmado; restos
del paquete en storage no inspeccionados. La consulta cerró socket/worker;
sin nueva transferencia, SET/DELETE o C/uninit/rmmod desde PC.
Evidencia privada install-report.json y inventory-followup.json.
Falta confirmación visual del usuario; no nueva prueba física automática.
