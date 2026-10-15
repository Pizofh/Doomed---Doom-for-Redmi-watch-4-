# R282: launcher y WAD persistente integrados

DOOM original abre E1M1 desde un paquete completo en el emulador S3, responde
a movimiento/giro/disparo, pausa, cierra y vuelve a abrir sin reinstalación.
Tras reiniciar la VM, los 20 recursos conservan sus hashes y reaparece READY.
El candidato RW4 ya tiene la ruta persistente asignada, pero su launcher
mantiene `allow_native=false`. **No se instaló ni ejecutó nada nuevo en RW4.**

## Archivos y ejecución

El paquete separa Lua, ejecutable, WAD y etiquetas PNG propias. No incrusta el
motor ni el WAD como hexadecimal en el script. Lua controla la interfaz y el
ciclo de vida; C ejecuta el motor doomgeneric original. No hay traducción de
gameplay, renderer o IA a Lua.

| Perfil | ID | Ruta WAD compilada | Carga nativa del launcher |
|---|---|---|---|
| RW4 candidato ARMv8-M | 365219963 | /data/app/watchface/market/365219963/lua/doom1.wad | Deshabilitada |
| S3 PC ARMv7-A | 365799913 | /data/app/watchface/market/365799913/lua/doom1.wad | Solo VM revisada |

Antes de recompilar, el builder reproduce byte por byte el ELF previo usando
los objetos, bibliotecas y bindings revisados. Después recompila únicamente
adapter.c y transport.c: ambos utilizaban RW4_GAME_WAD. No recompila los 80
archivos originales del motor ni cambia los bindings o el backend de imagen.
El ELF nuevo no conserva las rutas provisionales /not-installed o /tmp.

RW4: ELF603728 bytes, SHA256
`5365bf23602cc9b4fc8a55a0e0e29459518614dc1b240d1a81182d76f70bdf29`.
S3: ELF610540 bytes, SHA256
`97a684758b8e19588a45bb2825f27a21f7454e4e5efba803f73a4a7ea8b28239`.
Ambos ET_REL/ARM/Thumb/base PCS, sin imports pendientes. Esto no demuestra la
compatibilidad física de todos los contratos RW4.

## Launcher

`doom/platform-rw4/launcher/controller.lua` contiene el ciclo de vida;
`main.lua` compone la UI sin fuentes LVGL. Las etiquetas son PNG generadas
con glifos propios. START siempre es manual. El perfil RW4 bloqueado no abre
archivos ni ejecuta shell al recuperar o pulsar START.

En el perfil habilitado se comprueban tamaño/cabecera ELF y cabecera/directorio
WAD. No se calcula un SHA completo desde Lua: los hashes completos se verifican
en PC al construir y comprobar los recursos. Estos chequeos breves del launcher
no autentican contenido arbitrario ni garantizan que no haya corrupción futura.

Solo se carga con registro vacío y sin los tres nodos propios. El launcher
registra una lease propia, ligada al hash esperado y al registro observado.
Las órdenes tienen secuencia y abren el control con r+b: no crean un archivo
normal si desaparece el nodo. El resultado de os.execute no se usa como prueba
de éxito; se comprueban salida capturada y postcondiciones.

EXIT borra el objeto Image, retira su caché/lease de presentación, pide STOP,
espera finished, hace JOIN y comprueba contador de allocations/frees y cleanup.
Solo después confirma identidad, llama rmmod y verifica registro y directorio
sin nodos. Conserva ELF/WAD; elimina únicamente sus archivos auxiliares propios.
Los controles mantenidos tienen PRESS_LOCK y desactivan gesture/scroll bubbling,
manteniendo navegación stock fuera de los botones. El crown sigue sin API.

Si la página se destruye, GC solo pide STOP: no llama LVGL, JOIN o rmmod. La
recogida del módulo retenido se hace al volver a la UI, tras comprobar su lease
y registro. Esa ruta nueva pasó tests simulados; en esta revisión el ensayo
real del paquete se centró en dos ciclos START/EXIT. No afirmar descarga
inmediata al abandonar por cualquier gesto o botón del sistema.

Un fallo conserva el estado para revisión y bloquea reintentos en esa página;
no fuerza kills, reinicios ni descargas de módulos de identidad dudosa.

