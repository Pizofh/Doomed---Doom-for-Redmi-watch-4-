# R239 — ensayo autorizado: StepDiag sin carga de C

2026-10-14. **Autorizado e instalado sin activación; gates cerrados de nuevo.
CHECK manual pendiente.** [Resultado](step-diagnostic-physical-result-r239.md). Usuario:
«Sí, autorizo y puedo observar el reloj». Solicitud incluía batería≥50%;
afirmación registrada, sin lectura adicional. Un ensayo, sin reintentos.
Ensayo StepC anterior
consumido con fallo; unidad volvió a esfera habitual y UI normal. Estado de su
módulo desconocido. No reabrirlo, eliminarlo, reiniciar o descargarlo a ciegas.
La regla inicial del usuario exige plan/revisión para este payload distinto.
[Contenido, resultados y significados](step-diagnostic-r238.md).

## Objetos, identificación y backup

M2315W1/FW2.2.86; región/build Vela exactos desconocidos. Mi Fitness3.59.1i y
Android16/HyperOS3.0.302.0 habituales. Usuario junto al reloj, batería≥50%,
menús/cambio normales, sin OTA/cliente paralelo y vínculo PC disponible.
Sin cambio automático de vínculo, borrado para espacio o pruebas sin presencia.

Paquete StepDiag365219976,20780bytes, perfil r238, SHA256
`e4d30fa6da8a08164bea262a1d54616447fc81d71ebe4fedfda42aad4914447c`.
Archivo `artifacts/step-diag-r238/StepDiag-id-only.face`.
Journal nuevo `tools/local/pc-rfcomm/step-diagnostic-r239.json`, ausente/sin lock.
Backup limitado a paquete/fuentes/hash/catálogo/journal; no firmware/particiones
integrales ni recuperación de módulo desconocido.

Evidencia específica: Lua/UI/imágenes/archivos y shell lsmod ya funcionaron en
RW4, en ensayos separados. Estos19casos se validaron con mocks, no en el reloj.
Lectura de los archivos de otra esfera propia y estas pruebas de pack/unpack/
setvbuf no están verificadas físicamente. Sin modelo de sandbox demostrado.

## Secuencia solo tras revisión y aprobación

1. Habilitar únicamente r238 y gate C# temporalmente; rebuild/hash/prepare.
2. **Un** `node tools/pc-static-watchface.mjs install r238`: auth/info/catálogo
   exige modelo/FW, propia ID ausente y una activa. INSTALL4/4/upload22/0/MASS5,
   11partes por defecto, registro stock inactivo. No SET/DELETE/reemplazo.
   Cualquier rechazo/timeout/incertidumbre: detener sin retry u otro ID.
3. Finally cerrar gates/rebuild/verificar; si instalado/cierre confirmados,
   un `node tools/pc-rfcomm.mjs watchfaces` GET independiente comprueba entrada
   nueva/inactiva y selección/entradas previas. Cerrar socket/worker.
4. Usuario selecciona StepDiag, preview tres barras amarillas. Debe aparecer
   STEP DIAG, las diez filas y CHECK, todos grises. Rojo inicial/falta UI:
   no CHECK, volver a habitual y describir. No seleccionar StepC de nuevo.
5. CHECK **una vez**. Solo crea y verifica marca propia
   `/data/app/watchface/market/365219976/lua/diag-attempt-r238.txt` (17bytes).
   Pruebas pack/unpack puras; setvbuf(no) en esa marca regular; lee únicamente
   `step.elf`, `step-attempt-r234.txt`, `step-inspect-r235.txt` bajo la raíz
   anterior365219977/lua/, acotados respectivamente2621/15/8193bytes, sin writes.
6. Si captura propia ausente y cierres conocidos, única consulta:

   ```text
   lsmod > /data/app/watchface/market/365219976/lua/diag-capture-r238.txt
   ```

   Lee≤8193bytes y exige≤8192; interpreta tabla sin mostrar direcciones o texto
   crudo y retira únicamente esa captura propia. No abre /dev, llama al código
   de StepC, carga/descarga módulos o modifica archivos viejos. Cierre incierto
   previo omite shell. No consulta automática al abrir ni desde GC.
7. Usuario comunica los diez colores: PACK/UNPACK/IO MODE/STEP ELF/STEP MARK/
   OLD CAP/LSMOD/C MODULE/NO MOD/CLOSE; luego vuelve a habitual desde Ajustes o
   selector y confirma menús/scroll/pulsación larga. No repetir/reabrir CHECK.

No se borra la marca, se captura log general del reloj o se pide retirada de
C/paquete automáticamente. Si C MODULE aparece verde, registra presencia y
detiene nuevas operaciones nativas hasta revisión; no asumir safe-unload.

## Riesgos y reversión

| Componente | Reboot revierte | Escribe flash | Particiones / bootloader | Firmware modificado | Reversión / riesgo |
|---|---|---|---|---|---|
| Paquete/catálogo/selección stock | No garantizado | Sí | Sin acceso dirigido | No | Retorno habitual/retirada posterior propia; fallo de instalación |
| Marca y captura propias | No | Sí | Sin acceso dirigido | No | Marca persiste; captura retirada si confirmado; no archivos antiguos |
| Lua/UI/funciones puras/lecturas | RAM sí; daño persistente no garantizado | Solo writes propios anteriores | Sin acceso dirigido | No | UI/decoder/filesystem pueden fallar |
| Shell lsmod | No aplica | Captura propia | Sin acceso dirigido | No | Consulta puede bloquear; sin timeout duro o intervención sobre módulos |

No module loading ni callbacks nuevos. Que sea diagnóstico no garantiza
seguridad: puede bloquear UI/shell, provocar panic/reboot o corrupción de FS,
con posible soft brick. Sin operación dirigida que deba causar hard brick,
no garantía integral frente a defectos del sistema. Reboot no restaura flash.
Recovery integral de firmware no validado; recuperación parcial conocida es
Ajustes→Esferas/selector cuando responde. Ante bloqueo/fallo detener y revisar
antes de otras acciones; nada de flash/firmware ajeno/bootloader/recovery,
particiones, exploit/SWD/JTAG/desactivación criptográfica o apertura física.

La aprobación concedida cubre únicamente un envío, selección manual,
CHECK una vez, lectura de resultados y vuelta habitual con observación.
No repite StepC/C, rearma intentos, retira módulos/paquetes o cambia firmware.
