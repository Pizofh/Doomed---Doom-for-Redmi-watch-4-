# DOOM en Redmi Watch 4

**Actual R159, 2026-10-12:** [SPP físico Windows abierto y cerrado](docs/windows-spp-result-r158.md),
un intento/1337ms, sin comandos de aplicación. Usuario mantiene vínculo PC y
pide agrupar pruebas. [Lote preparado](docs/windows-xiaomi-session-plan-r159.md):
versión/auth/batería/modelo/firmware en una sesión, sin uploads o ajustes. Build y
pruebas offline pasan; una clave histórica candidata privada, vigencia pendiente
de HMAC. Lote físico todavía NO ejecutado. Retorno después del probe pendiente;
retorno anterior confirmado. Doom físico/ABI/loader no demostrados.

**Historial R154:** usuario logró pairing Windows (micrófono) y retorno completo a
Mi Fitness tras quitar el vínculo PC. [Un intento SPP Windows preparado](docs/windows-spp-probe-plan-r154.md),
con preflight de caché/destino, seguridad y supervisión del worker. Build y pruebas
offline pasan: 134 aserciones C# y diez escenarios del supervisor. **SPP físico
todavía no ejecutado ni autorizado**; modo probe explícito requiere revisión y
target privado verificado. No código/config Xiaomi transferidos ni Doom físico.
CI actualizado, aún no ejecutado en GitHub. [Estado completo](docs/HANDOFF.md).

**Historial R148:** [cliente Windows preparado y probado offline](experiments/pc-rfcomm/README.md).
Compilación x64 y pruebas simuladas de apertura, timeout, cancelación y cierre
pasan. Conexión física deshabilitada; no se escaneó ni conectó el reloj desde PC.
Primer workflow CI para este cliente preparado, aún no ejecutado en GitHub.
Siguiente: compatibilidad del vínculo Windows/RW4 antes de proponer una prueba.
La consulta upstream está autorizada y preparada, pero sigue sin publicarse por
falta de navegador disponible. Doom funciona en emulador S3; ejecución RW4 física
todavía no demostrada. [Retomar estado completo](docs/HANDOFF.md).

Las entradas inferiores conservan el historial de checkpoints anteriores.


**Actual R128:** [comparación de servicios terminada; reloj y Mi Fitness normales](docs/phone-core-state-plan.md).
Al detener Mi Fitness desaparece el registro core externo. Su objeto de conexión
tiene un ciclo distinto; socket libre y causa de E03 siguen sin probar.
Siguiente trabajo: investigar diagnóstico Android de conexiones en PC.

**Actual R126:** [lector USB ampliado; Mi Fitness vuelve a sincronizar](docs/phone-core-state-plan.md).
Las dos salidas anteriores no prueban servicio/socket ausente. Se corrige la
validación del cuerpo y se prepara una consulta normal de ambos paquetes;
resultado real pendiente, sin otra APK o prueba Bluetooth.

**Actual R124:** [lectura USB preparada para comparar el estado de Lyra](docs/phone-core-state-plan.md).
Herramienta probada con respuestas simuladas; comparación del teléfono pendiente.
La papelera conduce a desvinculación y el setter Lyra revisado pertenece a manejo
de fallos. No hay pausa temporal soportada demostrada ni otro PROBE propuesto.

**Actual R121:** [servicio Xiaomi analizado: permisos y ciclo de conexión](docs/mi-connect-service-static-review.md).
La API de Lyra exige paquete/certificado permitidos; nuestra app no está admitida.
El cierre de Mi Fitness no obliga a cerrar todos los dispositivos en el recorrido
revisado. Causa de E03 aún sin demostrar. Seguimos con el mismo teléfono:
buscar una desconexión temporal normal y su restauración antes de otra prueba.

**Actual R120:** [APK instalado verificado y delegación Lyra identificada](docs/mi-fitness-apk-static-review.md).
Mi Fitness3.59.1i tiene firma criptográfica válida; su cliente SPP revisado usa
nuestro mismo UUID/factory. Los logs existentes registran delegación exitosa a
un servicio externo Xiaomi: detener Mi Fitness no demostró aislamiento completo.
Falta atribuir transporte/canal al RW4. Próximo paso preparado: copiar el APK
de ese servicio por USB y analizarlo en PC; sin otra prueba Bluetooth o APK nuevo.

**Actual R119:** [revisión de ruta SPP y copia de Mi Fitness preparada](docs/rw4-spp-endpoint-research.md).
UUID/factory coinciden con cliente upstream; causa del fallo aún desconocida.
Script probado con ADB simulado para copiar el APK instalado del teléfono por
USB, sin ejecutarlo ni nuevas pruebas Bluetooth. Copia/análisis real pendientes.

**Actual R118:** [inventario completo y retorno normal confirmados](docs/rw4-service-inventory.md).
Reloj funcionando y Mi Fitness sincronizando tras la prueba. Siguiente paso:
investigar el fallo de conexión SPP en PC; no otra prueba física o APK solicitado.
Ejecución nativa e instalación de Doom en el reloj siguen pendientes.

**Actual R117:** [segundo inventario completado en16,1s](docs/rw4-service-inventory.md).
Android entregó SPP/HFP/HID; BLE recibió40callbacks sin anuncios atribuibles al
reloj. Cierre retornó sin error registrado. Falta confirmar retorno a Mi Fitness;
servicio/canal SPP remoto aún sin validar. No nuevo intento o APK propuesto.

**Actual R116:** [el primer inventario terminó a5,9s por pérdida de primer plano](docs/rw4-service-inventory.md),
antes de BLE. Retiro del receptor reportado; causa de onPause desconocida.
Se propone una segunda ejecución con el mismo APK y pantalla abierta30s.
Resultado pendiente; no nuevo build ni cambios de transporte/firmware.

**Actual R115:** [r114 abrió y el retorno a Mi Fitness es normal](docs/rw4-service-inventory.md).
El informe recibido sigue en I0; falta recuperar el desenlace guardado desde
**Informe y caché local**. No iniciar otra prueba ni instalar un APK nuevo.

**Actual R114:** [inventario de servicios Android](docs/rw4-service-inventory.md)
implementado en un único APK: solicitud UUID/SDP y observación BLE, sin
autenticación ni comandos Xiaomi. Pruebas PC pasan; resultado físico pendiente.
El próximo checkpoint es un inventario manual y retorno normal a Mi Fitness.
Instalar/ejecutar código en el reloj sigue pendiente de su gate específico.

**Actual R113:** [PROBE con Mi Fitness sin permiso Nearby](docs/rw4-permission-isolated-probe-result.md)
también falla antes de autenticación. Permisos restaurados y funcionamiento
normal confirmados. Filtro privado PC probado: logs existentes no identifican
transporte del RW4. Siguiente meta: servicio/endpoint de datos actual; mismo APK,
sin más intentos iguales ni cambios automáticos de transporte/firmware.

**Actual R109:** [nuevo PROBE r106 y aislamiento de Mi Fitness](docs/rw4-bluetooth-profiles-result.md).
Sigue fallando antes de autenticación (151ms). Una notificación de Mi Fitness
sugiere actividad, sin demostrar reconexión; Quick Share no es intermediario
requerido por nuestra app. Retorno de este intento pendiente; aislamiento del
permiso de Mi Fitness preparado en documentación. Mismo APK; nativo RW4 pendiente.

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
