# R239 — StepDiag instalada, CHECK manual pendiente

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

## Observación pendiente

Seleccionar StepDiag, preview tres barras amarillas. Debe mostrar STEP DIAG,
CHECK y diez indicadores grises. Si rojo inicial/falta UI, no CHECK ni repetir;
volver a habitual y describir. No abrir StepC ni ensayos C anteriores.

CHECK una vez; esperar unos segundos y comunicar los colores de PACK, UNPACK,
IO MODE, STEP ELF, STEP MARK, OLD CAP, LSMOD, C MODULE, NO MOD y CLOSE. No se
espera todo verde: C MODULE verde/NO MOD rojo significa un módulo presente,
sin validación de sus callbacks ni autorización para descargarlo.

Volver a habitual desde Ajustes→Esferas o selector; confirmar menús/scroll/
pulsación larga normales. No reabrir/repetir CHECK, borrar marcas/paquetes,
reiniciar o intervenir sobre módulos automáticamente.

Instalación no prueba funciones Lua, contenidos de archivos anteriores o
registro de C: CHECK aún no observado. No nuevo diagnóstico de causa exacta,
watchdog, sandbox o recovery integral demostrado.
