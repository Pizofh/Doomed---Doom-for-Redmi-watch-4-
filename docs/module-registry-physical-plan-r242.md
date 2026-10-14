# R242 — ensayo ModInfo autorizado; instalación completada

2026-10-14. **Ensayo consumido: pantalla negra; cambio de esfera y menús normales.** Usuario:
«Sí, autorizo y puedo observar el reloj». [Resultado](module-registry-physical-result-r242.md).
Sin permiso para repetirlo; CHECK y registro no observados, retorno confirmado.
La regla inicial
del usuario exige plan explícito y revisión antes de otro payload físico.
El ensayo StepDiag R239 está consumido; retorno habitual/menús/scroll/pulsación
larga confirmado. StepC puede seguir residente. Nada de apertura de su nodo,
carga/retiro C, rearmado, cambio de vínculo o reboot automático.

## Identificación y evidencia

M2315W1, FW2.2.86, Mi Fitness3.59.1i, Android16/HyperOS3.0.302.0 conocidos;
región/build Vela exactos desconocidos. Preflight autenticado exige modelo y
FW2.2.86, ID propia ausente y una esfera activa. Usuario debe observar el reloj
y poder intervenir, batería≥50%, sin OTA/otro cliente paralelo. No quitar otras
esferas automáticamente por espacio.

Lua/PNG/archivos y cambio de esfera comprobados físicamente en esta unidad.
`/proc/modules` respaldado por llamadas/literales de la imagen candidata fijada;
acceso directo desde este Lua **aún no probado físicamente**. 38casos del lector
y17deUI pasan con simulaciones: [R241](module-registry-ui-r241.md). No asumir
equivalencia S3/RW4 o identidad binaria solo por versión.

## Objeto y backup

ModInfo365219975,15792bytes, perfil r241,
`artifacts/registry-r241/ModInfo-id-only.face`, SHA256
`df32945c91dfa484ce573164ee38daf1bdfe6a05aa9a873a7b172fa0e2b56f99`.
Fuente aprobable5984bytes SHA256
`0abc68497640495a6189fcb50dae35fcefeb5a6a5c55a3b31b2945f1745f462a`.
Journal nuevo `tools/local/pc-rfcomm/module-registry-r242.json`, debe estar
ausente/sin lock. No reemplaza StepC, StepDiag ni otra esfera.
Backup limitado: fuente/paquete/hash/catálogo/journal. No backup integral de
firmware/particiones ni recuperación validada del módulo desconocido.

## Comandos y secuencia únicamente tras aprobación

1. Habilitar temporalmente solo variante r241 y gate C#; rebuild/pins/prepare.
2. Un `node tools/pc-static-watchface.mjs install r241`: auth/info/catálogo,
   INSTALL4/4/upload22/0/MASS5,8partes por defecto; registra inactiva. No SET,
   DELETE, reemplazo, firmware o fallback. Rechazo/timeout/incertidumbre: parar,
   sin retry, otro ID o eliminación para espacio automática.
3. Finally cerrar gates, rebuild y verificar cero sockets en pruebas. Tras
   instalación y cierre confirmados, un `node tools/pc-rfcomm.mjs watchfaces`
   independiente confirma entrada propia/inactiva y preservación del catálogo/
   selección anteriores. Cerrar sockets/worker. Catálogo no prueba runtime.
4. Usuario selecciona **ModInfo, dos barras naranjas**. Debe mostrar MOD INFO,
   CHECK y15indicadores grises. FINAL rojo inicial, falta UI o fallo: no CHECK
   ni repetir; volver a habitual si responde y describir.
5. CHECK una vez crea/verifica marca propia:

   ```text
   /data/app/watchface/market/365219975/lua/registry-attempt-r241.txt
   ```

   17bytes `RW4-MODINFO-R241\n`, persiste. Si falla, no consulta procfs.
6. Solo abre `/proc/modules` en rb; lectura≤8193bytes y un byte adicional para
   EOF, exige≤8192, máximo64filas; cierra incluso tras errores. No shell,
   captura, llamadas a C propio, `/dev`, ELF, timers o archivos anteriores.
   Interpreta nombres/campos/punteros/tamaños sin mostrar/guardar metadata cruda.
7. Usuario comunica las filas rojas/grises/amarillas o los15colores, y vuelve
   a la habitual desde Ajustes→Esferas/selector; confirma menús/scroll/pulsación
   larga. No repetir/reabrir CHECK; la marca impide nuevo intento.

Filas MARK/OPEN/READ/CLOSE/ASCII/END LINE/ROWS/FIELDS/NAMES/POINTERS/NUMERIC/
C MODULE/NO MOD/NAME HINT/FINAL. C MODULE verde y NO MOD rojo son normales para
un registro no vacío. NAME HINT amarillo es solo pista, no permiso de retiro.
Error no significa módulo ausente. No rmmod/reboot/carga C automáticamente,
aun si FINAL verde; no borrar la marca o paquete bajo esta autorización.

## Riesgo y reversión

| Componente | Reboot revierte | Flash | Particiones / bootloader | FW modificado | Reversión / fallo razonable |
|---|---|---|---|---|---|
| Paquete/catálogo/selección stock | No garantizado | Sí | Sin acceso dirigido | No | Volver a habitual; retirada propia futura exige revisión; instalación puede fallar |
| Marca propia17bytes | No | Sí | Sin acceso dirigido | No | Persiste, no se rearma/elimina automáticamente |
| Lua/UI/PNG | Memoria volátil sí; efectos persistentes no garantizado | Solo instalación/marca anteriores | Sin acceso dirigido | No | Error/decoder/UI pueden bloquear; retorno por Ajustes si responde |
| Lectura procfs | No aplica como operación de lectura | No write solicitado | Sin acceso dirigido | No | Lee metadata stock, puede bloquear/panic si hay defectos/corrupción; no timeout duro |

Peor fallo razonable: bloqueo de UI, panic/reboot o corrupción de filesystem;
posible soft brick. No hay operación dirigida a boot/particiones que deba
causar hard brick, pero no existe garantía integral ante errores stock.
RAM-only no significa sandbox; modelo de privilegios exacto sigue abierto.
Recovery integral de firmware no validado. Recuperación parcial observada:
cambiar de esfera desde Ajustes cuando menús responden. Un reboot no restaura
flash. Ante fallo detener y revisar, no improvisar flash, recovery, firmware
ajeno, exploits, SWD/JTAG, verificación criptográfica o apertura física.

La aprobación requerida cubre un envío, selección manual, CHECK único,
lectura de resultados y retorno observado; ninguna intervención sobre StepC.
