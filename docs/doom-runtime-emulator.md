# R65: recursos y salida del motor

2026-10-04. **Ocho ciclos del runtime propio pasan en el emulador. El motor Doom compila con esa capa, pero todavía no se ejecutó.** Ningún acceso al reloj físico, reset, instalación o cambio de watchface en este checkpoint. Se conservaron las pruebas R58/R62/R63; no se repitieron.

## Contrato y alcance

[runtime.c](../doom/platform-rw4/runtime.c) y [runtime.h](../doom/platform-rw4/runtime.h) interponen las operaciones de recursos del motor. Solo un worker puede llamar estas funciones, dentro de `rw4_runtime_run`. Estado no atómico y snapshots pertenecen a ese worker; el caller puede observarlos después de join. `request_stop` es atómico, pero la prueba R65 lo solicita desde el propio worker. Integrarlo con el STOP externo del launcher sigue pendiente; una solicitud anterior al inicio se borra al comenzar el run.

- Hasta 128 reservas simultáneas, 8 streams y presupuesto configurable de payload de hasta 8 MiB. No incluye overhead del heap, buffers de libc, código, BSS ni stack. OOM, overflow de calloc y free de un puntero ajeno regresan a la limpieza mediante un salto local. Realloc exige presupuesto para la reserva antigua y la nueva durante la copia.
- `FILE` propio envuelve un puntero opaco del guest. No se interpreta ninguna estructura Newlib. Solo permite leer la ruta exacta declarada para el run; otros archivos y modos de escritura se rechazan. `fwrite`, mkdir, remove y rename no llaman operaciones de escritura del guest; system tampoco invoca un shell.
- stdout/stderr propios son tokens de logging, nunca FILE del guest. El log formateado se limita a 511 caracteres por llamada. `fflush` es un noop válido para logs y streams de lectura. Seek llama clearerr: la particularidad del EOF de este guest ya se documentó en R58.
- Salida normal, quit, fatal, stop y error de recursos llegan al mismo cierre de streams y liberación de reservas. No se llama al exit del sistema ni a callbacks de salida upstream. Un error de fclose mantiene el runtime bloqueado. El módulo de prueba retiene código si falla join o cleanup; no se descarga a ciegas.

**FLAT, sin sandbox:** estas restricciones controlan llamadas de nuestro port, no aíslan memoria ni convierten un módulo en userspace protegido. Acceso fuera de límites, corrupción de memoria o una llamada ajena al owner/run no quedan recuperados; esa última violación del contrato activa un trap. No usar estos binarios en M2315W1.

Los streams no tienen generaciones: cerrar, reabrir y usar un handle antiguo que coincide con un slot reutilizado no está protegido. No se promete concurrencia sobre FILE. Cada sesión del motor deberá descargar y recargar el módulo después de retirar worker, lectores y callbacks: liberar memoria no reinicializa sus globals.

## ABI inspeccionada

Guest exacto SHA256 `849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa`; Watch S3/NuttX, Cortex-A7 Thumb EABI5 hardfloat. No es la ABI del RW4 físico.

| Función nueva | Dirección Thumb | Evidencia |
|---|---|---|
| malloc / free | 0x61bd35 / 0x61bd1d | Desensamblado: mismo heap de usuario, size/puntero en r0; malloc asigna errno ENOMEM |
| vsnprintf | 0x65f3ed | Destino/size/formato/va_list en r0-r3; wrapper de stream de memoria |
| setjmp / longjmp | 0xfa04c9 / 0xfa04df | Guarda/restaura r4-r11, SP, LR, s16-s31 y FPSCR |

