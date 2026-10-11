# R136/R137 — una captura HCI nueva autorizada

**R137,2026-10-11:** el usuario responde «sí» al plan de captura detallada nueva.
Autorizados registro HCI temporal del teléfono, un PROBE r131, copia privada
collect-capture y análisis limitado a Bluetooth con restauración descrita abajo.
No solicitar otra aprobación para esta misma secuencia. Ejecución manual y
resultados todavía pendientes; no ADB/radio físico por el agente. No incluye
QUERY, reintentos, cambios de vínculo/core, divulgar datos o instalar código
en el reloj. El modo plan-capture se comprobó sin ADB.

2026-10-11. Historial existente vacío: archivo de16bytes, cero paquetes y ningún
resumen inline. Sigue G08/R02/L01; clave/auth no alcanzados. La siguiente evidencia
útil sería observar el establecimiento/cierre del protocolo, no otro mensaje Java.

## Decisión necesaria

Habilitar el registro HCI completo del **teléfono**, realizar exactamente un
PROBE r131 ya instalado y conservar un nuevo informe local. AOSP documenta ese
ajuste y el reinicio Bluetooth requerido. Es una captura nueva, no incluida en
la autorización anterior para leer un diagnóstico existente.
[Procedimiento Android](https://source.android.com/docs/core/connect/bluetooth/verifying_debugging).

El registro completo puede contener tráfico/datos de otros dispositivos y
claves o identificadores. No afirmar que es anónimo, ni subir ZIP/paquetes a
chat/Drive/Git. Solo se analizarán localmente cabeceras/eventos de establecimiento
y cierre; no payload de apps/salud/audio ni claves. Datos descartados del informe
general solo se atraviesan en memoria para localizar la sección Bluetooth/CRC.
No garantía de que HyperOS incluya la captura en su bugreport.

## Secuencia manual posterior a autorización

Unidad M2315W1/2.2.86, HyperOS3.0.302.0/API36, Mi Fitness3.59.1i; misma app r131.
No instalar nada. Elegir unos minutos sin llamadas/accesorios Bluetooth en uso.

1. Comprobar Mi Fitness normal. Conectar teléfono por USB al PC propio con
   depuración USB normal/autorización, sin extras/OEM unlocking/root.
2. En Opciones de desarrollador, anotar el estado inicial de **Registro de
   rastreo Bluetooth HCI**. Elegir habilitado/completo si la UI lo ofrece; si
   falta o no es claro, detenerse e informar solo etiquetas, sin cambiar otros
   ajustes. No setprop, reinicios de servicios por ADB ni herramientas externas.
3. Denegar temporalmente Dispositivos cercanos SOLO a Mi Fitness, anotando su
   estado original. Forzar detención SOLO de Mi Fitness y nuestra app. No tocar
   Mi Connect Service, vínculo, caché, perfiles, autostart o claves.
4. Apagar Bluetooth del teléfono desde Ajustes, esperar estado apagado y10s;
   encender y esperar estado encendido. Esto activa logging según el mecanismo
   documentado; core puede volver a conectar, aislamiento no garantizado.
5. Abrir nuestra app → RW4 → **Probar solo Bluetooth**, confirmar una vez y
   mantener informe en primer plano hasta cierre (máximo30s). Si aparece nuevo
   emparejamiento, cancelar; no QUERY, inventario, auth o reintento. Copiar solo
   informe filtrado y cerrar nuestra app.
6. **Antes de restaurar logging/reiniciar Bluetooth**, ejecutar desde el repo:

   ```powershell
   node tools/phone-hci-report.mjs collect-capture
   ```

   Dos comandos exactos SDKADB37.0.1 con pins existentes:

   ```text
   adb -d get-state
   adb -d bugreport <REPO>/tools/local/phone-hci-r136
   ```

   Destino fijo nuevo y distinto de r134; nunca sobrescribir/borrar el informe
   anterior. Hasta5min, sin rawconsole ni fallback. Durante esos minutos el
   registro puede seguir capturando actividad Bluetooth del teléfono.
7. Tanto en éxito como error, restaurar inmediatamente el ajuste HCI original,
   apagar/encender Bluetooth para aplicar, restaurar permiso de Mi Fitness y
   abrirla. Verificar sincronización y reloj normal. No repetir si hubo error.
   Restaurar logging después de copiar evita perder archivos: el SnoopLogger
   AOSP revisado puede borrar logs previos al inicializarse en modo disabled.
   No prometer comportamiento idéntico de HyperOS ni conservación indefinida.
8. Desactivar depuración/revocar autorización USB si se activaron para esto.
   Compartir solo JSON del colector, informe de nuestra app y retorno normal.
   El agente inventariará/revisará sección BT local, sin ADB. No compartir ZIP.

## Efectos, riesgo y reversión

| Paso/componente | Persistencia/reversión | Fallo razonable y límites |
|---|---|---|
| HCI en teléfono | Ajuste y logs persistentes; restaurar ajuste y ciclo Bluetooth; borrar capturas privadas cuando termine análisis | Exposición accidental de tráfico, consumo de almacenamiento, captura ausente/rotada; restaurar ajuste no garantiza borrar logs ya creados |
| Nearby/stop y ciclo Bluetooth | Permiso/estado en teléfono; restaurar permiso/abrir Mi Fitness/BluetoothON | Se suspenden sincronización/accesorios; core puede reconectar. No demuestra socket exclusivo |
| PROBE r131 | Informe propio y posible actualización interna de cachés | Mismo transporte seguro existente; fallo de apertura/cuelgue transitorio de pila. Cerrar app/restaurar Mi Fitness; detenerse si retorno anómalo |
| Bugreport/PC | Diagnóstico amplio temporal/persistente del teléfono y ZIP privado local | Hasta5min, timeout/poco espacio; no repetir ni elevar privilegios. No código descargado ejecutado |

PROBE no alcanza protocolo Xiaomi: no archivo/código/config/firmware enviado.
No escritura explícita de particiones/bootloader/flash del reloj, herramientas
de flash, firmware de otro modelo, abrir reloj o kernel nativo. RAM/sandbox no
intervienen en esta prueba. Las escrituras internas normales Bluetooth no se
han auditado; riesgo estimado bajo para transporte, no garantía de cero riesgo.
No soft/hard brick observado en pruebas anteriores ni cuantificación fiable;
no hay recovery integral M2315W1 validado. Ante anormalidad: cerrar/restaurar
primero y reportar, sin reset/desvincular o improvisar recuperación.

La compatibilidad relevante es el enlace Bluetooth ordinario ya utilizado por
esta unidad; no implica ABI/loaders/RAM o compatibilidad de Doom nativo. Firmware,
instalación y ejecución nativa del reloj permanecen cerrados.

## Preparación y decisión por resultado

Colector con modos plan-capture/collect-capture y lector inventory-capture/
review-capture preparados; tests sintéticos pasan con destinos separados y sin
ADB por defecto. Decoder actual valida formato/CRC y cuenta paquetes; antes de
interpretar eventos/L2CAP/RFCOMM reales se ampliará con tests reproducibles y
fuentes primarias. No atribuir tráfico global al intento por proximidad temporal.

- Captura presente/con control relevante: identificar fase/rechazo y correlación
  antes de modificar transporte; no activar QUERY automáticamente.
- Vacía/no incluida: documentar limitación vendor; no repetir captura o pedir root
  automáticamente. Comparar alternativas antes de otro ensayo.
- Retorno anómalo: detener ensayos y atender restauración.

**Estado R137:** autorización recibida; secuencia manual y resultado pendientes.
No activar logging ni ejecutar PROBE/collect-capture automáticamente. Ante
error, restaurar ajustes y reportar sin repetir el intento.
