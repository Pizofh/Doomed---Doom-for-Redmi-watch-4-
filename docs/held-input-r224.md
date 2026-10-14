# R223–R224 — contacto sostenido y selector stock

2026-10-13. **Probado únicamente en PC/S3. RW4 pendiente de [revisión R225](held-input-physical-plan-r225.md).**
NativeFrames R222 sigue siendo el último resultado físico; no se repitió.

Con «Press and hold screen» habilitado, mantener la esfera stock durante tres
segundos abrió el selector. En HoldPad, mantener UP, LEFT, RIGHT y FIRE durante
3,3 segundos cada uno conservó la UI propia y su indicador verde. Soltar dejó
las acciones grises. EXIT volvió al launcher con las cinco filas verdes.
Mantener después una zona neutra abrió el selector stock de HoldPad;
seleccionar Neat cerró Lua y devolvió la UI normal.

El ajuste stock seguía ON después: el script no lo desactiva. El operador
lo restauró al OFF inicial desde Settings. Esto demuestra comportamiento del
S3 emulado, **no** del M2315W1/2.2.86. No se usó teléfono, Bluetooth, C o Doom.

## Implementación y límites

[Lua](../experiments/lua-held/main-r223.lua) utiliza objetos propios LVGL,
PRESS_LOCK, flags de propagación/scroll y `lvgl.indev.get_act():get_point()`.
No modifica ancestros, ajustes globales, drivers o handlers del sistema.
Textos son imágenes propias para evitar depender de la fuente por defecto.

PRESSED/PRESSING mantienen una máscara local. RELEASED/PRESS_LOST, salida
del área, error de coordenadas o pausa liberan la acción. EXIT libera antes
de pausar el Timer, oculta el juego y restaura scroll del root propio. El fondo
del juego intercepta contactos; en launcher no es clickable. No hay consumidor C.

15 callbacks de 200 ms señalan contacto sostenido; 300 terminan la prueba.
Son presupuestos cooperativos de UI, **no watchdog ni timeout duro**. START
se acepta una vez por VM; cerrar y reabrir podría habilitar otra VM. No hay
marca persistente. GC solo marca cierre, sin tocar widgets desde finalizador.

Las cuatro zonas son diagnósticas, no el layout final. No prueban comodidad,
multitouch, movimiento+disparo simultáneos, corona, latencia del motor o pérdida
de foco real durante contacto. El comportamiento de cancelación/pausa fue
probado con eventos simulados, no durante un gesto stock en contacto real.

## Evidencia

| Validación | Resultado | Alcance |
|---|---|---|
| Lua producción + mocks UI/eventos/Timer/input | 14 casos pasan | Intérprete real S3; UI simulada |
| Paquete | 9 recursos serializados byte exactos | Compiler EasyFace revisado, sin ADB adyacente |
| UI real + ratón del controller | Cuatro holds de 3300 ms, releases y EXIT | S3, no touch físico |
| Selector | Abre antes de START y después de EXIT | Ajuste ON durante el ensayo |
| Inventario | 31 IDs previos + HoldPad inactiva; Neat activa | Catálogo guest |
| Módulos | Inventario vacío sin cambios | No se cargó C |
| Instalador offline | Transfer12, sesión33, helper258 assertions | Peer sintético, cero sockets físicos |
| Gates Node/C# | Cerrados/verificados | No permiso nuevo de hardware |

Informes privados: `artifacts/emulator/held-lua-r223/summary.json`,
`artifacts/emulator/held-ui-r224/{contact-test,validation}.json`, capturas
`held-r224-*` y lifecycle. Checker contrasta fuente/paquete, píxeles del switch
y selector, secuencia de contactos, catálogo y módulos. No publicar logs crudos
o binarios propietarios.

## Reproducción

En un entorno nuevo, con dependencias revisadas y perfil del usuario registrado:

```powershell
node tools/emulator-host.mjs start
# Otra terminal, guest propio verificado:
node tools/test-held-lua-r223.mjs
node tools/package-held-r224.mjs
node tools/install-held-emulator-r224.mjs
# Settings: habilitar longpress y probar primero esfera stock.
# Seleccionar HoldPad; capturar ready/on-after-install según scripts.
node tools/test-held-ui-r224.mjs
# EXIT → hold neutro → selector → Neat. Verificar switch ON y restaurar OFF.
node tools/check-held-ui-r224.mjs
node tools/pc-rfcomm.mjs build
node tools/pc-static-watchface.mjs prepare r224
node tools/test-static-watchface-transfer.mjs r224
node tools/test-static-watchface-session.mjs r224
node tools/test-static-watchface-gates.mjs
```

Transiciones y capturas manuales requieren revisión visual; coordenadas y
expectativas están en scripts. No es CI end-to-end sin dependencias propietarias.
Scripts rechazan resultados existentes: no repetir sobre esta sesión.

Incidencias: launcher necesitó perfil del usuario fuera del sandbox. Se archivó
historial anterior. Un guest negro se recuperó con reset **solo VM**; no se
demostró causa Vulkan. Tras reconstruir catálogo, ADB cerró transitoriamente y
activa cambió Spectrum→Neat. Se reanudó inspección sin reenviar paquete. Solo
se reordenó la entrada nueva antes de la activa, conservando orden relativo
y campos de las demás. Copia pausada de `vela_data.bin` no es snapshot RAM
ni backup de filesystem consistente validado. Al finalizar Neat activa,
HoldPad inactiva, Lua cerrada y longpress OFF inicial restaurado.

## Objetos fijos

HoldPad ID **365219979**, **15552 bytes**, 8 partes previstas.

- Paquete SHA256: `296868366da0f29a010777d031559ddf08a1c52d73f45021b9f3f034fbabff16`.
- Lua SHA256: `1ee9ff3db8c572c1737ff27f764144c5869e810eb1280ef84f1393c234a90f59`.
- Helper cerrado SHA256: `675fac96664454694f9309be2515132071e37a3c17e818eaf1087adc09ad5249`.
- Perfil r224, journal futuro `tools/local/pc-rfcomm/held-input-r225.json`, ausente.

Siguiente checkpoint único: este ciclo contacto/EXIT/selector en RW4 aprobado.
Si pasa, preparar integración incremental con C. Memoria/APIs/temporización/motor
físicos pendientes; no traducir Doom a Lua o sustituirlo por un juego propio.
