# R203 — plan FirstC2 pendiente de autorización

2026-10-13. **NO EJECUTADO, gates cerrados.** [Preparación y validación R202](first-c-corrected-r202.md).
La autorización R198 se utilizó para FirstC; esta prueba cambia ID/hash/código
Lua y requiere revisión nueva según la regla física inicial del usuario.

## Dispositivo, estado y backup

Solo Redmi Watch4 M2315W1/firmware2.2.86, región aún desconocida. Preflight
autenticado exige modelo reconocido/FW y catálogo; no consulta batería.
Usuario presente junto al reloj, batería≥50% y esfera/menús/cambio normales.
Phone habitual Android16/HyperOS3.0.302.0/MiFitness3.59.1i: no intervenir.
Usar vínculo PC existente; ningún reset, revinculación o cambio de clave automático.

Primer FirstC sigue almacenado; su estado C no confirmado. No abrirlo otra vez,
borrar su marca/paquete o descargar su módulo desde PC. Sin otros clientes,
scripts, actualizaciones o cambios de esfera durante el ensayo. La detección
de rw4minr197 aborta; no se acepta como una autorización de retirarlo.

Backup disponible: fuentes, paquetes propios/hashes, journal y catálogo previo
registrados por el instalador. No dump completo físico ni backup de particiones.
Restaurar/cambiar una esfera no equivale a restaurar firmware. OTA2.2.86 adquirida
como datos no es un mecanismo de recovery validado.

## Paquete fijo y privilegios

- FirstC2 ID365219998,24.736bytes, nuevo registro sin reemplazar otras esferas.
- artifacts/first-c-r202/FirstC2-id-only.face SHA256
  `7229a104de8cc8031ab3e689e0b11564b371aa55a7d2c3182a28d3d3710e4e67`.
- Lua materializada SHA256
  `1ef5835d1c9c2d062acf13190a398ba97af1a9d3e82cc3e0788d6e70a801b40f`.
- ELF784bytes sin cambios, SHA256
  `8248f76bdabd9c44aee6df46e8ba4d8c999acc9ca1d0c8367e1652ce0675da6d`.
  Código Thumb: movs r0,#0; bx lr. Sin imports/relocs/logging/tareas/callbacks/drivers.
- Journal propio tools/local/pc-rfcomm/first-c-r203.json, aún ausente.

La inspección de la imagen M2315W1/2.2.86 identifica checks ELF32 ARM LE ET_REL,
textalloc+e_entry, argumento modinfo y retorno int; [evidencia R194](rw4-loader-r194.md).
No arquitectura/ABI/direcciones S3 reutilizados. Candidato aún no probado en RW4.
Config FLAT/PROTECTED/KERNEL y privilegios NSH exactos desconocidos: tratar la
carga como **potencialmente privilegiada, sin sandbox**. No escalación/exploit.

## Comandos tras autorización expresa

Las líneas especifican el ensayo; no ejecutar ahora. Gates Node/C# se habilitan
temporalmente solo para r202, con rebuild/hash registrado y prepare; se cierran
inmediatamente después del único envío. Helper cerrado actual SHA256
`dcb923c4f3fefdf9756c22401b211a6be286306b39919c84a76673d86538c617`.

| Paso | Comando/acción | Componente y efecto |
|---|---|---|
| Prepare ya realizado | node tools/pc-static-watchface.mjs prepare r202 | PC solo, hashes/build/13partes comprobados |
| Un envío aprobado | node tools/pc-static-watchface.mjs install r202 | Auth/info/catalogo; INSTALL4/4,upload22/0tipo16,MASS5. Paquete/catálogo stock persistentes; sin SET/autoactivación |
| Inventario independiente | node tools/pc-rfcomm.mjs watchfaces | GET con gates ya cerrados: propia inactiva/eliminable, registros/selección anteriores conservados |
| Selección del usuario | Selector→FirstC2 | Preview de cinco barras blancas; nombre distinto de FirstC. Mostrar FILE/MARK/LOAD/UNLOAD/END y RUN C; no C al abrir |
| Un click manual | RUN C, solo con las cinco filas grises | Marca y secuencia fija siguiente; no pulsar si END ya rojo o UI falla |
| Resultado/salida | Observar cinco filas; Ajustes→Esferas→habitual | Informar colores y comprobar menús/pulsación larga; no repetir/reabrir |
| Retirada opcional | node tools/pc-static-watchface.mjs remove r202 | Solo si usuario decide después de retorno y retirada de módulo confirmada, habilitación temporal específica; exclusivamente FirstC2 inactiva/eliminable |

