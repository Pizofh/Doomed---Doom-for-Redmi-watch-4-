# R371/R372: límite de contactos stock y arranque de audio

## Entrada táctil: decisión con alcance acotado

El usuario quiere dos o tres botones mantenidos, con liberación independiente;
rechaza disparo automático, toggles y movimiento retenido. El motor acepta
máscaras combinadas. La UI actual mantiene una entrada táctil activa.

R371 amplía la inspección estática de R353 a todos los candidatos Thumb BL hacia
la función de entrega de muestras del AP fijado. Se encontraron tres llamadas:

| Offset de llamada | Construcción del reporte |
| --- | --- |
| 0x1dadc0 | r3=1 en0x1dad04; guarda npoints en sample+0 en0x1dad28 |
| 0x1dccee | r2=1 en0x1dcc40; guarda npoints en sample+0 en0x1dcc6e |
| 0x1de8c8 | r2=1 en0x1de81a; guarda npoints en sample+0 en0x1de842 |

En los tres casos el sample empieza en sp+24 y se construye como32bytes. El
identificador de punto en sample+8 también se inicializa a cero. Las ramas
posteriores cambian flags/campos del punto, no añaden un segundo contacto.
La función upper0x1c2fec admite tamaño32+24*(npoints-1), pero recibe npoints=1
en estas rutas. Abrir otro lector no reconstruye los contactos ya descartados.

El inventario de BL se hizo sobre toda la imagen y se contrastó con las ventanas
desensambladas; no se encontró puntero absoluto Thumb a la función notify. No es
un grafo exhaustivo de saltos indirectos o tail calls, ni identifica el driver
activo ni demuestra la capacidad eléctrica del panel. Sí amplía la evidencia
sobre las tres rutas stock revisadas y no justifica cambiar la UI para prometer
multitáctil. No se prepara otra prueba de Doom basada solo en esa suposición.
Investigar/modificar lower drivers sería otro alcance; el juego actual sigue
con un dedo y sin acciones retenidas o automáticas.

Reproducible con `node tools/review-rw4-touch-path-r371.mjs`. Valida el AP y
objdump por SHA, usa codeBase0x0c100000 del lock y conserva el firmware y las
ventanas en artifacts ignorados, sin copiar firmware al repositorio. El informe
final es `artifacts/research/rw4-touch-r371-v3/review.json`. La búsqueda inicial
acotada a drivers solo cubría dos llamadas; la pasada completa encontró la
tercera y el informe final incluye las tres. No radio, IO al reloj ni ejecución
del firmware durante esta revisión.

## Audio: carrera reproducida y candidato local

El usuario confirma en R370 que el primer efecto no se oye y los siguientes sí;
el posible retraso adicional es una percepción sin medición. No se presenta
esta observación como resuelta físicamente.

Hay una carrera demostrable en el código anterior: la mezcla avanza mientras
el hilo abre el servicio. La cola de cuatro bloques puede llenarse con silencio;
un efecto posterior corto avanza y se descarta por cola llena antes de que el
consumidor empiece a escribir. El test reproduce ese caso con el código anterior.
Esto demuestra una ruta de pérdida, no que sea la única causa en el reloj.

El candidato R372 conserva el mezclador parado durante la apertura sin detener
el juego. El hilo envía4bloques de512muestras de silencio, aproximadamente93ms
de PCM, y después publica un flag atómico que permite avanzar los efectos. El
primer update toma un origen de tiempo nuevo para no recuperar el tiempo de
apertura como mezcla atrasada. Los bloques de preparación no cuentan como
efectos enviados. No se reproduce un efecto de prueba ni se consume munición.

La cantidad de silencio corresponde a una cola completa; no es una medición del
tiempo de encendido del altavoz ni garantía de audibilidad. Cada llamada sigue
siendo síncrona y puede atascarse; STOP solo se comprueba entre escrituras. Se
mantienen retirada de imagen, joins y cuarentena del cierre R369. No se añaden
llamadas nuevas de firmware, RAM de muestras ni hilos.

El código aceptado R369/R370 se conserva. Un generador local produce las dos
fuentes de audio nuevas y añade un flag atómico; el builder usa explícitamente
`--startup-r372` y otro directorio. No hay instalador ni gate físico R372.

```text
node tools/build-doom-audio-r362.mjs rw4 --startup-r372
node tools/build-doom-audio-r362.mjs s3-model --startup-r372
node tools/test-audio-startup-r372.mjs
node tools/test-doom-menu-r370.mjs --startup-r372
```

La prueba determinista ejecuta el C en S3 con servicio/hilo simulados: reproduce
la pérdida anterior y conserva exactamente64muestras no nulas del primer efecto
tras600ms de apertura demorada. Cubre apertura rechazada, escritura inicial
fallida, STOP durante preparación, pausa/reanudación, STOP antes del worker y
cierre ambiguo que conserva cuarentena. Compila también para RW4. No llama audio
real ni mide el altavoz. El resultado del recorrido de Doom real con hilos y
audio modelado se conserva por separado en el build R372.

## Juego completo

El usuario indicó inicialmente que aún no tenía un WAD completo; R373 revisó
después sus dos ZIP locales. Ver [identidades y recursos](retail-iwad-inspection-r373.md).
La edición instalada sigue
siendo shareware E1M1–E1M9; no se descarga ni incorpora un WAD comercial. GOG
ofrece DOOM + DOOM II con las versiones originales DOS, según su ficha oficial:
https://www.gog.com/en/game/doom_doom_ii . El usuario debe adquirir/acceder a esa
copia; después se podrá inspeccionar su WAD local. Quedan adaptar identidad,
comprobaciones, catálogo de mapas, cache de efectos y guardados, y medir memoria
con esos datos antes de aprobar una instalación completa. No prometer soporte
al WAD completo a partir de pruebas hechas solo con shareware.
