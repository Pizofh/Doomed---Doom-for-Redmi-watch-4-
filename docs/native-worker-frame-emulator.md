# R61: frames producidos por un worker C

Resultado local al **2026-10-04**: el worker C produce imágenes RGB565 que nuestra watchface Lua muestra dentro de LVGL. Dos ciclos START/EXIT, pausa con panel stock, dos lectores simultáneos y cierre/reentrada pasan. No se compiló Doom, no se abrió un WAD y no se conectó el M2315W1.

Este resultado corresponde exclusivamente al guest **Xiaomi Watch S3** de MiWatchEmulator v1.0. Pantalla configurada a 390×450 no equivale a emulación del BES2700iBP ni determina ABI, memoria disponible o privilegios del Redmi Watch 4.

## Contrato y arquitectura

El experimento separado en `experiments/native-worker-frame/` conserva el launcher R60. Inicializar el módulo registra dos dispositivos y retorna; START desde la tarea UI28 crea y separa el worker. La UI no hace join ni sleep y el worker no llama LVGL. El presupuesto finito es de1200 esperas nominales de50ms, aproximadamente60s; cuenta iteraciones incluso pausado y **no es un watchdog ni una garantía temporal**.

```mermaid
flowchart LR
    C[Worker C: produce RGB565] --> B[Dos buffers con ownership atómico]
    B --> R[Lua/UI: lee copia y cierra descriptor]
    R --> F[Dos archivos propios en tmpfs]
    F --> L[Image de LVGL en nuestra página]
    U[START / pausa / EXIT] --> C
```

Cada buffer recorre `FREE → WRITING → READY → READING → FREE`. CAS concede la propiedad; release/acquire publica los bytes completos y evita reutilizar un buffer mientras alguien lo lee. Si ambos están ocupados, C incrementa `blocked` y omite esa producción: no espera ni sobrescribe READY/READING. El orden por generación es una selección aproximada entre lectores concurrentes; la concesión es exclusiva, pero no se promete FIFO estricto. Lua descarta generaciones anteriores a la última mostrada.

`/dev/rw4wstream` entrega un frame inmutable por descriptor, cursor propio, lecturas parciales y EOF. Un tercer lector recibe rechazo cuando los dos buffers están tomados. La cookie numérica en `file.f_priv` codifica slot/cursor; no es un puntero dereferenciable. Su ABI procede del DWARF del guest exacto: file32bytes, f_priv offset20. Nunca ejecutar os.execute con esos descriptores abiertos; el riesgo de herencia de descriptores observado en R53 sigue aplicando.

`/dev/rw4wframe` admite snapshots exactos de64bytes (R60) u80bytes (extendidos), sin EOF: **no usar cat ni read-all**. Los20 words extendidos son magic,seq,pending,stop,ready,tid,steps,reason,owner,detached,error,live,cycle,paused,init,reserved0,produced,readers,blocked,reserved0. Son cargas individuales, no una transacción coherente de todo el estado.

Los comandos de12bytes son magic `0x34574c52`, secuencia creciente y operación:1 START,2 STOP,3 PAUSE,4 RESUME,5/6 invalidar caches del archivo0/1,7 ambos. Las operaciones de cache comprueban que el caller sea el owner UI antes de llamar `lv_image_cache_drop` y `lv_image_header_cache_drop`. Las llamadas permitidas se ejercitaron; el rechazo desde un caller incorrecto no se inyectó en R61.

## Formato y ownership de LVGL

Frame320×140, stride640, RGB565 little endian:12bytes de header y89600 de píxeles, **89612bytes** por frame. Header exacto: `19 12 00 00 40 01 8c 00 80 02 00 00`. Primeras8 filas codifican la generación en32 barras; luego barras de ocho colores y un tablero. El patrón permite comprobar cada píxel contra su generación, incluyendo mezclas entre frames.

Un Timer Lua de200ms copia un frame, cierra el descriptor nativo y alterna `/tmp/rw4-worker-frame-0.bin` y `-1.bin`. Invalida la cache del destino en contexto UI antes de escribir y cambia el src de la Image situada en x35,y205. LVGL recibe rutas propias y no conserva un puntero al módulo C. START desaparece durante ejecución; EXIT sigue visible. No se escribe directamente `/dev/fb0`. Los bordes globales aún pueden abrir el panel stock; no se afirma exclusividad total de gestos.

## Salida y cierre de Lua

EXIT borra la Image, invalida caches desde UI y pide stop cooperativo. El Timer descarga únicamente con lectores0, detach exitoso, motivo de término publicado y **PID ausente**, mediante el lookup interno ya inspeccionado en R60. Un flag de finalización solo no autoriza descargar. No se dereferencia el TCB devuelto y un PID reutilizado conserva el módulo de forma preventiva.

Uninit comprueba descriptores de control y stream, y retira ambos drivers. La rama de registro parcial conserva código si no puede retirar un driver registrado; se revisó estáticamente, sin inyección de fallo. El worker no instala destructores TLS ni callbacks de salida que apunten al módulo.

