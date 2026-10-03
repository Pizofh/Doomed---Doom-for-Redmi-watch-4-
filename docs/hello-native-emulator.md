# Hello C ejecutado y descargado en el emulador

Resultado del 2026-10-03: código C propio ejecutado mediante `insmod` en MiWatchEmulator v1.0, guest Xiaomi Watch S3. Dos ciclos de carga, mensaje y descarga completados, sin reiniciar entre ellos. No es una prueba del RW4 físico ni un proceso con aislamiento de memoria.

## Pruebas observadas

| Variante | Resultado | Evidencia local ignorada |
|---|---|---|
| Import normal `puts` | `nsh: insmod: insmod failed: 2`; módulo ausente, initializer sin mensaje | `artifacts/emulator/hello-import-1791044628039/` |
| Enlace al símbolo `puts` del guest exacto | Mensaje recibido por ADB, registro y descarga correctos | `artifacts/emulator/hello-bound-1791044700042/` |
| Reconstrucción y segundo ciclo | Mismo SHA256 del ELF; mensaje, registro y descarga correctos | `artifacts/emulator/hello-bound-1791044865839/` |

Extractos de los logs, sin datos del reloj:

```text
RW4 emulator: hello C

NAME                 INIT   UNINIT      ARG NEXPORTS     TEXT     SIZE     DATA     SIZE
rw4hello         0x4145a121        0        0        0 0x4145a120       52        0        0
```

Tras `rmmod rw4hello`, `lsmod` solo muestra el encabezado. `uname -a` sigue respondiendo con NuttX / Xiaomi Watch S3. La captura `artifacts/emulator/screenshots/after-hello-c.png` sigue mostrando TouchEvents. Esto demuestra continuidad visual y del shell, no una prueba exhaustiva de todas las funciones ni ausencia de fugas.

Los payloads se copiaron a `/tmp`, se verificaron por readback SHA256 y se borraron después de descargar el módulo. No se instaló persistencia nativa, ni se modificó firmware, particiones o bootloader. Antes de cada carga se copió el disco de datos con QEMU pausado; ese respaldo no contiene RAM ni constituye una comprobación de consistencia del filesystem.

## Contrato y enlace

El [desensamblado del loader exacto](native-loader-emulator.md) confirma que ET_REL llama a `textalloc + e_entry`, pasando información del módulo. La entrada devuelve un entero y `rmmod` admite uninitializer nulo. Este hello no retiene referencias, crea tareas, registra callbacks ni asigna recursos propios.

La build usa Cortex-A7, Thumb-2, EABI5 y argumentos hard-float. El módulo es ET_REL, entry `0x1` con bit Thumb, sin startup/newlib/libgcc. Sus dos relocations son `R_ARM_ABS32`, admitidas por el guest. La función C tiene 28 bytes; el literal ocupa 22; `lsmod` reporta 52 bytes de texto asignado. Archivo ELF: 1.020 bytes. **52 bytes no es el consumo total ni pico de RAM**: faltan metadata, buffers del loader, stack y efectos de libc.

El import normal no funcionó en este experimento. Allsyms existe, pero no se demostró que el loader la use como tabla de imports. No inferir que todas las formas de carga o todos los símbolos estén bloqueados.

Para la variante funcional, el script obtiene `puts` de la tabla de símbolos ELF del guest identificado por SHA256, conservando el bit Thumb, y lo enlaza como símbolo absoluto mediante `--defsym`. No se utilizan direcciones de MiWatchNativeApps, otros firmwares S3 ni otro dispositivo. La llamada indirecta larga evita el límite de distancia de branches. Es un enlace dependiente de esta imagen, **no una API estable o un backend portable al BES/RW4**. Los helpers rechazan otra imagen; no deben adaptarse al reloj físico sin investigación y aprobación independientes.

## Toolchain revisada

Arm GNU Toolchain 14.3.Rel1 (Build arm-14.174), GCC 14.3.1 20250623; binutils 2.44.0.20250616.

- ZIP original Arm Keil: 290.006.806 bytes, SHA256 `864c0c8815857d68a1bbba2e5e2782255bb922845c71c97636004a3d74f60986`, coincide con el checksum descargado del mismo origen.
- 7.665 entradas; 1.148.190.802 bytes expandidos; sin rutas absolutas o traversal detectados.
- Extracción local `tools/local/arm-14.3-review`; sin instalador, PATH global, cambios de ExecutionPolicy o SDK adicional.
- GCC, cc1, assembler, linker, objdump y readelf inspeccionados como PE x64; imports de DLLs del sistema. Hashes de esas piezas fijados en el script de build. Manifest y documentación GNU revisados. No se ejecutó GDB ni otros binarios del paquete.
- Comparar con un checksum del mismo origen verifica integridad de descarga; no significa firma criptográfica independiente ni reproducir el compilador desde fuentes.

## Reproducción en este PC

Con el guest exacto y la toolchain revisada presentes:

```powershell
node tools/build-hello.mjs
node tools/run-hello-emulator.mjs bound
```

La build compila y enlaza ambas variantes, guarda readelf/desensamblado y exige el layout ABI revisado. La ejecución comprueba ownership de QEMU y ADB dedicado 5039, selecciona únicamente `emulator-5554`, respalda el disco, verifica el payload transferido, carga, consulta `lsmod`, descarga y limpia el archivo temporal. Rechaza un módulo previo con el mismo nombre. Un timeout del cliente no garantiza terminar código guest: ante error de transporte, inspeccionar antes de reintentar.

ELF funcional SHA256: `125cc7167fb0ae27c6c598504e0604c679e838ea5c8eb781e8c56b4f34559008`. ELF con import: `a2fad912be8f2cd9082bf1fa8c05977530756ac480bd09263cb99b20a844b72c`. La reconstrucción produjo los mismos hashes en este PC; no se afirma reproducibilidad entre plataformas/toolchains.

No hay CI para la variante enlazada: depende de una imagen propietaria local que no publicaremos. Una compilación CI de la variante con import puede evaluarse por separado, sin convertirla en prueba de ejecución.

Siguiente checkpoint: dibujar un patrón simple desde C y retirarlo limpiamente en el emulador, tras caracterizar una API de display y su ownership. DOOM, input C y persistencia del ejecutable continúan pendientes. Gate físico cerrado.
