# Retomar el proyecto

**R74, 2026-10-04:** [Auditoria stock](rw4-stock-feasibility.md), implementacion00198f1.17Git blobs verificados (10RW4Lua,3NativeApps S3,4Gadgetbridge), sin ADB/nuevosbinarios/hardware. NativeApps no tieneRW4target; relato original Habr de m0tral eleva Lua/shell a inferencia, no confirmacionfirmware. Gadgetbridge candidato con fuente, fichaexperimental/authkeylocal; mirrorGithub2024 no actualCodeberg.

**Identificacion recibida:** M2315W1, version mostrada2.2.86, usuario2026-10-04; no serial/MAC. Region/ABI/NuttX desconocidos, sin nuevas acciones fisicas.

**Siguiente concreto:** respuesta Android-iPhone/MiFitness por lectura manual (pregunta async actualizada), luego expediente primera watchfaceconocida con instalador revisado/compatibilidad/retirada/recovery. No instalar aun, no recopilar claves/MAC, no transferir ELF S3. No repetir emulador.

**Ultimo resultado runtime, R73, 2026-10-04:** [Persistencia S3 emulada](doom-persistence-emulator.md). ELF/WAD instalados una vez en /data, E1M1/FIRE/EXIT antes/despues de reset sin push de assets. Lua final cancela preparacion con panel y ejecuta otro ciclo limpio. Implementacion **3ba88df**. No hardware conectado/modificado.

## Estado vigente y siguiente paso

Direccion DevOps solicitada: [plan](devops-roadmap.md), doctor/build/test/package, perfiles compatibles, CI ligera y runner emulador controlado; no hay workflow implementado/publicado aun. Mantener como prioridad investigacion stock M2315W1.

- Final: Storage365700764 activa; UIProbe365799903 instalada perfil R73 persistente, inactiva. Workers/modulo/nodos/copias/tmp ELF/WAD ausentes. Assets /data conservados; no reinstalar, stage ni cleanup historicos.
- Next checkpoint unico: investigar con fuentes primarias el camino stock especifico M2315W1 para instalar launcher/ejecutar codigo suficiente. No ELF/direcciones S3 en hardware; ABI/privilegios/RAM/recovery fisicos pendientes y gate cerrado. Nada de firmware/USB/exploit/root ni nuevas acciones fisicas autorizadas.
- No repetir suites R67-R72/80fuentesC. Persistencia no elimina limites120s/E1M1, ni prueba horas/crash/kill/corrupcion FAT/GC durante copia. Nuevos tests solo por cambios/fallos relevantes.

## Git y estado reproducible

Repo real: C:/Users/steve/Documents/Devs/Doomed/redmi-watch4-doom, master, commits locales, sin remoto. El usuario solicito quitar Doomed/.git; intento del agente rechazado por politica, pero inspeccionR74 posterior observa padre.git ausente. Solo repo hijo conserva historial; es standalone y no se atribuye retirada manual al agente. Abrir carpeta hija en VS Code. Git safe.directory NO cambia cwd: usar workdir de la carpeta hija o git -C. No se publico nada en GitHub.

Persistentes: /data/app/watchface/market/365799903/doom/doom.elf (446144bytes), doom1.wad (4196020bytes). Archivo en flash/FS no es residencia RAM. C FLAT no sandbox. Launcher prepara WAD temporal 32768bytes por Timer50ms (~8,3s), verifica size/FNV1a32 (no autenticacion), carga ELF de /data. Host SHA256 readback; EXIT espera C/unload/cache y elimina tmp, conserva /data.

C fuente LF d6fd905b95929cd857df3693db6ca9c199f197c03ff7133d73d5752a3fbb3353; ELF SHAe115971e75ec32f33e2ee63a3c2af9799b8d207f73c3779db3bb31b53cef9639 unchanged. Lua final SHA3a167aaf0598281eb57bb615df4246a6ba59ec40b80e9a6b6bf98f868b692a1a; paquete24744 SHA2d0b8e2fd3d709fd4598f8a9b2e975be27599098c28858d7c81804a2a75edd99. Refresh backup/readback, sin reset.

Artifacts ignorados: doom-storage-install-1791156103728 y authoritative doom-storage-install.json (installed); doom-persistence-latest.json (complete/passed), cancel-1791156417673 (parcial65536), run-1791156431823 worker1032 prep8273,5ms ammo50-48; reset-1791156501836 despuesEXIT/snapshot; post-reset-1791156531409 worker468 prep8225,6ms ammo50-47. Cada salida13alloc/free streams0 cleanup0; sin reboot para salir. Dos ciclos persistencia usaron Lua R73 anterior; finalSourceSupplement doom-prepare-focus-1791157330775 prueba cancelpanel y worker1131 prep8262,1ms E1M1/EXIT con Lua final. Verify SHA final doom-storage-verify-1791157364962. Final read-only doom-persistence-final-1791157623136 Storage/noC/tmp, assets conservados.

Incidencias: baseline reset por screenOFF antes de C (doom-persistent-baseline-1791156243265), no confundir reset demostracionpersistencia ni rebootexit. Primer cancel-helper fallo regex NSH pathabsoluto (doom-persistent-cancel-1791156341879), Doomworker373 arrancado; MENU/EXIT normal, corregido regex. No crashengine. Guard ownership/dedicated loopback5039/emulator-5554, nunca USB.

## Comandos vigentes

Solo lectura: node tools/doom-ui-emulator.mjs state; node tools/doom-storage-emulator.mjs verify. Instalacion ya completada; doom-storage-emulator.mjs install rechaza repetir. Seleccionar UIProbe por Ajustes y START, esperar~8,3s, MENU/EXIT; regresar Storage. No host pushes entre sesiones. Node para no alterar ExecutionPolicy.

Si cambia Lua: C/tmp ausentes y UIProbe inactiva, node tools/package-ui-probe.mjs doom, luego node tools/install-ui-probe-emulator.mjs refresh (snapshot/readback). Subcarpeta doom/ preservada. Si C retenido por cierre sin EXIT, reentrar UIProbe y dejar Timer retirarlo antes de cambiar launcher. No force unload/kill.

Test helper persistence cancel/run/post-reset requiere secuencia/record; reset aparte con snapshot/revision. Supplement test-doom-prepare-focus.mjs requiere evidencia completa+UIProbeReady. No resetear registros para forzar pruebas. Rama remove assets tiene guard/hash/snapshot pero NO validada en runtime; no ejecutada para conservar instalacion. Binarios/WAD/snapshots ignorados, sin nuevos downloads.

## Historial anterior (no son instrucciones vigentes)

R72 y anteriores debajo documentan estado previo, incluidos paths tmp y proximos checkpoints ya realizados; la seccion R73 arriba los sustituye operativamente.

**R72, 2026-10-04:** [Sesion90s a50ms](doom-stability-emulator.md) pasa:90164ms/3156tics,1580entregas totales, giro y FIRE a30/70s. Cache constante, Umem20-90s oscila263432bytes y termina+1760bytes; EXIT libera13reservas/streams, sin reboot. Diferencia global post-EXIT+666920bytes no atribuida; final tras Storage/tmp18,10MB. Siguiente: persistencia ELF/WAD en emulador; gate M2315W1 cerrado.

Implementacion **dd803c0**. `doom-stability-1791153850848/result.json`, passed=true, diez muestras/cuatro capturas/worker116. Engine90164ms/3156tics/1571produced; Lua1580submitted con buffers256frames/256timers acotados. Giro30s angle1073741824 a46137344; FIRE70s ammo50 a47; releases neutrales, HP100. Motor tracked6582961/13alloc-free/streams0/cleanup0.

