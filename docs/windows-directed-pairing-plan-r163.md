# R163 — emparejamiento Windows por dirección; preparado, sin prueba física

2026-10-12. El usuario aclara que reconectó el reloj al PC por Bluetooth, solo
confirmando el código de Windows, y el teléfono por USB. El reloj se apagó
completo, tuvo que encenderlo y sigue en QR; no solo pantalla apagada. No volvió
a pulsar Conectar nuevo teléfono ni Desvincular en este último vínculo.
No atribuir ese apagado a un timeout documentado ni a nuestros comandos: no hay
causa probada. No confundir estar emparejado con Windows con asociación Mi Fitness.
La clave de R162 sigue siendo candidata, no credencial actual verificada.

## Preparación completada en PC

DirectedPairing.cs es código propio independiente del motor/cliente SPP. Usa
BluetoothAuthenticateDeviceEx del Windows stock para una dirección conocida.
No necesita nuestra búsqueda de nombre ni activa inquiry. NULL OOB delega a UI
stock; exige MITM_ProtectionRequiredBonding=3, sin confirmar códigos automáticamente
ni PIN/default-key, callbacks que acepten solos o fallback de seguridad.

Fuentes primarias consultadas:

- [API de solicitud de pairing](https://learn.microsoft.com/en-us/windows/win32/api/bluetoothapis/nf-bluetoothapis-bluetoothauthenticatedeviceex):
  dirección en BLUETOOTH_DEVICE_INFO, UI si OOB es NULL, códigos de retorno.
- [Requisitos de autenticación](https://learn.microsoft.com/en-us/windows/win32/api/bluetoothapis/ne-bluetoothapis-bluetooth_authentication_requirements):
  enum 3 exige protección MITM para bonding.
- [Lectura de caché](https://learn.microsoft.com/en-us/windows/win32/api/bluetoothapis/nf-bluetoothapis-bluetoothgetdeviceinfo):
  información previa, no prueba de credenciales remotas actuales.

No es evidencia de que RW4 permita otro bond conservando Mi Fitness. Es una
prueba de la API documentada, no bypass de autenticación, root o firmware RE.
La hipótesis evita la desvinculación de aplicación que puede invalidar su clave.
El resultado correcto puede ser un rechazo stock; detener en ese caso.

CLI propia tools/pc-pairing.mjs: plan por defecto; build/test solo PC; pair es
explícito, manual y pendiente de revisión. Valida el target privado existente
M2315W1/2.2.86, MAC revisada por usuario, un radio, layout x64. Si caché ya marca
autenticado, devuelve AlreadyAuthenticatedCached sin reautenticar ni borrar nada.
Si caché tiene otro nombre, bloquea; si no hay entrada, usa solo la dirección
conocida. No se busca otro dispositivo ni se cambia dirección ante fallo.

MAC por stdin privado, no argv; no abre auth.json/candidatos. No sockets SPP,
protocolo Xiaomi, claves de aplicación, WAD o archivos al reloj. Proceso oculto
con UI stock de pairing prevista; DLLs System32. Padre supervisa 60 s/Ctrl+C,
descarta stderr y valida un JSON de enums/código nativo numérico. Un solo intento.
Un worker forzado no demuestra fin de la transacción remota ni cierre de la UI;
no repetir automáticamente. No publicar el código de comparación del pairing.

## Plan físico futuro; NO ejecutar todavía

### Estado previo necesario

Ahora el reloj está en QR con bond Windows. Primero quitar SOLO RW4 de Windows,
encender Bluetooth del teléfono y volver a Mi Fitness por el flujo habitual ya
probado, con la cuenta existente. Verificar sincronización y menús normales.
Si muestra borrado/reset/cambio de cuenta, parar y describir el aviso.
No asumir que una entrada guardada en Mi Fitness equivale a conexión actual.

Leer logs de ese estado después de la sincronización, usando el USB ya autorizado
si sigue disponible; no subirlos. Registrar candidato más reciente sin imprimirlo.
Desde este punto conservar la asociación de aplicación: no Desvincular,
Conectar nuevo teléfono, hard reset o reinstalar Mi Fitness.

### Un intento posterior, tras revisión

1. Apagar temporalmente Bluetooth del teléfono para liberar la conexión normal,
   sin tocar el registro Mi Fitness. Mantener el reloj encendido en sus menús.
2. Mantener Bluetooth del PC encendido (hay teclado Bluetooth). No volver a
   poner el reloj en QR ni activar Conectar nuevo teléfono.
3. Desde la raíz del repo ejecutar UNA vez:

   ```powershell
   node tools/pc-pairing.mjs pair
   ```

4. Si aparece comparación numérica, verificar que coincide entre Windows y
   este reloj antes de aceptar. Cancelar código distinto, dispositivo inesperado,
   PIN solicitado, aviso de borrado, necesidad de reset/migración o UI sin código
   comparable. No aceptar automáticamente ni seleccionar otro dispositivo.
5. Copiar solo el JSON final. No ejecutar probe/session inmediatamente: primero
   revisar pairing, estado QR/menús y credencial. Mantener el bloque PC mientras
   lo revisamos si el reloj continúa normal; no retorno entre cada consulta.

### Efectos, riesgos y recuperación

| Campo requerido | Evaluación |
|---|---|
| Identificación | M2315W1,2.2.86 reportados; MAC privada revisada, región/build interna desconocidas; Mi Fitness3.59.1i |
| Componente | Bluetooth stock Windows/reloj; API de pairing normal, no ejecución de código nuevo en el reloj |
| Almacenamiento persistente | Bonding solicita guardar claves/registros Bluetooth en PC y probablemente almacenamiento del reloj; no garantía de ausencia de writes internos |
| Particiones/bootloader/recovery | No comandos de escritura cruda, flash, bootloader o recovery; no firmware modificado |
| Archivos/backups | No transferencia ni borrado de archivos; sync Mi Fitness previo no es backup integral de firmware/flash |
| Revertir por reboot | No: reiniciar no revierte automáticamente un vínculo persistente |
| Retorno conocido | Quitar SOLO vínculo RW4 del PC y reconectar/vincular Mi Fitness como ya observó el usuario; esta variante aún no probada |
| Peor fallo razonable | Rechazo/timeout, bond stock incompleto, pérdida de conexión al teléfono o regreso a QR que exija re-vincular Mi Fitness; la clave de aplicación podría cambiar |
| Soft brick | No código/driver/firmware nuevo en reloj; QR de setup puede impedir UI hasta re-vincular, sin demostrar corrupción; no garantía frente a bug de pila stock |
| Hard brick | No operación directa identificada de flash/boot que lo cause; no evidencia específica ni riesgo cuantificado; tampoco garantía absoluta |
| Recovery conocido | Retorno de asociación ya observado; reboot stock documentado no es restauración de firmware. Sin recovery integral de firmware validado |
| Compatibilidad concreta | Misma unidad aceptó Windows pairing+SPP y versión/nonce Xiaomi v1; NO prueba de coexistencia de bonds con Mi Fitness ni API dirigida en estado normal |
| Stop | Timeout/worker sin cierre, pairing sin comparación, reset/borrado, QR/clave cambian, Mi Fitness no retorna; no fallback/insecure/retries/exploit |

El API puede guardar un vínculo; no denominarlo read-only o sandbox. El cliente
no cambia explícitamente ownership de Mi Fitness, pero no puede garantizar qué
hará el firmware al recibir pairing. Plan preparado, operación nueva pendiente
de revisión antes de indicar su ejecución. Por ahora solo retornar Mi Fitness.

## Build, pruebas y límites de CI

Compilador .NET Framework instalado previamente, SHA256 fijado y sin nuevas
dependencias. EXE separado ignorado, fuentes y wrapper ligados por hashes:
artifacts/pc-pairing/Rw4DirectedPairing.exe, SHA256
214666f85bc10e1a214c0f5b942ffd5f0a81ab3f91b37f170fc9cbd26cbde8d1.
El wrapper verifica esa compilación contra su build.json y los hashes de fuentes.

```powershell
node tools/pc-pairing.mjs build
node tools/pc-pairing.mjs test
node tools/test-pc-pairing.mjs
```

Build sin warnings; 14 escenarios C# falsos (gate/default sin llamadas, preflight,
retornos native simulados, excepciones/cleanup) y seis escenarios JS con procesos
falsos (success/cache/reporte inválido/deadline/cancelación/worker sin salida).
Cero API Bluetooth/radio ejecutada. Tests no demuestran diálogo real ni que se
mantenga el vínculo del reloj. El workflow existente incorpora el supervisor
sintético; no se ejecutó GitHub CI. Compilación/pruebas C# del pairing por ahora
locales: el pin del compilador de esta máquina requiere estrategia portable
revisada antes de añadir ese build al runner. Cliente SPP R160 no modificado.
