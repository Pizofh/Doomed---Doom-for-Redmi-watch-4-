# R207–R209 — loadlib deshabilitada y ruta de logging stock

2026-10-13, exclusivamente PC. Imagen y objdump fijados por los mismos hashes
de [R206](rw4-exports-r206.md). Sin teléfono, radio, consultas al reloj o cargas
nativas. Reportes/disassembly privados fuera de Git; no firmware redistribuido.

## loadlib

La entrada de paquete en offset `0xb0408` referencia el nombre loadlib y la
función Thumb cuyo código está en `0x2fdf10`. Se inspeccionó el cuerpo completo
hasta `0x2fdfb0`, donde empieza su literal pool. No se concluyó solo por encontrar
un mensaje suelto: el flujo de esa función usa el mensaje de bibliotecas
dinámicas deshabilitadas y devuelve la categoría absent cuando falta un handle
cacheado. Con handle cacheado y símbolo distinto de *, devuelve error init;
el caso especial * solo devuelve true, sin resolver ni llamar código externo.

Esto coincide con el fallback sin backend dinámico de
[Lua5.4.0 loadlib.c](https://github.com/lua/lua/blob/v5.4.0/loadlib.c), blob SHA
`c0ec9a131b507d3a65a0558684450d2080c1c1e5`. Se leyeron fallback,
lookforfunc y ll_loadlib; son referencias upstream, no fuente exacta Xiaomi.
**Evidencia estática fuerte de loadlib deshabilitada en esta imagen**, no una
nueva invocación física ni prueba de todas las versiones de RW4. NativeInfo
solo confirmó que la función está expuesta. No merece otro ensayo físico
solo para repetir este diagnóstico; insmod sigue siendo la vía ya demostrada.

## Cómo se encontró print

La búsqueda anterior de nombres rechazaba coincidencias precedidas por texto
imprimible. Eso pierde cadenas cuyo sufijo comparte el compilador con otra
cadena. R208 admite sufijos y verifica sus referencias/estructura antes de
identificarlos: encontró print en offset `0xb1474`, referencia de registro Lua
`0xb0ff4`, función en `0x303590`. Los registros próximos assert/collectgarbage/
tostring refuerzan la identificación como biblioteca base Lua.
No convertir ausencia de string aislada en ausencia de función/export.

El flujo coincide con luaB_print: obtener número de argumentos, convertir
cada uno a string, insertar tabuladores, escribir datos, newline y flush.
Referencias [lbaselib.c](https://github.com/lua/lua/blob/v5.4.0/lbaselib.c)
SHA `747fd45a2fe5092ee23fd732cb35d96b6a35894b` y
[lauxlib.h](https://github.com/lua/lua/blob/v5.4.0/lauxlib.h)
SHA `59fef6af132b9feb4cb43cc87667a7da0a879e96` muestran fwrite/fflush de stdout.

## Tres contratos candidatos

R209 verificó las tres instrucciones BL del caller antes de desensamblar
callees. Estos offsets son datos de investigación, no autorización para
ejecutar una llamada en hardware.

| Offset archivo | Contrato inferido | Evidencia del caller y callee |
|---|---|---|
| 0x1bcba4 | void *stream_base(void) | Sin argumentos consumidos; TCB actual→group→base+92; assert si falta group |
| 0x1ec4e4 | size_t fwrite(const void*,size_t,size_t,opaque_FILE*) | Caller pasa pointer/1/length/stream; callee multiplica tamaños, escribe, divide bytes por itemsize |
| 0x1ec608 | int fflush(opaque_FILE*) | Caller pasa mismo stream; callee usa flush individual si no NULL, all si NULL, devuelve0/-1 |

El caller calcula stdout como base+128. No se inventó el layout de FILE ni se
extrapoló el tamaño de la estructura desde otro firmware. La ventana R209
write-stream empieza antes de un literal pool: la instrucción de entrada del
writer se verifica por bytes/flujo, evitando interpretar el pool como código.
Su primer halfword corresponde a mover r2 a ip antes de reorganizar argumentos.

Contraste de implementación: NuttX10.3.0
[stdio.h](https://github.com/apache/nuttx/blob/nuttx-10.3.0/include/stdio.h),
[sched_getstreams.c](https://github.com/apache/nuttx/blob/nuttx-10.3.0/sched/sched/sched_getstreams.c),
[lib_fwrite.c](https://github.com/apache/nuttx/blob/nuttx-10.3.0/libs/libc/stdio/lib_fwrite.c),
[lib_fflush.c](https://github.com/apache/nuttx/blob/nuttx-10.3.0/libs/libc/stdio/lib_fflush.c).
Los blobs respectivos son `6379072ba97ac4b51d3fb88ec44965859934c19c`,
`481149dd5d1c1fb9bc02691e7c5ea111ec223b2e`,
`6780b2a82261e3bdd22c88dcb77227e6e943ef15`,
`da9c91fa410066433f893be59d2a7c69145baded`.
Se eligió esta referencia tras observar que stdio12.3 usa otra selección de
streams. **No identifica la versión exacta de NuttX Xiaomi** ni valida todos
sus headers/configs. La evidencia de offsets/argumentos procede de la imagen.

## Reproducción y alcance

```powershell
node tools/research-rw4-lua-bridge-r207.mjs
node tools/research-rw4-lua-logging-r208.mjs
node tools/research-rw4-stdio-r209.mjs
```

Los tres verifican SHA/inputs; R208 verifica registro loadlib, R209 verifica
caller BL. Reportes privados ya existen bajo artifacts/research/rw4-lua-bridge-r207,
rw4-lua-logging-r208 y rw4-stdio-r209; no sobrescribir/repetir sin necesidad.
No son pruebas dinámicas de Lua o de APIs RW4.

No apareció un SDK o tabla importable. Se identificó una alternativa candidata
de bindings específicos de versión, siguiendo llamadas reales stock en vez de
usar nombres de tablas sin clasificar. Véase [candidato C solo PC](rw4-log-candidate-r210.md).
Compatibilidad de direcciones en hardware, permisos de lectura/ejecución y
stdout del contexto insmod siguen pendientes. FLAT/PROTECTED/KERNEL sin resolver;
no elevar privilegios o llamar sandbox a este módulo.