El jump state ocupa 108 bytes según las instrucciones inspeccionadas; almacenamiento opaco propio de 112 bytes por alineación de 8. No se usa el jmp_buf de Newlib ni builtins GCC. Se declara returns_twice/noreturn, el frame permanece vivo y solo se salta en el mismo worker, después de retornar de llamadas de libc. Longjmp recibe siempre 1; el código de motivo se guarda aparte. [GCC documenta diferencias entre builtins y las funciones estándar](https://gcc.gnu.org/onlinedocs/gcc/Nonlocal-Gotos.html).

Stdio opaco/errno proceden de R58 y pthread/create/join de R59. La prueba permite exactamente 18 imports ligados al ELF guest fijado; ninguno escribe archivos ni controla drivers. Desensamblados locales en `artifacts/package-review/runtime/`; revisión ELF en `build/native-runtime/`.

## Resultado reproducible

```powershell
node tools/build-runtime.mjs
node tools/run-runtime-emulator.mjs
node tools/build-doom-audit.mjs shim
# Reanalizar ese objeto, sin recompilar ni operar sobre el guest:
node tools/build-doom-audit.mjs inspect-shim
```

El runner solo acepta el QEMU revisado por loopback `emulator-5554`, servidor 5039; verifica ownership, guest, ADB, fuentes/ELF y readback. No admite targets arbitrarios ni USB. Crea únicamente su fixture de siete bytes y ELF en `/tmp` tmpfs. Un timeout del cliente no detiene C: falta de completion/join exige inspección antes de descargar.

Prueba única final: `artifacts/emulator/native-runtime-1791136344622/result.json`, passed=true, worker **139**, join=0/cookie34650008/done1/failed0.

| Ciclo | Resultado esperado | Observado |
|---|---|---|
| 0 | Body retorna | reason0/code0 |
| 1 | Quit desde llamada anidada | reason2/code0 |
| 2 | Exit con error | reason3/code7 |
| 3 | Stop cooperativo | reason1/code0 |
| 4 | Producto calloc desborda | reason4/code12 |
| 5 | Free de puntero no registrado | reason5/code22 |
| 6 | Reserva excede presupuesto | reason4/code12 |
| 7 | Close y free explícitos; doble close rechazado | reason0/code0, EBADF |

Cada ciclo: 3 reservas/3 liberaciones, 1 apertura/1 cierre, 7 operaciones denegadas, cero bloques/bytes/streams propios al final y pico contabilizado **137 bytes**, con presupuesto4096. Calloc zero, prefijo de realloc, strdup y formato variádico `ok 23 ab 1.5` pasaron. Ese pico es del fixture pequeño, no de Doom. Fatal aquí significa rw4_exit(7), no un I_Error del motor ejecutado.

Fixture intacto; worker ausente en ps, `rw4runtime` descargado y ambos temporales retirados. Shell operativo, sin reset. Umem usado18009968→18010544 (+576); maxused25328004 constante, nused/nfree500/55 y GImageCache iguales. Dos muestras no demuestran ausencia de fugas ni explican el delta. UI activa/panel/foco no se validaron de nuevo.

| Pin | Valor |
|---|---|
| Fuentes probe+runtime.c+runtime.h+module.ld normalizadas LF, separadas con LF | e7c908f177034c26037640a099db79ee14ac309f38e7d65fdccc71622dbc7840 |
| ELF propio de prueba | 9668 bytes, entry0x445, 168 ABS32, BSS1268 |
| SHA256 ELF | 6fe5f39f45e9dcc7ffe28d97d51acd083a1a1806ba751be41218dadde529887a |

Antes de esta ejecución, Werror detectó tres statements de indentación ambigua, corregidos. El primer ELF de dos unidades contenía THM_CALL y fue rechazado antes de cargar. `-ffunction-sections` produjo llamadas largas; [module.ld](../doom/platform-rw4/module.ld) las une de nuevo en una sola .text para el entry del loader. Ninguno de esos candidatos se ejecutó en el guest.

## Motor con la capa nueva

Los mismos 80 C de doomgeneric fijado en R64, más runtime.c, compilan sin sonido/X11. Headers propios stdio, ASCII ctype y sys/stat mínimo eliminan `_impure_ptr`/`_ctype_` y evitan asumir FILE/mode_t privados. Sys/stat solo declara el contrato propio de mkdir denegado, no una estructura stat.

Upstream permanece intacto. Se genera en `build/doom-shim-audit/i_system.c` un overlay con dos cambios de plataforma: I_Quit llama rw4_exit(0); I_Error entrega sus varargs a rw4_error. No se alteran renderer, gameplay, mapas, colisiones ni IA. No se ejecutan callbacks upstream que podrían guardar archivos. Saves/config writes quedan deshabilitados en este milestone.

Objeto parcial **435288 bytes**, SHA256 `0281a7dc95222408d41c3eb05cc83ae4531b899b104995bfb7537f0484bd4f3b`. Se eliminaron imports directos exit/system/mkdir/remove/rename/fwrite/fflush/calloc/realloc/strdup/abs y datos privados de libc; malloc/free/stdio/printf continúan como imports internos del shim.

Quedan **39 imports sin enlazar**: 16 contratos usados por el shim probado, 17 funciones de strings/conversión/math/AEABI/logging por revisar y 6 DG por implementar. Que el nombre exista en guest no aprueba su ABI. El objeto no tiene entry de módulo, mantiene415COMMON, no liga guest addresses y **no es cargable**. Límite de salida, stack, estado y presupuesto del motor completo siguen pendientes.

111 warnings conservados en build-log. El menor conteo no demuestra que se hayan corregido los avisos R64: los wrappers todavía no tienen atributos GCC de comprobación printf; los formatos permanecen por revisar. El primer build con headers propios detectó mode_t distinto de Newlib en mkdir; el header mínimo propio resolvió el conflicto. Build final y análisis inspect-shim pasan. Estática530141bytes antes de alineación/COMMON; sigue sumándose zone6MiB y DG256000 antes de extras. Frame individual máximo del shim536bytes, no profundidad de stack ni pico de RAM.

**Siguiente checkpoint:** completar bindings revisados y adaptadores DG para obtener el primer frame real de Doom en el emulador, con ejecución acotada y limpieza. El gate del hardware sigue cerrado.
