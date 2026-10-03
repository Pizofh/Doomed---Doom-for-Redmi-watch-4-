# Matriz de evidencia

Actualizada 2026-10-03. Referencias Rxx: [research.md](research.md#fuentes-consultadas). `CONFIRMADO` puede significar evidencia documental específica del dispositivo, nunca prueba de nuestra unidad sin resultado local. Hay inspección estática, boot, ADB, inventario y validación visual/táctil de TouchEvents empaquetado en emulador S3. No hay pruebas del reloj físico. Filas CLI anteriores describen pruebas históricas; no el resultado posterior con launcher watchface.

Estados: **CONFIRMADO EN RW4**, **CONFIRMADO EN EMULADOR**, **CONFIRMADO SOLO EN OTRO XIAOMI**, **INFERENCIA RAZONABLE**, **SIN EVIDENCIA**, **REFUTADO**. Las capacidades genéricas upstream se indican aparte y no se transforman en compatibilidad RW4.

## Hechos de base

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Modelo físico indicado: M2315W1 | Unidad del usuario | Identificación comunicada por usuario | SIN EVIDENCIA independiente | Alta como dato recibido | No | Región/firmware desconocidos |
| AMOLED 1.97, 390×450, hasta 60 Hz | RW4 | R01/R02 | CONFIRMADO EN RW4 | Alta documental | No | No equivale a FPS DOOM |
| Corona, GNSS, altavoz, micrófono, sensores | RW4 | R01/R03 | CONFIRMADO EN RW4 | Alta documental | No | Acceso desde nuestras apps sin probar |
| BES2700iBP | Unidad RW4 del teardown | R05/R06 | CONFIRMADO EN RW4 | Alta en unidad desmontada | No | No fingerprint de nuestro M2315W1 |
| STAR-MC1, SRAM 2.2 MB, PSRAM/Flash SiP | SoC BES2700iBP | R06 | INFERENCIA RAZONABLE para RW4 | Alta en SoC, media en reparto RW4 | No | No ABI/memory map ni RAM libre |
| DS35M2GB-IB SPI NAND y marcaje touch 8918BC | RW4 desmontado | R05 | CONFIRMADO EN RW4 | Media/alta documental | No | Variación de placa/región pendiente |
| Hay ejemplos Lua/watchfaces para RW4 | RW4 | R07/R08/R09 | CONFIRMADO EN RW4 | Alta para existencia de fuente | Estático remoto | Runtime de firmware específico pendiente |
| TouchEvents referencia LVGL/touch | RW4 ejemplo | R09 | CONFIRMADO EN RW4 | Alta para fuente, media para ejecución | Estático remoto | `get_point` posición; `get_vect` delta |
| NuttX/LVGL sustentan la familia RW4 | Familia RW4 | R07 | INFERENCIA RAZONABLE | Media/alta, mantenedor | No | Falta identificación/config real |
| Emulador ofrece preset RW4 | MiWatchEmulator | R12/R13 | CONFIRMADO EN EMULADOR | Alta documental | No | No emulación exacta BES/ABI |
| Emulador deriva de entorno S3 | MiWatchEmulator | R10 | CONFIRMADO EN EMULADOR | Alta documental | No | Límites explícitos |
| ADB/shell/rutas watchface | Emulador S3 | R13/R31/R33 | CONFIRMADO EN EMULADOR | Alta local | Inventario por emulator-5554 | Servidor dedicado 5039; ninguna selección USB |
| `.rpk` distribuye apps JS | Vela general | R14/R15/R16 | INFERENCIA RAZONABLE como ruta a investigar | Alta general, baja RW4 | No | RPK no es ELF |
| Flujo oficial de debug físico documentado | Watch S4 | R20 | CONFIRMADO SOLO EN OTRO XIAOMI | Alta | No | Partners/firmware especificado |
| API files/buffers/exit | Vela JS general | R17/R18/R19 | INFERENCIA RAZONABLE como candidato | Alta general, sin prueba RW4 | No | No shell/carga C demostrados |
| doomgeneric usa 640×400 por defecto | Motor PC/upstream | R25 | REFUTADO: 320×200 como default | Alta por código | Estático remoto | 320×200 sigue siendo propuesta válida |
| Existe release comunitaria verificable por metadata | MiWatchEmulator v1.0 | R12/R31 | CONFIRMADO EN EMULADOR | Alta para existencia | ZIP inspeccionado | Hash local registrado; digest del mantenedor ausente |
| 94 EXE/DLL host coinciden con OpenVela | Emulador host Windows | R30/R31/lock | CONFIRMADO EN EMULADOR | Alta para identidad binaria | Hash/tamaño local | No prueba build desde source ni sandbox |
| Guest ELF32 LE ARM, EABI5/hard-float | Imagen nuttx del emulador | R31 encabezado | CONFIRMADO EN EMULADOR | Alta estática | Inspección ELF | No ABI del BES ni contrato completo de módulos |
| Goldfish Cortex-A7 / CONFIG_BUILD_FLAT | Imagen del emulador | R31 macros de depuración | CONFIRMADO EN EMULADOR | Alta estática | ELF/debug strings | No separación de memoria en esta build; RW4 desconocido |
| Lua 5.4 CLI; os.execute/package.loadlib son function | Emulador S3 | R31/R33 | CONFIRMADO EN EMULADOR | Alta local | Consulta de tipos; sin invocación | No prueba shell, watchface runtime ni RW4 |
| ELF / insmod / rmmod / lsmod / dlopen compilados | Imagen del emulador | R31 símbolos/config | CONFIRMADO EN EMULADOR | Alta estática | No carga | No ejecutar módulos para descubrir ABI |
| WAMR / iwasm compilados | Imagen del emulador | R31 símbolos/config | CONFIRMADO EN EMULADOR | Alta estática | No payload | Versión literal WAMR-04-15-2021; imports/límites pendientes |
| Skin RW4 390×450 / 16 bpp / 60 Hz | Perfil del emulador | R31 config/skin | CONFIRMADO EN EMULADOR | Alta estática | No render | Config fuente 512 MB; hardware-qemu viejo 2048 MB; no RAM RW4 |
| NuttX/NSH y Xiaomi Watch S3 | Guest MiWatchEmulator v1.0 | R33 boot/uname -a | CONFIRMADO EN EMULADOR | Alta local | ADB shell | 0.0.0, 9aec7d0ff1, Dec 5 2024; no versión física RW4 |
| Servicio adbd accesible | Guest emulador | R33 | CONFIRMADO EN EMULADOR | Alta local | 16 consultas de inventario | version no soportado aunque status 0; NAT 2512 offline |
| CPU VM Cortex-A15 y 2048 MB asignados | QEMU/launcher | R33 argumentos/runtime log | CONFIRMADO EN EMULADOR | Alta local | Launch/boot | No equivale a heap NuttX ni RAM RW4 |
| Display 390×450 | Guest emulador | R33/R34 | CONFIRMADO EN EMULADOR | Alta local | Screenshot PNG | UI stock almacenamiento; no render TouchEvents |
| insmod/rmmod/lsmod anunciados por NSH | Emulador S3 | R33 help/lsmod | CONFIRMADO EN EMULADOR | Alta local para presencia | lsmod sin módulos | Ninguna carga propia; ABI/exports pendientes |
| exec recibe dirección hexadecimal | Emulador S3 | R33 help -v exec | CONFIRMADO EN EMULADOR | Alta local | Ayuda solamente | No launcher ELF por filename; no invocado |
| iwasm/qjs/aiotjsc/lua en builtins | Emulador S3 | R33 help/ls /bin | CONFIRMADO EN EMULADOR | Alta local para presencia | Inventario | No payload WASM/JS propio ni compatibilidad RW4 |
| /dev/fb0, input0, utouch existen | Emulador S3 | R33 ls /dev | CONFIRMADO EN EMULADOR | Alta local | Listado | Sin apertura de drivers ni display/input propio |
| /data FAT, /tmp TMPFS, ROMFS | Emulador S3 | R33 mount/df | CONFIRMADO EN EMULADOR | Alta local | Inventario | /data 126 MiB, ~112.1 MiB libres; no storage RW4 |
| Umem total 129704956, libre 111706820 bytes | Emulador S3 | R33 free | CONFIRMADO EN EMULADOR | Alta local | Primera muestra | No sumar pools; no presupuesto DOOM/RW4 |
| require lvgl desde Lua CLI | Emulador S3 | R33 TouchEvents | CONFIRMADO EN EMULADOR | Alta local | Script original | Falla después en lvgl.Font; no UI activada |
| TouchEvents original funciona íntegro aquí | Emulador S3, CLI | R33 traceback | REFUTADO en este contexto | Alta local | Error de fuente | Causa y contexto watchface pendientes |
| Variante sin fuente explícita muestra TouchEvents | Emulador S3, CLI | R33 screenshot | REFUTADO en esta prueba | Alta local | CLI sin excepción, screenshot stock | Sin touch validado ni watchface instalada |

## Las 23 hipótesis

| Claim | Device | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| TouchEvents original renderiza y responde al touch | Emulador S3 configurado 390×450 | R40, capturas y log launcher | CONFIRMADO EN EMULADOR | Alta local | Sí, paquete/watchface | Sin modificaciones Lua; get_vect no es posición absoluta |
| Fuente original está necesariamente ausente | Emulador S3 | R40, original renderizado | REFUTADO como afirmación global | Alta local | Sí | Fallo CLI previo no se extrapola al launcher; causa exacta pendiente |
| Cambiar a Storage cierra Lua anterior | Emulador S3 | R40, close lua now + script Storage | CONFIRMADO EN EMULADOR | Alta local | Sí | Sin medición de fugas; no botón de exit del sample |
| Paquete persiste tras reset y vuelve a abrirse sin reinstalar | Emulador S3 | R40, reset/reentrada/touch | CONFIRMADO EN EMULADOR | Alta local | Sí | Persistencia de archivo no residencia continua en RAM; ninguna prueba RW4 |

| Claim | Device | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Mantener TouchEvents vivo en CLI activa su UI | Emulador S3 | R36, captura tras -i | REFUTADO en esta prueba | Alta local | Sí | Pantalla stock; no prueba imposibilidad en contexto watchface |
| Recorrer padres LVGL desde CLI es un probe inocuo | Emulador S3 | R36, cierre QEMU/Bad ram pointer | REFUTADO como supuesto de seguridad | Alta para el fallo; causa exacta desconocida | Sí | Probe retirado; guest relanzado y funcional |
| Script miuiwatch stock expone ui.init y ScreenStateChangedCB | Imagen emulador S3 | R36, lectura ROMFS | CONFIRMADO EN EMULADOR | Alta estática | Sí, sin ejecutar script | No extrapolar contrato a todos los widgets ni RW4 |
| activity.isShown y navigator.finish están expuestos al CLI | Emulador S3 | R36, tipos package.loaded | CONFIRMADO EN EMULADOR | Alta local | Solo introspección | No se probaron llamadas, lifecycle ni RW4 |

Continuación 2026-10-03: lua-api confirmó disp.load_scr/get_scr_act y Timer en emulador, sin invocarlos. MiWatchNativeApps [R35] contiene launcher Lua con os.execute y hello C para Watch S3/Band 10 Pro: evidencia documental **CONFIRMADO SOLO EN OTRO XIAOMI**, sin prueba local ni validación RW4. Direcciones absolutas dependen del firmware. Ninguna clasificación física cambia por estos hallazgos.

| # | Claim | Device | Evidence | Classification | Confidence | Tested locally | Notes / siguiente evidencia necesaria |
|---|---|---|---|---|---|---|---|
| 1 | Lua permite `os.execute()` | RW4 | Ninguna específica; TouchEvents no la llama | SIN EVIDENCIA | No evaluable | No | Ver runtime/config/version; no inferir de Lua estándar |
| 2 | Shell NuttX accesible indirectamente | RW4 | R13 solo emulador | SIN EVIDENCIA | No evaluable | No | Demostrar puente autorizado RW4 |
| 3 | Shell incluye `insmod` | RW4 | R29 upstream | SIN EVIDENCIA | No evaluable | No | `help` de build real, después gate físico |
| 4 | Carga módulos ELF nativos | RW4 | R28 upstream | SIN EVIDENCIA | No evaluable | No | Loader/config/exports/ABI concretos |
| 5 | Módulos persistentes cargables bajo demanda | RW4 | Diseño deseado | SIN EVIDENCIA | No evaluable | No | FS escribible persistente y loader |
| 6 | Existe `rmmod` | RW4 | R29 upstream | SIN EVIDENCIA | No evaluable | No | Compilación/semántica concretas |
| 7 | Existe `lsmod` | RW4 | R29 upstream | SIN EVIDENCIA | No evaluable | No | Inspección específica |
| 8 | Existe `iwasm`/WAMR | RW4 | No runtime específico hallado | SIN EVIDENCIA | No evaluable | No | No confundir WASM web con reloj |
| 9 | ELF userspace sin privilegios kernel | RW4 | R27 posibilidades upstream | SIN EVIDENCIA | No evaluable | No | Build model y servicio de ejecución |
| 10 | C nativo con firmware stock | RW4 | No mecanismo demostrado | SIN EVIDENCIA | No evaluable | No | No root como premisa |
| 11 | Acceso directo a framebuffer | RW4 | R13 emulador | SIN EVIDENCIA | No evaluable | No | Permisos/formato/ownership del driver |
| 12 | `/dev/fb0` existe en firmware real | RW4 | R13 solo emulador | SIN EVIDENCIA | No evaluable | No | Inventario real aún prohibido |
| 13 | LVGL utilizable desde C nativo propio | RW4 | R09 solo binding Lua | SIN EVIDENCIA | No evaluable | No | ABI/símbolos y task/UI ownership |
| 14 | Touch disponible desde C propio | RW4 | R09 solo Lua | SIN EVIDENCIA | No evaluable | No | Routing input y ciclo de vida |
| 15 | C propio lee filesystem | RW4 | No ejecución C | SIN EVIDENCIA | No evaluable | No | libc, mounts, permisos y URI/path |
| 16 | Se guardan partidas/config Doom | RW4 | R17 API Vela general | SIN EVIDENCIA | No evaluable | No | FS nativo escribible/cuotas, no probado |
| 17 | App DOOM persistente en menú normal | RW4 | Objetivo | SIN EVIDENCIA | No evaluable | No | Registro de paquete stock y relaunch |
| 18 | QuickApp lanza componente nativo | RW4 | No API de spawn hallada | SIN EVIDENCIA | No evaluable | No | Capacidad exacta; no inventar puente |
| 19 | Watchface Lua sirve como launcher | RW4 | Touch Lua R09 | INFERENCIA RAZONABLE | Baja | No | Touch da entrada UI; falta spawn/exit probado |
| 20 | DOOM cabe con sistema en RAM | RW4 | RAM comercial R04 | SIN EVIDENCIA | No evaluable | No | Heap libre y peak medidos, no tamaño WAD solamente |
| 21 | 32 MB RAM y 256 MB almacenamiento | RW4 | R04 Xiaomi dice RAM/ROM | CONFIRMADO EN RW4 | Alta documental | No | ROM comercial no storage libre; SRAM/PSRAM pendiente |
| 22 | Global M2315W1 comparte mecanismos chinos | RW4 variantes | No comparación de builds | SIN EVIDENCIA | No evaluable | No | Misma familia no asegura runtime/permisos |
| 23 | Recovery suficientemente seguro | M2315W1 | Ningún procedimiento técnico validado | SIN EVIDENCIA | No evaluable | No | Reinicio/factory reset no recuperan boot/flash corruptos |

## Loader inspeccionado: solo emulador

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| GCC 11.3.1, Cortex-A7, Thumb, hard-float | Imagen guest S3 | R41 strings de compilación | CONFIRMADO EN EMULADOR | Alta estática | Lectura ELF | No toolchain ni ISA del RW4 |
| allsyms contiene puts y 44.839 entradas | Imagen guest S3 | R41 tabla en archivo ELF | CONFIRMADO EN EMULADOR | Alta estática | Lectura acotada | No demuestra binding del loader |
| allsyms resuelve imports de nuestro módulo | Guest S3 | Falta contraste de modlib_getsymtab | SIN EVIDENCIA | No evaluable | No | No cargar para descubrir contrato |
| Init recibe mod_info y rmmod libera módulo | NuttX 12.3 referencia | R42 fuente original | INFERENCIA RAZONABLE para guest | Media | Estático remoto | Contrastar guest; no prueba RW4 |
| Init ET_REL recibe información; rmmod acepta uninit nulo y libera memoria | Guest S3 exacto | R45 desensamblado y prueba | CONFIRMADO EN EMULADOR | Alta para hello mínimo | Dos ciclos de carga/descarga | No teardown UI/timers/threads |
| C propio imprime y se descarga | Guest S3 exacto | R45 hello con puts enlazado desde su ELF | CONFIRMADO EN EMULADOR | Alta local | Mensaje ADB, lsmod y rmmod | FLAT; enlace específico de imagen, no RW4 |
| puts puede importarse normalmente por este hello | Guest S3 exacto | R45 variante import devolvió error 2 | REFUTADO en esta prueba | Alta local | Sin registro ni mensaje | No refuta todos los símbolos/mecanismos |
| Hello reconstruido produce el mismo ELF | PC y toolchain 14.3 revisados | R45 SHA256 coincidente | CONFIRMADO EN EMULADOR / build PC | Alta local | Reconstrucción y segundo ciclo | No afirmación entre plataformas |

## Display: solo emulador

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| /dev/fb0 se consulta desde C | Guest S3 | R46 inquiry y driver desensamblado | CONFIRMADO EN EMULADOR | Alta local | Query/close=0 | No evidencia física RW4 |
| RGB565, stride780, 390×450, virtual390×900, 702000 bytes | Driver Goldfish guest | R46/R47 | CONFIRMADO EN EMULADOR | Alta local | Respuestas y colores visuales | No RAM libre ni formato físico confirmado |
| Patrón C se muestra/restaura y rmmod descarga | Guest S3 activo | R46 | CONFIRMADO EN EMULADOR | Alta local | PNG idéntico y log pan/close=0 | No exclusividad del buffer ni app persistente |
| Touch y panel stock funcionan tras patrón | Guest S3 activo | R46 baseline/input posterior | CONFIRMADO EN EMULADOR | Alta local | Sin reboot entre patrón y input | Primer intento con UI OFF fue inconcluso |
| LVGL9/extensión, profundidad16, libuv y LV_USE_OS=0 | Build guest | R46 macros ELF | CONFIRMADO EN EMULADOR | Alta estática | Lectura ELF | No llamar UI desde cualquier task |
| Captura visible prueba UI activa | Emulador | R46 screen OFF previo con frame conservado | REFUTADO | Alta local | Logs y captura | Verificar estado y gesto antes de pruebas |

## Correcciones de interpretación

| Claim | Scope | Evidence | Classification | Tested locally | Notes |
|---|---|---|---|---|---|
| Preset RW4 demuestra emulación 1:1 M2315W1 | Emulador/RW4 | R10 | REFUTADO | No | Autor identifica origen S3 |
| Debug oficial QuickApp sirve automáticamente para RW4 | RW4 | R20 | REFUTADO como afirmación de soporte documentado | No | No se declara impossibilidad de todo RPK en RW4 |
| Nombre `/data/tmp.log` prueba que Lua puede escribir | Ejemplo TouchEvents | R09 | REFUTADO como prueba | Estático remoto | Variable sin I/O |
| RAM-only implica sandbox | NuttX general | R27/R28 | REFUTADO | No | Carga kernel/FLAT puede afectar todo el sistema |

No se ha refutado la posibilidad final de DOOM con firmware stock. Tampoco se ha demostrado.
