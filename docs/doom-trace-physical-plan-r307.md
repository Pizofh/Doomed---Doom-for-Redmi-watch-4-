# R307: DoomTrace, revisión pequeña con código de fallo y salida ordenada

**Actualización R308:** usuario autorizó instalación y ensayo. Un envío quedó
registrado inactivo; gates restaurados y catálogo anterior conservado.
[Instalación y siguiente ensayo manual](doom-trace-install-r308.md).
El estado pendiente de aprobación descrito abajo corresponde a la preparación.

**Solo PC, pendiente de aprobación física.** Una instalación y UN START,
observado con batería≥50%. Se necesita porque ERROR de R306 no identifica
el paso que falló y el decoder S3 no reproduce el fallo. No es una corrección
confirmada de la imagen. No repite el envío de634KB ni cambia C/bindings/WAD.

| Elemento | Valor |
|---|---|
| Reloj/firmware |M2315W1 /2.2.86 |
| Paquete |DoomTrace, ID365219956,31.864bytes,26recursos |
| SHA256 paquete |`5cb06a7c3135412f54203afe7a8e4233c1b4395f58ff5cf6f1206eec702609d6` |
| SHA256 Lua |`a58190e62aaad411f9f10934fdf7f272ebcff76f14fa606158b8927ddadcb74f` |
| Artefacto |artifacts/doom-trace-r307/package-reviewed/DoomTrace-id-only.face |
| Journal nuevo |tools/local/pc-rfcomm/doom-trace-r307.json |
| C reutilizado |365219957/lua/doom.elf,604992bytes,SHA6a5d43df8a3c9753c6b943ca5fd25a9835edd7cd97b4f93a33aa199d8926704e |
| WAD reutilizado |365219963/lua/doom1.wad,4196020bytes,CRC371943786 |

No activar, borrar ni reemplazar esferas desde PC. Último catálogo13entradas;
se conserva el actual, no una lista histórica rígida.16partes,32194bytesMASS
más512control dentro de32768. Si rechazo/corte: parar sin retry/resume.

## Comportamiento y alcance

Al seleccionar **puede cerrar y retirar C de DoomRAM si sigue residente**,
solo tras comprobar nombre rw4png304, lease/hash/registro/estado y dueño.
Usa la recuperación ya presente en el controller: STOP cooperativo,
finished/detach-cache/JOIN/balance/identidad/rmmod/registro/nodos. Si algo no
cuadra, ERROR40 y no carga otro C. No asume que C esté retirado porque el
menú funciona; no adopta módulos sin lease coincidente ni fuerza descarga.

START de un uso escribe marca propia14bytes. Primero lee RAM (evita esperar
el CRC si ya falta memoria); después CRC completos/cabeceras/tamaños y otra
lectura RAM antes del mismo insmod. Mantiene minfree6467285/largest4194320.
Muestra FREE/MAX en bytes, con dígitos PNG propios, sin fuentes de sistema.

Antes de la primera Image lee33bytes del nodoPNG con buffering desactivado,
valida firma/dimensiones, seek-end192278, EOF y cierre. No escribe imágenes.
Después intenta la Image virtual y comprueba tamaño. Si funciona, renueva
frames sin controles de juego en esta revisión, con EXIT/autoSTOP~30s.

Ante excepción fija el código y pide STOP normal; sigue procesando el cierre
cooperativo en Timer. ERROR sigue visible aunque consiga retirar C; el rótulo
**CLOSED adicional** abajo solo aparece al recibir CLOSED del controller.
Si STOP/cierre falla, no fuerza nada: conserva módulo/lease para revisión.
GC solo solicita STOP; no usa LVGL/JOIN/rmmod. No hay log crudo en pantalla.

| Código | Paso en el que se recibió la excepción |
|---|---|
|01 |Marca/CRC de archivos |
|02 |Lectura/umbral de RAM; anotar FREE/MAX |
|10–13 |Cabeceras/tamaños, registro, nodos, lease |
|14–18 |insmod, identidad, estado fresco, lease, START nativo |
|19 |Lectura/contrato del estado C |
|20–24 |Open, cabecera, tamaño, EOF o close del nodoPNG |
|25 |Creación de Image |
|26 |Consulta/validación320×200 de Image |
|27 |Presentación del panel |
|30 |Postcondiciones de salida/descarga |
|40 |Recuperación de un módulo residente |

Código indica la última operación instrumentada; no prueba una causa de bajo
nivel ni identifica qué componente lanzó la excepción. El fichero cargado
antes de ERROR puede permanecer; no borrar DoomRAM/DoomLauncher.

## Un envío y un ensayo después de aprobación

1. Abrir solo Static/r307 y C#Static; Large/deployment/RAMPNG/resume/control
   cerrados. Reconstruir, preparar y UNA ejecución `install r307`.
   Finally restaurar fuentes/gates, reconstruir y test cerrado; si registra,
   una consulta independiente de catálogo, sin activarla desde PC.
2. Usuario elige **DoomTrace**, preview CUATRO barras BLANCAS. Pantalla inicial
   con panel oscuro, START/EXIT, FREE/MAX y dos dígitos00. Si RECOVERING,
   esperar sin START. Solo continuar si READY/CLOSED con START habilitado.
   Si ERROR inicial, anotar código y FREE/MAX y no pulsar START.
3. START UNA vez. Mantener despierta durante CHECKING mediante toques breves.
   Si aparece ERROR, anotar código/FREE/MAX y si aparece el rótulo CLOSED;
   esperar unos segundos, sin repetir. Si aparece juego, observar si se ve
   completo y animado unos5s, EXIT antes de30s y anotar CLOSED.
4. Volver a habitual y confirmar menús/corona en el mismo reporte. Si falla,
   vacío o suspensión, no repetir/reabrir; salir desde Ajustes si responde.

## Riesgos y evidencia

Persisten los riesgos de [R304](doom-ram-png-physical-plan-r304.md): carga de C
sin aislamiento, OOM/bloqueo/panic/corrupción, decoder y retiro de caché sin
garantía integral. No hay recovery integral validado. Añade lectura/seek/EOF
directos del nodoPNG y tratamiento de salida tras error; se reutilizan sus
callbacks C pero esta secuencia no se probó físicamente. Instalación/marca
escriben flash; no hay frame writes ni firmware/particiones/bootloader tocados.
Límites cooperativos, no watchdog. No reiniciar/flashear ni forzar recuperación.

32casos Lua S3:22base+10nuevos, incluidos RAM, open/header/seek/EOF/close,
creación/tamañoImage, salida normal tras error y recuperación previa propia.
Native/widgets simulados en esos casos. Paquete/pins/readback26recursos,
presupuesto y gate cerrado pasan; prepare r307 OfflinePrepared. Helper cerrado
SHA256d403798e60b91c7fa9c124aeef50024465b75eee30a34fbd28c45af04906b531.
No nueva conexión física tras R306. No FPS/cierreC físicos nuevos medidos.

Reproducir: test-doom-trace.mjs, package-doom-trace.mjs (inmutable),
test-doom-trace-package.mjs. Los directorios package y package-final conservan
salidas previas descartadas; solo package-reviewed corresponde al pin aprobado.
