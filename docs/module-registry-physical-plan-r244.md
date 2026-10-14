# R244 — ModInfo2: plan del ensayo corregido autorizado

**Instalación completada:** [RegisteredInactive y GET independiente](module-registry-physical-result-r244.md).
Envío consumido, gates cerrados; CHECK único y retorno pendientes.

2026-10-14. Usuario ordenó corregir la ruta y enviar al reloj directamente;
autorización concreta registrada en [R243](module-registry-corrected-r243.md).
Presencia/batería≥50% declaradas para R242 y no revocadas. Retorno habitual/menús
tras pantalla negra confirmado; no repetir ModInfo anterior. Plan registrado
antes del comando físico. No otra carga C, retirada, cambio de vínculo o firmware.

## Identificación, objeto y backup

M2315W1/FW2.2.86, Mi Fitness3.59.1i/Android16/HyperOS3.0.302.0; región/build Vela
exactos desconocidos. Preflight exige modelo/FW/ID ausente y una esfera activa.
ModInfo2 ID365219974,16512bytes, perfil r243, paquete
`artifacts/registry-r243/ModInfo2-id-only.face`, SHA256
`7c9d38eb641db97c96db35ccd495d1f8b8505db2b4158b91aeddac1ec11dfb25`.
Main6703bytes SHA44d0906a031b1a1f8fb927efcb002bdcbddeb1605aaab7896b52272bb835043c.
Journal nuevo `tools/local/pc-rfcomm/module-registry-r244.json`, ausente/sin lock.
Backup solo fuente/paquete/hash/catálogo/journal, no backup/recovery integral.
Compatibilidad específica: UI Lua/PNG/archivos probados en esta unidad; acceso
procfs sigue sin verificar. Normalización proveniente de runtime S3, no prueba
del path físico. 70casos Lua con simulaciones y readback del paquete pasan.

## Secuencia autorizada

1. Prepare cerrado, habilitar solo r243/C# temporal, rebuild/hash/prepare.
2. **Un** `node tools/pc-static-watchface.mjs install r243`, instalación stock
   inactiva mediante auth/info/catálogo/INSTALL4/4/upload22/0/MASS5,9partes por
   defecto. No SET/DELETE/reemplazo. Rechazo/timeout/incertidumbre: parar sin retry.
3. Finally restaurar gates, rebuild/testgates0sockets. Si instalación y cierres
   confirmados, un GET `node tools/pc-rfcomm.mjs watchfaces` verifica propia
   inactiva y entradas/selección previas preservadas. Cerrar socket/worker.
4. Usuario selecciona **ModInfo2**, no ModInfo; preview dos barras naranjas,
   título MOD INFO y15grises/CHECK. Rojo FINAL inicial/faltaUI/fallo: no CHECK.
5. CHECK una vez crea/verifica17bytes `RW4-MODINFO-R243\n` en
   `/data/app/watchface/market/365219974/lua/registry-attempt-r243.txt`.
   La marca persiste y bloquea reentrada/repetición. No writes anteriores.
6. Mismo lector: `/proc/modules` rb,≤8193bytes +1EOF, exige≤8192/64filas,
   cierre incluso tras error. Sin shell/captura/dev/nuevoC/callbacks/Timer.
   No muestra/guarda tabla o direcciones crudas. Estado incierto no significa vacío.
7. Usuario reporta rojas/grises/amarillas y vuelve a habitual; verifica menús,
   desplazamiento y pulsación larga. No reabrir/rearmar/retirar o reiniciar.

Mismas15filas y significados de [R241](module-registry-ui-r241.md). C MODULE verde
y NO MOD rojo puede ser normal; NAME HINT amarillo no autoriza descarga.

## Riesgos, reversibilidad y recuperación

| Paso/componente | Reboot revierte | Flash | Particiones/bootloader | FW modificado | Reversión/fallo |
|---|---|---|---|---|---|
| Instalación/selección stock | No garantizado | Sí | Sin acceso dirigido | No | Volver a habitual; no borrar otra esfera para espacio |
| Marca17bytes propia | No | Sí | Sin acceso dirigido | No | Persiste, sin rearmado automático |
| Lua/UI/PNG | RAM sí, efectos persistentes no garantizado | Solo anteriores | Sin acceso dirigido | No | UI/decoder pueden bloquear |
| Lectura procfs stock | No aplica | No write solicitado | Sin acceso dirigido | No | Metadata/driver stock pueden fallar/panic/bloquear; sin timeout duro |

Peor fallo razonable: bloqueo, panic/reboot o corrupción FS, posible soft brick.
No operación dirigida a boot/particiones que deba provocar hard brick, pero sin
garantía integral frente a errores stock. RAM-only no es sandbox; privilegios
exactos y recovery integral sin validar. Recuperación parcial observada:
Ajustes→Esferas cuando responde; reboot no restaura flash. Ante fallo parar y
revisar, no improvisar flash/boot/recovery/firmware ajeno/exploits/SWD/JTAG.
