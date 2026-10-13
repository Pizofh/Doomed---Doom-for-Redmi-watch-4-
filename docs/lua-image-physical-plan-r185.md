# R185 — ensayo propuesto de LuaImage; gate físico cerrado

2026-10-12. Preparación concreta, **sin autorización de envío todavía**.
[PC/emulador R184](lua-image-r184.md) pasó; esto no valida firmware RW4.
Node `PHYSICAL_WRITES_REVIEWED=false`, `REVIEWED_VARIANT=r167`; nativo
`StaticPhysicalReviewed=false`. No comando nuevo al reloj en R184/R185.

## Paquete y compatibilidad

Unidad M2315W1, firmware 2.2.86; región sin confirmar. Transporte PC/HMAC,
instalación de paquetes 365/Shape34 y ejecución Lua/LVGL Object están demostrados
en esta unidad por R176/R182. La ruta Image procede de un ejemplo etiquetado
RW4; **Image/PNG/SCRIPT_PATH/get_img_size de 2.2.86 todavía sin probar**.

Perfil `r184`, contentKind `lua-image`, ID 365219993, LuaImage, 9328 bytes.
Paquete `artifacts/lua-image-r184/LuaImage-id-only.face`, SHA256
`150f285b7e63cc99519b32cde0b93fe35784cc5ba2d60a5d01746f1064483e49`.
Fuente `experiments/lua-image/main.lua`, SHA256
`df7e732b18955e47d252ea08fe0e9af7b4ed3a526b83ed8dd2ee4846b20c0078`.
Nuevo registro exclusivo `tools/local/pc-rfcomm/lua-image-r185.json`.
No sustituye LuaProbe/LuaDiag/RW4Probe ni modifica sus registros.

Imagen propia 96×64, cuatro cuadrantes y cruz blanca; sin texto/timers/control
interactivo/C/Doom. Usa bindings nativos stock para decodificar un PNG de 194 bytes
del paquete; no shell ni driver propio ni llamadas a boot/config/particiones.
Código en RAM no implica sandbox ni seguridad frente a bugs del runtime.

## Secuencia después de autorización explícita

Usuario junto al reloj para observar e intervenir, esfera/menús normales y
batería suficiente. Conservar vínculo PC actual, sin reenlazados rutinarios.
No usar healthcheck como prueba de pantalla o salida.

| Paso | Comando/acción | Efecto y comprobación |
|---|---|---|
| Preparación | `node tools/pc-static-watchface.mjs prepare r184` | Offline; hashes de paquete/fuente/build. Tras aprobación habilitar únicamente r184 temporalmente y reconstruir el helper |
| Un intento de instalación | `node tools/pc-static-watchface.mjs install r184` | Auth/info/GET; exigir modelo/FW2.2.86, IDausente y unaactiva. INSTALL4/4, upload22/0 tipo16, MASS5; default 5 partes de 2048 bytes. Escritura de archivos/catálogo stock persistentes. No activar automáticamente |
| Inventario | `node tools/pc-rfcomm.mjs watchfaces` | GET independiente, propia inactiva/eliminable y entradas anteriores conservadas. Volver a cerrar gates después del envío |
| Selección manual | Selector stock→LuaImage, preview barra blanca | Seleccionar una vez; observar panel oscuro, marcador amarillo, segundo verde/rojo y **cuatro cuadrantes con cruz**. No contador ni texto esperados |
| Salida manual | Ajustes→Esferas→habitual | Confirmar menús y pulsación larga normales. Si longpress falla, usar Ajustes, ruta ya demostrada; no volver a seleccionar LuaImage |
| Retirada opcional solo si se decide | `node tools/pc-static-watchface.mjs remove r184` | Tras retorno confirmado y propio journalRegistered, exigir propia inactiva/eliminable, DELETE4/2, ACK/GET propiaausente/otraspreservadas. DELETE físico aún no validado; no automático |

Si falla transporte/auth/espacio/parser/dimensiones o UI, parar al primer fallo;
no repetir instalación, cambiar claves o liberar espacio automáticamente. Una
respuesta incierta conserva journal sin limpieza de staging. Frames de 4096 bytes, TX 32 KiB,
chunks 512…4080, supervisor 55/60 s, cierre verificado. No ampliar al ELF de S3.

## Riesgo, respaldo y recuperación

Aplica [modelo detallado R178](lua-physical-plan-r178.md). El delta añade lectura
y decodificación PNG por LVGL y un getter del **objeto propio**; no inspección
de objetos/ancestros del sistema. El tamaño pequeño reduce trabajo pero no
garantiza ausencia de bugs.

| Pregunta | Evaluación |
|---|---|
| Componentes afectados | Servicio stock de instalación/selección de esferas, runtime Lua y decodificador LVGL |
| Escribe almacenamiento persistente | Sí, archivos/catálogo al instalar y selección al activarla; retirar también escribe |
| Reversible solo por reboot | No: instalación/selección persisten. Volver a habitual y retirar propia si se decide |
| Particiones crudas, bootloader, recovery | Ningún comando dirigido a ellos; internals del servicio stock desconocidos |
| Firmware modificado | No |
| Peor fallo razonable | Imagen vacía/error, transferencia parcial, bloqueoUI/reboot o reapertura de esfera problemática |
| Soft brick | No descartado si impide retirada o causa bucle |
| Hard brick | Sin escritura boot/cruda prevista; cero riesgo no demostrado frente a bugs |
| Recuperación conocida | Cambio a habitual por Ajustes funcionó en esta unidad R179/R182; reboot/gestión stock documentados. Sin recuperación integral validada para2.2.86 |
| Backup | Paquete/fuente/registro/catálogo anteriores; no backup integral de firmware/particiones/datos de salud |

FAQs primarias de [gestión de esferas](https://www.mi.com/global/support/faq/details/KA-228715/)
y [reinicio](https://www.mi.com/global/support/faq/details/KA-228897/).
No flash/factoryreset/OTA/otro firmware/exploit/SWD como fallback. No ejecutar
si el usuario no puede observar; revisión obligatoria por nuevo código/ID/hash.
Si se conserva, el archivo permanece instalado y se recarga al seleccionarlo;
no exige mantener Lua cargado continuamente ni reinstalarlo cada vez.

## Verificación offline completada

Las consultas también pasan: 22 sesiones sintéticas, 4 IPC y 6 fallos IPC;
healthcheck con 10 sesiones sintéticas y 1 IPC. Ninguna abrió radio real.

Los cinco perfiles pasan 12 checks de codec/API y 27 escenarios wire/IPC/journal
cada uno. Recibos cruzados y tipos incorrectos rechazados. CLI/nativo cerrados
comprobados, preparación r184 verificada sin radio/credenciales reales.
Helper cerrado SHA256
`7519eebcd7d86d21cb4d78710ddbd7fb2a19add8fd96a6e592cace3f4baf7060`;
hashes de cinco fuentes C# y ocho módulos registrados. Este build es para
Windows, **no C/ELF cargado en el reloj**. Si se habilita tras aprobación,
registrar el nuevo hash y volver a preparar antes de un intento.
