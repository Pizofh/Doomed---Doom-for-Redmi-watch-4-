# R288: segundo intento detenido en preflight; continuación ejecutada

**Actualización:** el usuario confirmó retorno normal y autorizó el intento3.
Se detuvo antes de INSTALL por dos bajas manuales posteriormente confirmadas.
Autorización consumida; ver [resultado y propuesta R289](doom-large-install-removals-r289.md).
El texto siguiente conserva el plan histórico, no una autorización vigente.

El segundo intento fue autorizado y ejecutado una vez. Terminó con
`LargeSessionRefused`: 5 frames / 185 bytes de control, cero partes MASS,
sin nueva solicitud INSTALL. Conexión cerrada y worker finalizado; los gates
Node/C# quedaron restaurados, reconstruidos y comprobados cerrados.
La confirmación visual del usuario tras este intento sigue pendiente.

La consulta independiente posterior conserva los mismos 13 IDs, exactamente
una esfera activa y ningún ID365219963. La selección difiere de la guardada
en el primer intento. El guard anterior comparaba el catálogo completo, por
lo que esa diferencia basta para explicar el rechazo antes de INSTALL.
No se registró el detalle de ese guard durante el intento; no se atribuye
el fallo a un cambio de permisos de borrado sin evidencia.

El journal privado original conserva attempt1
Created/InstallIntent/UploadIntent/Uncertain y attempt2 Created/Uncertain,
todos sin datos de upload. No se borra, renombra ni sustituye. El INSTALL
aceptado en attempt1 pudo reservar estado persistente aunque no hubo MASS.

## Corrección y comprobación en PC

`compareDoomCatalogs` compara IDs y permisos de borrado sin depender del orden.
Solo para retry-no-data permite otra selección previa: guarda la selección
ACTUAL y exige conservarla durante la instalación. La reanudación con posible
envío anterior mantiene su comprobación estricta. El reporte ahora distingue
DeviceInfo/CatalogPreflight e incluye resultados booleanos sin datos privados.

El journal admite una continuación adicional únicamente para el patrón
firmado exacto anterior, con todos los uploads nulos: attempt3. Un cuarto
intento queda bloqueado, incluso si el tercero falla antes de INSTALL.
16 casos nuevos y los 18 casos anteriores de retry pasan sin hardware;
también pasa la comprobación de gates cerrados. Cubren selección/orden,
entradas o permisos alterados, preservación del historial y límite de intentos.

## Plan concreto, todavía no autorizado

Mismo paquete R285: ID365219963, 4827044 bytes, SHA256
`d0fc0d8257e9a384b42129f312de99570b49dade455511d0fc5fddd80fecf048`.
`allow_native=false`: instalar no ejecuta C/Doom. No activar ni borrar esferas.
Modelo y firmware exigidos: M2315W1 / 2.2.86; misma identidad privada y clave.

Con aprobación explícita, reloj normal, observador y batería ≥50%:
habilitar temporalmente DEPLOYMENT/CONTROL_RETRY y C# LargePhysicalReviewed,
mantener RESUME cerrado, reconstruir y ejecutar prepare. Después, UNA vez:

```powershell
node tools/pc-doom-deployment.mjs retry-no-data
```

La sesión verifica firma/cadena y toma el catálogo actual. Si faltan entradas,
cambian permisos, aparece el ID propio o falla identidad/modelo/firmware,
se detiene. INSTALL/upload stock; solo offset cero, sin fallback a resume.
2362 partes por defecto, pausas de 100 ms, aproximadamente 4–6 minutos.
Ante rechazo/corte, parar sin repetir. El catálogo final debe conservar las
entradas y selección actuales y mostrar el paquete nuevo inactivo.
Finally: cerrar conexión/worker y restaurar gates, reconstruir y comprobar
el bloqueo. No seleccionar el launcher ni ejecutar insmod/rmmod.

Instalar escribe flash/filesystem stock y reboot NO revierte la instalación.
No escribe deliberadamente particiones, bootloader, recovery o firmware.
Retirada posible por mecanismo stock si el paquete queda registrado y la UI
responde; no hay borrado automático ni backup/recovery integral validado.
Peor fallo razonable: falta de espacio, transferencia parcial, bloqueo,
panic/reinicio o corrupción del filesystem; soft brick posible. No se dirige
ninguna operación a boot que deba causar hard brick; no existe garantía
integral. Ante fallo no reiniciar, flashear ni improvisar recuperación.
Se mantienen los límites del [plan original](doom-large-install-physical-plan-r286.md).
