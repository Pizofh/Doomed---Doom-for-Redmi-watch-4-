# R396 DoomFast: apertura con metadatos precalculados

El usuario pidió continuar y autorizó explícitamente «autorizo» el2026-10-19,
después de explicar el74% menos en el tramo Create emulado, las pruebas locales
y que se preparaba la versión consolidada. Se aplica a UNA instalación inactiva
y UN ensayo manual. Sin activación automática, reintentos, reanudación, borrados
desde PC ni reenvío del WAD. Mantener batería≥50%, reloj cerca del PC y
Mi Fitness cerrado, conforme a la preparación vigente de la sesión.

## Resultado y límites

R394 midió físicamente32,674s de START al primer acuse gráfico,26,008s en
Create. R395 evita descomprimir píxeles para construir metadatos gráficos:
469 patches y1381 sprites,158608B de tablas privadas derivadas del WAD fijado.
La media Create emulada bajó3880,5→999,5ms; no es una promesa sobre el reloj.
Evidencia y límites en docs/doom-init-research-r395.md.

R396 consolida el mismo motor optimizado en un ID nuevo013. Solo cambia la
ruta instalada respecto al prototipo R395; sus metadatos tienen idéntico hash.
Primer START copia y valida partidas desde011 y renombra el WAD011→013,
usando el mismo importador acotado del producto previo. Partidas anteriores
permanecen en011. Tras migración,013 es independiente; conservar011 hasta
validar carga y CLOSED. Si falla, no borrar ni repetir: revisar estado.

El WAD sigue verificándose completo en almacenamiento y cada página leída
con su CRC. Guardar/cargar, audio, controles y retirada de imagen no cambian.
Añade158560B residentes:2056428B. Min_free sube a7196672B; bloque mínimo
4194320B igual. No baja controles de RAM ni omite verificaciones.

## Paquete fijado

DOOM II, monstruo rojo, ID365220013/rw4doomii396. Paquete1069660B,
SHA256e3bb86a4740ea4ed8e92a6d340f36229f83b39378c62c3a049d5556b16da1923.
ELF790692B/SHA25637ac4ac1e9495572c8185e6aa1913787c92c40bff8cfcd3b003b584c7ba912b8.
Lua31209B/SHA2568ec594cbe1108d38b8c871ec67a936a93aaad8a154dcf0499adb2770973225ac.
Importador SHA256871732036b29005d4b76d67515c14638e1cf17e9d42bf22a21735f5b35fd9685.
77 recursos, sin WAD,524 partes MASS. TOTAL diagnóstico será00790692.

## Validación completada

R395:32 mapas reales con guardar/cargar, pausa y cierre; dos ciclos de menú
original y cargar desde título. Tablas nativas de columnas y sprites iguales
al original en dos aperturas de cada versión (hashes de regresión).
R396 exacto: dos ciclos de menú/juego/partidas/cierre;43 casos de migración,
incluida rename real del WAD6,53MB y readback íntegro de WAD y partidas.
27 casos de arranque/cierre/UI, con límites de RAM elevados. Fixture de CRC
ajusta sus iteraciones al ELF mayor; no cambia los límites de la aplicación.
Paquete77 recursos,6 alteraciones rechazadas, dependencia011 obligatoria,
524 partes IPC completas, seis modos retry/resume bloqueados. Regresiones
de transporte23 y gates aprobadas. Fixtures propios retirados del emulador.
Audio y gráficos S3 modelados: no sustituyen la observación física.

## Despacho y ensayo

Gates general/FAST_R396/C#Large únicamente durante un despacho y finally
restauración exacta y rebuild cerrado. Native readiness antes de privados.
Journal nuevo fast-r396.jsonl; un intento, ningún retry/resume automático.
Consulta catálogo debe encontrar011 y no013. Sin SET/START desde PC.

Manual: seleccionar la DOOM II recién añadida, START una vez. Mantener
CHECKING/LOADING despierto. Comparar carga con la anterior; cargar partida,
probar brevemente movimiento/FIRE/USAR/PAUSA y SALIR antes de60s de juego.
Esperar CLOSED sin insistir. Solo recoger tiempos aproximados y si funcionó.
Ante ERROR: GATE/CODE; no repetir ni reabrir ni borrar. Si queda imagen sobre
menús, reinicio normal desde Ajustes y esfera habitual.

Riesgos: cambia código C de inicialización y mueve el juego dentro de flash.
Puede bloquear/corromper el sistema o necesitar reinicio. Recuperación integral
sigue sin validar. No supone garantía de mejora física ni del audio entrecortado.
