# R198 — plan revisado del primer ensayo C físico

**Estado posterior:** usuario autorizó el ensayo; único envío completado y gates
cerrados. [Instalación y observación pendiente](first-c-physical-result-r198.md).
La especificación siguiente conserva el plan revisado; no autoriza repetirlo.

2026-10-13. **NO EJECUTADO; gates cerrados.** Este documento fija el paquete
FirstC y la secuencia propuesta. No reutiliza autorizaciones de NativeInfo/Lua.
Resultados previos y limitaciones: [R194 loader/C](rw4-loader-r194.md),
[R196 controller](controller-r196.md), [R197 backend/paquete](first-c-adapter-r197.md).

## Dispositivo y precondiciones

M2315W1/Redmi Watch4, firmware2.2.86; región desconocida. No aceptar otro modelo
o firmware. Preflight autenticado confirmará identidad/FW y catálogo antes de
escribir. No consulta batería: el usuario debe comprobar ≥50% en el reloj,
menús normales y presencia física antes de autorizar.
Mantener vínculo PC ya existente; no cambiar claves ni volver a emparejar
automáticamente. Phone/Mi Fitness identificados previamente Android16,
HyperOS3.0.302.0/MiFitness3.59.1i; no intervenir sobre ellos para este ensayo.

Sin otros clientes, scripts propios, actualizaciones o cambios de esfera
durante el intento. Si el enlace no está disponible, detener; no usar fallback
Android, reset, otro modelo o firmware modificado para completar el ensayo.

## Artefacto fijo

- ID365219996, nombre FirstC,22.500bytes; sin reemplazar esferas existentes.
- artifacts/first-c-r197/FirstC-id-only.face SHA256
  `bf3bfbd4147ed27527fc7659aac0098472252016725af6ef2750e86cd2f5cbf9`.
- ELF784bytes SHA256
  `8248f76bdabd9c44aee6df46e8ba4d8c999acc9ca1d0c8367e1652ce0675da6d`.
  Su código es movs r0,#0;bx lr. No logging/imports/relocs/threads/drivers/writes.
- Lua materializada SHA256
  `b431f91f31c36fe1fb58a48595a51ee6c5593f5c2d0924c37746988ed3ed7c85`.
- Journal exclusivo tools/local/pc-rfcomm/first-c-r198.json; no existe aún.

La esfera incluye C almacenado, PNGs propios, adaptador y controlador. Abrirla
solo dibuja y lee marca. **La carga requiere que el usuario pulse RUN C una vez.**
No compartir/binarios firmware/WAD en esta operación; no Doom todavía.

## Contexto de privilegios y evidencia

La imagen2.2.86 contiene M2315W1 y el loader inspectado: ELF32 ARM LE ET_REL,
textalloc+e_entry, un argumento modinfo, retorno int y callback opcional/free en
rmmod. El payload entero Thumb de dos instrucciones respeta esos checks; no
usa ABI flotante, APIs o direcciones S3. No se ha cargado en RW4.

FLAT/PROTECTED/KERNEL y privilegio de NSH no establecidos. Llamada directa del
loader sin transición de aislamiento visible: asumir **contexto potencialmente
privilegiado**, con acceso amplio si el código o loader fallasen. No sandbox,
userspace aislado, root/jailbreak o explotación. Esta revisión se pide también
por la regla del usuario para código kernel físico no probado/recovery desconocido.

## Comandos y secuencia tras autorización expresa

Las líneas son especificación del ensayo, **no instrucciones para ejecutar ahora**.
Gates Node/C# se habilitarían temporalmente solo para el único install r197,
con nuevo build/hash registrado y prepare antes; se cerrarían inmediatamente
después. El helper cerrado actual SHA
`3ec38ceabd9c9a15dd86a8d229afd29be13e11637720d34bbd7465a8cf921d97` no permite envío.

| Paso | Acción/comando | Componente/efecto |
|---|---|---|
| PC ya preparado | node tools/pc-static-watchface.mjs prepare r197 | Sin radio: hashes/inputs/pin de paquete y12partes verificados |
| Un envío aprobado | node tools/pc-static-watchface.mjs install r197 | Auth/info/catalogo/identidad; INSTALL4/4,upload22/0tipo16,MASS5. Escribe paquete/catálogo mediante stock, sin SET/autoactivación |
| Inventario independiente | node tools/pc-rfcomm.mjs watchfaces | GET para comprobar propia inactiva/eliminable, anteriores conservadas; gates de escritura ya cerrados |
| Selección manual | Selector→FirstC | Usuario observa FILE/MARK/LOAD/UNLOAD/END grises y botón RUN C, sin shell/carga. Si ENDrojo/amarillo, no pulsar |
| Un único click | RUN C | Secuencia fija de abajo, dentro del directorio de esta esfera |
| Resultado/retorno | Observar cinco filas; Ajustes→Esferas→habitual | Confirmar menús/pulsación larga. No abrir y repetir; marca conserva bloqueo |
| Retirada opcional posterior | node tools/pc-static-watchface.mjs remove r197 | Solo si usuario la decide tras retorno y módulo retirado confirmado; nueva habilitación temporal revisada, solo propia inactiva/eliminable. No borrar archivos/datos generales |

