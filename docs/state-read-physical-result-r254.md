# R254 — snapshot C recibido y cerrado; registro posterior no reconocido

2026-10-14. Usuario aportó foto de StateRead2 tras READ C. En ella:
MARK/REG INFO/OPEN C/READ C/EOF C/FRAME/IDLE/CLOSE C verdes;
REG LAST/FINAL rojos. [Instalación y plan](state-read-physical-plan-r254.md).
Retorno a esfera habitual/menús/desplazamiento/pulsación larga aún pendiente:
se solicitó confirmación, sin reapertura o repetición.

## Evidencia física y límites

La foto muestra los primeros bytes `4134575201000000` y resto cero, coherentes
con IDLE verde. Transcripción manual de32bytes, no captura digital del dispositivo:

```text
4134575201000000000000000000000000000000000000000000000000000000
```

| Campo little endian | Valor observado |
|---|---|
| Magic |0x52573441, protocolo del puente propio |
| Versión |1 |
| Secuencia/fase/controles/pasos/edges/status |0/0/0/0/0/0 |

OPEN C verde confirma handle devuelto por io.open del nodo existente.
READ C verde confirma32bytes; EOF C verde confirma lectura posterior sin datos
ni error; FRAME/IDLE verdes confirman validación y estado inicial. CLOSE C verde
confirma éxito de fclose retornado a Lua. Código C propio revisado genera este
frame en step_read y controla refs/cursor en open/close: evidencia fuerte de
que esos callbacks funcionan en esta unidad/FW. No entrada START/STEP/STOP,
controles mantenidos, ejecución Doom ni uninit/unregister probados aquí.
No inspección directa de todos los handles ni prueba de retirada segura.

REG LAST agrupa lectura/EOF/cierre/clasificación e igualdad exacta del registro
posterior con el anterior. Rojo indica que alguna falló, sin distinguir cuál.
El frame ya se recibió y el handle cerró antes de esta comprobación. No afirmar
que C desapareció, que corrompió metadata o que solo cambió padding.

## Siguiente comprobación acotada

No ignorar REG LAST, relajar parser o retirar/recargar C automáticamente.
El formateador64 y representación truncada63ASCII+3NUL de R240/R248 hacen
razonable investigar bytes finales/comparación; no demuestran causa del rojo.
Comprobar registro actual/estabilidad con lectura Lua de metadata, separando
apertura/read/EOF/close/formato y prefijo/final/longitud. No repetir callbacks C
para diagnosticarlo. Preparar y revisar cualquier nuevo paquete físico antes
de enviar; retorno normal requerido para avanzar.

Ensayo consumido y marca propia persiste. Durante esta revisión solo archivos
del PC/documentación: sin Bluetooth, lectura del reloj, reload, unload o reboot.
