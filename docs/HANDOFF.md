# Retomar el proyecto

Estado para continuar el trabajo. El usuario pidió retomar el 2026-10-03.

## Workspace y límites

Repositorio: `C:\Users\steve\Documents\Devs\Doomed\redmi-watch4-doom`.

- Nunca se conectó el Redmi Watch 4 físico M2315W1.
- Sin flash, firmware modificado, bootloader, particiones, root, exploits ni Mi Fitness mod.
- Sin compilación DOOM, WAD, payload C propio ni carga de módulos/WASM.
- Gate físico cerrado en `docs/physical-device-plan.md`.
- MiWatchEmulator es un entorno S3; `uname -a` dice **Xiaomi Watch S3**. No extrapolar a RW4.
- La terminal restringida no accede a GitHub para clones. Navegador/conector GitHub sí permitieron investigación y descarga de seis archivos TouchEvents.
- ExecutionPolicy bloquea `.ps1`; no se cambió. Las herramientas propias Node funcionan.

## Resultados demostrados

1. ZIP original v1.0 revisado y extraído selectivamente. Los 94 EXE/DLL del emulador coinciden con OpenVela SHA `3776c05d2c66f73f6bbe65528cd1a34fe34e1f18`. ADB 35.0.2 está firmado por Google. Hashes en `docs/emulator-package-review.md`.
2. El usuario copió el registro VVD a `C:\Users\steve\.vela\RedmiWatch4.ini`. Las primeras ejecuciones restringidas corrían como `steve\codexsandboxoffline`, con otro UserProfile real; se consiguió arrancar bajo la cuenta normal del usuario. Al retomar, comprobar la cuenta efectiva antes de repetir ese diagnóstico.
3. Arranque real: NuttX `0.0.0`, revisión `9aec7d0ff1`, `Dec 5 2024 07:11:08 arm miwear`. QEMU configura pantalla 390×450, Cortex-A15 y 2048 MB; el ELF contiene macros Goldfish Cortex-A7/FLAT. Nada de esto caracteriza el BES físico.
4. **ADB shell funciona por `emulator-5554`, servidor dedicado 5039.** El reenvío 2512 queda offline; no usarlo como serial. El helper coteja propietarios de puertos 5554/5555/2512/8554 y ruta del QEMU revisado antes de enviar comandos.
5. Inventario de 16 consultas completado. `version` devuelve command not found pese a exit code 0. Usar `uname -a`/getprop/banner. Hay `/dev/fb0`, `/dev/input0`, `/dev/utouch`, FAT `/data`, ROMFS y TMPFS `/tmp`.
6. Umem: 129704956 bytes total, 111706820 libres en primera muestra (~106.5 MiB). `/data`: 126 MiB, ~112.1 MiB disponibles. No sumar pools ni tratar estos números como RAM/storage RW4.
7. Shell anuncia `insmod`, `rmmod`, `lsmod`, `iwasm`, `lua`, `qjs`, `aiotjsc`. `lsmod` no muestra módulos. `exec` es **exec <hex-address>**, no un launcher ELF por filename; no ejecutarlo para explorar.
8. CLI Lua 5.4; `os.execute` y `package.loadlib` tienen tipo function, sin invocarlos. Esto no prueba exposición en watchfaces ni RW4. `require('lvgl')` funciona desde el CLI.
9. TouchEvents original, archivos intactos y verificados, invocado desde `/tmp`: falla en `lvgl.Font("misansw regular",32)`. Copia temporal con esa línea omitida termina sin excepción reportada. **No se instaló una watchface ni se validó touch.**
10. Screenshot PNG real por gRPC 8554, 390×450. Muestra la pantalla stock de almacenamiento, no TouchEvents. Ejecutar el script por CLI no activó una UI visible. Después, no hay tarea Lua persistente y sigue existiendo solo la watchface market original.

## Archivos locales que conservar

Todo lo siguiente está ignorado por Git y no debe publicarse:

- `emulator/MiWatchEmulator.zip` y `emulator/local/reviewed-v1.0/`.
- `emulator/local/run-state/`: copia mutable del guest, separada del ZIP.
- `third_party/miwatch-lua-watchfaces/RedmiWatch4/TouchEvents/`: seis archivos originales.
- `emulator/local/touch-default-font/`: copia experimental privada; fuente original preservada.
- `artifacts/package-review/`: manifiesto, firmas, hashes, inspección ELF/PE.
- `artifacts/emulator/adb/`: inventario, capacidades, propietarios de transportes y comprobaciones posteriores.
- `artifacts/emulator/lua-touch/`: upload/ejecución y traceback de ambas pruebas.
- `artifacts/emulator/screenshots/after-lua-default-font.png` y metadata.
- `artifacts/emulator/user-launch-stdout.txt`: primer boot/cierre, preservado antes de sobrescribir el log de la segunda instancia.

Los scripts `/tmp/rw4-doom-touch-*` son volátiles y pueden desaparecer al cerrar la VM. Los archivos de PC y los commits permanecen. No se probó persistencia de una app propia en `/data`.

## Comandos para continuar

Si el emulador sigue activo, desde la raíz del repo:

```powershell
node tools/emulator-adb.mjs devices
node tools/emulator-adb.mjs connect
```

Si está cerrado, el usuario normal debe ejecutar y dejar abierta su PowerShell:

```powershell
node 'C:\Users\steve\Documents\Devs\Doomed\redmi-watch4-doom\tools\emulator-host.mjs' collect
```

La versión final de `collect` espera el puente 5555 y la disponibilidad de `emulator-5554`; esa recaptura automática actualizada aún no se reprobó. Conexión, inventario y capturas sí se comprobaron por separado en la instancia activa. No repetir inventarios sin necesidad.

Si hay un registro `host-process.json` sin salida registrada, inspeccionar PID y el PID QEMU que aparece en logs/netstat antes de archivarlo. No abrir dos instancias sobre el mismo data image ni matar procesos por nombre global. Las pruebas iniciales terminaron por petición del padre, no por panic observado; no atribuir causalidad a Ctrl+C/EOF sin evidencia.

## Siguiente checkpoint propuesto

**Hello-world C dentro del emulador**, después de fijar contrato ELF, entrypoint/init/uninit, exports, relocations, toolchain y teardown. Existe una ruta razonable por `insmod`, pero ningún módulo propio se ha validado. FLAT comparte memoria: no es sandbox ni userspace aislado. No usar un ELF Linux ARM, llamar direcciones con `exec`, ni elegir toolchain del RW4 a partir de este emulador.

TouchEvents sigue pendiente de activación en el lifecycle correcto de watchface/app, render y input. La inspección de fuente y ejecución CLI no sustituyen esa prueba. No compilar DOOM hasta demostrar ejecución propia, display, timers, input y filesystem.
