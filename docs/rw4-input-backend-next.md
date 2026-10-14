# Siguiente checkpoint PC — backend C con UI atendiendo input

Después de R226, el objetivo concreto es preparar una demo acotada en la que
Lua conserva controles y EXIT mientras C recibe las acciones y devuelve un
resultado visible. Sin Doom todavía; sin nuevos ensayos físicos por este documento.

## Qué se reutiliza

- HoldPad: objetos propios, contacto mantenido, liberación y retorno stock.
- NativeLog/NativeFrames: cinco APIs de archivos verificadas para el payload
  concreto2.2.86 y generación de PNG propios. No crean worker permanente.
- Port S3: contratos de input/pausa/STOP y motor originales como referencia;
  sus direcciones, ABI y exportaciones no sirven automáticamente en RW4.

## Restricción decisiva

Insmod hasta ahora ejecutó trabajo síncrono corto y después se retiró. Meter
el bucle de Doom en esa misma llamada podría bloquear Lua/UI e impedir input
y EXIT. C debe devolver el control a la UI, con un mecanismo de ejecución y
comunicación cuyos contratos se entiendan en FW2.2.86 antes de enviarlo.

Preparación: inspeccionar las referencias locales a puente Lua/nativo y
scheduling/lifecycle de la imagen específica, sin ejecutarla. Determinar qué
mecanismo permite trabajar mientras UI atiende eventos; no asumir pthread,
task_create, join, atomics o callbacks porque funcionaron en S3. El transporte
de acciones puede reutilizar archivos propios si su coste y ciclo de vida lo
permiten; elegirlo tras conocer el mecanismo, sin escribir flash cada frame.

## Criterios de la futura demo

1. START devuelve a UI; acciones UP/LEFT/RIGHT/FIRE tienen confirmación de C,
   con estado neutral tras release/cancelación/pausa. No leer input stock por detrás.
2. Un patrón o contador propio permite observar el resultado, sin motor alternativo.
3. Trabajo y memoria acotados; EXIT solicita parada, confirma fin del trabajo y
   neutralidad antes de descargar. Ningún callback/hilo sigue dentro del módulo.
4. Retorno a habitual y persistencia de archivos del launcher; no recargas
   insmod/rmmod por cada contacto ni reinstalación desde PC para cada inicio.
5. Toda API nueva necesita evidencia específica y prueba PC/emulador con límites
   explícitos. Hardware solo después de paquete/plan concreto y nueva revisión.

Sin mecanismo razonable: registrar el bloqueo y comparar alternativas soportadas.
No escalar privilegios, hacer exploits, flashear o alterar firmware para avanzar.
Recuperación integral, modelo de privilegios y recursos libres físicos continúan
abiertos. Este diseño no promete sandbox ni plazo para Doom físico.
