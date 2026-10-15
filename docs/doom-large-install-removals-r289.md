# R289: dos bajas manuales confirmadas; paquete aún no enviado

El usuario autorizó UN intento conforme al plan R288, con observador y batería
≥50%. Se ejecutó retry-no-data una vez: modelo/firmware correctos, catálogo
actual de11 entradas frente a13 anteriores, LargeSessionRefused en
CatalogPreflight. 5frames/185bytes de control, cero MASS y sin nuevo INSTALL.
Conexión y worker cerrados. Gates restaurados en finally, helper reconstruido
y prueba de entradas cerradas pasada. El usuario confirmó que borró dos
esferas y que esfera/menús funcionan normalmente. Esa aprobación está consumida.

El catálogo histórico era una condición demasiado estricta entre sesiones:
las dos bajas fueron deliberadas. La corrección mantiene la comprobación
de integridad durante cada transferencia y acepta ese cambio previo acotado.
No se ha vuelto a conectar al reloj después de la corrección.

## Continuación preparada, pendiente de autorización

Mismo paquete R285: ID365219963, 4827044 bytes, SHA256
`d0fc0d8257e9a384b42129f312de99570b49dade455511d0fc5fddd80fecf048`.
Sin cambiar bytes, `allow_native=false`, sin activación ni borrado de esferas.
No ejecuta C/Doom. Exige M2315W1/FW2.2.86 y misma identidad privada.

El journal firmado conserva todo el historial: attempt1 control sin MASS;
attempt2 y3 únicamente Created/Uncertain, sin before/upload. La continuación
admite attempt4 solo para ese patrón exacto y todos los uploads nulos. El
catálogo remoto debe tener exactamente DOS bajas frente al original, ambas
eliminables; todos los IDs supervivientes y permisos deben coincidir. No
acepta altas, otros cambios de permisos ni otro número de bajas. Guarda y
conserva la selección ACTUAL. Un quinto intento queda bloqueado incluso si
el cuarto falla antes de INSTALL. No se borra ni sustituye el journal.

Con nueva autorización y usuario observando, batería≥50%, sin otro cliente/OTA:
habilitar temporalmente DEPLOYMENT+CONTROL_RETRY y C# LargePhysicalReviewed;
mantener RESUME=false, reconstruir/verificar helper y ejecutar prepare.
Después UNA ejecución:

```powershell
node tools/pc-doom-deployment.mjs retry-no-data
```

INSTALL/upload stock, solo offset0, sin reanudación/fallback/repetición
automáticos; pausas100ms y hasta2362partes, aproximadamente4–6min. Al terminar
verificar catálogo inactivo conservando las11esferas/selección actuales.
Ante rechazo/corte parar. Finalmente cerrar worker/conexión, restaurar gates,
reconstruir y comprobar bloqueo. No seleccionar launcher, insmod ni rmmod.

## Riesgo y reversión

Instalación escribe flash/filesystem stock; reboot NO la revierte. No dirige
escrituras a particiones, bootloader, recovery o firmware ni cambia firmware.
Sin backup integral validado; fuentes/paquete/hash y catálogo/journal privados
son evidencia, no imagen recuperable del reloj. Retirada mediante mecanismo
stock solo si el paquete queda registrado y la UI responde, sin borrado
automático. Se mantiene el posible estado reservado por el primer INSTALL.

Peor fallo razonable: transferencia parcial, falta de espacio, UI bloqueada,
panic/reinicio o corrupción FS; soft brick posible. No se dirige una operación
a boot que deba causar hard brick, sin garantía integral. Recovery integral
no validado. Ante fallo no reiniciar/flashear/cambiar vínculo ni improvisar
recuperación. Se mantienen los límites del [plan R286](doom-large-install-physical-plan-r286.md).

## Validación PC

14casos nuevos prueban exactamente dos bajas, selección actual, historial y
sesión completa sintética. 17casos de catálogo y18de retry siguen pasando:
49casos en total, sin radio. Bloquean altas, bajas incorrectas, permisos
alterados, retirada de entrada no eliminable y quinto intento. Las pruebas
no demuestran recepción o integridad física del paquete.

Resultado local: artifacts/doom-deployment-physical-r289/attempt-result.json.
No logs crudos, claves, direcciones ni publicación remota.
