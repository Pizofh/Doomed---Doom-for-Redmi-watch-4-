# R69: cerrar Doom cambiando de watchface y recoger al volver

El 2026-10-04 pasó un ciclo del motor original E1M1: cambiar de UIProbe a Storage mientras Doom estaba activo, sin pulsar EXIT, y volver a UIProbe. El finalizador solicitó STOP; la reentrada recogió el módulo y las imágenes retenidas. Sin reboot para salir ni descarga forzada desde el PC. Solo emulador Xiaomi Watch S3; M2315W1 permanece intacto.

Se reutilizaron C, Lua, ELF y paquete R67 sin compilación ni instalación nuevas. ELF446144bytes/SHA `e115971e75ec32f33e2ee63a3c2af9799b8d207f73c3779db3bb31b53cef9639`; los guards existentes comprobaron fuentes, imagen guest, ADB, Lua instalada y WAD. Nueva herramienta: `tools/test-doom-close-emulator.mjs`, con tres fases separadas por navegación stock inspeccionada.

## Resultado observado

| Momento | Evidencia |
|---|---|
| START desde UI28 | Worker104, inicializador NSH88; E1M1 activo y frames producidos |
| Seleccionar Storage365700764 | `close retained`, STOP reason1, worker ausente; módulo y dos copias de128012bytes conservados |
| Recursos del motor | 13 reservas/13 liberaciones, streams0, cleanup0, pico tracked6582961bytes; lectores/productor/input neutral y accepting0 |
| Volver a UIProbe365799903 | Timer UI recoge: uninit0, live0/refs0/input0; módulo/nodos/copias y worker ausentes |
| Launcher después de recoger | Captura Ready: exited; exactamente un START, ningún marcador EXIT solicitado |
| Limpieza final | Storage activa, WAD intacto al retirarlo, ELF/WAD tmp y recursos propios ausentes |

Logs principales:

```text
RW4_DOOM_UI: close retained
RW4_DOOM_UI: finished tid=104 result=1 peak=6582961 alloc=13 free=13 streams=0 cleanup=0
RW4_DOOM_UI: uninit rc=0 tid=104 reason=1 live=0 refs=0 requested=0 applied=0 queued=0 keys=0
RW4_DOOM_UI: unloaded tid=104 key_events=0
```

Registro acumulado `artifacts/emulator/doom-close-reentry-1791147966833/result.json`: phase complete, passed=true. Fases previas `doom-close-start-1791147769200` y `doom-close-closed-1791147862451`; copias retenidas descargadas y header/tamaño comprobados. Capturas running/normal/collected inspeccionadas. Cleanup `doom-ui-cleanup-1791148267953`; comprobación final read-only `doom-close-final-1791148293324`, passed=true. Artefactos locales ignorados en Git.

## Alcance y límites

Cerrar aquí significa el cierre normal de Lua al seleccionar otra watchface. No demuestra limpieza ante corrupción, crash, kill, fallos de drivers o agotamiento. La retención es deliberada: GC envía STOP y conserva código/copias; la UI posterior invalida caches y descarga después de comprobar retirada del worker. Mientras no se reentre, el módulo sigue residente aunque el motor haya liberado sus reservas. FLAT comparte memoria, sin sandbox.

El guest estaba SCREEN_STATE_OFF inicialmente. Hubo backup/reset limpio **antes de stage y C**, documentado en `doom-close-baseline-1791147587283`; ninguna salida necesitó reinicio. Último snapshot registra wall_ms89671 y68frames producidos; incluye navegación/pausas, no mide latencia aislada de cierre ni FPS visible. Se completó antes del límite cooperativo120s.

Memoria global antes/después: Umem used22795080→23035160 (+240080), maxused26645044→34793412 (+8148368); GImageCache used1106600→1107592 (+992), maxused4115148→4371716 (+256568). Incluye actividad de UI/cache: causa no aislada, sin atribución a fugas ni presupuesto físico RW4. Recursos propios del motor sí quedaron liberados.

## Reproducción

```powershell
# Guest responsive, UIProbe modo doom instalada e inactiva, módulos propios ausentes.
node tools/doom-ui-emulator.mjs stage
# Seleccionar UIProbe mediante Ajustes; revisar Ready sin START previo.
node tools/test-doom-close-emulator.mjs start
# Seleccionar Storage con el selector stock, inspeccionando cada pantalla.
node tools/test-doom-close-emulator.mjs closed
# Seleccionar UIProbe otra vez; no pulsar START.
node tools/test-doom-close-emulator.mjs reentry
# Volver a Storage y retirar únicamente las copias temporales revisadas.
node tools/doom-ui-emulator.mjs cleanup
```

Helpers restringidos a QEMU revisado, loopback5039/emulator-5554, archivos propios y fases registradas. Si falla una condición, conservar para inspección; no matar worker ni forzar unload. Sintaxis Node y diff comprobados; no repetir pruebas anteriores sin cambio/fallo.

Siguiente checkpoint único: medir presentación real, costo de copia y latencia de input en el emulador antes de optimizar la fluidez. Persistencia de Doom y gate físico siguen pendientes.
