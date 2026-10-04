# Worker C finito, solo emulador

Tres ciclos desde NSH: crear pthread, parar cooperativamente o completar por límite, hacer join y descargar. Usa atomics32 y un gate de descarga pendiente. No UI, drivers, archivos, Doom ni hardware en el worker.

[ABI, pruebas y alcance](../../docs/native-task-emulator.md).

```powershell
node tools/inspect-task.mjs
node tools/build-task.mjs
node tools/run-task-emulator.mjs
```

Para probar el panel, el guest debe estar activo en Storage. El runner no reinicia automáticamente ni descarga sin done. START/EXIT desde launcher y supervivencia del worker después de retornar init aún pendientes. FLAT no es un sandbox; nunca usar estas direcciones en M2315W1.
