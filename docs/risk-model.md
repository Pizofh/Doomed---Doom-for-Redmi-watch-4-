# Modelo de riesgo

El usuario autoriza investigación, documentación y pruebas incrementales en PC/emulador. Hardware físico, firmware, exploits y herramientas dudosas quedan fuera del alcance actual. No se instaló software durante esta sesión.

| Acción | Escritura | Riesgo relevante | Reversión / gate |
|---|---|---|---|
| Consultar documentación/código remoto | Archivos locales del proyecto | Información falsa o extrapolada | Fuentes originales, SHAs, clasificación por dispositivo |
| Clonar fuentes fijadas | Disco PC | Hooks/filtros/config del host | No ejecutar build/install; revisar fuente y licencias |
| Listar ZIP/leer PE/hash/firma | Reporte PC | Archivo enorme/malformado, traversal al extraer | Revisar size/rutas; extracción selectiva a destinos resueltos dentro del workspace |
| Ejecutar emulador comunitario | Disco/memoria PC y estado guest | Un emulador no aísla su propio ejecutable del host | Revisar paquete completo; preferir VM si no hay confianza suficiente |
| ADB inventario allowlist | Logs host; ADB puede crear keys/server, guest puede registrar conexión | Transporte incorrecto, datos privados, shell divergente | Serial explícito emulador, timeout, sin USB seleccionado |
| Instalar watchface en emulador | Filesystem/imagen mutable guest | UI rota o lista de watchfaces dañada | Copia previa de estado guest, ID propio, restaurar copia |
| Lua shell en emulador | uname e insmod/rmmod propios probados | Shell y módulos FLAT sin aislamiento | Allowlist de comandos/payload exactos; ningún RW4 físico |
| C / módulo en emulador futuro | RAM; un programa puede escribir storage | Crash/corrupción de memoria/guest | ABI/privilegios conocidos, hello mínimo y snapshot |
| C / módulo en reloj | Potencialmente RAM y flash | Soft brick o corrupción persistente; hard brick no descartado | Prohibido en esta fase; recovery/compatibilidad y aprobación explícita |

**RAM-only describe residencia o intención; no garantiza sandbox ni que un bug no escriba almacenamiento.** Una watchface también se almacena persistentemente. Un reinicio no revierte esa instalación. Restaurar watchfaces no equivale a recuperar bootloader/particiones.

## Procedencia de binarios

Release MiWatchEmulator v1.0 verificable por metadata del repositorio original; sin digest publicado. Código completo/licencia del bundle no identificados. Se requiere obtener el ZIP, generar manifest, revisar launchers, PE, firmas, dependencias e imágenes guest y determinar el origen Xiaomi alegado. SHA local identifica bytes; no sustituye autenticidad. Firma Git del README tampoco autentica assets.

La [revisión local](emulator-package-review.md) verificó las 94 piezas EXE/DLL contra OpenVela fijado y firmas Google/Microsoft de componentes revisados. Hubo boot, ADB con allowlist, inventario, consultas Lua CLI y TouchEvents desde TMPFS. Solo se subieron fuentes/assets revisados a `/tmp`; no se instaló watchface ni se cargó C/módulos/WASM propio. Los helpers cotejan puertos loopback, PID y ruta del QEMU revisado antes de shell/upload/captura. La imagen guest sigue siendo una build opaca comunitaria; no atribuirle build oficial reproducida ni compatibilidad física. El arranque deshabilita audio y usa una copia del estado guest. Semihosting y CONFIG_BUILD_FLAT impiden asumir un sandbox garantizado.

No ejecutar MSI de Drive, APK de Telegram, compiler EasyFace o adb incluido antes de revisión razonable. El digest de compiler v4.23 aporta comparación de integridad, no revisión de comportamiento ni confianza del MSI separado. Si un origen importante sigue sin verificarse, detener ejecución y documentar la alternativa oficial AIoT-IDE.

La revisión posterior de [compiler v4.23](touch-events-emulator.md) cotejó el digest original e inspeccionó metadata/IL antes de ejecutarlo solo para empaquetar en PC. Su ADB no se extrajo y el branch automático de upload se omitió. No se ejecutó el editor. La instalación posterior en emulador sí escribió /data, eliminó una caché concreta respaldada y reseteó el guest, con ID propio/readback y backup del disco pausado. No es una operación read-only ni una instalación física. Se validaron navegación stock, cierre Lua por cambio de watchface y reentrada sin reinstalar.

