# R142 — revisar el componente Bluetooth de este teléfono

2026-10-11. La consulta R141 no encontró configuración exportable: build user,
dos propiedades sin valor explícito y tres archivos inexistentes. Ya tenemos
APK Mi Fitness y Mi Connect Service; falta identificar el componente Bluetooth
instalado. El análisis será estático, antes de proponer un cambio de conexión.

La [ficha actual del proyecto Gadgetbridge](https://gadgetbridge.org/gadgets/wearables/xiaomi/#redmi-watch-4)
mantiene RW4 como experimental con cobertura desconocida. Su
[guía de conexión Classic](https://gadgetbridge.org/basics/topics/xiaomi-protobuf/#multiple-connection-types)
no aporta por sí sola una corrección a nuestro ensayo: el cliente revisado ya
utiliza Classic/SPP. No repetir el mismo transporte ni reconstruir la app por
un cambio de instrumentación. Codeberg no accesible desde la herramienta web
por robots; no afirmar que se revisaron sus issues/cambios actuales completos.

## Copia propuesta

Mantener Mi Fitness normal y HCI inhabilitado. Teléfono por USB con depuración
normal autorizada, sin extras. En el repo:

```powershell
node tools/export-mi-fitness-apk.mjs export-bluetooth
```

Comandos exactos del ADB37.0.1 existente, con hashes fijados:

```text
adb -d get-state
adb -d shell pm path com.android.bluetooth
adb -d pull <APK base devuelto por pm y validado> <REPO>/tools/local/phone-bluetooth/Bluetooth-base.apk.partial
```

Solo ese paquete fijo. Se admiten rutas de aplicaciones de sistema ya validadas
y rutas APK Bluetooth dentro de APEX `com.android.bt`/`com.android.btservices`,
incluyendo versión numérica montada. Validación de gramática/traversal, argv
directo sin shell, un APK base inequívoco, límite256MiB, no overwrite y no
fallback si falta paquete o acceso. No copiar un APEX completo ni buscar nombres
de paquetes alternativos automáticamente.

Destino final privado/ignorado:
`tools/local/phone-bluetooth/Bluetooth-base.apk`. Se guarda hash/tamaño y estado
de copia en export-review.json. Nombres/rutas del teléfono no se imprimen.
Manifest/firma son verificaciones posteriores, no ya completadas al copiar.
No publicar el APK ni ejecutarlo. No instalar/abrir/actualizar/deshabilitar el
componente. El APK puede no contener las bibliotecas nativas de la pila; no
prometer que su revisión resuelva por sí sola el fallo o la ruta HCI.

## Alcance, riesgo y restauración

Lecturas del software instalado en el teléfono y escritura de una copia en el
PC. No se leen datos privados de usuario, vínculos/claves, contactos o salud.
Sin comandos al reloj, Bluetooth, logging, permisos de apps, particiones,
bootloader o firmware. Posible inicio del servidor ADB local y diagnóstico
interno Android; no prometer cero escrituras internas del teléfono.
USB autorizado puede persistir: desactivar/revocar si se habilitó para esto.

Peor fallo razonable: USB no autorizado, paquete ausente, lectura denegada,
timeout120s, poco espacio o archivo parcial local. No retry/delete/root ni
modificación para resolverlo. Dejar Mi Fitness abierta; no se requiere reboot
ni desvinculación. Ningún mecanismo previsto para brickear el reloj mediante
estas lecturas; su recovery integral y gate nativo/instalación siguen sin validar.

Antes de analizar el código: revalidar hash/tamaño, firma y manifest con SDK
oficial ya instalado; identificar versión/package. Luego inspeccionar de forma
acotada manejo de sockets y registro. No interpretar strings aislados como
prueba de ruta ejecutada. No inferir compatibilidad nativa M2315W1 desde código
arm64 del teléfono.

Default y plan-bluetooth no ejecutan ADB. Tests fake-ADB pasan: comandos exactos,
APEX permitido solo para este selector, rutas privadas/traversal/APEX ajeno
rechazados, sin raw ni overwrite/fallback. No ADB real por el agente ni copia
del componente realizada todavía.
