# Inicializador C mínimo RW4 — solo compilación en PC

**R196:** [controlador Lua validado con backend simulado](../../docs/controller-r196.md).
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

Resultados en build/hello-native-rw4, ignorados por Git. **No se empaqueta,
transfiere, carga ni prueba en reloj o emulador.** El contrato de exports,
privilegios, memoria, instalación y recuperación sigue pendiente. Antes de una
carga física harán falta plan/artefacto/hash y revisión explícita.
