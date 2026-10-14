# R221 — plan aprobado: NativeFrames, generación/display/salida juntos

2026-10-13. **Autorizado e instalado sin activación. Gates cerrados de nuevo;
selección/RUN C/animación/EXIT/retorno manuales pendientes.**
Usuario: «Sí, autorizo el ensayo y puedo observar el reloj».
[Resultado de instalación](native-frames-physical-result-r221.md).
La autorización cubre este ensayo único, sin reintentos o nuevos payloads.
[Diseño y validaciones](native-frames-r220.md).

Preparación completada: C real S3 genera PNG válidos/byte exactos y se retira;
24casos de carrier con I/O real/backend simulado; UI stock S3 muestra cambios
de frame y EXIT real, con backend nativo/cleanup simulado;32casos de sesión,
12de transferencia y gates cerrados. Ejecución equivalente RW4 aún pendiente.

## Precondiciones y objetos fijos

Solo M2315W1/FW2.2.86, región/versión Vela exacta desconocidas; Android16/HyperOS
3.0.302.0 y Mi Fitness3.59.1i habituales. Usuario junto al reloj, batería≥50%,
navegación/cambio normales y vínculo PC válido, sin OTA u otro cliente concurrente.
No cambiar vínculos, consultar batería o borrar esferas automáticamente.

NativeFrames ID365219980/nuevo,29.704bytes; SHA256
`94b65fb94b7b299496ca672348f1a5281fe123e5ee7991044f59e90e1705481e`.
ELF2780bytes SHA256
`80b75ebe516a80a931ac30e93a4d30cc76eb137e8bc7d57195091a680ad5f636`.
Módulo rw4framesr218, raíz P=/data/app/watchface/market/365219980/lua/.
Journal tools/local/pc-rfcomm/native-frames-r221.json, inicialmente sin previo/lock,
ahora Registered/15partes/sin lock.
Paquete anterior/FirstC2/NativeLog y sus marcas intactos; no reemplazo/autoactivación.

Backup limitado: paquete/fuentes propios/journal y catálogo previo del instalador;
NO dump/backup integral de particiones. Firmware privado inspeccionado como datos
no equivale a recuperación validada. Recovery integral2.2.86 sigue sin validar.

## Secuencia exacta propuesta, un solo ensayo

1. Habilitar temporalmente SOLO r220 y gate C#, reconstruir/hash/prepare offline.
2. Un `node tools/pc-static-watchface.mjs install r220`: auth/info/catálogo,
   INSTALL4/4/upload22/0/MASS5. Exige modelo/FW reconocidos, propia ID ausente y
   una activa. Paquete persistente nuevo; no SET, DELETE o selección desde PC.
   Rechazo/timeout/incompleto: parar sin retry, otro ID, limpieza o borrado automático.
3. Restaurar ambos gates/rebuild en finally; test cerrado. Si registro y cierre
   confirmados, un `node tools/pc-rfcomm.mjs watchfaces` GET independiente para
   propia inactiva/anteriores conservadas. Cerrar socket/worker; sin nuevas cargas.
4. Usuario selecciona NativeFrames, preview CUATRO barras cian. FILE/MARK/FRAMES/
   UNLOAD/EXIT inicialmente grises, RUN C visible. Si EXIT rojo inicial/etiquetas
   ausentes/fallo: NO pulsar ni repetir; describir/volver desde Ajustes si responde.
5. RUN C UNA vez. Cinco comandos máximo: `lsmod > Pframes-inspect-r218.txt`,
   `insmod Pframes.elf rw4framesr218 > Pframes-inspect-r218.txt`, lsmod, rmmod
   SOLO registro propio confirmado y retorno normal, lsmod final. Capturas propias
   ausentes previamente≤8192bytes, retiradas/verificadas. Marca15bytes creada por Lua,
   nunca borrada/rearmada. Inventarios inciertos o módulos anteriores bloquean retiro
   ciego; no nueva carga/limpieza desde PC.
6. C lee fingerprints y marca; crea cuatro PNG18564bytes propios vía wbx, escribe,
   flush/cierra. Lua verifica imágenes completas; confirma registro/retira módulo
   antes de animar. FILE/MARK/FRAMES/UNLOAD verdes; EXIT gris mientras anima.
   Observación: colores rotan/barra blanca cambia; pulsar EXIT una vez tras unos
   cambios, o parada automática24callbacks/400ms. EXIT pausa, elimina imágenes UI
   y retira cuatro archivos SOLO después de detach; EXIT verde si todo se confirmó.
   Una fila verde por sí sola no demuestra imagen visible/movimiento: usuario debe verlo.
7. Volver a habitual con navegación stock/Ajustes→Esferas, confirmar menús,
   desplazamiento/pulsación larga. No abrir nuevamente NativeFrames/NativeLog/FirstC2.

EXIT detiene nuestra demo; no registra una app ni cambia la esfera activa por
comando. El retorno al entorno habitual utiliza navegación del usuario. No DELETE
incluido; retirada opcional de esta esfera requerirá decisión posterior e inactividad.

## Persistencia, privilegios y recuperación

| Paso/componente | Reboot revierte | Flash/FS | Particiones crudas / boot | Firmware modificado | Riesgo / reversión |
|---|---|---|---|---|---|
| Paquete/catálogo/selección stock | No | Sí, stock | Ningún acceso dirigido | No | Esfera nueva; volver a habitual si UI responde, retirada propia posterior |
| Marca15bytes/capturas≤8192 | No garantizado | Sí | No dirigido | No | Marca persiste; captura propia puede quedar ante fallo |
| Cuatro PNG,74256bytes/metadata | No garantizado | Sí, archivos propios | No dirigido | No | Solo creación exclusiva solicitada; cleanup después de detach, nunca ruta ajena |
| Init C/5APIs/400bytes stack propio | RAM puede descartarse; FS no | Sí por APIs | No dirigido; internals stock desconocidos | No | Potencialmente privilegiado, sin sandbox; no tareas/callbacks nativos |
| Cuatro Image/Timer/HIDDEN/delete stock | No asegura restaurar FS | Lectura y cleanup Lua | No dirigido | No | Buffers/cache no medidos; EXIT/pageOnPause/auto-stop después de retorno C |

Mismas cinco APIs de NativeLog, pero más trabajo: cuatro archivos/74KB, CRC,
400bytes stack propio más loader/callees/Lua, múltiples decodificaciones y Timer.
RAM/heap/stack libres físicos desconocidos. La ausencia de malloc propio no evita
asignaciones de las APIs/decoder; también pueden bloquear. No FPS ni coste medidos RW4.

Peor fallo razonable: rechazo de init, archivos/módulo residuales, bloqueo UI,
panic/reboot, corrupción de memoria/FS o soft brick. Hard brick no esperado por
las operaciones previstas, sin garantía frente a error de dirección/ABI/privilegios.
Sin recovery integral conocido/validado. Reinicio RAM-only no restaura archivos.
Fingerprints pueden fault al leer y no autentican firmware. pcall/Timer no frenan
deadlock o código nativo bloqueado; auto-stop NO es watchdog nativo.

Recuperación limitada conocida: selección de habitual desde Ajustes funcionó
en anteriores ensayos; reinicio stock documentado en plan general, no recuperación
de fault de este payload. Si UI falla: detener acciones remotas, describir estado;
no firmware, reset/desvincular/reboot automático o rmmod a ciegas. Esta revisión
solo cubre un envío/selección/RUN C/observación/EXIT/retorno. No Doom, reintentos,
otras APIs/IDs o cambios persistentes del sistema fuera de estos archivos propios.
