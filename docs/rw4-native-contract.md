# Contrato nativo pendiente de M2315W1/2.2.86

ActualizaciónR191,2026-10-12. [NativeInfo físico](native-info-physical-result-r190.md)
confirma Lua→shell, NuttX/arm en uname y comandos de módulos anunciados. El
usuario volvió a habitual con funcionamiento normal. **No se ejecutó C propio.**

## Lo conocido frente a lo necesario

| Aspecto | Evidencia actual | Antes del helloC físico |
|---|---|---|
| Entrada/archivos/UI | Watchface instalada, Lua/Image, captura propia leída y retirada | Mantener launcher y salida independientes del módulo |
| Sistema/arquitectura general | uname contiene NuttX y arm; SoCpublicadoBES2700iBP/STAR-MC1 | ISA ejecutable/core exacto, endian, wordsize y atributos de compilación |
| Shell/carga | help anuncia insmod/rmmod/lsmod | Implementación/config del loader, formatos habilitados y semántica de carga |
| Formato | ELF usado enS3/otrosXiaomi | ELFclass/e_machine/tipo/relocs admisibles en2.2.86, no heredarlos |
| ABI/toolchain | Toolchain host disponible, contratoS3 conocido | ABI/FPU/libc/tipos/stack/entrypoint propios deRW4 |
| Símbolos | Ninguna tablaRW4 verificada | Exports/imports y resolución; no usar direcciones absolutasS3 |
| Lifecycle | Navegación Lua normal observada | init/uninit, propiedad de tareas/referencias y retirada del módulo |
| Privilegios | Desconocidos | FLAT/PROTECTED/KERNEL y contexto de módulos; asumir acceso amplio mientras no se demuestre aislamiento |
| Memoria | Especificación comercial, no heap libre | Presupuesto real y memoria pico; no diseñar sobre32MB libres |
| WASM/loadlib | iwasm ausente del helpcapturado; loadlibfunction sin invocar | No convertir ausencia de token/presencia de función en prueba de runtime funcional |
| Recuperación | Cambio de esfera normal probado; rebootdocumentado | Revisión específica de fallo nativo; sin recovery integral validado |

## Adquisición prevista solo PC

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

No se afirma que un firmware/SDK exacto esté disponible. Consultas futuras
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
