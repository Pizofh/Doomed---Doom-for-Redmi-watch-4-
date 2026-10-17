# R342: bridge C de Image persistente y buffers reutilizables

Implementado el componente local RW4 y ejecutado su núcleo C en S3 con un
backend simulado. No se instaló nada en el reloj ni se cambió DoomDemand.

El bridge mantiene una Image y dos buffers 320x200x32. El productor reserva
un slot libre, lo rellena y publica un ticket con generación. La UI cambia
el descriptor de fuente; solo libera el slot anterior después de terminar
el dibujo y retirar su cache. No hay PNG, archivo por cuadro ni escritura
en el framebuffer stock. La instancia no asigna memoria: quien la integre
debe aportar los dos buffers y conservarlos hasta el cierre confirmado.

## Observación del resultado de dibujo

Se contrastaron eventos del AP: Image procesa MAIN21 y POST24; el refresco
envía sus finales22 y25. La nueva implementación registra una callback en
**su propia Image**, mediante el API normal de eventos. No reemplaza la
callback de espera del display ni modifica tablas de firmware.

Al final de ambos pases llama finish59678, que devuelve estado, y conserva
el primer error antes de que el flush stock invoque la espera void. Un error
queda fijo incluso si la siguiente espera devuelve cero. Detiene nuevas
publicaciones y bloquea reinicio, reutilización de fuentes y descarga.
También hay una espera explícita después del refresh y al retirar la Image.

La callback se retira antes del delete normal. Si otra parte de la UI borra
la Image, DELETE33 invalida el puntero y deja el componente bloqueado: una
salida posterior no llama delete sobre memoria liberada. No recupera una
instancia fallida por timeout, GC o rmmod forzado.

Este mecanismo observa **nuestras esperas comprobadas**. No convierte los
errores internos previos que el renderer ya haya consumido en observables,
ni acredita recuperación ante panic/cuelgue. La semántica del backend vivo
y los eventos físicos aún no están validados. El resultado local no cierra
por sí solo todos los límites de R341.

## Contratos de integración

- Start/present/close y callbacks gráficos pertenecen a una tarea UI fija.
  Otra tarea no puede adoptar la instancia cerrada. Init no llama al host.
- Un productor, tickets sin reutilización al desbordar y publicación atómica.
  Ningún escritor recibe el slot visible o uno retenido por fallo.
- Close requiere que el productor haya **salido y sido unido con join**.
  El argumento de integración que lo confirma no es una comprobación del OS;
  el futuro transporte debe obtenerlo del join real, no de un temporizador.
- El adaptador verifica 15 huellas de64B y la identidad del display, pantalla,
  draw_ctx y callback esperada. Los campos RW4 son driver+96 y ctx+52; no se
  reutilizan offsets S3. Las huellas no contienen fallos de un mapa incompatible.
- Un frame oculto sin evento de dibujo bloquea la instancia, conservando
  memoria. Las descripciones y los buffers deben ser estables y distintos.

## Validación realizada

`node tools/test-direct-view-r342.mjs`:

- **20 escenarios**, 329 aserciones de control y3072000 comparaciones de píxeles.
- Dos ciclos de24 publicaciones; cuadro completo contrastado con una función
  de referencia, reservas durante dibujo, dos slots llenos y tickets antiguos.
- Fallos en espera inicial, MAIN, POST, final de presentación y ambas esperas
  de close. El modelo hace que una espera stock posterior sea correcta:
  el error original sigue bloqueando la descarga.
- Fallos de validación, creación, registro/retirada de evento, callback desde
  otra tarea, evento ausente, borrado externo y agotamiento de generaciones.

Se ejecuta el **mismo núcleo C** dentro del S3; gráficos, callbacks y planificación
del productor están modelados. No son pruebas de LVGL real, GPU, hilos reales,
latencia ni Doom en esta versión. El módulo de pruebas se retiró normalmente
y su temporal se eliminó. No se ejecutó el adaptador RW4 en S3.

`node tools/build-direct-rw4-r342.mjs` compila el adaptador y núcleo para
ARMv8-M.mainline/Thumb/soft-float, sin imports y **sin entry de módulo**:

| Resultado | Valor |
|---|---|
| Componente relocatable |4732B|
| Secciones asignables de código/datos |2304B|
| SHA256 |779409a9d35b0e589a719756601cd4d566d4bd1b8825ed1a6f27a3886d810e06|
| Buffers requeridos, fuera del componente |512000B|
| Descriptores RW4 |12B cada uno; cf4,320x200,data_size256000|

Los2304B no incluyen structs por instancia, buffers ni overhead de carga.
512000B tampoco es el incremento neto de Doom: falta contabilizar la retirada
del transporte PNG y sus reservas al integrarlo. No se declara todavía un
presupuesto RAM completo ni paquete físico listo.

Fuentes: device/direct-view-r342.[ch] y direct-rw4-r342.[ch], bajo
doom/platform-rw4. Builder y test de nombres R342. El reviewer
review-rw4-events-r342.mjs conserva únicamente ventanas locales ignoradas.
Resultados ignorados: build/direct-rw4-r342/review.json y
artifacts/research/direct-view-r342/result.json.

Siguiente trabajo concreto: conectar el productor de frames de Doom y su join
real, posicionar la Image en el launcher y probar presentación/retirada con
gráficos reales. Después, presupuesto y paquete para un ensayo físico aprobado.
Conservar DoomDemand945 y carrier963. No hay autorización física pendiente.
