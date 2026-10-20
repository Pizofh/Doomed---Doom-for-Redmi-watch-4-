# R404: instalacion inactiva, lectura manual pendiente

El usuario confirmo firmware 2.2.86 y autorizo explicitamente UNA instalacion
inactiva de TouchID y UNA lectura manual, con bateria >=50%, reloj junto al PC,
Mi Fitness cerrado y pudiendo observar. Esta autorizacion levanta su anterior
NO EJECUTAR solo para el alcance del [plan R404](touch-id-physical-plan-r404.md).
No autoriza modificar drivers/firmware, hooks, I2C, otra lectura, reenvio o reintento.

## Resultado del unico envio

TouchID ID365220404, 28.348 bytes,
SHA256 `1293f339b9188bec946207f1c1e208d0fe212657a5188b25343bd9af861b98b4`.
Mismo paquete que paso los casos locales, sin recompilar/modificar Lua o recursos.

- Preflight autenticado: modelo esperado y firmware 2.2.86; diez esferas previas,
  ID nuevo ausente. Sin borrados, seleccion o lanzamiento desde PC.
- Instalacion aceptada, ACK con MD5 coincidente, offset 0 y chunk efectivo 2048.
- Se escribieron localmente las 14 partes. Catalogo posterior confirma
  **RegisteredInactive**, miembros anteriores conservados y seleccion habitual
  mantenida por las comprobaciones del transporte.
- Cierre confirmado, worker terminado con codigo 0 y sin error nativo.
- Gates JavaScript restaurados y worker recompilado cerrado en finally. Una
  prueba LOCAL posterior devuelve `E:GateClosed`, sin otra conexion Bluetooth.

El registro no es un readback de los bytes instalados: contentVerified=false.
No se ha ejecutado LEER ni se ha identificado el controlador. La version reportada
no sustituye una atestacion integral del firmware vivo.

## Alcance restante y evidencia

Se pidio al usuario abrir TouchID, pulsar LEER UNA VEZ, esperar sin cambiar de
esfera y devolver CONTROLADOR/ID/CACHE o motivo de ERROR. No repetir; despues
volver a la esfera habitual. El resultado de esa unica lectura sigue pendiente.
La marca persistente debe impedir rearmado normal, no se borrara para insistir.

Evidencia local ignorada:

- `build/touch-id-r404/authorization-r404.json`
- `build/touch-id-r404/physical-install-r404.json`
- `build/touch-id-r404/dispatch-closed-r404.json`
- `build/touch-id-r404/verified-after-install-r404.json`
- Journal privado `tools/local/pc-rfcomm/doom-deployment/touch-id-r404.jsonl`,
  intento 1 terminal RegisteredInactive, 14/14 partes.

`build/touch-id-r404/dispatch-r404.mjs` YA SE EJECUTO. Su marcador `.started`
existe. No repetirlo, borrar/renombrar su journal ni abrir gates otra vez.
No consulta adicional al reloj ni seleccion/LEER automaticos pendientes.
