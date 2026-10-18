# R367: corregir la base nativa del audio y conservar el inicio original

## Resultado físico anterior y causa localizada

El usuario probó DoomSound R365: juego y salida correctos, sin sonido;
AUDIO ERR=22, PCM SFX=0, CACHE=532927. No hizo el segundo ciclo condicionado
a audio correcto. No se solicita repetir ese paquete.

La generación de audio usaba erróneamente `offset + 0x1bff187c`, una diferencia
utilizada en inspección de alias, como dirección de ejecución. El contrato común
del port utiliza `codeBase=0x0c100000` y lleva tiempo funcionando físicamente.
R367 toma esa base del lock existente, verifica el SHA del AP y contrasta cuatro
direcciones comunes con el header de bindings. Un puntero absoluto independiente
del wrapper de eventos media también coincide: offset 0x4e0188 apunta a
`0x0c100000 + 0x4df908 + 1`.

Las nueve llamadas y sus fingerprints ahora usan esa misma base. No se eliminó
ni debilitó la comprobación. Con la base anterior era esperable un rechazo de
fingerprint, que el adaptador convertía a 22. El resultado físico no incluía la
etapa: es consistente con esta causa, pero no demuestra por sí solo dónde falló.

Los errores nuevos conservan etapa y errno: 1xxx validación (1001..1009 señala
fingerprint), 2xxx foco, 3xxx open, 4xxx prepare, 5xxx start, 6xxx pausa/resume,
7xxx write (7104 parcial), 8xxx close, 9xxx abandon. Un error secundario de
cierre ya no reemplaza al primero. La reproducción RW4 sigue sin comprobar.

## Posición inicial y cadáveres

El usuario aclara que los ve con START sin CARGAR. Se inspeccionó el WAD fijado,
sin modificarlo: E1M1 contiene 15 cadáveres/restos decorativos colocados en el
mapa. El arranque del jugador 1 está en x=1056,y=-3616,ángulo=90°.

En dos ciclos con motor real, el estado inicial coincidió exactamente con esa
posición/orientación, 50 balas y 100 de salud, incluso después de guardar/cargar
en el ciclo anterior. No hay autocarga al START. Eso valida el emulador; no se
obtuvo una captura de coordenadas del reloj para comparar lo que percibió el
usuario. No se altera el mapa ni se elimina su decoración para ocultarlo.

## Paquete concreto

- **DoomAudio**, preview de **cuatro barras amarillas**, ID **365219938**.
- Módulo `rw4audio367`. Tamaño **669980 bytes**, 58 recursos.
- SHA256: `1b7887eddc2a609460fb521a29c7f8a57476c0c301bc9cf261286fa5fdb38f05`.
- ELF 623320 bytes, SHA256
  `3a7726ae20173d89623ef03aa144181b3e2e0e3a99181ad9d731cf3895d05730`.
- Lua SHA256: `c88e24e040d733c4cd473cacd223ede31392ac3fd8c38c33a6ed1170e4135449`.

Conserva DoomReady/DoomLauncher/DoomSound y sus bancos de partidas. No reenvía
WAD, no cambia renderizado, controles, tamaño de zona o caché respecto a R365.
Los cambios funcionales son base nativa correcta y errores identificables.
Las partidas de DoomAudio quedan en su propia carpeta; no sobrescribe anteriores.

## Validación y transporte

Pasaron los vectores C actualizados del adaptador, incluidos los códigos exactos
por etapa y envío parcial; compilación RW4 y dos ciclos S3 con motor real,
guardar/cargar, pausa, PCM no silencioso, join/unload e inicio original.
La zona de 3 MiB y los nueve mapas ya se validaron en R365, sin cambios aquí;
no se repitió esa campaña ni auditorías Git generales.

Se verificaron paquete/58 recursos, cinco alteraciones rechazadas, análisis
sintáctico de Lua exacto, preflight offline e instalación cerrada. El journal
propio `audio-r367.jsonl` se probó con identidad y clave sintéticas. El instalador
comprueba el dispatch nativo con target vacío **antes** de leer credenciales o
crear el journal; así el bloqueo de perfil anterior no consume el registro.
Todo está cerrado. No hubo instalación ni arranque físico R367.

## Aprobación y ensayo propuestos

Se solicita una instalación inactiva y dos arranques manuales de hasta 60 s,
usuario observando con batería ≥50% y volumen multimedia audible. Sin reinicio
previo, retries, resume, borrado o activación automática. Seleccionar solo tras
confirmar RegisteredInactive. Primer ciclo: START una vez, probar disparo/puerta,
PAUSA 2 s/SEGUIR, GUARDAR/CARGAR y SALIR. Recoger AUDIO ERR/PCM SFX/CACHE.
Solo con sonido correcto, CLOSED y AUDIO ERR=0, segundo START corto y SALIR.
Ante silencio/error/corrupción/no CLOSED, no repetir ni reabrir.

La corrección cambia las direcciones que se validan y se intentarían llamar en
RW4. Media/foco y sus esperas todavía no están probados físicamente. Mantiene
los riesgos de bloqueo/panic/corrupción y falta de recuperación integral validada.
Una llamada bloqueada no es cancelable por el timeout del controlador y puede
impedir CLOSED; se retienen módulo/memoria, sin forzar descarga. Puede requerir
reinicio desde Ajustes si responde. El servicio del emulador es un doble, no una
prueba de que vaya a sonar el altavoz.

Tras aprobación: abrir LargePhysicalReviewed en Probe.cs, compilar transporte;
abrir solo main+audio-r367 JS, ejecutar una vez
`node tools/pc-doom-audio-r367.mjs install`. No abrir control-retry ni Sound.
Al terminar cerrar ambas puertas JS y el perfil C#, recompilar cerrado. No
realizar consultas o pruebas extra para pedir al usuario confirmar menús/corona:
asumir normalidad salvo que reporte problemas.

## Instalación autorizada ejecutada

El usuario autorizó la instalación y los dos arranques. Se completó un envío:
RegisteredInactive, registeredVerified=true, installStatus=0, MD5 eco coincidente,
328 partes, sin reanudación, conexión cerrada y worker terminado con exit=0.
No se seleccionó la esfera ni se ejecutó C automáticamente. No se leyó de vuelta
el contenido: su comprobación queda en el START manual. Puertas JS main/Audio
y perfil Large C# restaurados a false; transporte cerrado recompilado. Pendiente
el resultado manual del usuario, sin afirmar todavía que suene el reloj.
