# R109 — segundo PROBE y posible actividad de Mi Fitness

**Actual R112,2026-10-10:** usuario confirma que dio pasos nuevos y se
sincronizaron en Mi Fitness mientras llamadas/entrada siguen OFF. Evidencia
práctica por reporte de sincronización de datos con esos perfiles desactivados;
no limitarse ya a la hipótesis de datos guardados. No identifica transporte
exacto ni prueba que Mi Fitness causara G08. Se conserva esa condición OFF
durante el próximo ensayo de permisoNearby para evitar otra variable.
No es necesario activar ambos antes del aislamiento: el control de sincronía
reciente ya está reportado. Denegar soloNearby deMiFit/verificar/force-stop
ambas/unPROBEr106/cerrar/restaurarNearby/MiFit. Al terminar reactivar también
ambos perfiles si se desea recuperar la configuración original ON, recordando
que llamadas/entrada se suspenden mientras OFF. Nuevo PROBE aún pendiente.

**Corrección R111,2026-10-10:** usuario aclara que llamadas/entrada siguen
desactivadas. Cree que Mi Fitness conectó porque muestra datos sincronizados,
aunque ajustes Bluetooth no indica conectado. La respuesta general R110 no
demuestra restauración de toggles; tampoco hay confirmación independiente de
sincronización reciente o estado conectado en Mi Fitness. No afirmar fallo de
Mi Fitness ni conexión actual a partir de datos que pueden estar guardados.
Restaurar primero ambos toggles originales y comprobar que Mi Fitness muestra
conexión actual. Si no conecta, detener el plan PROBE/permiso y reportar;
no reset/unpair. Solo tras ese control se mantiene el plan de aislamiento
Nearby de Mi Fitness; Bluetooth general/perfiles originales/Quick Share intactos.
No nuevo ensayo ni cambio APK reportados.

**Actualización R110,2026-10-10:** usuario confirma que reactivó ambos
interruptores y Mi Fitness/reloj funcionan normalmente después de R109.
No resultado nuevo de conexión. Se guía un único PROBE r106 condicionado a
comprobar manualmente que Dispositivos cercanos está denegado solo a Mi Fitness.
Mantener perfiles originales, Bluetooth ON y Quick Share sin cambios.
Detener Diagnostics/Mi Fitness sin borrar datos antes del ensayo; si el permiso
no puede denegarse/verificarse o aparece nuevo pairing, no iniciar/continuar.
Cerrar Diagnostics, restaurar permiso y comprobar Mi Fitness al terminar,
incluido si hay fallo. No query, cambio de clave ni reintentos encadenados.
Los estados pendientes y plan preparado inferiores describen R109 histórico.

2026-10-10. Usuario aporta otro informe r106 después de la guía R108.
No se dispone de confirmación separada del estado efectivo de los toggles
durante este ensayo. Es el cuarto intento de enlace registrado y segundo PROBE.

```text
Preflight: P00
Caché local y del intento: B01/T01/S01
Modo: solo Bluetooth; formato de clave: no evaluado
D01 > D02 > D03 > D18 > D04 > E03 > D17 > D13
D01 +0ms > D02 +108ms > D03 +112ms > D18 +115ms >
D04 +115ms > E03 +266ms > D17 +272ms > D13 +283ms
G08: IOException; lectura falló, mensaje ambiguo cierre/timeout
Cierre local solicitado al registrar el error: no
Sin respuesta de batería/modelo/firmware (no se consultan en PROBE)
```

| Medida del informe | R107 | R109 |
|---|---|---|
| Intervalo D04 → E03 | 297 ms | **151 ms** |
| Intervalo E03 → D17 | 6 ms | 6 ms |
| D13 desde solicitud | 440 ms | 283 ms |
| Etapa máxima | Socket creado/connect fallido | Igual |
| Error | G08 | G08 |

La variación temporal no es una mejora de conexión ni una causa identificada.
No D05/protocolo/auth/GET; mismo fallo antes del límite propio30s y antes de
cierre solicitado. D17 confirma retorno local de close, no cierre de perfiles
de otras aplicaciones. El resultado no valida ni rechaza la clave Xiaomi.

## Observaciones adicionales

Usuario: al tocar Probar solo Bluetooth «como que se inició Mi Fitness» porque
apareció en la barra de notificaciones. Se conserva como observación incierta,
no como reconexión, proceso reiniciado o causa del error demostrados. No se
pidieron logs crudos, secretos ni captura radio. La ruta propia revisada de
`Rw4DiagnosticUi` dirige el intent explícito a nuestro
`DeviceCommunicationService`, no a Mi Fitness; no es una auditoría de cada
componente Android/vendor ni explicación de esa notificación.

