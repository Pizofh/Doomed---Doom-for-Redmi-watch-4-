# R239 — StepDiag observada; inventario de módulos sin determinar

2026-10-14. Usuario autorizó [el ensayo fijo](step-diagnostic-physical-plan-r239.md):
«Sí, autorizo y puedo observar el reloj». Solicitud incluía batería≥50%; se
registra su afirmación, sin consulta adicional. Un envío y CHECK manual único,
sin autoactivación, reintento, retirada de paquete u operación de módulos C.

## Instalación y cierre

StepDiag365219976,20780bytes, paquete SHA256
`e4d30fa6da8a08164bea262a1d54616447fc81d71ebe4fedfda42aad4914447c`.
Paquete/fuente/pins verificados; journal y lock ausentes al iniciar. Solo r238
y gate C# habilitados temporalmente. Helper autorizado SHA256
`3f317f35b1981cbb399bf9e227db802ba36f8edc0427bc2231c4236ec6104726`.
Copias privadas archivadas para evidencia, no para ejecutarlas después.

Un `node tools/pc-static-watchface.mjs install r238` terminó RegisteredInactive:
11partes,20850bytes de stream,21332bytes TX/20frames TX/16RX. Entrada propia
registrada/inactiva/eliminable, selección previa conservada. Preflight modelo/
FW2.2.86 exigidos. Socket/worker cerrados y exit0, sin error nativo.
transferAcceptanceVerified=false: catálogo no prueba un ACK final explícito
o funcionamiento de CHECK.

Finally restauró fuentes Node=false/r167 y C#=false, recompiló helper cerrado
SHA256 `9ec4971116e0bc8b1ca6ab21fb0f0edc0bab05050f25c73005aac0eb5bf61228`.
Entradas cerradas probadas con cero sockets antes del GET independiente.

Un `node tools/pc-rfcomm.mjs watchfaces` GET terminó Complete/cierre confirmado.
Catálogo13→14: las13entradas del preflight conservaron IDs/active/canDelete,
solo StepDiag añadida/inactiva/eliminable. Activa365210175 intacta; StepC365219977
sigue presente. Había17esferas al terminar R237 y13antes de este envío: ese
cambio ocurrió antes del intento actual, causa no investigada ni atribuida.
La comparación de este ensayo usa su preflight13, no el catálogo anterior17.
No hubo DELETE ni selección desde PC. Segundo socket/worker cerrados/exit0.
Journal `step-diagnostic-r239.json` Registered,11partes y sin lock.

Evidencia privada sanitizada: `artifacts/step-diag-r239-authorized/`, autorización,
pins/helpers, prepare/install, cierre/gates, inventario y comparación. Ninguna
clave/dirección/serial/log crudo publicado. Sin shell/lectura de archivos del
reloj o carga/retirada C desde PC en este envío. Estado de C de R237 aún desconocido.

## Observación completada

Usuario: «todas verdes menos ls mod que quedó rojo. no mod y c module quedaron
grises, de resto todos verdes». Después confirmó retorno a la esfera habitual,
menús, desplazamiento y pulsación larga normales: «si, todo normal».

| Fila | Observado | Alcance de la comprobación |
|---|---|---|
| PACK | Verde | Fixture Lua de solicitud de 24 bytes |
| UNPACK | Verde | Fixture de respuesta de 32 bytes, incluido entero negativo |
| IO MODE | Verde | Lectura sin buffering de la marca regular propia |
| STEP ELF | Verde | Archivo anterior coincide exactamente con ELF aprobado de 2620 bytes |
| STEP MARK | Verde | Existe la marca exacta de 14 bytes del intento StepC |
| OLD CAP | Verde | Captura anterior ausente según la lectura |
| LSMOD | Rojo | Consulta/captura/formato completo no reconocido; no distingue el motivo |
| C MODULE | Gris | Presencia del módulo propio desconocida |
| NO MOD | Gris | Registro vacío no demostrado |
| CLOSE | Verde | Cierres y retirada/ausencia de captura propia confirmados por el script |

La marca se escribe después del preflight inicial de StepC. Por el orden del
código aprobado, es una **inferencia** que START avanzó más allá de ese preflight;
no demuestra que la inicialización C, el nodo o la retirada funcionaran.
El resultado rojo combina errores de shell, lectura, límites y parser: no
permite atribuir el fallo a ninguno de ellos. Un módulo puede seguir residente.

Ensayo consumido. No reabrir/rearmar StepDiag o StepC, cargar otro C, abrir su
nodo o descargar módulos automáticamente. El siguiente trabajo es en PC:
[examinar el formateador y preparar una lectura del registro](module-registry-r240.md).
No causa exacta, sandbox, watchdog o recuperación integral nuevos demostrados.