C/ELF R67 y Lua/paquete R71 intactos (pins debajo), sin builds/installs ni cambio limite120s. Nuevo helper test-doom-stability-emulator.mjs valida esos inputs y guarda memoria/tmp cada10s. Umem20-90s min30850584/max31114016/ultimo30852344; cache1363384 fija. Umem antesSTART22806584/despuesEXIT23473504; no atribuir residuo666920 solo a Doom. FinalStorage+tmp retirado18098856; mezcla cierreLua y retirada4,64MB de assets tmp. No prueba horas/leak freedom.

Baseline `doom-stability-baseline-1791153720582` guard rechazo reset sin evidencia screen OFF; panel responsive, cero resets. Stage `doom-ui-stage-1791153836674`, cleanup `doom-ui-cleanup-1791154112205` WAD intacto. Final read-only `doom-stability-final-1791154142254`: Storage365700764 activa, UIProbe365799903 perfil R71 instalada; worker116/modulo/nodos/copias/ELF/WAD tmp ausentes.

**Siguiente checkpoint unico:** persistencia emulador: assets en directorio propio de /data, launcher abre/reabre tras reset limpio sin push entre sesiones. Ruta candidata /data/app/watchface/market/365799903/doom; inspeccionar espacio/mount y backup antes de escritura. Puede mantenerse ELF/C exacto: cargar ELF persistente, copiar WAD a tmp con buffer acotado para el runtime que permite ruta fija /tmp/rw4-doom1.wad, retirar copia solo al salir/streams0. Aun sin implementar/probar, no afirmar persistencia. No escribir /resource/sistema ni tocar reloj. No repetir suites R67-R72 o80fuentesC salvo fallo/cambio.

Todo lo siguiente es historial R71 y anteriores; tomar R72 como estado operativo actual.

**Historial R71, 2026-10-04:** [Timer50ms medido](doom-50ms-emulator.md).17,45entregas/s frente a4,87; giros12,67-13,55cambios visibles/s observados frente aunos5. Motor ~35tics/s, pausa400ms y EXIT limpios. Mismo C/ELF R67, Lua R71; solo emulador S3. Siguiente: una sesion de90s para observar estabilidad/memoria, gate M2315W1 cerrado.

Implementacion **ba2bc70**. Resultado `doom-perf-1791153000333`, passed=true; comparison.json conserva referencia R70 `doom-perf-1791152085442`.119frames/141callbacks/75capturas. Intervalo57,31ms media; pipeline1,57ms/P952,00/max2,40; motor221tics/6327ms. Input UI observado27,90-54,20ms (4edges), host51,37/48,80ms incluye RPC/ADB. Entrega de fuente no es flush; muestreo max80ms puede saltar frames; no claim20FPS.

Lua SHA8e347b1b0a0ea4706e50761ca3a58739fe985660585afbd6b1b8f008f54990aa, paquete21608bytes SHAced173992bf6b787abde199c8af2399f8e19b6d05d89b34e0298fad42be2f963. Timer50ms/trace_limit256; C/ELF R67 intactos. Helper measure-doom-emulator.mjs exige perfil50/200 y trazas completas, compara captura identica y agrega pausa400ms/EXIT despues de medir.

Final Storage365700764, UIProbe365799903 modo doom/perfil R71 almacenada. Cleanup `doom-ui-cleanup-1791153170789` WAD intacto; final read-only `doom-fast-final-1791153209832`, passed=true: worker88/modulo/nodos/copias/ELF/WAD tmp ausentes.13alloc/free/streams0/cleanup0/pico6582961. Baseline screen OFF respaldo/reset antes de C `doom-fast-baseline-1791152867635`; primer guard postboot encontro ADB aun no listo, connect posterior resuelve sin segundo reset. Nunca reboot para salir.

**Siguiente checkpoint unico:** sesion90s con el Timer50ms actual, snapshots espaciados de memoria/cache/tmp y salida limpia, sin ampliar limite nativo120s. Los buffers de perfil estan acotados256, asi que NO usar el helper corto que exige trazas completas para un run90s: preparar helper de estabilidad sin recompilar C ni pedir traza infinita. No repetir R67/R68/R69/R70/R71. Sesion90s no implica estabilidad de horas ni seguridad fisica; persistencia posterior, gate RW4 cerrado.

Todo lo siguiente es historial R70 y anteriores; consultar R72 al inicio para el estado operativo actual.

**Historial R70, 2026-10-04:** [Presentacion y controles medidos](doom-performance-emulator.md). Pipeline Lua/LVGL media1,48ms, intervalos205,30ms/4,87entregas/s; giros con4,57-5,08cambios visibles/s observados. C/ELF R67 intactos, instrumentacion Lua acotada; salida limpia. Siguiente: Timer200 a50ms y comparar, sin prometer20FPS. Solo emulador S3, gate M2315W1 cerrado.

Implementacion **a69b143**. Resultado `doom-perf-1791152085442`, passed=true:33frames/39callbacks perfilados,75capturas, worker88. Pipeline p951,70ms/max2,90; Timer callback media1,89ms/max3,80. Motor222tics/6343ms (~35/s),444DG callbacks distintos de FPS. Handler input0,30-0,60ms, confirmacion UI29,70-151,30ms incluye espera al Timer; host angle/key observado<=46,91/116,14ms incluye RPC/ADB/polling. No latency exacta/fotones, ni flush completion.

Lua instrumentada SHA34e6a38154f130e537f1b02150a5cb8078448a3ff9960d39467cdaddfa256f6c; paquete21472bytes SHAf5b00512904ce4d4a4eba5f7d7618230b1f4d16844e4438a6e5755520c8f3e31. C/ELF R67 intactos. Clock revisado en `doom-perf-clock-review-1791151751886`: os.clock lee ticks guest/10000, no CPU time portable; no asumir RW4.

Baseline screen OFF: backup/reset antes de stage/C `doom-perf-baseline-1791151868826`, nunca para salir. Refresh readback sin reset, sin nuevas herramientas/compilacion C. Cleanup `doom-ui-cleanup-1791152232386`; final read-only `doom-perf-final-1791152271086`, passed=true. Storage365700764 activa, UIProbe365799903 modo doom con perfil R70; worker88/modulo/nodos/copias/ELF/WAD tmp ausentes.

**Siguiente checkpoint unico:** Timer200 a50ms, aumentar buffers de traza si hace falta y ejecutar `tools/measure-doom-emulator.mjs` para comparar tasas/costos/input, con pausa/EXIT dentro del ensayo. No repetir suite R67/R68/R69 ni fuentes80C por este cambio Lua salvo fallo. La medicion corta no sustituye estabilidad/memoria/crash/persistencia ni gate fisico.

Todo lo siguiente es historial R69 y anteriores; consultar R71 al inicio para el estado operativo actual.

**Historial R69, 2026-10-04:** [Cierre sin EXIT y reentrada](doom-close-emulator.md) pasan con Doom original. Seleccionar Storage detiene el worker104 y libera13 reservas/streams; conserva modulo/copias hasta reentrada UI, que recoge todo. Sin reboot para salir ni unload host. C/Lua/ELF R67 intactos; solo emulador S3, gate M2315W1 cerrado. Siguiente: medir frames presentados, costo de copia y latencia antes de optimizar.

Implementacion R69 guardada en **bcc1829**. Resultado completo: `artifacts/emulator/doom-close-reentry-1791147966833/result.json`; cierre `doom-close-closed-1791147862451`; cleanup `doom-ui-cleanup-1791148267953`; final read-only `doom-close-final-1791148293324`, passed=true. Storage365700764 activa, UIProbe365799903 modo doom almacenada; PID104/modulo/nodos/copias/ELF/WAD tmp ausentes. Baseline screen OFF requirio un reset limpio antes de stage/C (`doom-close-baseline-1791147587283`), nunca para salir. 13alloc/free, streams0, cleanup0, pico6582961; global Umem used+240080/maxused+8148368, GImageCache used+992, causa no aislada.