`P` es SCRIPT_PATH absoluto ASCII validado y normalizado, terminado en
/365219998/lua/. Ninguna entrada de usuario forma shell source. Primero se
compara todo el ELF; luego:

1. `lsmod > Pfirstc-capture-r202.txt`: captura nueva≤8192bytes, cierre/retirada,
   formato completo. Exigir ausencia de rw4minr202 **y rw4minr197**.
2. Escribir `Pfirstc-attempt-r202.txt` con `RW4-FIRSTC-R202\n`, flush/close y
   readback exacto/presencia independiente. Marca nunca borrada por la esfera.
3. `insmod Pminimal.elf rw4minr202 > Pfirstc-capture-r202.txt`, solo una vez.
4. `lsmod > Pfirstc-capture-r202.txt`: exigir registro del nuevo, sin el anterior.
5. `rmmod rw4minr202 > Pfirstc-capture-r202.txt`, solo tras atribución propia.
6. `lsmod > Pfirstc-capture-r202.txt`: ausencia propia y del anterior para END verde.

Hasta cinco comandos shell. Retorno/exitstatus no equivale a registro/retirada.
Cualquier dato incierto, captura ajena/preexistente, fallo FS o módulo anterior
detiene el ensayo, sin retry o unload ciego. Abrir la esfera solo dibuja/lee marca.
No load/loadfile/dofile/loadlib, WASM, nuevo proceso, firmware/boot/particiones.

## Persistencia, fallos y recuperación

| Gate | Evaluación |
|---|---|
| Escribe flash/filesystem | Sí: paquete/catálogo/selección, marca y capturas propias; servicio stock |
| C en RAM | Loader asigna; init retorna; rmmod libera en ruta exitosa. Archivo ELF sigue almacenado |
| Reversible por reboot | RAM se pierde; almacenamiento/selección/marca permanecen. No garantía de recuperación por reboot |
| Escribe particiones crudas | Ningún comando dirigido a ello; internals del servicio stock no plenamente documentados |
| Bootloader/recovery/firmware modificado | No |
| Peor fallo razonable | Error/registro incompleto, módulo residual, bloqueo/panic/reboot o corrupción de memoria por loader/ABI/defecto nativo |
| Soft brick | Posible si UI/FS quedan en estado persistente problemático; no descartado |
| Hard brick | No esperado por código previsto, sin garantía frente a fallos del loader/sistema |
| Recovery conocido | Retorno por Ajustes funcionó en ensayos físicos; reinicio stock documentado. No recovery/reflashing integral validado para2.2.86 |

pcall no corta deadlocks/panics; no timeout duro de os.execute. Marca flush/readback
no garantiza fsync/powerloss ni atomicidad multivm. Protección adicional: carga
solo manual, nunca al abrir/reboot. Mantener actor único, sin tocar FirstC anterior.
Si falla UI, volver por Ajustes si responde; no activar C desde PC para sortearla.
Ante bloqueo, no nuevas acciones remotas, firmware/reset/unload a ciegas.

## Validación y stop conditions

38 casos del nuevo adapter/main con tmpfs real y executor/widgets simulados;
UI factory real R200 y normalizador16casos R201 sin cambios; ELF idéntico, cuatro
records íntegros. Gates cerrados, transferencia12casos y sesión30casos offline
para r202. **No C ejecutado en S3 o RW4, ni UI completa FirstC2 física validada.**

La recuperación integral y el contexto privilegiado pendientes son riesgos que
requieren revisión expresa. Rechazo o resultado incierto: no segundo envío,
otro ID, borrado de esferas, carga adicional, reboot/reset o fallback sin revisión.
Un éxito no autoriza Doom, logging/imports/APIs/tareas o un payload más complejo.
