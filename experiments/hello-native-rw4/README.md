# Inicializador C mínimo RW4 — carga y retirada físicas confirmadas

**Actual R210:** [candidato de logging compilado soloPC](../../docs/rw4-log-candidate-r210.md).
log-r210.c/ld y build-rw4-log-r210.mjs producen ELF1120bytes,3bindings de versión
y fingerprintchecks,1ABS32 interna. No ejecutado/empaquetado/autorizado para
hardware. No reemplazar FirstC2 o su marca. Siguiente carrier/captura/cleanup.

**Historial R204:** [usuario confirma cinco verdes y retorno normal a esfera original](../../docs/first-c-corrected-physical-result-r203.md).
FirstC2 ejecutó el candidato784bytes/int init(void*) return0 y confirmó registro/
retirada. No logging C o APIs externas; UI es Lua. Ensayo completado, gates cerrados
y sin reintentos/rearme. Próximo checkpoint: contrato de exports/API solo en PC.

**Historial R202/R203:** [FirstC2 corregida, preparada solo PC](../../docs/first-c-corrected-r202.md).
main-r202.lua incluye UI/controller/adapter estáticos; adapter incorpora
normalizador, bloquea rw4minr197 y usa ID365219998/marca/nombre propios.
Fuente de producción pasó38 casos con I/O real y carga/widgets simulados.

```powershell
node tools/test-rw4-adapter-r202.mjs
node tools/package-first-c-r202.mjs
node tools/pc-rfcomm.mjs build
node tools/pc-static-watchface.mjs prepare r202
node tools/test-static-watchface-transfer.mjs r202
node tools/test-static-watchface-session.mjs r202
```

Ya realizados; reportes existentes se conservan y no se repiten por rutina.
No instalar el paquete armado en S3; su ELF es RW4 ARMv8-M, no Cortex-A7.
[Plan físico R203](../../docs/first-c-corrected-physical-plan-r203.md) pendiente de
revisión expresa. Gates false; los comandos anteriores no envían nada al reloj.

**Historial R200/R201:** [UI real emulada validada, sin C](../../docs/ui-only-emulator-r200.md).
main-ui-r200.lua incluye factory estática sin global load; UiOnly tiene imágenes
y un callback sintético. No perfil físico. [path-r201.lua](../../docs/first-c-path-r201.md)
normaliza separadores internos y mantiene guard de ID/carácteres/ruta.

```powershell
node tools/package-ui-only-r200.mjs
node tools/install-ui-only-emulator-r200.mjs
# Seleccionar UiOnly en menús del guest; TEST UI una vez, segundo toque,
# panel stock y retorno; volver a Storage por selector, sin C.
node tools/check-ui-only-emulator-r200.mjs
node tools/test-rw4-path-r201.mjs
```

Ya ejecutados; scripts rechazan reportes/instalación existentes. UiOnly aún
almacenada e inactiva en S3. FirstC del reloj intacta; sucesor C no preparado
o autorizado. No usar assets/verdes sintéticos como evidencia de carga C.

**Historial R199:** [FirstC física no mostró la UI esperada](../../docs/first-c-ui-failure-r199.md).
C/retirada no confirmados, sin reintentos. ui-r199.lua separa UI y habilitación
del callback; sin backend de ejecución, load, io u os. Su prueba de seis casos
usa widgets simulados en Lua5.4 S3, no render/eventos reales:

```powershell
node tools/test-rw4-ui-r199.mjs
```

Reporte ya existente; no repetir sin cambios. Paquete/sourceR197 originales
intactos. Falta validar UI independiente con LVGL real solo en emulador.

**R197/R198:** shell-adapter.lua, main.lua y FirstC.fprj preparan el ensayo
con activación manual. Abrir esfera no carga C; RUN C consume un único intento
con marca previa y confirma registro/retirada. [Resultados y límites](../../docs/first-c-adapter-r197.md),
[plan físico pendiente de revisión](../../docs/first-c-physical-plan-r198.md).

```powershell
node tools/build-rw4-minimal.mjs
node tools/test-rw4-controller.mjs
node tools/test-rw4-adapter.mjs
node tools/package-first-c.mjs
node tools/pc-static-watchface.mjs prepare r197
node tools/test-static-watchface-transfer.mjs r197
node tools/test-static-watchface-session.mjs r197
```

Los tests Lua requieren emulador S3 propio/ADB5039 ya activo; el adaptador usa
I/O tmpfs real con executor/widgets simulados. Los scripts de tests/paquete
rechazan directorios de resultados existentes; no borrar reportes ni repetir
por rutina. Primera preparación registrada:29 casos adaptador, paquete22.500bytes,
ID365219996. ELF incluido como datos, no ejecutado. No instalar el paquete
armado en S3: su Cortex-A7 no es el ARMv8-M investigado para RW4.
Gates físicos false; estos comandos no instalan nada en el reloj.

**Historial R196:** [controlador Lua validado con backend simulado](../../docs/controller-r196.md).
controller.lua no usa io/os ni ejecuta nada al construir una instancia. Su run
se limita a un intento y exige marca e inventario antes de cargar/retirar.
24 escenarios pasaron en Lua5.4 S3; no se ejecutó minimal.elf. Backend real,
activación manual y plan físico final siguen pendientes.

R194. `minimal.c` recibe el puntero que entrega el loader observado en la
imagen M2315W1/2.2.86 y devuelve cero. No hace logging, imports, asignaciones,
threads, callbacks, escrituras o acceso a drivers. No es DOOM ni un hello C
ejecutado: su propósito es revisar el formato y las instrucciones del candidato.

```powershell
node tools/build-rw4-minimal.mjs
```

La build valida herramientas fijadas, ELF32 ARM little-endian ET_REL, entry
Thumb, código exacto de dos instrucciones, ausencia de imports/relocaciones y
atributos sin paso de argumentos por registros VFP. No enlaza direcciones S3/RW4.
`-march=armv8-m.main -mthumb -mfloat-abi=soft` es una elección conservadora para
este inicializador entero sin llamadas, no una afirmación del ABI flotante de
todo el firmware. No usar esos flags para Doom sin completar su contrato.

Resultados en build/hello-native-rw4, ignorados por Git. En R194 no se empaquetó,
transfirió, cargó ni probó en reloj o emulador; R197 sí lo empaqueta sin ejecutarlo.
El contrato de exports,
privilegios, memoria, instalación y recuperación sigue pendiente. Antes de una
carga física harán falta plan/artefacto/hash y revisión explícita.
