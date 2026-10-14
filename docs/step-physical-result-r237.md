# R237 — StepC instalada, ejecución manual pendiente

2026-10-14. Usuario autorizó [el plan fijo](step-physical-plan-r237.md):
«Sí, autorizo y puedo observar el reloj». La solicitud incluía batería≥50%;
se registra esa afirmación sin una consulta extra. Un envío y un ciclo manual,
sin reintentos, selección desde PC, retirada del paquete o otro payload.

## Instalación y cierre

StepC ID365219977,31808bytes, paquete SHA256
`5c117cce07ccb5388f0bf0c2345f829827e810daae0db2c32886d9d75a14ed40`.
Fuente y paquete/pins verificados; journal y lock ausentes antes del intento.
Solo perfil r236 y gate C# habilitados temporalmente. Helper autorizado SHA256
`9e726818b32e0ae85b433937cba8eab60b24e80ef9baf583df89a70bd58976c2`.
Copias privadas se conservan como evidencia, no para ejecutarlas después.

**Un** `node tools/pc-static-watchface.mjs install r236` terminó
RegisteredInactive:16partes,31898bytes de stream,32455bytes TX/25frames TX/16RX.
Registro propio eliminable/inactivo y selección previa conservada. Socket y
worker cerrados/exit0, sin error nativo. Preflight exigió modelo/FW2.2.86 y
catálogo propio ausente. transferAcceptanceVerified=false: no afirmar un ACK
final explícito o funcionamiento del módulo a partir del catálogo.

Finally restauró fuentes Node=false/r167 y C#=false; helper cerrado recompilado
SHA256 `982519961fcc293799d9b83771bec38cc898e2ef53a4d95dc1f90711c577bde0`.
Entradas cerradas probadas con cero sockets antes del GET independiente.

Un `node tools/pc-rfcomm.mjs watchfaces` terminó Complete con cierre confirmado.
Comparación contra journal: catálogo16→17, todas las16entradas anteriores
conservan IDs/active/canDelete; solo StepC añadida, inactiva/eliminable. Activa
previa365219979 (HoldPad) conservada; no inferir que sea la esfera habitual.
Segundo socket y worker cerrados. Journal `native-step-r237.json` Registered,
16partes y sin lock. No SET, DELETE, cambio de vínculo, shell o carga de C
desde PC. Firmware, bootloader y particiones sin operaciones solicitadas.

Evidencia privada sanitizada bajo `artifacts/step-r237-authorized-final/`:
autorización, helper/pins, prepare/install, cierre/gates, inventario y comparación.
No claves/direcciones/seriales/logs crudos publicados.

## Incidente previo al envío

La preparación inicial usó por error `authorized-build.json` tanto para stdout
como para copiar metadata. COPYFILE_EXCL rechazó la segunda escritura. Ocurrió
antes de invocar install o Bluetooth; finally cerró gates/reconstruyó/probó
entradas cerradas. No journal/lock ni install-report existían.

Se corrigió el nombre de la copia a `authorized-helper-build.json`; una
continuación específica verificó evidencia de cierre, ausencia de instalación
y el mismo paquete autorizado, en un directorio nuevo. Evidencia inicial
preservada en `artifacts/step-r237-authorized/`. Hubo un único envío físico;
no fue un reintento de transporte ni una modificación del payload.

## Observación pendiente del usuario

Seleccionar StepC, preview cinco barras verdes. Debe aparecer C STEP,
UP/LEFT/RIGHT/FIRE/EXIT, cinco indicadores grises y START. Si no se ve así,
EXIT rojo inicial o falla UI: no START; volver a habitual y describir.

Si está correcta, START una vez. Observar barra de progreso; mantener UP unos4s
y soltar, luego LEFT/RIGHT/FIRE igual. Acción verde durante hold y gris al
soltar; selector no debe abrirse. Tras los cuatro contactos, EXIT una vez y
leer cinco indicadores finales. Si falla alguna acción, detener ese ciclo,
usar EXIT solo si responde y describir; no repetir/reabrir.

Volver a esfera habitual desde zona neutra del launcher o Ajustes→Esferas y
confirmar menús/scroll/pulsación larga. No rearmar marca, borrar/reabrir StepC,
reiniciar o repetir START automáticamente.

Todavía no se observó el runtime: **registro/callbacks/BSS/retirada del módulo
RW4 nuevos y entrada a C no están confirmados**. La instalación no implica que
se haya cargado C; el entry solo prepara UI hasta START manual. Sin métricas,
Doom, sandbox o recovery integral nuevos. Ensayo manual aún pendiente.
