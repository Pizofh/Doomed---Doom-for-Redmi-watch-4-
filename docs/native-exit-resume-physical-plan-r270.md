# R269/R270 — completar el único tramo pendiente de ExitC

**R270 autorizado y ejecutado: ExitC registrada e inactiva. Ensayo manual completado: diez verdes y retorno normal.** R268 recibió
resumePosition22462/chunk2048/MD5matching del propio RW4. Nuestro guard resume0
detuvo la operación antes de enviar datos. No es evidencia de un nuevo error
del paquete o de que las pausas fallaron: no se llegaron a usar.

## Evidencia y contrato

Archivo idéntico24348bytes, ID365219964, SHA256
`8c69e4003c1caef9eed58902cfc5d45112d5b9cf21f7ccdab8c1b379284da3e8`.
Lua/PNG/Código de ExitC y ensayo manual no cambian. No nuevo ELF/firmware.
Offset22462=(2048-4)×11-22 coincide con el prefijo de datos de11partes. Es
compatible con recepción parcial; no prueba contenido del prefijo ni causa
del fallo final. Restan1886bytes del archivo.

Fuente primaria local revisada: Gadgetbridge253, archivo original fijado
SHA700b2364858e6d26c4446c277d5c89ec7cba795d857d90a7a8d68533c1a69cb1,
`XiaomiDataUploadService.java`/doUpload(type,bytes,resumePosition). Construye
header0/type16/MD5delarchivoCOMPLETO/tamañoCOMPLETO, después el suffix desde el
offset, y CRC32 de ese nuevo stream. Numera sus partes otra vez desde1.
No se está ejecutando el Java descargado ni cambiando un firmware.

Perfil nuevo y cerrado `exit-resume-r270`, solo variante r265/archivo24348bytes,
**solo offset exacto22462 y chunk2048**. ACK remoto actual debe volver a declarar
ese offset y MD5presente/coincidente. Si cambia a0/otro offset/otro tamaño o
MD5ausente/distinto, aborta antes de MASS; no volver desde0 o elegir otro offset.

Stream de reanudación: header22+datos1886+CRC4=1912bytes; contador de partes4→
una parte1916bytes con total1/index1; CCMtag4+framing11→paquete1931bytes.
Espera1000ms después antes del GET habitual. No retransmisión automática.
No se pide al usuario reenviar todo, borrar parciales o cambiar ID.

La ruta antigua default y el perfil pausado siguen rechazando cualquier
resume≠0. Nueva acción explícita `install-resume-once r265`, gate separado
`REVIEWED_EXIT_RESUME=false`. Valida ambos journals anteriores del mismo
target/ID/hash: R266Uncertain12 y R268Uncertain0/previousInstallAck; no los
modifica. Journal nuevo `native-exit-r270-resume.json` fresco/sinlock.

23casos con cliente real/enlace e IPC sintéticos: reconstrucción prefijo+
suffix idéntica al archivo, CRC/MD5/tamaño completo/numeración1/1; offsets
inesperados, MD5ausente/distinto, chunkdistinto, ámbito erróneo y perfiles viejos
rechazados antes de datos. Prefijo corrupto del peer no se declara instalado
solo por terminar el envío.15casos pausado y47protocolo regresan correctamente;
sin radio.68pruebas Lua y C S3 anteriores no repetidas. Esto no valida el
receptor físico de resume ni la integridad real de su almacenamiento pendiente.

```powershell
node tools/test-exit-resume-r269.mjs
node tools/test-exit-paced-transfer-r267.mjs
node tools/test-static-watchface-session.mjs r265
node tools/pc-rfcomm.mjs build
node tools/test-static-watchface-gates.mjs
node tools/pc-static-watchface.mjs prepare-resume-once r265
```

Gates/prepare pasan sin sockets. Helper cerrado preparado
f4ab999dae9c4d781fd917c259591aaee58597942ee1dbc25c675c7b22ba0fd6.

## Único ensayo físico propuesto después de revisión

Misma unidad M2315W1/FW2.2.86, mismo vínculo, sin OTA/reboot/otro cliente.
Usuario junto al reloj, batería≥50%, menús normales, pantalla despierta para
la transferencia. Región/FLAT/PROTECTED/KERNEL y recuperación integral siguen
sin verificar. Backup solo paquete/fuente/hash/catálogo/journals; no firmware.

1. Runner fijo nuevo fija archivo/plan/hashes de ambos journals. Tras autorización,
   habilitar solo r265/PHYS/EXIT_RESUME y C#; PACED_RETRY siguefalse. Rebuild/hash/
   prepare. **Un** `node tools/pc-static-watchface.mjs install-resume-once r265`.
