# R347 DoomWide: imagen ampliada, controles redistribuidos y pausa visible

Ensayo físico R348 completado: el usuario confirmó imagen grande, fluidez,
controles, PAUSA/CONTINUAR y salida CLOSED correctos. TIME25153ms,
TICS851, IMAGES247; C ERROR0, GPU CODE0, PHASE2. Menús normales.
Solicitó añadir retroceso y acción, redistribuir controles y reducir PAUSA.
El cociente 9,82 presentaciones/s incluye pausa; no es FPS de panel medido.
La propuesta siguiente es R349; no ampliar más el ancho ni cambiar el renderer.

R348: usuario autorizó una instalación y un ensayo. Paquete RegisteredInactive,
317partes sin resume, sesión cerrada y worker exit0; registro confirmado,
contenido no releído. Gates restaurados, helper cerrado verificado y ensayos
offline de cierre pasan. Ensayo manual pendiente; no repetir el envío.
Reporte: artifacts/doom-wide-physical-r348/install-result.json.
Usuario eligió ampliar manteniendo proporción y pidió optimizar
antes del ensayo, conservando la fluidez conseguida por DoomTouch.

## Implementación y rendimiento

El motor, transporte, dos buffers512000B, núcleo de publicación/fences y sus
objetos compilados no cambian. Se reconstruyó el ELF anterior byte por byte
antes de sustituir únicamente el backend de UI. No otro render, copia escalada,
buffer de juego ni PNG por cuadro. Fuente320x200.

La Image stock recibe zoom306/256 y antialias0 una sola vez, después del primer
set_src, en el propietario UI. Escala uniforme1,1953: aproximadamente383x239,
centrada en x195,y130. Sin suavizado para evitar filtrado adicional. No se
eliminan esperas/fences ni comprobaciones de ownership para ganar velocidad.
Los setters se verifican por huellas64B antes de crear la Image.

AP fijado: propiedad zoom en19a144, setter4d420; antialias en19a150,
setter4d538. Se verificaron los punteros de tabla, escala en image+54,
bit7 de image+56 y pivot centrado en set_src (image+50/+52). Código/firmware
solo inspeccionados estáticamente; la identidad de estas funciones en vivo
requiere el ensayo. El backend S3 usa sus propios símbolos LVGL9.

Todos los botones quedan debajo de la imagen, y dentro del contexto Lua de
la esfera: no cubren el HUD ni añaden mezcla de transparencias al área animada.
Fondo35%, áreas de toque grandes, PAUSA y SALIR de145x50. PAUSA cambia a
CONTINUAR y aparece PAUSADO. Se retiran visuales y hits al cerrar/pausar página.
Se mantienen timer40ms,750ticks (~30s cooperativos), una lectura de estado por
cuadro y deduplicación de PLAYING. CHECKING y el WAD compartido no cambian.

ELF607116B; aumento de secciones residentes con alineación242B frente aDirect.
Guard FREE6727235 (margen4096B añadido), LARGEST4194320, zona4MiB.
No es una medición de todo el heap/driver gráfico. La salida ampliada dibuja
más píxeles de destino; no se garantiza la misma velocidad sin medir hardware.

## Validación

- Build RW4 y S3 reproducen el baseline anterior por SHA y dejan cero imports.
  Compilación ARMv8-M/soft para RW4; sin ejecutar ese binario en el emulador.
- Nueve casos del controlador Lua, main final parseado;100ticks conservan
  exactamente200aperturas de control y cero cambios PLAYING redundantes.
- Dos ciclos UI S3 con main final:111/104presentaciones,14alloc/14free, cero
  error y cierre/join/unload. Disparo50->49; máscara de teclas0 al pausar.
  Durante600ms adicionales no avanzan gametic ni presentaciones. CONTINUAR
  vuelve a avanzar:134->135 y133->135. Comparación de glifos en captura confirma
  CONTINUAR y PAUSADO (560/460píxeles de tinta visibles). Ambas franjas laterales
  muestran juego ampliado. Capturas inspeccionadas, HUD libre.
- UIProbe/source restaurado por hash; módulo/nodo/temporales propios retirados.
  Antes de las pruebas se reinició solo la VM, sin C propio cargado, por UI
  stock sin respuesta a gestos. Los dos ciclos finales cerraron sin reinicio.
- Paquete44recursos extraídos y comparados, sin WAD, siete escenarios de envío
  simulados; pin anterior Touch conservado y sus siete escenarios pasan.
  Sin pruebas redundantes del motor/core que permanecen idénticos.

Evidencia: build/doom-wide-r347/{rw4,s3-ui,package}; artifacts/research/
wide-launcher-r347; artifacts/emulator/wide-ui-r347/{result,cleanup}.json;
artifacts/doom-wide-r347/package-tests.json. No inferir FPS RW4 desde la VM.

## Paquete y ensayo único propuesto

| Elemento | Pin |
|---|---|
| Nombre/ID/preview |DoomWide/365219942/marco NARANJA|
| Paquete bytes/recursos/partes |646628/44/317|
| SHA256 paquete |275e1aa7383f021af2cbb549ad170991d38f2b25912f99f18bfe59234b8c96b3|
| Lua21169B SHA256 |b89ab9b7e473231eaee03762c2e02fcb4003559726f5051a1147a8ef45480a60|
| ELF607116B SHA256 |408caa1de2e6f6c697012be26b0a43645fd502e88b5259d932acff9b6d4a8275|
| Módulo/nodo |rw4wide347 /dev/rw4doomdirect|
| Journal privado nuevo |tools/local/pc-rfcomm/doom-deployment/wide-r347.jsonl|

1. Usuario observando, batería>=50%. Un envío inactivo. Conservar DoomTouch943
   como respaldo y DoomLauncher963 (WAD). Sin reboot, activación automática,
   borrado, reenvío o resume. No carga C desde PC.
2. Seleccionar DoomWide, marco naranja. Solo READY ->START una vez, mantener
   CHECKING despierto con toques breves fuera de botones. Probar controles,
   PAUSA: deben congelarse el juego y aparecer PAUSADO/CONTINUAR. Esperar2s,
   CONTINUAR y comprobar movimiento. SALIR antes20s; un ciclo autorizado.
3. CLOSED ->TIME MS/TICS/IMAGES y sensación de fluidez frente aTouch. El tiempo
   incluye pausas, no comparar el cociente como un benchmark controlado.
   ERROR/corrupción/suspensión/UI o botones ausentes ->no repetir ni reabrir;
   MODE muestra C ERROR/GPU CODE/PHASE guardados; volver desde Ajustes si responde.
   Asumir menús/corona normales salvo aviso.

Prepare offline:317partes/652677wire, sin radio ni journal. Gates
DEPLOYMENT/WIDE_R347/C#Large cerrados. Runner R348 ejecutado una vez tras
aprobación: artifacts/doom-wide-physical-r348/install-once.ps1. Finally restauró
bytes exactos y reconstruyó helper cerrado;5589asserts y7escenarios paquete pasan.
Todos los permisos de payloads/retry/resume anteriores permanecen cerrados.

Revisión física exigida por la regla inicial del usuario: zoom/antialias son
llamadas gráficas nuevas en este payload, pueden bloquear, provocar panic o
corrupción; recuperación integral no validada. El límite cooperativo no puede
interrumpir una callback bloqueada. Solo commits locales; sin push/CI remoto.
