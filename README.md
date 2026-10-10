# DOOM en Redmi Watch 4

**Actual R107:** [prueba solo Bluetooth r106 realizada](docs/rw4-bluetooth-probe-result.md).
La apertura falló en297ms, antes de autenticación/comandos Xiaomi; el cierre
local terminó. Mi Fitness y reloj funcionan según el usuario, con una diferencia
de ~18 pasos entre app/reloj aún sin causa determinada. No nuevo APK ni consulta
de batería; siguiente meta: verificar el transporte/servicio de esta unidad.
Los apartados anteriores se conservan como historial; nativo RW4 sigue pendiente.

**Actual R106:** [app de diagnóstico consolidada](docs/android-consolidated-diagnostic.md)
lista en PC: caché/informe copiable, errores/tiempos, prueba solo Bluetooth,
consulta limitada de batería/datos y cancelación. Un APK para estas herramientas;
no nueva instalación/UI/radio reportadas todavía. No ejecución nativa RW4 demostrada.

**R105:** lectura de caché r104 realizada por el usuario: vínculo confirmado,
tipo clásico y SPP presente. Coincide con el transporte elegido por nuestra
app; no prueba que el servicio remoto responda. [Resultado y siguiente diagnóstico](docs/android-bluetooth-cache.md).
No nuevo intento Bluetooth ni APK preparado en esta revisión.

**Estado actual R104:** DOOM real funciona en el emulador S3; compatibilidad
nativa RW4 pendiente. Dos consultas manuales Bluetooth al reloj no conectaron;
Mi Fitness y reloj normales después, confirmado por usuario. [Resultado](docs/first-rw4-query-result.md).
Está listo el APK r104 de [diagnóstico de caché local del teléfono](docs/android-bluetooth-cache.md)
sin otra conexión. Los apartados R92 y anteriores son historial.

**R92:** investigado el bloqueo Play Protect: el APK-r87 conservaba un lector
de notificaciones deshabilitado y su binding sensible. Se preparó eliminarlo
por completo; test de regresión pasa. [Nuevo build pendiente](docs/android-build.md).
No desactivar protección ni reutilizar ese APK. Emulador Android aplazado;
prioridad del usuario: avanzar hacia RW4 real, con gate físico aún cerrado.

**R89:** [prueba Android sin Bluetooth](docs/android-offline-test.md) preparada:
APK-r87 verificado en `artifacts/android-offline-test-r87/`, guía de
arranque/salida/reapertura y reversión. No instalado; aprobación para la
prueba en teléfono pendiente. No se necesita otro build. Reloj intacto.

**R88, 2026-10-05:** segundo APK Android de diagnóstico compilado y revisado:
firma v1/v2 válida, diez permisos declarados (nueve previstos y uno interno de
AndroidX), un servicio habilitado y entradas automáticas restringidas en el
manifiesto. Intento manual único por proceso y vínculo Bluetooth existente.
Sin instalar ni probar runtime Android. [Resultado](docs/android-build.md).
Reloj intacto.

**R74:** [Investigacion stock RW4](docs/rw4-stock-feasibility.md): indicio Lua/shell y Gadgetbridge como candidato de instalacion; ABI/loader/firmware fisico siguen pendientes.17sources auditados, sin tocar hardware.

**R73:** [Doom persistente en emulador](docs/doom-persistence-emulator.md): ELF/WAD instalados una vez en /data; E1M1 antes/despues de reset sin reenviar assets, salida limpia y cancelacion durante carga. No demuestra compatibilidad M2315W1.

**Historial R72:** [Sesion90s](docs/doom-stability-emulator.md) completa a50ms: motor/controles operativos, cache constante, heap oscilante sin crecimiento continuo observado y salida limpia.1580entregas totales; no prueba de ausencia de fugas durante horas. Siguiente: persistencia ELF/WAD en emulador; hardware fisico intacto.

**R71:** [Mejora de fluidez a50ms](docs/doom-50ms-emulator.md):17,45entregas/s y12,7-13,6cambios visibles/s durante giros (antesunos5), motor ~35tics/s.

**Historial R70:** [Medicion inicial](docs/doom-performance-emulator.md) identifico Timer200ms como limite.

**Historial R69:** [Cierre sin EXIT y reentrada](docs/doom-close-emulator.md) pasaron sin reboot.

**Historial R68:** [Panel stock y STOP con FIRE pulsado](docs/doom-focus-emulator.md) pasaron con el motor real.

