# R238 — diagnóstico de StepC preparado en PC

2026-10-14. StepC mostró EXIT rojo inmediatamente después de START; usuario
confirmó esfera habitual/menús/desplazamiento/pulsación larga normales.
No hay evidencia para atribuir el fallo a C, VFS, firmware o una API concreta.
La UI convirtió varios errores distintos en el mismo rojo y no guardó el motivo.
No se repite el ensayo ni se toca su módulo o marca para averiguarlo.

StepDiag es Lua/imágenes, sin recurso ejecutable nuevo. Incluye los bytes
hexadecimales del ELF anterior **como referencia de comparación**, sin escribirlos
o ejecutarlos. Solo lee los tres archivos conocidos de StepC; hace un lsmod con
captura propia. **No abre el nodo nativo**, no llama callbacks, no carga/descarga
C, no toca archivos antiguos y no intenta recuperar el módulo por su cuenta.

## Diez resultados visibles

| Fila | Verde | Rojo | Gris |
|---|---|---|---|
| PACK | string.pack produce request24 correcto | Falta o prueba falla | Sin ejecutar |
| UNPACK | string.unpack interpreta reply32/signed-error | Falta o prueba falla | Sin ejecutar |
| IO MODE | setvbuf(no) funciona en archivo regular propio | Prueba falla | Sin ejecutar |
| STEP ELF | Archivo anterior coincide byte por byte | Ausente/distinto | Lectura/cierre inciertos |
| STEP MARK | Marca anterior exacta14bytes | Ausente/distinta | Lectura/cierre inciertos |
| OLD CAP | No quedó captura anterior | Captura anterior presente, no se elimina | Estado incierto |
| LSMOD | Formato del inventario reconocido | Shell/texto/formato falla | Consulta omitida |
| C MODULE | Nombre rw4step234 presente | Nombre ausente en catálogo reconocido | Inventario desconocido |
| NO MOD | Catálogo reconocido vacío | Algún módulo presente | Inventario desconocido |
| CLOSE | Cierres y retirada de captura propia confirmados | Fallo o captura propia restante | Sin ejecutar |

PACK/UNPACK son pruebas puras de Lua; IO MODE usa su marca regular propia, no
el driver. C MODULE verde y NO MOD rojo pueden ser un resultado válido: no pedir
«todo verde». El inventario describe el momento del diagnóstico, no el instante
del fallo pasado. Ausencia de módulo tampoco distingue entre preflight fallido,
init rechazado y retirada previa. Persistencia de marca acota la etapa de intento,
sin asegurar resultado del init. No revela el motivo exacto si esa información
ya se perdió. No modifica ni corrige ABI, fingerprints o build por conjetura.

CHECK manual, un intento y marca propia persistente; no consulta shell al abrir.
Captura propia acotada8192bytes y retirada, nunca una previa o ajena. Sin Timer,
objetos de controles mantenidos, cambios de navegación global, C o GC con I/O.

## Validación y paquete

19 casos de Lua de producción pasaron con archivos tmpfs reales, UI/shell
simulados: módulo propio/otro/vacío, ELF/marca ausentes o distintos, captura vieja
conservada, funciones pack/unpack ausentes, setvbuf fallido, cierre incierto sin
consulta shell, header/filas duplicadas inválidos, shell/cleanup/permisos/escritura
fallidos e intento/captura propios preexistentes. Se rechazó todo write a rutas
antiguas y todo comando distinto al lsmod fijo; ningún nodo pudo abrirse.
Inventario real de S3 sin cambios y tmpfs de pruebas retirado. El compilador
rechazó primero glyphs no definidos para cifras/B/Y; las etiquetas usan solo
letras existentes, sin cambiar el font ni assets físicos anteriores.

StepDiag ID365219976,20780bytes, preview tres barras amarillas. Paquete
`artifacts/step-diag-r238/StepDiag-id-only.face` SHA256
`e4d30fa6da8a08164bea262a1d54616447fc81d71ebe4fedfda42aad4914447c`.
Lua11204bytes SHA256
`16f37c1c206e374e7f8fb73fa1bd6bd5ba5563921805f62e7ba044ccc093496b`.
Cuatro recursos con readback exacto; Compiler revisado sin ADB.
Prepare offline11partes, transferencia12casos y sesión/journal35casos pasan.
Gates Node=false/r167/C#=false probados con cero sockets. Helper cerrado actual
SHA256 `e4f5ea512bb55da612a0aedc14cb556a6091d63c96c8372f2f8d7cd044b99973`.
No Bluetooth/USB/consulta o write nuevo en reloj durante esta preparación.

```powershell
node tools/test-step-diagnostic-r238.mjs
node tools/package-step-diagnostic-r238.mjs
node tools/pc-rfcomm.mjs build
node tools/pc-static-watchface.mjs prepare r238
node tools/test-static-watchface-transfer.mjs r238
node tools/test-static-watchface-session.mjs r238
node tools/test-static-watchface-gates.mjs
```

Pruebas y paquete rechazan evidencia existente; no repetir lo ya pasado sin
cambio. Scripts/source y documentación se commitean; binarios/firmware no.
Siguiente checkpoint único: [revisión del diagnóstico físico R239](step-diagnostic-physical-plan-r239.md),
sin repetir C. No está autorizado ni instalado.
