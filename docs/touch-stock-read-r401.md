# R401: alternativa de identificacion sin modulo C nuevo

Continua la instruccion del usuario: investigar y NO EJECUTAR. Aqui no se
conecto el reloj ni se envio/ejecuto comando alguno; tampoco se uso el emulador.

## Hallazgo

La tabla de comandos NSH de la imagen fijada contiene mw: entrada77e20,
handler21f7f8, minimo2/maximo3 argumentos. Su ayuda y la [documentacion oficial
de NuttX](https://nuttx.apache.org/docs/latest/applications/nsh/commands.html)
describen acceso de32bits y escritura opcional con '='. No se toma la ayuda
como unica prueba: se reviso la rama del handler exacto del AP.

Con argumento de direccion SIN '=' y SIN argumento de cantidad, el flujo es:
busca '=', toma la rama sin asignacion, interpreta direccion hexadecimal,
comprueba argc<=2, lee una palabra, imprime y retorna. La escritura al destino
en21f84a pertenece a la otra rama. El modo con cantidad tampoco hace falta.
Las escrituras normales a stack/stdio no son escrituras al destino inspeccionado.

La lectura propuesta quedaria limitada a una palabra alineada que contiene el
selector R400 y, solo si selector=2, una palabra alineada que contiene el cache
Chipone. Se extraerian respectivamente bits0..7 y16..23. Las otras posiciones
del word son datos vecinos, no indicadores nuevos. No se admite una direccion
introducida por usuario, '=', cantidad variable ni composicion libre de shell.
Los argumentos fijos estan en el informe local ignorado, no hay CLI de despacho.

Esto podria evitar cargar un ELF C propio solo para identificar el controlador:
el lector ya existe en el firmware. La ruta system.execute/captura se usa en
el launcher, pero este comando especifico NO se ha probado desde la esfera.
Que exista el handler no garantiza que se permita ni que funcione en ese contexto.
Una busqueda de nombres de consulta de identidad no encontro una API publica
especifica de controlador; una busqueda de strings no demuestra su inexistencia.

## Riesgo y frontera

Se elimina el codigo lector nativo nuevo del diseno R400, no todos los riesgos.
Una direccion equivocada puede provocar una excepcion o bloqueo; una imagen
distinta invalida el mapa. El comando stock tambien sabe escribir, por lo que
un generador que acepte '=' o una shell arbitraria seria inaceptable para esta
finalidad. Una captura de salida por fichero hace pequenas escrituras a su
propio almacenamiento; no se debe presentar como cero escrituras absolutas.

El cuerpo revisado no abre input/I2C, reinicia el tactil, cambia sus callbacks
ni actualiza firmware. Tampoco habilita multitactil: solo intenta responder que
driver esta activo y que max_num guardo el sistema. Las limitaciones R400 sobre
interpretar ese maximo y el firmware/panel siguen vigentes.

Antes de preparar un instalable habria que revisar huellas/mapa, wrapper Lua,
captura acotada, validacion de salida, limpieza y negativa ante contrato distinto.
No hay paquete, instalacion, aprobacion ni ensayo fisico nuevos. El siguiente
«ok» del usuario no revoca por si solo su instruccion NO EJECUTAR.

## Evidencia

`node tools/review-touch-stock-read-r401.mjs`: analiza el AP como datos,
comprueba SHA de imagen/objdump, tabla, instrucciones de ambas ramas y
argumentos constantes. No interpreta esos argumentos como comandos.
Salida ignorada artifacts/research/rw4-touch-r401-repro/review.json,
SHA del handler f5bd062657b334de1b7fa7d6537c5f07ce2c54547d70c815de41b75f56ea3ca0.
Los informes son reproducibles y se niegan a sobreescribir resultados previos.
