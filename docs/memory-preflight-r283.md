# R283: preflight de memoria preparado en PC

Estado: **paquete listo, no instalado en el reloj**. Última prueba física sigue
siendo R270. No conexiones Bluetooth en R283.

MemInfo lee `/proc/meminfo` una vez al pulsar READ RAM. MODE recorre los pools
de esa misma lectura; no vuelve a consultar el sistema. No usa shell, C,
módulos, timers, drivers propios ni escrituras desde Lua. La instalación sí
escribiría su paquete/catálogo en almacenamiento persistente.

El `free` de [OpenVela nsh_mmcmds.c](https://github.com/open-vela/nuttx-apps/blob/dev/nshlib/nsh_mmcmds.c)
consulta esa ruta cuando la configuración correspondiente está habilitada.
Esto justifica probarla, pero **no demuestra que exista en FW2.2.86 del RW4**.
La [documentación NSH de NuttX 10.3](https://nuttx.apache.org/docs/10.3.0/applications/nsh/commands.html)
también documenta una variante de tabla con `largest`. El parser acepta ambas
cabeceras explícitamente; muestra MAXFREE o LARGEST según los datos recibidos.
No da por demostrada la configuración exacta ni el significado de pools
propietarios del firmware físico.

## Evidencia y límites

- 45 casos pasan en el intérprete Lua del emulador: contabilidad, límites,
  formatos, overflow, NUL terminal, errores de lectura/cierre y UI de snapshot.
- Lectura real de procfs S3 pasa, sin cambiar el inventario de módulos. En esa
  lectura: GImageCache total10485756/free9354376/max9227632 bytes;
  Umem total129704956/free111117236/max110616512 bytes. Son valores del VM S3,
  variables con el tiempo, **no medidas ni especificaciones del RW4**.
- Widgets de los 45 casos simulados; layout compuesto de PNG originales
  inspeccionado visualmente. No se afirma selección/render LVGL real de esta
  esfera en R283. Los PNG se verificaron byte por byte dentro del paquete.
- Lector máximo4096 bytes, comprobación EOF, cierre intentado incluso ante
  error. Acepta solo ASCII/tab/CR/LF y padding NUL terminal; rechaza formato
  desconocido. Hasta ocho pools, sin sumarlos. Valores en octetos/bytes.
- Verde significa «lectura/formato aceptados», **no «Doom cabe»**. La propia UI
  consume memoria. Una fotografía del heap no prueba qué heap usará malloc,
  disponibilidad contigua durante la carga, estabilidad o ABI del Doom RW4.
- Sin timeout duro sobre procfs desde Lua. Si falta la ruta/formato, se
  informa un error; no hay fallback al shell ni reintento automático.

## Reproducción

Con el emulador propio ya arrancado y revisado:

```powershell
node tools/test-memory-preflight.mjs
node tools/package-memory-preflight.mjs
node tools/preview-memory-preflight.mjs
node tools/pc-rfcomm.mjs build
node tools/pc-static-watchface.mjs prepare r283
node tools/test-static-watchface-gates.mjs
node tools/test-doom-large-upload.mjs --launcher
```

El empaquetador no sobrescribe un review existente. `tests.json`, `review.json`,
la esfera y el preview quedan ignorados en `artifacts/memory-preflight-r283/`.
CI ejecuta `lua5.4 experiments/memory-preflight/tests.lua` sin emulador, procfs
real, firmware, WAD ni secretos. El test local sí añade una lectura real S3.

ID365219962, **21216 bytes**, SHA256
`c497120e409fa0d7412583d1f381033d6eab9476bc21d5205e8ac42aa5d3985b`.
50 recursos, source SHA256
`28f5c98dd1e7a07a4aa0b49d1f1c1bb0768b62b25aed6a1e80c8d18c087679a0`.
11 partes con chunk2048; límites del instalador pequeño conservados.
[Plan físico pendiente de aprobación](memory-preflight-physical-plan-r283.md).

## Instalador: avance y pendiente

Se corrigió el verificador del instalador pequeño para incluir los seis
fuentes C# actuales; antes esperaba cinco y rechazaría el build de R281.
Prepare R283 pasa y todos los gates de escritura siguen cerrados.

`prepareDoomLauncher` reconoce por hash el paquete final R282 de4827012bytes,
separado del pin del carrier inerte R278. El candidato contiene
`allow_native=false`; la fábrica no habilita transporte. Se comprobaron copia
idéntica, rechazo tras cambiar un byte y rechazo por la fábrica antigua, además
del roundtrip completo de2362partes, cortes/reanudación y rechazo de ACKs inválidos
con adaptador PC sintético, sin radio.

**El journal/lock de despliegue grande contra el destino físico sigue
pendiente.** R280/R281 prueban el journal del peer PC, no un instalador final
físico. No se abrió ese camino ni se reutilizó el instalador pequeño para Doom.
Primero interesa obtener memoria real antes de arriesgar una carga nativa grande.