Helper `tools/test-doom-close-emulator.mjs start|closed|reentry`; navegacion manual inspeccionada entre fases, exactamente un START/ningun EXIT. Pins R67 debajo intactos, sin nuevas compilaciones/instalaciones. Crash/kill y sesiones largas siguen sin garantia. No repetir R58/R62/R63/R65/R66/R67/R68/R69 salvo cambio o fallo.

Todo lo siguiente es historial R68 y anteriores; consultar R70 al inicio para el estado operativo actual.

Implementación R68 guardada en **ae255fa**. Final read-only `doom-focus-final-1791145679942` confirma Storage activa y worker/módulo/nodos/tmp ausentes.

**HISTORIAL R68,2026-10-04:** [Panel stock/STOP con FIRE down](doom-focus-emulator.md), `doom-focus-test-1791145311054`, passed=true. Nueve snapshots/siete capturas: panel con worker104 vivo congela tic86/posición/ángulo/ammo/callbacks/input; tap neutro50,45 no llega al motor. Regreso PAUSED/System panel hasta RESUME, tics96→157. FIRE held mask8/ammo50→48; NSH op2 STOP sin release, UI recoge Image/cache/worker/módulo antes de soltar. reason1/uninit0/live0/refs0/input0/keys2,13alloc-free/streams0/cleanup0/pico6582961; launcher Ready: exited y sin autoSTART con pointerdown. Sin reboot para salir ni crash.

Reutilizados C/Lua/ELF/paquete R67, pins debajo intactos; no recompile80C, no nuevos downloads/installs. Solo helper `tools/test-doom-focus-emulator.mjs`; preflight real ELF/WAD/Lua/ID/píxeles. STOP admite únicamente hasta6retries EINVAL22 por secuencia, nunca kill/unload/LVGL host. Una marca del result inicial `retirementObservedAtUtc` se guarda después de checks/capturas, no latencia aislada; helper la llama ahora `retirementChecksCompletedAtUtc` sin repetir motor por el nombre.

Baseline estaba SCREEN_STATE_OFF, ratón no despertó. Un backup/reset limpio antes de stage/C en `doom-focus-baseline-1791145112979`, ninguna salida requiere reboot. Final **Storage365700764**, UIProbe365799903 modo doom almacenada. Cleanup `doom-ui-cleanup-1791145462593`: WAD intacto, ELF/WAD tmp retirados, worker/módulo/nodos/copias ausentes. Umem used+233512/maxused+8125240/GImageCache+603664, causa no aislada; no leak/RW4RAM claim.

**Siguiente checkpoint único:** cambiar de watchface con Doom activo **sin EXIT**, verificar stop/recursos propios limpios con código/copias retenidos, volver a UIProbe para recoger caches/módulo sin reboot. R62 ya probó transporte; el motor original no ha hecho aún ese flujo. Después medir presentación/copia/latencia antes de optimizar. No repetir R58/R62/R63/R65/R66/R67/R68 salvo cambio/fallo.

R68 no demuestra foco perdido mientras una acción sigue mantenida, llamadas/notificaciones/corona, crash/kill/SMP/agotamiento/errores pthread, sesiones largas, persistencia o hardware. Gate M2315W1 cerrado. Repro: guest responsive/UIProbe doom instalada→`doom-ui-emulator.mjs stage`; abrir UIProbe/Ready sinSTART→`test-doom-focus-emulator.mjs`; volverStorage→`doom-ui-emulator.mjs cleanup`. Fuente/ELF no cambiaron. Launcher user sigue abierto, verificar ownership vigente antes de actuar; si screen OFF, reset limpio/backup antes de stage, nunca para sustituir EXIT.

Todo lo siguiente es historial R67 y anteriores; consultar R69 al inicio para el estado operativo actual.

Implementación R67 guardada en commit **a3884e8**. Estado final read-only validado en `artifacts/emulator/doom-ui-final-1791144160277`; Storage365700764/PIDs104 y408 ausentes/ningún módulo, nodo o archivo tmp propio.

**ACTUAL R67,2026-10-04:** [DOOM original en UI con controles](doom-ui-emulator.md), passed=true en `artifacts/emulator/doom-ui-test-1791143272849`. E1M1 visible320×200 en página Lua/LVGL390×450, MOVE/FIRE/MENU. Posición/ángulo cambian, munición50→47; pausa congela tic/posición/ammo/drawn y RESUME avanza.24 snapshots/ocho capturas,64000 píxeles comparados con copia RGB565,167 colores. Workers104/408 ownerUI28, init NSH88/407, stack32KiB solicitado; dos STOP reason1,13alloc/free por ciclo, streams0/cleanup0, PID ausente antes de unload. Reentrada recarga ELF/globals/posición inicial/ammo50, sin PC ni reboot entre ciclos.

Código nuevo `experiments/doom-ui/{adapter.c,transport.c,game-ui.h,main.lua}`. DG original, worker detached; ringSPSC32/epochs→edges64→DG_GetKey. Pausa vacía/entrega KEYUP+D_ProcessEvents en límite de Tick y descuenta tiempo pausado. Snapshot192/48words: primeras32R62+16engine/stats; delivered_keys son edges del adaptador, no array privado gamekeydown. No cat/read-all del control. Stream128028 =meta16+header12+128000RGB565, dos slots inmutables; Lua escribe payload128012 en dos paths fijos, cache-drop solo UI. No workerLVGL/directFB/native shared-input.

ELF446144 SHAe115971e75ec32f33e2ee63a3c2af9799b8d207f73c3779db3bb31b53cef9639; source LF combinado d6fd905b95929cd857df3693db6ca9c199f197c03ff7133d73d5752a3fbb3353; entry0x1fc61,45imports exactos guest,6993ABS32+4THM_CALL permitidos comoR66. Cache core50d8fb8911766fb0285eedd81e3965be7b923562c7a3782abd87e068c6a21c8e verificado, no recompilar80C ni repetir R58/R62/R63/R65/R66/R67 sin cambio/fallo. Lua SHAb86f0cee70c58a544a09c5069c4c4fcd260a9ebb4b0b05deb827507d9d7120d9; paquete19576 SHAec1cf33c1e236a5682684fc9b2d6d8578c5acfd8b7090935a5cd5fa689d52143.

Final **Storage365700764 activa**, UIProbe365799903 instalada modo **doom**; módulo/worker/nodos/copias/ELF/WAD tmp retirados en doom-ui-cleanup-1791143492626. WAD intacto al retirar. Panel/Ajustes normales después de EXIT inspeccionados. Refresh con backup/readback sin reset; un reset de baseline por SCREEN_STATE_OFF precedió C (doom-ui-baseline-reset-1791143049777), staging refeito después de boot/UI responsive. Ningún reboot para salir ni crash R67. Launcher original del usuario sigue identificado por guard; comprobar estado antes de acciones. Puede apagarse de nuevo tras300s: no asumir screenshot vivo ni hacer staging antes de boot.

Medidas: window2534ms/89tics/13frames produced/178callbacks; ~35tics/s y transporte~5/s, **no FPS visibles exactos**. Timer200ms, sin optimización. Pico owned6582961 (~6.28MiB), secciones793228 aparte, stack/Lua/cache/loader/libc/tmpfs excluidos. Umem used+237000/maxused+8192104 sin causa aislada, GImageCache igual; no leak/physicalRAM claim. Sesión límite120s real incluidas pausas/10000Ticks/E1M1; cooperativo, no hard watchdog. Map change sale; audio/saves/config deshabilitados. No persistencia nativa al reset, no ergonomía/corona/multitouch/MOVE+FIRE simultáneo probados.

