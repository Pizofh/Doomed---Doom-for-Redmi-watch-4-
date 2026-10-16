# R310: CInfo, una captura de solo lectura del residente

**Solo PC; pendiente de autorización física.** El usuario confirma ERROR30,
sin CLOSED y con retorno a esfera/menús normal. Esta consulta distingue estado
del hilo/JOIN, resultado del motor, balance de allocations y archivos retenidos.
No intenta solucionar el cierre ni arrancar Doom durante el diagnóstico.

| Elemento | Valor |
|---|---|
| Unidad | M2315W1, firmware2.2.86 |
| Paquete | CInfo, ID365219955,20.120bytes,32recursos |
| SHA256 paquete | `7c42c37d9775cc5860615e7c1fcb303a70642d39a47f565a2e87fc6e61c40430` |
| SHA256 Lua | `435e5b720f69be2d4c85d817869e1b05bbf1520f840b556b4a0de2c8c46ebe1a` |
| Artefacto | artifacts/doom-resident-info-r310/package-final/CInfo-id-only.face |
| Journal nuevo | tools/local/pc-rfcomm/doom-resident-info-r310.json |
| Envío |10partes,20.336bytes MASS+512control ≤32.768 |

Solo package-final corresponde a los pins; package-reviewed conserva un
candidato previo descartado. Mantener ambos registros de revisión inmutables.
No ELF/WAD incluidos; no reemplazar, borrar ni activar esferas desde PC.
Conservar DoomRAM957, carrier963 y vínculo actual. Una instalación, sin
retry/resume. Finally restaurar Static/r167+C#Static, reconstruir, test cerrado;
una consulta independiente del catálogo si queda registrada. Otros gates cerrados.

## Alcance exacto

Al abrir no consulta archivos ni inicia timers. Un toque READ C toma UNA
captura: /proc/modules antes/después (≤1025bytes, formato/NUL/identidad
rw4png304), lease propia (≤2049bytes, cabecera/hash/registro comparados), solo
un byte de launcher-shell.txt para clasificar ausencia/vacío/no vacío, y
128bytes exactos+EOF de /dev/rw4doomctl con buffering desactivado. Solo rb.
Todos los handles abiertos tienen intento de cierre aun ante excepción.
El error nativo se muestra como dato, sin descartar los demás campos.
No se muestran direcciones/registro/lease/captura crudos ni credenciales.

No shell, escrituras Lua, STOP/START/JOIN, carga/descarga, cache retirement,
GC nativo ni borrado. Instalar el paquete sí escribe flash. READ solo una vez
por apertura; MODE reutiliza el mismo resultado. No hay marca persistente ni
permiso de repetir el ensayo por reabrir. No inferir que ceros son mediciones
si READ no ocurrió o C READ=0. Dos dígitos arriba son etapa fallida (0=terminó):
1 registro,2 identidad/lease,3 captura,4 open C,5 read/EOF,6 close/identidad,
7 estabilidad registro. Error conserva resultados parciales actualizados.

## Ensayo único propuesto, observado con batería ≥50%

1. Seleccionar **CInfo**, preview TRES barras AMARILLAS. Debe mostrar C INFO,
   seis filas, READ C/MODE, página01, código00 y punto gris. Si falta UI, no pulsar.
2. READ C UNA vez. Anotar código y color del punto. Foto/anotación de las tres
   páginas, MODE una vez por página; no repite consultas:
   -01 REG OWN, LEASE, CAPTURE, C OPEN, C READ, C CLOSE.
   -02 SEQUENCE, STARTED, READY, FINISHED, JOINED, ERROR.
   -03 REASON, CODE, PEAK, ALLOC, FREED, CLEANUP.
3. Volver a esfera habitual y confirmar menús/corona en el mismo reporte.
   No reabrir ni pulsar pruebas C anteriores, reiniciar o cambiar vínculo.

REG OWN 0=vacío,1=nombre propio,2=otro (rechazo). LEASE0=ausente,1=coincide,
2=no coincide. CAPTURE0=ausente,1=vacía,2=no vacía. C OPEN0=ausente,1=abierto;
C READ0=no validado,1=snapshot válido,2=fallo de lectura; C CLOSE0=no abierto,
1=cierre retornó éxito,2=cierre falló. Un cierre fallido no demuestra handle
liberado. Datos reason/code/alloc/freed/cleanup solo definidos por C tras JOINED=1.
CODE es uint32; errores con signo pueden verse como4294967295.

## Evidencia y riesgos

14casos en Lua del emulador S3 con archivos/widgets simulados: unido/no unido,
ausente, foreign, lease distinta, captura vacía/no vacía, read/EOF/close/identity,
registro cambiante y cleanup error. UI sin lectura al abrir, READ de un uso y
MODE sin I/O. No ejecuta callbacks C reales del reloj ni prueba equivalencia S3.
Compilación local sin ADB, readback32recursos/pins/tampering/presupuesto/gate
cerrado pasan, prepare r310 OfflinePrepared. Helper cerradoSHA
`5122d49cbf9c7e640034be416e3035b20f6cf3e3366a3b6f23039a2aa1e7bf70`.

Una lectura de procfs o callbacks C puede bloquear/fallar; no hay aislamiento
nativo ni recuperación integral del firmware validada. No cambia firmware,
particiones o bootloader. No nuevos comandos físicos desde el reporte R309.
La regla inicial de revisión de payload físico exige aprobación de esta
instalación/lectura. No autorización inferida de que los menús respondan.