2. Auth/info exige modelo/FW iguales; GET exige IDpropia ausente y una activa.
   INSTALL/upload stock, MD5/offset/chunk exactos anteriores. No limpiar ni
   reiniciar el staging. Si no coinciden, detener sin datos.
3. Enviar **una** parte de1886bytes útiles, encabezado y CRC descritos; esperar
   un segundo y comprobar registro. INSTALL/upload son control de la misma
   transferencia propia; no comando shell, módulo o partición desde PC.
4. Finally cerrar gates/rebuild/test, comprobar journals anteriores byte a byte;
   GET independiente exige propia inactiva/removible y previosIDs/flags/selección
   conservados. Si no se confirma, no seleccionar ExitC; no retries.
5. Solo entonces mismo ensayo manual del [plan R266](native-exit-physical-plan-r266.md):
   ExitC/cuatro barras blancas, diez grises, EXIT C una vez. Revalida key64/estado
   STOP13/cierre/listado/key64, un rmmod234; registro vacío/listado sin el nodo,
   sin abrirlo después. EXIT CODE integrado si falla. Volver a habitual y
   comprobar menús/cambio de esferas. Sin nueva carga, Cwrite, STOP o rearmado.

## Riesgo y recuperación

| Operación/componente | Flash | Particiones/boot | Reboot revierte | Reversión/peor fallo |
|---|---|---|---|---|
| Continuación stock del paquete propio/staging | Sí | Sin acceso dirigido | No | Prefijo incorrecto, parser/FS, timeout; no limpieza automática |
| Journal nuevo PC/anteriores leídos | PC, no nuevo comando al reloj | Sin acceso dirigido | No aplica | Se conservan ambos anteriores; error impide continuar |
| Selección/marca/capturas propias de ExitC | Sí | Sin acceso dirigido | No | Habitual por Ajustes si responde; no rearmar |
| rmmod/uninit/unregister234 manual | Sin write persistente solicitado | Sin acceso dirigido | RAM sí, daño persistente no garantizado | Retirada parcial, panic/corrupción; no reload automático |

Módulo potencialmente privilegiado, no sandbox; FWstock sin modificar.
Peor fallo razonable bloqueo/panic/reboot/corrupción RAM o FS, soft brick posible.
Sin operación dirigida al boot que deba hard-brickear, sin garantía integral.
Recuperación parcial conocida: Ajustes→Esferas si responde; integral no validada.
No reiniciar, flashear, modificar boot/particiones/verificación o usar otro modelo
como recuperación automática. R268 autorizaba abortar ante resume≠0: **no
autoriza esta continuación**; requiere revisión del nuevo mecanismo concreto.

## Resultado de la reanudación

**Transferencia R270: ExitC instalada sin activación automática.**
El usuario autorizó completar el tramo y el ensayo. Se envió una sola parte
de1916bytes (1886bytes útiles desde offset22462), con el mismo paquete/MD5.
Catálogo independiente12→13: ID365219964 inactiva/removible, las12entradas y
flags anteriores conservados; activa365210175 sin cambios.
Socket y worker cerrados, sin error nativo; gates restaurados y comprobados.
Journals R266/R268 intactos byte a byte, sin locks; journal R270 Registered1.
No se activó ExitC ni se ejecutó rmmod/C durante la transferencia.
Helper autorizado dbd472d0c08816e92f047d47c9eb5ed41512c9c6352ca66c26d83e2f3961e3bd;
helper cerrado ce36f0936e75bd758b4eb206f21af4f04a3baf45298355ec7949f8309ec530d5.
Runner artifacts/exit-r270-authorized/run-install.mjs consumido: no repetir.
Evidencia privada: install-report.json, comparison.json, prior-journal-preservation.json.
El ensayo manual posterior pasó: diez verdes y retorno normal; módulo234 retirado.
No rearmar marcas, recargar C, reiniciar, borrar paquetes ni repetir transferencias.

## Resultado manual R270: retirada confirmada

El usuario informó «todos verdes. puedo usar todo con normalidad, watchfaces y menu».
Los diez indicadores del paquete fijado confirman precondiciones STOPPED/cierre,
identidad canónica estable, nodo presente antes, un rmmod sin diagnóstico de error,
registro vacío y listado sin el nodo después. No se volvió a abrir el nodo retirado.
Se considera validada la retirada de rw4step234 en esta unidad/FW2.2.86 y este estado.
Evidencia: observación de UI propia y contrato de fuente fijado; no captura digital
independiente del registro después ni prueba de ausencia de fallos latentes.
El módulo ya no se considera residente. No volver a pulsar EXIT C ni rearmar su marca.
Retorno a esfera/menús normal, firmware stock; no hubo reboot o nueva carga C.
La recuperación integral y el aislamiento de privilegios siguen sin validar.