También observa Quick Share activo al encender Bluetooth.
[Google documenta Quick Share como función para compartir que utiliza Bluetooth](https://support.google.com/android/answer/9286773?hl=es).
No es el intermediario requerido por nuestra llamada directa a la API Android.
Su presencia no demuestra conflicto, discovery Classic activo ni SPP ocupado.
P00 es una lectura de discovery en el preflight, no una captura continua de
todo escaneo BLE/actividad del sistema. No modificar Quick Share en esta etapa:
mantenerlo evita introducir otra variable sin evidencia causal.

Retorno posterior a Mi Fitness/restauración de toggles **pendiente**: pregunta
enviada, no asumir que el resultado R107 cubre el intento R109. Diferencia
de pasos R107 sigue sin explicación causal.

## Siguiente operación preparada: aislar permiso de Mi Fitness

Checkpoint: impedir que Mi Fitness abra nuevas conexiones por las APIs
Bluetooth normales durante un eventual ensayo. No basta con inferirlo de una
notificación o de la detención previa. Sin nuevo APK, borrar datos o desvincular.

[Android documenta el permiso Dispositivos cercanos](https://support.google.com/android/answer/9431959?hl=es)
y [BLUETOOTH_CONNECT para aplicaciones que se comunican con dispositivos emparejados](https://developer.android.com/develop/connectivity/bluetooth/bt-permissions).
[Gadgetbridge advierte de conflictos con la app fabricante](https://gadgetbridge.org/basics/pairing/huami-xiaomi-server/#entering-key)
y propone retirar permisos. Aquí se reduce el cambio al permiso pertinente;
no adoptar sus recomendaciones genéricas de unpair/desinstalar para RW4.

Plan concreto para revisión después de confirmar retorno normal R109:

1. Conservar/restaurar los perfiles originales y comprobar Mi Fitness/reloj.
2. Ajustes → Aplicaciones → Mi Fitness → Permisos → Dispositivos cercanos →
   No permitir. Solo Mi Fitness; conservar el permiso de RW4 Diagnostics.
   Si el ajuste no existe o no permite cambiarlo, detener aquí.
3. Forzar detención de Mi Fitness y Diagnostics, sin borrar datos. Mantener
   Bluetooth general ON y resto de ajustes originales. No abrir Mi Fitness
   durante el aislamiento ni conceder de nuevo el permiso si aparece un aviso.
4. Verificar permiso denegado antes de considerar un único PROBE r106.
   No iniciar aún: la confirmación de retorno actual y aislamiento falta.
5. Al finalizar el aislamiento: cerrar Diagnostics, volver a permitir
   Dispositivos cercanos a Mi Fitness y abrirla para comprobar normalidad.

| Gate / alcance | Evaluación |
|---|---|
| Acción/componente | UI del teléfono: permiso runtime de Mi Fitness y detención; futuro PROBE usa mismo RFCOMM/SDP revisado R106 |
| Escritura persistente | Sí: ajuste de permiso en teléfono y, si se ensaya, informe privado; ninguna escritura de archivos/particiones de reloj implementada |
| Reversión | Restituir permiso y abrir Mi Fitness; no confiar en reboot para restaurar permisos |
| Peor fallo razonable | Mi Fitness deja temporalmente de sincronizar/conectar y puede mostrar aviso de permisos; reconexión al restaurar no garantizada de antemano |
| Soft/hard brick | No mecanismo de flash/bootloader/código nativo; no observado previamente. No cuantificar riesgo cero ni ampliar a instalación de Doom |
| Recovery | Restauración manual del permiso, perfiles originales y app stock; retorno de este ensayo aún pendiente. Recovery integral de firmware no validado |
| Compatibilidad | Unidad M2315W1/2.2.86, teléfonoAPI36 y r106 alcanzan create/connect/close; permisos normales Android documentados, éxito SPP aún sin evidencia |

Revocar el permiso no prueba por sí solo que el sistema u otro componente
privilegiado no mantenga algún perfil Bluetooth. Una notificación posterior
tampoco probaría uso de Bluetooth con el permiso denegado. Si falla el eventual
ensayo aislado, no encadenar retries: estudiar servicio/endpoint/pila.

Solo documentación e inspección PC en R109. No nuevo build/test/cambio de
implementación ni operación física ejecutada por herramientas.
