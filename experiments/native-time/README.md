# Tiempo C, solo emulador

Módulo de prueba finito para la imagen S3 exacta. Lee CLOCK_MONOTONIC257 veces, mide19 esperas relativas y retorna. No crea workers, callbacks, dispositivos ni archivos; no llama LVGL. Se carga desde la tarea NSH, que puede esperar mientras la UI sigue atendiendo eventos.

```powershell
node tools/inspect-time.mjs
node tools/build-time.mjs
node tools/run-time-emulator.mjs
```

El runner requiere Storage365700764, pantalla activa y ningún módulo propio ya cargado. Comprueba panel activo antes de ejecutar C, backup, readback y pins; registra ps/capturas durante la espera y descarga/elimina el ELF tras confirmar retorno. Un timeout del cliente no detiene código guest: no descargar a ciegas.

No usar en el reloj físico ni invocar la espera desde un callback de UI. [ABI, mediciones, intentos fallidos y límites](../../docs/native-time-emulator.md).
