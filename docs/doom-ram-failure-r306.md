# R306: DoomRAM mostró ERROR; retorno al menú normal

Usuario: CHECKING, un instante blanco, la misma UI con ERROR/indicador rojo.
Pudo salir y usar el menú normalmente. No apareció el juego. La condición
para el segundo ciclo no se cumplió; no se autorizó repetir START/reabrir.
No hubo nuevo comando físico después del reporte.

El error actual es genérico: no demuestra carga/arranque de C, fallo del
decoder ni descarga del módulo. Menú normal tampoco demuestra que C se haya
retirado. No forzar rmmod, borrar DoomRAM, reiniciar o restablecer vínculos.

Se amplió la prueba PC para usar el decodificador real S3: tanto la PNG
normal como el nodo virtual devuelven320×200 y permiten open/close.35checks
incluyendo VFS. No se inspeccionaron sus píxeles de salida; no es RW4 ni
prueba de que el lector RW4 admita ese nodo. La inspección estática local
no estableció causa. No se atribuye a stat, formato, memoria o caché.

Prototipos upstream usados solo como contexto de las llamadas S3:
[LVGL9.0 decoder API](https://raw.githubusercontent.com/lvgl/lvgl/v9.0.0/src/draw/lv_image_decoder.h).
No se copiaron esas direcciones o ABI al firmware físico.

Preparado [DoomTrace R307](doom-trace-physical-plan-r307.md): revisión pequeña
de Lua, sin nuevo ELF/WAD. Corrige la falta de observabilidad y añade salida
ordenada tras errores de imagen; todavía no corrige una causa de render
demostrada. Permite distinguir RAM/archivos/carga/control/VFS/creación/
dimensiones con un código y mostrar FREE/MAX, agrupado en un único ensayo.