El [puente Lua↔C](lua-native-bridge-emulator.md) crea un nodo virtual propio en RAM y ejecuta callbacks síncronos. EXIT cierra descriptores, retira el nodo y descarga C; rmmod rechazó un descriptor abierto en una prueba. No usa periféricos ni threads. La [limpieza al cambiar de watchface sin EXIT](lua-native-close-emulator.md) y el error Lua controlado se probaron; crashes, terminación forzada y concurrencia arbitraria siguen sin garantía. No confundir pseudo-driver o RAM-only con sandbox. La prueba no altera particiones/boot del reloj físico.

El [snapshot C mostrado por Lua/LVGL](native-frame-lvgl-emulator.md) usa un segundo nodo virtual y tmpfs. Un primer candidato produjo un fallo y un panic observado en el emulador; se corrigieron referencias/cursor por descriptor y se repitieron las pruebas. Los pins finales excluyen esos candidatos. El widget consume una copia independiente de memoria C, pero cache y memoria pico no se midieron. No convertir archivos/nombres por frame en un bucle sin acotar sus recursos.

## Condiciones de parada

El patrón C escribió exclusivamente la memoria framebuffer y estado de presentación del driver del emulador. Respaldó/restauró ambos buffers, free/close y rmmod completados. Input y panel stock se verificaron sin reboot con pantalla activa. No hay ownership exclusivo: cambios concurrentes de stock pueden sobrescribir el patrón o quedar reemplazados por píxeles antiguos al restaurar. Primera evaluación de input fue inconclusa por screen OFF previo; se estableció nuevo baseline. [Evidencia y límites](native-display-emulator.md).

El hello C posterior se ejecutó por insmod en el guest FLAT, tras contrastar init/unload/ABI y R_ARM_ABS32. Se usó puts ligado al símbolo del ELF exacto con gate SHA256, payload en /tmp y descarga explícita. Dos ciclos terminaron correctamente [resultado](hello-native-emulator.md). Eso no demuestra sandbox, recovery físico, RAM pico o seguridad de futuros callbacks/UI. Solo PC; firmware RW4 intacto y gate físico cerrado.

2026-10-03: un probe Lua/LVGL de padres cerró QEMU con Bad ram pointer. Se retiró el probe y se conservaron logs; el usuario relanzó y ADB/UI stock volvieron a funcionar. Esto demuestra que ejecutar Lua sobre bindings nativos también puede provocar un fallo grave del emulador. No se atribuye la causa exacta ni se extrapola un recovery físico. Ver [lifecycle](lua-lifecycle.md).

Exigir revisión antes de flash/OTA modificada, bootloader/recovery, particiones crudas, desactivar firma, otro modelo, abrir reloj, SWD/JTAG, corrupción de memoria, código kernel físico no probado, hard brick plausible o recovery desconocido. No hay aprobaciones implícitas para esos pasos.

Mantener dumps, claves ADB y datos del dispositivo en artifacts ignorados; publicar solo extractos revisados sin identificadores ni secretos. No introducir CI de builds sin mecanismo y licencias definidos.

R54: frames repetidos limitados a300, dos rutas propias tmpfs y un Timer de firmware. Cache invalidada solo con nombres propios no nulos, desde caller UI síncrono. Op6/op7 fuera de ese contexto no están autorizados; el driver FLAT no impone sandbox. EXIT y cambio de watchface normal retiran C/archivos, sin reboot para salir ni contacto físico. Lua post-GC estable en prueba corta; contador maxused del guest aumentó sin causa aislada. Conservar límite y no dar por validada memoria prolongada. [Contrato y resultados](native-frame-loop-emulator.md).

R55: cola propia fija de32 teclas; pausa/overflow/EXIT liberan todas y RESUME queda neutral. wait_release del firmware se usa solo para nuestro contacto activo; input sigue compartido. CLI/GC/error y UI pasan, sin garantizar cleanup ante crash. Foco stock durante contacto mantenido y ergonomía no probados. [Evidencia y límites](native-controls-emulator.md). Gate físico cerrado.