**Siguiente checkpoint único:** panel/foco stock y stop cooperativo con FIRE mantenido **mientras ejecuta Doom original**, incluyendo neutralidad/salida sin reboot. Menú y EXIT ya pasan; R62 probó transporte, pero motor no se ensayó aún con foco stock/contacto mantenido ni cierre sin EXIT. Después medir y mejorar transporte/fluidez; no optimizar antes de medir ni pasar a hardware.

Repro exacta: `build-doom-ui.mjs`, `package-ui-probe.mjs doom`, UIProbe inactiva/módulos ausentes→`install-ui-probe-emulator.mjs refresh`; guest responsive→`doom-ui-emulator.mjs stage`; abrir UIProbe por Ajustes/capturas/Ready sinSTART→`test-doom-ui-emulator.mjs`; volverStorage→`doom-ui-emulator.mjs cleanup`. Helper host nunca unload/cache ni USB; reentrada UI requerida si módulo retenido. No fuentes/downloads/tools nuevos necesarios. ExecutionPolicy intacta, usar Node; todos los binarios/assets/logs ignorados. Gate M2315W1 cerrado: ninguna conexión/firmware/flash/exploit/root físico autorizado.

Todo lo que sigue es **historia R66 y anteriores**; pendientes antiguos de motor/UI/WAD fueron resueltos por los checkpoints posteriores. Consultar R67 arriba como estado operativo.

**Actual R66,2026-10-04:** [DOOM real ejecutado, E1M1 capturado](doom-first-frame-emulator.md), passed=true en la primera ejecución guest. doomgeneric dcb7a8d con doom1.wad R63; worker210 stack32KiB, Create/wipe completo y siguiente Tick produce320x200. Captura e1m1.png/e1m1.bgrx en doom-first-1791140202974, inspección visual escenario/arma/HUD correctos. FNV07aece36/145colores, gametic6,43callbacks incluyendo wipe/1263ms NO FPS. Quit local reason2/code0,13alloc/free,2streams open/close,2denials, pico6582961bytes/13blocks; cero recursos,join0/worker ausente/unload/tmp/WADintacto sin reboot. No UI del guest ni controles conectados, no hardware.

ELF438940 SHA f0f55f55cd72fab7052a3caaca40cbb43567ac9cf5bdcf4326280a8fa11a7539; source LF combinado a1125230f83a3bd515287967d3a3f5d366dc16ac66cfb00b1e64443b89e92dcc; entry0x1ead5.41imports guest fijados, COMMON415 asignados,6900ABS32+4THM_CALL de autorrecursión permitidos por up_relocate tipo10 inspeccionado. Memcpy/memset/strcmp ARM: conservar estado original, no forzar Thumb. Nuevas inspecciones stdlibs/math/AEABI/fwrite/attr12bytes. Pragma long_calls no elimina autorrecursión; helper valida cada call dentro de su función/.text. Raw fwrite solo exportación fija post-join, core sigue writes-blocked. No cambiar pins sin revisión; sources upstream intactas, overlay I_Quit/I_Error R65.

Repro build-doom-first.mjs [relink] y run-doom-first-emulator.mjs. Relink verifica el core50d8fb8911766fb0285eedd81e3965be7b923562c7a3782abd87e068c6a21c8e sin recompilar80C. Primeros guards Thumb-only/ABS32-only y dump ENOBUFS fallaron antes de guest; corregidos y no repetir candidatos. Límite15s cooperativo en DG y8Ticks tras Create, no hard watchdog. Join/cleanup/ioerror inciertos retienen módulo. Stats pico no incluyen secciones788032/stack/tmpfs/loader/libc. Umem usado+1392/maxused+7837320 en dos muestras, no leak/peak aislado. No repetir R58/R62/R63/R65/R66 sin cambio/fallo.

**Siguiente meta única:** frames reales en UI Lua/LVGL del emulador con controles R62 y START/EXIT. Estado watchfaces Storage/UIProbe winput anterior no modificado ni actividad revalidada. Gate M2315W1 cerrado. Estados R65 y anteriores debajo son históricos: el pendiente «ejecutar motor/primer frame» ya se completó en R66.

Implementación R66 guardada en commit **8ac74e3**. No repetir la ejecución ya aprobada salvo cambio/fallo; la captura y logs quedan en artifacts ignorados. `.ps1` parseado sin ejecutar/cambiar política, helpers Node pasan sintaxis. No descargas ni instalaciones nuevas.

**Actual R65,2026-10-04:** [runtime de recursos/salida probado y motor con shim compilado](doom-runtime-emulator.md). Ocho ciclos en worker139 pasan: retorno, quit/error, stop, OOM/overflow/free inválido y close doble rechazado. Cero reservas/streams propios después de cada ciclo; join0, worker ausente, módulo/fixture/ELF tmp retirados sin reboot. Pico137bytes corresponde al fixture, no Doom. Artefacto native-runtime-1791136344622. ELF9668bytes SHA6fe5f39f45e9dcc7ffe28d97d51acd083a1a1806ba751be41218dadde529887a; source LF combinado e7c908f177034c26037640a099db79ee14ac309f38e7d65fdccc71622dbc7840. ABI malloc/free/vsnprintf/setjmp/longjmp inspeccionada; FLAT sin sandbox. Stop externo, I_Error del motor y cierre con motor siguen pendientes.

Build80C+runtime sin sonido compila usando headers propios/overlay de I_Quit/I_Error; upstream intacto. Objeto435288 SHA0281a7dc95222408d41c3eb05cc83ae4531b899b104995bfb7537f0484bd4f3b,39imports:16contratos del shim,17biblioteca por revisar y6DG sin implementar. No entry/bindings finales,415COMMON; NO cargarlo. Eliminados imports privados Newlib y writes/exit/system directos. Runtime limita128reservas/8streams/payload≤8MiB, solo workerowner dentro del run, logs511chars. Nuevo module.ld une function sections en .text; primer candidato THM_CALL rechazado en host, ninguno fallido ejecutado. Buildshim inicialmente detectó mode_t incompatible, corregido con sys/stat mínimo propio. Umem usado+576 sin causa aislada/no leak claim. No repetir R58/R62/R63 ni R65 salvo cambio/fallo. No hay engine runtime ni hardware en R65.

**Siguiente meta única:** completar bindings revisados y DG para producir el primer frame real de Doom en el emulador, con límite de ejecución y cleanup. Repro: build-runtime.mjs y run-runtime-emulator.mjs solo si hace falta repetir; build-doom-audit.mjs shim o inspect-shim para análisis sin guest. Estado watchfaces anterior Storage/UIProbe winput no modificado ni actividad UI revalidada. Gate físico cerrado.

Los estados R64 y anteriores debajo son históricos; los pendientes de runtime/build allí se reemplazan por R65. La ABI física M2315W1 continúa sin demostrarse.

Implementación R65 guardada en commit **2b753ec**. No hay acciones manuales pendientes para reproducir el análisis local; conservar abierto el launcher del usuario para futuros experimentos nuevos. `.ps1` solo parseado, ExecutionPolicy intacta; helpers Node pasan sintaxis. Binarios/WAD/guest/logs siguen ignorados.

