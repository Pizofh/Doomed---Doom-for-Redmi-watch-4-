# R390 DOOM II: icono de monstruo

Usuario solicita «dame la versión con la imagen chévere y ya veremos esos
detalles que faltan». Autoriza este envío; confirma «sí» a reloj junto al PC,
batería≥50%, Mi Fitness cerrado y juego CLOSED. UN envío inactivo, UN START
manual breve para migración/carga/SALIR. No reintento, resume, SET/autostart
ni borrados desde PC. No nuevo diagnóstico táctil, cambio de audio o arranque.

ID365220010/rw4doomii390, título DOOM II, monstruo rojo de ojo verde y cuernos.
Paquete910940B SHA59e345710e8f4f8be98c00ebf7c6249c47a4b033c5df8dbb3e2300d343bd25b0,
77 recursos, sin WAD. ELF631972B SHA29d07a8060f25dadd448b9f83f905a5abbf2e0deefbf3e29eeffebb014701e7f.
Lua31210B SHA39c0a105a68ed80efca4b7e6101929bbdba6a7dd2809cb1f4bac8dcfc3d8fdbf.
Importador5770B SHA11730ed575fff3c435622705935064440340b7c87004ba0e43e287548ccf9d28.

Se conserva imagen grande306/Y30, controles, mezclador/audio, guards RAM
7036928/4194320 y juego. El ELF completo comparado con R388 solo difiere en
seis bytes: tres copias de la ruta WAD cambian009→010, sin otras diferencias.
Receta anterior inmutable. Nuevo icono original procedural revisado visualmente.

Para conservar una sola esfera final sin arriesgar sobrescritura de009,
se reutiliza exactamente el importador aceptado R388, con origen009/destino010
y sufijo staging390. Copia bancos válidos con CRC/readback/flush/rename antes
de mover el WAD por rename; mantiene saves originales009. Todos los assets,
ELF, Lua, saves y WAD quedan010 tras el primer START. Desde entonces009 ya no
inicia el juego; no abrirla. No alterar catálogo ni borrar carrier por PC.
Conservarla hasta validar partida/cierre nuevos; después el usuario puede
quitar DOOM II del casco verde009 y quedarse con el monstruo010.

Pruebas locales:43 casos del importador retargeteado, interrupciones y fallos;
rename filesystem real en emulador con WAD completo leído de vuelta/CRCsave,
motor exacto desde010 tras retirar009, dos ciclos/menú/MAP01/guardar/cargar/
carga desde título/CLOSED/unload; boot/UI27, paquete77 recursos/tamper6/446
partes IPC/dependencia009/reintentos bloqueados. Regresiones transporte23 y
gates pasan. Held-audio R388 se hereda: código binario idéntico salvo rutas;
no se repite ni se presenta como prueba acústica R390.

Un ensayo local falló por directorio host de fixtures ausente, y la siguiente
invocación de motor no encontró el WAD. Se detuvo, comprobó módulos ausentes,
limpió solo archivos propios, creó el directorio y repitió secuencialmente las
pruebas corregidas. Esos fallos son de preparación PC; ningún envío físico.

Abrir solo gates general/MONSTER/C#Large, readiness con target vacío antes
de privados; journal monster-r390 nuevo, cerrar gates y reconstruir worker
en finally. Rechazo/corte consume el intento, sin reintento automático.
Primera apertura conserva riesgo de bloqueo/corrupción/reinicio por migración
y C, como R388; recuperación integral/pérdida de energía no validadas.

Protocolo: DOOM II/monstruo → START1, mantener CHECKING despierto, cargar
partida y jugar brevemente, SALIR≤60s juego→CLOSED. ERROR: no repetir/reabrir
ni borrar; GATE/CODE. Imagen sobre menús: reinicio normal, esfera habitual.
Tras éxito, borrar009 manualmente y volver a Mi Fitness/uso habitual.

## R390 instalación completada; ensayo manual pendiente

2026-10-18: RegisteredInactive/registeredVerifiedtrue/contentVerifiedfalse;
446 partes/454 frames/919736 bytes TX, selectedByClientfalse.
closeConfirmed/workerExitConfirmedtrue, exit0, nativeErrorfalse. Gates general/
MONSTER/C#Large restauradosfalse y worker reconstruido en finally.
Sin SET/autostart/borrados/reenvío WAD/reintento. Journal monster-r390 terminal:
permiso de instalación consumido; NO repetir/resume/consultar radio con él.

Protocolo entregado: DOOM II monstruo rojo010 → START1/mantener CHECKING,
cargar partida, jugar≤60s y SALIR→CLOSED. Esperando resultado; aún no afirmar
migración/partida/cierre aceptados ni indicar quitar casco verde009. No abrir
009 después de migrar. ERROR: no repetir/reabrir, GATE/CODE. Imagen sobre menús:
reinicio normal y habitual. No pedir números si resultado general es correcto.
Tras éxito conservar solo monstruo010; usuario puede quitar009 y usar Mi Fitness.


## R390 aceptado en el reloj

2026-10-18: usuario responde «sí, todo bien» al protocolo de migración010,
carga de partida, juego breve y SALIR→CLOSED. Resultado general aceptado sin
pedir nuevas cifras ni repetir arranques. DOOM II/monstruo rojo010 queda como
versión actual independiente; puede retirar manualmente casco verde009.
No hay acción de borrado desde PC ni otra instalación/ensayo autorizados.
Puede reconectar Mi Fitness y usar el reloj normalmente. Gates cerrados.
Pendientes pospuestos por el usuario: apertura más rápida, dos dedos reales,
música y cortes residuales de efectos; no presentar esos cambios como hechos.

