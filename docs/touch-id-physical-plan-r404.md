# R404: TouchID, propuesta manual de identificacion

**Preparado solo en PC. NO AUTORIZADO para enviar o ejecutar.** El usuario pidio
investigar y no ejecutar. Sus posteriores go/ok permiten esta preparacion; no
levantan esa instruccion. No ha habido conexion, consulta BLE ni lectura real.

## Paquete concreto para revisar

| Dato | Valor |
|---|---|
| Esfera separada | TouchID, marco menta y dos circulos |
| ID | 365220404 |
| Archivo local ignorado | build/touch-id-r404/package/TouchID-id-only.face |
| Tamano | 28.348 bytes |
| SHA256 | 1293f339b9188bec946207f1c1e208d0fe212657a5188b25343bd9af861b98b4 |
| Lua SHA256 | b5edcd8c6717e575aa52c75dd6175e6f993769c0479b04627d6f96738a85e701 |
| Firmware revisado | M2315W1 / 2.2.86, AP fijado en R193 |
| Firmware actual | Confirmacion del usuario pendiente; no se consulta el reloj |

No incluye Doom, WAD, partidas, ELF nuevo, driver, hook, acceso I2C ni firmware
de panel/sistema. No modifica la DOOM II aceptada R397014. Hay un despachador
especifico, cerrado antes de leer paquete/target/auth o crear worker/journal
fisico. No se ha habilitado ni usado para enviar.

El paquete SI contiene un boton manual que haria lecturas si alguien lo instalase
y pulsara. Los campos physicalAuthorized=false de los informes son estado de
autorizacion, NO un bloqueo del boton del paquete. No instalarlo fuera de este
protocolo ni describirlo como un payload fisicamente desarmado.

## Comportamiento y validacion local

Seleccionar la esfera solo prepara la UI y sus bitmaps propios. No invoca las
APIs de archivos del diagnostico, shell ni lector de memoria. No hay timer,
autoarranque, reintento, auto-resume o worker propio. Las pruebas no implican
que LVGL no lea sus propios recursos PNG durante la seleccion.

LEER UNA VEZ confirma ausencia de una marca propia, escribe/flush/cierra y
comprueba un token de 25 bytes ANTES de cualquier comando. Si la marca ya existe,
incluso vacia, bloquea el intento y no la borra. Despues emite como maximo nueve
lecturas stock `mw`, cada una alineada a 4 bytes y sin '=' ni cantidad: siete
palabras de codigo/literales, selector y cache solo para Chipone. Captura cada
salida en su propio directorio, valida una linea de <=96 bytes y la retira.
Ante cualquier discrepancia o fallo, se detiene sin ejecutar la lectura siguiente.

La marca persiste incluso tras ERROR, al cambiar de esfera o reabrir la VM.
No se borra ni rearma automaticamente. Resultado en una sola pantalla:
controlador, ID y cache, o ERROR con motivo. Un cache >=2 NO demuestra dos dedos.
No se guardan logs de rendimiento ni copias de words vecinos.

Validacion:

- R403: 62 casos Lua del lector con dependencias simuladas; R402 corregido: 38
  casos del contrato y contraste con AP como datos, todas las direcciones alineadas.
- R404: 30 casos del Lua/UI completo, seleccion sin I/O de identidad, gesto de
  boton, errores de token/lectura/limpieza, reentrada y VM nueva con marca usada.
- Render READY/DONE desde los objetos simulados inspeccionado visualmente en PC.
- Compilador local fijado por SHA, sin ADB en directorio/PATH; 39 recursos
  serializados cotejados byte a byte, SHA de paquete y cambio de solo ID verificados.
- Transporte PC: 13 escenarios del receptor sintetico, envio completo de 14
  partes con cifrado/CRC y registro inactivo; rechazo de firmware/modelo distintos,
  ID ocupado, ACK invalido, corte, activacion indebida o registro no confirmado.
  Journal separado `touch-id-r404.jsonl`, sin reintentos ni reanudacion.
