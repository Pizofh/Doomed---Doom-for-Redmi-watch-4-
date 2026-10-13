# R183 — investigación de texto/fuentes, sin nuevo envío físico

2026-10-12. «Adelante» del usuario a investigación y pruebas PC. No se conectó
al reloj/teléfono ni se instaló,seleccionó o borró otra esfera física. Gates
siguen cerrados. Las observaciones R182 —formas sí,texto no,funciones normales—
se conservan; no se pidieron nuevas pruebas o fotos al usuario.

## Pista específica de RW4

La muestra [AnalogTimeAnimated/RW4](https://github.com/m0tral/MiWatchLuaWatchfaces/blob/5af6e14ea92830a394c88dc04f76ceef697a6ded/RedmiWatch4/AnalogTimeAnimated/app/lua/main.lua)
del commit5af6e14 usa `lvgl.BUILTIN_FONT.MONTSERRAT_14` para su labelMode,
una altura explícita60 y color string#eeeeee. No solicita MiSans por nombre.
TouchEvents del mismo commit usa en cambio Font misansw regular32.
Son muestras comunitarias etiquetadas RW4,no logs/pruebas de nuestra unidad
ni evidencia de los mismos símbolos/configuración en firmware2.2.86.
No ejecutamos esos scripts: AnalogTimeAnimated además usa dataman/eventos.

Se revisó también Diffusion/RW4: en su fuente consultada no hay llamadas
Label o Font. Su dibujo no demuestra la disponibilidad de texto. No copiar
sus assets/código al repo público ni usarlo para instalar otro juego.

## Contrato upstream revisado

[LuaVGL font.c](https://github.com/XuNeo/luavgl/blob/62868a05b0b3e79b91f49ce9c3661750ffe55d02/src/font.c)
primero busca fuentes builtin habilitadas al compilar; para otras familias
consulta un callback make_font del contexto. Si nada resuelve,emite error
cannot create font. Ese archivo y su API de extensión son código upstream
relacionado, **no fuente exacta validada de RW4 ni de la imagen guest**.

[constants.c](https://github.com/XuNeo/luavgl/blob/62868a05b0b3e79b91f49ce9c3661750ffe55d02/src/constants.c)
publica MONTSERRAT_14 como lightuserdata del font nativo,condicionado por
LV_FONT_MONTSERRAT_14. Por tanto,no basta encontrar el nombre en upstream
para asumir que una build particular lo exporta. Lua type informa userdata
sin distinguir lightuserdata; no se imprimieron direcciones del font.

[style.c](https://github.com/XuNeo/luavgl/blob/62868a05b0b3e79b91f49ce9c3661750ffe55d02/src/style.c)
declara text_font,text_opa y text_color. El convertidor de color en util.c
admite tanto número RGB como string#RGB/#RRGGBB. Usar un número no es error
en este upstream; eso no descarta diferencias del binding físico.

[widgets/label.c](https://github.com/XuNeo/luavgl/blob/62868a05b0b3e79b91f49ce9c3661750ffe55d02/src/widgets/label.c)
crea la label mediante helper común. El constructor aplica tabla de
propiedades; render depende además de font,estilos y geometría. El retorno
de constructor no es evidencia de glyphs visibles. No se llamó a getters,
padres u objetos del sistema para investigar el reloj.

## Prueba acotada del CLI en S3 emulado

Fuente propia `experiments/lua-font-research/inspect.lua`; ejecutor fijo
`tools/inspect-fonts-emulator.mjs`. Guard de propiedad QEMU/puertos,ADB5039,
emulator-5554, sin USB/Bluetooth. Una invocación CLI finita,timeout15s.
Require lvgl/Font pueden inicializar bindings o reservar objetos,por lo que
esta prueba no es una lectura pura. No widgets/timers/archivos guest/shell
desde Lua; no UI global o llamadas a direcciones. No scripts upstream ejecutados.

| Caso | Resultado observado |
|---|---|
| Lua CLI | Lua5.4,Font expuesto como función |
| BUILTIN_FONT.MONTSERRAT_12/14/16 | Cada constante typeuserdata |
| Font montserrat14 | Creado,typeuserdata |
| Font misansw regular24 | Error cannot-create-font capturado |
| Font misansw regular32 | Mismo error capturado |

En R177,misansw regular24 **sí** renderizó en contexto de watchface del mismo
guestS3. La diferencia de contexto debe conservarse: un fallo CLI no demuestra
ausencia de la fuente en watchfaces. No afirmamos que el callback sea la causa
medida: resolución de fuente/configuración/callback exactos no se inspeccionaron
en el binario. La prueba no midió ni dibujó texto de la constante builtin.
Captura posterior muestra Storage stock normal. No reset/modificación de
paquetes en el guest,ni intervención física para esta comparación.

## Evidencia reproducible

Diez archivos de fuentes/licencia fueron obtenidos como datos mediante el
conector GitHub,con refs fijas. Sus bytes coinciden con el GitblobSHA1 del árbol
upstream y se guardó también SHA256. No son un checkout completo ni firmware.
LuaVGL tiene licenciaMIT conservada en caché; licencia de muestras m0tral no
identificada: no se publican esos scripts/assets. Solo metadata en
[lua-font-sources-r183.json](lua-font-sources-r183.json).

```powershell
node tools/verify-font-research.mjs
# Primer ensayo CLI: rechaza sobrescribir registros de evidencia existentes.
node tools/inspect-fonts-emulator.mjs
```

Caché ignorada: artifacts/research/lua-fonts-r183,con fuentes,manifest original,
cli-result.json y cli-summary.json. El verifier solo calcula hashes; no ejecuta
fuentes ni ADB. No repetir el CLI por rutina después del resultado registrado.
El render de una constante en emulador y,sobre todo,en2.2.86 siguen sin probar.

## Decisión y siguiente checkpoint

MONTSERRAT_14 es una alternativa basada en una muestra RW4 para un diagnóstico
de texto futuro,con fuente/estilo/altura controlados. Aún no confirma la causa
del fondo azul o texto ausente. No se preparó ni autorizó otro paquete físico.

[ADR0004](adr/0004-lvgl-labels-are-not-a-doom-rendering-gate.md): no bloquear el
camino a Doom por texto LVGL. Doom usa sus buffers/renderer/assets propios.
**Siguiente checkpoint:** preparar en PC una prueba Image mínima sin labels,
basada en el wrapper RW4,para validar el camino de píxeles antes de proponer
hardware. No modifica gameplay ni demuestra el loaderC/ABI/privilegios físicos.
