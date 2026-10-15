# R271: motor original y salida compilados para RW4

Trabajo únicamente en PC. No se abrió una conexión física ni se envió otro
paquete al reloj. R270 sigue siendo la última operación física completada.

Los80 archivos originales de doomgeneric, revisión
`dcb7a8dbc7a16ce3dda29382ac9aae9d77d21284`, compilan con ARMv8-M.mainline/Thumb,
soft-float,320×200 y sin sonido. Se verifica cada Git blob de los181 archivos
del snapshot y las herramientas GNU previamente revisadas. El código original
permanece intacto; solo se genera el mismo overlay de salida I_Quit/I_Error
que ya utilizaba el port S3. No se recreó gameplay o renderer.

La aritmética AEABI se enlaza desde libgcc para thumb/v8-m.main/nofp, SHA256
`4de693594a790a5f5004e6d5937a7ff9eec6df2c616b5d7a883a631bf3534dcd`.
No quedan imports AEABI. Usar soft-float para nuestro código evita importar
funciones flotantes por la ABI S3; no demuestra la ABI de atof/fabs del RW4.

## Runtime y prueba de salida

Se reutiliza el algoritmo de recursos read-only del runtime S3, fijado por
SHA256, generando runtime-device.c fuera de Git. Conserva seguimiento de
allocations, límites, streams opacos, denegación de escrituras del motor y
limpieza. No se modifica el runtime S3 ni sus artefactos/revisiones anteriores.

El jmp_buf de112bytes del S3 se sustituye por una implementación propia de
40bytes: r4-r11, SP y LR. [jump.S](../doom/platform-rw4/device/jump.S) se usa
solo para nuestro código con base PCS/soft-float, en el mismo owner y con el
frame del run vivo. Las llamadas externas deben haber retornado antes del
salto. No se copia una estructura privada del firmware ni se usa su setjmp.
No es una excepción que recupere corrupción de memoria o un crash del sistema.

Una prueba propia se compiló sin instrucciones FP para el S3 y ejecutó dos
retornos desde tres llamadas anidadas: valor7 y valor0 normalizado a1.
Sentinels y dirección del stack conservaron su valor. Resultado pasado;
módulo rw4jump271 y ELF temporal retirados. Usa la misma fuente jump.S,
compilada para el guest S3: no prueba ejecución del ELF RW4 ni toda la ABI.
El primer intento fue rechazado por Werror/infinite-recursion antes de ejecutar;
se reemplazó el fixture recursivo por tres funciones anidadas y se conservó su log.

Enlace sin EHABI unwind: el port utiliza salida no local propia, no unwinder C++.
Se descartan .ARM.exidx/.ARM.extab; ya no queda R_ARM_PREL31. Siguen
R_ARM_ABS32/THM_CALL/THM_JUMP24 pendientes de revisar para la carga real.

## Resultado y límites

| Concepto | Resultado |
|---|---:|
| Objeto motor + runtime |444560bytes |
| .text |128904bytes |
| .rodata |100264bytes |
| .data |60004bytes |
| .bss, incluidos COMMON |244836bytes |
| Total estático |534008bytes |
| Zona predeterminada de Doom |6291456bytes |
| DG_ScreenBuffer |256000bytes |
| Imports todavía pendientes |36: seis DG y treinta servicios/libc |
| Warnings upstream conservados |111 |

Subtotal7081464bytes antes de loader, heap overhead, buffers de entrega, stack,
streams y otras reservas. No es consumo medido ni prueba de que quepa en RW4.
No se añade el WAD completo al presupuesto RAM: su almacenamiento y lectura
desde flash siguen pendientes. Stack individual máximo del motor504bytes;
no acota profundidad total ni stack de servicios externos.

Objeto `engine-runtime-port.o`, SHA256
`6206720ca434b8903a2ba41c29ccb5efce304341839e5cafa3e83cc4a695223a`.
**No es un módulo cargable**: no tiene entry de inicialización, adaptador DG,
transporte/worker o bindings finales. No renombrarlo a ELF para instalarlo.

## Investigación agrupada de contratos

Sobre la imagen candidata2.2.86 fijada se contrastaron llamadas y registros,
sin ejecutar la imagen. Los desensamblados propietarios quedan privados.

| Candidato | Offset de archivo | Evidencia / límite |
|---|---|---|
| malloc/free sobre el mismo heap |0x1f5180 /0x1f513c | Wrappers del mismo puntero global; loader asigna y libera por estas rutas. Inferencia estática, no llamadas físicas nuevas |
| fseek /ftell |0x1ec2b8 /0x1ec328 | Lua seek llama a ambos; long32 extendido a seek64 y posición en r0/r1 interna. FILE permanece opaco; sin prueba C física de seek |
| feof/ferror/clearerr |0x1ec970 /0x1ec984 /0x1ec9cc | Funciones simples sobre flags de stream; no adoptar layout FILE en el port |
| clock |0x1b9934 →0x1b98e4 | Lua os.clock llama esta ruta; devuelve64bits en r0/r1 y convierte/divide por10000. La rutina timespec relacionada también divide por10000; monotonicidad/origen hardware pendientes |

La primera búsqueda exigía inicio de string y perdió nombres internados como
suffix. La segunda admite suffix pero exige referencias/tablas y calls; no
convierte el comando NSH free en la función libc free.
pthread_create/join y el driver32bytes conservan los análisis previos R229/R234.
No se enlazan automáticamente estas direcciones por encontrar sus nombres.

## Reproducción y continuación

```powershell
node tools/build-doom-rw4.mjs
node tools/build-doom-rw4.mjs runtime
node tools/test-doom-rw4-jump.mjs
```

El segundo comando reutiliza el objeto motor comprobado: no recompila los80 C.
El tercero acepta solo el QEMU owned S3 por127.0.0.1:5039/emulator-5554 y ADB
fijado; nunca USB. No descarga herramientas ni instala dependencias nuevas.

Continuar dentro del único checkpoint de preparación PC: completar servicios
libc y reloj con ABI contrastada, worker con cierre verificable, adaptador de
frames/controles y ruta persistente WAD. Después preparar el ensayo corto E1M1
para revisión, sin intercalar por defecto más payloads físicos pequeños.
Memoria física libre, rendimiento y recuperación integral siguen pendientes.
