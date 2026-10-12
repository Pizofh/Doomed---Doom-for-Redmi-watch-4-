# R169 — transporte y registro preparados sin utilizar el reloj

2026-10-12. El usuario está controlando el PC remotamente y no puede observar
el reloj. Esta sesión se limita al PC. No ADB, Bluetooth, autenticación real,
transferencia ni borrado en el reloj; tampoco nuevas APKs o herramientas descargadas.

## Implementación

- `static-watchface-session.mjs` conecta el flujo anterior al codec y al pipe
  del cliente Windows. Solo protocolo V1, paquete RW4Probe fijado por SHA256,
  instalación tipo16 y retirada de su ID. Rechaza firmware/modelo distintos,
  colisiones, respuesta de control sin cifrar, resume y partes fuera de orden
  o cuyo contenido no coincida con el paquete. No SET ni OTA, RPK, Lua o ELF.
- El canal MASS5 usa el formato observado en las copias originales de
  `XiaomiSppProtocolV1.java`/`XiaomiSppPacketV1.java`: CCM con nonce0, sin prefijo
  de contador de comandos. El constructor normal de frames sigue rechazando
  canal5. Los mensajes de control siguen usando sus contadores propios.
- No se interpreta `AuthStep4.unknown1` como un valor de éxito conocido.
  Se exige HMAC válido, respuesta1/27 sin rechazo de estado y consulta cifrada
  que reconozca RW4/firmware2.2.86 antes de empezar la instalación.
- El worker mantiene 16KiB de TX para las consultas existentes. Su modo
  específico admite 32KiB, 96 frames de máximo4096bytes, RX128KiB y los mismos
  límites de tiempo. La entrada nueva está cerrada antes de consultar caché o
  abrir Winsock; el modo de 32KiB aún NO se ha usado con una conexión real.
- El adaptador compara cada parte con las partes preparadas internamente.
  Paquetes de 512/2048/4080bytes fueron ensayados. Un ACK de chunk4096 se
  rechaza: excedería el frame4096 tras añadir cifrado/header. No se inventó un
  cambio de tamaño negociado para resolverlo. Sigue siendo una incógnita física.

La comprobación posterior verifica presencia del ID y conservación de los IDs
anteriores. Informa si cambió la esfera activa o si la propia no es eliminable.
Registro en catálogo NO prueba render ni aceptación completa del contenido.
Una confirmación de envío local tampoco lo prueba.

## Registro privado persistente

`static-watchface-journal.mjs` guarda intención antes de INSTALL, estado antes
de cada parte y antes de DELETE. Liga el registro a target local, ID, hash,
modelo y firmware; conserva la lista inicial privada y el progreso. No guarda
clave, serial, logs o paquetes recibidos. Destino previsto e ignorado por Git:
`tools/local/pc-rfcomm/static-watchface-r169.json`.

Usa creación exclusiva, lock de ejecución, escrituras a temporal en el mismo
directorio, fsync del archivo y rename. No garantiza durabilidad frente a corte
de alimentación del PC ni es una frontera de seguridad contra un usuario que
modifique los archivos privados. Un lock obsoleto requiere inspección local.

Un registro `Registered` permite reconstruir el recibo en otra ejecución.
La retirada exige además modelo/FW actuales, ID propio inactivo/eliminable,
conservación de los IDs originales, ACK y catálogo posterior sin el ID propio.
Los estados parciales o inciertos bloquean borrado automático y reinstalación;
no se resume ni se borra un paquete de procedencia incierta. La desaparición de
un ID no demuestra liberación de cada byte interno del almacenamiento.

Este registro NO es backup del reloj ni recovery de firmware. Las pruebas
escribieron registros sintéticos únicamente bajo `artifacts/static-r169-tests/`.
No se creó un recibo de instalación física.

## Resultado local y límites

| Comprobación | Resultado |
|---|---|
| Codec/API del prototipo | 12 escenarios R168 pasan |
| Transferencia, IPC y registro con peer sintético | 20 escenarios pasan; partes cifradas se reconstruyen como la imagen exacta |
| Retirada desde segunda instancia del registro | Probada para tamaños512/2048/4080; mismo target/hash |
| Estado en disco antes de transmitir | Verificado al recibir INSTALL, upload, cada parte y DELETE en el peer |
| Fallos | V2, clave incorrecta, rechazo auth, modelo/FW distintos, colisión, respuesta clara, resume, chunk4096, interrupción, ausencia de registro, pérdida de ID ajeno y cierre fallido |
| Retirada rechazada | Esfera activa/protegida, registro parcial, otro target y ejecución concurrente |
| Cliente nativo propio | Compilación .NET x64 con warnings como errores; 258 assertions offline pasan |
| Regresión de consultas | Suite R166: 22 sesiones sintéticas, 4 sesiones IPC y 6 fallos IPC pasan |
| Entradas físicas nuevas | CLI install/remove y entrada nativa devuelven GateClosed; sin sockets |

La compilación vuelve a fijar hash del ejecutable y de todos los módulos de
transporte, registro y CLI. El procedimiento es reproducible; no se afirma
que el csc de .NET Framework produzca bytes idénticos en cada compilación.

```powershell
node tools/pc-rfcomm.mjs build
node tools/pc-rfcomm.mjs test
node tools/test-rw4-xiaomi-session.mjs
node tools/test-static-watchface-transfer.mjs
node tools/test-static-watchface-session.mjs
node tools/test-static-watchface-gates.mjs
node tools/pc-static-watchface.mjs prepare
```

Las dos suites de transferencia necesitan el artefacto propio local R167.
No descargan ni ejecutan dependencias. No añadirlas a CI sin una fixture
redistribuible/reproducible. La CI existente sí compila el cliente y comprueba
el gate sin ese paquete. El workflow se actualizó; no hay ejecución remota de CI.

## Siguiente checkpoint

[Revisar la primera instalación estática](static-watchface-physical-plan-r169.md)
cuando el usuario pueda observar y manejar el reloj. Las dos entradas siguen
cerradas mediante constantes de código; no hay flag, variable de entorno o
argumento que las habilite. Su habilitación requerirá revisión explícita,
actualizar ambas entradas, reconstruir y fijar el nuevo hash. No hacerlo ahora.
