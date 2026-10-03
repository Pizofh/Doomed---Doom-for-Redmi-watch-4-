# Pantalla propia y ciclo de vida Lua

2026-10-03. Solo MiWatchEmulator v1.0 / Watch S3, 390×450. **Sin prueba M2315W1, DOOM ni nuevo módulo C.** UIProbe365799903 es una watchface propia: START abre una página con coordenadas/contador; EXIT vuelve al launcher. LVGL dibuja en el contexto de watchface, sin escritura directa del framebuffer ni reemplazo de pantalla global.

## Resultados

La primera versión (`5ed95ec`) desactivaba SCROLLABLE, EVENT_BUBBLE y GESTURE_BUBBLE, pero un arrastre90,230→300,230 abrió widgets stock. **Eventos y propagación del scroll son mecanismos diferentes.** [LVGL9 lv_indev_scroll.c](https://github.com/lvgl/lvgl/blob/v9.0.0/src/indev/lv_indev_scroll.c) recorre padres según SCROLL_CHAIN_HOR/VER. Fuente primaria de referencia; no certificamos las extensiones Xiaomi como idénticas.

La corrección desactiva ambas cadenas en objetos propios. Al entrar bloquea propagación en base/launcher; EXIT oculta la página y restaura navegación. No modifica objetos del sistema ni recorre sus padres.

| Operación | Observado |
|---|---|
| START, tap60,210 | Página propia y coordenadas absolutas |
| Drags centrales derecha/izquierda/arriba/abajo | Página delante, coordenadas/contador actualizados |
| Hold195,250 durante2,2s | No abrió selector de watchfaces |
| Borde inferior195,440→195,40 | Abrió panel stock: exclusividad universal **no demostrada** |
| Tap50,45 en zona vacía del panel | No llegó release ni aumentó contador propio |
| Cerrar panel | Página conservada y reanudada |
| EXIT, START, tap, EXIT | Dos cierres al launcher y reentrada sin reboot/reinstalación |
| Panel después de EXIT | Navegación stock disponible |
| Seleccionar Storage | Stock visible y log de cierre completo de Lua |

El gesto de borde cambia la UI delantera; no lo tratamos como control de juego. El futuro port debe reservar bordes o estudiar esta navegación, y suspender ejecución al ocultarse. El observador C de `/dev/input0` recibe todas las muestras: **no debe alimentar Doom indiscriminadamente**.

## Contexto y pausa

Guest SHA256 `849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa`. Inspección de `miwear_lua_pause`, `lua_activity_pause/resume`, `page_exec_func` y sus strings identificó `pageOnPause`/`pageOnResume`: busca función global y la llama protegida sin argumentos. No se ejecutaron direcciones para descubrir el contrato.

UIProbe define esos handlers, conserva handlers previos si existen y filtra input con `suspended=true`. **Probado:** abrir panel produjo `RW4_UI_PROBE: pause`; cerrarlo produjo `resume`. El tap vacío del panel no llegó a nuestra página. No hay worker C ni engine cuya suspensión/limpieza se haya demostrado.

La watchface imprimió `Lua 5.4` y `type(package.loadlib)==function`. No llamó loadlib, os.execute ni navigator.finish. Presencia de loadlib no prueba carga de ELF propio. EXIT conserva objetos ocultos y runtime del launcher; no equivale a descargar C. Seleccionar Storage sí cerró Lua.

## Reproducción y evidencia

Fuente propia: `experiments/lua-ui/main.lua`; preview PNG generado por código, sin assets ajenos. Compiler EasyFace v4.23 revisado, sin ADB junto al ejecutable. Instalación únicamente en ID propio, backup pausado y readback. `update` verifica recurso/registro anterior y watchface inactiva; guarda recurso previo. Invalida el caché conocido y resetea solo el guest. No escribe particiones/bootloader del reloj.

```powershell
node tools/package-ui-probe.mjs
node tools/install-ui-probe-emulator.mjs
# Si ya existe nuestra instalación, seleccionar antes Storage y usar:
node tools/install-ui-probe-emulator.mjs update
```

Después de boot, comprobar captura y respuesta. Ajustes → Watch faces → Watch faces → UIProbe, después de Storage/TouchEvents. Tras invalidar caché, el selector empezó en Neat: no asumir su posición. Seleccionar preview y START, entonces:

```powershell
node tools/exercise-ui-probe.mjs
```

El ejercicio exige marcadores PNG de color propios al empezar y después de operaciones que deben conservar/recuperar página o launcher. Lee píxeles, no edita imágenes; usa RGB capturado tras conversión RGB565. No reconoce toda la jerarquía ni prueba actividad por una captura: revisar logs/contador. Cierra panel por gesto y exige recuperar página antes de seguir pulsando controles.

Artefactos ignorados: `artifacts/emulator/ui-probe-exercise-1791058256861/`, screenshots homónimos; `ui-probe-v3-paused-panel`, `ui-probe-v3-resumed`, `ui-probe-v3-restored-stock`; mensajes en host-stdout.txt. Instalación/versiones en `artifacts/emulator/watchface-365799903/`, builds en `emulator/local/ui-probe-*`.

Paquete final: 12.168bytes, SHA256 `4a61184a1e46aeac951d5b74ad5c62f46120142cb58263acbfca79482fe43fc5`. Recurso con headerID: `3988c7741e4560bda4eadea22942596ea39999cc2fb7efa0780447860915400e`. Fuente LF: `9e5c762159d5a50ff79c3a310430f255d8215818c210184ac1e34ca77cbf264b`. No afirmamos reproducibilidad entre versiones de compiler/host.

## Incidente y límites

Una secuencia de coordenadas después de reset encontró otra pantalla y activó Silent del **emulador** por error, sin cargar UIProbe. Se descartó esa navegación automática y se restauró Silent OFF, confirmado visualmente y en log `set mute mode 0`. Causa precisa de transición inicial desconocida; no atribuida a Lua. Continuamos con capturas por paso. El guard del ejercicio rechazó capturas de widgets, modal y Settings; tras añadirlo pasó la secuencia sobre la UI final.

No se garantiza exclusividad universal, llamadas/notificaciones/corona, suspensión de C, fugas, FPS o memoria. UI routing no es sandbox. Archivos persistentes solo en emulador; finalizó activo Storage365700764 con Lua cerrado. Hardware físico intacto.

Próximo checkpoint: revisar contrato loadlib/dlopen y validar puente Lua→C mínimo que reciba eventos propios y respete pause/resume/exit. Timers monotónicos, FS/WAD y DOOM pendientes.
