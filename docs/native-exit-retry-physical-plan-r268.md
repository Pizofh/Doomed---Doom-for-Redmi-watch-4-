# R267/R268 — un reintento pausado del mismo ExitC

**Preparado en PC; no autorizado ni enviado.** R266: INSTALL0/upload aceptado,
12partes locales enviadas, timeout de la primera consulta de catálogo tras
MASS. GET independiente12→12, IDs/flags/activa previos conservados; ExitC no
figura. Usuario confirmó «si, todo ok», esfera/menús normales. La causa sigue
sin demostrar; no afirmar falta de espacio, error Lua o saturación Bluetooth.

## Qué cambia y qué se conserva

Mismo paquete, ID365219964,24.348bytes, SHA256
`8c69e4003c1caef9eed58902cfc5d45112d5b9cf21f7ccdab8c1b379284da3e8`.
Misma Lua SHA3617fd532ac64b36112c8328b7a579d67446b815460f52aa29c231beefec81d5.
No recompilar/alterar Lua/C/PNG/ID, cambiar formato/chunk2048/CRC/MD5, enviar
firmware o crear otra esfera de diagnóstico. El ensayo EXIT C aún no se ejecutó.

Único cambio de transferencia: esperar100ms entre partes (11veces) y1000ms
después de la última, antes de consultar registro. Añade2,1s **nominales**, no
garantía de tiempo real ni de éxito. Conserva la espera de respuesta5s, límites
32768TX/96frames/worker55s/supervisor60s y la verificación habitual acotada.
No reenvía partes, no reanuda automáticamente y aborta si resumePosition≠0.
Es una hipótesis de temporización; éxito futuro no probaría por sí solo la causa.

Acción CLI dedicada `install-paced-retry r265`; solo esa variante y gate
adicional `REVIEWED_PACED_RETRY`. Original `native-exit-r266.json` Uncertain
se lee/valida contra el mismo target/ID/hash/modelo/FW y **no se modifica**.
Journal nuevo `native-exit-r268-paced.json`, ausente/sin lock. No eludir el
journal anterior, resetearlo, borrarlo o usar una ID nueva para ocultar el fallo.

## Evidencia y preparación PC

Comparación con StateMatch y CtrlProbe, ambas registradas físicamente:
24recursos por paquete, readback byte a byte,12partes/CRC/MD5/layout revisados.
ExitC source11.627bytes, menor que StateMatch11.694bytes; tamaño total solo72B
mayor. Ningún defecto encontrado por estos checks, no una prueba de aceptación
del parser físico. Informe `artifacts/research/exit-transfer-r267-final/review.json`.
Upstream Gadgetbridge local revisado fragmenta igual y sus callbacks de envío
son locales, no aceptación del archivo remoto; no convertirlos en ACK de instalación.

15casos nuevos con reloj/link sintéticos: mismo peer lento falla sin espera y
pasa con espera; **frames cifrados idénticos**,12partes sin retries, fallos de
envío/rechazo/resume/MD5, ausencia de registro, cierre/journal y gates. Modelo
sintético no demuestra la causa R266.47casos protocolo/IPC/journal pasan para
r265, sin radio.68casos Lua y retirada C realS3 anteriores se conservan, no
se repitieron. Fixtures iniciales incompletos de catálogo/nonce corregidos en
PC, fallos preservados, sin operación física durante ellos.

Reproducibles PC (audit requiere destino fresco):

```powershell
node tools/review-exit-transfer-r267.mjs
node tools/test-exit-paced-transfer-r267.mjs
node tools/test-static-watchface-session.mjs r265
node tools/pc-rfcomm.mjs build
node tools/test-static-watchface-gates.mjs
node tools/pc-static-watchface.mjs prepare-paced-retry r265
```

Helper cerrado preparado898ec2cb6522cbde1544faed041e4c371734322ee98edc01fccd057b6f5fed35;
prepare/gates0sockets pasan. Sin nuevo Bluetooth, consulta, envío o rmmod físico.

## Única acción física propuesta, tras revisión nueva

Misma unidad M2315W1/FW2.2.86, vínculo actual y C234 último estado STOPPEDR264.
Sin reboot/OTA/otro cliente. Usuario junto al reloj/batería≥50%, esfera/menús
normales; mantener pantalla despierta durante el envío. Región/privilegios y
recovery integral siguen sin verificar. Backup limitado a fuente/paquete/hash/
catálogo/journals; nada de firmware propio respaldado/restauración integral.

1. Runner nuevo fija paquete/plan/hashes y ambos journals. Tras aprobación,
   habilitar únicamente r265, gate de reintento y gate C#, rebuild/hash/prepare.
2. **Un** `node tools/pc-static-watchface.mjs install-paced-retry r265`.
   Auth/info exige modelo/FW iguales; catálogo exige ID propia ausente y una
   activa. INSTALL stock puede gestionar almacenamiento residual propio del
   primer intento: no se inspeccionó ese resto, no se promete storage vacío.
   Resume/noAck/rechazo/error detiene; ninguna limpieza/retry automático.
  12partes con pausas; no activar, reemplazar entradas registradas o DELETE.
3. Finally restaura tres gates, rebuild/test cerrado. GET independiente confirma
   propia inactiva/removible y catálogo previo intacto, socket/worker cerrado.
   Si no se confirma, no seleccionar ni iniciar EXIT C; revisar nuevamente.
4. Solo tras registro confirmado: mismo ensayo manual ya revisado en
   [plan R266](native-exit-physical-plan-r266.md): seleccionar ExitC una vez,
   diez grises/EXIT C una vez; valida key64/STOP13/read/close/listado/key64,
   un rmmod234 y comprueba registro vacío/listado sin nodo. No nueva carga,
   escritura al nodo, STOP/rearme o apertura tras descarga. EXIT CODE integrado.
   Volver a habitual y comprobar menús/cambio de esferas. Sin repetición.

## Riesgo, reversión y límites

| Paso | Flash | Particiones/boot | Reboot revierte | Reversión/peor fallo |
|---|---|---|---|---|
| Reenvío stock del mismo paquete propio | Sí, posibles restos propios se sobrescriben | Sin acceso dirigido | No | Bloqueo/parser/FS; volver a habitual si responde, no limpieza automática |
| Esperas del PC/journal nuevo | Journal PC; sin nuevo comando al reloj | Sin acceso dirigido | No aplica | Transporte fallido sigue incierto, no reanudar |
| Marca/capturas/selección manual | Sí | Sin acceso dirigido | No | Persiste; marca bloquea repetición |
| rmmod/uninit234 | Sin write persistente solicitado | Sin acceso dirigido | Estado RAM sí, daño persistente no garantizado | Retirada parcial, panic/corrupción; no reload/retry |

Firmware stock sin modificar; no sandbox del C. Peor fallo razonable bloqueo,
panic/reboot/corrupción RAM/FS, soft brick posible. Sin escritura dirigida a boot
que deba hard-brickear, sin garantía integral. Recovery parcial conocida:
Ajustes→Esferas si UI responde; integral no validada. No flashear/reiniciar ni
modificar boot/particiones/verificación, explotar memoria o aplicar otro modelo.
La autorización R266 cubría un install y se consumió: este segundo envío requiere
revisión expresa según la regla inicial; no inferirla de normalidad del reloj.
