# Multitactil: investigacion estatica y evaluacion de riesgo R400

El usuario pide investigar y evaluar el riesgo ANTES de ejecutar. En esta
revision no hubo conexion al reloj, consulta Bluetooth, envio, seleccion,
arranque, ioctl, lectura de RAM fisica ni prueba en emulador. Solo analisis
local de una imagen como datos y consulta de documentacion publica.

## Conclusion

Hay un siguiente paso de diagnostico mas acotado que tocar el controlador:
identificarlo leyendo un byte de RAM que el propio arranque ya rellena. Para
Chipone existe ademas un valor max_num almacenado por el sistema. Es un DISENO
de posible comprobacion futura, no un lector compilado ni una prueba autorizada.

No se ha demostrado multitactil en esta unidad. Tampoco hay fundamento para
declararlo fisicamente imposible. Las rutas stock revisadas entregan un punto;
para Doom no basta habilitar mascaras combinadas en Lua o abrir otro input0.

## Hallazgos nuevos y evidencia local

La imagen candidata fijada por SHA256 es
2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db.
Su identidad no equivale a un readback byte a byte del reloj. Las direcciones
siguientes solo tienen significado dentro de ese contrato; no son APIs estables.

### Seleccion del controlador

La rutina en offset4b6988 prueba ICNT8918, despues Zinitix y despues Hynitron,
deteniendose cuando la inicializacion tiene exito. Sus ramas guardan un codigo
en RAM0x3c1cdedc y emiten mensajes que identifican el controlador exitoso:

| Codigo | Ruta del firmware | Evidencia adicional del modelo |
| --- | --- | --- |
| 2 | bes_ts_icnt8918_setup | Nombre de setup y ficheros icnt8918 del sistema |
| 1 | bes_ts_zinitix_setup | Rutinas etiquetadas ztw662 |
| 3 | bes_ts_hynitron_setup | Rutina etiquetada cst9217_ts_getstate |
| 0/otro | No concluir | Error de arranque, dato no valido o contrato distinto |

Se verificaron destinos BL, condiciones y escrituras de los codigos. El valor
real de esa RAM NO se ha leido, por lo que aun no sabemos cual usa esta unidad.
Encontrar tres drivers dentro de una imagen no identifica el panel instalado.

### Maximo ya consultado por Chipone

Durante su setup, la rutina1dcd54 consulta registros8004/8005 y801a. La rama
exitosa de801a guarda un byte en0x3c1aeba2 y lo registra como cts_get_max_num.
Ese byte podria leerse DESPUES, sin volver a llamar la rutina ni enviar I2C.
Si falla la consulta o el cache no es valido, el dato no permite concluir nada.
Su valor tampoco demuestra que dos contactos lleguen simultaneamente al juego.

### Datos previos al recorte

El camino normal Chipone lee16bytes en una variable de pila; la conversion
normal inspeccionada extrae solo ID/x/y/presion/evento del primer registro y
termina produciendo una muestra de un punto. Queda una cola de bytes que esa
rama no interpreta. Que pudiera contener un segundo registro es una HIPOTESIS:
no hay paquete fisico, layout completo ni dos contactos observados que lo prueben.
La longitud16 por si sola no demuestra dos dedos. No se encontro un buffer raw
persistente que permita recuperar pasivamente esa cola desde la aplicacion.

Zinitix tambien lee un bloque y convierte una sola coordenada/estado; Hynitron
expone estado/posicion individual en la ruta revisada. Reinterpretar el sample
upper de32bytes como si contuviera mas puntos seria incorrecto.

### Reinicializar no es una consulta inocua

Los tres setups alcanzan rutas de comprobacion/actualizacion de firmware del
tactil: init Zinitix llama1db350, Chipone llama1de0c8 y Hynitron llama1df5d8.
Se contrastaron las llamadas con rutas y mensajes de actualizacion, incluyendo
comprobacion de versiones y escritura/flash. No significa que cada arranque
reescriba el chip, pero impide tratar un nuevo init como diagnostico de lectura.
NO llamar setup, upgrade, reset, calibracion o cambio de modo para identificarlo.

## Documentacion publica y limites

