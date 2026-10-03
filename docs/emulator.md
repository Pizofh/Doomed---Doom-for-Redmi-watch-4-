# MiWatchEmulator: preparación y resultados

Estado al 2026-10-03: boot, ADB shell e inventario obtenidos. uname identifica **Xiaomi Watch S3**, aunque el preset presente pantalla RW4 390×450. Lua CLI probado; TouchEvents aún no aparece en pantalla ni tiene touch validado. Detalle en [runtime](emulator-runtime.md), [matriz](evidence-matrix.md) y [HANDOFF](HANDOFF.md).

## Paquete utilizado

Release [m0tral/MiWatchEmulator v1.0](https://github.com/m0tral/MiWatchEmulator/releases/tag/v1.0), publicada 2025-02-16; ZIP 733139307 bytes, asset ID 229620973. SHA256 local 4c3fd80c31b0457ba6a179aa79baccd5acaec4aa9f40c170c463fbaca97f0dba; metadata sin digest del mantenedor.

Extracción selectiva a emulator/local/reviewed-v1.0; ZIP preservado. Drivers/flash tools/coredump y presets ajenos excluidos. 94 EXE/DLL coinciden en bytes con OpenVela fijado; ADB x86 firmado por Google, host/QEMU AMD64. Guest ELF32 LE ARM EABI5/hard-float, macros Goldfish Cortex-A7/FLAT. No contrato completo para código propio ni licencia de redistribución del bundle. [Revisión](emulator-package-review.md) y third_party/dependencies.lock.json.

Terminal sin acceso GitHub para clones; navegador/conector permitieron investigación y subset Lua. PowerShell bloqueó .ps1 por ExecutionPolicy; no se cambió. Se usan herramientas propias Node. Los primeros intentos de launcher corrían como codexsandboxoffline con otro perfil; arranque bajo cuenta normal resolvió el registro VVD.

## Arranque y ADB

El usuario copió el INI preparado a C:\\Users\\steve\\.vela\\RedmiWatch4.ini; apunta exactamente al perfil mutable del proyecto. tools/emulator-host.mjs verifica los 94 binarios y utiliza copia del data guest. No ejecutar el CMD original, herramientas flash ni otras imágenes.

Si el guest está cerrado, desde PowerShell de la cuenta con el VVD registrado, dejar abierta la terminal:

```powershell
node 'C:\\Users\\steve\\Documents\\Devs\\Doomed\\redmi-watch4-doom\\tools\\emulator-host.mjs' collect
```

collect espera 5555 y emulator-5554. Su versión actualizada no se volvió a probar desde boot nuevo; las siguientes operaciones sí funcionaron por separado en la segunda instancia:

```powershell
node tools/emulator-adb.mjs connect
node tools/emulator-adb.mjs devices
node tools/emulator-adb.mjs inventory
```

Serial probado **emulator-5554**; NAT 2512 offline. Servidor dedicado 5039, filtro USB, mDNS deshabilitado. El helper coteja listeners loopback, PID y ruta QEMU antes de shell. Nunca selecciona USB ni acepta shell arbitrario. No iniciar dos instancias con el mismo data image. Si hay marker host-process.json antiguo, comprobar launcher/QEMU antes de archivarlo.

Las plantillas scripts/emulator.ps1 no fueron probadas funcionalmente en esta sesión; parser aceptado, política bloquea ejecución. No cambiar política para reproducir los resultados Node.

## Inventario realizado

Allowlist: help, uname, version, ps, free, mount, df, ls /, ls /dev, ls /data, ls /proc, ls /bin, ls /data/app, ls /data/app/watchface, env, getprop. Un comando por llamada, timeout 15 s. version no existe aunque devuelve status 0. Logs JSON en artifacts/emulator/adb/, ignorados.

NuttX S3 0.0.0, revisión 9aec7d0ff1, Dec 5 2024; getprop Emulator-Vela/DEV. Umem total 129704956 bytes, libres 111706820 en primera muestra. /data FAT 126 MiB/~112.1 libres; /tmp TMPFS; recursos ROMFS. /dev/fb0, input0 y utouch listados, sin apertura de drivers. lsmod sin módulos. insmod/rmmod/lsmod anunciados; iwasm/lua/qjs/aiotjsc builtins. exec recibe **dirección hexadecimal**, no filename ELF.

No sumar pools, inferir RAM RW4 o ejecutar loaders para averiguar su ABI. No usar dd del README como inventario: crea un dump guest. FLAT no es sandbox.

## TouchEvents: ejecución CLI, UI pendiente

Sample [5af6e14](https://github.com/m0tral/MiWatchLuaWatchfaces/tree/5af6e14ea92830a394c88dc04f76ceef697a6ded/RedmiWatch4/TouchEvents): seis archivos verificados y conservados en third_party ignorado. No se ejecutó EasyFace ni compiló resource.bin.

tools/try-touch-events.mjs subió tres Lua y cat.png a TMPFS. Original falla en lvgl.Font; variante sin esa línea termina sin excepción. Lua CLI es 5.4 y carga lvgl, pero screenshot real 390×450 muestra UI stock almacenamiento. **Sin watchface instalada ni render/input validado.** No equiparar CLI con lifecycle watchface o con RW4.

Pendiente revisar lifecycle/activación y packer antes de instalar un paquete. El procedimiento upstream modifica /data/app/watchface/market, caché y reboot: no pertenece al inventario read-only y requiere copia del estado guest e ID propio. No copiar automáticamente su rm. Se debe comprobar render, pulsaciones/arrastre/gesto y salida/reentrada sin reboot obligatorio.

Posible siguiente checkpoint C: fijar primero ELF/exports/init/uninit/toolchain/teardown. No compilar DOOM hasta demostrar ejecución, display, timers, input y filesystem. El hardware físico sigue fuera de alcance.
