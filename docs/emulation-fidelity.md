# Fidelidad de emulación para M2315W1

R98,2026-10-06. Investigación documental en PC; no nuevas descargas, builds,
firmware ejecutado, conexión o instalación física. La consulta Bluetooth
sigue diferida por petición R97; el usuario pregunta por alternativas de PC.

Conclusión: podemos mejorar el control/reproducibilidad de las pruebas y
estudiar un firmware exacto si se obtiene legítimamente. No se encontró un
emulador público que replique M2315W1/BES2700iBP/2.2.86. Es un resultado de
búsqueda acotada, no prueba de que nunca exista o sea imposible construirlo.

## Opciones y límites

| Opción | Beneficio | Lo que falta / límite |
|---|---|---|
| MiWatchEmulator actual | Port Doom/UI/Lua/cierre/persistencia ya demostrados | Guest S3 Goldfish Cortex-A7; preset RW4 cambia tamaño, no SoC/build |
| OpenVela compilado/configurado por nosotros | Seleccionar versiones/config y probar fallos/memoria con un entorno reproducible | Sin configuración exacta RW4 no es necesariamente más fiel; no demuestra ABI/exports/privilegios stock |
| Análisis estático de OTA oficial2.2.86 exacta | Posibles cadenas, cabeceras, arquitectura, símbolos/imports y componentes del runtime | Paquete aún no adquirido/verificado; podría ser delta/comprimido/cifrado o carecer de símbolos. No equivale a dump completo ni backup |
| Emular componentes concretos con interfaces simuladas | Validar contratos que realmente hayamos identificado | No recrea semántica de drivers/privilegios/flash/Bluetooth no conocidos; no cuantifica riesgo físico |
| Emulación del firmware stock completo | Ejecutar la misma imagen contra hardware virtual compatible | Requiere imagen y modelar CPU/memoria/interrupciones/periféricos usados. Trabajo separado grande; factibilidad no demostrada |

## Fuentes primarias verificadas

- [MiWatchEmulator README](https://github.com/m0tral/MiWatchEmulator/blob/master/README.md)
  anuncia tamaños RW4 y pruebas de watchfaces/apps. Nuestro inventario del
  guest identifica S3 y los flags en [revisión local](emulator-package-review.md).
- [Quick start oficial OpenVela](https://github.com/open-vela/docs/blob/dev/en/quickstart/openvela_ubuntu_quick_start.md)
  permite menuconfig/build de Goldfish y lanzamiento del emulador. La guía
  consultada exige Ubuntu22.04,16GB RAM y40GB libres; declara WSL/Docker no
  soportados para ese procedimiento. No se instaló este entorno ni se
  asumió compatibilidad con nuestro Windows. No ejecutar sus scripts remotos
  de instalación sin revisión.
- [Vendor BES oficial](https://github.com/open-vela/vendor_bes) y README dev
  describen BES2600WM-AX4F/BEST2003 evaluación; no presentan una configuración
  stock Redmi Watch4 ni demuestran BES2700iBP. No convertir código de placa
  BES2600 en soporte del SoC del reloj.
- [QEMU, emulación ARM y selección de placa](https://www.qemu.org/docs/master/system/target-arm.html)
  explica que el modelo de máquina debe corresponder al hardware de la imagen.
  Una CPU ARM compatible por sí sola no basta para arrancar firmware de otro
  SoC/placa. La lista documentada revisada no ofrece una máquina RW4/BES2700.
  Esto no audita todos los forks privados de QEMU.

## Próximo paso con valor para compatibilidad

Antes de construir otro entorno grande, buscar procedencia de un paquete OTA
oficial de **M2315W1/región/2.2.86** y confirmar si es imagen completa o delta.
Solo archivo ya disponible o descarga de fuente verificable del fabricante,
sin iniciar actualización en reloj, instalar Mi Fitness mod, obtener dump
mediante exploit ni sustituirlo por firmware de otro modelo/región.

Si existe: registrar origen/hash/manifest y analizar bytes como datos en PC,
sin ejecutar código extraído ni publicar firmware propietario. Buscar evidencia
de ISA/ABI, loader/exportaciones, versión Lua/LVGL y modelo de privilegios.
Esas son preguntas a investigar, no resultados que un OTA necesariamente dará.

Eso podría permitir adaptar mejor herramientas y pruebas, pero no certifica
ausencia de brick ni proporciona recuperación. Un paquete instalable no es
por sí solo un método de restauración cuando el reloj no arranca.

El PR Gadgetbridge3693 y el ciclo auth/retorno siguen pendientes, por separado
de fidelidad nativa. Obtener imagen stock no es requisito para la investigación
documental de Bluetooth ni autoriza reanudar una conexión diferida.