## Paquete y pruebas

El Compiler.exe revisado se ejecuta offline sin ADB disponible. Corrige el ID
ignorado por el compilador y verifica 20 registros byte por byte y sin solapes.
El verificador distingue los registros de las rutas que aparecen dentro del
ELF: buscar una cadena única ya no sirve al compilar la ruta persistente.

| Paquete privado | Bytes | SHA256 |
|---|---:|---|
| DoomLauncher-rw4.face | 4827012 | 1d6df25e064336122ce56449856d828dd1e30532d4b8fcb0c1467a4343db799b |
| DoomLauncher-s3.face | 4833824 | ccea73b8d3d0109366fa09974cd5ff5239eb1aaf11184238dd4c324404f7867d |

Se reconstruyeron los paquetes con bytes idénticos al actualizar el informe de
presupuesto. Los informes iniciales se conservaron aparte. ELF, WAD, .face,
capturas y todos los resultados generados permanecen ignorados por Git.

22 casos Lua pasan con archivos, shell, C y widgets simulados: gate cerrado sin
I/O, fallo de assets, IDs/leases ajenos, captura previa, comandos, pausa/input,
DEFOCUSED de otro botón, GC y recuperación con cola procfs variable tras NUL,
salida, cleanup incompleto, errores de shell/registro y timeout sin descarga.
Se ejecutaron en el Lua real del emulador sin cargar módulos nativos.

El paquete S3 se instaló por su filesystem de PC, se seleccionó con la UI stock
y extrajo sus 20 recursos con hash correcto. Dos ciclos reales con pthread y
doomgeneric abrieron E1M1: 318 y 324 colores distintos en el viewport observado.
Movimiento, giro, disparo, pausa/resume y EXIT pasan. Al acabar no quedan módulo,
nodos ni lease; los assets siguen presentes. Después de un reset con registro
vacío, los mismos 20 hashes siguen iguales y el launcher muestra READY.

Resultados privados:

- `artifacts/emulator/doom-launcher-contracts-1792094882416/result.json`
- `artifacts/emulator/doom-launcher-test-1792095103022/result.json`
- `artifacts/emulator/doom-launcher-verify-1792095285976/result.json`

El paquete RW4 creció respecto al fixture anterior. El worker grande, aún
físicamente cerrado, sube su límite de 4861000 a 4900000 bytes; los perfiles
antiguos conservan 16/32KiB y 96 frames. La transferencia sintética usa ahora
exactamente 4827012 bytes y 2362 partes: pasan los diez escenarios compilados
de IPC/autenticación, parciales, bloqueo y cierre. Suite C#:5589 aserciones.
El modelo anterior y los gates físicos también pasan. El nuevo test Lua se
añade a CI con Lua5.4 de Ubuntu, sin WAD, firmware o secretos.

## Reproducción y límites

Con los inputs revisados y las etapas previas ya disponibles:

```powershell
node tools/build-doom-launcher.mjs rw4
node tools/build-doom-launcher.mjs s3
node tools/package-doom-launcher.mjs rw4
node tools/package-doom-launcher.mjs s3
node tools/test-doom-launcher.mjs
```

Los builds completos revisados no se sobrescriben. El empaquetado permite una
revisión de metadata solo si el payload compilado permanece idéntico. La prueba
GUI requiere seleccionar DoomLauncher en la VM; después:

```powershell
node tools/doom-launcher-emulator.mjs test
node tools/doom-launcher-emulator.mjs verify
```

La memoria estática RW4 sube a899092 bytes. Con el pico runtime medido antes
en S3,6583985, y stack32768, el subtotal orientativo es7515845 bytes antes del
decoder, loader y SO. No es una medición de memoria libre RW4 ni prueba de un
bloque contiguo de6MiB disponible. El formato gráfico/threads/bindings siguen
requiriendo evidencia física para el motor completo.

Próximo: cerrar el despliegue físico con plan/hash de este paquete, journal
ligado al reloj y preflight de memoria. El nuevo paquete aún no está aceptado
por el preparador antiguo R278 ni habilitado para enviarlo. No activar la carga
RW4 o modificar gates automáticamente. R270 sigue siendo el último ensayo físico.