- Regresion del transporte compartido: 23 escenarios existentes y registro/reintento
  unico R397 conservados. Solo simulacion JavaScript, sin ejecutar worker nativo.

Esto NO es una validacion de LVGL/archivos/shell/memoria reales en esta esfera.

## Riesgo que debe revisarse antes de autorizar

Es una observacion mas limitada que cambiar un driver. Aun asi, el comando stock
se ejecuta dentro del sistema: una direccion, mapa, permiso de lectura o contexto
distinto puede causar excepcion o bloqueo, afectar la respuesta de Bluetooth o
requerir reinicio. Ejecutar funciones de una region no demuestra que esta ruta
pueda leer su codigo. Las primeras lecturas ya dependen del mapa; los pins no
son una atestacion integral previa del firmware. Coincidir en version no la sustituye.

No se escriben las direcciones inspeccionadas ni se llama a init/upgrade/reset del
tactil. SI se escribe almacenamiento propio: marca y capturas. No se garantiza
riesgo cero de corrupcion del sistema/almacenamiento. **La recuperacion integral
sigue sin validar; la esfera anterior no es un rollback de firmware.**

La ausencia seguida de creacion/redireccion no es atomica. El guard Lua y token
previenen la repeticion normal/reapertura simuladas, no son un lock entre procesos
o VMs concurrentes. Una interrupcion puede dejar una captura o token parciales;
la respuesta es detenerse, no borrarlos ni volver a probar. `pcall` no cancela una
llamada bloqueada ni recupera un fault nativo. El limite de lectura no limita por
si solo las escrituras del shell ni constituye un watchdog.

## Alcance que se pediria autorizar despues

Antes: confirmar que el reloj sigue en 2.2.86 y revisar explicitamente estos
riesgos. Si la version es otra o desconocida, no enviar ni intentar lecturas.
El transporte acotado de este SHA ya esta probado en simulacion. Su preflight
autenticado verifica modelo/firmware y catalogo ANTES de solicitar instalacion;
rechaza colision del ID, conserva seleccion y miembros existentes y solo acepta
registro final inactivo. No abre el juego ni pulsa LEER desde PC.
No abrir gates antes de una autorizacion explicita de ese alcance concreto.

`node tools/pc-touch-id-r404.mjs plan` y `prepare` son locales; `install` se niega
con `PhysicalGateClosed` antes de target/auth, worker, radio o journal fisico.
No hay opciones de retry/resume. La factoria fija SHA/tamano/ID, y aplica reglas
de payload privilegiado aunque no incluya ELF. Cambiar el paquete invalida el pin.

La propuesta seria UNA instalacion inactiva, sin seleccionar/START desde PC,
y UN ensayo manual observando con bateria >=50%, reloj cerca del PC y Mi Fitness
cerrado durante el envio. Sin borrados, cambios de firmware, reinicio previo,
reenvio, reanudacion ni otro ensayo automatico. Conservar DOOM II y esfera habitual.

Instruccion futura corta, SOLO tras autorizacion e instalacion verificadas:

> TouchID → LEER UNA VEZ. No cambies de esfera mientras lee. Cuando termine,
> dime CONTROLADOR e ID/CACHE, o el motivo de ERROR. No repitas; vuelve a tu esfera.

Si no termina o el reloj deja de responder, detener la prueba y evaluar el estado;
si permite hacerlo, reiniciar normalmente. No restablecer, flashear ni reabrir
TouchID para insistir. No se presupone recuperacion por Bluetooth.

## Estado al cerrar esta preparacion

Preparacion local completa del paquete/UI y transporte cerrado/simulado;
correspondencia del firmware actual, autorizacion e identificacion fisica pendientes. No se
habilito multitactil ni se ha identificado el controlador real. Solo despues de
leerlo y revisar el resultado se decidiria si existe una observacion inferior
viable; no hay autorizacion implicita para escribir un driver o tocar firmware.