La [ficha del fabricante del ICNT8918](https://www.chiponeic.com/en/TT/227)
lo identifica como controlador para OLED wearable, con interfaz I2C y varias
configuraciones TX/RX. No publica en esa ficha un numero de dedos utilizable:
canales TX/RX y frecuencia de reporte NO equivalen a contactos simultaneos.
El enlace de descarga del fabricante no pudo recuperarse en esta revision.

La [documentacion del driver ESPHome CST92xx](https://esphome.io/components/touchscreen/cst9220/)
describe CST9217 como single-touch y CST9220 como multi-touch. Esto documenta
ese soporte, no identifica nuestro panel ni verifica su firmware particular.
El [ejemplo del fabricante de la placa Waveshare](https://github.com/waveshareteam/ESP32-S3-Touch-AMOLED-1.75/blob/main/examples/arduino/10_Touch_CST9217/10_Touch_CST9217.ino)
consulta getSupportTouchPoint y limita sus arrays a dos. Reservar dos posiciones
NO es prueba de que un CST9217 concreto entregue dos. No extrapolar resultados
de esas placas a RW4 ni proponer su firmware como actualizacion del reloj.

## Riesgos de las opciones futuras

Son comparaciones cualitativas; no hay datos para asignar porcentajes de fallo.
El riesgo de dano persistente y el de bloqueo temporal no deben confundirse.

| Opcion | Bloqueo o perdida temporal de entrada | Dano persistente / limites | Evaluacion |
| --- | --- | --- | --- |
| Analisis estatico en PC, realizado aqui | Ninguno sobre el reloj | No toca el dispositivo | Continuar permitido |
| Leer selector RAM y cache ya existente | Un modulo o una direccion incorrectos pueden fallar o exigir reinicio | El cuerpo lector no necesita escribir panel/flash; instalarlo y cargar C tienen riesgos propios, recuperacion integral sin validar | Primera opcion a preparar/revisar, aun NO ejecutada |
| Segundo lector de input0 | ABI, apertura/cierre o colas incorrectos pueden bloquear | No recupera contactos eliminados antes; lectura independiente demostrada solo en S3 | No justifica otro ensayo de Doom por si solo |
| Acceso I2C directo al panel | Puede competir con el driver y consumir/alterar reportes o ACKs | Sin protocolo exacto no se puede asegurar ausencia de efectos persistentes | No ejecutar como simple lectura exploratoria |
| Sustituir callbacks/driver en RAM | Carreras, IRQs, locks o callbacks que sobreviven al modulo pueden dejar el reloj sin tactil o provocar fallos tardios | No exige flash por diseno, pero no garantiza ausencia de corrupcion; retirada y reinicio sin validar | Riesgo alto de software; requiere investigacion adicional |
| Reescribir firmware del panel o del sistema | Puede perderse la entrada y el arranque normal | Puede requerir programador/recuperacion que no tenemos validada | Riesgo persistente alto; no recomendado con la evidencia actual |

La ausencia de escrituras en el cuerpo de un futuro lector RAM no hace inocua
la instalacion/carga de codigo FLAT ni garantiza que reiniciar recupere todo.

## Siguiente paso propuesto, sin autorizacion para ejecutarlo

Preparar por separado el diseno de un lector minimo de identificacion: verificar
huellas del codigo de seleccion y mapa del firmware, leer SOLO el byte del
selector y, SOLO si vale2, el cache max_num. Sin desreferenciar punteros
arbitrarios, abrir input/I2C, llamar setups/ioctls, cambiar callbacks, crear
hilos o cargar Doom. Salida acotada y retorno inmediato; revisar su loader,
memoria y ciclo completo antes de siquiera proponer instalarlo.

Si el dato fuera invalido, detenerse; no intentar reparar o reinicializar el
controlador. Si fuera Chipone y max_num>=2, solo justificaria investigar el
formato raw y una captura sincronizada; no integrar dos dedos automaticamente.
Si indica otra ruta o max_num<=1, evaluar sus limites especificos antes de
escalar a cambios de driver. No hay todavia una solucion multitactil lista.

El usuario mantiene la decision sobre cualquier prueba fisica posterior.
Su instruccion actual es NO EJECUTAR. No se pide ni se infiere permiso ahora.

## Reproduccion

`node tools/review-touch-selection-r400.mjs` analiza la imagen como datos,
verifica SHA de imagen/objdump y aserciones de destinos, literales y ramas.
Genera ventanas privadas en artifacts/research/rw4-touch-r400-repro-v2,
rechazando sobreescritura. No compila payload ni usa BLE, ADB, ioctl o emulador.
Informe adicional de trabajo en artifacts/research/rw4-touch-r400. Ambos
directorios estan ignorados; el firmware y sus bytes no entran al repositorio.


## Actualizacion R401

Se encontro una alternativa para el primer diagnostico sin cargar un lector C
nuevo: modo de lectura de una palabra del comando stock mw, contrastado con su
rama exacta en el AP. Es un diseno aun no probado desde Lua, sin instalable ni
ejecucion autorizados. Ver [revision y riesgos R401](touch-stock-read-r401.md).