**Actual R64,2026-10-04:** [motor real compilado para inspección](doom-build-audit.md).181fuentes snapshot GitHub del commit dcb7a8dbc7a16ce3dda29382ac9aae9d77d21284, cada Git blob verificado; LICENSE local preservada, upstream intacto/ignorado.80C core ARM compilados sin sonido/X11. Objeto parcial425928bytes SHA30ba8ead4ca94fd69d661d774edd3a9fbd449dfe68696798ad4519c7daa56366,entry0/50imports sinresolver. No módulo apto para cargar. Newlibheaders solo compileaudit, _impure_ptr/stderr no aprobados; _ctype_/abs ausentes en guest. Memoria525351estática antesalineación+6MiBzone+256000DG=~6,75MiB antesextras. I_Quit upstream retorna, I_Error llamaexit/system; mkdir y otraswrites posibles inclusoORIGCODEoff. Siguiente shimlibc/allocator/streams/salida cooperativa y contrato pequeño nuevo, sin repetir display/input/WAD.122warnings preservados; stackframes no pico. Helper inicial fallóENOBUFS trascompile/link, inspector corregido; build final y inspect pasan. Ninguna operación guest, reset ni hardware en R64; estado R63/Storage/UIProbe permanece sin nuevas observaciones. Repro build-doom-audit.mjs [inspect], lock doom/doomgeneric-source.lock.json.

R63 debajo es histórico; preparación/auditoría de build preliminar ya completada, runtime pendiente.

**Actual R63,2026-10-04:** [WAD shareware leído desde C](native-wad-emulator.md), passed=true. Usuario descargó tar de mirror Debian PSNC; contiene solo doom1.wad. Identidad4196020/MD5/SHA1 Debian coincide; SHA256local1d7d43be501e67d927e415e0b8f3e29c3bf33075e859721816f652a526cac771. Licencia/distribución documentadas, datos ignorados. C verificó1264entradas,16recursos,8196chunks del archivo completo. WAD intacto y rw4wad/temporales retirados; Storage365700764 permanece activa, UIProbe modo winput intacta. Sin reboot, motor ni hardware. Artefacto native-wad-1791133863026. Build3672bytes SHA5f75898a47ee32b58cfa0bd0c60b983d3a22cf6222aafdeb32f43dcee9b93e37,entry0x4c1/42ABS32/nueve imports R58/BSS0. Tests host27 negativos pasan. Siguiente: auditar libc/allocator/salida y preparar build doomgeneric sin sonido para guest; no repetir ensayos pasados sin cambio/fallo.

R62 debajo es histórico; la lectura WAD pendiente allí ya fue completada por R63.

**Actual R62,2026-10-04:** [input consumido por worker C](native-worker-input-emulator.md) completado. UI28 produce máscaras mediante ring SPSC32/epochs; workers439/791 tradujeron22 key edges y produjeron frames.38 snapshots/cuatro imágenes completas pasan; HOLD TEST cancela con ratón down, overflow32 deja neutral y panel desde **y440** pausa. Regreso exige RESUME/contacto nuevo. STOP cooperativo NSH con FIRE mantenido en worker885 pasa, sin host-unload. Cierre968→Storage conserva código/copias hasta reentrada UI, que recoge todo. Final Storage365700764, UIProbe365799903 instalada modo **winput**, módulos/nodos/copias/ELF propios retirados; PIDs104/439/791/885/968 ausentes. No Doom, WAD ni hardware. Siguiente: licencia/procedencia y lectura de doom1.wad desde C.

Pins R62: C LF28175b7cc88b126ad99fe9f3a29e837787af108e6ee044cf6cee6fb142ee675a; ELF8436bytes SHA54facb91f2d27c3e1172bba174c3d2ac85a07343aa0ca2574f621a13e362f00c; entry0xf1d/79 ABS32/mismos10 imports/BSS179620. Lua090b7618d7bbca7150af4ba50aacb9443c19ce489ca48c927fda629af4c0fdb3; paquete20972 SHA3da72d93acea9b2e5171aecaef42560bfd1eb4f59bbc1548326f67230836ae8f. Snapshot128 añade12 words input; no cat/read-all. Uninit exige referencias0, requested/applied/queued0 y PID ausente. GC no LVGL/unload; helper host exige reentrada para limpiar. FLAT no sandbox; sin open/unload general, SMP, crash, límite180s o foco stock con dedo aún apoyado probados.

Artefactos R62: worker-input-test-1791131669210, worker-input-held-stop-1791131823074, worker-input-close-1791132028553, worker-input-reentry-1791132117672, worker-input-final-1791132187928. Umem usado+160928/maxused+96736, GImageCache usado+603664, causa no aislada/no leak claim. Primer runner1791131537341 esperaba panel desde y410 dentro de MOVE/PRESS_LOCK: el gesto se canceló y C siguió sano; menú/EXIT retiró worker104 sin reset. Helper corregido a y440, C/Lua intactos. Rescan volvió a Neat antes de C; no asumir Storage tras update. Un reset de instalación previo a C, ninguno para salir.

Repro: build-worker-input.mjs; package-ui-probe.mjs winput; UIProbe inactiva/módulos ausentes antes de install-ui-probe-emulator.mjs update. Confirmar boot/UI responsive y worker-input-emulator.mjs stage. Abrir UIProbe con preview/Ready revisados SIN START; test-worker-input-emulator.mjs. Desde launcher aún staged, test-worker-input-stop.mjs. Para módulo retenido, volver a UIProbe; después Storage y worker-input-emulator.mjs cleanup. No repetir ensayos pasados salvo cambio/fallo. Guards comprueban imagen/QEMU/ADB loopback y fuente/ELF remoto/ID/píxeles; no USB.

Lo siguiente es **histórico R61**, no el modo instalado actual:

Estado activo al **2026-10-04** (Bogotá). Resultado actual **R61: [frames desde worker C](native-worker-frame-emulator.md)**. Binario final:12 capturas de44800 píxeles, dos lectores simultáneos/tercero rechazado, dos START/EXIT y panel pausa/resume pasan. Workers107/277 en UI28 tras init NSH; otro worker374 termina al cambiar a Storage sin EXIT y reentrada recoge caches/módulo/copias en UI. Ensayo inicial también pasó con402/562/660; worker242 de un helper fallido alcanzó límite natural solo en ese primer candidato. Sin reboot para salir. **Final Storage365700764, UIProbe365799903 almacenada modo wframe; PIDs107/277/374 y módulo/nodos/copias/ELF propio ausentes. No Doom, WAD ni hardware.** Siguiente: controles mantenidos Lua→worker con liberación al pausar/cerrar.

R61 separa payload y Lua en experiments/native-worker-frame. Dos slots C FREE/WRITING/READY/READING; no sobrescribir mientras el lector posee bytes. Snapshot80 incluye produced/readers/blocked. Stream89612bytes con EOF por descriptor; Lua cierra antes de os.execute, copia a dos nombres tmpfs y llama cache-drop desde UI con owner comprobado en C. Finalizador no toca LVGL ni descarga; reentrada invalida caches en UI y recoge código retirado. Helper host rechaza unload de módulo R61 retenido. FLAT compartido, no sandbox; concurrencia arbitraria/SMP/crash no validados.

Pins R61 finales: ELF5740bytes SHAd6b2c68d6f74b536f8cac4086f38ca2636f9fd7e8011dbd83ebede88596f38fc; C normalizado LF37e8a66231d9b38d6aac2bc9b2b1ff6282a5fadbfd6f0b02ac771eaa97dd6fa0; BSS179312bytes. Paquete15640bytes SHA926116d3a58dad9fdfee1e6355e74c6e6985ce84cd0037215b0f13474adafa8a. Fuente/runtime/pins completos en el documento R61. Artefactos finales worker-frame-test-1791129002565, wframe-atomic-close-1791129131313, wframe-atomic-reentry-1791129189170 y wframe-atomic-final-1791129242309. Umem usado+180640 y maxused+953112 en dos muestras; no causa aislada, leak claim ni presupuesto físico. Metadatos sequence/cycle ahora atómicos: revisión corrigió carrera UI write/NSH read antes del ensayo final. Un reset adicional de guest limpio precedió ese ensayo por SCREEN_STATE_OFF, jamás para salir de C.

