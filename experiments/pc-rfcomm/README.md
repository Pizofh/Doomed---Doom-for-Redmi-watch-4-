# Cliente RFCOMM de Windows — R148

## Actual R154: modo físico explícito preparado, ensayo pendiente

El usuario ya observó pairing Windows y volvió a Mi Fitness quitando ese vínculo.
[Plan concreto de UN intento SPP y retorno](../../docs/windows-spp-probe-plan-r154.md).
Default/build/test/simulate siguen offline. `node tools/pc-rfcomm.mjs probe`
está implementado pero NO autorizado ni ejecutado sobre hardware en esta sesión.
Requiere target privado MAC/modelo/FW/plan, build validado por hash, caché
autenticada y un único radio local. No devuelve identificadores ni claves.

`PhysicalWorker.cs` consulta cache/handles antes de permitir native transport.
El constructor por defecto conserva el gate; solo factory física explícita,
después del preflight, usa opt-in. Esto es una restricción de la herramienta,
no sandbox; ejecutar directamente el worker evita la supervisión y no es el
procedimiento autorizado. Parent JS supervisa timeout/cancelación, valida JSON,
descarta stderr; kill no garantiza cierre remoto. No send/recv/comandos Xiaomi.

Resultados locales R154: build x64 sin warnings; **134 aserciones** C# y **diez
escenarios** del supervisor sin procesos/radio reales. Tests de preflight usan
funciones inyectadas, no prueban proveedor Realtek o SPP del reloj. CI actualizado
con pruebas del supervisor; aún no ejecutado en GitHub. No target privado creado.

```powershell
node tools/pc-rfcomm.mjs build
node tools/pc-rfcomm.mjs test
node tools/test-pc-rfcomm-supervisor.mjs
```

Las secciones siguientes describen el checkpoint histórico R148. Sus frases
«solo offline»/«sin entrada física» corresponden a esa versión, no al modo R154.

Fuente propia, C# compilado con el compilador .NET Framework ya instalado.
**La CLI solo permite preparación y simulaciones. No ofrece conexión física.**
No sustituye al cliente Android ni demuestra comunicación con M2315W1.

Desde la raíz del repositorio:

```powershell
node tools/pc-rfcomm.mjs build
node tools/pc-rfcomm.mjs test
node tools/pc-rfcomm.mjs simulate success
```

`plan` (también default) no compila ni ejecuta el cliente. Simulaciones adicionales:
`refused`, `timeout`, `error`, `close-failure`. Las simulaciones de fallo retornan
exit code 1; entrada no admitida retorna 2. No requieren reloj, teléfono, ADB,
escanear, permisos de radio, direcciones Bluetooth ni claves.

Salida local ignorada por Git: `artifacts/pc-rfcomm/Rw4PcRfcomm.exe` y `build.json`.
El wrapper liga fuentes y EXE por SHA-256 antes de ejecutar test/simulación.
Si cambian, exige recompilar. Usa argv directo, sin shell ni argumentos arbitrarios
de compilación. El compilador es el de 64 bits en Windows/Microsoft.NET/Framework64.
El script permite rebuild local; no modifica PATH ni instala dependencias.

## Componentes

- `Probe.cs`: controlador, reloj y CLI. Un Start por ensayo, deadline monotónico,
  cancelación cooperativa, Poll y cierre en finally. Salida de enums/números;
  no texto de excepciones ni argumentos del usuario.
- `WinSockTransport.cs`: backend y frontera inyectable con Winsock. El wrapper
  nativo está preparado pero **bloqueado antes de cualquier llamada OS** cuando
  api.Physical es true. La CLI no lo instancia. No existe unlock por flag/env.
- `SelfTests.cs`: transporte y API simulados; reloj virtual para límites y errores,
  y comprobación del bloqueo del wrapper nativo real. No crea sockets OS.

No hay send/recv, descubrimiento, enumeración de dispositivos, pairing,
autenticación Xiaomi, transferencia de esferas o escritura de configuración.
El cierre fallido se reporta como `closeConfirmed:false`, incluso si la apertura
había sido exitosa. Un intento local de cierre no se describe como confirmación
del estado del reloj. El bloqueo de la CLI es una restricción de esta herramienta,
no una frontera de seguridad para código modificado ni un sandbox.

