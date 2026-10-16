# DOOM en Redmi Watch 4

**Actual R309:** [DoomTrace abrió con ERROR30](docs/doom-trace-result-r309.md)
durante la recuperación/cierre del C anterior. Falta localizar el subpaso;
los ceros de FREE/MAX son valores iniciales, sin medición de RAM todavía.

**Actual R308:** [DoomTrace instalada inactiva](docs/doom-trace-install-r308.md),
con las 13 esferas anteriores conservadas y bloqueos PC restaurados.
Un ensayo manual ya autorizado queda pendiente: código de fallo/RAM y cierre;
todavía no confirma una corrección del render animado.

**Actual R306/R307:** [DoomRAM mostró ERROR antes del juego](docs/doom-ram-failure-r306.md);
el usuario pudo volver al menú. Causa y descarga de C aún sin confirmar.
[DoomTrace preparado](docs/doom-trace-physical-plan-r307.md):31,9KB de Lua,
código de fallo/RAM y salida ordenada, mismo C/WAD. Pendiente de aprobación;
no es todavía una corrección física del render.

**Actual R305:** [DoomRAM instalada inactiva](docs/doom-ram-png-install-r305.md).
Catálogo previo conservado y bloqueos PC restaurados. Dos ciclos manuales
autorizados pendientes de resultado; animación física todavía sin confirmar.

**Actual R304:** [DoomRAM preparado para animación desde RAM](docs/doom-ram-png-physical-plan-r304.md).
PNG virtual en C, controles y salida/reinicio, sin escribir frames a flash ni
duplicar el WAD. Pruebas de C/VFS/Lua/transporte pasan; falta aprobación y
ensayo físico. El usuario confirmó retirar cuatro diagnósticos anteriores.

**Actual R303:** [DoomPNG muestra el frame completo correctamente](docs/doom-png-result-r303.md),
con retorno a menús/esfera normal según el usuario. La ruta PNG valida la
captura estática; queda corregir la animación mediante RAM, sin escribir
frames continuos en flash. Conservar DoomLauncher, que almacena ELF/WAD.

**Actual R302:** [DoomPNG instalada inactiva](docs/doom-frame-png-install-r302.md).
Catálogo conserva las14esferas anteriores; bloqueos PC restaurados.
Ensayo visual autorizado y pendiente; todavía no hay corrección confirmada.

**Actual R300/R301:** [el frame fijo también sale corrupto](docs/doom-frozen-result-r300.md).
La renovación rápida no es necesaria para el fallo. [DoomPNG preparado en PC](docs/doom-frame-png-physical-plan-r301.md)
leerá una captura raw con checksum y la convertirá a PNG, conservando ELF/WAD.
Conversión de64.000píxeles y lifecycle probados; nueva prueba física pendiente
de autorización. Gates cerrados; sin comandos nuevos al reloj ni push remoto.

**Actual R299:** [DoomStill instalado; comparación manual pendiente](docs/doom-snapshot-install-r299.md).
Referencia PNG frente a un frame de Doom pausado, sin renovar Image. Ensayo
autorizado, launcher inactivo, gates PC cerrados. Aún sin resultado ni fix.

**Actual R297/R298: motor funcionando, render físico corrupto.**
[Las fotografías](docs/doom-render-corruption-r297.md) confirman que solo una
franja muestra Doom y el resto son artefactos. No se ha logrado el frame completo
correcto del MVP. [Diagnóstico de imagen fija preparado](docs/doom-snapshot-physical-plan-r298.md):
mismo ELF/WAD,47casos Lua, sin nuevos cambios físicos; pendiente de revisión.

**Actual R293: DOOM real ejecutado en Redmi Watch4 M2315W1 stock.**
[Primer resultado físico](docs/doom-first-run-result-r293.md): el usuario jugó,
confirmó controles y EXIT→CLOSED. Volvió a su esfera desde Ajustes, con menús y
corona normales. Queda corregir el selector por pulsación larga después de
salir y habilitar ciclos de juego sin reinstalar. Sin métricas de FPS todavía.

**Actual R290:** [Paquete Doom de4,8MB instalado e inactivo en el reloj](docs/doom-large-install-result-r290.md).
2362partes transferidas; consulta independiente confirma las11esferas previas
y la selección conservadas. Usuario confirma funcionamiento normal; gates
cerrados. El launcher mantiene C/Doom deshabilitado: ejecución física pendiente.
Siguiente: preparar un primer arranque acotado con salida y limpieza.

**Actual R286, solo PC:** [Instalador grande con journal privado integrado](docs/doom-deployment-journal-r286.md).
33casos pasan con el paquete real y receptor simulado, incluido worker C#.
Destino/clave/archivo vinculados, lock exclusivo y reanudación explícita.
[Ensayo físico propuesto](docs/doom-large-install-physical-plan-r286.md): gates cerrados.

**Actual R285, solo PC:** [Candidato RW4 de4MiB compilado y empaquetado](docs/doom-low-memory-candidate-r285.md).
El presupuesto calcula5,17MiB antes de gastos aún sin medir. Paquete de4,8MB
con carga nativa bloqueada; siguiente: instalador grande con journal privado.

**Actual R284:** [RAM física medida; Doom consume2MiB menos en S3](docs/doom-memory-budget-r284.md).
Umem libre6,68MiB en el reloj. E1M1 con zona4MiB pasa dos ciclos de controles,
pausa y salida limpia en emulador; pico runtime4,28MiB. Doom físico pendiente.

**Actual R283:** [Medición de memoria preparada](docs/memory-preflight-r283.md).
MemInfo lee un snapshot por pool sin shell ni C; 45 pruebas y lectura real S3
pasan. Paquete RW4 de21KB instalado con autorización, inactivo; catálogo previo
conservado y gates cerrados. Lectura física y retorno normal ya confirmados.
[Plan y estado del ensayo](docs/memory-preflight-physical-plan-r283.md).

**Actual R282, solo PC:** [Launcher, ejecutable y WAD persistentes integrados](docs/doom-persistent-launcher-r282.md).
El paquete S3 abre E1M1, permite jugar, cierra y vuelve a abrir sin reinstalar.
Los 20 recursos conservan sus hashes tras reset. El candidato RW4 ya tiene
la ruta WAD definitiva; su carga nativa permanece bloqueada hasta revisión.

