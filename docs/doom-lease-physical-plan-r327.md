# R327: ensayo único de DoomLease

Preparado y validado en PC/emulador; pendiente de aprobación física.
Corrección y evidencia: [doom-image-lease-r327.md](doom-image-lease-r327.md).

| Pin | Valor |
|---|---|
| Nombre / ID / preview | DoomLease / 365219950 / cinco barras naranjas |
| Paquete | build/doom-lease-r327/package/DoomLease-id-only.face |
| Bytes / recursos / partes | 645404 / 46 / 316 (pausa100ms entre partes) |
| SHA256 paquete | 502dbc6b9081ad7f61da0d7377e6809ee7a6f957b24138d77a854cb1a0e63a95 |
| SHA256 Lua (21695 bytes) | 3b4fe3cd034bc79e9c836d22c0c0fa4bbdbf12be819dfd91d4693c5028d88681 |
| SHA256 ELF (605772 bytes) | 14ff85dbe2de6ea7373e0b4a71f0f1aadd42d2381c854770fc03edf87c7b9fd1 |
| SHA256 transporte | 2e528293f64c09ba1817684a40f21bf75d8bfc23b98915783fcfcd4f82bcde61 |
| Módulo / base | rw4png327 / /data/app/watchface/market/365219950/lua/ |
| Journal privado nuevo | tools/local/pc-rfcomm/doom-deployment/lease-r327.jsonl |

WAD compartido en DoomLauncher365219963; no reenviarlo ni borrar carriers.
No reemplaza DoomRefs ni adopta su módulo. No inventario extra o supuesto de
número de esferas. Los guards del protocolo verifican carrier y selección.

La aprobación solicitada agrupa exclusivamente:

1. Batería>=50%, observación y esfera/menús/corona normales. Un reinicio normal
   stock desde Ajustes → Sistema → Reiniciar, nunca restablecer/desvincular.
   Confirmar retorno antes de enviar: rw4png325 no completó retirada.
2. Una instalación inactiva del archivo fijo, sin selección o borrado
   automáticos, reintento ni reanudación. Ante rechazo/cupo/corte: parar.
3. Seleccionar DoomLease. Solo con READY pulsar START una vez y mantener
   CHECKING despierto con toques breves. Si Doom funciona, probar controles
   brevemente y EXIT antes de unos10s. Informar si el render está completo y
   animado y termina CLOSED. No segundo ciclo ni reabrir.
4. Si ERROR, conservar FIRST/LAST/DIMS y las cuatro páginas MODE de esa misma
   captura (refs/open/close; clserr/reads/rderr; skerr/cfirst/clast;
   maxread/relerr/pos). MODE usa memoria Lua, sin comandos/IO. No repetir
   START/EXIT. Volver desde Ajustes a la esfera habitual y confirmar menús/corona.

Se envía C modificado y se ejecuta command8 por primera vez en este reloj.
Aunque reutiliza las APIs ya probadas, puede bloquear, causar panic, OOM o
corrupción; no hay recuperación integral de firmware validada. Los límites
de30s UI/120s worker son cooperativos, no detienen un cuelgue. Un reinicio no
garantiza revertir corrupción. No forzar rmmod, refs o cierres de fd ajenos.
Esta autorización no incluye otro reinicio, envío, prueba, limpieza o firmware.

CLI `pc-doom-lease-r327.mjs prepare` offline; `install` cerrado por
PHYSICAL_DEPLOYMENT_REVIEWED=false y PHYSICAL_LEASE_R327_REVIEWED=false, más
LargePhysicalReviewed=false. Tras aprobar/confirmar reinicio, abrir solo esos
tres, un install y finally restaurar bytes, recompilar y probar cerrado.
Mantener R325/R321/R318/static/resume/retry cerrados y journals anteriores.
