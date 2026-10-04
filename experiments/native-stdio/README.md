# Stdio de C, solo emulador

Probe finito que usa fopen/fread/fseek/ftell/fclose sobre un fixture propio. Contrasta la secuencia de lectura y longitud del lector WAD de doomgeneric, sin enlazar ni ejecutar el motor. EOF después de seek queda marcado en este guest; relectura y clearerr pasan.

[ABI, resultado y límites](../../docs/native-stdio-emulator.md).

```powershell
node tools/inspect-stdio.mjs
node tools/build-stdio.mjs
node tools/run-stdio-emulator.mjs
```

No usar sus direcciones o binario en M2315W1. FLAT no es un sandbox. WAD, scheduling, persistencia y hardware siguen sin probar.
