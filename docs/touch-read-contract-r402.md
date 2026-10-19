# R402: contrato local para identificar el tactil

Continua **NO EJECUTAR**: no conexion, BLE, envio, comando en reloj, emulador,
I2C, ioctl, hook ni cambio de firmware. Los comandos del modelo son texto.
R397014 sigue siendo la version funcional; no se ha preparado otro instalable.

## Resultado y decision

Se completo un modelo ejecutable SOLO en Node del PC y su revision contra el AP
fijado por R400/R401. Pasan 38 casos. No es un wrapper Lua probado ni una prueba
del controlador real. No se encontro un interprete Lua host en las rutas locales
consultadas; no se sustituyo por ejecutar Lua en el emulador o en el reloj.

La investigacion justifica disenar una identificacion acotada antes de decidir
si merece la pena observar contactos inferiores. **No justifica modificar el
driver, enganchar interrupciones ni cambiar firmware.** Siguen sin conocerse
el selector de esta unidad y su capacidad efectiva de dos contactos.

## Contrato comprobado

- Constructor inerte, inicio unico, sin reintentos ni direcciones aportadas por
  el usuario. El modelo no importa APIs de archivos, procesos, red o transporte.
- Siete lecturas de palabras de codigo/literales, elegidas del handler `mw` y
  del selector R400. Ante una sola diferencia, terminar antes de leer el selector.
- Una lectura del selector. Solo valores 1/2/3; otros valores terminan el ensayo.
  Solo selector 2 habilita una lectura adicional del cache Chipone.
- Maximo nueve intenciones de lectura. Cada una tiene solo `mw` y una direccion
  hexadecimal constante: sin asignacion, cantidad, entradas libres ni bucles de
  memoria. No se ejecuta ninguna intencion en estas herramientas.
- El formato se extrajo de los literales reales del AP: dos espacios, `%p`,
  ` = 0x%08lx`, LF. Se admite CRLF y variaciones hexadecimales de `%p`; se exige
  direccion coincidente, una sola palabra, linea completa y longitud <=96.
  Un prompt, echo, error, NUL, dato truncado o segunda linea produce STOPPED.
- Solo se conservan el byte selector y el byte de cache definido por R400;
  los datos vecinos no se interpretan como capacidades. Cache 0 es invalido.
  Cualquier otro valor sigue marcado `multitouchProven=false`, incluso 2 o mas.
- Abortos de captura, discrepancias y sesiones terminadas no permiten continuar.

Las pruebas contrastan SHA del AP y handler, palabras de codigo y punteros al
formato, todos los puntos de discrepancia, salidas contaminadas, selectores
invalidos, extraccion de bytes vecinos y fallo de captura en cada etapa.

## Lo que estas comprobaciones NO garantizan

Las siete palabras NO son una huella integral del firmware vivo. Incluso la
primera lectura depende de que el comando y la direccion sean correctos: no se
puede usar su propia salida como garantia previa de seguridad. No se ha atestado
el firmware actual ni probado `mw` desde `system.execute` de una esfera. Si el
mapa no corresponde o el comando falla dentro del sistema, puede haber bloqueo.

El limite de 96 es del texto aceptado en el modelo. No impone por si solo limite
de escritura del shell ni un timeout de `system.execute`. `pcall` no recupera una
excepcion nativa ni cancela una llamada bloqueada. No venderlo como watchdog.

## Requisitos pendientes para un adaptador Lua revisable

Antes de preparar un paquete, el adaptador debe usar una ruta propia fija, negar
capturas preexistentes o errores de ausencia, cerrar el fichero incluso si falla
la lectura y limpiar solo la captura propia. Si ejecucion, lectura, cierre o
limpieza fallan, detenerse. No borrar un fichero encontrado al inicio. La
comprobacion de ausencia y la redireccion no equivalen a creacion atomica:
debe revisarse exclusividad/lifecycle, ademas del limite de lectura y formato.

No habra Doom, carga ELF, API libre de memoria ni escritura al destino. La captura
de salida si escribe su propio almacenamiento. Hacen falta pruebas reales del
Lua con dependencias simuladas; estos 38 casos solo validan el modelo del PC.
El adaptador y cualquier instalacion/ensayo fisico siguen pendientes y requieren
una autorizacion explicita que levante NO EJECUTAR para un alcance concreto.

## Reproducibilidad

`node tools/test-touch-read-contract-r402.mjs` no acepta argumentos y no despacha
los comandos. Usa el AP local como datos y crea una sola vez el informe ignorado
`artifacts/research/rw4-touch-r402-contract/review.json`. No sobreescribe evidencia.
Codigo del modelo: `tools/touch-read-contract-r402.mjs`.
