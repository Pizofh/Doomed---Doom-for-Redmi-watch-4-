# Lua shell — emulador confirmado, gate físico cerrado

Experimento separado de TouchEvents original. Desde UIProbe en el guest S3 se ejecutó primero `os.execute("uname -a")`: true/exit/0. Después se cargó/descargó exclusivamente el módulo C propio con comandos fijos, sin exploits ni persistencia nativa. El código y resultados están en [lua-native-bridge](../lua-native-bridge/control.lua) y [su documentación](../../docs/lua-native-bridge-emulator.md). No hay prueba de os.execute en M2315W1. No ampliar esta evidencia a comandos arbitrarios ni a dispositivos físicos.
