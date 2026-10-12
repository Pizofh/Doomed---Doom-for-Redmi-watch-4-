# R177 — Lua mínima preparada y probada en emulador

Continuación: [R178 integra el perfil fijo y plan físico](lua-physical-plan-r178.md),
con gates cerrados. Este documento conserva el resultado y pendientes de R177.

2026-10-12. El usuario confirmó retorno a su esfera habitual y funcionamiento
normal del RW4 después de R176. Autorizó preparar la siguiente prueba en PC.
**No se enviaron comandos Bluetooth ni archivos al reloj en este checkpoint.**

## Qué prueba y por qué no traduce Doom

La fuente propia `experiments/lua-minimal/main.lua` utiliza únicamente
`require("lvgl")`, objetos/labels, una fuente del sistema, un timer y logs.
Muestra «RW4 LUA PROBE» y diez actualizaciones, una por callback solicitado
con periodo 1000 ms. Son callbacks contados, no una medición del reloj exacta.
Al llegar a diez pausa el timer. `pageOnPause` lo pausa al ocultar la página;
`pageOnResume` lo reanuda únicamente si no agotó el presupuesto.

No captura touch ni bloquea gestos de navegación. No recorre padres o cambia
objetos del sistema. No shell, `os.execute`, filesystem, sensores, drivers,
ELF, módulos, WAD o C. Los callbacks de pausa/resume están demostrados en
el guest S3; **todavía no en firmware físico 2.2.86**. Los objetos y timer
son propiedad del contexto de la watchface: abandonar la esfera debe cerrar
su VM. El límite evita actualizaciones continuas, pero no convierte Lua
o sus bindings nativos en una garantía de aislamiento.

Doom se mantiene en C. El objetivo posible de Lua sería presentar UI/input
y lanzar/cerrar un componente C compilado para la ABI correcta. En el
emulador ya existe un puente propio Lua→dispositivo virtual→módulo C;
no es una API confirmada en RW4. Esta prueba no demuestra ejecución nativa
ni obliga a reescribir gameplay/render/IA en Lua.

## Paquete fijo PC

| Campo | Valor |
|---|---|
| ID candidato | 365219991; colisión física aún no consultada |
| Tamaño | 19796 bytes |
| SHA256 | a40c85607a8c208823f2dd6064ebca3c907a850e9a392c0b3eb0d718d3c9490a |
| SHA256 Lua exacta | e871590b80c50f2981ea8a8a796e3b0ca2f84977e7aa9a4e9fa32be7a608749d |
| Perfil | DeviceType365, Shape34, 390×450 |
| Header | byte5=0 conservado; solo ID parcheado en bytes40–48 |
| Dependencias | EasyFace4.23/compiler y DeviceInfo.db revisados previamente |

El compilador se ejecuta solo en PC, verifica sus hashes y ausencia de ADB
adyacente. No puede seguir su ruta comunitaria automática de instalación.
El paquete conserva la fuente Lua completa y exacta; no bytecode externo ni
assets ajenos. Preview procedural propio: fondo cian y diez barras blancas.
Compiler original genera ID167210065; copia candidata cambia solo campo ID.
No publicar el compilador propietario ni binarios de firmware/emulador.

## Resultado en MiWatchEmulator v1.0 / guest Xiaomi Watch S3

Instalación exclusivamente en
`/data/app/watchface/market/365219991/resource.bin`, con guard de identidad
QEMU/puertos, ADB dedicado5039/emulator-5554 y filtro sin USB. Snapshot del
data image pausado y copia de catálogo antes de mutar; no snapshot RAM ni
comprobación integral del filesystem. Recurso releído idéntico por SHA256.
Se invalidó caché y reseteó solo el guest, sin módulos propios cargados.

**Se probó el mismo paquete byte5=0**, sin ajuste de versión para emulador.
Catálogo propio LuaProbe/version0/type1. Fuente extraída por el runtime
releída e idéntica. Ninguna modificación directa de la Lua derivada.

| Validación | Resultado |
|---|---|
| Render propio | Texto y contador visibles en captura inspeccionada |
| Runtime reportado | Lua5.4, solo emulador |
| Timer | Secuencia exacta1…10 y marcador limit; sin tick11 |
| Panel stock | Pause entre tick9 y tick10; resume al cerrar el panel |
| Fin de presupuesto | Updates10/10 y mensaje Done; return to stock |
| Salida | Selector stock→Storage; log close lua now y captura Storage |
| Catálogo final | LuaProbe almacenada/inactiva, Storage365700764 activa |
| Otros paquetes | Los25IDs iniciales siguen presentes; total26 |

El caché mezcla esferas normales y AOD, con dos marcas in_use en diferentes
tipos. El primer preflight local rechazó ese supuesto de una sola marca antes
de escribir; se conservó ese registro y se inspeccionó el caché. No trasladar
esa representación al catálogo del protocolo físico. Durante la navegación
se activó por error Press and hold screen en el guest y se restauró OFF,
confirmado visualmente; ningún ajuste del reloj físico cambió. La secuencia
de navegación debe seguir capturas, no asumir estado o coordenadas tras reset.

Artefactos ignorados: `artifacts/lua-minimal-r177/`,
`artifacts/emulator/lua-minimal-r177/` y capturas `lua-minimal-*`.
No medir FPS, fugas, precisión temporal o RAM a partir de este ensayo corto.

## Reproducción local

```powershell
# Primera creación: rechaza sobrescribir paquete previo.
node tools/package-lua-minimal.mjs
# Primera instalación en guest propio; no ruta física.
node tools/install-lua-minimal-emulator.mjs
```

UI del guest: panel inferior→Settings→Watch faces→Watch faces→LuaProbe.
Identificar preview cian/diez barras antes de seleccionar. El switch Press
and hold screen es otro control; no confundirlo con el botón del selector.
Dejar ejecutar, abrir/cerrar panel stock y seleccionar Storage al terminar.
La animación del selector requiere esperar antes del siguiente arrastre.

```powershell
node tools/check-lua-minimal-emulator.mjs
```

La comprobación relee fuente extraída/caché, exige inactividad propia y
Storage activa, compara IDs anteriores y revisa tick1…10/pausa/resume/cierre
del último inicio en el log local acotado. La inspección visual se documenta
por separado; el helper no hace OCR ni garantiza ausencia de errores ocultos.

## Paso físico pendiente

El instalador físico actual **sigue admitiendo solo las dos imágenes estáticas
anteriores**. Este paquete Lua no está en su whitelist y ambos gates siguen
cerrados. No ejecutar `install r173` para instalar Lua: es otra imagen/ID.

Antes de proponer un ensayo: integrar perfil fijo de hash/ID/tamaño y registro
separado, probar rechazo de perfiles/recibos cruzados, verificar espacio y
colisión mediante catálogo fresco. Preparar comando exacto de instalación y
retirada propia, sin autoSET ni borrar otras esferas. Presentarlo al usuario
para revisar antes de enviar scripts al hardware.

El futuro ensayo escribiría almacenamiento persistente de watchface; reboot
no desinstala el paquete. Selección/retorno por UI stock, retirada solo propia
inactiva/eliminable con recibo. No particiones crudas, bootloader, recovery ni
firmware. Un fallo del binding/loader puede bloquear UI o causar reboot/soft
brick; no hay recovery integral2.2.86 validado ni garantía de hard brick cero.
Gestión stock y reinicio documentados no equivalen a recuperación de firmware.

**Siguiente checkpoint:** preparar el adaptador y plan físico revisable para
este paquete Lua exacto. Ningún C/Doom físico autorizado por esta preparación.
