# Lua: lifecycle y prueba fallida

2026-10-03. Solo MiWatchEmulator v1.0, guest S3; hardware físico intacto.

## Resultado

`lua -i` mantuvo el intérprete vivo mientras se ejecutaba TouchEvents con fuente por defecto. Tras tres segundos, la captura seguía mostrando almacenamiento stock. El CLI salió con status 0 mediante `os.exit(0,true)`, sin shell desde Lua. La captura posterior fue idéntica. Mantener el intérprete no basta para activar la UI.

La prueba posterior instrumentó createRoot y consultó resolución, pantalla, visibilidad y objetos padre. Resultado parcial: 390×450, pantalla del sample igual a pantalla activa, dos objetos no visibles. Al consultar el tercer ancestro, stdout quedó truncado. El host terminó con exit code 3221226505 (0xC0000409); stderr QEMU: `Bad ram pointer 000000000000014C`. No hay evidencia suficiente para atribuir la causa exacta a un getter, threading o limpieza. No repetir este recorrido de objetos. No fue un brick del reloj.

La variante interactive fue retirada de tools/try-touch-events.mjs; su código y logs quedaron archivados localmente para diagnosticar el fallo. Próximo camino: packaging watchface y activación por la UI stock. No intentar arreglarlo llamando direcciones, inventando APIs o añadiendo un bucle infinito.

## Fuentes contrastadas

- [LuaVGL original](https://github.com/XuNeo/luavgl/tree/62868a05b0b3e79b91f49ce9c3661750ffe55d02): src/luavgl.c administra raíz y GC; src/obj.c usa ctx->root como padre cuando Object recibe nil. get_parent no contiene un retorno nil explícito para padre NULL. src/disp.c documenta load_scr; simulator/main.c mantiene lua_State hasta destruir la página. Es upstream relacionado, no fuente exacta verificada del firmware guest.
- [Documentación comunitaria](https://github.com/FangAiden/Vela_Application_Documentation/tree/db51cbdf3307cdfb8ed131dab4ba8b061c336a83): conventions declara introspección y ejemplos de otro emulador 466×466/NuttX 12.3.0. APIs se usan como pistas, no compatibilidad RW4. No se ejecutó su código.

La hipótesis de cierre/GC explica por qué un CLI puede no conservar UI, pero no explica por sí sola nuestro resultado interactivo. Exposición de funciones no demuestra contexto válido de llamada ni seguridad de todos sus argumentos.

## Artefactos y recuperación del PC

Logs/record de la instancia fallida archivados bajo artifacts/emulator/failure-20261003-lua-parent/. Logs del experimento en artifacts/emulator/lua-touch/ y capturas touch-repl-active/after.png. Son ignorados; no publicar imagen/firmware ni dumps.

La instancia 21176/14408 terminó y no se encontró ningún proceso con esos PIDs. Preset/data son copias de trabajo; el ZIP original permanece intacto. Relanzar bajo cuenta normal mediante tools/emulator-host.mjs start. Comprobar boot/ADB e integridad funcional del guest antes de otra mutación. No dar por comprobada la integridad de FAT a partir de un relanzamiento exitoso.

El usuario relanzó la instancia con PID de launcher 27964. Se verificaron propietario QEMU de los puertos loopback, ADB online, ps/free, lista market y captura stock. Recuperación funcional observada; no se hizo un chequeo completo de FAT.

## Inspección read-only de la imagen stock

tools/inspect-romfs.mjs lee el ROMFS del paquete revisado sin montarlo ni modificarlo. Valida rangos, alineación, checksum del superblock y límites de recorrido; no sigue links ni ejecuta Lua. Formato contrastado con [documentación del kernel](https://docs.kernel.org/filesystems/romfs.html). No verifica checksums individuales de todos los archivos.

Imagen vela_system.bin: 334980096 bytes, SHA256 a5bfb2c971423a623aa85e938a00f8724f5fd16563e4a3dfa635ee3ee28ac13f. Se enumeraron 7108 entradas, incluidos contenedores ROMFS anidados. El script /vela_watchface.bin:/lua/miuiwatchface/miuiwatch.lua devuelve una tabla ui con ui.init(style) y ScreenStateChangedCB. Evidencia directa del contrato de ese script stock; no demuestra el mismo contrato para todos los widgets Shape 34 ni para RW4.

```powershell
node tools/inspect-romfs.mjs
node tools/inspect-romfs.mjs '/vela_watchface.bin:/lua/miuiwatchface/miuiwatch.lua'
node tools/emulator-adb.mjs ui-help
```

am declara «am <start|stop> packagename»; no se invocó start/stop ni se demostró que lance watchfaces Lua. package.loaded contiene activity.isShown y navigator.finish; screen es una tabla vacía en esta consulta. Solo se enumeraron tipos, sin llamar esas funciones. El metadata rpk_info.json de la imagen enumera cinco paquetes; no prueba que estén instalados, sean ejecutables o admitan C/WASM.
