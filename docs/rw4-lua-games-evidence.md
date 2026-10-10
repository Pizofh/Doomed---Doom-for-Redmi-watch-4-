# Watchfaces Lua y juegos: evidencia RW4

R99, 2026-10-09. Investigación solicitada por el usuario; sin conexión al
reloj, instalación, compilación ni ejecución de paquetes nuevos.

Las afirmaciones del usuario tienen respaldo: existen scripts de watchface
para RW4 y publicaciones originales de juegos Lua para este modelo. Esto
reduce la incertidumbre sobre la superficie gráfica e interactiva, pero no
demuestra que nuestro módulo C del emulador sea compatible con el reloj.

| Afirmación | Evidencia primaria | Alcance y límite |
|---|---|---|
| Hay scripts RW4 con LVGL y touch | [MiWatchLuaWatchfaces](https://github.com/m0tral/MiWatchLuaWatchfaces), [TouchEvents/main.lua](https://raw.githubusercontent.com/m0tral/MiWatchLuaWatchfaces/master/RedmiWatch4/TouchEvents/app/lua/main.lua) | Código específico disponible; eventos PRESSED/PRESSING/GESTURE/RELEASED. Nuestra validación previa fue en S3 emulado. |
| Hay un juego Duck Hunt Lua para RW4 | [Publicación del autor](https://www.reddit.com/r/miband/comments/1iyfbrj/redmi_watch_4_nes_retro/) | m0tral lo presenta como juego propio sobre el motor Lua RW4. El título NES Retro no demuestra un emulador NES ni ejecución de ROM original. La descripción automática de la imagen dice Apple Watch; no usarla para identificar hardware. |
| Hay Battle City como watchface Lua y versión RW4 | [Hilo del autor](https://www.reddit.com/r/miband/comments/1vfpcaa/battle_city_for_mb10_promb9_pro/) | Autor identifica Lua/watchface y versión RW4. Hilo principal MB9/10 Pro; sin firmware RW4 exacto ni fuente del juego revisada. |
| Watchface Lua y app independiente son rutas distintas | [Artículo original, 2025-04-05](https://habr.com/ru/articles/897742/) | Explica empaquetar Lua como watchface; atribuye la ejecución RW4 como app independiente a firmware especial propio. No concluir que todo juego requiere modificar firmware. |

## Riesgo proporcional

Una prueba que solo usa widgets/eventos del runtime existente evita introducir
un nuevo módulo nativo y sus dependencias de ABI. Priorizarla es una inferencia
de ingeniería, no una medición de probabilidad de fallo ni prueba de sandbox.
El artículo del autor también afirma acceso a shell mediante `os.execute()`;
sin versión/código de reproducción RW4/2.2.86, permanece como indicio, no
capacidad confirmada de nuestra unidad. Importa lo que hace el script.

[Xiaomi documenta](https://www.mi.com/uk/support/faq/details/KA-228715/) un
fallo de la esfera Light and Night que provoca crash/reinicio; propone quitar
la esfera desde el reloj o Mi Fitness. Es evidencia de problemas recuperables
de watchfaces, no de hard brick ni recovery general de firmware.

El hilo Battle City contiene un usuario que no podía salir y reporta resolverlo
quitando la watchface desde la app. No identifica su modelo/firmware: no
atribuir ese incidente al RW4. Refuerza la necesidad de salida, sin demostrar
daño permanente. Las fuentes revisadas no documentan hard brick de estas
pruebas Lua; la búsqueda no demuestra riesgo cero ni permite cuantificarlo.

## Implicación para nuestro objetivo

Priorizar una watchface conocida, con fuente revisable, salida y retirada
documentadas, como primera prueba futura. Aún falta la ruta de instalación
para esta unidad/firmware; los ejemplos comunitarios citan Mi Fitness mod,
que no instalaremos como consecuencia de esta investigación.

Juegos escritos en Lua no prueban ejecución de doomgeneric C, memoria
suficiente, carga ELF o WASM. Mantener Doom real como objetivo; no recrear
su motor. Antes de nativo necesitamos evidencia de ABI/loader/privilegios
del RW4, independiente de los ejemplos de juegos.

La consulta física sigue diferida por R97. R99 no autoriza instalar una esfera,
conectar nuestra app, modificar firmware ni enviar código al reloj.
