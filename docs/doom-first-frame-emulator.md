# R66: Doom real produce un frame de E1M1

2026-10-04. **El motor original doomgeneric ejecutó E1M1 en el guest Xiaomi Watch S3 y produjo un frame completo de 320×200.** Captura inspeccionada visualmente: escenario, arma y HUD originales. Worker terminado, recursos liberados, módulo/temporales retirados y WAD intacto, sin reboot. Todavía sin presentar el frame en la UI del guest ni conectar controles al motor. El Redmi Watch 4 físico sigue sin tocarse.

## Ejecución y evidencia

Prueba única: `artifacts/emulator/doom-first-1791140202974/result.json`, passed=true. Imagen derivada directamente del buffer del motor: `e1m1.png`; datos originales `e1m1.bgrx`. No es una captura de pantalla de la UI ni una imagen generada.

| Dato | Resultado |
|---|---|
| Guest | Imagen fijada Watch S3/NuttX; SHA849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa |
| Motor | ozkl/doomgeneric dcb7a8dbc7a16ce3dda29382ac9aae9d77d21284 |
| Datos | doom1.wad shareware,4196020bytes; identidad/licencia documentadas en R63 |
| Entrada | `doom -iwad /tmp/rw4-doom1.wad -warp 1 1 -skill 2` |
| Estado capturado | GS_LEVEL, episodio1/mapa1, gametic6 |
| Imagen | 320×200, B,G,R,0 en memoria;256000bytes,145 colores,64000píxeles no cero |
| Checksum | FNV07aece36, guest y readback PC coinciden |
| Worker | PID210, stack solicitado32768bytes, create0/attr_destroy0/join0, cookie34660001 |
| Tiempo |1263ms desde entrada al body hasta copiar el frame; incluye init y wipe |
| Callbacks de frames |43, incluyendo la transición inicial; NO43frames jugables ni FPS medidos |
| Recursos del shim |13reservas/13liberaciones,2streams abiertos/cerrados,2denials, cero restantes |
| Pico del shim |6582961bytes (~6,28MiB),13bloques; presupuesto8MiB |
| Salida |reason2/code0, cleanup0; worker ausente en ps, módulo ausente en lsmod |

El log original menciona S_Init porque conserva el mensaje upstream; FEATURE_SOUND permanece deshabilitado. No se reprodujo ni probó audio. Los mensajes de configuración/saves expresan intención upstream: sus operaciones de escritura se deniegan por el shim, no se guardaron archivos de configuración o partidas.

## Adaptador acotado

[adapter.c](../experiments/doom-first-frame/adapter.c) implementa las seis funciones DG. Tiempo monotónico y nanosleep usan el contrato R56, fuera de UI. DG_GetKey devuelve cero eventos en esta prueba. DG_Init no abre framebuffer ni drivers.

`doomgeneric_Create` realiza un primer Tick que incluye la transición wipe. Se permite que termine; se captura desde DG_DrawFrame durante el siguiente Tick, verificando GS_LEVEL/E1M1 y gametic positivo. Se copian los64000píxeles a BSS propia antes de salir mediante rw4_exit(0). El renderer, mapas, IA, gameplay, armas y colisiones siguen siendo código original. El overlay I_Quit/I_Error del R65 continúa como única modificación de funciones upstream.

[lifecycle.c](../experiments/doom-first-frame/lifecycle.c) crea un worker joinable con stack32KiB. Pthread attr es un objeto opaco de12bytes: init/destroy del guest copian/limpian12, setstacksize escribe offset8 y nx_pthread_create consume esos campos de forma síncrona. No se adivinan campos adicionales ni se usa pthread_attr_t de Newlib.

Después de join y cleanup, el inicializador escribe exclusivamente `/tmp/rw4-doom-first.bgrx`, usando el buffer BSS que sigue vivo. Fopen/fwrite/fclose raw se usan solo en esa exportación fija de tmpfs; el motor mantiene sus wrappers de lectura y el build rechaza imports de escritura en el objeto del core antes de combinarlo con lifecycle. Se registra un gate de uninit: join incierto, cleanup fallido o error de cierre retienen el módulo. Se descarga solamente después de completion/join confirmado.

El límite15000ms se consulta cooperativamente en DG_GetTicksMs; sleep individual tiene límite1000ms y el body limita8Ticks tras Create. **No es un watchdog duro:** un bloqueo dentro de una llamada sin polls puede impedir el retorno. El timeout ADB tampoco detiene C. No forzar kill/unload ante falta de completion.

## Enlace y ABI

Toolchain Arm14.3 revisada; Cortex-A7/Thumb, VFPv4/NEON, argumentos hardfloat. No se liga libc/libm/Newlib del toolchain: se resuelven41imports contra símbolos inspeccionados del guest exacto. Nuevas inspecciones en `artifacts/package-review/doom-bindings/`:

