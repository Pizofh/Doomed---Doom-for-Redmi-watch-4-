# R210 — candidato de logging C, compilado solamente en PC

2026-10-13. [R207–R209](rw4-lua-bridge-r209.md) identifica una ruta candidata
para escribir en stdout a partir del caller print stock y tres callees.
Sin módulo ejecutado, paquete instalado, teléfono/BT/reloj consultado.
No reutiliza ABI/direcciones del emulador S3 y no modifica firmware.

## Artefacto

Fuente propia [log-r210.c](../experiments/hello-native-rw4/log-r210.c),
linker [log-r210.ld](../experiments/hello-native-rw4/log-r210.ld), build
[build-rw4-log-r210.mjs](../tools/build-rw4-log-r210.mjs).

```powershell
node tools/build-rw4-log-r210.mjs
```

Requiere las dependencias locales verificadas de R194/R193; no descarga nada.
Rechaza sobrescribir el build. Genera header privado de metadatos desde la
imagen fijada, no un header oficial ni copia de código firmware.
Toolchain Arm14.3 comprobada por hashes, compilación freestanding ARMv8-M Thumb
entera/soft, sin newlib/startup ni syscalls inventadas. -Wall/-Wextra/-Werror.

Resultado privado `build/hello-native-rw4/r210-final/log.elf`:

| Propiedad | Resultado |
|---|---|
| ELF | ARM32 LE ET_REL/EABI5, entry1, función entry al comienzo |
| Tamaño | 1.120 bytes |
| SHA256 | cbfcae4a6fb3b0d9cae9389b8f99d774cd8df8af40b0170c144ebb0b41b2157e |
| Asignación ejecutable | Una sección,226bytes incluyendo literales/mensaje, alineación8 |
| Imports por nombre | Cero; **sí usa tres APIs mediante direcciones fijas** |
| Relocaciones | Una R_ARM_ABS32 interna para el mensaje |
| Estado mutable propio | Sin secciones writable no vacías, heap o tareas |
| Ejecución | No ejecutado en emulador ni RW4 |

Fuente SHA256 `e7a27a884b97ea545ac1eb925cb605d698ffa9f677d8988d2fafed36a687f965`,
linker `47fe3c49bcd917d718de28058dddce9e37fc333327ae8b9a97d5016b9d5fd2ab`.
readelf/disassembly/review/build-log están en el mismo directorio privado.

Primer build fue rechazado: GCC dejó tres R_ARM_THM_CALL al helper propio,
que el contrato de este candidato no admite. No se relajó el check a nuevas
relocaciones: helper always_inline y build final separado dejan solo ABS32.
Build rechazado conservado como datos en build/hello-native-rw4/r210; no ejecutar.
Disassembly final revisado: tres bucles acotados, tres BLX a bindings fijos,
push/pop con16bytes de stack propio, retorno0 o negativo, sin instrucciones FPU.
Stack profundo de las APIs no medido. No hubo test dinámico de las llamadas.

## Qué intentaría hacer

1. Leer64bytes de código de cada rutina y comparar FNV-1a32 con la imagen.
2. Si coinciden, obtener base de streams del contexto actual y stdout en +128.
3. Escribir exactamente17bytes: `RW4_C_HELLO_R210` más newline; flush individual.
4. Retornar0 si writer devolvió17 y flush0; -8 por mismatch, -22 por base NULL,
   -5 por escritura/flush no satisfechos. Sin tareas o callback propio de retiro.

Bindings Thumb candidatos: stream-base `0x0c2bcba5`, writer `0x0c2ec4e5`,
flush `0x0c2ec609`. Son específicos de la imagen candidata2.2.86. FNV sobre
64bytes es un control de mismatch, **no autenticación criptográfica, prueba de
ABI, sandbox, permiso de lectura o recovery**. El código puede fallar antes
de poder rechazar si una dirección no es legible. Getter stock puede assert
si no existe group; write/flush pueden bloquear o escribir en el destino que
corresponda a stdout. No hay timeout duro nativo.

No abrirá directamente archivos, drivers, particiones o boot; cualquier captura
de stdout tendría que hacerse con redirección controlada del shell hacia un
archivo propio. Ese contexto/redirección todavía debe prepararse y validarse.
No afirmar que ausencia de fopen en nuestro C equivale a cero writes.

## Gates pendientes y siguiente checkpoint

**No autorizado para desplegar.** No carrier/watchface nuevo, perfil físico,
ID, journal, instalador ni plan de ejecución final creados para este candidato.
No ponerlo en FirstC2 ni borrar su marca; su ensayo ya terminó.

Antes de hardware: preparar launcher con captura limitada del mensaje y cleanup,
incluyendo rechazo del initializer y ausencia de registro (no unload ciego).
Validar esa orquestación en PC/emulador con backend simulado; no ejecutar estas
direcciones ARMv8-M en S3. Fijar paquete/hash/comandos/write-set/rollback/riesgos,
compatibilidad y recuperación conocida y solicitar revisión concreta del usuario.
Se mantiene modelo de privilegios desconocido/potencialmente amplio y sin
recuperación integral de firmware validada. No flashear para resolver este paso.

**Siguiente meta única:** preparar el carrier que permita observar un mensaje
real de C y retirar el módulo, dejando el envío físico cerrado para revisión.
