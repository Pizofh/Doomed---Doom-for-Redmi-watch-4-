# Descarga de C al cerrar la watchface sin EXIT

Probado el 2026-10-03 exclusivamente en el guest Xiaomi Watch S3 de MiWatchEmulator v1.0, configurado a 390×450. **No demuestra compatibilidad con Redmi Watch 4 M2315W1.** No se conectó hardware físico ni se compiló DOOM.

## Cambio y fundamento

El [puente Lua↔C](lua-native-bridge-emulator.md) descargaba el módulo desde EXIT, pero cambiar de watchface podía dejarlo registrado. Ahora `control.lua` mantiene una tabla con finalizador `__gc`, referenciada desde `RW4_NATIVE_BRIDGE._lifetime` durante toda la vida de la VM. La recolección normal no debe descargar un módulo activo. Al cerrar Lua, el finalizador llama al mismo cleanup que EXIT: notifica salida, ejecuta `rmmod rw4bridge` y comprueba que desapareció el nodo propio. No llama LVGL ni conserva callbacks nativos pendientes.

El [manual oficial de Lua 5.4](https://www.lua.org/manual/5.4/manual.html#2.5.3) describe los finalizadores al cerrar la VM. Los handles del puente usan [variables `<close>`](https://www.lua.org/manual/5.4/manual.html#3.3.8) para cerrar descriptores también al propagarse errores. La inspección estática del ELF exacto observó que `lua_module_miwear_close` llama `lua_close` antes del cleanup posterior de Xiaomi; las pruebas siguientes verifican el resultado real de esa secuencia. El parche exacto de Lua no se identificó.

La limpieza es idempotente después de EXIT. Si falla la notificación de salida, todavía intenta retirar el módulo y registra el error; no presenta una descarga fallida como exitosa. Se añadió rollback de START si falla su handshake, pero ese fallo específico no se provocó en esta sesión. El C no cambió: sigue sin worker, timer, periférico ni escritura persistente.

## Resultados

| Prueba | Resultado observado |
|---|---|
| CLI: `collectgarbage('collect')` con C activo | C siguió activo; lectura de estado válida |
| CLI: retorno normal del script | Finalizador, `unregister=0 refs=0`, módulo/nodo ausentes |
| CLI: error controlado con descriptor `<close>` abierto | Traceback esperado, cierre del descriptor y descarga con `refs=0` |
| UI: START, tap60,210, cambiar a Storage sin EXIT | Finalizador descargó C; Storage renderizó sin reboot |
| UI: volver a UIProbe, START, tap300,230, cambiar a Storage sin EXIT | Segundo cierre correcto; contador comenzó en cero al recargar |
| UI: START y EXIT, luego seleccionar Storage | EXIT descargó C; finalizador posterior vio `running=false` y no repitió `rmmod` |

No hubo reset ni reinstalación entre los tres ciclos UI. El reset previo correspondió a actualizar el paquete Lua y precedió al staging del ELF en `/tmp`. Abrir el panel pausó C; navegar por Settings no descargó el módulo hasta cerrar realmente la watchface. Por tanto, **pausa y cierre son eventos diferentes**.

Extracto propio del primer cambio de watchface, a las 21:30:56 UTC:

```text
RW4_LUA_BRIDGE: finalizer begin running=true
RW4_LUA_BRIDGE: ack seq=6 op=4 active=0 paused=1 touches=1 x=60 y=210
RW4_C_BRIDGE: unregister=0 refs=0
RW4_LUA_BRIDGE: shell rmmod rw4bridge true exit 0
RW4_LUA_BRIDGE: cleanup unloaded lua-close
RW4_LUA_BRIDGE: finalizer end clean=true
```

El segundo cierre ocurrió a las 21:33:05 UTC. Tras EXIT, el cierre a las 21:35:12 UTC registró `running=false` y `clean=true`. Las consultas independientes `lsmod` y la apertura del nodo confirmaron ausencia; la captura final mostró Storage365700764. Después se retiró solamente el ELF propio de `/tmp`.

## Reproducción

Con el emulador revisado conectado, UIProbe inactiva y sin módulo cargado:

```powershell
node tools/stage-lua-bridge.mjs stage
node tools/test-lua-bridge-close.mjs normal
node tools/test-lua-bridge-close.mjs error
```

El helper fija transportes loopback, verifica el hash del payload, transfiere su script propio a `/tmp`, comprueba readback antes de ejecutarlo y guarda los resultados. El comando CLI devolvió status0 incluso ante el error Lua ensayado: el helper verifica mensajes y estado real, no deduce éxito solo de ese status. No mata tareas ni acepta código arbitrario como argumento.

Para UI, empaquetar `node tools/package-ui-probe.mjs bridge`, actualizar con `node tools/install-ui-probe-emulator.mjs update` estando UIProbe inactiva y preparar el ELF **después del reset**. Seleccionar UIProbe desde Settings → Watch faces → Watch faces, pulsar START y cambiar a Storage sin EXIT. Revisar cada pantalla antes de tocar controles; los swipes sintéticos no siempre avanzan el selector. Usar `node tools/lua-bridge-state.mjs` antes y después. Al terminar, seleccionar Storage y ejecutar `node tools/stage-lua-bridge.mjs cleanup`.

Identidades y artefactos locales ignorados:

- Guest SHA256 `849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa`.
- C sin cambios: 2.552 bytes; SHA256 `2fbebe482949a5e04d30879369bbba92b7597be1d2efc594565479dcbd41f741`.
- Watchface: 16.852 bytes; SHA256 `e5c713e69607e00aed523dfb83aaa0cfa044ddb795cea1a1ae72e3e7f71a0890`; fuente concatenada `7e52b815af8d48e5cc11d6fadbd5a030268b8bb14a76c20bf8a79bfaea6c4c00`.
- CLI: `artifacts/emulator/lua-bridge-close-normal-1791062551430/` y `lua-bridge-close-error-1791062555253/`, con resultado y salida completos.
- UI: `artifacts/emulator/lua-bridge-close-ui/`, registros de estado independientes y capturas `close-*` bajo `artifacts/emulator/screenshots/`.
- Inspección estática: `artifacts/package-review/close-lua_module_miwear_close.txt`, `close-lua_close.txt`, `close-close_state.txt`. No se publica firmware ni dumps propietarios.

## Límites y siguiente checkpoint

Un crash nativo, panic del sistema, terminación forzada o pérdida de alimentación no garantiza ejecución del finalizador. Tampoco se validaron concurrencia arbitraria, errores de memoria agotada, fallos de `rmmod` durante cierre UI ni workers futuros. Al introducir threads/timers/callbacks será necesario detenerlos antes de descargar C. Este módulo FLAT comparte memoria y no es un sandbox.

El ELF temporal no es persistente tras reset; sigue pendiente la instalación nativa duradera. Render integrado, input mantenido, temporización y acceso WAD también siguen pendientes.

**Siguiente checkpoint:** mostrar un patrón de píxeles generado por C dentro de nuestra página LVGL, conservando pausa, EXIT y limpieza al cambiar de watchface.
