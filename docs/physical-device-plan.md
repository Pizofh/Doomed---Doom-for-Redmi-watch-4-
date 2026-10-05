# Gate para M2315W1 — CERRADO

Este documento registra requisitos y bloqueos. **No es un procedimiento ejecutable ni autorización para conectar el reloj.** No hay comando físico aprobado. Compatibilidad nativa y recovery no demostrados impiden abrir el gate.

## Identificación pendiente

| Campo | Estado |
|---|---|
| Modelo | M2315W1, comunicado por usuario |
| Región / variante de placa | Desconocida |
| Firmware / build | Desconocida |
| HyperOS / Vela / NuttX versión | Desconocida en esta unidad |
| Mi Fitness versión / origen | Desconocidos |
| Runtime Lua / paquetes aceptados | Fuente RW4 disponible; firmware concreto sin verificar |
| Build FLAT/PROTECTED/KERNEL | Desconocida |
| ABI / exports / loader | Desconocidos |

Cuando el usuario permita una fase física, comenzar por datos de ajustes y documentación, sin cambiar firmware ni instalar mods. No pedir credenciales/MAC para este repositorio público.

## Backup y recovery

Sin procedimiento validado de backup completo, lectura de particiones o restauración boot para M2315W1. Sin paquete oficial y herramienta de recuperación identificados para región/build exactas. No inventar fastboot/DFU/Android recovery.

Sincronización Mi Fitness puede conservar datos de uso compatibles con esa app; no es backup de firmware/particiones. Restaurar watchfaces/apps requiere conocer los archivos y método oficial que acepte la unidad. Factory reset/reboot no equivalen a recovery de corrupción del sistema. Validar qué se conserva y qué se pierde antes de cualquier futura instalación.

## Orden de futuras pruebas

| Paso | Comando/método exacto | Afecta | Reversible por reboot | Flash | Particiones crudas | Bootloader | Firmware mod | Riesgo / recovery |
|---|---|---|---|---|---|---|---|---|
| Identificación manual | Pendiente de autorización física | Solo lectura de ajustes | No aplica | No | No | No | No | Bajo; ninguna modificación prevista |
| Watchface conocida | **Pendiente; no instalador compatible aprobado** | Storage de watchface / UI | No, archivo persiste | Sí si se instala | No escritura cruda prevista | No previsto | No permitido | Error de UI/crash plausible; rollback concreto pendiente |
| Hello/logging | **Bloqueado: runtime/privilegios desconocidos** | Depende de mecanismo | No garantizado | Instalación posiblemente sí | No permitido | No permitido | No permitido | Crash; soft/hard brick no descartados; recovery pendiente |
| Patrón display | **Bloqueado** | UI/driver según mecanismo | No garantizado | Depende del programa | No permitido | No permitido | No permitido | Contención UI/memoria; recovery pendiente |
| Touch | **Bloqueado** | Eventos/UI | No garantizado | Depende del paquete | No permitido | No permitido | No permitido | Controles/cierre; recovery pendiente |
| DOOM | **Bloqueado; última prueba** | App/WAD/RAM/UI | Archivo persiste; RAM solo si teardown funciona | Sí para archivos | No permitido | No permitido | No permitido | Memoria/latencia/cierre; sin estimación aún |

Flash en esta tabla significa almacenamiento persistente; instalar un archivo dentro del filesystem sí escribe la flash que contiene una partición, aunque no se escriba una partición cruda.

## Expediente necesario para cada acción

Antes de pedir aprobación, sustituir los pendientes por comando o secuencia UI exactos y explicar: componente, writes persistentes, backup previo, pasos de rollback, peor fallo razonable, soft brick, hard brick, recovery demostrado y evidencia modelo/región/firmware M2315W1. Tener resultado revisable en emulador, ciclo de salida/reentrada y límites de privilegios. Una prueba en S3/Mi Band no satisface ese requisito.

Si la ruta exige firmware de otro modelo, exploit, firma desactivada, SWD/JTAG o bootloader, detener y comparar alternativas. Firmware custom requiere una decisión explícita independiente; no es meta por sí mismo.

## Actualizacion R74: ruta candidata, sin abrir gate

[Auditoria stock](rw4-stock-feasibility.md): Gadgetbridge publica reconocimiento RW4 y handler watchface; soporte experimental, auth key local y firmware de unidad pendientes. No instalacion/vinculacion/download de APK efectuados. Fuentes del mirror2024 no prueban que version actual ni paquete propio funcionen. Mi Fitness mod del README EasyFace no autorizado. Relato Lua/shell RW4 no satisface loader/privilegios/ABI. Se pidieron firmware/Android-iPhone/MiFitness por lectura manual, sin claves/serial/MAC ni actualizaciones; pendiente respuesta. Primera instalacion requiere completar retirada/recovery y revision de riesgo, con comando/secuencia concreta, no es el proximo comando automatico.
