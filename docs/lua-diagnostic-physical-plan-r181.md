# R181 — ensayo propuesto de LuaDiag, no autorizado aún

2026-10-12. LuaProbe anterior falló funcionalmente; el usuario volvió a su
esfera desde Ajustes y recuperó pulsación larga. [Nueva variante R180](lua-diagnostic-r180.md)
probada solo en emuladorS3, distinto de RW4. No nuevos comandos al reloj.
Gates Node/nativo siguen FALSE y REVIEWED_VARIANT=r167.

## Delta y compatibilidad

Misma unidad M2315W1/2.2.86,región sin confirmar,PC con transporteV1 demostrado.
Instalador/hash/formato probados previamente físicamente; nuevo script no.
Perfil r180/contentKind lua-diagnostic,ID365219992,10524bytes:

SHA256 paquete `140b2a05618f617e70a7f5f28029beefed64251c43af0086cfaacfe0a681c8f1`.
Archivo `artifacts/lua-diagnostic-r180/LuaDiag-id-only.face`.
Fuente `experiments/lua-diagnostic/main.lua`,SHA256
`7dece1ba7dac11e500157cf5569b92dc0999c3ea1e95c4b1d07e61b7b60115bd`.
Registro nuevo `tools/local/pc-rfcomm/lua-diagnostic-r181.json`.

Panel pequeño192×144,no captura toques,previewX distinto del runtime magenta
con amarillo y verde/rojo. Usa Label de fuente por defecto,con pcall y sin
timer. Verde significa objeto Label creado: usuario debe comprobar texto.
No shell,filesystem,drivers,módulos,Cpropio,ELF o Doom. Sí usa bindings nativos
stock; privilegios físicos siguen sin caracterizar. No afirmar sandbox.

No reemplaza ni borra LuaProbe365219991 o RW4Probe365219990. Se conserva su
evidencia y registros. Colisión/espacio se consultan de nuevo; ningún máximo
de esferas supuesto ni borrado automático para liberar espacio.

## Paso concreto tras revisión

Usuario junto al reloj,UI habitual normal,batería suficiente,vínculoPC actual
sin migraciones de rutina. Si falla transporte/auth,detener,sin reenlazar o
cambiar claves automáticamente. Después de autorización,habilitar solo r180
temporalmente,reconstruir/registrar hash del build y volver a comprobar prepare.

| Paso | Comando/acción | Efecto/reversión |
|---|---|---|
| Preparación PC | node tools/pc-static-watchface.mjs prepare r180 | Offline, paquete/fuente/build confirmados |
| Un único intento de instalación | node tools/pc-static-watchface.mjs install r180 | Auth/info/GET,modeloFW2.2.86/IDausente/unaactiva,INSTALL4/4,upload22/0tipo16,MASS5. Escribe archivos/catálogo stock persistentes,default6partes2048. NoSET |
| Comprobación | node tools/pc-rfcomm.mjs watchfaces | GETsinarchivos,owninactivo/eliminable y anteriores conservados; cerrar gates tras escritura |
| Prueba manual | Selector stock→LuaDiag | Observar primero previewX sin desbordar. Al seleccionar: panelmagenta,amarillo,verde/rojo ytexto. No esperar contador |
| Salida | Ajustes→Esferas→habitual | Confirmar menús/pulsaciónlarga normales. Si la larga falla,no repetir; usar salida de Ajustes ya demostrada |
| Retirada opcional si se decide | node tools/pc-static-watchface.mjs remove r180 | Tras retorno confirmado,soloowninactivo/eliminable y journalRegistered;DELETE4/2/ACK/GET propiaausente/otraspreservadas. No DELETE físico probado todavía |

No repetir instalación o activación ante fallo. Parar al primer rechazo,
respuesta/versión/chunk/resume desconocidos o cierre incierto. TXmáximo32KiB,
frame4096 y chunks512…4080;4096 rechazado sinajuste. No stagingcleanup de
propiedadincierta. Mismo supervisor55s/60s,cierre y registros privados.
No coordenadas del emulador en hardware. Si se conserva,archivo queda instalado;
se vuelve a cargar al seleccionar, no implica código siempre residente en RAM.

## Riesgo y recuperación

Aplican las limitaciones detalladas del [plan físico R178](lua-physical-plan-r178.md).
Este delta elimina fuente explícita/timer/captura de toques,pero no garantiza
que no falle el runtime o parser. Backup: paquete/fuente/registro/catálogo;
sin backup integral de firmware ni recuperación validada para2.2.86.

| Gate | Evaluación |
|---|---|
| Reversible solo por reboot | No: instalación/selección persisten |
| Escribe almacenamiento persistente | Sí, servicio stock de esferas en instalación/selección/retirada |
| Particiones crudas/bootloader/recovery | Ningún comando para esos componentes; internals del servicio desconocidos |
| Firmware modificado | No |
| Peor fallo razonable | Pantalla incompleta,transferencia parcial,bloqueoUI o reboot; posible reapertura persistente de esfera problemática |
| Soft brick | No descartado si impide retirada o produce bucle |
| Hard brick | Sin escritura boot/cruda prevista; no se garantiza cero riesgo ante bugs |
| Recuperación conocida | Seleccionar esfera habitual por Ajustes funcionó en R179; gestión stock y reboot documentados, no restauración integral validada |

Gestión de esferas/reinicio según FAQs enlazadas en R178. No factoryreset,
flash,firmwareotro modelo,OTA,bootloader,exploit o acceso físico como fallback.
No ejecutar si el usuario no puede observar/intervenir. Nuevos hash/código/ID
requieren revisión; la autorización de único ensayoR179 ya se utilizó.

## Verificación offline completada

Cuatroperfiles pasan12codec/API y26wire/IPC/journal cada uno,con todos los
pares de recibos cruzados rechazados anteslink. CLI/nativo cerrados comprobados,
consultas yhealthcheck sintéticos pasan. No sockets físicos o credenciales
reales en tests. Prepare r180 valida fuente embebida/hash/build/seispartes.

Build cerrado SHA256
`eeb17d09e2b4ee571186f80cd8066c62f031f015996e4906cdc36bf53118cf27`.
Build habilitado tras revisión tendría otrohash,que se fijaría antes del envío.
**Siguiente checkpoint:** un ensayo LuaDiag físico después de autorización
explícita y observación, no C/Doom ni reintento automático de LuaProbe.
