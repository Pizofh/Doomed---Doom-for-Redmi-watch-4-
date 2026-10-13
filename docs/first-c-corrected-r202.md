# R202 — FirstC2 preparada en PC; hardware cerrado

2026-10-13. Corrige la preparación de [FirstC R197](first-c-adapter-r197.md)
sin modificar su paquete, archivos o instalación física. El usuario confirmó
retorno/navegación normales tras la UI fallida; no hay ejecución C física confirmada.

## Cambios

main-r202.lua incluye las factories Lua en el propio script. No llama a global
load/loadfile/dofile. Primero construye la UI R199, cuya imagen/botón/toque/salida
se probaron con LVGL real en [UiOnly S3](ui-only-emulator-r200.md). Después prepara
el backend bajo pcall; un fallo deshabilita el botón y marca END rojo, manteniendo
las etiquetas visibles si su creación tuvo éxito. Abrir la esfera no carga C.

shell-adapter-r202.lua incorpora [normalizador puro R201](first-c-path-r201.md):
valida ASCII/límite/ruta absoluta antes de eliminar separadores internos repetidos;
exige /365219998/lua/. Nunca usa entrada de la UI como comando/ruta. Conserva
comparación completa del ELF, captura propia acotada, marca previa/readback,
parser estricto y carga/retirada solo una vez. El controlador puro R196 no cambia.

El módulo propio es rw4minr202. Si cualquier inventario reconocido incluye el
anterior rw4minr197, el parser devuelve recognized=false y el controlador detiene
la secuencia. **No carga ni descarga el módulo anterior.** Si aparece antes de
insmod, no se escribe la marca ni se carga el nuevo. Si aparece después, se detiene
sin atribuir el inventario al nuevo ni descargar a ciegas. Un módulo nuevo propio
ya presente también bloquea la carga. Todos los inventarios deben ser completos.

Marca/captura nuevas: firstc-attempt-r202.txt y firstc-capture-r202.txt, solo en
el directorio propio. No borrar/rearmar. Un actor/click; flush/readback no garantiza
durabilidad por powerloss ni exclusión entre VMs. Ningún timeout duro o sandbox.

## Validación

`node tools/test-rw4-adapter-r202.mjs`:38 casos en Lua5.4 S3 con archivos tmpfs
reales y executor/widgets simulados. Fuente materializada de producción exacta,
ELF solo como datos. Incluye path //lua/, ausencia de global load, UI visible
con backend ausente, marca/reentrada, módulo anterior antes/después de carga,
módulo propio previo y errores de inventario/I/O/captura/carga/retirada.
lsmod real antes/después idéntico; árbol temporal propio retirado.

Un primer test del harness pasó el segundo retorno de string.gsub como argumento
missing_system, deshabilitando accidentalmente el backend del caso de ruta.
Se corrigió encerrando la expresión; no cambio de código/condición de producción.
Fixture fallida con bytes/propiedad/inventario comprobados retirada; reporte
preservado en artifacts/emulator/adapter-r202-failed-harness. Final válido:
artifacts/emulator/adapter-r202/summary.json. El runner ahora retira fixtures
propias incluso si el test Lua falla. No C ejecutado en ningún caso.

UI factory sin cambios respecto a R200 (LVGL real); normalizador sin cambios
respecto a R201 (16 casos). No se instaló el paquete armado FirstC2 en S3:
su Cortex-A7 no es el ARMv8-M del ELF candidato RW4.

`node tools/package-first-c-r202.mjs` exige esos reportes/hashes, compiler
EasyFace revisado sin ADB, y cuatro registros serializados byte a byte.
Resultado FirstC2 ID365219998,24.736bytes; ELF784bytes sin cambios.
Fuente15.267bytes. Reporte artifacts/first-c-r202/review.json.

Perfil r202 registrado cerrado. Prepare R203 verifica fuentes/build y13partes;
transferencia offline12 casos y sesión IPC30 casos para r202, sin sockets.
Entradas físicas Node/C# cerradas y comprobadas. Nuevo journal first-c-r203.json
todavía no creado. No Bluetooth/teléfono/reloj, envío, activación o retirada.

| Identidad | SHA256 |
|---|---|
| FirstC2 paquete | 7229a104de8cc8031ab3e689e0b11564b371aa55a7d2c3182a28d3d3710e4e67 |
| Lua materializada | 1ef5835d1c9c2d062acf13190a398ba97af1a9d3e82cc3e0788d6e70a801b40f |
| Adapter materializado | f6290af9cb78151d5395f5de1980f376edcc861163593498b8064913b65594a9 |
| ELF mínimo | 8248f76bdabd9c44aee6df46e8ba4d8c999acc9ca1d0c8367e1652ce0675da6d |
| Helper PC cerrado | dcb923c4f3fefdf9756c22401b211a6be286306b39919c84a76673d86538c617 |

Próximo paso solo tras revisar [plan físico R203](first-c-corrected-physical-plan-r203.md).
El éxito demostraría inicialización/registro/retirada, no logging hello,
libc/display/timers/input nativos, Doom, RAM suficiente o aislamiento/recovery.
