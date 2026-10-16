# R325: DoomRefs, contadores C del ciclo de imagen

**Preparado y probado en PC. Pendiente de autorización física.** Esta variante
mide el motivo de la referencia retenida; no afirma corregir el render.

## Paquete fijo

| Elemento | Valor |
|---|---|
| Destino |Redmi Watch4 M2315W1, firmware2.2.86 |
| Esfera nueva |DoomRefs, ID365219951; cinco barras naranjas |
| Paquete |644796bytes,46recursos; incluye C/Lua/imágenes propias |
| Archivo |`build/doom-refs-r325/package/DoomRefs-id-only.face` |
| SHA256 paquete |`f514f46706ec100481af51453dcf3b54f63b24383145fce17fdd81f1a136a8c0` |
| SHA256 Lua |`fa662c5a7c2c52433cf709a7f0200de3cd7c85f30890e76249c6a1468140bb69` |
| ELF |605684bytes; módulo rw4png325 |
| SHA256 ELF |`94531cff5e62e5824b272b11cbbe7ee67df0479754b23581d6caca1e037370af` |
| SHA256 transport |`97fdddd8f72fa39a67fa4a1984f1071da9078fde558d542d3ab2cd0f6c5cd6ce` |
| Journal privado nuevo |`tools/local/pc-rfcomm/doom-deployment/refs-r325.jsonl` |

WAD no incluido: reutiliza DoomLauncher365219963. El nuevo ELF y auxiliares
tienen base951 propia; no reemplaza archivos/esferas ni adopta módulos previos.
Conservar carriers actuales. No inventario extra ni supuesto de número de esferas.

## Cambio técnico

Wrappers de open/close/read/seek/release conservan los retornos y guards del
puente R317. Añaden11contadores atómicos (44bytes estáticos), sin heap, archivos,
bindings de firmware nuevos, nuevos comandos o eliminación forzada de referencias.
Mismos motor/libc/codec/zona4MiB y bindings objeto
`523ce18e38ea031ff706145b0cb41c6e63ba4d5b4f7cdf592a2c515bd2d90081`.

El paquete control conserva128bytes y cambia a **versión2**: words1–20 conservan
su significado, words21–32 contienen diagnóstico en lugar de métricas de juego.
El nuevo launcher rechaza versión1; los anteriores rechazan versión2. No usar
lectores antiguos para interpretar esta cola. Los contadores se reinician solo
al cargar un módulo nuevo, sin comando de reset.

El launcher guarda la última lectura de estado ya prevista por su Timer; no
añade lecturas al fallar. La captura visible normalmente precede al último
intento fallido de release en cleanup; no se presenta como lectura posterior.
MODE cambia páginas en memoria Lua, sin IO, shell o comandos C. Cada contador
es atómico, pero el conjunto no es una transacción: cierres concurrentes pueden
producir diferencias transitorias entre campos. No inferir un fd concreto.

## Páginas al ERROR

| Página | Filas |
|---|---|
| Inicial |FIRST / LAST / DIMS, mismo formato R321 |
| MODE1 |REFS: lectores activos; OPEN: aperturas exitosas; CLOSE: cierres exitosos |
| MODE2 |CLSERR: cierres rechazados; READS: callbacks read; RDERR: reads fallidos |
| MODE3 |SKERR: seeks fallidos; CFIRST: primer error C; CLAST: último error C |
| MODE4 |MAXREAD: mayor n solicitado; RELERR: release fallidos; POS: posición tras último read exitoso |

MODE otra vez vuelve a la inicial. Valores de ocho dígitos decimales;
99999999 significa sin captura disponible o valor mostrado limitado a ese máximo.
CFIRST/CLAST son `sitio*256+errno`: sitio1open,2close,3read,4seek,5release.
0 significa ningún error registrado. Ejemplos534=close/22,769=read/1,
773=read/5,1296=release/16. No contienen direcciones, fd, identidad de tareas,
paquetes Bluetooth, imágenes ni mensajes crudos de firmware.

## Ensayo agrupado propuesto

