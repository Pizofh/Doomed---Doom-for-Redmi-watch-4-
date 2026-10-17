# R349 DoomPads: retroceso, acción y controles compactos

Ensayo físico R350 completado: usuario confirma controles e interacción
correctos, pausa/salida CLOSED y juego sin lag. TIME26809ms,TICS948,IMAGES273,
C ERROR0,GPU CODE0,PHASE2. Solicita flechas ligeramente mayores; los otros
botones le resultan cómodos.273/26,809≈10,18presentaciones/s, sin medir FPS del panel.

Deriva de DoomWide probado físicamente con pausa y salida correctas.
Conserva la imagen proporcional de aproximadamente383×239, zoom306/256,
antialias0, dos buffers512000B, zona4MiB, timer40ms y una lectura de estado
por tick. Los botones quedan debajo del juego y dejan libre el HUD.
No se añade PNG por cuadro, escalado por CPU ni nuevos bindings gráficos.

Cruceta a la izquierda: avanzar, girar izquierda/derecha y retroceder.
FIRE y USAR a la derecha; PAUSA/SEGUIR y SALIR más pequeños abajo.
USAR corresponde a la tecla original de puertas/interruptores de Doom.
La entrada sigue siendo de un dedo; no se promete multitouch.

Se sustituyen únicamente adapter y transporte; el enlace reproduce primero
el ELF Wide byte por byte. La versión5 y /dev/rw4doompads separan el protocolo
de seis teclas del anterior. Se rechazan avance+retroceso, izquierda+derecha,
máscaras fuera de0..63 y protocolos anteriores. La liberación tardía de un
botón no cancela otro botón nuevo. Pausa/salida conservan liberación y join.
Dos contadores atómicos permiten comprobar BT_USE/usedown del motor real.
El incremento estático RW4 es144B, dentro del margen4KiB existente; el umbral
de RAM sigue siendo conservador, no una medida de todo el driver gráfico.

Ensayo propuesto: una instalación inactiva, un START manual,20s de juego.
Probar las cuatro direcciones, FIRE, USAR frente a una puerta, PAUSA/SEGUIR
y SALIR. Solo READY permite START. Ante error/corrupción/suspensión no repetir
ni reabrir; recoger C ERROR/GPU CODE/PHASE con MODE si responde.
Conservar DoomWide942 y DoomLauncher963. Sin reboot previo ni reenviar WAD.
No borrar, activar automáticamente, reintentar o reanudar una transferencia.
Asumir menús/corona normales salvo aviso del usuario.

Pendiente aprobación específica del nuevo payload por la regla inicial del
usuario: cambia entrada nativa C y eventos de UI; puede bloquear, causar panic
o corrupción. Recuperación integral todavía no validada. El límite de ejecución
es cooperativo y no interrumpe callbacks bloqueadas.

Solo commits locales. No push ni comprobaciones de CI remoto.

## Evidencia y paquete cerrado

- Motor real S3 con hilos, dos ciclos: avance/retroceso con proyección sobre
  el ángulo del jugador, giro, disparo, acción real usedown, pausa/resume,
  nueve rechazos por ciclo y STOP/join/cierre/unload.14alloc/14free.
- Nueve casos Lua, main final parseado; seis entradas y liberación cruzada.
 100ticks:200aperturas de control y cero actualizaciones PLAYING repetidas.
- Dos partidas UI con main de producción:150presentaciones cada una,
  munición50→49, USAR llega al motor, teclas0 al pausar. Gametic e imagen
  congelados600ms; SEGUIR retoma189→190. Capturas comprueban PAUSADO/SEGUIR
  y juego en ambas franjas laterales. Sin errores;14alloc/14free y PHASE2.
  Fixture restaurada por hash, módulo/nodo/temporales propios ausentes.
- 46recursos extraídos y comparados. Siete escenarios de transferencia
  simulados y siete del paquete Wide anterior pasan. Gates físicos cerrados
  antes de leer datos privados; prepare offline sin radio ni journal.

| Elemento | Pin |
|---|---|
| Nombre/ID/preview |DoomPads/365219941/cruceta y dos botones CIAN|
| Paquete bytes/recursos/partes |646764/46/317|
| SHA256 paquete |e2290d4225e208c6c2e398b499b3c37af80fc96942dd5764d83e319487f2ff38|
| Lua21240B SHA256 |5ed7250a2f6fdc085ae0d81c55553a011fb4b9a7e599a54a3e4cf043098333b1|
| ELF607400B SHA256 |98d9082e606f213633c379593bb8b7937f9de3bbdf24f0c5269fa369001a0423|
| Módulo/nodo |rw4pads349 /dev/rw4doompads|
| Journal privado nuevo |tools/local/pc-rfcomm/doom-deployment/pads-r349.jsonl|

Prepare:317partes/652813wire. DEPLOYMENT/PADS_R349/C#Large cerrados.
Runner de un intento preparado en artifacts/doom-pads-physical-r350/
install-once.ps1; no ejecutado. Abre solo los permisos correspondientes,
restaura bytes exactos finalmente y reconstruye/verifica el helper cerrado.
R350: usuario autorizó una instalación y un ensayo observando batería>=50%.
Runner ejecutado una vez: RegisteredInactive,317partes,offset0, registro
confirmado; contenido no releído. Selección sin activar por cliente.
Conexión cerrada y worker exit0. Gates restaurados; helper cerrado reconstruido,
5589asserts y siete escenarios offline pasan. Ensayo manual completado arriba.
No repetir envío. Reportes sanitizados: artifacts/doom-pads-physical-r350/
install-result.json y gates-restored.json.

Evidencia local: build/doom-pads-r349/{rw4,s3-ui,s3-model,package};
artifacts/research/pads-launcher-r349/result.json;
artifacts/emulator/pads-ui-r349/{result,cleanup}.json;
artifacts/doom-pads-r349/package-tests.json. Antes de las pruebas UI se
reinició únicamente la VM, sin módulo propio, porque la UI stock no respondía
tras inactividad. Ambos ciclos finales cerraron sin reinicio. Sin FPS físico
inferido desde emulador ni cambios/reinicios del reloj durante R349.
