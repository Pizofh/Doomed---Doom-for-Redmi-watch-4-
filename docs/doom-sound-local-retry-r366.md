# R366: reintento tras bloqueo local, mismo DoomSound R365

El usuario aprobó R365: una instalación inactiva y dos arranques manuales.
No se instaló el paquete ni se envió una parte. No hubo START en el reloj.

El primer proceso falló en BeforeConnection con DoomJournalRefused: al nuevo
kind le faltaba su nombre de journal y cayó en el registro antiguo. No creó
registro nuevo, no conectó y no envió frames. Se corrigió a `sound-r365.jsonl`.

El segundo proceso creó Created/Uncertain en ese registro, pero el worker nativo
tenía `LargePhysicalReviewed=false` y rechazó el perfil antes de abrir conexión.
Resultado: workerExitCode=2, sentFrames=0, txBytes=0, massPartsLocallyWritten=0,
before=null y upload=null. El resumen de transporte marca la solicitud de apertura,
pero no constituye evidencia de conexión: el dispatch C# cerrado retorna antes
de CachedTarget.Check y RunNative. No se llegó a consultar el reloj.

## Corrección preparada y comprobada

- Journal independiente; ninguna historia anterior borrada ni renombrada.
- `retry-local` explícito, requiere puerta Sound y puerta de retry del endpoint.
- El journal solo acepta este caso para Sound en attempt=1, con Created seguido
  de una o dos marcas Uncertain, before=null en toda la historia y ninguna
  información de upload. El cierre del supervisor puede guardar la segunda
  marca; no representa otra transferencia.
- Nueva entrada append-only con attempt=2; una tercera reentrada local se rechaza.
- El nuevo catálogo será baseline porque nunca se obtuvo uno en este intento.
  Debe preservar sus esferas y selección. No autoriza retry de datos o resume.
- Test con identidad/clave sintéticas pasó: aislamiento, append, liberación de
  lock y rechazo del tercer intento. No leyó credenciales.
- Se habilitó y compiló temporalmente el perfil C# para probarlo con target vacío:
  E:InvalidTarget, sin llamar Bluetooth. Se restauró a false y se recompiló.
- Todas las puertas vuelven a estar cerradas. No se repiten pruebas del juego:
  el payload no cambió.

El paquete conserva ID365219939, 669676 bytes y SHA256
`26fd403d01e2ac79120d2102bd49ca7f3272a61ff05a24ee623fbc7137235ad6`.
R365 sigue describiendo el ensayo y los riesgos nuevos de audio. No hay prueba
de sonido físico. Ninguna esfera se borró/activó y no se escribió el WAD.

El plan anterior prohibía reintentos: se solicita una aprobación para **un
reintento del mismo paquete y los dos ensayos manuales ya descritos**. Batería
≥50% y usuario observando. No requiere reinicio previo. No tiene sentido pedir
al usuario seleccionar DoomSound hasta confirmar registro inactivo.

Tras esa aprobación, el procedimiento exacto es habilitar únicamente
`LargePhysicalReviewed` en Probe.cs, compilar y ejecutar el test de target vacío;
habilitar main+sound+control-retry en doom-deployment-physical.mjs; ejecutar una
vez `node tools/pc-doom-sound-r365.mjs retry-local`. Cerrar después las tres
puertas JS y el perfil C#, recompilar el transporte cerrado. No repetir ante
rechazo ni corte. Con RegisteredInactive confirmado, indicar los dos ensayos
manuales de R365. No volver a pedir aprobación para el mismo reintento aprobado.

## Resultado del reintento autorizado

El usuario aprobó R366. Tras corregir la aceptación de las dos marcas locales
Uncertain (sin conectar ni añadir intento), se completó una transferencia real:
RegisteredInactive, registro confirmado, installStatus=0, MD5 eco coincidente,
328 partes, sin reanudación, cierre de conexión y salida del worker confirmados.
No se activó DoomSound ni se ejecutó C automáticamente. No se leyó de vuelta el
contenido instalado; la verificación de archivos queda en el START manual.
Las tres puertas JS y el perfil C# quedaron restaurados a false y el transporte
cerrado se recompiló. Quedan pendientes los dos ensayos manuales ya aprobados.
