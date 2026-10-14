# R243 — ModInfo2: corrección concreta de la ruta

2026-10-14. Usuario solicitó: «pues corrige eso concreto y mandalo al reloj de
una, te estas demorando mucho». Autoriza el ensayo corregido; no otra función,
carga/retiro C o cambios de firmware. [ModInfo R242 negra](module-registry-physical-result-r242.md),
con retorno/cambio de esfera y menú confirmado. Ruta física real no capturada.

La igualdad exacta antes de UI rechaza `ID//lua/`, variante observada en el
runtime S3 R201 y admitida por adapters anteriores. R243 incorpora el helper
puro R201 ya validado (SHA4edc7473370f3ce624a67df1b5fa77b42ca0bb4e867aca9ad554e0e01558ddbf),
normaliza solo separadores internos tras validar ASCII/ruta/ID y exige después
la raíz propia completa. Usa la ruta canónica para imágenes. No relaja traversal,
metacaracteres, ID ajeno, ruta relativa o prefijo distinto. R241 intacto.

Cambios adicionales limitados al nombre ModInfo2, ID365219974 y marca R243 propia,
sin reemplazar/borrar ModInfo. Lector/hash f5c70fab9a4b3f29435cd2582514268f756d1cf7077b34e626a31dbff9b4c3a5
y tres PNG idénticos a R241. No shell/C/ELF/dev/captura/nuevos comandos.

38casos lector y32UI pasan en Lua real S3/tmpfs con proc/widgets simulados.
Incluye reproducción del assert anterior con ID adaptado solo para aislar el
separador, UI corregida con // y ///, imágenes canónicas y rechazo12rutas inválidas.
Inventario S3 igual antes/después, tmpfs retirado. Primeros fallos fueron del
harness (retorno múltiple gsub en lista y cleanup de marca ausente), corregidos;
logs conservados. Pasada final `artifacts/emulator/registry-r243-checked/`.
No nueva emulación de firmware RW4 ni demostración de causa física exacta.

Paquete16512bytes, `artifacts/registry-r243/ModInfo2-id-only.face`, SHA256
`7c9d38eb641db97c96db35ccd495d1f8b8505db2b4158b91aeddac1ec11dfb25`;
main6703bytes SHA256
`44d0906a031b1a1f8fb927efcb002bdcbddeb1605aaab7896b52272bb835043c`.
Compiler sinADB, cuatro recursos readback exactos. Instalador/protocolo sin
cambios funcionales, perfil fijo nuevo. No se repiten los36casos de sesión
anteriores: cambio de ruta Lua no cambia el transporte. Prepare y cierre de
gates sí se verifican antes/después del envío.

Comandos PC: `node tools/test-registry-r243.mjs`, `node tools/package-registry-r243.mjs`;
rechazan carpetas existentes. [Plan autorizado R244](module-registry-physical-plan-r244.md).
