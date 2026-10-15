# R294: DoomPlay reutilizable, preparado en PC

**Actualización R295:** instalación y dos ciclos autorizados; instalación
completada inactiva, resultados manuales pendientes. [Registro R295](doom-reusable-install-r295.md).
No repetir la instalación. El resto conserva el plan aprobado.

**Pendiente de autorización. No se ha instalado ni ejecutado en el reloj.**
La siguiente prueba agrupa una instalación y dos ciclos manuales de juego,
EXIT y retorno al selector, sin reinstalación ni intervención del PC entre
los ciclos. Conserva el ELF/WAD que ya ejecutaron Doom físicamente en R293.

## Cambio y evidencia

DoomRun dejó el selector por pulsación larga inaccesible después de CLOSED.
DoomPlay coloca todos los controles y la imagen en un contenedor de juego.
Durante el juego ese contenedor consume los contactos mantenidos; al terminar
se oculta y deja de ser clickable, el fondo permanece no clickable y se
restablecen las cadenas de navegación. Solo queda START en reposo. Se sigue
el patrón de HoldPad, cuyo retorno sí fue observado en RW4. El resultado del
selector real con esta UI aún debe probarse; los tests no emulan HyperOS 1:1.

Se retira la marca de un solo uso únicamente del NUEVO launcher: no borra ni
cambia la marca de DoomRun. Permite otro START manual después de CLOSED, con
verificación completa CRC32/tamaño/cabeceras y RAM cada vez. ERROR bloquea
otro START en esa activación; no hay cargas/reintentos automáticos.
Reabrir tras un fallo no se propone como método para sortearlo.

## Paquete y compatibilidad

| Elemento | Valor fijo |
|---|---|
| Unidad / firmware | M2315W1 / 2.2.86; sin cambios de región, firmware o vínculo |
| Nuevo launcher | DoomPlay, ID365219960, 28832 bytes, 19 recursos |
| SHA256 paquete | `f66628fe42ef40e5f69e5348bf52487e849d4047f5fa9506427228aff3430799` |
| SHA256 Lua | `19d0a8647d0b37404d5c5cd5a53a00c76579cf22a86fcd808a10cac164afa81e` |
| Carrier existente |365219963/lua/doom.elf y doom1.wad; no se reenvían ni modifican |
| ELF |603760 bytes, SHA256 `980e13cc85813d463d229aec93b4b2000654b188b3c80a36bdcf30eaa3a3c8a5` |
| Nuevo journal privado |tools/local/pc-rfcomm/doom-reusable-r294.json |

El único ELF es el mismo que el usuario ya ejecutó con controles/EXIT en esta
unidad. Se mantienen módulo rw4doom282, nodos propios, CRC y umbrales UMEM
de R291. No APIs C, direcciones de firmware ni toolchain nuevos. Esto reduce
incógnitas, pero no demuestra estabilidad de cargas repetidas ni navegación.

Artefacto local ignorado:
`artifacts/doom-reusable-r294/package/DoomPlay-id-only.face`.
No reemplaza DoomRun, el carrier ni ninguna otra esfera; no se borra nada.
El launcher instalado admite futuros START manuales, no tiene un contador de
dos usos. La prueba observada propuesta se limita a dos ciclos; no automatizar
otros arranques. Cada ciclo mantiene la petición cooperativa de STOP tras
300 callbacks (~30s) y el límite cooperativo existente de 120s del ELF.

## Operación propuesta

Usuario junto al reloj, batería ≥50%, menús normales, sin OTA ni otro cliente.
No desconectar, desvincular, reiniciar ni cambiar Mi Fitness por rutina.
Backup disponible: fuentes, hashes/paquetes y catálogo/journal; no respaldo
integral restaurable del firmware ni de los datos del reloj.

1. Habilitar temporalmente PHYSICAL_WRITES_REVIEWED y REVIEWED_VARIANT=r294 en
   pc-static-watchface.mjs, y StaticPhysicalReviewed en Probe.cs. Mantener el
   resto de gates cerrado. Reconstruir y `prepare r294`.
