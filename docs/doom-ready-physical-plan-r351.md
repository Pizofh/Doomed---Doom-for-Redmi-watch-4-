# R351 DoomReady: candidato para cerrar la versión jugable

El usuario confirmó DoomPads sin lag, interacción y salida correctas, y pidió
reunir el mayor avance posible para cerrar el proyecto. No se ha autorizado
todavía una nueva instalación física R351. La aprobación anterior R350 se consumió.

## Entrega combinada

- Flechas70×58 frente a60×50:35,3% más superficie; sin solapamiento entre hits.
  FIRE/USAR y PAUSA/SALIR mantienen su tamaño. Fondo35%, imagen~383×239.
- Mismo renderer Wide, dos buffers512000B, zoom306/256, antialias0, timer40ms,
  propietario UI y fences. No PNG ni escrituras de frames en flash.
- Sin corte30s ni120s/10000iteraciones. Límite cooperativo de30min de tiempo
  transcurrido, incluidas pausas. Mantener pantalla despierta; suspender solicita
  salida. Este límite no puede interrumpir una llamada de sistema bloqueada.
- Se retira la restricción del adaptador a E1M1; juego/intermisión/final usan
  las rutas originales. Los nueve mapas shareware arrancan y guardan/cargan en S3.
  No se afirma haber completado toda la campaña.
- ELF CRC en Lua al primer START de cada contexto; caché solo en RAM tras CRC
  completo. El controlador conserva comprobaciones de cabecera/tamaño, módulos,
  nodos, lease, ownership y RAM en cada arranque. Un error invalida la caché.
  No marca permanente que salte verificaciones tras reiniciar/reabrir.
  La salida normal del motor (incluido límite interno) se presenta CLOSED
  solo después de join/liberación/descarga; los fallos fatales siguen ERROR.
- CRC completo del WAD en el worker C antes de doomgeneric_Create, con tabla
  local y bloques8192B; se comprueban4196020B/CRC371943786. El WAD no se reenvía.

## Guardado real

PAUSA presenta GUARDAR/CARGAR. El worker llama a los serializadores originales
P_Archive*/P_UnArchive*; se restauran mundo, jugadores y entidades, no solo
coordenadas. C procesa un stream de RAM acotado196608B; solo Lua escribe archivos
de partida. No nuevas funciones físicas de fopen/fwrite/rename enlazadas.
El runtime sigue denegando otras escrituras, shell, rename/remove y rutas
de lectura fuera del WAD y su stream virtual /rw4-slot.dsg.

Dos bancos propios save-a.rw4/save-b.rw4, cabecera24B con magic/versión/WAD CRC/
tamaño/payload CRC/generación. Se valida antes de importar; el destino se
alterna conservando el banco anterior. GUARDADO requiere flush/close y lectura
completa de verificación. C vuelve a comprobar tamaño/CRC, cabecera Doom1.9,
skill/episodio/mapa/jugadores y marcador final antes de aceptar LOAD.
No autenticación ni parser general para partidas externas. No autosave.
Los saves pertenecen a esta esfera y pueden perderse al desinstalarla.

Datos RAM y estado de carga/guardado solo se comparten con el worker pausado,
con liberación de teclas reconocida; acción pendiente/busy y stream abierto
bloquean RESUME. Operaciones8/9 solo PAUSED. STOP cancela transferencias y
conserva join/cierre/unload; GC no toca LVGL. Dos nodos0600: /dev/rw4doomready
y /dev/rw4doomslot, protocolo6. El driver del slot mantiene un gate hasta close.

Una prueba negativa detectó que devolver error desde close podía retener una
referencia VFS e impedir unregister en NuttX. Se corrigió antes del paquete:
close siempre libera el stream; una importación inválida publica valid=0 y
LOAD la rechaza. La prueba real de CRC inválido ahora termina join/unload sin
referencias retenidas. Las escrituras fallidas no sustituyen el banco anterior.

RAM estática RW4 adicional199520B frente aPads. Guard FREE6956611: añade224KiB
al guard anterior, incluidos29856B de margen sobre el incremento nativo para
la UI/transferencias; LARGEST4194320, zona4MiB y stack32768B se conservan.
El frame de verify_wad requiere9248B de stack estático; no se ejecuta junto
al renderer/carga de nivel. No se ha medido todo el heap del firmware/driver.

## Ensayo físico propuesto, pendiente de aprobación

UNA instalación inactiva y DOS arranques manuales, observando batería>=50%.
Conservar DoomPads941 y DoomLauncher963. Sin reboot previo, borrados, activación
automática, reenvíos o resume; un único envío del paquete fijado.

1. Seleccionar DoomReady (marco y centro VERDES). READY→START una vez; mantener
   CHECKING despierto. Probar flechas/FIRE/USAR; jugar unos2min en total.
2. PAUSA→GUARDAR, esperar GUARDADO. SEGUIR, moverse a otro lugar, PAUSA→CARGAR,
   esperar CARGADO; SEGUIR y verificar regreso al punto y estado guardados.
   SALIR→CLOSED. Las operaciones de archivo se hacen mientras sigue pausado.