Al cerrar Lua sin EXIT, el finalizador solo pide stop y **conserva módulo/archivos**. No llama LVGL, no espera y no descarga. Al volver a nuestra watchface, se adoptan únicamente sus copias con header/tamaño/EOF esperados, el Timer invalida caches en UI y recoge el módulo y los archivos. Esta validación de formato no es autenticación de archivos. El helper del host se niega a descargar un módulo R61 retenido: exige esa reentrada UI primero.

La sincronización de buffers no es un sandbox. El guest es FLAT y el módulo comparte memoria/privilegios del sistema. Lifecycle serializado por nuestro caller Lua, un CPU configurado: no se demostró seguridad general ante open/unload arbitrarios, varios hilos sobre el mismo descriptor, SMP, crash o cancelación forzada.

## Evidencia del binario final

| Prueba | Resultado |
|---|---|
| Dos START/EXIT | Workers107/277 en grupo UI28; initializer NSH104/276 ya retornado; worker/nodos/módulo/copias ausentes después |
| Imágenes visibles |12 capturas,44800 píxeles por captura, patrón completo correcto con tolerancia2 por canal; generaciones avanzan |
| Lectores | Dos descriptores simultáneos, generaciones54/55 distintas;44800 píxeles exactos en cada copia; tercero rechazado; split17+chunks257, EOF y readers2→0 |
| Backpressure | blocked136/92 antes de los EXIT; no sobrescritura del buffer leído observada |
| Panel stock | Worker107 pausado: steps149 y produced46 constantes en dos muestras; reanudación produce nuevos frames |
| Cambiar a Storage sin EXIT | Worker374 termina: stop1/reason1/live0, steps87,produced27,readers0; módulo y copias retenidos |
| Volver a UIProbe | Limpieza automática desde UI, Ready: exited; sin rmmod host ni reboot |
| Límite natural del primer candidato | Worker242 de un ensayo interrumpido por el helper termina con reason2; recogido por UI; no repetido en binario final ni watchdog probado |
| Baseline final | Storage365700764 activa, PIDs107/277/374 ausentes; módulo/nodos/copias/ELF propio retirados |

Artefactos locales ignorados por Git:

- `artifacts/emulator/worker-frame-test-1791129002565/`: result, observations, reader-result y salidas ADB del binario final.
- `artifacts/emulator/wframe-atomic-close-1791129131313/` y `wframe-atomic-reentry-1791129189170/`: cierre y reentrada finales.
- `artifacts/emulator/wframe-atomic-final-1791129242309/`: result y marcadores propios; uninit0/reason1/live0/refs0 para107/277/374.
- `artifacts/emulator/screenshots/wframe-atomic-final-storage.png`: entorno stock final.

Ensayo inicial conservado: worker-frame-test-1791127494616 pasó otras12 capturas/dos ciclos con workers402/562; cierre660 en wframe-close-1791127660884, reentrada en wframe-reentry-1791127711843 y baseline en wframe-final-1791127961296. Su ELF5680bytes,58 ABS32, SHA7c30351ab5b7b19a02c2bd1bf3790c352e836354178f69747f94d46b4311a50f fue sustituido por el binario final con metadatos atómicos descrito abajo. No confundir los pins de esa primera ejecución con los finales.

Las muestras ps indican stack utilizable4072 y usado600, no máximo de stack. En el ensayo final GImageCache usado1105872→1709536 (+603664); Umem usado18090040→18270680 (+180640), maxused21991596→22944708 (+953112). En el primer ensayo GImageCache usado1720168 antes/después; Umem usado+1568/maxused+307064. Baselines distintos, afectados por navegación/recursos del sistema: no se aisló la causa de las diferencias ni se descartaron fugas prolongadas. No se midieron FPS del motor, CPU sostenida, latencia ni costo de copia. El total Umem del emulador no es RAM física RW4.

## Fallos y ajustes conservados

