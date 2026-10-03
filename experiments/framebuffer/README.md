# Display C — demostrado en emulador

probe.c consulta el driver sin escribir píxeles. pattern.c muestra barras RGB565 durante una ventana solicitada de ocho segundos, restaura buffers y libera recursos. Patrón, descarga y touch/UI posterior demostrados solo en el guest S3. Framebuffer compartido con stock; no ownership exclusivo ni prueba M2315W1. [Resultados, límites y reproducción](../../docs/native-display-emulator.md).

```powershell
node tools/build-display.mjs probe
node tools/run-display-emulator.mjs probe
node tools/build-display.mjs pattern
node tools/run-display-emulator.mjs pattern
```

Verificar pantalla activa/touch antes; no enviar gestos durante el patrón. No usar con hardware físico.