[Repositorio GitHub](https://github.com/Pizofh/Doomed---Doom-for-Redmi-watch-4-) · [CI Windows y pruebas sintéticas](https://github.com/Pizofh/Doomed---Doom-for-Redmi-watch-4-/actions/workflows/pc-rfcomm-offline.yml)

**Actual R281, solo PC:** [Transporte grande compilado y supervisado pasa](docs/doom-large-worker-r281.md).
4,8 MB y sesión autenticada pasan por pipes y worker C# reales con sockets
sintéticos. Diez escenarios cubren envío parcial, bloqueo, cancelación y cierre.
Sin radio ni hardware nuevo. Siguiente: launcher RW4 y ruta WAD persistente.

**Actual R280, solo PC:** [Sesión grande autenticada y reanudación integradas](docs/doom-upload-session-r280.md).
22 escenarios pasan con receptor sintético de 4,8 MB: autenticación, envío,
journal, corte/reanudación y catálogo final. CI preparada; sin Bluetooth ni
hardware nuevo. Faltan el worker grande y el launcher final para RW4.

**Actual R279, solo PC:** [Extracción persistente y upload grande simulado pasan](docs/doom-large-transfer-r279.md).
ELF/WAD idénticos tras reset del emulador;2353partes, interrupción y resume
validados en PC. CI sintética preparada sin assets. Backend RFCOMM y launcher
final siguen pendientes; no hubo envío físico.

**Actual R278, solo PC:** [Rutas/caché RW4 contrastadas y assets empaquetados](docs/doom-rw4-deployment-r278.md).
Carrier offline4,8MB con ELF/WAD separados y registros idénticos. El instalador
de probes limita64partes/32KiB: falta preparar la transferencia grande y el launcher.
RAM libre/extracción/aceptación física sin demostrar; no se envió el paquete.

**Actual R277, solo PC:** [Salir cambiando de esfera y recoger al volver funciona](docs/doom-ram-close-r277.md).
GC pide STOP; la UI posterior retira caché, hace JOIN y descarga el módulo.
14/14 reservas liberadas, sin reboot. Controles y dos salidas normales siguen pasando.

**Actual R276, solo PC:** [Doom real integrado con el nuevo backend RAM](docs/doom-ram-engine-r276.md).
E1M1, avance, ambos giros, disparo, pausa/reanudación y dos START/EXIT pasan
con hilo real y libc privada. Ambos liberan14/14 reservas y descargan el módulo.
Pico del runtime6,28MiB; no equivale a RAM total. Sin nuevo ensayo físico.

**Actual R275, solo PC:** [Frames desde RAM ya se ven en LVGL y salen limpiamente](docs/doom-ram-image-ui-r275.md).
Dos ciclos visuales pasan en S3 con adaptador explícito: cuatro frames, sin archivos
por frame y recursos retirados. Se corrigió el consumo anticipado por prefetch.
Falta integrar motor/hilo real con este backend; no se ha enviado al reloj.

**Actual R274, solo PC:** [Imagen virtual desde RAM y VFS real probado](docs/doom-rw4-image-r274.md).
Se identificó el formato RW4 y se añadió read/seek/cierre con retención del frame.
El candidato sigue enlazando sin imports. Falta integrar y validar el dibujo/caché
de LVGL; no se envió ni ejecutó este port en el reloj.

**Actual R273, solo PC:** [El candidato completo enlaza sin imports pendientes](docs/doom-rw4-bindings-r273.md).
Incluye 20 bindings candidatos y comprobaciones de código al iniciar. Las pruebas
afectadas de libc y puente pasan en S3. Falta cerrar imagen LVGL, WAD y ciclo
real del worker; todavía no es un paquete físico instalable. Reloj sin cambios.

**Actual R272, trabajo PC:** [Motor, libc propia y puente ya enlazan juntos](docs/doom-rw4-device-r272.md).
Pruebas de biblioteca C y controles/frames pasan en el emulador, con alcance
documentado. Faltan bindings finales, presentación LVGL y WAD persistente;
el objeto aún no se puede instalar. Sin nuevas operaciones sobre el reloj.

**Actual R271, trabajo PC:** [El motor original y el runtime compilan para RW4](docs/doom-rw4-build-r271.md).
Salida propia probada en el emulador. Objeto intermedio sin instalar: faltan
bindings finales, ejecución y adaptador DG. Se agrupa la preparación para
un ensayo físico corto de E1M1 cuando esos contratos estén revisados.

**Actual R270 completo:** [C residente se descarga limpiamente](docs/native-exit-resume-physical-plan-r270.md).
ExitC terminó con diez indicadores verdes y el reloj mantiene menús y esferas
normales. Ya probamos carga C, controles y retirada del puente; DOOM físico
todavía pendiente. Siguiente: [adaptar el runtime real de Doom al RW4](docs/doom-rw4-runtime-next-checkpoint.md).

Los checkpoints anteriores se conservan como historial:

**Actual R267 preparado:** [Reintento pausado del mismo ExitC](docs/native-exit-retry-physical-plan-r268.md).
Reloj normal tras R266. Audit no encontró defecto en los checks del paquete;
15pruebas nuevas/47protocolo pasan. Mismo archivo, esperas2,1s nominales,
journal nuevo y gates cerrados; aún sin segundo envío.

**Actual R266 detenido:** [Timeout al confirmar ExitC](docs/native-exit-physical-plan-r266.md).
Un envío; catálogo posterior conserva las12esferas previas y ExitC no aparece.
Gates cerrados, sin rmmod/reintento. Pendiente comprobar normalidad visual.

**Actual R265 preparado:** [ExitC: retirar el módulo C detenido](docs/native-exit-physical-plan-r266.md).
68casos y retirada real S3 pasan; paquete24.348bytes/gates cerrados. Pendiente
revisión física nueva; no rmmod/instalación en RW4 todavía.

**Actual R264 completo:** [Los13comandos al C residente pasan físicamente](docs/native-control-physical-plan-r264.md).
Diez verdes, menú y otras esferas normales. C queda cargado y detenido;
[siguiente checkpoint: ciclo de vida del módulo](docs/native-lifecycle-next-checkpoint.md).
DOOM físico todavía pendiente.

**Actual R264 instalada:** [CtrlProbe inactiva; RUN C manual pendiente](docs/native-control-physical-plan-r264.md).
Un envío, catálogo previo conservado y gates cerrados. Falta probar los13comandos
en el C residente del RW4; no se ejecutaron durante la instalación.

**Actual R263 preparado:** [CtrlProbe: un lote de controles al C residente](docs/native-control-physical-plan-r264.md).
169 escenarios y13comandos con ACKs pasan en el C del emulador S3; registro/UI
simulados. Paquete de23.788bytes preparado, gates cerrados; pendiente aprobación
física de write. Sin instalar, recargar ni retirar C del RW4.

**Actual R262 completado:** [Lectura C, cierre y registro posterior pasan físicamente](docs/state-match-physical-plan-r262.md).
Diez verdes; corona, menú y cambio de esferas normales. Siguiente checkpoint:
[comandos acotados al puente residente](docs/native-control-next-checkpoint.md), sin nuevo envío todavía.

**Actual R261:** [El rechazo venía de dos bytes posteriores al terminador](docs/state-match-physical-plan-r262.md).
C y lectura/cierre del registro pasaron; primeros64bytes idénticos, retorno normal.
StateMatch compara solo el registro definido;51casos pasan con simulaciones. Sin nuevo envío.

**Actual R260:** [Reintento solicitado instalado como StateTrace2](docs/state-trace-repeat-physical-plan-r260.md).
Misma lectura del C residente; muestra el diagnóstico primero si falla. Inactiva,
pendiente READ C manual; no reinicio, borrado o recarga del módulo.

**Actual R257:** [RegCheck obtuvo dos registros válidos e idénticos](docs/registry-check-physical-plan-r256.md),
retorno normal. [StateTrace preparada](docs/state-trace-physical-plan-r258.md) conserva el
diagnóstico posterior junto al frame C;48casos con simulaciones pasan. Sin nuevo envío.

**Actual R254:** [Lua recibió y cerró un snapshot del C residente](docs/state-read-physical-result-r254.md).
Frame32bytes válido y estado inicial en foto; retorno normal confirmado. La comprobación
posterior del registro falló; [RegCheck preparada](docs/registry-check-physical-plan-r256.md)
para comparar metadata sin abrir C. No repetir, recargar o retirar el módulo.

**Actual R253:** [PreCheck localizó el fallo al abrir la marca antigua](docs/precheck-physical-plan-r252.md).
Registro C reconocido y retorno normal. [StateRead2 preparada](docs/state-read-physical-plan-r254.md)
sin depender de archivos de StepC;47casos con simulaciones pasan. Pendiente de revisión física.

**Actual R250:** [StateRead se detuvo antes de abrir C](docs/state-read-physical-result-r250.md).
MARK verde, REG INFO/FINAL rojos; acceso nativo no demostrado. Usuario confirmó
retorno, cambio de esfera y menú normales. Falta distinguir qué comprobación previa falló.

Instalación previa sin activación:
Un envío autorizado; catálogo16→17, esferas y selección anteriores conservadas.
Socket, worker y permisos de envío cerrados. Ensayo consumido;
aún no se han probado estos callbacks físicos. No repetir StateRead.

**Historial R249, PC:** [StateRead preparada](docs/state-read-r249.md): snapshot32bytes
del módulo existente, sin carga/retirada o comandos de control. 47casos con
nodo/UI simulados pasan, paquete20536bytes; gates cerrados y sin nuevo envío.
[Plan R250 autorizado](docs/state-read-physical-plan-r250.md).

**Actual R248:** [Registro físico reconstruido](docs/proc-observation-r248.md):
StepC sigue registrado; su salida quedó truncada y el parser la rechazó.
ProcView TEXT/HEX y retorno habitual normales confirmados. Clasificador de esa
representación pasó24casos en PC/S3; sin nueva operación física. Siguiente:
snapshot del módulo existente antes de considerar retirarlo, sin recargar C.

**Actual R246, PC:** [ProcView preparada](docs/proc-view-r246.md): longitud,
inicio64bytes y final16bytes; texto/hex sobre una sola lectura. 22casos con
simulaciones pasan, paquete21836bytes; gates cerrados, sin nuevo envío al reloj.
[Plan R247 autorizado](docs/proc-view-physical-plan-r247.md).

**Actual R245:** [ModInfo2 abrió, leyó y cerró el registro](docs/module-registry-physical-result-r244.md);
END LINE/FINAL rojos, retorno/cambio de esfera y menú confirmados. Residencia
StepC desconocida. [Siguiente: contenido y longitud acotados](docs/module-registry-result-r245.md).

**R244:** [ModInfo2 instalada e inactiva](docs/module-registry-physical-result-r244.md).
[Corregida ruta con separadores repetidos](docs/module-registry-corrected-r243.md),
38casos lector y32UI con simulaciones pasan. Gates cerrados; CHECK ya observado.
ModInfo anterior quedó negra; retorno/cambio de esfera y menú confirmados.
Residencia de StepC todavía desconocida.

**Actual R241, PC:** [ModInfo empaquetada y validada](docs/module-registry-ui-r241.md):
lectura de registro sin shell/C, 38 casos del lector y17 de UI con simulaciones.
Paquete15792bytes; envío cerrado. [Plan R242 autorizado](docs/module-registry-physical-plan-r242.md).

**R240:** [StepDiag completada, retorno normal](docs/step-diagnostic-physical-result-r239.md).
PACK/UNPACK, archivos y marca propios pasaron; `lsmod` no se reconoció.
El estado del módulo StepC sigue desconocido. [Investigación del registro en PC](docs/module-registry-r240.md),
sin otra operación física. Los ensayos anteriores quedan como historial abajo.

**Actual R238:** [StepC falló al pulsar START](docs/step-physical-result-r237.md),
retorno habitual/menús confirmados; carga/retirada del nuevo C desconocidas.
[StepDiag preparada en PC](docs/step-diagnostic-r238.md), sin abrir nodo o cargar/
descargar C. [Plan R239 completado](docs/step-diagnostic-physical-plan-r239.md).

**Actual R237:** [StepC instalada en RW4 sin activación](docs/step-physical-result-r237.md).
Un envío autorizado; catálogo16→17, esferas/selección anteriores conservadas,
sockets y permisos de envío cerrados. START/controles/EXIT manuales pendientes:
todavía no demuestra ejecución del nuevo módulo C.

**Actual R236, PC:** [StepC preparada](docs/step-ui-r236.md): UI/controles conectados
al cliente, 31 casos de UI y 37 del carrier con simulaciones, paquete fijo31808bytes.
Instalador offline verificado; gates cerrados. [Ensayo físico R237 pendiente de revisión](docs/step-physical-plan-r237.md).
El nuevo candidato C todavía no se ha ejecutado en el RW4.

**Actual R235, solo PC:** [Cliente Lua del candidato RW4 validado](docs/step-carrier-r235.md).
37 escenarios con archivos reales en tmpfs y shell/nodo simulados pasan;
errores de comunicación o cierre impiden retirada incierta. No se ejecutó el
candidato RW4 ni se creó un paquete nuevo. Siguiente: UI, paquete y plan revisables.

**Actual R234, solo PC:** [Candidato de puente específico RW4 compilado](docs/rw4-step-candidate-r234.md).
Dispatch de callbacks y gate de retirada rastreados en imagen2.2.86; ELF2620bytes,
BSS36. Registro/retiro de nodo son dos APIs nuevas no ensayadas físicamente.
Falta carrier/validación/paquete/plan; no nuevo envío al reloj.

**R231, PC/S3:** [UI conectada a C con controles y EXIT](docs/step-bridge-emulator-r231.md).
Cuatroholds reales,81ACK de STEP, barra de estado C y salida manual/automática
con retiro del nodo/módulo. Esfera stock restaurada. No nuevo envío al reloj;
el adapter usa ABI S3. Siguiente: contrato equivalente específico del RW4.

**Historial R229, PC:** [Backend cooperativo investigado y núcleo C probado](docs/rw4-step-backend-r229.md).
41assertions pasan en S3 para acciones/pausa/STEP/STOP y mensajes inválidos;
módulo de test retirado. Candidato de nodo en RAM para comunicar Lua↔C, aún sin
adapter/UI conectado ni módulo RW4 nuevo. Hardware no tocado en este checkpoint.

**Último resultado físico R226:** [HoldPad: controles sostenidos y retorno stock funcionan en RW4](docs/held-input-physical-result-r225.md).
Usuario confirma el ciclo solicitado de UP/LEFT/RIGHT/FIRE, liberación, EXIT
y retorno normal. Esto respalda la watchface como contenedor para continuar.
Todavía no conecta input con C/Doom ni demuestra comodidad en muñeca.
Gates cerrados; ensayo completado. [Siguiente checkpoint PC: backend C con UI viva](docs/rw4-input-backend-next.md).

**Historial R225:** [HoldPad instalada en RW4 sin activación](docs/held-input-physical-result-r225.md).
Un envío autorizado, ocho partes; las15esferas anteriores y selección conservadas.
Gates cerrados. Pendiente selección manual, cuatro contactos sostenidos, EXIT
y retorno habitual: la instalación no demuestra ese comportamiento.

**Historial R224:** [Controles sostenidos y selector stock probados en S3](docs/held-input-r224.md).
UP/LEFT/RIGHT/FIRE mantenidos 3,3 s conservan el juego; soltar libera acciones.
Tras EXIT, la pulsación larga vuelve a abrir el selector. Sin desactivar el
ajuste global desde Lua. HoldPad preparada, solo Lua/imágenes; gates cerrados.
Ensayo agrupado RW4 [autorizado R225](docs/held-input-physical-plan-r225.md); instalación arriba.

**Historial R222:** [C genera imágenes, Lua las anima y la prueba termina en RW4](docs/native-frames-physical-result-r221.md).
Usuario comunica cinco indicadores verdes, animación de líneas y navegación/cambio
de esfera normales. Reapertura bloqueada concuerda con la protección de un intento.
Gates cerrados; no repetir/rearmar. Son cuatro frames precalculados, no Doom/FPS.
Siguiente PC: controles sostenidos sin abrir el selector de esferas durante juego,
con salida y navegación normal restaurada. Todavía no probado físicamente.

**Historial R221:** [NativeFrames instalada tras autorización](docs/native-frames-physical-result-r221.md).
Un envío,15partes; propia inactiva, las14entradas anteriores y selección conservadas.
Gates cerrados de nuevo. Pendientes RUN C manual, imagen/animación/EXIT y retorno:
instalar no demuestra ejecución. Pulsación larga durante controles de Doom aún
pendiente. [Plan aprobado](docs/native-frames-physical-plan-r221.md).

**Preparación R220:** [NativeFrames lista en PC/emulador](docs/native-frames-r220.md).
Una prueba reúne generación de cuatro imágenes en C, animación Lua/LVGL y salida.
C específico S3 generó PNG válidos; UI real mostró animación/EXIT y retorno stock.
24casos de carrier y transferencia offline pasan. Paquete29.704bytes,
ID365219980; estado posterior de instalación arriba.
Son frames precalculados, no Doom/FPS.

**Historial R217:** [C lee/escribe un archivo y se retira en el RW4 físico](docs/native-log-physical-result-r216.md).
Usuario comunica FILE/MARK/C TEXT/UNLOAD/END verdes y navegación/cambio de
esfera conservados. Cinco APIs de archivo específicas de2.2.86 funcionaron para
este payload. Gates cerrados; no repetir el ensayo. Siguiente checkpoint PC:
patrón de imagen generado en C y mostrado mediante Lua/LVGL stock.
[Preparación PC/emulador](docs/native-log-r215.md), [plan aprobado](docs/native-log-physical-plan-r216.md).

**Historial R210:** [hello de logging C compilado solo PC](docs/rw4-log-candidate-r210.md).
1.120bytes, bindings específicos de imagen y fingerprints antes de llamadas;
todavía no ejecutado/empaquetado para hardware. [loadlib deshabilitada y ruta
stock de stdout inspeccionadas](docs/rw4-lua-bridge-r209.md). Siguiente: carrier
con captura del mensaje y retirada del módulo; gates físicos cerrados.

**Historial R206:** [funciones externas investigadas en PC](docs/rw4-exports-r206.md).
Loader y búsqueda por nombre identificados; todavía sin tabla de APIs RW4
verificada para un mensaje desde C. Siguiente: rastrear el puente Lua/nativo
en PC. No hubo nueva prueba física; FirstC2 sigue limitada a un intento.

**Historial R204:** [C propio ejecutado y retirado en el RW4 físico](docs/first-c-corrected-physical-result-r203.md).
Usuario observa FILE/MARK/LOAD/UNLOAD/END verdes y confirma vuelta a esfera
original con navegación/cambio normales. Inicializador mínimo de784bytes,
sin imports; firmware stock, mecanismo Lua→NSH/insmod/rmmod existente.
Siguiente checkpoint PC: exports y contrato de APIs para emitir un mensaje desde C.
Privilegios/ABI completo/RAM/recovery siguen pendientes; gates cerrados.

**Historial R203:** [FirstC2 instalada tras autorización](docs/first-c-corrected-physical-result-r203.md).
Un envío,13partes; catálogo15→16 con entradas/flags/selección anteriores
conservados y propia inactiva/eliminable. Gates cerrados otra vez. Pendiente
selección y RUN C único del usuario, observación de cinco filas y retorno.
**C físico/retirada todavía no confirmados.**

**Historial R202/R203:** [FirstC2 corregida y preparada en PC](docs/first-c-corrected-r202.md).
UI estática visible antes del backend, ruta normalizada, sin global load y bloqueo
si aparece el módulo anterior.38 escenarios pasan con archivos reales y carga
simulada. Paquete24.736bytes, ID365219998; envío físico cerrado. [Plan para revisión](docs/first-c-corrected-physical-plan-r203.md).
No nuevo C ejecutado o enviado al reloj; privilegios/recovery integral pendientes.

**Historial R200/R201:** [UI separada funciona con LVGL real en emulador](docs/ui-only-emulator-r200.md):
etiquetas/botón, un toque, bloqueo de repetición y salida a esfera normal.
Sin C. [Fallo de ruta reproducido y helper corregido](docs/first-c-path-r201.md):
el runtime S3 usa ID//lua/, rechazado por nuestro adapter anterior;16 casos pasan.
RW4 vuelve a esfera/navegación normales según usuario. C físico sigue sin
confirmar; nuevo paquete C/revisión pendientes, gates cerrados.

**Historial R199:** [FirstC no mostró la interfaz esperada en el reloj](docs/first-c-ui-failure-r199.md).
Usuario ve panel/cuadritos, sin etiquetas/botón reconocidos; tocó sin respuesta
y los menús funcionan. Carga/retirada C siguen sin confirmar; no repetir.
Interfaz separada del backend preparada en PC, seis pruebas con widgets simulados.
Siguiente: comprobar render/eventos LVGL reales en emulador sin ejecutar C RW4.

**Historial R198:** [FirstC instalada tras autorización](docs/first-c-physical-result-r198.md).
Un envío, doce partes; catálogo16→17 con entradas/flags/selección anteriores
conservados y FirstC inactiva/eliminable. Gates cerrados otra vez. Pendiente
selección manual, RUN C único y observación del retorno. **Carga y retirada
de C propio en RW4 todavía no demostradas.**

**Historial R197/R198:** [FirstC preparado y comprobado en PC/emulador](docs/first-c-adapter-r197.md).
Paquete de22.500bytes, ID365219996; botón manual RUN C, un intento con marca
previa, comprobación del registro y retirada.29 escenarios del adaptador con
archivos reales y executor/widgets simulados; transferencia/sesión offline
validadas para este paquete. **No se ha ejecutado C propio en el reloj.**
[Plan físico pendiente de revisión](docs/first-c-physical-plan-r198.md): contexto
potencialmente privilegiado, recuperación integral sin validar; gates cerrados.

**Historial R196:** [controlador Lua pasó24 escenarios con backend simulado](docs/controller-r196.md).
Protege contra repetición, módulos previos y descarga sin atribución. Ejecutado
en Lua5.4 S3, sin cargar el ELF RW4 ni tocar hardware. Falta adaptador concreto,
UI con acción manual y paquete/plan final para revisión física.

**Historial R195:** [carrier verificado en PC y borrador del primer ensayo C](docs/first-c-plan-r195.md).
ELF empaquetado byte a byte sin cambios; Lua solo lee/compara, ejecución nativa
deshabilitada. No perfil físico o envío. El controlador final deberá limitarse
a un intento y confirmar descarga; su plan/paquete aún requieren preparación/revisión.

**Historial R194:** [loader RW4 inspeccionado y primer C mínimo compilado en PC](docs/rw4-loader-r194.md).
ELF32 ARM LE ET_REL, firma del inicializador y ruta rmmod identificados.
Candidato de 784 bytes, dos instrucciones, sin imports/relocaciones; no ejecutado
ni enviado. Falta cerrar contexto/privilegios y plan del primer ensayo C físico.

**Historial R193:** [firmware 2.2.86 obtenido e inspeccionado en PC](docs/firmware-analysis-r193.md).
Checksum de metadata verificado; imagen principal con M2315W1, NuttX,
rutas armv8-m, Lua 5.4.0 y referencias modlib. ABI/FPU/exports y privilegios
siguen pendientes. Sin ejecución de firmware, nuevos comandos al reloj o C físico.
Siguiente: identificar el contrato del loader en esa imagen.

**Historial R191:** [shell NuttX confirmado en M2315W1/2.2.86](docs/native-info-physical-result-r190.md).
NativeInfo: os.execute/io.open/loadlib expuestos, help/uname reconocidos,
insmod/rmmod/lsmod anunciados, iwasm no aparece enhelp; captura retirada según
retorno deos.remove. Usuario confirma salida y funciones normales. No C/ELF
cargado ni nuevo envío; gates cerrados. Siguiente: [contrato nativo exacto](docs/rw4-native-contract.md),
con investigación de fuentes/firmware verificable soloPC.

**Historial R190:** [NativeInfo instalada tras autorización](docs/native-info-physical-result-r190.md).
Un envío de siete partes; GET15→16 con entradas/flags/selección anteriores
conservados y propia inactiva/eliminable. Gates cerrados. Falta selección manual,
lectura de indicadores y retorno habitual; shell/C físico todavía no demostrado.

**Historial R188/R189:** [ruta nativa investigada y diagnóstico único preparado](docs/native-route-r188.md),
[plan físico cerrado](docs/native-info-physical-plan-r189.md). NativeInfo reúne
shell/comandos/funciones en una pantalla; dos consultas máximas help/uname,
sin cargar C. Pasó S3 con retorno y captura propia retirada. Próximo ensayo
requiere revisión: usa os.execute y escribe/borrar captura en su propio directorio.
Se omite una nueva prueba aislada de animación. No nuevo envío al reloj.

**Historial R187:** [imagen propia mostrada desde Lua en el RW4 físico](docs/lua-image-physical-result-r186.md).
Usuario confirma cuatro colores/cruz blanca, marcadores amarillo/verde y retorno
normal a su esfera, menús y pulsación larga. Sin nuevo envío o retirada; gates
cerrados. Esto valida Image con un recurso estático, todavía no frames dinámicos
ni C/Doom físicos. Siguiente: preparar refresco acotado de imagen en PC.

**Historial R186:** [LuaImage instalada tras autorización](docs/lua-image-physical-result-r186.md).
Un envío de cinco partes; catálogo14→15 con IDs/flags/activa anteriores
conservados y propia inactiva/eliminable. Gates cerrados otra vez. Pendiente
observar cuadrantes/cruz y volver a habitual; Image físico aún no confirmado.
Sin C/ELF/Doom o modificación de firmware.

**Historial R184/R185:** [imagen Lua validada en el emulador](docs/lua-image-r184.md)
y [ensayo físico preparado](docs/lua-image-physical-plan-r185.md). LuaImage9328bytes,
ID365219993, recurso propioPNG96×64: cuadrantes y cruz renderizados y verificados,
panel stock/salida/cierreLua correctos enS3. Sin fuentes/timers/C/Doom propios.
No nuevo envío al reloj; ambos gates cerrados, pendiente revisión explícita.

**Historial R183:** [investigación de fuentes solo en PC](docs/lua-font-research-r183.md).
Una muestra RW4 usa BUILTIN_FONT.MONTSERRAT_14; el emulador expone esa constante
y crea montserrat14 desde CLI,pero MiSans24/32 falla en ese contexto. No se
demuestra aún la causa del texto ausente ni la constante en2.2.86. Fuentes
primarias con hashes verificados,ningún nuevo envío al reloj.
[Decisión](docs/adr/0004-lvgl-labels-are-not-a-doom-rendering-gate.md): texto LVGL
no bloqueará render de Doom. Siguiente: preparar prueba Image en PC,sin labels.

**Historial R182:** [Lua y formas LVGL confirmadas en el RW4 físico](docs/lua-diagnostic-physical-result-r182.md).
LuaDiag instalada una vez: catálogo13→14,anteriores conservadas. Usuario ve
panel magenta y marcadores amarillo/verde distintos del preview; pulsación
larga/cambio de esferas y demás funciones normales. **Texto no aparece**:
verde indica llamada Label completada, no render de texto. Gates cerrados;
sin C/ELF/Doom físicos. Siguiente: investigar fuentes/API de texto en PC.

**Historial R180/R181:** [diagnóstico Lua sin fuente explícita ni timer validado en emulador](docs/lua-diagnostic-r180.md),
[plan físico preparado y bloqueado](docs/lua-diagnostic-physical-plan-r181.md).
PreviewX separado de panelmagenta/marcadores,textoconfuente por defecto y
objetos pequeños sincaptura de toques. Salida aStorage y cierreLua confirmados
soloS3. Usuario confirma retorno a esfera habitual y pulsaciónlarga trasR179.
Nuevo paquete no enviado al reloj; pendiente revisar único ensayoLuaDiag.

**Historial R179:** [LuaProbe instalada sin activación automática](docs/lua-physical-result-r179.md).
Usuario autorizó ensayo Lua con observación. Un único envío de diez partes;
GET independiente confirma catálogo12→13,propia inactiva/eliminable y anteriores
conservadas. Gates cerrados otra vez. Observación física posterior: fondo azul
sin texto/contador, pulsación larga no permite cambiar esfera; otros menús
funcionan. Prueba funcional fallida. Retorno por Ajustes y recuperación de
pulsación larga confirmados. Desbordamiento del selector descrito, causa pendiente.

**Historial R178:** [instalador y plan físico Lua preparados](docs/lua-physical-plan-r178.md).
Perfil fijo r177 separado de las imágenes, registro propio y comprobación de
fuente/hash. Tres perfiles pasan pruebas de envío/retirada y recibos cruzados;
entrada Lua, imagen y worker nativo siguen bloqueados. No comandos nuevos al
reloj. Pendiente autorización explícita del ensayo Lua con observación del usuario.

**Historial R177:** [Lua mínima probada en emulador](docs/lua-minimal-r177.md):
texto, contador acotado a diez, pausa/resume con panel y salida a Storage con
cierre de Lua. Mismo paquete byte5=0, fuente extraída exacta. No envío al reloj.
El usuario confirma retorno normal a su esfera después de R176. Siguiente:
adaptador/plan físico revisable para este paquete Lua; todavía no autorizado
el ensayo de scripts. Doom permanece en C, no se traduce a Lua.

**Historial R176:** [primera esfera propia instalada y visible en M2315W1/2.2.86](docs/static-space-trial-r176.md).
RW4Probe es una imagen estática, sin scripts. Después de eliminar esferas
manualmente, el usuario autorizó reintentar el mismo paquete: catálogo 11→12,
13 partes enviadas, registro propio confirmado y anteriores conservadas.
El usuario confirma «se ve bien» y luego retorno a esfera habitual y uso normal.
Paquete almacenado; ningún SET/DELETE desde PC.
Gates cerrados otra vez. [Estado 3 interpretado por Mi Fitness como espacio
insuficiente](docs/static-id-physical-result-r175.md), no límite exacto medido.
Siguiente: preparar en PC una prueba Lua mínima para revisión. Lua/C/Doom
físico todavía sin demostrar; no cambio de firmware.

Las entradas siguientes son historial de sus respectivos checkpoints.

**Historial R174:** [ensayo del ID alternativo preparado y probado offline](docs/static-id-trial-plan-r174.md).
Perfil r173 fijado por SHA/ID, registro separado y protección contra recibos de
otro perfil. Ambas variantes pasan las pruebas locales; gates físicos cerrados.
Pendiente revisar un intento del nuevo paquete; no hubo Bluetooth ni escritura
al reloj en esta sesión y no está demostrada la causa del rechazo anterior.

**Actual R172/R173:** [primer InstallStart rechazado antes de enviar el archivo](docs/static-watchface-physical-r172.md).
Usuario confirma esfera/menús normales; GET posterior conserva todos los IDs,
flags y selección. Escritura de nuevo bloqueada. [Alternativa de ID preparada
solo en PC](docs/static-id-alternative-r173.md), sin enviarla ni habilitarla:
un prefijo diferente es una hipótesis, no causa demostrada del rechazo.

**Actual R171:** [healthcheck real completado desde el PC](docs/healthcheck-physical-r171.md):
autenticación/cifrado válidos,97 % de batería,firmware2.2.86 y21 esferas/1 activa.
Cierre correcto,sin archivos enviados. No verifica pantalla/UI ni autoriza
instalación; el paquete propio todavía está ausente y la escritura sigue bloqueada.

**Actual R170:** [healthcheck del servicio de control preparado](docs/healthcheck-r170.md).
Agrupa las consultas existentes de batería/info/catálogo; 8 sesiones sintéticas
y1 IPC pasan. No prueba pantalla/UI ni recovery y no se ejecutó en el reloj.
Instalación física sigue cerrada.

**Actual R169:** [adaptador de transferencia y registro persistente preparados](docs/static-watchface-transport-r169.md),
con20 escenarios sintéticos y gate nativo/CLI comprobados. Consultas conservan
su límite16KiB; el envío tiene modo propio32KiB, todavía cerrado físicamente.
Siguiente: revisar [la primera instalación estática](docs/static-watchface-physical-plan-r169.md)
cuando el usuario pueda observar el reloj. Esta sesión remota no utilizó el
reloj, el teléfono ni Bluetooth; no hay archivo propio instalado en hardware.

**Actual R168:** [RW4Probe renderiza en el emulador con el mismo paquete](docs/static-watchface-emulator-r168.md),
permite volver a Storage y sus archivos propios se retiraron sin perder otras
esferas. No archivo al reloj físico. Prototipo de transferencia/retirada probado
con APIs falsas; falta conectarlo al transporte en un modo acotado y guardar
propiedad/estado para retirada posterior antes de aprobar una instalación física.

**Historial R167:** [inventario físico recibido y primera esfera candidata preparada](docs/watchface-inventory-result-r167.md):
21entradas,1activa,20marcadas eliminables,cierre correcto. RW4Probe es una imagen
propia390×450,ID libre en el snapshot,paquete25224bytes generado solo en PC.
SinLua/nativo; preview visto, paquete aún no validado en runtime ni instalado.
Siguiente: comprobar estructura/render y preparar transferencia/retirada exclusiva
antes de revisar una escritura física. El vínculo PC se conserva para el bloque.

**Historial R166:** [primera sesión Xiaomi completa en el reloj físico](docs/windows-xiaomi-success-r166.md):
v1, HMAC/auth y respuestas cifradas válidas, batería97, firmware2.2.86, cierre
correcto. El usuario conserva el registro Mi Fitness y ya usa los menús del
reloj vinculado al PC con Bluetooth del teléfono apagado. No archivos ni Doom
instalados todavía. Próximo: [inventario de esferas, solo GET](docs/windows-watchface-inventory-plan-r166.md)
con el mismo vínculo. Cliente preparado y probado offline; consulta física pendiente.

**Historial R165:** [pairing dirigido terminó en WAIT_TIMEOUT/258](docs/directed-pairing-result-r165.md),
sin código, sin comandos Xiaomi; reloj y Mi Fitness siguen normales. No repetir
ese intento. Propuesta pendiente de revisión: modo del reloj Conectar nuevo
teléfono conservando registro Mi Fitness, pairing GUI y una sesión con candidata
R164. No prueba de conservación de clave ni instalación física de Doom.

**Historial R164:** [Mi Fitness volvió a sincronizar y se preparó otra clave candidata](docs/synchronized-auth-r164.md)
desde logs USB posteriores. Cliente preparado, HMAC pendiente. Siguiente: un
intento manual de pairing dirigido con el [plan R163](docs/windows-directed-pairing-plan-r163.md),
conservando Mi Fitness asociado y sin volver a QR. No conexión del agente ni
archivos/código nuevos en el reloj; esperar resultado antes de session.

**Historial R163:** [cliente de pairing por dirección y plan preparados](docs/windows-directed-pairing-plan-r163.md),
14 pruebas C# y seis de supervisión simuladas pasan; sin conexión física nueva.
El reloj sigue en QR tras confirmar código Windows. Primero retornar a Mi Fitness
y obtener logs del vínculo activo; después revisar la operación dirigida sin
desvincular de la app. No ejecutar pair/session todavía.

**Historial R162:** [logs actuales leídos por USB y segunda clave candidata](docs/current-auth-candidate-r162.md),
guardada por separado y aún sin validar. No nueva conexión al reloj; auth.json
sigue con la clave anterior. Mantener Mi Fitness asociado mientras se investiga
acceso SPP desde PC sin otra desvinculación. No ejecutar session todavía.

**Historial R161:** [el reloj responde al protocolo Xiaomi v1](docs/windows-auth-result-r161.md)
en dos sesiones Windows; falla HMAC con la clave histórica. Sin auth-final,
consultas de datos o archivos enviados; cierre y worker confirmados en ambas.
Siguiente: logs recientes tras volver a Mi Fitness, conservando esa asociación
para no invalidar otra vez el candidato. No repetir con la misma clave ni subir
logs al chat. Doom físico y ejecución nativa siguen sin demostrar.

**Historial R160:** [primer lote falló antes de enviar comandos](docs/windows-session-open-failure-r160.md).
Windows conservaba vínculo anterior después de cambiar el modo del reloj.
Se corrigió parent-close y reporte nativo, sin alterar payload/alcance del lote;
build y regresiones offline pasan. Próximo: pairing Windows nuevo desde QR
actual y una sesión manual, sin repetir cambios de modo entre pasos. Protocolo/
auth/datos reales siguen sin probarse; SPP anterior sí confirmado.

**Historial R159, 2026-10-12:** [SPP físico Windows abierto y cerrado](docs/windows-spp-result-r158.md),
un intento/1337ms, sin comandos de aplicación. Usuario mantiene vínculo PC y
pide agrupar pruebas. [Lote preparado](docs/windows-xiaomi-session-plan-r159.md):
versión/auth/batería/modelo/firmware en una sesión, sin uploads o ajustes. Build y
pruebas offline pasan; una clave histórica candidata privada, vigencia pendiente
de HMAC. Lote físico todavía NO ejecutado. Retorno después del probe pendiente;
retorno anterior confirmado. Doom físico/ABI/loader no demostrados.

**Historial R154:** usuario logró pairing Windows (micrófono) y retorno completo a
Mi Fitness tras quitar el vínculo PC. [Un intento SPP Windows preparado](docs/windows-spp-probe-plan-r154.md),
con preflight de caché/destino, seguridad y supervisión del worker. Build y pruebas
offline pasan: 134 aserciones C# y diez escenarios del supervisor. **SPP físico
todavía no ejecutado ni autorizado**; modo probe explícito requiere revisión y
target privado verificado. No código/config Xiaomi transferidos ni Doom físico.
CI actualizado, aún no ejecutado en GitHub. [Estado completo](docs/HANDOFF.md).

**Historial R148:** [cliente Windows preparado y probado offline](experiments/pc-rfcomm/README.md).
Compilación x64 y pruebas simuladas de apertura, timeout, cancelación y cierre
pasan. Conexión física deshabilitada; no se escaneó ni conectó el reloj desde PC.
Primer workflow CI para este cliente preparado, aún no ejecutado en GitHub.
Siguiente: compatibilidad del vínculo Windows/RW4 antes de proponer una prueba.
La consulta upstream está autorizada y preparada, pero sigue sin publicarse por
falta de navegador disponible. Doom funciona en emulador S3; ejecución RW4 física
todavía no demostrada. [Retomar estado completo](docs/HANDOFF.md).

Las entradas inferiores conservan el historial de checkpoints anteriores.


**Actual R128:** [comparación de servicios terminada; reloj y Mi Fitness normales](docs/phone-core-state-plan.md).
Al detener Mi Fitness desaparece el registro core externo. Su objeto de conexión
tiene un ciclo distinto; socket libre y causa de E03 siguen sin probar.
Siguiente trabajo: investigar diagnóstico Android de conexiones en PC.

**Actual R126:** [lector USB ampliado; Mi Fitness vuelve a sincronizar](docs/phone-core-state-plan.md).
Las dos salidas anteriores no prueban servicio/socket ausente. Se corrige la
validación del cuerpo y se prepara una consulta normal de ambos paquetes;
resultado real pendiente, sin otra APK o prueba Bluetooth.

**Actual R124:** [lectura USB preparada para comparar el estado de Lyra](docs/phone-core-state-plan.md).
Herramienta probada con respuestas simuladas; comparación del teléfono pendiente.
La papelera conduce a desvinculación y el setter Lyra revisado pertenece a manejo
de fallos. No hay pausa temporal soportada demostrada ni otro PROBE propuesto.

**Actual R121:** [servicio Xiaomi analizado: permisos y ciclo de conexión](docs/mi-connect-service-static-review.md).
La API de Lyra exige paquete/certificado permitidos; nuestra app no está admitida.
El cierre de Mi Fitness no obliga a cerrar todos los dispositivos en el recorrido
revisado. Causa de E03 aún sin demostrar. Seguimos con el mismo teléfono:
buscar una desconexión temporal normal y su restauración antes de otra prueba.

**Actual R120:** [APK instalado verificado y delegación Lyra identificada](docs/mi-fitness-apk-static-review.md).
Mi Fitness3.59.1i tiene firma criptográfica válida; su cliente SPP revisado usa
nuestro mismo UUID/factory. Los logs existentes registran delegación exitosa a
un servicio externo Xiaomi: detener Mi Fitness no demostró aislamiento completo.
Falta atribuir transporte/canal al RW4. Próximo paso preparado: copiar el APK
de ese servicio por USB y analizarlo en PC; sin otra prueba Bluetooth o APK nuevo.

**Actual R119:** [revisión de ruta SPP y copia de Mi Fitness preparada](docs/rw4-spp-endpoint-research.md).
UUID/factory coinciden con cliente upstream; causa del fallo aún desconocida.
Script probado con ADB simulado para copiar el APK instalado del teléfono por
USB, sin ejecutarlo ni nuevas pruebas Bluetooth. Copia/análisis real pendientes.

**Actual R118:** [inventario completo y retorno normal confirmados](docs/rw4-service-inventory.md).
Reloj funcionando y Mi Fitness sincronizando tras la prueba. Siguiente paso:
investigar el fallo de conexión SPP en PC; no otra prueba física o APK solicitado.
Ejecución nativa e instalación de Doom en el reloj siguen pendientes.

**Actual R117:** [segundo inventario completado en16,1s](docs/rw4-service-inventory.md).
Android entregó SPP/HFP/HID; BLE recibió40callbacks sin anuncios atribuibles al
reloj. Cierre retornó sin error registrado. Falta confirmar retorno a Mi Fitness;
servicio/canal SPP remoto aún sin validar. No nuevo intento o APK propuesto.

**Actual R116:** [el primer inventario terminó a5,9s por pérdida de primer plano](docs/rw4-service-inventory.md),
antes de BLE. Retiro del receptor reportado; causa de onPause desconocida.
Se propone una segunda ejecución con el mismo APK y pantalla abierta30s.
Resultado pendiente; no nuevo build ni cambios de transporte/firmware.

**Actual R115:** [r114 abrió y el retorno a Mi Fitness es normal](docs/rw4-service-inventory.md).
El informe recibido sigue en I0; falta recuperar el desenlace guardado desde
**Informe y caché local**. No iniciar otra prueba ni instalar un APK nuevo.

**Actual R114:** [inventario de servicios Android](docs/rw4-service-inventory.md)
implementado en un único APK: solicitud UUID/SDP y observación BLE, sin
autenticación ni comandos Xiaomi. Pruebas PC pasan; resultado físico pendiente.
El próximo checkpoint es un inventario manual y retorno normal a Mi Fitness.
Instalar/ejecutar código en el reloj sigue pendiente de su gate específico.

**Actual R113:** [PROBE con Mi Fitness sin permiso Nearby](docs/rw4-permission-isolated-probe-result.md)
también falla antes de autenticación. Permisos restaurados y funcionamiento
normal confirmados. Filtro privado PC probado: logs existentes no identifican
transporte del RW4. Siguiente meta: servicio/endpoint de datos actual; mismo APK,
sin más intentos iguales ni cambios automáticos de transporte/firmware.

**Actual R109:** [nuevo PROBE r106 y aislamiento de Mi Fitness](docs/rw4-bluetooth-profiles-result.md).
Sigue fallando antes de autenticación (151ms). Una notificación de Mi Fitness
sugiere actividad, sin demostrar reconexión; Quick Share no es intermediario
requerido por nuestra app. Retorno de este intento pendiente; aislamiento del
permiso de Mi Fitness preparado en documentación. Mismo APK; nativo RW4 pendiente.

**Actual R107:** [prueba solo Bluetooth r106 realizada](docs/rw4-bluetooth-probe-result.md).
La apertura falló en297ms, antes de autenticación/comandos Xiaomi; el cierre
local terminó. Mi Fitness y reloj funcionan según el usuario, con una diferencia
de ~18 pasos entre app/reloj aún sin causa determinada. No nuevo APK ni consulta
de batería; siguiente meta: verificar el transporte/servicio de esta unidad.
Los apartados anteriores se conservan como historial; nativo RW4 sigue pendiente.

**Actual R106:** [app de diagnóstico consolidada](docs/android-consolidated-diagnostic.md)
lista en PC: caché/informe copiable, errores/tiempos, prueba solo Bluetooth,
consulta limitada de batería/datos y cancelación. Un APK para estas herramientas;
no nueva instalación/UI/radio reportadas todavía. No ejecución nativa RW4 demostrada.

**R105:** lectura de caché r104 realizada por el usuario: vínculo confirmado,
tipo clásico y SPP presente. Coincide con el transporte elegido por nuestra
app; no prueba que el servicio remoto responda. [Resultado y siguiente diagnóstico](docs/android-bluetooth-cache.md).
No nuevo intento Bluetooth ni APK preparado en esta revisión.

**Estado actual R104:** DOOM real funciona en el emulador S3; compatibilidad
nativa RW4 pendiente. Dos consultas manuales Bluetooth al reloj no conectaron;
Mi Fitness y reloj normales después, confirmado por usuario. [Resultado](docs/first-rw4-query-result.md).
Está listo el APK r104 de [diagnóstico de caché local del teléfono](docs/android-bluetooth-cache.md)
sin otra conexión. Los apartados R92 y anteriores son historial.

**R92:** investigado el bloqueo Play Protect: el APK-r87 conservaba un lector
de notificaciones deshabilitado y su binding sensible. Se preparó eliminarlo
por completo; test de regresión pasa. [Nuevo build pendiente](docs/android-build.md).
No desactivar protección ni reutilizar ese APK. Emulador Android aplazado;
prioridad del usuario: avanzar hacia RW4 real, con gate físico aún cerrado.

**R89:** [prueba Android sin Bluetooth](docs/android-offline-test.md) preparada:
APK-r87 verificado en `artifacts/android-offline-test-r87/`, guía de
arranque/salida/reapertura y reversión. No instalado; aprobación para la
prueba en teléfono pendiente. No se necesita otro build. Reloj intacto.

**R88, 2026-10-05:** segundo APK Android de diagnóstico compilado y revisado:
firma v1/v2 válida, diez permisos declarados (nueve previstos y uno interno de
AndroidX), un servicio habilitado y entradas automáticas restringidas en el
manifiesto. Intento manual único por proceso y vínculo Bluetooth existente.
Sin instalar ni probar runtime Android. [Resultado](docs/android-build.md).
Reloj intacto.

**R74:** [Investigacion stock RW4](docs/rw4-stock-feasibility.md): indicio Lua/shell y Gadgetbridge como candidato de instalacion; ABI/loader/firmware fisico siguen pendientes.17sources auditados, sin tocar hardware.

**R73:** [Doom persistente en emulador](docs/doom-persistence-emulator.md): ELF/WAD instalados una vez en /data; E1M1 antes/despues de reset sin reenviar assets, salida limpia y cancelacion durante carga. No demuestra compatibilidad M2315W1.

**Historial R72:** [Sesion90s](docs/doom-stability-emulator.md) completa a50ms: motor/controles operativos, cache constante, heap oscilante sin crecimiento continuo observado y salida limpia.1580entregas totales; no prueba de ausencia de fugas durante horas. Siguiente: persistencia ELF/WAD en emulador; hardware fisico intacto.

**R71:** [Mejora de fluidez a50ms](docs/doom-50ms-emulator.md):17,45entregas/s y12,7-13,6cambios visibles/s durante giros (antesunos5), motor ~35tics/s.

**Historial R70:** [Medicion inicial](docs/doom-performance-emulator.md) identifico Timer200ms como limite.

**Historial R69:** [Cierre sin EXIT y reentrada](docs/doom-close-emulator.md) pasaron sin reboot.

**Historial R68:** [Panel stock y STOP con FIRE pulsado](docs/doom-focus-emulator.md) pasaron con el motor real.

**R67, 2026-10-04:** DOOM original ejecuta E1M1 en la UI Lua/LVGL del emulador Xiaomi Watch S3. Avanzar, girar, disparar, pausar/reanudar y dos ciclos START/EXIT/reapertura pasaron sin reboot. [Resultados, mediciones y reproducción](docs/doom-ui-emulator.md). Presentacion inicial R67: aproximadamente cinco frames/s; mejora R71, sesion90s R72 y persistencia R73 documentadas arriba.

Objetivo: portar doomgeneric al Xiaomi Redmi Watch 4 **M2315W1**, conservando firmware stock y funciones normales si resulta posible. Se han realizado intentos manuales de conexión Bluetooth, sin autenticación exitosa ni instalación/firmware modificados reportados. El emulador S3 a390×450 no demuestra ISA/ABI/firmware/compatibilidad del RW4.

Se conserva motor, renderer y gameplay original. Aportes propios: investigación de contratos/ABI del guest, tooling, adaptadores display/input/tiempo/archivos y lifecycle. No se ha reverse-engineered el firmware físico RW4. Estado para continuar: [HANDOFF](docs/HANDOFF.md).

## Prototipo actual

- Lua: START, MOVE, FIRE, MENU, RESUME y EXIT. Un dedo; avanzar+girar dentro del pad. Comodidad en muñeca sin validar.
- Worker C: Doom/WAD shareware verificado; frames320×200 RGB565 por dos slots/copias tmpfs a LVGL. No llamadas UI desde worker ni escritura directa del framebuffer global.
- Pausa libera teclas/congela tiempo. EXIT espera retirada del worker antes de unload; siguiente sesión recarga ELF y restaura globals.
- Watchface, ELF y WAD permanecen en /data del emulador. START carga C/copia WAD a tmp; EXIT retira C/temporales y preserva archivos instalados.
- NuttX FLAT compartido, **sin sandbox**. No cargar este ELF ni sus direcciones en M2315W1.

Final: Storage365700764 activa, UIProbe365799903 modo doom persistente almacenada. Worker/modulo/nodos/copias/tmp ausentes; assets en /data conservados. Siguiente checkpoint: investigar el camino stock M2315W1, solo fuentes/documentacion.

## Reproducción local

PC con herramientas Node, sin cambiar ExecutionPolicy. Requiere inputs revisados: [emulador](docs/emulator.md), [paquete](docs/emulator-package-review.md), toolchain Arm14.3/[fuentes/build](docs/doom-build-audit.md) y [WAD](docs/native-wad-emulator.md).

```powershell
# Inputs revisados y UIProbe previamente instalada/inactiva; build solo si necesario.
node tools/build-doom-ui.mjs
# Solo primera instalacion: rechaza sobrescritura. Estado actual ya instalado.
node tools/doom-storage-emulator.mjs install
node tools/package-ui-probe.mjs doom
node tools/install-ui-probe-emulator.mjs refresh
node tools/doom-storage-emulator.mjs verify
# Seleccionar UIProbe por Ajustes; START (~8,3s), MENU/EXIT.
node tools/doom-ui-emulator.mjs state
```

Helpers verifican QEMU/ADB/imagen/payload y usan exclusivamente loopback5039/emulator-5554. No deployment a USB/hardware. Si worker/referencias siguen activos, conservar para inspección, sin unload forzado. [Contrato y límites](docs/doom-ui-emulator.md).

## Evidencia y diseño

- [Investigación y fuentes](docs/research.md)
- [Matriz y23 hipótesis](docs/evidence-matrix.md)
- [Arquitectura/persistencia](docs/architecture.md)
- [Controles](docs/controls.md)
- [Entorno local](docs/host-environment.md)
- [Ejecución nativa/privilegios](docs/native-execution.md)
- [Runtime de recursos/salida](docs/doom-runtime-emulator.md)
- [Primer frame original R66](docs/doom-first-frame-emulator.md)
- [Doom en UI/controles R67](docs/doom-ui-emulator.md)
- [Medicion de presentacion/input R70](docs/doom-performance-emulator.md)
- [Mejora a50ms R71](docs/doom-50ms-emulator.md)
- [Sesion90s R72](docs/doom-stability-emulator.md)
- [Persistencia R73](docs/doom-persistence-emulator.md)
- [Modelo de riesgo](docs/risk-model.md)
- [Gate físico cerrado](docs/physical-device-plan.md)
- [Plan DevOps y distribucion reproducible](docs/devops-roadmap.md)

## Objetivo eventual y distribución

MVP físico: DOOM original, WAD shareware, display/touch/tiempo funcionales, salida al reloj y archivos persistentes para reabrir sin PC. Sonido, corona, saves e integración bonita después. Firmware custom solo si una restricción concreta lo exige y el usuario aprueba el riesgo.

No se incluyen WADs, firmware, APKs, emuladores ni toolchains binarias. [Licencia shareware](docs/native-wad-emulator.md) y GPL del motor son asuntos separados. No publicar assets comerciales ni firmware Xiaomi. Elegir licencia de aportes originales antes de publicar; componentes derivados/enlazados con Doom deben respetar GPL.

## Repositorio Git local

El repo de trabajo es `redmi-watch4-doom/`, con su propio `.git`, rama master e historial incremental. La carpeta padre `Doomed/` contiene otro repo con First commit y una entrada gitlink al proyecto; no es su historial de trabajo. Abrir esta carpeta directamente en VS Code o usar `git -C redmi-watch4-doom log --oneline -5` desde Doomed. Ninguno tiene remoto configurado; los commits son locales, no publicados. El intento de retirar el repo padre fue rechazado por el entorno; en la inspeccion posterior del 2026-10-04, Doomed/.git ya no existe. Se conserva este repo con su historial completo; no se atribuye esa retirada al agente.
