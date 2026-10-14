# R240 — registro de módulos: investigación y lector preparado en PC

2026-10-14. [StepDiag completada](step-diagnostic-physical-result-r239.md):
LSMOD rojo y presencia/ausencia grises; vuelta a esfera habitual, menús,
desplazamiento y pulsación larga normales confirmados por el usuario.
**La causa exacta y la residencia de StepC siguen desconocidas.** Este trabajo
no carga, descarga, llama o abre el nodo del módulo, ni opera el Bluetooth.
No se ha creado, instalado o autorizado un nuevo paquete físico en R240.

## Evidencia primaria local

Imagen privada candidata 2.2.86 de 6636408 bytes, SHA256
`2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db`.
Nunca ejecutada ni modificada. Objdump revisado SHA256
`ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1`.
Los offsets siguientes son de la imagen, no direcciones para ejecutar código.
La coincidencia de versión no demuestra identidad binaria con la unidad física.

`tools/research-rw4-lsmod-r240.mjs` exige esos pins y genera evidencia privada
acotada en `artifacts/research/rw4-lsmod-r240-final/`. Conserva intacta la primera
exploración privada `rw4-lsmod-r240/`. Rechaza sobrescribir resultados existentes.
No se publica firmware o dumps de su código.

| Hallazgo | Rastro en la imagen |
|---|---|
| Comando identificado como lsmod abre `/proc/modules` en modo `r` | Inicio 0x2209b8; literales 0x220b40/44; llamada a fopen 0x2209ce |
| Header se imprime después de abrir, no antes | Rama de fallo 0x2209d4→0x220b1e; salida de header 0x220a02 |
| Separa registros por coma/newline y presenta nueve columnas | Delimitador referenciado en 0x220b74, tokenizaciones desde 0x220a20, salida 0x220af0 |
| Un campo faltante se presenta como texto vacío | Literal vacío 0x220b78 usado como fallback |
| Formato del registro es CSV con newline | Literal 0x65678, referencia 0x1bb90c: `%s,%p,%p,%p,%u,%p,%lu,%p,%lu\n` |
| Formateador recibe tamaño 64 | Función desde 0x1bb88c; `r1=64` en 0x1bb8c2, llamada 0x1bb8c8 |

Campos del registro, por el orden de argumentos rastreados: nombre, INIT,
UNINIT, ARG, NEXPORTS, TEXT, tamaño TEXT, DATA, tamaño DATA. Los campos de puntero
y los enteros decimales tienen tipos diferentes. La tabla mostrada por lsmod
tiene header `NAME INIT UNINIT ARG NEXPORTS TEXT SIZE DATA SIZE`.

**Hipótesis, no diagnóstico:** una fila larga puede exceder ese tamaño y quedar
truncada, faltando campos o el newline. Una fixture con nombre `rw4step234`,
cinco punteros de ocho dígitos y tamaños 972/36 necesita 65 bytes incluido LF,
antes del terminador. La representación real de `%p`, los valores y los bytes
recibidos en R239 no se capturaron; no afirmar que esa fue su causa. El lector
directo podría encontrar la misma limitación: evita la transformación del shell,
no repara el formateador stock.

Otra limitación comprobable del parser R238: aplicaba longitud hexadecimal≤8
a todos los campos, incluidos tamaños decimales de hasta diez dígitos. Esto
rechaza algunos valores u32 válidos, pero tampoco demuestra el motivo observado.
No se ha modificado el payload físico ya ensayado para ocultar ese fallo.

## Lector nuevo, todavía sin UI ni paquete

[registry-r240.lua](../experiments/native-step/registry-r240.lua) solo abre la ruta
fija `/proc/modules` en `rb`; lee≤8193 bytes y comprueba EOF con una lectura de
un byte adicional; exige≤8192 y cierra incluso tras errores de lectura. No
shell, writes, Timer, `/dev`, carga, descarga o llamada a callbacks propios.
No acepta rutas desde el usuario ni devuelve texto/direcciones crudas.

Separa etapas `Open`, `ReadError`/`ReadException`, `Size`/`NotEof`, `Close`,
`Ascii`, `FinalNewline`, `Records`, `Fields`, `Names`, `Pointers`, `Numbers`
y `Complete`. Ausencia/permisos/error de apertura se distinguen. Solo un
registro íntegro permite informar inventario válido/presencia/ausencia. Un
nombre propio visto al principio de una fila incompleta es **una pista**,
no una validación de registro ni autorización de retirada.

Parser: máximo64 filas, nueve campos, nombre acotado y único; punteros u32
hexadecimales con/sin `0x`; NEXPORTS/tamaños u32 decimales hasta4294967295.
Rechaza campos vacíos, duplicados, filas incompletas, formatos de puntero no
reconocidos, overflow, bytes de control y salida NSH en lugar de CSV. No elimina
filas desconocidas para presentar un falso registro vacío. Un archivo abierto,
leído/cerrado correctamente y vacío se clasifica como vacío bajo este contrato;
la equivalencia con el registro físico aún exige observar esa ruta stock.

## Validación reproducible

```powershell
node tools/research-rw4-lsmod-r240.mjs
node tools/test-registry-r240.mjs
```

Ambos comandos rechazan carpetas de resultados ya existentes: no reejecutar
para ampliar evidencia sin una razón y nueva revisión del destino.
El test verifica propiedad del emulador, ADB exacto y endpoint loopback5039 /
emulator-5554. Ejecuta Lua real con fixtures temporales propias. **38 casos
pasaron**: registros vacíos/completos, truncamiento, límites, duplicados,
overflow, acceso denegado, excepciones, errores de lectura/EOF/cierre. Contenido
de `/proc/modules` y fallos I/O simulados; lecturas/cierres de fixtures tmpfs
reales. No equivalencia de kernel/ABI con RW4.

Source SHA256 `dce2b453b8eda83d1a648bc31a5dcce8858655ad00da3d2f45823472efecdc4d`;
harness `0d69944283629bb1e3aebca81b6a1aece99c313a57fdeea64ef8bf00ad52e6c7`.
Inventario real S3 antes/después idéntico, carpeta tmpfs retirada. Sin módulo
nuevo ni operación sobre el RW4. Evidencia privada:
`artifacts/emulator/registry-r240/summary.json` y comandos acotados.

## Siguiente checkpoint y límites

Integrar este lector en una única UI con resultados de acceso, formato,
truncamiento y presencia separados; empaquetar, validar y generar plan/hash
antes de pedir autorización física. No repetir StepDiag o StepC, borrar marcas,
reiniciar o intervenir sobre el módulo desconocido. La revisión inicial del
usuario sigue aplicando a un paquete nuevo.

Leer procfs consulta estructuras stock; no demuestra un sandbox o un timeout
duro y puede fallar/bloquear si el sistema o su metadata están dañados. No hemos
validado recuperación integral de firmware. Un registro reconocido tampoco
demuestra que callbacks, referencias o retirada de StepC sean seguros.
