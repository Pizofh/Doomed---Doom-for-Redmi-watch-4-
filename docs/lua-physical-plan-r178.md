# R178 — ensayo revisable de LuaProbe en M2315W1

2026-10-12. Preparado y probado **solo en PC**. El «ok» del usuario autorizó
preparar este paso; **no se ha autorizado ni ejecutado el envío físico de Lua**.
Gates Node/nativo cerrados. No Bluetooth, teléfono, ADB o reloj utilizados aquí.

## Unidad y compatibilidad disponible

Unidad del usuario M2315W1, firmware reportado2.2.86. Región y nombre/versionado
exacto de HyperOS/Vela del reloj sin confirmar. Teléfono Android16/API36,
HyperOS3.0.302.0 y Mi Fitness3.59.1i según datos previos. Se conservó el registro
de Mi Fitness; transporte Windows autenticado V1/HMAC/cifrado demostrado.
Estado del vínculo actual se verificará en la sesión, no se asume eterno.

[R176](static-space-trial-r176.md) instaló una imagen propia con firmware stock;
el usuario confirmó render, retorno a su esfera y funcionamiento normal.
Eso valida la ruta de instalación de una esfera en esta unidad, **no Lua**.
La muestra [TouchEvents etiquetada RW4 por su autor](https://github.com/m0tral/MiWatchLuaWatchfaces/tree/5af6e14ea92830a394c88dc04f76ceef697a6ded/RedmiWatch4/TouchEvents)
usa require lvgl y labels/fuentes. Es evidencia de muestra comunitaria,
no prueba de estos timers/hooks en 2.2.86 ni documentación exacta de privilegios.

[R177](lua-minimal-r177.md) validó el mismo candidato en MiWatchEmulator v1.0,
guest Xiaomi Watch S3: render, fuente extraída exacta, contador1…10,
pause/resume por panel y cierre Lua al cambiar a Storage. Emulador S3 **no**
emula de forma exacta BES2700iBP/firmware del RW4.

## Paquete y código exactos

| Campo | Valor fijo |
|---|---|
| Perfil CLI | r177, contentKind lua-minimal |
| Archivo | artifacts/lua-minimal-r177/LuaProbe-id-only.face |
| ID | 365219991; se comprobará ausencia mediante GET fresco |
| Tamaño | 19796 bytes |
| SHA256 paquete | a40c85607a8c208823f2dd6064ebca3c907a850e9a392c0b3eb0d718d3c9490a |
| Fuente | experiments/lua-minimal/main.lua |
| SHA256 fuente | e871590b80c50f2981ea8a8a796e3b0ca2f84977e7aa9a4e9fa32be7a608749d |
| Registro privado nuevo | tools/local/pc-rfcomm/lua-minimal-r178.json |
| Formato | Perfil365/Shape34/390×450, byte5=0 conservado |

El script muestra tres labels, solicita diez actualizaciones de un timer a
1000ms y lo pausa al terminar. Hooks de ocultación pausan/reanudan si queda
presupuesto. No captura touch ni bloquea gestos stock. No shell, filesystem,
ELF, drivers/sensores, módulos o Doom. Sí llama a los bindings LVGL nativos
del firmware: ejecutar un script no equivale a aislamiento perfecto.
Los privilegios del runtime físico y el contrato de estos hooks siguen sin
demostrar. No se interpreta este paso como ejecución de C propio.

El perfil permite únicamente este hash/ID/tamaño. Prepare verifica también
el SHA de la fuente y que esté completa en el paquete. `contentKind` distingue
Lua de las imágenes estáticas en plan/reporte/registro. Un recibo o journal
de r167/r173 no sirve para r177 ni permite borrar esas otras esferas.
Los nombres internos StaticWatchface/StaticJournal son históricos del
protocolo de transferencia; no afirman que este paquete carezca de scripts.

## Secuencia propuesta después de autorización explícita

Usuario junto al reloj, cargado/encendido, UI normal y esfera habitual
identificable. Mantener el bloque con Windows sin cambiar teléfono/vínculo
entre pasos. Si el vínculo o auth falla, detener; no reenlazar automáticamente.
No cambiar claves, reinstalar Mi Fitness ni borrar su registro como fallback.

| Paso | Comando/acción exacta | Componente y persistencia |
|---|---|---|
| Preparación offline | node tools/pc-static-watchface.mjs prepare r177 | PC: verifica hash/fuente/build y registro previsto; no Bluetooth |
| Revisión/habilitación | Tras autorización, fijar REVIEWED_VARIANT=r177 y abrir temporalmente ambos gates; reconstruir y registrar nuevo hash | Solo código/build PC; todavía no comando al reloj |
| Única instalación | node tools/pc-static-watchface.mjs install r177 | Auth V1/info2/2/GET4/0, exige modelo reconocido/FW2.2.86, catálogo íntegro, una activa e ID ausente. Registra intención antes de INSTALL4/4. Upload22/0 tipo16 y MASS5, hasta32KiB TX. Escribe esfera y catálogo persistentes mediante servicio stock. Sin SET automático |
| Catálogo posterior | node tools/pc-rfcomm.mjs watchfaces | GET sin archivos. Confirmar ID propio inactivo/eliminable y entradas anteriores presentes; guardar resumen sin publicar catálogo privado |
| Primera observación | Abrir selector del reloj sin elegir todavía LuaProbe | Comprobar que existen esfera habitual y LuaProbe, UI responde |
| Ejecutar Lua | Seleccionar LuaProbe manualmente | Selección puede persistir. Esperar RW4 LUA PROBE y Updates10/10. No bucle de pruebas repetidas si falla |
| Ciclo de visibilidad | Abrir/cerrar un panel stock si la UI funciona | Comprobar navegación y continuidad, sin cambiar ajustes. No promete hooks idénticos a S3 |
| Salida | Selector stock→esfera habitual; abrir un menú conocido | Usuario confirma retorno normal. No apagar/reiniciar si funciona |
| Retirada propia opcional dentro del ensayo autorizado | node tools/pc-static-watchface.mjs remove r177 | Solo tras confirmación del retorno: journal Registered, hash/perfil/target correctos, GET propio inactivo/eliminable, DELETE4/2 propio, ACK1 y GET desaparición/otros IDs conservados. Escribe catálogo/almacenamiento. DELETE aún no validado físicamente en esta unidad |
| Cierre | Cerrar ambos gates/reconstruir después de cada operación de escritura | PC: evita nueva escritura involuntaria. Mantener vínculo del bloque; Mi Fitness se recupera al terminar por flujo ya probado si se desea |

La autorización solicitada puede cubrir instalación, selección manual,
retorno y retirada propia: no exige volver a pedir permiso para ese mismo
alcance, pero la retirada espera confirmación del retorno antes de conectar.
Si se decide conservar la esfera, queda almacenada sin necesidad de reinstalar
desde PC para seleccionarla. Mantener el archivo instalado no implica mantener
la VM o el contador ejecutándose continuamente en RAM.

Si INSTALL vuelve a devolver3, se documenta el aviso de almacenamiento
verificado en Mi Fitness y se detiene antes de subir el archivo. No borrar
otras esferas ni reintentar automáticamente. Resume no cero, chunk fuera de
512…4080, respuestas desconocidas, cambio de firmware o cierre incierto
detienen la sesión. Default2048: diez partes. Chunk4096 se rechaza por límite
de frame, sin reajustarlo. Una intención/transferencia parcial queda incierta;
no se elimina staging desconocido ni se reutiliza ese registro para repetir.
Presencia en catálogo y callbacks de envío no prueban render.

## Backup y reversión

Se conserva paquete/fuente/hash, registro previo a INSTALL y catálogo inicial
privado. No es backup de firmware ni de otras esferas. Datos sincronizados
por Mi Fitness no garantizan copia completa del reloj; no publicar logs/claves,
MAC/serial, APK propietario, firmware o dumps. Firmware oficial completo y
método de restauración para2.2.86 no han sido validados.

Si la UI responde: volver a esfera conocida y retirar únicamente LuaProbe
por operación propia revisada o gestión stock disponible. Xiaomi documenta
[cambio/eliminación de esferas y fallos por archivos de esfera](https://www.mi.com/global/support/faq/details/KA-228715/).
Si se bloquea: su [FAQ de reinicio RW4](https://www.mi.com/global/support/faq/details/KA-228897/)
documenta mantener botón de encendido unos12segundos. No prueba que este
paquete no se reabra tras reboot ni que resuelva un bucle de arranque.
No factory reset, OTA, flash, bootloader, SWD/JTAG o exploit como alternativa
automática. Si la gestión stock/reboot no resuelve, detener y revisar opciones.

| Gate | Resultado del ensayo propuesto |
|---|---|
| ¿Reversible solo por reboot? | No: archivo y selección persisten; reboot puede detener la VM pero no desinstala |
| ¿Escribe flash/almacenamiento persistente? | Sí, instalación/selección/retirada mediante servicio stock |
| ¿Escribe particiones crudas? | No se envía ningún comando para ello; mapeo interno del servicio desconocido |
| ¿Toca bootloader/recovery? | No comandos para esos componentes |
| ¿Requiere firmware modificado? | No |
| Riesgo esperado | Superior a imagen estática: añade runtime/bindings/timer. Sin porcentaje fiable |
| Peor fallo razonable | Esfera en blanco, bloqueo de UI, reboot o persistencia de esfera problemática; posible transferencia parcial |
| Soft brick | No descartado si impide usar UI para retirarla o causa bucle de arranque |
| Hard brick | Sin escritura de boot o flash crudo prevista; cero riesgo no demostrable ante bugs desconocidos |
| Recovery conocido | Gestión stock y reboot documentados, no recovery integral2.2.86 validado |

## Validación PC realizada

Tres perfiles pasan12escenarios de codec/API y25 de wire/IPC/journal cada uno:
stream/MD5/CRC, framing/cifrado, límites/chunks, rechazo de firmware/modelo,
colisión, HMAC/ack, transferencia incompleta, cierre y persistencia/reapertura
del recibo. Recibos de cada par de perfiles cruzados rechazados antes de
abrir link. Journal de Lua mal etiquetado o sin contentKind se rechaza;
los antiguos de imagen sin ese campo siguen legibles, sin reescritura.
Estado3 conserva interpretación conocida y no envía partes en tests.

Worker propio258assertions offline; gates Node/install/remove de los tres
perfiles y entrada nativa comprobados cerrados. Regresión consultas:
22sesiones sintéticas,4IPC,6fallos; healthcheck10sintéticas+1IPC incluye el ID
Lua sin afirmar UI/render. CI offline comprueba ahora también el gate Lua;
no se ejecutó CI remoto ni hay conexión/artefactos privados en ese workflow.

Build PC cerrado SHA256:
`78e03bb41a151961832e03f05920df3f2dcc5947253995ab51d749d30a486a0b`.
Prepare R178 confirma paquete/build/fuente, diez partes y PhysicalGateClosed.
Un build habilitado tras autorización tendría un hash distinto que se
registraría antes del intento. No ejecutar este plan todavía.

**Siguiente checkpoint:** autorización concreta y observación del ensayo
Lua físico. No avanzar a C, ELF, insmod, WASM o Doom por esa autorización.
