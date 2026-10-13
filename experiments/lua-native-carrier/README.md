# Carrier de ELF, solo empaquetado en PC

R195: [resultado y borrador del primer ensayo C](../../docs/first-c-plan-r195.md).

La build reemplaza `__RW4_ELF_HEX__` por los bytes hex del candidato R194 y
empaqueta main.lua, minimal.elf y un PNG propio. La Lua lee/compara el ELF como
datos; no lo carga. Tres marcadores: lectura amarilla, coincidencia verde y
ejecución deshabilitada roja. No es una prueba de C funcionando en el reloj.

```powershell
node tools/package-lua-minimal.mjs native-carrier
node tools/verify-native-carrier.mjs
```

Construcción/readback completados, paquete12.452bytes. No instalación en reloj
o emulador; perfil físico ausente y gates false. No repetir la build/readback
cuando existen los artefactos; se conservan en artifacts/native-carrier-r195.
No se necesita un ensayo físico aislado de este carrier antes del futuro C.
