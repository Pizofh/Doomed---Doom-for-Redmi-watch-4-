# R188 — pasar de Lua a una ruta nativa específica del RW4

2026-10-12. El usuario pregunta cómo avanzar hacia C tras confirmar Lua/Image.
Se omite una nueva prueba aislada de animación: el próximo ensayo reúne datos
del mecanismo de ejecución. **No se compiló, cargó ni envió C al RW4.**

## Evidencia reconsultada

- Head de [MiWatchNativeApps](https://github.com/m0tral/MiWatchNativeApps/tree/a392529b9e369d046b9c15858d990f358fdf6c29)
  sigue en a392529; árbol no truncado, sin target RW4. Platform selecciona
  S3/MB10Pro y versiones específicas. Su helloS3 usa os.execute y io.open,
  pero también cp/rmmod/insmod: **no se ejecutó ni se adaptó directamente**.
- Head de [MiWatchLuaWatchfaces](https://github.com/m0tral/MiWatchLuaWatchfaces/tree/5af6e14ea92830a394c88dc04f76ceef697a6ded)
  sigue en5af6e14. Nuestros resultados físicos prueban Lua/Image, no shell.
- [Relato original de m0tral](https://habr.com/ru/articles/1079066/), preparación,
  vincula su investigación RW4 con os.execute y comandos de módulos. Es una
  pista de primera mano; el ejemplo nativo presentado es MB10Pro, sin transcript
  RW4/firmware2.2.86. No generalizar su valoración de riesgo.
- [Datasheet del fabricante BES2700iBP](https://www.bestechnic.com/en/Uploads/keditor/file/20241011/20241011133740_73924.pdf),
  páginas2–3, describe dual STAR-MC1 y SRAM compartida2.2MB. No describe ABI,
  FPU/configuración/exports de nuestra build Xiaomi. No identificarlo como
  Cortex-A7 del emulador o adoptar sin más los flags S3/MB10Pro.
- Las búsquedas públicas exactas no aportaron firmware2.2.86 verificable o un
  contrato ELF RW4. Es un resultado limitado de búsqueda, no imposibilidad.
  No se descargó firmware ni se usaron blogs/mirrors como prueba de compatibilidad.

Tres fuentes nativas leídas con ref fija, Gitblob SHA1:

| Archivo MiWatchNativeApps | Blob |
|---|---|
| WatchS3/wf_native_hello/app/lua/main.lua | a4b92c6ea0f80543f85a18cc9ab8b0308403d766 |
| platform/README.md | 3d5a0c392da742dc1f5d1cf873215b5758fb26b8 |
| platform/watchs3/fw_2.6.0/miwear_system.h | fb9576e47b3afd5feb4c96d1da703d3fa555db6a |

El header contiene direcciones absolutas para esa build S3; no usarlas en RW4.
La existencia de insmod no resuelve símbolos, ISA, init/unload o privilegios.

## NativeInfo, diagnóstico propio único

`experiments/lua-native-info/main.lua` usa el Image físico ya demostrado para
mostrar una leyenda PNG propia y once indicadores. No depende de Label/Font.

| Fila | Qué mide | Límite |
|---|---|---|
| OS FUNC / IO FUNC / LOAD FUNC | tipo function de os.execute/io.open/package.loadlib | Amarillo = expuesto; puede ser stub. Nunca llama loadlib |
| SHELL | help capturado contiene tokens help/uname | Verde = salida reconocida, no acceso C arbitrario |
| INSMOD / RMMOD / LSMOD / IWASM | tokens exactos en help reconocido | Solo catálogo; no ejecuta esos comandos |
| NUTTX / ARM NAME | tokens NuttX/arm en uname -a | No identifica ISA/ABI/FPU, modo de memoria o core exacto |
| CLEANUP | devolución de os.remove del archivo propio | Eliminación devuelta como éxito, no readback físico adicional |

Verde=yes; rojo=no; gris=desconocido/no consultado; amarillo=función expuesta.
No interpretar ausencia de token como ausencia absoluta del mecanismo. Un
listado parcial/no reconocido deja filas desconocidas; no ejecutar un loader
para comprobarlo. Un helper existente tampoco establece aislamiento.

Dos invocaciones máximas: `help > <SCRIPT_PATH>native-info-capture.txt`, después
`uname -a > <misma ruta>`. **Los comandos consultan; la redirección escribe un
archivo propio**, lo lee y lo borra. No se llama read-only a toda la operación.
Directorio absoluto validado, sin espacios/metacaracteres/traversal, con segmento
del nuevo ID365219994. Nunca sobreescribe una captura que pueda abrir previamente.
No rutas del sistema, config, particiones, binarios o drivers propios.

Lee como máximo8193bytes y exige1…8192; cierra y retira la captura antes de
seguir. Sin raw output en nuestros prints; logs stock pueden registrar actividad
y quedan privados. Archivo de leyenda1441bytes,180×242, fuente pixel propia
generada desde código. Preview=dos barras blancas, diferente de runtime.
Objetos propios no capturan toques; no timers/input handlers/hook de ancestros.

**La ejecución síncrona del shell no tiene timeout duro desde Lua.** pcall
captura errores retornados, no un cuelgue de C. El supervisor Bluetooth limita
transferencia, no ejecución posterior del script. Esta limitación requiere
observación humana y revisión del [plan R189](native-info-physical-plan-r189.md).

## Paquete fijo y prueba PC

ID365219994, NativeInfo,12708bytes,SHA256
`e0fe5fb93311460eb784d44b449613ec0defc20841e061096811b4b42eea9c4d`.
Fuente SHA256 `764d532c6810a51999434c1f7847ec075e5d85c273792ab9b5777a91c7a2f4a7`.
Leyenda SHA256 `b8991bea47c296a6f602bff28aa3552e343d045aca675dec48d49db9575d70b0`.
Mismo perfil365/Shape34/byte5=0, compiler revisado sin ADB adyacente;
fuente/PNG exactos embebidos y extraídos del guest. No ELF en el paquete.

MiWatchEmulator v1.0/S3,390×450, no réplicaM2315W1. Primera instalación en
directorio propio nuevo, guardQEMU/ADB5039 y snapshotdata pausada; resetguest.
Resultado: tres funciones expuestas amarillas; ocho filas siguientes verdes.
Leyenda/indicadores visibles; panel abre/cierra sin cambiar captura. Retorno
aStorage365700764, cierreLua porlog, IDs anteriores conservados y captura propia
ausente por ls. No módulo propio cargado, Bluetooth/USB o operación física.

```powershell
# Build/install ya realizados; rechazan sobrescritura de trabajo existente.
node tools/package-lua-minimal.mjs native-info
node tools/install-lua-minimal-emulator.mjs native-info
# Seleccionar NativeInfo por UI, observar, volver aStorage:
node tools/check-native-info-emulator.mjs
node tools/pc-static-watchface.mjs prepare r188
```

Artefactos ignorados bajo artifacts/lua-native-info-r188 y artifacts/emulator.
Pruebas adecuadas al delta:12checks y28escenarios del perfil nuevo;28escenarios
del perfilImage anterior, recibos cruzados y seis gates cerrados. No repetir
todo el port Doom para un nuevo perfil de diagnóstico.

## Decisión y siguiente gate

Primero probar este inventario específico en2.2.86, si se aprueba. Si hay shell
y loader anunciados, **no cargar un módulo todavía**: obtener contrato de
ISA/ABI/formato/exports/init/unload y modeloFLAT/PROTECTED/KERNEL de esa build
por fuentes/firmware de origen verificable. Preferir interfaz aislada si existe.
Solo entonces helloC mínimo compatible, sin display/hooks/persistencia, con
plan físico independiente. Insmod puede ser privilegiado; RAM-only no es sandbox.
Si no hay shell, evaluar otra API/QuickApp/WASM sin declarar imposible el stock.

El checkpoint de animación separado propuesto enR187 queda sustituido por este
inventario por indicación del usuario. Doom y su renderer siguen en C.