Dentro de Lua, `P` es SCRIPT_PATH validado como absoluto, ASCII sin
traversal/metacaracteres y terminado en /365219996/lua/. No valores del usuario
forman shell source. Comandos exactos ensamblados:

1. `lsmod > Pfirstc-capture-r197.txt`: exigir formato completo y ausencia de
   rw4minr197. Captura acotada, cierre y retirada.
2. Escribir `Pfirstc-attempt-r197.txt` con `RW4-FIRSTC-R197\n`: flush/close,
   readback exacto y presencia independiente. No se borra esa marca.
3. `insmod Pminimal.elf rw4minr197 > Pfirstc-capture-r197.txt`: solo una vez,
   tras comparación de todos los bytes del ELF. No otros módulos o parámetros.
4. `lsmod > Pfirstc-capture-r197.txt`: si llamada de carga retornó normalmente;
   exigir registro propio. Exitstatus por sí solo no prueba éxito.
5. `rmmod rw4minr197 > Pfirstc-capture-r197.txt`: solo tras ausencia previa,
   presencia posterior y carga retornada; ninguna tarea/callback propio activo.
6. `lsmod > Pfirstc-capture-r197.txt`: confirmar ausencia para ENDverde.

Son hasta cinco comandos shell, sin retry. Una excepción/resultado incierto
puede reducir esa secuencia; no rmmod ciego. Falta de formato, captura o permisos
antes de insmod aborta sin C. No llamadas loadlib, exec, iwasm, flash, sync global,
particiones o drivers. No existe timeout duro para os.execute: pcall no corta
deadlocks o un panic nativo. Si se bloquea, no hacer acciones remotas adicionales.

## Persistencia, reversión y peor fallo

| Aspecto | Evaluación |
|---|---|
| Escribe almacenamiento persistente | Sí: paquete/selección/catálogo, marca de intento y capturas propias. No asumir RAM-only para esos archivos |
| Residencia C | Loader asigna RAM; candidato retorna y rmmod la retira en ruta exitosa. Archivo ELF sigue almacenado con la esfera |
| Reversible por reboot | RAM se pierde; archivos/selección/marca no. Reboot no garantiza salir de un fallo de la UI/FS |
| Particiones crudas/bootloader/recovery | Ningún comando dirigido a ellos; internals del servicio/filesystem stock no están completamente documentados |
| Firmware modificado | No |
| Peor fallo razonable | Registro incompleto, error filesystem, módulo residual, bloqueo/panic/reboot o corrupción de memoria por loader/ABI/defecto nativo |
| Soft brick | Posible si impide navegar o queda un estado persistente problemático; no descartado |
| Hard brick | No esperado por instrucciones previstas; no se garantiza imposible ante bugs nativos/sistema |
| Salida de juego | No es juego: init retorna inmediatamente, sin tasks/callbacks. Retorno a esfera habitual sigue siendo manual |
| Recovery conocido | Ajustes→Esferas funcionó en ensayos Lua; reboot stock documentado. No recuperación integral/reflashing validado para2.2.86 |
| Backup | Source/paquete/hashes/journal/catalogo; no dump completo del reloj. OTA adquirida como datos no demuestra recovery |

Marca: write/flush/close/readback no prueban durabilidad ante powerloss o creación
exclusiva entre VMs concurrentes. La protección adicional es **no autoejecutar C
al abrir/reboot**. Un único actor/click es requisito del ensayo, no un sandbox.

## Validación y límite de autorización

24 escenarios del core y29 del adaptador pasaron en Lua5.4 S3, con executor
simulado; filesystem tmpfs real en el segundo. Campos/bytes empaquetados exactos,
gates físicos y sesiones/transferencias offline comprobados. Ningún ELF RW4
ejecutado; render y toque LVGL específicos FirstC no validados aún, ni ABI
completo, aislamiento o recuperación física. Un resultado visual por sí solo
no demuestra retirada; ENDverde depende de inventario final reconocido.

**Detener antes del envío y pedir revisión/observación presencial.** Rechazo,
error nativo o resultado incierto: no segundo intento, reboot/reset, cambio de
vínculo, edición de ID o reemplazo de firmware sin revisión nueva. Si la UI no
funciona, volver por Ajustes sin activar mediante PC. Carga futura de Doom o un
payload con APIs/threads no está cubierta por esta autorización.
