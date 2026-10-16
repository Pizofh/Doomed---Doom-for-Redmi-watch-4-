# R321: DoomFault conserva el error inicial y distingue la limpieza

**Preparado en PC; sin autorización física ni envío.** Es una revisión de
diagnóstico Lua, no una corrección del render PNG. No se cambia el C instalado.

## Artefacto concreto

| Elemento | Valor |
|---|---|
| Destino | Redmi Watch4 M2315W1, firmware2.2.86 |
| Esfera | DoomFault, ID365219952; cinco barras naranjas |
| Paquete |35060 bytes,32recursos, solo Lua/imágenes propias |
| Archivo local |`build/doom-fault-r321/package/DoomFault-id-only.face` |
| SHA256 paquete |`836cb01accfaf7a403c9629757ea8d5620586c140cd0cf8af4ae52d679718106` |
| SHA256 Lua |`079e682cff9d4b6121b468df0790b7a89dc7464b5410e25abfeb847d312d01f2` |
| ELF existente |`/data/app/watchface/market/365219953/lua/doom.elf`,605180bytes |
| SHA256 ELF |`8de1b31c8fe82c4fe3b52eb780e424cbdeca674c539557b58f20941093dc384f` |
| WAD existente |DoomLauncher365219963,4196020bytes,CRC371943786 |
| Nombre de módulo para este ensayo |rw4png321; mismo ejecutable, sin otro C |
| Nuevo journal privado |`tools/local/pc-rfcomm/doom-deployment/fault-r321.jsonl` |

Conservar **DoomIO365219953 y DoomLauncher365219963**. No reabrir DoomIO ni
otras pruebas C. El paquete no incluye ELF/WAD, no reemplaza esferas ni toca
las auxiliares antiguas: su lease/captura tienen base propia365219952.
El instalador exige ambos carriers, ID nuevo ausente, modelo/firmware esperados,
mantiene catálogo/selección actuales y no presupone una cantidad histórica.

## Cambio de diagnóstico

Se mantiene la salida de R318: STOP antes de release y un único intento de
limpieza; ante fallo queda ERROR sin reintentos de Timer/GC. El recorder solo
conserva números en memoria Lua: sin error strings, direcciones, archivos de
diagnóstico, shell adicional, nuevos bindings o cambios de comandos nativos.
Los archivos propios de lease/captura del launcher siguen existiendo.

Al ERROR aparecen **FIRST**, **LAST** y **DIMS**:

- FIRST y LAST: ocho dígitos, en grupos `etapa operación errno comando` (dos
  dígitos por grupo). FIRST queda inmutable aunque falle después la limpieza.
- DIMS: cuatro dígitos de anchura y cuatro de altura;9999 significa valor no
  disponible/inválido, no una dimensión de la imagen.
- Operaciones:00validación sin IO control;01abrir control;02leer control;
  03escribir control;04cerrarlo;05setvbuf;06crear Image;07consultar tamaño;
  08validar dimensiones;09borrar Image. No hay mensaje crudo del sistema.
- Etapas principales conservadas:25presentación,30release,31JOIN,35rmmod,
  40registro al abrir. Ejemplo **FIRST25060000 / LAST30031607** distingue fallo
  al crear Image de posterior escritura release7 ocupada. LAST30011607 sería
  apertura del control, y LAST30041607 cierre. Un errno00 puede acompañar una
  excepción sin errno numérico; no prueba éxito.

Estos códigos identifican fallos vistos por Lua. No observan fd internos ni
demuestran por sí solos qué rama propietaria causó un fallo de lectura.

## Ensayo agrupado solicitado

1. Batería>=50%, usuario junto al reloj, esfera habitual/menús normales. Un
   **reinicio normal stock desde Ajustes → Sistema → Reiniciar**, no reset de
   fábrica/desvincular/actualizar. Se necesita porque rw4png318 no completó
   JOIN/descarga tras3016. No intentar rmmod forzado ni retirar referencias.
   Confirmar retorno normal. Ante problema de arranque, parar.
2. Un único envío inactivo de35060bytes:18partes con100ms entre ellas,
   verificación del catálogo y cierre. Sin reintento/reanudación, activación o
   borrado automático. Si falta cupo, un carrier, hay corte/rechazo: parar.
3. Seleccionar **DoomFault** una sola vez. Si aparece READY, pulsar START una
   vez. Mantener CHECKING despierto con toques breves en zona vacía. Si abre
   con ERROR, no pulsar START. Si llega al juego completo, EXIT en unos5s.
4. En ERROR anotar/fotografiar FIRST, LAST y DIMS, sin volver a pulsar START,
   EXIT ni reabrir. Si no hay ERROR, informar estado final (CLOSED si completa
   limpieza). Volver desde Ajustes a la esfera habitual y comprobar menús y
   corona. **No segundo ciclo**, nuevo envío o reinicio adicional.

La autorización solicitada agrupa reinicio normal observado, instalación y
un START manual condicionado a READY. No autoriza retirar C atascado, borrar
carriers, repetir pruebas, cargar código distinto, sonido o guardado de partidas.

## Validación suficiente

48casos Lua S3:36anteriores y12nuevos; IO/nativo/widgets simulados. Casos nuevos
conservan primera excepción de Image y dimensiones incorrectas frente a fallos
open/write/close de limpieza, distinguen lectura fallida, no reintentan y prueban
UI compuesta real con constructor/get_img_size/dimensiones fallidos. Snapshots
no alterables por el consumidor y valores desconocidos acotados. No C físico,
decoder RW4 o estado del módulo residente observados en estos casos.

32recursos exactos y hashes; ocho escenarios del protocolo simulado incluyen
ausencia independiente de ambos carriers, rechazo/corte/clave/catálogo y gates
cerrados antes de privado/radio. ELF/WAD no incluidos y journals anteriores
preservados. Preparación offline pasa. Fuentes/paquete R318 sin editar.

## Riesgo y controles de ejecución

El diagnóstico **vuelve a cargar el mismo motor C** después del reinicio; no
es una mera lectura del error anterior. Sigue expuesto a bloqueo/panic/OOM o
corrupción de firmware/filesystem sin aislamiento demostrado. El recorder y
sus widgets también pueden fallar. El reinicio puede perder estado volátil y
no garantiza resolver corrupción. No hay recuperación integral validada;
límites de tiempo cooperativos, sin watchdog duro. Si responde, volver a la
esfera habitual y conservar el estado; sin acciones forzadas.

CLI preparada: `node tools/pc-doom-fault-r321.mjs prepare` (sin radio).
Install está bloqueado por PHYSICAL_DEPLOYMENT_REVIEWED=false y
PHYSICAL_FAULT_R321_REVIEWED=false; worker LargePhysicalReviewed=false.
Tras aprobar y confirmar reinicio normal se habilitarán solo esos controles
para un `install`, restaurándolos y recompilando/probando cerrado en finally.
No abrir gates R318/static/retry/resume. No publicar MAC, claves o logs crudos.
Solo commit local; sin push/CI remota.
