# R253/R254 — StateRead2 sin dependencia de la esfera antigua

2026-10-14. Usuario autorizó «si» al único ensayo con observación y batería≥50%.
Instalación completada; READ C manual observado en foto, retorno «todo ok» confirmado.
[Resultado](state-read-physical-result-r254.md): snapshot/EOF/cierre/IDLE verdes,
registro posterior/FINAL rojos. Ensayo consumido, sin permiso de repetición o retiro.
PreCheck R252 identifica
el fallo de apertura de la marca antigua, con registro propio66bytes/EOF/cierre/
formato reconocidos y retorno normal. Catálogo actual ya no incluye StepC;
su módulo sigue registrado. No atribuir eliminación de esfera a nuestro código
ni afirmar que desapareció el archivo sin errno. No repetir/rearmar R250/R252.

## Cambio y validación

Se eliminó únicamente el requisito de abrir/verificar la marca de StepC antes
del snapshot. Era un requisito nuestro, no del callback C de lectura: C comprueba
esa marca solo en init, ya ejecutado, no al abrir/leer/cerrar el nodo.
No se recrea el archivo ni se vuelve a ejecutar init. Se conservan clasificación
del registro propio, one-shot, apertura rb única, read32/EOF/close explícito,
protocolo y límites, comparación del registro antes/después. Metadata identifica
nombre/text972/offsets/ARG/export, no certifica integridad binaria o sandbox.

47casos reutilizados en Lua real S3/tmpfs real, nodo/registro/widgets simulados,
incluyendo tres casos con marca vieja ausente/alterada/no cerrable. El harness
rechaza todo intento de abrir la ruta vieja. Sin writes al nodo; reentrada,
lecturas/EOF/cierre fallidos y cambios posteriores de registro cubiertos.
Reporte `artifacts/emulator/state-read-r253-final/summary.json`, módulos S3
iguales/tmp retirado. El emulador PC estaba cerrado; PID anterior ausente,
registro archivado, restart con perfil Steve. No reboot físico o cambio de vínculo.

Paquete StateRead2, ID365219970,20364bytes,22recursos readback exactos, perfilr253:
`artifacts/state-read-r253/StateRead2-id-only.face`, SHA256
`ba0ecb35a5a868048f52a7c1290bf2d9be8aec01431fdca32e5ecf8831849348`.
Source SHA256
`0878f66374d1f0026a56464ab00699e93e28d6e3733fb04b370d164b26353f0f`.
Preview **cuatro barras cian**, título C STATE. No ELF nuevo, sí callbacks del
C residente. Compiler revisado sin ADB. No nuevas pruebas de protocolo entero.

## Único ensayo propuesto

M2315W1/FW2.2.86, Mi Fitness3.59.1i/Android16/HyperOS3.0.302.0; región/build exacta
y privilegios completos desconocidos. Usuario presente/batería≥50%, reloj
normal/sin OTA/otro cliente. Backup limitado a fuentes/hash/paquete/catálogo,
sin recuperación integral de firmware validada.

1. Gates cerrados, prepare fijo. Solo después de autorización habilitar r253/C#,
   rebuild/hash/prepare. Un `node tools/pc-static-watchface.mjs install r253`,
   journal nuevo `tools/local/pc-rfcomm/state-read-r254.json` ausente/sinlock;
   auth/modelo/FW/catálogo y transferencia stock. No SET/DELETE/reemplazo/retry.
2. Finally cerrar gates/rebuild/test0sockets; un GET independiente confirma
   IDpropio inactivo y selección/IDs/flags anteriores conservados. Socket/worker cerrado.
3. Usuario selecciona StateRead2 (cuatro barras cian), diez grises y READ C.
   Rojo inicial/faltaUI: no pulsar. READ C UNA vez crea/verifica marca propia15bytes
   `RW4-STATE-R253\n` en
   `/data/app/watchface/market/365219970/lua/state-read-attempt-r253.txt`.
   Persiste para bloquear reentrada. No archivo viejo abierto/modificado.
4. Lee67bytes+EOF/cierra `/proc/modules`, exige registro propio reconocido.
   Ante ausencia/cambio/error/cierre incierto no abre C. No fallback/reload.
5. Único `io.open('/dev/rw4step234','rb')`, setvbuf no, read32 exactos, read1
   exige EOF, un close explícito incluso tras errores. Invoca callbacks open/
   read/readEOF/close del módulo existente; modifica refs/cursor RAM, no comandos.
6. Si lectura/EOF/cierre confirmados, decodifica frame32bytes, compara registro
   posterior exacto y muestra FRAME HEX. IDLE verde inicial, amarillo otro estado
   válido. C permanece cargado. FINAL verde no autoriza unload ni certifica refs globales.
7. Usuario informa colores/frame y vuelve a habitual, confirma menú/scroll/
   pulsación larga. Filas MARK/REG INFO/OPEN C/READ C/EOF C/FRAME/IDLE/CLOSE C/
   REG LAST/FINAL. No repetir/reabrir/rearmar/reset/STEP/STOP/retirada automática.

## Riesgo, persistencia y retorno

| Componente | Flash | Boot/particiones | Reboot revierte | Reversión/fallo |
|---|---|---|---|---|
| Paquete/catálogo/selección | Sí | Sin acceso dirigido | No garantizado | Volver a habitual; sin borrado automático |
| Marca propia15bytes | Sí | Sin acceso dirigido | No | Persiste; no rearmar |
| Procfs | No write solicitado | Sin acceso dirigido | No aplica | Fallo/bloqueo stock; close si responde |
| C open/read/close | No write solicitado a almacenamiento | Sin acceso dirigido | RAM sí; corrupción persistente no garantizada | ABI/ref/cursor incorrectos pueden fault/panic/corromper; sin timeout duro |
| UI/PNG | Instalación/marca anteriores | Sin acceso dirigido | RAM volátil | Bloqueo/OOM/bug de decoder; Ajustes→Esferas si responde |

Peor fallo razonable: bloqueo, reboot/panic o corrupción RAM/FS, posible soft brick.
No acceso dirigido al boot que deba hard-brickear; sin garantía integral frente
a errores privilegiados. C no es sandbox. Open/read/close propios todavía no
demostrados físicamente; fallo kernel puede impedir close. No firmware modificado.
Recuperación parcial conocida: Ajustes→Esferas mientras UI responde; integral
sin validar. No improvisar flash/boot/firmware de otro modelo/exploits/SWD/JTAG.

Lección de persistencia: retirar una esfera/archivo no implica descargar su
módulo RAM. Para el producto final no depender de archivos de una prueba borrable;
almacenamiento y ciclo de vida nativo necesitan gestión explícita.

## Instalación R254 realizada

Un install RegisteredInactive,10partes/stream20430bytes/TX20897bytes,
19frames enviados/16recibidos. Registro confirmado, no selección automática;
transferAcceptanceVerified=false (sin ACK final independiente de aceptación).
GET independiente15→16, IDs/flags anteriores preservados, activa365210175,
StateRead2 propia970inactiva/removible. Journalstate-read-r254.json Registered10,
sinlock. Cierres socket/worker/exit0, sin error nativo. No SET/DELETE/retry,
proc/nodo/callbacksC durante la instalación.

Finalmente fuentes originales/gates restaurados, helper cerrado reconstruido,
testgates0sockets exitoso. Helper autorizado SHA256
`0c140749ea3819763058e21c71cf6004c93fb26b56139987b14f2acb5fdd2f57`.
Evidencia privada `artifacts/state-read2-r254-authorized/`, runner consumido.
Instalación y READ C consumidos. Retorno normal confirmado; no repetir.
