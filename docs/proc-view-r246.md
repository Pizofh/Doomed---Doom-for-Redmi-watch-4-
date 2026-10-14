# R246 — ProcView: vista acotada del registro, preparada en PC

**Actualización R247:** paquete posteriormente autorizado e instalado inactivo;
[lectura manual pendiente](proc-view-physical-result-r247.md). Lo siguiente
documenta la preparación previa al envío.

2026-10-14. ModInfo2 abrió/leyó/cerró; END LINE/FINAL rojos, retorno de esfera y
menú confirmado. [R245](module-registry-result-r245.md). No interpretar el registro
como vacío ni repetir StepC. ProcView todavía **no autorizado ni enviado**.

## Comportamiento

Lua/PNG, sin C/ELF/shell/dev/Timer/carga/retirada. Normalizador R201 fijado y raíz
completa ID365219973. Al abrir no consulta procfs. CHECK manual crea/verifica
marca propia17bytes `RW4-PROC-VIEW246\n`, `proc-view-attempt-r246.txt`, que persiste.
Reentrada, marca desconocida/existente y doble click no repiten la consulta.

Abre únicamente `/proc/modules` rb, lee≤8193bytes y un byte para confirmar EOF,
exige≤8192; cierra incluso tras fallo de lectura. Con éxito retiene en RAM solo
longitud, primeros64bytes y últimos16bytes. No guarda tabla, captura, PNG nuevo
o direcciones en archivos del reloj. Sin interpretación de módulos o permisos
de retirada; esto obtiene evidencia que los indicadores previos no daban.

La pantalla muestra cuatro filas MARK/OPEN/READ/CLOSE y **LEN HEX** (longitud
hexadecimal, cuatro dígitos). **HEAD TEXT** presenta el inicio, convirtiendo
minúsculas a mayúsculas, LF a `>`, CR a `<` y otros caracteres no representables
a `?`. **TAIL HEX** muestra exactamente los últimos16bytes, dos dígitos por byte.
MODE alterna HEAD TEXT/HEAD HEX sobre **la misma copia**, sin I/O adicional.
HEAD HEX es exacto, incluidos NUL y otros bytes no imprimibles; TEXT es una
ayuda de lectura, no captura literal. Tamaño>64significa inicio incompleto, y
HEAD/TAIL pueden solaparse. No unirlos ni inferir ausencia de módulos intermedios.

No consultas al seleccionar/desde GC. Cierre fallido o lectura inválida impiden
mostrar snapshot y activar MODE. CLOSE rojo también puede señalar un fallo de
render, conservadoramente: no usarlo como certificado aislado de cierre fallido.
Marcas/archivos anteriores permanecen intactos. No cambia flags globales de UI.

## Paquete y validación

ProcView ID365219973,21836bytes, perfil r246, preview **tres barras azules**,
título PROC DATA. `artifacts/proc-view-r246/ProcView-id-only.face`, SHA256
`07527d9a79a8d24d7e761db65c73198f93f3265da2304963b95bbc916d85b75a`.
Source SHA256 `5db8d5670f96ef1940c7d60f011a8015d0eb7a6182731b98dcb786f467c6b209`.
51recursos readback exactos;42glifos PNG originales y ocho imágenes de UI, más
main.lua. No fuente LVGL del sistema o binarios externos añadidos.

22casos en Lua real S3/tmpfs pasan, widgets/proc/fallos simulados: bytes truncados,
LF/CR, vacío, lectura máxima, todos los valores0..255 en fixture, hex exacto,
20cambios MODE sin consultas adicionales, repetición/reentrada bloqueadas,
ruta con //, rutas ajenas/metacaracteres rechazadas, errores de lectura/cierre/
acceso y render. Inventario S3 antes/después idéntico; tmpfs retirada. Primer
intento detectó `end` extra en la función quiet, corregido; log conservado.
Resultado final `artifacts/emulator/proc-view-r246-final/summary.json`.

Dos previews compuestos con PNGs exactos y datos **sintéticos**, a390×450,
revisados visualmente. No son renders de LVGL real. La UI usa164celdas de imagen
más leyendas/botones; capacidad/rendimiento de ese número en RW4 aún no probado.
No afirmar equivalencia 1:1 del emulador con firmware/SoC M2315W1.

Compiler revisado sinADB, readback51recursos correcto. Transfer12casos PC pasan;
protocolo de sesión no cambió y no se repiten sus36casos anteriores. Prepare
11partes en presupuesto32768, gates Node/C# cerrados probados con cero sockets.
Helper cerrado SHA3e1d6e4a9105d916c630557d08d4954e61203163450e2a3e667ab43c705f518f.
Sin Bluetooth/USB/reloj físico en R246.

```powershell
node tools/test-proc-view-r246.mjs
node tools/package-proc-view-r246.mjs
node tools/preview-proc-view-r246.mjs
node tools/pc-rfcomm.mjs build
node tools/test-static-watchface-transfer.mjs r246
node tools/test-static-watchface-gates.mjs
node tools/pc-static-watchface.mjs prepare r246
```

Tests/package/preview rechazan resultados existentes. Evidencia y assets privados
ignorados por Git; scripts/fuentes propios públicos. [Plan físico R247](proc-view-physical-plan-r247.md).