**R67, 2026-10-04:** DOOM original ejecuta E1M1 en la UI Lua/LVGL del emulador Xiaomi Watch S3. Avanzar, girar, disparar, pausar/reanudar y dos ciclos START/EXIT/reapertura pasaron sin reboot. [Resultados, mediciones y reproducción](docs/doom-ui-emulator.md). Presentacion inicial R67: aproximadamente cinco frames/s; mejora R71, sesion90s R72 y persistencia R73 documentadas arriba.

Objetivo: portar doomgeneric al Xiaomi Redmi Watch 4 **M2315W1**, conservando firmware stock y funciones normales si resulta posible. Se han realizado intentos manuales de conexión Bluetooth, sin autenticación exitosa ni instalación/firmware modificados reportados. El emulador S3 a390×450 no demuestra ISA/ABI/firmware/compatibilidad del RW4.

Se conserva motor, renderer y gameplay original. Aportes propios: investigación de contratos/ABI del guest, tooling, adaptadores display/input/tiempo/archivos y lifecycle. No se ha reverse-engineered el firmware físico RW4. Estado para continuar: [HANDOFF](docs/HANDOFF.md).

## Prototipo actual

- Lua: START, MOVE, FIRE, MENU, RESUME y EXIT. Un dedo; avanzar+girar dentro del pad. Comodidad en muñeca sin validar.
- Worker C: Doom/WAD shareware verificado; frames320×200 RGB565 por dos slots/copias tmpfs a LVGL. No llamadas UI desde worker ni escritura directa del framebuffer global.
- Pausa libera teclas/congela tiempo. EXIT espera retirada del worker antes de unload; siguiente sesión recarga ELF y restaura globals.
- Watchface, ELF y WAD permanecen en /data del emulador. START carga C/copia WAD a tmp; EXIT retira C/temporales y preserva archivos instalados.
- NuttX FLAT compartido, **sin sandbox**. No cargar este ELF ni sus direcciones en M2315W1.

Final: Storage365700764 activa, UIProbe365799903 modo doom persistente almacenada. Worker/modulo/nodos/copias/tmp ausentes; assets en /data conservados. Siguiente checkpoint: investigar el camino stock M2315W1, solo fuentes/documentacion.

## Reproducción local

PC con herramientas Node, sin cambiar ExecutionPolicy. Requiere inputs revisados: [emulador](docs/emulator.md), [paquete](docs/emulator-package-review.md), toolchain Arm14.3/[fuentes/build](docs/doom-build-audit.md) y [WAD](docs/native-wad-emulator.md).

```powershell
# Inputs revisados y UIProbe previamente instalada/inactiva; build solo si necesario.
node tools/build-doom-ui.mjs
# Solo primera instalacion: rechaza sobrescritura. Estado actual ya instalado.
node tools/doom-storage-emulator.mjs install
node tools/package-ui-probe.mjs doom
node tools/install-ui-probe-emulator.mjs refresh
node tools/doom-storage-emulator.mjs verify
# Seleccionar UIProbe por Ajustes; START (~8,3s), MENU/EXIT.
node tools/doom-ui-emulator.mjs state
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
- [Persistencia R73](docs/doom-persistence-emulator.md)
- [Modelo de riesgo](docs/risk-model.md)
- [Gate físico cerrado](docs/physical-device-plan.md)
- [Plan DevOps y distribucion reproducible](docs/devops-roadmap.md)

## Objetivo eventual y distribución

MVP físico: DOOM original, WAD shareware, display/touch/tiempo funcionales, salida al reloj y archivos persistentes para reabrir sin PC. Sonido, corona, saves e integración bonita después. Firmware custom solo si una restricción concreta lo exige y el usuario aprueba el riesgo.

No se incluyen WADs, firmware, APKs, emuladores ni toolchains binarias. [Licencia shareware](docs/native-wad-emulator.md) y GPL del motor son asuntos separados. No publicar assets comerciales ni firmware Xiaomi. Elegir licencia de aportes originales antes de publicar; componentes derivados/enlazados con Doom deben respetar GPL.

## Repositorio Git local

El repo de trabajo es `redmi-watch4-doom/`, con su propio `.git`, rama master e historial incremental. La carpeta padre `Doomed/` contiene otro repo con First commit y una entrada gitlink al proyecto; no es su historial de trabajo. Abrir esta carpeta directamente en VS Code o usar `git -C redmi-watch4-doom log --oneline -5` desde Doomed. Ninguno tiene remoto configurado; los commits son locales, no publicados. El intento de retirar el repo padre fue rechazado por el entorno; en la inspeccion posterior del 2026-10-04, Doomed/.git ya no existe. Se conserva este repo con su historial completo; no se atribuye esa retirada al agente.
