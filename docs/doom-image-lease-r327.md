# R327: reservar el frame antes de construir Image

## Evidencia física R326 (DoomRefs R325)

Instalación RegisteredInactive, 316 partes escritas localmente, cierre y salida
del worker confirmados; sin selección automática ni verificación del contenido
remoto. Tras el único START aprobado, las fotos muestran:

| Campo | Valor decimal |
|---|---:|
| FIRST / LAST / DIMS | 24031607 / 30031607 / 03200200 |
| REFS / OPEN / CLOSE | 1 / 8 / 7 |
| CLSERR / READS / RDERR | 0 / 6 / 1 |
| SKERR / CFIRST / CLAST | 0 / 779 / 1296 |
| MAXREAD / RELERR / POS | 192278 / 1 / 4 |

779 = read/-11 (EAGAIN); 1296 = release/-16. La captura es la última lectura
programada de estado, no un muestreo adicional después del error. Un lector
permanece activo, sin close rechazado registrado. Usuario confirmó retorno a
su esfera y funcionamiento normal de menús/corona.

El transporte anterior adquiere un slot READY al leer el cuerpo PNG, mientras
Lua decide crear Image con `produced > 0`. Ese contador es acumulado: no implica
que un slot siga READY. El callback también puede devolver -11 si el serializer
no tiene preparada esa presentación. Las fotos no distinguen esas dos ramas ni
demuestran la ruta exacta seguida por el decoder propietario.

## Cambio concreto

Fuentes independientes R327 conservan los paquetes físicos previos. Command8,
solo desde el dueño UI tras START y antes de STOP/JOIN, reserva un slot READY y
prepara sus checksums antes de crear Image. Si no existe, devuelve -11 sin
consumir secuencia ni abrir lectores. Lua trata únicamente ese retorno como
pendiente y espera al siguiente Timer; otros errores siguen el cierre acotado.

La lectura del PNG ya no adquiere un frame ni prepara checksums. Los lectores
reabiertos ven el mismo slot READING hasta retirar Image/cache y command7. No
se fuerza ningún cierre, referencia, descarga ni escritura de frames. Se
conservan owner guards, límite8 lectores, packet128/version2, contadores,
STOP antes de release, CRC/RAM, zona4MiB y límites cooperativos anteriores.
No hay heap, bindings o imports nuevos, cambios de firmware, audio o partidas.

## Validación y límites

- Baseline R325, sin inyección de EAGAIN: 30 comprobaciones S3/VFS/stdio. Tras
  consumir/liberar el único frame, produced=1 y la siguiente lectura completa
  devuelve -11; se reproduce CFIRST779. El fixture modela la omisión de close
  y luego cierra únicamente su propio handle.
- Candidato R327: 129 comprobaciones S3/VFS/stdio. Reserva pendiente repetida
  no produce read ni referencias; productor posterior permite la reserva.
  PNG completo comparado con golden, lectores reabiertos/solapados, dos slots,
  secuencia, identidad UI, rechazo de reemplazo de lease y STOP/JOIN/retirada.
- 55 casos Lua (51 regresiones +4 nuevos): pendiente recuperable sin fault,
  renovación, pausa, STOP y errores write/close de command8. Archivos, motor y
  widgets simulados; el launcher compuesto también se analiza con Lua real.
- Paquete: 46 recursos exactos, SHA/ID/bytes fijos, siete escenarios simulados,
  rechazo de paquete alterado/carrier ausente, gate cerrado antes de datos
  privados/radio y journals anteriores preservados. R325 vuelve a pasar siete.
- Build ARMv8-M Thumb/soft ABI reproduce el ELF base R285 con sus objetos;
  mismo bindings.o SHA523ce18e38ea031ff706145b0cb41c6e63ba4d5b4f7cdf592a2c515bd2d90081.

Los tests nuevos no ejecutan decoder propietario RW4, motor ni hilos reales,
ni inspeccionan pixels decodificados. No prueban todavía la corrección física.
Dos fixtures iniciales fallaron en preparación/cierre del propio test: una
lectura de4 bytes tenía buffering stdio y otro invocaba uninit antes de rmmod.
Se corrigieron; el guest se reinició para retirar esos fixtures retenidos.
Los ensayos finales retiraron módulo/nodos/temporales sin reset para salir.
No hubo otra conexión ni ensayo en el reloj durante esta preparación.

Repro: `test-rw4-image-lease-r327.mjs baseline`, el mismo sin argumentos,
`build-doom-image-lease-r327.mjs`, `test-doom-lease-ui-r327.mjs`,
`package-doom-lease-r327.mjs`, `test-doom-lease-package-r327.mjs`.
Builders rechazan sobrescribir salidas revisadas. Evidencia/binarios privados
en artifacts/build ignorados. Plan físico separado, aún sin ejecutar.
