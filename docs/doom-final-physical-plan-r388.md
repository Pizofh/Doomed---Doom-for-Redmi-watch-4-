# R388: una esfera final DOOM II

El usuario autorizó «manda la nueva versión de una vez […] si puedes mejorarle
algo el sonido […] si no, déjalo así». Confirmó después reloj junto al PC,
batería ≥50% y Mi Fitness cerrado («Sí, listo»). Este permiso sustituye el
estado anterior de preparación local: UN envío inactivo y UN ensayo manual.
No repetir instalación, reanudar, seleccionar por PC ni borrar esferas por PC.

Paquete DoomFinal, título DOOM II, ID365220009, casco verde original;
1.404.628 bytes, SHA256
4533a2e0e53e581a38395725b8be863383d6d0003899e4f2edd8dfd5ea47f5b2.
77 recursos propios: Lua, importador, ELF y PNG; no incluye WAD comercial.
ELF631972B SHA038316082eeab3840f00264176d96771669461299fd8a57a6bd4f7229323110d.
Lua31207B SHA36e73a50e22a97f8ca08f4b79d4cae0acdd500fffad040be68e52d262e6b9553.
Importador5770B SHA9a0d18c1a87c64e5102fe5c082d718d6b690e204031bab16f3aa2f1caef15eaa.
RAM mínima7036928, bloque4194320; no se rebajan los límites R387.

Primer START, antes del C: comprobar identidad/índice/tamaño del WAD006;
copiar bancos válidos de partidas a staging009 con lecturas8192B, CRC,
flush, renombrado y nueva lectura CRC. Mantener los bancos originales006.
Solo después, mover por os.rename el WAD006 a009 sin duplicarlo entero.
Rechazar módulos activos, función rename ausente, bancos todos corruptos,
destino distinto o fallos de lectura/escritura. Liberar importador/GC antes
de medir RAM y cargar ELF. Si WAD009 ya existe y es válido, no leer006.
No se altera el catálogo ni se sobreescriben partidas diferentes.

Esta migración hace que DoomII006, DoomFit007 y DoomTune008 ya no puedan
iniciar el juego: conservarlos hasta validar carga y CLOSED;
después el usuario podrá quitarlos. La versión009 reúne motor, datos,
partidas y UI y permite volver a Mi Fitness/uso habitual. La disponibilidad
real de rename entre esas rutas sigue pendiente de probar en el reloj.
No se promete recuperación integral ni durabilidad ante corte de energía.

Imagen grande restaurada zoom306/Y30 (~383×239), captura táctil R387 e icono
original. Audio mezclador/worker idénticos R387: no prometer menos cortes;
la música MIDI no está implementada y queda para una versión posterior.

Evidencia local:43 casos de migración con fallos e interrupciones; traslado
en filesystem real del emulador, WAD completo leído de vuelta y saves CRC;
motor desde009 con antiguo carrier eliminado, dos ciclos/menú/MAP01/
guardar/cargar y carga desde título;27 casos de boot/UI, cierre con audio
bloqueado prepare/close. Paquete77 recursos contrastados,688 partes IPC,
tamper6, dependencia006 y todos los reintentos rechazados. Regresiones:
transporte PC23 escenarios, gates y algoritmo de upload aprobados.
No son pruebas de audio real ni campaña física completa.

Abrir únicamente gate general/FINAL y C#Large para un despacho. Vaciar target
en prueba de readiness antes de privados. Journal final-r388 exclusivo,
gates restaurados y worker reconstruido en finally incluso si falla.
Un rechazo/corte consume el intento: detener, no reintentar automáticamente.

Ensayo breve: seleccionar DOOM II/casco verde, START1, mantener CHECKING
despierto (migración única). Cargar partida desde PAUSA/CARGAR/SEGUIR,
probar controles/sonido y SALIR≤60s de juego → CLOSED. No segundo arranque
en este permiso. Ante ERROR, no repetir/reabrir/borrar; recoger GATE/CODE.
Si queda imagen sobre menús, reinicio normal desde Ajustes y esfera habitual.
Cambios de rutas, flash y C conservan riesgo de bloqueo/corrupción/reinicio;
recuperación integral sigue sin validar. No iniciar con batería baja.
