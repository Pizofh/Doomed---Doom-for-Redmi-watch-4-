# Doom persistente en el emulador

R73, 2026-10-04. ELF y WAD se instalaron una vez en `/data` del guest S3. El launcher ejecutó E1M1 antes y después de un reset limpio, sin volver a enviar assets desde el host. EXIT retiró el módulo y los archivos temporales sin reboot; los dos archivos instalados permanecieron. **Esto no demuestra compatibilidad ni persistencia en el M2315W1 físico.**

## Almacenamiento y carga

```text
/data/app/watchface/market/365799903/
    lua/main.lua                  launcher UIProbe
    doom/doom.elf                  446144 bytes
    doom/doom1.wad                 4196020 bytes
```

Los assets ocupan 4642164 bytes. `/data` reportó `fatfs`; antes de instalar, `df` indicó 4096 × 28323 bytes libres. Es capacidad del emulador, no memoria del RW4. Se guardó snapshot de su imagen de datos antes de instalar y antes del reset.

START lee el ELF persistente y copia el WAD a `/tmp/rw4-doom1.wad`, la única ruta admitida por el runtime C existente. Lee/escribe 32768 bytes por callback de Timer50ms; muestra `Preparing Doom...` y permite cancelar. Verifica tamaño y FNV1a32 antes de `insmod`. C y ELF R67 no cambiaron. El ELF se carga directamente desde `/data`; no se copia a `/tmp`.

FNV detecta cambios accidentales y **no autentica código**. Instalación y verificaciones host usan SHA256 y inputs previamente revisados:

| Asset | SHA256 |
|---|---|
| doom.elf | e115971e75ec32f33e2ee63a3c2af9799b8d207f73c3779db3bb31b53cef9639 |
| doom1.wad | 1d7d43be501e67d927e415e0b8f3e29c3bf33075e859721816f652a526cac771 |

Al salir, el launcher espera la retirada C, invalida caches, descarga el módulo y elimina WAD/copias de frames temporales. Los assets de `/data` permanecen. Reabrir vuelve a cargar código en RAM y a preparar el WAD. **Persistencia del archivo no significa residencia continua en RAM.** No hay sandbox: el módulo opera en el NuttX FLAT compartido del emulador.

## Resultados reproducibles

Los logs, snapshots y capturas locales están ignorados por Git; los identificadores permiten localizar cada resultado en `artifacts/emulator/`.

| Prueba | Artifact | Resultado |
|---|---|---|
| Instalación única | doom-storage-install-1791156103728 | Dos assets, SHA256 readback iguales |
| Cancelar con EXIT durante copia | doom-persistent-cancel-1791156417673 | Copia parcial 65536 bytes retirada; no se cargó C |
| Juego antes del reset | doom-persistent-run-1791156431823 | Worker1032, preparación8273,5ms, E1M1, FIRE50→48 |
| Reset tras salida limpia | doom-persistence-reset-1791156501836 | C/temporales ausentes; snapshot previo; sin push posterior |
| Verificar almacenamiento tras reset | doom-storage-verify-1791156519637 | Ambos SHA256 iguales |
| Juego después del reset | doom-persistent-post-reset-1791156531409 | Worker468, preparación8225,6ms, E1M1, FIRE50→47 |
| Panel durante carga y ciclo con Lua final | doom-prepare-focus-1791157330775 | Parcial65536 cancelado; sin START durante2s; worker1131, preparación8262,1ms, E1M1 y EXIT |
| Verificación después del ciclo final | doom-storage-verify-1791157364962 | Assets iguales, sin retransmisión |

Cada ciclo completo registró `result=1 peak=6582961 alloc=13 free=13 streams=0 cleanup=0`; comprobaciones de PID, módulo, nodos y temporales ausentes pasaron. Cero pushes de assets entre estos ciclos y cero reboots para salir. No se repitieron las suites R67–R72 ni el build de80fuentes C.

El ensayo de persistencia anterior/posterior al reset usó la primera Lua R73 (SHA256 `8f18245af0e7ea373217741ca9382ba811f889e47018c59546acff5c08634446`). Después se protegió el cierre de handles en finalización Lua y se añadió cancelación en `pageOnPause`; el suplemento prueba ese cambio y un ciclo con el source final. No se repitió el reset, pues paths/assets/C no cambiaron.

Lua final SHA256 `3a167aaf0598281eb57bb615df4246a6ba59ec40b80e9a6b6bf98f868b692a1a`; paquete24744bytes SHA256 `2d0b8e2fd3d709fd4598f8a9b2e975be27599098c28858d7c81804a2a75edd99`. Refresh con backup y readback, sin reset. El cierre GC mientras prepara tiene manejo defensivo de handles; este suplemento prueba pérdida de foco, no GC forzado durante la copia.

### Incidencias y alcance

El primer helper de cancelación, `doom-persistent-cancel-1791156341879`, no reconoció el nombre absoluto que imprime NSH en `ls -l`; dejó que acabara la preparación y arrancó worker373. Se salió con MENU/EXIT normal, sin kill ni reboot, y se corrigió la expresión regular. No fue un fallo del motor ni se cuenta como cancelación exitosa.

Antes de las pruebas hubo un reset de baseline por pantalla apagada (`doom-persistent-baseline-1791156243265`), con C ausente y snapshot. Es distinto del reset deliberado entre sesiones y de EXIT, que no necesitó reboot.

El host/emulador sigue siendo un PC: “sin retransmitir assets” no significa haber jugado en un reloj sin PC. No se validaron horas de estabilidad, guardado, corrupción de FAT, crash/kill recovery ni privilegios/ABI/instalación física. El límite cooperativo120s permanece.

## Uso local

Con inputs ya revisados, guest responsive, UIProbe instalada e inactiva y C ausente:

```powershell
# Solo para una instalación nueva; se niega a sobrescribir otra registrada.
node tools/doom-storage-emulator.mjs install
node tools/package-ui-probe.mjs doom
node tools/install-ui-probe-emulator.mjs refresh
node tools/doom-storage-emulator.mjs verify
```

En el estado actual **ya está instalado**: basta seleccionar UIProbe desde Ajustes, START, esperar unos8,3s y usar MENU/EXIT. No ejecutar nuevamente `install` ni los antiguos `stage/cleanup`; estos últimos rechazan el launcher persistente. Estado: `node tools/doom-ui-emulator.mjs state`. Assets/tmp se administran desde el launcher.

Para una instalación nueva y una prueba completa, `test-doom-persistence-emulator.mjs cancel`, luego `run`, un reset explícito con revisión de estado/snapshot y `post-reset`. El helper exige su secuencia registrada; no genera un reset ni navega por Ajustes por su cuenta. `test-doom-prepare-focus.mjs` es un suplemento después de completar aquella evidencia, con UIProbe en Ready. No borrar los registros para forzar un nuevo ensayo.

Rollback preparado: con otra watchface seleccionada y C ausente, `node tools/doom-storage-emulator.mjs remove` comprueba hashes/ownership, hace snapshot y retira exclusivamente los dos assets y su carpeta vacía. **La rama remove no se ejecutó ni se validó en runtime**; se conserva la instalación obtenida. No usarla en hardware. Un refresh del launcher preserva la subcarpeta `doom/`.

Siguiente checkpoint: auditar mediante fuentes/documentación el camino stock específico M2315W1 para instalar el launcher y ejecutar código suficiente. El ELF y las direcciones S3 no se transfieren al reloj. El [gate físico](physical-device-plan.md) sigue cerrado.
