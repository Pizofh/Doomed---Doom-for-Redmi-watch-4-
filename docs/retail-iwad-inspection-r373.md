# R373: los dos ZIP aportados por el usuario

Revisión local de solo lectura de los dos ZIP más recientes de Descargas.
Cada uno contiene únicamente un WAD; sin extracción a disco, ejecución,
redistribución ni envío al reloj.

| Archivo | Bytes WAD | Mapas | Lumps |
| --- | ---: | ---: | ---: |
| Ultimate Doom, The.zip → DOOM.WAD |12408292|36, E1M1–E4M9|2306|
| Doom II - Hell on Earth (v1.9).zip → DOOM2.WAD |14604584|32, MAP01–MAP32|2919|

Ultimate coincide en tamaño/MD5 con1.9ud de
[Debian game-data-packager67](https://sources.debian.org/src/game-data-packager/67/data/doom.yaml/).
Doom II coincide con la referencia1.9 del
[registro Debian](https://alioth-lists-archive.debian.net/pipermail/pkg-games-commits/2017-October/052908.html).
MD5 identifica versiones históricas, no autentica al distribuidor. SHA256 local:

- Ultimate WAD: `6fdf361847b46228cfebd9f3af09cd844282ac75f3edbb61ca4cb27103ce2e7f`;
  MD5 `c4fe9fd920207691a9f493668e0a2083`, CRC32decimal3205409472.
- Doom II WAD: `10d67824b11025ddd9198e8cfc87ca335ee6e2d3e63af4180fa9b8a471893255`;
  MD5 `25e1459ca71d321525f84628f45ca8cd`, CRC32decimal3968280027.
- ZIP Ultimate: `fb887fc0d9516370ce834b3fc6366696a40c07d8b276424392ffc1e394f8c961`.
- ZIP Doom II: `995a8b4b0e546ac706069b0854989665976810a78c15116d5d52a92ef01395b2`.

`tools/inspect-doom-archives-r373.mjs <zip> [zip ...]` valida límites ZIP
centrales/locales, consumo/tamaño de deflate, CRC de los WAD descomprimidos solo
en memoria, cabecera/directorio/nombres/límites IWAD y secuencia/divisibilidad
de registros de todos los mapas. No interpreta toda la geometría ni garantiza
compatibilidad de gameplay. Límite32MiB por WAD; no modifica el parser shareware.

## Recursos y decisión

Se resuelven sonidos repetidos con la última entrada por nombre, como el motor.
Ultimate tiene55DS anteriores reemplazados: el total final es67DMX únicos,
684809bytes útiles; Doom II107/1240277B. Sin DMX inválido según el decodificador.
Contar duplicados inflaba Ultimate a122/1217736B; no usar esa primera cifra.

La caché actual557056B queda corta por127753B(~125KiB) para Ultimate y683221B
(~667KiB) para Doom II. Es el presupuesto para precargar todos los DS únicos,
no RAM total ni una prueba de lo que ocupa el motor real en cada mapa. El
backend actual omite silenciosamente muestras que no caben: hay que adaptarlo.

Mayor mapa por bytes de registros: E4M9(190318B) y MAP14(204410B). No equivale
a RAM/FPS ni identifica el peor mapa: faltan texturas/sprites, estructuras
expandidas, entidades vivas y visibilidad. Validar todos los mapas localmente.

Empezar por Ultimate Doom; adaptar identidad, mapas, cache y slots con este WAD.
El cargador instalado sigue fijado al shareware4196020B/CRC371943786 y los saves
al episodio1. No reemplazar el WAD del carrier963 ni las partidas anteriores.
Sin candidato completo ni nuevo ensayo autorizado. R372 de audio sigue local.
