# R237 — ensayo autorizado: StepC

2026-10-14. **Ensayo único completado con fallo de START y retorno normal;
gates cerrados. Sin permiso para repetir.** [Resultado](step-physical-result-r237.md). Usuario:
«Sí, autorizo y puedo observar el reloj». La solicitud incluía batería≥50%;
se registra su afirmación, sin lectura adicional. Cubre este ensayo único,
sin reintentos, autoactivación ni retirada del paquete.
Un «ok» de preparación PC no autoriza otros payloads.
Lo exige la regla inicial del usuario: «Si eventualmente llegamos al reloj
físico, antes debes generar un plan explícito» y «No ejecutar automáticamente
ese paso». [Resultados y hashes PC](step-ui-r236.md).

## Unidad, alcance y evidencia

Solo M2315W1/FW2.2.86 del usuario. Región y build Vela/HyperOS exactas del reloj
desconocidas. Teléfono habitual Android16/HyperOS3.0.302.0 y Mi Fitness3.59.1i.
Sin OTA concurrente, otro cliente o cambio automático de vínculo/clave. Usuario
junto al reloj, batería al menos50%, esfera/menús/cambio normales y vínculo PC
disponible. Si falta cualquiera, no instalar. No borrar esferas para liberar
espacio automáticamente; rechazo significa detener el ensayo.

Compatibilidad demostrada en ensayos separados: Lua/LVGL/Timer/controles de
HoldPad y archivos/load/unload nativo de NativeLog/FirstC2. **Son nuevas** las
llamadas REGISTER/UNREGISTER, callbacks del nodo, BSS propia y uninitializer.
El [contrato R234](rw4-step-candidate-r234.md) se rastreó en imagen candidata
2.2.86; cinco fingerprints verifican bytes antes de llamadas, sin autenticar la
imagen ni garantizar legibilidad/ABI. No se usa ABI S3. Pruebas con mocks no
demuestran el comportamiento físico nuevo.

Modelo FLAT/PROTECTED/KERNEL y permisos efectivos sin resolver: se trata el
módulo como código nativo con posible acceso amplio a memoria/sistema, **sin
sandbox**. No se pretende escalación de privilegios. El nodo propio de RAM
no es framebuffer/input stock ni un driver de hardware. No se llama C desde GC.

## Paquete, archivos y comandos exactos

- StepC ID365219977,31808bytes, preview cinco barras verdes, sin autoactivación.
- SHA256 `5c117cce07ccb5388f0bf0c2345f829827e810daae0db2c32886d9d75a14ed40`.
- Artefacto `artifacts/step-r236-final/StepC-id-only.face`, perfil r236.
- Módulo `rw4step234`, nodo `/dev/rw4step234`; no workers, audio o Doom.
- Journal nuevo `tools/local/pc-rfcomm/native-step-r237.json`, debe estar ausente
  y sin lock. Conserva intención y catálogo previo; no permite replay incierto.
- Raíz P exacta `/data/app/watchface/market/365219977/lua/`. Solo archivos propios:
  `Pstep.elf`2620bytes, `Pstep-attempt-r234.txt`14bytes, captura
  `Pstep-inspect-r235.txt` acotada a8192bytes y retirada tras cada consulta.
  ELF/marca permanecen. No se borran/rearman tras éxito o fallo.

Secuencia exclusivamente después de aprobación:

1. Habilitar temporalmente solo r236 y gate C#, recompilar/helper hash/prepare;
   no cambiar contenido aprobado. Helper cerrado actual hash en doc R236.
2. **Un** `node tools/pc-static-watchface.mjs install r236`: auth/info/catálogo,
   validación de modelo/FW, propia ID ausente y una activa; INSTALL4/4, upload22/0,
   MASS5. Stock guarda paquete/catálogo. No selección, reemplazo ni DELETE.
   El presupuesto total de framing debe caber en32768; si no, parar antes de MASS.
3. Cerrar gates/rebuild/verificar. Si instalación y cierre quedaron confirmados,
   un `node tools/pc-rfcomm.mjs watchfaces` GET independiente confirma propia
   inactiva y entradas/selección anteriores. Ningún nuevo SET. Socket/worker cerrado.
4. Usuario selecciona StepC una vez. Debe ver C STEP, UP/LEFT/RIGHT/FIRE/EXIT,
   cinco indicadores grises y START. EXIT rojo inicial, UI ausente o rara: no
   START; volver desde Ajustes y comunicar el estado. No abrir pruebas C anteriores.
5. START **una vez**. Escribe ELF propio solo si falta y lo verifica byte a byte;
   exige captura/nodo ausentes y catálogo vacío. Lua guarda marca14bytes y la
   verifica. Comandos NSH fijos, siempre con captura propia ausente:

   ```text
   lsmod > Pstep-inspect-r235.txt
   insmod Pstep.elf rw4step234 > Pstep-inspect-r235.txt
   lsmod > Pstep-inspect-r235.txt
   ```

   P es abreviación documental, no variable de shell. C comprueba BSS cero,
   fingerprints y marca; registra únicamente su nodo, permisos0600. Retorna a
   Lua antes de input. Leer snapshot confirma estado inicial cero; cada request
   de24bytes/ACK32bytes abre/cierra el nodo y valida secuencia/estado/counters/EOF.
