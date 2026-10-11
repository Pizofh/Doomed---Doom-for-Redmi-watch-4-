# R154 — un intento SPP Windows, pendiente de revisión

**Actual R156, 2026-10-11:** usuario responde «ok. sigamos entonces» después del
plan y la corrección de desvinculación Mi Fitness. Autoriza esa única prueba
manual SPP; no pedir revisión nuevamente para la misma secuencia. No ejecución
automática por el agente. Se creó plantilla privada target.json (placeholder
inválido, sin MAC) y se verificaron hashes de EXE/fuentes: coinciden. Usuario
debe completar MAC localmente antes de desvincular y ejecutar probe UNA vez.
Resultado físico y retorno posteriores PENDIENTES; no registrar éxito antes del JSON.
Permiso no cubre autenticación Xiaomi, uploads, cambios de firmware o retries.

**Corrección R155, 2026-10-11:** el usuario aclara que para su ensayo también
desvinculó desde Mi Fitness, no solo desde Bluetooth del teléfono. Informa un
aviso de que no se pierden datos. El procedimiento descrito inicialmente abajo
era incompleto; la secuencia propuesta se corrige con este cambio de asociación
en la app. Retorno y funciones normales ya confirmados; no pedirlos otra vez.
El aviso es evidencia reportada del flujo stock, no prueba de que una futura
app/ELF/WAD propios sobrevivan a cada desvinculación. No inspeccionamos el texto
exacto ni los archivos internos. No ensayo SPP autorizado/ejecutado aún.

2026-10-11. Usuario confirma que eliminó el vínculo PC y volvió a vincular en
Mi Fitness; reloj recuperó todas sus funciones. Durante su ensayo no conservó
ambos vínculos. Trabajar con uno a la vez: no elevar esta observación a un límite
universal de todos los perfiles/firmwares. Windows había mostrado micrófono;
SPP aún no probado. No nueva operación física del agente en este checkpoint.

## Herramienta preparada y verificada en PC

Fuentes propias en experiments/pc-rfcomm. Build con csc oficial existente:

```powershell
node tools/pc-rfcomm.mjs build
node tools/pc-rfcomm.mjs test
node tools/test-pc-rfcomm-supervisor.mjs
```

Pruebas C#: 134 aserciones, sin socket OS. Supervisor JS: diez escenarios,
procesos/streams simulados, sin radio ni procesos nativos reales. Incluyen timeout,
cancelación, errores/salida inválida, cierre fallido y worker cuya salida no puede
confirmarse. CI actualizado, aún NO ejecutado en GitHub. No se repite el port Doom.

Default, build, test y simulate siguen sin conexión. El modo explícito `probe`
ahora está implementado; preparar código no autoriza ejecutarlo sobre el reloj.
No se creó un target privado ni ejecutó `probe` en esta sesión.

El worker verifica en caché un único radio local, dirección exacta y flags
Remembered+Authenticated, y un nombre RW4. Consulta local, sin inquiry/pairing.
Nombre/flag de caché no prueban identidad remota ni clave vigente; el usuario
debe comprobar la MAC contra Acerca del reloj antes de seleccionar el destino.
Todos los handles de preflight se cierran antes de abrir socket; cierre fallido
impide conectar. Sin target válido no alcanza socket.

Un intento: UUID SPP1101, port=0 (resolución SDP del sistema), AUTHENTICATE+ENCRYPT,
nonblocking y select/SO_ERROR. Timeout del controlador 20s; el padre termina
su worker a los 30s si no acaba, con hasta 1s adicional para observar su salida.
Ctrl+C también solicita terminar el worker. Cierre normal en finally; tras
terminación forzada **no afirmar cierre remoto ni closeConfirmed=true**.
Si el proceso no confirma salida, se reporta su PID local para revisión manual;
no repetir. No prometer que matar un proceso elimina un bloqueo del driver.

No send/recv, autenticación Xiaomi, claves de aplicación, comandos de reloj,
uploads, loader o código ejecutado en RW4. SDP y handshake Bluetooth sí generan
tráfico de protocolo. La API segura podría mostrar un diálogo de emparejamiento
si la caché está obsoleta; cancelarlo y detener, no confirmar nuevos vínculos
como fallback. No APIs para pairing/removal desde nuestra herramienta.

MAC via stdin del worker, sin argv/logs/salida. Padre acepta solo reporte fijo
validado; descarta stderr, limita stdout, no exporta excepciones. Selección privada:

Imports nativos de la assembly restringidos a System32; no DLLs comunitarias.
Una futura autenticación Xiaomi requerirá verificar su clave tras re-vincular;
este ensayo no la lee ni asume que la clave anterior siga vigente.

```text
tools/local/pc-rfcomm/target.json  (ignorado por Git)
```

```json
{
  "model": "M2315W1",
  "firmware": "2.2.86",
  "reviewedPlan": "R154",
  "address": "REEMPLAZAR POR MAC REAL CON FORMATO AA:BB:CC:DD:EE:FF"
}
```

