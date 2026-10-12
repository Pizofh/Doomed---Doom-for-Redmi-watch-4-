# R174 — ensayo limitado del ID alternativo, preparado sin ejecutar

2026-10-12. El usuario pidió continuar preparando la prueba del ID alternativo.
Esta sesión no utilizó Bluetooth, teléfono, ADB o reloj. Gates físicos cerrados.

## Delta respecto del ensayo R172

| Campo | Variante originalr167 | Alternativar173 |
|---|---|---|
| ID | 365799910 | 365219990 |
| SHA256 | 7df88688c61e63b1aaab208ddf2b3976bf912fbaa08c01bf6f0d0e986ad9e93a | 90069d708bea26770e85464c087dfce51ae3640e565ab33ad44f78526d5f35e5 |
| Archivo | artifacts/static-watchface-r167/RW4Probe-id-only.face | artifacts/static-watchface-r173/RW4Probe-id-alternative.face |
| Registro privado | tools/local/pc-rfcomm/static-watchface-r169.json | tools/local/pc-rfcomm/static-watchface-r173.json |

Ambos archivos25224bytes. Solo cambian tres bytes del ID, offsets43/44/47.
Contenido imagen, tablas y byte5=0 iguales. No scripts, C, Lua, ELF, WAD, OTA
o firmware. El prefijo nuevo coincide con el observado en17esferas instaladas;
no demuestra una regla del firmware ni que el ID causara el rechazo anterior.

El registro anterior queda intacto en estado incierto. El nuevo usa su propio
archivo; no borra, reinterpreta ni sustituye el anterior. No es una estrategia
para resumir una transferencia parcial. En R172 no se envió ningún archivo y
el catálogo posterior quedó igual; ausencia de staging interno no demostrada.

## Flujo concreto propuesto

Antes de solicitar una escritura, el adaptador verifica paquete/ID/hash y
build, autentica, reconoce modelo/FW2.2.86, consulta catálogo, rechaza colisión
del ID nuevo y exige una esfera activa. Guardará intención en el registro
nuevo antes de INSTALL. Si es rechazado, guardará fase/código sanitizado y
cerrará, sin repetir ni enviar partes. No se probarán IDs adicionales.

Comandos actualmente bloqueados:

```powershell
node tools/pc-static-watchface.mjs install r173
node tools/pc-static-watchface.mjs remove r173
```

Solo tras revisión del cambio, habilitar temporalmente la variante r173 en
Node y el worker, reconstruir/fijar nuevo hash, verificar prepare y hacer
**un intento**. No autoSET. Después cerrar otra vez ambos gates y guardar el
resultado. Mantener vínculo PC durante el bloque; no migrar a Mi Fitness ni
pedir emparejamiento sin un problema concreto.

Si queda registrado: comparar catálogo, pedir al usuario confirmar UI y
observar la esfera por el selector stock. No seleccionar desde PC. Volver a
la esfera anterior; la retirada exige propio inactivo/canDelete y recibo del
registro r173, verifica ACK y desaparición del ID sin perder otras entradas.
Un registro o callback de envío no confirma render/aceptación completa.

Si vuelve a rechazarse, no saltar a más IDs ni borrar esferas por cuota supuesta.
Si chunk/resume/cierre son inesperados, conservar evidencia y detener.

## Riesgo y recuperación

Aplica el [plan físico R169](static-watchface-physical-plan-r169.md): almacenamiento
persistente de esfera/registro, no revertido por reboot. Ningún comando de
particiones crudas, bootloader o firmware modificado. Posible bloqueo/UI o
reboots; soft brick no descartado. No garantía de riesgo cero ante bugs del
firmware. Gestión stock y reboot documentados; recovery integral2.2.86 no
validado. Se mantiene necesidad de poder manejar el reloj si hace falta.
No retirar otras esferas o actualizar firmware como fallback.

## Implementación y verificación local

`static-watchface-spec.mjs` contiene únicamente dos perfiles fijos e inmutables,
con rutas, ID y SHA exactos. `prepareStatic` exige el hash correspondiente al
perfil; no acepta IDs/archivos arbitrarios. Una etiqueta de CLI no habilita
la escritura: también debe coincidir la variante de código revisada y ambos
gates deben estar abiertos. Ahora siguen false y REVIEWED_VARIANT=r167.

El registro liga variante/ID/hash a target. Recibos de variantes distintas
se rechazan antes de conectar. Los registros originales schema1 sin campo
variant conservan lectura como r167; no se migran ni escriben por esa lectura.
El healthcheck reconoce ambos IDs previstos y expone solo sus flags, sin
catalogar IDs ajenos ni probar ownership/render por presencia.

Pruebas locales:

- Ambas variantes:12escenarios de codec/API y22 de wire/IPC/journal por variante.
- Rechazo de variante/hash incorrectos y registro de otra variante, sin abrir link.
- Worker nativo:258assertions offline; gates de install/remove de ambos perfiles
  y entrada nativa cerrados comprobados.
- Regresión de consultas y9healthchecks sintéticos, incluida presencia del nuevo
  ID, más1healthcheck IPC. Sin sockets físicos.
- `prepare r173`: OfflinePrepared, paquete/hash/build confirmados, physicalEnabled=false.

Build cerrado actual SHA256:
`b0a415a8c938fadffc0cba052ac52f93f075e885da9b7c04c05a5860252f2a86`.
La habilitación requerirá otro build y hash; éste no acredita una ejecución física.

```powershell
node tools/test-static-watchface-transfer.mjs r173
node tools/test-static-watchface-session.mjs r173
node tools/pc-rfcomm.mjs build
node tools/pc-rfcomm.mjs test
node tools/test-static-watchface-gates.mjs
node tools/pc-static-watchface.mjs prepare r173
```

**Siguiente checkpoint:** revisar el paquete/ID nuevos para un intento físico
limitado. No interpretar preparación offline como instalación o resolución
de la causa del rechazo. Ninguna evidencia nueva de Lua/C/Doom físico.