## Contrato nativo preparado

Se usa AF_BTH/SOCK_STREAM/RFCOMM, UUID SPP fijo, port=0 para resolución del servicio,
opciones AUTHENTICATE y ENCRYPT habilitadas, y socket nonblocking. Poll consulta
select y SO_ERROR sin espera en la API. Backend intenta liberar socket y referencia Winsock
una vez; no hace fallback ni retry ante error. Esto se verificó con API simulada,
**no con el proveedor Realtek/Windows ni con otro periférico físico**.

SOCKADDR_BTH se declara Pack=1, tamaño 30 y offsets comprobados. fd_set reserva
las 64 entradas documentadas (520 bytes en x64). No se copia código del header.
Fuentes primarias consultadas:

- [Header Microsoft ws2bth.h](https://github.com/microsoft/win32metadata/blob/main/generation/WinSDK/RecompiledIdlHeaders/um/ws2bth.h): packing y constantes.
- [Bluetooth socket](https://learn.microsoft.com/en-us/windows/win32/bluetooth/bluetooth-and-socket), [connect](https://learn.microsoft.com/en-us/windows/win32/bluetooth/bluetooth-and-connect) y [SOCKADDR_BTH](https://learn.microsoft.com/en-us/windows/win32/api/ws2bth/ns-ws2bth-sockaddr_bth).
- [fd_set](https://learn.microsoft.com/en-us/windows/win32/api/winsock2/ns-winsock2-fd_set) y [select](https://learn.microsoft.com/en-us/windows/win32/api/winsock2/nf-winsock2-select).

Las categorías de error agrupan códigos documentados; no identifican por sí
solas quién cerró, qué capa es culpable o una solución. Deadline del controlador
y timeout reportado por el proveedor son categorías diferentes. Las funciones
nativas no se probaron: un driver/API que se bloquee no puede ser interrumpido
por el mismo hilo del controlador. Antes de habilitar físico, hace falta diseñar
supervisión de proceso y comprobar las garantías de cancelación/cierre.

## Resultado local

2026-10-11: compiler Authenticode Valid, firmante Microsoft Windows. SHA-256 del
csc utilizado: `46809206887326d2d24db1eff1f3064de972c3451abe766b49111450a5e08e00`.
Build x64 pasó con warnings como errores. SelfTests pasó con **113 aserciones**,
no 113 ensayos físicos. Se ejercitaron las cinco simulaciones CLI; el escenario
Opened/close-failure retorna error y no oculta el cierre no confirmado.

Las pruebas cubren:

- Éxito inmediato/pending, cancelación antes de abrir/durante la espera, deadline y resultado tardío.
- Excepciones Start/Poll y limpieza de recursos en fallos de cada etapa del backend.
- Fallos de Close/Cleanup y rechazo de un segundo Start/cierre duplicado.
- Servicio fijo, petición de seguridad y recursos liberados usando una API falsa.
- Layouts de interoperabilidad, gate físico y privacidad de salida ante argumentos inválidos.

Se corrigió un fallo del fixture: al simular un error de Poll conservaba el código
previo de conexión pendiente. El fixture ahora registra su propio error. Las
pruebas finales pasan. No se atribuyó esa falla al adaptador ni al reloj.

Comandos reproducibles con herramientas existentes; no se garantiza un EXE
idéntico bit a bit entre builds/versiones del compilador. El hash del build exacto
queda en metadata local. No se redistribuyen WAD, firmware, APKs ni bibliotecas
Xiaomi con este experimento.

## CI y próximo checkpoint

[Workflow](../../.github/workflows/pc-rfcomm-offline.yml) Windows: checkout con SHA
fijo, permisos contents:read, compile y test. Sin secretos, radio ni archivos
privados; aún no ejecutado en GitHub. No publica binarios. Esta es CI de este
cliente, no de Doom completo ni del firmware.

Siguiente: establecer si hay un vínculo Bluetooth ya existente en Windows y si
un vínculo adicional es compatible con esta unidad. No solicitar pairing ni
desvinculación para resolverlo automáticamente. Ver [plan alternativo](../../docs/pc-transport-alternative.md).
Faltan preflight de vínculo, selección de adaptador, supervisión y plan físico
explícito con rollback y revisión antes de exponer una opción de conexión.
