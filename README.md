# DOOM en Redmi Watch 4

**R72:** [Sesion90s](docs/doom-stability-emulator.md) completa a50ms: motor/controles operativos, cache constante, heap oscilante sin crecimiento continuo observado y salida limpia.1580entregas totales; no prueba de ausencia de fugas durante horas. Siguiente: persistencia ELF/WAD en emulador; hardware fisico intacto.

**R71:** [Mejora de fluidez a50ms](docs/doom-50ms-emulator.md):17,45entregas/s y12,7-13,6cambios visibles/s durante giros (antesunos5), motor ~35tics/s.

**Historial R70:** [Medicion inicial](docs/doom-performance-emulator.md) identifico Timer200ms como limite.

**Historial R69:** [Cierre sin EXIT y reentrada](docs/doom-close-emulator.md) pasaron sin reboot.

**Historial R68:** [Panel stock y STOP con FIRE pulsado](docs/doom-focus-emulator.md) pasaron con el motor real.

**R67, 2026-10-04:** DOOM original ejecuta E1M1 en la UI Lua/LVGL del emulador Xiaomi Watch S3. Avanzar, girar, disparar, pausar/reanudar y dos ciclos START/EXIT/reapertura pasaron sin reboot. [Resultados, mediciones y reproducción](docs/doom-ui-emulator.md). Presentacion inicial R67: aproximadamente cinco frames/s; mejora R71 arriba, estabilidad prolongada y persistencia pendientes.

Objetivo: portar doomgeneric al Xiaomi Redmi Watch 4 **M2315W1**, conservando firmware stock y funciones normales si resulta posible. **El reloj físico no se ha conectado ni modificado.** El emulador S3 a390×450 no demuestra ISA/ABI/firmware/compatibilidad del RW4.

Se conserva motor, renderer y gameplay original. Aportes propios: investigación de contratos/ABI del guest, tooling, adaptadores display/input/tiempo/archivos y lifecycle. No se ha reverse-engineered el firmware físico RW4. Estado para continuar: [HANDOFF](docs/HANDOFF.md).

## Prototipo actual

- Lua: START, MOVE, FIRE, MENU, RESUME y EXIT. Un dedo; avanzar+girar dentro del pad. Comodidad en muñeca sin validar.
- Worker C: Doom/WAD shareware verificado; frames320×200 RGB565 por dos slots/copias tmpfs a LVGL. No llamadas UI desde worker ni escritura directa del framebuffer global.
- Pausa libera teclas/congela tiempo. EXIT espera retirada del worker antes de unload; siguiente sesión recarga ELF y restaura globals.
- Watchface permanece instalada en emulador; ELF/WAD en /tmp volátil y retirados tras el ensayo. Persistencia de Doom pendiente.
- NuttX FLAT compartido, **sin sandbox**. No cargar este ELF ni sus direcciones en M2315W1.

Final: Storage365700764 activa, UIProbe365799903 modo doom almacenada; workers/módulo/nodos/copias/ELF/WAD tmp retirados. Siguiente checkpoint: instalar ELF/WAD una vez en almacenamiento del emulador y reabrir despues de reset sin retransmitirlos.

## Reproducción local

PC con herramientas Node, sin cambiar ExecutionPolicy. Requiere inputs revisados: [emulador](docs/emulator.md), [paquete](docs/emulator-package-review.md), toolchain Arm14.3/[fuentes/build](docs/doom-build-audit.md) y [WAD](docs/native-wad-emulator.md).

```powershell
node tools/build-doom-ui.mjs
node tools/package-ui-probe.mjs doom
# UIProbe inactiva y sin modulos propios; requiere instalacion previa/derivado.
node tools/install-ui-probe-emulator.mjs refresh
# Guest responsive; stage despues de cualquier reset necesario.
node tools/doom-ui-emulator.mjs stage
# Seleccionar UIProbe por Ajustes; revisar Ready, sin START previo.
node tools/test-doom-ui-emulator.mjs
# Despues de EXIT y volver a Storage:
node tools/doom-ui-emulator.mjs cleanup
```

Helpers verifican QEMU/ADB/imagen/payload y usan exclusivamente loopback5039/emulator-5554. No deployment a USB/hardware. Si worker/referencias siguen activos, conservar para inspección, sin unload forzado. [Contrato y límites](docs/doom-ui-emulator.md).

## Evidencia y diseño

- [Investigación y fuentes](docs/research.md)
- [Matriz y23 hipótesis](docs/evidence-matrix.md)
- [Arquitectura/persistencia](docs/architecture.md)
- [Controles](docs/controls.md)
- [Entorno local](docs/host-environment.md)
- [Ejecución nativa/privilegios](docs/native-execution.md)
- [Runtime de recursos/salida](docs/doom-runtime-emulator.md)
- [Primer frame original R66](docs/doom-first-frame-emulator.md)
- [Doom en UI/controles R67](docs/doom-ui-emulator.md)
- [Medicion de presentacion/input R70](docs/doom-performance-emulator.md)
- [Mejora a50ms R71](docs/doom-50ms-emulator.md)
- [Sesion90s R72](docs/doom-stability-emulator.md)
- [Modelo de riesgo](docs/risk-model.md)
- [Gate físico cerrado](docs/physical-device-plan.md)

## Objetivo eventual y distribución

MVP físico: DOOM original, WAD shareware, display/touch/tiempo funcionales, salida al reloj y archivos persistentes para reabrir sin PC. Sonido, corona, saves e integración bonita después. Firmware custom solo si una restricción concreta lo exige y el usuario aprueba el riesgo.

No se incluyen WADs, firmware, APKs, emuladores ni toolchains binarias. [Licencia shareware](docs/native-wad-emulator.md) y GPL del motor son asuntos separados. No publicar assets comerciales ni firmware Xiaomi. Elegir licencia de aportes originales antes de publicar; componentes derivados/enlazados con Doom deben respetar GPL.
