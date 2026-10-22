# Preparar e instalar DOOM II

Estado: asistente de primera instalacion en validacion. Preparacion, configuracion
y transporte pasan las pruebas aisladas sin Bluetooth. La instalacion fisica
permanece deshabilitada hasta validar el paquete en hardware.

## Recorrido del usuario

1. Extraer la herramienta y abrir **Preparar.cmd**. Arrastrar el propio DOOM2.WAD
   a la ventana. Se genera **mi-paquete/DOOM-II.face**.
2. Abrir **Configurar.cmd**, una sola vez, e importar un log propio compatible de
   Mi Fitness o introducir manualmente la direccion Bluetooth y la clave propia.
   La clave se oculta durante la entrada y no aparece en los informes.
3. Abrir **Instalar.cmd**. Cuando este habilitado, mostrara lo que enviara y
   pedira escribir **INSTALAR**. Comprobara autenticacion, modelo, firmware,
   bateria >=50% y catalogo antes de escribir. Mostrara el progreso del envio.
4. Tras confirmar el registro, seleccionar DOOM II en el reloj y pulsar JUGAR.
   La primera instalacion incluye el juego: no necesita otra esfera ni un portador.

Actualmente el paso 3 informa que la instalacion sigue en validacion y no se
conecta al reloj. No editar los gates ni usar scripts historicos para evitarlo.

## Requisitos

Windows de 64 bits, Node.js 22 o posterior y Bluetooth. La herramienta incluye
el cliente nativo propio y sus fuentes; no requiere ARM GCC, EasyFace ni emulador.
El destino del port es Redmi Watch 4 M2315W1 con firmware 2.2.86. Antes del envio:
reloj junto al PC, emparejado en Windows, Mi Fitness cerrado y juego cerrado.
No se borran esferas, no se inicia el juego desde el PC y no se reintenta un
corte automaticamente. Una version ya registrada tampoco se sobrescribe.

Solo se acepta por ahora el DOOM2.WAD exacto de 14.604.584 bytes y 32 mapas:

`10d67824b11025ddd9198e8cfc87ca335ee6e2d3e63af4180fa9b8a471893255`

Otras ediciones y mods se rechazan. El preparador funciona sin Internet,
comprime sin perdida y verifica el paquete. No modifica el WAD original.
El paquete generado contiene datos comerciales: usarlo personalmente y no
publicarlo. La carpeta de salida existente nunca se sobrescribe.

## Conexion privada

La clave de autenticacion no es el PIN de emparejamiento. Cada propietario
necesita la de su reloj. No hay todavia una extraccion de claves validada para
cualquier telefono o version de Mi Fitness. Si no se dispone de una clave o
log compatible, este flujo no puede completar la configuracion.

Los logs se leen localmente y solo se acepta una identidad no ambigua. Una clave
extraida no se considera vigente hasta que el reloj la autentique. No se suben
logs ni claves a ningun servidor. La configuracion queda en archivos locales
sin cifrar dentro de **runtime/tools/local/pc-rfcomm/**: proteger esa carpeta y
no compartirla. La entrega original no contiene claves ni datos del propietario.

Tambien puede importarse un JSON propio con los campos address, authKey,
model y firmware mediante Configurar.cmd --file. No se admiten datos de otra
persona y no se reemplaza una configuracion existente automaticamente.

## Uso por consola

~~~powershell
node prepare.mjs --wad "C:\Juegos\DOOM2.WAD" --out "C:\Juegos\mi-paquete"
Configurar.cmd --file "C:\Privado\conexion.json"
~~~

Instalar.cmd busca mi-paquete junto a la herramienta. Si se elige una salida
personalizada para preparar, colocar luego ese directorio junto a Instalar.cmd.
Preparar muestra installed: false: crear el paquete no significa instalar.
Los resultados del envio se guardan localmente sin claves; la lectura de registro
no equivale a leer de vuelta y verificar todos los bytes instalados.

## Validacion pendiente

- Aceptacion del nuevo inicio R406 por el propietario.
- Arranque, controles, guardado/carga, cierres y reapertura del paquete independiente.
- Configuracion e instalacion por un segundo propietario con un reloj compatible.

El juego sigue limitado a un toque activo, audio que puede entrecortarse y
sin musica. Los modulos nativos comparten el espacio del sistema; un fallo
puede bloquear el reloj o requerir reinicio. Recuperacion integral sin validar.
