# R235 — cliente Lua del candidato RW4

2026-10-14. La lógica de comunicación y retirada del candidato
[R234](rw4-step-candidate-r234.md) está preparada y probada en PC. **No se
ejecutó ese ELF en S3 ni en el RW4.** Tampoco se creó o instaló un paquete nuevo.

El [cliente](../experiments/native-step/client-rw4-r235.lua) recibe un backend;
no llama al sistema por su cuenta. El
[adaptador](../experiments/native-step/adapter-rw4-r235.lua) fija el nodo
`/dev/rw4step234`, el módulo `rw4step234` y los archivos dentro de
`/data/app/watchface/market/365219977/lua/`. Normaliza separadores internos como
las pruebas anteriores, pero rechaza otro ID, otra raíz y metacaracteres.
El ensamblador PC verifica el ELF fijo y sus fuentes antes de producir el código.

## Inicio, controles y salida

No hay ejecución automática. START consume un único intento por cliente, exige
habilitación explícita del adaptador, archivo idéntico al candidato, ausencia de
marca/captura/nodo y catálogo de módulos reconocido y vacío. Escribe y comprueba
la marca propia antes del único insmod. La marca permanece para impedir repetir
el ensayo al abrir otro cliente. Nunca se elimina o rearma desde este código.

Antes de START nativo, exige registro exclusivo del módulo propio y snapshot
inicial coherente con BSS cero. No atribuye un nodo existente a este ensayo.
Cada transacción cierra el archivo; confirma secuencia, fase, controles, pasos,
cambios de controles y estado de error. Leer 32 bytes exige EOF posterior.
Limita la sesión a 300 STEP y 2048 mensajes; no reenvía mensajes sin ACK.

Una respuesta perdida a una acción puede haber consumido una secuencia. STOP
consulta el estado y admite únicamente la secuencia previa o la que este
cliente pudo enviar. Confirma controles neutrales y fase Idle/Stopped antes
de pedir retirada, y comprueba catálogo vacío y nodo ausente después. Un cierre
fallido bloquea la retirada. Un registro o resultado incierto conserva el módulo.
STOP y rmmod tienen un solo intento; perder el ACK de STOP no provoca otro envío.
No intenta resolver busy cargando otro módulo o descargando a ciegas, porque
la implementación inspeccionada puede desvincular el nodo antes de devolver busy.

Los retornos de os.execute no se usan como prueba de éxito: las builds Lua/NSH
pueden diferir. Se exige retorno normal, captura legible/retirada, inventario y
ACK. No se ocultan una excepción del dispatch o una captura incierta.
El cliente no hace I/O desde GC; la futura UI debe detener primero su Timer y
llamar explícitamente a STOP durante EXIT/pageOnPause. No hay widgets aquí aún.

## Validación

```powershell
node tools/test-step-carrier-r235.mjs
```

**37 escenarios pasaron** ejecutando las fábricas Lua de producción en el guest
S3, con archivos propios reales en tmpfs. Shell, registro de módulos y callbacks
del nodo estaban **simulados**. El ELF solo se comparó como datos. El test usa
únicamente el ADB del emulador en loopback/5039/emulator-5554, con guard de
propiedad y hash; no tiene selector de teléfono o de dispositivo físico.

Los casos incluyen inicio manual y único, controles/release/pause/resume,
límites de sesión, marca preexistente, archivo distinto o inaccesible, captura
preexistente, módulo ajeno, fallo de escritura de marca, load rechazado o
excepcional, inventario inválido/duplicado, snapshot inicial incorrecto,
respuesta corta/sin EOF, magia/fase erróneas, ACK perdido/antiguo/futuro,
contador incoherente, write/flush/close fallidos y retirada busy que pierde el
nodo pero conserva el módulo. También se probó habilitación ausente sin escribir
marca y normalización de separadores del runtime.

Informe privado: `artifacts/emulator/step-carrier-r235-reviewed/summary.json`.
El inventario real de módulos no cambió y los archivos propios de tmpfs fueron
retirados. Se conserva el primer informe de 35 casos en `step-carrier-r235`:
la revisión añadió el bloqueo de habilitación antes de la marca y dos casos
para ACK perdido de STOP y contador incoherente. No se sobrescribió evidencia.
El chequeo inicial de ensamblado rechazó el nombre de método `load`, que coincidía
con su filtro de ejecución dinámica; se renombró `load_module` sin relajar el filtro.

Hashes de la revisión validada:

- Cliente: `7653f6676d90f06dc1ad9f3ebc6bf8046ff8542a30666e6e72e52b1954a2e68d`.
- Adaptador ensamblado: `44621adcd32037037f2f2adb7de674f63cd3b5f3d00e1bdcc82cf9b7b2b3b0fe`.
- Harness: `c51f70216b67ac6d553253e609b762143d663948416a7b3e501c63f17cd86446`.
- ELF candidato sin cambios: `713fe535880f2cbae928efe5199d15b0c39a01bc455aab819f8a534cbab4d424`.

## Límites y checkpoint

Los mocks comprueban decisiones del cliente ante los fallos enumerados; no
demuestran callbacks/registro/BSS reales del RW4, comportamiento concurrente,
rendimiento, recuperación integral ni un timeout duro. Las llamadas shell/VFS
pueden bloquear la UI. Los límites de mensajes no interrumpen una llamada
atascada. Las nuevas APIs y el modelo de privilegios siguen pendientes; no es
un sandbox. No hay Doom o renderer alternativo en este experimento.

Siguiente checkpoint: conectar este cliente a la UI de controles ya probada,
validar Timer/EXIT/pageOnPause ante éxito y fallos, y producir un paquete y plan
físico concretos para revisión. Sigue sin existir autorización para enviar este
candidato. Los gates Node/C# permanecen cerrados y no se tocó el reloj.
