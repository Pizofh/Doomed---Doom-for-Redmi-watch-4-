# R197 — adaptador y paquete FirstC preparados solo en PC

2026-10-13. Se completó el adaptador shell/filesystem y la UI de activación
manual del [controlador R196](controller-r196.md). No código C ejecutado ni
nuevas operaciones físicas. La revisión para hardware está en [R198](first-c-physical-plan-r198.md).

## Adaptador real, executor simulado en pruebas

shell-adapter.lua acepta únicamente el SCRIPT_PATH absoluto del ID365219996,
sin espacios, traversal/metacaracteres o doble slash; termina en /365219996/lua/.
Si el runtime físico usa otra estructura, se detiene sin cargar C.
Lee minimal.elf como datos (máximo785bytes) y compara sus784bytes completos.
Un fichero existente, vacío o parcial de intento bloquea nuevas cargas; un
error de lectura sin ENOENT2 es desconocido y también bloquea.

Capturas propias: firstc-capture-r197.txt. Se exige ausencia verificable antes
del comando, lectura≤8193bytes, límite8192 y cierre/retirada. Nunca se retira una
captura preexistente o ilegible. Los tres únicos comandos, con argumentos fijos
y directorio validado, son lsmod, insmod minimal.elf rw4minr197 y rmmod rw4minr197.
El resultado de os.execute no se usa por sí solo como prueba de carga.

El parser exige cabecera NAME/INIT/UNINIT/ARG/NEXPORTS/TEXT/SIZE/DATA/SIZE,
fila completa de nueve campos y formato numérico; máximo64filas. Detecta nombre
exacto y rechaza duplicados del objetivo, mensajes ajenos, truncación y output
sin terminador. Referencia de formato: [NuttX apps12.3.0 nsh_modcmds.c](https://github.com/apache/nuttx-apps/blob/nuttx-12.3.0/nshlib/nsh_modcmds.c),
no versión exacta Xiaomi. La cabecera vacía se observó realmente en S3; lectura
física del formato sigue pendiente y una discrepancia abortará antes de C.

Marca firstc-attempt-r197.txt: contenido RW4-FIRSTC-R197 más newline; write,
flush, close y readback exacto. El controlador vuelve a consultar presencia
antes de insmod. **Flush/readback no prueban fsync o durabilidad ante powerloss;
check+wb tampoco es una operación exclusiva entre VMs concurrentes.** El ensayo
asume un único actor, una única UI y ausencia de otros scripts/operaciones del
proyecto. No borra la marca ni se rearma por selección/reinicio.

## UI manual

Abrir FirstC no consulta lsmod, escribe marca o carga C. Solo dibuja cinco filas
PNG propias y RUN C; lee la marca. El botón queda deshabilitado si existe marca
o no puede establecerse ausencia. Pulsarlo se consume antes de cualquier backend.
No timers, handler al abrir, carga automática o callbacks retenidos por el C.
Las funciones load/adapter se inicializan bajo pcall: si faltan, SetupStopped y
END rojo, sin comandos. Texto en bitmaps propios; no dependencia de LVGL Font.

Filas FILE/MARK/LOAD/UNLOAD/END: verde significa respectivo check completado;
END solo verde para Complete. Amarillo al abrir indica intento previo/estado
desconocido; no demuestra un módulo activo. No se imprimen rutas, inventarios,
direcciones, claves o errores crudos en logs propios.

## Validación

`node tools/test-rw4-adapter.mjs` ejecutó las fuentes de producción materializadas
en Lua5.4 S3 con **I/O real en un árbol tmpfs propio**; executor y widgets fueron
simulados. Pasaron29 escenarios de parser, archivos, escritura/readback/cierre,
limpieza de captura, comando incierto, activación manual y reentrada. ELF copiado
solo como fixture de datos; ninguna llamada real a insmod/rmmod. lsmod real
antes/después idéntico, árbol temporal retirado y ausencia verificada.

Reporte final artifacts/emulator/adapter-r197-v3/summary.json. Un test negativo
del harness falló inicialmente al representar una función ausente con un falso
en una expresión and/or; se corrigió a nil explícito. Los archivos de esa prueba
fallida se retiraron tras comprobar propiedad/readback e inventario sin cambios.
No se debilitó la condición del controlador. No repetir tests ya pasados sin cambios.

**No se validó render ni toque con widgets LVGL reales en esta revisión.**
onClicked se usa en nuestros ejemplos S3 anteriores; PNG/Object se demostraron
físicamente, pero la UI/entrada específica FirstC aún debe observarse. Una UI que
no registre el toque no cargará C; no habrá activación remota para sortearla.

`node tools/package-first-c.mjs` comprobó hashes y reporte de tests antes de
usar el compiler EasyFace revisado (sin ADB). Verificó los cuatro registros
serializados completos y produjo FirstC22.500bytes. ELF784bytes sin cambios.
Native code enabled in package solo después del click; physical transfer false.
Reporte privado artifacts/first-c-r197/review.json; no firmware propietario/assets
comerciales. Fuentes propias, PNG procedurales y ELF propio ignorado por Git.

Perfil r197 añadido **cerrado**. Rebuild `node tools/pc-rfcomm.mjs build` conserva
gates false; `prepare r197` pasa hashes/metadata y doce partes. Tests de gates,
transferencia y sesión IPC pasan sin sockets. Para r197 específicamente:
`node tools/test-static-watchface-transfer.mjs r197` pasó12 escenarios y
`node tools/test-static-watchface-session.mjs r197` pasó29 escenarios, incluyendo
journal/retirada simulada; ninguna transferencia física. No se ejecutó install/remove.

| Identidad | SHA256 |
|---|---|
| Paquete FirstC ID365219996 | bf3bfbd4147ed27527fc7659aac0098472252016725af6ef2750e86cd2f5cbf9 |
| Lua materializada | b431f91f31c36fe1fb58a48595a51ee6c5593f5c2d0924c37746988ed3ed7c85 |
| Adapter source | 77bc63e1adff0b337c8dac41c12f3647a60eb1a01108eca4a2fab246d04eee2a |
| C ELF | 8248f76bdabd9c44aee6df46e8ba4d8c999acc9ca1d0c8367e1652ce0675da6d |
| Helper PC cerrado | 3ec38ceabd9c9a15dd86a8d229afd29be13e11637720d34bbd7465a8cf921d97 |

El ensayo futuro comprobaría inicializador/registro/retirada, **no imprimiría
hello ni demostraría Doom, APIs libc/display, privilegios aislados o recovery**.
