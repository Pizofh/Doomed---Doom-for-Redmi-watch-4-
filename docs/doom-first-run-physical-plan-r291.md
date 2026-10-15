# R291: primer arranque físico de Doom, pendiente de aprobación

**Solo preparación PC. No instalado ni ejecutado en el reloj.** Se propone
UN ensayo agrupado: instalar DoomRun inactivo, usuario selecciona y pulsa
START una vez, verificación de archivos/RAM, E1M1, controles y salida/limpieza.
No reenviar el paquete portador de4,8MB ni modificar su contenido.

## Identidad y artefactos

| Componente | Valor fijo |
|---|---|
| Hardware / firmware | M2315W1 / 2.2.86 |
| Teléfono conocido | Android16/HyperOS3, Mi Fitness3.59.1i; sin cambios para este ensayo |
| Launcher nuevo | DoomRun, ID365219961, 31544bytes,19recursos |
| SHA256 paquete | `58f8a9b5d62cd1ac6851be1153029539771e2eaac13c0b5860d9c41e23b61698` |
| SHA256 Lua compuesta | `ddf70b83387d6fe554bcb965f93a8e075e3f8b6bafd13605f277fcd5a75480dd` |
| Carrier ya instalado | ID365219963, inactivo, R290 |
| ELF existente |603760bytes, SHA256local `980e13cc85813d463d229aec93b4b2000654b188b3c80a36bdcf30eaa3a3c8a5` |
| WAD existente |doom1.wad shareware,4196020bytes; sin sonido |
| Módulo / nodos |rw4doom282; /dev/rw4doomctl, /dev/rw4doomframe, /dev/rw4doomimage.bin |

Paquete local ignorado:
`artifacts/doom-first-run-r291/package-final/DoomRun-id-only.face`.
Los borradores previos conservados bajo artifacts no son variantes aprobables.
El launcher nuevo NO incluye un ELF ni un WAD: carga los de
`/data/app/watchface/market/365219963/lua/`. Su UI reside en365219961/lua.
El portador permanece con `allow_native=false`; DoomRun permite nativo
exclusivamente detrás de START manual y las comprobaciones siguientes.

## Comprobaciones y límites

Al seleccionar: UI/registro/estado de marca propia, sin insmod ni arranque.
START guarda una marca propia de14bytes para consumir un único arranque,
incluidos fallos de preflight. No se borra para permitir reintentos.
Lee ELF/WAD completos por bloques de8192bytes, uno por callback de100ms;
comprueba longitud y CRC32: ELF519743011, WAD371943786. Después comprueba
cabeceras ELF/IWAD y parámetros conocidos mediante el controlador existente.
CRC32 detecta corrupción accidental: NO es autenticación criptográfica.
Los SHA256 completos se fijaron en PC, no se recalculan desde Lua en el reloj.

Antes de cargar exige un snapshot reconocible de /proc/meminfo y solo UMEM:
free≥6467285bytes y largest≥4194320bytes. No suma pools. El umbral libre es
5418709bytes presupuestados +1048576 de margen de planificación; ni ese margen
ni el mapeo de malloc/fragmentación/overhead real están demostrados. Pasarlo
NO garantiza que el sistema tenga memoria suficiente durante el juego.
Exige registro vacío y ausencia de los tres nodos; rechaza módulos ajenos.

Guarda lease propia, carga el ELF fijado, valida estado inicial y pide START.
DOOM original/doomgeneric abre E1M1 a320×200; Lua presenta RGB565 mediante LVGL.
Cuatro controles mantenidos: UP, LEFT, RIGHT, FIRE; PAUSE y EXIT. Controles
heredan el manejo de pulsación larga previamente ensayado, sin cambiar ajustes
globales de gestos ni usar la corona como movimiento.

Tras300callbacks (~30s si el Timer avanza regularmente) pide STOP. También
pide STOP al recibir pageOnPause, y GC intenta STOP sin manipular LVGL.
El ELF ya existente tiene límite cooperativo de120s consultado por el motor.
**Ninguno es watchdog duro:** no actúan si se cuelgan CPU/kernel/callbacks.
Si la pantalla se duerme durante CHECKING, pageOnPause cancela la verificación;
no se vuelve a pulsar START/reabrir para reintentar en ese caso.

Salida normal: separar Image/caché, STOP, esperar finished, JOIN, comprobar
allocations=frees/cleanup e identidad, rmmod propio, registro/nodos ausentes,
retirar lease/captura propias. ELF/WAD permanecen. Ante fallo no hace rmmod a
ciegas, fuerza tareas ni vuelve a cargar. GC/suspensión no garantizan descarga
inmediata; retorno automático y recovery completo siguen sin demostrar en RW4.

## Operaciones físicas exactas tras aprobación

Observador junto al reloj con batería≥50%, sin OTA/otro cliente/vínculos nuevos.
Backup disponible: fuentes, paquetes/hashes, catálogo y journal privados;
no imagen integral recuperable ni respaldo completo de datos del reloj.

