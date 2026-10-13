# R201 — separadores duplicados: fallo reproducido y helper puro

2026-10-13. Solo Lua CLI del emulador S3 propio. Ningún comando Bluetooth,
teléfono/reloj o C ejecutado. [UI real R200](ui-only-emulator-r200.md) reveló
SCRIPT_PATH con ID//lua/ en el runtime normal de watchfaces.

path-r201.lua valida tipo/longitud<180, caracteres ASCII ya permitidos, ruta
absoluta, slash final y un ID exacto de nueve dígitos fijado por el caller.
Rechaza dos slashes iniciales; elimina únicamente separadores internos repetidos.
Después exige sufijo /ID/lua/. No admite puntos/traversal, espacios, Unicode,
comillas, metacaracteres, ID ajeno o rutas relativas. No archivos, shell ni C.
El caller futuro debe fijar el ID del paquete autorizado; no entrada libre de UI.

`node tools/test-rw4-path-r201.mjs` pasó16 escenarios en Lua5.4 S3, incluyendo:
ruta observada de UiOnly, forma canónica, más separadores internos, ID ajeno,
.., $, ;, comillas, whitespace, doble slash inicial, relativa, slash/sufijo
faltantes, NUL, exceso de longitud, nil e ID inválido.

El test sustituye solo el ID UiOnly por el ID FirstC para modelar el mismo
separador con el adapter original. Éste rechaza el path antes de abrir archivos;
su constructor acepta la forma normalizada. Backend armed=false, io/os inyectados
que fallarían si se invocasen, cero comandos. No se consulta la ruta física RW4.

Un archivo Lua tmpfs propio con readback exacto, retirado y ausencia comprobada;
lsmod real idéntico antes/después. Report artifacts/emulator/path-r201/summary.json.
HelperSHA256 `4edc7473370f3ce624a67df1b5fa77b42ca0bb4e867aca9ad554e0e01558ddbf`.

La normalización todavía **no está integrada en un nuevo paquete C**. FirstC
original permanece intacta/almacenada, sin reintento. Siguiente checkpoint:
integrar helper+UI estática con backend de un intento, comprobar inventario
previo (incluido módulo de R197) antes de nueva carga y fijar paquete/plan para
revisión física. C no se cargará automáticamente y no habrá unload ciego de
un módulo previo. Recovery y privilegios físicos siguen sin resolverse.