Fallos R61 preservados: ELF tmp desapareció tras staging cercano a reset (causa no aislada); parser Lua19/20 words falló antes de worker; resume asíncrono dio falso fallo; helper trató EAGAIN como error. Corregidos preflight remoto, parser20, polling de estado VM y retry acotado con handles cerrados. Update inicial ejercitó reparación del derivado añadida en R60. Nuevo refresh con backup/readback pasó sin reset, solo UIProbe inactiva y módulos ausentes. Stage **después de boot completo/UI responsive**, no del ack de reset. No repetir tests ya pasados salvo cambio o fallo pendiente.

Histórico R60: [START/EXIT con worker C](native-launcher-emulator.md). Sus pins/artefactos y limitaciones se mantienen como evidencia anterior; no describen el modo actualmente instalado.

Histórico R54: op6 invalida cache del slot0/1 y avanza fase; op7 invalida ambos después de borrar Image durante EXIT. Imports lv_image_cache_drop y lv_image_header_cache_drop ligados al guest exacto. **Op6/op7 solo desde nuestra watchface en contexto UI; nunca CLI/NSH, worker ni uninit.** file_write llama síncronamente al driver; no se midió thread ID. Un Timer Lua por VM, periodo200 ms, máximo300 frames por START, pausa/resume/EXIT; timer __gc compilado revisado. Slots /tmp/rw4-loop-frame-0.bin y -1.bin,89612bytes cada uno. Imagen x35y205 320×140; no punteros de módulo retenidos por LVGL ni framebuffer global. Guard marca closing antes de descargar; callbacks comprueban is_running. Finalizador propio no llama LVGL. Reproducción del checkpoint histórico requiere `package-ui-probe.mjs loop`, no bridge; `test-frame-loop-emulator.mjs` comienza desde launcher SIN START previo.

Evidencia: frame-loop-1791075123314,18 observaciones y ambas fases verificadas sobre44800píxeles/captura con tolerancia2. Panel state seq45 estable, límite300 seq305 estable. ~4,92 actualizaciones de fuente/s, NO FPS del motor. Lua post-GC72,405KiB desde frame50 hasta300 y reentrada; GImageCache usado1.900.024 constante tras panel. Umem usado muestreado estable con variación; maxused23.529.596→23.663.676 aumentó134080bytes sin causa aislada. No pico acotado ni fugas prolongadas descartadas. Regresión CLI stream/busy/pausa y cierre normal/error pasan con C nuevo.

Histórico R53: primer stream con lector único/estado global falló al probar otro lector y os.execute con handle abierto; se observó panic y reinicio guest. Artefactos retenidos, causa exacta del panic no aislada. Primer ajuste per-descriptor aún fallaba la expectativa del shell; versión final permite aperturas múltiples y guarda cursor/fase en file.f_priv. DWARF exacto: file32bytes, f_priv20; nunca dereferenciar cookie numérico. Fuente NuttX de dup reabre drivers, referencia para interpretar herencia al crear NSH. Candidatos fallidos fuera de pins. ABI/símbolos solo guest exacto, FLAT no sandbox.

Final R54: Storage365700764, Lua cerrado, módulo/ambos nodos y temporales propios ausentes; /tmp solo temporary.db. UIProbe365799903 permanece instalada en modo loop. Preparar ELF después de reset/cleanup. C3992bytes SHA f345f4c2e2ec7a6811dad0f66e077dc65b397271aa8291da4b1fdd2f1851a0b6; source LF e04c6d1ad8fa4e680113f71e4fb0a8c4246884dc98e7a4026e09ebb313406a27. Watchface21928bytes SHA f1b26fc16722eed1c9aa8b2c3bbab7a97559c7710a177ea5c65e5de7f9ab84d1. Cierre normal sin EXIT en frame-loop-close; regressiones native-frame-1791074808268 y lua-bridge-close-{normal-1791074813034,error-1791074817541}. Commit implementación71836d9. Capturas/logs ignorados. Revisar cada pantalla en Settings; no navegación ciega.

**Checkpoint anterior R55:** UIProbe365799903 instalada en modo controls, no loop. C5212bytes SHA ec7b6d5d1eab951a27423607a82ef8801778c9ccc6dfd515a2c50a4891e0a844; source LF40a18e07975dd0c57b898e37a08c1ae9eddfc6cdbdddfbf97a6412a3de208078. Watchface24364bytes SHA224900da6086fe578d8dafd42b83feda768bbe24c11226d51d36b7e8d1e11597. Paquete/control/contrato en native-controls-emulator.md. Un control anterior cancelaba FIRE al perder foco: corregido con contact==kind; intento fallido ui-keys-1791079130203, final ui-keys-1791079378297 pasa26 snapshots. HOLD TEST pausa con contacto mantenido, no prueba foco stock mantenido. Panel seq183 estable y regreso pausado; RESUME seq193 neutral. Dos EXIT y tercer START→Storage sin EXIT limpian; final Storage, C/nodos/temporales propios ausentes. Artefactos controls-system-panel-close. Cola CLI, stream y cierre normal/error con FIRE mantenido pasan. Commit implementación adbf567.

**Checkpoint anterior R56:** módulo separado experiments/native-time/time-probe.c; bridge R55 intacto. ABI exacto timespec16,tv_sec int64,tv_nsec int32 offset8; clock_gettime1 usa contador, no hora calendario. Imports clock_gettime0x606b65,clock_nanosleep0x656609,nxsched_gettid0x606999,printf0xfa2d25. Time ELF2228bytes SHA4cceedf220a4df9133b89fc8f29db45a6cf9d22fe54efe31b30d1810b934012d,source LF1380bc88db44387cd5517a7ae7c5fca5429b7182810fdb4a36ed1e6eeab95bcd. inspect-time/build-time/run-time-emulator.mjs. Final native-time-1791081427770 pasa257 lecturas/19 waits; ps identifica mismo PID sh -c insmod Waiting Signal antes y después de captura panel; píxeles Storage idénticos al terminar. C/ELF retirados sin reboot para salir. Ensayos fallidos de helpers/screen OFF documentados; reset único del guest limpio para baseline. Helper ahora preflight valida UI activa, no se fía de captura congelada. Normal+AOD pueden tener in_use1; exigir type1 Storage. UIProbe almacenada sigue modo controls. Esperas1ms finales5,3–15ms; no prometer precisión1ms ni dormir desde UI. Sin prueba de interrupciones ni mutación de hora.

**Checkpoint anterior R57:** experiments/native-fs/fs-probe.c, ELF3680 bytes SHA872950b90470b8b6a3f6d56087dcf4bfcfc11cfbdccbc15750030bdd8175a3fa; source LFfde5747ed5edb6c944d9d26df0c539588c5495a8954108168ba8c7a49071337c. ABI off_t signed64/size_t32/O_RDONLY1,35 ABS32 y6 imports contrastados. inspect-fs/build-fs/run-fs-emulator.mjs. Primer runtime native-fs-1791082444827 pasa2049 chunks,41 ventanas y4 errores, SET/CUR/END, seek2^32+7 sin leer allí, posiciones independientes/reopen. Fixture SHA a2db28e8d2e36e24f7b2d04e31bfbce38659094951bafed5834f80cfbebaa65f intacto; module rw4fs y dos tmp propios retirados sin reboot. No UI activa ensayada en R57, no /data/persistencia/WAD/stdio. Umem used+224/maxused+1014848 en dos muestras, causa no aislada/no leak claim. UIProbe almacenada controls/Storage previamente activo. Ver native-fs-emulator.md.

