# Launcher / worker C, solo PC

R60: START crea un pthread detached desde Lua/UI; EXIT pide stop y el Timer verifica reason + PID ausente antes de descargar. El worker no llama LVGL; la UI no duerme ni hace join. Sin Doom ni acceso físico.

Fuentes `launcher.c` y `main.lua`; build, ABI, pins, fallo de caché corregido y resultados en [native-launcher-emulator.md](../../docs/native-launcher-emulator.md). El cierre de Lua puede conservar el módulo hasta reentrada; no descargar código por observar solo una bandera.
