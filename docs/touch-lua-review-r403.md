# R403: adaptador Lua revisado con dependencias simuladas

Alcance autorizado: continuar investigando. Sigue **NO EJECUTAR en el reloj**.
No hubo conexion, radio, envio, seleccion de esfera, comandos reales de memoria,
ejecucion de firmware ni uso del emulador de dispositivo. No existe paquete nuevo.

## Resultado

`experiments/touch-identity/read-only-r403.lua` implementa el contrato R402 con
archivos y sistema inyectados; no tiene main, UI, carga nativa ni enlaces
implicitos a `io`/`os`. Su constructor no hace I/O. Un START manual seria necesario
en un futuro adaptador de UI; esta revision solo llamo START con mocks en el PC.

Pasaron **62 casos ejecutando el Lua**, ademas de los 38 del modelo Node corregido.
La prueba usa [Fengari](https://github.com/fengari-lua/fengari), implementacion de
Lua 5.3 en JavaScript, con solo base/string/table/math abiertos. No se abren
io/os/package/debug ni se expone un despachador de shell a Lua. `files.open`,
`system.execute` y `system.remove` son exclusivamente funciones simuladas.
Esto valida la logica Lua, no el ABI ni las llamadas del firmware real.

## Correccion encontrada durante la revision

El plan R402 original incluia una palabra de codigo en `0c31f8be`, direccion
alineada a 2 bytes pero NO a 4. No se habia ejecutado ni leido en hardware.
Para no depender de lecturas de palabra desalineadas, se sustituyo por
`0c31f8c0`, valor `4620682b`, contrastado con el AP fijado como datos.
Los dos runners y el mock de despacho ahora exigen alineacion de 4 bytes para
todas las direcciones. Los informes anteriores se conservan como historial;
no son aprobacion del plan corregido ni ensayos fisicos.

Los valores de palabra se convierten a aritmetica de coma flotante desde cada
digito hexadecimal. Asi se evita desbordamiento de enteros Lua de 32 bits en
palabras como `b3404680` o `ffffff02`; los valores de 32 bits caben exactamente
en un double. Los casos con bytes vecinos altos tambien pasaron.

## Captura y detencion

- Ruta limitada a un directorio numerico de esfera y un nombre fijo propio.
  Los metodos de archivos/sistema y la ruta se capturan al construir; mutar la
  configuracion o tablas inyectadas despues no cambia esa autoridad.
- Como maximo nueve comandos constantes: siete palabras de codigo/literales,
  selector, y cache solo para Chipone. Sin '=' ni argumento de cantidad.
- Una sola tentativa por instancia y por modulo cargado, incluyendo reentrada.
  Fallos de codigo, salida o captura detienen todo, sin avanzar ni reintentar.
- Una captura preexistente, incluso vacia o ilegible, impide ejecutar y NO se
  borra. Solo una ausencia confirmada con errno 2 habilita el despacho simulado.
- Toda apertura conseguida intenta cierre, incluso por lectura truncada,
  desbordamiento o excepcion. Despues del despacho se intenta retirar solo la
  ruta propia, tambien si ejecucion o lectura fallan. Un cierre o limpieza no
  confirmados detienen el ensayo; no se afirma haber recuperado un handle cuyo
  cierre ha fallado.
- El retorno del shell por si solo no demuestra exito. Se exige una sola linea,
  direccion correcta y palabra completa, dentro del limite de lectura.
- No se guardan words vecinos en el resultado. Cache >=2 nunca se presenta
  como prueba de dos contactos reales; `multitouch_proven` sigue false.

Los casos cubren cada pin discrepante, excepcion de despacho en cada paso,
tres controladores, cache invalido, variaciones validas de `%p`, contaminacion,
archivos previos, errores de apertura/lectura/cierre/limpieza y reentrada.

## Limites y decision sobre una prueba futura

Este codigo sigue siendo un borrador de investigacion, **no un diagnostico listo
para instalar**. Falta verificar correspondencia del firmware actual, integrar
una UI manual minima y revisar su lifecycle/paquete y la ruta real de captura.
No se debe pedir autorizacion de instalacion como si esos trabajos ya existieran.

Las siete palabras no atestan toda la imagen y su primera lectura ya presupone
comando/mapa correctos. La comprobacion de ausencia y redireccion NO es atomica.
Que las llamadas a funciones de esa region hayan funcionado no valida esta ruta
de lectura de codigo: tampoco se ha probado su acceso como datos desde `mw`.
El guard del modulo no excluye otra VM, una recarga o escritores externos; no
constituye un lock del sistema. Una interrupcion puede dejar una captura que
bloqueara otro inicio y que no se elimina automaticamente. El parser acotado
no impone timeout nativo ni limita por si solo las escrituras del shell.
`pcall` no evita ni recupera un fault del sistema.

Recomendacion: si se prepara y autoriza una prueba fisica, limitarla primero a
identificacion, sin Doom, ELF nuevo, bus tactil, hooks ni llamadas de init. Es
menos invasiva que reemplazar un driver, pero puede bloquear el sistema si el
mapa o contexto difieren. Seguimos sin recuperacion integral validada. No hay
evidencia para recomendar aun modificar firmware o habilitar contactos a ciegas.

## Reproducir solo en el PC

Runner: `node tools/test-touch-lua-r403.mjs`. Dependencias locales bajo
`tools/local/lua-host-r403`, ignoradas, instaladas sin scripts ni cambios globales:
fengari 0.1.5, readline-sync 1.4.10, sprintf-js 1.1.3 y tmp 0.2.7.
El runner exige versiones, origen e integridades fijados y registra hashes de
los archivos del runtime; no descarga nada ni instala dependencias al probar.

Informes corregidos ignorados:
`artifacts/research/rw4-touch-r403-lua-99f1229d39ae/review.json` y
`artifacts/research/rw4-touch-r402-contract-6ee7d73c4c90/review.json`.
Cada hash de entrada tiene su propia evidencia; repetirla se niega a sobrescribir.
El informe R403 sin sufijo corresponde a la primera pasada, anterior a la
correccion de alineacion. La evidencia definitiva es la pasada con sufijo hash.
