# Archivo propio desde C, solo emulador

Initializer finito en NSH: open/read/lseek/close en solo lectura con fixture propio generado por el runner. Verifica lectura completa,41 posiciones, EOF, cuatro errores y reapertura. No WAD, Doom, workers, UI ni persistencia. FLAT no ofrece sandbox.

ABI, pins, resultados y límites: [native-fs-emulator.md](../../docs/native-fs-emulator.md).

```powershell
node tools/inspect-fs.mjs
node tools/build-fs.mjs
node tools/run-fs-emulator.mjs
```

Solo el guest PC revisado. Nunca reutilizar sus símbolos o binario en M2315W1.
