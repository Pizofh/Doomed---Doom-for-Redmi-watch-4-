# R196 — controlador de un intento validado con backend simulado

2026-10-13. Se ejecutó el [controller.lua propio](../experiments/hello-native-rw4/controller.lua)
en Lua5.4 del emulador S3, con filesystem/registro/carga/descarga **simulados**.
Ningún ELF RW4 fue copiado o ejecutado; no teléfono, Bluetooth o reloj físico.

`node tools/test-rw4-controller.mjs` pasó **24 escenarios**. El mismo source
que se versiona se cargó con un entorno limitado a assert/type/ipairs/pcall,
sin io/os. El backend de pruebas guarda estado entre instancias para modelar
reentrada y pérdida de RAM con marca persistente conservada. No se sustituyó
el controlador por una reimplementación en JS.

| Situación probada | Resultado |
|---|---|
| Éxito | Un load, registro observado, un unload, ausencia confirmada |
| Archivo rechazado, marca desconocida o inventario previo inválido | Cero load/unload |
| Módulo preexistente | No se carga ni retira ese módulo |
| Fallo de escritura/readback de marca | No se carga C |
| Excepción después de marcar | Nueva instancia bloqueada por marca |
| Excepción tras load o retorno desconocido | No unload a ciegas, no nueva carga |
| Registro posterior ilegible/ausente | No afirmar éxito ni descargar sin atribución |
| Descarga fallida/registro final presente o desconocido | No repetir unload ni declarar Complete |
| Segundo intento en misma instancia o callback reentrante | Bloqueado antes de operaciones de backend |
| Reinicio simulado: pierde módulo RAM y conserva marca | Nueva instancia no vuelve a cargar |

Scope: valida **orquestación**, no loader/ABI físico, parsers NSH, escrituras
reales del reloj, durabilidad del filesystem, atomicidad entre VMs concurrentes
o reacción ante un deadlock que no devuelve control. No simula el firmware RW4.
Para la futura UI se exige una acción manual dedicada: seleccionar/reabrir la
esfera solo mostrará estado; no llamará run automáticamente. Así no depende
exclusivamente de que la marca sobreviva a una pérdida de energía.

El emulador estaba apagado con un registro de launcher sin salida. Se comprobó
ausencia de su PID/QEMU y se conservó ese registro antes de marcarlo obsoleto.
El arranque sandbox falló por perfil VVD; el arranque autorizado con el launcher
revisado pasó. QEMU14908, launcher15696 durante esta prueba, endpoint exclusivo
ADB5039/emulator-5554; no USB. Se confirmó propiedad de los listeners loopback.
host-stdout/host-stderr corresponden al nuevo arranque, no al log histórico R188.

Se creó y verificó únicamente /tmp/rw4-controller-r196.lua en el guest; fue
retirado y su ausencia comprobada. Inventario lsmod antes/después idéntico.
Sin instalación/cambio de esfera, drivers, threads propios o C cargado.
Reportes privados: artifacts/emulator/controller-r196/summary.json y commands.json.

Source SHA256:
`060db50622dd1577ad62092a1cf0d4b202633d2c856064a85ca6563f1030b08d`.
Harness SHA256:
`fb4b902351418d6b250ee1a2d891905956547ed8c723622cf7d0b2cf5ccae654`.
No repetir la prueba si existe el informe; se preserva para la revisión.

Siguiente: adaptador concreto del shell/archivos y UI con activación manual,
probarlos sin cargar el ELF RW4, y generar paquete/hash/plan final. Este módulo
Lua no tiene backend de producción ni perfil físico; gates siguen cerrados.
