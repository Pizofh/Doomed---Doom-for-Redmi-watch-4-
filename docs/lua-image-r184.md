# R184 — imagen empaquetada desde Lua, validada solo en emulador

**Actualización R187:** el mismo paquete fue instalado una vez tras revisión;
[usuario confirma imagen y retorno normal en el RW4](lua-image-physical-result-r186.md).
Los datos inferiores conservan la preparación/prueba inicial de PC/S3.

2026-10-12. No conexión nueva al reloj, teléfono, USB o Bluetooth. El usuario
confirmó previamente LuaDiag y navegación normal en M2315W1/2.2.86. Esta
prueba nueva no se ha enviado físicamente.

## Propósito y fuente

Comprobar `Image` sin depender de Label/Font. El ejemplo comunitario
[RW4 TouchEvents/image.lua, revisión fija 5af6e14](https://github.com/m0tral/MiWatchLuaWatchfaces/blob/5af6e14ea92830a394c88dc04f76ceef697a6ded/RedmiWatch4/TouchEvents/app/lua/image.lua)
utiliza `SCRIPT_PATH .. filename`, `root:Image {src=...}`, `get_img_size()` y
`set`. Su blob local revisado es `07258c4d46147aa1db2584d1c3cf35e8a394c339`.
Es una pista específica de RW4, no evidencia de funcionamiento en nuestra
versión física. Nuestro código y gráfico son propios; no se copió el gato.

`experiments/lua-image/main.lua` crea un panel centrado de 192×144, un marcador
amarillo y una imagen de 96×64: rojo/verde arriba, azul/naranja abajo, cruz
blanca central. El segundo marcador es verde si la construcción y dimensiones
terminan correctamente, rojo si falla. **Solo ver los cuadrantes confirma
render de imagen; verde por sí solo no lo confirma.**

Preview negro con barra blanca, distinto de la imagen de ejecución. No labels,
fuentes, timers, callbacks propios de touch, shell, módulos ni C/Doom propios.
Lectura de un único recurso empaquetado mediante LVGL; no `io` ni escritura
desde Lua. Se comprueba `SCRIPT_PATH` string con `/` final y dimensiones exactas.
Solo nuestros objetos pierden CLICKABLE/SCROLLABLE; no se modifican ancestros
o navegación del sistema. No afirmar aislamiento de privilegios.

## Paquete fijo

| Dato | Valor |
|---|---|
| ID / nombre | 365219993 / LuaImage |
| Tamaño | 9328 bytes |
| SHA256 paquete | `150f285b7e63cc99519b32cde0b93fe35784cc5ba2d60a5d01746f1064483e49` |
| SHA256 main.lua | `df7e732b18955e47d252ea08fe0e9af7b4ed3a526b83ed8dd2ee4846b20c0078` |
| SHA256 PNG | `2988d113d2d69931201b4c4274a3828aaa49ef689352c9d18548e7c30730bfe1` |
| PNG original | 194 bytes, RGB8, 96×64; generado por script |
| Artefacto local ignorado | artifacts/lua-image-r184/LuaImage-id-only.face |

Compiler EasyFace4.23 revisado, sin ADB adyacente; perfil365/Shape34. Byte5=0,
campo ID corregido exclusivamente en nuestra copia. Código y PNG se encuentran
exactos dentro del paquete; no conversión del PNG por el compiler en este caso.
Original del compiler y paquetes anteriores intactos. No binarios en Git.

## Resultado local observado

`review.json` conserva el estado inicial previo al ensayo. El resultado
posterior está en `artifacts/emulator/lua-image-r184/validation.json`.

MiWatchEmulator v1.0, **guest Xiaomi Watch S3, no réplica M2315W1**, 390×450.
Guard de ownership QEMU/puertos; ADB dedicado5039/emulator-5554. Copia previa
de data pausada, sin snapshot RAM ni garantía de consistencia FAT. Instalación
solo en `/data/app/watchface/market/365219993`, readback SHA idéntico; invalidación
de caché/reset únicamente del guest. Mismo paquete byte5=0 que se propone al reloj.

- Preview barra blanca inspeccionado en selector.
- Imagen real visible: cuatro cuadrantes, cruz blanca, panel oscuro y marcadores.
- Checker valida nueve píxeles de colores/fondo y dimensiones reportadas 96×64.
- Panel stock abre y cierra; PNG de ejecución idéntico antes/después.
- Cambio a Storage 365700764 cierra Lua según log; propia registrada/inactiva.
- Fuente y PNG extraídos del guest coinciden exactamente con sus hashes.
- Los 27 IDs anteriores permanecen; catálogo final 28. Sin módulo C propio cargado.

Una primera secuencia de navegación en PC pulsó Sound and vibration por no
esperar la transición de pantalla; se volvió atrás sin cambiar ajustes. Las
acciones siguientes esperaron animaciones y comprobaron capturas antes de
seleccionar. No se modificó el toggle stock de pulsación larga: estaba OFF;
por tanto, esta prueba **no valida longpress**. No FPS/RAM/decodificación
dinámica/frames desde C medidos, ni compatibilidad física inferida.

Capturas/logs/checker en `artifacts/emulator/lua-image-r184` y
`artifacts/emulator/screenshots/lua-image-r184-*.png`, ignorados.

```powershell
# Primera construcción/instalación; rechazan sobrescritura. Ya hechas aquí.
node tools/package-lua-minimal.mjs image
node tools/install-lua-minimal-emulator.mjs image
# Abrir LuaImage manualmente en selector del guest, observar, volver a Storage.
node tools/check-lua-minimal-emulator.mjs image
```

No trasladar coordenadas del emulador al reloj. Helpers aceptan modos fijos,
sin endpoint/ID/path arbitrarios. El PNG se genera a partir de código propio,
sin dependencias o descargas nuevas.

## Qué queda pendiente

Mostrar la misma imagen físicamente bajo [plan R185](lua-image-physical-plan-r185.md).
Incluso si pasa, solo demostrará un recurso estático mediante Image: quedan
formato/actualización de frames, filesystem/runtime y mecanismo C/ABI/privilegios
del RW4. El [ADR0004](adr/0004-lvgl-labels-are-not-a-doom-rendering-gate.md)
mantiene Doom en C; no se traduce el motor a Lua.
