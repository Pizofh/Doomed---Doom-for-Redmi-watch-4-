# Empezar con Doomed 0.1.0

Doom funciona en el Redmi Watch 4 **M2315W1 con firmware 2.2.86** probado por el
proyecto. Hubo aproximadamente media hora de juego, recuperación de una partida
guardada tras morir y salida CLOSED sin fallos reportados. Esto no establece
compatibilidad con otro modelo o firmware.

## Si ya lo tienes instalado

Conserva **DoomReady** y **DoomLauncher**. No necesitas reinstalar la versión
0.1.0 ni borrar partidas. Consulta [los controles y el guardado](playing.md).
El juego admite un botón táctil a la vez y no tiene sonido.

## Si llegas desde GitHub con otro reloj

Esta entrega publica el trabajo de portabilidad y la documentación. Todavía no
ofrece un instalador universal ni un paquete que pueda abrirse directamente en
Mi Fitness. No hay una instalación desde cero validada en un segundo reloj.

La instalación física revisada consta de un portador de datos DoomLauncher y
la esfera DoomReady, transferidos con el cliente experimental del proyecto.
Ese cliente depende del vínculo y la autenticación locales del propietario y
de comprobaciones específicas de modelo, firmware, catálogo e identidad del
paquete. No usar los IDs o datos de conexión de otra persona. Mi Fitness de la
unidad probada no ofrecía importación directa de estos archivos.

No ejecutar los scripts históricos `install` ni abrir sus gates copiando valores
de los ensayos. Antes de una instalación nueva faltan un flujo de configuración
para otro propietario y su validación en una segunda unidad compatible.
Conservar el vínculo y los datos actuales del reloj. La recuperación integral
de un sistema bloqueado no está validada.

## Revisar las fuentes en un PC

El entorno usado es Windows con Node.js 22 y Git. Clona el repositorio público:

```powershell
git clone https://github.com/Pizofh/Doomed---Doom-for-Redmi-watch-4-.git
cd Doomed---Doom-for-Redmi-watch-4-
node tools/check-release-prerequisites.mjs
```

El comprobador solo lee un conjunto acotado de requisitos y muestra faltantes o
cambios. No instala herramientas, compila código, conecta dispositivos ni lee
MAC, claves o logs de conexión. `cleanCheckoutBuildSupported: false` es el estado
actual del proyecto, incluso si los archivos enumerados están presentes.

| Requisito | Cómo se usa | Se incluye en Git |
|---|---|---|
| doomgeneric, revisión `dcb7a8dbc7a16ce3dda29382ac9aae9d77d21284` | Motor; 181 archivos verificados contra `doom/doomgeneric-source.lock.json` | Lock y adaptaciones propias; upstream se obtiene aparte |
| Arm GNU 14.3 revisado | Compilación y enlace ARM | Huellas, no ejecutables |
| EasyFace 4.23 revisado | Empaquetado de esfera | Referencias, no compilador |
| WAD shareware 1.9 exacto | Datos leídos por el motor | No |
| Imagen de inspección RW4 fijada | Verificar enlaces nativos de ese firmware | No |
| Artefactos de compilaciones anteriores | Recetas, objetos y referencias del build incremental | No |
| Datos de conexión del propietario | Solo una instalación física revisada | Nunca |

El README describe las herramientas de build existentes. Sus comandos son para
el entorno de investigación preparado; no forman todavía una receta de build
limpio. Los scripts rechazan ciertos destinos ya revisados para no sobrescribir
evidencia. No borrar esas protecciones para intentar que un clon compile.

Las dependencias públicas se identifican en [el inventario](../third_party/README.md).
`scripts/setup.ps1 -FetchSources` obtiene fuentes fijadas por separado; no descarga
todos los requisitos ni resuelve los artefactos históricos. Las revisiones
históricas de instalación se conservan como evidencia, no como manual actual.

## Distribución y privacidad

El código upstream conserva sus avisos y licencia GPL. Los datos WAD y las
herramientas externas tienen sus propios términos; no se incluyen en esta
entrega pública. La licencia general del código propio está pendiente de elección
del autor; no se deduce una licencia general de la mera visibilidad en GitHub.

Para reportar un problema basta el modelo, firmware, nombre de la esfera, pasos
y mensaje de error. No adjuntar MAC, claves, logs privados ni partidas.

La entrega local `build/releases/Doomed-0.1.0/` conserva el paquete probado y sus
sumas SHA256. Permanece fuera de Git. La [nota de versión](releases/v0.1.0.md)
está lista para usar al preparar la publicación.
