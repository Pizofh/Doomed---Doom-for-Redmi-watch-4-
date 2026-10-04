# Input consumido por worker C, solo PC/emulador

`main.lua` conserva zonas grandes MOVE/FIRE/MENU; `worker-input.c` consume máscaras desde un ring SPSC32 con cancelación por epoch y produce frames RGB565. No gameplay ni motor Doom. El módulo depende del ELF S3 exacto y comparte su memoria/privilegios FLAT.

[Contrato, pins, resultados, fallo del gesto y reproducción R62](../../docs/native-worker-input-emulator.md).

```powershell
node tools/build-worker-input.mjs
node tools/package-ui-probe.mjs winput
```

Solo build local. Seguir los guards y backups documentados antes de instalar/stage en el emulador. No cargar sobre M2315W1. HOLD TEST/QUEUE TEST son instrumentación del prototipo, no controles finales del juego.