**Checkpoint anterior R58:** experiments/native-stdio/stdio-probe.c; FILE opaco, long32 para fseek/ftell, size_t32, buffer128. ELF4668 bytes SHAe78421f6950558a66c51bd4d05aafc4e78c7915bc5762780c71ed7afc504606b, source LFb873aa0cdb429aa0ca867a42236141599b81b53cb9a07a930c9577d33736b62e; entry0x605,51 ABS32,10 imports permitidos. inspect-stdio/build-stdio/run-stdio-emulator.mjs. Primer runtime native-stdio-1791083260165 pasa; EOF1 tras fseek0 aunque reread13 funciona, clearerr poneEOF0/error0/position13. Longitud1048613 restaura posición13 buffered y lee19;41 ventanas, size4 retorna9 elementos de37bytes, size3 retorna13, erroresENOENT/EINVAL, streams790/5 y3reopen. Fixture mismo SHA R57 intacto; rw4stdio y tmp propios retirados sin reboot. No UI activa, WAD ni /data en este ensayo. Umem used+224/maxused+1720, nused/nfree iguales, causa no aislada/no leak claim. Fuentes doomgeneric d_main/d_loop muestran TryRunTics con I_Sleep: no llamarlo desde Timer UI. Ver native-stdio-emulator.md.

**Checkpoint anterior R59:** experiments/native-task/task-probe.c, signed32 pthread_t, attrNULL, trampoline guest permite retornar worker, timespec16 y module_info16. Atomics32 release/acquire con DMB, BSS36. ELF3288 bytes SHA0a6065fbb3588716ce2093285db69cb2b794d84fab34b8c977ad8bca0639a6f3; source LFb69f308bb56cabd4fba03d4634dc1f5b605d3dacfd57c74b44fc9a3d822d5fb6. inspect-task/build-task/run-task-emulator.mjs. Final native-task-1791084264858 pasa: owner54, workers55/75/82, pasos38/3/6, stop/natural/stop, join61/124/47ms, cookies34570001/12/21. Busy uninit -16 probado con llamada directa, no rmmod concurrente. Ps pthread55 Waiting Signal antes/después panel, stack4072 used592 dos muestras; no pico ni budget Doom. Final PIDs ausentes/unload/tmp retirados, Storage pixels iguales, sin reboot para salir. Preflight1791084176550 screen OFF antes de push/C; un reset de guest limpio con backup, registrotask-baseline-reset.json. Helper pthread minúscula corregido antes de payload. No worker post-init, UI create/join, fallo join, kill, WAD o RW4 probados.

**Siguiente meta única:** mostrar en LVGL un frame RGB565 producido por el worker C, con buffers/cleanup seguros. Input concurrente y WAD legal pendientes; gate físico cerrado.

Implementación R56 guardada en commit3d2660a; build/run/ABI y documentación en native-time-emulator.md. Reproducción final del runner mueve la copia tmpfs después del preflight activo; cambio de orden sin cambio al ELF probado.

Implementación R57 guardada en commit0f62e6e. Reproducción con inspect-fs/build-fs/run-fs-emulator.mjs; source/ELF fijados y probados, salida passed=true. No repetir runtime salvo cambios/fallos pendientes. Stdio completado después en R58.

Implementación R58 guardada en commitbe75f7c. Reproducción con inspect-stdio/build-stdio/run-stdio-emulator.mjs, resultado passed=true con seekClearsEof=false documentado. Lifecycle desde NSH completado después en R59; launcher pendiente. No repetir pruebas aprobadas sin cambios/fallos que lo justifiquen.

Implementación R59 guardada en commitf52ac98. Reproducción inspect-task/build-task/run-task-emulator.mjs; runtime pasa tres ciclos y panel activo. Después se reforzó el assertion de retorno de píxeles, respaldado por el resultado restoredPixels=true existente, sin repetir C. Source/ELF probados intactos. Siguiente START/EXIT con worker desde launcher, no Doom/WAD ni hardware.

Lifecycle conservado: guard __gc global, handles close, pausa/resume, EXIT y cierre al cambiar watchface. C/nodos retirados y archivos propios eliminados. /dev/rw4bridge: read32 o64 snapshot SIN EOF; read8 consume una tecla y devuelve0 si cola vacía. Nunca cat/read-all; no competir con consumidor UI. Crashes/panic/kill forzado no garantizan finalizador. Reloj monotónico C probado por separado; todavía no implementa DG_GetTicksMs/DG_SleepMs ni scheduling del motor. Persistencia C y WAD pendientes. Ergonomía y foco stock mantenido no demostrados.

- Nunca se conectó el reloj físico M2315W1. Gate físico cerrado; sin flash, exploits, mods APK ni DOOM/WAD. Hello C propio validado únicamente en el emulador.
- Guest Xiaomi Watch S3 / NuttX 0.0.0, revisión 9aec7d0ff1; pantalla configurada 390×450. No emulación exacta RW4/BES.
- ADB shell funciona por emulator-5554, servidor dedicado 5039. NAT 2512 está offline. Helpers comprueban puertos loopback/PID/ruta de QEMU y excluyen USB.
- Launcher actual fue iniciado por el usuario (PID inicial 27964). QEMU sobrevivió a resets por gRPC, incluido el baseline display; comprobar ownership vigente antes de actuar. La terminal del usuario se mantiene abierta.
- TouchEvents original empaquetado sin modificar sus seis fuentes/assets; compiler EasyFace original v4.23 revisado por hash y metadata/IL. Se ejecutó sin su ADB: transferencia automática omitida.
- Instalación propia 365799901 en /data/app/watchface/market. Backup de data image pausado y caché previo, readback SHA256 idéntico. Sin sobrescribir stock.
- En TouchEvents original: render, touch RELEASED, navegación stock, cierre Lua al seleccionar Storage y reentrada tras reset sin reinstalar demostrados. Ese ejemplo no tiene botón de salida propio. UIProbe posterior sí valida coordenadas absolutas y EXIT; gestos exhaustivos y fugas aún pendientes.
- Última watchface activa: Storage365700764. TouchEvents365799901 y UIProbe365799903 siguen almacenados. GoBack por teclado no fue un exit validado; swipe horizontal desde borde izquierdo sí volvió de Sound a Settings.
- Probe anterior de padres LVGL cerró QEMU con Bad ram pointer. Retirado, logs archivados; no repetir. No llama load_scr/exec-direcciones para explorar.
- Repositorio Git guarda documentación y herramientas propias. ZIPs, firmware, compiler, assets y logs permanecen ignorados. No publicar esos archivos.

## R60: reproducir

Checkpoint histórico. Para el modo actualmente almacenado usar R61:

```powershell
node tools/build-worker-frame.mjs
node tools/package-ui-probe.mjs wframe
# Storage activa y módulos propios ausentes antes de actualizar.
node tools/install-ui-probe-emulator.mjs update
# Esperar boot completo y comprobar UI responsive antes de stage.
node tools/worker-frame-emulator.mjs stage
# Abrir UIProbe y revisar Ready, SIN START previo.
node tools/test-worker-frame-emulator.mjs
# Tras cleanup de UI y seleccionar Storage:
node tools/worker-frame-emulator.mjs cleanup
```

`refresh` exige derivado propio existente y evita reset; ver condiciones R61. No hacer cleanup host si queda módulo: volver a UIProbe y dejar que su Timer retire caches/código primero.

Ver native-launcher-emulator.md. inspect-launcher.mjs, build-launcher.mjs, package-ui-probe.mjs worker; actualizar solo con Storage y módulos propios ausentes. stage después del reset; test-launcher-emulator.mjs empieza en Ready sin START. launcher-emulator.mjs state|cleanup rechaza tareas vivas.

