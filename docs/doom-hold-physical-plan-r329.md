# R329: DoomHold, conservar la imagen mientras espera

Preparado y probado en PC/emulador. Pendiente de aprobación física.

## Resultado anterior y cambio

R328 instaló DoomLease R327 inactivo: 316 partes, RegisteredInactive, cierre
y salida del worker confirmados; contentVerified=false. El único ensayo
manual autorizado mostró Doom con parpadeo, controles no confirmados y salida
**CLOSED**. Ese estado exige en el launcher JOIN/cleanup/retirada del módulo
y ausencia de nodos. No se necesita reinicio previo al nuevo ensayo; el nuevo
launcher sigue rechazando cualquier registro residente inesperado.

R327 retiraba Image/cache y la presentación antes de intentar reservar el
siguiente frame. Si la reserva devolvía EAGAIN, quedaba vacía hasta otro tick.
Es una fuente concreta de parpadeo en el código, no prueba de que explique
todo el parpadeo visto en el decoder físico.

R329 añade command9: consulta atómica de si alguno de los dos slots es READY,
sin consumirlo ni modificar referencias, lease, posiciones o checksums.
Mantiene guards START/dueño UI/STOP/JOIN y la secuencia de comandos. EAGAIN no
consume secuencia. El productor solo publica READY; en este launcher el UI
es el único consumidor. La lectura del PNG sigue sin adquirir frames.

Lua hace la consulta antes de detach. Si no hay frame, conserva Image/lease,
estado PLAYING y controles. Si hay uno, retira el anterior, usa command8 para
reservarlo y crea la nueva Image, todo en el mismo tick UI. PAUSE conserva la
imagen; STOP/EXIT mantienen el cierre anterior. Fallos diferentes de EAGAIN
usan la retirada acotada; no hay retry de cleanup ambiguo.

No se añade heap/buffer de imagen, timer, binding, import, hilo, firmware o
escritura de frames. Mismos motor, WAD, codec, zona4MiB, packet128/version2,
contadores y checks CRC/RAM. Fuentes físicas previas permanecen intactas.

## Paquete fijo y validación

| Elemento | Pin |
|---|---|
| Nombre / ID / preview | DoomHold / 365219949 / cinco barras cian |
| Archivo | build/doom-hold-r329/package/DoomHold-id-only.face |
| Bytes / recursos / partes | 645476 / 46 / 316; pausa100ms entre partes |
| SHA256 paquete | be5f8cf0568fa6868c1477822fc3ef2611c8e4788f2d3a9d2b87b987887836b1 |
| Lua21743B SHA256 | b41f6b73249ca515496637c8c7f7dd64d682c8066119ba7f4b7fddb3f766a1c1 |
| ELF605796B SHA256 | de82634e961871d34b675b38dc4a715578ac0642ff93062eb6fa6f1ab2a3f6ce |
| Transporte SHA256 | 779014f73bb6cc85b8e4ee339f2697164ad54eb7029d4c01c772f4c4ed6746f7 |
| Módulo / base | rw4png329 / /data/app/watchface/market/365219949/lua/ |
| Journal privado nuevo | tools/local/pc-rfcomm/doom-deployment/hold-r329.jsonl |

WAD compartido963, no incluido. Conservar DoomLauncher963 y DoomLease950.
Si hace falta cupo, el usuario puede retirar DoomRefs951, inactivo y sin
dependencias del nuevo paquete; no se ejecutará borrado desde el instalador.
No asumir cantidad fija ni consultar un inventario extra: se usa el preflight
del mismo envío y se detiene ante cualquier rechazo o ausencia del carrier.

- 142 checks C en S3/VFS/stdio reales: disponibilidad pendiente/positiva no
  consume frame; presentación conservada/reabierta, PNG completo contra golden,
  lectores solapados, reserva/secuencia/identidad UI, STOP/JOIN y retirada.
- 59 casos Lua (55 anteriores +4): falta de primer frame no crea Image;
 12ticks sin otro READY conservan Image sin detach/reserva; controles funcionan
  durante la espera; siguiente READY renueva; PAUSE/EXIT y errores write/close
  de command9 se prueban sin reintentos ambiguos. Main compuesto se analiza.
- 46 recursos/pins exactos, siete escenarios simulados de transferencia,
  tampering/carrier ausente, gates antes de privado/radio y journals anteriores
  preservados. Regresión R327: siete escenarios pasan. Prepare offline pasa.
- Build ARMv8-M Thumb soft ABI reproduce ELF base R285; mismo bindings.o
  SHA523ce18e38ea031ff706145b0cb41c6e63ba4d5b4f7cdf592a2c515bd2d90081.

Hilos/motor/IO/widgets son simulados donde corresponde; no se ejecuta el
decoder propietario RW4 ni se inspeccionan pixels físicos en estos tests.
No afirmar corrección física o rendimiento medido todavía. Emulator cerrado
se volvió a iniciar solo tras verificar proceso anterior ausente/puertos
libres; pruebas finales retiraron su módulo/nodos/temporales sin reset.

## Autorización agrupada propuesta

Usuario con batería>=50% y observación. Una instalación inactiva del paquete
fijo y hasta dos ciclos manuales. Sin reboot previo, activación/borrado desde
PC, retry/resume ni adopción de un módulo anterior.

1. Seleccionar DoomHold. Solo READY: START una vez, CHECKING despierto con
   toques breves en zona vacía. Si UI ausente/ERROR inicial, no START.
2. Observar si conserva una imagen completa sin vacíos entre frames. Probar
   UP, LEFT/RIGHT y FIRE con contactos mantenidos y liberación; EXIT antes de
   unos20s. El límite cooperativo UI sigue siendo unos30s por ciclo.
3. Solo con primer CLOSED y render/controles sin fallos, START otra vez en la
   misma instancia; juego breve y EXIT. No reinstalar. Si hay parpadeo que
   impide confirmar controles, ERROR, suspensión u otro fallo, omitir ciclo2.
4. ERROR: guardar FIRST/LAST/DIMS y las cuatro páginas MODE de la misma captura,
   sin repetir START/EXIT. Volver a la esfera habitual. No reabrir, forzar
   retirada, reiniciar ni borrar módulos para recuperar esta prueba.

Un C modificado y command9 se ejecutarán por primera vez en el reloj. Pueden
bloquear, causar panic/OOM o corrupción. Sin recuperación integral validada;
límites cooperativos, sin watchdog duro. No cambios de firmware, audio o saves.

CLI pc-doom-hold-r329.mjs prepare offline; install cerrado por DEPLOYMENT y
HOLD_R329=false, C#Large=false. Tras aprobación, un install con solo esos
gates abiertos y finally restaurar bytes/rebuild/test cerrado. Todos los
otros gates/static/resume/retry cerrados y journals anteriores intactos.
