# Camino stock M2315W1: investigación R74

2026-10-04. Solo lectura de fuentes y archivos del PC. No se ejecutaron aplicaciones descargadas, ADB, comandos en el reloj ni payloads nuevos. El prototipo S3 de R73 permanece intacto.

Conclusión: la ruta candidata sigue siendo watchface Lua → mecanismo de ejecución por demostrar → adaptador nativo específico RW4. Hay un indicio de primera mano sobre shell/Lua del RW4 y una alternativa abierta para estudiar instalación. **No existe todavía un port nativo compatible con la unidad del usuario.**

## Evidencia y decisiones

| Camino | Evidencia primaria revisada | Qué permite concluir | Qué falta |
|---|---|---|---|
| Lua RW4 | [MiWatchLuaWatchfaces](https://github.com/m0tral/MiWatchLuaWatchfaces/tree/5af6e14ea92830a394c88dc04f76ceef697a6ded/RedmiWatch4) | Hay fuentes específicas para cuatro ejemplos RW4 | Runtime/config/firmware real |
| Lua → shell | [Artículo original de m0tral](https://habr.com/ru/articles/1079066/), preparación | Relato de investigación anterior del RW4; describe acceso shell desde Lua | Firmware, región, salida reproducible y versión de os.execute en M2315W1 |
| C cargable | [MiWatchNativeApps fijado](https://github.com/m0tral/MiWatchNativeApps/tree/a392529b9e369d046b9c15858d990f358fdf6c29) | Implementación para S3/MB10 Pro, no RW4 | ISA/ABI/loader/exports/privilegios del RW4 |
| Instalar watchface | [Gadgetbridge, ficha RW4](https://gadgetbridge.org/gadgets/wearables/xiaomi/#redmi-watch-4) y código fijado abajo | Ruta comunitaria con fuente abierta que merece evaluación | Firmware compatible, vinculación, aceptación del paquete y retirada |
| EasyFace | [README fijado](https://github.com/m0tral/EasyFace/blob/f76a9fe1f559bc8b1d91cf2a1f5af1a630848098/README.md) | Empaquetado RW4; instalación comunitaria descrita vía Mi Fitness mod | No es instalador oficial; APK/mod no adquirido ni autorizado |
| QuickApp/RPK | [FAQ oficial](https://iot.mi.com/vela/quickapp/en/guide/other/faq.html) | Xiaomi describe debug mediante una versión de Mi Fitness proporcionada por contacto comercial | Disponibilidad para usuario/build RW4; ejecución C/WASM no demostrada |

### Lua y código nativo: separar indicio de prueba

Se inspeccionaron los diez archivos `.lua` bajo `RedmiWatch4/` de la revisión fijada. Cero menciones del patrón `os.execute|insmod|rmmod|loadlib|iwasm`. Usan principalmente lvgl y, según ejemplo, dataman/topic. Esto demuestra el alcance de las muestras: **no demuestra que esos mecanismos estén deshabilitados en el reloj**.

El artículo de m0tral es una fuente de primera mano: enlaza su proyecto y refiere que estudió RW4 antes del ejemplo actual. Su relato aumenta la plausibilidad del puente Lua/shell, pero el ensayo nativo del artículo es MB10 Pro. No trae transcript/firmware RW4 que autorice una carga. No se adopta su descripción de riesgo como garantía de sandbox o recuperación.

El árbol de MiWatchNativeApps no contiene target RW4. Se revisaron platform/README, header S3 y launcher hello S3. Los bindings dependen del firmware y contienen direcciones absolutas: relocatable ELF no elimina la necesidad de resolver imports correctamente. La información del README sobre global/AiotJS no se generaliza al firmware global M2315W1. No reutilizar flags/direcciones/layouts de S3/MB10 Pro.

## Instalación: candidato Gadgetbridge

La documentación actual del proyecto marca RW4 como experimental, con cobertura de funciones desconocida, y exige una clave Xiaomi de vinculación. No se obtuvo ni solicitó la clave; debe permanecer local y fuera de Git/CI. Cambiar de app puede afectar sincronización, notificaciones u otras funciones: hay que definir coexistencia/retorno a Mi Fitness antes de vincular.

Se inspeccionó un **mirror histórico GitHub**, revisión `a0948ee1cbc2a870f91d313f8e37df5f524465f7`, del 2024-12-22. No presentarlo como fuente actual de Codeberg, cuya lectura web fue bloqueada por robots. El coordinator dedicado identifica el nombre BLE RW4 y hereda el handler Xiaomi. El servicio publica acciones separadas para lista, selección, instalación y eliminación de watchfaces; rechaza eliminar caras activas, desconocidas o no marcadas como de usuario. Son controles del código, no recovery validado de nuestro reloj.

Archivos fijados, bajo `app/src/main/java/nodomain/freeyourgadget/gadgetbridge/`:

- [Coordinator RW4](https://github.com/Freeyourgadget/Gadgetbridge/blob/a0948ee1cbc2a870f91d313f8e37df5f524465f7/app/src/main/java/nodomain/freeyourgadget/gadgetbridge/devices/xiaomi/redmiwatch4/RedmiWatch4Coordinator.java)
- [Install handler](https://github.com/Freeyourgadget/Gadgetbridge/blob/a0948ee1cbc2a870f91d313f8e37df5f524465f7/app/src/main/java/nodomain/freeyourgadget/gadgetbridge/devices/xiaomi/XiaomiInstallHandler.java)
- [Parser](https://github.com/Freeyourgadget/Gadgetbridge/blob/a0948ee1cbc2a870f91d313f8e37df5f524465f7/app/src/main/java/nodomain/freeyourgadget/gadgetbridge/devices/xiaomi/XiaomiFWHelper.java)
- [Servicio watchface](https://github.com/Freeyourgadget/Gadgetbridge/blob/a0948ee1cbc2a870f91d313f8e37df5f524465f7/app/src/main/java/nodomain/freeyourgadget/gadgetbridge/service/devices/xiaomi/services/XiaomiWatchfaceService.java)

La documentación de la familia menciona RPK/apps; el mirror revisado tiene gestión instalada de apps desactivada en su coordinator genérico. No inferir instalación RPK RW4 de una capacidad familiar o de gestión de watchfaces. El parser/handler también admite firmware: una futura interfaz de este proyecto debe aceptar exclusivamente el tipo watchface propio y rechazar firmware.

## Comprobación estática de nuestro paquete

El `.face` original de R73 mide24744bytes, SHA256 `2d0b8e2fd3d709fd4598f8a9b2e975be27599098c28858d7c81804a2a75edd99`. Los primeros bytes son `5a a5 34 12` y el ID ASCII desde0x28 es `167210065`; el nombre es UIProbe. Coincide con **solo el subconjunto magic/ID numérico** de XiaomiFWHelper. No se ejecutó el parser Java completo ni se verificaron preview, modelo, firma o aceptación física.

El ID original distinto de365799903 ya se explicó en [R40](touch-events-emulator.md): el compiler descarta el argumento ID y el instalador del emulador prepara otra copia del header. El source actual de install-ui-probe confirma esas dos ediciones. No enviar directamente el `.face` original ni el resource emulado al reloj. Una futura distribución deberá validar ID sin colisión, tipo de paquete y perfil/modelo/firmware.

## Reproducibilidad y límites

```powershell
node tools/audit-rw4-stock-sources.mjs
```

El helper valida17Git blobs contra metadata fijada (10Lua RW4,3fuentes nativas relacionadas,4Gadgetbridge), busca los patrones citados y lee el header del paquete propio. No importa ni ejecuta esos sources, no descarga, no usa ADB. Snapshot y reporte en `artifacts/research/rw4-stock-source-{snapshot,audit}.json`, ignorados por Git. Es reproducible con esos inputs locales; un clon nuevo requiere obtener el texto de las URLs/revisiones anteriores y metadata de sus árboles, no trae los snapshots. No es todavía CI autónoma.

Los head de los dos repos m0tral se consultaron y seguían en las revisiones fijadas. Búsquedas web de RW4/insmod y M2315W1/ELF no proporcionaron otro transcript nativo específico; un resultado negativo de búsqueda no prueba imposibilidad. No se siguieron mirrors de blogs, mods Telegram ni instrucciones de exploits.

## Siguiente checkpoint

Obtener versión de firmware de la unidad, Android/iPhone y versión de Mi Fitness mediante lectura manual de Ajustes. La pregunta ya está enviada, sin pedir claves/MAC/serial ni conectar apps nuevas. Con esos datos, concretar el expediente de la **primera watchface conocida**: instalador de procedencia revisable, compatibilidad, writes, retirada, peor fallo y recuperación. Aún no aprobar ni ejecutar instalación. Si el camino exige un mod dudoso, firma desactivada o recovery inexistente para el riesgo propuesto, documentar alternativa y pedir revisión.

## Datos de unidad recibidos despues de R74

El 2026-10-04, el usuario leyo M2315W1 y version del dispositivo2.2.86. Serial/MAC no necesarios ni recopilados. No deducir region o ABI del numero. Sigue pendiente telefono Android-iPhone y version Mi Fitness. La busqueda publica exacta2.2.86 no aporto una fuente tecnica primaria de ejecucion Lua/shell/ELF para ese firmware. Menciones en foros no verifican compatibilidad. No nuevos downloads, conexion ni instalacion fisica.
