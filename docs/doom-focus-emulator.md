# R68: foco del sistema y salida con FIRE pulsado

El 2026-10-04 se validó el motor original de Doom frente al panel stock del emulador S3 y un STOP cooperativo con el puntero aún apoyado en FIRE. El mismo binario y Lua R67 pasaron sin cambios, recompilación ni reinstalación. No se tocó el Redmi Watch 4 M2315W1.

Resultado: `artifacts/emulator/doom-focus-test-1791145311054/result.json`, `passed=true`, nueve snapshots y siete capturas. Herramienta: `tools/test-doom-focus-emulator.mjs`.

## Pruebas nuevas

| Operación | Evidencia |
|---|---|
| Abrir panel desde margen y440 con Doom activo | Captura stock; worker104 permanece vivo y `pause System panel` |
| Esperar en panel | Tic86, posición/ángulo/munición, callbacks/produced y cambios de input iguales en dos muestras |
| Tocar zona neutra del panel x50/y45 | Motor e input siguen congelados; ninguna tecla entregada |
| Cerrar panel | Pantalla PAUSED / System panel; tic86, no reanudación automática |
| Pulsar RESUME | Marcador `resume neutral`; tics96→157 sin input activo |
| Mantener FIRE x310/y325 | requested/applied/delivered_keys8, cola0; munición50→48 |
| STOP con FIRE todavía pulsado | Worker termina reason1, 13alloc/13free, streams0, cleanup0; pico tracked6582961bytes |
| Recoger desde UI antes de soltar | Módulo/nodo/stream/copias ausentes y PID104 ausente; launcher Ready: exited |
| Mantener contacto después de recoger | Sin reinicio involuntario del juego; release se envía en finally |

Screenshots locales ignorados: `artifacts/emulator/screenshots/doom-focus-test-1791145311054-{stock-panel,return-paused,retired-while-held}.png`, inspeccionados visualmente. Logs de uninit confirman `reason=1 live=0 refs=0 requested=0 applied=0 queued=0 keys=2`. Neutralidad se refiere al transporte al retirar el módulo; no se leyó el array privado de teclado de Doom después de liberar el motor.

NSH escribe solamente op2/STOP a nuestro driver fijo con secuencia nueva y descriptores cerrados. Hasta seis retries admiten únicamente EINVAL22 por carrera de secuencia con cache commands de UI; no retries de errores arbitrarios. El host no llama LVGL, no mata hilos y no descarga el módulo. El Timer Lua elimina Image/invalida caches y descarga después de completion y PID ausente. En caso de fallo se solicita stop cooperativo y se conserva cualquier módulo no recogido para inspección.

## Alcance y límites

Panel probado con **ninguna acción mantenida al abrirlo**. STOP sí se probó manteniendo FIRE hasta retirar el worker, sin release previo. Son pruebas distintas: esto no demuestra pérdida real de foco stock mientras se sigue apoyando el dedo en un control. Tampoco cubre llamadas/notificaciones/corona, crash/kill, errores pthread/driver, SMP o pruebas prolongadas.

El tap neutro confirma aislamiento de input para ese punto y flujo; no prueba todos los controles/configuraciones stock. El gesto comienza en el margen libre; un gesto que empieza dentro del pad/PRESS_LOCK puede quedar retenido como se documentó en R62. La salida por menú ya pasó R67; STOP externo controlado añade otra prueba de cooperación del motor, no un mecanismo físico de emergencia.

El registro inicial guarda una marca de finalización después de capturas/inspecciones bajo el nombre `retirementObservedAtUtc`; **no es latencia aislada de STOP**. El helper posterior usa `retirementChecksCompletedAtUtc` para expresar ese alcance. No se repitió el motor por ese ajuste de nombre.

Dos muestras globales: Umem used22795496→23029008 (+233512), maxused26645636→34770876 (+8125240), nused509→502/nfree68→67. GImageCache used1106680→1710344 (+603664), nused66→77/nfree14→16. Estas muestras incluyen cambios del panel/UI y tienen causa no aislada: no atribuirlas a una fuga del motor ni declarar ausencia de fugas del guest. Allocator propio vuelve a cero; estabilidad/rendimiento prolongados siguen pendientes.

## Preparación y reproducción

El guest estaba SCREEN_STATE_OFF y el ratón no lo despertó. Se verificó ausencia de módulos propios, se respaldó data y se reinició únicamente el emulador **antes de stage y ejecución de C**. Registro `doom-focus-baseline-1791145112979`; no reboot para salir. Se comprobó panel responsive y cada pantalla del selector antes de abrir UIProbe.

No fuentes, toolchains, builds o paquetes nuevos. Identidad R67 conservada: ELF446144bytes/SHAe115971e75ec32f33e2ee63a3c2af9799b8d207f73c3779db3bb31b53cef9639 y Lua SHAb86f0cee70c58a544a09c5069c4c4fcd260a9ebb4b0b05deb827507d9d7120d9. Core/guest/sources y WAD remoto pasan los guards existentes; QEMU y ADB exclusivamente loopback5039/emulator-5554.

```powershell
# Guest responsive, UIProbe modo doom instalada, módulos propios ausentes.
node tools/doom-ui-emulator.mjs stage
# Abrir UIProbe por Ajustes; revisar Ready sin pulsar START antes del helper.
node tools/test-doom-focus-emulator.mjs
# Volver a Storage por selector, revisando cada pantalla.
node tools/doom-ui-emulator.mjs cleanup
```

No repetir R67 ni pruebas anteriores sin cambio/fallo. Este checkpoint valida un nuevo flujo del motor; no compila ni cambia C/Lua. Helper final tiene comprobación de sintaxis y diffs limpios.

Final: Storage365700764 activa, UIProbe365799903 almacenada modo doom. Cleanup `doom-ui-cleanup-1791145462593` verificó WAD intacto y retiró ELF/WAD de tmpfs; nodos/copias/módulo/worker ausentes. Archivos de Doom todavía no son persistentes, sin sandbox en FLAT y sin compatibilidad/recovery física demostrada.

Siguiente checkpoint único: cerrar la watchface con el motor activo sin usar EXIT y comprobar que reentrar recoge los recursos retenidos, sin reboot. Después medir transporte/rendimiento antes de optimizar. Gate M2315W1 cerrado.