Artefactos finales: native-launcher-1791086511822; launcher-close-1791086602592; launcher-reentry-1791086646164; launcher-final-1791086773782. ELF3788 SHA72a7f070468f6d2670de52079e57fd144feb0e6667583ffd2f23e0023f4edba9; source LF11e15ce8edc14fa0bf6b7073ea741df19097e03fd169f4bf5beb8498bc1e90a9. Watchface12660 SHA499d2d58570724f7a70c1af6ac61c4367bd00d92d88a3d5ad63bed70e2d86f6c. Cambio corto de Lua dejó cola antigua: backup del derivado, remove/push propio y readback exacto corrigieron sesión. Installer actualizado pero su nueva rama completa sigue sin runtime de reinstalación; la reparación manual equivalente sí pasó. No repetir START/EXIT salvo cambio/fallo pendiente.

## Próxima meta

R62 completó consumo de controles mantenidos en worker C y su cancelación cooperativa. Siguiente: verificar procedencia/licencia del WAD shareware y comprobar su lectura desde C, antes del motor real. No incluir WAD ni compilar Doom todavía; hardware fuera de alcance.

Preferencia del usuario registrada en [controls.md](controls.md): controles cómodos, táctiles inicialmente, sin asignar avanzar a pulsar la corona. Ahora consumidos por worker en R62, ergonomía pendiente; un dedo, zonas grandes, diagonal para avanzar+girar, menú con salida visible. Combatir mientras se mueve sigue siendo una limitación. No foco stock con dedo aún apoyado demostrado; HOLD TEST y STOP son pruebas distintas.

## Experimentos anteriores

UIProbe original, solo Lua: experiments/lua-ui/main.lua, launcher START/página/EXIT. Desactivar eventos/gestos no bastó (commit5ed95ec reproduce widgets stock); también se desactivó SCROLL_CHAIN_HOR/VER en objetos propios durante juego. Drags centrales4direcciones y hold no mueven home. Borde inferior aún abre panel; pageOnPause/pageOnResume confirmados con callbacks propios. Tap50,45 en panel no llegó a página. Dos EXIT/reentrada, luego Storage y Lua cerrado, sin reboot para salir. Lua5.4 y type(package.loadlib)=function dentro de watchface; en esa prueba loadlib NO invocado. No native worker/timers/canvas C. El puente posterior está descrito arriba.

Build final12168bytes SHA4a61184a1e46aeac951d5b74ad5c62f46120142cb58263acbfca79482fe43fc5; instalado3988c7741e4560bda4eadea22942596ea39999cc2fb7efa0780447860915400e. Logs ui-probe-exercise-1791058256861. tools/package-ui-probe.mjs y install-ui-probe-emulator.mjs; update verifica ID propio inactivo/recurso anterior, copia y readback antes de reset. tools/exercise-ui-probe.mjs exige página propia y marcadores PNG, pero capturas/logs requieren revisión.

Incidente PC: navegación automática tras reset activó Silent sin cargar UIProbe; restaurado OFF con captura y log set mute mode0. No repetir navegación multi-page sin capturas por paso; no asumir estado/tiempo de transición. Recursos/backup en artifacts/emulator/watchface-365799903 y emulator/local/backups. Los bordes globales requieren pausa del futuro C, no prometer exclusividad total.

Touch C: experiments/native-touch/observer.c abrió /dev/input0 read-only/nonblocking sin ioctl/grab; 36 muestras absolutas, tap60,90 y drag145,225. TouchEvents y panel stock respondieron durante la lectura; close=0, rmmod y tap posterior sin reboot. Logs artifacts/emulator/native-touch-1791048828975. Reset previo únicamente para baseline (UI estaba OFF). C imprime logs, no crea widgets. Flags DOWN repetidos en drag sintético: conservar estado. Build/run en tools/build-touch.mjs y run-touch-emulator.mjs; SHA ELF57a649bfcac60d98ed1120197d69ca19a2c26a98ad2c59ffd820eb9b055b8d54.

Display: consultas /dev/fb0 desde C confirman 390×450 RGB565, stride780, virtual390×900, memoria702000. Patrón temporal respalda ambos buffers en RAM, usa FBIOPAN_DISPLAY, restaura/free/close y luego rmmod. Capturas idénticas antes/después; en prueba activa touch cambia label y panel stock abre sin reboot. Al terminar esa prueba quedó TouchEvents; tras la sesión UIProbe quedó Storage.

Primer intento de input fue inconcluso: el guest estaba OFF desde 15:48:36 por inactividad, antes del patrón. Se reseteó solo el guest para baseline; el segundo patrón devolvió input sin otro reset. Key Power no despertó y no quedó como comando soportado. LVGL9/extension, CONFIG_LV_USE_OS=0, libuv: no llamar widgets desde NSH sin resolver contexto. No afirmar exclusividad del framebuffer ni FPS/RAM pico.

Avance: [hello C](hello-native-emulator.md). Arm 14.3 ZIP/checksum revisados, extracción local; build reproducible en este PC mediante tools/build-hello.mjs. Guest compilado con GCC 11.3.1, Cortex-A7/Thumb/hard-float. Import puts falla con error 2; enlace al símbolo del ELF exacto funciona. tools/run-hello-emulator.mjs bound carga desde /tmp, observa mensaje/lsmod, rmmod y elimina archivo. Dos ciclos, shell y captura TouchEvents posteriores correctos. Sin persistencia nativa, medición de RAM pico ni compatibilidad física demostradas.

Nunca usar direcciones de otros firmwares S3/Band10Pro de MiWatchNativeApps. El hello deriva puts del ELF guest identificado por SHA256 y conserva su bit Thumb; build/carga rechazan otra imagen. OpenVela actual difiere del guest; NuttX 12.3 es referencia histórica. Display con callbacks/LVGL necesitará uninitializer real antes de descarga.

## Comandos útiles

Desde C:\Users\steve\Documents\Devs\Doomed\redmi-watch4-doom:

```powershell
node tools/emulator-adb.mjs connect
node tools/emulator-screenshot.mjs current
node tools/build-hello.mjs
node tools/run-hello-emulator.mjs bound
node tools/build-display.mjs pattern
node tools/run-display-emulator.mjs pattern
node tools/build-touch.mjs
node tools/run-touch-emulator.mjs
node tools/build-lua-bridge.mjs
node tools/package-ui-probe.mjs loop
# Si ya existe UIProbe: seleccionar primero Storage antes de actualizar.
node tools/install-ui-probe-emulator.mjs update
# Después de boot/reset, preparar el payload temporal:
node tools/stage-lua-bridge.mjs stage
# Pruebas de cierre por consola, estando UIProbe inactiva:
node tools/test-lua-bridge-close.mjs normal
node tools/test-lua-bridge-close.mjs error
node tools/test-native-frame.mjs
# Seleccionar UIProbe y dejar en launcher, SIN START previo:
node tools/test-frame-loop-emulator.mjs
node tools/lua-bridge-state.mjs
# Tras el ensayo, probar otro START→Storage sin EXIT; después:
node tools/stage-lua-bridge.mjs cleanup
```

Si el emulador está cerrado, el usuario normal puede arrancarlo con tools/emulator-host.mjs start desde su PowerShell y dejarla abierta. No abrir una segunda instancia sobre el mismo disco. Antes de descartar un marker antiguo, comprobar PID/QEMU y salida registrada.

Build/install TouchEvents ya realizados: no repetir scripts que rechazan directorios existentes. Restaurar data exige cerrar y verificar que QEMU dejó de usar la imagen; no se necesitó ni se probó restauración. Backups bajo emulator/local/backups/, logs/capturas bajo artifacts/emulator/.

La terminal restringida no accede a GitHub para descargas; el usuario descargó ambos ZIP originales. Browser/conector GitHub permiten investigación. ExecutionPolicy bloquea .ps1; se usaron herramientas Node/PowerShell inline sin cambiarla.

En futuras pausas, guardar únicamente una nota breve con el siguiente paso. No iniciar verificaciones ni ampliar documentación por motivo de pausa.