1. Primer START no encontró el ELF en tmpfs, aunque su staging anterior había pasado readback. Posible reset asíncrono aún en curso; causa no aislada. No arrancó C. Ahora el runner verifica el ELF remoto antes de START; preparar después de boot/UI responsive, no solo del ack de reset.
2. El primer parser Lua tenía19 words para un snapshot de20. Falló después de registrar el módulo, antes de crear worker. Con pending0/tid0/readers0/produced0 y sin copias, se retiró ese módulo inicializador desde host. Se corrigió con `string.rep('I4',20)`; no hubo crash/reboot. Esta recuperación específica no autoriza host-unload de un módulo que haya presentado imágenes.
3. snapshotData consultaba RUNNING inmediatamente tras el ack y dio un falso fallo antes de escribir recursos. Ahora observa PAUSED/RUNNING con polling acotado2500ms. La copia respaldada sigue siendo imagen de datos, sin snapshot RAM ni consistencia de filesystem demostrada.
4. El instalador `refresh` respaldó y reemplazó paquete/derivado propios con readback exacto, UIProbe inactiva y módulos ausentes, sin invalidar lista ni reset. También se ejercitó la reparación del derivado añadida en R60 mediante el update inicial. Solo hubo un reset inicial antes de ejecutar C.
5. El primer helper de dos lectores trató EAGAIN como fallo; C siguió vivo y alcanzó su límite natural. El helper ahora reintenta de forma acotada y cierra cualquier descriptor antes de esperar. Ensayo final pasó con0 reintentos. No se cambió el payload C para ese ajuste.
6. Revisión final identificó `sequence` y `cycle` no atómicos, leídos por NSH mientras la UI podía escribirlos. No se observó corrupción, pero existía una carrera de datos en C. Ambos son ahora atomic_uint; readelf/disassembly confirma barreras y operaciones exclusivas, BSS idéntico y los mismos10 imports. Se repitieron12 capturas/dos lectores/dos EXIT y cierre/reentrada con el **binario final**. Antes de ese ensayo la UI estaba SCREEN_STATE_OFF por300s de inactividad: el guard de navegación se detuvo antes de C; se respaldó/resetó solo el guest limpio y se comprobó UI responsive antes de stage. Artefacto wframe-atomic-baseline-1791128897665. No se usó reboot para salir de ningún worker.

## Build fijado

| Elemento | Valor |
|---|---|
| Guest SHA256 | `849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa` |
| Fuente C normalizado LF SHA256 | `37e8a66231d9b38d6aac2bc9b2b1ff6282a5fadbfd6f0b02ac771eaa97dd6fa0` |
| ELF SHA256 | `d6b2c68d6f74b536f8cac4086f38ca2636f9fd7e8011dbd83ebede88596f38fc` |
| Lua SHA256 | `b7fa203410163cbdf99b49abfaeba69a972b6c11e82319f67ef9580211f7f5aa` |
| Paquete SHA256 | `926116d3a58dad9fdfee1e6355e74c6e6985ce84cd0037215b0f13474adafa8a` |

Arm14.3.rel1 revisado localmente; C17/Os/Cortex-A7/Thumb/hard-float, general-regs-only, sin libc añadida. ELF ET_REL32LE ARM EABI5, entry0x849,59 relocations ABS32,5740bytes. **BSS179312bytes** incluye dos buffers de89612bytes más estado; tamaño del ELF no es consumo RAM total.

Imports10 ligados exclusivamente al guest: pthread_create`0x65ef71`, pthread_detach`0x6554bd`, nxsched_get_tcb`0x6028fd`, nxsched_gettid`0x606999`, clock_nanosleep`0x656609`, printf`0xfa2d25`, register_driver`0x64356d`, unregister_driver`0x6435b5`, lv_image_cache_drop`0x922fd9`, lv_image_header_cache_drop`0x922f75`. Build/carga rechazan cambios de imagen, fuente o binario. No trasladar estas direcciones al RW4.

Fuentes técnicas previas: [lifecycle/imports R60](native-launcher-emulator.md), [cache y Timer R54](native-frame-loop-emulator.md), [ABI de streams R53](native-frame-lvgl-emulator.md). R61 combina esas inspecciones del ELF exacto con código propio, readbacks y runtime; no identifica nuevas APIs del firmware físico ni constituye reverse engineering de firmware RW4.

## Reproducción

Con dependencias ya revisadas y el emulador propietario local, desde la raíz del repo:

```powershell
node tools/build-worker-frame.mjs
node tools/package-ui-probe.mjs wframe
# Seleccionar Storage; confirmar UIProbe inactiva y módulos propios ausentes.
node tools/install-ui-probe-emulator.mjs update
# Esperar boot completo y comprobar UI stock activa antes de staging.
node tools/worker-frame-emulator.mjs stage
# Seleccionar UIProbe, revisar Ready; no pulsar START previamente.
node tools/test-worker-frame-emulator.mjs
node tools/worker-frame-emulator.mjs state
# Si se cerró Lua con C: volver a UIProbe para que el Timer recoja todo.
# Después seleccionar Storage y confirmar ausencia de módulo/nodos/copias.
node tools/worker-frame-emulator.mjs cleanup
```

`refresh` es una alternativa al update solo cuando ya existen el ID y su derivado propios, la esfera está inactiva y no hay módulos cargados. No arranca el emulador ni navega menús automáticamente. Los helpers verifican QEMU/revisión y usan solo ADB loopback5039/emulator-5554, nunca USB. Navegar con captura y revisión por paso, como exigen los incidentes históricos.

Siguiente checkpoint único: **integrar los controles mantenidos Lua→worker C, con liberación de teclas al pausar/cerrar**, reutilizando el diseño R55 sin ejecutar el motor todavía. Persistencia nativa/WAD, memoria prolongada y compatibilidad/recovery M2315W1 siguen pendientes; el gate físico permanece cerrado.
