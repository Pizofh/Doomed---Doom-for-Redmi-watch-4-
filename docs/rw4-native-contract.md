# Contrato nativo parcial de M2315W1/2.2.86

Actualización R215/R216: [carrier y C de archivo preparados soloPC](native-log-r215.md).
Captura stdout descartada por prueba S3; nuevo C usa5bindings de FILE, marker y
archivo exclusivo propios.31casos simulatedexec/I/Oreal pasan. Nuevas APIs/ruta
de código físicas pendientes; envío cerrado y [revisión R216](native-log-physical-plan-r216.md).

Historial R210: [candidato C logging compilado soloPC](rw4-log-candidate-r210.md).
Tres bindings específicos de imagen, inferidos de print stock y callees;
todavía sin llamadas/direcciones/lectura de código físicas verificadas. loadlib
coincide con fallback deshabilitado en imagen; no usar como loader funcional.
Siguiente carrier con captura/retirada, antes de nuevo plan/revisión física.

Historial R206: [resolución de imports inspeccionada solo PC](rw4-exports-r206.md).
Getter y búsqueda por nombre identificados; tabla de APIs utilizable todavía
sin verificar. Globals en BSS zeroed no prueban tabla vacía permanente. Siguiente:
rastrear puente Lua/nativo para logging, sin nuevo ensayo físico.

Historial R204: [candidato C ejecutado y retirado físicamente](first-c-corrected-physical-result-r203.md).
Cinco indicadores y retorno habitual normales confirmados por el usuario.
ELF784bytes, código4bytes, retorno0 sin imports/relocs/APIs: valida ese candidato
y la secuencia stock de módulos, no un SDK/ABI completo. Sigue sin evidencia de
aislamiento, FPU/core exactos o APIs nativas de logging/display/input/FS/timers.
Siguiente checkpoint solo PC: exports y contrato de un mensaje desde C.

Historial R195, 2026-10-13: [carrier con ELF intacto y plan de primer ensayo](first-c-plan-r195.md).
Lua del carrier solo lee/compara; no se instaló ni ejecutó C. Config/privilegios
exactos siguen desconocidos: tratar carga como potencialmente privilegiada.
Controlador final y revisión física pendientes; no deducir FLAT por insmod.

Historial R194: [loader inspeccionado y C mínimo compilado en PC](rw4-loader-r194.md).
Ruta insmod identificada: ELF32 ARM LE ET_REL, inicializador recibe modinfo y
devuelve int; rmmod incluye callback opcional/liberación. Candidato entero sin
imports ni relocaciones, no ejecutado. Contexto/privilegios y contrato de APIs
siguen pendientes; gates físicos cerrados.

Historial R193: [paquete stock e imagen principal inspeccionados](firmware-analysis-r193.md),
con checksum de metadata verificado e identificadores internos M2315W1/2.2.86.
Rutas armv8-m y modlib son pistas de implementación; ABI/FPU/exports y privilegios
siguen pendientes. Solo PC; ningún loader físico ejecutado.

Historial [NativeInfo físico R191](native-info-physical-result-r190.md)
confirma Lua→shell, NuttX/arm en uname y comandos de módulos anunciados. El
usuario volvió a habitual con funcionamiento normal. **No se ejecutó C propio.**

## Lo conocido frente a lo necesario

| Aspecto | Evidencia actual | Pendiente para C con APIs/Doom |
|---|---|---|
| Entrada/archivos/UI | Watchface instalada, Lua/Image/touch, ELF propio leído exacto y marca write/readback R204 | Mantener launcher y salida independientes del módulo |
| Sistema/arquitectura general | uname NuttX/arm; arranque ARMv8-M/Thumb; loader comprueba ARM32 LE | Core/config exactos y atributos de APIs; no identificar core solo por ISA |
| Shell/carga | insmod/lsmod/rmmod y retorno efectivos R204, desde Lua stock | Contexto de ejecución/privilegios exactos; no shell interactivo demostrado |
| Formato | ELF32 ARM LE ET_REL del candidato aceptado R204; R_ARM_ABS32 inspeccionado en imagen | Relocaciones/imports efectivos de futuros payloads; candidato no los usa |
| ABI/toolchain | Firma init inspeccionada; retorno0 del candidato funciona R204 | ABI/FPU/libc/tipos de APIs para Doom; argumento no usado, no inferir layout completo |
| Símbolos | Getter/lookup R206; symtab no verificada;3bindings de stdio candidatos R210 | Verificar lectura/direcciones/contexto del candidato; no usar S3 o nombres sin clasificar |
| Lifecycle | Inicialización/registro/retirada efectivos R204, sin tareas ni callback uninit propio | Propiedad/cleanup de tareas/referencias/exports para payloads complejos |
| Privilegios | Desconocidos | FLAT/PROTECTED/KERNEL y contexto de módulos; asumir acceso amplio mientras no se demuestre aislamiento |
| Memoria | Especificación comercial, no heap libre | Presupuesto real y memoria pico; no diseñar sobre32MB libres |
| WASM/loadlib | iwasm ausente del helpcapturado; loadlibfunction sin invocar | No convertir ausencia de token/presencia de función en prueba de runtime funcional |
| Recuperación | Retorno normal tras C mínimo R204; rebootdocumentado | Fallo nativo/FS no probado; sin recovery integral validado |

## Adquisición prevista solo PC

Primer resultado: [R192, carpeta inicial vacía y APKcache disponible](firmware-acquisition-r192.md).
[R193](firmware-analysis-r193.md) reutilizó otras copias locales y obtuvo un paquete
con versión/modelo internos coincidentes. No hay SDK, exports o contrato completo
verificados; no se ha validado una firma criptográfica independiente del firmware.

1. Buscar metadatos de OTA/build en las copias locales ya obtenidas de Mi
   Fitness/logs/APK, sin lanzar la app, solicitar OTA al reloj o usar credenciales
   en red. Las URLs serían candidatos privados, no prueba de compatibilidad.
2. Si aparece un paquete oficial trazable de la versión exacta, verificar modelo,
   procedencia, integridad y estructura **como datos**, sin ejecutar/flashear.
   Conservar firmware propietario fuera deGit/artifacts públicos. Un dominio
   familiar o nombre2.2.86 por sí solo no autentica el contenido.
3. Inspeccionar únicamente los datos necesarios para el contrato anterior.
   Si el paquete está cifrado o faltan símbolos/configuración, documentar la
   limitación y usar fuentes/SDK verificables. No explotar el reloj para extraerlo.

La imagen obtenida no sustituye un SDK o un contrato de carga demostrado. Consultas futuras
al shell del reloj no están autorizadas automáticamente por NativeInfo; cualquier
nuevo script/comando físico necesita plan concreto y revisión. No repetir el
diagnóstico solo para recuperar texto que no se conservó en el PC.

## Historial: primer payload previsto antes de R204

El inicializador entero sin imports ya se ejecutó en R204. El apartado conserva
la propuesta anterior; no autoriza un siguiente payload o nuevo ensayo físico.

Preferir un hello mínimo sin UI, drivers, hooks, tareas o persistencia. Reducir
imports cuando sea razonable; **cero imports no elimina ISA/ABI/lifecycle ni
riesgo del loader**. Una prueba ET_REL o ET_DYN requiere evidencia del formato.
No reutilizar el ELF ARM Cortex-A7 del emulador ni un binarioLinuxARM.

El artefacto, hash, comando, writes, privilegios, peor fallo y recuperación se
revisarán por separado antes de cargarlo. Insmod no se llama sandbox ni userspace
aislado por su nombre. No se busca root/jailbreak por este resultado.