2. Ejecutar **una sola instalación**, sin selección automática:

   ```powershell
   node tools/pc-static-watchface.mjs install r294
   ```

   Quince partes. Ante corte/rechazo parar, sin retry/resume ni borrados.
   Finally restaurar gates/fuentes, reconstruir y comprobar bloqueo.
   Si termina registrada, consultar catálogo independiente una vez.
3. Usuario selecciona **DoomPlay**, preview de CUATRO barras VERDES.
   Pulsa START una vez, mantiene la pantalla despierta durante CHECKING
   (aproximadamente un minuto o más) y prueba controles breves si aparece Doom.
   Pulsa EXIT antes de unos 30s y espera CLOSED.
4. Mantiene la zona vacía sobre START para abrir el selector. Si abre, vuelve
   a su esfera habitual; después vuelve a DoomPlay y realiza UN segundo ciclo
   START/juego/EXIT→CLOSED, sin comandos ni instalación desde PC entre ambos.
5. Comprueba otra vez selector, esfera habitual, menús y corona. Si hay ERROR,
   pantalla vacía, suspensión durante CHECKING o no abre el selector, no hace
   el segundo ciclo ni reabre para insistir: vuelve desde Ajustes si responde
   y describe el fallo. No ejecuta pruebas C anteriores ni borra esferas.

La lectura/ejecución usa los mismos comandos revisados de R291:
`ls /dev`, `insmod /data/app/watchface/market/365219963/lua/doom.elf rw4doom282`,
`rmmod rw4doom282` con capturas propias en el carrier; lectura /proc/modules,
/proc/meminfo y control binario al nodo propio. Ningún shell arbitrario.
Salida exige detach, STOP, finished, JOIN, allocations=frees/cleanup,
identidad y registro/nodos retirados antes de CLOSED y otro arranque.

## Riesgo y reversión

| Paso | Reboot lo revierte | Flash | Particiones / bootloader | Firmware modificado | Riesgo / retirada |
|---|---|---|---|---|---|
| Instalar DoomPlay | No | Paquete/catálogo | No dirigido | No | Transferencia parcial/FS/UI; retirada stock si responde, con revisión |
| Verificar / jugar dos ciclos | No garantizado | Lease/captura propias y estado stock | No dirigido | No | Fragmentación/OOM, panic, bloqueo o corrupción de memoria/FS |
| EXIT / volver a abrir | No garantizado | Retira auxiliares propios | No dirigido | No | Ref/caché/uninit/GC; no forzar rmmod ni tareas ante fallo |

El módulo sigue sin aislamiento demostrado: RAM-only no es sandbox. Los
límites de tiempo son cooperativos, no un watchdog duro. Si la UI suspende
el Timer, STOP/GC puede quedar pendiente de recuperación de una lease propia;
no se garantiza una descarga inmediata fuera de pantalla.
Peor fallo razonable: bloqueo/panic o corrupción persistente y posible soft
brick. No hay operación dirigida a boot que deba causar hard brick ni garantía
integral. Recovery integral sigue sin validar. No flashear ni improvisar
recuperación ante fallo. Se mantienen los [riesgos R291](doom-first-run-physical-plan-r291.md).

## Validación PC

53 casos en intérprete Lua S3: 22 de base, 20 del primer ensayo y 11 nuevos.
Cubren dos ciclos, reentrada, CRC/RAM en el segundo inicio, cancelación,
auto-STOP, fallos de cleanup y UI en reposo con controles ocultos/no clickable.
Native, archivos de fixture y eventos LVGL están simulados; solo el WAD se
leyó realmente completo para CRC. No se ejecutó C nuevo en estas pruebas.
Inventario nativo sin cambios. No representan prueba del selector físico.

EasyFace revisado sin ADB en PATH: 19 recursos exactos y pins comprobados.
15 partes/29143 bytes MASS +512 de control previstos, dentro del worker de
32768. Prepare y gate cerrado pasan; los pins del ensayo R291 siguen pasando.
Reproducción: `node tools/test-doom-reusable.mjs`,
`node tools/package-doom-reusable.mjs` (no sobrescribe review existente),
`node tools/test-doom-reusable-package.mjs`.
