# R280: sesión autenticada de transferencia grande en PC

Se conectó el modelo R279 a autenticación Xiaomi v1, comprobación de modelo y
firmware, consulta de esferas, solicitud de instalación, negociación de upload
y comprobación del catálogo posterior. Todo se ejecuta contra un receptor
sintético en el proceso del PC. **No es una prueba de instalación en RW4.**

## Implementación

- `tools/doom-upload-pc-session.mjs`: integración y journal durable por intento.
- `tools/doom-upload-pc-simulator.mjs`: receptor sintético, sin transporte nativo.
- `tools/test-doom-upload-pc-session.mjs`: escenarios completos reproducibles.

La entrada solo acepta un endpoint creado por el simulador, de un solo uso y
con sus capacidades congeladas. No acepta PrivatePipe, una dirección real ni
una función que abra conexiones. Los límites de los clientes físicos previos
permanecen intactos: no se amplió su presupuesto de 32 KB ni 96 frames.

El perfil PC reserva el tamaño total del upload más 8192 bytes para control,
limita los comandos a 32 y las partes MASS a 4096. Admite las dos geometrías
ya estudiadas, chunk 2048 o 4080. El serial de PROTO/MASS vuelve a cero cada
256 frames; el contador de nonce de comandos continúa por separado. Esto
permite consultar el catálogo después de miles de partes sin desbordar el
builder de comandos anterior. No se introducen ACKs por parte inexistentes.

El journal JSONL privado usa creación exclusiva, write/fsync y un registro de
intención antes de cada lote de 32 partes. La reanudación explícita exige el
mismo ID/hash/tamaño, etiqueta del receptor y catálogo anterior, un padre
Uncertain y un offset dentro del tramo posiblemente enviado. Un corte no
provoca reintento automático. Este journal de simulación aún no es un
journal físico con bloqueo entre procesos, identidad real o autorización.

Se distinguen escritura local, presencia en catálogo y contenido instalado.
RegisteredInactive significa únicamente que la respuesta del catálogo lista
la entrada inactiva y retirable y conserva la selección previa. El informe
mantiene `contentVerified:false`: no prueba extracción, ejecución ni memoria
disponible en el reloj. Nunca se envía una orden para activar o borrar esferas.

## Resultado local

```powershell
node tools/test-doom-upload-pc-session.mjs
```

No necesita WAD, firmware, emulador, teléfono, secretos ni Bluetooth. Utiliza
4807680 bytes sintéticos propios y tiempo virtual para las pausas de 100 ms.
El receptor deriva las claves con HKDF de Node y comprueba HMAC/CCM, serial,
contador, numeración, MD5, CRC y suffix recibido. Los errores se redactan y la
clave suministrada se borra al terminar.

22 escenarios pasan:

| Caso | Resultado |
|---|---|
| Transferencia completa chunk 2048 | 2353 partes; 4852711 bytes con control; RegisteredInactive |
| Transferencia completa chunk 4080 | 1180 partes; 4830424 bytes con control; RegisteredInactive |
| Corte después de entrega posible de parte 11 | 10 escrituras locales; Uncertain; cierre confirmado |
| Reanudación explícita en byte 22462 | 2342 partes; RegisteredInactive |
| Clave/protocolo/modelo/firmware incorrectos, colisión, respuesta sin cifrar | Sin solicitudes de instalación ni datos |
| Rechazo de instalación, MD5/offset/chunk inválidos | Sin partes MASS |
| Offset fuera del tramo o padre de otro receptor | Rechazado; sin partes MASS |
| Entrada ausente al consultar seis veces | SentNotVerified |
| Activación inesperada o entrada no retirable | Estado específico, sin corrección automática |
| Pérdida de entrada previa o cierre fallido | StoppedNeedsReview |
| Deadline durante envío | Detención tras una parte, sin reintento |

También se comprueban endpoints falsificados, su inmutabilidad y un solo uso.
Los tests anteriores de sesión Xiaomi y gates físicos pasan sin sockets.
La prueba se añadió al job `large-file-model` de GitHub Actions. Solo se
ejecutó localmente; no se lanzó CI remota ni se suben journals/assets.

## Próximo trabajo concreto

Completar el perfil worker RFCOMM separado para este presupuesto y duración,
con supervisor, cierre y prueba IPC sintética. Este avance no valida la
contrapresión de un socket Windows ni interrumpe una promesa de envío atascada;
esas garantías corresponden al worker/supervisor pendiente.

Después sigue integrar el launcher RW4 y la ruta WAD persistente, comprobar
memoria y preparar un único plan físico revisable. El carrier R278 aún lleva
un launcher inerte y el ELF mantiene su ruta WAD placeholder. No está listo
para enviarlo como juego. R270 sigue siendo el último ensayo físico; no se
instaló, cargó, retiró ni ejecutó nada nuevo en el reloj en esta sesión.
