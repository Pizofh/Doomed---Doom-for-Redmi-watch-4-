# Gate para M2315W1 — CERRADO

Este documento registra requisitos y bloqueos. **No es un procedimiento ejecutable ni autorización para conectar el reloj.** No hay comando físico aprobado. Compatibilidad nativa y recovery no demostrados impiden abrir el gate.

## Identificacion de la unidad: datos y pendientes

| Campo | Estado |
|---|---|
| Modelo | M2315W1, comunicado por usuario |
| Región / variante de placa | Desconocida |
| Version del dispositivo / firmware mostrado | 2.2.86, leida en Ajustes y comunicada por usuario el 2026-10-04; build/hash interno pendiente |
| HyperOS / Vela / NuttX versión | Desconocida en esta unidad |
| Telefono | Android, informado por usuario2026-10-04 |
| Mi Fitness version / origen | 3.59.1i, informado por usuario; origen/firma pendientes |
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
| Identificacion manual | Usuario informo modelo/firmware/telefono/app; sin comando del agente | Solo lectura de ajustes | No aplica | No | No | No | No | Bajo; ninguna modificación prevista |
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

## Identificacion recibida, 2026-10-04

Usuario confirma M2315W1 y version mostrada2.2.86. No se recopilan serial ni MAC. Este numero no establece version NuttX/Vela, region, ABI ni disponibilidad shell/loader. Android-iPhone y Mi Fitness siguen pendientes. Sin permiso de instalacion o actualizacion; gate cerrado. Busqueda web exacta produjo menciones de version, sin prueba tecnica primaria de carga nativa2.2.86; no usar foros comerciales como contrato.

## R75: datos de telefono/app y rollback limitado

Android y Mi Fitness3.59.1i informados por usuario. [Ruta/expediente](rw4-installation-route.md): Xiaomi documenta gestion/eliminacion de esferas y reboot forzado de RW4; no recovery de corrupcion firmware ni ensayo2.2.86. Custom oficial solo foto/estilo. Gadgetbridge/auth logs sin root es candidato reportado, no validado en esa app; no obtener claves/logs ni desvincular. Ninguna instalacion/vinculacion aprobada.

## R76: inspeccion del menu completada

Usuario solo encuentra esferas online y guardadas en reloj; sin importacion local/Debug visible en3.59.1i. Siguiente diagnostico limitado al telefono: comprobar disponibilidad de carpeta de logs con gestor existente, sin abrir/copiar archivos ni claves, instalar software, ADB o cambios de vinculacion. No toca el reloj ni abre el gate fisico. Retorno a Mi Fitness y compatibilidad experimental de Gadgetbridge siguen pendientes.

## R80: diagnosticos PC completados, gate sin abrir

Logs copiados por usuario: un candidato privado, etiqueta RW4 en mismas5lineas; autenticacion e identidad fisica no demostradas. [APK0.94.0 revisado](gadgetbridge-apk-review.md) sin ejecutar/instalar: manifiesto correcto y firma/digest v2 comprobados por inspector limitado. No conexion ni escritura en reloj. Pendiente auditar operaciones automaticas de inicializacion de esta version, permisos minimos, writes y retorno a Mi Fitness. No tratar conexion como solo lectura ni autorizar por el hecho de tener un APK firmado. Plan ejecutable/aprobacion fisica siguen pendientes.

## R81: conexion estandar envia configuracion

**Actualizacion R82,2026-10-05:** usuario eligio desarrollar diagnostico limitado en PC. [Politica/vista previa](../experiments/android-diagnostic/README.md) preparadas, prueba Java propia pasa. No APK propio compilado ni revision completa de transporte/cierre; no conexion o instalacion autorizadas. La primera consulta propuesta es bateria/modelo/version tras autenticar; sigue pendiente el plan ejecutable y su revision explicita. Gate cerrado.

[Expediente/alternativas](gadgetbridge-connection-review.md): fuente0.94.0 seleccionada tras revision de archivo confirma envios automaticos de perfil salud, unidad de temperatura y calendario (disabled=true tambien envia), hora condicional. No afirmar una conexion read-only ni que cerrar app revierta esos ajustes. Se solicita decidir entre diagnostico limitado a desarrollar en PC y aceptar envios de app oficial con plan de restauracion. No modifica firmware ni autoriza hardware ninguna de las elecciones. Secuencia ejecutable, writes/auth persistentes y retorno siguen pendientes; gate cerrado.
