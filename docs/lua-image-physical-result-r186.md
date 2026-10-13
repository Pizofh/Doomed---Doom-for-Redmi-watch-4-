# R186 — LuaImage instalada; observación de pantalla pendiente

2026-10-12. Usuario responde «Sí, autorizo el ensayo y puedo observar el reloj»
al [plan R185](lua-image-physical-plan-r185.md). Alcance: un intento de instalación
del paquete fijo r184, selección/observación/retorno manuales y retirada exclusiva
opcional si se decide después. Sin C/Doom/firmware, sustitución o autoactivación.

## Artefacto y preparación

ID365219993, LuaImage, 9328 bytes, SHA256
`150f285b7e63cc99519b32cde0b93fe35784cc5ba2d60a5d01746f1064483e49`.
Fuente SHA256
`df7e732b18955e47d252ea08fe0e9af7b4ed3a526b83ed8dd2ee4846b20c0078`.
PNG96×64 empaquetado, 194 bytes, SHA256
`2988d113d2d69931201b4c4274a3828aaa49ef689352c9d18548e7c30730bfe1`.
El registro nuevo `tools/local/pc-rfcomm/lua-image-r185.json` no existía.
Gates habilitados temporalmente, Node solo r184. Prepare confirmó hashes
de paquete/fuente/build. Helper habilitado SHA256
`2cba3ac881023b41a7806cfa49826a636e1501e586c0f6ca5d54f5b3ca55912f`.
Copias privadas de exe/metadata/CLI habilitados en artifacts/lua-r186-reviewed;
archivadas como evidencia, no reejecutar directamente.

## Un intento físico

`node tools/pc-static-watchface.mjs install r184` se ejecutó una vez.

- RegisteredInactive, cinco partes; 9374 bytes de stream con cabeceras.
- TX total9764bytes,14frames enviados/16recibidos.
- Registrada y eliminable; la selección anterior se conserva, sin SET automático.
- Socket cerrado y worker terminado, exit0; sin error nativo.
- `transferAcceptanceVerified=false` se conserva en el reporte: no se interpreta
  como ACK final explícito del decodificador o prueba de render. La evidencia
  de registro procede del catálogo, no de ver la imagen.

Después del envío se cerraron inmediatamente ambos gates y se reconstruyó
el helper. GET independiente `node tools/pc-rfcomm.mjs watchfaces`: Complete,
HMAC/ACK/datos cifrados válidos, catálogo14→15, una activa. Las14 entradas
previas conservan IDs/active/canDelete; LuaImage presente/inactiva/eliminable.
Cierre y salida del segundo worker confirmados, exit0. No datos de batería
o firmware nuevos en ese GET; modelo/FW se validan en el preflight del ensayo.

Journal r184/contentKind lua-image/Registered, cinco partes, sin lock restante.
Reportes sanitizados privados en artifacts/lua-r186-reviewed. No claves,
direcciones, identificadores privados o paquetes Bluetooth crudos publicados.

## Estado final y límite

Node PHYSICAL_WRITES_REVIEWED=false, REVIEWED_VARIANT=r167; nativo
StaticPhysicalReviewed=false. Build cerrado SHA256
`e27d1857e68244ccd59183d9d54bc5453d95f29f398ba5e020098dcb3a5d8007`.
Prueba de entradas cerradas pasa sin llamadas de socket físico. No DELETE,
reinicio, cambio de vínculo ni transferencia nueva de las pruebas anteriores.

**Pendiente usuario:** seleccionar LuaImage una vez desde el selector stock,
observar panel oscuro, amarillo, segundo verde/rojo y cuatro cuadrantes con
cruz blanca; volver a habitual por Ajustes y comprobar navegación/pulsación
larga. No contador ni texto esperados. Si falla, no repetir selección ni borrar
a ciegas. Registro de instalación no demuestra Image/Lua/PNG físico funcional
en este paquete, salida de VM, memoria libre o compatibilidad C/ELF/Doom.
La propia inactiva describe el snapshot antes de selección manual.

**Siguiente checkpoint único:** obtener observación visual y retorno normal
de este paquete ya instalado. No nuevo envío mientras queda pendiente.
