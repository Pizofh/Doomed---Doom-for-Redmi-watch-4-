# R167 — inventario físico correcto y primera esfera candidata preparada

2026-10-12. El usuario ejecutó watchfaces con el mismo vínculo Windows:
Complete/v1/HMACtrue/authAcktrue/encryptedDataReceivedtrue,4TX/10RX,
1959ms,closeConfirmed+workerExitConfirmed=true,exit0,supervisor=null,
nativeError=false,filesTransferred=false,rawOutputSaved=false.

Inventario:21entradas,1activa,20marcadascanDelete,0IDsdesconocidos. La marca
canDelete no valida un DELETE real ni permite borrar arbitrariamente. No
capacidad/espacio libre/RAM inferidos del número de esferas. battery/model/firmware
null en este reporte son esperados: ese modo solo consulta lista, no repite los
dos GET de device info. Estado de menús después de este GET no vuelto a preguntar;
menús normales reportados tras auth anterior. No pedir re-pair por cada consulta.

Los IDs recibidos y la esfera activa quedaron solo en el snapshot privado
tools/local/pc-rfcomm/watchfaces-r167.json, ignorado. No nombres, imágenes, MAC,
seriales, credenciales, binarios Xiaomi o datos salud en documentación pública.
El ID de prueba365799910 está ausente de esta lista: solo ausencia en snapshot,
no reserva permanente del namespace ni garantía de admisión de paquete nuevo.

## Paquete propio preparado en PC, sin instalación

[RW4Probe](../experiments/static-watchface/README.md): imagen fija390×450,
textoRW4PROBE y barrasRGB, sin Lua/touch/timers/shell/ELF/DOOM. Un widget
Shape30/FaceWidgetImage, DeviceType365/RedmiWatch4. Es una prueba de instalación,
render y regreso a una esfera conocida; no muestra la hora ni prueba runtimeLua.

Se amplió tools/inspect-managed.mjs con modo schema para inspeccionar metadata/IL
de WidgetFactory y FaceWidgetImage en XiaomiWatch.Common4.15 embebido en el
Compiler4.23 ya revisado. ReflectionOnlyLoad, sin invocar métodos del target.
Factory y constructor confirman Shape30=Image; enumWatchType confirmaRW4=365.
FaceProject no publica propiedadID; el ID pasado por CLI se ignora como ya se
documentó antes. Esto es inspección del empaquetador, no firmwareRE.

Build con compiler/db SHA256 fijados y sin ADB adyacente. Compiler declara
Watch:RedmiWatch4/NoErrors/ADBmissing; salida25224bytes. Proyecto/PNG propios,
preview inspeccionado visualmente en PC. No nuevas dependencias/descargas ni
conexiones emulador/hardware en este empaquetado. Preview no prueba render de
los bytes empaquetados en el runtime del emulador o del reloj.

Se conserva el .face original. CandidatoID-only modifica únicamente nueve bytes
ASCII del ID en0x28; terminador comprobado. Versión/byte5 original0 se conserva.
No copiar el ajuste byte5=10 de AdbBridge: ese método es del camino emulador y
no prueba formato físico. Diferencias acotadas verificadas; magic5aa53412 y
tamaño/header son subset de parser, no aceptación física probada ni validación
exhaustiva de tablas/checksums/assets del firmware2.2.86.

Salida privada artifacts/static-watchface-r167/RW4Probe-id-only.face,
SHA2567df88688c61e63b1aaab208ddf2b3976bf912fbaa08c01bf6f0d0e986ad9e93a.
El JSONreview registra compiler/source/preview/original/candidato y flags
emulatorValidated=false,hardwareValidated=false,installed=false. No .face/PNG
binario en Git; solo fuente/script/metadata de investigación. Reproducible con
la dependencia local fijada, sin sobrescribir outputs; hash idéntico futuro
no prometido si compiler incluye metadata variable.

## Installer y siguiente checkpoint

Inspección local del XiaomiWatchfaceService del worktree Gadgetbridge identifica
GET4/0,SET4/1,DELETE4/2,INSTALL4/4. InstallStart llevaID/tamaño; servicio de upload
es compartido con firmware. Upstream selecciona automáticamente la esfera tras
upload, comportamiento que no debe copiarse sin decidirlo y documentarlo.
Nuestra whitelist sigue rechazando setters/delete/install/upload; ninguna
herramienta nueva de transferencia física implementada en R167.

Siguiente meta: validar el candidato estático y su estructura/render en PC y
emulador, y preparar un instalador exclusivo de esta watchface con retirada
antes de pedir aprobación de cualquier escritura física. Emulador S3 no replica
RW4; su parche header no se trasladará al archivo físico sin evidencia. Antes
de install: reconsultar colisiones, rechazo de firmware/RPK/ELF, límites, logs,
no borrar esferas ajenas, selección/rollback explícitos y plan físico completo.
No hace falta comando del usuario ahora; conservar vínculo PC para el bloque.
