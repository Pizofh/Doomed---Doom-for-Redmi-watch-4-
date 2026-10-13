# Contrato nativo pendiente de M2315W1/2.2.86

Actualización R194, 2026-10-13: [loader inspeccionado y C mínimo compilado en PC](rw4-loader-r194.md).
Ruta insmod identificada: ELF32 ARM LE ET_REL, inicializador recibe modinfo y
devuelve int; rmmod incluye callback opcional/liberación. Candidato entero sin
imports ni relocaciones, no ejecutado. Contexto/privilegios y contrato de APIs
siguen pendientes; gates físicos cerrados.

Historial R193: [paquete stock e imagen principal inspeccionados](firmware-analysis-r193.md),
con checksum de metadata verificado e identificadores internos M2315W1/2.2.86.
Rutas armv8-m y modlib son pistas de implementación; ABI/FPU/exports y privilegios
siguen pendientes. Solo PC; ningún loader físico ejecutado.

[NativeInfo físico R191](native-info-physical-result-r190.md)
confirma Lua→shell, NuttX/arm en uname y comandos de módulos anunciados. El
usuario volvió a habitual con funcionamiento normal. **No se ejecutó C propio.**

## Lo conocido frente a lo necesario

| Aspecto | Evidencia actual | Antes del helloC físico |
|---|---|---|
| Entrada/archivos/UI | Watchface instalada, Lua/Image, captura propia leída y retirada | Mantener launcher y salida independientes del módulo |
| Sistema/arquitectura general | uname NuttX/arm; arranque ARMv8-M/Thumb; loader comprueba ARM32 LE | Core/config exactos y atributos de APIs; no identificar core solo por ISA |
| Shell/carga | help físico y handlers/implementación en imagen RW4 | Contexto de ejecución, ruta de instalación y retorno fiables |
| Formato | Imagen RW4 admite ELF32 ARM LE ET_REL; caso R_ARM_ABS32 inspeccionado | Validar las relocaciones concretas de cada payload, sin heredar flags S3 |
| ABI/toolchain | Firma int init(modinfo*) y rmmod observadas; candidato PC sin imports | ABI/FPU/libc/tipos de APIs para Doom; no inferir hard-float por VFP en código |
| Símbolos | Ninguna tablaRW4 verificada | Exports/imports y resolución; no usar direcciones absolutasS3 |
| Lifecycle | init y callback opcional/retirada identificados estáticamente | Validación efectiva de carga/descarga y propiedad de tareas/referencias |
| Privilegios | Desconocidos | FLAT/PROTECTED/KERNEL y contexto de módulos; asumir acceso amplio mientras no se demuestre aislamiento |
| Memoria | Especificación comercial, no heap libre | Presupuesto real y memoria pico; no diseñar sobre32MB libres |
| WASM/loadlib | iwasm ausente del helpcapturado; loadlibfunction sin invocar | No convertir ausencia de token/presencia de función en prueba de runtime funcional |
| Recuperación | Cambio de esfera normal probado; rebootdocumentado | Revisión específica de fallo nativo; sin recovery integral validado |

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

## Primer payload futuro, condicionado al contrato

Preferir un hello mínimo sin UI, drivers, hooks, tareas o persistencia. Reducir
imports cuando sea razonable; **cero imports no elimina ISA/ABI/lifecycle ni
riesgo del loader**. Una prueba ET_REL o ET_DYN requiere evidencia del formato.
No reutilizar el ELF ARM Cortex-A7 del emulador ni un binarioLinuxARM.

El artefacto, hash, comando, writes, privilegios, peor fallo y recuperación se
revisarán por separado antes de cargarlo. Insmod no se llama sandbox ni userspace
aislado por su nombre. No se busca root/jailbreak por este resultado.
