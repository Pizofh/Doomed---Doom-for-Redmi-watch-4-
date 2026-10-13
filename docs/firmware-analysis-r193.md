# R193 — firmware 2.2.86 adquirido e inspeccionado en PC

2026-10-13. Se reutilizaron copias locales de logs y el APK de Mi Fitness
3.59.1i ya exportados. No operaciones de teléfono, ADB, Bluetooth o reloj.
No se ejecutó código del firmware ni se usaron herramientas de flash.

## Procedencia e integridad

R192 inspeccionó una carpeta vacía. R193 encontró otras tres copias existentes:
mi-fitness-logs-current, mi-fitness-logs-usb-r162 y mi-fitness-logs-usb-r164.
El barrido de las cuatro carpetas leyó 12 archivos, 53.034.038 bytes. De cuatro
URLs únicas candidatas, tres eran imágenes y una un archivo binario.

Se volvió a verificar el registro de `checkUpdate getLatestVersion ... success`:
`LatestVersion`, nombre Redmi Watch 4, versión 2.2.86 y `fullPackageUrl`.
El changelog ocupa varias líneas: el MD5 se recuperó del mismo registro completo,
acotado a 64 KiB y a su terminador, sin exportar texto crudo. Las URLs firmadas,
sus parámetros y logs permanecen privados en tools/local; no se publican.

Se descargó el enlace exacto HTTPS de **res-abroad-cdn.home.mi.com**, sin
redirecciones, cookies, credenciales de sistema, alteración de firma o bypass TLS.
HEAD devolvió 403; GET con Range 0–0 devolvió 206. El [SDK FDS de Xiaomi](https://github.com/XiaoMi/galaxy-fds-sdk-python/blob/master/fds/auth/signature/signer.py)
incluye el método HTTP en la firma: un rechazo HEAD no demostraba caducidad.
La descarga GET posterior devolvió 200, 53.979.532 bytes, y coincidió con el MD5
del registro de Mi Fitness. Content-Type fue text/plain; el contenido es binario.

SHA256 del paquete:
`d9dee6871ca6dc893000214d04ef6f5429a1b0f9ea57c79d8db9caf83cff6321`.

Esto verifica trazabilidad y coincidencia con el checksum de la respuesta
registrada; **no es una verificación independiente de firma criptográfica del
firmware por el fabricante**. No se considera autorizado o seguro para flashear.

## Estructura observada

Cabecera: bytes `60 5a 5a 7e`, seguidos del texto 2.2.86. No se ha documentado
todavía la semántica completa de su tabla de offsets o de sus checksums internos.

Se validaron límites de directorios centrales y cabeceras locales de 325 ZIP
embebidos, cada uno con una entrada. No se verificaron todos sus payloads.
Los cinco matches iniciales de magic gzip no pasaron validación de estructura/CRC:
buscar magic por sí solo no demuestra un contenedor. No hay magic ELF en el
paquete exterior; esa ausencia no demuestra que el loader no admita ELF.

Entre las entradas están vela_audio.bin, vela_sensor.bin, vela_bl.bin,
vela_ap.bin y vela_factory.bin. Son nombres de componentes observados, no un
mapa de particiones validado. Solo se descomprimió **vela_ap.bin**, como datos,
con límite de salida y comprobación de longitud, consumo del stream y CRC ZIP.
No se extrajeron claves/certificados ni se ejecutaron otros componentes.

| Dato | Resultado | Límite de la conclusión |
|---|---|---|
| Imagen principal | 6.636.408 bytes | No ELF o SDK con símbolos de depuración |
| SHA256 de imagen | `2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db` | Vinculada al paquete anterior por CRC y extracción fija |
| Identidad | M2315W1, Redmi Watch 4, 2.2.86 y 2.2.86_02101604 presentes | Confirma identificadores internos; región/build activa no verificados independientemente |
| Sistema | Strings NuttX y rutas armv8-m/arm_busfault.c, arm_hardfault.c, arm_memfault.c | Indicio fuerte de código ARMv8-M; no determina FPU/ABI/config exacta |
| Lua | Lua 5.4.0 presente | Versión integrada en imagen; no consulta de runtime físico |
| Loader | insmod/rmmod/lsmod y rutas modlib_load.c, modlib_loadshdrs.c | Refuerza listado físico R191; no verifica formatos/exports/lifecycle |
| Display | /dev/fb0 y strings lvgl | No prueba que podamos abrir el dispositivo en la unidad |
| Privilegios | Ningún contrato/config de aislamiento identificado | FLAT/PROTECTED/KERNEL sigue pendiente |

No se reutilizarán las direcciones del S3 ni su ELF Cortex-A7. El [contrato
nativo](rw4-native-contract.md) sigue abierto: exports, relocaciones, FPU/ABI,
entrypoint, descarga y contexto de privilegios deben documentarse antes del
hello C físico. No se ha compilado ni cargado C para M2315W1.

## Reproducibilidad y datos privados

Comandos utilizados, desde la raíz del repo:

```powershell
node tools/index-mi-fitness-dex.mjs --firmware
node tools/find-rw4-firmware-metadata.mjs --snapshots
node tools/find-rw4-firmware-metadata.mjs --candidates
node tools/retrieve-rw4-firmware.mjs --probe
node tools/retrieve-rw4-firmware.mjs --download
node tools/inspect-rw4-firmware.mjs
node tools/inspect-rw4-firmware-containers.mjs
node tools/inspect-rw4-native-image.mjs
```

No son un downloader público de firmware: requieren las copias privadas de
logs/APK, el enlace original y los hashes/revisiones fijados. Rehúsan sobrescribir
informes/archivos existentes; no repetirlos solo para confirmar resultados.
Una URL puede caducar. Los binarios propietarios quedan exclusivamente bajo
tools/local/firmware-research; reportes completos en artifacts/research. Ambas
rutas están ignoradas por Git. No distribuir firmware, recursos o secretos.

El APK se leyó con nuestro índice acotado y el apkanalyzer del SDK oficial,
sin ejecutarlo. El flujo com.mi.fitness.checkupdate configura device/latest_ver
y una alternativa V2 mi/ota/updater/v1/checkUpdate. UpdateHelper selecciona V2
cuando Product.getOta()==3; el valor de ese campo para RW4 no se estableció aquí.
No se hicieron peticiones a esos endpoints ni se enviaron credenciales.
Los offsets DEX candidatos deben contrastarse con smali; no son desensamblado
fiable por sí solos.

Validación: comandos de inspección anteriores completados, sintaxis de los seis
scripts Node y AST PowerShell sin errores, diff sin errores de whitespace,
binarios/URLs/reportes confirmados como ignorados por Git y gates físicos false.
No se repitieron ensayos del emulador o del reloj para esta investigación.

## Siguiente checkpoint

Identificar el contrato de carga y la tabla de símbolos de vela_ap.bin mediante
inspección estática en PC. Si está ausente o no es resoluble, documentar qué
consulta mínima al shell físico permitiría resolverlo y preparar un plan concreto
para revisión. **Todavía no ejecutar insmod ni otro payload nativo en el reloj.**
