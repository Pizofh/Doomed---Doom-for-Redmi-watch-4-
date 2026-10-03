# Hello C — validado solo en emulador

`hello.c` imprime una línea y devuelve, sin tareas, drivers ni recursos propios. Dos ciclos de insmod/mensaje/rmmod completados en el guest S3 FLAT. El módulo no es userspace aislado. La variante funcional enlaza puts desde el ELF exacto del emulador; no es portable al RW4. [Evidencia, limitaciones y reproducción](../../docs/hello-native-emulator.md).

```powershell
node tools/build-hello.mjs
node tools/run-hello-emulator.mjs bound
```

El payload se usa desde /tmp y se elimina tras descargarlo. Build/carga exigen la imagen y herramientas locales revisadas. No usar estos comandos con hardware físico.