6. Observar barra moviéndose; mantener UP unos4s y soltar, después LEFT/RIGHT/FIRE
   igual. Cada control debe estar verde durante hold y gris tras soltar; el
   selector no debe abrirse. Si falla, no seguir con los otros controles ni repetir.
   Si responde, pulsar EXIT una vez y comunicar los indicadores.
7. EXIT **una vez** antes del presupuesto de300STEP (aproximadamente60s, no
   watchdog). Deshabilita callbacks futuros y pausa Timer antes de STOP; exige
   controles neutrales y cierres confirmados, registro propio exclusivo y:

   ```text
   lsmod > Pstep-inspect-r235.txt
   lsmod > Pstep-inspect-r235.txt
   rmmod rw4step234 > Pstep-inspect-r235.txt
   lsmod > Pstep-inspect-r235.txt
   ```

   Las dos consultas previas rodean snapshot/STOP; solo se pide rmmod si todo
   quedó atribuido y neutral. Uninitializer rechaza handles/actividad, retira
   únicamente el nodo; Lua exige módulo/nodo ausentes antes de EXIT verde.
   ACK/close/registro/retirada inciertos: rojo, no retry ni unload ciego. GC
   inesperado puede dejar módulo residente sin nuevos STEP; no declara limpieza.
8. Leer resultado de los cinco indicadores. Volver a habitual usando selector
   desde zona neutra del launcher (aprox.x195/y275) o Ajustes→Esferas. Confirmar
   menús/scroll/pulsación larga normales. No reabrir StepC ni resetear su marca.

STOP conserva el único intento incluso si perdió su ACK. Ante nodo ocupado,
el unregister inspeccionado puede quitar el path antes de rechazar retirada:
no asumir que nodo ausente permite liberar C. No cargar o borrar otro módulo
para recuperar. Una nueva captura preexistente tampoco se elimina a ciegas.

## Riesgos, respaldo y recuperación

| Operación / componente | Reboot revierte | Flash persistente | Particiones / bootloader | Firmware modificado | Riesgo / reversión |
|---|---|---|---|---|---|
| Instalación stock del paquete/catálogo | No | Sí | Sin acceso dirigido | No | Instalación incompleta/selección inesperada; detener y revisar |
| Selección manual y Lua UI | RAM sí; selección no garantizada | Stock puede guardar selección | Sin acceso dirigido | No | UI bloqueada; habitual vía Ajustes/selector si responde |
| ELF/marca/capturas propias Lua | No | Sí, archivos propios | Sin acceso dirigido | No | ELF2620B/marca14B quedan; no se rearma; captura propia se retira |
| Insmod/registro/callbacks/STOP/uninit | Estado RAM se pierde al reboot; daño persistente no garantizado | C no solicita writes de flash; fallo puede afectar sistema | Sin acceso dirigido | No | Fault/panic/corrupción; solo retirada atribuida por EXIT |
| RPC por nodo propio | Estado RAM sí | Sin writes de archivo de flash solicitados por RPC | Sin acceso dirigido | No | VFS puede bloquear; r+b no crea archivo si nodo desaparece |
| GET final | No aplica | Sin write de archivo solicitada | Sin acceso dirigido | No | Solo dato de catálogo; no prueba UI ni recuperación |

Backup disponible: fuentes/paquete/hash y catálogo/journal; **no copia integral
de firmware, particiones o configuración**. Recuperación parcial conocida:
Ajustes→Esferas y retorno habitual en pruebas anteriores. La imagen de firmware
inspeccionada no es un mecanismo de recuperación validado. No recuperación
integral/soft-brick/hard-brick demostrada para esta unidad.

Peor fallo razonable: bloqueo de UI/shell, panic/reboot o corrupción de memoria
y filesystem con posible soft brick. No se espera hard brick por una escritura
dirigida a boot/particiones, porque no existe tal operación; no puede excluirse
daño persistente por ABI incorrecta o fallo de sistema. Reboot no restaura flash.
Callbacks seriales sin atomics no cubren clientes concurrentes arbitrarios.
Timer/pcall/300STEP no interrumpen llamadas bloqueadas. RAM-only no equivale a seguro.

Ante cualquier fallo: detener toques/comandos adicionales, comunicar estado y
revisar antes de reboot/borrado/reintento/cambio de vínculo. Sin flash, firmware
ajeno, bootloader/recovery, desactivación criptográfica, exploit, SWD/JTAG o
apertura del reloj. Retirada del paquete no está autorizada automáticamente:
se decidiría aparte, solo inactivo y con módulo retirado confirmado.

La aprobación concedida cubre un único envío, selección manual, START,
cuatro holds/liberaciones, EXIT y retorno habitual con observación. No Doom,
reintentos, nuevos hashes/APIs, retirada automática o pruebas sin presencia.
