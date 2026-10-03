# ADR 0001: límite de evidencia del emulador

Fecha: 2026-10-02. Estado: aceptado para esta investigación.

El mantenedor de EasyFace describe un sistema emulado Watch S3; MiWatchEmulator ofrece tamaños RW4/RW5/S3. Usaremos ese entorno para investigar runtime, UI, archivos y mecanismos de ejecución en PC. Registraremos cada hallazgo como emulador y no como firmware M2315W1.

Consecuencia: un hello C válido en el emulador no autoriza su ejecución en RW4. Harán falta identificación del firmware real, ISA/ABI, privilegios, APIs, recovery y un plan físico revisado. Preferir una distribución oficial Xiaomi si el origen de un binario comunitario no puede verificarse. No es requisito que la arquitectura del emulador coincida con el SoC físico para que las pruebas de UI sean útiles.
