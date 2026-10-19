# R397: armas, controles y cierre para uso habitual

Estado: paquete preparado, SIN autorización ni instalación física nueva.
R396013 es la versión aceptada en el reloj. Esta revisión requiere una
autorización concreta para un payload nuevo, según la regla del usuario.

## Comportamiento

ARMA− y ARMA+ ocupan dos botones156×34 debajo de los controles habituales.
MENU92×30 y PAUSA112×30 se superponen arriba a35% de opacidad de fondo,
en(48,42) y(230,42); no requieren reconstruir la UI en cada frame.
SALIR aparece en pausa junto a SEGUIR, separado de las acciones de juego.
Las armas se ocultan en el título y el menú original. Se conserva un dedo,
sin autofire ni falsas promesas de multitáctil. No se engancha la corona:
su ruta de entrada aún no está validada para esta esfera.

Se usan key_prevweapon/key_nextweapon y el ciclo original de armas de Doom.
Dos nuevos bits128/256, nueve teclas con RELEASE independiente; la UI acepta
solo un valor individual. C rechaza direcciones opuestas y prev+next a la vez.
No hay ampliación de ABI del control ni nuevas direcciones de firmware.

Un CLOSED normal muestra el cierre y START/INFO, sin crear los30 objetos
del diagnóstico. INFO los crea a petición. ERROR conserva detalles directos.
El antiguo panel era un conjunto acotado de valores en RAM, no un archivo de
logs de cada partida. Ahora se silencian también las líneas normales stdout
del motor; stderr de error permanece acotado a512B por mensaje. Esto no prueba
qué registra internamente el firmware. No hay nuevos ficheros de log.
Lease/captura temporal de shell y partidas siguen sus mecanismos anteriores;
el cierre normal elimina sus auxiliares temporales. No se retira la cuarentena.

CHECKING verifica el ELF completo con CRC,16KiB por callback en lugar de8KiB.
El límite de la función CRC de esta variante sube también a16KiB; los otros
lectores de partidas/importación conservan sus límites. No se guarda un recibo
que salte checks al reabrir. Una reapertura dentro del mismo contexto Lua ya
tenía caché de CRC; salir de la esfera sigue perdiendo esa caché.

## Pruebas y límites

27 casos de boot/cierre/UI con fuente exacta, incluyendo posición de botones,
cancelación de ambas teclas de arma, ausencia de SALIR en juego, menú/pausa,
escudo táctil y diagnóstico a petición.43 casos de migración, rename real y
readback completo de WAD/partida en PC. Dos ciclos del motor real candidato:
título, menú, spawn original, controles, guardar/cargar, cargar desde título,
pausa y join/unload. Audio/gráficos modelados, no salida real del reloj.

Fixture adicional del motor real comprueba tres armas (otorga escopeta solo
en el fixture), prev/next/wrap, sin repetición al mantener, sin munición gastada,
liberación de las nueve teclas al pausar y cierre completo. Solo ese fixture
expone readyweapon mediante un contador; el cambio no se empaqueta.
Una primera ejecución del fixture intentó presentar estando pausado y falló
correctamente con EBUSY; el proceso Lua terminó y su control quedó ligado al
owner anterior. Se reinició SOLO el emulador propio, se corrigió el fixture
para no presentar pausado y limpiar dentro del mismo owner. La ejecución final
pasó y descargó el módulo cooperativamente, sin reinicio dentro de esa prueba.

CRC completo intercalado en S3, con40ms entre callbacks:8KiB5117/5090ms,
16KiB3092/3092ms; callbacks máximos12ms frente24/25ms. Es una reducción del
tramo CHECKING emulado, no un porcentaje de apertura física ni una garantía
de respuesta del reloj. Se siguen comprobando todos los bytes.

79 recursos,6 alteraciones rechazadas,524 partes IPC completas y dependencia
de013 obligatoria. Todos los modos retry/resume prohibidos. Gates y23 escenarios
de transporte pasan. Directorios/archivos propios y módulos retirados del guest.
Las tablas gráficas son las mismas que R395/R396; no se repitió toda la campaña
ya validada porque el cambio de motor afecta entrada y salida de mensajes.

## Identidad

DOOM II, mismo monstruo rojo, ID365220014/rw4doomii397.
Paquete1071020B/SHA256cb16a5de71ab9f9fb0c8c0678d2e2cb0fa1cd1f2050690a8620055388f536d2e.
ELF790804B/SHA25635aed3cb271f6b7ce2c399bf7e322c1f8f1defabcddbaa7e06bd3892f2670043.
Lua31914B/SHA256f52fdaf86406144985b881556fac71ff9415656a9e5b51c178ccca158cb9d85a.
Importador SHA25637c4e1fc3b76a86c8b2519fbba1899673f598f71e246e58a7edd11922eb85155.
TOTAL00790804. Residente2056524B; min_free7200768B, min_largest4194320B.
No se rebajan los mínimos. No hay WAD en el paquete. Primer START copia y
verifica partidas013→014 y renombra el WAD, igual que la migración aceptada.
Conservar013 hasta validar;014 queda independiente después.

## Autorización y ensayo propuestos

UNA instalación inactiva y DOS arranques manuales cortos. Batería≥50%, reloj
junto al PC, Mi Fitness cerrado y observación. Sin envío de WAD, borrados,
selección/START desde PC ni reintento/reanudación automáticos.
Gates general/CONTROLS_R397/C#Large solo durante un despacho, finally restaurar
y recompilar cerrado; readiness nativo antes de leer privados, journal nuevo.

Después de instalar, reinicio normal desde Ajustes antes del primer START,
porque el último gate físico falló por fragmentación y un reinicio lo liberó;
no Restablecer. Primera prueba≤60s de juego: cargar partida, ARMA−/+, FIRE,
movimiento, MENU/PAUSA y SEGUIR; PAUSA→SALIR debe terminar CLOSED sin cifras
automáticas. INFO opcional debe mostrarlas. Solo si todo funcionó, segundo START
sin cambiar de esfera ni reiniciar, juego breve y PAUSA→SALIR→CLOSED≤20s.
Preguntar por comodidad, carga y fluidez; no pedir todas las métricas.
Ante ERROR/no cierre, no repetir ni reabrir: INFO/MODE hasta GATE/CODE y anotar.
Imagen sobre menús: reinicio normal y esfera habitual, sin volver a abrir Doom.

Riesgos: cambia entrada C, salida de consola, capas táctiles y trabajo por
callback; puede causar lag, bloqueo/corrupción o requerir reinicio. Guardar y
migrar usan flash. La recuperación integral continúa sin validar. No se promete
un resultado físico ni que no vuelva a fragmentarse la RAM.

## Autorizaci?n recibida

Tras posponer por distancia y volver a indicar disponibilidad, el usuario confirma expl?citamente ?S?, autorizo y est? todo listo?: UNA instalaci?n inactiva y DOS ensayos previstos, bater?a?50%, reloj junto al PC y Mi Fitness cerrado. Env?o ?nico a?n pendiente; no reintentos autorizados.

## Instalaci?n completada

?nico despacho autorizado completado: RegisteredInactive,524/524 partes, registro confirmado. Contenido no le?do de vuelta. Sin selecci?n ni START desde PC; WAD/partidas a?n no migrados por PC. Transporte cerrado, worker termin?0, sin nativeError. Gates general/CONTROLS_R397/C#Large restauradosfalse y worker recompilado cerrado. Pendientes losDOS arranques manuales del plan, segundo condicionado al primerCLOSED. No hay permiso para reintentar la instalaci?n.
