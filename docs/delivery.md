# Preparar DOOM II para tu reloj

Estado: preparador local en desarrollo. Genera un paquete de primera instalacion,
sin otra esfera de Doom. Aun no instala en el reloj ni se ha validado en una
segunda unidad. No es una entrega jugable lista para cualquier usuario.

## Recorrido previsto

1. Descargar y extraer la herramienta de preparacion.
2. Abrir **Preparar.cmd** y arrastrar el propio **DOOM2.WAD** a la ventana.
3. La herramienta verifica el juego y crea **mi-paquete/DOOM-II.face**.
4. Un futuro asistente de instalacion comprobara reloj, firmware y conexion,
   mostrara lo que enviara y pedira confirmacion antes de escribir.

El paso 4 todavia no esta disponible. No cargar la plantilla vacia ni ejecutar
los scripts de ensayos historicos para saltarse ese paso.

## Requisitos del preparador

Windows y Node.js 22 o posterior. No requiere compilador ARM, EasyFace,
emulador, cuenta de desarrollador ni archivos de otra instalacion.
El destino probado por el proyecto es Redmi Watch 4 M2315W1 / firmware 2.2.86.

Solo se acepta por ahora el DOOM2.WAD exacto de 14.604.584 bytes y 32 mapas
que corresponde al motor preparado. Otras ediciones, mods y PWAD se rechazan;
no se modifica el original. SHA-256 compatible:

`10d67824b11025ddd9198e8cfc87ca335ee6e2d3e63af4180fa9b8a471893255`

La herramienta funciona sin Internet y no se conecta al reloj. Comprime el
WAD sin perdida y verifica el paquete final. La carpeta de salida contiene
datos comerciales del juego: conservarla para uso propio, no redistribuirla.
No incluye ni solicita MAC, claves, logs del telefono ni partidas.

Tambien se puede preparar desde consola:

~~~powershell
node prepare.mjs --wad "C:\Juegos\DOOM2.WAD" --out "C:\Juegos\mi-paquete"
~~~

El resultado indica `installed: false`: preparar no significa instalar.
Si la carpeta de salida existe, se detiene para conservar lo que ya hay.

## Lo que falta para la entrega publica

- Confirmar el inicio estetico R406 con el propietario.
- Validar el paquete independiente, sus cierres y reapertura en hardware.
- Resolver la configuracion de conexion de otro propietario sin publicar claves.
- Probar el asistente en un segundo reloj compatible antes de anunciar instalacion sencilla.

El preparador conserva las limitaciones actuales del juego: un toque activo,
audio que puede entrecortarse y ausencia de musica.
