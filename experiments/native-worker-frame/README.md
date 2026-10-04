# Frames desde un worker C: emulador solamente

`worker-frame.c` produce patrones RGB565320×140 en dos buffers con ownership atómico. `main.lua` copia frames a dos archivos tmpfs y los presenta en LVGL desde UI. START, pausa, EXIT y cierre/reentrada fueron validados en el guest S3 exacto; no es Doom ni un módulo portable al RW4.

[Contrato, pins, resultados, fallos y reproducción R61](../../docs/native-worker-frame-emulator.md).

```powershell
node tools/build-worker-frame.mjs
node tools/package-ui-probe.mjs wframe
```

Estos comandos solo construyen artefactos locales. Instalación/staging requieren las comprobaciones documentadas del emulador. No cargar este módulo sobre hardware físico: comparte memoria/privilegios del guest FLAT y depende de su imagen exacta.