- Strings/memoria usan punteros y size32 en registros AAPCS; memcpy, memset y strcmp son ARM, llamados por BLX conservando su bit de estado original. No se impone bit Thumb a toda la biblioteca.
- Atoi retorna int32; atof delega en strtod y retorna double según ABI hardfloat. Fabs recibe/retorna d0. Sscanf es variádico; las llamadas del core pasan punteros de almacenamiento de32bits compatibles con los formatos utilizados.
- `__aeabi_ldivmod` recibe dos enteros signed64 en r0-r3 y retorna quotient/remainder en esos registros; ABI de helper del compilador. No se define como una función C con un retorno inventado.
- Fwrite recibe buffer/size/count/FILE opaco en r0-r3 y retorna cantidad de elementos; en la exportación size=1/count256000, producto acotado. Init/setstacksize/destroy de pthread se inspeccionaron antes de usarlos.

El parcial `ld -r -d` asigna los415COMMON a BSS antes de cargar. Module.ld mantiene una .text y el entry Thumb propio **0x1ead5**. Hay6900ABS32 y cuatroTHM_CALL de autorrecursión: P_RecursiveSound, P_CrossBSPNode, R_RenderBSPNode, SHA1_Update. El compilador mantiene estas llamadas pese a pragma long_calls. El helper verifica que cada llamada y destino pertenecen a la misma función/.text; no admite branches externos arbitrarios.

Loader exacto inspeccionado previamente: up_relocate0x65c668, tabla para tipo10 conduce a0x65c744, decodifica/recompone Thumb BL y comprueba alcance±16MiB. Las cuatro llamadas son locales y quedan muy por debajo de ese alcance. Esta compatibilidad ahora se ejercitó al cargar el módulo; no prueba que se ejecutaran todas las ramas de los cuatro algoritmos durante este frame.

| Artefacto | Pin |
|---|---|
| ELF final |438940bytes, SHAf0f55f55cd72fab7052a3caaca40cbb43567ac9cf5bdcf4326280a8fa11a7539 |
| Fuentes propias LF combinadas, lista en first-review.json |a1125230f83a3bd515287967d3a3f5d366dc16ac66cfb00b1e64443b89e92dcc |
| Core para este enlace |435288bytes, SHA50d8fb8911766fb0285eedd81e3965be7b923562c7a3782abd87e068c6a21c8e |
| Secciones asignadas |text126156,rodata100896,data60004,bss500976:788032bytes antes de overhead/alineación |

La BSS incluye el buffer de captura256000bytes y los COMMON ya asignados. Pico contabilizado6582961+secciones788032=7370993bytes (~7,03MiB), **no RAM total**: faltan stack32KiB, loader/metadata, libc, tmpfs4196020WAD, ELF temporal y exportación256000, sistema/UI y caches. Umem usado18010544→18011936 (+1392); maxused25328004→33165324. Ese máximo es global/acumulado del guest, no una medida aislada del motor. Nused/nfree500/55 y GImageCache permanecen iguales en dos muestras; no se afirma ausencia de fugas prolongadas.

## Reproducción y límites

```powershell
node tools/build-doom-first.mjs
node tools/run-doom-first-emulator.mjs
# Reutilizar el core ya auditado, comprobando hash y fuentes, sin recompilar80C:
node tools/build-doom-first.mjs relink
```

El runner fija imagen, fuentes/ELF y transporte QEMU/ADB loopback, `emulator-5554`, servidor5039. Verifica readback del ELF y WAD, memoria libre observada≥16MiB y ausencia de nuestros módulos/temporales antes de cargar. Captura, WAD y ELF son archivos propios de tmpfs; se retiran después de join y rmmod. No se escribió /data ni se instaló/activó una watchface en R66. Estado previo Storage/UIProbe winput no modificado; actividad UI no revalidada.

Fallos previos exclusivamente en el PC: guard inicial rechazó memcpy por no ser Thumb; se corrigió permitiendo el estado ARM original inspeccionado. Volcado completo del desensamblado dio ENOBUFS; ahora se guarda solo adaptador/lifecycle propios. Guard ABS32 inicial rechazó cuatro autorrecursiones; se revisó el loader y se admitió exclusivamente ese contrato. Ninguno de esos candidatos se cargó. Relink reusa el core verificado para evitar recompilaciones innecesarias. La primera ejecución del guest pasó.

FLAT, sin sandbox: solo salida cooperativa propia, no recovery ante corrupción de memoria, crash, kill o loop sin polls. No juego continuo, input, FPS, ergonomía, saves, launcher persistente, UI stock concurrente ni equivalencia con M2315W1 demostrados por R66. Datos, capturas, toolchain y guest permanecen ignorados en Git.

**Siguiente checkpoint:** presentar frames reales de Doom en la UI Lua/LVGL del emulador y conectarlos al transporte de controles R62, con START/EXIT. El gate físico sigue cerrado.