1. Temporalmente habilitar PHYSICAL_WRITES_REVIEWED y REVIEWED_VARIANT=r291 en
   pc-static-watchface.mjs; StaticPhysicalReviewed=true en Probe.cs. Mantener
   gates grandes/native de otros instaladores cerrados. Reconstruir/verificar.
2. `node tools/pc-static-watchface.mjs prepare r291` (offline).
3. **UNA vez:** `node tools/pc-static-watchface.mjs install r291`.
   Journal nuevo fijo tools/local/pc-rfcomm/doom-first-run-r291.json.
   16partes, sin activar/borrar esferas. Si falla, parar sin reintentar/resume.
4. Finally restaurar fuentes/gates, reconstruir y comprobar entrada cerrada.
   Consulta independiente de catálogo si termina correctamente.
5. Usuario elige DoomRun, preview de CINCO barras CIAN. Debe aparecer DOOM,
   READY y START/PAUSE/EXIT. START UNA vez. CHECKING puede tardar alrededor de
   un minuto o más en RW4; mantener pantalla despierta con toques breves en
   zona vacía, sin pulsación larga. Si aparece ERROR/BLOCKED, no repetir.
6. Si aparece E1M1, probar brevemente avanzar/giro/disparo y pulsar EXIT una
   vez antes de30s; anotar CLOSED/ERROR y si regresa la UI. Si no aparece frame,
   no insistir con controles. No seleccionar otra prueba C.
7. Volver a la esfera habitual desde Ajustes→Esferas y confirmar menús,
   desplazamiento y cambio de esfera. Si hay fallo, describir sin reiniciar,
   borrar ni cambiar vínculo. No reabrir para repetir START.

Shell Lua acotado del controlador:
`ls /dev > .../launcher-shell.txt`,
`insmod /data/app/watchface/market/365219963/lua/doom.elf rw4doom282 > .../launcher-shell.txt`,
`rmmod rw4doom282 > .../launcher-shell.txt` solo con postcondiciones válidas.
Lee /proc/modules; comandos nativos binarios START/INPUT/PAUSE/RESUME/STOP/JOIN/
DETACH solo al nodo propio, con secuencia/estado. No shells arbitrarios.

## Risk gates y reversión

| Paso | Reversible por reboot | Flash | Particiones / bootloader | Firmware modificado | Riesgo / recuperación |
|---|---|---|---|---|---|
| Instalar launcher | No | Sí, paquete/catálogo | No dirigido | No | FS parcial/lleno, UI bloqueada; retirada stock solo si responde y tras revisión |
| Seleccionar / verificar | No garantizado | Marca propia14bytes; posible estado stock | No dirigido | No | Bloqueo Lua/procfs/lectura; menús/cambio de esfera si responden |
| Cargar / jugar | No garantizado | Lease/captura propias; C no solicita cambios de firmware | No dirigido | No | OOM, panic, cuelgue, corrupción de memoria y potencial FS; STOP/retirada solo si contratos funcionan |
| EXIT / rmmod | No garantizado | Retira auxiliares propios | No dirigido | No | JOIN/caché/uninit podrían bloquear; no forzar descarga ni improvisar recovery |

La compatibilidad específica disponible es la ejecución previa de C/archivos,
callback de control y retirada de StepC en esta unidad/FW, más la imagen de
firmware/bindings revisada y RAM física medida. NO prueba todos los contratos
de Doom: hilos/newlib/allocator/render concurrente de este ELF siguen sin ensayo
físico. El emulador es S3 y no replica M2315W1.

Tratar el módulo como código sin aislamiento/privilegios de kernel potenciales;
RAM-only no es sandbox. Peor fallo razonable: bloqueo/panic/reinicio o corrupción
persistente con posible soft brick. No operación dirigida a boot que deba
causar hard brick, sin garantía integral. No hay recovery integral validado.
No flashear, modificar verificación/particiones/boot, abrir, SWD/JTAG ni explotar.
El usuario debe revisar expresamente este riesgo antes del primer Doom físico.

## Validación de esta preparación

42casos en Lua real del emulador:22del controlador+20nuevos. Native/files/UI
simulados salvo lectura CRC completa del WAD de4,2MB existente. Comprueban
CRC/vectores, corrupción/tamaños, RAM insuficiente/fragmentada, módulos ajenos,
marca de un solo intento, EXIT, límite cooperativo y pageOnPause. Inventario
nativo del emulador idéntico antes/después; no se ejecutó C nuevo en estas pruebas.
Compilador EasyFace ya revisado, sin ADB en PATH;19recursos comprobados byte a
byte.16partes,31874bytes MASS+512control previstos dentro de32768. Prepare y
test de pin/corrupción/gate cerrado pasan. Sin conexión nueva al reloj.

Reproducción PC: `node tools/test-doom-first-run.mjs`,
`node tools/package-doom-first-run.mjs` (salida fija, no sobrescribe review),
`node tools/test-doom-first-run-package.mjs`.
