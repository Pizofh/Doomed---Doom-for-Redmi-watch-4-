# Prototipo de controles, solo emulador

Patrón C y consumidor diagnóstico de teclas, sin Doom. Movimiento con zona neutra/diagonales, FIRE mantenido, menú pausado con RESUME/EXIT. HOLD TEST cancela una acción con el contacto todavía activo; es instrumentación para PC. No demuestra pérdida de foco stock con dedo apoyado ni ergonomía física.

Empaquetar con `node tools/package-ui-probe.mjs controls`; requiere el puente propio C revisado y preparado después de cada reset. No usar en M2315W1. [Contrato, fallos, evidencias y reproducción](../../docs/native-controls-emulator.md).
