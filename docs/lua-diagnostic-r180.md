# R180 — diagnóstico de fondo azul, solo PC/emulador

2026-10-12. El usuario confirmó retorno desde Ajustes a la esfera habitual
y recuperación de la pulsación larga tras [R179](lua-physical-result-r179.md).
Describe además LuaProbe como un cuadrado que rebasa el selector. Sin captura
física, no identificarlo definitivamente como preview, runtime o clipping.
No conexión ni archivo nuevo al reloj en R180; LuaProbe sigue instalada.

## Cambios de diagnóstico

Fuente propia `experiments/lua-diagnostic/main.lua`:

- Objeto propio centrado192×144, no tamaño global HOR_RES/VER_RES.
- Objeto y marcadores sin CLICKABLE/SCROLLABLE; no handlers de touch.
- Preview negro con X blanca pequeña e inset; ejecución con panel magenta,
  marcador amarillo inicial y segundo verde/rojo. Preview y runtime distintos.
- Label mediante `root:Label`, forma del sample RW4 upstream, sin Font por nombre.
- Creación de label protegida por pcall: verde si devuelve objeto, rojo si falla.
- Sin timers, callbacks de pausa/resume, shell, filesystem, módulos, C propio o Doom.

La documentación [LVGL8.3](https://docs.lvgl.io/8.3/_downloads/39cea4971f327964c804e4e6bc96bfb4/LVGL.pdf)
define CLICKABLE como participación del objeto en clicks del dispositivo de
entrada. Quitar ese flag de nuestros objetos busca evitar interceptar toques
que debería recibir la navegación stock. Es referencia upstream, no prueba
de bindings o semántica exactos de2.2.86. No se llamó a objetos/ancestros del
sistema ni se desactivó su navegación. Pulsación larga con la variante nueva
todavía no está validada: el ajuste stock estaba OFF en el emulador.

Esta variante cambia varias dependencias para distinguir fases, no demuestra
por sí sola que Font24 causara el fallo anterior. Verde prueba que la llamada
Label devolvió objeto, no que su texto sea visible. Solo el panel y amarillo
distintos del preview aportan evidencia visual de avance del script.

## Paquete PC inmutable

ID365219992,10524bytes,SHA256
`140b2a05618f617e70a7f5f28029beefed64251c43af0086cfaacfe0a681c8f1`.
Fuente SHA256
`7dece1ba7dac11e500157cf5569b92dc0999c3ea1e95c4b1d07e61b7b60115bd`.
Perfil365/Shape34, mismo formato byte5=0 y cambio solo del campo ID al empaquetar.
Compiler EasyFace4.23 revisado, sin ADB adyacente. Sin ejecutar binario externo
nuevo o redistribuir assets ajenos. Fuente exacta embebida comprobada.
No modifica paquete/hash de LuaProbe o sus registros físicos.

## Prueba MiWatchEmulator v1.0 / Xiaomi Watch S3

Instalación solo en guest propio bajo ID365219992: guard QEMU/puertos/ADB
dedicado5039/emulator-5554, snapshot data pausado y catálogo, readback SHA
idéntico, rescan/reset del guest. Byte5 original0, sin parche especial emu.

Resultado:

- Preview X blanca dentro de miniatura del selector, inspeccionado visualmente.
- Panel pequeño magenta con marcadores amarillo/verde y texto LUA DEFAULT FONT.
- Logs root/label-created/ready, sin label-error en la sesión revisada.
- Panel stock abre y cierra; captura de runtime idéntica después de volver.
- Selección Storage cierra Lua; fuente extraída exacta, propia inactiva,
  Storage365700764 activa y26IDs anteriores conservados; total27.
- Checker valida colores/background exterior negro, fuente, logs y cierre.

No prueba memoria a largo plazo, pulsación larga, bindings o firmware RW4.
No error físico identificado por log. Capturas y binarios privados bajo
artifacts/lua-diagnostic-r180 y artifacts/emulator/lua-diagnostic-r180.

```powershell
# Las dos primeras rechazan sobrescribir trabajo ya generado/instalado.
node tools/package-lua-minimal.mjs diagnostic
node tools/install-lua-minimal-emulator.mjs diagnostic
# Después de abrir la nueva esfera y volver a Storage:
node tools/check-lua-minimal-emulator.mjs diagnostic
```

Los helpers conservan el modo original por defecto y admiten solo el modo
diagnostic explícito, sin paths/IDs arbitrarios. La instalación anterior
permanece intacta. No se ejecutó CLI Lua interactivo en contexto distinto.

Continuación: [R181, perfil físico fijo y plan revisable](lua-diagnostic-physical-plan-r181.md).
