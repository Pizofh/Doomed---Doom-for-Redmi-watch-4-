# R189 — NativeInfo preparado, envío físico aún sin autorizar

**Resultado R191:** [usuario confirma shell/comandos y retorno normal](native-info-physical-result-r190.md).
No hay autorización para cargar módulos por ese resultado.

**Actualización R190:** usuario autorizó y se realizó un único envío;
[registrada/inactiva con gates cerrados](native-info-physical-result-r190.md).
Selección/inventario visual/retorno pendientes. Texto inferior conserva la
preparación previa; su autorización de envío ya se utilizó.

2026-10-12. [Investigación, fuente y prueba PC R188](native-route-r188.md).
Unidad M2315W1/2.2.86, región no establecida. Lua/Image y retorno habitual
probados físicamente; os.execute/io.open/remove/shell no probados en esta unidad.

## Delta concreto

Nuevo perfilr188/contentKindlua-native-info, ID365219994,12708bytes;
`artifacts/lua-native-info-r188/NativeInfo-id-only.face`, SHA256
`e0fe5fb93311460eb784d44b449613ec0defc20841e061096811b4b42eea9c4d`.
Fuente `experiments/lua-native-info/main.lua`, SHA256
`764d532c6810a51999434c1f7847ec075e5d85c273792ab9b5777a91c7a2f4a7`.
Registro exclusivo `tools/local/pc-rfcomm/lua-native-info-r189.json`.
No reemplaza las cuatro pruebas anteriores ni reutiliza sus registros.

Instala watchface Lua con leyendaPNG propia. **Al seleccionarla** consulta
`help` y `uname -a`; captura stdout en un único archivo propio del directorio
de esta esfera, lee≤8193bytes y trata de retirarlo. Directorio/IDvalidados;
si existe una captura abrible previamente, se detiene sin sobrescribir/borrar.
La captura puede quedar si hay error/reboot; no se limpia a ciegas desde PC.
No llama insmod/rmmod/lsmod/iwasm/exec/loadlib; esos nombres solo se buscan
en la salida. Sin C/ELF/Doom, privilegios nuevos, config o particiones crudas.

## Comandos y secuencia tras revisión

Usuario junto al reloj, navegación normal y batería suficiente; conservar el
vínculo actual. No autoemparejar, cambiar claves o repetir ante error.

| Paso | Comando/acción | Efecto |
|---|---|---|
| PreparePC | `node tools/pc-static-watchface.mjs prepare r188` | Offline, hashes/identidad/build |
| Tras aprobación, un envío | `node tools/pc-static-watchface.mjs install r188` | Gates temporalmente solo r188 y build registrado; auth/info/GETmodeloFW/IDausente/unaactiva,INSTALL4/4,upload22/0tipo16,MASS5. Default7partes2048; noSET |
| Comprobación | `node tools/pc-rfcomm.mjs watchfaces` | GET independiente, propia inactiva/eliminable, anteriores conservadas; gates cerrados |
| Selección una vez | Selector→NativeInfo, previewdosbarras | Lua consulta tipos y ejecuta, si puede, los dos comandos literales con redirección |
| Resultado | Observar once filas y colores | Amarillo=función expuesta;verde=resultado reconocido;rojo=no;gris=desconocido. Ninguna fila prueba ELF compatible |
| Retorno | Ajustes→Esferas→habitual | Comprobar menús/pulsación larga. Si error/vacío, no reabrir; describir estado |
| Retirada opcional solo si se decide después | `node tools/pc-static-watchface.mjs remove r188` | Tras retorno y journalRegistered,solo propia inactiva/eliminable,DELETE4/2/ACK/GET. No limpieza arbitraria de archivos; DELETE físico aún no probado |

Noactivar desdePC ni nuevas coordenadas/touches remotos. Se conserva instalada
si no se decide retirada. No mostrar claves/MAC/serial/raw stdout al usuario
ni subir logs. El usuario comunica solo nombres de filas/colores.

## Escrituras, riesgo y recuperación

| Gate | Evaluación |
|---|---|
| Componentes afectados | Instalador/catálogo stock, Lua/LVGL, shellNuttX y libcfilesystem si están expuestos |
| Escribe persistencia | Sí: instalación/selección/catálogo; además captura stdout y eliminación en directorio propio al ejecutar. No asumir TMPFS/RAM |
| Reversible por reboot | No para instalación/selección/posible captura restante. Retornohabitual y retirada propia son la reversión prevista |
| Particiones crudas/bootloader/recovery | Ningún comando dirigido a ellos; internals del filesystem/servicio stock desconocidos |
| Firmware modificado | No |
| Contexto/privilegios | Desconocidos; shell existente puede tener acceso amplio. No root/exploit solicitado ni módulo propio cargado |
| Peor fallo razonable | Script incompleto, archivo residual, bloqueoUI o reboot; reapertura de esfera problemática |
| Soft brick | No descartado si la UI queda en bucle o no permite retirarla |
| Hard brick | Sin escritura boot/cruda prevista; no garantizar cero riesgo ante bugs |
| Recovery conocido | Ajustes→Esferas funcionó enR179/R182/R187. Gestión stock y reboot documentados; no recuperación integral validada para2.2.86 |
| Backup | Fuentes/paquete/journal/catálogo; no firmware/particiones/datos completos |

**Sin timeout duro del comando en Lua**: número de consultas y lectura están
limitados, su duración no. pcall no protege frente a deadlock/bug nativo. Por
ello observar localmente, sin activar si no se puede intervenir. No repetir
selección o intentar un loader ante bloqueo; detener y revisar. Reboot documentado
no garantiza que deje de seleccionar una esfera persistente problemática.

Referencias: [FAQ gestión RW4](https://www.mi.com/global/support/faq/details/KA-228715/),
[FAQ reinicio RW4](https://www.mi.com/global/support/faq/details/KA-228897/) y
[plan Lua inicial](lua-physical-plan-r178.md). Sin flash/reset/OTA/otrofirmware/
SWD/JTAG/exploit como fallback. Nuevos cambios requieren revisión independiente.

Gates Node/nativo FALSE, REVIEWED_VARIANT=r167. Prepare offline pasó, siete partes;
helper cerrado SHA256 `18c280addbedc5d3bde8fbe36510d1fc253dac2cf2d036d3194ca3297ace38f8`.
Identidad de cinco fuentes C# y ocho módulos verificada. Si se autoriza, habilitar
solo r188 temporalmente, reconstruir/registrar nuevo hash y preparar antes del
único envío. Pruebas cerradas y del perfil pasan; nada enviado al reloj enR188/R189.
