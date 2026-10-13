# R195 — preparación del primer ensayo C, sin ejecución física

2026-10-13. **Borrador técnico; no autoriza envío, selección o carga.**
El candidato C de [R194](rw4-loader-r194.md) existe y su carrier se construyó
en PC. Aún falta el controlador de carga/retirada y su validación de fallos;
por ello no se solicita aprobación de ejecución física en este checkpoint.

## Identidad y límites

Unidad del usuario: Redmi Watch 4 M2315W1, firmware comunicado y consultado
2.2.86. Región desconocida. Teléfono Android16/HyperOS3.0.302.0, Mi Fitness
3.59.1i según sesión; comprobar de nuevo lo relevante antes del ensayo autorizado,
sin asumir que versiones/batería/estado permanecen iguales.

La imagen stock inspeccionada contiene modelo/versión coincidentes, y su
loader valida ELF32 ARM little-endian ET_REL. No se verificó su firma
criptográfica independientemente ni el contrato completo de APIs. No se usa
firmware de otro dispositivo, direcciones S3 o el ELF Cortex-A7 del emulador.

## Privilegios: evaluación para el ensayo

El loader inspeccionado llama directamente al inicializador en su propio
contexto. No hay creación de proceso o transición de aislamiento visible en
esa ruta. Eso no identifica la configuración FLAT/PROTECTED/KERNEL ni UID/GID.
Tratar el módulo como **potencialmente privilegiado y con acceso amplio a la
memoria/sistema**, hasta demostrar algo más concreto. RAM-only no es sandbox.

