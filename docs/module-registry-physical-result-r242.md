# R242 — ModInfo negra; retorno a esfera y menús confirmado

2026-10-14. Usuario autorizó el paquete fijo y presencia: «Sí, autorizo y puedo
observar el reloj». Pregunta incluía batería≥50%; afirmación registrada, sin
otra consulta. [Plan aprobado](module-registry-physical-plan-r242.md).
Un envío y selección consumidos; UI esperada no apareció. No repetir
instalación, retirar paquetes, rearmar marcas o intervenir sobre StepC.

## Instalación y verificación

ModInfo365219975,15792bytes, SHA256
`df32945c91dfa484ce573164ee38daf1bdfe6a05aa9a873a7b172fa0e2b56f99`.
Pins/prepare validados antes de enviar; journal/lock ausentes al iniciar.
Runner privado de un intento, fuentes originales guardadas y finally para
restaurar gates. Variante r241 únicamente, gate C# temporal. Helper autorizado
SHA256 `6c66b77a4461801963359042dca33d6905e8ea97cf164083cdcec5e37570e705`;
copias archivadas solo como evidencia, no ejecutar después de este ensayo.

Un `node tools/pc-static-watchface.mjs install r241` terminó RegisteredInactive.
8partes,15850bytes de stream,16285bytes TX,17frames TX/16RX. Modelo/FW2.2.86
exigidos por preflight. Propia entrada registrada/inactiva/eliminable,
selección anterior conservada. Sin SET/DELETE, fallo nativo o reintento.
Socket/worker cerrados, exit0. transferAcceptanceVerified=false: registro en
catálogo no equivale a ACK final explícito ni a ejecución de CHECK.

Finally restauró Node=false/r167 y C#=false, recompiló helper cerrado SHA256
`c9af7995a379ebd80aae1699170f0bc134891b3de9ae23f348cc7deacab38657`.
Pruebas de entradas cerradas pasaron con cero sockets.

Un GET independiente `node tools/pc-rfcomm.mjs watchfaces` terminó Complete.
Catálogo14→15: todas las entradas del preflight conservan IDs/active/canDelete;
solo ModInfo nueva/inactiva/eliminable. Activa365210175 intacta. Journal
`module-registry-r242.json` Registered,8partes, sin lock. Segundo socket/worker
cerrados/exit0, sin error nativo. No archivo de metadata o shell leído desde PC,
carga/retiro C, modificación firmware/particiones o cambio de vínculo.

Evidencia privada `artifacts/module-registry-r242-authorized/`: aprobación/pins,
prepare/install, helpers/fuentes, cierre/gates, GET/comparación. No claves,
direcciones de dispositivo, seriales o logs crudos publicados.

## Observación completada con fallo de UI

Usuario: «no se ve nada :( se ve negro pero pues si puedo volver a mi otra
corona y abrir menu». Cambio a otra esfera y apertura de menú confirmados;
desplazamiento/pulsación larga no se preguntaron de nuevo. No hay indicadores,
confirmación de CHECK, marca o lectura procfs. Residencia de StepC desconocida.
Pantalla negra no es prueba de que C falló o que el registro está vacío.

Revisión en PC encontró `assert(SCRIPT_PATH==own)` antes de crear la UI. La
[observación S3 R201](first-c-path-r201.md) ya mostraba `ID//lua/`; el nuevo
test UI R241 solo suministraba la forma canónica. La igualdad exacta rechaza
esa variante admitida por el runtime y puede abortar sin dibujar. La ruta
real de esta selección RW4 no se capturó, así que es un defecto reproducible
y una explicación probable, no causa física demostrada.

No reabrir/repetir ModInfo o StepC, borrar marcas, reiniciar o actuar sobre
módulos automáticamente. Ensayo consumido; corrección requiere paquete/plan
distintos y nueva revisión. No hay diagnóstico nuevo de sandbox o safe-unload.
