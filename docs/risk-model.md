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
| Lua shell en emulador futuro | Depende del comando | No presuponer permisos ni aislamiento | Experimento separado; presencia de función antes de llamada |
| C / módulo en emulador futuro | RAM; un programa puede escribir storage | Crash/corrupción de memoria/guest | ABI/privilegios conocidos, hello mínimo y snapshot |
| C / módulo en reloj | Potencialmente RAM y flash | Soft brick o corrupción persistente; hard brick no descartado | Prohibido en esta fase; recovery/compatibilidad y aprobación explícita |

**RAM-only describe residencia o intención; no garantiza sandbox ni que un bug no escriba almacenamiento.** Una watchface también se almacena persistentemente. Un reinicio no revierte esa instalación. Restaurar watchfaces no equivale a recuperar bootloader/particiones.

## Procedencia de binarios

Release MiWatchEmulator v1.0 verificable por metadata del repositorio original; sin digest publicado. Código completo/licencia del bundle no identificados. Se requiere obtener el ZIP, generar manifest, revisar launchers, PE, firmas, dependencias e imágenes guest y determinar el origen Xiaomi alegado. SHA local identifica bytes; no sustituye autenticidad. Firma Git del README tampoco autentica assets.

La [revisión local](emulator-package-review.md) verificó las 94 piezas EXE/DLL contra OpenVela fijado y firmas Google/Microsoft de componentes revisados. Hubo boot, ADB con allowlist, inventario, consultas Lua CLI y TouchEvents desde TMPFS. Solo se subieron fuentes/assets revisados a `/tmp`; no se instaló watchface ni se cargó C/módulos/WASM propio. Los helpers cotejan puertos loopback, PID y ruta del QEMU revisado antes de shell/upload/captura. La imagen guest sigue siendo una build opaca comunitaria; no atribuirle build oficial reproducida ni compatibilidad física. El arranque deshabilita audio y usa una copia del estado guest. Semihosting y CONFIG_BUILD_FLAT impiden asumir un sandbox garantizado.

No ejecutar MSI de Drive, APK de Telegram, compiler EasyFace o adb incluido antes de revisión razonable. El digest de compiler v4.23 aporta comparación de integridad, no revisión de comportamiento ni confianza del MSI separado. Si un origen importante sigue sin verificarse, detener ejecución y documentar la alternativa oficial AIoT-IDE.

## Condiciones de parada

2026-10-03: un probe Lua/LVGL de padres cerró QEMU con Bad ram pointer. Se retiró el probe y se conservaron logs; el usuario relanzó y ADB/UI stock volvieron a funcionar. Esto demuestra que ejecutar Lua sobre bindings nativos también puede provocar un fallo grave del emulador. No se atribuye la causa exacta ni se extrapola un recovery físico. Ver [lifecycle](lua-lifecycle.md).

Exigir revisión antes de flash/OTA modificada, bootloader/recovery, particiones crudas, desactivar firma, otro modelo, abrir reloj, SWD/JTAG, corrupción de memoria, código kernel físico no probado, hard brick plausible o recovery desconocido. No hay aprobaciones implícitas para esos pasos.

Mantener dumps, claves ADB y datos del dispositivo en artifacts ignorados; publicar solo extractos revisados sin identificadores ni secretos. No introducir CI de builds sin mecanismo y licencias definidos.
