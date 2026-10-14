# R250 — plan StateRead autorizado

2026-10-14. Usuario autorizó UN ensayo y presencia: «Sí, autorizo y puedo observar el reloj».
Instalación inactiva completada; [resultado](state-read-physical-result-r250.md).
READ C manual y retorno pendientes. La aprobación no permite repetir o retirar C.
R247consumido con retorno normal;
registro de rw4step234 reconstruido, estado interno no leído. Regla inicial exige
revisión antes de callbacks C nuevos en hardware. No repetir StepC/ProcView,
recargar ELF, rmmod, STEP/STOP/reset, rearmar marcas o cambiar firmware.

## Identificación, evidencia y backup

M2315W1/FW2.2.86, Mi Fitness3.59.1i, Android16/HyperOS3.0.302.0; región/build Vela
exactos desconocidos. Preflight exige modelo/FW/ID ausente/una esfera activa.
Usuario junto al reloj, batería≥50%, menús/cambio normales, sin OTA/otro cliente.
Sin cambio de vínculo, eliminación para espacio o fallback automático.

Fotos R248: nombre, text972, INIT/UNINIT relativos y campos coherentes con C R234
y ELF previamente comprobado por StepDiag. No campo DATA SIZE completo o prueba
de estado/handles. Register-driver inferido por orden del init, no read del nodo.
Slots/argumentos open/read/close contrastados en imagen candidataR232, fops32/
file opaco de C R234; fingerprints comprobados en su init. No configuración
FLAT/PROTECTED/KERNEL ni sandbox físico completos demostrados. Tratar los
callbacks como código potencialmente privilegiado, no un proceso aislado.

StateRead365219972,20536bytes, perfil r249, paquete
`artifacts/state-read-r249/StateRead-id-only.face`, SHA256
`de20e2c8a68d7148cecbb756a0245d6c357eb792cf220e198a276af455db80e9`.
Source SHA73e65d7a693d6449239077da14694a68e10b284845021607e85111b406e0e1e2.
Journal nuevo `tools/local/pc-rfcomm/state-read-r250.json`, ausente/sin lock.
47casos S3 con nodo/widgets simulados, no validación de callbacks RW4.
Backup limitado fuente/paquete/hash/catálogo/journal; no backup/recovery integral.

## Operaciones y componentes

1. Prepare cerrado; habilitar solo r249/C# temporal, rebuild/hash/prepare.
2. Un `node tools/pc-static-watchface.mjs install r249`, auth/info/catálogo/
   INSTALL4/4/upload22/0/MASS5,11partes por defecto. Registra inactiva, no SET/
   DELETE/reemplazo. Rechazo/incertidumbre: parar sin retry/u otro ID.
3. Finally cerrar gates/rebuild/testgates0sockets. Tras éxito/cierres confirmados,
   un GET `node tools/pc-rfcomm.mjs watchfaces` verifica propia inactiva y
   previos IDs/flags/selección conservados. Cerrar socket/worker.
4. Usuario selecciona **StateRead, cuatro barras amarillas**: C STATE, READ C,
   diez grises y FRAME HEX vacío. Rojo inicial/faltaUI/fallo: no pulsar.
5. READ C una vez crea/verifica15bytes propios `RW4-STATE-R249\n` en
   `/data/app/watchface/market/365219972/lua/state-read-attempt-r249.txt`.
   Persiste; no reentrada/rearmado. No consulta nativa al seleccionar.
6. Lee/cierra `/proc/modules`≤67bytes+EOF y exige observación propia R248; lee/
   cierra marca anterior≤15bytes, exige14exactos. No modifica archivos antiguos;
   si falta/cambia/cierre incierto, no abre nodo. No inventa DATA SIZE.
7. Única apertura/lectura del nodo existente:

   ```lua
   io.open('/dev/rw4step234', 'rb')
   f:setvbuf('no')
   f:read(32)       -- exige 32 bytes
   f:read(1)        -- exige EOF
   f:close()       -- una tentativa explícita, también tras errores
   ```

   Invoca open/read/read-EOF/close C existentes, modifica refs/cursor en RAM.
   No f:write, STEP/START/STOP, module load/unload, shell, hilo o driver físico.
   Error/cierre incierto detiene; no retry o consulta posterior si falló I/O.
8. Con lectura/EOF/cierre confirmados, valida respuesta32bytes y límites R235,
   relee/cierra registro y exige igualdad con preflight. Muestra framehex64chars.
   No metadata cruda guardada, logs generales o direcciones mostradas.
9. Usuario reporta colores MARK/REG INFO/OPEN C/READ C/EOF C/FRAME/IDLE/CLOSE C/
   REG LAST/FINAL y frame. IDLE amarillo es estado reconocido no inicial; no
   actuar sobre él. Volver a habitual y comprobar menús/scroll/pulsación larga.

No permiso para retirar C aunque todas verdes. FINAL verde no certifica refs
globales o safe-unload. Kernel fault puede impedir que Lua ejecute close: no
garantía de cleanup ante panic. Runtime/GC de FILE fuera de nuestro código no
se certifica; cierre incierto mantiene prohibición de retiro. Sin timeout duro.

## Riesgos y recuperación

| Paso/componente | Reboot revierte | Flash | Particiones/bootloader | FW modificado | Reversión / fallo razonable |
|---|---|---|---|---|---|
| Paquete/catálogo/selección | No garantizado | Sí | Sin acceso dirigido | No | Volver a habitual; sin borrado automático |
| Marca propia15bytes | No | Sí | Sin acceso dirigido | No | Persiste, no rearmar |
| Lecturas registro/marca anterior | No aplica | No write solicitado | Sin acceso dirigido | No | Error/bloqueo stock, no archivo viejo modificado |
| Callbacks C open/read/close | Memoria volátil sí; efectos persistentes no garantizado | No write solicitado desde C | Sin acceso dirigido | No | ABI/datos incorrectos pueden fault/panic/corromper memoria; sin sandbox |
| UI/PNG/hex | Memoria volátil | Solo instalación/marca anteriores | Sin acceso dirigido | No | Render/OOM/bloqueo; retorno por Ajustes si responde |

Peor fallo razonable: bloqueo, panic/reboot o corrupción RAM/FS; posible soft
brick. No acceso dirigido a boot/particiones que deba hard-brickear, sin garantía
integral frente a errores privilegiados. RAM-only no es sandbox ni asegura
reversión de corrupción persistente. Recovery integral de firmware no validado;
recuperación parcial conocida es Ajustes→Esferas cuando responde. Reboot no
restaura flash. Ante fallo parar/revisar, no improvisar firmware/flash/boot/
recovery/exploits/SWD/JTAG/apertura física o desactivar verificación.