El placeholder es inválido a propósito. No pegar MAC/QR/claves en el chat.
`reviewedPlan` registra una elección local, no es un sandbox ni sustituye la
revisión del usuario en esta conversación. Ejecución directa de worker también
es física; no usarla para saltarse el supervisor. `test` no llama preflight real.

## Secuencia manual revisada: autorizada en R156, un intento por el usuario

1. Partir de Mi Fitness funcional, misma cuenta, datos habituales sincronizados.
   Verificar modelo/FW/MAC en Acerca; no modificar versión ni actualizar firmware.
2. Preparar el target privado anterior con la MAC verificada. No requiere claves
   de Mi Fitness, instalación de APK, USB o ADB.
3. Como en el ensayo aclarado por el usuario, desvincular desde Mi Fitness
   mediante el flujo que ya utilizó y que muestra conservar datos; no confundir
   con eliminar/resetear u otro botón. Si aparece aviso de borrado, detener.
   Apagar temporalmente BT del teléfono y usar la pantalla QR del reloj para
   emparejar desde Windows. Verificar los
   códigos coincidentes en reloj y PC; cancelar si identidad/código no coinciden.
   Este paso SÍ cambia claves/registro de vinculación; no esconderlo como read-only.
4. Ejecutar UNA vez desde raíz del repo:

   ```powershell
   node tools/pc-rfcomm.mjs probe
   ```

5. Sea éxito o fallo, no repetir ni autenticar Xiaomi. Quitar solo RW4 de Windows
   como el usuario hizo, reactivar BT teléfono y volver a vincular con Mi Fitness
   desde su cuenta actual. No quitar teclado, otros dispositivos o cuenta.
6. Confirmar funciones normales/sincronización y compartir solo JSON fijo del probe.

## Efectos y gates físicos

| Campo | Evaluación de esta secuencia |
|---|---|
| Modelo/firmware | M2315W1/2.2.86 comunicados; pairing PC y retorno Mi Fitness observados por usuario. No evidencia SPP funcional todavía |
| Componentes | Bluetooth stock del reloj/Windows, flujo de vinculación Mi Fitness; programa propio ejecuta en PC |
| Persistencia | Desvincular en Mi Fitness cambia asociación de la app; pairing cambia registros/claves persistentes del host y posiblemente reloj. Usuario reporta aviso stock sin pérdida de datos, no conservación probada de archivos propios. SPP no solicita archivos/config Xiaomi |
| Particiones/bootloader/firmware | No herramientas de flash, escrituras de particiones o cambios solicitados. Escrituras internas de stock no auditadas |
| Reversible por reboot | No garantía ni mecanismo elegido: quitar vínculo PC y volver a vincular Mi Fitness, ya observado en esta unidad |
| Backup | Datos sincronizados habituales en Mi Fitness; no backup integral ni garantía de conservar cada archivo/watchface/config al volver a vincular |
| Peor fallo razonable | SPP rechazado/timeout, driver PC bloqueado o vínculo/sincronización que no retorna como antes; detener y revisar. No reset automático |
| Soft brick | No ejecución nueva en reloj; un bloqueo/reboot de su pila Bluetooth no se descarta. No usarlo como justificación de carga nativa |
| Hard brick | No modificación firmware/boot/particiones solicitada, ni evidencia de hard brick por pairing/SPP estándar; no garantía de riesgo cero |
| Recovery conocido | Retorno de vínculo probado por usuario quitando PC y re-vinculando Mi Fitness. No recovery completo de firmware; futuros módulos/código siguen bloqueados |
| Riesgo estimado | Bajo comparado con ejecutar un módulo, pero ensayo SPP no validado; coste conocido es interrupción temporal del vínculo Mi Fitness |
| Stop | Identidad/código diferente, advertencia reset, más de un radio, caché no autenticada, nuevo diálogo de pairing durante probe, cierre/salida no confirmados, Mi Fitness no vuelve |

## Fuentes primarias

- [Microsoft connect Bluetooth](https://learn.microsoft.com/en-us/windows/win32/bluetooth/bluetooth-and-connect): resolución UUID y errores; apertura no prueba protocolo Xiaomi.
- [Microsoft GetDeviceInfo](https://learn.microsoft.com/en-us/windows/win32/api/bluetoothapis/nf-bluetoothapis-bluetoothgetdeviceinfo): cache/device conocido, radio local y dirección.
- [Microsoft FindFirstRadio](https://learn.microsoft.com/en-us/windows/win32/api/bluetoothapis/nf-bluetoothapis-bluetoothfindfirstradio): handles y liberación.
- [FAQ Xiaomi RW4](https://www.mi.com/uk/support/faq/details/KA-91528/): cambio de teléfono y vinculación oficial; retorno exacto de esta unidad procede además del reporte local.

Éxito esperado del checkpoint: `Opened` y cierre/worker terminados. No significa
leer batería, instalar Doom, ejecución nativa o compatibilidad de ABI.
