# R399: prioridad a dos contactos reales

El usuario prioriza caminar y disparar a la vez antes que mejorar el sonido.
La version funcional sigue siendo R397014. Audio y nuevos ajustes visuales
quedan pospuestos mientras se evalua esta entrada. No hay nuevo envio autorizado.

## Resultado local

R353/R371 encontraron tres emisores de muestras hacia el upper tactil fijado,
todos con npoints=1 e identificador0. R389 reviso sus ioctls y no encontro un
interruptor de numero de contactos. El motor acepta varias teclas, pero eso
no reconstruye contactos que el driver ya haya descartado. El observador C de
S3 tampoco demuestra capacidad ni ABI fisica de RW4.

R399 cierra una laguna concreta: busca ademas saltos directos B.W, B.cond.W,
B.n y B.cond.n al notify, que la pasada BL de R371 no incluia. En toda la
imagen fijada solo aparecen los mismos tres BL en1dadc0/1dccee/1de8c8; tampoco
aparece un puntero Thumb absoluto al notify.16 comprobaciones del decodificador
cubren signo, desplazamientos condicionales y conversion BL/B.W sobre llamadas
conocidas. No se encontro otra entrada directa que justificase anunciar soporte.

Esto NO prueba un grafo exhaustivo de llamadas indirectas, otros posibles
canales de reporte, el driver realmente activo o la capacidad electrica del
panel. Tampoco se midieron dos dedos reales en este reloj. No declarar que
multitactil es fisicamente imposible, ni que basta otro lector C para habilitarlo.

Reproduccion local: `node tools/review-touch-branches-r399.mjs` verifica SHA del
AP como datos, se niega a sobreescribir el informe y no usa radio, emulador,
bindings nuevos ni ejecucion de firmware. Evidencia ignorada:
`artifacts/research/rw4-touch-r399/review.json`.

## Siguiente frontera de investigacion

1. Identificar la ruta/controlador activo y localizar datos previos a la
   conversion a un punto. No volver a repetir el inventario directo ya hecho.
2. Revisar una forma acotada de observar esos datos sin capturar de forma
   exclusiva la entrada, inyectar eventos, cambiar registros del panel o
   interferir con el lector del sistema. Un lector de input0 solo validaria
   el reporte disponible; no mediria lo que ya fue descartado.
3. Solo si existe una ruta de observacion revisada, preparar un diagnostico
   separado de Doom con salida y cierre comprobables. Todavia NO esta listo
   ese payload ni se pide permiso para instalar uno inexistente.
4. La integracion requiere mantener un contacto mientras se anade el segundo,
   soltar cada uno en ambos ordenes y cancelar ambos al pausar/salir. Perder un
   contacto no debe dejar teclas pulsadas. Si no llegan dos contactos distintos,
   no prometer una solucion de multitactil desde la aplicacion.

Autofire, toggles y movimiento retenido siguen rechazados por el usuario.
No presentarlos como sustitutos de dos dedos. Si hace falta modificar un lower
driver, sera un alcance nuevo que exige revision concreta; no se autoriza por
esta preferencia cambiar firmware ni enviar otro payload al reloj.
