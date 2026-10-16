# R313: CExit, cierre único y localizado del residente terminado

**Solo PC, pendiente de autorización física.** Una instalación y un toque
CLOSE C, observado con batería≥50%. No prueba Doom ni instala otro módulo.
Responde a CInfo: registro/lease propios, FINISHED1/JOINED0/ERROR0, menús normales.

| Elemento | Valor |
|---|---|
| Unidad | M2315W1 / firmware2.2.86 |
| Paquete | CExit ID365219954,24.176bytes,32recursos |
| SHA256 | `209350fb388977c248e55571e21aa544ac00beed3e8ee4a0854354df2b61c584` |
| SHA256 Lua | `3e78cb58f1309a9209cc938a2db200e619269459b92891561f83d20b8d88ec22` |
| Artefacto | artifacts/doom-resident-close-r313/package-final/CExit-id-only.face |
| Journal nuevo | tools/local/pc-rfcomm/doom-resident-close-r313.json |
| Presupuesto |12partes,24.430bytesMASS+512control≤32.768 |

## Instalación y alcance

Solo Static/r313 y C#Static se abren temporalmente para UN envío. Sin retry,
resume, activación o borrados automáticos. Finally restaurar fuentes/gates,
rebuild y test cerrado; catálogo independiente si registra. Conservar todas
las esferas actuales, selección, DoomRAM957/ELF, DoomLauncher963/WAD y vínculo.
No ELFs/WAD en este paquete; no firmware/bootloader/particiones.

La apertura es inerte, sin timers, shell ni consulta a C. CLOSE C UNA vez:

1. Captura CInfo acotada; exige registro/lease exactos, hash esperado en lease,
   C abierto/leído/cerrado, STARTED1/FINISHED1/ERROR0 y JOINED0o1. No nueva carga,
   START o STOP. Identidad/hash de lease es la evidencia de propiedad ya existente,
   no una nueva lectura SHA de todo el ELF instalado ni autenticación del firmware.
2. Revalida registro y lease antes de cada comando. Si JOINED0, UN command7
   (retirada de caché/lease de imagen) y solo tras ACK+estado coherentes UN
   command5/JOIN. El C conserva guards de owner, lectores y slot; no fuerza
   referencia a cero, close de fd ajeno, join o unload ignorando esos guards.
   Cada operación abre r+b, desactiva buffering, escribe16bytes, intenta cerrar
   incluso ante rechazo y lee un snapshot nuevo para verificar secuencia+1.
3. Solo con FINISHED1/JOINED1/ERROR0, allocated==freed, cleanup_error0 y
   registro/lease idénticos, un único shell fijo `rmmod rw4png304`. Si JOINED1
   al empezar, no repite comandos7/5; valida limpieza directamente.
4. Exige captura de shell vacía, registro vacío y `ls /dev` bien formado sin
   los nodos ctl/frame/image.bin/image.png; solo entonces retira la lease propia
   exacta. Las capturas se escriben/leen/borran solo en su ruta954/close-shell.txt,
   máximo8192bytes de lectura; si ya existe no la pisa. No borra el capture957.

Ante el primer fallo se termina la función y queda botón deshabilitado.
Sin callbacks de recuperación, STOP automático, timers, reintentos, rmmod
automático después de un fallo ni operaciones nativas en GC. Una reapertura
no contiene marca persistente; **no autoriza repetir la prueba**.

## Resultado visible, todo en la misma captura

Preview CUATRO barras NARANJAS. UI C CLOSE, botón CLOSE C y MODE. Tres páginas
del mismo resultado, MODE no hace I/O. Fotografiar las tres sin repetir CLOSE:
01 REG OWN/LEASE/EXIT CODE/C OPEN/C READ/C CLOSE;
02 SEQUENCE/STARTED/READY/FINISHED/JOINED/ERROR;
03 REASON/IO ERR/PEAK/ALLOC/FREED/CLEANUP.
EXIT CODE y REASON/counters solo se interpretan con JOINED1. IO ERR es errno
de I/O normalizado a valor absoluto,9999 si Lua no entrega uno numérico; no
se conservan mensajes/raw logs. Si el fallo no es I/O puede seguir en0.
Datos son la última captura válida, no asegurar registro actual después de
un fallo de shell; solo final verde/código00 incluye postcondiciones de retiro.

| Código rojo | Paso |
|---|---|
|01–07 |Snapshot CInfo (mismo contrato R310) |
|08 |Precondiciones: propio, terminado y control saludable |
|09 |Identidad/lease o secuencia antes de un comando |
|10/11/12/13/14 |Open/setvbuf/write/close/verificación del command7 |
|20/21/22/23/24 |Open/setvbuf/write/close/verificación del command5/JOIN |
|30 |JOIN/balance/error de limpieza |
|31 |Identidad antes de retirar |
|32 |Captura propia/un único rmmod/respuesta |
|33 |Registro vacío |
|34 |Listado y nodos ausentes |
|35 |Retirada de lease propia |

Algunas lecturas de verificación pueden mostrar etapa01–07 si fallan durante
un snapshot posterior; el código no es por sí solo errno. Si write falla,
el código conserva esa etapa aunque después también falle close; no prueba
handle liberado. Éxito: punto verde/código00, REG OWN/LEASE/C OPEN en0 y
JOINED1, con últimas estadísticas conservadas. Aunque EXIT CODE no sea0, solo
declara retiro si balance/registry/nodos/lease se verificaron, no ejecución normal.

## Ensayo propuesto

Una instalación inactiva. Usuario selecciona CExit, confirma UI y punto gris,
pulsa CLOSE C UNA vez, anota código/color y fotografía/anota páginas01–03 con
MODE. Vuelve habitual y confirma menús/corona en el mismo reporte. Si falta UI,
no pulsar; ante cualquier fallo no repetir/reabrir, no START de otro launcher,
reboot, desvincular ni borrar recursos. No ejecución posterior de Doom incluida.

## Pruebas y riesgos

15casos en Lua S3 con C/shell/archivos/widgets simulados: éxito, ya unido,
busy/owner del release, busy/error JOIN, cierre I/O fallido, balance, cleanup,
hilo no terminado, lease ajena, rmmod rechazado, nodo retenido y captura previa;
UI inerte al abrir, una acción y MODE sin I/O. Verifica no avanzar/rmmod tras
rechazo y cierre de todos los handles abiertos. No reproduce decoder/refs
físicos ni prueba estos callbacks C reales. Paquete/readback32/pins/tampering,
presupuesto y gate cerrado pasan; prepare r313 OfflinePrepared. Helper cerrado
SHA256`d5b5420d0393b0cf2ad7c5ee822e07dcd8933cebe2072e15077a8c1c81173ce1`.

La instalación y capturas escriben flash. Cache-drop, JOIN y uninit/unregister
del residente pueden bloquear/panic/corromper el sistema; no tienen aislamiento
ni timeout duro validado. No hay recuperación integral de firmware validada.
La regla inicial exige revisar este payload y sus comandos nuevos antes del
ensayo. No se ha enviado ningún comando nuevo al reloj para prepararlo.