1. Batería>=50%, usuario junto al reloj y esfera habitual/menús normales.
   **Un reinicio normal stock desde Ajustes → Sistema → Reiniciar**, no reset
   de fábrica/desvincular/actualizar. El módulo rw4png321 del ensayo anterior
   no completó retirada; no forzar rmmod o referencias. Confirmar retorno normal.
2. Un envío inactivo de644796bytes,316partes con100ms entre ellas y verificación
   de catálogo. Sin activar/borrar esferas, reintento o reanudación automática.
   Ante rechazo, corte, cupo o carrier ausente: parar.
3. Seleccionar **DoomRefs**, no DoomFault/DoomIO. Si READY, START una vez y
   mantener CHECKING despierto con toques breves. Ante ERROR inicial o UI ausente,
   no pulsar START. Si aparece Doom correcto, EXIT tras unos5s.
4. Si ERROR, guardar la pantalla inicial FIRST/LAST/DIMS y las cuatro páginas
   MODE de esa misma captura. MODE no reintenta nada. Si termina CLOSED, informar
   ese estado; no hacer otro arranque para obtener errores. Después volver a la
   habitual desde Ajustes y comprobar menús/corona. **Un solo ciclo**; no reabrir,
   repetir START/EXIT, otro envío o reinicio adicional.

La aprobación solicitada agrupa ese reinicio normal observado, una instalación
y un START manual condicionado a READY, más lectura de páginas cached MODE.
No autoriza cambios de firmware, bindings, forzar retirada, audio o savegames.

## Validación realizada y límites

- C S3 con VFS/stdio reales:194checks. Incluye PNG completo contra referencia,
  lectores solapados/límite8, snapshot128bytes/versión2/EOF, contadores de cierre
  correcto/rechazado, EIO inyectado, owner inválido, release busy, primer error
  preservado y último error actualizado. Solo se cierra el handle propio del
  fixture al modelar fuga. El módulo/nodos/temporales de prueba se retiraron.
- Se usa get_info real S3; no decoder propietario RW4, hilos o motor real, ni
  píxeles decodificados inspeccionados. No se reproduce causa física todavía.
- Launcher:51casos Lua con IO/nativo/widgets simulados. Conserva primer fallo,
  distingue open/write/close, rechaza paquete control v1 y reproduce en UI
  FIRST24031607/LAST30031607/DIMS320x200; recorre las cuatro páginas sin más IO.
-46recursos/pins exactos, siete escenarios de protocolo simulado, carrier
  ausente, paquete alterado, gates cerrados y journals anteriores preservados.
  Perfil R321 anterior también pasa tras la extensión del transporte.
- Build RW4 ARMv8-M Thumb soft ABI, sin imports ni bindings nuevos. El build
  reproduce el ELF originalR285 con sus objetos; no afirma reproducir ELF R317
  instrumentado. CRC/header/tamaño/RAM se mantienen antes del START.

Estos contadores y su UI pueden fallar. Se carga C modificado con privilegios
sin aislamiento demostrado; siguen posibles bloqueo, panic, OOM o corrupción.
La instalación escribe flash, no frames; la captura no añade archivos. El
reinicio puede perder estado volátil y no asegura revertir corrupción. No hay
recuperación integral validada. Límites cooperativos, sin watchdog duro.
Ante fallo, habitual desde Ajustes si responde y conservar estado; no acciones
forzadas, cierres de fd ajenos, reseteo de refs o descarga con lectores vivos.

## Ejecución tras aprobar

`node tools/pc-doom-refs-r325.mjs prepare` es offline. Install está cerrado por
PHYSICAL_DEPLOYMENT_REVIEWED=false y PHYSICAL_REFS_R325_REVIEWED=false;
LargePhysicalReviewed=false. Habilitar solo esos controles tras aprobación y
retorno del reinicio; un install; finally restaurar bytes/gates, recompilar y
probar cerrado. No abrir R318/R321/static/resume/retry ni reutilizar journals.
Sin push/CI remota; no publicar datos privados o firmware.
