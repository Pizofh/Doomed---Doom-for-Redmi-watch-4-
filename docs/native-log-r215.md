# R211–R215 — carrier de mensaje C preparado, solo PC/emulador

2026-10-13. NativeLog está empaquetada para una revisión física posterior;
no enviada ni activada en RW4. No Doom ni firmware nuevo. FirstC2 conserva
su paquete y marca; no se reabrió o rearmó desde nuestras herramientas.

## Hallazgo que cambió la salida

Antes de desplegar, se contrastó NSH10.3: redirección foreground cambia la
vtable de consola; no aparece dup2 de stdout en ese tramo.
[nsh_parse.c](https://github.com/apache/nuttx-apps/blob/nuttx-10.3.0/nshlib/nsh_parse.c)
blob `c15115eb28f9779bb846519812466170f2c42a84`,
[nsh_console.c](https://github.com/apache/nuttx-apps/blob/nuttx-10.3.0/nshlib/nsh_console.c)
`3ee7241a503210714c312350a4aa9a46321f6105`,
[nsh_system.c](https://github.com/apache/nuttx-apps/blob/nuttx-10.3.0/nshlib/nsh_system.c)
`48042683da2271cc242b2ebe56d3a32044bf8073` son referencias, no fuente Xiaomi exacta.

Se ejecutó **el hello S3 anterior ya revisado**, no el candidato RW4, desde
Lua os.execute con insmod redirigido a un archivo tmpfs nuevo. Resultado R211:
archivo0bytes; mensaje en salida del caller. Registro y retirada confirmados,
inventario real idéntico al anterior, todos los archivos/directorio propios
retirados. Imagen S3 SHA849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa;
hello1020bytes SHA125cc7167fb0ae27c6c598504e0604c679e838ea5c8eb781e8c56b4f34559008.
Reporte privado artifacts/emulator/stdout-redirect-r211/summary.json.

**Refutado en ese emulador:** asumir que redirigir NSH captura automáticamente
stdout C. RW4 no ensayado para esa propiedad. Se descartó el diseño de captura
stdout para nuestro carrier; el C R210 queda como candidato histórico, no se
envía. Este test evitó un intento físico basado en una suposición de captura.

## Contrato de archivos candidato R212–R214

Se siguió registro Lua IO→io_open, io_fclose y lectura de archivos en la misma
imagen RW4 fijada por SHA en R193/R206. [liolib.c Lua5.4.0](https://github.com/lua/lua/blob/v5.4.0/liolib.c),
blob7ac3444393ddbf52becffb7644c6eebfad190e97, apoya firmas/flujo.

| Callee offset de archivo | Firma inferida | Caller/evidencia |
|---|---|---|
| 0x1ebf0c | opaque FILE *fopen(const char*,const char*) | io_open0x2fc444, BL0x2fc4c0 con filename/mode; callee parser/open/creación stream |
| 0x1ebff4 | int fclose(opaque FILE*) | callback io_fclose0x2fc120, BL0x2fc130 y prueba res==0 |
| 0x1ec130 | size_t fread(void*,size_t,size_t,opaque FILE*) | Lua lectura BL0x2fc172, wrapper multiplica/divide items |
| 0x1ec4e4 | size_t fwrite(const void*,size_t,size_t,opaque FILE*) | R209 y cuerpo multiplicación/escritura/división |
| 0x1ec608 | int fflush(opaque FILE*) | R209 y rama flush de stream individual |

R214 verifica cinco callers antes del build. Mode parser0x1eba44 reconoce x y
su rama suma flag8, consistente con O_EXCL de
[fcntl.h NuttX10.3](https://github.com/apache/nuttx/blob/nuttx-10.3.0/include/fcntl.h),
blob9cef7ed9e04a3fce64a275b82b8a5496200a627d. Se pide wbx, sin fallback a wb.
Esto no prueba atomicidad física/FS ni identifica la versión de NuttX Xiaomi.
Offsets/firmas son inferencias de la imagen; no llamadas físicas ya validadas.

C propio [file-r214.c](../experiments/hello-native-rw4/file-r214.c):

- Cinco fingerprints FNV-1a32 sobre64bytes de código cada uno antes de llamar APIs.
- Lee exactamente19bytes de marca Lua propia y exige contenido/cierre correctos.
- Crea exclusivamente native-stdout-r211.txt en su carpeta fija con wbx.
  El nombre conserva el prefijo histórico: **es escritura directa de archivo,
  no captura por redirección de stdout**.
- Escribe16bytes `RW4_C_FILE_R214` más newline, hace flush y close; devuelve0
  únicamente con escritura completa/flush0/close0. Fallos devuelven negativo.
- Sin tareas/callbacks propios o accesos a boot/particiones. FILE es opaco;
  APIs pueden asignar memoria, bloquear o fallar; no afirmar ausencia de fugas.

Ruta fija `/data/app/watchface/market/365219999/lua/`. El adapter exige ese
SCRIPT_PATH normalizado antes de habilitar ejecución; si otro layout aparece,
END rojo y no C. Marcador previo conserva bloqueo de repetición. Fingerprints
no autentican firmware ni contienen un fault/ABI incorrecto; leer code memory
puede fallar antes del rechazo. Privilegios siguen desconocidos/amplios.

Build solo PC: ARM32LE ET_REL, entry1/text al comienzo,465bytes de sección
ejecutable incluyendo datos, alineación8, sin estado writable propio/FPU;
7relocs ABS32 internas, cero imports por nombre pero5bindings absolutos.
Archivo1500bytes SHA256 `9dff873fd6d41669de0d336528a35c7c281fa1e03ee1eb5ebcddd6d6907ca652`.
Fuente SHA `3f240e2486d776c0bf56be53542213ff33924e767b0a3617c099c36ec92d186d`.
Stack propio48bytes en disassembly, stack de APIs/RAM física no medidos.
Build/review privados en build/hello-native-rw4/r214. No ejecutado en S3/RW4.

## Orquestación y pruebas

Controller/adapter/main R211 son factories estáticas, sin load/loadlib/dofile.
UI reutiliza geometría/eventos de R199/R200, cambia solo condición del tercer
indicador y bitmap de etiquetas: FILE/MARK/C TEXT/UNLOAD/END, botón RUN C.
Preview cinco barras cian. No validación visual nueva de este paquete completo.

Primero ELF exacto, captures ausentes, inventario reconocido sin propios/
rw4minr197/rw4minr202 y marca con write/flush/close/readback. Insmod una vez;
leer mensaje exacto≤256bytes y retirar el archivo propio. Solo después de
retorno síncrono normal e inventario propio confirmado se intenta rmmod.
Un fallo de captura no omite esa retirada; dispatch/inventario incierto no
autoriza unload ciego. Complete necesita mensaje, carga, retiro y limpieza.
Rechazo init con módulo ausente termina sin rmmod. No retries ni borrar marca.

31escenarios pasaron en Lua5.4 S3 con **I/O tmpfs real traducido a fixture propia,
executor/widgets simulados**. C RW4 solo datos. Incluyen mensaje incorrecto/
extra/oversize/faltante, init rechazo, despacho incierto, limpieza fallida,
inventarios inciertos y módulos previos, archivo previo preservado, bytecode
distinto, marker denegada, ruta ajena, segundo click/reapertura bloqueados y
UI visible ante backend ausente. C TEXT rojo con UNLOAD verde ante mensaje malo.
Report artifacts/emulator/log-r211/summary.json; inventario real sin cambios,
árbol tmpfs retirado. Primer harness pasó el segundo retorno de gsub como flag
absent_os; corregido con paréntesis, reporte preservado log-r211-failed-harness.
No cambio de producción por ese fallo. Package check inicial comparó UI nueva
con hash visual antiguo: se corrigió a baseUI ya validada; no había artefacto
parcial ni nuevo ensayo físico.

## Paquete fijo y entrada cerrada

NativeLog ID365219999,28.348bytes, artifacts/native-log-r215/NativeLog-id-only.face,
SHA256 `1e88ce20dcbb28f6680be89f1625c22682890fb8efc8f2a605b0d34bde6579eb`.
Lua18.156bytes SHA `df5c6cc3171d3441839d3dd9bd00e4aae98aaa24876be380f12e0627b9a28477`.
Compiler EasyFace fijado sinADB; cuatro records Lua/ELF/legend/run completos
comparados byte a byte. Nuevo perfil r215, journal propio native-log-r216.json
todavía ausente; prepare14partes, dentro de budget32768bytes. Helpers/gates cerrados.
Helper actual SHA `b8d7a688d0d3a6765a21ad3dadac34cda2a46a877ad0c1853fc583aa068ebc85`.
Transfer12 y sesión31 escenarios offline para r215 pasan; entradas install/remove
rechazan y helper no abre sockets. No files transferred/reloj consultado.

```powershell
node tools/build-rw4-file-r214.mjs verify-inputs
node tools/test-rw4-log-r211.mjs
node tools/package-native-log-r215.mjs
node tools/pc-rfcomm.mjs build
node tools/pc-static-watchface.mjs prepare r215
node tools/test-static-watchface-transfer.mjs r215
node tools/test-static-watchface-session.mjs r215
node tools/test-static-watchface-gates.mjs
```

Build/test/package rechazan sobrescribir outputs existentes; no repetir para
retomar desde reportes. Las líneas son reproducción en entorno limpio con
dependencias locales ya verificadas, no instalación física.
Siguiente gate: [revisar ensayo único R216](native-log-physical-plan-r216.md).
