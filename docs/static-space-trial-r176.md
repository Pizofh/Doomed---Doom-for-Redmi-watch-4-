# R176 — mismo paquete tras liberar esferas manualmente

2026-10-12. El usuario indica: «ya eliminé varias. las acabo de eliminar,
vuelve a intentar». Autoriza un único reintento del paquete r173 del
[plan R174](static-id-trial-plan-r174.md). No se borrarán otras esferas desde
PC ni se activará la nueva automáticamente. Mismo riesgo y recuperación.

ID 365219990; 25224 bytes; SHA256
`90069d708bea26770e85464c087dfce51ae3640e565ab33ad44f78526d5f35e5`.
No scripts, Lua/C/Doom ni firmware. Ambos registros anteriores se conservan
intactos. Nuevo registro exclusivo:
`tools/local/pc-rfcomm/static-watchface-r173-after-space.json`.

Comando autorizado una vez:

```powershell
node tools/pc-static-watchface.mjs install-after-space r173
```

Exige catálogo fresco con menos de 21 entradas antes de registrar intención
o enviar INSTALL, además de modelo/FW, hash y ausencia de colisión habituales.
La comparación posterior usará este catálogo nuevo: el usuario eliminó
entradas intencionalmente, por lo que no se compara contra el antiguo de 21.
Una fase incierta no se reanuda ni reintenta automáticamente.

Build revisado SHA256:
`ead15a5e5ac88f6d43cdd98fddc849ec8adbdc58e9d19901f708544bf204880b`.
Prepare verificó paquete, fuentes y build; copias privadas en
`artifacts/static-r176-reviewed`. Tras el intento cerrar ambos gates y
reconstruir. No ejecutar las copias archivadas.

Verificación offline: 12 escenarios de transferencia y 22 de sesión para
r173, condición de reducción que rechaza antes de mutar, gates de ambas
acciones nuevas cerrados.

## Resultado físico

Preflight: **11 esferas** tras las eliminaciones manuales del usuario. Se
cumplió la condición de reducción antes de solicitar INSTALL.

`RegisteredInactive`: archivo enviado en 13 partes, 25302 bytes de stream
con cabeceras, 25814 bytes TX totales, 22 frames TX/16 RX. Catálogo confirma
el ID propio, inactivo y eliminable; la esfera anterior sigue activa. Cierre
del socket y salida del worker confirmados, exit 0. Ningún SET o DELETE.

GET independiente posterior: **12 esferas, una activa**. ID propio presente,
inactivo y eliminable; los 11 IDs anteriores, sus flags y la selección
anterior se conservan. Registro nuevo `Registered`, 13 partes. Esos datos
confirman presencia, no render por sí solos. El campo de reporte
`transferAcceptanceVerified:false` conserva esa distinción. El reporte CLI
mantiene etiqueta R174 del perfil; esta ejecución se identifica como R176
en la documentación y su directorio de evidencia.

Usuario seleccionó la esfera y respondió **«se ve bien»** a la comprobación
de texto/bloques de colores: render físico confirmado por observación del
usuario. El retorno a la esfera habitual y los menús todavía no fue
confirmado por separado. No se retiró el paquete: permanece instalado.

Ambos gates restaurados a false, variante revisada r167. Build cerrado:
`3dbcb5dab5df5dcec024963beba36636c64a2de5e876535110818de1ccba7d1e`.
Test de gates Node/native pasa, sin operaciones físicas. Registros originales
inciertos conservados; no convertirlos en recibos de esta instalación.
Una futura retirada propia usa el registro `after-space`, nunca r173 original,
tras comprobar inactivo/eliminable y revisión del paso.

**Conclusión:** el mismo paquete antes rechazado con estado 3 se registró y
renderizó después de liberar esferas. Compatible con el aviso de espacio
insuficiente [verificado en Mi Fitness](static-id-physical-result-r175.md).
No prueba la cuota exacta ni elimina posibles restricciones para otros IDs.

**Siguiente checkpoint:** preparar en PC una esfera Lua mínima que solo
muestre un texto, documentando lifecycle/salida y riesgo antes de proponer
su prueba física. Ningún Lua, C, ELF, Doom o cambio de firmware ejecutado en
M2315W1 por este ensayo; Doom funcional sigue demostrado solo en emulador S3.
