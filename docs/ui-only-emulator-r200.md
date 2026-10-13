# R200 — interfaz separada probada con LVGL real, sin C

2026-10-13. Solo PC/emulador S3, no réplica del M2315W1. El usuario confirmó
retorno a esfera habitual/cambio por pulsación larga y todos los menús/desplazamientos
normales tras FirstC. Cuatro indicadores grises/blancos y el inferior rojo:
compatible con detención de preparación, sin carga/retirada C confirmadas.

## Paquete y alcance

UiOnly ID365219997,12.784bytes, SHA256
`ecb3f0cb9f5fceac877c20eb77944a3ecf6ebbc6f97fe48a6197eb9e39ea8e84`.
Fuente materializada4293bytes SHA256
`12ea3bc8395bca3fdc8d83e68839c848952f5ef5a8b1b8d537051584ebb43820`.
Factory UI R199 SHA807119943a71900d5a73e9da4c27045f59e06ae266ff6e97dce2b7ebc3aa9592.

El script incluye la factory estáticamente mediante función Lua, sin global
load para compilar fragmentos. No ELF, os/io, shell, controlador nativo o timers.
Observa type(load) y la forma del SCRIPT_PATH únicamente mediante logs propios
del emulador. El callback entrega un resultado **sintético de UI**, no una
carga/retirada. Leyenda FRAME/ICON/INPUT/TOUCH/END y botón TEST UI, bitmaps propios.

tools/package-ui-only-r200.mjs usa compiler EasyFace revisado sin ADB y verifica
tres registros serializados exactos:main.lua,legend.png,run.png. No perfil físico
registrado; no autorización para enviar UiOnly al RW4. El paquete FirstC aprobado
y sus fuentes/hashes permanecen intactos. firstCAssets original no se modifica;
una función separada produce los nuevos assets de UI.

## Instalación y validación del emulador

Guard QEMU/puertos propios y ADB5039/emulator-5554; sin USB seleccionado.
ID ausente, módulos vacíos y copia de data pausada/readbackSHA antes de instalar.
No snapshot de RAM ni garantía de consistencia FAT/powerloss. Un recurso propio
copiado/readback completo; invalidación del catálogo cache y reset solo del guest.

El primer preflight read-only exigía una única fila activa, pero esta caché S3
tiene Storage normal(tipo1) y una entrada AOD(tipo2). Se preservó ese reporte
en artifacts/emulator/ui-only-r200-preflight; no había instalación/escritura.
Se revisaron filas/tipos y se admitieron esos IDs concretos sin alterar sus flags.

Navegación por menús stock del emulador, sin comandos para activar la esfera:
panel desde margen inferior→Settings→Watch faces→selector→UiOnly. Toggle stock
de pulsación larga OFF conservado. El selector necesitó esperar transiciones;
no se pulsaron otras esferas de prueba. Preview distinto de UI de ejecución.

- Captura real muestra etiquetas y botón; checker compara todos los píxeles de
  bitmaps y cinco marcadores grises contra assets propios, toleranciaRGB565.
- Un toque real en TEST UI produce cinco verdes y un único log click.
- Segundo toque mantiene captura idéntica y no añade callback.
- Abrir/cerrar panel stock mantiene la misma captura verde, sin nuevo click.
- Retorno por Ajustes/selector a Storage; log close lua now., propia inactiva,
  Storage activa y29IDs previos preservados: catálogo29→30.
- Fuente/PNGs extraídos exactos, registro real de módulos vacío. No C ejecutado.

Checker: `node tools/check-ui-only-emulator-r200.mjs`. Reporte privado
artifacts/emulator/ui-only-r200/validation.json. Capturas
artifacts/emulator/screenshots/ui-only-r200-{render,click,click-repeat,focus-panel,resume2,stock-return}.png.
Scripts setup/check rechazan repetir instalación/validación con reportes existentes.

## Hallazgo de ruta

El log runtime S3 de nuestra UiOnly contiene:
`/data/app/watchface/market/365219997//lua/`.
Global load es function en este S3, no demuestra su disponibilidad en RW4.
El sufijo esperado /ID/lua/ falla por el separador duplicado; el adapter R197
rechaza además cualquier // antes de dibujar leyenda/botón.

**Fallo de validación confirmado en emulador**; se había usado una ruta artificial
con un solo separador en las pruebas anteriores. No ejecutar el ELF RW4 para
reproducirlo. La coincidencia con END rojo físico es una inferencia razonable;
no conocemos aún SCRIPT_PATH real en M2315W1/2.2.86. [Normalización pura R201](first-c-path-r201.md)
resuelve el separador manteniendo límites/ASCII/ID/sufijo, sin ampliar permisos.