En la referencia [NuttX12.3.0 sched/Kconfig](https://github.com/apache/nuttx/blob/8fdb56b5f2124de351a48125a252ba4264665e3d/sched/Kconfig),
CONFIG_MODULE selecciona LIBC_MODLIB y no declara ahí una dependencia BUILD_FLAT.
El [Make.defs](https://github.com/apache/nuttx/blob/8fdb56b5f2124de351a48125a252ba4264665e3d/sched/module/Make.defs)
incluye insmod/rmmod cuando CONFIG_MODULE está habilitado. Por tanto, la presencia
de esos comandos no prueba FLAT. El handler [ARMv8-M SVCall](https://github.com/apache/nuttx/blob/8fdb56b5f2124de351a48125a252ba4264665e3d/arch/arm/src/armv8-m/arm_svcall.c)
tiene ramas de configuración distintas; source genérico no sustituye la build
Xiaomi. Estas fuentes se consultaron como datos, sin ejecutar software nuevo.

El primer C propio solo devuelve cero: cuatro bytes de código, sin llamadas,
imports, relocaciones, callbacks, tareas, drivers o escrituras. El **loader** sí
asigna/libera memoria y puede fallar. No garantiza que el reloj tolere la carga.
Una futura autorización deberá revisar expresamente este contexto conservador,
el riesgo de código nativo y la ausencia de recuperación integral validada.

## Carrier preparado solo en PC

`node tools/package-lua-minimal.mjs native-carrier` utiliza el compiler EasyFace
ya inspeccionado, con hashes fijados y sin ADB adyacente. Construyó:

| Artefacto | Identidad |
|---|---|
| NativeCarrier | ID365219995, 12.452 bytes |
| Paquete privado | artifacts/native-carrier-r195/NativeCarrier-id-only.face |
| SHA256 paquete | `6bfb350bdf5bc362b9598a2110b5e05a681481ed0999784feae6e539a28e0aa1` |
| ELF contenido | 784 bytes, SHA256 `8248f76bdabd9c44aee6df46e8ba4d8c999acc9ca1d0c8367e1652ce0675da6d` |
| Lua materializada | 3.502 bytes, SHA256 `41cd28d20f825365d6cfa51c9efbf4fee0ba373d8c5cfda813ccf55f57947115` |
| Template propio | experiments/lua-native-carrier/main.lua; build inserta referencia hex del ELF |

La Lua solo crea UI con un PNG propio, abre minimal.elf en rb, lee como máximo
785bytes y compara todos sus bytes con la referencia. Cierre protegido ante
error. No escribe archivos, usa timers, invoca shell/loadlib o carga código C.
El indicador de ejecución permanece rojo. **No instalar este carrier como otro
ensayo físico aislado:** es una comprobación de construcción en PC.

`node tools/verify-native-carrier.mjs` verificó los registros serializados del
paquete, no solo coincidencias de magic. En SetupApp del compiler revisado, cada
registro tiene cabecera20bytes, longitud de nombre en el byte superior y de datos
en los24bits inferiores. Readback de main.lua, minimal.elf y pattern.png confirmó
límites, nombres únicos, longitudes y contenido exacto. El archivo ELF empaquetado
es byte a byte idéntico al candidato. No se probó extracción/runtime físico o
emulado de este carrier. El futuro controlador verificará el archivo extraído
antes de llamar al loader: no hace falta instalar este paquete primero.

No hay perfil r195 en static-watchface-spec ni ruta de instalación habilitada:
el verificador comprueba que ese perfil sea rechazado. Gates Node/C# false.
No se añadieron secretos, firmware propietario o ELF a Git.

## Secuencia prevista para el futuro controlador

Todavía **no implementada ni ejecutada**. El paquete final tendrá su propio
ID/hash y plan revisable; el carrier anterior no es el artefacto autorizado
para estas operaciones. No copiar estos pasos como comandos manuales.

| Orden | Operación prevista | Condición y efectos |
|---|---|---|
| 1 | Instalar paquete propio sin autoactivar | Preflight modelo/FW/ID/espacio; una transferencia; escribe archivo y catálogo stock |
| 2 | Selección manual con usuario presente | UI/entrada segura y retorno a Ajustes; comprobar entero el ELF en SCRIPT_PATH propio |
| 3 | Consultar lsmod antes | Captura acotada en archivo propio; abortar si el nombre fijo del módulo ya existe o no se reconoce el formato |
| 4 | Guardar marca persistente de intento | Antes de insmod; lectura posterior bloquea otra carga incluso tras reboot/reselección. No borrar automáticamente esa marca |
| 5 | insmod del archivo propio con nombre fijo | Una sola llamada; asignación/carga/initializer de dos instrucciones en contexto potencialmente privilegiado |
| 6 | lsmod posterior | Registro nuevo tras inicialización exitosa; no basarse solamente en exitstatus de os.execute |
| 7 | rmmod del nombre propio | Solo si se comprobó ausencia previa y presencia posterior atribuible a ese intento, y la llamada de carga retornó |
| 8 | lsmod de cierre | Confirmar ausencia; mostrar resultado compacto, cerrar capturas y volver a esfera habitual |

Los argumentos serán literales salvo SCRIPT_PATH validado como directorio
absoluto sin traversal/metacaracteres y con el ID exclusivo. La futura revisión
fijará ID, nombres, comandos, bytes y hashes exactos. No hay comandos
destructivos, flash, particiones, bootloader, drivers o hooks previstos.

Si os.execute no retorna, pcall o timeout del PC **no** terminan el shell/módulo.
No habrá retry, rmmod a ciegas, kill, reboot o limpieza automática como fallback.
El flag persistente reduce la posibilidad de repetir una carga problemática;
no resuelve un fallo que impida arrancar o navegar el reloj. El controlador se
probará primero con una interfaz simulada para cubrir errores y reentrada, sin
ejecutar el ELF ARMv8-M en el S3 Cortex-A7.

## Riesgo y reversión por componente

| Operación | Persistencia/flash | Reboot revierte | Peor fallo/brick | Reversión prevista |
|---|---|---|---|---|
| Instalación/selección | Sí, mediante servicio stock; sin particiones crudas previstas | No | Fallo instalador/UI, reapertura de esfera problemática; soft brick no descartado | Ajustes→Esferas→habitual y retirada exclusiva del paquete tras confirmación |
| Marca/capturas propias | Sí, filesystem propio; tipo de almacenamiento no confirmado | No | Archivos residuales, error FS o bloqueo | Retirada revisada de archivos/paquete propios; no borrar datos generales |
| Carga del ELF | Loader modifica RAM/registro; C no tiene instrucciones de escritura | Estado RAM se pierde, pero no garantiza recovery | Bug loader, bloqueo, corrupción de memoria o reboot; soft brick posible | Descarga confirmada; si no hay retorno, detener y observar/revisar |
| Descarga | Libera RAM/registro; internals stock desconocidos | No es necesaria si pasa, no garantía si falla | Callback/loader/free defectuosos pueden bloquear | Solo módulo propio sin callbacks/tareas; no descarga de módulos ajenos |

No se espera escritura de boot o particiones desde el payload; **hard brick no
se puede garantizar imposible** ante un bug nativo. Tener el archivo OTA en PC
no proporciona una herramienta de recuperación ni permiso para reflashear.

Recovery conocida: cambio a habitual desde Ajustes funcionó en pruebas Lua,
menús/pulsación larga volvieron a normalidad; reinicio stock documentado por
[Xiaomi](https://www.mi.com/global/support/faq/details/KA-228897/).
No se validó recuperación integral, restauración por cable, SWD/JTAG o reflashing
de2.2.86. Backup disponible: source, paquete, hashes y catálogo/journal; no dump
completo de particiones, datos/sensores o configuración del reloj.

**Condición de parada actual:** el controlador final y la revisión de riesgo
nativo siguen pendientes. No cargar C por este borrador. La regla inicial del
usuario exige revisión antes de código kernel no probado/hardware y recovery
desconocido. No pedir ni hacer un flash, unlock o cambio de verificación.

## Próximo checkpoint

Implementar y validar en PC el controlador de un solo intento, incluida marca
persistente, errores y descarga atribuible. Generar entonces un paquete final
y un plan de comandos/hashes para revisión. No nuevo ensayo físico intermedio.
