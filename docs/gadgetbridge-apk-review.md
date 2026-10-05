# Gadgetbridge: inspección estática del APK

R80,2026-10-04. APK descargado por usuario desde la URL sugerida de [F-Droid](https://f-droid.org/en/packages/nodomain.freeyourgadget.gadgetbridge/), sin instalación/ejecución ni conexión al reloj. No hubo nuevas lecturas de logs privados en esta inspección.

| Dato local | Resultado |
|---|---|
| Archivo ignorado | tools/local/gadgetbridge/nodomain.freeyourgadget.gadgetbridge_253_01cce93.apk |
| Bytes |20301941 |
| SHA256 del archivo |38b7666166f6fd0268b598ad0b40435744833f26b8cb7b13eb724ca61894a66b |
| Package / versión | nodomain.freeyourgadget.gadgetbridge /0.94.0 /253 |
| Android mínimo / target | SDK23 (Android6.0) /35 |
| Debuggable | false |
| ZIP |2767 entradas,33858780bytes expandidos, sin paths inseguros ni nombres duplicados; nombres local/central coinciden |
| Certificado SHA256 |01cce9316fcb77ea02c6dea81fde9f3176469202c0cea0514c0e03cb969bc7be |
| Subject del certificado | APKSignKey / Gadgetbridge / Freeyourgadget |
| Android v2 | Firma RSA-PKCS1/SHA512 del signed-data y digest del contenido comprobados por inspector limitado propio |

El hash del archivo es un pin local de esta descarga, **no comparación con un hash de release obtenido independientemente**. El certificado es autofirmado: eso no establece identidad por sí solo. Su fingerprint completo coincide con el permitido por F-Droid para [Internet Helper del mismo proyecto](https://gitlab.com/fdroid/fdroiddata/-/blob/master/metadata/nodomain.freeyourgadget.internethelper.yml?ref_type=heads); evidencia de clave de publisher relacionada, no metadata exacta de este APK. La ficha F-Droid identifica el APK elegido como firmado por desarrollador y enlaza su source tarball. El metadata exacto de Gadgetbridge y build log no pudieron recuperarse por estas herramientas; no afirmar reproducción de build o confianza de índice firmado verificada localmente.

## Comprobaciones y límites

Se usaron `keytool`/`jarsigner` del JDK26 existente en PC. `jarsigner -verify -verbose -certs` devuelve0 y `jar verified`, con advertencias de cadena autofirmada y diferencias de lectura JarFile/JarInputStream. Las entradas META-INF de firma están al final del archivo; es una explicación plausible del problema de verificación por streaming, no demostrar un defecto/malware ni ignorar la advertencia. El inspector propio comprueba además nombres de ZIP y firma/contenido v2 independientemente del flujo JAR. No se ejecutaron las clases DEX ni las bibliotecas JNI del APK.

`tools/inspect-gadgetbridge-apk.mjs` usa Node/crypto/zlib sin dependencias nuevas. Sigue el [formato Android v2 documentado por AOSP](https://source.android.com/docs/security/features/apksigning/v2) para este caso: un signer y RSA-PKCS1 SHA256/SHA512. Valida firma sobre signed-data, digest segmentado de APK y correspondencia de certificado/public key. Este APK contiene un campo vacío adicional dentro del signed-data; se conserva y queda cubierto por firma, sin interpretarlo como atributo nuevo. El inspector no es apksigner ni un validador Android completo: v3/v4, atributos de stripping/rotation y aceptación por el Android concreto no están verificados. Decodifica el manifiesto binario para versión y permisos; no decompila/revisa todos los métodos DEX.

Permisos declarados: Bluetooth/ubicación, llamadas/SMS/contactos/calendario/cámara, Health Connect y otros para funciones de companion. Declarado no significa concedido. El manifiesto no declara `android.permission.INTERNET`; sí permiso del Internet Helper. Eso no prueba aislamiento o ausencia de comunicación indirecta. No conceder todos los permisos por defecto en una futura prueba de conectividad; seleccionar los necesarios según Android y la pantalla real. No instalar Internet Helper para este proyecto.

Comandos reproducibles desde la raíz:

```powershell
node tools/inspect-gadgetbridge-apk.mjs
node tools/test-gadgetbridge-apk.mjs
keytool -printcert -jarfile tools/local/gadgetbridge/nodomain.freeyourgadget.gadgetbridge_253_01cce93.apk
```

Resultado completo: `artifacts/research/gadgetbridge-apk-inspection.json`; JAR: `artifacts/research/gadgetbridge-jarsigner.txt`, ignorados y sin datos del reloj. El test exige APK local fijado, confirma versión/certificado y rechaza alteración del contenido, signed-data y truncamiento sobre buffers en RAM. Pasa. Original intacto; no instala/ejecuta APK. Esto es inspección y evidencia criptográfica acotada, no auditoría de seguridad completa.

## Siguiente checkpoint y gate

Preparar la secuencia de conexión temporal y retorno a Mi Fitness con revisión de inicialización Xiaomi en0.94.0. No asumir que «conectar» es solo leer: puede autenticar, sincronizar hora/configuración o efectuar otras operaciones. Las fuentes históricas del mirror2024 no describen necesariamente este APK. Permanecen pendientes comandos automáticos concretos, writes, compatibilidad2.2.86 y retorno sin pérdida de registro.

La ficha F-Droid enlaza [source tarball para code253](https://f-droid.org/repo/nodomain.freeyourgadget.gadgetbridge_253_src.tar.gz). Descarga binaria no accesible por estas herramientas; solicitar al usuario guardarlo en `tools/local/gadgetbridge/`, sin extraer/ejecutar. Inspeccionar paths, tipos, tamaños y hash antes de extracción selectiva de texto. Consultar fuentes Xiaomi/RW4/servicio de conexión de esta distribución; no instalar toolchain Android ni decompiladores para este paso. No afirmar build reproducido solo por leer el source tarball.

Antes de cualquier conexión al reloj, completar `physical-device-plan.md` con secuencia exacta, alcance, writes, peor fallo, rollback y recovery; solicitar revisión explícita. No pedir aún que instale/abra Gadgetbridge, introduzca claves, cierre Mi Fitness, cambie permisos, desvincule o resetee. La revisión del APK no abre el gate físico ni confirma autenticación/instalación de esferas. Nada se publica ni se almacena firmware propietario.
