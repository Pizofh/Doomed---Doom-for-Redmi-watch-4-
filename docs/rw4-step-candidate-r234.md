# R232–R234 — contrato parcial y candidato de puente RW4

2026-10-14. **Solo análisis/compilación PC; candidato no ejecutado ni empaquetado
para el reloj.** [UI/C S3 probados](step-bridge-emulator-r231.md). Ningún Bluetooth,
USB, módulo, consulta o archivo nuevo en hardware por este checkpoint.

## Qué se rastreó

Misma imagen privada candidata2.2.86/M2315W1 de R193, SHA256
`2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db`.
Partiendo de fopen/fread/fwrite/fclose físicamente usadas por NativeLog, se
siguieron sus BL hacia VFS y sus dispatch indirectos. No se obtuvo firmware
del reloj, se ejecutó la imagen o se alteraron sus bytes.

| Contrato parcial | Evidencia en offsets de archivo | Conclusión |
|---|---|---|
| open callback |0x495a76 carga ops;0x495a7a ops+0;0x495a80 BLX con filep | Primer slot0, file opaco |
| close callback |0x494300 ops;0x494304 ops+4;0x494308 BLX | Slot4, filep; no inventar layoutFILE |
| read callback |fread→0x496190,0x4961ba ops+8,0x4961be/c0 restauran tamaño/buffer,0x4961c2 BLX | Slot8, filep/buffer/size, retorno signed32 |
| write callback |fwrite/fflush→0x496d3c,0x496d68 ops+12,0x496d6c/6e argumentos,0x496d70 BLX | Slot12, filep/buffer/size, negativo convertido a errno |
| modinfo al init |0x1bb736 pasa module+24;0x1bb73e llama entry | Structprefix referido desde loader |
| uninit/arg |0x1bb7ba callbackmodule+24;0x1bb7be argmodule+28;0x1bb7c0 BLX | modinfo offsets0/4; exports/nexports8/12 por layout previo |
| impedir retirada |0x1bb7c2 compara retval;0x1bb7c4 rama negativa evita liberar | El callback propio puede rechazar descarga ocupada |
| tamaño observado fops stock | Tabla0x66444,8pointers seguidos de /dev/urandom |32bytes observados frente a40S3; no config completa recuperada |

Fuentes primarias relacionadas: [fs_read.c NuttX10.3](https://github.com/apache/nuttx/blob/nuttx-10.3.0/fs/vfs/fs_read.c)
describe file_read(filep,buf,nbytes) y su ruta a inode ops; los argumentos y
slots fueron contrastados en la imagen. [unregister_driver](https://github.com/apache/nuttx/blob/nuttx-10.3.0/fs/driver/fs_unregisterdriver.c)
hace inode_remove bajo lock. Son referencias upstream, no source Xiaomi exacto
ni identificación de versión NuttX. Se consultaron como texto en web; no tools nuevas.

**Detalle importante de retirada:** el cuerpo candidato inode_remove0x4938b8
desvincula el nodo antes de comprobar referencias. Busy no garantiza que el path
siga accesible. El diseño exige cero handles propios y STOP/neutral antes de
unregister, y conserva el módulo ante cualquier retorno incierto. No pruebas
físicas de ese detalle, atomicidad o clientes concurrentes arbitrarios.

## Candidato C compilado

[bridge-rw4-r234.c](../experiments/native-step/bridge-rw4-r234.c) contiene el mismo
core portable R229; callbacks cortos para nodo propio **/dev/rw4step234**, sin
worker, Timer nativo, driver físico, widgets C, hooks o writes de archivo C.
file queda opaco; fops usa32bytes/primeros4slots y restoNULL. Solo cliente serial
controlado; refs no es una barrera atómica para concurrencia arbitraria.

Init exige modinfo noNULL y BSS propia inicialmente cero. Comprueba fingerprints
de64bytes para5bindings específicos. Después lee/cierra una marca propia de
14bytes `RW4-STEP-R234\n` en la ruta fija de la futura esfera365219977; si falta
o es distinta, falla antes de registrar nodo. Ningún carrier crea esa marca aún.
Tras registro guarda uninit/arg/exports/nexports en el prefix inspeccionado.
Uninit rechaza handles abiertos, acciones activas o fase sin STOP; retira solo
su nodo. Write inválida neutraliza/pausa; read snapshot32bytes con cursor/EOF.

Bindings OPEN/READ/CLOSE reutilizan las tres funciones probadas con NativeLog.
**REGISTER/UNREGISTER son dos llamadas nuevas, todavía inferidas estáticamente.**
Leer sus fingerprints puede causar fault si la correspondencia de direcciones
no se cumple. Fingerprints no autentican firmware ni ofrecen sandbox/recuperación.
Contexto/privilegios FLAT/PROTECTED/KERNEL y memoria libre física siguen sin resolver.

Resultado build: ELF32 ARM LE ET_REL, ARMv8-M.mainline/Thumb/softfloat,
entry1, **2620bytes**, text972/alignment8, BSS36,17R_ARM_ABS32 y cero imports
sin resolver. SourceSHA
`2f18d1863a8bb49b017da9c3c217c43f44216d988b74a39e7bfbee9e9c0417c6`;
ELFSHA `713fe535880f2cbae928efe5199d15b0c39a01bc455aab819f8a534cbab4d424`.
Stack GCC propio: init40, read88, write24, uninit8bytes, sin callee/loader/Lua.
No implica heap total pequeño, RAM libre o soporteBSS físico ya probado.

No ejecutar ese ELF en S3: el guest CortexA7/hard usa otras direcciones y fops40.
S3 ya probó el core y otro adapter, no este candidato exacto. No declarar prueba
de callbacks/BSS/registro/retirada en RW4 a partir de compile o del éxito S3.

## Reproducibilidad y siguientes pasos

```powershell
node tools/research-rw4-driver-abi-r232.mjs
node tools/research-rw4-dispatch-r233.mjs
node tools/review-rw4-driver-contract-r234.mjs
node tools/build-rw4-step-r234.mjs
```

Verifican hashes de imagen/toolchain/bytes de dispatch; no entradas arbitrarias
ni ejecución firmware/hardware. Compilación con warnings-as-errors, revisión
ELF/relocs/atributos/sections y stack. Informes privados bajo artifacts/research/
rw4-driver-abi-r232,rw4-dispatch-r233,rw4-driver-contract-r234 y build/native-step-rw4-r234.
El follow manual de file_close se volvió reproducible en el reviewer R234.
No sobreescribir informes ni reejecutar pruebas aprobadas sin motivo.

Siguiente checkpoint único PC: carrier específico que valide ELF/marca/registro,
RPC/STOP/retiro y maneje pérdida de ACK/error/cierre sin descargar a ciegas;
después paquete/plan físico revisables. No existe nuevo perfil físico, autorización
o ensayo solicitado todavía. No Doom compilado/adaptado para RW4 en este paso.
