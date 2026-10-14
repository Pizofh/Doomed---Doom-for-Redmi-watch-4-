# R249 — StateRead preparada para el módulo existente

2026-10-14. [StepC observado residente R248](proc-observation-r248.md); usuario
confirmó retorno normal. Preparación PC R249; después [autorizada e instalada
inactiva en R250](state-read-physical-result-r250.md), con lectura manual pendiente. No ELF nuevo,
carga/retirada, comandos STEP/START/STOP o escrituras al nodo nativo.
Aunque contiene Lua/PNG, **sí invocaría C residente** mediante VFS al leerlo.

## Secuencia del carrier

Normalizador R201 fijado, raíz completa365219972/lua. Al abrir solo comprueba
marca propia ausente; no consulta registro o nodo. READ C manual una vez:

1. Escribe/verifica marca propia15bytes `RW4-STATE-R249\n`,
   `state-read-attempt-r249.txt`; persiste y bloquea reentrada/doble click.
2. Lee/cierra `/proc/modules`≤67bytes+EOF; exige la observación propia R248
   (66bytes, campos y offsets) sin inventar DATA SIZE. Lee/cierra solo la marca
   previa `365219977/lua/step-attempt-r234.txt`,≤15bytes; exige14bytes exactos.
   Cualquier fallo/cierre incierto impide abrir el nodo.
3. Una apertura `/dev/rw4step234` **rb**, `setvbuf('no')`, lectura32bytes exactos
   y lectura1byte para EOF (debe retornar nil sin error). Una tentativa explícita
   de cierre, incluso tras errores de buffer/read/EOF. No fallback/reintento.
4. Cierre incierto detiene sin otra consulta. Lectura/EOF fallidos no producen
   snapshot ni consulta posterior. Con I/O/cierre confirmados interpreta frame:
   magic/version, secuencia/fase/controles/pasos/edges/status y límites R235.
5. Vuelve a leer/cerrar registro y exige bytes idénticos al preflight. No
   declara inventario completo o ausencia general de módulos. Muestra snapshot
   exacto32bytes en hex y diez resultados; conserva C cargado.

Open/read/close llaman callbacks del C R234: open cambia refs/cursor, read
copia32bytes y avanza cursor, EOF retorna0, close limpia refs/cursor. **Lectura
del nodo no implica cero escrituras RAM.** No campos de gameplay modificados,
drivers físicos, timers, hilo nuevo, shell o writes persistentes desde C.
Esto aún no se ha demostrado físicamente para esos callbacks.

## UI y semántica

StateRead, **cuatro barras amarillas**, título C STATE, READ C y diez filas:
MARK/REG INFO/OPEN C/READ C/EOF C/FRAME/IDLE/CLOSE C/REG LAST/FINAL.
Inicialmente grises; rojo inicial significa no pulsar. Registro/marca anterior
inválidos detienen antes de C. CLOSE C verde es retorno exitoso de fclose en
este contexto, no medición directa de todos los handles del sistema.

FRAME verde: respuesta de protocolo reconocida. IDLE verde: seq/phase/held/
steps/edges/status todos0. **IDLE amarillo**: frame reconocido, estado distinto
del inicial; no reset/STOP/unload automático. FINAL verde: frame/cierre/registro
posterior reconocidos; no prueba de retirada segura. FRAME HEX da64dígitos
exactos de los32bytes, aun si el frame es inválido pero I/O y cierre pasaron.
No muestra metadata/direcciones del registro. Error de render deja FINAL rojo.

## Paquete y evidencia PC

ID365219972,20536bytes, perfil r249:
`artifacts/state-read-r249/StateRead-id-only.face`, SHA256
`de20e2c8a68d7148cecbb756a0245d6c357eb792cf220e198a276af455db80e9`.
Source SHA73e65d7a693d6449239077da14694a68e10b284845021607e85111b406e0e1e2.
22recursos readback exactos,17glifos PNG ya usados por ProcView, cuatro imágenes
de UI y main.64celdas dinámicas frente a164de ProcView física; sin fonts LVGL.
NativeExecutableIncluded=false **no significa nativeCallbacksRequested=false**.

47casos pasan en Lua real S3, tmpfs real, nodo/registro/widgets simulados:
protocolo y estados, hex exacto, filtros previos a openC, dobles clicks/reentrada,
buffer/read/EOF/cierre fallidos, registro cambiado/desaparecido después, paths
con // o inválidos y render. Un solo open/close explícito modelado; nodo jamás
wb/r+b ni recibe write. Registro real S3 antes/después igual, tmpfs retirada.
Primer run completó los casos pero falló un conteo esperado48por error del
harness: corregido a47, source de producción sin cambios; log preservado.
Resultado final artifacts/emulator/state-read-r249-final/summary.json.
**No ejecutó C RW4 o callbacks reales del nodo S3.**

Compiler revisado sinADB,22recursos verificados. Transfer12casos/prepare11partes
dentro32768 pasan; protocolo de sesión sin cambios, no repetidos36casos previos.
Gates Node/C# cerrados con cero sockets. Helper cerrado SHA
f8ec0ebda8392d3c7f96d81e333ac04f5ed36cf8c7a1367a3c639d857ffbd62c.
Sin Bluetooth/USB/hardware nuevo.

```powershell
node tools/test-state-read-r249.mjs
node tools/package-state-read-r249.mjs
node tools/pc-rfcomm.mjs build
node tools/test-static-watchface-transfer.mjs r249
node tools/test-static-watchface-gates.mjs
node tools/pc-static-watchface.mjs prepare r249
```

Test requiere reconstrucción privada R248; fixtures no se publican. Test/package
rechazan resultados existentes. No CI independiente del emulador/fixtures aquí.
[Plan físico R250](state-read-physical-plan-r250.md). Siguiente después de resultado
y retorno: evaluar retirada controlada con revisión separada, no automáticamente.
