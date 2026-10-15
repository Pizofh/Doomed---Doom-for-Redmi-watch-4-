# Adaptador doomgeneric — preparación del runtime

R271: [motor + runtime para la ISA RW4](../../docs/doom-rw4-build-r271.md),
compilación PC sin bindings físicos ni módulo cargable. Salida propia probada
en el emulador S3; no transferir su ELF al reloj.

Reservado para display/input/timers/FS/runtime después de validar sus contratos en emulador. No se compila DOOM en la primera sesión. No reimplementar motor, renderer, gameplay ni IA. Audio excluido del primer milestone. [Arquitectura propuesta](../../docs/architecture.md).

R64 posterior a la primera sesión: los80 archivos del motor original compilan para ARM en un [build de inspección](../../docs/doom-build-audit.md). Objeto parcial con imports sin resolver, sin módulo ejecutable ni runtime Doom. El shim de libc/allocator/salida sigue pendiente; hardware cerrado.
