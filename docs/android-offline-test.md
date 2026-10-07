# Prueba Android sin Bluetooth — pendiente de aprobación

**R91, 2026-10-06: instalación bloqueada por Play Protect, informado por usuario.**
Mensaje exacto pendiente. Detener la instalación como prevé el paso 3; no
desactivar protección ni alterar firma/package para intentar eludirla. APK
original en PC conserva el hash revisado; copia del teléfono sin verificar.
No se ha confirmado instalación ni ejecución. No atribuir el bloqueo a una
causa concreta todavía. Google distingue detección potencialmente dañina y
bloqueos de apps no verificadas/permisos sensibles, y ofrece apelación:
[documentación oficial](https://support.google.com/googleplay/answer/2812853?hl=es).
No se envió APK ni apelación a terceros. Alternativa disponible para investigar:
emulador Android oficial en PC, separado de MiWatchEmulator/Vela; no preparado.

**R90: aprobación recibida.** El usuario autoriza esta instalación/prueba manual
en teléfono, manteniendo Bluetooth apagado y sin dispositivos ni claves.
La copia de guía/review.json del bundle R89 conserva su estado de preparación
anterior a esta autorización; el APK es el mismo. No pedir aprobación otra vez.
La conexión al reloj continúa sin autorizar. Resultados runtime pendientes.

Objetivo: instalar la app de diagnóstico **en el teléfono**, abrirla, salir y
reabrirla sin registrar ni comunicar un reloj. Esto no ejecuta Doom ni valida
compatibilidad del firmware M2315W1. Preparación autorizada en PC; instalación
manual pendiente de aprobación del usuario. Gate del reloj cerrado.

## Artefacto concreto

`artifacts/android-offline-test-r87/RW4Diagnostics-r87.apk`, versión
0.94.0-rw4-diagnostic-r87/code253, Android API23 o superior. Package:
`nodomain.freeyourgadget.gadgetbridge.rw4diagnostic`; nombre visible:
**RW4 Diagnostics**. SHA256:
`bf95f228b51e4ff1920f918b9c8502f0d85b9a7d8975b40e5c82fedcee975fd2`.
Firma debug local verificada v1/v2, diez permisos declarados previstos.
[Build y revisión](android-build.md). La firma no demuestra comportamiento.

Preparar en PC, sin build ni acceso al teléfono:

```powershell
node tools/prepare-android-offline-test.mjs
```

El helper comprueba hashes de APK/fuentes, identidad, permisos y certificado;
copia solo este APK y esta guía a una carpeta ignorada por Git. No empaqueta
logs, claves, firmware, WAD ni herramientas de instalación. No sobrescribe
un bundle modificado. Fuentes/reproducción: archivo Gadgetbridge0.94.0/253
fijado en `tools/review-gadgetbridge-source.mjs`, parches de
`tools/prepare-android-diagnostic.mjs`, scripts y código propios en este repo.
No se ha autorizado publicación del APK ni redistribución del TAR.

## Efectos y reversión

| Paso manual | Componente afectado | Persistencia | Reversión |
|---|---|---|---|
| Transferir APK por USB en modo archivos | Descargas/almacenamiento del teléfono | Sí, archivo APK | Eliminar ese archivo |
| Apagar Bluetooth antes de instalar/abrir | Radio y conexiones Bluetooth del teléfono | Ajuste del teléfono | Restaurarlo solo después de detener la app |
| Instalar este APK con el instalador Android | Package/app privada del teléfono | Sí, app y ajustes | Desinstalar RW4 Diagnostics |
| Abrir y completar bienvenida sin permisos/dispositivos | Proceso, DB, preferencias/caché propios de la app | Sí, almacenamiento privado del teléfono | Desinstalar solo esta app |
| Salir, reabrir, forzar detención al final | Proceso/activities de esta app | No borra sus datos | Abrir manualmente otra vez, manteniendo Bluetooth apagado |

No hay comandos al reloj, escrituras de sus particiones, bootloader, recovery
o firmware ni archivos instalados en él. Apagar Bluetooth desconecta
temporalmente Mi Fitness y otros accesorios; no desvincularlos. El peor fallo
previsto de esta prueba es un crash/bloqueo de la app o fallo del instalador.
No se inicia un mecanismo que escriba firmware del reloj; esta prueba no
establece recovery para futuras conexiones, y no cuantifica riesgo nativo.

## Pasos propuestos, solo tras aprobación

1. Apagar Bluetooth en **Ajustes del teléfono** y comprobar que siga apagado.
   No basta cerrar Mi Fitness. Mantener Bluetooth apagado durante toda la prueba.
2. Transferir únicamente `RW4Diagnostics-r87.apk` al teléfono, por USB como
   archivo. No activar depuración USB, ADB ni transferir nada al reloj.
3. Abrir el APK con el instalador Android. Comprobar nombre RW4 Diagnostics.
   Si requiere permitir instalación desde esa app de archivos, hacerlo solo
   para esa fuente y revocar esa autorización después. No desactivar Play
   Protect ni modificar verificaciones: si bloquea la instalación, detenerse
   y comunicar el mensaje. [Instalación de otras fuentes, Google](https://support.google.com/android/answer/9457058?hl=es).
4. Abrir RW4 Diagnostics. En la bienvenida, recorrer las páginas sin pulsar
   «Conceder permisos». En la última, elegir **Ir a la app / To the app**,
   no «Añadir primer dispositivo / Add first device» ni «Restaurar».
   Denegar cualquier permiso de dispositivos cercanos, ubicación o notificaciones.
   No introducir claves, MAC, datos personales ni restaurar backups.
5. Confirmar que aparece el inicio/lista de dispositivos vacío y responde.
   Esperar unos 30 segundos. Si aparecen dispositivos, una conexión, petición
   de activar Bluetooth o permisos ajenos a los previstos, detener la prueba.
6. Salir con **Salir / Quit** desde el menú de la app si está visible. Si solo
   se puede volver con Atrás/Inicio, registrarlo como tal: no prueba que termine
   el proceso. Reabrir una vez y comprobar que no se cierra ni intenta conectar.
   Si vuelve a pedir permisos, denegarlos y volver con Atrás; no añadir dispositivos.
7. En Ajustes → Aplicaciones → RW4 Diagnostics, **Forzar detención**. Revisar
   que Nearby/ubicación sigan denegados. Restaurar Bluetooth al terminar,
   manteniendo esta app detenida. No reabrirla con Bluetooth encendido todavía.
   Los nombres de menús varían por fabricante. [Detención/desinstalación, Google](https://support.google.com/android/answer/2668665?hl=es),
   [permisos, Google](https://support.google.com/android/answer/9431959?hl=es).

No hace falta reiniciar ni actualizar el reloj, tocar Mi Fitness, activar
logging/TRACE, conceder accesibilidad o acceso a notificaciones, ni instalar
otras apps. Si falla, forzar detención o desinstalar solo RW4 Diagnostics,
con Bluetooth todavía apagado. No repetir reintentos de conexión.

## Resultado mínimo a comunicar

Versión Android; instaló sí/no; bienvenida abrió sí/no; inicio vacío sí/no;
salida usada (Quit/Atrás); reapertura sí/no; pidió activar Bluetooth sí/no;
permisos denegados sí/no. Si falla, solo mensaje de error sin identificadores.
No enviar logs completos, claves, serial/MAC ni dumps del teléfono.

El éxito valida únicamente arranque/cierre/reentrada visible en ese Android.
No demuestra ausencia de todos los servicios por debajo, captura de tráfico,
cierre de socket, autenticación, consultas reales ni viabilidad de Doom en RW4.

## Base de la preparación R89

Revisión read-only de 64 textos del TAR fijado. `GBApplication.onCreate`
inicializa DB/preferencias locales y `log_to_file/log_level_trace` false por
defecto. DeviceManager carga dispositivos desde la DB propia, no una lista
de relojes ya enlazados a Mi Fitness. Su receiver de cambios Bluetooth sigue
registrado, pero no crea una conexión; no afirmar ausencia de todo receiver
dinámico. ControlCenterv2 llama requestDeviceInfo, bloqueado antes de iniciar
servicio por el proxy modificado; sus shortcuts carecen de ticket manual.
WelcomeFragmentGetStarted tiene entrada a la app separada del descubrimiento.
Quit cierra DB y solicita terminar el proceso; ejecución Android pendiente.
No se modificaron estas fuentes ni se necesita otro build para esta prueba.