3. Solo si todo funcionó y terminó CLOSED: volver a la esfera habitual,
   reabrir DoomReady, START una vez, PAUSA→CARGAR→CARGADO→SEGUIR. Confirmar
   que persiste la partida, jugar brevemente y SALIR→CLOSED. No reinstalar.
4. Ante ERROR/corrupción/suspensión/UI ausente, detener el ensayo, sin repetir
   START/reabrir ni ejecutar segundo ciclo. MODE muestra C ERROR/GPU CODE/PHASE
   si responde. ERROR SLOT: no insistir; SALIR y describirlo.
   Asumir menús/corona normales salvo aviso del usuario.

La regla inicial del usuario exige revisar este nuevo payload: amplía ejecución,
añade serialización/restauración del motor y escritura de saves en flash desde
Lua. Puede bloquear, provocar panic o corrupción. Recuperación integral sin
validar; más comprobaciones en PC no eliminan ese riesgo físico.

No sonido en esta entrega. No push, CI remoto ni publicación de binarios,
firmware, WAD, datos privados o partidas. README y guía de uso actualizados.

## Validación y paquete cerrado

- ELF Pads reproducido byte por byte antes de sustituir adapter/transporte/runtime.
  Builds RW4/S3 sin imports pendientes, soft-float; RW4 no ejecutado en emulador.
- Dos ciclos con Doom real/hilos y gráficos modelados: seis teclas, guardado,
  mover/cargar/restaurar cinco campos del jugador, CRC de importación inválido
  rechazado, once comandos rechazados por ciclo, pausa y STOP/join/unload.
 14alloc/14free y pico de recursos rastreados4486833B.
- Diez casos del controlador Lua, incluido quit normal con reason2→CLOSED solo
  después de limpieza. Fatal reason3 sigue ERROR. Main parseado; una lectura
  de snapshot y un comando por tick, sin actualizaciones PLAYING repetidas.
- 23casos del store/wrapper Lua reales con filesystem simulado: dos bancos,
  generación, CRC, truncamiento, bytes sobrantes, error de escritura/importación,
  cancelación, RAM insuficiente, caché ELF y fallo de CRC antes de cargar C.
- UI S3 final con main/wrapper/store/assets de producción y adaptador nativo S3:
  sesión147017ms,4801tics,3384presentaciones,14alloc/14free, PHASE2. Segundo
  arranque tras unload carga el save del primer ciclo aun con banco nuevo
  corrupto; termina también14alloc/14free, sin nodos/módulo propios.
  Arranque5726ms/2659ms en VM, no predicción del reloj ni FPS físicos.
  Fixture compartida reconstruida byte por byte al empaquetar; el controlador
  específico RW4 se comprueba separadamente contra su SHA y diez casos Lua.
- Nueve mapas shareware reales: arranque/guardado/carga/cierre en cada uno,
  máximo74450B de save observado y14alloc/14free por ciclo. No playthrough.
- Fixture de UI restaurada por hash; ambos nodos, módulo y temporales propios
  ausentes. Una VM se reinició tras el primer ensayo de close fallido; no se
  reinició ni tocó el reloj para estas pruebas. La versión corregida descarga
  después del CRC inválido y de ambos ciclos UI sin reiniciar.
- 55recursos extraídos/contrastados; siete escenarios de transferencia simulada
  pasan. El pin Pads anterior y sus siete escenarios permanecen válidos.

| Elemento | Pin |
|---|---|
| Nombre/ID/preview |DoomReady/365219940/marco y centro VERDES|
| Paquete bytes/recursos/partes |660896/55/324|
| SHA256 paquete |fa2146fde2cb9bba9a7637779c747fdbbb24faf62e7b56386c66e575f3ead5c8|
| Lua26064B SHA256 |427f0a6825e3c82d45663426e9c53395c117bbcf8f304e1091a0bd3ebf22dbbc|
| ELF613484B SHA256 |e403b6ccc4b35a056699acefb8dc6a88f99414618d55aa3e3c72d9066816e5ee|
| Módulo |rw4ready351|
| Journal privado nuevo |tools/local/pc-rfcomm/doom-deployment/ready-r351.jsonl|

Prepare offline:324partes/667078wire, sin radio ni journal.
DEPLOYMENT/READY_R351/C#Large cerrados. Runner R352 preparado y parseado,
no ejecutado: artifacts/doom-ready-physical-r352/install-once.ps1. Un intento,
sin retry/resume, restauración de bytes exactos y helper cerrado en finally.

Evidencia local: build/doom-ready-r351/{rw4,s3-model,s3-ui,package};
artifacts/research/{ready-launcher-r351,ready-store-r351,ready-campaign-r351};
artifacts/emulator/ready-ui-r351/{result,cleanup}.json;
artifacts/doom-ready-r351/package-tests.json. Aprobación física todavía pendiente.
